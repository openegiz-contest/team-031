const $=id=>document.getElementById(id);let scenario='normal',frame=0;const trucks=['TR-101','TR-102','TR-103','TR-104'];const params={normal:{name:'Қалыпты жұмыс',active:4,cycle:16,desc:'Барлық техника жұмыс істеп тұр.'},breakdown:{name:'Самосвал істен шықты',active:3,cycle:16,desc:'TR-104 тоқтады. Қалған үш самосвал өндірісті жалғастырады.'},road:{name:'Жол жабылды',active:4,cycle:23,desc:'Негізгі жол жабылды: айналма жол цикл уақытын арттырады.'},rain:{name:'Қатты жаңбыр',active:4,cycle:21,desc:'Ылғал жолда қозғалыс баяулайды, цикл уақыты ұзарады.'}};const rate=s=>s.active*55*60/s.cycle*.85;function render(){const s=params[scenario],base=rate(params.normal),r=rate(s);$('rate').textContent=Math.round(r).toLocaleString('kk-KZ');/* Самосвал саны LIVE API арқылы жаңартылады */$('cycle').textContent=s.cycle;$('shift').textContent=Math.round(r*8).toLocaleString('kk-KZ');$('scenarioTitle').textContent=s.name;$('explain').textContent=s.desc;let diff=(r/base-1)*100;$('difference').textContent=scenario==='normal'?'Базалық көрсеткіш':`${diff.toFixed(1)}% өнімділік өзгерісі`;document.querySelectorAll('[data-scenario]').forEach(b=>b.classList.toggle('selected',b.dataset.scenario===scenario));$('fleetBody').innerHTML=trucks.map((id,i)=>{let broken=scenario==='breakdown'&&i===3;return `<tr><td>${id}</td><td>Карьерлік самосвал</td><td>55 т</td><td class="${broken?'bad':'ok'}">${broken?'● Тоқтады':'● Жұмыста'}</td><td>${broken?'Жөндеу':'Кенді ұсатқышқа тасымалдау'}</td></tr>`}).join('')+['EX-01','EX-02'].map(id=>`<tr><td>${id}</td><td>Экскаватор</td><td>—</td><td class="ok">● Жұмыста</td><td>Кен тиеу</td></tr>`).join('')};document.querySelectorAll('[data-scenario]').forEach(b=>b.addEventListener('click',()=>{scenario=b.dataset.scenario;render()}));$('reset').onclick=()=>{scenario='normal';render()};$('export').onclick=()=>{const s=params[scenario],csv='scenario,active_trucks,cycle_min,tonnes_per_hour,shift_tonnes\n'+[scenario,s.active,s.cycle,rate(s).toFixed(2),(rate(s)*8).toFixed(2)].join(',')+'\n';const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='aurum31_metrics.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};$('clock').textContent=new Date().toLocaleString('kk-KZ');setInterval(()=>$('clock').textContent=new Date().toLocaleString('kk-KZ'),1000);const c=$('map'),ctx=c.getContext('2d');function draw(){frame++;const w=c.width,h=c.height;ctx.clearRect(0,0,w,h);ctx.fillStyle='#102035';ctx.fillRect(0,0,w,h);for(let i=0;i<7;i++){ctx.beginPath();ctx.ellipse(465,255,420-i*44,224-i*23,-.13,0,Math.PI*2);ctx.fillStyle=['#2e3c41','#374347','#47504c','#535b4f','#626550','#6f6d53','#777154'][i];ctx.fill();ctx.strokeStyle='#b8a67d55';ctx.lineWidth=3;ctx.stroke()}ctx.beginPath();ctx.ellipse(465,255,125,61,-.13,0,Math.PI*2);ctx.fillStyle='#a58c54';ctx.fill();ctx.setLineDash([12,9]);ctx.beginPath();ctx.ellipse(465,255,305,150,-.13,0,Math.PI*2);ctx.strokeStyle=scenario==='road'?'#ff706a':'#e8c779';ctx.lineWidth=5;ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#1e8f72';ctx.fillRect(235,220,30,24);ctx.fillRect(525,312,30,24);ctx.fillStyle='#c7f4d8';ctx.font='bold 14px sans-serif';ctx.fillText('EX-01',215,212);ctx.fillText('EX-02',525,355);ctx.fillStyle='#3d94d2';ctx.fillRect(807,193,75,68);ctx.fillStyle='#d9e9f8';ctx.fillText('ҰСАТҚЫШ',795,182);ctx.beginPath();ctx.moveTo(755,248);ctx.lineTo(805,225);ctx.strokeStyle='#77bbdc';ctx.lineWidth=6;ctx.stroke();for(let i=0;i<4;i++){if(scenario==='breakdown'&&i===3){ctx.fillStyle='#f36b65';ctx.fillRect(735,360,20,12);ctx.fillStyle='#fff';ctx.fillText('TR-104 ⚠',710,394);continue}const speed=window.liveTruckSpeeds?.[i] ?? 20;
const t=((window.truckPositions?.[i] ?? i/4)*Math.PI*2),x=465+305*Math.cos(t)*Math.cos(-.13)-150*Math.sin(t)*Math.sin(-.13),y=255+305*Math.cos(t)*Math.sin(-.13)+150*Math.sin(t)*Math.cos(-.13);ctx.save();ctx.translate(x,y);ctx.rotate(t+Math.PI/2);ctx.fillStyle='#f7c85a';ctx.fillRect(-13,-8,26,16);ctx.fillStyle='#222d39';ctx.fillRect(-8,-11,6,4);ctx.fillRect(5,-11,6,4);ctx.restore()}ctx.fillStyle='#e4d1a4';ctx.font='bold 19px sans-serif';ctx.fillText('AURUM-31',28,42);ctx.font='13px sans-serif';ctx.fillStyle='#a8bfd0';ctx.fillText('SYNTHETIC GOLD OPEN PIT',28,64);if(scenario==='rain'){ctx.strokeStyle='#8fb4d066';ctx.lineWidth=1;for(let i=0;i<95;i++){let x=(i*137+frame*3)%w,y=(i*73+frame*7)%h;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-7,y+17);ctx.stroke()}}requestAnimationFrame(draw)}render();draw();
async function updateLiveTrucks() {
  try {
    const response = await fetch('/api/trucks', {cache: 'no-store'});
    if (!response.ok) throw new Error('HTTP ' + response.status);

    const trucks = await response.json();
    const body = document.getElementById('fleetBody');
    if (!body) return;

    const rows = trucks.map(t => `
      <tr>
        <td>${t.id}</td>
        <td>Карьерлік самосвал</td>
        <td>${Number(t.load_tons).toFixed(1)} т</td>
        <td class="ok">● Жұмыста</td>
        <td>🚛 ${Number(t.speed_kmh).toFixed(1)} км/сағ · ⛽ ${Number(t.fuel_percent).toFixed(1)}%</td>
      </tr>
    `).join('');

    const excavators = ['EX-01', 'EX-02'].map(id => `
      <tr>
        <td>${id}</td>
        <td>Экскаватор</td>
        <td>—</td>
        <td class="ok">● Жұмыста</td>
        <td>Кен тиеу</td>
      </tr>
    `).join('');

    body.innerHTML = rows + excavators;
  } catch (error) {
    console.error('Ditto деректерін алу қатесі:', error);
  }
}

