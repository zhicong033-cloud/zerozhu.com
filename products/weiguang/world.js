import { ROLES, SETTLEMENTS } from './simulation.js';

const noise=(x,y)=>{const v=Math.sin(x*127.1+y*311.7)*43758.5453;return v-Math.floor(v);};
const terrain=(x,y,expansion=0)=>{
  if(x<0||y<0||x>=20+expansion||y>=17+expansion||x+y<4||x+y>31+expansion*2||x-y>15||y-x>12)return 'water';
  if(x+y>31)return (x+y)%3===0?'path':'farm';
  if((x===11&&y<9)||(x===12&&y>=9&&y<12)||(x===13&&y>=12))return 'river';
  if(x>=13&&y<5)return 'rock';
  if(x>=4&&x<=9&&y>=11&&y<=13)return 'farm';
  if((y===8&&x>=3&&x<=15)||(x===7&&y>=5&&y<=12)||(y===5&&x>=4&&x<=8)||(y===6&&x>=12&&x<=15))return 'path';
  return 'grass';
};
const houses=[{x:6,y:9,type:'house',roof:'#b16f50'},{x:8,y:9,type:'hall',roof:'#6b827d'},
  {x:8,y:11,type:'house',roof:'#bc7951'},{x:5,y:10,type:'house',roof:'#c1935b'},
  {x:4,y:5,type:'house',roof:'#697e66'},{x:6,y:5,type:'house',roof:'#7c8d6c'},
  {x:5,y:6,type:'workshop',roof:'#8b775d'},{x:13,y:6,type:'house',roof:'#7c8490'},
  {x:15,y:5,type:'house',roof:'#9b8281'},{x:14,y:7,type:'workshop',roof:'#a57b66'},
  {x:6,y:13,type:'mill',roof:'#ac7760'},{x:9,y:8,type:'market',roof:'#c89959'}];

