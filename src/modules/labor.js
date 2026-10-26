      var LABOR_WINDOW_MS=3600000;   // 규칙성 판단에 쓰는 최근 1시간
      var LABOR_KEEP_MS=21600000;    // 기기에 보관하는 6시간

      function laborStorageKey(){ return 'ilkong_labor_v460_'+currentUserId(); }

      function loadLaborSession(){
        try {
          var raw=storageGet(laborStorageKey());
          if(!raw) return null;
          var parsed=JSON.parse(raw);
          if(!parsed||!Array.isArray(parsed.items)) return null;
          var cutoff=Date.now()-LABOR_KEEP_MS;
          parsed.items=parsed.items.filter(function(it){ return it&&it.start&&it.start>cutoff; });
          return parsed;
        } catch(e){ return null; }
      }

      function persistLaborSession(){
        try {
          var l=state.labor;
          if(!l||!l.items.length){ storageRemove(laborStorageKey()); return; }
          storageSet(laborStorageKey(),JSON.stringify({items:l.items,requestId:l.requestId,requestSignature:l.requestSignature}));
        } catch(e){}
      }

      function clearLaborSession(){
        state.labor={items:[],requestId:'',requestSignature:'',saving:false};
        try { storageRemove(laborStorageKey()); } catch(e){}
      }

      function openLaborTimer(){
        if(state.saving) return;
        var restored=loadLaborSession();
        state.labor=restored?Object.assign({saving:false,requestId:'',requestSignature:''},restored):{items:[],requestId:'',requestSignature:'',saving:false};
        openOverlaySheet('laborTimer');
        startLaborTimer();
        renderLaborTimer();
        if(restored&&restored.items.length) toast('재던 진통을 이어서 열었어 ⏱️');
      }

      function closeLaborTimer(){
        persistLaborSession();
        stopLaborTimer();
        closeOverlaySheet('laborTimer');
      }

      function startLaborTimer(){ stopLaborTimer(); state.laborTimer=setInterval(renderLaborLive,1000); }
      function stopLaborTimer(){ if(state.laborTimer){ clearInterval(state.laborTimer); state.laborTimer=null; } }

      function laborOngoing(){
        var l=state.labor;
        if(!l||!l.items.length) return null;
        var last=l.items[l.items.length-1];
        return (last&&!last.end)?last:null;
      }

      // 한 번 누르면 시작, 다시 누르면 끝. 진통 중에는 지속시간이 실시간으로 올라간다.
      function tapLabor(){
        var l=state.labor;
        if(!l||l.saving) return;
        var now=Date.now();
        var ongoing=laborOngoing();
        if(ongoing){
          if(now-ongoing.start<1000){ toast('진통이 끝나면 다시 눌러 줘.'); return; }
          ongoing.end=now;
        } else {
          l.items.push({start:now,end:0});
        }
        if(navigator.vibrate){ try{ navigator.vibrate(ongoing?[20,40,20]:30); }catch(e){} }
        persistLaborSession();
        renderLaborTimer();
      }

      function undoLabor(){
        var l=state.labor;
        if(!l||l.saving||!l.items.length) return;
        l.items.pop();
        persistLaborSession();
        renderLaborTimer();
      }

      function resetLabor(){
        var l=state.labor;
        if(!l||l.saving) return;
        if(l.items.length&&!confirm('재던 진통을 지우고 처음부터 다시 잴까?')) return;
        clearLaborSession();
        renderLaborTimer();
      }

      function completedLabor(){
        var l=state.labor;
        return (l&&l.items?l.items:[]).filter(function(it){ return it.end&&it.end>it.start; });
      }

      // 5-1-1은 최근 1시간의 평균만으로 판정하지 않는다. 정확히 1시간을
      // 이어 잰 기록이 최근 1시간 필터에서 잘릴 수 있으므로 전체 보관 기록의
      // 마지막 연속 구간에서 각 지속 시간과 각 간격, 경과 시간을 확인한다.
      function laborSummary(){
        var done=completedLabor();
        var now=Date.now();
        var cutoff=now-LABOR_WINDOW_MS;
        var recent=done.filter(function(it){ return it.start>cutoff; });
        var gaps=[];
        for(var i=1;i<recent.length;i++) gaps.push(recent[i].start-recent[i-1].start);
        var avgGap=gaps.length?gaps.reduce(function(a,b){return a+b;},0)/gaps.length:0;
        var avgDur=recent.length?recent.reduce(function(a,it){return a+(it.end-it.start);},0)/recent.length:0;
        var span=recent.length>1?(recent[recent.length-1].start-recent[0].start):0;
        var streakStart=0, streakLast=0, streakCount=0;
        done.forEach(function(it){
          var start=Number(it.start), end=Number(it.end);
          if(!isFinite(start)||!isFinite(end)||start<now-LABOR_KEEP_MS||start>now||end>now||end-start<60000){
            streakStart=0; streakLast=0; streakCount=0;
            return;
          }
          if(!streakCount||start<=streakLast||start-streakLast>300000){
            streakStart=start; streakCount=1;
          } else streakCount++;
          streakLast=start;
        });
        // 마지막 진통 뒤 너무 오래 지난 과거 기록을 새 경보로 표시하지 않는다.
        var meets=streakCount>=2&&streakLast-streakStart>=LABOR_WINDOW_MS&&now-streakLast<=600000;
        return {recent:recent,count:recent.length,avgGap:avgGap,avgDur:avgDur,span:span,meets:meets};
      }

      function fmtClock(ms){
        var total=Math.max(0,Math.round(ms/1000));
        var m=Math.floor(total/60), sec=total%60;
        return m?(m+'분 '+(sec<10?'0':'')+sec+'초'):(sec+'초');
      }

      function renderLaborTimer(){
        var l=state.labor||{items:[],saving:false};
        var sum=laborSummary();
        text(el('laborAvgGap'),sum.avgGap?fmtClock(sum.avgGap):'–');
        text(el('laborAvgDur'),sum.avgDur?fmtClock(sum.avgDur):'–');
        text(el('laborCount'),String(sum.count));

        var signal=el('laborSignal');
        if(signal){
          if(sum.meets){
            signal.className='labor-signal on';
            signal.innerHTML='🚨 <strong>기록상 5-1-1 조건에 해당해요</strong><br>병원에 연락하고 의료진 안내를 따라 주세요';
          } else if(sum.count>=3&&sum.avgGap&&sum.avgGap<=600000){
            signal.className='labor-signal warn';
            signal.innerHTML='간격이 좁아지고 있어요 · 준비를 시작해요';
          } else {
            signal.className='labor-signal hidden';
            signal.innerHTML='';
          }
        }

        var list=el('laborList');
        if(list){
          var all=completedLabor();
          var done=all.slice(-8).reverse();
          if(!done.length){ list.innerHTML='<div class="comment-empty">아직 기록된 진통이 없어</div>'; }
          else {
            list.innerHTML=done.map(function(it){
              var idx=all.indexOf(it);
              var gap=idx>0?(it.start-all[idx-1].start):0;
              var t=new Date(it.start);
              return '<div class="labor-row"><span>'+pad2(t.getHours())+':'+pad2(t.getMinutes())+'</span>'
                +'<span>지속 '+escapeHtml(fmtClock(it.end-it.start))+'</span>'
                +'<span>'+(gap?('간격 '+escapeHtml(fmtClock(gap))):'첫 진통')+'</span></div>';
            }).join('');
          }
        }

        var undo=el('laborUndo'); if(undo) undo.disabled=!l.items.length||!!l.saving;
        var reset=el('laborReset'); if(reset) reset.disabled=!!l.saving;
        var tap=el('laborTap'); if(tap) tap.disabled=!!l.saving;
        var save=el('saveLabor');
        if(save){ save.disabled=!!l.saving; text(save,l.saving?'저장 중…':'기록 저장'); }
        renderLaborLive();
      }

      function renderLaborLive(){
        var status=el('laborStatus');
        if(!status) return;
        var ongoing=laborOngoing();
        var tap=el('laborTap');
        if(ongoing){
          text(status,'진통 중 · '+fmtClock(Date.now()-ongoing.start));
          if(tap) tap.innerHTML='진통 끝 ✋<span>끝나면 눌러 줘</span>';
          return;
        }
        if(tap) tap.innerHTML='진통 시작 ⏱️<span>끝나면 한 번 더</span>';
        var done=completedLabor();
        if(!done.length){ text(status,'진통이 시작되면 아래 큰 버튼을 눌러 줘'); return; }
        var since=Date.now()-done[done.length-1].end;
        text(status,'마지막 진통 뒤 '+fmtClock(since)+' 지났어');
      }

      function buildLaborBody(){
        var sum=laborSummary();
        var done=completedLabor();
        var lines=['진통 '+done.length+'회 기록'];
        if(sum.count){
          lines.push('최근 1시간 '+sum.count+'회 · 평균 간격 '+fmtClock(sum.avgGap)+' · 평균 지속 '+fmtClock(sum.avgDur));
          if(sum.meets) lines.push('5-1-1 조건 충족');
        }
        lines.push('');
        var tail=done.slice(-20);
        tail.forEach(function(it,i){
          var t=new Date(it.start);
          var gap=i>0?(it.start-tail[i-1].start):0;
          lines.push(pad2(t.getHours())+':'+pad2(t.getMinutes())+' · 지속 '+fmtClock(it.end-it.start)+(gap?(' · 간격 '+fmtClock(gap)):''));
        });
        return lines.join('\n');
      }

      function saveLaborRecord(){
        var l=state.labor;
        if(!l||l.saving) return;
        var done=completedLabor();
        if(!done.length){ toast('아직 끝난 진통이 없어. 시작과 끝을 눌러 줘.'); return; }
        var signature=done.length+'|'+done[0].start+'|'+done[done.length-1].end;
        if(l.requestSignature!==signature||!validClientRequestId(l.requestId)){ l.requestId=uuid(); l.requestSignature=signature; }
        persistLaborSession();
        l.saving=true;
        renderLaborTimer();
        var payload={recordDate:today(),title:'',body:buildLaborBody(),category:'진통',mood:'',imageCount:0,requestId:l.requestId};
        callApi('apiStartPostV221',[state.session.token,payload],22000)
          .then(unwrap)
          .then(function(result){
            if(!result||!result.postId) throw new Error('저장할 글 번호를 받지 못했어.');
            return callApi('apiFinishPostV221',[state.session.token,result.postId],22000);
          })
          .then(unwrap)
          .then(function(){
            clearLaborSession();
            stopLaborTimer();
            closeOverlaySheet('laborTimer');
            toast('진통 기록을 저장했어 ⏱️');
            return loadHome({source:'labor',force:true});
          })
          .catch(function(error){
            l.saving=false;
            renderLaborTimer();
            toast('저장을 끝내지 못했어. 같은 버튼을 다시 누르면 이어서 시도해: '+errorMessage(error));
          })
          .then(function(){ if(state.labor&&state.labor.saving){ state.labor.saving=false; renderLaborTimer(); } });
      }

      // --- 저장공간 정리 ---
