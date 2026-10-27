      function openSettings(){
        renderSessionInfo();
        renderOperationalHealth();
        renderNotifySettings();
        renderBirthSettings();
        renderCheckupSettings();
        renderCheckupSuggestion();
        refreshStorageReport();
        state.dialogReturnFocus=document.activeElement;
        show(el('settings'));
        el('closeSettings').focus();
      }

      function closeSettingsInner(){
        hide(el('settings'));
        restoreDialogFocus();
      }

      function closeSettings(){
        closeOverlaySheet('settings');
      }

      function renderSessionInfo(){
        if(!state.session) return;
        text(el('sessionInfo'),state.session.user.name+'으로 로그인되어 있어.');
      }
      function formatOperationalTime(value){
        var d=toKst(new Date(Number(value)||0));
        if(!d||isNaN(d.getTime())) return '';
        return (d.getMonth()+1)+'월 '+d.getDate()+'일 '+pad2(d.getHours())+':'+pad2(d.getMinutes());
      }
      function hasLocalDraft(key){
        try { return !!storageGet(key); } catch(e){ return false; }
      }
      function renderOperationalHealth(){
        var userId=currentUserId();
        var summary='화면 '+releaseVersionLine()+' · Supabase 초고속 저장 · 실시간 푸시 알림';
        var details=[];
        if(state.lastSyncAt) details.push('마지막 동기화 '+formatOperationalTime(state.lastSyncAt));
        else details.push('아직 동기화 확인 전');
        if(state.lastSyncError) details.push('마지막 확인 실패: '+state.lastSyncError);
        var drafts=[];
        if(userId&&hasLocalDraft(draftKey(userId))) drafts.push('작성 중 기록');
        if(userId&&hasLocalDraft(checkinDraftKey(userId))) drafts.push('오늘 한 줄');
        if(state.pendingRestored||state.images.length||state.saveAttempt) drafts.push('사진 포함 임시저장');
        details.push(drafts.length?('이 기기에 보관 중: '+drafts.join(' · ')):'보관 중인 임시저장 없음');
        var backupAt=userId?Number(storageGet(backupStatusKey(userId))||0):0;
        text(el('backupStatus'),backupAt?('이 기기에서 마지막 데이터 내보내기: '+formatOperationalTime(backupAt)):'이 기기에서 아직 데이터를 내보낸 적 없어');
        text(el('healthText'),summary);
        text(el('healthDetail'),details.join('\n'));
      }

      function clearLogoutReadCache(){
        // 사진 초안(pendingSaveKey)은 건드리지 않고, 로그인 없이 읽힐 수 있는
        // 홈 스냅샷과 썸네일 IDB 캐시(인덱스 밖에 남은 항목 포함)만 지운다.
        return Promise.all([
          state.imagePersistChain.catch(function(){}),
          state.homeSnapshotPersistChain.catch(function(){}),
          state.pendingPersistChain.catch(function(){})
        ]).then(function(){
          return openDb().then(function(db){
            return new Promise(function(resolve,reject){
              var tx=db.transaction(DB_STORE,'readwrite');
              var cursor=tx.objectStore(DB_STORE).openCursor();
              cursor.onsuccess=function(){
                var item=cursor.result;
                if(!item) return;
                var key=String(item.key||'');
                if(key===IMAGE_CACHE_INDEX_KEY||key.indexOf(IMAGE_CACHE_PREFIX)===0||key.indexOf('ilkong_home_snapshot_')===0) item.delete();
                item.continue();
              };
              tx.oncomplete=function(){ db.close(); resolve(true); };
              tx.onerror=function(){ db.close(); reject(tx.error||new Error('기기 캐시를 지우지 못했어.')); };
              tx.onabort=function(){ db.close(); reject(tx.error||new Error('기기 캐시 정리가 중단됐어.')); };
            });
          });
        });
      }

      function clearLogoutNativeCache(){
        state.nativeCacheCleanupWarning=false;
        if(!window.IlkongDisk) return;
        if(typeof window.IlkongDisk.clearImages!=='function'){
          // 구버전 APK는 이미 저장된 네이티브 사진 파일을 삭제할 API가 없다.
          state.nativeCacheCleanupWarning=true;
          return;
        }
        try{
          if(window.IlkongDisk.clearImages()!==true) state.nativeCacheCleanupWarning=true;
        }catch(error){ state.nativeCacheCleanupWarning=true; }
      }

      function logout(){
        if(state.logoutBusy||!state.session) return Promise.resolve(false);
        if(state.saving||state.composerClosing||state.composerMode==='edit'){
          toast('작성·수정 중인 기록을 마무리하고 로그아웃해 줘.');
          return Promise.resolve(false);
        }
        if(!confirm('이 기기에서 로그아웃할까? 웹 저장소에 내려받은 기록과 사진 캐시는 정리할게.')) return Promise.resolve(false);
        var oldUser=currentUserId(), keepDrafts=true;
        state.logoutBusy=true;
        return state.pendingPersistChain.catch(function(){}).then(function(){
          return idbGet(pendingSaveKey(oldUser));
        }).then(function(pending){
          if(currentUserId()!==oldUser) return false;
          var activeDraft=!!(String(el('postTitle').value||'').trim()||String(el('postBody').value||'').trim()||state.selectedMood||state.images.length||state.saveAttempt);
          var hasDraft=activeDraft||!!pending||hasLocalDraft(draftKey(oldUser))||hasLocalDraft(checkinDraftKey(oldUser));
          if(hasDraft&&!confirm('작성 중인 글·사진·오늘 한 줄을 이 기기에 보관할까? 같은 계정으로 다시 로그인하면 복구할 수 있지만, 공유 기기에서는 남아 있어.\n\n[확인] 보관하고 로그아웃 / [취소] 다른 선택')){
            if(!confirm('초안을 이 기기에서 삭제하고 로그아웃할까? 삭제하면 글과 첨부 사진을 복구할 수 없어.\n\n[확인] 초안 삭제 / [취소] 로그아웃 취소')) return false;
            keepDrafts=false;
          }
          if(!keepDrafts) return true;
          if(state.images.some(function(item){return !item.dataUrl;})){
            toast('보관할 수 없는 사진이 있어. 사진 처리가 끝나거나 실패한 사진을 다시 선택한 뒤 로그아웃해 줘.');
            return false;
          }
          var storedText=true;
          if(activeDraft) storedText=flushDraftSave();
          var hasActivePhotos=!!(state.images.length||state.saveAttempt);
          return (hasActivePhotos?persistPendingSave('logout'):Promise.resolve(true)).then(function(storedPhotos){
            if((activeDraft&&!storedText)||(hasActivePhotos&&!storedPhotos)){
              toast('초안을 기기에 보관하지 못했어. 로그아웃을 취소했어.');
              return false;
            }
            return true;
          });
        }).then(function(prepared){
          if(!prepared||currentUserId()!==oldUser) return false;
          return clearLogoutReadCache().then(function(){
            clearLogoutNativeCache();
            if(keepDrafts) return true;
            return idbRemove(pendingSaveKey(oldUser)).then(function(){
              storageRemove(draftKey(oldUser));
              storageRemove(checkinDraftKey(oldUser));
              return true;
            });
          }).then(function(){
            // 서버 세션도 폐기를 시도한다. 네트워크가 끊겨도 기기 로그아웃은 진행하되 경고한다.
            var oldSession=state.session;
            if(!oldSession||oldSession.supabase!==true) return true;
            return supabaseRequest({op:'logout',token:String(oldSession.token)},8000)
              .then(function(){ return true; }).catch(function(){ return false; });
          }).then(function(serverRevoked){
            return clearSession().then(function(){
              stopAutoRefresh(); resetAppStateForLogout(); hide(el('appPage')); show(el('loginPage'));
              var message=keepDrafts?'로그아웃했어. 초안은 같은 계정으로 다시 로그인하면 이어 쓸 수 있어.':'로그아웃했어. 이 기기의 초안과 기록 캐시를 정리했어.';
              if(!serverRevoked) message+=' 서버 세션 폐기를 확인하지 못했어. 보안을 위해 필요하면 PIN을 변경해 줘.';
              if(state.nativeCacheCleanupWarning) message+=' 구형 안드로이드 앱의 사진 디스크 캐시는 지우지 못했을 수 있어. 앱 업데이트 뒤 재로그인·로그아웃하거나 앱 데이터를 정리해 줘.';
              setLoginStatus(message);
              return true;
            });
          });
        }).catch(function(error){
          toast('기기 자료를 안전하게 정리하지 못해 로그아웃을 중단했어: '+errorMessage(error));
          return false;
        }).then(function(done){ state.logoutBusy=false; return done; });
      }

      function resetAppStateForLogout(){
        state.loginAttemptGeneration++;
        state.loginBusy=false;
        state.composerClosing=false;
        cancelDraftSave(true);
        if(state.searchApplyTimer){ clearTimeout(state.searchApplyTimer); state.searchApplyTimer=null; }
        state.searchApplyPending=false;
        if(state.pendingFeedRenderTimer){ clearTimeout(state.pendingFeedRenderTimer); state.pendingFeedRenderTimer=null; }
        state.pendingFeedRender=null;
        if(state.compositionTarget) state.compositionTarget.__ilkongImeComposing=false;
        clearCompositionWatchdog();
        state.imeComposing=false;
        state.commentComposing=false;
        state.compositionTarget=null;
        state.compositionSerial++;
        state.homeApplyGeneration++;
        state.pagedFeeds={};
        state.questionAnswerBusy=false;
        state.checkupBusy=false;
        hide(el('checkupNotes'));
        if(typeof resetNoteContext==='function') resetNoteContext();
        ['checkupSave','checkupClear','checkupDateInput'].forEach(function(id){if(el(id))el(id).disabled=false;});
        hide(el('settings'));
        hide(el('composer'));
        hide(el('checkin'));
        hide(el('memories'));
        hide(el('toast'));
        stopKickTimer();
        hide(el('kickCounter'));
        hide(el('laborTimer'));
        stopLaborTimer();
        state.labor=null;
        state.kick=null;
        hide(el('feedMore'));
        el('feed').innerHTML='';
        text(el('feedStatus'),'최신 기록을 불러오는 중이야…');
        show(el('feedStatus'));
        if(state.imageObserver) state.imageObserver.disconnect();
        state.home=null;
        state.homeDateKey=''; state.homeFromSnapshot=false; state.dateRefreshNeeded=false;
        hide(el('dateFreshness'));
        state.homeSummaryChecklist=[];
        state.homeSummaryChecklistAt=0;
        state.homeSummaryChecklistLoading=false;
        state.checkinMood=''; state.checkinCondition=''; state.checkinAttempt=null; state.checkinBusy=false; state.memoryMonth='';
        state.lastSyncAt=0; state.lastSyncError='';
        state.revision='';
        state.homeFingerprint='';
        state.images=[];
        state.openComments={};
        state.commentDrafts={};
        state.replyTargets={}; state.commentOperations={};
        state.engagementBusy={};
        state.commentReadMarking={};
        state.commentUnreadSeen={};
        state.pendingEngagementUpdates={};
        state.hasMore=false;
        state.nextOffset=0;
        state.loadingMore=false; state.loadingAll=false; state.loadingAllPromise=null; state.loadedCount=PAGE_SIZE;
        state.refreshing=false;
        state.refreshPromise=null;
        state.checkingUpdates=false;
        state.imageCache={};
        state.imageCacheOrder=[];
        state.imageInFlight={};
        state.imagePersistentReads={};
        state.imagePersistentKnown={};
        state.imagePersistChain=Promise.resolve();
        state.imageLoadQueue=[];
        state.imageLoadActive=0;
        state.imageLoadSerial=0;
        state.imageBatchSupport=null;
        state.imageDataApiName='';
        Object.keys(state.imageFallbackTimers||{}).forEach(function(key){ clearTimeout(state.imageFallbackTimers[key]); });
        state.imageFallbackTimers={};
        state.imageObserver=null;
        state.selectedUser='';
        state.dialogReturnFocus=null; state.composerMode='create'; state.editingPostId=''; state.editAttempt=null; state.composerBackup=null; state.searchQuery=''; state.viewFilter='ALL'; state.monthFilter=''; state.activeTab=''; state.tabViews={}; hide(el('recoveryBanner')); closePhotoViewer();
        el('searchInput').value=''; el('viewFilter').value='ALL'; el('monthFilter').value='';
        state.catFilter=''; state.rangeFrom=''; state.rangeTo=''; state.recordSegment='ALL';
        el('rangeFrom').value=''; el('rangeTo').value=''; el('libraryPeriodType').value='all';
        hide(el('monthFilterField')); hide(el('rangeFilterFields')); hide(el('libraryFilterPanel')); hide(el('libraryActiveFilters')); hide(el('rangeWarning'));
        text(el('libraryActiveFilters'),''); text(el('rangeWarning'),''); text(el('toggleLibraryFilters'),'필터');
        el('toggleLibraryFilters').setAttribute('aria-expanded','false');
        el('rangeFrom').removeAttribute('aria-invalid'); el('rangeTo').removeAttribute('aria-invalid');
        el('favoriteShortcuts').innerHTML=''; el('shortcutChoices').innerHTML='';
        resetComposerView();
        el('pin').value='';
        var buttons=document.querySelectorAll('.user-btn');
        for(var i=0;i<buttons.length;i++) buttons[i].classList.remove('active');
      }

