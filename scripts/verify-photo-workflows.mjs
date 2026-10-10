// Runs production HTML functions with deterministic local mocks; never contacts production.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const pixels='data:image/jpeg;base64,'+'A'.repeat(80);
const host='https://areyvrdvnaccebqbigyy.supabase.co';
function signed(exp=Math.floor(Date.now()/1000)+3600,origin=host){return origin+'/storage/v1/object/sign/ilkong-media/post/photo.jpg?token=e.'+Buffer.from(JSON.stringify({exp})).toString('base64url')+'.s';}
function source(name){const line=html.match(new RegExp('^      function '+name+'\\([^\\n]*','m'));assert.ok(line,'missing '+name);if(line[0].trimEnd().endsWith('}'))return line[0];const found=html.match(new RegExp('^      function '+name+'\\([^]*?^      }','m'));assert.ok(found,'missing body '+name);return found[0];}
function execute(names,dependencies={}){
  const context=vm.createContext({Promise,JSON,Date,URL,atob,Blob,File,setTimeout,clearTimeout,console,...dependencies});
  for(const name of names)vm.runInContext(source(name),context);
  return context;
}
const validators=['isPersistentImageDataUrl','approvedSignedImageUrl','looksLikeImageUrl'];
const tick=()=>new Promise(resolve=>setTimeout(resolve,0));
const image=(id)=>({id,status:'ready',dataUrl:pixels,thumbnailDataUrl:pixels,uploadedPostId:'',uploadedImageId:''});
function composerDeps(extra={}){
  const nodes={postBody:{value:'본문'},postTitle:{value:'제목'},recordDate:{value:'2026-10-10'},category:{value:'일상'},composer:{classList:{contains:()=>false}},savePost:{},saveProgress:{},saveMessage:{},progressBar:{style:{}},saveProgressBar:{setAttribute(){}}};
  const calls=[],toasts=[];
  const state={saving:false,composerClosing:false,composerMode:'create',session:{token:'token'},images:[image('A')],selectedMood:'',saveAttempt:null,editExistingImages:[],editExpectedImageIds:[],editingPostId:'post'};
  return {nodes,calls,toasts,state,el:id=>nodes[id],SUPABASE_API_EXEC:host+'/functions/v1/ilkong-api',isImeComposing:()=>false,composerDraftLocked:()=>false,applyComposerDraftLock(){},cancelDraftSave(){},invalidateHomeResponses(){},setSaving(){},uuid:()=> 'request-id',unwrap:value=>value,toast:value=>toasts.push(value),hide(){},show(){},renderOfflineBanner(){},restoreDialogFocus(){},clearPendingSave:()=>Promise.resolve(),clearComposer(){state.images=[];},restoreCreateComposer(){state.composerMode='create';},persistPendingSave:()=>Promise.resolve(true),loadHome:()=>Promise.resolve(),looksOffline:()=>false,errorMessage:error=>error.message||String(error),...extra};
}

test('display allows only raster data URLs and fresh signed Storage URLs on the configured HTTPS host',()=>{
  const c=execute(validators,{SUPABASE_API_EXEC:host+'/functions/v1/ilkong-api'});
  assert.equal(c.looksLikeImageUrl(pixels),true);
  assert.equal(c.looksLikeImageUrl(signed()),true);
  for(const url of [signed(1),signed(Math.floor(Date.now()/1000)+5),signed(undefined,'https://evil.example'),signed().replace('https:','http:'),signed().replace('/object/sign/','/object/public/'),'data:image/svg+xml;base64,'+'A'.repeat(80),signed().replace('supabase.co','supabase.co.evil.example')])assert.equal(c.looksLikeImageUrl(url),false,url);
  assert.equal(c.isPersistentImageDataUrl(signed()),false);
});

