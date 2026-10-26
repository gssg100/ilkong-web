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
          text(el('libraryCount'),libraryResultText(cache));
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

      function libraryResultText(cache){
        if(cache.loading&&!cache.posts.length) return '전체 기록에서 검색 중…';
        if(cache.error&&!cache.posts.length&&!cache.revision) return '검색 결과를 확인하지 못했어. 다시 불러와 줘.';
        return '전체 '+cache.total+'개 중 '+cache.posts.length+'개 표시'+(cache.loading?' · 더 불러오는 중…':'');
      }
      function recordSearchQuery(){
        return state.activeTab==='records'?String(state.searchQuery||'').trim():'';
      }
      function searchHighlightedHtml(value,query){
        var source=String(value||''), needle=String(query||'').trim();
        if(!needle) return escapeHtml(source);
        var pattern=new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'gi');
        var output='', cursor=0, match;
        while((match=pattern.exec(source))!==null){
          output+=escapeHtml(source.slice(cursor,match.index))+'<mark class="search-hit">'+escapeHtml(match[0])+'</mark>';
          cursor=match.index+match[0].length;
        }
        return output+escapeHtml(source.slice(cursor));
      }
      function searchCommentMatches(post,query){
        var needle=String(query||'').trim().toLowerCase();
        if(!needle) return [];
        return (Array.isArray(post.comments)?post.comments:[]).filter(function(comment){
          return !comment.deleted&&String(comment.content||'').toLowerCase().indexOf(needle)!==-1;
        });
      }
      function searchSnippet(value,query){
        var source=String(value||''), needle=String(query||'').trim();
        var index=source.toLowerCase().indexOf(needle.toLowerCase());
        if(index<0||!needle) return source;
        var start=Math.max(0,index-28), end=Math.min(source.length,index+needle.length+60);
        // Do not split an emoji surrogate pair at the excerpt boundaries.
        if(start>0&&source.charCodeAt(start)>=0xDC00&&source.charCodeAt(start)<=0xDFFF) start--;
        if(end<source.length&&source.charCodeAt(end-1)>=0xD800&&source.charCodeAt(end-1)<=0xDBFF) end++;
        return (start?'…':'')+source.slice(start,end)+(end<source.length?'…':'');
      }
      function searchCommentSummaryHtml(post,query){
        var matches=searchCommentMatches(post,query);
        if(!matches.length) return '';
        var first=matches[0];
        return '<button class="search-comment-jump" type="button" aria-label="검색어와 일치하는 댓글 '+matches.length+'개 보기"><span class="search-match-label">댓글 '+matches.length+'개에서 찾았어 <span aria-hidden="true">↗</span></span><span class="search-match-snippet">'+escapeHtml(first.authorName||'댓글')+' · '+searchHighlightedHtml(searchSnippet(first.content,query),query)+'</span></button>';
      }
      function revealSearchComments(card){
        var toggle=card.querySelector('.comment-toggle');
        if(toggle&&toggle.getAttribute('aria-expanded')!=='true') toggle.click();
        var match=card.querySelector('.search-comment-match');
        if(!match) return;
        try { match.scrollIntoView({block:'center',behavior:window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}); }
        catch(error){ match.scrollIntoView(); }
        try { match.focus({preventScroll:true}); } catch(error){ match.focus(); }
      }
