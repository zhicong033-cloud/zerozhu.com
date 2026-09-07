import { Simulation, ROLES, TRAITS } from './simulation.js';
import { World } from './world.js';

const paths={
  island:'M3 17 8 8l4 6 3-9 6 12M2 20h20M16 3h.01',
  people:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3a4 4 0 0 1 0 8M22 21v-2a4 4 0 0 0-3-3.87M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  book:'M4 3h7a3 3 0 0 1 3 3v15a3 3 0 0 0-3-3H4V3Zm16 0h-3a3 3 0 0 0-3 3m0 15a3 3 0 0 1 3-3h3V3',
  help:'M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3m0 3h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
  reset:'M3 10a9 9 0 1 1 2 8M3 4v6h6',
  sun:'M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  rain:'M7 15H6a4 4 0 1 1 1-7 6 6 0 0 1 11-1 4 4 0 1 1 0 8m-9 2-1 3m5-3-1 3m5-3-1 3',
  pause:'M8 5v14M16 5v14',play:'m8 4 12 8-12 8V4Z',step:'m5 5 10 7-10 7V5Zm14 0v14',
  cursor:'m4 3 7 18 3-7 7-3L4 3Z',
  sparkle:'m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Zm7-1v4m-2-2h4',
  gem:'m3 8 4-5h10l4 5-9 13L3 8Zm0 0h18M7 3l5 18 5-18',
  shuffle:'M3 6h3c5 0 7 12 12 12h3m-4-4 4 4-4 4M3 18h3c2 0 4-3 6-6s4-6 6-6h3m-4-4 4 4-4 4',
  sliders:'M4 4v4m0 5v7m8-16v9m0 5v2m8-16v2m0 5v9M1 8h6m2 5h6m2-7h6',
  coins:'M20 6c0 2-4 3-8 3S4 8 4 6s4-3 8-3 8 1 8 3Zm0 0v6c0 2-4 3-8 3s-8-1-8-3V6m16 6v6c0 2-4 3-8 3s-8-1-8-3v-6',
  wheat:'M12 21V8m0 9c-6 0-7-4-7-6 5 0 7 2 7 6Zm0-5c-5 0-6-4-6-6 4 0 6 2 6 6Zm0 5c6 0 7-4 7-6-5 0-7 2-7 6Zm0-5c5 0 6-4 6-6-4 0-6 2-6 6Zm0-4c-4-3-1-6 0-7 1 1 4 4 0 7Z',
  heart:'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',
  link:'m9 15 6-6m-7 3-3 3a4 4 0 0 0 6 6l3-3m-4-12 3-3a4 4 0 0 1 6 6l-3 3',
  trade:'M3 7h17m-4-4 4 4-4 4M21 17H4m4-4-4 4 4 4',
  chart:'M4 4v16h17M8 16v-4m5 4V7m5 9v-6',
  wood:'m12 2-7 9h3l-5 6h7v5h4v-5h7l-5-6h3L12 2Z',
  flag:'M4 22V3m0 0c6-4 10 4 16 0v11c-6 4-10-4-16 0',
  shield:'m12 2 8 3v7c0 5-8 10-8 10S4 17 4 12V5l8-3Z',
};
const icon=(name)=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name]||paths.sparkle}"/></svg>`;
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
document.querySelectorAll('[data-icon]').forEach(e=>e.innerHTML=icon(e.dataset.icon));
const STORAGE='glimmer-civilization-v1';
let sim=new Simulation(),paused=false,speed=1,selected=1,view='world',filter='all',journalExpanded=false,storageOK=true;
try{
  const saved=JSON.parse(localStorage.getItem(STORAGE)||'null');
  if(saved?.version===1&&Array.isArray(saved.sim?.people)&&saved.sim.people.length>=30&&saved.sim.people.length<=2000&&Number.isFinite(saved.sim.day)&&saved.sim.settlements?.length===3&&saved.sim.people.every(p=>ROLES[p.role]&&TRAITS[p.trait]&&Array.isArray(p.journal)&&Number.isFinite(p.coins)&&Number.isFinite(p.food))){
    Object.assign(sim,saved.sim);selected=sim.people.some(p=>p.id===saved.selected)?saved.selected:1;paused=!!saved.paused;speed=[1,3,10].includes(saved.speed)?saved.speed:1;
  }
}catch{storageOK=false;}
const world=new World($('#world'),sim,id=>selectPerson(id));
world.selected=selected;
let toastTimer;
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3400);}
function save(){try{localStorage.setItem(STORAGE,JSON.stringify({version:1,sim,selected,paused,speed}));storageOK=true;}catch{if(storageOK){toast('浏览器存储空间不足，当前进度暂未保存。');storageOK=false;}}}
function portrait(p){const color=ROLES[p.role].color;const hair=['#584d3e','#70614e','#554c43'][p.id%3];return `<svg viewBox="0 0 62 70" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="62" height="70" fill="${p.id%2?'#e8edda':'#ede7d8'}"/><path d="M0 52 15 40l10 7 17-19 20 14v28H0Z" fill="#cddbbf" opacity=".55"/><ellipse cx="32" cy="69" rx="23" ry="6" fill="#6d795b22"/><path d="M12 70V53q0-9 13-12h13q13 4 13 12v17" fill="${color}"/><path d="m27 40 5 12 6-12" fill="#eed7b7"/><path d="M21 21q0-14 12-14t12 14v13q-2 13-12 13T21 34Z" fill="#e9c5a0"/><path d="M20 28V19Q20 6 33 6q14 0 14 17l-5 3-2-10q-7 8-20 7" fill="${hair}"/><path d="M20 28q-5-3-3 4t5 5m21-9q5-3 3 4t-4 5" fill="#e9c5a0"/><path d="M27 30h1m10 0h1" stroke="#675545" stroke-width="2" stroke-linecap="round"/><path d="M31 38q3 2 5-1" fill="none" stroke="#b28a6b" stroke-linecap="round"/>${p.role==='farmer'?'<ellipse cx="32" cy="17" rx="23" ry="5" fill="#c9a262"/><path d="M19 16q1-13 13-13t14 13" fill="#d4b177"/><path d="M20 13h24" stroke="#a78c59" stroke-width="3"/>':''}${p.role==='miner'?'<path d="M18 20q0-16 15-16t16 16" fill="#909aa5"/><rect x="29" y="7" width="8" height="7" rx="2" fill="#e1cd8b"/>':''}<path d="M24 48v22m18-23v23" stroke="#ffffff33" stroke-width="3"/></svg>`;}
const format=n=>Number(n).toFixed(1);
function spark(key,color){const h=sim.history.slice(-35);if(h.length<2)return '';const values=h.map(p=>p[key]||0),min=Math.min(...values),max=Math.max(...values);const points=values.map((v,i)=>`${i/(values.length-1)*50},${21-(v-min)/Math.max(1,max-min)*17}`).join(' ');return `<svg class="metric-spark" viewBox="0 0 50 24"><polyline points="${points}" fill="none" stroke="${color}" stroke-width="1.2"/></svg>`;}
function renderMetrics(){const m=sim.metrics();const prev=sim.history.at(-2)||m;const delta=m.population-prev.population;
  const cards=[
    ['岛上居民',m.population,'人',`${delta>0?'+':''}${delta} 较昨日`,'people','population',false,'仍在岛上且存活的居民人数；初始 30 人。人口流入、离岛与死亡会改变人数。'],
    ['粮食保障',format(m.foodDays),'天',`库存 ${Math.floor(m.food)} · ${m.hungry} 人挨饿`,'wheat','foodDays',m.foodDays<2,`所有居民的私人存粮合计 ÷ 人口。今日产粮 ${format(m.produced)}，吃掉 ${format(m.consumed)}，腐损 ${format(m.spoiled)}。每人每日需求 1 粮，平均值不意味着平均分配。`],
    ['平均幸福',Math.round(m.happiness),'/ 100',m.happiness>65?'日子平稳，心有所安':m.happiness>40?'有人开始担忧明天':'生计压力正在蔓延','heart','happiness',m.happiness<40,'在岛居民满意度均值，由粮食、金币、盟友、饥饿、干旱和性格相关税负共同决定。'],
    ['盟友关系',m.alliances,'对',`今日 ${m.conflicts} 起冲突`,'link','alliances',false,'持续交易和互助积累信任，达到 55 后结盟。仅统计双方都在岛上的关系。'],
    ['今日交易',m.trades,'笔',`粮价 ${sim.prices.food.toFixed(2)} 金币`,'trade','trades',false,'今日实际完成的交易笔数；资金和货物已经在居民之间转移，税款进入公共金库。'],
    ['财富差距',Math.round(m.gini*100),'%',m.gini<.3?'金币分布较为均衡':m.gini<.5?'财富正在向少数人聚集':'贫富差距显著','chart','gini',m.gini>.5,'个人金币的基尼系数：0% 表示人人相同，越高表示分配越不均。不计实物和公共金库。']
  ];
  $('#metrics').innerHTML=cards.map(([label,value,unit,foot,ic,key,warn,title])=>`<div class="metric" title="${title}"><div class="metric-top">${label}${icon(ic)}</div><div class="metric-number ${warn?'warning':''}">${value}<small>${unit}</small></div>${spark(key,warn?'#be916c':'#9bb184')}<div class="metric-foot"><span class="${warn?'negative':''}">${foot}</span></div></div>`).join('');
}
function renderPerson(){const p=sim.people.find(p=>p.id===selected)||sim.people[0];const trait=TRAITS[p.trait];const allies=p.allies.map(id=>sim.people.find(p=>p.id===id)).filter(Boolean);const notes=p.journal.slice(0,journalExpanded?30:3);
  $('#person').innerHTML=`<div class="person-intro"><div class="portrait">${portrait(p)}</div><div><h2 class="person-name">${esc(p.name)}<span class="gender">${p.age+Math.floor((sim.day-p.bornDay)/120)} 岁</span></h2><div class="person-meta">${sim.settlements[p.home].name} · ${!p.alive?'已逝':!p.present?'已经离岛':`第 ${sim.day-p.bornDay+1} 天的生活`}</div><div class="trait-tags"><span class="role-tag">${ROLES[p.role].name}</span><span title="${trait.detail}">${trait.name}</span><span>${p.allies.length?'有自己的牵挂':'独立谋生'}</span></div></div></div><div class="person-content"><div class="person-action"><div class="action-title"><span class="live-dot"></span>${esc(p.action)}<span class="tracked-label"><i></i>正在追踪</span></div><div class="action-reason">${esc(p.reason)}</div></div><div class="person-vitals"><div><div class="vital-label">幸福感<b>${Math.round(p.happiness)} <span>/ 100</span></b></div><div class="meter"><span style="width:${p.happiness}%"></span></div></div><div class="vital-health"><div class="vital-label">健康<b>${Math.max(0,Math.round(p.health))} <span>/ 100</span></b></div><div class="meter"><span style="width:${Math.max(0,p.health)}%"></span></div></div></div><div class="mini-title">随身资源 <span>私人持有</span></div><div class="resources">${[['food','wheat','粮食'],['coins','coins','金币'],['wood','wood','木材'],['ore','gem','矿石']].map(([k,ic,n])=>`<div class="resource">${icon(ic)}<b>${format(p[k])}</b><span>${n}</span></div>`).join('')}</div><div class="mini-title">擅长的事 <span title="工具存量大于零时增产 13%，工作每日磨损 0.04">工具 ${format(p.tools)}</span></div><div class="skill-list">${Object.entries(p.skills).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([r,v])=>`<span class="skill-item">${ROLES[r].skill}<strong>${Math.round(v)}</strong></span>`).join('')}</div><div class="mini-title">他与这个世界的连接 <span>${allies.length} 位盟友</span></div><div class="relation-list">${allies.length?allies.slice(0,8).map(q=>`<button class="relation-pill" data-person="${q.id}" title="信任 ${Math.round(p.relations[q.id]||0)}">${esc(q.name)}${!q.present?' · 离岛':''}</button>`).join(''):`<span class="empty-tiny">${trait.detail}。交往会慢慢变成羁绊。</span>`}</div><div class="person-journal"><div class="mini-title">命运的足迹 <span>最近 ${Math.min(p.journal.length,journalExpanded?30:3)} 条</span></div>${notes.map(n=>`<div class="personal-note"><time>第 ${n.day} 天</time><span>${esc(n.text)}</span></div>`).join('')}${p.journal.length>3?`<button class="journal-toggle" id="toggle-journal">${journalExpanded?'收起足迹 ↑':'展开更多经历 ↓'}</button>`:''}</div></div>`;
}
const eventIcon=t=>({founding:'flag',trade:'trade',policy:'sliders',alliance:'link',conflict:'shield',migration:'people',intervention:'sparkle',nature:'rain',crisis:'wheat',death:'heart',construction:'island'}[t]||'sparkle');
function eventHTML(e,detail=true){return `<article class="timeline-row"><span class="timeline-symbol ${e.type}">${icon(eventIcon(e.type))}</span><div class="timeline-content"><div class="timeline-heading"><time>DAY ${String(e.day).padStart(2,'0')}</time><b>${esc(e.title)}</b></div><p>${esc(e.detail)}</p>${detail&&e.ids.length&&e.ids.length<10?`<div class="timeline-persons">${e.ids.slice(0,5).map(id=>{const p=sim.people.find(p=>p.id===id);return p?`<button data-person="${id}">${esc(p.name)} ↗</button>`:'';}).join('')}</div>`:''}</div></article>`;}
function renderHistory(){
  $('#event-count').textContent=sim.events.length;
  $('#chronicle').innerHTML=sim.events.slice(0,5).map(e=>eventHTML(e,false)).join('');
  const f=$('#history-filter').value;const events=sim.events.filter(e=>f==='all'||e.type===f||(f==='nature'&&['crisis','death'].includes(e.type)));
  if(view==='history')$('#full-history').innerHTML=events.length?events.slice(0,150).map(e=>eventHTML(e)).join(''):'<div class="empty-state">尚未发生这类事件。<br>文明的故事仍在展开。</div>';
}
function renderRoster(){if(view!=='people')return;const q=$('#search').value.trim().toLowerCase();const ps=sim.people.filter(p=>(filter==='all'||filter==='hungry'&&p.present&&p.hunger>0||filter==='away'&&!p.present)&&(!q||`${p.name}${ROLES[p.role].name}${sim.settlements[p.home].name}${TRAITS[p.trait].name}`.toLowerCase().includes(q)));
  $('#roster-count').textContent=ps.length;$('#roster').innerHTML=ps.length?ps.map(p=>`<button class="resident-card ${p.id===selected?'selected':''}" data-person="${p.id}"><span class="small-avatar">${portrait(p)}</span><span><b>${esc(p.name)}</b><small>${ROLES[p.role].name} · ${sim.settlements[p.home].name}</small></span><span class="resident-status">${!p.alive?'已逝':!p.present?'离岛':p.hunger?'饥饿':Math.round(p.happiness)+' 幸福'}</span></button>`).join(''):'<div class="empty-state">没有符合条件的居民。</div>';
}
function renderControls(){
  $('#date-label').textContent=`第 ${Math.floor((sim.day-1)/120)+1} 年 · ${sim.season} · 第 ${sim.day} 天`;
  $('#pause').innerHTML=icon(paused?'play':'pause');$('#pause').setAttribute('aria-label',paused?'继续模拟':'暂停模拟');$('#pause').title=paused?'继续模拟（空格键）':'暂停模拟（空格键）';
  document.querySelectorAll('[data-speed]').forEach(e=>{e.classList.toggle('active',Number(e.dataset.speed)===speed);e.setAttribute('aria-pressed',String(Number(e.dataset.speed)===speed));});
  $('#world-status').textContent=paused?'时间暂时停驻':sim.drought?`旱季 · 还剩 ${sim.droughtUntil-sim.day} 天`:sim.metrics().hungry?'有人正在挨饿':'文明正在生长';
  $('#weather-tag').textContent=`${sim.drought?'干旱 · 耕作仅余 26%':sim.season+'日 · 湿度 '+Math.round(sim.moisture*100)+'%'}${paused?' · 已暂停':''}`;
  $('#map-population').textContent=`${sim.active.length} 位居民 · 3 个聚落`;
  $('#tax').value=Math.round(sim.tax*100);$('#tax-value').innerHTML=`${Math.round(sim.tax*100)}<span>%</span>`;$('#tax').style.background=`linear-gradient(to right,#839b6e ${sim.tax*200}%,#e9eddf ${sim.tax*200}%)`;
  $('#distribution').value=sim.distribution;
  $('#policy-description').textContent={need:'每日取出金库的 30%，给予最贫困的三分之一居民。',equal:'每日取出金库的 30%，所有在岛居民平均分享。',reserve:'税款全部留在公共金库，不发放救济或返还。'}[sim.distribution];
  $('#treasury').innerHTML=`${format(sim.treasury)} <small>金币</small>`;$('#tax-summary').textContent=`今日税收 +${format(sim.ledger.tax)} · 分配 −${format(sim.ledger.aid)}`;
  document.querySelectorAll('[data-event]').forEach(e=>{const kind=e.dataset.event;const left=(sim.cooldowns[kind]||0)-sim.day;const disabled=left>0||kind==='drought'&&sim.drought||kind==='rain'&&!sim.drought&&sim.moisture>=.9||kind==='immigration'&&sim.active.length+5>sim.capacity;e.disabled=disabled;e.title=left>0?`还需等待 ${left} 天`:kind==='drought'&&sim.drought?'干旱已经生效':disabled?'当前条件无需或无法施加此事件':'立即施加事件；暂停时也可使用';});
  const cost=sim.expansionCost();
  $('#expansion-description').textContent=sim.construction?`施工 ${4-sim.construction.remaining}/4 天 · ${sim.construction.worker?'工匠正在建设':'等待健康且吃饱的工匠'} · 完工容量 +15 人`:sim.expansion>=3?`三片新岸已落成 · 容量 ${sim.capacity} 人`:`${cost.total.toFixed(1)} 公共金币 · ${cost.wood} 木材 · ${cost.ore} 矿石 · 容量 ${sim.capacity} → ${sim.capacity+15}`;
  $('#expand').disabled=!!sim.construction||sim.expansion>=3;$('#expand').innerHTML=sim.construction?'正在施工…':sim.expansion>=3?'已完成扩建':'规划扩建 <span>↗</span>';
}
function render(){renderMetrics();renderPerson();renderHistory();renderRoster();renderControls();world.paused=paused||document.hidden;world.selected=selected;}
function selectPerson(id){if(!sim.people.some(p=>p.id===id))return;selected=id;journalExpanded=false;world.selected=id;renderPerson();renderRoster();save();if(innerWidth<741)document.querySelector('.person-panel').scrollIntoView({behavior:'smooth',block:'start'});}
function setView(next){view=next;document.querySelectorAll('[data-view]').forEach(b=>{b.classList.toggle('active',b.dataset.view===next);b.setAttribute('aria-current',b.dataset.view===next?'page':'false');});$('#map-panel').classList.toggle('hidden',next!=='world');$('#roster-panel').classList.toggle('hidden',next!=='people');$('#full-history-panel').classList.toggle('hidden',next!=='history');renderRoster();renderHistory();if(next==='world')world.resize();}
let accumulated=0;
function togglePause(){paused=!paused;accumulated=0;renderControls();world.paused=paused;save();}
function nextDay(){paused=true;accumulated=0;sim.step();render();save();}
document.addEventListener('click',e=>{
  const person=e.target.closest('[data-person]');if(person){selectPerson(Number(person.dataset.person));return;}
  const close=e.target.closest('[data-close]');if(close){$('#'+close.dataset.close).close();return;}
  const nav=e.target.closest('[data-view]');if(nav){setView(nav.dataset.view);return;}
  const layer=e.target.closest('[data-layer]');if(layer){world.layer=layer.dataset.layer;document.querySelectorAll('[data-layer]').forEach(b=>{b.classList.toggle('active',b===layer);b.setAttribute('aria-pressed',String(b===layer));});if(world.layer==='relations'&&!sim.metrics().alliances)toast('当前尚无盟友关系。交易与互助会逐渐建立连接。');return;}
  const speedButton=e.target.closest('[data-speed]');if(speedButton){speed=Number(speedButton.dataset.speed);accumulated=0;renderControls();save();return;}
  const eventButton=e.target.closest('[data-event]');if(eventButton){const result=sim.intervene(eventButton.dataset.event);render();save();toast(result.message);return;}
  const filterButton=e.target.closest('[data-filter]');if(filterButton){filter=filterButton.dataset.filter;document.querySelectorAll('[data-filter]').forEach(b=>b.classList.toggle('active',b===filterButton));renderRoster();return;}
  if(e.target.closest('#toggle-journal')){journalExpanded=!journalExpanded;renderPerson();}
});
$('#pause').addEventListener('click',togglePause);$('#step').addEventListener('click',nextDay);
$('#help').addEventListener('click',()=>{if(!paused)togglePause();$('#help-dialog').showModal();});
$('#reset').addEventListener('click',()=>{if(!paused)togglePause();$('#reset-dialog').showModal();});
$('#confirm-reset').addEventListener('click',()=>{sim=new Simulation();selected=1;paused=false;speed=1;accumulated=0;journalExpanded=false;filter='all';$('#search').value='';$('#history-filter').value='all';document.querySelectorAll('[data-filter]').forEach(b=>b.classList.toggle('active',b.dataset.filter==='all'));world.reset(sim);world.zoom=1;world.layer='life';document.querySelectorAll('[data-layer]').forEach(b=>b.classList.toggle('active',b.dataset.layer==='life'));$('#reset-dialog').close();setView('world');render();save();toast('第 1 天，一切重新萌芽。');});
$('#random-person').addEventListener('click',()=>{const ps=sim.active.length?sim.active:sim.people;const i=ps.findIndex(p=>p.id===selected);selectPerson(ps[(i+1)%ps.length].id);});
$('#all-history').addEventListener('click',()=>setView('history'));
$('#expand').addEventListener('click',()=>{const result=sim.expand();render();save();toast(result.message);});
$('.brand-mark').addEventListener('click',e=>{e.preventDefault();setView('world');});
$('#search').addEventListener('input',renderRoster);$('#history-filter').addEventListener('change',renderHistory);
$('#tax').addEventListener('input',e=>{$('#tax-value').innerHTML=`${e.target.value}<span>%</span>`;e.target.style.background=`linear-gradient(to right,#839b6e ${Number(e.target.value)*2}%,#e9eddf ${Number(e.target.value)*2}%)`;});
$('#tax').addEventListener('change',e=>{sim.setPolicy(Number(e.target.value)/100,sim.distribution);renderHistory();renderControls();save();toast('交易税已调整，下一日按新税率结算。');});
$('#distribution').addEventListener('change',e=>{sim.setPolicy(sim.tax,e.target.value);renderHistory();renderControls();save();toast('分配规则已更新，下一日开始执行。');});
$('#zoom-in').addEventListener('click',()=>{world.zoom=Math.min(1.45,world.zoom+0.1);});$('#zoom-out').addEventListener('click',()=>{world.zoom=Math.max(.7,world.zoom-.1);});
document.addEventListener('keydown',e=>{if(['INPUT','SELECT','TEXTAREA','BUTTON'].includes(e.target.tagName)||document.querySelector('dialog[open]'))return;if(e.code==='Space'){e.preventDefault();togglePause();}if(e.code==='ArrowRight'){e.preventDefault();nextDay();}});
window.addEventListener('pagehide',save);
document.addEventListener('visibilitychange',()=>{accumulated=0;world.paused=paused||document.hidden;if(document.hidden)save();});
let previous=performance.now();
function frame(now){const delta=Math.min((now-previous)/1000,.1);previous=now;
  if(!paused&&!document.hidden&&!document.querySelector('dialog[open]')){accumulated+=delta*speed;if(accumulated>=2.4){accumulated-=2.4;sim.step();render();save();}}
  if(view==='world')world.draw(delta);
  requestAnimationFrame(frame);
}
render();requestAnimationFrame(frame);
if(!storageOK)toast('存档不可用，已开启新世界；本次进度会尝试重新保存。');