test('single-image lookup accepts the signed URL, expires its memory entry and forces fresh issuance',async()=>{
  let requests=0;const state={imageCache:{},imageInFlight:{}};
  const c=execute([...validators,'imageRequestKey','fetchImageUrl'],{SUPABASE_API_EXEC:host+'/functions/v1/ilkong-api',state,readPersistentImageUrl:()=>Promise.resolve(''),requestCompatibleImageData:()=>{requests++;return Promise.resolve({url:signed()});},cacheImageUrl(id,variant,url){state.imageCache[c.imageRequestKey(id,variant)]=url;}});
  assert.equal(await c.fetchImageUrl('one','original'),signed());
  await c.fetchImageUrl('one','original');assert.equal(requests,1);
  state.imageCache[c.imageRequestKey('one','original')]=signed(1);
  await c.fetchImageUrl('one','original');assert.equal(requests,2);
  await c.fetchImageUrl('one','original',true);assert.equal(requests,3);
});

test('batch applies the same URL validation and sends rejected items through the single-image path',async()=>{
  const fallback=[],displayed=[];const state={session:{token:'t'}};
  const c=execute([...validators,'imageRequestKey','fetchImageBatch'],{SUPABASE_API_EXEC:host+'/functions/v1/ilkong-api',state,callApi:()=>Promise.resolve({items:[{imageId:'good',variant:'thumbnail',url:signed()},{imageId:'bad',variant:'thumbnail',url:'https://evil.example/a.jpg'}]}),unwrap:x=>x,rememberImageMemory(){},displayImage:(box,url)=>{displayed.push(url);return Promise.resolve();},loadImageNow:id=>{fallback.push(id);return Promise.resolve();},isMissingServerFunctionError:()=>false});
  await c.fetchImageBatch([{imageId:'good',variant:'thumbnail',box:{}},{imageId:'bad',variant:'thumbnail',box:{}}]);
  assert.equal(displayed.length,1);assert.deepEqual(fallback,['bad']);
});

test('snapshot upload order survives external state replacement and skips completed photos',async()=>{
  let resolveFirst;const sent=[];const snapshot=[image('A'),image('B'),image('C')];snapshot[1].uploadedPostId='post';
  const c=execute(['uploadImagesSequential'],{state:{images:snapshot,session:{token:'t'}},setSaving(){},unwrap:x=>x,callApi(name,args){sent.push(args[2].clientImageId);return sent.length===1?new Promise(resolve=>resolveFirst=resolve):Promise.resolve({imageId:'server-C'});},cacheImageUrl(){},requirePendingSave:()=>Promise.resolve(true)});
  const work=c.uploadImagesSequential('post',0,snapshot);c.state.images=[image('unrelated')];resolveFirst({imageId:'server-A'});await work;
  assert.deepEqual(sent,['A','C']);assert.equal(snapshot[2].uploadedImageId,'server-C');
});

test('device persistence failure prevents server post creation and does not claim offline safety',async()=>{
  const deps=composerDeps({persistPendingSave:()=>Promise.resolve(false)});
  const c=execute([...validators,'savePost','requirePendingSave'],{...deps,prepareCreateSaveAttempt:()=>({requestId:'id'}),startPostSafely:()=>{deps.calls.push('start');return Promise.resolve({postId:'post'});}});
  c.savePost();await tick();await tick();
  assert.deepEqual(deps.calls,[]);assert.match(deps.toasts[0],/기기 보관에 실패/);assert.equal(deps.state.saving,false);
});

test('edit compression errors block text mutation and false success messages',async()=>{
  const deps=composerDeps();deps.state.composerMode='edit';deps.state.images=[{id:'bad',status:'error',dataUrl:''}];
  const c=execute([...validators,'savePost'],{...deps,callApi:()=>{deps.calls.push('called');return Promise.resolve();}});
  c.savePost();await tick();assert.deepEqual(deps.calls,[]);assert.match(deps.toasts[0],/변환에 실패/);
});

test('partial edit upload stores progress and retry does not upload the completed photo twice',async()=>{
  const images=[image('A'),image('B')],sent=[];let failed=false;const state={images,session:{token:'t'},editExpectedImageIds:['old'],editExistingImages:[{id:'old'}]};
  const c=execute(['addEditedPhotos'],{state,setSaving(){},unwrap:x=>x,cacheImageUrl(){},requirePendingSave:()=>Promise.resolve(true),callApi(name,args){const id=args[2].clientImageId;sent.push(id);if(id==='B'&&!failed){failed=true;return Promise.reject(new Error('network'));}return Promise.resolve({imageId:'server-'+id});}});
  await assert.rejects(c.addEditedPhotos('post',0,images),/network/);await c.addEditedPhotos('post',0,images);
  assert.deepEqual(sent,['A','B','B']);assert.deepEqual(Array.from(state.editExpectedImageIds),['old','server-A','server-B']);
});

