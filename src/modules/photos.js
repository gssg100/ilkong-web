      function imageRequestKey(imageId,variant){ return 'v36:'+String(variant||'thumbnail')+':'+String(imageId||''); }
      function isPersistentImageDataUrl(url){ return /^data:image\/(?:jpeg|png|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/i.test(String(url||''))&&String(url).length>64; }
      function approvedSignedImageUrl(url){
        try{
          var parsed=new URL(String(url||'')), allowed=new URL(SUPABASE_API_EXEC);
          if(parsed.protocol!=='https:'||parsed.host!==allowed.host||parsed.username||parsed.password||parsed.hash||!/^\/storage\/v1\/object\/sign\/ilkong-media\/.+/.test(parsed.pathname)) return null;
          var token=parsed.searchParams.get('token'); if(!token) return null;
          var encoded=token.split('.')[1]; if(!encoded) return null;
          var claims=JSON.parse(atob(encoded.replace(/-/g,'+').replace(/_/g,'/')));
          if(!Number(claims.exp)||Number(claims.exp)*1000<=Date.now()+15000) return null;
          return parsed;
        }catch(error){ return null; }
      }
      function looksLikeImageUrl(url){ return isPersistentImageDataUrl(url)||!!approvedSignedImageUrl(url); }
      function persistentImageKey(cacheKey){ return IMAGE_CACHE_PREFIX+String(cacheKey||''); }
      function estimateDataUrlBytes(url){
        url=String(url||'');
        var comma=url.indexOf(',');
        if(comma<0) return url.length*2;
        var payload=url.slice(comma+1);
        return /;base64/i.test(url.slice(0,comma))?Math.floor(payload.length*0.75):payload.length;
      }
      function rememberImageMemory(cacheKey,url){
        if(!cacheKey||!looksLikeImageUrl(url)) return;
        state.imageCache[cacheKey]=url;
        state.imageCacheOrder=state.imageCacheOrder.filter(function(id){ return id!==cacheKey; });
        state.imageCacheOrder.push(cacheKey);
        while(state.imageCacheOrder.length>48){ var oldest=state.imageCacheOrder.shift(); delete state.imageCache[oldest]; }
      }
      function captureLoadedImageSources(root){
        if(!root||!root.querySelectorAll) return;
        var boxes=root.querySelectorAll('[data-image-id][data-image-variant]');
        for(var i=0;i<boxes.length;i++){
          var img=boxes[i].querySelector('img');
          var src=img&&(img.currentSrc||img.src);
          if(!src) continue;
          var key=imageRequestKey(boxes[i].getAttribute('data-image-id'),boxes[i].getAttribute('data-image-variant')||'thumbnail');
          rememberImageMemory(key,src);
        }
      }
      function readPersistentImageUrl(imageId,variant){
        variant=variant||'thumbnail';
        if(state.logoutBusy||!state.session) return Promise.resolve('');
        var expectedUser=currentUserId();
        if(variant!=='thumbnail') return Promise.resolve('');
        var key=imageRequestKey(imageId,variant);
        // v3.1.0: 안드로이드 앱의 디스크 캐시를 최우선으로 본다(더 크고 빠르고 오래 남는다).
        if(window.IlkongDisk&&typeof window.IlkongDisk.getImage==='function'){
          try{
            var nativeUrl=String(window.IlkongDisk.getImage(key)||'');
            if(isPersistentImageDataUrl(nativeUrl)){
              state.imagePersistentKnown[key]=true;
              rememberImageMemory(key,nativeUrl);
              return Promise.resolve(nativeUrl);
            }
          }catch(nativeReadError){}
        }
        if(state.imagePersistentReads[key]) return state.imagePersistentReads[key];
        var promise=idbGet(persistentImageKey(key)).then(function(record){
          delete state.imagePersistentReads[key];
          if(state.logoutBusy||!state.session||currentUserId()!==expectedUser) return '';
          if(!record||!isPersistentImageDataUrl(record.url)) return '';
          var savedAt=Number(record.savedAt||0);
          if(!savedAt||Date.now()-savedAt>IMAGE_CACHE_MAX_AGE_MS){
            idbRemove(persistentImageKey(key)).catch(function(){});
            return '';
          }
          state.imagePersistentKnown[key]=true;
          rememberImageMemory(key,record.url);
          return record.url;
        }).catch(function(){ delete state.imagePersistentReads[key]; return ''; });
        state.imagePersistentReads[key]=promise;
        return promise;
      }
      function persistImageUrl(imageId,variant,url){
        variant=variant||'thumbnail';
        if(state.logoutBusy||!state.session) return;
        if(variant!=='thumbnail'||!isPersistentImageDataUrl(url)) return;
        var bytes=estimateDataUrlBytes(url);
        if(!bytes||bytes>IMAGE_CACHE_MAX_ITEM_BYTES) return;
        var key=imageRequestKey(imageId,variant);
        if(window.IlkongDisk&&typeof window.IlkongDisk.putImage==='function'){
          try{ window.IlkongDisk.putImage(key,url); }catch(nativeWriteError){}
        }
        if(state.imagePersistentKnown[key]) return;
        state.imagePersistentKnown[key]='pending';
        var record={key:key,url:url,bytes:bytes,savedAt:Date.now(),lastUsedAt:Date.now()};
        state.imagePersistChain=state.imagePersistChain.then(function(){
          return idbSet(persistentImageKey(key),record).then(function(){
            state.imagePersistentKnown[key]=true;
            return idbGet(IMAGE_CACHE_INDEX_KEY).catch(function(){ return []; });
          }).then(function(index){
            index=Array.isArray(index)?index:[];
            index=index.filter(function(item){ return item&&item.key!==key; });
            index.push({key:key,bytes:bytes,savedAt:record.savedAt,lastUsedAt:record.lastUsedAt});
            index.sort(function(a,b){ return Number(b.lastUsedAt||0)-Number(a.lastUsedAt||0); });
            var kept=[], removed=[], total=0;
            for(var i=0;i<index.length;i++){
              var item=index[i], itemBytes=Math.max(0,Number(item.bytes||0));
              var fresh=Date.now()-Number(item.savedAt||0)<=IMAGE_CACHE_MAX_AGE_MS;
              if(fresh&&kept.length<IMAGE_CACHE_MAX_ITEMS&&total+itemBytes<=IMAGE_CACHE_MAX_BYTES){ kept.push(item); total+=itemBytes; }
              else removed.push(item.key);
            }
            return Promise.all(removed.map(function(removeKey){ return idbRemove(persistentImageKey(removeKey)).catch(function(){}); })).then(function(){ return idbSet(IMAGE_CACHE_INDEX_KEY,kept); });
          });
        }).catch(function(){ delete state.imagePersistentKnown[key]; });
      }
      function prunePersistentImageCache(){
        return idbGet(IMAGE_CACHE_INDEX_KEY).then(function(index){
          index=Array.isArray(index)?index:[];
          var kept=[], removed=[], total=0, now=Date.now();
          index.sort(function(a,b){ return Number(b.lastUsedAt||0)-Number(a.lastUsedAt||0); });
          index.forEach(function(item){
            var bytes=Math.max(0,Number(item&&item.bytes||0));
            var fresh=item&&item.key&&now-Number(item.savedAt||0)<=IMAGE_CACHE_MAX_AGE_MS;
            if(fresh&&kept.length<IMAGE_CACHE_MAX_ITEMS&&total+bytes<=IMAGE_CACHE_MAX_BYTES){ kept.push(item); total+=bytes; }
            else if(item&&item.key) removed.push(item.key);
          });
          return Promise.all(removed.map(function(key){ return idbRemove(persistentImageKey(key)).catch(function(){}); })).then(function(){ return idbSet(IMAGE_CACHE_INDEX_KEY,kept); });
        }).catch(function(){});
      }
      function invalidateImageCache(imageId,variant){
        var key=imageRequestKey(imageId,variant||'thumbnail');
        delete state.imageCache[key];
        delete state.imageInFlight[key];
        delete state.imagePersistentKnown[key];
        state.imageCacheOrder=state.imageCacheOrder.filter(function(id){ return id!==key; });
        return idbRemove(persistentImageKey(key)).catch(function(){});
      }

      function getImageObserver(){
        if(state.imageObserver) return state.imageObserver;
        if(!('IntersectionObserver' in window)) return null;
        state.imageObserver=new IntersectionObserver(function(entries){
          entries.forEach(function(entry){
            if(!entry.isIntersecting) return;
            try{ state.imageObserver.unobserve(entry.target); }catch(e){}
            enqueueImageLoad(entry.target.getAttribute('data-image-id'),entry.target,entry.target.getAttribute('data-image-variant')||'thumbnail',true);
          });
        },{rootMargin:'700px 0px',threshold:0.001});
        return state.imageObserver;
      }

      function observeImage(imageId,box,variant){
        imageId=String(imageId||'');
        if(!imageId||!box) return;
        variant=variant||'thumbnail';
        box.setAttribute('data-image-id',imageId);
        box.setAttribute('data-image-variant',variant);
        // renderPost가 아직 조립 중일 때는 카드가 문서에 붙어 있지 않다. 이때
        // 대기열이 isConnected 검사에서 그냥 끝나면 사진이 영원히 "준비 중"으로
        // 남는다. 다음 프레임에 실제 화면에 붙은 카드만 다시 등록한다.
        if(!box.isConnected){
          var schedule=window.requestAnimationFrame||function(fn){ return setTimeout(fn,0); };
          schedule(function(){ if(box.isConnected) observeImage(imageId,box,variant); });
          return;
        }
        var observer=getImageObserver();
        if(observer){ try{ observer.observe(box); }catch(e){} }

        // 현재 화면 근처의 사진만 즉시 복원한다. 나머지는 관찰기가 가까워질 때
        // 대기열에 넣어 추억함·긴 기록을 열어도 네트워크와 메모리를 한꺼번에 쓰지 않는다.
        var rect=box.getBoundingClientRect();
        var nearViewport=rect.bottom>=-180&&rect.top<=(window.innerHeight||800)+760;
        if(!observer||nearViewport) enqueueImageLoad(imageId,box,variant,false);
      }

      function enqueueImageLoad(imageId,box,variant,priority){
        imageId=String(imageId||''); variant=variant||'thumbnail';
        if(!imageId||!box||!box.isConnected) return;
        if(box.getAttribute('data-image-loaded')==='1'||box.getAttribute('data-image-queued')==='1') return;
        box.setAttribute('data-image-queued','1');
        var entry={imageId:imageId,box:box,variant:variant};
        if(priority) state.imageLoadQueue.unshift(entry); else state.imageLoadQueue.push(entry);
        processImageLoadQueue();
      }

      function processImageLoadQueue(){
        while(state.imageLoadActive<2&&state.imageLoadQueue.length){
          var group=takeImageBatchGroup();
          if(!group.length) continue;
          state.imageLoadActive++;
          runImageGroup(group)
            .catch(function(){})
            .then(function(){ state.imageLoadActive=Math.max(0,state.imageLoadActive-1); processImageLoadQueue(); });
        }
      }

      // v2.8.5: 대기열 앞에서 최대 4장을 묶어 꺼낸다. 화면에서 사라진 칸은 건너뛴다.
      function takeImageBatchGroup(){
        var group=[];
        while(group.length<4&&state.imageLoadQueue.length){
          var entry=state.imageLoadQueue.shift();
          if(!entry.box||!entry.box.isConnected){ if(entry.box) entry.box.removeAttribute('data-image-queued'); continue; }
          group.push(entry);
        }
        return group;
      }

      // 기존 방식(한 장씩, 캐시 확인 + 재시도 포함). 묶음 API가 없거나 실패했을 때의 안전한 경로.
      function runImageGroupSequential(group){
        var chain=Promise.resolve();
        group.forEach(function(entry){
          chain=chain.then(function(){ return loadImageNow(entry.imageId,entry.box,entry.variant,0).catch(function(){}); });
        });
        return chain;
      }

      // v2.8.5: 여러 장을 처리한다. 기기 캐시에 있는 사진은 바로 붙이고,
      // 없는 사진만 서버 묶음 API 한 번으로 가져온다(왕복 횟수 감소 = 첫 로딩 속도 개선).
      function runImageGroup(group){
        if(group.length===1||state.imageBatchSupport===false) return runImageGroupSequential(group);
        var checks=group.map(function(entry){
          var key=imageRequestKey(entry.imageId,entry.variant);
          if(looksLikeImageUrl(state.imageCache[key])) return Promise.resolve({entry:entry,url:state.imageCache[key]});
          delete state.imageCache[key];
          return readPersistentImageUrl(entry.imageId,entry.variant)
            .catch(function(){ return ''; })
            .then(function(stored){ return {entry:entry,url:stored||''}; });
        });
        return Promise.all(checks).then(function(results){
          var pendingShows=[], misses=[];
          results.forEach(function(item){
            if(item.url){
              pendingShows.push(displayImage(item.entry.box,item.url,item.entry.imageId,item.entry.variant,0)
                .catch(function(){ return loadImageNow(item.entry.imageId,item.entry.box,item.entry.variant,1).catch(function(){}); }));
            } else {
              if(item.entry.box&&item.entry.box.isConnected) item.entry.box.innerHTML='<span class="photo-fail">사진 불러오는 중…</span>';
              misses.push(item.entry);
            }
          });
          if(misses.length) pendingShows.push(fetchImageBatch(misses));
          return Promise.all(pendingShows);
        });
      }

      // 서버 묶음 API 호출. 실패하거나 담기지 못한 항목은 기존 한 장짜리 경로로 자동 재시도한다.
      function fetchImageBatch(entries){
        var requests=entries.map(function(entry){ return {imageId:entry.imageId,variant:entry.variant}; });
        return callApi('apiGetImagesBatchV285',[state.session.token,requests],30000)
          .then(unwrap)
          .then(function(data){
            state.imageBatchSupport=true;
            var byKey={};
            var items=data&&data.items||[];
            for(var i=0;i<items.length;i++){
              if(items[i]&&looksLikeImageUrl(items[i].url)) byKey[imageRequestKey(items[i].imageId,items[i].variant)]=items[i].url;
            }
            return Promise.all(entries.map(function(entry){
              var url=byKey[imageRequestKey(entry.imageId,entry.variant)];
              if(url){
                rememberImageMemory(imageRequestKey(entry.imageId,entry.variant),url);
                return displayImage(entry.box,url,entry.imageId,entry.variant,0)
                  .catch(function(){ return loadImageNow(entry.imageId,entry.box,entry.variant,1).catch(function(){}); });
              }
              return loadImageNow(entry.imageId,entry.box,entry.variant,0).catch(function(){});
            }));
          })
          .catch(function(error){
            // 구형 서버에 묶음 함수 자체가 없는 경우에만 단건 호환 경로로 내린다.
            // timeout/서버 장애까지 사진별 요청으로 풀면 한 번의 장애가 여러 RPC로 증폭된다.
            if(isMissingServerFunctionError(error)){
              state.imageBatchSupport=false;
              return runImageGroupSequential(entries);
            }
            entries.forEach(function(entry){ if(entry.box&&entry.box.isConnected) showImageRetry(entry.box,errorMessage(error)); });
            throw error;
          });
      }

      function cacheImageUrl(imageId,variant,url){
        var key=imageRequestKey(imageId,variant);
        rememberImageMemory(key,url);
        persistImageUrl(imageId,variant,url);
        persistRemoteThumbnail(imageId,variant,url);
      }

      // Supabase Storage로 옮긴 뒤 사진이 1시간짜리 서명 URL로 바뀌면서,
      // dataURL만 보관하던 기존 오프라인 캐시가 동작하지 않게 됐다.
      // 원격 썸네일을 한 번만 내려받아 dataURL로 바꿔 같은 캐시에 태운다.
      // (보관 장수·용량·정리는 기존 persistImageUrl 규칙을 그대로 따른다.)
      function persistRemoteThumbnail(imageId,variant,url){
        variant=variant||'thumbnail';
        if(variant!=='thumbnail') return;
        if(!approvedSignedImageUrl(url)) return;
        if(typeof fetch!=='function'||typeof FileReader!=='function') return;
        var key=imageRequestKey(imageId,variant),expectedUser=currentUserId(),expectedToken=state.session&&state.session.token;
        if(state.imagePersistentKnown[key]) return;
        if(!state.remoteThumbFetching) state.remoteThumbFetching={};
        if(state.remoteThumbFetching[key]) return;
        state.remoteThumbFetching[key]=true;
        fetch(url,{mode:'cors',credentials:'omit',redirect:'error'}).then(function(response){
          if(!response||!response.ok||(response.url&&!approvedSignedImageUrl(response.url))) throw new Error('원격 썸네일 응답 실패');
          return response.blob();
        }).then(function(blob){
          if(!blob||!blob.size||blob.size>IMAGE_CACHE_MAX_ITEM_BYTES||!/^image\/(jpeg|png|webp|gif)$/i.test(blob.type)) throw new Error('보관할 수 없는 썸네일');
          return new Promise(function(resolve,reject){
            var reader=new FileReader();
            reader.onload=function(){ resolve(String(reader.result||'')); };
            reader.onerror=function(){ reject(new Error('썸네일을 읽지 못했어')); };
            reader.readAsDataURL(blob);
          });
        }).then(function(dataUrl){
          if(currentUserId()===expectedUser&&state.session&&state.session.token===expectedToken&&isPersistentImageDataUrl(dataUrl)) persistImageUrl(imageId,variant,dataUrl);
        }).catch(function(){
          // 오프라인 보관은 부가 기능이라 실패해도 화면에 영향을 주지 않는다.
        }).then(function(){
          delete state.remoteThumbFetching[key];
        });
      }

      function requestImageApi(name,args,timeout){ return callApi(name,args,timeout).then(unwrap); }

      function isMissingServerFunctionError(error){
        var message=errorMessage(error);
        return /not a function|script function not found|function not found|is not defined|알 수 없는 서버 함수|지원하지 않는 서버 함수/i.test(message);
      }

      function requestCompatibleImageData(imageId,variant){
        var names=['apiGetImageDataV283','apiGetImageDataV282','apiGetImageDataV281','apiGetImageDataV280','apiGetImageDataV221'];
        var preferred=String(state.imageDataApiName||'');
        if(preferred&&names.indexOf(preferred)>=0) names=[preferred].concat(names.filter(function(name){ return name!==preferred; }));
        function attempt(index){
          var name=names[index];
          var args=name==='apiGetImageDataV221'?[state.session.token,imageId]:[state.session.token,imageId,variant];
          return requestImageApi(name,args,30000)
            .then(function(data){ state.imageDataApiName=name; return data; })
            .catch(function(error){
              if(error&&error.code==='AUTH') throw error;
              if(!isMissingServerFunctionError(error)||index>=names.length-1) throw error;
              if(state.imageDataApiName===name) state.imageDataApiName='';
              return attempt(index+1);
            });
        }
        return attempt(0);
      }

      function fetchImageUrl(imageId,variant,forceNetwork){
        variant=variant||'thumbnail'; var key=imageRequestKey(imageId,variant);
        if(!forceNetwork&&looksLikeImageUrl(state.imageCache[key])) return Promise.resolve(state.imageCache[key]);
        if(state.imageCache[key]&&!looksLikeImageUrl(state.imageCache[key])) delete state.imageCache[key];
        if(!forceNetwork&&state.imageInFlight[key]) return state.imageInFlight[key];

        var begin=forceNetwork?Promise.resolve(''):readPersistentImageUrl(imageId,variant);
        var promise=begin.then(function(stored){
          if(looksLikeImageUrl(stored)) return stored;
          return requestCompatibleImageData(imageId,variant)
            .then(function(data){
              if(!data||!looksLikeImageUrl(data.url)) throw new Error('사진 주소가 비어 있어.');
              cacheImageUrl(imageId,variant,data.url);
              return data.url;
            });
        }).then(function(url){ delete state.imageInFlight[key]; return url; })
          .catch(function(error){ delete state.imageInFlight[key]; throw error; });
        if(!forceNetwork) state.imageInFlight[key]=promise;
        return promise;
      }

      function displayImage(box,url,imageId,variant,attempt){
        return new Promise(function(resolve,reject){
          if(!box||!box.isConnected){ resolve(false); return; }
          if(!looksLikeImageUrl(url)){ reject(new Error('사진 표시 실패: 허용되지 않거나 만료된 주소')); return; }
          var img=new Image();
          img.alt='기록 사진';
          // IntersectionObserver queues near-visible photos; this detached image must load now.
          img.loading='eager';
          img.decoding='async';
          img.onload=function(){
            if(box.isConnected){
              box.innerHTML=''; box.appendChild(img);
              box.setAttribute('data-image-loaded','1'); box.removeAttribute('data-image-queued');
              cacheImageUrl(imageId||box.getAttribute('data-image-id'),variant||box.getAttribute('data-image-variant')||'thumbnail',url);
            }
            resolve(true);
          };
          img.onerror=function(){ reject(new Error('사진 표시 실패')); };
          img.src=url;
        }).catch(function(error){
          return invalidateImageCache(imageId,variant).then(function(){ throw error; });
        });
      }

      function showImageRetry(box,message){
        if(!box||!box.isConnected) return;
        var imageId=box.getAttribute('data-image-id'), variant=box.getAttribute('data-image-variant')||'thumbnail';
        box.removeAttribute('data-image-queued'); box.removeAttribute('data-image-loaded');
        box.innerHTML='<button class="photo-fail" type="button">'+escapeHtml(message||'사진을 불러오지 못했어.')+'<br>다시 누르기</button>';
        box.querySelector('button').addEventListener('click',function(){
          invalidateImageCache(imageId,variant).catch(function(){}).then(function(){ loadImage(imageId,box,variant); });
        });
      }

      function loadImageNow(imageId,box,variant,attempt){
        imageId=String(imageId||''); variant=variant||'thumbnail'; attempt=Number(attempt||0);
        if(!imageId||!box) return Promise.resolve(false);
        if(box.isConnected&&attempt===0) box.innerHTML='<span class="photo-fail">사진 불러오는 중…</span>';
        return fetchImageUrl(imageId,variant,attempt>0)
          .then(function(url){ return displayImage(box,url,imageId,variant,attempt); })
          .catch(function(error){
            if(box&&box.isConnected&&attempt<1&&/사진 표시 실패/i.test(errorMessage(error))){
              return new Promise(function(resolve){ setTimeout(resolve,700*Math.pow(2,attempt)); })
                .then(function(){ return loadImageNow(imageId,box,variant,attempt+1); });
            }
            // 썸네일 URL 자체가 깨진 경우에만 원본으로 한 번 복구한다.
            // 서버 timeout/장애는 원본 API까지 연쇄 호출하지 않고 사용자가 다시 눌러 재시도한다.
            if(box&&box.isConnected&&variant==='thumbnail'&&/사진 표시 실패/i.test(errorMessage(error))){
              return invalidateImageCache(imageId,'thumbnail').catch(function(){}).then(function(){
                return fetchImageUrl(imageId,'original',true).then(function(url){
                  return displayImage(box,url,imageId,'thumbnail',attempt+1);
                });
              }).catch(function(originalError){
                if(box&&box.isConnected) showImageRetry(box,errorMessage(originalError));
                throw originalError;
              });
            }
            if(box&&box.isConnected) showImageRetry(box,errorMessage(error));
            throw error;
          });
      }

      function loadImage(imageId,box,variant){
        if(!box) return;
        box.removeAttribute('data-image-queued'); box.removeAttribute('data-image-loaded');
        enqueueImageLoad(imageId,box,variant||'thumbnail',true);
      }

      function loadApprovedImage(imageId,variant,attempt){
        attempt=Number(attempt||0);
        return fetchImageUrl(imageId,variant,attempt>0).then(function(url){
          return new Promise(function(resolve,reject){
            if(!looksLikeImageUrl(url)){ reject(new Error('사진 표시 실패')); return; }
            var img=new Image(); img.loading='eager'; img.onload=function(){resolve(img);}; img.onerror=function(){reject(new Error('사진 표시 실패'));}; img.src=url;
          });
        }).catch(function(error){
          if(attempt<1&&/사진 표시 실패/.test(errorMessage(error))) return invalidateImageCache(imageId,variant).then(function(){return loadApprovedImage(imageId,variant,1);});
          throw error;
        });
      }

      function fetchOriginalPhotoBlob(imageId,attempt){
        return fetchImageUrl(imageId,'original',true).then(function(url){
          if(!looksLikeImageUrl(url)) throw new Error('사진 원본 주소를 확인하지 못했어.');
          return fetch(url,{mode:'cors',credentials:'omit',redirect:'error'});
        }).then(function(response){
          if(!response.ok) throw new Error('사진 원본을 내려받지 못했어.');
          return response.blob();
        }).then(function(blob){
          if(!blob.size||!/^image\/(jpeg|png|webp|gif)$/i.test(blob.type)) throw new Error('사진 원본 형식을 확인하지 못했어.');
          return blob;
        }).catch(function(error){ if(!attempt) return fetchOriginalPhotoBlob(imageId,1); throw error; });
      }

      function downloadCurrentPhoto(){
        var item=state.viewerImages[state.viewerIndex], button=el('downloadPhoto');
        if(!item||button.disabled) return;
        button.disabled=true; text(button,'준비 중…');
        fetchOriginalPhotoBlob(item.id,0).then(function(blob){
          var ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/gif':'gif'}[blob.type.toLowerCase()], name='일콩_사진_'+today()+'_'+String(item.id).replace(/[^A-Za-z0-9_-]/g,'').slice(0,32)+'.'+ext;
          if(window.IlkongFiles&&typeof window.IlkongFiles.saveToDownloads==='function') return blobToBase64(blob).then(function(base64){
            var saved=String(window.IlkongFiles.saveToDownloads(name,blob.type,base64)||'');
            if(!saved) throw new Error('사진 파일을 저장하지 못했어. 저장공간을 확인해 줘.');
            toast('사진 파일을 저장했어 📷');
          });
          var file=typeof File==='function'?new File([blob],name,{type:blob.type}):null;
          if(file&&navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})) return navigator.share({files:[file],title:'일콩 사진'}).catch(function(error){ if(error&&error.name==='AbortError') return; downloadPhotoBlob(blob,name); });
          downloadPhotoBlob(blob,name);
        }).catch(function(error){toast(errorMessage(error));}).then(function(){button.disabled=false;text(button,'저장 ↓');});
      }
      function downloadPhotoBlob(blob,name){
        var url=URL.createObjectURL(blob), link=document.createElement('a'); link.href=url; link.download=name; document.body.appendChild(link); link.click(); link.remove(); setTimeout(function(){URL.revokeObjectURL(url);},60000); toast('사진 파일 다운로드를 시작했어 📷');
      }

      // v3.7.1: 사진 확대. 리스너를 스테이지에 '한 번만' 붙이고 현재 이미지만 바꿔 끼운다.
      // (사진마다 새로 붙이면 핸들러가 쌓여 서로 다른 배율로 덮어쓰며 튕기는 문제가 있었다)
      var viewerZoom={img:null,stage:null,scale:1,tx:0,ty:0,bound:false,
        startDist:0,startScale:1,lastX:0,lastY:0,panning:false,lastTap:0,lastTapX:0,lastTapY:0,multiUntil:0};
      function zoomApply(){
        if(!viewerZoom.img) return;
        viewerZoom.img.style.transform='translate('+viewerZoom.tx+'px,'+viewerZoom.ty+'px) scale('+viewerZoom.scale+')';
        viewerZoom.img.style.transformOrigin='center center';
        viewerZoom.img.classList.toggle('zoomed',viewerZoom.scale>1.02);
      }
      function zoomReset(){ viewerZoom.scale=1; viewerZoom.tx=0; viewerZoom.ty=0; viewerZoom.panning=false; viewerZoom.startDist=0; zoomApply(); }
      function zoomIsActive(){ return viewerZoom.scale>1.02; }
      function zoomClampPan(){
        if(!viewerZoom.img||!viewerZoom.stage) return;
        var rectW=viewerZoom.img.clientWidth*viewerZoom.scale, rectH=viewerZoom.img.clientHeight*viewerZoom.scale;
        var maxX=Math.max(0,(rectW-viewerZoom.stage.clientWidth)/2+20);
        var maxY=Math.max(0,(rectH-viewerZoom.stage.clientHeight)/2+20);
        viewerZoom.tx=Math.max(-maxX,Math.min(maxX,viewerZoom.tx));
        viewerZoom.ty=Math.max(-maxY,Math.min(maxY,viewerZoom.ty));
      }
      function zoomDist(t){ var dx=t[0].clientX-t[1].clientX, dy=t[0].clientY-t[1].clientY; return Math.sqrt(dx*dx+dy*dy); }
      function bindViewerZoom(stage){
        if(viewerZoom.bound||!stage) return;
        viewerZoom.bound=true;
        viewerZoom.stage=stage;
        stage.addEventListener('touchstart',function(e){
          if(e.touches.length>=2){
            // 핀치 시작 — 이 동안과 직후에는 탭·스와이프 판정을 모두 끈다.
            viewerZoom.startDist=zoomDist(e.touches);
            viewerZoom.startScale=viewerZoom.scale;
            viewerZoom.panning=false;
            viewerZoom.multiUntil=Date.now()+700;
            return;
          }
          var t=e.touches[0], now=Date.now();
          // 확대 상태면 핀치 직후라도 곧바로 손가락으로 옮길 수 있게 한다.
          if(zoomIsActive()){ viewerZoom.panning=true; viewerZoom.lastX=t.clientX; viewerZoom.lastY=t.clientY; }
          if(now<viewerZoom.multiUntil){ viewerZoom.lastTap=0; return; } // 핀치 직후엔 더블탭 판정만 끈다
          var near=Math.abs(t.clientX-viewerZoom.lastTapX)<40&&Math.abs(t.clientY-viewerZoom.lastTapY)<40;
          if(now-viewerZoom.lastTap<300&&near){
            viewerZoom.scale=zoomIsActive()?1:2.4;
            viewerZoom.tx=0; viewerZoom.ty=0;
            zoomApply();
            viewerZoom.lastTap=0;
            return;
          }
          viewerZoom.lastTap=now; viewerZoom.lastTapX=t.clientX; viewerZoom.lastTapY=t.clientY;
        },{passive:true});
        stage.addEventListener('touchmove',function(e){
          if(e.touches.length>=2&&viewerZoom.startDist>0){
            e.preventDefault();
            viewerZoom.multiUntil=Date.now()+700;
            viewerZoom.scale=Math.max(1,Math.min(5,viewerZoom.startScale*zoomDist(e.touches)/viewerZoom.startDist));
            if(!zoomIsActive()){ viewerZoom.tx=0; viewerZoom.ty=0; }
            zoomClampPan();
            zoomApply();
          } else if(e.touches.length===1&&viewerZoom.panning&&zoomIsActive()){
            e.preventDefault();
            viewerZoom.tx+=e.touches[0].clientX-viewerZoom.lastX;
            viewerZoom.ty+=e.touches[0].clientY-viewerZoom.lastY;
            viewerZoom.lastX=e.touches[0].clientX; viewerZoom.lastY=e.touches[0].clientY;
            zoomClampPan();
            zoomApply();
          }
        },{passive:false});
        stage.addEventListener('touchend',function(e){
          if(e.touches.length===0){
            viewerZoom.panning=false;
            viewerZoom.startDist=0;
            // 손가락을 다 뗀 뒤에도 잠깐은 스와이프로 오인하지 않게 한다.
            if(viewerZoom.multiUntil>Date.now()) viewerZoom.multiUntil=Date.now()+250;
          }
        },{passive:true});
        stage.addEventListener('dblclick',function(){
          viewerZoom.scale=zoomIsActive()?1:2.4;
          viewerZoom.tx=0; viewerZoom.ty=0;
          zoomApply();
        });
      }
      function attachZoom(img,stage){
        bindViewerZoom(stage);
        viewerZoom.img=img;
        zoomReset();
        return zoomReset;
      }
      function openPhotoViewer(images,index){
        state.viewerReturnFocus=document.activeElement;
        state.viewerImages=Array.isArray(images)?images:[]; state.viewerIndex=Math.max(0,Math.min(Number(index)||0,state.viewerImages.length-1)); show(el('photoViewer')); renderViewer();
        focusFirstInDialog(el('photoViewer'));
      }
      function closePhotoViewer(){
        hide(el('photoViewer')); zoomReset(); viewerZoom.img=null; el('viewerStage').innerHTML=''; state.viewerImages=[]; state.viewerIndex=0;
        var target=state.viewerReturnFocus; state.viewerReturnFocus=null;
        if(target&&target.isConnected&&typeof target.focus==='function') setTimeout(function(){ if(target.isConnected) target.focus(); },0);
      }
      function moveViewer(delta){ if(!state.viewerImages.length)return; zoomReset(); state.viewerIndex=(state.viewerIndex+delta+state.viewerImages.length)%state.viewerImages.length; renderViewer(); }
      function renderViewer(){
        var stage=el('viewerStage'), images=state.viewerImages, item=images[state.viewerIndex];
        text(el('viewerCount'),images.length?(state.viewerIndex+1)+' / '+images.length:'0 / 0');
        el('viewerPrev').disabled=images.length<2; el('viewerNext').disabled=images.length<2;
        if(!item){ stage.innerHTML='<span class="viewer-loading">사진이 없어.</span>'; return; }
        stage.innerHTML='<span class="viewer-loading">원본 사진 불러오는 중…</span>';
        // v2.8.6: 기기에 이미 있는 썸네일을 즉시 보여주고, 원본이 도착하면 바꿔치기한다.
        // 원본이 먼저 도착했거나 뷰어가 넘어갔으면 미리보기는 스스로 물러난다.
        var originalState={done:false,failed:false};
        var stillCurrent=function(){ return !el('photoViewer').classList.contains('hidden')&&state.viewerImages[state.viewerIndex]===item; };
        var showPreview=function(url){
          if(!url||originalState.done||!stillCurrent()) return;
          var img=new Image(); img.alt='기록 사진 미리보기'; img.className='viewer-preview'; img.loading='eager';
          img.onload=function(){
            if(originalState.done||!stillCurrent()) return;
            stage.innerHTML=''; stage.appendChild(img);
            attachZoom(img,stage);
            var tag=document.createElement('span'); tag.className='viewer-original-tag';
            tag.textContent=originalState.failed?'원본을 불러오지 못했어 · 미리보기 표시 중':'원본 불러오는 중…';
            stage.appendChild(tag);
          };
          img.src=url;
        };
        var thumbKey=imageRequestKey(item.id,'thumbnail');
        if(looksLikeImageUrl(state.imageCache[thumbKey])) showPreview(state.imageCache[thumbKey]);
        else readPersistentImageUrl(item.id,'thumbnail').then(showPreview).catch(function(){});
        var showOriginalFailure=function(){
          originalState.failed=true;
          if(!stillCurrent()) return;
          var preview=stage.querySelector('.viewer-preview');
          if(preview){ var tag=stage.querySelector('.viewer-original-tag'); if(tag) tag.textContent='원본을 불러오지 못했어 · 미리보기 표시 중'; }
          else stage.innerHTML='<span class="viewer-loading">사진을 불러오지 못했어.</span>';
        };
        loadApprovedImage(item.id,'original',0).then(function(img){
          if(!stillCurrent()) return;
          img.alt='기록 사진 원본'; img.className='viewer-final';
            originalState.done=true; if(!stillCurrent()) return;
            stage.innerHTML=''; stage.appendChild(img);
            attachZoom(img,stage);
            var hint=document.createElement('span'); hint.className='viewer-zoom-hint'; hint.textContent='두 손가락으로 확대 · 두 번 탭';
            stage.appendChild(hint);
            setTimeout(function(){ if(hint.parentNode) hint.parentNode.removeChild(hint); },2200);
        }).catch(showOriginalFailure);
      }

