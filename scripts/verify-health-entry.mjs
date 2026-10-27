import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {test} from 'node:test';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const names=['resetHealthContext','healthFormSnapshot','healthLogSnapshot','healthFormSignature','rememberHealthDraft','healthInputChanged','changeHealthDate','shiftHealthDate','healthToday','setHealthSaving','renderHealthFormState','fillHealthFormForDate','loadHealthLogs','saveHealthLog'];
function fixture(){
  const nodes={};
  for(const id of ['healthDate','healthWeight','healthSys','healthDia','healthMemo','healthStartWeight','healthHeight','healthEntrySummary','healthSaveStatus','healthNextDay','healthRetry','saveHealth','saveHealthBottom']){
    const classes=new Set();nodes[id]={value:'',textContent:'',disabled:false,classList:{toggle(name,on){if(on)classes.add(name);else classes.delete(name);},contains:name=>classes.has(name)}};
  }
  const state={session:{token:'a'}};
  const healthState={owner:'a',date:'',drafts:{},savedDates:{},logs:[],picked:[],baseline:'',loading:false,saving:false,loadSeq:0,loaded:false,loadError:'',saveError:''};
  const requests=[],toasts=[];
  const context=vm.createContext({state,healthState,Date,Promise,JSON,Number,String,Array,isFinite,
    el:id=>nodes[id],today:()=> '2026-10-27',text:(node,value)=>{node.textContent=value;},
    document:{querySelectorAll:()=>Object.values(nodes)},renderSupplementPills(){},renderHealthCharts(){},renderHealthAlert(){},
    errorMessage:error=>error.message,toast:message=>toasts.push(message),unwrap:response=>response,
    callApi(name,args){let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});requests.push({name,args,resolve,reject});return promise;}
  });
  for(const name of names){const source=html.match(new RegExp('^      function '+name+'\\([^]*?^      }','m'))?.[0];assert.ok(source,name);vm.runInContext(source,context);}
  nodes.healthDate.value='2026-10-27';context.fillHealthFormForDate();
  return {c:context,state,healthState,nodes,requests,toasts};
}
test('date navigation preserves independent unsaved forms and never carries values to an empty day',()=>{
  const f=fixture();f.healthState.loaded=true;
  f.nodes.healthWeight.value='58.4';f.nodes.healthMemo.value='오늘 입력';f.healthState.picked=['철분'];f.c.healthInputChanged();
  f.c.shiftHealthDate(-1);assert.equal(f.nodes.healthDate.value,'2026-10-26');assert.equal(f.nodes.healthWeight.value,'');assert.equal(f.healthState.picked.length,0);
  f.nodes.healthMemo.value='어제 입력';f.c.healthInputChanged();f.c.healthToday();
  assert.equal(f.nodes.healthMemo.value,'오늘 입력');assert.equal(f.nodes.healthWeight.value,'58.4');assert.deepEqual(Array.from(f.healthState.picked),['철분']);
  f.c.shiftHealthDate(-1);assert.equal(f.nodes.healthMemo.value,'어제 입력');assert.equal(f.healthState.logs.length,0);
  assert.match(f.nodes.healthSaveStatus.textContent,/아직 저장하지 않았어/);
});
test('calendar navigation crosses months/leap days and stops the forward shortcut after today',()=>{
  const f=fixture();f.nodes.healthDate.value='2024-03-01';f.c.changeHealthDate();f.c.shiftHealthDate(-1);assert.equal(f.nodes.healthDate.value,'2024-02-29');
  f.nodes.healthDate.value='2026-01-01';f.c.changeHealthDate();f.c.shiftHealthDate(-1);assert.equal(f.nodes.healthDate.value,'2025-12-31');
  f.c.healthToday();f.c.shiftHealthDate(1);assert.equal(f.nodes.healthDate.value,'2026-10-27');assert.equal(f.nodes.healthNextDay.disabled,true);
});
test('a delayed load updates server baselines without overwriting what the user just typed',async()=>{
  const f=fixture();const pending=f.c.loadHealthLogs();
  f.nodes.healthWeight.value='60.1';f.c.healthInputChanged();
  f.requests[0].resolve({logs:[{date:'2026-10-27',weight:59.5,supplements:[]} ]});assert.equal(await pending,true);
  assert.equal(f.nodes.healthWeight.value,'60.1');assert.equal(f.healthState.logs[0].weight,59.5);assert.match(f.nodes.healthSaveStatus.textContent,/아직 저장하지 않았어/);
});
test('typing a memo before loading finishes preserves unedited server weight and blood pressure',async()=>{
  const f=fixture();const pending=f.c.loadHealthLogs();f.nodes.healthMemo.value='메모만 먼저 입력';f.c.healthInputChanged();
  f.requests[0].resolve({logs:[{date:'2026-10-27',weight:58.4,systolic:112,diastolic:70,memo:'이전 메모',supplements:['철분']}]});await pending;
  assert.equal(f.nodes.healthMemo.value,'메모만 먼저 입력');assert.equal(f.nodes.healthWeight.value,'58.4');assert.equal(f.nodes.healthSys.value,'112');assert.equal(f.nodes.healthDia.value,'70');assert.deepEqual(Array.from(f.healthState.picked),['철분']);
  const save=f.c.saveHealthLog();assert.equal(f.requests[1].args[1].weight,'58.4');f.requests[1].resolve({});await save;
});
test('intentionally clearing an existing field remains cleared after a fresh read',async()=>{
  const f=fixture();f.healthState.logs=[{date:'2026-10-27',weight:58.4,memo:'기존 메모'}];f.c.fillHealthFormForDate();
  f.nodes.healthWeight.value='';f.c.healthInputChanged();const pending=f.c.loadHealthLogs();
  f.requests[0].resolve({logs:[{date:'2026-10-27',weight:58.4,memo:'서버의 새 메모'}]});await pending;
  assert.equal(f.nodes.healthWeight.value,'');assert.equal(f.nodes.healthMemo.value,'서버의 새 메모');
});
test('older loads and responses from a previous account cannot replace the current health data',async()=>{
  const f=fixture();const old=f.c.loadHealthLogs(),fresh=f.c.loadHealthLogs();
  f.requests[1].resolve({logs:[{date:'2026-10-27',weight:60}]});await fresh;
  f.requests[0].resolve({logs:[{date:'2026-10-27',weight:40}]});await old;assert.equal(f.nodes.healthWeight.value,'60');
  const previous=f.c.loadHealthLogs();f.state.session={token:'b'};f.c.resetHealthContext();
  f.requests[2].resolve({logs:[{date:'2026-10-27',weight:42}]});await previous;
  assert.equal(f.healthState.logs.length,0);assert.equal(f.nodes.healthWeight.value,'');assert.equal(Object.keys(f.healthState.drafts).length,0);
});
test('failed initial loading is explicit and does not permit overwriting an unconfirmed existing record',async()=>{
  const f=fixture();const pending=f.c.loadHealthLogs();f.requests[0].reject(new Error('offline'));assert.equal(await pending,false);
  assert.match(f.nodes.healthSaveStatus.textContent,/기존 기록을 확인하지 못했어/);
  f.nodes.healthMemo.value='입력 유지';f.c.healthInputChanged();assert.equal(await f.c.saveHealthLog(),false);
  assert.equal(f.requests.length,1);assert.equal(f.nodes.healthMemo.value,'입력 유지');
});
test('successful saving locks both save controls/date input, deduplicates requests, and marks only the saved date',async()=>{
  const f=fixture();f.healthState.loaded=true;f.nodes.healthWeight.value='58.4';f.nodes.healthSys.value='112';f.nodes.healthDia.value='70';f.c.healthInputChanged();
  const pending=f.c.saveHealthLog();assert.equal(f.nodes.saveHealth.disabled,true);assert.equal(f.nodes.saveHealthBottom.disabled,true);assert.equal(f.nodes.healthDate.disabled,true);
  f.c.shiftHealthDate(-1);assert.equal(f.nodes.healthDate.value,'2026-10-27');await f.c.saveHealthLog();await f.c.loadHealthLogs();assert.equal(f.requests.length,1);
  f.requests[0].resolve({});assert.equal(await pending,true);
  assert.equal(f.nodes.saveHealth.disabled,false);assert.equal(f.nodes.healthDate.disabled,false);assert.equal(f.healthState.logs[0].weight,58.4);
  assert.equal(f.nodes.healthSaveStatus.textContent,'저장됨 ✓');assert.equal(Object.keys(f.healthState.drafts).length,0);
  f.c.shiftHealthDate(-1);assert.doesNotMatch(f.nodes.healthSaveStatus.textContent,/저장됨/);
});
test('save failures keep the exact draft and allow retry without claiming success',async()=>{
  const f=fixture();f.healthState.loaded=true;f.nodes.healthMemo.value='다시 저장할 메모';f.c.healthInputChanged();
  const pending=f.c.saveHealthLog();f.requests[0].reject(new Error('network failed'));assert.equal(await pending,false);
  assert.equal(f.nodes.healthMemo.value,'다시 저장할 메모');assert.match(f.nodes.healthSaveStatus.textContent,/저장하지 못했어/);assert.equal(f.nodes.saveHealthBottom.disabled,false);
  assert.equal(f.healthState.logs.length,0);assert.equal(Object.keys(f.healthState.savedDates).length,0);
  const retry=f.c.saveHealthLog();f.requests[1].resolve({});assert.equal(await retry,true);assert.equal(f.nodes.healthSaveStatus.textContent,'저장됨 ✓');
});
test('save responses after an account switch cannot restore former health values',async()=>{
  const f=fixture();f.healthState.loaded=true;f.nodes.healthMemo.value='former account';const pending=f.c.saveHealthLog();
  f.state.session={token:'b'};f.c.resetHealthContext();f.requests[0].resolve({});await pending;
  assert.equal(f.healthState.logs.length,0);assert.equal(f.nodes.healthMemo.value,'');assert.equal(Object.keys(f.healthState.savedDates).length,0);
});
test('entry summary describes input separately from actual server-save status',()=>{
  const f=fixture();f.nodes.healthSys.value='112';f.c.healthInputChanged();
  assert.match(f.nodes.healthEntrySummary.textContent,/혈압 한쪽만 입력/);assert.match(f.nodes.healthSaveStatus.textContent,/아직 저장하지 않았어/);
  f.nodes.healthSys.value='';f.c.healthInputChanged();assert.equal(Object.keys(f.healthState.drafts).length,0);
});
test('trends and checklist extra fields default to collapsed, and checklist failures retain editor inputs',()=>{
  assert.match(html,/<details id="healthTrends" class="health-trends">/);
  assert.doesNotMatch(html,/<details id="healthTrends"[^>]*\bopen\b/);
  assert.match(html,/detailsBox\.className='chk-edit-details'/);
  assert.match(html,/extra\.appendChild\(field\('분류',catSelect\)\)/);
  const edit=html.slice(html.indexOf('          function beginEdit(){'),html.indexOf("          edit.addEventListener('click',beginEdit)"));
  assert.ok(edit.indexOf('item.content=next')>edit.indexOf('.then(unwrap).then(function()'));
  const failure=edit.slice(edit.indexOf('.catch(function(error)'),edit.indexOf("            save.addEventListener('click',commit)"));
  assert.doesNotMatch(failure,/renderChecklist\(items\)|restore\(\)/);assert.match(failure,/입력은 그대로야/);
  assert.match(edit,/!e\.isComposing&&e\.keyCode!==229/);
  assert.doesNotMatch(edit,/toast\('준비물 정보를 저장했어 🍼'\);loadChecklist\(\)/);
});