test('durable edit snapshot contains target, replacement, upload IDs and immutable metadata',()=>{
  const deps=composerDeps();Object.assign(deps.state,{composerMode:'edit',editingPostId:'edited-post',editAttempt:{id:'attempt'},editExistingImages:[{id:'keep'}],editExpectedImageIds:['keep','server-A']});deps.state.images[0].uploadedPostId='edited-post';deps.state.images[0].uploadedImageId='server-A';deps.state.images[0].replaceImageId='removed';
  const c=execute(['pendingSnapshot'],{...deps,currentUserId:()=> 'USER_A'});const snapshot=c.pendingSnapshot('failed');
  assert.equal(snapshot.mode,'edit');assert.equal(snapshot.editingPostId,'edited-post');assert.equal(snapshot.editAttempt.id,'attempt');assert.equal(snapshot.images[0].uploadedImageId,'server-A');assert.equal(snapshot.images[0].replaceImageId,'removed');
});

test('saving locks every composer control and restores prior disabled states',()=>{
  const controls=[false,false,true].map(disabled=>({disabled,setAttribute(){},removeAttribute(){}}));const deps=composerDeps();deps.nodes.composer.querySelectorAll=()=>controls;
  const c=execute(['setSaving'],{...deps,text:(node,value)=>node.textContent=value});c.setSaving(true,'upload',10);assert.ok(controls.every(item=>item.disabled));c.setSaving(true,'upload',20);c.setSaving(false,'',0);assert.deepEqual(controls.map(item=>item.disabled),[false,false,true]);
});

test('original download requests a fresh URL and rejects non-image bodies',async()=>{
  let force,requests=0;
  const c=execute([...validators,'fetchOriginalPhotoBlob'],{SUPABASE_API_EXEC:host+'/functions/v1/ilkong-api',fetchImageUrl:(id,variant,fresh)=>{force=fresh;return Promise.resolve(signed());},fetch:()=>{requests++;return Promise.resolve({ok:true,blob:()=>Promise.resolve(new Blob(['bad'],{type:'text/html'}))});}});
  await assert.rejects(c.fetchOriginalPhotoBlob('photo',0),/형식/);assert.equal(force,true);assert.equal(requests,2);
});

test('existing-photo replacement sends its ID and updates expected server IDs only after upload succeeds',async()=>{
  const photo={...image('new'),replaceImageId:'removed'},state={images:[photo],session:{token:'t'},editExpectedImageIds:['removed','keep']};let payload;
  const c=execute(['addEditedPhotos'],{state,setSaving(){},unwrap:x=>x,cacheImageUrl(){},requirePendingSave:()=>Promise.resolve(true),callApi(name,args){payload=args[2];return Promise.resolve({imageId:'replacement'});}});
  await c.addEditedPhotos('post',0,[photo]);assert.equal(payload.replaceImageId,'removed');assert.deepEqual(Array.from(state.editExpectedImageIds),['keep','replacement']);assert.equal(photo.uploadedImageId,'replacement');
});

test('closing an edit durably preserves its photos instead of restoring an empty create draft',async()=>{
  const deps=composerDeps();deps.state.composerMode='edit';let persisted=0,restored=0;
  const c=execute(['closeComposer'],{...deps,confirm:()=>true,flushDraftSave:()=>true,persistPendingSave:()=>{persisted++;return Promise.resolve(true);},restoreCreateComposer:()=>restored++});
  deps.nodes.closeComposer={};deps.nodes.recoveryText={};deps.nodes.recoveryBanner={};c.text=(node,value)=>node.textContent=value;
  c.closeComposer();await tick();assert.equal(persisted,1);assert.equal(restored,0);assert.equal(deps.state.composerMode,'edit');assert.equal(deps.state.images[0].id,'A');
});