export class World {
  constructor(canvas,sim,onSelect){
    this.canvas=canvas;this.ctx=canvas.getContext('2d');this.sim=sim;this.onSelect=onSelect;
    this.selected=1;this.layer='life';this.zoom=1;this.positions=new Map();this.hits=[];this.time=0;this.paused=false;
    this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(canvas);
    canvas.addEventListener('pointermove',e=>{const hit=this.hit(e);canvas.style.cursor=hit?'pointer':'default';this.hovered=hit?.id;});
    canvas.addEventListener('pointerleave',()=>{this.hovered=null;});
    canvas.addEventListener('click',e=>{const hit=this.hit(e);if(hit)this.onSelect(hit.id);});
    this.resize();
  }
  hit(e){const r=this.canvas.getBoundingClientRect();const x=e.clientX-r.left,y=e.clientY-r.top;return [...this.hits].reverse().find(p=>Math.hypot(p.sx-x,p.sy-y)<14);}
  resize(){const r=this.canvas.getBoundingClientRect();this.width=r.width;this.height=r.height;const dpr=Math.min(devicePixelRatio||1,2);this.canvas.width=r.width*dpr;this.canvas.height=r.height*dpr;this.ctx.setTransform(dpr,0,0,dpr,0,0);}
  reset(sim){this.sim=sim;this.positions.clear();this.selected=1;}
  project(x,y,z=0){return{x:(x-y)*21,y:(x+y)*10.5-z};}
  polygon(points,fill,stroke){const c=this.ctx;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=0.5;c.stroke();}}
  ellipse(x,y,rx,ry,fill){const c=this.ctx;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();}
  line(x1,y1,x2,y2,color,width=1){const c=this.ctx;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.strokeStyle=color;c.lineWidth=width;c.stroke();}
  tile(x,y,fill){const p=this.project(x,y);this.polygon([[p.x,p.y],[p.x+21,p.y+10.5],[p.x,p.y+21],[p.x-21,p.y+10.5]],fill);}
  tree(x,y,size=1){const p=this.project(x,y);const c=this.ctx;c.save();c.translate(p.x,p.y);c.scale(size,size);
    this.ellipse(5,7,12,5,'#325a4225');c.fillStyle='#796c4d';c.fillRect(-2,-11,4,16);
    this.polygon([[-14,-8],[0,-35],[14,-8],[0,-1]],'#426e58');this.polygon([[0,-35],[14,-8],[0,-1]],'#355b49');
    this.polygon([[-11,-20],[0,-43],[11,-20],[0,-14]],'#63876b');this.polygon([[0,-43],[11,-20],[0,-14]],'#4c755d');
    this.polygon([[-7,-31],[0,-49],[7,-31],[0,-26]],'#729276');c.restore();
  }
  rock(x,y,size=1){const p=this.project(x,y);const c=this.ctx;c.save();c.translate(p.x,p.y);c.scale(size,size);
    this.polygon([[-12,4],[-10,-5],[-2,-12],[10,-6],[14,3],[1,9]],'#939a8c');this.polygon([[-10,-5],[-2,-12],[10,-6],[0,0]],'#c0c3ac');this.polygon([[0,0],[10,-6],[14,3],[1,9]],'#7b887c');c.restore();
  }
  mountain(x,y,scale=1){const p=this.project(x,y);const c=this.ctx;c.save();c.translate(p.x,p.y);c.scale(scale,scale);
    this.polygon([[-44,7],[-4,-66],[40,7],[7,23]],'#a2aa9b');this.polygon([[-4,-66],[40,7],[7,23],[1,-26]],'#7e8f83');
    this.polygon([[-4,-66],[-20,-37],[-9,-41],[0,-29],[7,-43],[17,-30]],'#ebeade');this.polygon([[-4,-66],[7,-43],[17,-30],[0,-29]],'#d5dbcc');c.restore();
  }
  house(h){const p=this.project(h.x,h.y);const c=this.ctx;c.save();c.translate(p.x,p.y);
    if(h.type==='market'){
      this.ellipse(7,8,22,8,'#394b3c20');c.fillStyle='#8e7454';c.fillRect(-14,-16,2,25);c.fillRect(15,-16,2,25);
      this.polygon([[-18,-20],[1,-29],[21,-19],[1,-9]],h.roof);this.polygon([[-18,-20],[1,-10],[1,-4],[-18,-14]],'#e0bf7e');
      for(let i=0;i<3;i++)this.polygon([[-17+i*6,-19+i*3],[-14+i*6,-17+i*3],[-14+i*6,-11+i*3],[-17+i*6,-13+i*3]],'#f1dec0');
      this.polygon([[-14,1],[1,-6],[17,2],[1,9]],'#9d7652');this.ellipse(-3,1,3,2,'#dbb552');this.ellipse(7,2,3,2,'#b87955');c.restore();return;
    }
    const large=h.type==='hall',w=large?22:17,height=large?30:22;
    this.ellipse(8,10,w+8,9,'#394b3c22');
    this.polygon([[-w,-height], [0,-height+8],[0,12],[-w,3]],'#e9dabc');
    this.polygon([[0,-height+8],[w,-height],[w,3],[0,12]],'#cbbb9d');
    this.polygon([[-w-4,-height],[-2,-height-20],[w+4,-height],[0,-height+11]],h.roof);
    this.polygon([[-w-4,-height],[-2,-height-20],[0,-height+11]],'#ffffff18');
    this.polygon([[0,-height+11],[w+4,-height],[w+4,-height+4],[0,-height+15]],'#564d453b');
    this.polygon([[4,-6],[11,-10],[11,6],[4,9]],'#6f6955');
    this.polygon([[-12,-12],[-6,-9],[-6,-3],[-12,-6]],'#8eaa9c');this.line(-9,-10,-9,-4,'#f0e4c6');
    if(large){c.fillStyle='#d1c5a9';c.fillRect(-3,-height-40,6,24);this.polygon([[-7,-height-39],[0,-height-49],[7,-height-39]],'#6b827d');this.ellipse(0,-height-32,2,2,'#526450');}
    if(h.type==='mill'){
      c.fillStyle='#ddd1b3';c.fillRect(-5,-57,10,24);this.polygon([[-8,-56],[0,-65],[8,-56]],h.roof);
      c.save();c.translate(0,-45);c.rotate(this.time*0.32);for(let i=0;i<4;i++){c.rotate(Math.PI/2);this.line(0,0,0,-24,'#857960',2);this.polygon([[0,-8],[7,-8],[7,-23],[0,-24]],'#f1e8cd');}this.ellipse(0,0,2.5,2.5,'#a18c64');c.restore();
    }
    if(h.type==='workshop'){
      c.fillStyle='#9a907d';c.fillRect(7,-40,5,20);
      for(let i=0;i<3;i++){const phase=(this.time*0.5+i/3)%1;this.ellipse(10+Math.sin(phase*5)*4,-41-phase*22,3+phase*4,3+phase*3,`rgba(248,246,231,${(1-phase)*0.65})`);}
    }
    c.restore();
  }
  target(p){
    const s=this.sim.settlements[p.home];const k=noise(p.id,this.sim.day);
    if(p.action==='迁往新聚落')return{x:s.x,y:s.y};
    const base=p.role==='farmer'?{x:s.id===0?6.5:s.x+1,y:s.id===0?12:s.y+2}:p.role==='miner'?{x:s.x+1,y:s.y-1}:p.role==='logger'?{x:s.x-1,y:s.y-1}:{x:s.x+1,y:s.y+0.5};
    return{x:base.x+(k-0.5)*3.5,y:base.y+(noise(this.sim.day,p.id)-0.5)*2.2};
  }
  person(p,pos){const c=this.ctx;const t=this.time;const isSelected=p.id===this.selected;const color=ROLES[p.role].color;const xy=this.project(pos.x,pos.y);c.save();c.translate(xy.x,xy.y);
    this.ellipse(1,3,5,2.5,'#29423340');
    if(isSelected){this.ellipse(0,2,10+Math.sin(t*3),5,'#f7f1dbb0');c.beginPath();c.ellipse(0,2,11,5,0,0,Math.PI*2);c.strokeStyle='#54765c';c.lineWidth=1.5;c.stroke();}
    const walk=Math.sin(t*7+p.id)*1.5;
    this.line(-1,0,-2+walk,4,'#4c554a',1.8);this.line(2,0,3-walk,4,'#4c554a',1.8);
    c.fillStyle=color;c.fillRect(-3,-7,6,8);this.line(-3,-6,-5,-2+walk,color,2);this.line(3,-6,5,-3-walk,color,2);
    this.ellipse(0,-10,3.3,3.8,'#e7c8a0');this.ellipse(0,-12.5,3.3,1.6,'#655948');
    if(p.role==='farmer'){this.ellipse(0,-12.5,5.4,1.6,'#d9b46a');this.ellipse(0,-13.8,2.8,2,'#d9b46a');}
    if(p.role==='miner'){this.line(6,-1,6,-12,'#7a6c54',1);this.line(2,-12,9,-10,'#9ca8a0',2);}
    if(p.hunger>0){this.ellipse(7,-19,4,4,'#c16a4f');c.fillStyle='#fff';c.font='bold 6px sans-serif';c.textAlign='center';c.fillText('!',7,-17);}
    if(isSelected){this.polygon([[-3,-25],[3,-25],[0,-20]],'#456853');}
    c.restore();
    this.hits.push({id:p.id,sx:this.originX+xy.x*this.scale,sy:this.originY+(xy.y-7)*this.scale});
    if(isSelected||p.id===this.hovered)this.label(p.name,xy.x,xy.y-39,isSelected?'#456853':'#fbf6e9',isSelected?'#fff8e5':'#3e5948',10);
  }
  label(text,x,y,bg='#fbf7ed',fg='#5c6555',size=11){const c=this.ctx;c.save();c.font=`600 ${size}px -apple-system, sans-serif`;const w=c.measureText(text).width+18;c.fillStyle=bg;c.beginPath();c.roundRect(x-w/2,y-10,w,21,6);c.fill();c.fillStyle=fg;c.textAlign='center';c.textBaseline='middle';c.fillText(text,x,y+1);c.restore();}
  draw(delta){
    if(!this.paused)this.time+=Math.min(delta,0.05);
    const c=this.ctx,w=this.width,h=this.height;if(!w||!h)return;
    c.clearRect(0,0,w,h);c.fillStyle=this.sim.drought?'#dce4d2':'#dfebe4';c.fillRect(0,0,w,h);
    // Very quiet water currents across the full scene.
    for(let i=0;i<70;i++){const x=noise(i,7)*w,y=noise(i,19)*h;const alpha=0.1+Math.sin(this.time*0.7+i)*0.06;this.line(x,y,x+10+noise(i,3)*18,y,`rgba(83,137,135,${alpha})`);}
    const level=this.sim.expansion||0;
    this.scale=Math.min(w/(860+level*40),h/(505+level*22))*this.zoom;this.originX=w/2-25*this.scale;this.originY=(h-(365+level*21)*this.scale)/2-10*this.scale;
    c.save();c.translate(this.originX,this.originY);c.scale(this.scale,this.scale);
    this.ellipse(35,218,337,153,'#83a69a12');
    for(let depth=0;depth<38+level*2;depth++)for(let x=0;x<20+level;x++){
      const y=depth-x;if(y<0||y>=17+level)continue;const t=terrain(x,y,level);if(t==='water')continue;const p=this.project(x,y);
      if(terrain(x+1,y,level)==='water'||terrain(x,y+1,level)==='water'){
        this.polygon([[p.x-21,p.y+10],[p.x,p.y+21],[p.x+21,p.y+10],[p.x+21,p.y+20],[p.x,p.y+32],[p.x-21,p.y+21]],'#baa986');
        this.polygon([[p.x-21,p.y+10],[p.x,p.y+21],[p.x+21,p.y+10],[p.x+21,p.y+14],[p.x,p.y+26],[p.x-21,p.y+15]],'#d9caa5');
      }
      const grass=this.sim.drought?['#c9c195','#c1bb8c','#d0c89e','#bdbb8a']:['#abc49b','#b5cba1','#b1c59b','#a4bd94'];
      const fill=t==='river'?'#7eb6b5':t==='path'?'#d3c7a6':t==='rock'?'#a9b3a0':t==='farm'?(this.sim.drought?'#bd9d70':'#c8b873'):grass[Math.floor(noise(x,y)*4)];
      this.tile(x,y,fill);
      if(t==='river'){this.line(p.x-7,p.y+12,p.x+6,p.y+12,'#b4d4c8',1);if(y===8){this.polygon([[p.x-24,p.y+7],[p.x,p.y-4],[p.x+26,p.y+9],[p.x+2,p.y+21]],'#b9a07a');for(let i=0;i<6;i++)this.line(p.x-20+i*7,p.y+8-i*0.5,p.x+1+i*4,p.y+18-i*1.8,'#8c795e',1);}}
      if(t==='farm'){for(let j=0;j<4;j++){this.line(p.x-14+j*6,p.y+10+j*3,p.x-1+j*6,p.y+4+j*3,'#a18e54',1);if(!this.sim.drought){for(let k=0;k<3;k++){const xx=p.x-11+j*6+k*3,yy=p.y+10+j*3-k*1.5;this.line(xx,yy,xx,yy-4,'#e6d291',1.2);}}}}
      if(t==='grass'&&noise(x+3,y)>0.65){this.line(p.x+2,p.y+11,p.x+1,p.y+8,'#7e9d7480');this.line(p.x+2,p.y+11,p.x+4,p.y+8,'#7e9d7480');}
    }
    const objects=[];
    for(let x=1;x<19;x++)for(let y=1;y<16;y++){
      if(terrain(x,y)!=='grass'||houses.some(h=>Math.abs(h.x-x)<1.4&&Math.abs(h.y-y)<1.3))continue;
      if((x<8&&y<7&&noise(x,y)>0.2)||(x>14&&y>8&&noise(x,y)>0.3)||(y>14&&noise(x,y)>0.5))objects.push({depth:x+y,draw:()=>this.tree(x+0.3,y+0.5,0.65+noise(y,x)*0.4)});
      else if(noise(x,y)>0.93)objects.push({depth:x+y,draw:()=>this.rock(x+0.4,y+0.4,0.55)});
    }
    for(const [x,y,s] of [[14,2,0.8],[16,2,1.1],[17,3,0.9],[14,4,0.5]])objects.push({depth:x+y,draw:()=>this.mountain(x,y,s)});
    for(const house of houses)objects.push({depth:house.x+house.y+0.2,draw:()=>this.house(house)});
    for(let i=1;i<=level;i++)objects.push({depth:31+i,draw:()=>this.house({x:17+i,y:14,type:'house',roof:'#88a082'})});
    this.hits=[];
    for(const p of this.sim.active){const target=this.target(p);let pos=this.positions.get(p.id);if(!pos){pos={...target};this.positions.set(p.id,pos);}if(!this.paused){const speed=Math.min(1,delta*1.5);pos.x+=(target.x-pos.x)*speed;pos.y+=(target.y-pos.y)*speed;}
      objects.push({depth:pos.x+pos.y+0.3,draw:()=>this.person(p,pos)});
    }
    if(this.layer==='relations'){
      for(const [a,b] of this.sim.alliances){const p=this.positions.get(a),q=this.positions.get(b);if(!p||!q||!this.sim.active.some(x=>x.id===a)||!this.sim.active.some(x=>x.id===b))continue;const pp=this.project(p.x,p.y),qq=this.project(q.x,q.y);c.setLineDash([3,4]);this.line(pp.x,pp.y-8,qq.x,qq.y-8,'#64806090',1);c.setLineDash([]);}
    }
    objects.sort((a,b)=>a.depth-b.depth).forEach(o=>o.draw());
    for(const s of this.sim.settlements){const p=this.project(s.x,s.y);const count=this.sim.active.filter(x=>x.home===s.id).length;
      this.label(this.layer==='resources'?`${s.name} · 木 ${Math.round(s.wood)} / 矿 ${Math.round(s.ore)}`:`${s.name}  ${count}`,p.x,p.y+(s.id===0?60:-63),'#fbf7eced','#57644e',10);
    }
    if(level){const p=this.project(17+level,15);this.label(`新岸 · 第 ${level} 期`,p.x,p.y+25,'#f5f7e8ed','#718365',10);}
    if(this.sim.construction){const p=this.project(18,14);this.label(`新岸建设中 · ${4-this.sim.construction.remaining}/4`,p.x,p.y,'#f6f0dce8','#aa8a53',10);}
    // A little sailboat at the edge of the inhabited world.
    c.save();c.translate(-265,218+Math.sin(this.time)*2);this.polygon([[-15,3],[15,3],[9,10],[-8,10]],'#9b8769');this.line(0,4,0,-24,'#88745d',1.5);this.polygon([[2,-23],[2,1],[17,1]],'#f6f0d8');this.polygon([[-2,-20],[-2,0],[-12,0]],'#e1d7bb');c.restore();
    c.restore();
  }
}
