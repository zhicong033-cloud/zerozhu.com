export const ROLES = {
  farmer:{name:'农夫',color:'#d79f46',icon:'麦',skill:'耕作'},
  logger:{name:'伐木工',color:'#648875',icon:'木',skill:'伐木'},
  miner:{name:'矿工',color:'#8a89a4',icon:'矿',skill:'采矿'},
  artisan:{name:'工匠',color:'#c57e5e',icon:'匠',skill:'制作'},
  merchant:{name:'商人',color:'#6a91a8',icon:'商',skill:'经商'}
};
export const TRAITS = {
  kind:{name:'慷慨',detail:'会把富余粮食送给饥饿邻居',generosity:0.9,ambition:0.3,restless:0.3},
  ambitious:{name:'进取',detail:'更积极生产，也更在意税负',generosity:0.2,ambition:0.9,restless:0.5},
  cautious:{name:'谨慎',detail:'倾向储粮，迁徙前会等待更久',generosity:0.3,ambition:0.4,restless:0.1},
  sociable:{name:'合群',detail:'更容易在交易中建立信任',generosity:0.7,ambition:0.4,restless:0.3},
  restless:{name:'冒险',detail:'更快响应新矿藏，也更愿意迁徙',generosity:0.3,ambition:0.7,restless:0.9},
  hotheaded:{name:'急躁',detail:'饥饿且贫穷时更可能争抢粮食',generosity:0.1,ambition:0.8,restless:0.6}
};
export const SETTLEMENTS = [
  {id:0,name:'河湾镇',x:7,y:10,fertility:1.2,wood:120,ore:30,color:'#bf9c5e',description:'河流滋养的粮仓'},
  {id:1,name:'松林营',x:5,y:5,fertility:0.88,wood:240,ore:40,color:'#739580',description:'森林边的工匠聚落'},
  {id:2,name:'高地村',x:13,y:5,fertility:0.75,wood:80,ore:240,color:'#9292ad',description:'山脚下的矿业村落'}
];
const names=['林禾','沈砚','许青','江屿','苏麦','陈石','温宁','陆川','周穗','叶舟','顾杉','白露','宋野','程雨','方苔','何山','柳溪','季枫','唐谷','孟竹','夏萤','钟木','余星','杜衡','罗岚','贺云','陶然','莫泉','安棠','齐月'];
const migrantNames=['黎明','池夏','闻溪','桑榆','楚风','谢苓','简秋','乔松'];
const roles=['farmer','artisan','farmer','logger','farmer','miner','merchant','logger','farmer','merchant','logger','farmer','miner','farmer','artisan','miner','farmer','logger','farmer','artisan','farmer','logger','merchant','artisan','miner','farmer','artisan','farmer','farmer','merchant'];
export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const sum=(a,fn)=>a.reduce((s,x)=>s+fn(x),0);
export class Simulation {
  constructor(seed=2077) {
    this.seed=seed>>>0; this.rng=this.seed; this.day=1; this.nextId=1; this.nextEvent=1;
    this.tax=0.12; this.distribution='need'; this.treasury=60; this.moisture=0.82; this.droughtUntil=0;
    this.settlements=SETTLEMENTS.map(x=>({...x})); this.people=[]; this.events=[]; this.history=[];
    this.prices={food:1.3,wood:1.8,ore:2.2,tools:5.2}; this.alliances=[];
    this.expansion=0;this.construction=null;this.prosperityDays=0;
    this.externalCoins=0; this.departedCoins=0; this.totalTrades=0; this.totalConflicts=0; this.totalMoves=0;
    this.cooldowns={}; this.warning=false; this.ledger={produced:0,consumed:0,spoiled:0,trades:0,tax:0,aid:0,conflicts:0};
    for(let i=0;i<30;i++) this.people.push(this.makePerson(i));
    this.initialCoins=this.currency();
    this.log('founding','三十个人，一座新的岛屿','30 位居民在河湾、松林和高地安家。每人每天需要 1 份粮食，所有物资由居民持有。',this.people.map(p=>p.id));
    this.log('policy','第一条共同的约定','交易所得的 12% 进入公共金库，优先救济最贫困的居民。');
    this.record();
  }
  random(){ this.rng=(Math.imul(this.rng,1664525)+1013904223)>>>0; return this.rng/4294967296; }
  makePerson(index,immigrant=false) {
    const id=this.nextId++; const role=roles[index%roles.length];
    const home=role==='miner'?2:role==='logger'?1:role==='farmer'?(index%4===0?1:0):index%3;
    const traits=Object.keys(TRAITS),trait=traits[index%traits.length];
    const skills={}; for(const r of Object.keys(ROLES)) skills[r]=Math.round(25+this.random()*35);
    skills[role]=Math.round(55+this.random()*38);
    const p={id,name:immigrant?migrantNames[(id-31)%8]+(id>38?Math.floor((id-31)/8)+1:''):names[index],age:19+Math.floor(this.random()*37),role,trait,skills,home,
      food:5+this.random()*7,wood:role==='logger'?5:1,ore:role==='miner'?4:0,tools:0.4+this.random()*0.7,coins:10+this.random()*24,
      health:100,happiness:65+this.random()*17,stress:0,hunger:0,alive:true,present:true,relations:{},allies:[],journal:[],action:'安顿家园',reason:'在新的聚落寻找自己的位置',lastMove:-20,bornDay:this.day,profit:0};
    p.journal.push({day:this.day,text:immigrant?'带着粮食和积蓄抵达小岛。':`在${this.settlements[home].name}安家，开始担任${ROLES[role].name}。`,type:'founding'});
    return p;
  }
  get active(){return this.people.filter(p=>p.alive&&p.present);}
  get drought(){return this.droughtUntil>this.day;}
  get capacity(){return 75+this.expansion*15;}
  get season(){return ['春','夏','秋','冬'][Math.floor((this.day-1)%120/30)];}
  currency(){return this.treasury+(this.construction?.escrow||0)+sum(this.active,p=>p.coins);}
  note(p,text,type='life'){p.journal.unshift({day:this.day,text,type});p.journal=p.journal.slice(0,100);}
  log(type,title,detail='',ids=[]){ const e={id:this.nextEvent++,day:this.day,type,title,detail,ids};this.events.unshift(e);this.events=this.events.slice(0,500);return e; }
  relate(a,b,amount){a.relations[b.id]=clamp((a.relations[b.id]||0)+amount,-100,100);b.relations[a.id]=a.relations[b.id];}
  work(p){
    const s=this.settlements[p.home],trait=TRAITS[p.trait];
    const productivity=(0.72+p.skills[p.role]/100)*(1+trait.ambition*0.18)*(p.health<45?0.65:1)*(p.tools>0?1.13:1);
    p.profit=0;
    if(this.construction?.worker===p.id){
      const pay=Math.min(2,this.construction.escrow);this.construction.escrow-=pay;p.coins+=pay;p.profit+=pay;
      this.construction.remaining--;p.action='建设新岸';p.reason=`公共工程支付 ${pay.toFixed(1)} 金币工钱 · 还需 ${this.construction.remaining} 个工作日`;
      p.skills.artisan=Math.min(100,p.skills.artisan+0.05);this.note(p,`参与海岸扩建，领取 ${pay.toFixed(1)} 金币工钱。`,'construction');return;
    }
    if(p.hunger>=2 && p.role!=='farmer') {
      const output=(this.drought?0.65:1.35)*s.fertility; p.food+=output;this.ledger.produced+=output;
      p.action='采集野果';p.reason=`连续饥饿 ${p.hunger} 天，先解决温饱`;return;
    }
    if(p.role==='farmer'){
      const seasonFactor={春:1,夏:1.08,秋:1.2,冬:0.67}[this.season];
      const output=1.3*productivity*s.fertility*(this.drought?0.26:1)*seasonFactor;
      p.food+=output;this.ledger.produced+=output;p.action='耕种麦田';p.reason=`${s.name}肥力 ${s.fertility.toFixed(2)} · ${this.drought?'干旱使产出降至 26%':'按耕作技能收获'} · 今日 +${output.toFixed(1)} 粮`;
    }else if(p.role==='logger'){
      const output=Math.min(s.wood,2.2*productivity); s.wood-=output;p.wood+=output;p.action=output?'采伐林木':'寻找林木';p.reason=`林地剩余 ${s.wood.toFixed(0)} 木材 · 今日 +${output.toFixed(1)}`;
    }else if(p.role==='miner'){
      const output=Math.min(s.ore,1.7*productivity);s.ore-=output;p.ore+=output;p.action=output?'开采矿石':'勘探矿脉';p.reason=`矿藏剩余 ${s.ore.toFixed(0)} · 今日 +${output.toFixed(1)} 矿石`;
    }else if(p.role==='artisan'){
      if(p.tools>4){p.action='出售工具';p.reason='已有足够工具，等待集市买家，避免继续消耗原料';}
      else if(p.wood>=1.2&&p.ore>=0.7){p.wood-=1.2;p.ore-=0.7;const output=0.8*productivity;p.tools+=output;p.action='打造工具';p.reason=`消耗 1.2 木材、0.7 矿石 · 制成 ${output.toFixed(1)} 工具`;}
      else{p.action='采购原料';p.reason='需要至少 1.2 木材和 0.7 矿石才能制作工具';}
    }else {
      const output=(this.drought?0.4:0.9)*productivity;p.food+=output;this.ledger.produced+=output;
      p.action='往来贸易';p.reason='从富余居民处进货，再向缺粮居民出售；闲时采集食物';
    }
    p.tools=Math.max(0,p.tools-0.04);p.skills[p.role]=Math.min(100,p.skills[p.role]+0.025);
  }
  transfer(seller,buyer,resource,quantity,price) {
    if(seller.id===buyer.id)return 0;
    const n=Math.max(0,Math.min(quantity,seller[resource],buyer.coins/price));if(n<0.05)return 0;
    const gross=n*price,tax=gross*this.tax;
    seller[resource]-=n;buyer[resource]+=n;buyer.coins-=gross;seller.coins+=gross-tax;this.treasury+=tax;
    seller.profit+=gross-tax;buyer.profit-=gross;this.ledger.trades++;this.ledger.tax+=tax;this.totalTrades++;
    this.relate(seller,buyer,seller.trait==='sociable'||buyer.trait==='sociable'?8:5);
    const label={food:'粮食',wood:'木材',ore:'矿石',tools:'工具'}[resource];
    this.note(buyer,`向${seller.name}购入 ${n.toFixed(1)} ${label}，支付 ${gross.toFixed(1)} 金币。`,'trade');
    this.note(seller,`向${buyer.name}售出 ${n.toFixed(1)} ${label}，税后收入 ${(gross-tax).toFixed(1)} 金币。`,'trade');
    return n;
  }
  market(){
    const active=this.active;
    const cover=sum(active,p=>p.food)/Math.max(1,active.length);
    this.prices.food=clamp(1.1+(7-cover)*0.22,0.7,3.5);
    const order=[...active].sort((a,b)=>a.food-b.food||a.id-b.id);
    // Artisans purchase inputs; producers obtain tools only when sufficiently fed.
    for(const p of active){
      if(p.role==='artisan'&&p.coins>5&&p.tools<=4){for(const [res,want] of [['wood',2.4],['ore',1.4]]){
        if(p[res]>=want)continue;
        const seller=active.filter(q=>q.id!==p.id&&q[res]>want).sort((a,b)=>b[res]-a[res])[0];
        if(seller)this.transfer(seller,p,res,Math.min(want-p[res],(p.coins-3)/this.prices[res]),this.prices[res]);
      }}
      if(p.role!=='artisan'&&p.food>2&&p.tools<0.15&&p.coins>9){
        const seller=active.find(q=>q.role==='artisan'&&q.tools>1.2);if(seller)this.transfer(seller,p,'tools',0.8,this.prices.tools);
      }
    }
    for(const p of order){
      const target=p.role==='merchant'?6:p.trait==='cautious'?4.5:3.3;
      if(p.food>=target)continue;
      const sellers=active.filter(q=>q.id!==p.id&&q.food>(q.role==='farmer'?4:6)).sort((a,b)=>(a.home!==p.home)-(b.home!==p.home)||b.food-a.food);
      for(const q of sellers){
        const price=this.prices.food*(q.role==='merchant'?1.12:1);
        this.transfer(q,p,'food',Math.min(target-p.food,q.food-(q.role==='farmer'?3:5)),price);
        if(p.food>=target-0.01||p.coins<0.1)break;
      }
    }
  }
  distribute(){
    if(this.distribution==='reserve'||this.treasury<0.1||!this.active.length)return;
    const budget=this.treasury*0.3;
    let recipients=this.distribution==='equal'?this.active:[...this.active].sort((a,b)=>(a.coins+a.food*this.prices.food)-(b.coins+b.food*this.prices.food)).slice(0,Math.max(1,Math.ceil(this.active.length/3)));
    const share=budget/recipients.length;
    for(const p of recipients){p.coins+=share;if(share>=0.3)this.note(p,`收到公共金库${this.distribution==='equal'?'全民返还':'优先救济'} ${share.toFixed(1)} 金币。`,'policy');}
    this.treasury-=budget;this.ledger.aid=budget;
  }
  social(){
    const active=this.active;
    for(const p of active){
      if(p.food>=1)continue;
      const donor=active.filter(q=>q.id!==p.id&&q.food>4&&(q.allies.includes(p.id)||(q.home===p.home&&TRAITS[q.trait].generosity>=0.7))).sort((a,b)=>b.food-a.food)[0];
      if(donor){
        const amount=Math.min(1.5,donor.food-3);donor.food-=amount;p.food+=amount;this.relate(p,donor,12);
        this.note(p,`${donor.name}赠送了 ${amount.toFixed(1)} 粮食，帮助自己渡过短缺。`,'alliance');
        this.note(donor,`把 ${amount.toFixed(1)} 粮食赠给缺粮的${p.name}。`,'alliance');
        this.log('alliance',`${donor.name}伸出援手`,`${p.name}粮食不足，获得 ${amount.toFixed(1)} 粮食。`,[donor.id,p.id]);
      }
    }
    for(const p of active){
      for(const [id,trust] of Object.entries(p.relations)){
        const q=active.find(x=>x.id===Number(id));
        if(!q||p.id>=q.id||trust<55||p.allies.includes(q.id))continue;
        p.allies.push(q.id);q.allies.push(p.id);this.alliances.push([p.id,q.id]);
        this.log('alliance',`${p.name}与${q.name}结盟`,'持续交易与互助让双方信任达到 55，今后会优先分享富余粮食。',[p.id,q.id]);
        this.note(p,`与${q.name}结为盟友。`,'alliance');this.note(q,`与${p.name}结为盟友。`,'alliance');
      }
      if(p.food>=0.9||p.coins>=this.prices.food||p.trait!=='hotheaded'||p.stress<2)continue;
      const q=active.filter(q=>q.id!==p.id&&q.home===p.home&&q.food>3&&!p.allies.includes(q.id)).sort((a,b)=>b.food-a.food)[0];
      if(q){
        const stolen=Math.min(1.4,q.food);q.food-=stolen;p.food+=stolen;q.health=Math.max(1,q.health-5);p.health=Math.max(1,p.health-3);q.happiness-=9;this.relate(p,q,-30);
        this.ledger.conflicts++;this.totalConflicts++;p.action='争抢粮食';p.reason=`无钱买粮且压力持续，夺取${q.name}的 ${stolen.toFixed(1)} 粮食`;
        this.log('conflict',`${p.name}与${q.name}发生争执`,p.reason+'，双方受伤、信任下降。',[p.id,q.id]);
        this.note(p,p.reason+'。','conflict');this.note(q,`被${p.name}抢走 ${stolen.toFixed(1)} 粮食，健康下降 5。`,'conflict');
      }
    }
  }
  consumeAndMove(){
    for(const p of this.active){
      const eaten=Math.min(1,p.food);p.food-=eaten;this.ledger.consumed+=eaten;
      const spoiled=p.food*0.025;p.food-=spoiled;this.ledger.spoiled+=spoiled;
      if(eaten<0.95){p.hunger++;p.health-=7*(1-eaten)+2;p.stress+=1.5;}
      else{p.hunger=0;p.health=Math.min(100,p.health+1.5);p.stress=Math.max(0,p.stress-0.3);}
      const activeAllies=p.allies.filter(id=>this.people.some(q=>q.id===id&&q.alive&&q.present)).length;
      const target=clamp(55+Math.min(p.food,8)*3+Math.min(p.coins,30)*0.25+Math.min(activeAllies,5)*1.5-p.hunger*12-this.tax*TRAITS[p.trait].ambition*32-(this.drought?8:0),0,100);
      p.happiness=clamp(p.happiness*0.78+target*0.22,0,100);
      if(p.happiness<40)p.stress+=1;
      if(p.health<=0){p.alive=false;p.present=false;this.departedCoins+=p.coins;p.action='生命终止';p.reason='长期粮食不足，健康耗尽';this.note(p,p.reason+'。','death');this.log('death',`${p.name}没能熬过饥荒`,p.reason+'。其积蓄与物资退出岛内流通。',[p.id]);continue;}
      const opportunity=(s)=>p.role==='miner'?s.ore/50:p.role==='logger'?s.wood/70:s.fertility*3;
      const best=[...this.settlements].sort((a,b)=>opportunity(b)-opportunity(a))[0];
      const current=this.settlements[p.home];
      const pressure=p.stress>(7-TRAITS[p.trait].restless*4);
      const resourcePull=['miner','logger'].includes(p.role)&&opportunity(best)>opportunity(current)+2;
      if(this.day-p.lastMove>12&&best.id!==p.home&&(pressure||resourcePull)){
        const old=current.name;p.home=best.id;p.lastMove=this.day;p.stress=Math.max(0,p.stress-2);this.totalMoves++;
        p.action='迁往新聚落';p.reason=resourcePull?`${best.name}的${p.role==='miner'?'矿藏':'林木'}更充裕`:'生活压力持续，寻找更好的生计';
        this.log('migration',`${p.name}迁往${best.name}`,`离开${old}：${p.reason}。`,[p.id]);this.note(p,`从${old}迁至${best.name}：${p.reason}。`,'migration');
      }else if(p.stress>22&&p.happiness<28&&this.day-p.lastMove>18){
        p.present=false;this.departedCoins+=p.coins;this.totalMoves++;p.action='离开小岛';p.reason='长期饥饿和不满，决定到岛外寻找生活';
        this.log('migration',`${p.name}告别了小岛`,p.reason+'。',[p.id]);this.note(p,p.reason+'。','migration');
      }
    }
  }
  step(){
    this.day++;
    this.ledger={produced:0,consumed:0,spoiled:0,trades:0,tax:0,aid:0,conflicts:0};
    if(this.droughtUntil===this.day){this.moisture=0.65;this.log('nature','雨水重新回到小岛','干旱结束，耕作恢复正常季节产出。');}
    this.moisture=clamp(this.moisture+(this.drought?-0.04:this.season==='夏'?-0.018:0.014)+(this.random()-0.5)*0.018,0.08,1);
    if(!this.drought&&this.moisture<0.25){this.droughtUntil=this.day+14;this.log('nature','持续缺水引发干旱','土壤湿度跌破 25%，未来 14 天农田产出降至 26%。');}
    for(const s of this.settlements)s.wood=Math.min(s.id===1?320:180,s.wood+(this.drought?1:4));
    if(this.construction)this.construction.worker=this.active.filter(p=>p.role==='artisan'&&p.hunger<2&&p.health>30).sort((a,b)=>b.skills.artisan-a.skills.artisan)[0]?.id||null;
    for(const p of this.active)this.work(p);
    if(this.construction?.remaining===0){
      this.expansion++;this.settlements[0].fertility+=0.08;this.treasury+=this.construction.escrow;this.construction=null;
      this.log('construction',`第 ${this.expansion} 片新岸落成`,`新农田与住宅投入使用。人口容量增至 ${this.capacity} 人，河湾镇耕作肥力提升 0.08。`);
    }
    this.distribute();this.market();this.social();this.consumeAndMove();
    if(this.ledger.trades)this.log('trade',`集市完成 ${this.ledger.trades} 笔交易`,`今日粮价 ${this.prices.food.toFixed(2)} 金币；税收 ${this.ledger.tax.toFixed(1)}，公共分配 ${this.ledger.aid.toFixed(1)} 金币。`);
    const m=this.metrics();
    if(m.foodDays<2&&!this.warning){this.warning=true;this.log('crisis','粮仓响起了警钟',`存粮只够 ${m.foodDays.toFixed(1)} 天，${m.hungry} 人尚未吃饱。粮价随短缺上涨。`);}
    if(m.foodDays>4&&this.warning){this.warning=false;this.log('nature','小岛走出粮食危机',`粮食储备回升至 ${m.foodDays.toFixed(1)} 天。`);}
    this.prosperityDays=(!this.drought&&m.foodDays>=6&&m.happiness>=65&&m.hungry===0)?this.prosperityDays+1:0;
    if(this.prosperityDays>=12&&this.active.length+2<=this.capacity){
      const ids=this.arrive(2);this.prosperityDays=0;
      this.log('migration','安稳的生活，吸引了两位新邻居','连续 12 天粮食保障不少于 6 天、平均幸福不低于 65 且无人挨饿。两位旅人自发迁入，携带积蓄与口粮。',ids);
    }
    this.record();
  }
  arrive(count){const ids=[];for(let i=0;i<count;i++){const p=this.makePerson(this.people.length,true);this.people.push(p);this.externalCoins+=p.coins;ids.push(p.id);}return ids;}
  intervene(kind){
    if((this.cooldowns[kind]||0)>this.day)return {ok:false,message:`还需等待 ${this.cooldowns[kind]-this.day} 天`};
    if(kind==='drought'){
      if(this.drought)return{ok:false,message:'小岛已经处于干旱中'};
      this.droughtUntil=this.day+18;this.moisture=0.2;this.log('intervention','漫长的旱季降临','观察者施加 18 天干旱。农田产出降至 26%，森林再生放缓。');
    }else if(kind==='discovery'){
      this.settlements[1].ore+=380;this.cooldowns[kind]=this.day+12;
      this.log('intervention','松林深处，发现新矿脉','松林营新增 380 份可开采矿石。矿工会评估资源差距，决定是否迁入。');
    }else if(kind==='immigration'){
      if(this.active.length+5>this.capacity)return{ok:false,message:`岛屿承载上限为 ${this.capacity} 人，请先扩建`};
      const arriving=this.arrive(5);
      this.cooldowns[kind]=this.day+8;this.log('intervention','五位旅人抵达岸边','5 位新居民带着各自的技能、粮食和积蓄上岛。每天的粮食需求增加 5 份。',arriving);
    }else if(kind==='rain'){
      if(!this.drought&&this.moisture>=0.9)return{ok:false,message:'土壤已经足够湿润'};
      this.droughtUntil=0;this.moisture=0.95;this.cooldowns[kind]=this.day+10;this.log('intervention','一场及时雨','干旱解除，土壤湿度恢复至 95%；下一日的生产开始受益。');
    }else return {ok:false,message:'未知事件'};
    this.record(false);return {ok:true,message:'事件已施加，后续影响将随模拟演化'};
  }
  setPolicy(tax,distribution){
    if(!Number.isFinite(tax)||tax<0||tax>0.5||!['need','equal','reserve'].includes(distribution))return false;
    if(tax===this.tax&&distribution===this.distribution)return false;
    this.tax=tax;this.distribution=distribution;
    this.log('policy','共同规则发生改变',`交易税调整为 ${Math.round(tax*100)}%；分配规则：${{need:'优先救济最贫困的三分之一居民',equal:'金库每日取出 30% 平均返还',reserve:'保留全部公共储备，暂停分配'}[distribution]}。下一日开始执行。`);
    return true;
  }
  expansionCost(){const level=this.expansion+1;return{wood:10*level,ore:4*level,wages:8,total:10*level*this.prices.wood+4*level*this.prices.ore+8};}
  expand(){
    if(this.expansion>=3)return{ok:false,message:'三片新岸均已建成，小岛已达到本期扩建上限'};
    if(this.construction)return{ok:false,message:'当前扩建尚未完成'};
    const cost=this.expansionCost();
    if(this.treasury+1e-8<cost.total)return{ok:false,message:`公共金库需要 ${cost.total.toFixed(1)} 金币，可调高税收并保留公共储备`};
    for(const resource of ['wood','ore'])if(sum(this.active,p=>p[resource])<cost[resource])return{ok:false,message:`居民持有的${resource==='wood'?'木材':'矿石'}不足，需等待生产`};
    if(!this.active.some(p=>p.role==='artisan'&&p.health>30&&p.hunger<2))return{ok:false,message:'目前没有健康且吃饱的工匠可以施工'};
    // Public procurement buys real stock; material payments stay in circulation.
    for(const resource of ['wood','ore']){
      let remaining=cost[resource];
      for(const p of [...this.active].sort((a,b)=>b[resource]-a[resource])){
        const quantity=Math.min(remaining,p[resource]);if(quantity<=0)continue;
        const payment=quantity*this.prices[resource];p[resource]-=quantity;p.coins+=payment;this.treasury-=payment;remaining-=quantity;
        this.note(p,`为海岸扩建提供 ${quantity.toFixed(1)} ${resource==='wood'?'木材':'矿石'}，收到 ${payment.toFixed(1)} 金币。`,'construction');
        if(remaining<1e-8)break;
      }
    }
    this.treasury-=cost.wages;this.construction={remaining:4,total:4,escrow:cost.wages,worker:null};
    this.log('construction','海岸扩建正式动工',`购入并消耗 ${cost.wood} 木材、${cost.ore} 矿石；公共预算 ${cost.total.toFixed(1)} 金币（含 8 金币工钱）。需要 4 个工匠工作日，完工后人口容量 +15。`);
    this.record(false);return{ok:true,message:'扩建已动工；有工匠施工的四天后，新岸将出现在地图上'};
  }
  metrics(){
    const ps=this.active,n=ps.length;const food=sum(ps,p=>p.food),wealth=ps.map(p=>p.coins).sort((a,b)=>a-b),total=sum(ps,p=>p.coins);
    const gini=n&&total?sum(wealth,(v)=>v):0;
    const weighted=wealth.reduce((s,v,i)=>s+(2*(i+1)-n-1)*v,0);
    return {population:n,food,foodDays:n?food/n:0,wealth:total,treasury:this.treasury,happiness:n?sum(ps,p=>p.happiness)/n:0,
      gini:gini?weighted/(n*total):0,hungry:ps.filter(p=>p.hunger>0).length,
      alliances:this.alliances.filter(([a,b])=>ps.some(p=>p.id===a)&&ps.some(p=>p.id===b)).length,
      conflicts:this.ledger.conflicts,wood:sum(ps,p=>p.wood),ore:sum(ps,p=>p.ore),...this.ledger};
  }
  record(append=true){const m={day:this.day,...this.metrics()};if(append)this.history.push(m);else this.history[this.history.length-1]=m;this.history=this.history.slice(-180);}
}