test('restart restores edit target, order and completed upload markers',async()=>{
  const deps=composerDeps();deps.state.composerMutationGeneration=2;deps.nodes.composer.classList.contains=()=>true;deps.nodes.recoveryText={};deps.nodes.recoveryBanner={};
  const data={userId:'USER_A',mode:'edit',editingPostId:'saved-target',editAttempt:{id:'stable-request',bodySaved:true},images:[{...image('new'),uploadedPostId:'saved-target',uploadedImageId:'server-new'}],editExistingImages:[{id:'second'},{id:'first'}],editExpectedImageIds:['first','second','server-new'],title:'복구 제목'};
  const c=execute(['restorePendingSave'],{...deps,today:()=> '2026-10-10',currentUserId:()=> 'USER_A',pendingSaveKey:()=> 'pending',idbGet:()=>Promise.resolve(data),configureComposerMode(){},renderMoodChoices(){},renderPreviews(){},text:(node,value)=>node.textContent=value});
  assert.equal(await c.restorePendingSave('USER_A'),true);assert.equal(deps.state.composerMode,'edit');assert.equal(deps.state.editingPostId,'saved-target');assert.equal(deps.state.images[0].uploadedImageId,'server-new');assert.deepEqual(Array.from(deps.state.editExistingImages,item=>item.id),['second','first']);
});

test('queued persistence captures metadata before later edits can mutate the draft',async()=>{
  let release;const deps=composerDeps();deps.state.composerMode='edit';deps.state.editAttempt={id:'before'};deps.state.pendingPersistChain=new Promise(resolve=>release=resolve);let stored;
  const c=execute(['pendingSnapshot','persistPendingSave'],{...deps,currentUserId:()=> 'USER_A',pendingSaveKey:()=> 'pending',idbSet:(key,value)=>{stored=value;return Promise.resolve();},idbRemove:()=>Promise.resolve()});
  const work=c.persistPendingSave();deps.state.editAttempt.id='after';release();await work;assert.equal(stored.editAttempt.id,'before');
});

test('edit finalization sends retained order and the entire current server expectation',async()=>{
  const deps=composerDeps();deps.state.composerMode='edit';deps.state.editExistingImages=[{id:'second'},{id:'first'}];deps.state.editExpectedImageIds=['first','second','removed'];deps.state.images[0].replaceImageId='removed';
  const c=execute([...validators,'savePost','requirePendingSave','addEditedPhotos'],{...deps,cacheImageUrl(){},callApi(name,args){deps.calls.push({name,args});return Promise.resolve(name==='apiAddPhotosV370'?{imageId:'new-server'}:{});}});
  c.savePost();await tick();await tick();
  assert.deepEqual(deps.calls.map(call=>call.name),['apiAddPhotosV370','apiUpdatePostV280','apiSetPostPhotosV490']);
  const finalized=deps.calls[2].args[2];assert.deepEqual(Array.from(finalized.imageIds),['second','first','new-server']);assert.deepEqual(Array.from(finalized.expectedImageIds),['first','second','new-server']);
  assert.match(deps.toasts[0],/변경을 저장/);
});

test('removing one photo from a full eight-photo edit makes room for its replacement',()=>{
  const deps=composerDeps();deps.state.composerMode='edit';deps.state.images=[];deps.state.editExistingImages=Array.from({length:7},(_,index)=>({id:'old-'+index}));deps.state.editExpectedImageIds=[...deps.state.editExistingImages.map(item=>item.id),'removed'];
  const c=execute(['addFiles'],{...deps,MAX_IMAGES:8,markComposerMutation(){},invalidateSaveAttempt(){},renderPreviews(){},processImageQueue(){}});
  c.addFiles([{name:'replacement.jpg'}]);assert.equal(deps.state.images.length,1);assert.equal(deps.state.images[0].replaceImageId,'removed');
  deps.state.saving=true;c.addFiles([{name:'during-save.jpg'}]);assert.equal(deps.state.images.length,1);
});

