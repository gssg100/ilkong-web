import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
function run(names,deps={}){
  const c=vm.createContext({Promise,JSON,...deps});
  names.forEach(name=>{
    const source=html.match(new RegExp('^      function '+name+'\\([^]*?^      }','m'))?.[0];
    assert.ok(source,'missing '+name);vm.runInContext(source,c);
  });return c;
}
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
function fixture(kind='records'){
  const state={session:{token:'session-a',user:{id:'JISU'}},activeTab:kind,revision:'r1',homeApplyGeneration:0,recordSegment:'ALL'};
  const requests=[],renders=[];
  const c=run(['libraryFilters','pagedSignature','pagedCache','pagedResponseIsCurrent','fetchPagedFeed'],{
    state,weeklyQuestion:()=> '우리 가족의 꿈?',questionKey:q=>q,pagedRequest(op,args){const d=deferred();requests.push({op,args,...d});return d.promise;},
    errorMessage:e=>e.message,renderPosts:()=>renders.push(true),
  });return {c,state,requests,renders};
}
test('server search sends combined filters and appends only a requested result page',async()=>{
  const f=fixture();Object.assign(f.state,{recordSegment:'JISU',catFilter:'MOOD:🥰',searchQuery:'별빛',monthFilter:'2026-10'});
  const promise=f.c.fetchPagedFeed('records',false);
  assert.equal(f.requests.length,1);assert.equal(f.requests[0].op,'search_posts');assert.equal(f.requests[0].args.limit,20);
  assert.equal(f.requests[0].args.filters.query,'별빛');assert.equal(f.requests[0].args.filters.author,'JISU');assert.equal(f.requests[0].args.filters.mood,'🥰');
  f.requests[0].resolve({posts:[{id:'a'}],total:21,nextOffset:1,hasMore:true,revision:'r1'});await promise;
  const next=f.c.fetchPagedFeed('records',true);assert.equal(f.requests[1].args.offset,1);
  f.requests[1].resolve({posts:[{id:'b'}],total:21,nextOffset:2,hasMore:true,revision:'r1'});await next;
  assert.deepEqual(Array.from(f.state.pagedFeeds.records.posts,p=>p.id),['a','b']);assert.equal(f.state.pagedFeeds.records.total,21);
});
test('rapid filter changes discard the older response and never overwrite the new results',async()=>{
  const f=fixture();const old=f.c.fetchPagedFeed('records',false);f.state.searchQuery='새 검색';const fresh=f.c.fetchPagedFeed('records',false);
  f.requests[1].resolve({posts:[{id:'new'}],total:1,nextOffset:1,revision:'r1'});await fresh;
  f.requests[0].resolve({posts:[{id:'old'}],total:1,nextOffset:1,revision:'r1'});await old;
  assert.deepEqual(Array.from(f.state.pagedFeeds.records.posts,p=>p.id),['new']);assert.equal(f.renders.length,1);
});
test('late responses after logout or account switch cannot repopulate the private feed',async()=>{
  for(const nextSession of [null,{token:'session-b',user:{id:'HAKONG'}}]){
    const f=fixture();const pending=f.c.fetchPagedFeed('records',false);const cache=f.state.pagedFeeds.records;
    f.state.session=nextSession;f.state.pagedFeeds={};f.requests[0].resolve({posts:[{id:'private'}],total:1,nextOffset:1});await pending;
    assert.equal(cache.posts.length,0);assert.equal(f.renders.length,0);assert.equal(Object.keys(f.state.pagedFeeds).length,0);
  }
  assert.match(html,/state\.pagedFeeds=\{\};\s*state\.questionAnswerBusy=false/);
});
test('a changed server revision during pagination restarts instead of mixing snapshots',async()=>{
  const f=fixture();let pending=f.c.fetchPagedFeed('records',false);f.requests[0].resolve({posts:[{id:'a'}],total:2,nextOffset:1,hasMore:true,revision:'r1'});await pending;
  pending=f.c.fetchPagedFeed('records',true);f.requests[1].resolve({posts:[{id:'b'}],total:3,nextOffset:2,hasMore:true,revision:'r2'});await pending;
  assert.equal(f.state.pagedFeeds.records,undefined);assert.equal(f.renders.length,2);
});
test('failures retain previous pages and expose retry state without claiming zero matches',async()=>{
  const f=fixture();let pending=f.c.fetchPagedFeed('records',false);f.requests[0].resolve({posts:[{id:'a'}],total:2,nextOffset:1,hasMore:true,revision:'r1'});await pending;
  pending=f.c.fetchPagedFeed('records',true);f.requests[1].reject(new Error('network offline'));await pending;
  const cache=f.state.pagedFeeds.records;assert.equal(cache.posts.length,1);assert.equal(cache.total,2);assert.equal(cache.error,'network offline');assert.equal(cache.loading,false);assert.equal(cache.hasMore,true);
});
test('question pages include a separately checked current weekly question with matching revisions',async()=>{
  const f=fixture('question');const pending=f.c.fetchPagedFeed('question',false);
  assert.equal(f.requests.length,2);assert.equal(f.requests[1].args.questionKey,'우리 가족의 꿈?');
  f.requests[0].resolve({groups:[],partners:[],total:30,nextOffset:10,hasMore:true,revision:'r1'});
  f.requests[1].resolve({groups:[{questionKey:'weekly',authors:[]}],revision:'r1'});await pending;
  assert.equal(f.state.pagedFeeds.question.weekly.questionKey,'weekly');assert.equal(f.state.pagedFeeds.question.total,30);
});
test('new question answers preserve an existing draft and completed answers open the existing edit flow',()=>{
  const state={session:{token:'a'},images:[],composerMode:'create'}, nodes={postBody:{value:'작성 중'},postTitle:{value:''}};
  const events=[];const c=run(['openWeeklyAnswer'],{state,el:id=>nodes[id],openComposer:()=>events.push('open'),toast:()=>events.push('notice'),composerDraftLocked:()=>false,scheduleDraftSave:()=>events.push('draft'),findPost:()=>null,openEditComposer:p=>events.push(p.id)});
  c.openWeeklyAnswer('질문?',null,true);assert.equal(nodes.postBody.value,'작성 중');assert.deepEqual(events,['open','notice']);
  nodes.postBody.value='';events.length=0;c.openWeeklyAnswer('질문?',null,true);assert.equal(nodes.postBody.value,'Q. 질문?\nA. ');assert.deepEqual(events,['open','draft']);
  c.openWeeklyAnswer('질문?',{id:'existing'},true);assert.equal(events.at(-1),'existing');
});
test('question grouping keys normalize whitespace and case while post lookup includes older paged answers',()=>{
  const state={pagedFeeds:{question:{groups:[{authors:[{post:{id:'latest'}}]}],weekly:null,histories:{q:{posts:[{id:'older'}]}}}},home:{posts:[]}};
  const c=run(['questionKey','findPost'],{state});assert.equal(c.questionKey('  Our  family?\n'),'our family?');
  assert.equal(c.findPost('latest').id,'latest');assert.equal(c.findPost('older').id,'older');assert.equal(c.findPost('missing'),null);
});
test('records and questions have no implicit full-feed download path',()=>{
  assert.doesNotMatch(html.match(/^      function activateTab\([^]*?^      }/m)[0],/ensureAllPostsForLibrary/);
  assert.doesNotMatch(html.match(/^      function scheduleSearchApply\([^]*?^      }/m)[0],/ensureAllPostsForLibrary/);
  assert.match(html,/loadAllRecords'\)\.addEventListener\('click',refreshPagedFeed\)/);
});
