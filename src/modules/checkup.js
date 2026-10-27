      // 검진 일정과 질문·결과를 한 화면에서 이어 쓴다.
      var noteState={owner:'',busy:false,loading:false,loaded:false,seq:0,editingId:'',attempt:null,notes:[],baseline:'',date:'',error:''};
      function noteFormData(){
        return {checkupDate:el('noteDate').value,questions:el('noteQuestions').value,result:el('noteResult').value,weight:el('noteWeight').value,bloodPressure:el('noteBp').value,babySize:el('noteBabySize').value};
      }
      function noteFormDirty(){
        return JSON.stringify(noteFormData())!==noteState.baseline;
      }
      function fillNoteForm(note,date){
        note=note||{};
        noteState.editingId=note.id||''; noteState.attempt=null;
        el('noteDate').value=note.checkupDate||date||'';
        el('noteQuestions').value=note.questions||''; el('noteResult').value=note.result||'';
        el('noteWeight').value=note.weight||''; el('noteBp').value=note.bloodPressure||''; el('noteBabySize').value=note.babySize||'';
        noteState.date=el('noteDate').value; noteState.baseline=JSON.stringify(noteFormData());
        el('noteResultDetails').open=!!(note.result||note.weight||note.bloodPressure||note.babySize);
      }
      function resetNoteContext(){
        var token=state.session&&state.session.token||'';
        if(noteState.owner===token) return;
        noteState.owner=token; noteState.seq++; noteState.notes=[]; noteState.busy=false; noteState.loading=false; noteState.loaded=false; noteState.error='';
        fillNoteForm(null,''); renderNoteList(null);
        text(el('noteScheduleStatus'),''); el('noteScheduleDate').value='';
        el('noteHistory').open=false;
      }
      function noteForDate(date){
        return noteState.notes.filter(function(note){return note.checkupDate===date;}).sort(function(a,b){return String(b.updatedAt||'').localeCompare(String(a.updatedAt||''));})[0]||null;
      }
      function openCheckupNotes(){
        if(!state.session) return;
        resetNoteContext(); openOverlaySheet('checkupNotes');
        var pregnancy=state.home&&state.home.app&&state.home.app.pregnancy||{};
        var date=pregnancy.valid!==false&&pregnancy.checkupDate||'';
        el('noteScheduleDate').value=date;
        text(el('noteScheduleStatus'),date?'다음 검진 · '+formatKoreanDate(date):'예정된 검진이 없어. 날짜를 정해두면 홈에서도 볼 수 있어.');
        if(!el('noteDate').value) fillNoteForm(null,date||today());
        hide(el('weightChartBox')); loadCheckupNotes();
      }
      function renderNoteFormState(message){
        var locked=noteState.busy||noteState.loading||!noteState.loaded||state.checkupBusy;
        ['noteDate','noteQuestions','noteResult','noteWeight','noteBp','noteBabySize','newCheckupNote','saveCheckupNote','saveCheckupNoteBottom'].forEach(function(id){el(id).disabled=locked;});
        var status=message||noteState.error||(noteState.busy?'저장하는 중…':noteState.loading?'기존 노트를 확인하는 중…':noteFormDirty()?'아직 저장하지 않은 내용이 있어.':noteState.editingId?'저장된 노트를 이어 쓰는 중이야.':'질문을 먼저 저장하고 검진 후 결과를 덧붙여봐.');
        text(el('noteStatus'),status);
        var label=noteState.busy?'저장 중…':noteState.editingId?'수정 저장':'노트 저장';
        text(el('saveCheckupNote'),label);text(el('saveCheckupNoteBottom'),label);
        el('retryCheckupNotes').classList.toggle('hidden',!noteState.error||noteState.loaded);
        text(el('noteHistoryCount'),noteState.loaded?'지난 노트 '+noteState.notes.length+'개':'지난 노트');
        el('noteScheduleSave').disabled=!!(state.checkupBusy||noteState.busy||noteState.loading);
        el('noteScheduleDate').disabled=!!(state.checkupBusy||noteState.busy||noteState.loading);
        Array.prototype.forEach.call(el('noteList').querySelectorAll('button'),function(button){button.disabled=locked;});
      }
      function changeNoteDate(){
        if(noteState.busy||noteState.loading||!noteState.loaded||state.checkupBusy) return;
        var date=el('noteDate').value, previous=noteState.date;
        el('noteDate').value=previous;
        if(noteFormDirty()&&!confirm('작성 중인 노트를 저장하지 않고 다른 날짜를 볼까?')) return;
        fillNoteForm(noteForDate(date),date); noteState.error=''; renderNoteFormState();
      }
      function newCheckupNote(){
        if(noteState.busy||noteState.loading||!noteState.loaded||state.checkupBusy) return;
        if(noteFormDirty()&&!confirm('작성 중인 노트를 저장하지 않고 새 날짜를 고를까?')) return;
        fillNoteForm(null,'');noteState.error='';renderNoteFormState();el('noteDate').focus();
      }
      function loadCheckupNotes(){
        if(!state.session||noteState.busy||state.checkupBusy) return Promise.resolve(false);
        var token=state.session.token,seq=++noteState.seq,hadLoaded=noteState.loaded,scheduleInput=el('noteScheduleDate').value;
        noteState.loading=true;noteState.error='';renderNoteFormState();
        return callApi('apiGetCheckupNotesV310',[token],20000).then(unwrap).then(function(data){
          if(!state.session||state.session.token!==token||noteState.owner!==token||seq!==noteState.seq) return false;
          noteState.notes=data&&data.notes||[];noteState.loaded=true;noteState.loading=false;
          var date=el('noteDate').value;
          if(!noteFormDirty()){
            if(!hadLoaded&&!noteState.editingId&&data&&data.nextCheckupDate&&data.nextCheckupDate>=today()) date=data.nextCheckupDate;
            var current=noteState.editingId?noteState.notes.filter(function(note){return note.id===noteState.editingId;})[0]:noteForDate(date);
            fillNoteForm(current,date);
          }
          if(!state.checkupBusy&&el('noteScheduleDate').value===scheduleInput){
            var next=data&&data.nextCheckupDate>=today()?data.nextCheckupDate:'';
            el('noteScheduleDate').value=next;
            text(el('noteScheduleStatus'),next?'다음 검진 · '+formatKoreanDate(next):'예정된 검진이 없어. 날짜를 정해두면 홈에서도 볼 수 있어.');
          }
          renderNoteList(noteState.notes);renderWeightChart(noteState.notes);renderNoteFormState();return true;
        }).catch(function(error){
          if(!state.session||state.session.token!==token||noteState.owner!==token||seq!==noteState.seq) return false;
          noteState.loading=false;noteState.error='노트를 불러오지 못했어: '+errorMessage(error);renderNoteFormState();return false;
        });
      }
      function saveNoteSchedule(){
        if(state.checkupBusy||noteState.busy||noteState.loading||!state.session) return;
        var date=el('noteScheduleDate').value;
        if(!date||date<today()){toast('오늘 이후의 검진 날짜를 골라 줘.');return;}
        var token=state.session.token;
        var pending=setCheckupAction(date);renderNoteFormState();
        return pending.then(function(saved){
          if(!state.session||state.session.token!==token) return;
          text(el('noteScheduleStatus'),saved?'다음 검진 · '+formatKoreanDate(date):'일정을 저장하지 못했어. 다시 시도해 줘.');
          if(saved&&!noteState.busy&&!noteState.loading&&!noteFormDirty()){
            fillNoteForm(noteForDate(date),date);
          }
          renderNoteFormState();
        });
      }
      function renderNoteList(notes){
        var list=el('noteList');list.innerHTML='';
        if(notes===null){list.innerHTML='<div class="comment-empty">지난 검진노트를 불러오는 중…</div>';return;}
        if(!notes.length){list.innerHTML='<div class="comment-empty">저장한 노트가 여기에 모여. 질문만 먼저 남겨도 좋아 🏥</div>';return;}
        notes.forEach(function(note){
          var item=document.createElement('div');item.className='note-item';
          var parts=[];
          if(note.weight)parts.push('⚖️ '+note.weight);if(note.bloodPressure)parts.push('🩺 '+note.bloodPressure);if(note.babySize)parts.push('👶 '+note.babySize);
          var html='<h4>🏥 '+escapeHtml(note.checkupDate)+'</h4>';
          if(parts.length)html+='<div>'+escapeHtml(parts.join(' · '))+'</div>';
          if(note.questions)html+='<div style="margin-top:5px"><strong>물어볼 것</strong><div class="comment-text">'+escapeHtml(note.questions)+'</div></div>';
          if(note.result)html+='<div style="margin-top:5px"><strong>결과 메모</strong><div class="comment-text">'+escapeHtml(note.result)+'</div></div>';
          item.innerHTML=html;
          var actions=document.createElement('div');actions.className='note-actions';
          var edit=document.createElement('button');edit.type='button';edit.textContent='이어서 쓰기';
          edit.addEventListener('click',function(){
            if(noteState.busy||noteState.loading) return;
            if(noteFormDirty()&&!confirm('작성 중인 노트를 저장하지 않고 이 노트를 열까?'))return;
            fillNoteForm(note);noteState.error='';renderNoteFormState();
            var sheet=el('checkupNotes').querySelector('.sheet');if(sheet)sheet.scrollTop=0;el('noteQuestions').focus();
          });
          var del=document.createElement('button');del.type='button';del.textContent='삭제';
          del.addEventListener('click',function(){ deleteCheckupNote(note); });
          actions.appendChild(edit);actions.appendChild(del);item.appendChild(actions);list.appendChild(item);
        });
      }
      function deleteCheckupNote(note){
        if(!state.session||noteState.busy||noteState.loading||state.checkupBusy) return;
        if(!confirm(note.checkupDate+' 검진노트를 지울까?'))return;
        var token=state.session.token;noteState.busy=true;noteState.error='';renderNoteFormState('지우는 중…');
        return callApi('apiDeleteCheckupNoteV310',[token,note.id],16000).then(unwrap).then(function(){
          if(!state.session||state.session.token!==token||noteState.owner!==token)return;
          noteState.notes=noteState.notes.filter(function(item){return item.id!==note.id;});
          if(noteState.editingId===note.id)fillNoteForm(null,note.checkupDate);
          noteState.busy=false;renderNoteList(noteState.notes);renderWeightChart(noteState.notes);renderNoteFormState('노트를 지웠어.');
        }).catch(function(error){
          if(!state.session||state.session.token!==token||noteState.owner!==token)return;
          noteState.busy=false;noteState.error='지우지 못했어: '+errorMessage(error);renderNoteFormState();
        });
      }
      function saveCheckupNoteAction(){
        if(noteState.busy||noteState.loading||!noteState.loaded||state.checkupBusy||!state.session) return Promise.resolve(false);
        var payload=noteFormData();Object.keys(payload).forEach(function(key){payload[key]=String(payload[key]||'').trim();});
        payload.noteId=noteState.editingId;
        if(!payload.checkupDate){toast('검진 날짜를 먼저 골라 줘.');return Promise.resolve(false);}
        var signature=JSON.stringify(payload);
        if(!noteState.attempt||noteState.attempt.signature!==signature)noteState.attempt={signature:signature,id:uuid()};
        var token=state.session.token;noteState.busy=true;noteState.error='';renderNoteFormState();
        return callApi('apiSaveCheckupNoteV310',[token,payload,noteState.attempt.id],20000).then(unwrap).then(function(data){
          if(!state.session||state.session.token!==token||noteState.owner!==token)return false;
          var note=Object.assign({},payload,{id:data&&data.noteId||payload.noteId,updatedAt:new Date().toISOString()});
          if(!note.id)throw new Error('저장 결과를 확인하지 못했어. 다시 저장해 줘.');
          noteState.notes=noteState.notes.filter(function(item){return item.id!==note.id;});noteState.notes.push(note);
          noteState.notes.sort(function(a,b){return b.checkupDate.localeCompare(a.checkupDate);});
          fillNoteForm(note);noteState.busy=false;renderNoteList(noteState.notes);renderWeightChart(noteState.notes);renderNoteFormState('저장됨 ✓ · 검진 후 결과도 이 노트에 이어서 적어봐.');
          toast('검진노트를 저장했어 🏥');return true;
        }).catch(function(error){
          if(!state.session||state.session.token!==token||noteState.owner!==token)return false;
          noteState.busy=false;noteState.error='저장하지 못했어. 입력은 그대로 있어: '+errorMessage(error);renderNoteFormState();return false;
        });
      }
