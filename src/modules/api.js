      var APPS_SCRIPT_EXEC='';
      // Supabase read path is deliberately off until staging parity is signed off.
      // Existing Apps Script remains the live fallback and the write path.
      // GitHub Pages가 운영 원본이다. 이 주소가 아닌 구형 앱/내장 화면은 GAS만
      // 사용하므로, 오래된 화면이 "Supabase rollout disabled"를 사용자에게 노출하지 않는다.
      var IS_PRIMARY_WEB_ORIGIN=true; // 구형 앱 포함 모든 클라이언트 강제 적용
      var SUPABASE_READ_ROLLOUT=true;
      var SUPABASE_DIRECT_ROLLOUT=true;
      var SUPABASE_PRIMARY_WRITE_CUTOVER=true;
      var SUPABASE_API_EXEC='https://areyvrdvnaccebqbigyy.supabase.co/functions/v1/ilkong-api';
      var SUPABASE_PUBLIC_KEY='sb_publishable_x7UeQcviY3DopGGcucV9hg_vpnDcL5c';
      var VAPID_PUBLIC_KEY='BNpeN3rm6wHJIirD4U0G_eD7tLMF9f4tU2iaa4PP9x008vEzx9_ZJnD2LBhbyMtiMJ0BP6AJ9xbYRzXVL_r8T8s';
      var supabaseToken='';
      var supabaseExchangePending=null;
      var HAS_GAS=!!(window.google&&window.google.script&&window.google.script.run);
      var IS_EXTERNAL_WEB=!HAS_GAS&&!NATIVE_RPC;
      var ALLOW_BROWSER_GAS_FALLBACK=false;
      var USE_BRIDGE=IS_EXTERNAL_WEB&&ALLOW_BROWSER_GAS_FALLBACK;
      var bridge={frame:null,target:null,origin:'',ready:false,pending:{},queue:[],loading:false,failedAt:0};
      function trustedBridgeOrigin(origin){
        origin=String(origin||'');
        if(origin==='https://script.google.com'||origin==='https://script.googleusercontent.com') return true;
        try{
          var host=new URL(origin).hostname.toLowerCase();
          return origin.indexOf('https://')===0&&/\.googleusercontent\.com$/.test(host);
        }catch(e){ return false; }
      }
      function bridgeReplyHandler(event){
        var data=event&&event.data;
        if(!data||typeof data!=='object') return;
        var origin=String(event.origin||'');
        // 우리 코드가 직접 만든 숨은 Apps Script iframe에서 온 메시지만 받는다.
        // origin 문자열만 검사하면 다른 HTTPS 창/iframe이 ready를 가로채 세션 인자를 받을 수 있다.
        if(!bridge.frame||!bridge.frame.contentWindow||event.source!==bridge.frame.contentWindow||!trustedBridgeOrigin(origin)) return;
        if(data.ilkongBridge==='ready'){
          bridge.ready=true; bridge.target=event.source; bridge.origin=origin; bridge.loading=false; bridge.failedAt=0;
          var queued=bridge.queue.splice(0,bridge.queue.length);
          queued.forEach(function(send){ try{ send(); }catch(sendError){} });
          return;
        }
        if(data.ilkongBridge!=='result') return;
        if(!bridge.ready||event.source!==bridge.target||origin!==bridge.origin) return;
        var entry=bridge.pending[String(data.id||'')];
        if(!entry) return;
        delete bridge.pending[String(data.id||'')];
        clearTimeout(entry.timer);
        if(data.ok===true) entry.resolve(data.data===undefined?null:data.data);
        else entry.reject(new Error(String(data.error||'서버 요청을 처리하지 못했어.')));
      }
      var bridgeListenerBound=false;
      function bindBridgeListener(){
        if(bridgeListenerBound) return;
        bridgeListenerBound=true;
        try{ window.addEventListener('message',bridgeReplyHandler,false); }catch(listenerError){}
      }
      function ensureBridge(){
        bindBridgeListener();
        if(bridge.ready||bridge.loading) return;
        if(!APPS_SCRIPT_EXEC){ bridge.failedAt=Date.now(); return; }
        bridge.loading=true;
        try{
          if(bridge.frame&&bridge.frame.parentNode) bridge.frame.parentNode.removeChild(bridge.frame);
          bridge.ready=false; bridge.target=null; bridge.origin='';
          var frame=document.createElement('iframe');
          frame.setAttribute('title','일콩 데이터 통로');
          frame.setAttribute('aria-hidden','true');
          frame.style.cssText='position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;border:0;left:-9999px;top:-9999px';
          frame.src=APPS_SCRIPT_EXEC+'?bridge=1&t='+Date.now();
          frame.onerror=function(){ bridge.loading=false; bridge.failedAt=Date.now(); };
          document.body.appendChild(frame);
          bridge.frame=frame;
          setTimeout(function(){ if(!bridge.ready){ bridge.loading=false; bridge.failedAt=Date.now(); } },20000);
        }catch(frameError){ bridge.loading=false; bridge.failedAt=Date.now(); }
      }
      function callBridge(name,args,timeout){
        return new Promise(function(resolve,reject){
          var id=uuid();
          var timer=setTimeout(function(){
            if(bridge.pending[id]){
              delete bridge.pending[id];
              reject(new Error(bridge.ready?'서버 응답이 너무 늦어. 잠시 뒤 다시 눌러 줘.':'NETWORK: 서버에 연결하지 못했어. 인터넷 연결을 확인해 줘.'));
            }
          },timeout||18000);
          bridge.pending[id]={resolve:resolve,reject:reject,timer:timer};
          var send=function(){
            try{ bridge.target.postMessage({ilkongBridge:'call',id:id,fn:name,args:args||[]},bridge.origin); }
            catch(postError){
              if(bridge.pending[id]){ delete bridge.pending[id]; clearTimeout(timer); reject(postError); }
            }
          };
          if(bridge.ready&&bridge.target) send();
          else { bridge.queue.push(send); ensureBridge(); }
        });
      }

      function supabaseRequest(body,timeout){
        var controller=window.AbortController?new AbortController():null;
        var timer=controller?setTimeout(function(){ controller.abort(); },timeout||18000):null;
        return fetch(SUPABASE_API_EXEC,{
          method:'POST',
          // 이 함수는 JWT가 아니라 서버에서 검증하는 일회성 앱 세션을 쓴다.
          // Authorization 헤더를 제거해 GitHub Pages → Edge 사전검사 경로를 단순화한다.
          headers:{'Content-Type':'application/json','apikey':SUPABASE_PUBLIC_KEY},
          body:JSON.stringify(body||''),
          credentials:'omit',
          signal:controller?controller.signal:undefined
        }).then(function(response){
          return response.json().catch(function(){ return {ok:false,code:'FORMAT',error:'Supabase 응답을 해석하지 못했어.'}; }).then(function(payload){
            if(!response.ok||!payload||payload.ok!==true){
              var rawError=payload&&payload.error;
              var message=typeof rawError==='string'?rawError:(rawError&&typeof rawError.message==='string'?rawError.message:'Supabase 요청을 처리하지 못했어.');
              var error=new Error(message);
              error.code=payload&&payload.code||'SERVER';
              error.detail=rawError;
              throw error;
            }
            return payload;
          });
        }).finally(function(){ if(timer) clearTimeout(timer); });
      }

      function ensureSupabaseSession(){
        if(!SUPABASE_READ_ROLLOUT) return Promise.reject(new Error('현재 화면은 이전 버전이야. 운영 주소에서 새로고침해 줘.'));
        if(state.logoutBusy) return Promise.reject(new Error('로그아웃 중인 세션이야.'));
        if(!state.session||!state.session.token) return Promise.reject(new Error('legacy session missing'));
        if(state.session.supabase===true){
          if(supabaseToken!==String(state.session.token)) supabaseToken=String(state.session.token);
          return Promise.resolve(supabaseToken);
        }
        var legacyToken=String(state.session.token);
        var previousUser=state.session.user||{};
        var userId=String(previousUser.id||'').toUpperCase();
        var loginGeneration=state.loginAttemptGeneration;
        if(supabaseExchangePending&&supabaseExchangePending.token===legacyToken&&supabaseExchangePending.generation===loginGeneration){
          return supabaseExchangePending.promise;
        }
        // 로그인 직후 GAS가 차가운 상태면 세션 교환만 조금 더 기다린다.
        // 화면은 이미 GAS 로그인 응답으로 그려져 있으므로 사용자는 빈 화면을 보지 않는다.
        var pending={token:legacyToken,generation:loginGeneration,promise:null};
        pending.promise=supabaseRequest({op:'exchange',legacyToken:legacyToken},60000).then(function(response){
          // 늦은 응답이 로그아웃 또는 다른 사용자의 새 세션을 되살리지 못하게 한다.
          if(state.logoutBusy||loginGeneration!==state.loginAttemptGeneration||!state.session||
             state.session.supabase===true||String(state.session.token)!==legacyToken||
             String(state.session.user&&state.session.user.id||'').toUpperCase()!==userId){
            throw new Error('로그인 상태가 바뀌어 이전 세션 교환을 취소했어.');
          }
          var data=response&&response.data;
          if(!data||!data.token||Number(data.expiresAt)<=Date.now()) throw new Error('Supabase 세션을 만들지 못했어.');
          var exchangedUser=data.user||{};
          if(exchangedUser.id&&userId&&String(exchangedUser.id).toUpperCase()!==userId){
            throw new Error('교환된 세션의 사용자가 일치하지 않아. 다시 로그인해 줘.');
          }
          var upgradedSession={
            token:String(data.token),
            expiresAt:Number(data.expiresAt),
            supabase:true,
            user:{
              id:String(previousUser.id||exchangedUser.id||''),
              name:String(previousUser.name||exchangedUser.name||''),
              emoji:String(previousUser.emoji||exchangedUser.emoji||'🌿')
            }
          };
          if(!upgradedSession.user.id) throw new Error('Supabase 세션 사용자 정보가 없어.');
          state.session=upgradedSession;
          supabaseToken=upgradedSession.token;
          saveSession(upgradedSession);
          return supabaseToken;
        }).finally(function(){
          if(supabaseExchangePending===pending) supabaseExchangePending=null;
        });
        supabaseExchangePending=pending;
        return pending.promise;
      }

      function callSupabaseLogin(args,timeout){
        return supabaseRequest({op:'login',userId:args&&args[0]||'',pin:args&&args[1]||''},timeout).then(function(response){
          var data=response&&response.data;
          if(!data||!data.session||!data.session.token) throw new Error('Supabase 로그인 서버가 세션을 주지 않았어.');
          supabaseToken=String(data.session.token);
          return response;
        });
      }

      function callSupabaseLegacyApi(name,args,timeout){
        return ensureSupabaseSession().then(function(token){
          return supabaseRequest({op:'legacy_call',token:token,fn:name,args:(args||[]).slice(1)},timeout).then(function(response){
            var nested=response&&response.data;
            if(nested&&typeof nested==='object'&&Object.prototype.hasOwnProperty.call(nested,'ok')){
              if(nested.ok!==true){
                var rawError=nested.error;
                var message=typeof rawError==='string'?rawError:(rawError&&typeof rawError.message==='string'?rawError.message:'서버 요청을 처리하지 못했어.');
                var nestedError=new Error(message);
                nestedError.code=nested.code||'SERVER';
                nestedError.detail=rawError;
                throw nestedError;
              }
              return {ok:true,data:nested.data===undefined?null:nested.data,code:nested.code||'',version:nested.version||''};
            }
            return response;
          });
        });
      }

      function callSupabaseRead(name,args,timeout){
        return ensureSupabaseSession().then(function(token){
          if(name==='apiGetHomeV221') return supabaseRequest({op:'home',token:token,offset:args&&args[1]||0,limit:args&&args[2]||PAGE_SIZE},timeout);
          if(name==='apiGetImagesBatchV285') return supabaseRequest({op:'images_batch',token:token,requests:args&&args[1]||[]},timeout);
          throw new Error('Supabase read mapping missing: '+name);
        });
      }

      var SUPABASE_DIRECT_FUNCTIONS={
        apiCheckUpdatesV240:true,apiGetCapsulesV310:true,apiGetCheckupNotesV310:true,apiGetChecklistV320:true,
        apiExportBookV310:true,apiExportDataV370:true,apiSetCheckupV291:true,apiSetBirthV289:true,apiSetTripV380:true,
        apiStartPostV221:true,apiUploadPostImageV221:true,apiFinishPostV221:true,apiDeletePostV221:true,apiUpdatePostV280:true,
        apiRestorePostV280:true,apiSetFavoriteV280:true,apiGetImageDataV221:true,apiGetImageDataV280:true,apiGetImageDataV281:true,apiGetImageDataV282:true,apiGetImageDataV283:true,apiAddCommentV230:true,apiAddCommentV280:true,apiDeleteCommentV230:true,
        apiEditCommentV370:true,apiMarkCommentsReadV260:true,apiMarkCommentsReadV280:true,apiToggleReactionV230:true,apiSetReactionV280:true,
        apiAddCapsuleV310:true,apiDeleteCapsuleV310:true,apiSaveCheckupNoteV310:true,apiDeleteCheckupNoteV310:true,
        apiAddChecklistItemV320:true,apiToggleChecklistItemV320:true,apiDeleteChecklistItemV320:true,apiUpdateChecklistItemV450:true,apiRestoreChecklistItemV450:true,
        apiGetStorageReportV450:true,apiRunCleanupV450:true,apiGetHealthLogsV470:true,apiSaveHealthLogV470:true,apiSaveHealthProfileV470:true,apiSaveBirthPlanV470:true,
        apiChangePinV320:true,apiAddPhotosV370:true,apiSetPostPhotosV490:true,
        apiSubscribePush:true,apiUnsubscribePush:true,apiSendTestPush:true
      };
      function callSupabaseDirect(name,args,timeout){
        return ensureSupabaseSession().then(function(token){
          // 첫 번째 인자는 기존 GAS 세션이라 Edge에 절대 전달하지 않는다.
          // 매 조작마다 새 요청번호를 발급하지만, 네트워크 재시도에는 같은 본문을 보낸다.
          // 내용이 같아도 서로 다른 체크/해제/재체크 작업은 별도로 적용돼야 한다.
          var actionId=(window.crypto&&typeof window.crypto.randomUUID==='function')?window.crypto.randomUUID():uuid();
          var requestBody={op:'direct_call',token:token,fn:name,args:(args||[]).slice(1),requestId:actionId};
          function send(){ return supabaseRequest(requestBody,timeout); }
          // PIN 변경은 성공 시 기존 세션을 폐기한다. 응답 유실 뒤에는 같은 세션으로
          // 재시도할 수 없으므로, 결과가 불명확하면 로그인 화면에서 확인하게 한다.
          if(name==='apiChangePinV320') return send();
          // 직접 저장은 요청번호/인자 해시로 멱등 처리된다. 그래서 게이트웨이·일시 네트워크
          // 오류만 한 번 재시도해도 같은 기록이 두 번 생기지 않는다.
          return send().catch(function(error){
            var code=String(error&&error.code||'');
            var message=String(error&&error.message||'');
            var retryable=code==='SERVER'||code==='FORMAT'||!code||/fetch|network|gateway|abort/i.test(message);
            if(!retryable) throw error;
            return new Promise(function(resolve){ setTimeout(resolve,450); }).then(send);
          });
        });
      }

      function callApi(name,args,timeout){
        // 로그인도 Supabase를 운영 원본으로 쓴다. Edge 내부에서 아직 이관 전 PIN만
        // GAS로 검증·이관하므로 브라우저가 평소에 레거시 브리지를 열 필요가 없다.
        if(name==='apiLoginV221'){
          if(SUPABASE_READ_ROLLOUT) return callSupabaseLogin(args,timeout);
          return callLegacyApi(name,args,timeout);
        }
        if(SUPABASE_READ_ROLLOUT&&(name==='apiGetHomeV221'||name==='apiGetImagesBatchV285')){
          return callSupabaseRead(name,args,timeout).catch(function(error){
            if(!SUPABASE_PRIMARY_WRITE_CUTOVER){
              supabaseToken='';
              return callSupabaseLegacyApi(name,args,timeout);
            }
            throw error;
          });
        }
        if(SUPABASE_DIRECT_ROLLOUT&&SUPABASE_DIRECT_FUNCTIONS[name]){
          return callSupabaseDirect(name,args,timeout).catch(function(error){
            // primary cutover 뒤에는 조회도 Supabase가 기준이다. 직접 조회 실패를 GAS로
            // 재전송하면 오래된 스냅샷이나 레거시 장애가 새 PWA 결과를 덮을 수 있다.
            // 아직 cutover 전인 개발/롤백 모드에서만 legacy fallback을 허용한다.
            if(!SUPABASE_PRIMARY_WRITE_CUTOVER){
              supabaseToken='';
              return callSupabaseLegacyApi(name,args,timeout);
            }
            if(error&&error.code==='MODE'){
              var modeError=new Error('저장 경로를 확인 중이야. 입력한 내용은 이 기기에 남아 있어. 잠시 뒤 다시 눌러 줘.');
              modeError.code='MODE';
              throw modeError;
            }
            throw error;
          });
        }
        if(SUPABASE_READ_ROLLOUT){
          if(!SUPABASE_PRIMARY_WRITE_CUTOVER) return callSupabaseLegacyApi(name,args,timeout);
          var routeError=new Error('Supabase 직접 경로가 없는 기능이야. 화면을 새로고침해 줘.');
          routeError.code='VALIDATION';
          return Promise.reject(routeError);
        }
        return callLegacyApi(name,args,timeout);
      }

      function callLegacyApi(name,args,timeout){
        if(NATIVE_RPC) return callNative(name,args,timeout);
        if(USE_BRIDGE) return callBridge(name,args,timeout);
        return new Promise(function(resolve,reject){
          if(!window.google||!google.script||!google.script.run){
            reject(new Error('NETWORK: 서버 연결을 찾지 못했어. 인터넷 연결을 확인해 줘.'));
            return;
          }
          var finished=false;
          var timer=setTimeout(function(){
            if(!finished){
              finished=true;
              reject(new Error('서버 응답이 너무 늦어. 잠시 뒤 다시 눌러 줘.'));
            }
          },timeout||18000);

          function success(value){
            if(finished) return;
            finished=true;
            clearTimeout(timer);
            if(value===null||value===undefined){
              reject(new Error('서버에서 빈 응답이 왔어. Code.gs v3.2.0과 Index.html v3.2.0을 확인하고 기존 배포를 새 버전으로 갱신해 줘.'));
            } else {
              resolve(value);
            }
          }
          function failure(error){
            if(finished) return;
            finished=true;
            clearTimeout(timer);
            reject(error);
          }

          try {
            var runner=google.script.run.withSuccessHandler(success).withFailureHandler(failure);
            args=args||[];
            if(name==='apiLoginV221') runner.apiLoginV221(args[0],args[1]);
            else if(name==='apiGetHomeV221') runner.apiGetHomeV221(args[0],args[1],args[2]);
            else if(name==='apiStartPostV221') runner.apiStartPostV221(args[0],args[1]);
            else if(name==='apiUploadPostImageV221') runner.apiUploadPostImageV221(args[0],args[1],args[2]);
            else if(name==='apiFinishPostV221') runner.apiFinishPostV221(args[0],args[1]);
            else if(name==='apiDeletePostV221') runner.apiDeletePostV221(args[0],args[1]);
            else if(name==='apiGetImageDataV221') runner.apiGetImageDataV221(args[0],args[1]);
            else if(name==='apiGetImageDataV280') runner.apiGetImageDataV280(args[0],args[1],args[2]);
            else if(name==='apiGetImageDataV283') runner.apiGetImageDataV283(args[0],args[1],args[2]);
            else if(name==='apiGetImageDataV282') runner.apiGetImageDataV282(args[0],args[1],args[2]);
            else if(name==='apiGetImageDataV281') runner.apiGetImageDataV281(args[0],args[1],args[2]);
            else if(name==='apiGetImagesBatchV285') runner.apiGetImagesBatchV285(args[0],args[1]);
            else if(name==='apiSetBirthV289') runner.apiSetBirthV289(args[0],args[1]);
            else if(name==='apiSetCheckupV291') runner.apiSetCheckupV291(args[0],args[1]);
            else if(name==='apiAddCommentV230') runner.apiAddCommentV230(args[0],args[1],args[2]);
            else if(name==='apiAddCommentV280') runner.apiAddCommentV280(args[0],args[1],args[2],args[3],args[4]);
            else if(name==='apiDeleteCommentV230') runner.apiDeleteCommentV230(args[0],args[1]);
            else if(name==='apiToggleReactionV230') runner.apiToggleReactionV230(args[0],args[1],args[2]);
            else if(name==='apiMarkCommentsReadV260') runner.apiMarkCommentsReadV260(args[0],args[1]);
            else if(name==='apiMarkCommentsReadV280') runner.apiMarkCommentsReadV280(args[0],args[1],args[2]);
            else if(name==='apiSetReactionV280') runner.apiSetReactionV280(args[0],args[1],args[2],args[3]);
            else if(name==='apiUpdatePostV280') runner.apiUpdatePostV280(args[0],args[1],args[2],args[3]);
            else if(name==='apiRestorePostV280') runner.apiRestorePostV280(args[0],args[1]);
            else if(name==='apiSetFavoriteV280') runner.apiSetFavoriteV280(args[0],args[1],args[2]);
            else if(name==='apiCheckUpdatesV240') runner.apiCheckUpdatesV240(args[0],args[1]);
            else if(name==='apiGetCapsulesV310') runner.apiGetCapsulesV310(args[0]);
            else if(name==='apiAddCapsuleV310') runner.apiAddCapsuleV310(args[0],args[1],args[2]);
            else if(name==='apiDeleteCapsuleV310') runner.apiDeleteCapsuleV310(args[0],args[1]);
            else if(name==='apiGetCheckupNotesV310') runner.apiGetCheckupNotesV310(args[0]);
            else if(name==='apiSaveCheckupNoteV310') runner.apiSaveCheckupNoteV310(args[0],args[1],args[2]);
            else if(name==='apiDeleteCheckupNoteV310') runner.apiDeleteCheckupNoteV310(args[0],args[1]);
            else if(name==='apiExportBookV310') runner.apiExportBookV310(args[0],args[1],args[2]);
            else if(name==='apiChangePinV320') runner.apiChangePinV320(args[0],args[1],args[2]);
            else if(name==='apiGetChecklistV320') runner.apiGetChecklistV320(args[0]);
            else if(name==='apiAddChecklistItemV320') runner.apiAddChecklistItemV320(args[0],args[1],args[2]);
            else if(name==='apiToggleChecklistItemV320') runner.apiToggleChecklistItemV320(args[0],args[1],args[2]);
            else if(name==='apiDeleteChecklistItemV320') runner.apiDeleteChecklistItemV320(args[0],args[1]);
            else if(name==='apiEditCommentV370') runner.apiEditCommentV370(args[0],args[1],args[2]);
            else if(name==='apiAddPhotosV370') runner.apiAddPhotosV370(args[0],args[1],args[2]);
            else if(name==='apiExportDataV370') runner.apiExportDataV370(args[0]);
            else if(name==='apiSetTripV380') runner.apiSetTripV380(args[0],args[1],args[2],args[3]);
            else throw new Error('알 수 없는 서버 함수: '+name);
          } catch(e){
            if(!finished){
              finished=true;
              clearTimeout(timer);
              reject(e);
            }
          }
        });
      }

