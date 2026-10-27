import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {test} from 'node:test';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const checkup=html.slice(html.indexOf('      // 검진 일정과 질문'),html.indexOf('      // --- 기록을 책으로'));
const schedule=html.match(/^      function setCheckupAction\([^]*?^      }/m)?.[0];
function node(tag='div'){
  const classes=new Set();
  return {tag,value:'',textContent:'',innerHTML:'',disabled:false,open:false,children:[],listeners:{},
    classList:{toggle(name,on){if(on)classes.add(name);else classes.delete(name);},contains:name=>classes.has(name)},
    appendChild(child){this.children.push(child);},addEventListener(name,fn){this.listeners[name]=fn;},focus(){this.focused=true;},
    querySelector(){return null;},querySelectorAll(tag){return this.children.flatMap(child=>[...(child.tag===tag?[child]:[]),...child.querySelectorAll(tag)]);}};
}
function fixture(){
  const nodes={},el=id=>nodes[id]||=(node());
  const requests=[],toasts=[],confirmations=[];
  const state={session:{token:'a'},checkupBusy:false,home:{app:{pregnancy:{valid:true,checkupDate:'2026-10-30',checkupDday:3}}}};
  let uid=0;
  const c=vm.createContext({state,el,Date,JSON,String,Object,Array,Promise,isFinite,Number,
    text:(n,s)=>n.textContent=s,hide:n=>n.classList.toggle('hidden',true),
    today:()=> '2026-10-27',formatKoreanDate:d=>d,calendarDay:d=>Date.parse(d+'T12:00:00Z')/86400000,
    openOverlaySheet:id=>el(id).classList.toggle('hidden',false),
    document:{createElement:node},escapeHtml:s=>String(s).replaceAll('<','&lt;'),
    renderWeightChart(){},renderCheckup(){},renderHomeSummary(){},renderCheckupSettings(){},invalidateHomeResponses(){},
    refreshHome:()=>Promise.resolve(),errorMessage:e=>e.message,unwrap:r=>r,uuid:()=> 'request-'+(++uid),
    toast:s=>toasts.push(s),confirm:()=>confirmations.shift()??false,
    callApi(name,args){let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});requests.push({name,args,resolve,reject});return promise;}
  });
  assert.ok(checkup&&schedule);vm.runInContext(checkup+'\n'+schedule,c);
  return {c,state,nodes,el,requests,toasts,confirmations};
}
const existing={id:'note-1',checkupDate:'2026-10-30',questions:'기존 질문',result:'기존 답',weight:'58.4kg',bloodPressure:'110/70',babySize:'25cm',updatedAt:'2026-10-26'};
async function open(f,notes=[existing]){
  f.c.openCheckupNotes();f.requests.at(-1).resolve({notes,nextCheckupDate:'2026-10-30'});
  await new Promise(resolve=>setImmediate(resolve));
}
test('home opens preparation directly and results/history start collapsed',()=>{
  assert.ok(html.includes("el('summaryCheckup').addEventListener('click',openCheckupNotes)"));
  assert.match(html,/<details id="noteResultDetails" class="note-details">/);
  assert.match(html,/<details id="noteHistory" class="note-details">/);
  assert.ok(html.includes('일정과 노트는 따로 저장해'));
});
test('initial load blocks saves and reuses the existing scheduled note including all result fields',async()=>{
  const f=fixture();f.c.openCheckupNotes();assert.equal(f.el('saveCheckupNote').disabled,true);
  assert.equal(await f.c.saveCheckupNoteAction(),false);assert.equal(f.requests.length,1);
  f.requests[0].resolve({notes:[existing],nextCheckupDate:'2026-10-30'});await new Promise(r=>setImmediate(r));
  assert.equal(f.c.noteState.editingId,'note-1');assert.equal(f.el('noteQuestions').value,'기존 질문');
  assert.equal(f.el('noteBp').value,'110/70');assert.equal(f.el('noteResultDetails').open,true);
  assert.equal(f.el('saveCheckupNoteBottom').disabled,false);
});
test('date switching selects existing notes or a clean new day without changing the schedule',async()=>{
  const f=fixture();await open(f);
  f.el('noteDate').value='2026-10-31';f.c.changeNoteDate();
  assert.equal(f.c.noteState.editingId,'');assert.equal(f.el('noteQuestions').value,'');assert.equal(f.el('noteResult').value,'');
  assert.equal(f.el('noteResultDetails').open,false);assert.equal(f.el('noteScheduleDate').value,'2026-10-30');assert.equal(f.requests.length,1);
  f.el('noteDate').value='2026-10-30';f.c.changeNoteDate();assert.equal(f.c.noteState.editingId,'note-1');
});
test('unsaved questions survive reopen and refresh; switching away requires an explicit discard',async()=>{
  const f=fixture();await open(f);f.el('noteQuestions').value='작성 중 질문';
  f.c.openCheckupNotes();f.requests[1].resolve({notes:[{...existing,questions:'서버 변경'}]});await new Promise(r=>setImmediate(r));
  assert.equal(f.el('noteQuestions').value,'작성 중 질문');
  f.el('noteDate').value='2026-11-02';f.c.changeNoteDate();assert.equal(f.el('noteDate').value,'2026-10-30');assert.equal(f.el('noteQuestions').value,'작성 중 질문');
  f.confirmations.push(true);f.el('noteDate').value='2026-11-02';f.c.changeNoteDate();assert.equal(f.el('noteQuestions').value,'');
});
test('a failed initial read stays explicit, blocks an unsafe new save, and can be retried',async()=>{
  const f=fixture();f.c.openCheckupNotes();f.requests[0].reject(new Error('offline'));await new Promise(r=>setImmediate(r));
  assert.match(f.el('noteStatus').textContent,/불러오지 못했어/);assert.equal(f.el('retryCheckupNotes').classList.contains('hidden'),false);
  assert.equal(await f.c.saveCheckupNoteAction(),false);assert.equal(f.requests.length,1);
  const retry=f.c.loadCheckupNotes();f.requests[1].resolve({notes:[existing]});assert.equal(await retry,true);assert.equal(f.c.noteState.editingId,'note-1');
});
test('stale reads and previous-account responses cannot replace the current form',async()=>{
  const f=fixture();f.c.openCheckupNotes();const second=f.c.loadCheckupNotes();
  f.requests[1].resolve({notes:[existing]});await second;f.requests[0].resolve({notes:[]});await new Promise(r=>setImmediate(r));
  assert.equal(f.c.noteState.editingId,'note-1');const pending=f.c.loadCheckupNotes();
  f.state.session={token:'b'};f.c.resetNoteContext();f.requests[2].resolve({notes:[existing]});assert.equal(await pending,false);
  assert.equal(f.el('noteQuestions').value,'');assert.equal(f.c.noteState.notes.length,0);
});
test('failed saves retain fields and their retry id, and saving locks dates and both buttons',async()=>{
  const f=fixture();await open(f);f.el('noteQuestions').value='수정 질문';
  const save=f.c.saveCheckupNoteAction();assert.equal(f.el('noteDate').disabled,true);assert.equal(f.el('saveCheckupNoteBottom').disabled,true);
  assert.equal(await f.c.saveCheckupNoteAction(),false);assert.equal(f.requests.length,2);
  f.requests[1].reject(new Error('timeout'));assert.equal(await save,false);
  assert.equal(f.el('noteQuestions').value,'수정 질문');assert.match(f.el('noteStatus').textContent,/입력은 그대로/);
  const retry=f.c.saveCheckupNoteAction();assert.equal(f.requests[2].args[2],f.requests[1].args[2]);
  assert.equal(f.requests[2].args[1].noteId,'note-1');assert.equal(f.requests[2].args[1].bloodPressure,'110/70');
  f.requests[2].resolve({noteId:'note-1'});assert.equal(await retry,true);assert.equal(f.el('noteQuestions').value,'수정 질문');assert.equal(f.c.noteState.notes.length,1);
  assert.match(f.el('noteStatus').textContent,/저장됨/);assert.equal(f.requests.length,3);
});
test('new notes retain the returned id so adding results updates the same note',async()=>{
  const f=fixture();await open(f,[]);f.el('noteQuestions').value='새 질문';
  const save=f.c.saveCheckupNoteAction();f.requests[1].resolve({noteId:'new-note'});await save;
  assert.equal(f.c.noteState.editingId,'new-note');f.el('noteResult').value='들은 답';
  const again=f.c.saveCheckupNoteAction();assert.equal(f.requests[2].args[1].noteId,'new-note');f.requests[2].resolve({noteId:'new-note'});await again;
  assert.equal(f.c.noteState.notes.length,1);assert.equal(f.c.noteState.notes[0].result,'들은 답');
});
test('save completion after an account switch cannot display the previous account data',async()=>{
  const f=fixture();await open(f);f.el('noteQuestions').value='이전 계정';const save=f.c.saveCheckupNoteAction();
  f.state.session={token:'b'};f.c.resetNoteContext();f.requests[1].resolve({noteId:'note-1'});assert.equal(await save,false);assert.equal(f.el('noteQuestions').value,'');
});
test('schedule saving changes home countdown but preserves a dirty note and reports failures',async()=>{
  const f=fixture();await open(f);f.el('noteQuestions').value='진행 중';f.el('noteScheduleDate').value='2026-11-03';
  const failed=f.c.saveNoteSchedule();assert.equal(f.el('noteScheduleDate').disabled,true);f.requests[1].reject(new Error('offline'));await failed;
  assert.match(f.el('noteScheduleStatus').textContent,/저장하지 못했어/);assert.equal(f.el('noteQuestions').value,'진행 중');
  const saved=f.c.saveNoteSchedule();f.requests[2].resolve({});await saved;
  assert.equal(f.state.home.app.pregnancy.checkupDate,'2026-11-03');assert.equal(f.state.home.app.pregnancy.checkupDday,7);
  assert.equal(f.el('noteDate').value,'2026-10-30');assert.equal(f.el('noteQuestions').value,'진행 중');assert.equal(f.el('saveCheckupNote').disabled,false);
});
test('a clean form follows a changed schedule; an expired date is rejected without a write',async()=>{
  const f=fixture();await open(f);f.el('noteScheduleDate').value='2026-10-26';f.c.saveNoteSchedule();assert.equal(f.requests.length,1);
  f.el('noteScheduleDate').value='2026-11-04';const save=f.c.saveNoteSchedule();f.requests[1].resolve({});await save;
  assert.equal(f.el('noteDate').value,'2026-11-04');assert.equal(f.el('noteQuestions').value,'');assert.equal(f.c.noteState.editingId,'');
});
test('deletion failure keeps the existing note and any unsaved fields',async()=>{
  const f=fixture();await open(f);f.el('noteQuestions').value='계속 작성';f.confirmations.push(true);
  const del=f.c.deleteCheckupNote(existing);f.requests[1].reject(new Error('offline'));await del;
  assert.equal(f.c.noteState.notes.length,1);assert.equal(f.el('noteQuestions').value,'계속 작성');assert.equal(f.el('saveCheckupNote').disabled,false);
});
