      function questionKey(question){ return String(question||'').trim().replace(/\s+/g,' ').toLowerCase(); }
      function weeklyQuestion(){
        var pregnancy=state.home&&state.home.app&&state.home.app.pregnancy||{},week=Number(pregnancy.week);
        return isFinite(week)?WEEKLY_QUESTIONS[((week%WEEKLY_QUESTIONS.length)+WEEKLY_QUESTIONS.length)%WEEKLY_QUESTIONS.length]:WEEKLY_QUESTIONS[0];
      }
      function questionPartners(cache){
        var partners=cache.partners||[];
        return ['JISU','HAKONG'].map(function(id){ return partners.filter(function(partner){return partner.id===id;})[0]||{id:id,name:id==='JISU'?'지수':'하콩',emoji:id==='JISU'?'🌿':'🌼'}; });
      }
      function answerFor(group,userId){
        return group&&(group.authors||[]).filter(function(author){ return author.authorId===userId; })[0]||null;
      }
      function openWeeklyAnswer(question,existingPost,checked){
        if(existingPost){ openEditComposer(findPost(existingPost.id)||existingPost); return; }
        if(!checked){
          if(!state.session||state.questionAnswerBusy) return;
          var token=state.session.token;state.questionAnswerBusy=true;
          pagedRequest('question_groups',{questionKey:questionKey(question),offset:0,limit:1}).then(function(page){
            if(!state.session||state.session.token!==token) return;
            var mine=answerFor((page.groups||[])[0],currentUserId());
            openWeeklyAnswer(question,mine&&mine.post,true);
          }).catch(function(error){if(state.session&&state.session.token===token) toast(errorMessage(error));}).then(function(){if(state.session&&state.session.token===token) state.questionAnswerBusy=false;});
          return;
        }
        if(state.saving) return;
        var body=el('postBody');
        if(state.composerMode==='edit'||String(body.value||'').trim()||String(el('postTitle').value||'').trim()||(state.images||[]).length||composerDraftLocked()){
          openComposer(); toast('작성 중인 기록을 먼저 마무리해 줘. 질문 답변은 그다음에 남길 수 있어.'); return;
        }
        openComposer();
        if(question){ body.value='Q. '+question+'\nA. '; scheduleDraftSave(); }
      }
      function renderQuestionHead(){
        var box=el('questionHead'); if(!box) return;
        var cache=pagedCache('question'), q=weeklyQuestion(), mine=cache&&answerFor(cache.weekly,currentUserId());
        box.innerHTML='<div class="question-eyebrow">💬 이번 주 질문</div><h2>'+escapeHtml(q)+'</h2>'
          +'<p class="upload-note">질문별로 두 사람의 답변을 함께 볼 수 있어. 지난 답변도 모두 남아 있어.</p>'
          +'<button id="answerQuestionBtn" class="save" type="button">'+(mine?'내 답변 수정하기':'이 질문에 답하기 ✍️')+'</button>'
          +'<button id="refreshQuestions" class="secondary" type="button" style="width:100%;margin-top:10px">질문 새로고침</button>';
        var button=box.querySelector('#answerQuestionBtn');
        button.disabled=!cache||cache.loading||!!cache.error;
        button.addEventListener('click',function(){ openWeeklyAnswer(q,mine&&mine.post,true); });
        box.querySelector('#refreshQuestions').addEventListener('click',refreshPagedFeed);
      }
      function questionGroupCard(group,cache){
        var card=document.createElement('section');card.className='question-group';
        var title=document.createElement('h2');title.textContent=group.questionText;card.appendChild(title);
        var total=document.createElement('p');total.className='question-progress';
        var partners=questionPartners(cache), answered=partners.filter(function(partner){return !!answerFor(group,partner.id);}).length;
        total.textContent=answered+' / '+partners.length+'명 답변';card.appendChild(total);
        var pair=document.createElement('div');pair.className='question-pair';card.appendChild(pair);
        partners.forEach(function(partner){
          var answer=answerFor(group,partner.id), panel=document.createElement('div');panel.className='question-answer';
          var status=document.createElement('p');status.className='answer-status'+(answer?' answered':'');status.textContent=partner.emoji+' '+partner.name+' · '+(answer?'답변 완료':'아직 답변 없음');panel.appendChild(status);
          if(answer&&answer.post){
            var post=postCard(answer.post), body=post.querySelector('.post-text');
            if(body) body.textContent=String(answer.post.body||'').replace(/^Q\.[ \t]+[^\r\n]+\r?\n?/,'').replace(/^A\.[ \t]*/,'');
            panel.appendChild(post);
          }else{
            var empty=document.createElement('p');empty.className='answer-empty';empty.textContent=partner.id===currentUserId()?'지금 떠오르는 마음을 남겨봐.':'답변을 남기면 여기에 함께 보여.';panel.appendChild(empty);
          }
          if(partner.id===currentUserId()){
            var action=document.createElement('button');action.className='secondary answer-action';action.type='button';action.textContent=answer?'내 답변 수정':'답변 남기기';
            action.addEventListener('click',function(){openWeeklyAnswer(group.questionText,answer&&answer.post,true);});panel.appendChild(action);
          }
          pair.appendChild(panel);
        });
        if(group.totalAnswers>(group.authors||[]).length){
          var details=document.createElement('details');details.className='question-history';
          var summary=document.createElement('summary');summary.textContent='이전 답변 '+(group.totalAnswers-(group.authors||[]).length)+'개 보기';details.appendChild(summary);
          var history=document.createElement('div');details.appendChild(history);
          var saved=cache.histories[group.questionKey]; if(saved&&saved.open) details.open=true;
          details.addEventListener('toggle',function(){
            var current=cache.histories[group.questionKey];if(current) current.open=details.open;
            if(details.open&&!current) loadQuestionHistory(group,cache,false,history); else if(details.open) renderQuestionHistory(group,cache,history);
          });
          if(details.open) renderQuestionHistory(group,cache,history);
          card.appendChild(details);
        }
        return card;
      }
      function loadQuestionHistory(group,cache,append,container){
        var history=cache.histories[group.questionKey];
        if(!history) history=cache.histories[group.questionKey]={posts:[],offset:0,hasMore:true,loading:false,error:'',open:true};
        if(history.loading) return;
        var token=state.session&&state.session.token;history.loading=true;history.error='';renderQuestionHistory(group,cache,container);
        pagedRequest('search_posts',{filters:{questionKey:group.questionKey},offset:append?history.offset:0,limit:20}).then(function(page){
          if(!pagedResponseIsCurrent('question',cache,token)) return;
          if(page.revision!==cache.revision){ history.error='답변이 바뀌었어. 질문 탭을 새로 불러와 줘.';return; }
          history.posts=(append?history.posts:[]).concat(page.posts||[]);history.offset=page.nextOffset;history.hasMore=!!page.hasMore;
        }).catch(function(error){if(pagedResponseIsCurrent('question',cache,token)) history.error=errorMessage(error);}).then(function(){
          history.loading=false;
          if(pagedResponseIsCurrent('question',cache,token)&&container.isConnected) renderQuestionHistory(group,cache,container);
        });
      }
      function renderQuestionHistory(group,cache,container){
        var history=cache.histories[group.questionKey];if(!history) return;
        var latest=(group.authors||[]).map(function(author){return author.post&&author.post.id;});
        container.innerHTML='';history.posts.forEach(function(post){if(latest.indexOf(post.id)<0) container.appendChild(postCard(post));});
        if(history.error){var error=document.createElement('p');error.setAttribute('role','status');error.textContent=history.error;container.appendChild(error);}
        if(history.hasMore||history.error){
          var more=document.createElement('button');more.className='secondary';more.type='button';more.disabled=history.loading;more.textContent=history.loading?'답변 불러오는 중…':(history.error?'다시 불러오기':'답변 더 보기');
          more.addEventListener('click',function(){loadQuestionHistory(group,cache,true,container);});container.appendChild(more);
        }
      }
