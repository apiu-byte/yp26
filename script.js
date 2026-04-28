/* ============================================
   LOADER
   ============================================ */
window.addEventListener('load',()=>{
  setTimeout(()=>{
    const loader=document.getElementById('loader');
    if(loader) loader.classList.add('hide');
  },1200);
});

const prefersReducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============================================
   STARRY BACKGROUND
   ============================================ */
(function(){
  const cv=document.getElementById('stars'),ctx=cv.getContext('2d');
  let W,H,S=[];
  function resize(){W=cv.width=window.innerWidth;H=cv.height=window.innerHeight;}
  function mk(){
    S=[];
    for(let i=0;i<250;i++){
      S.push({
        x:Math.random()*W,
        y:Math.random()*H,
        r:Math.random()*1.5+.3,
        p:Math.random()*Math.PI*2,
        dp:.005+Math.random()*.012,
        color:Math.random()>.85?'255,200,220':Math.random()>.7?'240,201,122':'255,255,240'
      });
    }
  }
  function draw(){
    ctx.clearRect(0,0,W,H);
    S.forEach(s=>{
      s.p+=s.dp;
      const a=.2+.8*Math.abs(Math.sin(s.p));
      ctx.beginPath();
      ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(${s.color},${a})`;
      ctx.fill();
      
      // Glow effect for larger stars
      if(s.r>1){
        ctx.beginPath();
        ctx.arc(s.x,s.y,s.r*3,0,Math.PI*2);
        ctx.fillStyle=`rgba(${s.color},${a*.1})`;
        ctx.fill();
      }
    });
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize',()=>{resize();mk();});
  resize();mk();draw();
})();

/* ============================================
   FLOATING PETALS
   ============================================ */
(function(){
  const wrap=document.getElementById('petals');
  if(!wrap) return;
  const p=['🌸','🌺','🌼','✿','❀','🍀','🌷'];
  function drop(){
    const el=document.createElement('div');
    el.className='petal';
    el.textContent=p[Math.random()*p.length|0];
    el.style.left=Math.random()*100+'vw';
    el.style.setProperty('--drift',(Math.random()*150-75)+'px');
    const d=6+Math.random()*8;
    el.style.animationDuration=d+'s';
    el.style.animationDelay=Math.random()*-8+'s';
    el.style.fontSize=(.7+Math.random()*.8)+'rem';
    el.style.opacity=.6+Math.random()*.4;
    wrap.appendChild(el);
    setTimeout(()=>el.remove(),(d+2)*1000);
  }
  for(let i=0;i<25;i++)setTimeout(drop,Math.random()*3500);
  setInterval(drop,prefersReducedMotion?1600:700);
})();

/* ============================================
   CONTENT DATA (Editable via editor.html)
   ============================================ */
const defaultPhotos=[
  {src:'photoes/1.jpeg',caption:'Photo 1',cls:'span2'},
        {src:'photoes/2.jpeg',caption:'Photo 2',cls:'tall'},
        {src:'photoes/3.jpeg',caption:'Photo 3',cls:''},
        {src:'photoes/4.jpeg',caption:'Photo 4',cls:''},
        {src:'photoes/5.jpeg',caption:'Photo 5',cls:'span2'},
        {src:'photoes/6.png',caption:'Photo 6',cls:''},
        {src:'photoes/7.jpeg',caption:'Photo 7',cls:'span2'}
      ];

const defaultNote=`Some distances are measured in miles, but ours has been measured in memories, calls, and countless moments of missing you. Yet I still can’t forget the day I left you at the airport — that moment somehow feels both distant and like yesterday.

I may not always be good at expressing what I feel, but you’re missed in more ways than I can say. I often find myself smiling at the little things we used to do — pani puri dates 😅, late-night Swiggy cravings, fighting for that one spot on the sofa, and all those ordinary moments that quietly became my favorite memories.

Maybe we still have to wait a little longer before we meet, but time has done its job so strangely well — it has flown by as if we’re still just having those everyday conversations in the living room. In a way, it feels like we’re still sitting in that same living room together… the only thing that has changed is the country between us.

Now this distance has almost become part of normal routine, just woven into daily life. I still do all the same things, but there’s always this small emptiness, this feeling that something is missing. That never really goes away for me.

And maybe, even my old “I wanted to live alone” thought has quietly become part of the list of things I once wanted, but don’t feel the same about anymore.

Hopefully 🤞 we’ll meet soon. Until then, stay happy and enjoy your day. 😊`;
const defaultSong='song.mp3';

function getStoredContent(){
  try{
    const raw=localStorage.getItem('birthdayContent');
    if(!raw) return {note:defaultNote,photos:defaultPhotos,song:defaultSong};
    const parsed=JSON.parse(raw);
    const safePhotos=Array.isArray(parsed.photos)
      ? parsed.photos
          .filter(p=>p&&typeof p.src==='string'&&p.src.trim())
          .map((p,i)=>({
            src:p.src.trim(),
            caption:typeof p.caption==='string'&&p.caption.trim()?p.caption.trim():`Photo ${i+1}`,
            cls:typeof p.cls==='string'?p.cls:''
          }))
      : defaultPhotos;
    return {
      note:typeof parsed.note==='string'&&parsed.note.trim()?parsed.note:defaultNote,
      photos:safePhotos.length?safePhotos:defaultPhotos,
      song:typeof parsed.song==='string'&&parsed.song.trim()?parsed.song.trim():defaultSong
    };
  }catch(e){
    return {note:defaultNote,photos:defaultPhotos,song:defaultSong};
  }
}

const contentData=getStoredContent();
const photos=contentData.photos;

/* ============================================
   BUILD PHOTO GRID
   ============================================ */
(function(){
  const grid=document.getElementById('photo-grid');
  if(!grid) return;

  const fallbackPhoto=(i)=>`https://picsum.photos/seed/birthday-${i+1}/900/700`;

  photos.forEach((ph,i)=>{
    const card=document.createElement('div');
    card.className='photo-card'+(ph.cls?' '+ph.cls:'');
    card.style.animationDelay=(i*.08)+'s';
    const img=document.createElement('img');
    img.src=ph.src;
    img.alt=ph.caption;
    img.loading='lazy';
    img.onerror=()=>{
      if(img.dataset.fallbackApplied==='1') return;
      img.dataset.fallbackApplied='1';
      img.src=fallbackPhoto(i);
    };
    card.appendChild(img);
    card.addEventListener('click',()=>openLb(i));
    grid.appendChild(card);
  });
})();

/* ============================================
   LIGHTBOX
   ============================================ */
let lbIdx=0;

function openLb(i){
  lbIdx=i;
  const lb=document.getElementById('lightbox');
  const img=document.getElementById('lb-img');
  if(!lb||!img) return;
  img.style.opacity='0';
  img.src=photos[i].src;
  document.getElementById('lb-caption').textContent=photos[i].caption;
  lb.classList.add('open');
  setTimeout(()=>{img.style.opacity='1';},80);
}

function closeLb(){
  const lb=document.getElementById('lightbox');
  if(lb) lb.classList.remove('open');
}

function lbNav(dir){
  lbIdx=(lbIdx+dir+photos.length)%photos.length;
  const img=document.getElementById('lb-img');
  if(!img) return;
  img.style.opacity='0';
  img.style.transform='scale(.85)';
  setTimeout(()=>{
    img.src=photos[lbIdx].src;
    document.getElementById('lb-caption').textContent=photos[lbIdx].caption;
    img.style.opacity='1';
    img.style.transform='scale(1)';
  },220);
}

const lightbox=document.getElementById('lightbox');
if(lightbox){
  lightbox.addEventListener('click',function(e){
    if(e.target===this)closeLb();
  });
}

document.addEventListener('keydown',e=>{
  const lb=document.getElementById('lightbox');
  if(!lb.classList.contains('open'))return;
  if(e.key==='Escape')closeLb();
  if(e.key==='ArrowLeft')lbNav(-1);
  if(e.key==='ArrowRight')lbNav(1);
});

/* ============================================
   ENVELOPE INTERACTION
   ============================================ */
let opened=false;
let sparkleTimer=null;

function openEnvelope(){
  if(opened)return;
  opened=true;
  document.getElementById('hint').style.opacity='0';
  const ew=document.getElementById('envelope-wrap');
  ew.style.animation='none';
  ew.classList.add('env-opened');
  
  playSurpriseSong();

  // Play subtle sound effect (optional)
  if(!prefersReducedMotion) playOpenSound();
  
  setTimeout(()=>{
    spawnConfetti();
    spawnBalloons();
    triggerSparkleShower();
    showFullLetter();
  },2000);
}

function showFullLetter(){
  document.getElementById('scene').classList.add('hide');
  const fl=document.getElementById('full-letter');
  fl.classList.add('visible');
  const cb=document.getElementById('close-btn');
  cb.classList.add('show');
  cb.style.display='flex';
  
  setTimeout(()=>{
    startTypewriter();
  },800);
  
  const sigLine=document.getElementById('sig-date');
  if(sigLine) sigLine.textContent='Always with you, no matter the distance ✨';
}

function closeLetter(){
  document.getElementById('full-letter').classList.remove('visible');
  document.getElementById('close-btn').classList.remove('show');
  stopSparkleShower();
  setTimeout(()=>{
    document.getElementById('close-btn').style.display='none';
    document.getElementById('scene').classList.remove('hide');
  },500);
}

function playSurpriseSong(){
  const song=document.getElementById('surprise-song');
  if(!song) return;
  song.src=contentData.song || defaultSong;
  song.load();
  song.volume=.55;
  song.play().catch(()=>{});
}

/* ============================================
   SOUND EFFECT (Optional - using Web Audio API)
   ============================================ */
function playOpenSound(){
  try{
    const ctx=new (window.AudioContext||window.webkitAudioContext)();
    const osc=ctx.createOscillator();
    const gain=ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(800,ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400,ctx.currentTime+.3);
    gain.gain.setValueAtTime(.1,ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime+.5);
  }catch(e){}
}

/* ============================================
   CONFETTI
   ============================================ */
function spawnConfetti(){
  const cols=['#d4a853','#c06080','#7a3050','#f0c97a','#e8a0b8','#5b8dd9','#6dbb6d','#ff8c60','#ffd700','#ff69b4'];
  const pieces=prefersReducedMotion?60:180;
  for(let i=0;i<pieces;i++){
    setTimeout(()=>{
      const el=document.createElement('div');
      el.className='confetti-piece';
      el.style.left=(5+Math.random()*90)+'vw';
      el.style.width=(5+Math.random()*10)+'px';
      el.style.height=(3+Math.random()*8)+'px';
      el.style.background=cols[Math.random()*cols.length|0];
      el.style.setProperty('--cx',(Math.random()*240-120)+'px');
      el.style.setProperty('--cr',(Math.random()*720+360)*(Math.random()<.5?1:-1)+'deg');
      const d=2.8+Math.random()*2.5;
      el.style.animationDuration=d+'s';
      el.style.animationDelay=Math.random()*.6+'s';
      // Random shape
      if(Math.random()>.6)el.style.borderRadius='50%';
      document.body.appendChild(el);
      setTimeout(()=>el.remove(),(d+1)*1000);
    },i*12);
  }
}

function spawnBalloons(){
  const cols=['#ff7aa2','#ffd166','#66d9ff','#8ad38a','#c9a0ff','#ff9f7f'];
  const count=prefersReducedMotion?10:24;
  for(let i=0;i<count;i++){
    setTimeout(()=>{
      const el=document.createElement('div');
      el.className='surprise-balloon';
      el.style.left=(6+Math.random()*88)+'vw';
      el.style.background=cols[Math.random()*cols.length|0];
      el.style.setProperty('--bx',(Math.random()*180-90)+'px');
      el.style.setProperty('--br',(Math.random()*28-14)+'deg');
      const d=6+Math.random()*3.5;
      el.style.animationDuration=d+'s';
      document.body.appendChild(el);
      setTimeout(()=>el.remove(),(d+1)*1000);
    },i*220);
  }
}

function spawnSparkleBurst(x,y){
  const pieces=prefersReducedMotion?12:26;
  for(let i=0;i<pieces;i++){
    const el=document.createElement('div');
    el.className='sparkle-piece';
    el.style.left=x+'px';
    el.style.top=y+'px';
    const ang=(Math.PI*2/pieces)*i + Math.random()*.3;
    const dist=24+Math.random()*80;
    el.style.setProperty('--sx',Math.cos(ang)*dist+'px');
    el.style.setProperty('--sy',Math.sin(ang)*dist+'px');
    el.style.animationDuration=(.75+Math.random()*.45)+'s';
    document.body.appendChild(el);
    setTimeout(()=>el.remove(),1300);
  }
}

function triggerSparkleShower(){
  stopSparkleShower();
  const run=()=>{
    const x=window.innerWidth*(.2+Math.random()*.6);
    const y=window.innerHeight*(.15+Math.random()*.4);
    spawnSparkleBurst(x,y);
  };
  run();
  sparkleTimer=setInterval(run,prefersReducedMotion?1200:420);
  setTimeout(stopSparkleShower,prefersReducedMotion?5000:9000);
}

function stopSparkleShower(){
  if(!sparkleTimer) return;
  clearInterval(sparkleTimer);
  sparkleTimer=null;
}

/* ============================================
   TYPEWRITER EFFECT
   ============================================ */
function startTypewriter(){
  const note=contentData.note;

  const el=document.getElementById('typed-note');
  el.innerHTML='';
  el.classList.add('typed');
  let i=0,html='';
  const iv=setInterval(()=>{
    if(i>=note.length){
      el.classList.remove('typed');
      clearInterval(iv);
      return;
    }
    const ch=note[i++];
    if(ch==='\n')html+='<br/><br/>';
    else html+=ch==='<'?'&lt;':ch;
    el.innerHTML=html;
  },22);
}
