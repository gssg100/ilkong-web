import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {test} from 'node:test';
const source=readFileSync(new URL('../src/modules/preparation.js',import.meta.url),'utf8');
function node(tag='div'){
  const classes=new Set();const n={tag,value:'',textContent:'',children:[],listeners:{},disabled:false,checked:false,attributes:{},name:'',
    classList:{add:k=>classes.add(k),remove:k=>classes.delete(k),toggle(k,on){if(on)classes.add(k);else classes.delete(k);},contains:k=>classes.has(k)},
    appendChild(c){c.parentNode=n;n.children.push(c);return c;},setAttribute(k,v){n.attributes[k]=v;},getAttribute(k){return n.attributes[k];},addEventListener(k,fn){n.listeners[k]=fn;},focus(){n.focused=true;},select(){},scrollIntoView(){},
    querySelector(s){return n.querySelectorAll(s)[0]||null;},querySelectorAll(s){const all=n.children.flatMap(c=>[c,...c.querySelectorAll('*')]);return s==='*'?all:all.filter(c=>s===c.tag||(s.startsWith('[name=')&&c.name===s.match(/"([^"]+)"/)[1]));}};
  Object.defineProperty(n,'innerHTML',{get(){return n._html||'';},set(s){n._html=s;n.children=[];}});return n;
}
function fixture(){
  const nodes={},el=id=>nodes[id]||=(node()),requests=[],toasts=[],state={session:{token:'a'},home:{app:{pregnancy:{}}}};let uid=0;
  const c=vm.createContext({state,el,Promise,Date,Number,String,Array,Object,JSON,Set,isFinite,navigator:{},document:{createElement:node,querySelectorAll:()=>[],querySelector:()=>null},
    text:(n,s)=>n.textContent=s,hide:n=>n.classList.toggle('hidden',true),show:n=>n.classList.toggle('hidden',false),escapeHtml:s=>String(s).replaceAll('<','&lt;'),openOverlaySheet(){},renderHomeSummary(){},confirm:()=>true,toast:s=>toasts.push(s),uuid:()=> 'op-'+(++uid),errorMessage:e=>e.message,unwrap:r=>r,
    callApi(name,args){let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});requests.push({name,args,resolve,reject});return promise;}});
  vm.runInContext(source,c);c.preparationOwner();return {c,state,el,requests,toasts};
}
const item=(id,changes={})=>({id,version:1,content:'준비물 '+id,prepState:'planned',method:'new',timing:'before',priority:'essential',targetQuantity:1,targetMax:null,currentQuantity:0,unit:'개',price:'',spent:'',remainingPrice:'',costScope:'preparation',verification:'not_required',...changes});
const flush=()=>new Promise(r=>setImmediate(r));
test('progress includes only prebirth essentials; held essentials remain in denominator and supplied promises are not owned',()=>{
  const f=fixture(),s=f.c.preparationSummary([item('owned',{prepState:'ready',currentQuantity:null,method:'owned',costScope:'existing'}),item('after',{timing:'after'}),item('optional',{priority:'optional'}),item('hold',{prepState:'hold'}),item('bottle',{prepState:'waiting',method:'hospital'})]);
  assert.equal(s.total,3);assert.equal(s.done,1);assert.equal(s.owned,1);assert.equal(s.after,1);assert.equal(s.priceUnknown,0);
});
test('unknown money is distinct from free; partial costs never assume whole-item price is remaining',()=>{
  const f=fixture(),s=f.c.preparationSummary([item('free',{prepState:'ready',currentQuantity:1,spent:'0'}),item('unknown'),item('partial',{prepState:'partial',targetQuantity:15,currentQuantity:10,price:'15000'}),item('known',{price:'20000'}),item('existing',{prepState:'ready',method:'owned',costScope:'existing',spent:'50000'}),item('wait',{prepState:'waiting',method:'hospital'})]);
  assert.equal(s.spent,0);assert.equal(s.priceUnknown,2);assert.equal(s.remaining,20000);assert.equal(s.spentUnknown,0);
});
test('a pending suitability check or insufficient quantity prevents readiness, while owned unknown quantities stay unknown',()=>{
  const f=fixture();assert.equal(f.c.preparationReady(item('a',{prepState:'ready',verification:'pending'})),false);assert.equal(f.c.preparationReady(item('b',{prepState:'ready',targetQuantity:15,currentQuantity:10})),false);assert.equal(f.c.preparationReady(item('c',{prepState:'ready',targetQuantity:null,currentQuantity:null})),true);
});
test('unit rendering and acquisition filters distinguish quantity, receipt and purchase timing',()=>{
  const f=fixture();assert.match(f.c.checklistSubtitle(item('a',{unit:'장',targetQuantity:15,currentQuantity:null})),/현재 수량 미확인 \/ 목표 15장/);assert.doesNotMatch(f.c.checklistSubtitle(item('a',{unit:'장',targetQuantity:15})),/15개/);assert.equal(f.c.preparationFilter(item('s',{method:'used',timing:'after'}),'used'),false);assert.equal(f.c.preparationFilter(item('b',{method:'hospital',prepState:'waiting'}),'owned'),false);
});
test('service estimate counts weekdays and explicit holidays without mutating the start date',()=>{
  const f=fixture();assert.deepEqual(Array.from(f.c.preparationServiceDates('2027-03-05',3,['2027-03-08'])),['2027-03-05','2027-03-09','2027-03-10']);assert.equal(f.c.preparationServiceDates('2027-02-30',15,[]).length,0);assert.equal(f.c.preparationServiceDates('2027-03-05',15,[]).length,15);
});
test('old requests and logout completions cannot replace the current account preparation data',async()=>{
  const f=fixture();const a=f.c.loadChecklist(),b=f.c.loadChecklist();f.requests[1].resolve({items:[item('new')]});await b;f.requests[0].resolve({items:[item('old')]});await a;assert.equal(f.c.preparationState.items[0].id,'new');
  const p=f.c.loadPreparationPlan();f.c.resetPreparationContext();f.state.session=null;f.requests.at(-1).resolve({plan:{version:1,data:{provider:'private'}}});assert.equal(await p,false);assert.equal(f.c.preparationState.plan,null);
});
test('failed saves retain all inputs, same creation id, and no premature local mutation',async()=>{
  const f=fixture(),original=item('one');f.c.preparationState.items=[original];f.c.editPreparationItem(original);const d=f.c.preparationState.itemDraft;d.content='작성한 이름';d.unit='장';const saving=f.c.savePreparationItem();assert.equal(f.c.preparationState.saving,true);assert.equal(original.content,'준비물 one');f.requests.at(-1).reject(new Error('연결 실패'));assert.equal(await saving,false);assert.equal(f.c.preparationState.itemDraft,d);assert.equal(d.content,'작성한 이름');assert.equal(d.unit,'장');assert.equal(f.c.preparationState.saving,false);
});
test('conflicting item saves keep draft version and require comparison before resubmission',async()=>{
  const f=fixture();f.c.editPreparationItem(item('one'));const d=f.c.preparationState.itemDraft;d.memo='내 메모';const pending=f.c.savePreparationItem();f.requests[0].reject(Object.assign(new Error('다른 기기 변경'),{code:'CONFLICT'}));await pending;assert.equal(d.version,1);assert.equal(d.conflict,true);assert.equal(d.memo,'내 메모');await f.c.savePreparationItem();assert.equal(f.requests.length,1);
});
test('account changes cannot submit or display the previous account draft',async()=>{
  const f=fixture();f.c.editPreparationItem(item('one'));f.state.session={token:'b'};assert.equal(await f.c.savePreparationItem(),false);assert.equal(f.requests.length,0);f.c.preparationOwner();assert.equal(f.c.preparationState.itemDraft,null);assert.equal(f.el('prepItemEditor').children.length,0);
});
test('invalid quantity cannot become an unknown null through JSON serialization',async()=>{
  const f=fixture();f.c.editPreparationItem(item('one'));const d=f.c.preparationState.itemDraft;d.currentQuantity='잘못된 수량';assert.equal(await f.c.savePreparationItem(),false);assert.equal(f.requests.length,0);assert.equal(d.currentQuantity,'잘못된 수량');assert.match(d.error,/정수/);
});
test('latest plan reads win and dirty consultation inputs survive refresh failures',async()=>{
  const f=fixture();f.c.preparationState.planDraft={provider:'입력 중',dirty:true,version:1};const a=f.c.loadPreparationPlan(),b=f.c.loadPreparationPlan();f.requests[1].resolve({plan:{version:3,data:{provider:'최신',tasks:[]}}});await b;f.requests[0].resolve({plan:{version:2,data:{provider:'과거',tasks:[]}}});await a;assert.equal(f.c.preparationState.plan.version,3);assert.equal(f.c.preparationState.planDraft.provider,'입력 중');
});
test('plan save failure preserves quote, zero deposit, schedule and conflict state',async()=>{
  const f=fixture();f.c.preparationState.plan={version:1,data:{tasks:[],referenceCost:'893000'}};f.c.preparationState.planDraft={version:1,dirty:true,provider:'상담 중',quotedTotal:'',deposit:'0',serviceStart:'2027-03-05',excludedDates:[]};const d=f.c.preparationState.planDraft;const pending=f.c.savePreparationPlanPatch(d,1,true);f.requests[0].reject(Object.assign(new Error('변경 충돌'),{code:'CONFLICT'}));assert.equal(await pending,false);assert.equal(d.deposit,'0');assert.equal(d.quotedTotal,'');assert.equal(d.serviceStart,'2027-03-05');assert.equal(d.conflict,true);assert.equal(f.c.preparationState.saving,false);
});