updateLiveTrucks();
setInterval(updateLiveTrucks, 5000);

window.liveTruckSpeeds = [20,20,20,20];
window.truckPositions = [0,0.25,0.5,0.75];

setInterval(() => {
  for(let i=0;i<4;i++){
    const speed=window.liveTruckSpeeds[i] || 0;
    window.truckPositions[i] =
      (window.truckPositions[i] + speed/150000) % 1;
  }
}, 50);

async function syncTruckSpeeds(){
  try{
    const response=await fetch('/api/trucks',{cache:'no-store'});
    if(!response.ok) return;
    const data=await response.json();
    window.liveTruckSpeeds=data.map(t=>Number(t.speed_kmh)||0);
  }catch(e){
    console.error('Карта телеметриясы:',e);
  }
}
syncTruckSpeeds();
setInterval(syncTruckSpeeds,5000);

// Сценарий батырмаларын Python API-мен байланыстыру
async function sendScenarioToPython(selectedScenario) {
  try {
    const response = await fetch('/api/scenario', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({scenario: selectedScenario})
    });

    if (!response.ok) {
      throw new Error('HTTP ' + response.status);
    }

    console.log('Сценарий жаңартылды:', selectedScenario);
  } catch (error) {
    console.error('Сценарийді жіберу қатесі:', error);
    alert('Сценарий серверге жіберілмеді');
  }
}

document.querySelectorAll('[data-scenario]').forEach(button => {
  button.addEventListener('click', () => {
    sendScenarioToPython(button.dataset.scenario);
  });
});

document.getElementById('reset').addEventListener('click', () => {
  sendScenarioToPython('normal');
});


async function updateLiveActiveCount() {
  try {
    const response = await fetch('/api/trucks');
    if (!response.ok) return;

    const trucks = await response.json();
    const active = trucks.filter(t => Number(t.speed_kmh) > 0).length;

    document.getElementById('active').textContent =
      active + '/' + trucks.length;
  } catch (error) {
    console.error('LIVE KPI қатесі:', error);
  }
}

updateLiveActiveCount();
setInterval(updateLiveActiveCount, 5000);

// AURUM-31: LIVE апат ескертуі
async function checkTruckAlerts() {
  try {
    const response = await fetch('/api/trucks');
    if (!response.ok) return;

    const trucks = await response.json();
    const stopped = trucks.filter(t => Number(t.speed_kmh) === 0);

    const alertBox = document.getElementById('truckAlert');
    const details = document.getElementById('alertDetails');

    if (!alertBox || !details) return;

    if (stopped.length > 0) {
      alertBox.style.display = 'block';
      details.textContent =
        stopped.map(t => t.id + ': 0 км/сағ').join(', ')
        + ' — Техниканы тексеру қажет!';
    } else {
      alertBox.style.display = 'none';
    }
  } catch (error) {
    console.error('Апат ескерту қатесі:', error);
  }
}

checkTruckAlerts();
setInterval(checkTruckAlerts, 5000);

// LIVE өнімділік есебі
async function updateProductionKPI() {
  try {
    const response = await fetch('/api/trucks', {cache: 'no-store'});
    if (!response.ok) return;

    const trucks = await response.json();
    const active = trucks.filter(t => Number(t.speed_kmh) > 0);

    const hourly = active.reduce(
      (sum, t) => sum + Number(t.load_tons) * 60 / 16 * 0.85,
      0
    );

    document.getElementById('rate').textContent =
      Math.round(hourly).toLocaleString('kk-KZ');

    document.getElementById('shift').textContent =
      Math.round(hourly * 8).toLocaleString('kk-KZ');

  } catch (error) {
    console.error('Өнімділік есебінің қатесі:', error);
  }
}

updateProductionKPI();
setInterval(updateProductionKPI, 5000);