test('Android original save uses the existing native filename/MIME/base64 contract',async()=>{
  const deps=composerDeps();deps.state.viewerImages=[{id:'photo'}];deps.state.viewerIndex=0;deps.nodes.downloadPhoto={disabled:false};let saved;
  const c=execute(['downloadCurrentPhoto'],{...deps,window:{IlkongFiles:{saveToDownloads(...args){saved=args;return 'content://photos/1';}}},fetchOriginalPhotoBlob:()=>Promise.resolve(new Blob(['pixels'],{type:'image/jpeg'})),blobToBase64:()=>Promise.resolve('cGl4ZWxz'),today:()=> '2026-10-10',text:(node,value)=>node.textContent=value});
  c.downloadCurrentPhoto();await tick();assert.match(saved[0],/\.jpg$/);assert.equal(saved[1],'image/jpeg');assert.equal(saved[2],'cGl4ZWxz');assert.equal(deps.nodes.downloadPhoto.disabled,false);assert.match(deps.toasts[0],/사진 파일을 저장/);
});

test('a server-created interrupted draft keeps content/photo controls locked through close and reopen',()=>{
  const deps=composerDeps();deps.state.saveAttempt={requestId:'stable',postId:'server-draft',signature:'original'};deps.nodes.editNote={};
  const controls=['postBody','pickPhotos','mood','savePost','closeComposer'].map(id=>({id,disabled:false,setAttribute(){},removeAttribute(){}}));deps.nodes.composer.querySelectorAll=()=>controls;
  const c=execute(['composerDraftLocked','applyComposerDraftLock','setSaving','prepareCreateSaveAttempt','invalidateSaveAttempt','addFiles'],{...deps,text:(node,value)=>node.textContent=value,MAX_IMAGES:8,markComposerMutation(){},renderPreviews(){},processImageQueue(){}});
  c.applyComposerDraftLock();assert.deepEqual(controls.map(item=>item.disabled),[true,true,true,false,false]);
  c.setSaving(true,'saving',10);c.setSaving(false,'',0);assert.deepEqual(controls.map(item=>item.disabled),[true,true,true,false,false]);
  c.invalidateSaveAttempt();assert.equal(c.prepareCreateSaveAttempt('modified').requestId,'stable');
  const before=deps.state.images.length;c.addFiles([{name:'unexpected.jpg'}]);assert.equal(deps.state.images.length,before);assert.match(deps.toasts[0],/먼저 완료/);
  assert.match(deps.nodes.editNote.textContent,/중단된 사진 저장/);
  deps.state.saveAttempt=null;c.applyComposerDraftLock();assert.ok(controls.every(item=>!item.disabled));
});

test('failure before server post creation may start a changed draft with a new request ID',()=>{
  const deps=composerDeps();deps.state.saveAttempt={requestId:'old',postId:'',signature:'old'};
  const c=execute(['prepareCreateSaveAttempt','validClientRequestId'],{...deps,uuid:()=> 'new'});
  assert.equal(c.prepareCreateSaveAttempt('changed').requestId,'new');
});

test('image decode failure causes exactly one fresh URL retry',async()=>{
  let attempts=0;const forces=[];
  class FakeImage{set src(value){attempts++;queueMicrotask(()=>attempts===1?this.onerror():this.onload());}}
  const c=execute(['loadApprovedImage'],{Image:FakeImage,fetchImageUrl:(id,variant,force)=>{forces.push(force);return Promise.resolve(signed());},looksLikeImageUrl:()=>true,invalidateImageCache:()=>Promise.resolve(),errorMessage:error=>error.message});
  assert.ok(await c.loadApprovedImage('photo','original',0));assert.deepEqual(forces,[false,true]);assert.equal(attempts,2);
});

