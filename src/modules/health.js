      var SUPPLEMENT_OPTIONS=['엽산','철분','비타민D','칼슘','오메가3','유산균'];
      var healthState={logs:[],startWeight:0,heightCm:0,bmi:0,gainRange:null,picked:[],loaded:false};

      function openHealthSheet(){
        openOverlaySheet('healthSheet');
        var dateInput=el('healthDate');
        if(dateInput&&!dateInput.value) dateInput.value=today();
        renderSupplementPills();
        loadHealthLogs();
      }

      function loadHealthLogs(){
        if(!state.session) return;
        callApi('apiGetHealthLogsV470',[state.session.token],20000).then(unwrap).then(function(data){
          healthState.logs=(data&&data.logs)||[];
          healthState.startWeight=Number(data&&data.startWeight)||0;
          healthState.heightCm=Number(data&&data.heightCm)||0;
          healthState.bmi=Number(data&&data.bmi)||0;
          healthState.gainRange=(data&&data.gainRange)||null;
          healthState.birthPlan=String((data&&data.birthPlan)||'');
          healthState.loaded=true;
          if(el('healthStartWeight')&&!el('healthStartWeight').value&&healthState.startWeight) el('healthStartWeight').value=String(healthState.startWeight);
          if(el('healthHeight')&&!el('healthHeight').value&&healthState.heightCm) el('healthHeight').value=String(healthState.heightCm);
          fillHealthFormForDate();
          renderHealthCharts();
        }).catch(function(error){ toast('건강 기록을 불러오지 못했어: '+errorMessage(error)); });
      }

      // 이미 그 날짜에 적어둔 값이 있으면 폼에 채워서 이어 쓰게 한다.
      function fillHealthFormForDate(){
        var target=String((el('healthDate')&&el('healthDate').value)||today());
        var found=null;
        healthState.logs.forEach(function(log){ if(log.date===target) found=log; });
        // 날짜별 폼은 그 날짜의 값만 표시한다. 기록이 없으면 이전 날짜 값까지 비운다.
        if(el('healthWeight')) el('healthWeight').value=found&&found.weight!=null?String(found.weight):'';
        if(el('healthSys')) el('healthSys').value=found&&found.systolic!=null?String(found.systolic):'';
        if(el('healthDia')) el('healthDia').value=found&&found.diastolic!=null?String(found.diastolic):'';
        if(el('healthMemo')) el('healthMemo').value=found&&found.memo||'';
        healthState.picked=found&&Array.isArray(found.supplements)?found.supplements.slice():[];
        renderSupplementPills();
      }

      function renderSupplementPills(){
        var box=el('healthSupplements');
        if(!box) return;
        box.innerHTML='';
        SUPPLEMENT_OPTIONS.forEach(function(name){
          var on=healthState.picked.indexOf(name)>=0;
          var pill=document.createElement('button');
          pill.type='button'; pill.className='hl-pill'+(on?' on':'');
          pill.textContent=(on?'✓ ':'')+name;
          pill.setAttribute('aria-pressed',on?'true':'false');
          pill.addEventListener('click',function(){
            var idx=healthState.picked.indexOf(name);
            if(idx>=0) healthState.picked.splice(idx,1); else healthState.picked.push(name);
            renderSupplementPills();
          });
          box.appendChild(pill);
        });
      }

      // 임신 후반 전자간증 신호를 놓치지 않도록 140/90 기준으로 알린다.
      function bloodPressureLevel(sys,dia){
        if(!sys&&!dia) return '';
        if(sys>=160||dia>=110) return 'severe';
        if(sys>=140||dia>=90) return 'high';
        if(sys>=130||dia>=85) return 'watch';
        return 'ok';
      }

      function renderHealthAlert(){
        var box=el('healthAlert');
        if(!box) return;
        var sys=Number(String((el('healthSys')&&el('healthSys').value)||'').replace(/[^0-9]/g,''))||0;
        var dia=Number(String((el('healthDia')&&el('healthDia').value)||'').replace(/[^0-9]/g,''))||0;
        var level=bloodPressureLevel(sys,dia);
        if(level==='severe'){
          box.className='labor-signal on';
          box.innerHTML='🚨 <strong>혈압이 많이 높아요 ('+sys+'/'+dia+')</strong><br>지금 바로 의료진에게 연락하세요';
        } else if(level==='high'){
          box.className='labor-signal on';
          box.innerHTML='⚠️ <strong>혈압이 높아요 ('+sys+'/'+dia+')</strong><br>140/90 이상이에요. 검진 때 꼭 이야기하고, 두통·시야 번쩍임·윗배 통증·갑작스러운 부종이 있으면 바로 연락하세요';
        } else if(level==='watch'){
          box.className='labor-signal warn';
          box.innerHTML='혈압이 조금 올라가 있어요 ('+sys+'/'+dia+') · 며칠 더 지켜봐요';
        } else {
          box.className='labor-signal hidden'; box.innerHTML='';
        }
      }

      function saveHealthLog(){
        if(!state.session) return;
        var button=el('saveHealth');
        var payload={
          date:String((el('healthDate')&&el('healthDate').value)||today()),
          weight:String((el('healthWeight')&&el('healthWeight').value)||'').replace(/[^0-9.]/g,''),
          systolic:String((el('healthSys')&&el('healthSys').value)||'').replace(/[^0-9]/g,''),
          diastolic:String((el('healthDia')&&el('healthDia').value)||'').replace(/[^0-9]/g,''),
          supplements:healthState.picked.slice(),
          memo:String((el('healthMemo')&&el('healthMemo').value)||'').trim()
        };
        if(!payload.weight&&!payload.systolic&&!payload.diastolic&&!payload.supplements.length&&!payload.memo){
          toast('기록할 내용을 하나는 넣어 줘.'); return;
        }
        if(button){ button.disabled=true; text(button,'저장 중…'); }
        callApi('apiSaveHealthLogV470',[state.session.token,payload],20000).then(unwrap).then(function(){
          toast('건강 기록을 저장했어 🩺');
          return loadHealthLogs();
        }).catch(function(error){ toast('저장하지 못했어: '+errorMessage(error)); })
        .then(function(){ if(button){ button.disabled=false; text(button,'저장'); } });
      }

      function saveHealthProfile(){
        if(!state.session) return;
        var button=el('saveHealthProfile');
        var payload={
          startWeight:String((el('healthStartWeight')&&el('healthStartWeight').value)||'').replace(/[^0-9.]/g,''),
          heightCm:String((el('healthHeight')&&el('healthHeight').value)||'').replace(/[^0-9]/g,'')
        };
        if(button){ button.disabled=true; text(button,'저장 중…'); }
        callApi('apiSaveHealthProfileV470',[state.session.token,payload],20000).then(unwrap).then(function(){
          toast('기준을 저장했어. 권장 범위를 함께 그려줄게 ⚖️');
          return loadHealthLogs();
        }).catch(function(error){ toast('저장하지 못했어: '+errorMessage(error)); })
        .then(function(){ if(button){ button.disabled=false; text(button,'기준 저장'); } });
      }

      function renderHealthCharts(){
        renderHealthAlert();
        var points=healthState.logs.filter(function(log){ return log.weight!=null; })
          .map(function(log){ return {date:log.date,value:Number(log.weight)}; });
        var box=el('healthWeightBox');
        var note=el('healthGainNote');
        if(note){
          if(healthState.gainRange&&healthState.gainRange.label&&healthState.startWeight){
            var gained=points.length?(points[points.length-1].value-healthState.startWeight):0;
            note.textContent='· 임신 전 '+healthState.startWeight+'kg('+healthState.gainRange.label+') · 권장 +'+healthState.gainRange.low+'~'+healthState.gainRange.high+'kg'
              +(points.length?(' · 지금 '+(gained>=0?'+':'')+gained.toFixed(1)+'kg'):'');
          } else { note.textContent='· 임신 전 몸무게·키를 넣으면 권장 범위도 같이 보여줘'; }
        }
        if(box){
          if(points.length<2){ box.classList.add('hidden'); }
          else { box.classList.remove('hidden'); drawHealthWeightChart(points); }
        }

        var bpBox=el('healthBpBox'), bpList=el('healthBpList');
        var bps=healthState.logs.filter(function(log){ return log.systolic!=null||log.diastolic!=null; }).slice(-10).reverse();
        if(bpBox&&bpList){
          if(!bps.length){ bpBox.classList.add('hidden'); bpList.innerHTML=''; }
          else {
            bpBox.classList.remove('hidden');
            bpList.innerHTML=bps.map(function(log){
              var level=bloodPressureLevel(Number(log.systolic||0),Number(log.diastolic||0));
              var cls=(level==='high'||level==='severe')?' high':'';
              return '<div class="bp-row'+cls+'"><span>'+escapeHtml(log.date)+'</span><span>'+escapeHtml(String(log.systolic||'-'))+' / '+escapeHtml(String(log.diastolic||'-'))+'</span><span>'+(level==='severe'?'매우 높음':level==='high'?'높음':level==='watch'?'주의':'정상')+'</span></div>';
            }).join('');
          }
        }
      }

      // 체중 선 + 권장 증가 범위 밴드를 함께 그린다.
      function drawHealthWeightChart(points){
        var canvas=el('healthWeightChart');
        if(!canvas) return;
        var ratio=window.devicePixelRatio||1;
        var w=canvas.clientWidth||300, h=170;
        canvas.width=Math.max(1,Math.round(w*ratio)); canvas.height=Math.round(h*ratio);
        var ctx=canvas.getContext('2d'); if(!ctx) return;
        ctx.setTransform(1,0,0,1,0,0); ctx.scale(ratio,ratio); ctx.clearRect(0,0,w,h);
        var styles=getComputedStyle(document.documentElement);
        var accent=(styles.getPropertyValue('--accent')||'#71806b').trim()||'#71806b';
        var muted=(styles.getPropertyValue('--muted')||'#7d746b').trim()||'#7d746b';

        var values=points.map(function(pt){ return pt.value; });
        var min=Math.min.apply(null,values), max=Math.max.apply(null,values);
        var band=null;
        if(healthState.startWeight&&healthState.gainRange&&healthState.gainRange.high){
          band={low:healthState.startWeight+Number(healthState.gainRange.low),high:healthState.startWeight+Number(healthState.gainRange.high)};
          min=Math.min(min,healthState.startWeight); max=Math.max(max,band.high);
        }
        var pad=(max-min)*0.15||1; min-=pad; max+=pad;
        var left=38,right=10,top=12,bottom=22;
        var plotW=w-left-right, plotH=h-top-bottom;
        function yOf(v){ return top+plotH-(v-min)/(max-min)*plotH; }
        function xOf(i){ return left+(points.length<2?plotW/2:plotW*i/(points.length-1)); }

        if(band){
          ctx.fillStyle='rgba(113,128,107,0.14)';
          var yHigh=yOf(band.high), yLow=yOf(band.low);
          ctx.fillRect(left,yHigh,plotW,Math.max(1,yLow-yHigh));
          ctx.strokeStyle='rgba(113,128,107,0.45)'; ctx.setLineDash([4,3]); ctx.lineWidth=1;
          ctx.beginPath(); ctx.moveTo(left,yHigh); ctx.lineTo(w-right,yHigh); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(left,yLow); ctx.lineTo(w-right,yLow); ctx.stroke();
          ctx.setLineDash([]);
        }

        ctx.font='10px sans-serif'; ctx.fillStyle=muted; ctx.strokeStyle=muted; ctx.lineWidth=0.5;
        for(var g=0;g<3;g++){
          var gv=min+(max-min)*g/2, gy=yOf(gv);
          ctx.globalAlpha=0.35; ctx.beginPath(); ctx.moveTo(left,gy); ctx.lineTo(w-right,gy); ctx.stroke(); ctx.globalAlpha=1;
          ctx.fillText(gv.toFixed(1),4,gy+3);
        }

        ctx.strokeStyle=accent; ctx.lineWidth=2; ctx.beginPath();
        points.forEach(function(pt,i){ var x=xOf(i), y=yOf(pt.value); if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); });
        ctx.stroke();
        ctx.fillStyle=accent;
        points.forEach(function(pt,i){ ctx.beginPath(); ctx.arc(xOf(i),yOf(pt.value),2.5,0,Math.PI*2); ctx.fill(); });

        ctx.fillStyle=muted;
        if(points.length){
          ctx.fillText(points[0].date.slice(5),left,h-6);
          if(points.length>1){
            var lastLabel=points[points.length-1].date.slice(5);
            ctx.fillText(lastLabel,w-right-ctx.measureText(lastLabel).width,h-6);
          }
        }
      }

      // ===== 출산 계획서 =====
      var BIRTH_PLAN_QUESTIONS=[
        {key:'pain',q:'진통 완화',opts:['무통 주사 원해요','되도록 자연스럽게','상황 보고 결정']},
        {key:'partner',q:'분만실 동반',opts:['남편 함께','상황에 따라','혼자가 편해요']},
        {key:'delivery',q:'분만 방식 선호',opts:['자연분만 희망','제왕절개 예정','의료진 판단 따름']},
        {key:'cord',q:'탯줄 자르기',opts:['아빠가 자르기','의료진에게','정하지 않음']},
        {key:'skin',q:'태어난 직후',opts:['바로 캥거루케어','닦고 나서','의료진 판단']},
        {key:'feed',q:'수유 계획',opts:['모유 먼저','분유 병행','정하지 않음']}
      ];

      function openBirthPlan(){
        openOverlaySheet('birthPlanSheet');
        if(!healthState.loaded) loadHealthLogs();
        renderBirthPlan();
      }

      function parseBirthPlan(){
        try { return JSON.parse(healthState.birthPlan||'{}')||{}; } catch(e){ return {}; }
      }

      function renderBirthPlan(){
        var box=el('birthPlanChoices');
        if(!box) return;
        var saved=parseBirthPlan();
        box.innerHTML='';
        BIRTH_PLAN_QUESTIONS.forEach(function(item){
          var wrap=document.createElement('div'); wrap.className='plan-q';
          var title=document.createElement('strong'); title.textContent=item.q;
          var opts=document.createElement('div'); opts.className='plan-opts';
          item.opts.forEach(function(opt){
            var pill=document.createElement('button');
            pill.type='button';
            pill.className='hl-pill'+(saved[item.key]===opt?' on':'');
            pill.textContent=opt;
            pill.addEventListener('click',function(){
              var current=parseBirthPlan();
              current[item.key]=(current[item.key]===opt)?'':opt;
              healthState.birthPlan=JSON.stringify(current);
              renderBirthPlan();
            });
            opts.appendChild(pill);
          });
          wrap.appendChild(title); wrap.appendChild(opts);
          box.appendChild(wrap);
        });
        var free=el('birthPlanFree');
        if(free&&document.activeElement!==free) free.value=String(saved.free||'');
      }

      function saveBirthPlanNow(){
        if(!state.session) return;
        var button=el('saveBirthPlan');
        var current=parseBirthPlan();
        current.free=String((el('birthPlanFree')&&el('birthPlanFree').value)||'').trim();
        healthState.birthPlan=JSON.stringify(current);
        if(button){ button.disabled=true; text(button,'저장 중…'); }
        callApi('apiSaveBirthPlanV470',[state.session.token,healthState.birthPlan],20000).then(unwrap).then(function(){
          toast('출산 계획서를 저장했어 📝');
        }).catch(function(error){ toast('저장하지 못했어: '+errorMessage(error)); })
        .then(function(){ if(button){ button.disabled=false; text(button,'저장'); } });
      }

      // --- 화면 테마 ---
