import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
function run(names,deps={}){
  const context=vm.createContext({String,Array,RegExp,...deps});
  for(const name of names){
    const source=html.match(new RegExp('^      function '+name+'\\([^]*?^      }','m'))?.[0];
    assert.ok(source,'missing '+name);vm.runInContext(source,context);
  }
  return context;
}
const helpers=['escapeHtml','recordSearchQuery','searchHighlightedHtml','searchCommentMatches','searchSnippet','searchCommentSummaryHtml'];

test('search highlights literal Korean/English and regexp punctuation while escaping all HTML',()=>{
  const c=run(helpers,{state:{activeTab:'records',searchQuery:'별빛'}});
  assert.equal(c.searchHighlightedHtml('별빛 아래 별빛','별빛'),'<mark class="search-hit">별빛</mark> 아래 <mark class="search-hit">별빛</mark>');
  assert.equal(c.searchHighlightedHtml('Walk walk','WALK'),'<mark class="search-hit">Walk</mark> <mark class="search-hit">walk</mark>');
  for(const query of ['[a+b]','.*','(일콩)','?','\\','<img>']){
    const rendered=c.searchHighlightedHtml('앞 '+query+' 뒤',query);
    assert.equal((rendered.match(/<mark /g)||[]).length,1,query);
    assert.ok(rendered.includes(c.escapeHtml(query)));
    assert.ok(!rendered.includes('<img>'));
  }
  assert.equal(c.searchHighlightedHtml('<script>alert(1)</script>',' '),'&lt;script&gt;alert(1)&lt;/script&gt;');
  assert.equal(c.searchHighlightedHtml('앞 <img onerror=x> 뒤','<img onerror=x>'),'앞 <mark class="search-hit">&lt;img onerror=x&gt;</mark> 뒤');
});

test('search state applies to records only and leaves home/question text unchanged',()=>{
  const state={activeTab:'records',searchQuery:'  별빛  '};const c=run(helpers,{state});
  assert.equal(c.recordSearchQuery(),'별빛');
  for(const tab of ['home','question','more']){
    state.activeTab=tab;assert.equal(c.recordSearchQuery(),'');
    assert.equal(c.searchHighlightedHtml('별빛',c.recordSearchQuery()),'별빛');
  }
});

test('comment match summaries exclude deleted comments, count replies, and do not mutate source data',()=>{
  const c=run(helpers,{state:{activeTab:'records'}});
  const post={comments:[{id:'a',authorName:'<하콩>',content:'별빛을 봤어'},{id:'b',parentId:'a',content:'별빛이 예뻐'},{id:'c',content:'별빛',deleted:true},{id:'d',content:'다른 댓글'}]};
  const before=JSON.stringify(post);const summary=c.searchCommentSummaryHtml(post,'별빛');
  assert.equal(c.searchCommentMatches(post,'별빛').length,2);
  assert.match(summary,/댓글 2개에서 찾았어/);assert.match(summary,/&lt;하콩&gt;/);assert.match(summary,/<mark class="search-hit">별빛<\/mark>/);
  assert.equal(c.searchCommentSummaryHtml(post,'없는 말'),'');
  assert.equal(c.searchCommentSummaryHtml(post,''),'');
  assert.equal(JSON.stringify(post),before);
});

test('long comment snippets keep a late match visible and preserve emoji at the boundaries',()=>{
  const c=run(helpers,{state:{}});
  const source='😀'.repeat(70)+'기억할 별빛의 순간'+'🌱'.repeat(80);
  const snippet=c.searchSnippet(source,'별빛');
  assert.ok(snippet.startsWith('…'));assert.ok(snippet.endsWith('…'));assert.ok(snippet.includes('별빛'));
  assert.ok(snippet.length<source.length);assert.equal(snippet.isWellFormed(),true);
  assert.equal(c.searchSnippet('짧은 별빛','별빛'),'짧은 별빛');
});

test('jumping to a matching comment opens its existing panel once and moves focus without replacing drafts',()=>{
  const calls=[];let expanded=false;
  const toggle={getAttribute:()=>String(expanded),click(){expanded=true;calls.push('open');}};
  const match={scrollIntoView(options){calls.push(options.behavior);},focus(options){assert.equal(options.preventScroll,true);calls.push('focus');}};
  const card={querySelector:selector=>selector==='.comment-toggle'?toggle:match};
  const c=run(['revealSearchComments'],{window:{matchMedia:()=>({matches:true})}});
  c.revealSearchComments(card);c.revealSearchComments(card);
  assert.deepEqual(calls,['open','auto','focus','auto','focus']);
});

test('an initial failed search is not described as zero matches and later errors retain known counts',()=>{
  const c=run(['libraryResultText']);
  assert.doesNotMatch(c.libraryResultText({loading:false,error:'offline',posts:[],total:0}),/0개/);
  assert.match(c.libraryResultText({loading:true,posts:[],total:0}),/검색 중/);
  assert.equal(c.libraryResultText({loading:false,error:'offline',posts:[{}],total:21,revision:'r1'}),'전체 21개 중 1개 표시');
  assert.equal(c.libraryResultText({loading:false,error:'',posts:[],total:0,revision:'r1'}),'전체 0개 중 0개 표시');
});

test('post and comment renderers use the same escaped search helper and expose an explicit comment jump',()=>{
  const post=html.match(/^      function postCard\([^]*?^      }/m)[0];
  const comment=html.match(/^      function commentNode\([^]*?^      }/m)[0];
  assert.match(post,/searchHighlightedHtml\(shownTitle,searchQuery\)/);
  assert.match(post,/searchHighlightedHtml\(post.body,searchQuery\)/);
  assert.match(post,/searchCommentSummaryHtml\(post,searchQuery\)/);
  assert.match(post,/revealSearchComments\(card\)/);
  assert.match(comment,/searchHighlightedHtml\(comment.content\|\|'',searchQuery\)/);
  assert.match(comment,/setAttribute\('tabindex','-1'\)/);
});