test('unsupported or failed iPhone file sharing falls back to a real file download',async()=>{
  const deps=composerDeps();deps.state.viewerImages=[{id:'photo'}];deps.state.viewerIndex=0;deps.nodes.downloadPhoto={disabled:false};let download;
  const c=execute(['downloadCurrentPhoto'],{...deps,window:{},navigator:{canShare:()=>true,share:()=>Promise.reject(new Error('share unavailable'))},fetchOriginalPhotoBlob:()=>Promise.resolve(new Blob(['pixels'],{type:'image/png'})),downloadPhotoBlob:(blob,name)=>download={blob,name},today:()=> '2026-10-10',text:(node,value)=>node.textContent=value});
  c.downloadCurrentPhoto();await tick();assert.equal(download.blob.type,'image/png');assert.match(download.name,/\.png$/);assert.equal(deps.nodes.downloadPhoto.disabled,false);
});

test('a text-only record can be edited into a photo-only record without empty-record rejection',async()=>{
  const deps=composerDeps();deps.state.composerMode='edit';deps.nodes.postTitle.value='';deps.nodes.postBody.value='';let serverPhotos=0;
  const c=execute([...validators,'savePost','requirePendingSave','addEditedPhotos'],{...deps,cacheImageUrl(){},callApi(name,args){deps.calls.push(name);if(name==='apiAddPhotosV370'){serverPhotos++;return Promise.resolve({imageId:'new-photo'});}if(name==='apiUpdatePostV280'&&!args[2].body&&!args[2].title&&!serverPhotos)return Promise.reject(new Error('빈 기록'));return Promise.resolve({});}});
  c.savePost();await tick();await tick();assert.deepEqual(deps.calls,['apiAddPhotosV370','apiUpdatePostV280','apiSetPostPhotosV490']);assert.match(deps.toasts[0],/변경을 저장/);assert.equal(deps.state.saving,false);
});

test('entering edit synchronously preserves a fresh text-only create draft and leaves its attempt unchanged',()=>{
  const deps=composerDeps();deps.state.images=[];deps.state.saveAttempt={requestId:'keep'};deps.nodes.postBody.value='400ms 자동 저장 전 새 본문';const local=new Map();let cancelled=0;
  const c=execute(['backupCreateComposer','restoreCreateComposer'],{...deps,currentUserId:()=> 'USER_A',draftKey:user=>'draft_'+user,storageSet:(key,value)=>{local.set(key,value);return true;},cancelDraftSave(){cancelled++;},renderMoodChoices(){},renderPreviews(){},renderExistingPreviews(){},text(){},today:()=> '2026-10-10'});
  assert.equal(c.backupCreateComposer(),true);assert.equal(cancelled,1);assert.equal(deps.state.saveAttempt.requestId,'keep');deps.state.composerMode='edit';deps.nodes.postBody.value='다른 글 수정';c.restoreCreateComposer();assert.equal(deps.nodes.postBody.value,'400ms 자동 저장 전 새 본문');assert.equal(JSON.parse(local.get('draft_USER_A')).body,'400ms 자동 저장 전 새 본문');
});

test('create draft storage failure prevents entering edit and preserves the active composer',()=>{
  const deps=composerDeps();let reopened=0;
  const c=execute(['backupCreateComposer','openEditComposer'],{...deps,currentUserId:()=> 'USER_A',draftKey:()=> 'draft',storageSet:()=>false,openComposer(){reopened++;}});
  c.openEditComposer({id:'different'});assert.equal(deps.state.composerMode,'create');assert.equal(deps.nodes.postBody.value,'본문');assert.equal(deps.state.images[0].id,'A');assert.equal(reopened,1);assert.match(deps.toasts[0],/기기에 보관하지 못했어/);
});

test('queued image display eagerly loads a detached image before awaiting onload and keeps the queue moving',async()=>{
  let appended=0,cached=0;
  class FakeImage{set src(value){assert.equal(this.loading,'eager','a detached lazy image never starts loading in Chrome');queueMicrotask(()=>this.onload());}}
  const box={isConnected:true,appendChild(){appended++;},setAttribute(){},removeAttribute(){}};
  const c=execute(['displayImage'],{Image:FakeImage,looksLikeImageUrl:()=>true,cacheImageUrl(){cached++;},invalidateImageCache:()=>Promise.resolve()});
  assert.equal(await c.displayImage(box,pixels,'one','thumbnail',0),true);assert.equal(appended,1);assert.equal(cached,1);
});
