
    (function () {
      'use strict';

      // The inline VERSION literal also identifies the OTA screen to older Android shells.
      // All visible release information and both change histories use one metadata record.
      var VERSION = '4.9.10';
      var RELEASE_INFO = {
        version: VERSION,
        date: '2026-10-27',
        timezone: 'Asia/Seoul',
        notes: [
          '기록 검색에서 제목·본문·댓글의 일치 문구를 강조해 찾기 쉽게 개선',
          '댓글로 찾은 기록은 일치 댓글을 미리 보고 버튼 한 번으로 해당 댓글로 이동',
          '검색 연결 실패를 검색 결과 0개로 표시하지 않도록 안내 보완'
        ],
        history: [
          {version:'4.9.9',date:'2026-10-26',notes:[
          '알림을 눌렀을 때 깃허브 사이트 주소로 빠져나가던 문제 수정',
          '알림은 항상 일콩 기록 화면으로 열리고, 이미 열린 화면이 있으면 그 화면으로 이동',
          '알림 주소가 앱 밖을 가리키면 무시하고 기본 화면으로 열도록 보호'
        ]},
          {version:'4.9.8',date:'2026-10-26',notes:[
          '질문별로 두 사람의 답변·답변 여부를 모아 보고 작성·수정과 지난 답변 연결',
          '기록·댓글 검색과 분류·기간 조건을 서버에서 처리하고 결과만 페이지별로 표시',
          '화면·스타일·검색·질문·사진·API 소스를 기능별로 분리하고 단일 화면 빌드 검증 추가'
          ]},
          {version:'4.9.7',date:'2026-10-26',notes:[
          '모바일 기록 검색에서 상세 필터를 접고 분류·월별·기간 조건을 구분',
          '설명 글자와 버튼 영역을 키우고 밝은 화면·어두운 화면의 색상 대비 개선',
          '홈 바로가기와 더보기 상단 메뉴를 계정별로 선택하고 전체 메뉴를 용도별로 정리'
          ]},
          {version:'4.9.6',date:'2026-10-26',notes:[
          '검사 안내 시기와 실제 완료를 구분하고 지난 시기를 완료로 표시하지 않도록 수정',
          '저장된 주수와 검진 D-day를 오늘 기준으로 계산하고 날짜 변경 시 다시 확인',
          '기록일 최신순으로 서버 페이지와 화면의 월별 순서를 통일'
          ]},
          {version:'4.9.5',date:'2026-10-21',notes:[
          '로그아웃 또는 계정 전환 뒤 늦게 도착한 세션 교환 응답이 이전 로그인을 복구하지 못하도록 차단',
          '같은 구형 세션의 중복 교환 요청을 하나로 합치고 교환된 사용자 정보 일치 여부 확인',
          '로그아웃·계정 변경 시 세션 경합 회귀 테스트 추가'
          ]},
          {version:'4.9.4',date:'2026-10-21',notes:[
            '홈·기록·질문 탭을 오갈 때 각각 읽던 위치를 기억하고 다시 누르면 맨 위로 이동',
            '기록 작성 중 모바일 키보드 높이에 맞춰 작성 화면을 조정',
            '사진 추가 시 준비 완료·변환 중·대기·실패 장수를 바로 확인하도록 개선'
          ]},
          {version:'4.9.3',date:'2026-10-21',notes:[
            '결과가 없는 기록 검색에서 필터를 한 번에 해제할 수 있도록 버튼 추가',
            '작은 휴대폰의 날짜 검색 배치 및 시작일·종료일 오류 안내 개선',
            '더보기 하위 화면과 사진 확대 화면을 닫은 후 메뉴·키보드 초점 복귀 개선'
          ]},
          {version:'4.9.2',date:'2026-10-21',notes:[
            '기록 탭에서 사진만 보기 및 기분별 보기 필터가 실제로 작동하도록 수정',
            '검색·기간 필터를 기록 탭에서만 적용해 홈·질문 목록이 사라지지 않도록 개선',
            '홈 요약 카드가 기록·질문 탭에 따라오지 않도록 화면 정리'
          ]},
          {version:'4.9.1',date:'2026-10-14',notes:[
            '관리자 DB·사진 통합 암호화 백업 성공·실패 경로 검증 강화',
            '새 비운영 Supabase 복원 대상 확인 절차 보강',
            '실제 운영 백업·실복원 미완료 상태 명시 (모의 테스트와 구분)'
          ]},
          {version:'4.9.0',date:'2026-10-10',notes:[
            '큰 사진·타임랩스 표시와 만료된 사진 주소 재발급 개선',
            '사진 저장 중 입력 보호 및 중단된 작성·수정 초안 이어 저장',
            '기존 사진 삭제·순서 변경·교체와 사진 저장 버튼 추가'
          ]},
          {version:'4.8.10',date:'2026-10-09',notes:[
            '관리자용 DB 및 사진 원본 백업·복원 점검 도구 도입',
            '실제 관리자 백업 실행 여부와 개인 기기 JSON 내보내기를 명확하게 구분',
            '백업 시나리오와 복원 검증 절차 마련 (운영 복원은 별도 검증 필요)'
          ]},
          {version:'4.8.9',date:'2026-10-09',notes:[
            '업데이트 날짜·버전·변경내역 항상 표시',
            '릴리스 정합성 검사 강화',
            '기록 내보내기는 사진 원본을 포함하지 않는 JSON이며 완전 백업이 아님을 명확히 안내',
            '저장공간 정리는 자동 실행이 아닌 수동 작업임을 명확히 안내'
          ]},
          {version:'4.8.8',date:'2026-10-08',notes:[
            '안드로이드 사진 디스크 캐시 로그아웃 정리 연동',
            '서비스워커 오프라인 안정성 및 터치 조작 영역 개선'
          ]},
          {version:'4.8.7',date:'2026-10-08',notes:[
            '로그아웃 시 미완성 글·사진 초안 보관 또는 삭제 선택',
            '기기에 남는 기록·썸네일 캐시 정리 및 저장공간 정리 전 확인 강화'
          ]},
          {version:'4.8.6',date:'2026-10-08',notes:[
            'PIN 인증 전환 안정성 보완',
            '엄마 건강 기록 날짜 변경 시 입력값 잔존 방지',
            '진통 5-1-1 조건 판정과 안전 안내 정합성 개선'
          ]}
        ]
      };
      var SESSION_KEY = 'ilkong_v22_session';
      var LEGACY_SESSION_KEY = 'ilkong_v21_session';
      var OLDER_SESSION_KEY = 'ilkong_v2_session';
      var DRAFT_KEY = 'ilkong_v28_draft';
      var PENDING_SAVE_KEY = 'ilkong_v28_pending';
      var CHECKIN_DRAFT_KEY = 'ilkong_v41_checkin';
      var HERO_DENSITY_KEY = 'ilkong_v411_hero_density';
      var BACKUP_STATUS_KEY = 'ilkong_v43_backup_at';
      var PREVIOUS_DRAFT_KEY = 'ilkong_v22_draft';
      var LEGACY_DRAFT_KEY = 'ilkong_v21_draft';
      var OLDER_DRAFT_KEY = 'ilkong_v2_draft';
      var DB_NAME = 'ilkong_device_store';
      var DB_STORE = 'kv';
      var MAX_IMAGES = 8;
      var PAGE_SIZE = 20;
      var MAX_PAGE_SIZE = 500;
      var TARGET_IMAGE_BYTES = 1350000;
      var TARGET_THUMB_BYTES = 320000;
      var IMAGE_CACHE_INDEX_KEY = 'ilkong_v282_image_cache_index';
      var IMAGE_CACHE_PREFIX = 'ilkong_v282_image_cache_';
      var IMAGE_CACHE_MAX_ITEMS = 120; // v2.8.5: 형식은 그대로 두고 보관 장수만 늘려 재방문 로딩을 빠르게 한다(용량 상한 36MB는 유지).
      var IMAGE_CACHE_MAX_BYTES = 36 * 1024 * 1024;
      var IMAGE_CACHE_MAX_ITEM_BYTES = 3 * 1024 * 1024;
      var IMAGE_CACHE_MAX_AGE_MS = 45 * 24 * 60 * 60 * 1000;
      var AUTO_REFRESH_MS = 30000;
      var PULL_THRESHOLD = 72;
      var state = {
        selectedUser:'', session:null, home:null, images:[], saving:false,
        loginBusy:false, loginAttemptGeneration:0,
        openComments:{}, sheetReturn:{}, favoriteBusy:{}, commentDrafts:{}, replyTargets:{}, commentOperations:{}, engagementBusy:{}, commentReadMarking:{}, commentUnreadSeen:{}, pendingEngagementUpdates:{}, refreshing:false, refreshPromise:null,
        revision:'', homeFingerprint:'', autoRefreshTimer:null, lastRefreshAt:0, homeDateKey:'', homeFromSnapshot:false, dateRefreshNeeded:false,
        lastInteractionAt:0, autoRefreshFailures:0, lastAutoCheckAt:0, checkingUpdates:false, commentComposing:false, imeComposing:false, compositionTarget:null, compositionSerial:0, compositionWatchdogTimer:null, draftSaveTimer:null, draftSavePending:false, searchApplyTimer:null, searchApplyPending:false, pendingFeedRender:null, pendingFeedRenderTimer:null, homeApplyGeneration:0, pullStartY:0, pullDistance:0, pulling:false,
        hasMore:false, nextOffset:0, loadedCount:PAGE_SIZE, loadingMore:false, loadingAll:false, loadingAllPromise:null, selectedMood:'', saveAttempt:null,
        imageCache:{}, imageCacheOrder:[], imageInFlight:{}, imageObserver:null, dialogReturnFocus:null, viewerReturnFocus:null,
        imagePersistentReads:{},remoteThumbFetching:{}, imagePersistentKnown:{}, imagePersistChain:Promise.resolve(), homeSnapshotPersistChain:Promise.resolve(), pendingPersistChain:Promise.resolve(), logoutBusy:false, imageCacheReady:false,
        imageLoadQueue:[], imageLoadActive:0, imageLoadSerial:0, imageFallbackTimers:{},
        imageQueueRunning:false, imageBatchSupport:null, imageDataApiName:'', composerMode:'create', editingPostId:'', editExistingPhotoCount:0, offlineQueued:false, offlineFlushTimer:null, pendingRestored:false, composerMutationGeneration:0, composerClosing:false,
        searchQuery:'', viewFilter:'ALL', monthFilter:'', rangeFrom:'', rangeTo:'', activeTab:'home', tabViews:{}, recordSegment:'ALL', catFilter:'', viewerImages:[], viewerIndex:0, viewerTouchX:0, composerBackup:null, editAttempt:null, weekGuideOpen:false, birthBusy:false, kick:null, kickTimer:null, checkupBusy:false,
        checkinMood:'', checkinCondition:'', checkinAttempt:null, checkinBusy:false, homeSummaryChecklist:[], homeSummaryChecklistAt:0, homeSummaryChecklistLoading:false, memoryMonth:'', memoryVisibleLimit:36, loadingMemoryPosts:false, heroExpanded:false, lastSyncAt:0, lastSyncError:''
      };

      function el(id){ return document.getElementById(id); }
      function show(node){ if(node) node.classList.remove('hidden'); }
      function hide(node){ if(node) node.classList.add('hidden'); }
      function text(node,value){ if(node) node.textContent = value == null ? '' : String(value); }
      function releaseDateLabel(isoDate){ return String(isoDate||'').replace(/-/g,'.'); }
      function releaseVersionLine(){
        var zone=RELEASE_INFO.timezone==='Asia/Seoul'?'KST':RELEASE_INFO.timezone;
        return 'v'+RELEASE_INFO.version+' · '+releaseDateLabel(RELEASE_INFO.date)+' 업데이트 ('+zone+')';
      }
      function renderReleaseHistory(id){
        var target=el(id);
        if(!target) return;
        target.textContent='';
        var releases=[{version:RELEASE_INFO.version,date:RELEASE_INFO.date,notes:RELEASE_INFO.notes}].concat(RELEASE_INFO.history);
        releases.forEach(function(release){
          var section=document.createElement('section');
          section.className='release-entry';
          var heading=document.createElement('h4');
          heading.appendChild(document.createTextNode('v'+release.version));
          var date=document.createElement('time');
          date.dateTime=release.date;
          text(date,releaseDateLabel(release.date));
          heading.appendChild(date);
          section.appendChild(heading);
          var items=document.createElement('ul');
          (release.notes||[]).forEach(function(note){
            var item=document.createElement('li');
            text(item,note);
            items.appendChild(item);
          });
          section.appendChild(items);
          target.appendChild(section);
        });
      }
      function renderReleaseInfo(){
        text(el('loginVersion'),'일콩 기록 '+releaseVersionLine());
        text(el('versionText'),releaseVersionLine());
        var stamp='최신 버전 v'+RELEASE_INFO.version+' · '+releaseDateLabel(RELEASE_INFO.date);
        text(el('loginReleaseStamp'),stamp);
        text(el('settingsReleaseStamp'),stamp);
        renderReleaseHistory('loginReleaseHistory');
        renderReleaseHistory('settingsReleaseHistory');
      }
      function markComposerMutation(){ state.composerMutationGeneration++; }

      // Android WebView에서는 한글 조합 중 포커스 이동·DOM 교체·동기 저장이 겹치면
      // InputConnection이 끊길 수 있다. 모든 동적 입력창까지 문서 캡처 단계에서 함께 추적한다.
      function isTextEntry(node){
        return !!(node&&(/^(INPUT|TEXTAREA)$/.test(node.tagName)||node.isContentEditable));
      }
      function isImeComposing(node){
        return !!(state.imeComposing||(node&&node.__ilkongImeComposing));
      }
      function hasFinePointer(){
        return !!(window.matchMedia&&window.matchMedia('(pointer:fine)').matches);
      }
      function clearCompositionWatchdog(){
        if(state.compositionWatchdogTimer){ clearTimeout(state.compositionWatchdogTimer); state.compositionWatchdogTimer=null; }
      }
      function afterCompositionSettled(target){
        if(!target) return;
        var draftTarget=target.id==='postBody'||target.id==='postTitle';
        var searchTarget=target.id==='searchInput';
        var checkinTarget=target.id==='checkinNote';
        if(draftTarget) scheduleDraftSave();
        else if(searchTarget) scheduleSearchApply(target,0);
        else if(checkinTarget) persistCheckinDraft();
        else if(target.classList&&target.classList.contains('comment-input')){
          limitCommentInput(target);
          rememberCommentDraft(target);
        }
        if(state.draftSavePending&&!draftTarget) scheduleDraftSave();
        if(state.searchApplyPending&&!searchTarget) scheduleSearchApply(el('searchInput'),0);
        schedulePendingFeedRender(80);
      }
      function settleComposition(target,serial){
        if(!target) return;
        if(serial!==state.compositionSerial||state.compositionTarget!==target){
          if(state.compositionTarget!==target) target.__ilkongImeComposing=false;
          return;
        }
        clearCompositionWatchdog();
        target.__ilkongImeComposing=false;
        state.imeComposing=false;
        state.compositionTarget=null;
        state.commentComposing=false;
        afterCompositionSettled(target);
      }
      function armCompositionWatchdog(target,serial,attempt){
        clearCompositionWatchdog();
        state.compositionWatchdogTimer=setTimeout(function(){
          state.compositionWatchdogTimer=null;
          if(serial!==state.compositionSerial||state.compositionTarget!==target){
            if(state.compositionTarget!==target) target.__ilkongImeComposing=false;
            return;
          }
          var targetStillActive=!!(target.isConnected&&document.activeElement===target);
          if(targetStillActive){
            // 포커스가 살아 있는 동안에는 시간이 오래 지나도 한글 조합을 강제로 끝내지 않는다.
            // compositionend가 누락된 경우에도 버튼을 누르거나 입력칸을 벗어나면 focusout이 안전하게 정리한다.
            armCompositionWatchdog(target,serial,Math.min(attempt+1,2));
            return;
          }
          // 포커스를 이미 벗어난 입력칸만 정리해 저장·갱신이 영구 정지하지 않게 한다.
          settleComposition(target,serial);
        },attempt===0?5000:2500);
      }
      // v2.9.5: Android WebView(APK)에서는 입력칸에 처음 포커스될 때 IME InputConnection이
      // 크로스 도메인 iframe(Google Sites → Apps Script 샌드박스) 안의 입력칸에 제대로 붙지 못해
      // 한글 조합만 죽는 경우가 있다(영어는 단순 키 입력이라 통과됨).
      // 키보드를 접었다 펴면 시스템이 restartInput을 호출해 복구되는 것과 같은 일을 자동으로 해 준다.
      var IS_ILKONG_APK=/IlkongNotify/i.test(navigator.userAgent||'')||!!window.IlkongDeviceAuth;
      // 화면이 메인 프레임에서 직접 돌면(새 APK) IME 재연결이 필요 없다. iframe(구 APK·Sites) 안일 때만 켠다.
      var NEEDS_IME_KICK=IS_ILKONG_APK&&(function(){ try{ return window.top!==window.self; }catch(e){ return true; } })();
      function kickImeConnection(target){
        if(!NEEDS_IME_KICK||!target) return;
        var now=Date.now();
        if(target.__ilkongImeKickAt&&now-target.__ilkongImeKickAt<1500) return;
        target.__ilkongImeKickAt=now;
        setTimeout(function(){
          if(!target.isConnected||document.activeElement!==target) return;
          if(isImeComposing(target)) return; // 이미 한글 조합이 시작됐다면 IME가 정상이니 건드리지 않는다.
          if(window.IlkongIme&&typeof window.IlkongIme.kickIme==='function'){
            // 새 APK: 키보드를 유지한 채 네이티브 restartInput만 호출(가장 안전).
            try{ window.IlkongIme.kickIme(); return; }catch(e){}
          }
          // 구형 APK(브리지 없음): blur → 다음 틱 focus로 InputConnection만 재시작.
          // Chromium은 포커스 이동 직후의 키보드 숨김을 지연시키므로 키보드는 내려가지 않는다.
          var x=window.scrollX||0,y=window.scrollY||0;
          try{ target.blur(); }catch(e){}
          setTimeout(function(){
            if(!target.isConnected) return;
            try{ target.focus({preventScroll:true}); }catch(e){ try{ target.focus(); }catch(e2){} }
            window.scrollTo(x,y);
          },0);
        },80);
      }
      function bindImeStability(){
        document.addEventListener('focusin',function(event){
          var target=event.target;
          if(!isTextEntry(target)) return;
          kickImeConnection(target);
        },true);
        document.addEventListener('compositionstart',function(event){
          var target=event.target;
          if(!isTextEntry(target)) return;
          var previous=state.compositionTarget;
          if(previous&&previous!==target){
            previous.__ilkongImeComposing=false;
            afterCompositionSettled(previous);
          }
          clearCompositionWatchdog();
          var serial=++state.compositionSerial;
          state.imeComposing=true;
          state.compositionTarget=target;
          state.commentComposing=!!(target.classList&&target.classList.contains('comment-input'));
          target.__ilkongImeComposing=true;
          state.lastInteractionAt=Date.now();
          armCompositionWatchdog(target,serial,0);
        },true);
        document.addEventListener('compositionend',function(event){
          var target=event.target;
          if(!isTextEntry(target)) return;
          if(state.compositionTarget!==target){ target.__ilkongImeComposing=false; return; }
          clearCompositionWatchdog();
          var serial=++state.compositionSerial;
          state.lastInteractionAt=Date.now();
          // 일부 삼성 키보드/WebView는 compositionend 뒤 마지막 input을 한 틱 늦게 보낸다.
          setTimeout(function(){
            if(serial!==state.compositionSerial){
              if(state.compositionTarget!==target) target.__ilkongImeComposing=false;
              return;
            }
            settleComposition(target,serial);
          },120);
        },true);
        document.addEventListener('focusout',function(event){
          var target=event.target;
          if(target===state.compositionTarget){
            var serial=state.compositionSerial;
            setTimeout(function(){
              if(serial===state.compositionSerial&&state.compositionTarget===target&&document.activeElement!==target) settleComposition(target,serial);
            },160);
          }
          if(target&&(target.id==='postBody'||target.id==='postTitle')) scheduleDraftSave();
          else if(target&&target.classList&&target.classList.contains('comment-input')&&!isImeComposing(target)) rememberCommentDraft(target);
          schedulePendingFeedRender(100);
        },true);
      }

      function scheduleSearchApply(input,delay){
        if(state.searchApplyTimer){ clearTimeout(state.searchApplyTimer); state.searchApplyTimer=null; }
        state.searchApplyPending=true;
        if(!input||isImeComposing(input)) return;
        state.searchApplyTimer=setTimeout(function(){
          state.searchApplyTimer=null;
          if(isImeComposing(input)) return;
          state.searchApplyPending=false;
          state.searchQuery=String(input.value||'').trim().toLowerCase();
          renderPosts(state.home&&state.home.posts||[]);
        },typeof delay==='number'?delay:120);
      }

      window.addEventListener('error', function (event) {
        showFatal(event.message || '알 수 없는 화면 오류');
      });
      window.addEventListener('unhandledrejection', function (event) {
        var reason = event.reason && event.reason.message ? event.reason.message : event.reason;
        showFatal(reason || '처리하지 못한 오류');
      });

      function showFatal(message){
        text(el('fatalText'), String(message || '').slice(0,240));
        show(el('fatal'));
      }

      function storageGet(key){ try { return window.localStorage.getItem(key); } catch(e){ return null; } }
      function storageSet(key,value){ try { window.localStorage.setItem(key,value); return true; } catch(e){ return false; } }
      function storageRemove(key){ try { window.localStorage.removeItem(key); } catch(e){} }
      function currentUserId(){ return state.session&&state.session.user&&state.session.user.id?String(state.session.user.id):''; }
      function draftKey(userId){ return DRAFT_KEY+'_'+String(userId||'').toUpperCase(); }
      function pendingSaveKey(userId){ return PENDING_SAVE_KEY+'_'+String(userId||'').toUpperCase(); }
      function checkinDraftKey(userId){ return CHECKIN_DRAFT_KEY+'_'+String(userId||'').toUpperCase(); }
      function backupStatusKey(userId){ return BACKUP_STATUS_KEY+'_'+String(userId||'').toUpperCase(); }

      function nativeGetSession(){
        try {
          if(window.IlkongDeviceAuth && typeof window.IlkongDeviceAuth.getSession === 'function'){
            return window.IlkongDeviceAuth.getSession() || '';
          }
        } catch(e){}
        return '';
      }
      function nativeSaveSession(value){
        try {
          if(window.IlkongDeviceAuth && typeof window.IlkongDeviceAuth.saveSession === 'function'){
            window.IlkongDeviceAuth.saveSession(value);
          }
        } catch(e){}
      }
      function nativeClearSession(){
        try {
          if(window.IlkongDeviceAuth && typeof window.IlkongDeviceAuth.clearSession === 'function'){
            window.IlkongDeviceAuth.clearSession();
          }
        } catch(e){}
      }

      function openDb(){
        return new Promise(function(resolve,reject){
          if(!window.indexedDB){ reject(new Error('IndexedDB 미지원')); return; }
          var request;
          try { request = window.indexedDB.open(DB_NAME,1); }
          catch(e){ reject(e); return; }
          request.onupgradeneeded=function(){
            var db=request.result;
            if(!db.objectStoreNames.contains(DB_STORE)) db.createObjectStore(DB_STORE);
          };
          request.onsuccess=function(){ resolve(request.result); };
          request.onerror=function(){ reject(request.error || new Error('기기 저장소를 열지 못했어.')); };
        });
      }
      function idbGet(key){
        return openDb().then(function(db){
          return new Promise(function(resolve,reject){
            var tx=db.transaction(DB_STORE,'readonly');
            var req=tx.objectStore(DB_STORE).get(key);
            req.onsuccess=function(){ resolve(req.result || null); };
            req.onerror=function(){ reject(req.error); };
            tx.oncomplete=function(){ db.close(); };
          });
        });
      }
      function idbSet(key,value){
        return openDb().then(function(db){
          return new Promise(function(resolve,reject){
            var tx=db.transaction(DB_STORE,'readwrite');
            tx.objectStore(DB_STORE).put(value,key);
            tx.oncomplete=function(){ db.close(); resolve(true); };
            tx.onerror=function(){ db.close(); reject(tx.error); };
          });
        });
      }
      function idbRemove(key){
        return openDb().then(function(db){
          return new Promise(function(resolve,reject){
            var tx=db.transaction(DB_STORE,'readwrite');
            tx.objectStore(DB_STORE).delete(key);
            tx.oncomplete=function(){ db.close(); resolve(true); };
            tx.onerror=function(){ db.close(); reject(tx.error); };
          });
        });
      }

      function parseSession(raw){
        if(!raw) return null;
        try {
          var session = typeof raw === 'string' ? JSON.parse(raw) : raw;
          if(!session || !session.token || !session.user || !session.user.id || !session.expiresAt) return null;
          if(Date.now() >= Number(session.expiresAt)) return null;
          return session;
        } catch(e){ return null; }
      }

      function readSessionSync(){
        return parseSession(nativeGetSession()) ||
          parseSession(storageGet(SESSION_KEY)) ||
          parseSession(storageGet(LEGACY_SESSION_KEY)) ||
          parseSession(storageGet(OLDER_SESSION_KEY));
      }

      function recoverSessionAsync(){
        return idbGet(SESSION_KEY).then(function(raw){
          var current=parseSession(raw);
          if(current) return current;
          return idbGet(LEGACY_SESSION_KEY).then(function(oldRaw){
            var legacy=parseSession(oldRaw);
            if(legacy) return legacy;
            return idbGet(OLDER_SESSION_KEY).then(parseSession).catch(function(){ return null; });
          }).catch(function(){ return null; });
        }).catch(function(){ return null; });
      }

      function saveSession(session){
        var raw=JSON.stringify(session);
        storageSet(SESSION_KEY,raw);
        storageRemove(LEGACY_SESSION_KEY);
        storageRemove(OLDER_SESSION_KEY);
        nativeSaveSession(raw);
        idbSet(SESSION_KEY,raw).then(function(){
          idbRemove(LEGACY_SESSION_KEY).catch(function(){});
          idbRemove(OLDER_SESSION_KEY).catch(function(){});
        }).catch(function(){});
      }

      function clearSession(){
        storageRemove(SESSION_KEY);
        storageRemove(LEGACY_SESSION_KEY);
        storageRemove(OLDER_SESSION_KEY);
        nativeClearSession();
        supabaseToken='';
        state.session=null;
        return Promise.all([
          idbRemove(SESSION_KEY).catch(function(){}),
          idbRemove(LEGACY_SESSION_KEY).catch(function(){}),
          idbRemove(OLDER_SESSION_KEY).catch(function(){})
        ]);
      }

      function boot(){
        try {
          renderReleaseInfo();
          initTheme();
          initHeroDensity();
          bind();
          bindOfflineWatchers();
          setupPwa();
          el('recordDate').value=today();
          prunePersistentImageCache().catch(function(){});
          var session=readSessionSync();
          if(session){
            activateStoredSession(session);
            return;
          }
          var recoveryGeneration=state.loginAttemptGeneration;
          recoverSessionAsync().then(function(recovered){
            if(recovered && !state.session && !state.loginBusy && recoveryGeneration===state.loginAttemptGeneration) activateStoredSession(recovered);
          });
        } catch(error){
          showFatal(errorMessage(error));
        }
      }

      function activateStoredSession(session){
        state.session=session;
        supabaseToken='';
        saveSession(session);
        restoreDraft(session.user.id);
        enterAppImmediately(session.user);
        restoreHomeSnapshot();
        restorePendingSave(session.user.id).then(function(restored){
          if(restored&&state.composerMode==='create'&&state.saveAttempt){ state.offlineQueued=true; renderOfflineBanner(); scheduleOfflineFlush(4000); }
        });
        loadHome({source:'initial',force:true});
      }

      function bind(){
        bindImeStability();
        var userButtons=document.querySelectorAll('.user-btn');
        for(var i=0;i<userButtons.length;i++) userButtons[i].addEventListener('click',selectUser);
        el('loginButton').addEventListener('click',login);
        el('pin').addEventListener('keydown',function(e){ if(e.key==='Enter') login(); });
        el('heroToggle').addEventListener('click',function(){ setHeroExpanded(!state.heroExpanded,true); });
        el('quickWrite').addEventListener('click',openComposer);
        el('openCheckin').addEventListener('click',openCheckin);
        el('summaryCheckup').addEventListener('click',openSettings);
        el('summaryChecklist').addEventListener('click',openHomeShortcut);
        el('homeShortcutSelect').addEventListener('change',function(){
          var prefs=shortcutPreferences();
          if(!saveShortcutPreferences(this.value,prefs.favorites)) this.value=prefs.home;
        });
        el('closeCheckin').addEventListener('click',function(){ if(!state.checkinBusy){ persistCheckinDraft(); closeOverlaySheet('checkin'); } });
        el('checkin').addEventListener('click',function(e){ if(e.target===el('checkin')&&!state.checkinBusy){ persistCheckinDraft(); closeOverlaySheet('checkin'); } });
        el('saveCheckin').addEventListener('click',saveCheckin);
        var checkinMoodButtons=document.querySelectorAll('.checkin-mood');
        for(var cm=0;cm<checkinMoodButtons.length;cm++) checkinMoodButtons[cm].addEventListener('click',function(){ state.checkinMood=this.getAttribute('data-checkin-mood')||''; renderCheckinChoices(); persistCheckinDraft(); });
        var checkinConditionButtons=document.querySelectorAll('.checkin-condition');
        for(var cc=0;cc<checkinConditionButtons.length;cc++) checkinConditionButtons[cc].addEventListener('click',function(){ state.checkinCondition=this.getAttribute('data-checkin-condition')||''; renderCheckinChoices(); persistCheckinDraft(); });
        el('checkinNote').addEventListener('input',function(e){ if(e.isComposing||isImeComposing(this)) return; persistCheckinDraft(); });
        el('quickKick').addEventListener('click',openKickCounter);
        el('closeKick').addEventListener('click',closeKickCounter);
        el('kickTap').addEventListener('click',kickTap);
        el('kickUndo').addEventListener('click',kickUndo);
        el('kickReset').addEventListener('click',kickReset);
        el('saveKick').addEventListener('click',saveKickRecord);
        el('quickPhoto').addEventListener('click',openPhotoPicker);
        // v3.7.0: 사파리(아이폰)는 사용자가 누른 그 순간에만 파일 선택창을 허용한다.
        // 그래서 지연 없이 즉시 열고, 작성 화면은 그 뒤에 연다.
        el('pickerAlbum').addEventListener('click',function(){ hide(el('photoPicker')); el('photoInput').click(); openComposer(); });
        el('pickerCamera').addEventListener('click',function(){ hide(el('photoPicker')); el('cameraInput').click(); openComposer(); });
        el('pickerCancel').addEventListener('click',function(){ closeOverlaySheet('photoPicker'); });
        el('photoPicker').addEventListener('click',function(e){ if(e.target===el('photoPicker')) closeOverlaySheet('photoPicker'); });
        el('closeComposer').addEventListener('click',closeComposer);
        el('composer').addEventListener('click',function(e){ if(e.target===el('composer')&&!state.saving) closeComposer(); });
        el('pickPhotos').addEventListener('click',function(){ el('photoInput').click(); });
        el('takePhoto').addEventListener('click',function(){ el('cameraInput').click(); });
        el('photoInput').addEventListener('change',function(e){ addFiles(e.target.files); e.target.value=''; });
        el('cameraInput').addEventListener('change',function(e){ addFiles(e.target.files); e.target.value=''; });
        el('composer').addEventListener('click',function(event){if((state.saving||composerDraftLocked())&&event.target.closest('summary')){event.preventDefault();event.stopPropagation();}},true);
        el('savePost').addEventListener('click',savePost);
        el('downloadPhoto').addEventListener('click',downloadCurrentPhoto);
        el('settingsButton').addEventListener('click',openSettings);
        el('closeSettings').addEventListener('click',closeSettings);
        el('settings').addEventListener('click',function(e){ if(e.target===el('settings')) closeSettings(); });
        el('retryFeed').addEventListener('click',function(){ refreshHome({source:'manual',force:true}); });
        el('birthConfirm').addEventListener('click',function(){
          var value=String(el('birthDateInput').value||'').trim();
          if(!value){ toast('출생일을 먼저 선택해 줘.'); return; }
          if(!confirm('출생일을 '+value+'로 설정할까? 앱 상단이 생후 기록으로 바뀌어. (설정에서 되돌릴 수 있어)')) return;
          setBirthAction(value);
        });
        el('birthRevert').addEventListener('click',function(){
          if(!confirm('임신 모드로 되돌릴까? 기록과 사진은 그대로 안전해.')) return;
          setBirthAction('');
        });
        el('checkupSave').addEventListener('click',function(){
          var value=String(el('checkupDateInput').value||'').trim();
          if(!value){ toast('검진 날짜를 먼저 선택해 줘.'); return; }
          setCheckupAction(value);
        });
        el('checkupClear').addEventListener('click',function(){
          if(!confirm('저장된 검진일을 지울까?')) return;
          el('checkupDateInput').value='';
          setCheckupAction('');
        });
        el('loadMore').addEventListener('click',loadMorePosts);
        el('searchInput').addEventListener('input',function(e){ state.lastInteractionAt=Date.now(); if(e.isComposing||isImeComposing(this)) return; scheduleSearchApply(this); });
        el('viewFilter').addEventListener('change',function(){ setLibraryCategoryFilter(this.value); });
        el('toggleLibraryFilters').addEventListener('click',toggleLibraryFilters);
        el('libraryPeriodType').addEventListener('change',function(){ setLibraryPeriod(this.value); });
        el('monthFilter').addEventListener('change',function(){ state.monthFilter=this.value; renderPosts(state.home&&state.home.posts||[]); });
        function applyRange(){
          state.rangeFrom=el('rangeFrom').value||''; state.rangeTo=el('rangeTo').value||'';
          var invalid=!!(state.rangeFrom&&state.rangeTo&&state.rangeFrom>state.rangeTo);
          text(el('rangeWarning'),invalid?'시작일이 종료일보다 늦어. 날짜를 다시 골라 줘.':'');
          el('rangeWarning').classList.toggle('hidden',!invalid);
          el('rangeFrom').setAttribute('aria-invalid',invalid?'true':'false');
          el('rangeTo').setAttribute('aria-invalid',invalid?'true':'false');
          if(!invalid) renderPosts(state.home&&state.home.posts||[]);
        }
        el('rangeFrom').addEventListener('change',applyRange);
        el('rangeTo').addEventListener('change',applyRange);
        el('rangeClear').addEventListener('click',function(){ setLibraryPeriod('all'); });
        el('loadAllRecords').addEventListener('click',refreshPagedFeed);
        el('clearLibraryFilters').addEventListener('click',resetLibraryFilters);
        el('feed').addEventListener('click',function(e){
          if(e.target&&e.target.closest&&e.target.closest('#resetEmptyFilters')) resetLibraryFilters();
        });
        el('resumePending').addEventListener('click',function(){ openComposer(); });
        el('discardPending').addEventListener('click',discardPendingSave);
        el('offlineRetry').addEventListener('click',function(){ toast('지금 올려볼게…'); flushOfflineQueue(); });
        el('openTimelapse').addEventListener('click',openTimelapse);
        el('openMemories').addEventListener('click',openMemories);
        el('closeMemories').addEventListener('click',function(){ closeOverlaySheet('memories'); });
        el('memories').addEventListener('click',function(e){ if(e.target===el('memories')) closeOverlaySheet('memories'); });
        el('memoryMonth').addEventListener('change',function(){ state.memoryMonth=this.value||''; state.memoryVisibleLimit=36; renderMemories(); });
        el('moreMemories').addEventListener('click',showMoreMemories);
        el('closeLapse').addEventListener('click',function(){ stopLapsePlay(); closeOverlaySheet('lapseViewer'); });
        el('lapsePrev').addEventListener('click',function(){ stopLapsePlay(); moveLapse(-1); });
        el('lapseNext').addEventListener('click',function(){ stopLapsePlay(); moveLapse(1); });
        el('lapsePlay').addEventListener('click',toggleLapsePlay);
        el('lapseShoot').addEventListener('click',function(){ stopLapsePlay(); closeOverlaySheet('lapseViewer'); openTimelapseCamera(); });
        el('openCapsule').addEventListener('click',openCapsule);
        el('closeCapsule').addEventListener('click',function(){ closeOverlaySheet('capsule'); });
        el('capsule').addEventListener('click',function(e){ if(e.target===el('capsule')) closeOverlaySheet('capsule'); });
        el('sealCapsule').addEventListener('click',sealCapsule);
        el('openCheckupNotes').addEventListener('click',openCheckupNotes);
        el('closeCheckupNotes').addEventListener('click',function(){ closeOverlaySheet('checkupNotes'); });
        el('checkupNotes').addEventListener('click',function(e){ if(e.target===el('checkupNotes')) closeOverlaySheet('checkupNotes'); });
        el('saveCheckupNote').addEventListener('click',saveCheckupNoteAction);
        el('openBook').addEventListener('click',openBookMaker);
        el('closeBook').addEventListener('click',function(){ closeOverlaySheet('bookMaker'); });
        el('bookMaker').addEventListener('click',function(e){ if(e.target===el('bookMaker')) closeOverlaySheet('bookMaker'); });
        el('makeBook').addEventListener('click',makeBookAction);
        el('weeklyPrompt').addEventListener('click',function(){ openWeeklyAnswer(this.__ilkongQuestion||''); });
        el('openChecklist').addEventListener('click',openChecklist);
        el('openKickMore').addEventListener('click',function(){ hide(el('moreSheet')); state.sheetReturn.kickCounter='moreSheet'; openKickCounter(); });
        el('openLaborMore').addEventListener('click',function(){ hide(el('moreSheet')); state.sheetReturn.laborTimer='moreSheet'; openLaborTimer(); });
        el('runCleanup').addEventListener('click',runCleanup);
        el('checkupSuggest').addEventListener('click',applyCheckupSuggestion);
        el('openHealthMore').addEventListener('click',function(){ hide(el('moreSheet')); state.sheetReturn.healthSheet='moreSheet'; openHealthSheet(); });
        el('closeHealth').addEventListener('click',function(){ closeOverlaySheet('healthSheet'); });
        el('saveHealth').addEventListener('click',saveHealthLog);
        el('healthDate').addEventListener('change',function(){ fillHealthFormForDate(); renderHealthCharts(); });
        el('healthSys').addEventListener('input',renderHealthAlert);
        el('healthDia').addEventListener('input',renderHealthAlert);
        el('saveHealthProfile').addEventListener('click',saveHealthProfile);
        el('openBirthPlanMore').addEventListener('click',function(){ hide(el('moreSheet')); state.sheetReturn.birthPlanSheet='moreSheet'; openBirthPlan(); });
        el('closeBirthPlan').addEventListener('click',function(){ closeOverlaySheet('birthPlanSheet'); });
        el('saveBirthPlan').addEventListener('click',saveBirthPlanNow);
        el('closeLabor').addEventListener('click',closeLaborTimer);
        el('laborTap').addEventListener('click',tapLabor);
        el('laborUndo').addEventListener('click',undoLabor);
        el('laborReset').addEventListener('click',resetLabor);
        el('saveLabor').addEventListener('click',saveLaborRecord);
        el('closeChecklist').addEventListener('click',function(){ closeOverlaySheet('checklist'); });
        el('checklist').addEventListener('click',function(e){ if(e.target===el('checklist')) closeOverlaySheet('checklist'); });
        el('addCheckItem').addEventListener('click',addChecklistItem);
        el('checkItemInput').addEventListener('keydown',function(e){ if(e.key==='Enter'&&!e.isComposing&&e.keyCode!==229&&!isImeComposing(this)){ e.preventDefault(); addChecklistItem(); } });
        el('lapseExport').addEventListener('click',exportLapseVideo);
        el('themeSystem').addEventListener('click',function(){ applyThemeMode('system'); });
        el('themeLight').addEventListener('click',function(){ applyThemeMode('light'); });
        el('themeDark').addEventListener('click',function(){ applyThemeMode('dark'); });
        el('changePin').addEventListener('click',changePinAction);
        ['notifyPost','notifyComment','notifyQuiet'].forEach(function(id){ el(id).addEventListener('change',collectNotifyPrefs); });
        if(el('enablePushBtn')) el('enablePushBtn').addEventListener('click',enablePushNotifications);
        if(el('disablePushBtn')) el('disablePushBtn').addEventListener('click',disablePushNotifications);
        if(el('testPushBtn')) el('testPushBtn').addEventListener('click',sendTestPushAction);
        el('exportData').addEventListener('click',exportDataAction);
        el('openTrip').addEventListener('click',function(){ hide(el('moreSheet')); state.sheetReturn.tripSheet='moreSheet'; openTripSheet(); });
        el('closeTrip').addEventListener('click',function(){ closeOverlaySheet('tripSheet'); });
        el('tripSheet').addEventListener('click',function(e){ if(e.target===el('tripSheet')) closeOverlaySheet('tripSheet'); });
        el('saveTrip').addEventListener('click',function(){
          var from=String(el('tripFrom').value||'').trim(), to=String(el('tripTo').value||'').trim();
          if(!from||!to){ toast('출발일과 도착일을 모두 골라 줘.'); return; }
          if(from>to){ toast('출발일이 도착일보다 늦어.'); return; }
          saveTripAction(String(el('tripName').value||'').trim()||'여행',from,to);
        });
        el('clearTrip').addEventListener('click',function(){
          if(!confirm('여행 설정을 지울까? 기록은 그대로 남아.')) return;
          el('tripName').value=''; el('tripFrom').value=''; el('tripTo').value='';
          saveTripAction('','','');
        });
        var tabButtons=document.querySelectorAll('.tab');
        for(var ti=0;ti<tabButtons.length;ti++) tabButtons[ti].addEventListener('click',function(){ activateTab(this.getAttribute('data-tab')); });
        el('toTop').addEventListener('click',function(){ try{ window.scrollTo({top:0,behavior:'smooth'}); }catch(scrollErr){ window.scrollTo(0,0); } });
        window.addEventListener('scroll',function(){ var on=(window.scrollY||0)>500&&!el('appPage').classList.contains('hidden')&&!overlayOpen(); el('toTop').classList.toggle('show',on); },{passive:true});
        var segButtons=document.querySelectorAll('#recordsSeg .seg');
        for(var si=0;si<segButtons.length;si++) segButtons[si].addEventListener('click',function(){ selectRecordSegment(this.getAttribute('data-seg')); });
        el('closeMore').addEventListener('click',function(){ closeOverlaySheet('moreSheet'); });
        el('moreSheet').addEventListener('click',function(e){ if(e.target===el('moreSheet')) closeOverlaySheet('moreSheet'); });
        el('openSettingsMore').addEventListener('click',function(){ hide(el('moreSheet')); openSettings(); state.sheetReturn.settings='moreSheet'; });
        var moreTargets={openTimelapse:'lapseViewer',openMemories:'memories',openCapsule:'capsule',openCheckupNotes:'checkupNotes',openChecklist:'checklist',openKickMore:'kickCounter',openLaborMore:'laborTimer',openHealthMore:'healthSheet',openBirthPlanMore:'birthPlanSheet',openBook:'bookMaker'};
        Object.keys(moreTargets).forEach(function(id){
          el(id).addEventListener('click',function(){
            hide(el('moreSheet'));
            state.sheetReturn[moreTargets[id]]='moreSheet';
          });
        });
        el('closeGuidebook').addEventListener('click',function(){ closeOverlaySheet('guidebook'); });
        el('guidebook').addEventListener('click',function(e){ if(e.target===el('guidebook')) closeOverlaySheet('guidebook'); });

        el('closeViewer').addEventListener('click',closePhotoViewer);
        el('viewerPrev').addEventListener('click',function(){ moveViewer(-1); });
        el('viewerNext').addEventListener('click',function(){ moveViewer(1); });
        el('viewerStage').addEventListener('touchstart',function(e){ state.viewerTouchX=(e.touches.length===1&&!zoomIsActive()&&Date.now()>=viewerZoom.multiUntil)?e.touches[0].clientX:0; },{passive:true});
        el('viewerStage').addEventListener('touchend',function(e){
          var startX=state.viewerTouchX; state.viewerTouchX=0;
          if(!startX||!e.changedTouches.length||e.touches.length>0) return;
          if(zoomIsActive()||Date.now()<viewerZoom.multiUntil) return; // 확대 중이거나 핀치 직후에는 사진을 넘기지 않는다
          var dx=e.changedTouches[0].clientX-startX;
          if(Math.abs(dx)>55) moveViewer(dx>0?-1:1);
        },{passive:true});
        el('logout').addEventListener('click',logout);
        el('postBody').addEventListener('input',function(e){ state.lastInteractionAt=Date.now(); markComposerMutation(); if(!e.isComposing&&!isImeComposing(this)) scheduleDraftSave(); });
        if(window.visualViewport){
          window.visualViewport.addEventListener('resize',syncComposerViewport);
          window.visualViewport.addEventListener('scroll',syncComposerViewport);
        }
        window.addEventListener('resize',syncComposerViewport);
        el('postTitle').addEventListener('input',function(e){ state.lastInteractionAt=Date.now(); markComposerMutation(); if(!e.isComposing&&!isImeComposing(this)) scheduleDraftSave(); });
        el('recordDate').addEventListener('change',function(){ markComposerMutation(); saveDraft(); });
        el('category').addEventListener('change',function(){ markComposerMutation(); saveDraft(); });
        // 작성 화면 기분 버튼만 연결한다. 체크인 버튼도 .mood-btn 클래스를 쓰기 때문에
        // 전체 선택자를 쓰면 체크인 기분을 누를 때 작성 중 초안의 기분이 같이 바뀔 수 있다.
        var moodButtons=document.querySelectorAll('#moodChoices .mood-btn');
        for(var m=0;m<moodButtons.length;m++) moodButtons[m].addEventListener('click',function(){ selectMood(this.getAttribute('data-mood')); });
        initPullRefresh();
        document.addEventListener('visibilitychange',function(){
          if(!document.hidden&&state.session) refreshDateContext();
          if(!document.hidden && state.session && (state.dateRefreshNeeded||Date.now()-state.lastRefreshAt>=AUTO_REFRESH_MS)){
            setTimeout(checkForUpdates,250);
          }
        });
        ['scroll','touchstart','pointerdown','keydown'].forEach(function(name){
          window.addEventListener(name,function(){ state.lastInteractionAt=Date.now(); },{passive:true});
        });
        document.addEventListener('keydown',function(e){
          if(e.key==='Tab'&&trapDialogFocus(e)) return;
          if(e.key!=='Escape'||state.saving) return;
          closeTopDialogFromKeyboard();
        });
      }

      function selectUser(e){
        if(state.loginBusy) return;
        state.selectedUser=e.currentTarget.getAttribute('data-user');
        var buttons=document.querySelectorAll('.user-btn');
        for(var i=0;i<buttons.length;i++) buttons[i].classList.toggle('active',buttons[i]===e.currentTarget);
        el('pin').focus();
      }

      function initHeroDensity(){
        state.heroExpanded=storageGet(HERO_DENSITY_KEY)==='expanded';
        setHeroExpanded(state.heroExpanded,false);
      }
      function setHeroExpanded(expanded,persist){
        state.heroExpanded=!!expanded;
        var hero=el('heroSection'), details=el('heroDetails'), toggle=el('heroToggle');
        if(hero) hero.classList.toggle('compact',!state.heroExpanded);
        if(details) details.setAttribute('aria-hidden',state.heroExpanded?'false':'true');
        if(toggle){
          toggle.setAttribute('aria-expanded',state.heroExpanded?'true':'false');
          text(toggle,state.heroExpanded?'오늘 정보 접기':'오늘 정보 보기');
        }
        if(persist) storageSet(HERO_DENSITY_KEY,state.heroExpanded?'expanded':'compact');
      }

      function login(){
        if(state.loginBusy) return;
        if(!state.selectedUser){ setLoginStatus('지수 또는 하콩을 먼저 골라 줘.'); return; }
        var userId=String(state.selectedUser||'');
        var pin=el('pin').value.trim();
        if(!/^\d{4,12}$/.test(pin)){ setLoginStatus('숫자 4~12자리 PIN을 입력해 줘.'); return; }

        var attemptGeneration=++state.loginAttemptGeneration;
        setLoginBusy(true);
        setLoginStatus('');
        callApi('apiLoginV221',[userId,pin],18000)
          .then(unwrap)
          .then(function(data){
            if(attemptGeneration!==state.loginAttemptGeneration) return;
            if(!data || !validSession(data.session)){
              throw new Error('로그인 서버가 유효한 세션을 주지 않았어. 잠시 뒤 다시 시도해 줘.');
            }
            var session=data.session;
            state.session=session;
            supabaseToken=session.supabase===true?String(session.token):'';
            saveSession(session);
            restoreDraft(session.user.id);
            restorePendingSave(session.user.id);
            el('pin').value='';
            enterAppImmediately(session.user);
            // GAS 로그인 응답에 이미 첫 화면 데이터가 있으므로 먼저 즉시 그린다.
            // 이어지는 조회만 Supabase로 보내 최신 상태를 조용히 맞춘다.
            if(data.home&&typeof data.home==='object') applyHome(data.home,{source:'login-cache',force:true});
            loadHome({source:'login-refresh',force:true});
          })
          .catch(function(error){
            if(attemptGeneration!==state.loginAttemptGeneration) return;
            setLoginStatus(errorMessage(error));
          })
          .then(function(){ if(attemptGeneration===state.loginAttemptGeneration) setLoginBusy(false); });
      }

      function validSession(session){
        return !!(session && session.token && session.user && session.user.id && Number(session.expiresAt)>Date.now());
      }

      function setLoginBusy(busy){
        state.loginBusy=!!busy;
        el('loginButton').disabled=busy;
        el('pin').disabled=busy;
        var buttons=document.querySelectorAll('.user-btn');
        for(var i=0;i<buttons.length;i++) buttons[i].disabled=busy;
        text(el('loginButton'),busy?'로그인 중…':'들어가기');
      }
      function setLoginStatus(message){ text(el('loginStatus'),message); }

      function enterAppImmediately(user){
        var active=document.activeElement;
        if(active&&el('loginPage').contains(active)&&typeof active.blur==='function') active.blur();
        hide(el('loginPage'));
        show(el('appPage'));
        text(el('settingsButton'),(user.emoji||'🌿')+' '+user.name);
        text(el('settingsUser'),user.name+'으로 로그인됨');
        renderSessionInfo();
        activateTab('home');
        startAutoRefresh();
      }

      function loadHome(options){
        return refreshHome(options || {source:'manual',force:true});
      }

      function invalidateHomeResponses(){
        state.homeApplyGeneration++;
      }

      function unsafeToApplyHomeResponse(){
        if(isImeComposing(state.compositionTarget)||state.commentComposing||anyEngagementBusy()) return true;
        var active=document.activeElement;
        return !!(active&&isTextEntry(active)&&active.isConnected&&active.getClientRects&&active.getClientRects().length);
      }

      // 응답 도착 뒤 입력이나 로컬 변경이 시작됐다면 오래된 화면을 기다렸다 덮지 않는다.
      // 해당 응답은 버리고 다음 자동 확인 또는 사용자의 새로고침이 새 데이터를 다시 요청한다.
      function applyHomeWhenInputSafe(home,options,requestToken,requestGeneration){
        if(!state.session||state.session.token!==requestToken) return false;
        if(requestGeneration!==state.homeApplyGeneration||unsafeToApplyHomeResponse()) return false;
        return applyHome(home,options);
      }

      function refreshHome(options){
        options=options||{};
        if(!state.session) return Promise.resolve(false);
        if(state.refreshing) return state.refreshPromise||Promise.resolve(false);
        if(!options.force && shouldPauseAutoRefresh()) return Promise.resolve(false);

        var silent=!!options.silent;
        var requestToken=state.session.token;
        var requestGeneration=state.homeApplyGeneration;
        state.refreshing=true;
        if(options.source==='pull') setPullStatus('loading','새 기록을 확인하는 중…');
        if(!silent){
          text(el('feedStatus'),'최신 기록을 불러오는 중이야…');
          el('feedStatus').className='status-card';
          show(el('feedStatus'));
        }

        state.refreshPromise=callApi('apiGetHomeV221',[state.session.token,0,Math.min(MAX_PAGE_SIZE,Math.max(PAGE_SIZE,state.loadedCount||PAGE_SIZE))],24000)
          .then(unwrap)
          .then(function(home){
            if(!state.session||state.session.token!==requestToken) return false;
            return applyHomeWhenInputSafe(home,{preserveScroll:silent||options.source==='pull'},requestToken,requestGeneration);
          })
          .then(function(changed){
            state.autoRefreshFailures=0;
            state.lastRefreshAt=Date.now();
            state.lastSyncAt=Date.now();
            state.lastSyncError='';
            renderOperationalHealth();
            if(options.source==='pull') toast(changed?'새 내용을 불러왔어 🌿':'이미 최신 상태야.');
            else if(options.source==='auto'&&changed) toast('새 내용을 조용히 반영했어 🌿');
            return changed;
          })
          .catch(function(error){
            if(error.code==='AUTH'){
              saveDraft(true);
              clearSession();
              stopAutoRefresh();
              resetAppStateForLogout();
              show(el('loginPage'));
              hide(el('appPage'));
              setLoginStatus(errorMessage(error));
              return false;
            }
            state.autoRefreshFailures++;
            state.lastSyncError=String(errorMessage(error)).slice(0,120);
            renderOperationalHealth();
            if(!silent){
              el('feedStatus').className='status-card error';
              el('feedStatus').innerHTML='기록을 불러오지 못했어.<br>'+escapeHtml(errorMessage(error))+'<br><button type="button" id="inlineRetry">다시 불러오기</button>';
              el('inlineRetry').addEventListener('click',function(){ refreshHome({source:'manual',force:true}); });
            }else if(options.source==='pull'){
              toast('새로고침 실패: '+errorMessage(error));
            }
            return false;
          })
          .then(function(result){
            state.refreshing=false;
            state.refreshPromise=null;
            if(options.source==='pull') resetPullIndicator(280);
            return result;
          });
        return state.refreshPromise;
      }

      // ===== v2.9.2 검진 D-day =====
      // 히어로에 다음 검진 D-day 배너를 그린다. 지난 날짜는 서버가 이미 걸러서 보내지 않는다.
      function renderCheckup(pregnancy){
        var box=el('checkupBanner');
        if(!box) return;
        try {
          var date=pregnancy&&pregnancy.valid!==false?String(pregnancy.checkupDate||''):'';
          var dday=pregnancy?Number(pregnancy.checkupDday):NaN;
          if(!date||!isFinite(dday)||dday<0){ hide(box); box.textContent=''; box.classList.remove('today'); return; }
          if(dday===0){ box.textContent='오늘 검진이에요 🏥 잘 다녀와요!'; box.classList.add('today'); }
          else { box.textContent='🏥 다음 검진 D-'+dday+' · '+date; box.classList.remove('today'); }
          show(box);
        } catch(checkupError){ hide(box); }
      }

      // 임신 주차별 표준 검진 간격: 28주까지 4주, 36주까지 2주, 이후 매주.
      // 다음 검진일을 매번 손으로 계산하지 않도록 날짜를 제안한다.
      function checkupIntervalWeeks(week){
        if(!isFinite(week)) return 4;
        if(week<28) return 4;
        if(week<36) return 2;
        return 1;
      }

      function checkupMilestoneNote(week){
        if(!isFinite(week)) return '';
        if(week>=10&&week<14) return '이 무렵 1차 기형아 검사(목덜미 투명대)를 해요';
        if(week>=15&&week<21) return '이 무렵 2차 기형아 검사·정밀 초음파를 해요';
        if(week>=24&&week<29) return '이 무렵 임신성 당뇨 검사를 해요';
        if(week>=35&&week<38) return '이 무렵 GBS(세균) 검사를 해요';
        return '';
      }

      function renderCheckupSuggestion(){
        var box=el('checkupSuggestBox'), textBox=el('checkupSuggestText');
        if(!box||!textBox) return;
        var pregnancy=state.home&&state.home.app&&state.home.app.pregnancy||{};
        var phase=String(pregnancy.phase||'').toUpperCase();
        var week=Number(pregnancy.week);
        if(phase==='BORN'||!isFinite(week)||pregnancy.valid===false){ box.classList.add('hidden'); return; }

        var base=String(pregnancy.checkupDate||'')||today();
        var gap=checkupIntervalWeeks(week);
        var next=new Date(base+'T00:00:00');
        if(isNaN(next.getTime())){ box.classList.add('hidden'); return; }
        next.setDate(next.getDate()+gap*7);
        var nextStr=next.getFullYear()+'-'+pad2(next.getMonth()+1)+'-'+pad2(next.getDate());
        if(nextStr<=today()){ box.classList.add('hidden'); return; }

        state.checkupSuggestion=nextStr;
        var note=checkupMilestoneNote(week+gap);
        textBox.textContent='지금 '+week+'주라 '+gap+'주 뒤인 '+nextStr+'이 다음 검진일로 적당해요.'+(note?(' '+note+'.'):'');
        box.classList.remove('hidden');
      }

      function applyCheckupSuggestion(){
        var value=state.checkupSuggestion;
        if(!value) return;
        var input=el('checkupDateInput');
        if(input) input.value=value;
        toast('검진일 후보를 넣었어. 저장을 눌러 확정해 줘 🏥');
      }

      function renderCheckupSettings(){
        var status=el('checkupStatus');
        if(!status) return;
        var pregnancy=state.home&&state.home.app&&state.home.app.pregnancy||{};
        var date=String(pregnancy.checkupDate||'');
        var dday=Number(pregnancy.checkupDday);
        var clearButton=el('checkupClear'), input=el('checkupDateInput');
        if(date&&isFinite(dday)&&dday>=0){
          text(status,'다음 검진: '+date+(dday===0?' (오늘!)':' (D-'+dday+')'));
          if(input&&!input.value) input.value=date;
          show(clearButton);
        } else {
          text(status,'검진일을 넣어두면 홈 화면 위에 D-day가 떠. 검진이 끝나면 다음 날짜로 바꿔 줘.');
          hide(clearButton);
        }
      }

      function setCheckupAction(checkupDate){
        if(state.checkupBusy||!state.session) return;
        invalidateHomeResponses();
        state.checkupBusy=true;
        var saveButton=el('checkupSave'), clearButton=el('checkupClear');
        if(saveButton) saveButton.disabled=true;
        if(clearButton) clearButton.disabled=true;
        callApi('apiSetCheckupV291',[state.session.token,checkupDate||''],20000)
          .then(unwrap)
          .then(function(){
            toast(checkupDate?'검진일을 저장했어 🏥':'검진일을 지웠어.');
            return refreshHome({source:'checkup',silent:true,force:true});
          })
          .then(function(){ renderCheckupSettings(); })
          .catch(function(error){ toast(errorMessage(error)); })
          .then(function(){
            state.checkupBusy=false;
            if(saveButton) saveButton.disabled=false;
            if(clearButton) clearButton.disabled=false;
          });
      }

      // ===== v2.9.0 태동 카운터 =====
      // 세션은 이 기기(localStorage)에 계속 저장돼서 앱이 꺼져도 6시간 안에는 이어서 셀 수 있다.
      // 저장은 검증된 기존 글 저장 파이프라인을 그대로 사용한다(같은 requestId 재시도 = 중복 저장 없음).
      function kickStorageKey(){ return 'ilkong_kick_v290_'+currentUserId(); }

      function loadKickSession(){
        try {
          var raw=storageGet(kickStorageKey());
          if(!raw) return null;
          var data=JSON.parse(raw);
          if(!data) return null;
          var lastActive=Number(data.lastTapAt||data.startAt||0);
          if(!lastActive||Date.now()-lastActive>6*3600000){ storageRemove(kickStorageKey()); return null; }
          return {
            count:Math.max(0,Number(data.count)||0),
            startAt:Number(data.startAt)||0,
            lastTapAt:Number(data.lastTapAt)||0,
            requestId:String(data.requestId||''),
            requestSignature:String(data.requestSignature||'')
          };
        } catch(e){ return null; }
      }

      function persistKickSession(){
        try {
          var k=state.kick;
          if(!k||!k.count){ storageRemove(kickStorageKey()); return; }
          storageSet(kickStorageKey(),JSON.stringify({count:k.count,startAt:k.startAt,lastTapAt:k.lastTapAt,requestId:k.requestId,requestSignature:k.requestSignature}));
        } catch(e){}
      }

      function clearKickSession(){
        state.kick={count:0,startAt:0,lastTapAt:0,requestId:'',requestSignature:'',saving:false};
        try { storageRemove(kickStorageKey()); } catch(e){}
      }

      function openKickCounter(){
        if(state.saving) return;
        var restored=loadKickSession();
        state.kick=restored?Object.assign({saving:false},restored):{count:0,startAt:0,lastTapAt:0,requestId:'',requestSignature:'',saving:false};
        if(restored&&restored.count) toast('세던 태동을 이어서 열었어 👣');
        state.dialogReturnFocus=document.activeElement;
        show(el('kickCounter'));
        renderKickCounter();
        startKickTimer();
      }

      function closeKickCounter(){
        stopKickTimer();
        persistKickSession(); // 세션 유지 — 다시 열면 이어서 센다
        closeOverlaySheet('kickCounter');
      }

      function startKickTimer(){ stopKickTimer(); state.kickTimer=setInterval(renderKickStatusLine,1000); }
      function stopKickTimer(){ if(state.kickTimer){ clearInterval(state.kickTimer); state.kickTimer=null; } }

      function kickTap(){
        var k=state.kick;
        if(!k||k.saving) return;
        if(!k.startAt) k.startAt=Date.now();
        k.count++;
        k.lastTapAt=Date.now();
        persistKickSession();
        renderKickCounter();
        if(k.count===10){
          toast('10회 도달 👏 활발하게 잘 놀고 있네!');
          if(navigator.vibrate){ try { navigator.vibrate([40, 100, 40]); } catch(vibError){} }
        } else {
          if(navigator.vibrate){ try { navigator.vibrate(25); } catch(vibError){} }
        }
      }

      function kickUndo(){
        var k=state.kick;
        if(!k||k.saving||!k.count) return;
        k.count--;
        if(!k.count){ k.startAt=0; k.lastTapAt=0; }
        persistKickSession();
        renderKickCounter();
      }

      function kickReset(){
        var k=state.kick;
        if(!k||k.saving) return;
        if(k.count&&!confirm('세던 태동을 지우고 처음부터 다시 셀까?')) return;
        clearKickSession();
        renderKickCounter();
      }

      function formatClock(ts){
        var d=new Date(Number(ts)||0);
        if(isNaN(d.getTime())) return '';
        return ('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2);
      }

      function buildKickBody(k){
        var minutes=k.startAt&&k.lastTapAt?Math.max(0,Math.round((k.lastTapAt-k.startAt)/60000)):0;
        var duration=minutes>0?minutes+'분':'1분 미만';
        var range=k.startAt?' ('+formatClock(k.startAt)+' ~ '+formatClock(k.lastTapAt||k.startAt)+')':'';
        var tenNote=k.count>=10?('\n🔟 10회까지 '+Math.max(1,Math.round((k.lastTapAt-k.startAt)/60000))+'분'):'';
        return '👣 태동 '+k.count+'회\n⏱ '+duration+range+tenNote;
      }

      function saveKickRecord(){
        var k=state.kick;
        if(!k||k.saving) return;
        if(!k.count){ toast('아직 센 태동이 없어. 태동이 느껴지면 큰 버튼을 눌러 줘.'); return; }
        // 내용이 같으면 같은 requestId를 재사용해서(멱등) 재시도해도 절대 두 번 저장되지 않는다.
        var signature=k.count+'|'+k.startAt+'|'+k.lastTapAt;
        if(k.requestSignature!==signature||!validClientRequestId(k.requestId)){ k.requestId=uuid(); k.requestSignature=signature; }
        persistKickSession();
        k.saving=true;
        renderKickCounter();
        var payload={recordDate:today(),title:'',body:buildKickBody(k),category:'태동',mood:'',imageCount:0,requestId:k.requestId};
        callApi('apiStartPostV221',[state.session.token,payload],22000)
          .then(unwrap)
          .then(function(result){
            if(!result||!result.postId) throw new Error('저장할 글 번호를 받지 못했어.');
            return callApi('apiFinishPostV221',[state.session.token,result.postId],22000);
          })
          .then(unwrap)
          .then(function(){
            if(k.count>=10&&k.startAt&&k.lastTapAt){
              var tenMinutes=Math.max(1,Math.round((k.lastTapAt-k.startAt)/60000));
              callApi('apiSaveHealthLogV470',[state.session.token,{date:today(),kickTenMinutes:String(tenMinutes),supplements:[]}],16000)
                .then(unwrap).then(function(){ return loadHealthLogs(); }).catch(function(){});
            }
            clearKickSession();
            stopKickTimer();
            closeOverlaySheet('kickCounter');
            toast('태동 기록을 저장했어 👣');
            return loadHome({source:'kick',force:true});
          })
          .catch(function(error){
            k.saving=false;
            renderKickCounter();
            toast('저장을 끝내지 못했어. 같은 버튼을 다시 누르면 이어서 시도해: '+errorMessage(error));
          })
          .then(function(){ if(state.kick&&state.kick.saving){ state.kick.saving=false; renderKickCounter(); } });
      }

      function renderKickCounter(){
        var k=state.kick||{count:0,saving:false};
        text(el('kickCount'),String(k.count||0));
        var undoButton=el('kickUndo'); if(undoButton) undoButton.disabled=!k.count||!!k.saving;
        var resetButton=el('kickReset'); if(resetButton) resetButton.disabled=!!k.saving;
        var tapButton=el('kickTap'); if(tapButton) tapButton.disabled=!!k.saving;
        var saveButton=el('saveKick');
        if(saveButton){ saveButton.disabled=!!k.saving; text(saveButton,k.saving?'저장 중…':'기록 저장'); }
        renderKickStatusLine();
      }

      function renderKickStatusLine(){
        var status=el('kickStatus'), k=state.kick;
        if(!status) return;
        if(!k||!k.startAt){ text(status,'첫 태동이 느껴지면 큰 버튼을 눌러 줘'); renderKickTenBox(); return; }
        var elapsed=Math.max(0,Math.floor((Date.now()-k.startAt)/1000));
        text(status,formatClock(k.startAt)+' 시작 · '+Math.floor(elapsed/60)+'분 '+('0'+(elapsed%60)).slice(-2)+'초 경과');
        renderKickTenBox();
      }

      // 지난 기록들의 '10회까지 걸린 시간' 평균. 가이드가 강조하는 "평소 패턴"의 기준이 된다.
      function kickTenAverage(){
        var values=(healthState.logs||[]).filter(function(log){ return log.kickTenMinutes; })
          .slice(-14).map(function(log){ return Number(log.kickTenMinutes); });
        if(!values.length) return 0;
        var sum=values.reduce(function(a,b){ return a+b; },0);
        return Math.round(sum/values.length);
      }

      // 10회를 채우면 걸린 시간을 알려주고, 평소보다 오래 걸리면 그 사실을 짚어준다.
      function renderKickTenBox(){
        var box=el('kickTenBox');
        if(!box) return;
        var k=state.kick;
        if(!k||!k.startAt||!k.count){ box.className='labor-signal hidden'; box.innerHTML=''; return; }
        var minutes=Math.max(1,Math.round(((k.lastTapAt||Date.now())-k.startAt)/60000));
        var avg=kickTenAverage();
        if(k.count<10){
          var left=10-k.count;
          var elapsedMin=Math.max(0,Math.round((Date.now()-k.startAt)/60000));
          if(elapsedMin>=120){
            box.className='labor-signal on';
            box.innerHTML='⚠️ <strong>2시간이 지났는데 '+k.count+'회예요</strong><br>기다리지 말고 의료진에게 연락하세요';
          } else {
            box.className='labor-signal warn';
            box.innerHTML='10회까지 '+left+'회 남았어요 · '+elapsedMin+'분 경과'+(avg?(' · 평소 '+avg+'분'):'');
          }
          return;
        }
        if(minutes>120){
          box.className='labor-signal on';
          box.innerHTML='⚠️ <strong>10회 채우는 데 '+minutes+'분 걸렸어요</strong><br>2시간이 넘었어요. 의료진에게 연락하세요';
        } else if(avg&&minutes>=avg*2&&minutes-avg>=15){
          box.className='labor-signal warn';
          box.innerHTML='🎉 10회 완료 · <strong>'+minutes+'분</strong><br>평소('+avg+'분)보다 오래 걸렸어요. 한 번 더 세어보고 계속 느리면 연락하세요';
        } else {
          box.className='labor-signal warn';
          box.innerHTML='🎉 <strong>10회 완료 · '+minutes+'분</strong>'+(avg?('<br>평소 '+avg+'분과 비슷해요'):'<br>저장하면 다음부터 평소 패턴과 비교해줄게');
        }
      }

      // 태동 버튼은 임신 16주 이상(태동을 느끼기 시작하는 시기)에만 보인다.
      function renderKickButton(pregnancy){
        var button=el('quickKick');
        if(!button) return;
        var phase=String(pregnancy&&pregnancy.phase||'').toUpperCase();
        var week=pregnancy?Number(pregnancy.week):NaN;
        var visible=!!(pregnancy&&pregnancy.valid!==false&&phase!=='BORN'&&isFinite(week)&&week>=16);
        button.classList.toggle('hidden',!visible);
      }

      // ===== v2.8.9 출생 전환 =====
      // 설정 화면에서 실제 출생일을 넣으면 상단이 생후 기록으로 바뀐다. 되돌리기도 가능.
      function renderBirthSettings(){
        var status=el('birthStatus');
        if(!status) return;
        var app=state.home&&state.home.app||{};
        var pregnancy=app.pregnancy||{};
        var phase=String(pregnancy.phase||app.phase||'PREGNANCY').toUpperCase();
        var controls=el('birthControls'), revert=el('birthRevert');
        if(phase==='BORN'){
          text(status,'출생일 '+(pregnancy.birthDate||'미설정')+' 기준으로 생후 기록 중이야 💛');
          hide(controls); show(revert);
        } else {
          text(status,'일콩이를 만나면 아래에 실제 출생일을 넣어 줘. 앱 상단이 생후 기록으로 바뀌어.');
          var input=el('birthDateInput');
          if(input&&!input.value) input.value=today();
          show(controls); hide(revert);
        }
      }

      function setBirthAction(birthDate){
        if(state.birthBusy||!state.session) return;
        invalidateHomeResponses();
        state.birthBusy=true;
        var confirmButton=el('birthConfirm'), revertButton=el('birthRevert');
        if(confirmButton) confirmButton.disabled=true;
        if(revertButton) revertButton.disabled=true;
        callApi('apiSetBirthV289',[state.session.token,birthDate||''],20000)
          .then(unwrap)
          .then(function(){
            toast(birthDate?'일콩이 어서 와 💛 생후 기록으로 바뀌었어!':'임신 모드로 되돌렸어.');
            return refreshHome({source:'birth',silent:true,force:true});
          })
          .then(function(){ renderBirthSettings(); })
          .catch(function(error){ toast(errorMessage(error)); })
          .then(function(){
            state.birthBusy=false;
            if(confirmButton) confirmButton.disabled=false;
            if(revertButton) revertButton.disabled=false;
          });
      }

      // ===== v2.8.9 마일스톤 배너 =====
      // 오늘이 특별한 이정표인 날에만 하루 동안 나타난다.
      // 서버가 매일 새로 계산해주는 주차·D-day·생후일수만 사용하므로 저장이 전혀 필요 없다.
      function milestoneMessage(pregnancy){
        if(!pregnancy||pregnancy.valid===false) return '';
        var phase=String(pregnancy.phase||'').toUpperCase();
        if(phase==='BORN'){
          var age=Number(pregnancy.ageDays);
          if(!isFinite(age)) return '';
          if(age===0) return '오늘 일콩이를 만났어요 💛 세상에 온 걸 환영해!';
          if(age===7) return '일콩이 태어난 지 일주일 🎉';
          if(age===30) return '일콩이 생후 30일 🎉';
          if(age===50) return '일콩이 생후 50일 💛';
          if(age===100) return '일콩이 100일 축하해요 🎂';
          if(age===200) return '일콩이 생후 200일 🎉';
          if(age===365) return '일콩이 첫돌 🎂💛';
          return '';
        }
        var week=Number(pregnancy.week), day=Number(pregnancy.day), dday=Number(pregnancy.dday);
        if(isFinite(week)&&isFinite(day)&&day===0){
          if(week===12) return '12주 달성 🎉 유산 위험이 크게 낮아지는 구간에 들어왔어요';
          if(week===13) return '2분기 시작 🌿 가장 편안하다는 임신 중기예요';
          if(week===20) return '임신 절반 지점 통과 🎉 반이나 왔어요!';
          if(week===24) return '생존가능선 도달 💪 아주 큰 이정표예요';
          if(week===28) return '3분기 시작 🌕 이제 마지막 구간이에요';
          if(week===37) return '만삭 진입 🎉 이제 언제 만나도 든든해요';
        }
        if(isFinite(dday)){
          if(dday===200) return 'D-200 💛 이백 밤 남았어요';
          if(dday===100) return 'D-100 🎉 세 자리에서 두 자리로!';
          if(dday===50) return 'D-50 💛 오십 밤만 자면 만나요';
          if(dday===30) return 'D-30 🌱 한 달 남았어요';
          if(dday===10) return 'D-10 💛 열 밤!';
          if(dday===0) return '오늘이 예정일이에요 💛 언제든 준비 완료!';
        }
        return '';
      }

      function renderMilestone(pregnancy){
        var box=el('milestoneBanner');
        if(!box) return;
        try {
          var message=milestoneMessage(pregnancy);
          if(!message){ hide(box); box.textContent=''; return; }
          box.textContent=message;
          show(box);
        } catch(milestoneError){ hide(box); }
      }

      // ===== v2.8.8 주차별 임신 가이드 =====
      // ACOG·Mayo Clinic·NHS의 표준 주차별 발달 자료(평균치)를 바탕으로 정리했다.
      // 길이는 19주까지 머리~엉덩이, 20주부터 머리~발끝 기준의 평균 근사값이다.
      // e=이모지, s=크기 비유, z=길이·몸무게, b=아기 발달, m=엄마 몸, t=이번 주 팁
      var PREGNANCY_GUIDE={
        4:{e:'🌱',s:'양귀비 씨앗만 해요',z:'약 1mm',b:'수정란이 자궁에 자리를 잡았고, 뇌와 척수의 기초가 되는 신경관이 만들어지기 시작해요.',m:'생리 예정일 무렵이라 아직 임신인 줄 모르는 경우도 많아요.',t:'엽산(하루 400~800µg)이 신경관 발달에 가장 중요한 시기예요.',x:'배아가 세 개의 층으로 나뉘어 각각 신경과 피부, 심장과 뼈, 내장 기관이 될 준비를 시작해요. 임신의 설계도가 그려지는 주예요.',c:'임신 확인 즉시 술·담배 완전 중단, 엽산 시작, 복용 중인 약은 임의로 끊지 말고 병원에 확인해요.'},
        5:{e:'🌱',s:'참깨 한 알만 해요',z:'약 2mm',b:'심장이 될 관이 만들어져 이번 주쯤 첫 박동을 시작해요. 신경관도 닫히는 중이에요.',m:'피로감과 가슴 뭉침이 첫 신호로 오기도 해요.',t:'술·담배는 완전히 끊고, 약을 먹기 전에는 꼭 의사와 상의해요.',x:'심장이 될 관이 접히면서 첫 박동을 준비하고, 태반과 탯줄의 기초가 만들어져요. 아기와 엄마를 잇는 생명선의 시작이에요.',c:'첫 산부인과 진료를 예약해요. 마지막 생리일을 미리 메모해 가면 좋아요.'},
        6:{e:'🫘',s:'렌틸콩만 해요',z:'약 5mm',b:'심장이 분당 100~160회로 뛰기 시작해 초음파로 확인할 수 있어요. 팔다리 싹이 돋아나요.',m:'입덧이 시작될 수 있는 시기예요.',t:'속이 울렁이면 조금씩 자주 먹고 물을 충분히 마셔요.',x:'신경관이 닫히고 뇌가 세 부분으로 나뉘기 시작해요. 초음파에서 심박이 보이기 시작하는 시기예요.',c:'입덧 대비 — 그나마 먹을 수 있는 음식 목록을 만들어두면 힘든 날 도움이 돼요.'},
        7:{e:'🫐',s:'블루베리만 해요',z:'약 1cm',b:'뇌세포가 1분에 약 10만 개씩 생겨나는 폭풍 성장기예요. 손과 발이 될 판이 생겨요.',m:'호르몬 변화로 피곤이 몰려올 수 있어요.',t:'카페인은 하루 200mg(커피 한 잔) 이하로 줄여요.',x:'팔다리 싹 끝에 손과 발이 될 판이 생기고 신장의 기초가 만들어져요. 뇌실과 수정체도 형성 중이에요.',c:'초기 산전 혈액·소변검사(6~9주 창)를 예약해요. 검진노트에 궁금한 것을 미리 적어가요.'},
        8:{e:'🍓',s:'라즈베리만 해요',z:'약 1.6cm',b:'모든 주요 장기의 기초가 자리를 잡았어요. 손가락·발가락이 구분되기 시작하고 꼬리는 사라져요.',m:'자궁이 주먹만 하게 커지고 있어요.',t:'첫 산전 진찰을 받기 좋은 시기예요.',x:'손가락 사이 물갈퀴 모양이 사라지기 시작하고 심박은 분당 150~170회로 안정돼요. 모든 장기의 기초가 자리를 잡았어요.',c:'다음 검진 주기를 확인하고, 카페인 섭취량을 한 번 점검해요.'},
        9:{e:'🍒',s:'체리만 해요',z:'약 2.3cm',b:'배아기를 졸업하고 공식적으로 태아가 됐어요. 관절이 생겨 팔다리를 움직이기 시작해요(아직 느껴지진 않아요).',m:'입덧이 가장 힘든 구간일 수 있어요.',t:'입덧이 심하면 참지 말고 병원과 상의해요 — 도움 되는 처방이 있어요.',x:'공식적으로 배아에서 태아가 됐어요. 근육과 신경이 연결되어 미세하게 움직이기 시작해요(느껴지는 건 한참 뒤예요).',c:'입덧이 너무 심하면 참지 말고 진료 — 안전한 처방이 있어요. 물도 못 마시면 바로 병원이에요.'},
        10:{e:'🍊',s:'금귤만 해요',z:'약 3.1cm',b:'중요한 장기가 모두 만들어지는 기관형성기가 끝났어요. 이제부터는 크고 성숙해지는 단계예요.',m:'허리선이 살짝 두꺼워질 수 있어요.',t:'NIPT 같은 선별검사는 10주부터 상담할 수 있어요.',x:'중요한 기형 유발 물질 민감기가 지나가는 시점이에요. 손톱과 머리카락이 나기 시작하고 뇌는 1분에 25만 개의 뉴런을 만들어요.',c:'NIPT를 할지 상담해보기 좋은 때예요(10주부터 가능).'},
        11:{e:'🍐',s:'무화과만 해요',z:'약 4.1cm',b:'머리가 몸의 절반을 차지해요. 딸꾹질을 시작하는데, 나중에 숨 쉬기 위한 연습이에요.',m:'입덧이 서서히 나아지는 사람도 있어요.',t:'11~13주는 목덜미투명대(1분기 초음파) 검사 시기예요.',x:'머리가 몸의 절반이던 비율이 개선되기 시작하고, 호흡 연습인 딸꾹질을 자주 해요. 골격이 부드러운 연골에서 뼈로 바뀌는 중이에요.',c:'NT 초음파(11주 0일~13주 6일)는 이 시기에만 가능 — 예약을 꼭 확인해요.'},
        12:{e:'🍋',s:'라임만 해요',z:'약 5.4cm',b:'손을 쥐었다 펴고 발가락을 오므리는 반사가 생겼어요. 신장이 소변을 만들기 시작해요.',m:'유산 위험이 크게 낮아지는 시점이에요.',t:'주변에 소식을 알리기 좋은 때로 많이 꼽는 시기예요.',x:'손바닥에 닿으면 움켜쥐는 반사가 생겼어요. 신장이 소변을 만들어 양수로 내보내는 순환이 시작돼요.',c:'1차 기형아 선별 결과를 확인하고, 주변에 소식을 알릴 계획을 세워봐요.'},
        13:{e:'🫛',s:'완두콩 꼬투리만 해요',z:'약 7.4cm · 23g',b:'2분기 시작! 세상에 하나뿐인 지문이 손끝에 생겼어요. 성대도 만들어지는 중이에요.',m:'에너지가 돌아오는 임신 중기의 시작이에요.',t:'걷기·수영 같은 가벼운 운동을 시작하기 좋아요.',x:'세상에 하나뿐인 지문이 완성되고 성대가 만들어져요. 뱃속에 있던 장이 제자리로 들어가요.',c:'입덧이 잦아들면 가벼운 운동 루틴 시작 — 커플 여행은 중기(14~27주)가 최적이에요.'},
        14:{e:'🍋',s:'레몬만 해요',z:'약 8.7cm · 43g',b:'찡그리고 눈을 가늘게 뜨는 표정 연습을 시작했어요. 몸이 머리보다 빨리 자라 비율이 잡혀가요.',m:'배가 조금씩 나오기 시작할 수 있어요.',t:'15~20주에 하는 기형아 선별검사 일정을 잡아두면 좋아요.',x:'갑상선이 성숙해 호르몬을 만들기 시작하고, 찡그리기·눈 가늘게 뜨기 같은 표정 연습을 해요.',c:'2차 기형아 선별검사(15~20주) 일정을 잡아요.'},
        15:{e:'🍎',s:'사과만 해요',z:'약 10cm · 70g',b:'뼈가 점점 단단해지고 있어요. 눈꺼풀은 감겨 있지만 빛을 감지할 수 있어요.',m:'혈류가 늘어 코막힘·잇몸 예민함이 흔한 시기예요.',t:'치과 검진도 임신 중에 받을 수 있어요 — 미루지 마세요.',x:'다리가 팔보다 길어지고 뼈가 단단해지는 중이에요. 눈꺼풀은 감겨 있지만 빛을 감지해요.',c:'철분이 풍부한 식단(소고기·시금치·콩)을 의식적으로 챙기기 시작해요.'},
        16:{e:'🥑',s:'아보카도만 해요',z:'약 11.6cm · 100g',b:'눈이 빛에 반응하며 천천히 움직여요. 빠르면 이번 주부터 첫 태동(퀵닝)을 느낄 수도 있어요.',m:'첫 태동은 보통 16~22주 사이, 첫 임신은 늦게 느끼는 게 정상이에요.',t:'철분 필요량이 늘어나는 때 — 검진 때 철분제를 상의해요.',x:'눈이 빛에 반응하며 천천히 움직이고, 심장은 하루 약 24리터의 혈액을 펌프질해요. 빠르면 첫 태동(퀵닝)을 느낄 수 있어요.',c:'첫 태동처럼 느껴지는 감각이 있으면 날짜를 기록해둬요 — 태동 카운터가 열리는 시기예요.'},
        17:{e:'🍐',s:'순무만 해요',z:'약 13cm · 140g',b:'체온 조절을 준비하며 지방이 붙기 시작했어요. 심장은 하루 약 100L의 혈액을 펌프질해요.',m:'무게중심이 바뀌며 허리에 부담이 갈 수 있어요.',t:'체중 증가가 본격화돼요 — 균형 잡힌 식사가 최고예요.',x:'체온 조절을 담당할 갈색지방이 붙기 시작하고 탯줄은 더 굵고 튼튼해져요.',c:'옆으로 자는 습관을 슬슬 들여요. 다리 사이 쿠션이 도움돼요.'},
        18:{e:'🫑',s:'피망만 해요',z:'약 14.2cm · 190g',b:'귀가 제자리에 자리 잡고 소리를 듣기 시작해요 — 엄마 심장 소리가 첫 배경음악이에요.',m:'배가 눈에 띄게 나오기 시작하는 시기예요.',t:'태담을 시작하기 딱 좋은 때예요 🌼',x:'귀가 제자리를 잡고 소리를 듣기 시작해요 — 엄마 심장소리가 첫 배경음악이에요. 신경을 감싸는 수초가 만들어지기 시작해요.',c:'매일 5분 태담 루틴 시작 — 아빠 저음도 잘 들려요.'},
        19:{e:'🍅',s:'토마토만 해요',z:'약 15.3cm · 240g',b:'태지라는 크림 같은 보호막이 피부를 덮어요. 촉각·미각·후각을 담당할 뇌 영역이 빠르게 발달해요.',m:'배 당김(원인대 통증)이 느껴질 수 있어요.',t:'20~24주 정밀초음파를 예약해두세요.',x:'피부를 보호하는 크림 같은 태지가 덮이고, 촉각·미각·후각·시각·청각을 담당할 뇌 영역이 각자 특화되기 시작해요.',c:'정밀초음파(20~24주)를 예약해요.'},
        20:{e:'🍌',s:'바나나만 해요',z:'약 25cm · 300g',b:'임신 절반 지점! 이제부터는 머리부터 발끝까지 재요. 양수를 삼키며 소화기관을 연습하고 있어요.',m:'배꼽이 조금씩 튀어나오기 시작할 수 있어요.',t:'정밀초음파에서 장기 발달을 자세히 보고, 원하면 성별도 확인할 수 있어요.',x:'임신 절반! 삼킨 양수로 소화기관을 연습하고 첫 응가가 될 태변이 만들어지기 시작해요.',c:'정밀초음파에서 성별을 들을지 서프라이즈로 남길지 미리 정해요 ㅋㅋ'},
        21:{e:'🥕',s:'당근만 해요',z:'약 26.7cm · 360g',b:'발차기와 구르기가 뚜렷해져요. 양수를 통해 엄마가 먹은 음식의 맛을 경험한다고 알려져 있어요.',m:'태동이 규칙적으로 느껴지기 시작해요.',t:'다양한 음식을 먹으면 아기 입맛 형성에도 좋다는 연구가 있어요.',x:'골수가 혈구 생산을 시작하고 자고 깨는 수면 주기가 생겨요. 양수로 엄마가 먹은 음식의 맛을 경험해요.',c:'태동이 규칙적으로 느껴지면 하루 중 활발한 시간대를 기록해봐요.'},
        22:{e:'🍈',s:'파파야만 해요',z:'약 27.8cm · 430g',b:'눈썹과 눈꺼풀이 완성되고 머리카락이 자라요. 큰 소리에 반응해 움직이기도 해요.',m:'배가 커지며 피부가 당기고 가려울 수 있어요.',t:'보습제를 넉넉히 — 튼살 관리의 기본이에요.',x:'눈썹과 눈꺼풀이 완성되고 잡는 반사가 강해져 탯줄을 잡고 놀기도 해요.',c:'배가 커지며 가려울 수 있어요 — 보습을 습관으로.'},
        23:{e:'🥭',s:'망고만 해요',z:'약 28.9cm · 500g',b:'엄마 목소리를 구분하기 시작한다는 연구들이 있어요. 피부는 아직 쭈글쭈글 — 지방을 채우는 중이에요.',m:'가진통(브랙스턴 힉스)을 처음 느낄 수도 있어요.',t:'책 읽어주기, 노래 불러주기 — 목소리를 많이 들려주세요.',x:'폐에서 숨쉬기에 필요한 계면활성제를 준비하기 시작하고, 큰 소리에 놀람 반사를 보여요.',c:'임신성 당뇨 검사(24~28주) 일정을 확인해요.'},
        24:{e:'🌽',s:'옥수수만 해요',z:'약 30cm · 600g',b:'의학적으로 생존 가능선에 도달하는 중요한 이정표예요. 폐에서 숨쉬기에 필요한 계면활성제를 만들기 시작해요.',m:'임신성 당뇨 검사(24~28주)를 받는 시기예요.',t:'검사 전 준비사항(금식 여부 등)을 병원에서 꼭 확인하세요.',x:'의학적 생존가능선에 도달하는 큰 이정표예요. 폐포가 빠르게 발달하고 피부가 불투명해지기 시작해요.',c:'임당 검사를 예약해요. 검사 전 준비사항(금식 여부)을 병원에 확인해요.'},
        25:{e:'🥒',s:'애호박만 해요',z:'약 33cm · 660g',b:'코로 숨 쉬는 연습을 시작했어요(양수 속에서요!). 손을 쥐는 힘이 점점 세지고 있어요.',m:'머리카락에 윤기가 도는 등 임신 호르몬의 좋은 점도 있어요.',t:'태동이 활발한 시간대 패턴을 슬슬 파악해두면 좋아요.',x:'손을 쥐는 힘이 세지고 콧구멍이 열려요. 모세혈관이 생기며 피부가 분홍빛을 띠어요.',c:'태동이 가장 활발한 시간대 패턴을 파악해두면 나중에 큰 기준이 돼요.'},
        26:{e:'🥬',s:'상추 한 포기만 해요',z:'약 35cm · 760g',b:'감겨 있던 눈을 뜨기 시작해요! 폐의 혈관이 발달하며 호흡 준비가 진행돼요.',m:'수면 자세가 불편해지는 시기 — 옆으로 눕는 습관이 도움돼요.',t:'다리 사이에 끼는 베개(바디필로우)가 옆잠을 편하게 해줘요.',x:'감겨 있던 눈을 뜨기 시작하고, 뇌파 검사에서 시각·청각 자극에 반응해요.',c:'잠자리가 불편해지는 시기 — 바디필로우가 옆잠을 편하게 해줘요.'},
        27:{e:'🥦',s:'콜리플라워만 해요',z:'약 36.5cm · 875g',b:'3분기 시작! 자고 깨는 주기가 규칙적이고 렘수면도 해요 — 꿈을 꿀지도 몰라요. 딸꾹질이 배에서 톡톡 느껴져요.',m:'숨이 조금 차고 속쓰림이 늘 수 있어요.',t:'자궁 혈류를 위해 왼쪽으로 눕는 자세가 좋다고 알려져 있어요.',x:'3분기 시작! 뇌 표면 주름이 급증하고 렘수면을 해요 — 꿈을 꿀지도 몰라요.',c:'28주부터 검진이 2주 간격이 돼요 — 일정을 미리 조정해요.'},
        28:{e:'🍆',s:'가지만 해요',z:'약 37.5cm · 1kg',b:'속눈썹이 생기고 눈을 깜빡여요. 뇌 표면에 주름이 늘며 급성장 중이에요.',m:'이제 검진이 2주 간격으로 잦아지는 시기예요.',t:'백일해(Tdap) 예방접종 시기(27~36주) — 아기에게 항체를 물려줘요.',x:'속눈썹이 생기고 눈을 깜빡여요. 뇌가 체온 조절과 호흡 리듬을 직접 관리하기 시작해요.',c:'백일해(Tdap) 접종 시기(27~36주). Rh 음성이면 면역글로불린도 이번 주예요.'},
        29:{e:'🎃',s:'버터넛 호박만 해요',z:'약 38.5cm · 1.15kg',b:'근육과 폐가 계속 성숙하고, 매일 약 250mg의 칼슘이 뼈에 쌓여요.',m:'칼슘·비타민D를 충분히 챙기면 좋아요.',t:'태동의 정상 횟수는 정해져 있지 않아요. 평소 움직임 패턴을 알아두면 좋아요.',x:'매일 약 250mg의 칼슘이 뼈에 쌓이고 근육과 폐가 계속 성숙해요.',c:'칼슘·비타민D를 충분히 — 우유·멸치·달걀·잠깐의 햇볕.'},
        30:{e:'🥬',s:'양배추만 해요',z:'약 40cm · 1.3kg',b:'뇌 주름이 깊어지며 뇌 조직이 크게 늘어요. 골수가 적혈구 생산을 맡기 시작했어요.',m:'손목 저림·발 부종이 흔해지는 시기예요.',t:'틈틈이 손목 스트레칭, 다리는 높게 올려두세요.',x:'뇌가 빠르게 자라 머리둘레가 눈에 띄게 커지고, 골수가 적혈구 생산을 완전히 넘겨받았어요.',c:'출산 가방 리스트를 준비물 🍼에 만들기 시작해요.'},
        31:{e:'🥥',s:'코코넛만 해요',z:'약 41cm · 1.5kg',b:'다섯 가지 감각이 모두 작동해요. 고개를 좌우로 돌릴 수 있어요.',m:'가진통이 잦아질 수 있어요 — 쉬면 가라앉는 게 가진통이에요.',t:'태동이 평소보다 줄거나 패턴이 달라지면 기다리지 말고 의료진에게 문의하세요.',x:'다섯 감각이 모두 작동하고 고개를 좌우로 돌려요. 양수의 대부분은 이제 아기 소변으로 만들어져요.',c:'태동이 평소보다 줄면 기다리지 말고 바로 연락 — 이 원칙을 둘 다 외워둬요.'},
        32:{e:'🥬',s:'배추만 해요',z:'약 42.5cm · 1.7kg',b:'많은 아기가 이 무렵 머리를 아래로 돌려요. 피부가 불투명해지고 발톱까지 완성됐어요.',m:'자궁이 갈비뼈 근처까지 올라와 숨이 찰 수 있어요.',t:'조산 신호(규칙적 진통·출혈·양수 새는 느낌)를 알아두면 든든해요.',x:'많은 아기가 머리를 아래로 돌리는 시기예요. 발톱까지 완성됐고 피부가 불투명해졌어요.',c:'조산 신호(규칙적 진통·출혈·양수 새는 느낌)를 미리 공부해두면 든든해요.'},
        33:{e:'🍍',s:'파인애플만 해요',z:'약 43.5cm · 1.9kg',b:'두개골만 빼고 뼈가 단단해졌어요 — 두개골은 출산을 위해 부드럽게 유지돼요. 엄마의 항체가 태반을 건너가 면역 선물이 전달돼요.',m:'잠들기 어려운 밤이 늘 수 있어요.',t:'출산 가방 리스트를 슬슬 만들어보세요.',x:'출산 때 산도를 통과하기 위해 두개골만 부드럽게 유지돼요. 엄마의 항체가 태반을 건너가 면역 선물이 전달되는 중이에요.',c:'출산 계획(진통 시 연락·이동·입원 절차)을 둘이 이야기해봐요.'},
        34:{e:'🍈',s:'멜론만 해요',z:'약 45cm · 2.1kg',b:'폐가 거의 다 성숙했어요. 피부의 태지가 두꺼워지며 출산을 준비해요.',m:'골반 쪽 압박감이 느껴질 수 있어요.',t:'모유수유 계획과 아기용품을 점검하기 좋은 때예요.',x:'폐가 거의 다 성숙했어요. 태지가 두꺼워지며 출산을 준비해요.',c:'모유수유 계획을 세우고 아기용품을 점검해요.'},
        35:{e:'🍈',s:'허니듀 멜론만 해요',z:'약 46cm · 2.4kg',b:'신장이 완전히 발달했고 간도 노폐물을 처리하기 시작해요. 공간이 좁아져 큰 발차기 대신 꿈틀거림으로 바뀌어요.',m:'화장실을 더 자주 가게 돼요.',t:'GBS(B군 연쇄상구균) 검사가 35~37주에 있어요.',x:'신장이 완전히 발달하고 간이 노폐물 처리를 시작해요. 공간이 좁아 큰 발차기 대신 꿈틀거림으로 바뀌어요.',c:'GBS 검사(35~37주)를 받아요.'},
        36:{e:'🥬',s:'로메인 상추만 해요',z:'약 47.5cm · 2.6kg',b:'이번 주가 지나면 조기 만삭! 머리가 골반으로 내려오면 숨쉬기가 한결 편해져요.',m:'검진이 주 1회로 바뀌는 시기예요.',t:'병원 가는 길과 소요 시간을 미리 리허설해보세요.',x:'이번 주가 지나면 조기 만삭! 머리가 골반으로 내려오면 숨쉬기가 한결 편해져요.',c:'주 1회 검진 시작. 병원 가는 길과 소요 시간을 실제로 리허설해봐요.'},
        37:{e:'🌿',s:'파 한 단만 해요',z:'약 48.5cm · 2.9kg',b:'조기 만삭에 들어왔어요. 폐와 뇌는 39주까지 마지막 마무리 성숙을 계속해요. 손아귀 힘이 제법 세요.',m:'이슬·가진통 등 몸의 신호가 늘어날 수 있어요.',t:'진진통(간격이 점점 짧고 규칙적)과 가진통 구분법을 익혀두세요.',x:'조기 만삭 도달 — 폐와 뇌는 39주까지 마지막 성숙을 계속해요. 지방이 붙어 체온 조절 준비가 돼가요.',c:'진진통 구분법 5-1-1(5분 간격·1분 지속·1시간 지속)을 둘 다 외워요.'},
        38:{e:'🍉',s:'미니 수박만 해요',z:'약 50cm · 3.1kg',b:'장에는 첫 응가가 될 태변이 준비됐어요. 뇌는 평생 발달의 기초를 다지는 중이에요.',m:'배가 아래로 처지는 느낌이 들 수 있어요.',t:'정상 태동 횟수는 따로 없어요. 평소보다 줄거나 달라지면 기다리지 말고 의료진에게 문의하세요.',x:'장에 첫 태변이 준비됐고, 뇌는 평생 발달의 기초를 다지는 중이에요.',c:'출산 가방은 현관에, 신분증·산모수첩 등 서류를 한 봉투에 모아둬요.'},
        39:{e:'🍉',s:'수박만 해요',z:'약 50.5cm · 3.3kg',b:'완전 만삭! 피하지방이 채워져 체온 조절 준비가 끝났어요.',m:'언제 시작돼도 이상하지 않은 시기예요.',t:'이슬·양수·규칙적 진통 — 출발 신호 3가지를 기억하세요.',x:'완전 만삭! 피하지방이 채워져 체온 조절 준비 완료, 태반의 항체 전달이 절정이에요.',c:'출발 신호 세 가지(이슬·양수·규칙적 진통)를 다시 확인해요.'},
        40:{e:'🎃',s:'작은 호박만 해요',z:'약 51cm · 3.4kg',b:'예정일 주간! 정확히 예정일에 태어나는 아기는 약 5%뿐이에요 — 아기만의 시간표가 있어요.',m:'조급해하지 않아도 괜찮아요.',t:'짐은 현관에, 마음은 편안하게 — 신호가 오면 병원으로.',x:'예정일 주간! 정확히 예정일에 태어나는 아기는 약 5%뿐 — 아기만의 시간표가 있어요. 태반은 여전히 산소와 영양을 잘 전달하고 있어요.',c:'예정일이 지나면 태동 관찰과 태아 안녕검사(NST) 일정을 병원과 논의해요.'},
        41:{e:'⏳',s:'예정일이 지났어요',z:'',b:'첫 출산의 절반 가까이가 예정일을 넘겨요. 태동 모니터링과 비수축검사(NST)로 아기 상태를 자주 확인하는 시기예요.',m:'',t:'41~42주에는 유도분만을 권하는 경우가 많아요 — 병원과 계획을 세우세요.'},
        42:{e:'🏥',s:'이제 곧 만나요',z:'',b:'42주부터는 과숙 임신으로 분류돼 태반 기능과 양수량을 면밀히 확인해요.',m:'',t:'의료진과 분만 방법을 바로 상의하는 것이 안전해요.'}
      };

      function weekGuideEntry(week){
        week=Number(week);
        if(!isFinite(week)||week<0) return null;
        if(week<4) return {e:'🌱',s:'아주 작은 시작이에요',z:'',b:'수정란이 세포분열을 거듭하며 자궁으로 향하는 아주 초기예요.',m:'아직 몸의 변화를 느끼기 어려운 때예요.',t:'엽산을 꾸준히 챙기는 것이 이 시기의 가장 확실한 준비예요.'};
        if(week>42) return PREGNANCY_GUIDE[42];
        return PREGNANCY_GUIDE[week]||null;
      }

      // 주차별 가이드 카드를 히어로 아래에 그린다.
      // 서버 없이 화면 데이터만 사용하므로 어떤 실패도 앱 흐름에 영향을 주지 않는다.
      function renderWeekGuide(pregnancy){
        var box=el('weekGuide');
        if(!box) return;
        try {
          var phase=String(pregnancy&&pregnancy.phase||'').toUpperCase();
          var entry=(pregnancy&&pregnancy.valid!==false&&phase!=='BORN')?weekGuideEntry(pregnancy.week):null;
          if(!entry){ hide(box); box.innerHTML=''; return; }
          var head='<span class="wg-emoji" aria-hidden="true">'+entry.e+'</span>'
            +'<span class="wg-title"><strong>이번 주 일콩이는 '+escapeHtml(entry.s)+'</strong>'
            +(entry.z?'<span class="wg-size">'+escapeHtml(entry.z)+'</span>':'')+'</span>'
            +'<span class="wg-chevron" aria-hidden="true">'+(state.weekGuideOpen?'▲':'▼')+'</span>';
          var body;
          if(state.weekGuideOpen){
            body='<div class="wg-detail">'
              +'<p><strong>👶 지금 일콩이는</strong> '+escapeHtml(entry.b)+'</p>'
              +(entry.x?'<p><strong>🔬 더 자세히</strong> '+escapeHtml(entry.x)+'</p>':'')
              +(entry.m?'<p><strong>🤰 엄마 몸은</strong> '+escapeHtml(entry.m)+'</p>':'')
              +(entry.t?'<p><strong>💡 이번 주 팁</strong> '+escapeHtml(entry.t)+'</p>':'')
              +(entry.c?'<p><strong>📌 이번 주 할 일</strong> '+escapeHtml(entry.c)+'</p>':'')
              +(function(){
                  var week=Number(pregnancy&&pregnancy.week);
                  if(!isFinite(week)) return '';
                  var names=PRENATAL_TESTS.filter(function(t){ return week>=t.from&&week<=t.to; }).map(function(t){ return escapeHtml(t.name); });
                  return names.length?'<p><strong>🧪 지금 열린 검사 창</strong> '+names.join(' · ')+' — 자세한 건 가이드 📚</p>':'';
                })()
              +'<p class="wg-note">평균 기준이라 개인차가 있어요 · 정확한 상태는 검진에서 확인해요</p>'
              +'</div>';
          } else {
            body='<p class="wg-preview">'+escapeHtml(entry.b)+'</p>';
          }
          box.innerHTML='<button id="weekGuideToggle" class="wg-toggle" type="button" aria-expanded="'+(state.weekGuideOpen?'true':'false')+'">'+head+'</button>'+body;
          var toggle=box.querySelector('#weekGuideToggle');
          if(toggle) toggle.addEventListener('click',function(){ state.weekGuideOpen=!state.weekGuideOpen; renderWeekGuide(pregnancy); });
          show(box);
        } catch(guideError){ hide(box); }
      }

      // v2.8.6: 서버가 동봉한 새 세션(수명 연장)을 조용히 받아들인다.
      // 화면 갱신 감지(fingerprint)나 상태 병합과 절대 섞이지 않도록 홈 데이터에서 즉시 떼어낸다.
      // 어떤 경우에도 실패가 화면 흐름을 막지 않는다.
      function adoptRenewedSession(home){
        if(!home||!home.renewedSession) return;
        var renewed=home.renewedSession;
        delete home.renewedSession;
        try {
          if(!state.session||!validSession(renewed)) return;
          if(String(renewed.user&&renewed.user.id||'')!==String(state.session.user&&state.session.user.id||'')) return;
          state.session=renewed;
          saveSession(renewed);
          renderSessionInfo();
        } catch(e){}
      }

      function calendarDay(value){
        var key=String(value||'');
        if(!/^\d{4}-\d{2}-\d{2}$/.test(key)) return NaN;
        var date=new Date(key+'T00:00:00Z');
        return isFinite(date.getTime())&&date.toISOString().slice(0,10)===key?date.getTime()/86400000:NaN;
      }

      function pregnancyForToday(value,asOfDate){
        if(!value) return null;
        var p=Object.assign({},value), now=calendarDay(today());
        var due=calendarDay(p.dueDate), birth=calendarDay(p.birthDate);
        if(String(p.phase||'').toUpperCase()==='BORN'){
          p.valid=isFinite(birth); p.ageDays=p.valid?Math.max(0,now-birth):0;
          p.week=0; p.day=0; p.dday=-p.ageDays; p.checkupDate=''; p.checkupDday=null;
        }else{
          var reference=calendarDay(p.referenceDate), baseline=calendarDay(p.calculatedOn||asOfDate);
          var total=NaN;
          if(isFinite(reference)&&isFinite(Number(p.referenceWeek))&&isFinite(Number(p.referenceDay))){
            total=Number(p.referenceWeek)*7+Number(p.referenceDay)+now-reference;
          }else if(p.valid!==false&&isFinite(baseline)&&isFinite(Number(p.week))&&isFinite(Number(p.day))){
            total=Number(p.week)*7+Number(p.day)+now-baseline;
          }
          p.valid=p.valid!==false&&isFinite(total)&&isFinite(due);
          p.week=p.valid?Math.floor(Math.max(0,total)/7):undefined;
          p.day=p.valid?Math.max(0,total)%7:undefined;
          p.dday=isFinite(due)?due-now:undefined;
          var checkup=calendarDay(p.checkupDate);
          p.checkupDday=isFinite(checkup)&&checkup>=now?checkup-now:null;
          if(p.checkupDday===null) p.checkupDate='';
        }
        p.calculatedOn=today();
        return p;
      }

      function homeForToday(value,options){
        var home=Object.assign({},value), app=Object.assign({},home.app||{});
        var baseline=home.asOfDate||(!options.fromSnapshot?today():'');
        app.pregnancy=pregnancyForToday(app.pregnancy,baseline);
        if(app.trip){
          var trip=Object.assign({},app.trip), now=calendarDay(today()), from=calendarDay(trip.from), to=calendarDay(trip.to);
          trip.dday=from-now; trip.dayIndex=now>=from&&now<=to?now-from+1:null;
          app.trip=trip;
        }
        home.app=app; home.asOfDate=today();
        if(!options.fromSnapshot&&!options.dateOnly) home.fetchedAt=Number(home.fetchedAt)||Date.now();
        return home;
      }

      function renderDateFreshness(){
        var node=el('dateFreshness');
        if(!node) return;
        if(!state.homeFromSnapshot&&!state.dateRefreshNeeded){ hide(node); return; }
        var fetchedAt=Number(state.home&&state.home.fetchedAt)||0;
        var known=state.home&&state.home.app&&state.home.app.pregnancy&&state.home.app.pregnancy.valid!==false;
        text(node,(fetchedAt?'마지막 확인 '+formatOperationalTime(fetchedAt):'저장된 기록 · 마지막 확인 시각 없음')+(known?' · 날짜는 오늘 기준':' · 주수 확인 필요'));
        show(node);
      }

      function refreshDateContext(){
        if(!state.home||state.homeDateKey===today()) return false;
        state.dateRefreshNeeded=true;
        applyHome(state.home,{fromSnapshot:state.homeFromSnapshot,dateOnly:true,preserveScroll:true});
        if(!el('guidebook').classList.contains('hidden')) renderGuidebook();
        return true;
      }

      function applyHome(home,options){
        options=options||{};
        home=home||{};
        adoptRenewedSession(home);
        home=homeForToday(home,options);
        var nextFingerprint=fingerprintHome(home);
        var changed=!state.homeFingerprint||state.homeFingerprint!==nextFingerprint;
        var view=changed&&options.preserveScroll?captureFeedView():null;
        state.home=home;
        state.homeDateKey=today();
        state.homeFromSnapshot=!!options.fromSnapshot;
        if(!options.fromSnapshot&&!options.dateOnly) state.dateRefreshNeeded=false;
        renderDateFreshness();
        state.revision=String(home.revision||state.revision||'');
        state.hasMore=!!home.hasMore;
        state.nextOffset=Number(home.nextOffset||((home.posts||[]).length));
        state.loadedCount=Math.max(PAGE_SIZE,(home.posts||[]).length);
        text(el('versionText'),releaseVersionLine());
        var pregnancy=home.app&&home.app.pregnancy?home.app.pregnancy:null;
        var week=pregnancy?Number(pregnancy.week):NaN;
        var day=pregnancy?Number(pregnancy.day):NaN;
        var dday=pregnancy?Number(pregnancy.dday):NaN;
        var phase=String((pregnancy&&pregnancy.phase)||(home.app&&home.app.phase)||'PREGNANCY').toUpperCase();
        var ageDays=pregnancy?Number(pregnancy.ageDays):NaN;
        if(phase==='BORN'&&(pregnancy&&pregnancy.birthDate)){
          if(!isFinite(ageDays)) ageDays=daysSince(pregnancy.birthDate);
          text(el('pregnancyText'),isFinite(ageDays)?(ageDays===0?'오늘 일콩을 만났어 💛':'일콩 생후 '+ageDays+'일'):'일콩과 함께하는 오늘');
          text(el('ddayText'),'실제 출생일 '+formatKoreanDate(pregnancy.birthDate)+'부터 함께한 시간을 기록하고 있어.');
        }else if(pregnancy&&pregnancy.valid!==false&&isFinite(week)&&isFinite(day)&&isFinite(dday)){
          text(el('pregnancyText'),'임신 '+week+'주 '+day+'일');
          text(el('ddayText'),dday>=0?'예정일까지 D-'+dday:'예정일이 '+Math.abs(dday)+'일 지났어. 실제 출생일을 설정하면 생후 기록으로 바뀌어.');
        }else{
          text(el('pregnancyText'),'일콩과 함께하는 오늘');
          text(el('ddayText'),'임신 정보를 불러오면 이곳에 주수와 예정일이 표시돼.');
        }
        renderWeekGuide(pregnancy);
        renderMilestone(pregnancy);
        renderCheckup(pregnancy);
        renderKickButton(pregnancy);
        renderWeeklyPrompt(pregnancy);
        renderDailyTip(pregnancy);
        renderPregProgress(pregnancy);
        renderTripBanner();
        renderTripSegment();
        renderHomeSummary(pregnancy);
        if(!options.dateOnly) refreshHomeSummaryChecklist();
        if(state.activeTab==='question') renderQuestionHead();
        if(!options.fromSnapshot&&!options.dateOnly) persistHomeSnapshot(home);
        setTimeout(pushWidgetState,50);
        if(!options.dateOnly) hide(el('feedStatus'));
        if(changed){
          state.homeFingerprint=nextFingerprint;
          var rendered=renderPosts(home.posts||[]);
          if(view&&rendered) restoreFeedView(view);
        }
        renderLoadMore();
        return changed;
      }

      function hasTodayRecordForCurrentUser(){
        var userId=String(currentUserId()||'').toUpperCase();
        var posts=state.home&&Array.isArray(state.home.posts)?state.home.posts:[];
        for(var i=0;i<posts.length;i++){
          var post=posts[i]||{};
          if(String(post.recordDate||'')!==today()) continue;
          if(post.mine===true||String(post.authorId||'').toUpperCase()===userId) return true;
        }
        return false;
      }

      function shortcutOptions(){
        return [
          {key:'health',icon:'🩺',title:'엄마 건강 기록',description:'체중 · 혈압 · 영양제',sheet:'healthSheet'},
          {key:'notes',icon:'🏥',title:'검진노트',description:'질문과 검진 메모',sheet:'checkupNotes'},
          {key:'checklist',icon:'🍼',title:'출산 준비',description:'준비물 모아보기',sheet:'checklist'},
          {key:'kick',icon:'👣',title:'태동 세기',description:'움직임 기록하기',sheet:'kickCounter'},
          {key:'memories',icon:'🖼️',title:'사진 추억함',description:'우리 사진 모아보기',sheet:'memories'}
        ];
      }

      function normalizeShortcutPreferences(value){
        var keys=shortcutOptions().map(function(item){ return item.key; });
        value=value&&typeof value==='object'?value:{};
        var favorites=Array.isArray(value.favorites)?value.favorites:['health','notes','checklist'];
        favorites=favorites.filter(function(key,index){ return keys.indexOf(key)>=0&&favorites.indexOf(key)===index; }).slice(0,3);
        return {home:keys.indexOf(value.home)>=0?value.home:'checklist',favorites:favorites};
      }

      function shortcutPreferences(){
        var prefs=null, user=currentUserId();
        try{ if(user) prefs=JSON.parse(storageGet('ilkong_shortcuts_v1_'+user.toUpperCase())||'null'); }catch(error){}
        return normalizeShortcutPreferences(prefs);
      }

      function saveShortcutPreferences(home,favorites){
        var user=currentUserId();
        if(!user) return false;
        var prefs=normalizeShortcutPreferences({home:home,favorites:favorites});
        if(!storageSet('ilkong_shortcuts_v1_'+user.toUpperCase(),JSON.stringify(prefs))){
          toast('바로가기를 저장하지 못했어. 기기 저장 공간을 확인해 줘.');
          return false;
        }
        renderFavoriteShortcuts();
        renderHomeSummary(state.home&&state.home.app&&state.home.app.pregnancy);
        return true;
      }

      function openShortcut(key,fromMore){
        var item=shortcutOptions().filter(function(option){ return option.key===key; })[0];
        if(!item) return;
        if(fromMore) hide(el('moreSheet'));
        if(key==='health') openHealthSheet();
        else if(key==='notes') openCheckupNotes();
        else if(key==='checklist') openChecklist();
        else if(key==='kick') openKickCounter();
        else if(key==='memories') openMemories();
        if(fromMore) state.sheetReturn[item.sheet]='moreSheet';
      }

      function openHomeShortcut(){
        openShortcut(shortcutPreferences().home,false);
      }

      function renderFavoriteShortcuts(){
        var box=el('favoriteShortcuts');
        if(!box) return;
        box.innerHTML='';
        var prefs=shortcutPreferences(), options=shortcutOptions();
        if(!prefs.favorites.length){
          var note=document.createElement('p'); note.textContent='바로가기 편집에서 자주 쓰는 메뉴를 골라 줘.'; box.appendChild(note);
        }
        prefs.favorites.forEach(function(key){
          var item=options.filter(function(option){ return option.key===key; })[0];
          var button=document.createElement('button'); button.type='button'; button.className='more-item';
          button.innerHTML='<span aria-hidden="true">'+item.icon+'</span>'+escapeHtml(item.title);
          button.addEventListener('click',function(){ openShortcut(key,true); });
          box.appendChild(button);
        });
      }

      function renderShortcutSettings(){
        var prefs=shortcutPreferences(), options=shortcutOptions(), select=el('homeShortcutSelect'), choices=el('shortcutChoices');
        select.innerHTML=''; choices.innerHTML='';
        options.forEach(function(item){
          var option=document.createElement('option'); option.value=item.key; option.textContent=item.title; select.appendChild(option);
          var label=document.createElement('label'), checkbox=document.createElement('input');
          checkbox.type='checkbox'; checkbox.checked=prefs.favorites.indexOf(item.key)>=0;
          checkbox.addEventListener('change',function(){
            var old=shortcutPreferences(), next=old.favorites.filter(function(key){ return key!==item.key; });
            if(this.checked) next.push(item.key);
            if(next.length>3){ this.checked=false; toast('상단 메뉴는 최대 3개까지 고를 수 있어.'); return; }
            if(!saveShortcutPreferences(old.home,next)) this.checked=old.favorites.indexOf(item.key)>=0;
          });
          label.appendChild(checkbox); label.appendChild(document.createTextNode(item.title)); choices.appendChild(label);
        });
        select.value=prefs.home;
        renderFavoriteShortcuts();
      }

      function renderHomeSummary(pregnancy){
        if(!el('homeSummary')) return;
        var wroteToday=hasTodayRecordForCurrentUser();
        text(el('summaryCheckinTitle'),wroteToday?'오늘 기록 완료':'오늘 한 줄');
        text(el('summaryCheckinDesc'),wroteToday?'오늘 마음을 남겼어':'가볍게 마음을 남겨봐');

        var checkupDate=pregnancy&&pregnancy.valid!==false?String(pregnancy.checkupDate||''):'';
        var checkupDday=pregnancy?Number(pregnancy.checkupDday):NaN;
        if(checkupDate&&isFinite(checkupDday)&&checkupDday>=0){
          text(el('summaryCheckupTitle'),checkupDday===0?'오늘 검진':'검진 D-'+checkupDday);
          text(el('summaryCheckupDesc'),formatKoreanDate(checkupDate));
        }else{
          text(el('summaryCheckupTitle'),'다음 검진');
          text(el('summaryCheckupDesc'),'일정을 정해두면 알려줄게');
        }

        var shortcut=shortcutPreferences().home;
        var item=shortcutOptions().filter(function(option){ return option.key===shortcut; })[0];
        text(el('summaryShortcutIcon'),item.icon);
        if(shortcut!=='checklist'){
          text(el('summaryChecklistTitle'),item.title);
          text(el('summaryChecklistDesc'),item.description);
          return;
        }
        var items=Array.isArray(state.homeSummaryChecklist)?state.homeSummaryChecklist:[];
        var remaining=[];
        for(var i=0;i<items.length;i++) if(!items[i].done) remaining.push(items[i]);
        if(remaining.length){
          text(el('summaryChecklistTitle'),'남은 준비 '+remaining.length+'개');
          text(el('summaryChecklistDesc'),String(remaining[0].content||'준비물 확인하기'));
        }else if(items.length){
          text(el('summaryChecklistTitle'),'준비 완료');
          text(el('summaryChecklistDesc'),'목록을 다시 확인해봐');
        }else if(state.homeSummaryChecklistLoading){
          text(el('summaryChecklistTitle'),'출산 준비');
          text(el('summaryChecklistDesc'),'준비물 확인 중…');
        }else{
          text(el('summaryChecklistTitle'),'출산 준비');
          text(el('summaryChecklistDesc'),'첫 준비물을 적어봐');
        }
      }

      function refreshHomeSummaryChecklist(force){
        if(!state.session||state.homeSummaryChecklistLoading) return;
        if(!force&&state.homeSummaryChecklistAt&&Date.now()-state.homeSummaryChecklistAt<90000) return;
        var requestToken=state.session.token;
        state.homeSummaryChecklistLoading=true;
        renderHomeSummary(state.home&&state.home.app&&state.home.app.pregnancy);
        callApi('apiGetChecklistV320',[requestToken],16000).then(unwrap).then(function(data){
          if(!state.session||state.session.token!==requestToken) return;
          state.homeSummaryChecklist=Array.isArray(data&&data.items)?data.items:[];
          state.homeSummaryChecklistAt=Date.now();
        }).catch(function(){}).then(function(){
          if(!state.session||state.session.token!==requestToken) return;
          state.homeSummaryChecklistLoading=false;
          renderHomeSummary(state.home&&state.home.app&&state.home.app.pregnancy);
        });
      }

      function daysSince(value){
        var date=new Date(String(value||'').slice(0,10)+'T00:00:00');
        if(isNaN(date.getTime())) return NaN;
        var now=kstNow();
        var todayDate=new Date(now.getFullYear(),now.getMonth(),now.getDate());
        return Math.max(0,Math.floor((todayDate.getTime()-date.getTime())/86400000));
      }

      function formatKoreanDate(value){
        var parts=String(value||'').slice(0,10).split('-');
        if(parts.length!==3) return String(value||'');
        return Number(parts[0])+'년 '+Number(parts[1])+'월 '+Number(parts[2])+'일';
      }

      function renderLoadMore(){
        if(state.activeTab==='records'||state.activeTab==='question'){
          var cache=pagedCache(state.activeTab), more=el('feedMore'), next=el('loadMore');
          if(!cache||!cache.hasMore){hide(more);return;}
          show(more);next.disabled=!!cache.loading;text(next,cache.loading?'불러오는 중…':(state.activeTab==='question'?'이전 질문 더 보기':'검색 결과 더 보기'));return;
        }
        var wrap=el('feedMore');
        var button=el('loadMore');
        if(!state.home||!state.hasMore){ hide(wrap); return; }
        show(wrap);
        button.disabled=!!state.loadingMore||!!state.loadingAll;
        text(button,state.loadingMore||state.loadingAll?'이전 기록 불러오는 중…':'이전 기록 더 보기');
      }

      function loadMorePosts(){
        if(state.activeTab==='records'||state.activeTab==='question'){
          var cache=pagedCache(state.activeTab);
          if(cache&&cache.hasMore&&!cache.loading) return fetchPagedFeed(state.activeTab,true);
          return;
        }
        if(!state.session||state.loadingMore||state.loadingAll||!state.hasMore) return;
        var requestToken=state.session.token;
        var requestGeneration=state.homeApplyGeneration;
        var requestRevision=String(state.revision||(state.home&&state.home.revision)||'');
        state.loadingMore=true;
        renderLoadMore();
        var offset=Number(state.nextOffset||((state.home&&state.home.posts||[]).length));
        callApi('apiGetHomeV221',[state.session.token,offset,PAGE_SIZE],20000)
          .then(unwrap)
          .then(function(page){
            if(!state.session||state.session.token!==requestToken) return false;
            if(requestGeneration!==state.homeApplyGeneration) return false;
            if(String(state.revision||'')!==requestRevision) return false;
            if(Number(state.nextOffset||((state.home&&state.home.posts||[]).length))!==offset) return false;
            page=page||{};
            var pageRevision=String(page.revision||'');
            if(requestRevision&&pageRevision&&pageRevision!==requestRevision){
              return refreshHome({source:'pagination-recheck',silent:true,force:true}).then(function(){
                toast('기록이 바뀌어 최신 목록으로 다시 맞췄어.');
                return false;
              });
            }
            var current=state.home&&Array.isArray(state.home.posts)?state.home.posts:[];
            var incoming=Array.isArray(page.posts)?page.posts:[];
            var seen={};
            var merged=[];
            current.concat(incoming).forEach(function(post){
              var key=String(post&&post.id||'');
              if(!key||seen[key]) return;
              seen[key]=true;
              merged.push(post);
            });
            var view=captureFeedView();
            state.home=Object.assign({},state.home||{},page,{posts:merged});
            state.revision=String(page.revision||state.revision||'');
            state.nextOffset=Number(page.nextOffset||merged.length);
            state.loadedCount=merged.length;
            state.hasMore=!!page.hasMore;
            state.homeFingerprint=fingerprintHome(state.home);
            if(renderPosts(merged)) restoreFeedView(view);
            toast(incoming.length?'이전 기록 '+incoming.length+'개를 불러왔어.':'더 불러올 기록이 없어.');
            return true;
          })
          .catch(function(error){ toast('이전 기록을 불러오지 못했어: '+errorMessage(error)); })
          .then(function(){ state.loadingMore=false; renderLoadMore(); });
      }

      function filteredPosts(posts){
        posts=Array.isArray(posts)?posts:[];
        // 검색·분류/기간 설정은 기록 탭에서만 사용한다. 홈과 질문은 독립적인 목록이다.
        var libraryActive=state.activeTab==='records';
        return posts.filter(function(post){
          if(state.viewFilter==='FAVORITE'&&!post.favorite) return false;
          if(state.viewFilter==='JISU'&&post.authorId!=='JISU') return false;
          if(state.viewFilter==='HAKONG'&&post.authorId!=='HAKONG') return false;
          if(state.viewFilter==='PHOTO'&&(!post.images||!post.images.length)) return false;
          if(state.viewFilter==='QUESTION'&&!/^Q\.\s/.test(String(post.body||''))) return false;
          if(state.viewFilter==='TRIP'&&!isTripPost(post)) return false;
          if(libraryActive&&state.catFilter==='PHOTO'&&(!post.images||!post.images.length)) return false;
          if(libraryActive&&state.catFilter&&state.catFilter.indexOf('MOOD:')===0&&String(post.mood||'').indexOf(state.catFilter.slice(5))<0) return false;
          if(libraryActive&&state.catFilter&&state.catFilter.indexOf('CAT:')===0&&String(post.category||'일상')!==state.catFilter.slice(4)) return false;
          if(libraryActive&&state.monthFilter&&String(post.recordDate||'').slice(0,7)!==state.monthFilter) return false;
          if(libraryActive&&state.rangeFrom&&String(post.recordDate||'')<state.rangeFrom) return false;
          if(libraryActive&&state.rangeTo&&String(post.recordDate||'')>state.rangeTo) return false;
          if(libraryActive&&state.searchQuery){
            var commentText='';
            if(Array.isArray(post.comments)) for(var ci=0;ci<post.comments.length;ci++) commentText+=' '+String(post.comments[ci]&&post.comments[ci].content||'');
            var hay=[post.title,post.body,post.category,post.authorName,post.recordDate,commentText].join(' ').toLowerCase();
            if(hay.indexOf(state.searchQuery)<0) return false;
          }
          return true;
        }).sort(function(a,b){
          var left=String(a.recordDate||''), right=String(b.recordDate||'');
          return left<right?1:(left>right?-1:0);
        });
      }

      function feedInputIsActive(){
        var feed=el('feed');
        var active=document.activeElement;
        return !!(state.commentComposing||isImeComposing(state.compositionTarget)||(feed&&active&&feed.contains(active)&&isTextEntry(active)));
      }

      function schedulePendingFeedRender(delay){
        if(!state.pendingFeedRender) return;
        if(state.pendingFeedRenderTimer) clearTimeout(state.pendingFeedRenderTimer);
        // 이벤트 누락 대비 fallback은 한 번만 실행한다. 활성 입력이면 다음 focusout/compositionend를 기다린다.
        state.pendingFeedRenderTimer=setTimeout(flushPendingFeedRender,typeof delay==='number'?delay:1200);
      }

      function flushPendingFeedRender(){
        state.pendingFeedRenderTimer=null;
        if(!state.pendingFeedRender) return;
        if(feedInputIsActive()) return;
        var pending=state.pendingFeedRender;
        state.pendingFeedRender=null;
        var view=captureFeedView();
        // 사용자가 키보드를 직접 내린 뒤 지연 렌더가 다시 키보드를 올리지 않게 한다.
        view.focusedCommentId='';
        if(renderPosts(pending.posts,{force:true})) restoreFeedView(view);
      }

      function feedGroupLabel(recordDate){
        var d=new Date(String(recordDate||'')+'T00:00:00');
        if(isNaN(d.getTime())) return '';
        var now=kstNow(); var t0=new Date(now.getFullYear(),now.getMonth(),now.getDate());
        var diff=Math.round((t0.getTime()-d.getTime())/86400000);
        if(diff===0) return '오늘';
        if(diff===1) return '어제';
        if(diff>=2&&diff<=6) return '이번 주';
        return d.getFullYear()+'년 '+(d.getMonth()+1)+'월';
      }
      function emptyStateHtml(){
        var m;
        if(state.activeTab==='records'&&state.searchQuery) m={e:'🔍',t:'검색 결과가 없어',s:'다른 단어로 다시 찾아볼까?'};
        else if(state.activeTab==='question') m={e:'💬',t:'아직 답한 질문이 없어',s:'위 "이 질문에 답하기"로 첫 답을 남겨봐'};
        else if(state.viewFilter==='FAVORITE') m={e:'★',t:'즐겨찾기한 기록이 없어',s:'기록 오른쪽 위 ☆를 누르면 여기에 모여'};
        else if(state.viewFilter==='JISU') m={e:'🌿',t:'지수 기록이 아직 없어',s:'＋ 버튼으로 첫 기록을 남겨봐'};
        else if(state.viewFilter==='HAKONG') m={e:'🌼',t:'하콩 기록이 아직 없어',s:'＋ 버튼으로 첫 기록을 남겨봐'};
        else if(state.viewFilter==='TRIP') m={e:'✈️',t:'여행 기간의 기록이 아직 없어',s:'여행 중에 남긴 기록이 여기에 자동으로 모여'};
        else if(state.activeTab==='records'&&state.catFilter==='PHOTO') m={e:'📷',t:'사진이 있는 기록이 없어',s:'다른 분류를 선택해 볼까?'};
        else if(state.activeTab==='records'&&state.catFilter&&state.catFilter.indexOf('MOOD:')===0) m={e:'💭',t:'이 기분의 기록이 없어',s:'다른 기분으로 찾아볼까?'};
        else if(state.activeTab==='records'&&state.catFilter) m={e:'🗂️',t:'이 분류의 기록이 없어',s:'다른 분류를 골라볼까?'};
        else if(state.activeTab==='records'&&(state.monthFilter||state.rangeFrom||state.rangeTo)) m={e:'📅',t:'이 기간에는 기록이 없어',s:'기간을 바꾸거나 지우기를 눌러봐'};
        else m={e:'🌱',t:'아직 기록이 없어',s:'＋ 버튼으로 우리 셋의 첫 기록을 남겨봐'};
        var hasLibraryFilter=state.activeTab==='records'&&!!(state.searchQuery||state.catFilter||state.monthFilter||state.rangeFrom||state.rangeTo||(state.recordSegment&&state.recordSegment!=='ALL'));
        return '<div class="empty-state"><div class="empty-emoji">'+m.e+'</div><strong>'+m.t+'</strong><span>'+m.s+'</span>'
          +(hasLibraryFilter?'<button id="resetEmptyFilters" class="secondary empty-reset" type="button">필터 지우고 전체 보기</button>':'')+'</div>';
      }
      function renderPosts(posts,options){
        options=options||{};
        renderLibraryFilterSummary();
        if(!options.force&&feedInputIsActive()){
          state.pendingFeedRender={posts:Array.isArray(posts)?posts.slice():[]};
          schedulePendingFeedRender();
          return false;
        }
        if(state.pendingFeedRenderTimer){ clearTimeout(state.pendingFeedRenderTimer); state.pendingFeedRenderTimer=null; }
        state.pendingFeedRender=null;
        if(state.activeTab==='records'||state.activeTab==='question') return renderPagedFeed();
        var feed=el('feed');
        captureLoadedImageSources(feed);
        feed.innerHTML='';
        var visible=filteredPosts(posts);
        var libraryStatus=visible.length+'개 표시 · 현재 '+(posts||[]).length+'개 불러옴';
        if(state.loadingAll) libraryStatus+=' · 이전 기록 확인 중…';
        else if(state.hasMore) libraryStatus+=' · 더 오래된 기록이 있어';
        else libraryStatus+=' · 전체 기록 확인 완료';
        text(el('libraryCount'),libraryStatus);
        var loadAllButton=el('loadAllRecords');
        if(loadAllButton){
          loadAllButton.disabled=!!state.loadingAll||!state.hasMore;
          text(loadAllButton,state.loadingAll?'전체 기록 불러오는 중…':(state.hasMore?'전체 기록 불러오기':'전체 기록을 불러왔어'));
        }
        if(!visible.length){
          feed.innerHTML=emptyStateHtml();
          return true;
        }
        var lastGroup=null;
        for(var i=0;i<visible.length;i++){
          var g=feedGroupLabel(visible[i].recordDate);
          if(g&&g!==lastGroup){ var head=document.createElement('div'); head.className='feed-daygroup'; head.textContent=g; feed.appendChild(head); lastGroup=g; }
          feed.appendChild(postCard(visible[i]));
        }
        return true;
      }

      function renderLibraryLoadingStatus(){
        if(!state.loadingAll||!state.home) return;
        text(el('libraryCount'),'전체 기록을 이어 불러오는 중… 현재 '+(state.home.posts||[]).length+'개 확인');
        if(el('loadAllRecords')){ el('loadAllRecords').disabled=true; text(el('loadAllRecords'),'전체 기록 불러오는 중…'); }
      }
      function ensureAllPostsForLibrary(reason){
        if(!state.session||!state.home) return Promise.resolve(false);
        if(!state.hasMore){
          state.loadedCount=(state.home.posts||[]).length;
          state.nextOffset=Number(state.nextOffset||state.loadedCount);
          return Promise.resolve(true);
        }
        if(state.loadingAll) return state.loadingAllPromise||Promise.resolve(false);
        var requestToken=state.session.token;
        var requestGeneration=state.homeApplyGeneration;
        var requestRevision=String(state.revision||(state.home&&state.home.revision)||'');
        state.loadingAll=true;
        renderLibraryLoadingStatus();
        function next(){
          if(!state.session||state.session.token!==requestToken) return Promise.resolve(false);
          if(requestGeneration!==state.homeApplyGeneration||(requestRevision&&String(state.revision||'')!==requestRevision)) return Promise.resolve(false);
          if(!state.hasMore) return Promise.resolve(true);
          var offset=Number(state.nextOffset||state.home.posts.length);
          return callApi('apiGetHomeV221',[state.session.token,offset,50],24000).then(unwrap).then(function(page){
            if(!state.session||state.session.token!==requestToken) return false;
            if(requestGeneration!==state.homeApplyGeneration||(requestRevision&&String(state.revision||'')!==requestRevision)) return false;
            if(Number(state.nextOffset||state.home.posts.length)!==offset) return false;
            page=page||{};
            var pageRevision=String(page.revision||'');
            if(requestRevision&&pageRevision&&pageRevision!==requestRevision){
              return refreshHome({source:'library-recheck',silent:true,force:true}).then(function(){ return false; });
            }
            if(!requestRevision&&pageRevision) requestRevision=pageRevision;
            var current=state.home&&state.home.posts||[], incoming=Array.isArray(page.posts)?page.posts:[], seen={}, merged=[];
            current.concat(incoming).forEach(function(post){ var id=String(post.id||''); if(id&&!seen[id]){seen[id]=true;merged.push(post);} });
            state.home=Object.assign({},state.home||{},page,{posts:merged});
            state.revision=String(page.revision||state.revision||'');
            state.nextOffset=Number(page.nextOffset||merged.length);
            state.loadedCount=merged.length;
            state.hasMore=!!page.hasMore;
            state.homeFingerprint=fingerprintHome(state.home);
            if(state.hasMore&&state.nextOffset<=offset&&!incoming.length) throw new Error('전체 기록 불러오기가 같은 위치에서 멈췄어.');
            renderLoadMore();
            renderLibraryLoadingStatus();
            return next();
          });
        }
        var loadPromise;
        loadPromise=next().catch(function(error){
          toast('전체 기록을 불러오지 못했어: '+errorMessage(error));
          return false;
        }).then(function(result){
          if(state.loadingAllPromise===loadPromise){
            state.loadingAll=false;
            state.loadingAllPromise=null;
            if(state.session&&state.session.token===requestToken&&requestGeneration===state.homeApplyGeneration&&(!requestRevision||String(state.revision||'')===requestRevision)&&state.home){
              state.loadedCount=(state.home.posts||[]).length;
              state.homeFingerprint=fingerprintHome(state.home);
              renderLoadMore();
              renderPosts(state.home.posts||[]);
              renderMemoriesIfOpen();
            }
          }
          return result;
        });
        state.loadingAllPromise=loadPromise;
        return loadPromise;
      }

      function fingerprintHome(home){
        try {
          return JSON.stringify({
            version:home&&home.version||'',
            pregnancy:home&&home.app&&home.app.pregnancy||null,
            posts:home&&Array.isArray(home.posts)?home.posts:[]
          });
        } catch(e){ return String(Date.now()); }
      }

      function captureFeedView(){
        var view={scrollY:window.scrollY||0,anchorId:'',anchorTop:0,focusedCommentId:''};
        var inputs=el('feed').querySelectorAll('.comment-input');
        for(var i=0;i<inputs.length;i++){
          var card=inputs[i].closest('.post');
          if(card){
            var postId=card.getAttribute('data-post-id');
            var draft=getCommentValue(inputs[i]);
            if(draft) state.commentDrafts[postId]=draft;
            else delete state.commentDrafts[postId];
            if(document.activeElement===inputs[i]) view.focusedCommentId=postId;
          }
        }
        var topbar=el('appPage').querySelector('.topbar');
        var line=topbar?topbar.getBoundingClientRect().bottom:0;
        var cards=el('feed').querySelectorAll('.post');
        for(var c=0;c<cards.length;c++){
          var rect=cards[c].getBoundingClientRect();
          if(rect.bottom>line+4){
            view.anchorId=cards[c].getAttribute('data-post-id')||'';
            view.anchorTop=rect.top;
            break;
          }
        }
        return view;
      }

      function restoreFeedView(view,expectedTab){
        requestAnimationFrame(function(){
          if(expectedTab&&state.activeTab!==expectedTab) return;
          Object.keys(state.commentDrafts||{}).forEach(function(postId){
            var cards=el('feed').querySelectorAll('.post');
            for(var i=0;i<cards.length;i++){
              if(cards[i].getAttribute('data-post-id')===postId){
                var input=cards[i].querySelector('.comment-input');
                if(input){ setCommentValue(input,state.commentDrafts[postId]); resizeCommentInput(input); }
                break;
              }
            }
          });
          if(view.focusedCommentId&&hasFinePointer()&&(!document.activeElement||document.activeElement===document.body)){
            var focusedCard=el('feed').querySelector('[data-post-id="'+cssEscape(view.focusedCommentId)+'"]');
            var focusedInput=focusedCard&&focusedCard.querySelector('.comment-input');
            if(focusedInput) focusedInput.focus();
          }
          if(view.anchorId){
            var cards=el('feed').querySelectorAll('.post');
            for(var i=0;i<cards.length;i++){
              if(cards[i].getAttribute('data-post-id')===view.anchorId){
                var nowTop=cards[i].getBoundingClientRect().top;
                window.scrollBy(0,nowTop-view.anchorTop);
                return;
              }
            }
          }
          window.scrollTo(0,view.scrollY||0);
        });
      }

      function anyEngagementBusy(){
        var keys=Object.keys(state.engagementBusy||{});
        for(var i=0;i<keys.length;i++) if(state.engagementBusy[keys[i]]) return true;
        return false;
      }

      function hasUnsavedComment(){
        var drafts=Object.keys(state.commentDrafts||{});
        for(var d=0;d<drafts.length;d++) if(String(state.commentDrafts[drafts[d]]||'').trim()) return true;
        var inputs=el('feed').querySelectorAll('.comment-input');
        for(var i=0;i<inputs.length;i++) if(getCommentValue(inputs[i])) return true;
        return false;
      }

      function cssEscape(value){
        if(window.CSS&&typeof window.CSS.escape==='function') return window.CSS.escape(String(value));
        return String(value).replace(/(["\\])/g,'\\$1');
      }

      function overlayOpen(){
        return !el('composer').classList.contains('hidden')||!el('checkin').classList.contains('hidden')||!el('settings').classList.contains('hidden')||!el('photoViewer').classList.contains('hidden')||!el('kickCounter').classList.contains('hidden')||!el('laborTimer').classList.contains('hidden')||!el('healthSheet').classList.contains('hidden')||!el('birthPlanSheet').classList.contains('hidden')||!el('capsule').classList.contains('hidden')||!el('checkupNotes').classList.contains('hidden')||!el('bookMaker').classList.contains('hidden')||!el('lapseViewer').classList.contains('hidden')||!el('checklist').classList.contains('hidden')||!el('memories').classList.contains('hidden')||!el('guidebook').classList.contains('hidden')||!el('moreSheet').classList.contains('hidden')||!el('photoPicker').classList.contains('hidden')||!el('tripSheet').classList.contains('hidden');
      }

      function shouldPauseAutoRefresh(){
        if(!state.session||document.hidden||state.saving||state.refreshing||state.loadingAll||state.checkingUpdates||overlayOpen()||anyEngagementBusy()||state.commentComposing) return true;
        var active=document.activeElement;
        if(active&&(/^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName)||active.isContentEditable)) return true;
        if(hasUnsavedComment()) return true;
        if(Date.now()-state.lastInteractionAt<1400) return true;
        return false;
      }

      function startAutoRefresh(){
        stopAutoRefresh();
        state.autoRefreshTimer=setInterval(checkForUpdates,AUTO_REFRESH_MS);
      }

      function stopAutoRefresh(){
        if(state.autoRefreshTimer){ clearInterval(state.autoRefreshTimer); state.autoRefreshTimer=null; }
      }

      function checkForUpdates(){
        refreshDateContext();
        if(shouldPauseAutoRefresh()) return;
        // v2.8.6: 연속 3회 이상 실패하면 60초 간격으로 물러난다(오프라인에서 소음·배터리 절약).
        // 성공하면 실패 횟수가 0이 되어 즉시 원래 30초 간격으로 복귀한다.
        // 수동 새로고침·아래로 당기기는 이 제한과 무관하게 항상 동작한다.
        if(state.autoRefreshFailures>=3&&Date.now()-state.lastAutoCheckAt<60000) return;
        state.lastAutoCheckAt=Date.now();
        if(state.dateRefreshNeeded) return refreshHome({source:'day-change',silent:true,force:true});
        state.checkingUpdates=true;
        callApi('apiCheckUpdatesV240',[state.session.token,state.revision],12000)
          .then(unwrap)
          .then(function(info){
            if(info&&info.changed){
              return refreshHome({source:'auto',silent:true,force:true});
            }
            if(info&&info.revision) state.revision=String(info.revision);
            state.lastRefreshAt=Date.now();
            state.autoRefreshFailures=0;
            return false;
          })
          .catch(function(error){
            state.autoRefreshFailures++;
            if(error&&error.code==='AUTH') return refreshHome({source:'auto',silent:true,force:true});
            return false;
          })
          .then(function(result){
            state.checkingUpdates=false;
            return result;
          });
      }

      function isTextEditingTarget(target){
        return !!(target&&target.closest&&target.closest('input, textarea, select, button, .comment-form, .comment-input'));
      }

      function initPullRefresh(){
        var target=el('appPage');
        target.addEventListener('touchstart',function(e){
          if(isTextEditingTarget(e.target)) return;
          if(e.touches.length!==1||window.scrollY>1||overlayOpen()||state.saving||state.refreshing||state.commentComposing) return;
          state.pulling=true;
          state.pullStartY=e.touches[0].clientY;
          state.pullDistance=0;
        },{passive:true});
        target.addEventListener('touchmove',function(e){
          if(!state.pulling||e.touches.length!==1) return;
          var raw=e.touches[0].clientY-state.pullStartY;
          if(raw<=0){ resetPullIndicator(0); state.pulling=false; return; }
          state.pullDistance=Math.min(105,raw*.58);
          if(e.cancelable) e.preventDefault();
          renderPullDistance(state.pullDistance);
        },{passive:false});
        target.addEventListener('touchend',finishPull,{passive:true});
        target.addEventListener('touchcancel',function(){ state.pulling=false; resetPullIndicator(0); },{passive:true});
      }

      function renderPullDistance(distance){
        var box=el('pullRefresh');
        var ready=distance>=PULL_THRESHOLD;
        box.classList.add('show');
        box.classList.toggle('ready',ready);
        box.classList.remove('loading');
        box.style.transform='translate(-50%,'+Math.round(-74+Math.min(distance,82))+'px)';
        text(el('pullText'),ready?'놓으면 새로고침':'아래로 조금 더 당겨 줘');
        text(el('pullIcon'),'↓');
      }

      function finishPull(){
        if(!state.pulling) return;
        var ready=state.pullDistance>=PULL_THRESHOLD;
        state.pulling=false;
        if(ready) refreshHome({source:'pull',silent:true,force:true});
        else resetPullIndicator(120);
      }

      function setPullStatus(mode,message){
        var box=el('pullRefresh');
        box.classList.add('show');
        box.classList.toggle('loading',mode==='loading');
        box.classList.remove('ready');
        box.style.transform='translate(-50%,0)';
        text(el('pullIcon'),mode==='loading'?'↻':'✓');
        text(el('pullText'),message||'새로고침 중…');
      }

      function resetPullIndicator(delay){
        setTimeout(function(){
          var box=el('pullRefresh');
          box.classList.remove('show','ready','loading');
          box.style.transform='translate(-50%,-80px)';
          text(el('pullIcon'),'↓');
          text(el('pullText'),'아래로 당겨 새로고침');
          state.pullDistance=0;
        },delay||0);
      }

      function titleForDisplay(title,body){
        var normalizedTitle=String(title||'').trim();
        var normalizedBody=String(body||'').trim();
        if(!normalizedTitle) return '';
        if(!normalizedBody) return normalizedTitle;
        var firstLine=normalizedBody.split(/\r?\n/)[0].trim();
        var legacyAutoTitle=firstLine.length>40?firstLine.slice(0,40)+'…':firstLine;
        return normalizedTitle===legacyAutoTitle?'':normalizedTitle;
      }

      function postCard(post){
        var card=document.createElement('article');
        card.className='post';
        card.setAttribute('data-post-id',String(post.id||''));
        var emoji=post.authorId==='HAKONG'?'🌼':'🌿';
        var date=post.recordDate||'';
        // v3.2.1: 쓴 시각을 함께 보여준다. 기록일과 실제 쓴 날이 다르면 날짜까지 붙여 헷갈리지 않게 한다.
        var writtenClock=clockTime(post.createdAt);
        var writtenDate=localDateString(post.createdAt);
        var timeText='';
        if(writtenClock){
          if(writtenDate&&date&&writtenDate!==date) timeText=Number(writtenDate.slice(5,7))+'/'+Number(writtenDate.slice(8,10))+' '+writtenClock+' 씀';
          else timeText=writtenClock;
        }
        var shownTitle=titleForDisplay(post.title,post.body);
        var searchQuery=recordSearchQuery();
        var titleHtml=shownTitle?'<h3>'+searchHighlightedHtml(shownTitle,searchQuery)+'</h3>':'';
        var bodyHtml=String(post.body||'').trim()?'<div class="post-text">'+searchHighlightedHtml(post.body,searchQuery)+'</div>':'';
        var mine=state.session&&state.session.user.id===post.authorId;
        var actions='<div class="post-actions"><button class="post-action favorite'+(post.favorite?' active':'')+'" type="button" aria-pressed="'+(post.favorite?'true':'false')+'" aria-label="'+(post.favorite?'즐겨찾기 해제':'즐겨찾기에 담기')+'">'+(post.favorite?'★':'☆')+'</button>'+(mine?'<button class="post-action edit-post" type="button" aria-label="기록 수정">✎</button><button class="post-action delete-post" type="button" aria-label="기록 삭제">🗑</button>':'')+'</div>';
        card.innerHTML='<div class="post-head"><div class="author"><div class="avatar">'+emoji+'</div><div class="meta"><strong>'+escapeHtml(post.authorName)+'</strong><span>'+escapeHtml(date)+(timeText?' · '+escapeHtml(timeText):'')+(post.edited?'<em class="edited">수정됨</em>':'')+'</span></div></div>'+actions+'</div>'+ 
          '<div class="post-body"><div class="badges">'+(isTripPost(post)?'<span class="badge trip">✈️ '+escapeHtml((tripInfo()&&tripInfo().name)||'여행')+'</span>':'')+'<span class="badge">'+escapeHtml(post.category||'일상')+'</span>'+(post.mood?'<span class="badge">'+escapeHtml(post.mood)+'</span>':'')+'</div>'+titleHtml+searchCommentSummaryHtml(post,searchQuery)+bodyHtml+'</div>';

        if(post.images&&post.images.length){
          var grid=document.createElement('div');
          grid.className='photos'+(post.images.length===1?' one':'');
          var shown=Math.min(post.images.length,4);
          for(var i=0;i<shown;i++)(function(image,index){
            var box=document.createElement('div');
            box.className='photo'; box.setAttribute('data-image-id',String(image.id||'')); box.setAttribute('role','button'); box.setAttribute('tabindex','0'); box.setAttribute('aria-label','사진 '+(index+1)+' 크게 보기');
            box.innerHTML='<span class="photo-fail">사진 준비 중…</span>';
            box.addEventListener('click',function(){ openPhotoViewer(post.images,index); });
            box.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){e.preventDefault();openPhotoViewer(post.images,index);} });
            grid.appendChild(box); observeImage(image.id,box,'thumbnail');
            if(index===3&&post.images.length>4){ var more=document.createElement('span'); more.className='more-count'; more.textContent='+'+(post.images.length-4); more.setAttribute('aria-hidden','true'); box.appendChild(more); box.setAttribute('aria-label','사진 '+post.images.length+'장 모두 보기'); }
          })(post.images[i],i);
          card.appendChild(grid);
        }
        card.appendChild(buildEngagement(post));
        var searchJump=card.querySelector('.search-comment-jump');
        if(searchJump) searchJump.addEventListener('click',function(){ revealSearchComments(card); });
        var favorite=card.querySelector('.favorite');
        if(favorite) favorite.addEventListener('click',function(){
          // v3.9.2: 오래된 카드 데이터가 아니라 항상 현재 기록 상태를 기준으로 토글한다.
          var current=findPost(post.id)||post;
          setFavoriteAction(String(post.id),!current.favorite);
        });
        var edit=card.querySelector('.edit-post'); if(edit) edit.addEventListener('click',function(){ openEditComposer(findPost(post.id)||post); });
        var del=card.querySelector('.delete-post'); if(del) del.addEventListener('click',function(){ if(confirm('이 기록을 삭제할까? 30초 안에는 되돌릴 수 있어.')) deletePost(post.id); });
        return card;
      }

      function getCommentValue(input){
        if(!input) return '';
        return String(input.value||'').replace(/\r\n/g,'\n').trim();
      }
      function setCommentValue(input,value){
        if(!input) return;
        input.value=String(value||'').slice(0,300);
      }
      function limitCommentInput(input){
        if(!input||isImeComposing(input)) return;
        var value=String(input.value||'');
        if(value.length<=300) return;
        var start=typeof input.selectionStart==='number'?input.selectionStart:300;
        var end=typeof input.selectionEnd==='number'?input.selectionEnd:start;
        input.value=value.slice(0,300);
        try { input.setSelectionRange(Math.min(start,300),Math.min(end,300)); } catch(e){}
      }
      function rememberCommentDraft(input){
        if(!input) return;
        var postId=String(input.getAttribute('data-post-id')||'');
        if(!postId) return;
        var value=getCommentValue(input);
        if(value) state.commentDrafts[postId]=value;
        else delete state.commentDrafts[postId];
      }
      function resizeCommentInput(input){
        if(!input||document.activeElement===input||isImeComposing(input)) return;
        // Android WebView가 IME 연결을 만드는 동안 scrollHeight 측정과 높이 변경을 하지 않는다.
        input.style.height='68px';
      }
      function focusTextEntryForDesktop(input,delay){
        if(!input||!hasFinePointer()) return;
        setTimeout(function(){ if(input.isConnected&&typeof input.focus==='function') input.focus(); },typeof delay==='number'?delay:80);
      }

      function renderCommentList(list,post){
        list.innerHTML='';
        var comments=Array.isArray(post.comments)?post.comments:[];
        if(!comments.length){ var empty=document.createElement('div'); empty.className='comment-empty'; empty.textContent='아직 댓글이 없어. 짧게 마음을 남겨봐.'; list.appendChild(empty); return; }
        var roots=[], replies={};
        comments.forEach(function(comment){
          var rootId=comment.rootId||comment.parentId||'';
          if(!comment.parentId) roots.push(comment);
          else { if(!replies[rootId]) replies[rootId]=[]; replies[rootId].push(comment); }
        });
        comments.forEach(function(comment){ if(comment.parentId&&!comment.rootId&&roots.every(function(r){return r.id!==comment.parentId;})) roots.push(comment); });
        roots.sort(function(a,b){return Number(a.sequence||0)-Number(b.sequence||0);});
        roots.forEach(function(root){
          list.appendChild(commentNode(root,post,false));
          var children=(replies[root.id]||[]).sort(function(a,b){return Number(a.sequence||0)-Number(b.sequence||0);});
          children.forEach(function(reply){ list.appendChild(commentNode(reply,post,true)); });
        });
      }

      function commentNode(comment,post,isReply){
        var item=document.createElement('div'); item.className='comment-item'+(isReply?' reply':'');
        var searchQuery=recordSearchQuery();
        if(searchCommentMatches({comments:[comment]},searchQuery).length){
          item.className+=' search-comment-match'; item.setAttribute('tabindex','-1');
        }
        var emoji=comment.authorId==='HAKONG'?'🌼':'🌿';
        var mention=isReply&&comment.replyToName?'<span class="reply-mention">@'+escapeHtml(comment.replyToName)+'</span>':'';
        var content=comment.deleted?'<div class="comment-deleted">삭제된 댓글이야.</div>':'<div class="comment-text">'+mention+searchHighlightedHtml(comment.content||'',searchQuery)+'</div>';
        item.innerHTML='<div class="comment-avatar" aria-hidden="true">'+emoji+'</div><div class="comment-bubble"><div class="comment-meta"><strong>'+escapeHtml(comment.authorName||'')+'</strong><span>'+escapeHtml(shortDateTime(comment.createdAt))+'</span></div>'+content+'<div class="comment-actions"></div></div>';
        var actions=item.querySelector('.comment-actions');
        if(!comment.deleted){
          var reply=document.createElement('button'); reply.type='button'; reply.className='comment-action'; reply.textContent='답글'; reply.addEventListener('click',function(){ setReplyTarget(post.id,comment); }); actions.appendChild(reply);
          if(comment.mine){
            var edit=document.createElement('button'); edit.type='button'; edit.className='comment-action'; edit.textContent='수정';
            edit.addEventListener('click',function(){ startCommentEdit(post.id,comment,item); });
            actions.appendChild(edit);
            var del=document.createElement('button'); del.type='button'; del.className='comment-action'; del.textContent='삭제'; del.addEventListener('click',function(){ deleteCommentAction(post.id,comment.id); }); actions.appendChild(del);
          }
        }
        return item;
      }

      // v3.7.0: 댓글 수정 — 말풍선 자리에서 바로 고친다.
      function startCommentEdit(postId,comment,item){
        var bubble=item.querySelector('.comment-bubble');
        if(!bubble||bubble.querySelector('.comment-edit-input')) return;
        var textBox=bubble.querySelector('.comment-text');
        var actions=bubble.querySelector('.comment-actions');
        if(textBox) textBox.classList.add('hidden');
        if(actions) actions.classList.add('hidden');
        var input=document.createElement('textarea');
        input.className='comment-input comment-edit-input';
        input.maxLength=300;
        input.value=String(comment.content||'');
        input.setAttribute('aria-label','댓글 수정');
        var row=document.createElement('div');
        row.style.display='flex'; row.style.gap='6px'; row.style.marginTop='6px';
        var save=document.createElement('button'); save.type='button'; save.className='comment-send'; save.textContent='저장';
        var cancel=document.createElement('button'); cancel.type='button'; cancel.className='comment-action'; cancel.textContent='취소';
        function close(){
          if(input.parentNode) input.parentNode.removeChild(input);
          if(row.parentNode) row.parentNode.removeChild(row);
          if(textBox) textBox.classList.remove('hidden');
          if(actions) actions.classList.remove('hidden');
        }
        cancel.addEventListener('click',close);
        save.addEventListener('click',function(){
          var value=String(input.value||'').trim();
          if(!value){ toast('댓글 내용을 입력해 줘.'); return; }
          if(value===String(comment.content||'')){ close(); return; }
          if(state.engagementBusy[postId]) return;
          setEngagementBusy(postId,true);
          save.disabled=true;
          callApi('apiEditCommentV370',[state.session.token,comment.id,value],20000).then(unwrap)
            .then(function(data){ toast('댓글을 수정했어 ✍️'); updateEngagement(postId,data); })
            .catch(function(error){ toast(errorMessage(error)); save.disabled=false; })
            .then(function(){ setEngagementBusy(postId,false); });
        });
        row.appendChild(save); row.appendChild(cancel);
        bubble.appendChild(input); bubble.appendChild(row);
        setTimeout(function(){ try{ input.focus(); }catch(focusError){} },60);
      }

      function buildEngagement(post){
        var postId=String(post.id||'');
        var engagement=document.createElement('div');
        engagement.className='engagement'+(state.engagementBusy[postId]?' engagement-busy':'');
        engagement.setAttribute('aria-busy',state.engagementBusy[postId]?'true':'false');
        var reactions=post.reactions||{counts:{},my:''};
        var counts=reactions.counts||{};
        var comments=Array.isArray(post.comments)?post.comments:[];
        var unreadCount=Number(post.commentState&&post.commentState.unreadCount||0);
        var commentsOpen=state.openComments[postId]===true;
        var top=document.createElement('div');
        top.className='engagement-top';
        var reactionRow=document.createElement('div');
        reactionRow.className='reaction-row';
        ['🫶','😂','🥹'].forEach(function(emoji){
          var button=document.createElement('button');
          button.type='button';
          button.className='reaction-btn'+(reactions.my===emoji?' active':'');
          button.setAttribute('data-emoji',emoji);
          var count=Number(counts[emoji]||0);
          button.textContent=emoji+(count?' '+count:'');
          button.setAttribute('aria-label',emoji+' 반응'+(count?' '+count+'개':''));
          button.setAttribute('aria-pressed',reactions.my===emoji?'true':'false');
          button.addEventListener('click',function(){ button.classList.remove('pop'); void button.offsetWidth; button.classList.add('pop'); toggleReactionAction(postId,emoji); });
          reactionRow.appendChild(button);
        });
        var panelId='commentsPanel_'+postId.replace(/[^a-zA-Z0-9_-]/g,'_');
        var toggle=document.createElement('button');
        toggle.type='button';
        toggle.className='comment-toggle'+(unreadCount>0?' has-new':'');
        var liveCommentCount=Number(post.commentState&&post.commentState.count||0);
        toggle.textContent=unreadCount>0?'새 댓글 '+unreadCount+'개':(liveCommentCount?'댓글 '+liveCommentCount:'댓글 쓰기');
        toggle.setAttribute('aria-controls',panelId);
        toggle.setAttribute('aria-expanded',commentsOpen?'true':'false');
        top.appendChild(reactionRow);
        top.appendChild(toggle);
        engagement.appendChild(top);

        var panel=document.createElement('div');
        panel.id=panelId;
        panel.className='comments-panel'+(commentsOpen?'':' hidden');
        var list=document.createElement('div');
        list.className='comment-list';
        renderCommentList(list,post);
        panel.appendChild(list);
        var replyTarget=document.createElement('div'); replyTarget.className='reply-target hidden'; panel.appendChild(replyTarget);
        var form=document.createElement('div');
        form.className='comment-form';
        var input=document.createElement('textarea');
        input.className='comment-input';
        input.rows=2;
        input.maxLength=300;
        input.setAttribute('aria-label','댓글 입력');
        input.placeholder='댓글을 남겨봐';
        input.setAttribute('data-post-id',postId);
        input.setAttribute('inputmode','text');
        input.setAttribute('enterkeyhint','enter');
        input.setAttribute('autocomplete','off');
        input.setAttribute('autocapitalize','sentences');
        input.setAttribute('spellcheck','true');
        setCommentValue(input,state.commentDrafts[postId]||'');
        var send=document.createElement('button');
        send.type='button';
        send.className='comment-send';
        send.textContent='등록';
        var pendingSubmit=false;
        function rememberDraft(){
          rememberCommentDraft(input);
        }
        function submit(){
          if(state.commentComposing||isImeComposing(input)){
            if(!pendingSubmit){
              pendingSubmit=true;
              setTimeout(function(){ pendingSubmit=false; if(!state.commentComposing&&!isImeComposing(input)) submit(); },170);
            }
            return;
          }
          rememberDraft();
          addCommentAction(postId,getCommentValue(input),input);
        }
        send.addEventListener('click',submit);
        input.addEventListener('input',function(e){ state.lastInteractionAt=Date.now(); if(e.isComposing||isImeComposing(input)) return; limitCommentInput(input); rememberDraft(); });
        input.addEventListener('focus',function(){ state.lastInteractionAt=Date.now(); });
        input.addEventListener('focusout',function(){
          setTimeout(function(){ flushPendingEngagementUpdate(postId); },220);
        });
        input.addEventListener('keydown',function(e){
          if(hasFinePointer()&&e.key==='Enter'&&!e.shiftKey&&!e.isComposing&&!isImeComposing(input)&&!state.commentComposing&&e.keyCode!==229){ e.preventDefault(); submit(); }
        });
        form.appendChild(input);
        form.appendChild(send);
        panel.appendChild(form);
        renderReplyTarget(postId,replyTarget,input);
        engagement.appendChild(panel);
        toggle.addEventListener('click',function(){
          state.openComments[postId]=!state.openComments[postId];
          panel.classList.toggle('hidden',!state.openComments[postId]);
          toggle.setAttribute('aria-expanded',state.openComments[postId]?'true':'false');
          if(state.openComments[postId]){
            markCommentsReadAction(postId);
            if(!comments.length&&unreadCount===0) focusTextEntryForDesktop(input,80);
          }
        });
        return engagement;
      }

      function setReplyTarget(postId,comment){
        state.replyTargets[String(postId)]={id:String(comment.id),name:String(comment.authorName||'상대')};
        state.openComments[String(postId)]=true;
        var card=el('feed').querySelector('[data-post-id="'+cssEscape(postId)+'"]');
        var engagement=card&&card.querySelector('.engagement');
        if(engagement){ var panel=engagement.querySelector('.comments-panel'); if(panel) panel.classList.remove('hidden'); var target=engagement.querySelector('.reply-target'); var input=engagement.querySelector('.comment-input'); renderReplyTarget(postId,target,input); focusTextEntryForDesktop(input,50); }
      }

      function renderReplyTarget(postId,target,input){
        if(!target) return;
        var info=state.replyTargets[String(postId)];
        if(!info){ target.classList.add('hidden'); target.innerHTML=''; return; }
        target.classList.remove('hidden'); target.innerHTML='<span><strong>@'+escapeHtml(info.name)+'</strong>에게 답글 쓰는 중</span><button type="button" aria-label="답글 취소">✕</button>';
        target.querySelector('button').addEventListener('click',function(){ delete state.replyTargets[String(postId)]; renderReplyTarget(postId,target,input); focusTextEntryForDesktop(input,50); });
      }

      function shortDateTime(value){
        var date=toKst(value);
        if(!date) return '';
        var now=kstNow();
        var time=pad2(date.getHours())+':'+pad2(date.getMinutes());
        if(date.toDateString()===now.toDateString()) return time;
        return (date.getMonth()+1)+'/'+date.getDate()+' '+time;
      }
      function clockTime(value){
        var date=toKst(value);
        if(!date) return '';
        return pad2(date.getHours())+':'+pad2(date.getMinutes());
      }
      function localDateString(value){ return kstDateString(value); }

      function findPost(postId){
        var posts=[], feeds=state.pagedFeeds||{};
        Object.keys(feeds).forEach(function(kind){
          var cache=feeds[kind];if(!cache) return;
          posts=posts.concat(cache.posts||[]);
          (cache.groups||[]).concat(cache.weekly?[cache.weekly]:[]).forEach(function(group){(group.authors||[]).forEach(function(author){if(author.post) posts.push(author.post);});});
          Object.keys(cache.histories||{}).forEach(function(key){posts=posts.concat(cache.histories[key].posts||[]);});
        });
        posts=posts.concat(state.home&&Array.isArray(state.home.posts)?state.home.posts:[]);
        for(var i=0;i<posts.length;i++) if(String(posts[i].id)===String(postId)) return posts[i];
        return null;
      }

      function commentInputOwnsIme(card){
        var input=card&&card.querySelector('.comment-input');
        return !!(input&&(document.activeElement===input||state.compositionTarget===input||input.__ilkongImeComposing));
      }

      function flushPendingEngagementUpdate(postId){
        var key=String(postId);
        if(!state.pendingEngagementUpdates[key]) return;
        var post=findPost(key);
        if(!post){ delete state.pendingEngagementUpdates[key]; return; }
        var cards=el('feed').querySelectorAll('.post');
        for(var i=0;i<cards.length;i++){
          if(cards[i].getAttribute('data-post-id')!==key) continue;
          if(commentInputOwnsIme(cards[i])) return;
          delete state.pendingEngagementUpdates[key];
          updateEngagementDom(cards[i],post);
          return;
        }
        delete state.pendingEngagementUpdates[key];
      }

      function updateEngagement(postId,data,options){
        options=options||{};
        var post=findPost(postId);
        if(!post||!data) return;
        if(Array.isArray(data.comments)) post.comments=data.comments;
        if(data.commentState) post.commentState=data.commentState;
        if(data.reactions) post.reactions=data.reactions;
        post.comments=Array.isArray(post.comments)?post.comments:[];
        post.commentState=post.commentState||{count:post.comments.length,unreadCount:0};
        post.reactions=post.reactions||{counts:{},my:''};
        if(data.revision) state.revision=String(data.revision);
        state.homeFingerprint=fingerprintHome(state.home);
        var cards=el('feed').querySelectorAll('.post');
        for(var i=0;i<cards.length;i++){
          if(cards[i].getAttribute('data-post-id')===String(postId)){
            if(options.deferWhileCommentInput&&commentInputOwnsIme(cards[i])){
              state.pendingEngagementUpdates[String(postId)]=true;
              break;
            }
            delete state.pendingEngagementUpdates[String(postId)];
            updateEngagementDom(cards[i],post);
            break;
          }
        }
      }

      function updateEngagementDom(card,post){
        var engagement=card&&card.querySelector('.engagement');
        if(!engagement) return;
        var postId=String(post.id||'');
        var busy=!!state.engagementBusy[postId];
        engagement.classList.toggle('engagement-busy',busy);
        engagement.setAttribute('aria-busy',busy?'true':'false');
        var reactions=post.reactions||{counts:{},my:''};
        var counts=reactions.counts||{};
        var buttons=engagement.querySelectorAll('.reaction-btn');
        for(var i=0;i<buttons.length;i++){
          var emoji=buttons[i].getAttribute('data-emoji')||'';
          var count=Number(counts[emoji]||0);
          buttons[i].textContent=emoji+(count?' '+count:'');
          buttons[i].classList.toggle('active',reactions.my===emoji);
          buttons[i].setAttribute('aria-pressed',reactions.my===emoji?'true':'false');
          buttons[i].setAttribute('aria-label',emoji+' 반응'+(count?' '+count+'개':''));
        }
        var comments=Array.isArray(post.comments)?post.comments:[];
        var unreadCount=Number(post.commentState&&post.commentState.unreadCount||0);
        var toggle=engagement.querySelector('.comment-toggle');
        if(toggle){
          var liveCommentCount=Number(post.commentState&&post.commentState.count||0);
        toggle.textContent=unreadCount>0?'새 댓글 '+unreadCount+'개':(liveCommentCount?'댓글 '+liveCommentCount:'댓글 쓰기');
          toggle.classList.toggle('has-new',unreadCount>0);
          toggle.setAttribute('aria-expanded',state.openComments[postId]===true?'true':'false');
        }
        var panel=engagement.querySelector('.comments-panel');
        if(panel) panel.classList.toggle('hidden',state.openComments[postId]!==true);
        var list=engagement.querySelector('.comment-list');
        if(list) renderCommentList(list,post);
        renderReplyTarget(postId,engagement.querySelector('.reply-target'),engagement.querySelector('.comment-input'));
      }

      function setEngagementBusy(postId,busy){
        if(busy&&!state.engagementBusy[postId]) invalidateHomeResponses();
        state.engagementBusy[postId]=busy;
        var cards=el('feed').querySelectorAll('.post');
        for(var i=0;i<cards.length;i++){
          if(cards[i].getAttribute('data-post-id')===String(postId)){
            var engagement=cards[i].querySelector('.engagement');
            if(engagement){
              engagement.classList.toggle('engagement-busy',!!busy);
              engagement.setAttribute('aria-busy',busy?'true':'false');
            }
            break;
          }
        }
      }


      function markCommentsReadAction(postId){
        if(!state.session || state.commentReadMarking[postId]) return;
        var post=findPost(postId);
        var unread=Number(post&&post.commentState&&post.commentState.unreadCount||0);
        if(unread<=0) return;
        invalidateHomeResponses();
        state.commentReadMarking[postId]=true;
        callApi('apiMarkCommentsReadV280',[state.session.token,postId,post&&post.commentState&&post.commentState.latestCommentId||''],12000)
          .then(unwrap)
          .then(function(data){
            if(data){
              updateEngagement(postId,data,{deferWhileCommentInput:true});
              var updated=findPost(postId);
              if(updated&&updated.commentState) state.commentUnreadSeen[postId]=Number(updated.commentState.unreadCount||0);
            }
          })
          .catch(function(){})
          .then(function(){ state.commentReadMarking[postId]=false; });
      }

      function toggleReactionAction(postId,emoji){
        if(state.engagementBusy[postId]) return;
        var post=findPost(postId); var current=post&&post.reactions?post.reactions.my:''; var desired=current===emoji?'':emoji;
        setEngagementBusy(postId,true);
        callApi('apiSetReactionV280',[state.session.token,postId,desired,uuid()],18000)
          .then(unwrap)
          .then(function(data){ updateEngagement(postId,data); setEngagementBusy(postId,false); })
          .catch(function(error){
            toast(errorMessage(error));
            setEngagementBusy(postId,false);
            var before=state.refreshPromise;
            if(state.refreshing&&before) before.then(function(){ refreshHome({source:'reaction-recheck',silent:true,force:true}); });
            else refreshHome({source:'reaction-recheck',silent:true,force:true});
          });
      }

      function addCommentAction(postId,content,input){
        content=String(content||'').trim();
        if(!content){ toast('댓글 내용을 입력해 줘.'); return; }
        if(state.engagementBusy[postId]) return;
        state.openComments[postId]=true;
        var parent=state.replyTargets[String(postId)]||null;
        var signature=content+'|'+(parent?parent.id:'');
        var operation=state.commentOperations[String(postId)];
        if(!operation||operation.signature!==signature) operation=state.commentOperations[String(postId)]={signature:signature,id:uuid()};
        setEngagementBusy(postId,true);
        callApi('apiAddCommentV280',[state.session.token,postId,content,parent?parent.id:'',operation.id],20000)
          .then(unwrap)
          .then(function(data){ delete state.commentDrafts[String(postId)]; delete state.replyTargets[String(postId)]; delete state.commentOperations[String(postId)]; if(input){ setCommentValue(input,''); resizeCommentInput(input); } updateEngagement(postId,data); })
          .catch(function(error){ toast(errorMessage(error)); })
          .then(function(){ setEngagementBusy(postId,false); });
      }

      function deleteCommentAction(postId,commentId){
        if(!confirm('이 댓글을 삭제할까?')||state.engagementBusy[postId]) return;
        state.openComments[postId]=true;
        setEngagementBusy(postId,true);
        callApi('apiDeleteCommentV230',[state.session.token,commentId],18000)
          .then(unwrap)
          .then(function(data){ updateEngagement(postId,data); })
          .catch(function(error){ toast(errorMessage(error)); })
          .then(function(){ setEngagementBusy(postId,false); });
      }

      // v3.6.0: 캐시 키 네임스페이스를 올려, 예전에 잘못 저장된 항목은 자동으로 무시하고 새로 받는다.
      // @include modules/photos.js

      // ===== v3.5.0 탭 UI =====
      function activateTab(name){
        if(name==='guide'){ openGuidebook(); return; }
        if(name==='more'){ renderShortcutSettings(); openOverlaySheet('moreSheet'); return; }
        if(name===state.activeTab){ scrollFeedTop(); return; }
        state.tabViews=state.tabViews||{};
        if(state.activeTab) state.tabViews[state.activeTab]=captureFeedView();
        state.activeTab=name;
        var tabs=document.querySelectorAll('.tab');
        for(var i=0;i<tabs.length;i++){
          var on=tabs[i].getAttribute('data-tab')===name;
          tabs[i].classList.toggle('active',on);
          tabs[i].setAttribute('aria-selected',on?'true':'false');
        }
        var isHome=name==='home', isRecords=name==='records', isQuestion=name==='question';
        el('heroSection').classList.toggle('hidden',!isHome);
        el('quickBar').classList.toggle('hidden',!isHome);
        el('homeSummary').classList.toggle('hidden',!isHome);
        el('recordsSeg').classList.toggle('hidden',!isRecords);
        el('libraryTools').classList.toggle('hidden',!isRecords);
        el('questionHead').classList.toggle('hidden',!isQuestion);
        if(isHome){ state.viewFilter='ALL'; }
        else if(isRecords){ state.viewFilter=state.recordSegment||'ALL'; syncSegUI(); }
        else if(isQuestion){ state.viewFilter='QUESTION'; renderQuestionHead(); }
        if(state.home) renderPosts(state.home.posts||[]);
        restoreFeedView(state.tabViews[name]||{scrollY:0},name);
      }
      function syncSegUI(){
        var segs=document.querySelectorAll('#recordsSeg .seg');
        for(var i=0;i<segs.length;i++) segs[i].classList.toggle('active',segs[i].getAttribute('data-seg')===(state.recordSegment||'ALL'));
      }
      function selectRecordSegment(seg){
        state.recordSegment=seg||'ALL';
        state.viewFilter=state.recordSegment;
        syncSegUI();
        if(state.home) renderPosts(state.home.posts||[]);
        scrollFeedTop();
      }
      function setLibraryCategoryFilter(value){
        // 선택 메뉴에는 사진(PHOTO), 기분(MOOD:…), 분류(CAT:…)가 함께 들어 있다.
        state.catFilter=value==='ALL'?'':String(value||'');
        renderPosts(state.home&&state.home.posts||[]);
        scrollFeedTop();
      }
      function toggleLibraryFilters(){
        var panel=el('libraryFilterPanel'), expanded=panel.classList.contains('hidden');
        panel.classList.toggle('hidden',!expanded);
        el('toggleLibraryFilters').setAttribute('aria-expanded',expanded?'true':'false');
      }

      function setLibraryPeriod(value){
        var mode=value==='month'||value==='range'?value:'all';
        el('libraryPeriodType').value=mode;
        el('monthFilterField').classList.toggle('hidden',mode!=='month');
        el('rangeFilterFields').classList.toggle('hidden',mode!=='range');
        if(mode!=='month'){ state.monthFilter=''; el('monthFilter').value=''; }
        if(mode!=='range'){
          state.rangeFrom=''; state.rangeTo=''; el('rangeFrom').value=''; el('rangeTo').value='';
          text(el('rangeWarning'),''); hide(el('rangeWarning'));
          el('rangeFrom').removeAttribute('aria-invalid'); el('rangeTo').removeAttribute('aria-invalid');
        }
        renderPosts(state.home&&state.home.posts||[]);
      }

      function renderLibraryFilterSummary(){
        var parts=[], count=0;
        if(state.searchQuery) parts.push('검색: '+state.searchQuery);
        if(state.catFilter){
          var select=el('viewFilter'), option=select&&select.options&&select.options[select.selectedIndex];
          parts.push(option?option.textContent:'분류 선택됨'); count++;
        }
        if(state.monthFilter){ parts.push(state.monthFilter+' 월별'); count++; }
        if(state.rangeFrom||state.rangeTo){ parts.push((state.rangeFrom||'처음')+' ~ '+(state.rangeTo||'오늘')); count++; }
        var button=el('toggleLibraryFilters'), summary=el('libraryActiveFilters');
        if(button) text(button,count?'필터 '+count:'필터');
        if(summary){ text(summary,parts.join(' · ')); summary.classList.toggle('hidden',!parts.length); }
      }

      function resetLibraryFilters(){
        if(state.searchApplyTimer){ clearTimeout(state.searchApplyTimer); state.searchApplyTimer=null; }
        state.searchApplyPending=false;
        state.searchQuery=''; state.catFilter=''; state.monthFilter=''; state.rangeFrom=''; state.rangeTo=''; state.recordSegment='ALL'; state.viewFilter='ALL';
        el('searchInput').value=''; el('viewFilter').value='ALL'; el('monthFilter').value=''; el('rangeFrom').value=''; el('rangeTo').value='';
        text(el('rangeWarning'),''); hide(el('rangeWarning'));
        el('rangeFrom').removeAttribute('aria-invalid'); el('rangeTo').removeAttribute('aria-invalid');
        if(el('libraryPeriodType')) el('libraryPeriodType').value='all';
        if(el('monthFilterField')) hide(el('monthFilterField'));
        if(el('rangeFilterFields')) hide(el('rangeFilterFields'));
        syncSegUI();
        if(state.home) renderPosts(state.home.posts||[]);
        scrollFeedTop();
      }
      function scrollFeedTop(){
        if(state.tabViews) delete state.tabViews[state.activeTab];
        try{ window.scrollTo({top:0,behavior:'smooth'}); }catch(scrollError){ try{ window.scrollTo(0,0); }catch(e){} }
      }



      // ===== v3.3.0 과학 가이드북 =====
      // ACOG·NHS·Mayo Clinic·표준 산전관리 지침 기반의 일반 교육 정보. 진단·처방 아님.
      var PRENATAL_TESTS=[
        {from:6,to:9,name:'초기 산전 혈액·소변검사',desc:'빈혈, 혈액형(Rh 포함), B형간염, 풍진 항체, 매독·HIV, 갑상선, 소변까지 한 번에 확인해. 이후 검사 계획의 기준이 돼.'},
        {from:10,to:22,name:'NIPT (선택)',desc:'엄마 혈액 속 태아 DNA로 다운증후군 등 염색체 이상을 선별해. 10주부터 가능하고 선택 사항이야.'},
        {from:11,to:13,name:'1차 기형아 선별 · NT 초음파',desc:'목덜미투명대(NT) 초음파 + 혈액 표지자. 11주 0일~13주 6일 사이에만 가능해서 시기를 놓치면 안 돼.'},
        {from:15,to:20,name:'2차 기형아 선별 (쿼드/통합)',desc:'혈액 표지자로 신경관 결손·염색체 이상을 선별해. 16~18주가 가장 정확한 구간이야.'},
        {from:20,to:24,name:'정밀(태아형태) 초음파',desc:'심장·뇌·콩팥 등 장기 구조를 자세히 보는 가장 중요한 초음파야. 원하면 성별도 알 수 있어.'},
        {from:24,to:28,name:'임신성 당뇨 검사 (50g 당부하)',desc:'설탕물을 마시고 1시간 뒤 혈당을 재. 빈혈 재검도 보통 같이 해.'},
        {from:27,to:36,name:'백일해(Tdap) 예방접종',desc:'엄마가 맞으면 항체가 태반을 건너가 신생아를 지켜줘. 매 임신마다 권장돼(ACOG). 독감철엔 인플루엔자 백신도 임신 중 언제든 가능해.'},
        {from:28,to:28,name:'Rh(-) 면역글로불린',desc:'혈액형이 Rh 음성일 때만 해당돼. 초기 혈액검사 결과에서 확인할 수 있어.'},
        {from:35,to:37,name:'GBS(B군 연쇄상구균) 검사',desc:'배양검사로 확인하고, 양성이면 분만 때 항생제로 아기 감염을 예방해.'},
        {from:36,to:41,name:'주 1회 검진 + 태동 관찰',desc:'36주부터는 매주 검진. 예정일이 가까우면 태아 안녕검사(NST)를 하기도 해.'}
      ];
      var NUTRITION_GUIDE=[
        {stage:'전 기간',items:['물 하루 8~10잔 — 양수와 늘어나는 혈액량의 기본 재료','카페인 하루 200mg(커피 한 잔) 이하 (ACOG)','술은 안전한 양이 없어 — 완전히 끊기 (모든 지침 공통)']},
        {stage:'초기 (~13주)',items:['엽산 400~800µg — 신경관 발달의 핵심, 12주까지 특히 중요','입덧엔 조금씩 자주 + 생강·비타민B6가 근거 있는 완화법','비타민A 과다 주의 — 간·레바류를 많이 먹지 않기']},
        {stage:'중기 (14~27주)',items:['철분 — 혈액량이 최대 50% 늘어 필요량 급증. 빈혈검사 후 철분제를 상담해','칼슘·비타민D — 아기 뼈에 매일 칼슘이 쌓이는 시기','단백질을 끼니마다 손바닥 하나만큼']},
        {stage:'후기 (28주~)',items:['오메가3(DHA) — 3분기 태아 뇌 발달에 집중적으로 쓰여','변비·속쓰림엔 식이섬유 + 소량씩 자주 + 식후 바로 눕지 않기','부종엔 싱겁게 먹고 다리 올리기 — 갑작스러운 부종은 진료 대상']}
      ];
      var FOOD_SAFETY=[
        {stage:'🚫 피하기',items:['생선회·육회·덜 익힌 고기와 계란 (리스테리아·톡소플라스마·살모넬라)','저온살균 안 된 우유·주스, 연성치즈(브리·카망베르류)','수은 많은 대형 생선 — 상어·황새치, 참치는 소량만','술 전부, 담배·간접흡연','간·레바류 다량 (비타민A 과다)']},
        {stage:'⚠️ 조심하기',items:['카페인 합산 하루 200mg (커피+콜라+초콜릿)','뜨거운 목욕탕·사우나·찜질방 — 심부체온 상승 주의, 특히 초기','일부 허브차는 안전 자료가 부족 — 즐겨 마시던 게 있으면 검진 때 확인','고양이 화장실 청소는 지수 담당 ㅋㅋ (톡소플라스마 예방)']},
        {stage:'✅ 괜찮아 · 오히려 좋아',items:['잘 익힌 생선·고기·계란, 살균 유제품은 얼마든지','등푸른 소형 생선(고등어·연어·멸치)은 주 2~3회 권장 — DHA 공급원','커피 하루 한 잔, 김치·요거트 같은 발효식품','걷기·수영·임산부 요가 등 적당한 운동은 권장 (ACOG)']}
      ];
      var DANGER_SIGNS=[
        {stage:'시기와 무관하게',items:['많은 양의 출혈','멈추지 않는 심한 복통','38도 이상 발열','소변 때 심한 통증·혈뇨 (요로감염 의심)']},
        {stage:'초기 (~13주)',items:['한쪽 아랫배 심한 통증 + 어깨 끝 통증 — 자궁외임신 신호라 즉시 진료','물도 못 마실 정도의 반복 구토 — 참을 입덧이 아니라 치료 대상(임신오조)']},
        {stage:'중기·후기',items:['평소보다 태동이 눈에 띄게 줄었을 때 — 횟수를 채우려 기다리지 말고 바로 연락','37주 전 규칙적인 배뭉침·진통, 물이 새는 느낌(양수)','심한 두통 + 눈이 번쩍거림 + 오른쪽 윗배 통증 + 갑작스러운 얼굴·손 부종 — 전자간증 신호']}
      ];
      var PARTNER_TIPS=[
        {from:4,to:13,tip:'입덧 시기 — 냄새 나는 요리와 설거지는 지수가 ㅋㅋ 하콩이 그나마 먹을 수 있는 걸 찾아주는 게 최고의 서포트야. 검진은 최대한 같이 가기.'},
        {from:14,to:19,tip:'컨디션이 돌아오는 황금기 — 짧은 산책 데이트 루틴 만들기, 정밀초음파(20~24주) 일정 미리 잡기.'},
        {from:20,to:27,tip:'아기 귀가 열렸어! 매일 5분 배에 대고 말 걸기 — 저음이 양수를 잘 통과한다는 연구가 있어. 배 사진 타임랩스 찍어주는 것도 아빠 일 ㅋㅋ'},
        {from:28,to:35,tip:'출산 가방 리스트 채우기(준비물 🍼 활용), 병원 가는 길 리허설, 카시트·유모차 조사는 아빠 담당.'},
        {from:36,to:42,tip:'진진통 구분법 외우기 — 5분 간격·1분 지속·1시간 계속(5-1-1)이면 출발. 차 기름 항상 채워두기 ㅋㅋ'}
      ];
      var DAILY_TIPS={
        1:['오늘도 물 자주! 입덧엔 차가운 물이나 탄산수가 더 나을 수 있어','피곤한 건 호르몬 때문 — 낮잠 20분은 보약이야','엽산 오늘 챙겼어? 신경관이 만들어지는 중요한 시기야','속이 울렁일 땐 크래커·바나나처럼 담백한 걸 조금씩','심박을 확인한 뒤에는 유산 확률이 크게 떨어져 — 오늘은 안심해도 돼'],
        2:['가벼운 걷기 30분 — 임신성 당뇨와 부종 예방에 최고','튼살 관리는 배가 당기기 전부터 보습 습관으로','잇몸이 예민해지는 시기 — 치실과 부드러운 칫솔','태담 시작하기 좋은 때 — 18주면 소리를 듣기 시작해','철분제는 비타민C와 함께, 커피·우유와는 시간을 띄워서'],
        3:['왼쪽으로 눕기 — 자궁 혈류가 가장 잘 돌아. 다리 사이 쿠션 추천','태동은 횟수보다 평소 패턴과 같은지가 중요해','케겔 운동 — 출산과 회복 모두에 도움','속쓰림엔 소량씩 자주 + 식후 바로 눕지 않기','가진통(불규칙·쉬면 사라짐)과 진진통(규칙적·점점 강하게) 구분 연습']
      };
      function weekStageIndex(week){
        if(!isFinite(week)) return -1;
        if(week<14) return 1;
        if(week<28) return 2;
        return 3;
      }
      function currentPregnancyWeekInfo(){
        var pregnancy=pregnancyForToday(state.home&&state.home.app&&state.home.app.pregnancy,state.home&&state.home.asOfDate);
        if(!pregnancy||pregnancy.valid===false) return null;
        var week=Number(pregnancy.week);
        if(!isFinite(week)) return null;
        var day=Number(pregnancy.day);
        return {week:week,day:isFinite(day)?day:0,phase:String(pregnancy.phase||'').toUpperCase()};
      }
      function renderGuideList(container,data,highlightIndex){
        if(!container) return;
        container.innerHTML='';
        data.forEach(function(entry,index){
          var p=document.createElement('p');
          var highlight=highlightIndex===index;
          p.className=highlight?'guide-now':'';
          p.innerHTML='<strong>'+(highlight?'👉 ':'')+escapeHtml(entry.stage)+'</strong><br>'+entry.items.map(function(item){ return '· '+escapeHtml(item); }).join('<br>');
          container.appendChild(p);
        });
      }
      function openGuidebook(){ openOverlaySheet('guidebook'); renderGuidebook(); }
      function renderGuidebook(){
        var info=currentPregnancyWeekInfo();
        var week=info&&info.phase!=='BORN'?info.week:NaN;
        var head=el('guideWeekCard');
        if(isFinite(week)){
          var active=PRENATAL_TESTS.filter(function(t){ return week>=t.from&&week<=t.to; });
          var upcoming=null;
          for(var u=0;u<PRENATAL_TESTS.length;u++){ if(PRENATAL_TESTS[u].from>week){ upcoming=PRENATAL_TESTS[u]; break; } }
          var headHtml='<strong>지금 '+week+'주'+(info.day?' '+info.day+'일':'')+'</strong>';
          if(active.length) headHtml+='<br>🧪 지금 열린 검사 창: '+active.map(function(t){ return escapeHtml(t.name); }).join(' · ');
          if(upcoming) headHtml+='<br>다음 검사: '+escapeHtml(upcoming.name)+' ('+upcoming.from+(upcoming.to>upcoming.from?'~'+upcoming.to:'')+'주)';
          head.innerHTML=headHtml;
        } else {
          head.innerHTML='임신 주수 정보가 준비되면 지금 시기에 맞는 항목이 강조돼.';
        }
        var tests=el('guideTests'); tests.innerHTML='';
        PRENATAL_TESTS.forEach(function(t){
          var status=isFinite(week)?(week>t.to?'past':(week>=t.from?'now':'upcoming')):'unknown';
          var p=document.createElement('p');
          p.className=status==='now'?'guide-now':'';
          var label=status==='past'?'안내 시기 지남':(status==='now'?'현재 시기':(status==='upcoming'?'예정 시기':'시기 확인 전'));
          p.innerHTML='<strong>'+(status==='now'?'👉 ':'· ')+escapeHtml(t.name)+'<span class="guide-range">'+t.from+(t.to>t.from?'~'+t.to:'')+'주 · '+label+'</span></strong><br>'+escapeHtml(t.desc);
          tests.appendChild(p);
        });
        renderGuideList(el('guideNutrition'),NUTRITION_GUIDE,isFinite(week)?weekStageIndex(week):-1);
        renderGuideList(el('guideFood'),FOOD_SAFETY,-1);
        renderGuideList(el('guideDanger'),DANGER_SIGNS,-1);
        var partner=el('guidePartner'); partner.innerHTML='';
        PARTNER_TIPS.forEach(function(t){
          var now=isFinite(week)&&week>=t.from&&week<=t.to;
          var p=document.createElement('p');
          p.className=now?'guide-now':'';
          p.innerHTML='<strong>'+(now?'👉 ':'')+t.from+'~'+t.to+'주</strong><br>'+escapeHtml(t.tip);
          partner.appendChild(p);
        });
      }
      function renderPregProgress(pregnancy){
        var box=el('pregProgress');
        if(!box) return;
        try{
          var phase=String(pregnancy&&pregnancy.phase||'').toUpperCase();
          var week=pregnancy?Number(pregnancy.week):NaN, day=pregnancy?Number(pregnancy.day):NaN;
          if(!pregnancy||pregnancy.valid===false||phase==='BORN'||!isFinite(week)){ hide(box); box.innerHTML=''; return; }
          var totalDays=Math.max(0,Math.min(294,week*7+(isFinite(day)?day:0)));
          var pct=Math.min(100,totalDays/280*100);
          var tri=week<13?'1분기':(week<28?'2분기':'3분기');
          var t1=(13*7/280*100).toFixed(1), t2=(28*7/280*100).toFixed(1);
          box.innerHTML='<div class="pp-track"><i style="width:'+pct.toFixed(1)+'%"></i>'
            +'<span class="pp-tick" style="left:'+t1+'%"></span><span class="pp-tick" style="left:'+t2+'%"></span></div>'
            +'<div class="pp-legend"><span>0주</span><span>'+tri+' · '+week+'주</span><span>40주</span></div>';
          show(box);
        }catch(progressError){ hide(box); }
      }
      function renderDailyTip(pregnancy){
        var box=el('dailyTip');
        if(!box) return;
        try{
          var phase=String(pregnancy&&pregnancy.phase||'').toUpperCase();
          var week=pregnancy?Number(pregnancy.week):NaN;
          if(!pregnancy||pregnancy.valid===false||phase==='BORN'||!isFinite(week)){ hide(box); return; }
          var pool=DAILY_TIPS[weekStageIndex(week)]||[];
          if(!pool.length){ hide(box); return; }
          var nowKst=kstNow();
          var yearStart=new Date(nowKst.getFullYear(),0,1);
          var dayOfYear=Math.floor((nowKst.getTime()-yearStart.getTime())/86400000);
          text(box,'💡 '+pool[((dayOfYear%pool.length)+pool.length)%pool.length]);
          show(box);
        }catch(tipError){ hide(box); }
      }

      // ===== v3.2.0 새 기능 =====
      // ===== v4.6.0 진통 간격 타이머 =====
      // 가이드가 37주부터 안내하는 5-1-1(5분 간격·1분 지속·1시간 지속)을 직접 재준다.
      // 태동 카운터와 같은 방식으로 기기에 저장돼 앱을 닫아도 이어서 잴 수 있다.
      // @include modules/labor.js

      function formatBytes(bytes){
        var n=Number(bytes||0);
        if(n<1024) return n+'B';
        if(n<1048576) return (n/1024).toFixed(0)+'KB';
        if(n<1073741824) return (n/1048576).toFixed(1)+'MB';
        return (n/1073741824).toFixed(2)+'GB';
      }

      function refreshStorageReport(){
        if(!state.session) return;
        callApi('apiGetStorageReportV450',[state.session.token],16000).then(unwrap).then(function(info){
          var box=el('storageStatus');
          if(!box) return;
          var photos=Number(info&&info.photos||0);
          if(!photos){ text(box,'지금은 비울 사진이 없어. 삭제한 기록의 사진은 30일 후 이 화면에서 수동으로 정리할 수 있어.'); return; }
          text(box,'지운 기록의 사진 '+photos+'장('+formatBytes(info&&info.bytes)+')을 비울 수 있어.'+((info&&info.hasMore)?' (더 있음)':''));
        }).catch(function(){ text(el('storageStatus'),'저장공간 상태를 불러오지 못했어. 연결을 확인하고 설정을 다시 열어 줘.'); });
      }

      function runCleanup(){
        if(!state.session) return;
        if(!confirm('삭제된 게시글의 사진 중 30일이 지난 파일을 저장공간에서 영구 삭제할 거야. 외부에 원본을 백업했는지 확인했어? 삭제한 사진은 복구할 수 없어.\n\n[확인] 백업을 확인했고 영구 삭제 / [취소] 돌아가기')) return;
        var button=el('runCleanup');
        if(button){ button.disabled=true; text(button,'정리하는 중…'); }
        callApi('apiRunCleanupV450',[state.session.token],40000).then(unwrap).then(function(result){
          var photos=Number(result&&result.photos||0);
          var bytes=Number(result&&result.bytes||0);
          toast(photos?('사진 '+photos+'장 · '+formatBytes(bytes)+' 비웠어 🧹'):'정리할 사진은 없었어. 오래된 기록은 정리했어 🧹');
          refreshStorageReport();
        }).catch(function(error){
          toast('정리하지 못했어: '+errorMessage(error));
        }).then(function(){
          if(button){ button.disabled=false; text(button,'지금 정리하기'); }
        });
      }

      // ===== v4.7.0 엄마 건강 기록 (체중·혈압·영양제) =====
      // 체중은 그동안 검진노트에 묶여 있어 4주에 한 점씩만 찍혔다.
      // 집에서 주 1회 재는 흐름을 만들고, 임신 전 BMI 기준 권장 증가 범위를 함께 그린다.
      // @include modules/health.js

      var THEME_KEY='ilkong_theme_v320';
      var themeMediaBound=false;
      function themeMode(){ return storageGet(THEME_KEY)||'system'; }
      function effectiveTheme(mode){
        if(mode==='dark'||mode==='light') return mode;
        try{ return window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'; }catch(e){ return 'light'; }
      }
      function applyThemeMode(mode){
        storageSet(THEME_KEY,mode);
        var theme=effectiveTheme(mode);
        document.documentElement.setAttribute('data-theme',theme);
        try{
          var meta=document.querySelector('meta[name="theme-color"]');
          if(meta) meta.setAttribute('content',theme==='dark'?'#201c18':'#f5efe6');
        }catch(metaError){}
        var labels={system:'시스템 설정을 따라가는 중',light:'라이트 모드 사용 중 ☀️',dark:'다크 모드 사용 중 🌙'};
        if(el('themeStatus')) text(el('themeStatus'),labels[mode]||labels.system);
      }
      function initTheme(){
        applyThemeMode(themeMode());
        if(!themeMediaBound&&window.matchMedia){
          try{
            themeMediaBound=true;
            var media=window.matchMedia('(prefers-color-scheme: dark)');
            var onChange=function(){ if(themeMode()==='system') applyThemeMode('system'); };
            if(media.addEventListener) media.addEventListener('change',onChange);
            else if(media.addListener) media.addListener(onChange);
          }catch(mediaError){}
        }
      }

      // --- 주간 질문 ---
      var WEEKLY_QUESTIONS=[
        '지금 일콩이에게 제일 해주고 싶은 말은?',
        '오늘 서로에게 고마웠던 순간 하나는?',
        '일콩이가 태어나면 셋이서 제일 먼저 가보고 싶은 곳은?',
        '요즘 몸과 마음에서 가장 크게 달라진 건?',
        '일콩이는 엄마 아빠 중 누구를 더 닮았으면 좋겠어?',
        '아기 이름 후보, 지금 마음속 1순위는?',
        '요즘 제일 먹고 싶은 음식은? 왜 그게 당길까?',
        '10년 뒤 일콩이에게 보여주고 싶은 오늘의 한 장면은?',
        '임신하고 나서 새로 생긴 습관이 있다면?',
        '서로에게 요즘 제일 바라는 것 하나는?',
        '일콩이에게 물려주고 싶은 우리 가족의 성격 하나는?',
        '이번 주 가장 행복했던 순간은 언제였어?',
        '일콩이가 처음 울음을 터뜨리는 순간, 어떤 기분일까?',
        '요즘 즐겨 듣는 노래 중 일콩이에게 들려주고 싶은 곡은?',
        '엄마·아빠가 된다는 게 실감나는 순간은 언제야?',
        '일콩이에게 지어주고 싶은 또 다른 별명이 있다면?'
      ];
      function renderWeeklyPrompt(pregnancy){
        var box=el('weeklyPrompt');
        if(!box) return;
        try{
          var phase=String(pregnancy&&pregnancy.phase||'').toUpperCase();
          var week=pregnancy?Number(pregnancy.week):NaN;
          if(!pregnancy||pregnancy.valid===false||phase==='BORN'||!isFinite(week)){ hide(box); return; }
          var question=WEEKLY_QUESTIONS[((week%WEEKLY_QUESTIONS.length)+WEEKLY_QUESTIONS.length)%WEEKLY_QUESTIONS.length];
          box.textContent='💬 이번 주 질문 · '+question;
          box.__ilkongQuestion=question;
          show(box);
        }catch(promptError){ hide(box); }
      }

      // --- 오프라인 홈 스냅샷 ---
      function homeSnapshotKey(){ return 'ilkong_home_snapshot_'+currentUserId(); }
      function persistHomeSnapshot(home){
        try{
          if(state.logoutBusy||!state.session||!home||!Array.isArray(home.posts)) return;
          var copy=Object.assign({},home);
          if(copy.posts.length>200) copy.posts=copy.posts.slice(0,200);
          delete copy.renewedSession;
          var key=homeSnapshotKey(), value=JSON.stringify(copy);
          state.homeSnapshotPersistChain=state.homeSnapshotPersistChain.catch(function(){}).then(function(){ return idbSet(key,value); }).catch(function(){});
        }catch(snapshotError){}
      }
      function restoreHomeSnapshot(){
        var userId=currentUserId();
        return idbGet(homeSnapshotKey()).then(function(raw){
          if(state.logoutBusy||!state.session||currentUserId()!==userId||!raw||state.home) return false;
          var snapshot=null;
          try{ snapshot=JSON.parse(String(raw)); }catch(parseError){ return false; }
          if(!snapshot||!Array.isArray(snapshot.posts)||state.home) return false;
          applyHome(snapshot,{fromSnapshot:true});
          text(el('feedStatus'),'기기에 저장된 기록을 먼저 보여주고 있어. 최신 내용을 확인하는 중…');
          el('feedStatus').className='status-card';
          show(el('feedStatus'));
          return true;
        }).catch(function(){ return false; });
      }

      // --- 홈 위젯(안드로이드) 데이터 전달 ---
      function pushWidgetState(){
        try{
          if(!(window.IlkongWidget&&typeof window.IlkongWidget.update==='function')) return;
          var pregnancy=state.home&&state.home.app&&state.home.app.pregnancy||{};
          window.IlkongWidget.update(JSON.stringify({
            line1:String(el('pregnancyText').textContent||''),
            line2:String(el('ddayText').textContent||''),
            week:isFinite(Number(pregnancy.week))?Number(pregnancy.week):-1,
            day:isFinite(Number(pregnancy.day))?Number(pregnancy.day):-1,
            dday:isFinite(Number(pregnancy.dday))?Number(pregnancy.dday):-9999,
            updatedAt:Date.now(),
            sourceUpdatedAt:Number(state.home&&state.home.fetchedAt)||0,
            calculatedOn:today()
          }));
        }catch(widgetError){}
      }

      // --- PIN 변경 ---
      var pinChangeBusy=false;
      function isRequestTimeoutError(error){ return /서버 응답이 너무 늦어|timed?\s*out|timeout|abort/i.test(errorMessage(error)); }
      function changePinAction(){
        if(pinChangeBusy||!state.session) return;
        var current=String(el('pinCurrent').value||'').trim();
        var next=String(el('pinNew').value||'').trim();
        var next2=String(el('pinNew2').value||'').trim();
        if(!/^\d{4,12}$/.test(next)){ toast('새 PIN은 숫자 4~12자리로 정해 줘.'); return; }
        if(next!==next2){ toast('새 PIN 두 칸이 서로 달라. 다시 확인해 줘.'); return; }
        pinChangeBusy=true; el('changePin').disabled=true; text(el('pinChangeStatus'),'바꾸는 중…');
        callApi('apiChangePinV320',[state.session.token,current,next],20000).then(unwrap).then(function(data){
          el('pinCurrent').value=''; el('pinNew').value=''; el('pinNew2').value='';
          if(data&&data.requiresLogin){
            return clearSession().then(function(){
              stopAutoRefresh();
              resetAppStateForLogout();
              hide(el('appPage')); show(el('loginPage'));
              setLoginStatus('PIN을 바꿨어 🔒 새 PIN으로 다시 로그인해 줘.');
            });
          }
          text(el('pinChangeStatus'),'PIN을 바꿨어 🔒');
          toast('PIN을 바꿨어 🔒');
        }).catch(function(error){
          var code=String(error&&error.code||'');
          if(!isRequestTimeoutError(error)&&code!=='AUTH'&&code!=='NETWORK'&&code!=='SERVER'&&code!=='FORMAT'&&code!==''){
            text(el('pinChangeStatus'),errorMessage(error));
            return;
          }
          // 서버에서 PIN 변경·세션 폐기까지 끝난 뒤 응답만 늦었을 수 있다.
          // 결과를 추측하지 않고 현재 세션을 버린 뒤 실제 PIN으로 다시 인증하게 한다.
          el('pinCurrent').value=''; el('pinNew').value=''; el('pinNew2').value='';
          return clearSession().then(function(){
            stopAutoRefresh();
            resetAppStateForLogout();
            hide(el('appPage')); show(el('loginPage'));
            setLoginStatus('PIN 변경 결과를 확인하지 못했어. 보안을 위해 로그아웃했어. 새 PIN으로 먼저 로그인해 보고, 안 되면 기존 PIN을 사용해 줘.');
          });
        })
        .then(function(){ pinChangeBusy=false; el('changePin').disabled=false; });
      }

      // --- 몸무게 그래프 ---
      function renderWeightChart(notes){
        var box=el('weightChartBox'), canvas=el('weightChart');
        if(!box||!canvas) return;
        var points=[];
        (notes||[]).forEach(function(note){
          var value=parseFloat(String(note.weight||'').replace(/[^0-9.]/g,''));
          if(isFinite(value)&&value>20&&value<200) points.push({date:String(note.checkupDate||''),value:value});
        });
        points.sort(function(a,b){ return a.date.localeCompare(b.date); });
        if(points.length<2){ hide(box); return; }
        show(box);
        var ratio=window.devicePixelRatio||1;
        var w=canvas.clientWidth||300, h=150;
        canvas.width=Math.max(1,Math.round(w*ratio)); canvas.height=Math.round(h*ratio);
        var ctx=canvas.getContext('2d'); if(!ctx){ hide(box); return; }
        ctx.scale(ratio,ratio); ctx.clearRect(0,0,w,h);
        var styles=getComputedStyle(document.documentElement);
        var accent=(styles.getPropertyValue('--accent')||'#71806b').trim()||'#71806b';
        var muted=(styles.getPropertyValue('--muted')||'#7d746b').trim()||'#7d746b';
        var min=Infinity,max=-Infinity;
        points.forEach(function(pt){ if(pt.value<min)min=pt.value; if(pt.value>max)max=pt.value; });
        var pad=(max-min)*0.25||1; min-=pad; max+=pad;
        var left=36,right=10,top=12,bottom=22;
        var plotW=w-left-right, plotH=h-top-bottom;
        ctx.font='10px sans-serif';
        ctx.strokeStyle=muted; ctx.fillStyle=muted; ctx.lineWidth=0.5;
        for(var g=0;g<3;g++){
          var gv=min+(max-min)*g/2;
          var gy=top+plotH-(gv-min)/(max-min)*plotH;
          ctx.beginPath(); ctx.moveTo(left,gy); ctx.lineTo(w-right,gy); ctx.stroke();
          ctx.fillText(gv.toFixed(1),2,gy+3);
        }
        ctx.strokeStyle=accent; ctx.lineWidth=2; ctx.beginPath();
        points.forEach(function(pt,index){
          var x=left+plotW*index/(points.length-1);
          var y=top+plotH-(pt.value-min)/(max-min)*plotH;
          if(index===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        });
        ctx.stroke();
        ctx.fillStyle=accent;
        points.forEach(function(pt,index){
          var x=left+plotW*index/(points.length-1);
          var y=top+plotH-(pt.value-min)/(max-min)*plotH;
          ctx.beginPath(); ctx.arc(x,y,3,0,Math.PI*2); ctx.fill();
        });
        ctx.fillStyle=muted;
        ctx.fillText(points[0].date.slice(5),left,h-8);
        var lastLabel=points[points.length-1].date.slice(5);
        ctx.fillText(lastLabel,w-right-ctx.measureText(lastLabel).width,h-8);
      }

      // --- 출산 준비물 체크리스트 ---
      var checklistBusy=false;
      function openChecklist(){
        openOverlaySheet('checklist');
        el('checkItemInput').value='';
        text(el('checklistStatus'),'');
        el('checklistList').innerHTML='<div class="comment-empty">불러오는 중…</div>';
        loadChecklist();
      }
      function loadChecklist(){
        if(!state.session) return;
        callApi('apiGetChecklistV320',[state.session.token],20000).then(unwrap).then(function(data){
          state.homeSummaryChecklist=Array.isArray(data&&data.items)?data.items:[];
          state.homeSummaryChecklistAt=Date.now();
          renderHomeSummary(state.home&&state.home.app&&state.home.app.pregnancy);
          if(el('checklist').classList.contains('hidden')) return;
          renderChecklist(state.homeSummaryChecklist);
        }).catch(function(error){ text(el('checklistStatus'),'목록을 불러오지 못했어: '+errorMessage(error)); });
      }
      var CHECKLIST_CATS=['수유','위생','외출','침구','옷','엄마용품','병원','기타'];
      var CHECKLIST_OWNERS=['엄마','아빠','함께'];
      var checklistFilter='';

      function checklistMoney(value){
        var digits=String(value==null?'':value).replace(/[^0-9]/g,'');
        return digits?Number(digits).toLocaleString('ko-KR'):'';
      }

      function checklistSubtitle(item){
        var bits=[];
        if(item.quantity) bits.push(item.quantity+'개');
        if(item.category) bits.push(item.category);
        if(item.owner) bits.push(item.owner);
        if(item.needWeek) bits.push(item.needWeek+'주까지');
        if(item.spent) bits.push('쓴 돈 '+checklistMoney(item.spent)+'원');
        else if(item.price) bits.push('예상 '+checklistMoney(item.price)+'원');
        if(item.memo) bits.push(item.memo);
        return bits.join(' · ');
      }

      function renderChecklist(items){
        var list=el('checklistList'); list.innerHTML='';
        var doneCount=0, plan=0, spent=0, remainPlan=0;
        items.forEach(function(item){
          if(item.done) doneCount++;
          var price=Number(String(item.price||'').replace(/[^0-9]/g,''))||0;
          var used=Number(String(item.spent||'').replace(/[^0-9]/g,''))||0;
          plan+=price; spent+=used;
          if(!item.done&&!used) remainPlan+=price;
        });
        var summary='';
        if(items.length){
          summary='총 '+items.length+'개 중 '+doneCount+'개 준비 완료';
          if(plan||spent){
            summary+=' · 쓴 돈 '+spent.toLocaleString('ko-KR')+'원';
            if(remainPlan) summary+=' · 남은 예상 '+remainPlan.toLocaleString('ko-KR')+'원';
          }
        }
        text(el('checklistStatus'),summary);

        var bar=el('checklistFilters');
        if(bar){
          var used={};
          items.forEach(function(it){ if(it.category) used[it.category]=(used[it.category]||0)+1; });
          var names=Object.keys(used);
          if(names.length){
            bar.classList.remove('hidden');
            bar.innerHTML=['<button type="button" class="chk-chip'+(checklistFilter?'':' on')+'" data-cat="">전체 '+items.length+'</button>']
              .concat(names.map(function(name){
                return '<button type="button" class="chk-chip'+(checklistFilter===name?' on':'')+'" data-cat="'+escapeHtml(name)+'">'+escapeHtml(name)+' '+used[name]+'</button>';
              })).join('');
            Array.prototype.forEach.call(bar.querySelectorAll('.chk-chip'),function(chip){
              chip.addEventListener('click',function(){ checklistFilter=chip.getAttribute('data-cat')||''; renderChecklist(items); });
            });
          } else { bar.classList.add('hidden'); bar.innerHTML=''; }
        }

        var shown=checklistFilter?items.filter(function(it){ return it.category===checklistFilter; }):items;
        if(!shown.length){
          list.innerHTML='<div class="comment-empty">'+(checklistFilter?'이 분류에는 아직 준비물이 없어':'첫 준비물을 추가해봐. 예) 배냇저고리, 속싸개, 아기 세제 🍼')+'</div>';
          return;
        }

        shown.forEach(function(item){
          var row=document.createElement('div'); row.className='note-item chk-item';

          var toggle=document.createElement('button'); toggle.type='button'; toggle.className='chk-toggle';
          toggle.textContent=item.done?'✅':'⬜';
          toggle.setAttribute('aria-label',item.done?'준비 완료 해제':'준비 완료로 표시');
          toggle.addEventListener('click',function(){
            var prevDone=item.done;
            item.done=!prevDone;
            renderChecklist(items);
            callApi('apiToggleChecklistItemV320',[state.session.token,item.id,item.done],16000)
              .then(unwrap).then(loadChecklist)
              .catch(function(error){ item.done=prevDone; renderChecklist(items); toast(errorMessage(error)); });
          });

          var main=document.createElement('div'); main.className='chk-main';
          var label=document.createElement('div'); label.className='chk-name'; label.textContent=item.content;
          if(item.done){ label.style.textDecoration='line-through'; label.style.color='var(--muted)'; }
          main.appendChild(label);
          var sub=checklistSubtitle(item);
          if(sub){ var subEl=document.createElement('div'); subEl.className='chk-sub'; subEl.textContent=sub; main.appendChild(subEl); }

          var edit=document.createElement('button'); edit.type='button'; edit.className='comment-action'; edit.textContent='수정';
          edit.setAttribute('aria-label',item.content+' 수정');
          var del=document.createElement('button'); del.type='button'; del.className='comment-action'; del.textContent='삭제';

          function beginEdit(){
            if(row.dataset.editing==='1') return;
            row.dataset.editing='1';
            var snapshot={content:item.content,quantity:item.quantity||0,price:item.price||'',spent:item.spent||'',category:item.category||'',needWeek:item.needWeek||0,owner:item.owner||'',memo:item.memo||''};
            row.classList.add('chk-editing');
            row.innerHTML='';
            var form=document.createElement('div'); form.className='chk-form';
            function field(labelText,node){
              var wrap=document.createElement('label'); wrap.className='chk-field';
              var span=document.createElement('span'); span.textContent=labelText;
              wrap.appendChild(span); wrap.appendChild(node); return wrap;
            }
            function input(value,placeholder,mode){
              var i=document.createElement('input'); i.type='text'; i.value=value==null?'':String(value);
              if(placeholder) i.placeholder=placeholder;
              if(mode) i.inputMode=mode;
              return i;
            }
            var nameInput=input(snapshot.content,'준비물 이름'); nameInput.maxLength=200;
            var qtyInput=input(snapshot.quantity||'','0','numeric');
            var priceInput=input(checklistMoney(snapshot.price),'예상 금액','numeric');
            var spentInput=input(checklistMoney(snapshot.spent),'실제 지출','numeric');
            var memoInput=input(snapshot.memo,'구매처·메모'); memoInput.maxLength=200;
            var weekInput=input(snapshot.needWeek||'','예: 36','numeric');
            var catSelect=document.createElement('select');
            catSelect.innerHTML='<option value="">분류 없음</option>'+CHECKLIST_CATS.map(function(c){
              return '<option value="'+escapeHtml(c)+'"'+(snapshot.category===c?' selected':'')+'>'+escapeHtml(c)+'</option>';
            }).join('');
            var ownerSelect=document.createElement('select');
            ownerSelect.innerHTML='<option value="">담당 없음</option>'+CHECKLIST_OWNERS.map(function(c){
              return '<option value="'+escapeHtml(c)+'"'+(snapshot.owner===c?' selected':'')+'>'+escapeHtml(c)+'</option>';
            }).join('');

            var nameWrap=field('이름',nameInput); nameWrap.className='chk-field chk-field-wide';
            form.appendChild(nameWrap);
            form.appendChild(field('수량',qtyInput));
            form.appendChild(field('분류',catSelect));
            form.appendChild(field('예상 금액',priceInput));
            form.appendChild(field('실제 지출',spentInput));
            form.appendChild(field('담당',ownerSelect));
            form.appendChild(field('필요 주차',weekInput));
            var memoWrap=field('메모',memoInput); memoWrap.className='chk-field chk-field-wide';
            form.appendChild(memoWrap);

            var actions=document.createElement('div'); actions.className='chk-actions';
            var save=document.createElement('button'); save.type='button'; save.className='save'; save.textContent='저장';
            var cancel=document.createElement('button'); cancel.type='button'; cancel.className='comment-action'; cancel.textContent='취소';
            actions.appendChild(cancel); actions.appendChild(save);

            row.appendChild(form); row.appendChild(actions);
            nameInput.focus(); nameInput.select();

            function restore(){ row.dataset.editing=''; row.classList.remove('chk-editing'); renderChecklist(items); }
            function commit(){
              var next=String(nameInput.value||'').trim();
              if(!next){ toast('준비물 내용을 적어 줘.'); nameInput.focus(); return; }
              var details={
                quantity:Number(String(qtyInput.value||'').replace(/[^0-9]/g,''))||0,
                price:String(priceInput.value||'').replace(/[^0-9]/g,''),
                spent:String(spentInput.value||'').replace(/[^0-9]/g,''),
                category:catSelect.value||'',
                needWeek:Number(String(weekInput.value||'').replace(/[^0-9]/g,''))||0,
                owner:ownerSelect.value||'',
                memo:String(memoInput.value||'').trim()
              };
              item.content=next;
              item.quantity=details.quantity; item.price=details.price; item.spent=details.spent;
              item.category=details.category; item.needWeek=details.needWeek; item.owner=details.owner; item.memo=details.memo;
              restore();
              callApi('apiUpdateChecklistItemV450',[state.session.token,item.id,next,details],16000)
                .then(unwrap).then(loadChecklist)
                .catch(function(error){
                  item.content=snapshot.content; item.quantity=snapshot.quantity; item.price=snapshot.price;
                  item.spent=snapshot.spent; item.category=snapshot.category; item.needWeek=snapshot.needWeek;
                  item.owner=snapshot.owner; item.memo=snapshot.memo;
                  renderChecklist(items); toast(errorMessage(error));
                });
            }
            save.addEventListener('click',commit);
            cancel.addEventListener('click',restore);
            nameInput.addEventListener('keydown',function(e){
              if(e.key==='Enter'){ e.preventDefault(); commit(); }
              else if(e.key==='Escape'){ e.preventDefault(); restore(); }
            });
          }

          edit.addEventListener('click',beginEdit);
          label.addEventListener('click',beginEdit);
          del.addEventListener('click',function(){
            if(!confirm('"'+item.content+'" 항목을 지울까?')) return;
            var removedId=item.id, removedName=item.content;
            callApi('apiDeleteChecklistItemV320',[state.session.token,removedId],16000).then(unwrap).then(function(){
              loadChecklist();
              toast('"'+removedName+'" 삭제됨','되돌리기',function(){
                callApi('apiRestoreChecklistItemV450',[state.session.token,removedId],16000)
                  .then(unwrap).then(loadChecklist)
                  .catch(function(error){ toast(errorMessage(error)); });
              },6000);
            }).catch(function(error){ toast(errorMessage(error)); });
          });

          row.appendChild(toggle); row.appendChild(main); row.appendChild(edit); row.appendChild(del);
          list.appendChild(row);
        });
      }

      function addChecklistItem(){
        if(checklistBusy||!state.session) return;
        var content=String(el('checkItemInput').value||'').trim();
        if(!content){ toast('준비물 내용을 적어 줘.'); return; }
        checklistBusy=true; el('addCheckItem').disabled=true;
        callApi('apiAddChecklistItemV320',[state.session.token,content,uuid()],20000).then(unwrap).then(function(){
          el('checkItemInput').value=''; loadChecklist();
        }).catch(function(error){ toast(errorMessage(error)); })
        .then(function(){ checklistBusy=false; el('addCheckItem').disabled=false; });
      }

      // --- 사진 추억함 ---
      function memoryItems(){
        var posts=state.home&&Array.isArray(state.home.posts)?state.home.posts:[];
        var items=[];
        for(var i=0;i<posts.length;i++){
          var post=posts[i]||{};
          var images=Array.isArray(post.images)?post.images:[];
          for(var j=0;j<images.length;j++){
            if(!images[j]||!images[j].id) continue;
            items.push({post:post,image:images[j],index:j,date:String(post.recordDate||''),order:i*100+j});
          }
        }
        items.sort(function(a,b){
          if(a.date!==b.date) return a.date>b.date?-1:1;
          return a.order-b.order;
        });
        return items;
      }
      function renderMemoriesIfOpen(){
        if(el('memories')&&!el('memories').classList.contains('hidden')) renderMemories();
      }
      function renderMemories(){
        var grid=el('memoryGrid');
        if(!grid) return;
        var selected=String(state.memoryMonth||'');
        var all=memoryItems();
        var items=selected?all.filter(function(item){ return item.date.slice(0,7)===selected; }):all;
        var visible=items.slice(0,Math.max(1,Number(state.memoryVisibleLimit)||36));
        var countText=visible.length+' / '+items.length+'장';
        if(state.loadingMemoryPosts) countText+=' · 이전 기록 불러오는 중…';
        else if(state.hasMore) countText+=' · 이전 기록에 더 있어';
        text(el('memoryCount'),countText);
        grid.innerHTML='';
        if(!items.length){
          var empty=document.createElement('div'); empty.className='memory-empty';
          empty.textContent=selected?'이 달에는 남긴 사진이 아직 없어.':'아직 불러온 기록에는 사진이 없어. 이전 기록도 찾아볼 수 있어.';
          grid.appendChild(empty);
        } else {
          visible.forEach(function(item){
            var card=document.createElement('button'); card.type='button'; card.className='memory-card';
            card.setAttribute('aria-label',(item.date||'기록')+' 사진 크게 보기');
            var imageBox=document.createElement('span'); imageBox.className='memory-image'; imageBox.setAttribute('data-image-id',String(item.image.id||'')); imageBox.innerHTML='<span class="photo-fail">사진 준비 중…</span>';
            var meta=document.createElement('span'); meta.className='memory-meta'; meta.textContent=item.date?item.date.slice(5).replace('-','.'):'사진';
            card.appendChild(imageBox); card.appendChild(meta);
            card.addEventListener('click',function(){ openPhotoViewer(item.post.images,item.index); });
            grid.appendChild(card);
            observeImage(item.image.id,imageBox,'thumbnail');
          });
        }
        var more=el('moreMemories');
        if(!more) return;
        more.disabled=!!state.loadingMemoryPosts;
        if(items.length>visible.length){ text(more,'사진 더 보기'); show(more); }
        else if(state.hasMore){ text(more,state.loadingMemoryPosts?'이전 기록 불러오는 중…':'이전 기록 사진 더 찾기'); show(more); }
        else hide(more);
      }
      function openMemories(){
        openOverlaySheet('memories');
        el('memoryMonth').value=state.memoryMonth||'';
        state.memoryVisibleLimit=36;
        renderMemories();
      }
      function showMoreMemories(){
        if(!state.session||!state.home||state.loadingMemoryPosts) return;
        var selected=String(state.memoryMonth||'');
        var items=selected?memoryItems().filter(function(item){ return item.date.slice(0,7)===selected; }):memoryItems();
        if(items.length>state.memoryVisibleLimit){ state.memoryVisibleLimit+=36; renderMemories(); return; }
        if(!state.hasMore) return;
        state.loadingMemoryPosts=true;
        renderMemories();
        var requestToken=state.session.token;
        var offset=Number(state.nextOffset||((state.home.posts||[]).length));
        callApi('apiGetHomeV221',[requestToken,offset,50],24000).then(unwrap).then(function(page){
          if(!state.session||state.session.token!==requestToken) return;
          var current=state.home.posts||[], incoming=page.posts||[], seen={}, merged=[];
          current.concat(incoming).forEach(function(post){ var id=String(post.id||''); if(id&&!seen[id]){seen[id]=true;merged.push(post);} });
          state.home=Object.assign({},state.home,page,{posts:merged});
          state.nextOffset=Number(page.nextOffset||merged.length);
          state.loadedCount=merged.length;
          state.hasMore=!!page.hasMore;
          state.homeFingerprint=fingerprintHome(state.home);
          state.memoryVisibleLimit+=36;
        }).catch(function(error){ toast('이전 사진을 불러오지 못했어: '+errorMessage(error)); })
        .then(function(){ state.loadingMemoryPosts=false; renderMemoriesIfOpen(); });
      }

      // --- 타임랩스 영상 내보내기 ---
      var lapseExporting=false;
      function blobToBase64(blob){
        return new Promise(function(resolve,reject){
          var reader=new FileReader();
          reader.onload=function(){ var result=String(reader.result||''); resolve(result.slice(result.indexOf(',')+1)); };
          reader.onerror=function(){ reject(new Error('파일 변환에 실패했어.')); };
          reader.readAsDataURL(blob);
        });
      }
      function exportLapseVideo(){
        if(lapseExporting) return;
        if(!lapse.items.length){ toast('먼저 "배 사진" 기록을 모아 줘.'); return; }
        var testCanvas=document.createElement('canvas');
        if(typeof MediaRecorder==='undefined'||typeof testCanvas.captureStream!=='function'){ toast('이 기기에서는 영상 만들기를 지원하지 않아.'); return; }
        lapseExporting=true; stopLapsePlay(); text(el('lapseCount'),'사진 모으는 중…');
        var items=lapse.items.slice();
        var loads=items.map(function(item){
          return fetchImageUrl(item.imageId,'thumbnail').then(function(url){
            return new Promise(function(resolve){
              var img=new Image();
              img.onload=function(){ resolve({img:img,label:item.label}); };
              img.onerror=function(){ resolve(null); };
              img.src=url;
            });
          }).catch(function(){ return null; });
        });
        Promise.all(loads).then(function(frames){
          frames=frames.filter(Boolean);
          if(!frames.length) throw new Error('사진을 불러오지 못했어.');
          var canvas=document.createElement('canvas');
          canvas.width=720; canvas.height=900;
          var ctx=canvas.getContext('2d');
          var stream=canvas.captureStream(30);
          var mimeType='';
          var ext='webm';
          if(typeof MediaRecorder!=='undefined'&&typeof MediaRecorder.isTypeSupported==='function'){
            if(MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')){ mimeType='video/mp4;codecs=avc1'; ext='mp4'; }
            else if(MediaRecorder.isTypeSupported('video/mp4')){ mimeType='video/mp4'; ext='mp4'; }
            else if(MediaRecorder.isTypeSupported('video/webm;codecs=vp9')){ mimeType='video/webm;codecs=vp9'; ext='webm'; }
            else if(MediaRecorder.isTypeSupported('video/webm')){ mimeType='video/webm'; ext='webm'; }
          }
          var recOptions={videoBitsPerSecond:4000000};
          if(mimeType) recOptions.mimeType=mimeType;
          var recorder=new MediaRecorder(stream,recOptions);
          var chunks=[];
          recorder.ondataavailable=function(event){ if(event.data&&event.data.size) chunks.push(event.data); };
          var finished=new Promise(function(resolve){ recorder.onstop=function(){ resolve({blob:new Blob(chunks,{type:mimeType||('video/'+ext)}),ext:ext,mime:mimeType||('video/'+ext)}); }; });
          function drawFrame(entry){
            ctx.fillStyle='#181512'; ctx.fillRect(0,0,canvas.width,canvas.height);
            var img=entry.img;
            var scale=Math.min(canvas.width/img.naturalWidth,(canvas.height-90)/img.naturalHeight);
            var dw=img.naturalWidth*scale, dh=img.naturalHeight*scale;
            ctx.drawImage(img,(canvas.width-dw)/2,(canvas.height-90-dh)/2+20,dw,dh);
            ctx.fillStyle='#ffffff'; ctx.font='bold 38px sans-serif'; ctx.textAlign='center';
            ctx.fillText('🤰 '+entry.label,canvas.width/2,canvas.height-34);
          }
          recorder.start();
          drawFrame(frames[0]);
          text(el('lapseCount'),'영상 만드는 중… 1 / '+frames.length);
          var frameIndex=0;
          var interval=setInterval(function(){
            frameIndex++;
            if(frameIndex>=frames.length+1){ clearInterval(interval); try{ recorder.stop(); }catch(stopError){} return; }
            if(frameIndex<frames.length){
              drawFrame(frames[frameIndex]);
              text(el('lapseCount'),'영상 만드는 중… '+(frameIndex+1)+' / '+frames.length);
            }
          },900);
          return finished;
        }).then(function(res){
          var blob=res.blob, ext=res.ext, mime=res.mime;
          return blobToBase64(blob).then(function(base64){
            var name='일콩_배타임랩스_'+today()+'.'+ext;
            if(window.IlkongFiles&&typeof window.IlkongFiles.saveToDownloads==='function'){
              var saved='';
              try{ saved=String(window.IlkongFiles.saveToDownloads(name,mime,base64)||''); }catch(saveError){ saved=''; }
              if(saved){ toast('영상을 저장했어! 갤러리·파일 앱의 다운로드에서 봐 🎬'); return; }
            }
            var link=document.createElement('a');
            link.href='data:'+mime+';base64,'+base64;
            link.download=name;
            document.body.appendChild(link); link.click(); document.body.removeChild(link);
            toast('영상 파일을 내려받았어 🎬');
          });
        }).catch(function(error){ toast('영상을 만들지 못했어: '+errorMessage(error)); })
        .then(function(){ lapseExporting=false; if(!el('lapseViewer').classList.contains('hidden')) renderLapse(); });
      }

      // ===== v3.1.0 새 기능 =====
      // ===== v3.8.0 오프라인 작성 큐 =====
      function looksOffline(error){
        if(typeof navigator!=='undefined'&&navigator&&navigator.onLine===false) return true;
        var message=String(error&&error.message?error.message:error||'');
        var code=String(error&&error.code||'');
        if(code==='AUTH'||code==='CONFLICT'||code==='VALIDATION') return false;
        return error&&error.name==='AbortError'||/NETWORK|network|연결|인터넷|응답이 너무 늦|failed to fetch|timeout|Timeout|aborted/i.test(message);
      }
      function renderOfflineBanner(){
        var box=el('offlineBanner');
        if(!box) return;
        if(!state.offlineQueued){ hide(box); return; }
        var offline=(typeof navigator!=='undefined'&&navigator&&navigator.onLine===false);
        text(el('offlineText'),offline
          ? '지금은 인터넷이 없어서 기록을 이 기기에 보관 중이야. 연결되면 자동으로 올릴게 ✈️'
          : '아직 못 올린 기록이 있어. 연결이 돌아왔으니 곧 자동으로 올라가.');
        show(box);
      }
      function scheduleOfflineFlush(delay){
        if(state.offlineFlushTimer) clearTimeout(state.offlineFlushTimer);
        state.offlineFlushTimer=setTimeout(function(){
          state.offlineFlushTimer=null;
          flushOfflineQueue();
        },typeof delay==='number'?delay:8000);
      }
      function flushOfflineQueue(){
        if(!state.offlineQueued||!state.session||state.saving) return Promise.resolve(false);
        if(typeof navigator!=='undefined'&&navigator&&navigator.onLine===false){ scheduleOfflineFlush(20000); return Promise.resolve(false); }
        if(!el('composer').classList.contains('hidden')) return Promise.resolve(false);
        var userId=currentUserId();
        if(!userId) return Promise.resolve(false);
        return restorePendingSave(userId).then(function(restored){
          if(!restored){ state.offlineQueued=false; renderOfflineBanner(); return false; }
          if(!state.images.length&&!String(el('postBody').value||'').trim()&&!String(el('postTitle').value||'').trim()){
            state.offlineQueued=false; renderOfflineBanner(); return false;
          }
          if(state.composerMode==='edit'){state.offlineQueued=false;renderOfflineBanner();return false;}
          savePost();
          return true;
        }).catch(function(){ scheduleOfflineFlush(30000); return false; });
      }
      // v3.9.0: 외부 주소(PWA)로 열렸을 때만 오프라인 실행 준비를 한다.
      function setupPwa(){
        if(!IS_EXTERNAL_WEB) return;
        try{
          if(!document.querySelector('link[rel="manifest"]')){
            var link=document.createElement('link');
            link.rel='manifest'; link.href='manifest.json';
            document.head.appendChild(link);
          }
        }catch(manifestError){}
        try{
          if(navigator.serviceWorker&&window.isSecureContext){
            window.addEventListener('load',function(){
        navigator.serviceWorker.register('sw.js?v='+encodeURIComponent(VERSION),{updateViaCache:'none'}).catch(function(){});
            });
          }
        }catch(swError){}
        // Supabase가 현재 운영 경로다. PWA에서는 브라우저 GAS iframe fallback 자체를 끈다.
        // 구형 GAS 세션 교환/읽기 호환이 필요하면 Edge가 서버→서버로 처리한다.
      }

      function bindOfflineWatchers(){
        try{
          window.addEventListener('online',function(){ renderOfflineBanner(); scheduleOfflineFlush(1200); });
          window.addEventListener('offline',renderOfflineBanner);
          document.addEventListener('visibilitychange',function(){ if(!document.hidden&&state.offlineQueued) scheduleOfflineFlush(1500); });
        }catch(watcherError){}
      }

      // ===== v3.8.0 여행 모드 =====
      function tripInfo(){ return (state.home&&state.home.app&&state.home.app.trip)||null; }
      function isTripPost(post){
        var trip=tripInfo();
        if(!trip||!trip.from||!trip.to) return false;
        var d=String(post&&post.recordDate||'');
        return !!d&&d>=trip.from&&d<=trip.to;
      }
      function renderTripBanner(){
        var box=el('tripBanner');
        if(!box) return;
        try{
          var trip=tripInfo();
          if(!trip||!trip.from){ hide(box); box.textContent=''; return; }
          var name=trip.name||'여행';
          if(trip.active){
            var dayIndex=Number(trip.dayIndex||0), total=Number(trip.totalDays||0);
            box.textContent='✈️ '+name+' '+(dayIndex>0?dayIndex+'일차':'')+(total?' / '+total+'일':'')+' · 지금 기록은 여행 앨범에 담겨';
          } else if(isFinite(Number(trip.dday))&&Number(trip.dday)>0){
            box.textContent='✈️ '+name+'까지 D-'+Number(trip.dday)+' · '+trip.from+' 출발';
          } else {
            box.textContent='✈️ '+name+' 기록 '+trip.from+' ~ '+trip.to+' · 기록 탭에서 모아볼 수 있어';
          }
          show(box);
        }catch(tripError){ hide(box); }
      }
      function renderTripSegment(){
        var seg=el('segTrip');
        if(!seg) return;
        var trip=tripInfo();
        if(trip&&trip.from&&trip.to){ show(seg); text(seg,'✈️ '+(trip.name||'여행')); }
        else { hide(seg); if(state.recordSegment==='TRIP'){ state.recordSegment='ALL'; state.viewFilter='ALL'; } }
      }
      function openTripSheet(){
        openOverlaySheet('tripSheet');
        var trip=tripInfo()||{};
        el('tripName').value=trip.name||'';
        el('tripFrom').value=trip.from||'';
        el('tripTo').value=trip.to||'';
        text(el('tripStatus'),trip.from?('현재 설정: '+trip.from+' ~ '+trip.to):'아직 여행 설정이 없어.');
      }
      var tripBusy=false;
      function saveTripAction(name,from,to){
        if(tripBusy||!state.session) return;
        tripBusy=true; el('saveTrip').disabled=true; el('clearTrip').disabled=true;
        text(el('tripStatus'),'저장하는 중…');
        callApi('apiSetTripV380',[state.session.token,name,from,to],20000).then(unwrap).then(function(){
          toast(from?'여행 기간을 저장했어 ✈️':'여행 설정을 지웠어.');
          return refreshHome({source:'trip',silent:true,force:true});
        }).then(function(){
          var trip=tripInfo()||{};
          text(el('tripStatus'),trip.from?('현재 설정: '+trip.from+' ~ '+trip.to):'여행 설정이 없어.');
          renderTripSegment();
        }).catch(function(error){ text(el('tripStatus'),errorMessage(error)); })
        .then(function(){ tripBusy=false; el('saveTrip').disabled=false; el('clearTrip').disabled=false; });
      }

      // ===== v3.7.0 알림 설정 / 데이터 내보내기 =====
      var NOTIFY_KEY='ilkong_notify_v370';
      function notifyPrefs(){
        var raw=storageGet(NOTIFY_KEY);
        var pref={post:true,comment:true,quiet:false};
        try{ if(raw){ var parsed=JSON.parse(raw); if(parsed&&typeof parsed==='object'){ pref.post=parsed.post!==false; pref.comment=parsed.comment!==false; pref.quiet=!!parsed.quiet; } } }catch(prefError){}
        return pref;
      }
      function saveNotifyPrefs(pref){
        storageSet(NOTIFY_KEY,JSON.stringify(pref));
        try{
          if(window.IlkongNotify&&typeof window.IlkongNotify.setPrefs==='function') window.IlkongNotify.setPrefs(JSON.stringify(pref));
        }catch(bridgeError){}
        var parts=[];
        if(pref.post) parts.push('새 기록');
        if(pref.comment) parts.push('댓글');
        var label=parts.length?parts.join(' · ')+' 알림 받는 중':'알림을 모두 꺼둔 상태';
        if(pref.quiet) label+=' · 밤에는 조용히';
        if(el('notifyStatus')) text(el('notifyStatus'),label);
      }

      function urlBase64ToUint8Array(base64String) {
        var padding = '='.repeat((4 - base64String.length % 4) % 4);
        var base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
        var rawData = window.atob(base64);
        var outputArray = new Uint8Array(rawData.length);
        for (var i = 0; i < rawData.length; ++i) {
          outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
      }

      function isPushSupported() {
        return !!('serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window);
      }

      function checkPushSubscriptionStatus() {
        var statusEl = el('pushStatus');
        var enableBtn = el('enablePushBtn');
        var activeTools = el('pushActiveTools');
        if (!statusEl || !enableBtn || !activeTools) return;

        if (!isPushSupported()) {
          var isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
          if (isIos && !window.navigator.standalone) {
            text(statusEl, '📱 아이폰은 사파리 공유 버튼(↑) ➡️ [홈 화면에 추가]한 앱 아이콘으로 실행해야 알림을 켤 수 있어.');
          } else {
            text(statusEl, '현재 환경에서는 웹 푸시 알림을 지원하지 않아.');
          }
          enableBtn.disabled = true;
          enableBtn.textContent = '이 환경에서는 알림 미지원';
          hide(activeTools);
          return;
        }

        if (Notification.permission === 'denied') {
          text(statusEl, '⚠️ 알림 권한이 차단되어 있어. 브라우저나 휴대폰 설정에서 일콩 기록의 알림을 허용해 줘.');
          enableBtn.disabled = false;
          enableBtn.textContent = '알림 권한 다시 요청하기';
          hide(activeTools);
          return;
        }

        navigator.serviceWorker.ready.then(function (reg) {
          return reg.pushManager.getSubscription();
        }).then(function (sub) {
          if (sub) {
            hide(enableBtn);
            show(activeTools);
            text(statusEl, '✅ 이 기기에서 실시간 푸시 알림을 정상적으로 받고 있어.');
          } else {
            show(enableBtn);
            enableBtn.disabled = false;
            enableBtn.textContent = '🔔 이 기기에서 알림 켜기';
            hide(activeTools);
            text(statusEl, '버튼을 눌러 알림을 켜면 상대방이 남긴 새 기록과 댓글 소식을 실시간으로 받아.');
          }
        }).catch(function (err) {
          text(statusEl, '알림 상태 확인 중: ' + (err.message || '알 수 없는 상태'));
        });
      }

      function enablePushNotifications() {
        if (!isPushSupported()) {
          showToast('현재 기기나 브라우저에서는 푸시 알림을 지원하지 않아.');
          return;
        }
        var btn = el('enablePushBtn');
        if (btn) { btn.disabled = true; btn.textContent = '알림 등록 중…'; }
        text(el('pushStatus'), '알림 권한을 요청하는 중이야…');

        Notification.requestPermission().then(function (permission) {
          if (permission !== 'granted') {
            text(el('pushStatus'), '⚠️ 알림 권한이 허용되지 않았어. 설정에서 허용해 줘.');
            if (btn) { btn.disabled = false; btn.textContent = '🔔 이 기기에서 알림 켜기'; }
            showToast('알림 권한이 허용되지 않았어.');
            return;
          }
          return navigator.serviceWorker.ready.then(function (reg) {
            return reg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });
          }).then(function (sub) {
            var subJson = sub.toJSON();
            return callApi('apiSubscribePush', [state.session.token, {
              endpoint: sub.endpoint,
              keys: {
                p256dh: subJson.keys && subJson.keys.p256dh,
                auth: subJson.keys && subJson.keys.auth
              },
              prefs: notifyPrefs(),
              userAgent: navigator.userAgent
            }]);
          }).then(function () {
            showToast('🔔 알림이 켜졌어! 이제 상대 소식을 실시간으로 받아.');
            checkPushSubscriptionStatus();
          });
        }).catch(function (error) {
          console.error('enablePush error:', error);
          text(el('pushStatus'), '알림 켜기 실패: ' + (error.message || '다시 시도해 줘.'));
          if (btn) { btn.disabled = false; btn.textContent = '🔔 이 기기에서 알림 켜기'; }
          showToast('알림을 켜지 못했어: ' + (error.message || ''));
        });
      }

      function disablePushNotifications() {
        var btn = el('disablePushBtn');
        if (btn) btn.disabled = true;
        navigator.serviceWorker.ready.then(function (reg) {
          return reg.pushManager.getSubscription();
        }).then(function (sub) {
          if (sub) {
            var endpoint = sub.endpoint;
            return sub.unsubscribe().then(function () {
              if (state.session) {
                return callApi('apiUnsubscribePush', [state.session.token, { endpoint: endpoint }]).catch(function () {});
              }
            });
          }
        }).then(function () {
          showToast('이 기기에서 알림을 껐어.');
          checkPushSubscriptionStatus();
        }).catch(function (error) {
          showToast('알림 해제 중 오류: ' + (error.message || ''));
        }).finally(function () {
          if (btn) btn.disabled = false;
        });
      }

      function sendTestPushAction() {
        var btn = el('testPushBtn');
        if (btn) { btn.disabled = true; btn.textContent = '알림 발송 중…'; }
        callApi('apiSendTestPush', [state.session.token, {}]).then(function () {
          showToast('🔔 테스트 알림을 보냈어! 잠시 후 화면 상단이나 잠금 화면을 확인해 봐.');
        }).catch(function (error) {
          showToast('테스트 알림 실패: ' + (error.message || ''));
        }).finally(function () {
          setTimeout(function () {
            if (btn) { btn.disabled = false; btn.textContent = '테스트 알림 보내보기 🚀'; }
          }, 2000);
        });
      }

      function renderNotifySettings(){
        var pref=notifyPrefs();
        if(el('notifyPost')) el('notifyPost').checked=pref.post;
        if(el('notifyComment')) el('notifyComment').checked=pref.comment;
        if(el('notifyQuiet')) el('notifyQuiet').checked=pref.quiet;
        saveNotifyPrefs(pref);
        checkPushSubscriptionStatus();
      }
      function collectNotifyPrefs(){
        var prefs={post:el('notifyPost').checked,comment:el('notifyComment').checked,quiet:el('notifyQuiet').checked};
        saveNotifyPrefs(prefs);
        if(state.session&&'serviceWorker' in navigator&&'PushManager' in window){
          navigator.serviceWorker.ready.then(function(reg){
            return reg.pushManager.getSubscription();
          }).then(function(sub){
            if(sub){
              return callApi('apiSubscribePush',[state.session.token,{
                endpoint: sub.endpoint,
                keys: { p256dh: '', auth: '' },
                prefs: prefs,
                onlyUpdatePrefs: true
              }],10000).then(function(){
                toast('알림 설정을 저장했어 🌙');
              });
            }
          }).catch(function(){});
        }
      }
      var exportBusy=false;
      function markBackupComplete(){
        var userId=currentUserId();
        if(userId) storageSet(backupStatusKey(userId),String(Date.now()));
        renderOperationalHealth();
      }
      function exportDataAction(){
        if(exportBusy||!state.session) return;
        exportBusy=true; el('exportData').disabled=true; text(el('exportStatus'),'기록을 모으는 중… 잠시만');
        callApi('apiExportDataV370',[state.session.token],120000).then(unwrap).then(function(data){
          var json=JSON.stringify(data,null,2);
          var name='일콩기록_데이터_'+today()+'.json';
          var base64='';
          try{ base64=btoa(unescape(encodeURIComponent(json))); }catch(encodeError){ base64=''; }
          if(base64&&window.IlkongFiles&&typeof window.IlkongFiles.saveToDownloads==='function'){
            var saved='';
            try{ saved=String(window.IlkongFiles.saveToDownloads(name,'application/json',base64)||''); }catch(saveError){ saved=''; }
            if(saved){ markBackupComplete(); text(el('exportStatus'),'다운로드 폴더에 저장했어 💾 (기록 '+(data.counts&&data.counts.posts||0)+'개)'); return; }
          }
          var url='', revoke=false;
          try{
            if(window.URL&&typeof URL.createObjectURL==='function'){ url=URL.createObjectURL(new Blob([json],{type:'application/json'})); revoke=true; }
          }catch(blobError){ url=''; }
          if(!url&&base64) url='data:application/json;base64,'+base64;
          if(!url) throw new Error('이 기기에서는 파일로 저장할 수 없어.');
          var link=document.createElement('a'); link.href=url; link.download=name;
          document.body.appendChild(link); link.click(); document.body.removeChild(link);
          if(revoke) setTimeout(function(){ try{ URL.revokeObjectURL(url); }catch(revokeError){} },4000);
          markBackupComplete();
          text(el('exportStatus'),'기록 데이터 JSON 파일을 내려받았어 💾 (기록 '+(data.counts&&data.counts.posts||0)+'개 · 댓글 '+(data.counts&&data.counts.comments||0)+'개)');
        }).catch(function(error){ text(el('exportStatus'),'내보내지 못했어: '+errorMessage(error)); })
        .then(function(){ exportBusy=false; el('exportData').disabled=false; });
      }

      function openPhotoPicker(){
        state.dialogReturnFocus=document.activeElement;
        show(el('photoPicker'));
        focusFirstInDialog(el('photoPicker'));
      }
      function focusFirstInDialog(node){
        if(!node) return;
        setTimeout(function(){
          if(node.classList.contains('hidden')) return;
          var target=node.querySelector('button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])');
          if(target){ try{ target.focus({preventScroll:true}); }catch(e){ try{ target.focus(); }catch(e2){} } }
        },0);
      }
      function openOverlaySheet(id,returnTo){
        state.dialogReturnFocus=document.activeElement;
        if(returnTo) state.sheetReturn[id]=returnTo; else delete state.sheetReturn[id];
        var sheet=el(id);
        show(sheet);
        focusFirstInDialog(sheet);
      }
      function closeOverlaySheet(id){
        hide(el(id));
        var back=state.sheetReturn[id];
        delete state.sheetReturn[id];
        // v3.6.0: 더보기에서 연 화면은 닫으면 더보기로 돌아간다(홈으로 튕기지 않음).
        if(back&&el(back)){
          show(el(back));
          // 되돌아간 패널 내부로 초점을 옮기고, 닫을 때는 원래 '더보기' 탭으로 복귀한다.
          if(back==='moreSheet') state.dialogReturnFocus=document.querySelector('.tab[data-tab="more"]');
          focusFirstInDialog(el(back));
          return;
        }
        restoreDialogFocus();
      }
      function closeTopDialogFromKeyboard(){
        if(!el('photoViewer').classList.contains('hidden')){ closePhotoViewer(); return true; }
        if(!el('lapseViewer').classList.contains('hidden')){ stopLapsePlay(); closeOverlaySheet('lapseViewer'); return true; }
        if(!el('composer').classList.contains('hidden')){ closeComposer(); return true; }
        if(!el('settings').classList.contains('hidden')){ closeSettings(); return true; }
        if(!el('kickCounter').classList.contains('hidden')){ closeKickCounter(); return true; }
        if(!el('laborTimer').classList.contains('hidden')){ closeLaborTimer(); return true; }
        if(!el('healthSheet').classList.contains('hidden')){ closeOverlaySheet('healthSheet'); return true; }
        if(!el('birthPlanSheet').classList.contains('hidden')){ closeOverlaySheet('birthPlanSheet'); return true; }
        var sheets=['checkin','photoPicker','moreSheet','guidebook','checklist','memories','capsule','checkupNotes','bookMaker','tripSheet'];
        for(var i=0;i<sheets.length;i++){
          var id=sheets[i], node=el(id);
          if(!node||node.classList.contains('hidden')) continue;
          if(id==='checkin'){ if(state.checkinBusy) return false; persistCheckinDraft(); }
          if(id==='photoPicker'){ hide(node); restoreDialogFocus(); } else closeOverlaySheet(id);
          return true;
        }
        return false;
      }
      function topOpenDialog(){
        var ids=['photoViewer','lapseViewer','composer','settings','kickCounter','laborTimer','healthSheet','birthPlanSheet','checkin','photoPicker','moreSheet','guidebook','checklist','memories','capsule','checkupNotes','bookMaker','tripSheet'];
        for(var i=0;i<ids.length;i++){
          var node=el(ids[i]);
          if(node&&!node.classList.contains('hidden')) return node;
        }
        return null;
      }
      function trapDialogFocus(event){
        var dialog=topOpenDialog();
        if(!dialog) return false;
        var focusable=Array.prototype.slice.call(dialog.querySelectorAll('button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])'))
          .filter(function(node){ return node.offsetParent!==null; });
        if(!focusable.length) return false;
        var first=focusable[0], last=focusable[focusable.length-1], active=document.activeElement;
        if(!dialog.contains(active)){
          event.preventDefault();
          (event.shiftKey?last:first).focus();
          return true;
        }
        if(event.shiftKey&&active===first){ event.preventDefault(); last.focus(); return true; }
        if(!event.shiftKey&&active===last){ event.preventDefault(); first.focus(); return true; }
        return false;
      }

      // --- 배 타임랩스 ---
      var lapse={items:[],index:0,playing:false,timer:null};
      function pregnancyLabelFor(recordDate){
        try{
          var pregnancy=state.home&&state.home.app&&state.home.app.pregnancy;
          if(!pregnancy||pregnancy.valid===false) return String(recordDate||'');
          var week=Number(pregnancy.week), day=Number(pregnancy.day);
          if(!isFinite(week)||!isFinite(day)) return String(recordDate||'');
          var todayMs=new Date(today()+'T00:00:00').getTime();
          var recordMs=new Date(String(recordDate||'')+'T00:00:00').getTime();
          if(!isFinite(recordMs)) return String(recordDate||'');
          var totalDays=week*7+day-Math.round((todayMs-recordMs)/86400000);
          if(totalDays<0) return String(recordDate||'');
          return Math.floor(totalDays/7)+'주 '+(totalDays%7)+'일';
        }catch(e){ return String(recordDate||''); }
      }
      function timelapsePosts(){
        var posts=state.home&&state.home.posts||[];
        var items=[];
        for(var i=0;i<posts.length;i++){
          var post=posts[i];
          if(String(post.category)!=='배 사진'||!post.images||!post.images.length) continue;
          items.push({imageId:String(post.images[0].id),date:String(post.recordDate||''),label:pregnancyLabelFor(post.recordDate)});
        }
        items.sort(function(a,b){ return a.date<b.date?-1:(a.date>b.date?1:0); });
        return items;
      }
      function openTimelapse(){
        stopLapsePlay();
        openOverlaySheet('lapseViewer');
        lapse.items=[]; lapse.index=0;
        text(el('lapseCount'),'전체 기록 확인 중…');
        el('lapsePrev').disabled=true; el('lapseNext').disabled=true;
        el('lapseStage').innerHTML='<span class="viewer-loading">배 사진 기록을 모두 불러오는 중…</span>';
        ensureAllPostsForLibrary('timelapse').then(function(complete){
          if(el('lapseViewer').classList.contains('hidden')) return;
          if(!complete){
            text(el('lapseCount'),'불러오기 실패');
            el('lapseStage').innerHTML='<span class="viewer-loading">전체 기록을 확인하지 못했어. 닫았다가 다시 열어 줘.</span>';
            return;
          }
          lapse.items=timelapsePosts();
          lapse.index=Math.max(0,lapse.items.length-1);
          if(!lapse.items.length){
            text(el('lapseCount'),'0 / 0');
            el('lapseStage').innerHTML='<span class="viewer-loading" style="text-align:center;line-height:1.8">아직 "배 사진" 기록이 없어.<br>아래 📷 버튼으로 이번 주 배 사진을 찍고<br>매주 같은 자세로 모으면 여기서<br>일콩이와 함께 자란 배를 슬라이드로 볼 수 있어 🤰</span>';
            return;
          }
          renderLapse();
        });
      }
      function renderLapse(){
        var stage=el('lapseStage');
        var item=lapse.items[lapse.index];
        text(el('lapseCount'),lapse.items.length?(lapse.index+1)+' / '+lapse.items.length:'0 / 0');
        el('lapsePrev').disabled=lapse.items.length<2; el('lapseNext').disabled=lapse.items.length<2;
        if(!item) return;
        var current=lapse.index;
        stage.innerHTML='<span class="viewer-loading">사진 불러오는 중…</span>';
        loadApprovedImage(item.imageId,'thumbnail',0).then(function(img){
          if(lapse.index!==current||el('lapseViewer').classList.contains('hidden')) return;
          img.alt='배 사진';
            if(lapse.index!==current) return;
            stage.innerHTML='';
            stage.appendChild(img);
            var caption=document.createElement('span'); caption.className='lapse-caption'; caption.textContent='🤰 '+item.label;
            stage.appendChild(caption);
        }).catch(function(){ if(lapse.index===current) stage.innerHTML='<span class="viewer-loading">사진을 불러오지 못했어.</span>'; });
      }
      function moveLapse(delta){ if(!lapse.items.length) return; lapse.index=(lapse.index+delta+lapse.items.length)%lapse.items.length; renderLapse(); }
      function stopLapsePlay(){ lapse.playing=false; if(lapse.timer){ clearInterval(lapse.timer); lapse.timer=null; } if(el('lapsePlay')) text(el('lapsePlay'),'▶'); }
      function toggleLapsePlay(){
        if(lapse.playing){ stopLapsePlay(); return; }
        if(lapse.items.length<2) return;
        lapse.playing=true; text(el('lapsePlay'),'⏸');
        lapse.index=0; renderLapse();
        lapse.timer=setInterval(function(){
          if(el('lapseViewer').classList.contains('hidden')||lapse.index>=lapse.items.length-1){ stopLapsePlay(); return; }
          lapse.index=lapse.index+1; renderLapse();
        },1800);
      }
      function openTimelapseCamera(){
        state.composerMode='create';
        // 사용자 제스처가 살아 있는 동안 카메라를 먼저 연다(아이폰 대응).
        el('cameraInput').click();
        openComposer();
        el('category').value='배 사진';
        el('advancedFields').open=true;
      }

      // --- 타임캡슐 편지 ---
      var capsuleBusy=false;
      function openCapsule(){
        openOverlaySheet('capsule');
        text(el('capsuleStatus'),'');
        renderCapsuleList(null);
        loadCapsules();
      }
      function loadCapsules(){
        if(!state.session) return;
        callApi('apiGetCapsulesV310',[state.session.token],20000).then(unwrap).then(function(data){
          if(el('capsule').classList.contains('hidden')) return;
          renderCapsuleList(data||{});
        }).catch(function(error){ text(el('capsuleStatus'),'편지 목록을 불러오지 못했어: '+errorMessage(error)); });
      }
      function renderCapsuleList(data){
        var list=el('capsuleList');
        list.innerHTML='';
        if(!data){ list.innerHTML='<div class="comment-empty">편지 목록을 불러오는 중…</div>'; return; }
        var note=el('capsuleOpenNote');
        var letters=Array.isArray(data.letters)?data.letters:[];
        if(data.opened) text(note,'💌 캡슐이 열렸어! '+(data.openDate||'')+'에 봉인이 풀린 편지들이야. 일콩이에게 천천히 읽어줘.');
        else text(note,'봉인하면 아기가 태어나는 날('+(data.openDate||'예정일')+')까지 아무도 열어볼 수 없어. 쓴 사람도! 지금 '+letters.length+'통이 캡슐에 잠들어 있어.');
        if(!letters.length){ list.innerHTML='<div class="comment-empty">아직 편지가 없어. 첫 편지를 남겨봐 💌</div>'; return; }
        letters.forEach(function(letter){
          var item=document.createElement('div'); item.className='capsule-item';
          var meta=document.createElement('div'); meta.className='capsule-meta';
          var who=document.createElement('span'); who.textContent=letter.authorName+(letter.mine?' (나)':'');
          var when=document.createElement('span'); when.textContent=shortDateTime(letter.createdAt);
          meta.appendChild(who); meta.appendChild(when); item.appendChild(meta);
          var bodyDiv=document.createElement('div');
          if(letter.opened){ bodyDiv.className='comment-text'; bodyDiv.textContent=letter.content; }
          else { bodyDiv.className='capsule-locked'; bodyDiv.textContent='🔒 봉인된 편지 · 태어나는 날 함께 열어봐'; }
          item.appendChild(bodyDiv);
          if(letter.mine&&!letter.opened){
            var actions=document.createElement('div'); actions.className='note-actions';
            var del=document.createElement('button'); del.type='button'; del.textContent='봉인 취소(삭제)';
            del.addEventListener('click',function(){
              if(!confirm('이 편지를 지울까? 내용은 다시 볼 수 없어.')) return;
              callApi('apiDeleteCapsuleV310',[state.session.token,letter.id],16000).then(unwrap).then(loadCapsules).catch(function(error){ toast(errorMessage(error)); });
            });
            actions.appendChild(del); item.appendChild(actions);
          }
          list.appendChild(item);
        });
      }
      function sealCapsule(){
        if(capsuleBusy||!state.session) return;
        var content=String(el('capsuleBody').value||'').trim();
        if(!content){ toast('편지 내용을 먼저 적어 줘.'); return; }
        if(!confirm('봉인하면 태어나는 날까지 다시 볼 수 없어. 봉인할까? 💌')) return;
        capsuleBusy=true; el('sealCapsule').disabled=true; text(el('capsuleStatus'),'봉인하는 중…');
        callApi('apiAddCapsuleV310',[state.session.token,content,uuid()],20000).then(unwrap).then(function(){
          el('capsuleBody').value=''; text(el('capsuleStatus'),'편지를 봉인했어 💌');
          toast('편지가 캡슐에 잠들었어 💌'); loadCapsules();
        }).catch(function(error){ text(el('capsuleStatus'),''); toast(errorMessage(error)); })
        .then(function(){ capsuleBusy=false; el('sealCapsule').disabled=false; });
      }

      // --- 검진노트 ---
      var noteState={busy:false,editingId:'',attempt:null};
      function openCheckupNotes(){
        openOverlaySheet('checkupNotes');
        resetNoteForm();
        var pregnancy=state.home&&state.home.app&&state.home.app.pregnancy||{};
        if(pregnancy.checkupDate) el('noteDate').value=pregnancy.checkupDate;
        hide(el('weightChartBox'));
        renderNoteList(null); loadCheckupNotes();
      }
      function resetNoteForm(){
        noteState.editingId=''; noteState.attempt=null;
        el('noteDate').value=''; el('noteQuestions').value=''; el('noteWeight').value=''; el('noteBp').value=''; el('noteBabySize').value=''; el('noteResult').value='';
        text(el('noteStatus'),''); text(el('saveCheckupNote'),'저장');
      }
      function loadCheckupNotes(){
        if(!state.session) return;
        callApi('apiGetCheckupNotesV310',[state.session.token],20000).then(unwrap).then(function(data){
          if(el('checkupNotes').classList.contains('hidden')) return;
          renderNoteList(data&&data.notes||[]);
          renderWeightChart(data&&data.notes||[]);
        }).catch(function(error){ text(el('noteStatus'),'노트를 불러오지 못했어: '+errorMessage(error)); });
      }
      function renderNoteList(notes){
        var list=el('noteList'); list.innerHTML='';
        if(notes===null){ list.innerHTML='<div class="comment-empty">지난 검진노트를 불러오는 중…</div>'; return; }
        if(!notes.length){ list.innerHTML='<div class="comment-empty">아직 검진노트가 없어. 다음 검진 준비를 여기서 해봐 🏥</div>'; return; }
        notes.forEach(function(note){
          var item=document.createElement('div'); item.className='note-item';
          var parts=[];
          if(note.weight) parts.push('⚖️ '+note.weight);
          if(note.bloodPressure) parts.push('🩺 '+note.bloodPressure);
          if(note.babySize) parts.push('👶 '+note.babySize);
          var html='<h4>🏥 '+escapeHtml(note.checkupDate)+'</h4>';
          if(parts.length) html+='<div>'+escapeHtml(parts.join(' · '))+'</div>';
          if(note.questions) html+='<div style="margin-top:5px"><strong>물어볼 것</strong><div class="comment-text">'+escapeHtml(note.questions)+'</div></div>';
          if(note.result) html+='<div style="margin-top:5px"><strong>결과 메모</strong><div class="comment-text">'+escapeHtml(note.result)+'</div></div>';
          item.innerHTML=html;
          var actions=document.createElement('div'); actions.className='note-actions';
          var edit=document.createElement('button'); edit.type='button'; edit.textContent='수정';
          edit.addEventListener('click',function(){
            noteState.editingId=note.id; noteState.attempt=null;
            el('noteDate').value=note.checkupDate; el('noteQuestions').value=note.questions; el('noteWeight').value=note.weight; el('noteBp').value=note.bloodPressure; el('noteBabySize').value=note.babySize; el('noteResult').value=note.result;
            text(el('saveCheckupNote'),'수정 저장'); text(el('noteStatus'),note.checkupDate+' 노트를 수정하는 중이야.');
            var sheet=el('checkupNotes').querySelector('.sheet'); if(sheet) sheet.scrollTop=0;
          });
          var del=document.createElement('button'); del.type='button'; del.textContent='삭제';
          del.addEventListener('click',function(){
            if(!confirm(note.checkupDate+' 검진노트를 지울까?')) return;
            callApi('apiDeleteCheckupNoteV310',[state.session.token,note.id],16000).then(unwrap).then(function(){ if(noteState.editingId===note.id) resetNoteForm(); loadCheckupNotes(); }).catch(function(error){ toast(errorMessage(error)); });
          });
          actions.appendChild(edit); actions.appendChild(del); item.appendChild(actions);
          list.appendChild(item);
        });
      }
      function saveCheckupNoteAction(){
        if(noteState.busy||!state.session) return;
        var payload={
          noteId:noteState.editingId,
          checkupDate:String(el('noteDate').value||'').trim(),
          questions:String(el('noteQuestions').value||'').trim(),
          result:String(el('noteResult').value||'').trim(),
          weight:String(el('noteWeight').value||'').trim(),
          bloodPressure:String(el('noteBp').value||'').trim(),
          babySize:String(el('noteBabySize').value||'').trim()
        };
        if(!payload.checkupDate){ toast('검진 날짜를 먼저 골라 줘.'); return; }
        var signature=JSON.stringify(payload);
        if(!noteState.attempt||noteState.attempt.signature!==signature) noteState.attempt={signature:signature,id:uuid()};
        noteState.busy=true; el('saveCheckupNote').disabled=true; text(el('noteStatus'),'저장하는 중…');
        callApi('apiSaveCheckupNoteV310',[state.session.token,payload,noteState.attempt.id],20000).then(unwrap).then(function(){
          toast('검진노트를 저장했어 🏥'); resetNoteForm(); loadCheckupNotes();
        }).catch(function(error){ text(el('noteStatus'),''); toast(errorMessage(error)); })
        .then(function(){ noteState.busy=false; el('saveCheckupNote').disabled=false; });
      }

      // --- 기록을 책으로(PDF) ---
      var bookBusy=false;
      function openBookMaker(){
        openOverlaySheet('bookMaker');
        text(el('bookStatus'),''); el('bookResult').innerHTML='';
        if(!el('bookTo').value) el('bookTo').value=today();
        if(!el('bookFrom').value){
          el('makeBook').disabled=true;
          text(el('bookStatus'),'전체 기록에서 시작일을 확인하는 중…');
          ensureAllPostsForLibrary('book').then(function(complete){
            if(!complete){
              if(!el('bookMaker').classList.contains('hidden')) text(el('bookStatus'),'전체 기록을 확인하지 못했어. 다시 열어서 시도해 줘.');
              return;
            }
            if(!el('bookFrom').value){
              var posts=state.home&&state.home.posts||[];
              var earliest=today();
              for(var i=0;i<posts.length;i++){ var d=String(posts[i].recordDate||''); if(d&&d<earliest) earliest=d; }
              el('bookFrom').value=earliest;
            }
            if(!el('bookMaker').classList.contains('hidden')&&!bookBusy) text(el('bookStatus'),'');
          }).then(function(){ if(!bookBusy) el('makeBook').disabled=false; });
        }
      }
      function makeBookAction(){
        if(bookBusy||!state.session) return;
        var from=String(el('bookFrom').value||'').trim(), to=String(el('bookTo').value||'').trim();
        if(!from||!to){ toast('기간을 먼저 골라 줘.'); return; }
        bookBusy=true; el('makeBook').disabled=true; el('bookResult').innerHTML='';
        text(el('bookStatus'),'책을 만드는 중… 사진이 많으면 2~3분 걸릴 수 있어. 화면을 켜둔 채 기다려 줘 📖');
        callApi('apiExportBookV310',[state.session.token,from,to],290000).then(unwrap).then(function(data){
          if(data&&data.kind==='supabase_print'){
            var html=buildPrintableBook(data), blob=new Blob([html],{type:'text/html;charset=utf-8'}), objectUrl=URL.createObjectURL(blob);
            text(el('bookStatus'),'미리보기를 열어 인쇄하면 PDF로 저장할 수 있어. 기록 '+((data.posts&&data.posts.length)||0)+'개 · 사진 '+(data.images||0)+'장');
            var printLink=document.createElement('a'); printLink.className='book-link'; printLink.href=objectUrl; printLink.target='_blank'; printLink.rel='noopener';
            printLink.textContent='📖 책 미리보기 열기 — 인쇄에서 PDF로 저장';
            printLink.addEventListener('click',function(e){
              try {
                var w=window.open(objectUrl,'_blank');
                if(w) e.preventDefault();
              } catch(winErr){}
            });
            el('bookResult').appendChild(printLink);
            return;
          }
          text(el('bookStatus'),'완성! 기록 '+(data&&data.posts||0)+'개 · 사진 '+(data&&data.images||0)+'장을 엮었어.');
          var link=document.createElement('a'); link.className='book-link'; link.href=String(data&&data.url||''); link.target='_blank'; link.rel='noopener';
          link.textContent='📖 '+(data&&data.name||'PDF')+' — 눌러서 열기·저장';
          el('bookResult').appendChild(link);
        }).catch(function(error){ text(el('bookStatus'),'만들지 못했어: '+errorMessage(error)); })
        .then(function(){ bookBusy=false; el('makeBook').disabled=false; });
      }

      function htmlEscape(value){ return String(value==null?'':value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
      function buildPrintableBook(data){
        var posts=Array.isArray(data&&data.posts)?data.posts:[];
        var sections=[];
        for(var i=0;i<posts.length;i++){
          var post=posts[i]||{}, images=Array.isArray(post.images)?post.images:[], imageHtml=[];
          for(var j=0;j<images.length;j++) imageHtml.push('<img src="'+htmlEscape(images[j])+'" alt="기록 사진">');
          sections.push('<article><p class="meta">'+htmlEscape(post.date)+' · '+htmlEscape(post.authorName)+(post.mood?' · '+htmlEscape(post.mood):'')+'</p>'+(post.title?'<h2>'+htmlEscape(post.title)+'</h2>':'')+'<div class="body">'+htmlEscape(post.body).replace(/\n/g,'<br>')+'</div>'+(imageHtml.length?'<div class="photos">'+imageHtml.join('')+'</div>':'')+'</article>');
        }
        return '<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>'+htmlEscape((data&&data.babyName)||'일콩')+' 기록 책</title><style>body{max-width:760px;margin:0 auto;padding:32px;font-family:system-ui,-apple-system,sans-serif;color:#312c27;line-height:1.65}.cover{text-align:center;padding:54px 0;border-bottom:1px solid #ddd}.cover h1{font-size:32px;margin:0 0 10px}article{padding:28px 0;border-bottom:1px solid #e8e1d8}.meta{color:#746b60;font-size:14px}h2{font-size:22px;margin:8px 0}.body{white-space:normal}.photos{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:18px}.photos img{width:100%;max-height:360px;object-fit:contain;border-radius:8px;background:#f5f2ed}@media print{body{max-width:none;padding:0}.cover{page-break-after:always}article{break-inside:avoid}}</style></head><body><section class="cover"><h1>우리 둘과 '+htmlEscape((data&&data.babyName)||'일콩')+'의 기록</h1><p>'+htmlEscape((data&&data.from)||'')+' ~ '+htmlEscape((data&&data.to)||'')+'</p><p>인쇄 메뉴에서 PDF로 저장할 수 있어요.</p></section>'+sections.join('')+'</body></html>';
      }

      function openComposer(){
        if(state.saving) return;
        configureComposerMode();
        state.dialogReturnFocus=document.activeElement;
        show(el('composer'));
        syncComposerViewport();
        // 모바일 WebView에서는 표시와 같은 틱의 focus가 한글 IME 연결을 깨뜨릴 수 있다.
        focusTextEntryForDesktop(el('postBody'),100);
      }
      function syncComposerViewport(){
        var dialog=el('composer'), viewport=window.visualViewport;
        if(!dialog) return;
        if(!viewport||window.innerWidth>540||dialog.classList.contains('hidden')){
          dialog.classList.remove('viewport-fit');
          dialog.style.removeProperty('--composer-visible-top');
          dialog.style.removeProperty('--composer-visible-height');
          return;
        }
        dialog.style.setProperty('--composer-visible-top',Math.max(0,Math.round(viewport.offsetTop||0))+'px');
        dialog.style.setProperty('--composer-visible-height',Math.max(1,Math.round(viewport.height||window.innerHeight))+'px');
        dialog.classList.add('viewport-fit');
      }

      function backupCreateComposer(){
        cancelDraftSave();
        var userId=currentUserId(),backup={title:el('postTitle').value,body:el('postBody').value,date:el('recordDate').value,category:el('category').value,mood:state.selectedMood,images:state.images,saveAttempt:state.saveAttempt};
        if(!userId||!storageSet(draftKey(userId),JSON.stringify({title:backup.title,body:backup.body,date:backup.date,category:backup.category,mood:backup.mood})))return false;
        state.composerBackup=backup;return true;
      }
      function restoreCreateComposer(){
        var b=state.composerBackup; state.composerBackup=null; state.composerMode='create'; state.editingPostId=''; state.editAttempt=null;
        if(b){ el('postTitle').value=b.title||''; el('postBody').value=b.body||''; el('recordDate').value=b.date||today(); el('category').value=b.category||'일상'; state.selectedMood=b.mood||''; state.images=b.images||[]; state.saveAttempt=b.saveAttempt||null; }
        else { resetComposerView(); }
        hide(el('editNote')); show(el('photoField')); text(el('composerTitle'),'기록 남기기'); text(el('savePost'),'저장'); renderMoodChoices(); renderPreviews();renderExistingPreviews();
      }
      function openEditComposer(post){
        if(state.saving) return;
        if(state.composerMode==='edit'){
          if(String(state.editingPostId)!==String(post.id)) toast('보관 중인 수정을 먼저 저장하거나 버려 줘.');
          openComposer(); return;
        }
        if(!backupCreateComposer()){toast('작성 중인 새 기록을 기기에 보관하지 못했어. 작성 화면을 유지했어. 저장공간을 확인한 뒤 다시 수정해 줘.');openComposer();return;}
        state.composerMode='edit'; state.editingPostId=String(post.id); state.editAttempt=null; state.images=[]; state.saveAttempt=null;
        state.editExistingImages=(Array.isArray(post.images)?post.images:[]).map(function(item){return {id:String(item.id)};});
        state.editExpectedImageIds=state.editExistingImages.map(function(item){return item.id;});
        state.editExistingPhotoCount=state.editExistingImages.length;
        el('recordDate').value=post.recordDate||today(); el('category').value=post.category||'일상'; el('postTitle').value=post.title||''; el('postBody').value=post.body||''; state.selectedMood=post.mood||''; renderMoodChoices(); renderPreviews();
        configureComposerMode(); openComposer(); persistPendingSave();
      }

      function composerDraftLocked(){return state.composerMode==='create'&&!!(state.saveAttempt&&state.saveAttempt.postId);}
      function applyComposerDraftLock(){
        var locked=composerDraftLocked(),controls=el('composer').querySelectorAll('input,textarea,select,button,summary');
        for(var i=0;i<controls.length;i++){
          var control=controls[i];
          if(locked&&control.id!=='savePost'&&control.id!=='closeComposer'){if(typeof control.__ilkongDraftDisabled==='undefined')control.__ilkongDraftDisabled=!!control.disabled;control.disabled=true;control.setAttribute('aria-disabled','true');}
          else if(typeof control.__ilkongDraftDisabled!=='undefined'){control.disabled=control.__ilkongDraftDisabled;delete control.__ilkongDraftDisabled;control.removeAttribute('aria-disabled');}
        }
        if(locked){show(el('editNote'));text(el('editNote'),'중단된 사진 저장을 먼저 완료하면 내용을 수정할 수 있어. 같은 저장 버튼으로 이어서 저장해 줘.');}
      }
      function configureComposerMode(){
        var editing=state.composerMode==='edit';
        text(el('composerTitle'),editing?'기록 수정':'기록 남기기'); text(el('savePost'),editing?'수정 저장':'저장');
        if(editing){show(el('editNote'));text(el('editNote'),'기존 사진은 삭제하거나 순서를 바꿀 수 있어. 저장을 마칠 때 변경 사항을 확정해.');}
        else hide(el('editNote'));
        show(el('photoField')); el('advancedFields').open=editing; renderExistingPreviews();applyComposerDraftLock();
      }
      function renderExistingPreviews(){
        var wrap=el('existingPreviews'); if(!wrap) return; wrap.innerHTML='';
        if(state.composerMode!=='edit') return;
        (state.editExistingImages||[]).forEach(function(item,index){
          var box=document.createElement('div');box.className='preview';
          var imageBox=document.createElement('div');imageBox.style.cssText='position:absolute;inset:0';imageBox.innerHTML='<span class="photo-fail">기존 사진</span>';box.appendChild(imageBox);
          observeImage(item.id,imageBox,'thumbnail');
          var controls=document.createElement('div');controls.style.cssText='position:absolute;bottom:0;left:0;right:0;display:flex;justify-content:space-between;background:rgba(25,22,19,.75)';
          [['←','앞으로 이동',-1],['→','뒤로 이동',1],['✕','기존 사진 삭제',0]].forEach(function(action){
            var button=document.createElement('button');button.type='button';button.textContent=action[0];button.setAttribute('aria-label',action[1]);button.style.cssText='color:white;background:transparent;border:0;min-width:40px;min-height:40px';button.disabled=state.saving||!!(action[2]&&!(state.editExistingImages||[])[index+action[2]]);
            button.addEventListener('click',function(){
              if(state.saving) return;
              if(action[2]){var other=index+action[2],list=state.editExistingImages;list[index]=list[other];list[other]=item;}
              else state.editExistingImages=state.editExistingImages.filter(function(photo){return photo.id!==item.id;});
              markComposerMutation();state.editAttempt=null;state.editExistingPhotoCount=state.editExistingImages.length;renderExistingPreviews();persistPendingSave();
            });controls.appendChild(button);
          });
          box.appendChild(controls);wrap.appendChild(box);
        });
      }
      function closeComposer(){
        if(state.saving||state.composerClosing) return;
        if(state.images.length&&!confirm('사진과 글을 이 기기에 보관한 뒤 닫을까?')) return;
        var draftStored=flushDraftSave();
        var needsPending=!!(state.composerMode==='edit'||state.images.length||state.saveAttempt);
        if(!needsPending){
          if(draftStored===false&&(String(el('postTitle').value||'').trim()||String(el('postBody').value||'').trim()||state.selectedMood)){
            if(!confirm('작성 내용을 기기에 보관하지 못했어. 그래도 닫을까? 닫으면 지금 내용이 사라질 수 있어.')) return;
          }
          hide(el('composer')); restoreDialogFocus();
          return;
        }
        state.composerClosing=true;
        setSaving(true,'사진과 작성 상태를 기기에 보관하는 중…',0);
        persistPendingSave().then(function(stored){
          if(stored){
            state.pendingRestored=true;
            text(el('recoveryText'),state.images.length+'장 사진과 작성 내용을 기기에 보관했어. 이어쓰기를 누르면 그대로 열려.');
            show(el('recoveryBanner'));
            hide(el('composer')); restoreDialogFocus();
            return;
          }
          state.pendingRestored=false;
          hide(el('recoveryBanner'));
          if(!confirm('사진과 작성 상태를 기기에 보관하지 못했어. 그래도 닫을까? 닫으면 사진 복구 정보가 사라질 수 있어.')) return;
          hide(el('composer')); restoreDialogFocus();
        }).then(function(){
          state.composerClosing=false;
          setSaving(false,'',0);
        },function(){
          state.composerClosing=false;
          setSaving(false,'',0);
          toast('기기 저장소를 확인하지 못했어. 작성 화면은 그대로 유지했어.');
        });
      }

      function restoreDialogFocus(){
        var target=state.dialogReturnFocus;
        state.dialogReturnFocus=null;
        if(target&&target.isConnected&&typeof target.focus==='function') setTimeout(function(){ target.focus(); },0);
      }

      function addFiles(fileList){
        if(state.saving||state.composerClosing) return;
        if(composerDraftLocked()){toast('중단된 사진 저장을 먼저 완료하면 내용을 수정할 수 있어.');return;}
        var used=state.composerMode==='edit'?(state.editExistingImages||[]).length:0;
        var files=Array.prototype.slice.call(fileList||[]), room=Math.max(0,MAX_IMAGES-used-state.images.length); files=files.slice(0,room);
        if(!files.length&&fileList&&fileList.length){ toast('사진은 최대 '+MAX_IMAGES+'장까지 가능해.'); return; }
        if(files.length) markComposerMutation();
        files.forEach(function(file){
          var replacements=state.composerMode==='edit'?(state.editExpectedImageIds||[]).filter(function(id){return !(state.editExistingImages||[]).some(function(photo){return photo.id===id;})&&!state.images.some(function(photo){return photo.replaceImageId===id||photo.uploadedImageId===id;});}):[];
          state.images.push({id:uuid(),file:file,dataUrl:'',thumbnailDataUrl:'',name:file.name||'사진',status:'queued',width:0,height:0,uploadedPostId:'',uploadedImageId:'',replaceImageId:replacements[0]||''});
        });
        if(files.length){ invalidateSaveAttempt(); renderPreviews(); processImageQueue(); persistPendingSave(); }
        if(fileList&&fileList.length>room) toast('사진은 최대 '+MAX_IMAGES+'장까지 가능해.');
      }

      function processImageQueue(){
        if(state.imageQueueRunning) return;
        var item=null; for(var i=0;i<state.images.length;i++) if(state.images[i].status==='queued'){item=state.images[i];break;}
        if(!item){ persistPendingSave(); return; }
        state.imageQueueRunning=true; item.status='processing'; renderPreviews();
        compressImageAdaptive(item.file).then(function(result){ item.dataUrl=result.dataUrl; item.thumbnailDataUrl=result.thumbnailDataUrl; item.width=result.width; item.height=result.height; item.status='ready'; item.file=null; })
          .catch(function(error){ item.status='error'; item.error=errorMessage(error); })
          .then(function(){ state.imageQueueRunning=false; renderPreviews(); persistPendingSave(); processImageQueue(); });
      }

      function loadImageFile(file){
        return new Promise(function(resolve,reject){ var url=URL.createObjectURL(file),img=new Image(); img.onload=function(){URL.revokeObjectURL(url);resolve(img);}; img.onerror=function(){URL.revokeObjectURL(url);reject(new Error('이 사진을 읽지 못했어. JPG로 변환한 뒤 다시 골라 줘.'));}; img.src=url; });
      }
      function dataUrlBytes(dataUrl){ var comma=String(dataUrl||'').indexOf(','); return comma<0?0:Math.floor((dataUrl.length-comma-1)*3/4); }
      function drawScaled(img,maxSide){ var scale=Math.min(1,maxSide/Math.max(img.naturalWidth,img.naturalHeight)),canvas=document.createElement('canvas'); canvas.width=Math.max(1,Math.round(img.naturalWidth*scale)); canvas.height=Math.max(1,Math.round(img.naturalHeight*scale)); var ctx=canvas.getContext('2d'); if(!ctx) throw new Error('사진 변환 화면을 만들지 못했어.'); ctx.drawImage(img,0,0,canvas.width,canvas.height); return canvas; }
      function compressCanvas(canvas,target,qualities){
        for(var i=0;i<qualities.length;i++){ var out=canvas.toDataURL('image/jpeg',qualities[i]); if(dataUrlBytes(out)<=target||i===qualities.length-1) return out; }
        return canvas.toDataURL('image/jpeg',.65);
      }
      function compressImageAdaptive(file){
        return loadImageFile(file).then(function(img){
          var sizes=[1600,1450,1300,1150], qualities=[.82,.76,.70,.64], main='',canvas=null;
          for(var i=0;i<sizes.length;i++){ canvas=drawScaled(img,sizes[i]); main=compressCanvas(canvas,TARGET_IMAGE_BYTES,qualities); if(dataUrlBytes(main)<=TARGET_IMAGE_BYTES) break; }
          if(dataUrlBytes(main)>1750000) throw new Error('사진을 충분히 줄이지 못했어. 스크린샷으로 저장한 뒤 다시 골라 줘.');
          var thumbCanvas=drawScaled(img,720), thumb=compressCanvas(thumbCanvas,TARGET_THUMB_BYTES,[.75,.68,.60]);
          return {dataUrl:main,thumbnailDataUrl:thumb,width:canvas.width,height:canvas.height};
        });
      }

      function renderPreviews(){
        var wrap=el('previews');
        wrap.innerHTML='';
        for(var i=0;i<state.images.length;i++)(function(item){
          var box=document.createElement('div');
          box.className='preview';
          if(item.status==='ready') box.innerHTML='<img alt="선택 사진" src="'+item.dataUrl+'"><button class="remove" type="button">✕</button>';
          else if(item.status==='error') box.innerHTML='<div class="photo-fail">변환 실패<br>'+escapeHtml(item.error||'')+'</div><button class="remove" type="button">✕</button>';
          else box.innerHTML='<div class="photo-fail">'+(item.status==='queued'?'압축 대기 중…':'사진 준비 중…')+'</div><button class="remove" type="button">✕</button>';
          box.querySelector('.remove').addEventListener('click',function(){
            if(state.saving||state.composerClosing||composerDraftLocked()) return;
            markComposerMutation();
            state.images=state.images.filter(function(x){ return x.id!==item.id; });
            invalidateSaveAttempt();
            renderPreviews(); persistPendingSave();
          });
          box.querySelector('.remove').setAttribute('aria-label','선택한 사진 삭제');box.querySelector('.remove').disabled=state.saving||composerDraftLocked();
          wrap.appendChild(box);
        })(state.images[i]);
        var queueStatus=el('photoQueueStatus');
        if(!queueStatus) return;
        if(!state.images.length){ hide(queueStatus); text(queueStatus,''); return; }
        var ready=0,queued=0,processing=0,errors=0;
        state.images.forEach(function(item){
          if(item.status==='error') errors++;
          else if(item.status==='queued') queued++;
          else if(item.status==='processing') processing++;
          else ready++;
        });
        var parts=['새 사진 '+state.images.length+'장','준비 완료 '+ready+'장'];
        if(processing) parts.push('변환 중 '+processing+'장');
        if(queued) parts.push('대기 '+queued+'장');
        if(errors) parts.push('실패 '+errors+'장 · 삭제 후 다시 선택');
        text(queueStatus,parts.join(' · '));
        show(queueStatus);
      }

      function validClientRequestId(value){
        return /^[A-Za-z0-9._:-]{1,128}$/.test(String(value||'').trim());
      }

      function prepareCreateSaveAttempt(signature){
        if(state.saveAttempt&&state.saveAttempt.postId)return state.saveAttempt;
        var reusable=state.saveAttempt&&state.saveAttempt.signature===signature&&validClientRequestId(state.saveAttempt.requestId);
        if(!reusable){
          state.saveAttempt={requestId:uuid(),postId:'',signature:signature};
          state.images.forEach(function(item){ item.uploadedPostId=''; });
        }
        return state.saveAttempt;
      }

      function startPostSafely(payload,signature,repaired){
        return callApi('apiStartPostV221',[state.session.token,payload],22000)
          .then(unwrap)
          .catch(function(error){
            var message=errorMessage(error);
            if(!repaired&&/저장 요청번호/.test(message)){
              state.saveAttempt={requestId:uuid(),postId:'',signature:signature};
              state.images.forEach(function(item){ item.uploadedPostId=''; });
              payload.requestId=state.saveAttempt.requestId;
              return requirePendingSave('saving').then(function(){ return startPostSafely(payload,signature,true); });
            }
            throw error;
          });
      }

      function savePost(){
        if(state.saving||state.composerClosing) return;
        if(isImeComposing(state.compositionTarget)){setTimeout(function(){if(!state.saving&&!isImeComposing(state.compositionTarget))savePost();},170);return;}
        var body=el('postBody').value.trim(),title=el('postTitle').value.trim();
        if(state.images.some(function(item){return item.status==='queued'||item.status==='processing';})){toast('사진 준비가 끝날 때까지만 잠깐 기다려 줘.');return;}
        if(state.images.some(function(item){return item.status==='error'||!isPersistentImageDataUrl(item.dataUrl);})){toast('변환에 실패한 사진을 빼고 다시 저장해 줘.');return;}
        var editing=state.composerMode==='edit',existing=editing?(state.editExistingImages||[]).length:0;
        if(!body&&!title&&!existing&&!state.images.length){toast('글이나 사진을 하나는 남겨 줘.');return;}
        cancelDraftSave();
        var operation={mode:state.composerMode,postId:state.editingPostId,payload:{recordDate:el('recordDate').value,title:title,body:body,category:el('category').value,mood:state.selectedMood},images:state.images.map(function(item){return Object.assign({},item);})};
        state.images=operation.images;state.activeSaveOperation=operation;
        invalidateHomeResponses();state.saving=true;setSaving(true,editing?'수정 내용을 준비하는 중…':'기록을 준비하는 중…',5);
        var work;
        if(editing){
          var editSignature=JSON.stringify({payload:operation.payload,images:operation.images.map(function(item){return item.id;}),existing:(state.editExistingImages||[]).map(function(item){return item.id;})});
          if(!state.editAttempt||state.editAttempt.signature!==editSignature) state.editAttempt={signature:editSignature,id:uuid(),bodySaved:false,photosRequestId:uuid()};
          work=requirePendingSave('saving').then(function(){return addEditedPhotos(operation.postId,0,operation.images);}).then(function(){
            if(state.editAttempt.bodySaved) return;
            return callApi('apiUpdatePostV280',[state.session.token,operation.postId,operation.payload,state.editAttempt.id],20000).then(unwrap).then(function(){state.editAttempt.bodySaved=true;return requirePendingSave('saving');});
          })
            .then(function(){
              var imageIds=(state.editExistingImages||[]).map(function(item){return item.id;}).concat(operation.images.map(function(item){return item.uploadedImageId;}));
              return callApi('apiSetPostPhotosV490',[state.session.token,operation.postId,{imageIds:imageIds,expectedImageIds:(state.editExpectedImageIds||[]).slice(),requestId:state.editAttempt.photosRequestId}],22000).then(unwrap);
            }).then(function(){return clearPendingSave();}).then(function(){toast('기록과 사진 변경을 저장했어 🌿');hide(el('composer'));restoreCreateComposer();return persistPendingSave();});
        }else{
          operation.payload.imageCount=operation.images.length;
          var signature=JSON.stringify({recordDate:operation.payload.recordDate,title:title,body:body,category:operation.payload.category,mood:operation.payload.mood,imageIds:operation.images.map(function(item){return item.id;})});
          var attempt=prepareCreateSaveAttempt(signature);operation.payload.requestId=attempt.requestId;
          work=requirePendingSave('saving').then(function(){return startPostSafely(operation.payload,signature,false);}).then(function(result){
            if(!result||!result.postId)throw new Error('저장할 글 번호를 받지 못했어.');
            state.saveAttempt.postId=String(result.postId);return requirePendingSave('saving').then(function(){return uploadImagesSequential(result.postId,0,operation.images);}).then(function(){return callApi('apiFinishPostV221',[state.session.token,result.postId],22000).then(unwrap);});
          }).then(function(){state.offlineQueued=false;renderOfflineBanner();return clearPendingSave();}).then(function(){toast('기록을 저장했어 🌿');clearComposer();hide(el('composer'));});
        }
        work.then(function(){restoreDialogFocus();return loadHome({source:editing?'edit':'save',force:true}).catch(function(){toast('저장은 완료됐어. 최신 기록을 다시 불러와 줘.');});})
          .catch(function(error){
            return persistPendingSave('failed').then(function(stored){
              if(editing){
                var uploaded=operation.images.filter(function(item){return String(item.uploadedPostId||'')===String(operation.postId);}).length;
                var partial=(state.editAttempt&&state.editAttempt.bodySaved?'글 저장 완료 · ':'')+(uploaded?'사진 '+uploaded+' / '+operation.images.length+'장 전송 완료. ':'');
                toast(partial+(stored?'같은 저장 버튼으로 이어서 시도해 줘: ':'기기 보관에 실패했어. 화면을 닫지 말고 다시 시도해 줘: ')+errorMessage(error));return;
              }
              if(stored&&looksOffline(error)){
                state.offlineQueued=true;hide(el('composer'));restoreDialogFocus();renderOfflineBanner();toast('연결이 불안해서 기기에 보관했어. 연결되면 자동으로 올릴게 ✈️');scheduleOfflineFlush(15000);
              }else toast((stored?'저장을 끝내지 못했어. 같은 저장 버튼으로 이어서 시도해: ':'기기 보관에 실패했어. 화면을 닫지 말고 다시 시도해: ')+errorMessage(error));
            });
          }).then(function(){state.saving=false;state.activeSaveOperation=null;setSaving(false,'',0);});
      }

      function requirePendingSave(status){
        return persistPendingSave(status).then(function(stored){if(!stored){var error=new Error('사진과 작성 상태를 기기 저장소에 보관하지 못했어.');error.code='STORAGE';throw error;}return true;});
      }
      // v3.7.0: 이미 게시된 기록에 사진을 이어 붙인다(수정 화면에서 추가한 사진).
      function addEditedPhotos(postId,index,images){
        images=images||state.images;
        if(index>=images.length)return Promise.resolve();
        var item=images[index];
        if(String(item.uploadedPostId||'')===String(postId)&&item.uploadedImageId)return addEditedPhotos(postId,index+1,images);
        setSaving(true,'사진 '+(index+1)+' / '+images.length+' 추가 중…',40+Math.round(index/Math.max(1,images.length)*50));
        var payload={clientImageId:item.id,dataUrl:item.dataUrl,thumbnailDataUrl:item.thumbnailDataUrl,width:item.width,height:item.height,replaceImageId:item.replaceImageId||''};
        return callApi('apiAddPhotosV370',[state.session.token,postId,payload],30000).then(unwrap).then(function(result){
          if(!result||!result.imageId)throw new Error('추가한 사진 번호를 받지 못했어.');
          item.uploadedPostId=String(postId);item.uploadedImageId=String(result.imageId);
          state.editExpectedImageIds=(state.editExpectedImageIds||[]).filter(function(id){return id!==item.replaceImageId;});
          if(state.editExpectedImageIds.indexOf(item.uploadedImageId)<0)state.editExpectedImageIds.push(item.uploadedImageId);
          var seedUrl=item.thumbnailDataUrl||item.dataUrl;cacheImageUrl(item.uploadedImageId,'thumbnail',seedUrl);
          return requirePendingSave('saving').then(function(){return addEditedPhotos(postId,index+1,images);});
        });
      }

      function uploadImagesSequential(postId,index,images){
        images=images||state.images.slice();
        if(index>=images.length)return Promise.resolve();
        var item=images[index];
        if(String(item.uploadedPostId||'')===String(postId))return uploadImagesSequential(postId,index+1,images);
        setSaving(true,'사진 '+(index+1)+' / '+images.length+' 저장 중…',10+Math.round(index/images.length*80));
        var payload={clientImageId:item.id,dataUrl:item.dataUrl,thumbnailDataUrl:item.thumbnailDataUrl,order:index,width:item.width,height:item.height};
        return callApi('apiUploadPostImageV221',[state.session.token,postId,payload],30000).then(unwrap).then(function(result){
          if(!result||!result.imageId)throw new Error('저장한 사진 번호를 받지 못했어.');
          item.uploadedPostId=String(postId);item.uploadedImageId=String(result.imageId);cacheImageUrl(item.uploadedImageId,'thumbnail',item.thumbnailDataUrl||item.dataUrl);
          return requirePendingSave('saving').then(function(){return uploadImagesSequential(postId,index+1,images);});
        });
      }

      function setSaving(busy,message,percent){
        var controls=el('composer').querySelectorAll('input,textarea,select,button,summary');
        if(busy&&!state.composerControlState){state.composerControlState=[];for(var i=0;i<controls.length;i++)state.composerControlState.push({node:controls[i],disabled:typeof controls[i].__ilkongDraftDisabled==='undefined'?!!controls[i].disabled:controls[i].__ilkongDraftDisabled});}
        if(busy){for(var j=0;j<controls.length;j++){controls[j].disabled=true;controls[j].setAttribute('aria-disabled','true');}}
        else { (state.composerControlState||[]).forEach(function(item){item.node.disabled=item.disabled;item.node.removeAttribute('aria-disabled');});state.composerControlState=null; }
        el('savePost').disabled=busy;text(el('savePost'),busy?'저장 중…':(state.composerMode==='edit'?'수정 저장':'저장'));
        if(busy){show(el('saveProgress'));text(el('saveMessage'),message);el('progressBar').style.width=percent+'%';el('saveProgressBar').setAttribute('aria-valuenow',String(Math.max(0,Math.min(100,Number(percent)||0))));}
        else {hide(el('saveProgress'));applyComposerDraftLock();}
      }

      // 오늘 한 줄은 일반 기록과 같은 안전 저장 API를 쓰되, 사진·작성 화면 상태와
      // 섞이지 않게 별도 초안과 요청 번호를 보관한다. 저장 도중 화면이 닫혀도 같은
      // requestId로 이어서 처리되므로 중복 글이 생기지 않는다.
      function checkinBody(note,mood,condition){
        var lines=[];
        if(mood) lines.push('오늘의 기분: '+mood);
        if(condition) lines.push('오늘의 컨디션: '+condition);
        if(note) lines.push(note);
        return lines.join('\n');
      }
      function renderCheckinChoices(){
        var moods=document.querySelectorAll('.checkin-mood');
        for(var i=0;i<moods.length;i++){
          var moodOn=(moods[i].getAttribute('data-checkin-mood')||'')===state.checkinMood;
          moods[i].classList.toggle('active',moodOn);
          moods[i].setAttribute('aria-pressed',moodOn?'true':'false');
        }
        var conditions=document.querySelectorAll('.checkin-condition');
        for(var j=0;j<conditions.length;j++){
          var conditionOn=(conditions[j].getAttribute('data-checkin-condition')||'')===state.checkinCondition;
          conditions[j].classList.toggle('active',conditionOn);
          conditions[j].setAttribute('aria-pressed',conditionOn?'true':'false');
        }
      }
      function persistCheckinDraft(){
        var userId=currentUserId();
        if(!userId||!el('checkinNote')) return;
        var attempt=state.checkinAttempt;
        var safeAttempt=attempt&&validClientRequestId(attempt.requestId)?{requestId:attempt.requestId,postId:String(attempt.postId||''),signature:String(attempt.signature||'')} : null;
        var draft={note:String(el('checkinNote').value||'').slice(0,1000),mood:String(state.checkinMood||''),condition:String(state.checkinCondition||''),attempt:safeAttempt};
        storageSet(checkinDraftKey(userId),JSON.stringify(draft));
      }
      function restoreCheckinDraft(){
        state.checkinMood=''; state.checkinCondition=''; state.checkinAttempt=null;
        var note='';
        try{
          var raw=storageGet(checkinDraftKey(currentUserId()));
          var draft=raw?JSON.parse(raw):null;
          if(draft&&typeof draft==='object'){
            note=String(draft.note||'').slice(0,1000);
            state.checkinMood=String(draft.mood||'');
            state.checkinCondition=String(draft.condition||'');
            if(draft.attempt&&validClientRequestId(draft.attempt.requestId)) state.checkinAttempt={requestId:String(draft.attempt.requestId),postId:String(draft.attempt.postId||''),signature:String(draft.attempt.signature||'')};
          }
        }catch(draftError){}
        el('checkinNote').value=note;
        renderCheckinChoices();
      }
      function openCheckin(){
        restoreCheckinDraft();
        text(el('checkinStatus'),'');
        text(el('saveCheckin'),'남기기');
        el('saveCheckin').disabled=false;
        openOverlaySheet('checkin');
      }
      function prepareCheckinAttempt(signature){
        var reusable=state.checkinAttempt&&state.checkinAttempt.signature===signature&&validClientRequestId(state.checkinAttempt.requestId);
        if(!reusable) state.checkinAttempt={requestId:uuid(),postId:'',signature:signature};
        return state.checkinAttempt;
      }
      function saveCheckin(){
        if(state.checkinBusy||!state.session) return;
        var note=String(el('checkinNote').value||'').trim();
        var mood=String(state.checkinMood||'');
        var condition=String(state.checkinCondition||'');
        if(!note&&!mood&&!condition){ toast('기분, 컨디션, 한 줄 중 하나를 남겨 줘.'); return; }
        var payload={recordDate:today(),title:'오늘 한 줄 체크인',body:checkinBody(note,mood,condition),category:'일상',mood:mood,imageCount:0};
        var signature=JSON.stringify({recordDate:payload.recordDate,title:payload.title,body:payload.body,category:payload.category,mood:payload.mood});
        var attempt=prepareCheckinAttempt(signature);
        payload.requestId=attempt.requestId;
        // 저장 직전에 시작된 오래된 홈 조회가 새 체크인을 덮어쓰지 않도록 막는다.
        invalidateHomeResponses();
        state.checkinBusy=true;
        state.lastInteractionAt=Date.now();
        el('saveCheckin').disabled=true;
        text(el('saveCheckin'),'저장 중…');
        text(el('checkinStatus'),'안전하게 저장 중이야…');
        persistCheckinDraft();
        var start=attempt.postId?Promise.resolve({postId:attempt.postId}):callApi('apiStartPostV221',[state.session.token,payload],22000).then(unwrap);
        start.then(function(result){
          if(!result||!result.postId) throw new Error('저장할 기록 번호를 받지 못했어.');
          state.checkinAttempt.postId=String(result.postId);
          persistCheckinDraft();
          return callApi('apiFinishPostV221',[state.session.token,state.checkinAttempt.postId],22000);
        }).then(unwrap).then(function(){
          storageRemove(checkinDraftKey(currentUserId()));
          state.checkinAttempt=null; state.checkinMood=''; state.checkinCondition='';
          hide(el('checkin')); restoreDialogFocus();
          toast('오늘 한 줄을 남겼어 ☀️');
          loadHome({source:'checkin',force:true}).catch(function(){});
        }).catch(function(error){
          text(el('checkinStatus'),'저장을 끝내지 못했어. 다시 누르면 같은 기록으로 이어서 시도해.');
          toast(errorMessage(error));
        }).then(function(){
          state.checkinBusy=false;
          el('saveCheckin').disabled=false;
          text(el('saveCheckin'),'남기기');
        });
      }

      function clearComposer(){
        markComposerMutation();
        cancelDraftSave(true);
        el('postTitle').value='';
        el('postBody').value='';
        el('category').value='일상';
        el('recordDate').value=today();
        state.images=[];
        state.selectedMood='';
        state.saveAttempt=null;
        state.composerMode='create'; state.editingPostId=''; hide(el('editNote')); show(el('photoField')); text(el('composerTitle'),'기록 남기기'); text(el('savePost'),'저장');
        renderMoodChoices();
        renderPreviews();
        var userId=currentUserId();
        if(userId) storageRemove(draftKey(userId));
      }

      function cancelDraftSave(clearPending){
        if(state.draftSaveTimer){ clearTimeout(state.draftSaveTimer); state.draftSaveTimer=null; }
        if(clearPending) state.draftSavePending=false;
      }

      function scheduleDraftSave(){
        if(state.logoutBusy||state.saving||composerDraftLocked()) return;
        if(state.composerMode==='edit'){ state.editAttempt=null; persistPendingSave(); return; }
        state.draftSavePending=true;
        cancelDraftSave();
        if(isImeComposing(state.compositionTarget)) return;
        state.draftSaveTimer=setTimeout(function(){
          state.draftSaveTimer=null;
          if(isImeComposing(state.compositionTarget)) return;
          saveDraft();
        },400);
      }

      function flushDraftSave(){
        state.draftSavePending=true;
        cancelDraftSave();
        if(isImeComposing(state.compositionTarget)) return false;
        return saveDraft(true,true);
      }

      function saveDraft(force,preserveAttempt){
        if(state.saving||composerDraftLocked())return true;
        if(state.composerMode==='edit'){ if(!state.saving&&preserveAttempt!==true) state.editAttempt=null; persistPendingSave(); return true; }
        if(force!==true&&isImeComposing(state.compositionTarget)){ state.draftSavePending=true; return false; }
        cancelDraftSave();
        state.draftSavePending=false;
        var userId=currentUserId();
        if(!userId) return false;
        if(preserveAttempt!==true) invalidateSaveAttempt();
        var draft={
          title:el('postTitle').value,
          body:el('postBody').value,
          date:el('recordDate').value,
          category:el('category').value,
          mood:state.selectedMood
        };
        var stored=storageSet(draftKey(userId),JSON.stringify(draft));
        if(state.images.length||state.saveAttempt) persistPendingSave();
        return stored;
      }

      function restoreDraft(userId){
        cancelDraftSave(true);
        resetComposerView();
        var scopedKey=draftKey(userId);
        var raw=storageGet(scopedKey);
        var legacyKey='';
        if(!raw){
          var legacyKeys=[PREVIOUS_DRAFT_KEY,LEGACY_DRAFT_KEY,OLDER_DRAFT_KEY];
          for(var i=0;i<legacyKeys.length;i++){
            raw=storageGet(legacyKeys[i]);
            if(raw){ legacyKey=legacyKeys[i]; break; }
          }
        }
        if(!raw) return;
        try {
          var d=JSON.parse(raw);
          el('postTitle').value=d.title||'';
          el('postBody').value=d.body||'';
          el('recordDate').value=d.date||today();
          el('category').value=d.category||'일상';
          state.selectedMood=d.mood||'';
          renderMoodChoices();
          if(legacyKey){
            storageSet(scopedKey,raw);
            storageRemove(PREVIOUS_DRAFT_KEY);
            storageRemove(LEGACY_DRAFT_KEY);
            storageRemove(OLDER_DRAFT_KEY);
          }
        } catch(e){}
      }

      function pendingSnapshot(status){
        function savedImage(item){return {id:item.id,dataUrl:item.dataUrl,thumbnailDataUrl:item.thumbnailDataUrl,name:item.name,status:item.status==='processing'||item.status==='queued'?'error':item.status,error:item.status==='processing'||item.status==='queued'?'앱이 닫혀 압축이 중단됐어. 이 사진만 다시 선택해 줘.':item.error||'',width:item.width||0,height:item.height||0,uploadedPostId:item.uploadedPostId||'',uploadedImageId:item.uploadedImageId||'',replaceImageId:item.replaceImageId||''};}
        var backup=state.composerBackup?Object.assign({},state.composerBackup,{images:(state.composerBackup.images||[]).map(savedImage)}):null;
        return {userId:currentUserId(),mode:state.composerMode,editingPostId:state.editingPostId||'',editAttempt:state.editAttempt||null,editExistingImages:state.editExistingImages||[],editExpectedImageIds:state.editExpectedImageIds||[],composerBackup:backup,status:status||'draft',savedAt:Date.now(),title:el('postTitle').value,body:el('postBody').value,date:el('recordDate').value,category:el('category').value,mood:state.selectedMood,saveAttempt:state.saveAttempt,images:state.images.map(savedImage)};
      }
      function persistPendingSave(status){
        var userId=currentUserId();
        if(!userId) return Promise.resolve(false);
        var key=pendingSaveKey(userId);
        var snapshot=(state.composerMode==='edit'||state.images.length||state.saveAttempt)?JSON.parse(JSON.stringify(pendingSnapshot(status))):null;
        // 비동기 사진 압축/자동저장 순서가 뒤바뀌어 새 초안을 덮어쓰지 않게 한다.
        state.pendingPersistChain=state.pendingPersistChain.catch(function(){}).then(function(){
          return snapshot?idbSet(key,snapshot):idbRemove(key);
        });
        return state.pendingPersistChain.then(function(){return true;}).catch(function(){return false;});
      }
      function restorePendingSave(userId){
        var expectedUser=String(userId||'').toUpperCase();
        var expectedToken=state.session&&state.session.token?String(state.session.token):'';
        var expectedGeneration=state.composerMutationGeneration;
        return idbGet(pendingSaveKey(userId)).then(function(data){
          var activeUser=currentUserId().toUpperCase();
          var activeToken=state.session&&state.session.token?String(state.session.token):'';
          if(!expectedToken||activeUser!==expectedUser||activeToken!==expectedToken||(state.composerMode!=='create'&&!el('composer').classList.contains('hidden'))||state.saving||expectedGeneration!==state.composerMutationGeneration) return false;
          if(!data||String(data.userId||'').toUpperCase()!==expectedUser){ hide(el('recoveryBanner')); return false; }
          state.images=Array.isArray(data.images)?data.images:[];
          state.saveAttempt=data.saveAttempt||null;
          state.composerMode=data.mode==='edit'?'edit':'create'; state.editingPostId=state.composerMode==='edit'?String(data.editingPostId||''):'';state.editAttempt=data.editAttempt||null;state.editExistingImages=Array.isArray(data.editExistingImages)?data.editExistingImages:[];state.editExpectedImageIds=Array.isArray(data.editExpectedImageIds)?data.editExpectedImageIds:state.editExistingImages.map(function(photo){return photo.id;});state.editExistingPhotoCount=state.editExistingImages.length;state.composerBackup=data.composerBackup||null;configureComposerMode();
          el('postTitle').value=data.title||'';
          el('postBody').value=data.body||'';
          el('recordDate').value=data.date||today();
          el('category').value=data.category||'일상';
          state.selectedMood=data.mood||'';
          renderMoodChoices(); renderPreviews(); state.pendingRestored=true;
          text(el('recoveryText'),state.images.length+'장 사진과 작성 내용을 보관 중이야. 이어쓰기를 누르면 그대로 열려.');
          show(el('recoveryBanner'));
          return true;
        }).catch(function(){return false;});
      }
      function clearPendingSave(){
        var userId=currentUserId(); hide(el('recoveryBanner')); state.pendingRestored=false;
        if(!userId) return Promise.resolve();
        var key=pendingSaveKey(userId);
        state.pendingPersistChain=state.pendingPersistChain.catch(function(){}).then(function(){ return idbRemove(key); });
        return state.pendingPersistChain.catch(function(){});
      }
      function discardPendingSave(){ if(!confirm('보관 중인 미완성 기록을 버릴까?')) return; var userId=currentUserId(); if(userId) storageRemove(draftKey(userId)); clearPendingSave().then(function(){ if(state.composerMode==='edit') restoreCreateComposer();else resetComposerView(); return persistPendingSave(); }).then(function(){toast('미완성 기록을 정리했어.');}); }

      function invalidateSaveAttempt(){ if(!state.saving&&!composerDraftLocked()) state.saveAttempt=null; }

      function selectMood(mood){
        if(state.saving||state.composerClosing||composerDraftLocked()) return;
        markComposerMutation();
        state.selectedMood=state.selectedMood===String(mood||'')?'':String(mood||'');
        renderMoodChoices();
        saveDraft();
      }

      function renderMoodChoices(){
        var buttons=document.querySelectorAll('#moodChoices .mood-btn');
        for(var i=0;i<buttons.length;i++){
          var active=buttons[i].getAttribute('data-mood')===state.selectedMood;
          buttons[i].classList.toggle('active',active);
          buttons[i].setAttribute('aria-pressed',active?'true':'false');
        }
      }

      function resetComposerView(){
        markComposerMutation();
        cancelDraftSave(true);
        el('postTitle').value='';
        el('postBody').value='';
        el('category').value='일상';
        el('recordDate').value=today();
        state.images=[];
        state.selectedMood='';
        state.saveAttempt=null;
        state.editExistingImages=[];state.editExpectedImageIds=[];state.editAttempt=null;state.editingPostId='';state.composerMode='create';state.composerBackup=null;configureComposerMode();
        renderMoodChoices();
        renderPreviews();
      }

      function deletePost(postId){
        invalidateHomeResponses();
        callApi('apiDeletePostV221',[state.session.token,postId],18000).then(unwrap).then(function(){ toast('기록을 삭제했어.','되돌리기',function(){ restorePostAction(postId); },30000); return loadHome({source:'delete',force:true}); }).catch(function(error){ toast(errorMessage(error)); });
      }
      function restorePostAction(postId){ invalidateHomeResponses(); callApi('apiRestorePostV280',[state.session.token,postId],18000).then(unwrap).then(function(){toast('기록을 되돌렸어 🌿');return loadHome({source:'restore',force:true});}).catch(function(error){toast(errorMessage(error));}); }
      // v3.9.2: 즐겨찾기는 누르는 즉시 별이 바뀌고(낙관적 반영), 실패하면 되돌린다.
      function favoriteButtonFor(postId){
        var card=el('feed').querySelector('[data-post-id="'+cssEscape(String(postId))+'"]');
        return card?card.querySelector('.favorite'):null;
      }
      function paintFavorite(postId,enabled,pop){
        var button=favoriteButtonFor(postId);
        if(!button) return;
        button.textContent=enabled?'★':'☆';
        button.classList.toggle('active',!!enabled);
        button.setAttribute('aria-pressed',enabled?'true':'false');
        button.setAttribute('aria-label',enabled?'즐겨찾기 해제':'즐겨찾기에 담기');
        if(pop){ button.classList.remove('pop'); void button.offsetWidth; button.classList.add('pop'); }
      }
      function setFavoriteAction(postId,enabled){
        postId=String(postId||'');
        if(!postId||!state.session) return;
        if(state.favoriteBusy[postId]) return; // 연타 방지
        state.favoriteBusy[postId]=true;
        var post=findPost(postId);
        var previous=post?!!post.favorite:!enabled;
        if(post) post.favorite=enabled;
        paintFavorite(postId,enabled,true);
        var button=favoriteButtonFor(postId);
        if(button) button.classList.add('busy');
        state.homeFingerprint=fingerprintHome(state.home);
        invalidateHomeResponses();
        callApi('apiSetFavoriteV280',[state.session.token,postId,enabled],16000).then(unwrap)
          .then(function(data){
            if(data&&data.revision) state.revision=String(data.revision);
            state.homeFingerprint=fingerprintHome(state.home);
            toast(enabled?'즐겨찾기에 담았어 ★':'즐겨찾기에서 뺐어.');
            // 즐겨찾기 목록을 보는 중에 해제했다면 카드가 조용히 빠진다.
            if(!enabled&&state.viewFilter==='FAVORITE'){
              var card=el('feed').querySelector('[data-post-id="'+cssEscape(postId)+'"]');
              if(card){
                card.classList.add('leaving');
                setTimeout(function(){ renderPosts(state.home&&state.home.posts||[],{force:true}); },230);
              } else renderPosts(state.home&&state.home.posts||[]);
            }
          })
          .catch(function(error){
            if(post) post.favorite=previous;
            paintFavorite(postId,previous,false);
            state.homeFingerprint=fingerprintHome(state.home);
            toast('즐겨찾기를 바꾸지 못했어: '+errorMessage(error));
          })
          .then(function(){
            state.favoriteBusy[postId]=false;
            var done=favoriteButtonFor(postId);
            if(done) done.classList.remove('busy');
          });
      }

      // @include modules/settings.js

      function unwrap(response){
        if(response===null||response===undefined){
          var emptyError=new Error('서버가 빈 응답을 보냈어. Code.gs와 Index.html의 버전이 서로 다르거나 기존 배포가 갱신되지 않은 상태야.');
          emptyError.code='EMPTY';
          throw emptyError;
        }
        if(typeof response!=='object'){
          var typeError=new Error('서버 응답 형식이 올바르지 않아.');
          typeError.code='FORMAT';
          throw typeError;
        }
        if(response.ok!==true){
          var rawError=response.error;
          var message=typeof rawError==='string'?rawError:(rawError&&typeof rawError.message==='string'?rawError.message:'서버 요청을 처리하지 못했어.');
          var apiError=new Error(message);
          apiError.code=response.code||'SERVER';
          apiError.detail=rawError;
          throw apiError;
        }
        return response.data;
      }

      // v3.0.0: 새 APK는 화면을 앱에 내장하고(iframe 없음) IlkongNet 브리지로 서버와 JSON 통신한다.
      // 웹(Sites/브라우저)에서는 브리지가 없으므로 기존 google.script.run 경로를 그대로 쓴다.
      var NATIVE_RPC=!!(window.IlkongNet&&typeof window.IlkongNet.post==='function'&&typeof window.IlkongNet.take==='function');
      var nativePending={};
      // v3.4.0: 앱이 백그라운드에서 새 화면을 받아 저장하면 알려준다. 다음 실행부터 적용된다.
      window.__ilkongScreenUpdated=function(version){
        try{
          version=String(version||'');
          if(!version||version===VERSION) return;
          toast('새 화면 v'+version+'이 도착했어. 앱을 껐다 켜면 적용돼 ✨');
        }catch(updateNoticeError){}
      };
      window.__ilkongNetSignal=function(id){
        id=String(id||'');
        var entry=nativePending[id];
        var body='';
        try{ body=String(window.IlkongNet.take(id)||''); }catch(e){ body=''; }
        if(!entry) return;
        delete nativePending[id];
        clearTimeout(entry.timer);
        var parsed=null;
        try{ parsed=JSON.parse(body); }
        catch(e){ entry.reject(new Error('서버 응답을 해석하지 못했어. 잠시 뒤 다시 시도해 줘.')); return; }
        if(!parsed||parsed.ok!==true){
          entry.reject(new Error(parsed&&parsed.error?String(parsed.error):'서버 요청을 처리하지 못했어.'));
          return;
        }
        entry.resolve(parsed.result===undefined?null:parsed.result);
      };
      function callNative(name,args,timeout){
        return new Promise(function(resolve,reject){
          var id=uuid();
          var timer=setTimeout(function(){
            if(nativePending[id]){
              delete nativePending[id];
              reject(new Error('서버 응답이 너무 늦어. 잠시 뒤 다시 눌러 줘.'));
            }
          },timeout||18000);
          nativePending[id]={resolve:resolve,reject:reject,timer:timer};
          try{
            var body=JSON.stringify({api:'call',fn:name,args:args||[]});
            if(typeof window.IlkongNet.postT==='function') window.IlkongNet.postT(id,body,String(Math.ceil((timeout||18000)/1000)));
            else window.IlkongNet.post(id,body);
          }
          catch(e){ delete nativePending[id]; clearTimeout(timer); reject(e); }
        });
      }

      // v3.9.0: 화면이 앱스 스크립트 밖(예: GitHub Pages)에 올라가 있을 때는
      // 보이지 않는 브리지 창을 통해 기존 서버 함수를 그대로 호출한다(CORS 없이 동작).
      // PWA의 브라우저→GAS iframe fallback은 운영에서 사용하지 않는다.
      // 구형 데이터 호환은 Supabase Edge가 서버→서버로 처리하므로 공개 화면에는 배포 URL도 넣지 않는다.
      // @include modules/library.js
      // @include modules/questions.js
      // @include modules/api.js

      function errorMessage(error){
        var value=error;
        if(error&&typeof error==='object'){
          if(typeof error.message==='string'&&error.message) value=error.message;
          else if(typeof error.error==='string'&&error.error) value=error.error;
          else if(error.detail&&typeof error.detail.message==='string') value=error.detail.message;
          else {
            try { value=JSON.stringify(error); } catch(e) { value='알 수 없는 오류'; }
          }
        }
        return String(value==null?'알 수 없는 오류':value).replace(/^Exception:\s*/,'');
      }
      function toast(message,actionLabel,action,delay){
        var t=el('toast'); text(el('toastText'),message); var button=el('toastAction');
        if(actionLabel&&typeof action==='function'){ text(button,actionLabel); show(button); button.onclick=function(){ hide(t); action(); }; } else { hide(button); button.onclick=null; }
        show(t); clearTimeout(toast.timer); toast.timer=setTimeout(function(){ hide(t); },delay||3200);
      }

      // v3.7.0: 해외에 나가도(예: 비엔나 여행) 기록 날짜·시각이 한국 기준으로 일관되게 남는다.
      var KST_OFFSET_MIN=9*60;
      function toKst(value){
        var d=value instanceof Date?value:new Date(value);
        if(isNaN(d.getTime())) return null;
        return new Date(d.getTime()+(KST_OFFSET_MIN+d.getTimezoneOffset())*60000);
      }
      function kstNow(){ return toKst(new Date()); }
      function pad2(n){ return ('0'+n).slice(-2); }
      function kstDateString(value){
        var d=toKst(value||new Date());
        if(!d) return '';
        return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate());
      }
      function today(){ return kstDateString(new Date()); }
      function uuid(){
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(c){
          var r=Math.random()*16|0;
          var v=c==='x'?r:(r&3|8);
          return v.toString(16);
        });
      }
      function escapeHtml(value){
        return String(value==null?'':value).replace(/[&<>"']/g,function(c){
          return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
        });
      }

      if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
      else boot();
    })();
  
