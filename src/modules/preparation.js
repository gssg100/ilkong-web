      // 출산 준비: 실제 보유·최소 구매와 상담·일정을 같은 진입점에서 관리한다.
      var checklistBusy=false;
      var preparationState={owner:'',seq:0,planSeq:0,tab:'items',filter:'essential',category:'',items:[],plan:null,loading:false,saving:false,itemDraft:null,planDraft:null,taskDraft:null,taskEditor:null,loadError:'',bound:false};
      var PREP_STATES={unknown:'상태 미확인',planned:'준비 예정',partial:'일부 확보',ready:'이미 있음',waiting:'제공·배송 예정',hold:'구매 보류',skip:'구매 안 함'};
      var PREP_METHODS={unknown:'방식 미정',new:'새 제품',used:'당근',gift:'물려받기·선물',hospital:'병원 제공',owned:'기존 보유'};
      var PREP_TIMINGS={unknown:'시기 미정',before:'출산 전',after:'출산 후',as_needed:'필요 시'};
      var PREP_PRIORITIES={unknown:'필수 여부 미확인',essential:'필수',optional:'선택'};
      var PREP_FIELD_LABELS={content:'물품명',prepState:'준비 상태',method:'확보 방식',timing:'필요 시점',priority:'중요도',targetQuantity:'목표 수량',targetMax:'목표 최대 수량',currentQuantity:'현재 수량',unit:'단위',price:'예상가격',spent:'실제 지출',remainingPrice:'부족분 예상비용',memo:'비고',verification:'사용 적합성 확인',checkNotes:'검수할 사항',category:'분류',owner:'담당',model:'상품·모델',purchaseUrl:'구매 링크',costScope:'지출 구분',needWeek:'필요 주차',provider:'업체',preferredCarer:'희망 관리사',backupCarers:'예비 관리사',bookingStatus:'예약·계약 상태',subsidyStatus:'지원 신청 상태',careCenterChoice:'조리원 계획',serviceStart:'시작일',serviceDays:'이용일 수',excludedDates:'휴무일',dateCertainty:'시작일 확실성',deposit:'예약금',quotedTotal:'확정 견적',extraCost:'추가금',depositIncluded:'예약금 포함 여부',budgetTarget:'확보 목표',contractNotes:'상담·계약 메모',counselDate:'상담일',consultationText:'문의 문자'};
      function preparationDisplayValue(key,value){var names=key==='prepState'?PREP_STATES:key==='method'?PREP_METHODS:key==='timing'?PREP_TIMINGS:key==='priority'?PREP_PRIORITIES:null;return value==null||value===''?'미확인':names?names[value]||String(value):Array.isArray(value)?value.join(', '):String(value);}
      var PREP_CATEGORIES=['수면·침구','의류·손수건','기저귀·위생','수유','목욕','외출·이동','산모용품','집안·수납','기타'];
      function resetPreparationContext(){
        preparationState.seq++;preparationState.planSeq++;preparationState.owner='';preparationState.items=[];preparationState.plan=null;preparationState.itemDraft=null;preparationState.planDraft=null;preparationState.taskDraft=null;preparationState.loading=false;preparationState.saving=false;preparationState.loadError='';checklistBusy=false;
        ['prepItemEditor','prepCareForm','prepTaskEditor','prepTasks','prepEvidence','checklistList','prepSummary','prepServiceCalendar','prepTaskSummary'].forEach(function(id){if(el(id))el(id).innerHTML='';});
        if(el('checkItemInput'))el('checkItemInput').value='';if(el('checklist'))hide(el('checklist'));
      }
      function preparationOwner(){
        var owner=state.session?String(state.session.token):'';
        if(preparationState.owner!==owner){resetPreparationContext();preparationState.owner=owner;}
        return owner;
      }
      function checklistMoney(value){return value==null||String(value)===''?'':Number(value).toLocaleString('ko-KR');}
      function preparationReady(item){return (item.prepState==='ready'||(!item.prepState&&item.done))&&item.verification!=='pending'&&!(item.targetQuantity!=null&&item.currentQuantity!=null&&item.currentQuantity<item.targetQuantity);}
      function preparationSummary(items){
        var result={total:0,done:0,owned:0,used:0,after:0,spent:0,spentUnknown:0,remaining:0,priceUnknown:0};
        (items||[]).filter(function(i){return !(i.supersededBy&&i.supersededBy.length);}).forEach(function(item){
          var ready=preparationReady(item),essential=item.priority==='essential'&&item.timing==='before';
          if(essential){result.total++;if(ready)result.done++;}
          if(item.prepState==='ready')result.owned++;
          if(item.method==='used'&&!ready&&['hold','skip'].indexOf(item.prepState)<0&&item.timing!=='after')result.used++;
          if(item.timing==='after')result.after++;
          if(item.costScope!=='existing'&&item.spent!=null&&String(item.spent)!=='')result.spent+=Number(item.spent)||0;
          else if(item.costScope!=='existing'&&item.prepState==='ready')result.spentUnknown++;
          if(essential&&!ready&&['hold','skip'].indexOf(item.prepState)<0&&['owned','hospital','gift'].indexOf(item.method)<0){
            var amount=item.remainingPrice;
            if((amount==null||String(amount)==='')&&item.prepState!=='partial'&&!(Number(item.currentQuantity)>0))amount=item.price;
            if(amount==null||String(amount)==='')result.priceUnknown++;else result.remaining+=Number(amount)||0;
          }
        });return result;
      }
      function renderPreparationHomeSummary(items){
        var s=preparationSummary(items);
        text(el('summaryChecklistTitle'),s.total?'출산 전 필수 '+s.done+'/'+s.total:'출산 준비');
        var next=items.filter(function(i){return i.priority==='essential'&&i.timing==='before'&&!preparationReady(i);})[0];
        text(el('summaryChecklistDesc'),next?next.content:(s.total?'필수품 준비를 마쳤어':'보유·구매 계획을 확인해봐'));
      }
      function openChecklist(){
        preparationOwner();openOverlaySheet('checklist');bindPreparation();renderPreparationTab();
        if(preparationState.itemDraft)renderPreparationItemEditor();
        loadChecklist();loadPreparationPlan();
      }
      function bindPreparation(){
        if(preparationState.bound)return;preparationState.bound=true;
        Array.prototype.forEach.call(document.querySelectorAll('[data-prep-tab]'),function(b){b.addEventListener('click',function(){preparationState.tab=b.getAttribute('data-prep-tab');renderPreparationTab();});});
        el('prepCategory').addEventListener('change',function(){preparationState.category=this.value;renderChecklist(preparationState.items);});
        el('prepRetry').addEventListener('click',function(){loadChecklist();loadPreparationPlan();});
        el('prepAddTask').addEventListener('click',function(){editPreparationTask(null);});
      }
      function renderPreparationTab(){
        ['items','tasks','care'].forEach(function(tab){var active=preparationState.tab===tab;el('prepPanel_'+tab).classList.toggle('hidden',!active);var b=document.querySelector('[data-prep-tab="'+tab+'"]');if(b){b.classList.toggle('on',active);b.setAttribute('aria-current',active?'page':'false');}});
        if(preparationState.plan)renderPreparationPlan();
      }
      function loadChecklist(){
        var token=preparationOwner();if(!token)return Promise.resolve(false);
        var seq=++preparationState.seq;preparationState.loading=true;text(el('checklistStatus'),'준비물을 확인하는 중…');
        return callApi('apiGetChecklistV320',[token],20000).then(unwrap).then(function(data){
          if(!state.session||state.session.token!==token||seq!==preparationState.seq)return false;
          preparationState.items=Array.isArray(data&&data.items)?data.items:[];state.homeSummaryChecklist=preparationState.items;state.homeSummaryChecklistAt=Date.now();preparationState.loading=false;preparationState.loadError='';
          renderHomeSummary(state.home&&state.home.app&&state.home.app.pregnancy);renderChecklist(preparationState.items);return true;
        }).catch(function(error){if(state.session&&state.session.token===token&&seq===preparationState.seq){preparationState.loading=false;preparationState.loadError=errorMessage(error);text(el('checklistStatus'),'불러오지 못했어. '+preparationState.loadError);show(el('prepRetry'));}return false;});
      }
      function loadPreparationPlan(){
        var token=preparationOwner();if(!token)return Promise.resolve(false);var seq=++preparationState.planSeq;
        return callApi('apiGetPreparationPlanV500',[token],20000).then(unwrap).then(function(data){
          if(!state.session||state.session.token!==token||seq!==preparationState.planSeq)return false;
          preparationState.plan=data&&data.plan||null;if(preparationState.planDraft&&!preparationState.planDraft.dirty)preparationState.planDraft=null;renderPreparationPlan();return true;
        }).catch(function(error){if(state.session&&state.session.token===token&&seq===preparationState.planSeq){text(el('prepPlanStatus'),'계획을 불러오지 못했어. '+errorMessage(error));show(el('prepRetry'));}return false;});
      }
      function preparationFilter(item,filter){
        if(filter==='essential')return item.priority==='essential'&&item.timing==='before';
        if(filter==='owned')return item.prepState==='ready';
        if(filter==='used'||filter==='new')return item.method===filter&&!preparationReady(item)&&['hold','skip'].indexOf(item.prepState)<0&&item.timing!=='after';
        if(filter==='after')return item.timing==='after';
        if(filter==='hold')return ['hold','skip'].indexOf(item.prepState)>=0;
        return true;
      }
      function checklistSubtitle(item){
        var quantity=item.currentQuantity==null?'현재 수량 미확인':'현재 '+item.currentQuantity+item.unit;
        if(item.targetQuantity!=null)quantity+=' / 목표 '+item.targetQuantity+(item.targetMax!=null&&item.targetMax!==item.targetQuantity?'~'+item.targetMax:'')+item.unit;
        var bits=[quantity,PREP_METHODS[item.method]||'방식 미정',PREP_TIMINGS[item.timing]||'시기 미정'];
        if(item.owner)bits.push(item.owner);if(item.spent!=null&&String(item.spent)!=='')bits.push('기록한 지출 '+checklistMoney(item.spent)+'원');if(item.verification==='pending')bits.push('사용 적합성 확인 필요');return bits.join(' · ');
      }
      function renderChecklist(items){
        preparationState.items=items||[];var s=preparationSummary(items);
        var summary=el('prepSummary');summary.innerHTML='';var headline=document.createElement('strong');headline.textContent=s.total?'출산 전 필수 '+s.done+' / '+s.total+' 준비 완료':'출산 전 필수품을 먼저 정해봐';summary.appendChild(headline);
        if(s.total){var progress=document.createElement('progress');progress.max=s.total;progress.value=s.done;progress.setAttribute('aria-label','출산 전 필수품 준비율');summary.appendChild(progress);}
        var note=document.createElement('p');note.textContent='출산 후·선택품은 준비율에서 제외해. 필요한 만큼만 준비하면 돼.';summary.appendChild(note);
        var details=document.createElement('details'),caption=document.createElement('summary');caption.textContent='보유·구매 계획과 비용 보기';details.appendChild(caption);
        var amounts=document.createElement('p');amounts.textContent='이미 있음 '+s.owned+' · 출산 전 당근 후보 '+s.used+' · 출산 후 '+s.after+'\n기록한 준비 지출 '+checklistMoney(s.spent)+'원'+(s.spentUnknown?' · 지출 미확인 '+s.spentUnknown+'개':'')+'\n앞으로 살 필수품: 확인된 예상 '+checklistMoney(s.remaining)+'원'+(s.priceUnknown?' · 가격 미정 '+s.priceUnknown+'개':'')+'\n예상가격은 항목 전체 금액이야. 보류·제공 예정 물품은 구매 예상비용에서 제외해.';details.appendChild(amounts);summary.appendChild(details);
        text(el('checklistStatus'),preparationState.loading?'최신 준비물을 확인하는 중…':items.length+'개 항목 · 변경은 저장 버튼으로 확정해');if(!preparationState.loadError)hide(el('prepRetry'));
        var filters=el('checklistFilters');filters.innerHTML='';[['essential','출산 전 필수'],['all','전체'],['owned','이미 있음'],['used','당근으로 살 것'],['new','새로 살 것'],['after','출산 후'],['hold','보류·안 사기']].forEach(function(pair){
          var b=document.createElement('button');b.type='button';b.className='chk-chip'+(preparationState.filter===pair[0]?' on':'');b.textContent=pair[1];b.setAttribute('aria-pressed',String(preparationState.filter===pair[0]));b.addEventListener('click',function(){preparationState.filter=pair[0];renderChecklist(items);});filters.appendChild(b);
        });
        var category=el('prepCategory'),names=Array.from(new Set(items.map(function(i){return i.category;}).filter(Boolean)));category.innerHTML='<option value="">모든 분류</option>'+names.map(function(n){return '<option value="'+escapeHtml(n)+'">'+escapeHtml(n)+'</option>';}).join('');category.value=preparationState.category;
        var list=el('checklistList');list.innerHTML='';var shown=items.filter(function(i){return !(i.supersededBy&&i.supersededBy.length)&&preparationFilter(i,preparationState.filter)&&(!preparationState.category||i.category===preparationState.category);});
        shown.sort(function(a,b){return Number(preparationReady(a))-Number(preparationReady(b));});
        if(!shown.length){var empty=document.createElement('p');empty.className='comment-empty';empty.textContent=items.length?'이 조건에는 준비물이 없어. 전체 목록도 확인해봐.':'첫 준비물을 적어봐.';list.appendChild(empty);}
        shown.forEach(function(item){
          var row=document.createElement('article');row.className='prep-item';
          var top=document.createElement('div');top.className='prep-item-top';var name=document.createElement('strong');name.textContent=item.content;top.appendChild(name);
          var badge=document.createElement('span');badge.className='prep-badge'+(preparationReady(item)?' ready':'');badge.textContent=PREP_STATES[item.prepState]||'상태 미확인';top.appendChild(badge);row.appendChild(top);
          var sub=document.createElement('p');sub.className='prep-sub';sub.textContent=checklistSubtitle(item);row.appendChild(sub);
          if(item.memo){var memo=document.createElement('p');memo.className='prep-sub';memo.textContent=item.memo;row.appendChild(memo);}
          var actions=document.createElement('div');actions.className='prep-item-actions';
          var edit=document.createElement('button');edit.type='button';edit.className='secondary';edit.textContent='상세·수정';edit.setAttribute('aria-label',item.content+' 상세·수정');edit.addEventListener('click',function(){editPreparationItem(item);});actions.appendChild(edit);
          if(['hold','skip'].indexOf(item.prepState)<0){var ready=document.createElement('button');ready.type='button';ready.className='secondary';ready.textContent=preparationReady(item)?'준비 상태 변경':item.verification==='pending'?'적합성 확인':item.prepState==='waiting'?'수령 확인':'확보 완료';ready.setAttribute('aria-label',item.content+' '+ready.textContent);ready.addEventListener('click',function(){editPreparationItem(item,true);});actions.appendChild(ready);}row.appendChild(actions);list.appendChild(row);
        });
      }
      function preparationField(parent,key,labelText,value,options,type){
        var label=document.createElement('label');label.className='prep-field';var span=document.createElement('span');span.textContent=labelText;label.appendChild(span);
        var input=document.createElement(options?'select':type==='textarea'?'textarea':'input');input.name=key;input.id='prepField_'+key;
        if(options){Object.keys(options).forEach(function(k){var option=document.createElement('option');option.value=k;option.textContent=options[k];input.appendChild(option);});}
        else if(type!=='textarea'){input.type=type==='date'?'date':'text';if(type==='number')input.inputMode='numeric';}
        if(type==='textarea'){input.rows=3;label.classList.add('prep-wide');}input.value=value==null?'':String(value);label.appendChild(input);parent.appendChild(label);return input;
      }
      function editPreparationItem(item,complete){
        if(preparationState.saving)return;
        if(preparationState.itemDraft&&!confirm('작성 중인 준비물 입력을 닫을까?'))return;
        var draft=Object.assign({id:'',version:null,content:'',prepState:'planned',method:'unknown',timing:'unknown',priority:'unknown',targetQuantity:null,targetMax:null,currentQuantity:null,unit:'개',price:'',spent:'',remainingPrice:'',costScope:'preparation',category:'',owner:'',memo:'',model:'',purchaseUrl:'',checkNotes:'',verification:'not_required',needWeek:0},item||{});
        if(complete&&!preparationReady(draft)&&draft.verification!=='pending'){draft.prepState='ready';if(draft.targetQuantity!=null)draft.currentQuantity=draft.targetQuantity;}
        draft.requestId=uuid();preparationState.itemDraft=draft;renderPreparationItemEditor();
        var editor=el('prepItemEditor');if(editor.scrollIntoView)editor.scrollIntoView({block:'start',behavior:'smooth'});var first=editor.querySelector('input');if(first)first.focus();
      }
      function renderPreparationItemEditor(){
        var d=preparationState.itemDraft,root=el('prepItemEditor');root.innerHTML='';if(!d)return;
        var title=document.createElement('h3');title.textContent=d.id?'준비물 정보 수정':'새 준비물';root.appendChild(title);
        var form=document.createElement('fieldset');form.className='prep-fields';form.disabled=preparationState.saving;var controls={};
        function add(parent,key,label,options,type){var input=preparationField(parent,key,label,d[key],options,type);controls[key]=input;input.addEventListener('input',function(){d[key]=input.value;});input.addEventListener('change',function(){d[key]=input.value;});return input;}
        add(form,'content','물품명');add(form,'prepState','준비 상태',PREP_STATES);add(form,'method','확보 방식',PREP_METHODS);add(form,'timing','필요 시점',PREP_TIMINGS);add(form,'priority','중요도',PREP_PRIORITIES);add(form,'targetQuantity','목표 최소 수량 · 빈칸은 미확인',null,'number');add(form,'targetMax','목표 최대 수량 · 범위일 때만',null,'number');add(form,'currentQuantity','현재 수량 · 빈칸은 미확인',null,'number');add(form,'unit','수량 단위 · 개/장/팩/벌');
        var detailsBox=document.createElement('details');detailsBox.className='chk-edit-details';var caption=document.createElement('summary');caption.textContent='자세히 · 비용·제품·검수·담당·출처';detailsBox.appendChild(caption);var extra=document.createElement('div');extra.className='prep-fields';
        var categories={'':'분류 미정'};PREP_CATEGORIES.concat([d.category||'']).filter(Boolean).forEach(function(c){categories[c]=c;});
        add(extra,'category','카테고리',categories);add(extra,'owner','담당',{'':'미정','엄마':'엄마','아빠':'아빠','함께':'함께'});add(extra,'price','예상가격 · 항목 전체 원',null,'number');add(extra,'remainingPrice','부족분 예상 비용 · 일부 확보 시',null,'number');add(extra,'spent','실제 지출 · 무료는 0, 미확인은 빈칸',null,'number');add(extra,'costScope','지출 구분',{preparation:'이번 출산 준비 지출',existing:'기존 보유 · 이번 지출에서 제외'});add(extra,'model','상품·모델');add(extra,'purchaseUrl','구매 링크');add(extra,'verification','사용 적합성·안전 확인',{not_required:'추가 확인 항목 없음',pending:'확인 필요',verified:'확인 완료'});add(extra,'needWeek','필요 주차 · 미정은 0',null,'number');add(extra,'checkNotes','제품 호환·검수할 사항',null,'textarea');add(extra,'memo','비고',null,'textarea');detailsBox.appendChild(extra);
        var sources=document.createElement('p');sources.className='prep-source';sources.textContent='출처: '+((d.provenance||[]).map(function(p){return (p.label||'원본')+(p.date?' · '+p.date:'');}).join(' / ')||'사용자 입력')+(d.updatedAt?'\n최근 수정 '+d.updatedAt.slice(0,10):'');detailsBox.appendChild(sources);root.appendChild(form);form.appendChild(detailsBox);
        var status=document.createElement('p');status.className='upload-note';status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.textContent=d.error||'실제 보유·수령 상태로 기록해 줘. 저장 전까지 기존 값은 유지돼.';root.appendChild(status);
        var actions=document.createElement('div');actions.className='prep-form-actions';
        var cancel=document.createElement('button');cancel.type='button';cancel.className='secondary';cancel.textContent='취소';cancel.disabled=preparationState.saving;cancel.addEventListener('click',function(){preparationState.itemDraft=null;root.innerHTML='';});actions.appendChild(cancel);
        if(d.id){var del=document.createElement('button');del.type='button';del.className='secondary';del.textContent='삭제';del.disabled=preparationState.saving;del.addEventListener('click',function(){deletePreparationItem(d);});actions.appendChild(del);}
        if(d.conflict){var latest=document.createElement('button');latest.type='button';latest.className='secondary';latest.textContent='최신 값과 비교';latest.addEventListener('click',function(){comparePreparationItem(d,status);});actions.appendChild(latest);}
        var save=document.createElement('button');save.type='button';save.className='save';save.textContent=preparationState.saving?'저장 중…':'저장';save.disabled=preparationState.saving;save.addEventListener('click',savePreparationItem);actions.appendChild(save);root.appendChild(actions);
      }
      function comparePreparationItem(d,status){
        loadChecklist().then(function(ok){if(!ok||preparationState.itemDraft!==d)return;var latest=preparationState.items.filter(function(i){return i.id===d.id;})[0];if(!latest){status.textContent='다른 기기에서 삭제한 항목이야. 입력은 보관 중이야.';return;}
          var changed=['content','prepState','method','timing','priority','targetQuantity','targetMax','currentQuantity','unit','price','spent','remainingPrice','memo','verification','checkNotes','category','owner','model','purchaseUrl','costScope','needWeek'].filter(function(k){return String(latest[k]==null?'':latest[k])!==String(d[k]==null?'':d[k]);});
          var lines=changed.map(function(k){return (PREP_FIELD_LABELS[k]||'항목')+': 서버 '+preparationDisplayValue(k,latest[k])+' / 내 입력 '+preparationDisplayValue(k,d[k]);}).join('\n');
          status.textContent='서버: '+latest.content+' · '+(PREP_STATES[latest.prepState]||'미확인')+' · '+checklistSubtitle(latest)+'\n'+lines+'\n내 입력을 유지하고 있어. 비교 후 다시 저장하려면 아래 버튼을 눌러 줘.';
          var b=document.createElement('button');b.type='button';b.className='secondary';b.textContent='비교했어 · 내 입력으로 다시 저장 준비';b.addEventListener('click',function(){d.version=latest.version;d.conflict=false;d.error='최신 값과 비교했어. 저장을 눌러 반영해 줘.';renderPreparationItemEditor();});status.parentNode.appendChild(b);
        });
      }
      function savePreparationItem(){
        var token=state.session&&state.session.token,d=preparationState.itemDraft;if(!d||!token||token!==preparationState.owner||preparationState.saving)return Promise.resolve(false);
        if(d.conflict){toast('최신 값과 먼저 비교해 줘. 입력은 유지했어.');return Promise.resolve(false);}
        var payload={};['content','prepState','method','timing','priority','targetQuantity','targetMax','currentQuantity','unit','price','spent','remainingPrice','costScope','category','owner','memo','model','purchaseUrl','checkNotes','verification','needWeek'].forEach(function(k){payload[k]=d[k];});
        var invalidCount=['targetQuantity','targetMax','currentQuantity','needWeek'].some(function(k){var v=payload[k];return v!=null&&String(v)!==''&&(!/^\d+$/.test(String(v))||Number(v)>9999);});
        if(invalidCount){d.error='수량과 주차는 0 이상의 정수로 적어 줘. 수량을 모르면 빈칸으로 남겨 둬.';renderPreparationItemEditor();return Promise.resolve(false);}
        ['targetQuantity','targetMax','currentQuantity'].forEach(function(k){payload[k]=payload[k]===''||payload[k]==null?null:Number(payload[k]);});payload.quantity=payload.targetQuantity||0;payload.needWeek=Number(payload.needWeek)||0;
        preparationState.saving=true;renderPreparationItemEditor();
        return callApi('apiSaveChecklistItemV500',[token,d.id,payload,d.version,d.requestId],20000).then(unwrap).then(function(){
          if(!state.session||state.session.token!==token)return false;preparationState.saving=false;preparationState.itemDraft=null;el('prepItemEditor').innerHTML='';toast('준비물 정보를 저장했어 🌱');return loadChecklist();
        }).catch(function(error){if(state.session&&state.session.token===token){preparationState.saving=false;d.error=errorMessage(error);d.conflict=error&&error.code==='CONFLICT';renderPreparationItemEditor();}return false;});
      }
      function deletePreparationItem(d){
        if(preparationState.saving||!confirm(d.content+' 항목을 삭제할까? 되돌릴 수 있어.'))return;
        var token=preparationOwner();preparationState.saving=true;renderPreparationItemEditor();
        callApi('apiDeleteChecklistItemV320',[token,d.id,d.version],20000).then(unwrap).then(function(result){
          if(!state.session||state.session.token!==token)return;preparationState.saving=false;preparationState.itemDraft=null;el('prepItemEditor').innerHTML='';loadChecklist();toast('준비물을 삭제했어.','되돌리기',function(){if(!state.session||state.session.token!==token)return;callApi('apiRestoreChecklistItemV450',[token,d.id,result.version],16000).then(unwrap).then(loadChecklist).catch(function(e){toast(errorMessage(e));});});
        }).catch(function(error){if(state.session&&state.session.token===token){preparationState.saving=false;d.error=errorMessage(error);d.conflict=error&&error.code==='CONFLICT';renderPreparationItemEditor();}});
      }
      function addChecklistItem(){var name=String(el('checkItemInput').value||'').trim();if(!name){toast('준비물 이름을 적어 줘.');return;}editPreparationItem({content:name});el('checkItemInput').value='';}
      function preparationServiceDates(start,days,excluded){
        if(!/^\d{4}-\d{2}-\d{2}$/.test(start||'')||!Number.isInteger(Number(days))||Number(days)<1||Number(days)>60)return [];
        var d=new Date(start+'T12:00:00Z'),out=[];if(!isFinite(d.getTime())||d.toISOString().slice(0,10)!==start)return [];
        var skips=excluded||[];for(var n=0;n<365&&out.length<Number(days);n++){var key=d.toISOString().slice(0,10),day=d.getUTCDay();if(day!==0&&day!==6&&skips.indexOf(key)<0)out.push(key);d.setUTCDate(d.getUTCDate()+1);}return out;
      }
      function renderPreparationServiceCalendar(data){
        var root=el('prepServiceCalendar');root.innerHTML='';var dates=preparationServiceDates(data.serviceStart,Number(data.serviceDays),(data.excludedDates||[]));var p=document.createElement('p');p.textContent=dates.length?'시작일 '+(data.dateCertainty==='confirmed'?'확정':'예상')+' · '+dates.length+'회 이용 시 종료 예상 '+dates[dates.length-1]:'퇴원·조리원 퇴소 후 실제 서비스 시작일을 정하면 예상 이용일을 계산해.';root.appendChild(p);
        var note=document.createElement('p');note.className='upload-note';note.textContent='주말과 입력한 휴무일을 제외한 예상이야. 공휴일·업체 휴무·중단일을 확인해 휴무일에 추가해 줘. 확정 일정은 업체 계약이 기준이야.';root.appendChild(note);
        if(dates.length){var list=document.createElement('div');list.className='prep-date-list';dates.forEach(function(date,i){var span=document.createElement('span');span.textContent=(i+1)+'회 '+date.slice(5);list.appendChild(span);});root.appendChild(list);}
      }
      function renderPreparationPlan(){
        var plan=preparationState.plan;if(!plan){text(el('prepPlanStatus'),'계획을 불러오는 중…');return;}
        text(el('prepPlanStatus'),'상담 답변·계약 확정과 참고 정보를 구분해 기록해.');
        renderPreparationTasks();renderPreparationServiceCalendar(preparationState.planDraft||plan.data);renderPreparationEvidence();if(!preparationState.planDraft)renderPreparationCareForm();
      }
      function renderPreparationTasks(){
        var plan=preparationState.plan;if(!plan)return;var tasks=plan.data.tasks||[],root=el('prepTasks');root.innerHTML='';var completed=tasks.filter(function(t){return t.done;}).length;text(el('prepTaskSummary'),'할 일 '+completed+'/'+tasks.length+' 완료 · 미확인·조건부 일정은 확정 전 다시 확인해');
        tasks.slice().sort(function(a,b){return Number(a.done)-Number(b.done)||String(a.dueDate||'9999').localeCompare(String(b.dueDate||'9999'));}).forEach(function(task){
          var row=document.createElement('div');row.className='prep-task';var label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.checked=!!task.done;input.disabled=preparationState.saving;input.addEventListener('change',function(){var tasks=plan.data.tasks.map(function(t){return Object.assign({},t,t.id===task.id?{done:input.checked}:{});});input.disabled=true;savePreparationPlanPatch({tasks:tasks},plan.version).then(function(ok){if(!ok){input.checked=!!task.done;input.disabled=false;}});});label.appendChild(input);var title=document.createElement('span');title.textContent=task.title;label.appendChild(title);row.appendChild(label);
          var p=document.createElement('p');p.className='prep-sub';p.textContent=[task.dueDate||'날짜 미정',task.certainty==='confirmed'?'확정':task.certainty==='conditional'?'조건부':'확인 필요',task.owner,task.note].filter(Boolean).join(' · ');row.appendChild(p);
          var edit=document.createElement('button');edit.type='button';edit.className='secondary';edit.textContent='일정·내용 수정';edit.disabled=preparationState.saving;edit.addEventListener('click',function(){editPreparationTask(task);});row.appendChild(edit);root.appendChild(row);
        });
      }
      function editPreparationTask(task){
        if(preparationState.saving||!preparationState.plan)return;var d=Object.assign({id:uuid(),title:'',done:false,dueDate:'',certainty:'unverified',owner:'함께',note:'',sourceUrl:'',baseVersion:preparationState.plan.version},task||{}),root=el('prepTaskEditor');preparationState.taskDraft=d;root.innerHTML='';
        var fields=document.createElement('fieldset');fields.className='prep-fields';[['title','할 일'],['dueDate','목표 날짜',null,'date'],['certainty','일정 확실성',{confirmed:'확정',conditional:'조건부',unverified:'확인 필요'}],['owner','담당',{'엄마':'엄마','아빠':'아빠','함께':'함께'}],['note','메모',null,'textarea']].forEach(function(f){var input=preparationField(fields,f[0],f[1],d[f[0]],f[2],f[3]);input.addEventListener('input',function(){d[f[0]]=input.value;});});root.appendChild(fields);
        var status=document.createElement('p');status.className='upload-note';status.setAttribute('role','status');root.appendChild(status);var actions=document.createElement('div');actions.className='prep-form-actions';var cancel=document.createElement('button');cancel.type='button';cancel.className='secondary';cancel.textContent='취소';cancel.addEventListener('click',function(){preparationState.taskDraft=null;root.innerHTML='';});actions.appendChild(cancel);
        var save=document.createElement('button');save.type='button';save.className='save';save.textContent='할 일 저장';save.addEventListener('click',function(){if(preparationState.saving||d.conflict)return;var plan=preparationState.plan,tasks=plan.data.tasks.slice(),index=tasks.findIndex(function(t){return t.id===d.id;});if(index<0)tasks.push(d);else tasks[index]=d;fields.disabled=true;save.disabled=true;cancel.disabled=true;savePreparationPlanPatch({tasks:tasks},d.baseVersion).then(function(ok){if(ok){preparationState.taskDraft=null;root.innerHTML='';}else{fields.disabled=false;save.disabled=false;cancel.disabled=false;status.textContent='저장하지 못했어. 입력은 유지했어.';if(preparationState.lastPlanErrorCode==='CONFLICT'){d.conflict=true;save.disabled=true;loadPreparationPlan().then(function(loaded){if(!loaded)return;var latestPlan=preparationState.plan,latest=(latestPlan.data.tasks||[]).filter(function(t){return t.id===d.id;})[0];status.textContent='다른 기기에서 바뀌었어. 최신 값: '+(latest?latest.title+' · '+(latest.dueDate||'날짜 미정')+' · '+(latest.note||''):'새 할 일 · 다른 계획 변경')+'\n내 입력을 유지하고 있어.';var compare=document.createElement('button');compare.type='button';compare.className='secondary';compare.textContent='비교했어 · 내 입력으로 저장 준비';compare.addEventListener('click',function(){d.baseVersion=latestPlan.version;d.conflict=false;save.disabled=false;compare.disabled=true;});actions.appendChild(compare);});}}});});actions.appendChild(save);root.appendChild(actions);
      }
      function renderPreparationCareForm(){
        var plan=preparationState.plan;if(!plan)return;var d=preparationState.planDraft||Object.assign({},plan.data,{version:plan.version}),root=el('prepCareForm');preparationState.planDraft=d;root.innerHTML='';
        var fieldset=document.createElement('fieldset');fieldset.className='prep-fields';fieldset.disabled=preparationState.saving;
        function add(parent,key,label,options,type){var v=key==='excludedDates'?(d[key]||[]).join('\n'):d[key];var input=preparationField(parent,key,label,v,options,type);input.addEventListener('input',function(){d[key]=key==='excludedDates'?input.value.split(/\s+/).filter(Boolean):input.value;d.dirty=true;if(['serviceStart','serviceDays','excludedDates','dateCertainty'].indexOf(key)>=0)renderPreparationServiceCalendar(d);});return input;}
        add(fieldset,'provider','상담 업체');add(fieldset,'preferredCarer','희망 관리사 · 배정 확정과 별개');add(fieldset,'bookingStatus','예약·계약 상태',{considering:'검토 중',contacting:'상담 중',quoted:'조건·견적 수령',deposit_paid:'예약금 납부',contracted:'계약 확인',assigned:'관리사 배정 확인',active:'이용 중',finished:'이용 종료'});add(fieldset,'subsidyStatus','정부지원 진행',{not_applied:'신청 전',preparing:'서류 준비',applied:'신청 완료',approved:'선정 완료',rejected:'미선정'});
        var details=document.createElement('details');details.className='prep-details';var caption=document.createElement('summary');caption.textContent='일정·비용·계약 상세 입력';details.appendChild(caption);var extra=document.createElement('div');extra.className='prep-fields';
        add(extra,'backupCarers','예비 관리사');add(extra,'counselDate','실제 상담일',null,'date');add(extra,'careCenterChoice','조리원 계획',{unknown:'미정',none:'이용 안 함',two_weeks:'2주 검토',three_weeks:'3주 검토',other:'그 외 · 메모에 기록'});add(extra,'serviceStart','서비스 시작일',null,'date');add(extra,'dateCertainty','시작일 확실성',{estimated:'예상',confirmed:'업체와 확정'});add(extra,'serviceDays','서비스 이용일 수',null,'number');add(extra,'excludedDates','공휴일·업체 휴무일 · YYYY-MM-DD 한 줄씩',null,'textarea');add(extra,'budgetTarget','확보 목표 예산 · 확정 가격 아님',null,'number');add(extra,'deposit','실제 납부한 예약금 · 미확인은 빈칸',null,'number');add(extra,'quotedTotal','확정 견적 본인부담 총액',null,'number');add(extra,'extraCost','총액 외 추가금',null,'number');add(extra,'depositIncluded','예약금이 본인부담 총액에 포함되나요?',{unknown:'아직 확인 전',yes:'포함됨',no:'별도 비용'});add(extra,'contractNotes','상담 답변·지명·환불·추가금·대여·계약 근거',null,'textarea');details.appendChild(extra);fieldset.appendChild(details);root.appendChild(fieldset);
        var budget=document.createElement('p');budget.className='prep-budget';var total=d.quotedTotal===''||d.quotedTotal==null?null:Number(d.quotedTotal),deposit=d.deposit===''||d.deposit==null?null:Number(d.deposit);budget.textContent='확보 목표 '+checklistMoney(d.budgetTarget)+'원 · 2026년 참고 본인부담 '+checklistMoney(plan.data.referenceCost)+'원\n2027년 확정 견적 '+(total==null?'미확인':checklistMoney(total)+'원')+' · 납부 예약금 '+(deposit==null?'미확인':checklistMoney(deposit)+'원')+'\n예약금 포함 여부를 확인한 뒤 남은 납부액을 계산해. 정부지원·첫만남이용권을 같은 비용에서 두 번 차감하지 않아.';
        if(total!=null&&deposit!=null&&d.depositIncluded==='yes')budget.textContent+='\n남은 본인부담 '+checklistMoney(Math.max(0,total-deposit))+'원'+(d.extraCost!==''&&d.extraCost!=null?' · 별도 추가금 '+checklistMoney(d.extraCost)+'원':' · 추가금 미확인');root.appendChild(budget);
        var status=document.createElement('p');status.className='upload-note';status.setAttribute('role','status');status.textContent=d.error||'입력은 현재 화면에 보관돼. 저장을 눌러 두 사람에게 반영해 줘.';root.appendChild(status);
        var actions=document.createElement('div');actions.className='prep-form-actions';
        if(d.conflict){var compare=document.createElement('button');compare.type='button';compare.className='secondary';compare.textContent='최신 계획과 비교';compare.addEventListener('click',function(){loadPreparationPlan().then(function(ok){if(!ok)return;var p=preparationState.plan;var differences=Object.keys(d).filter(function(k){return ['version','dirty','error','conflict','sources','reviews','contractQuestions','referenceCost','referenceYear','tasks','decisions'].indexOf(k)<0&&JSON.stringify(p.data[k])!==JSON.stringify(d[k]);}).map(function(k){return (PREP_FIELD_LABELS[k]||'항목')+': 서버 '+preparationDisplayValue(k,p.data[k])+' / 내 입력 '+preparationDisplayValue(k,d[k]);});status.textContent='최신 희망 관리사 '+p.data.preferredCarer+'\n'+differences.join('\n');var accept=document.createElement('button');accept.type='button';accept.className='secondary';accept.textContent='비교했어 · 내 입력 유지';accept.addEventListener('click',function(){d.version=p.version;d.conflict=false;d.error='비교한 내용을 저장할 수 있어.';renderPreparationCareForm();});actions.appendChild(accept);});});actions.appendChild(compare);}
        var save=document.createElement('button');save.type='button';save.className='save';save.textContent=preparationState.saving?'저장 중…':'상담·계획 저장';save.disabled=preparationState.saving;save.addEventListener('click',function(){if(d.conflict){toast('최신 계획과 먼저 비교해 줘.');return;}savePreparationPlanPatch(d,d.version,true);});actions.appendChild(save);var cancel=document.createElement('button');cancel.type='button';cancel.className='secondary';cancel.textContent='입력 취소';cancel.disabled=preparationState.saving;cancel.addEventListener('click',function(){if(d.dirty&&!confirm('저장 전 입력을 취소할까?'))return;preparationState.planDraft=null;renderPreparationCareForm();});actions.appendChild(cancel);root.appendChild(actions);
      }
      function savePreparationPlanPatch(patch,version,fromForm){
        var token=state.session&&state.session.token;if(!token||token!==preparationState.owner||preparationState.saving)return Promise.resolve(false);preparationState.saving=true;preparationState.lastPlanErrorCode='';
        if(fromForm){var formPatch={};['provider','preferredCarer','backupCarers','bookingStatus','subsidyStatus','careCenterChoice','serviceStart','serviceDays','excludedDates','dateCertainty','deposit','quotedTotal','extraCost','depositIncluded','budgetTarget','contractNotes','counselDate'].forEach(function(k){if(Object.prototype.hasOwnProperty.call(patch,k))formPatch[k]=patch[k];});patch=formPatch;}
        if(fromForm)renderPreparationCareForm();
        return callApi('apiSavePreparationPlanV500',[token,patch,version],20000).then(unwrap).then(function(result){
          if(!state.session||state.session.token!==token)return false;preparationState.saving=false;preparationState.plan=result.plan;
          if(fromForm)preparationState.planDraft=null;else if(preparationState.planDraft&&!preparationState.planDraft.dirty)preparationState.planDraft=null;
          renderPreparationPlan();toast('출산 준비 계획을 저장했어 🌱');return true;
        }).catch(function(error){if(state.session&&state.session.token===token){preparationState.saving=false;preparationState.lastPlanErrorCode=error&&error.code||'';text(el('prepPlanStatus'),errorMessage(error));if(fromForm&&preparationState.planDraft){preparationState.planDraft.error=errorMessage(error);preparationState.planDraft.conflict=error&&error.code==='CONFLICT';renderPreparationCareForm();}else if(error&&error.code==='CONFLICT')loadPreparationPlan();}return false;});
      }
      function preparationLink(parent,title,url){
        if(!/^https?:\/\//i.test(String(url||'')))return;var a=document.createElement('a');a.textContent=title;a.href=url;a.target='_blank';a.rel='noopener noreferrer';parent.appendChild(a);
      }
      function renderPreparationEvidence(){
        var plan=preparationState.plan;if(!plan)return;var root=el('prepEvidence');root.innerHTML='';var data=plan.data;
        var d=document.createElement('details');d.className='prep-details';var title=document.createElement('summary');title.textContent='상담 전에 확인할 질문과 문자';d.appendChild(title);
        (data.contractQuestions||[]).forEach(function(q){var p=document.createElement('p');p.textContent='□ '+q;d.appendChild(p);});
        var message=document.createElement('textarea');message.rows=8;message.readOnly=true;message.value=data.consultationText||'';message.setAttribute('aria-label','상담 문의 문자 초안');d.appendChild(message);var copy=document.createElement('button');copy.type='button';copy.className='secondary';copy.textContent='문의 문자 복사';copy.addEventListener('click',function(){if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(message.value).then(function(){toast('문자를 복사했어.');}).catch(function(){message.focus();message.select();toast('문자를 선택했어. 직접 복사해 줘.');});else{message.focus();message.select();toast('문자를 선택했어. 직접 복사해 줘.');}});d.appendChild(copy);root.appendChild(d);
        var refs=document.createElement('details');refs.className='prep-details';var summary=document.createElement('summary');summary.textContent='출처·확정사항·후기 검증 상태';refs.appendChild(summary);
        (data.decisions||[]).forEach(function(t){var p=document.createElement('p');p.textContent=t;refs.appendChild(p);});
        (data.sources||[]).forEach(function(s){var p=document.createElement('p');preparationLink(p,s.label,s.url);refs.appendChild(p);});
        var note=document.createElement('p');note.textContent='후기는 계약 조건이 아니야. 제공 본문 검수 1건과 원문 독립 검증 미완료 15건을 구분해. 관리사 순위는 상담 순서이며 배정·품질 보장이 아니야.';refs.appendChild(note);
        (data.reviews||[]).forEach(function(r){var p=document.createElement('p');preparationLink(p,r.label+' · '+(r.verified?'제공 본문 검수':'원문 미검증'),r.url);refs.appendChild(p);});root.appendChild(refs);
      }
