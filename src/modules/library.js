      // Paged library state is separate from the home feed and is never persisted.
      function libraryFilters(){
        var segment=state.recordSegment||'ALL', category=state.catFilter||'';
        return {query:state.searchQuery||'',author:segment==='JISU'||segment==='HAKONG'?segment:'',favorite:segment==='FAVORITE',photo:segment==='PHOTO'||category==='PHOTO',trip:segment==='TRIP',category:category.indexOf('CAT:')===0?category.slice(4):'',mood:category.indexOf('MOOD:')===0?category.slice(5):'',month:state.monthFilter||'',from:state.rangeFrom||'',to:state.rangeTo||''};
      }
      function pagedSignature(kind){
        return JSON.stringify([state.session&&state.session.token||'',state.revision||'',state.homeApplyGeneration||0,kind,kind==='records'?libraryFilters():weeklyQuestion()]);
      }
      function pagedRequest(op,values){
        return ensureSupabaseSession().then(function(token){ return supabaseRequest(Object.assign({op:op,token:token},values),24000); }).then(unwrap);
      }
      function pagedCache(kind){
        return state.pagedFeeds&&state.pagedFeeds[kind];
      }
      function refreshPagedFeed(){
        if(state.pagedFeeds) delete state.pagedFeeds[state.activeTab];
        renderPosts(state.home&&state.home.posts||[]);
      }
      function pagedResponseIsCurrent(kind,cache,token){
        return !!(state.session&&state.session.token===token&&pagedCache(kind)===cache&&cache.signature===pagedSignature(kind));
      }
      function fetchPagedFeed(kind,append){
        if(!state.session) return Promise.resolve(false);
        state.pagedFeeds=state.pagedFeeds||{};
        var signature=pagedSignature(kind), cache=pagedCache(kind);
        if(!cache||cache.signature!==signature||!append){
          cache={signature:signature,posts:[],groups:[],partners:[],histories:{},offset:0,total:0,hasMore:false,loading:false,error:'',weekly:null};
          state.pagedFeeds[kind]=cache;
        }
        if(cache.loading) return cache.promise;
        var token=state.session.token, offset=append?cache.offset:0;
        cache.loading=true; cache.error='';
        var request=kind==='records'?pagedRequest('search_posts',{filters:libraryFilters(),offset:offset,limit:20}):pagedRequest('question_groups',{offset:offset,limit:10});
        if(kind==='question'&&!append){
          request=Promise.all([request,pagedRequest('question_groups',{questionKey:questionKey(weeklyQuestion()),offset:0,limit:1})]).then(function(pages){
            var page=pages[0]; page.weekly=(pages[1].groups||[])[0]||null;
            if(page.revision!==pages[1].revision) throw new Error('답변이 바뀌었어. 다시 불러와 줘.');
            return page;
          });
        }
        cache.promise=request.then(function(page){
          if(!pagedResponseIsCurrent(kind,cache,token)) return false;
          if(append&&cache.revision&&page.revision!==cache.revision){
            delete state.pagedFeeds[kind];
            if(state.activeTab===kind) renderPosts(state.home&&state.home.posts||[]);
            return false;
          }
          var field=kind==='records'?'posts':'groups';
          cache[field]=(append?cache[field]:[]).concat(page[field]||[]);
          cache.offset=Number(page.nextOffset||0); cache.total=Number(page.total||0); cache.hasMore=!!page.hasMore; cache.revision=page.revision;
          if(kind==='question') { cache.partners=page.partners||[]; if(!append) cache.weekly=page.weekly; }
          return true;
        }).catch(function(error){
          if(pagedResponseIsCurrent(kind,cache,token)) cache.error=errorMessage(error);
          return false;
        }).then(function(ok){
          cache.loading=false;
          if(pagedResponseIsCurrent(kind,cache,token)&&state.activeTab===kind) renderPosts(state.home&&state.home.posts||[]);
          return ok;
        });
        return cache.promise;
      }
      function renderPagedFeed(){
        hide(el('feedStatus'));
        var kind=state.activeTab, cache=pagedCache(kind);
        if(!cache||cache.signature!==pagedSignature(kind)){ fetchPagedFeed(kind,false); cache=pagedCache(kind); }
        var feed=el('feed'); captureLoadedImageSources(feed); feed.innerHTML='';
        var refresh=el('loadAllRecords'); refresh.disabled=cache.loading; text(refresh,cache.loading?'검색 중…':'결과 새로고침');
        if(kind==='records'){
          text(el('libraryCount'),cache.loading&&!cache.posts.length?'전체 기록에서 검색 중…':('전체 '+cache.total+'개 중 '+cache.posts.length+'개 표시'+(cache.loading?' · 더 불러오는 중…':'')));
          var lastGroup=null;
          cache.posts.forEach(function(post){
            var group=feedGroupLabel(post.recordDate);
            if(group&&group!==lastGroup){var head=document.createElement('div');head.className='feed-daygroup';head.textContent=group;feed.appendChild(head);lastGroup=group;}
            feed.appendChild(postCard(post));
          });
        }else{
          renderQuestionHead();
          var groups=cache.groups.slice(), weekly=cache.weekly;
          if(weekly){ groups=groups.filter(function(group){return group.questionKey!==weekly.questionKey;}); groups.unshift(weekly); }
          else if(!cache.loading&&!cache.error) groups.unshift({questionKey:questionKey(weeklyQuestion()),questionText:weeklyQuestion(),authors:[],totalAnswers:0});
          groups.forEach(function(group){ feed.appendChild(questionGroupCard(group,cache)); });
        }
        if(cache.error){
          var message=document.createElement('div');message.className='status-card';message.setAttribute('role','status');
          var detail=document.createElement('p');detail.textContent='불러오지 못했어: '+cache.error;message.appendChild(detail);
          var retry=document.createElement('button');retry.className='secondary';retry.type='button';retry.textContent='다시 불러오기';
          retry.addEventListener('click',function(){ if(cache.offset) fetchPagedFeed(kind,true); else refreshPagedFeed(); });message.appendChild(retry);feed.appendChild(message);
        }else if(!feed.children.length){
          if(cache.loading) { var loading=document.createElement('p');loading.className='status-card';loading.textContent=kind==='question'?'질문과 두 사람의 답변을 불러오는 중…':'검색 결과를 불러오는 중…';feed.appendChild(loading); }
          else feed.innerHTML=emptyStateHtml();
        }
        renderLoadMore();
        return true;
      }
