import {useState,useRef} from 'react';
import {motion} from 'framer-motion';
import {GoogleGenAI} from '@google/genai';
import html2canvas from 'html2canvas';
import LOGO from './assets/logo.png';
import GIRL from './assets/girl.png';
import BOY from './assets/boy.png';

const KEY=import.meta.env.VITE_GEMINI_API_KEY||"";
const ld=(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}};
const sv=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const P=['Phnom Penh','Siem Reap','Battambang','Kampot','Kep','Kirirom','Sihanoukville'];
const FARE={'Siem Reap':'$12–15','Battambang':'$9–12','Kampot':'$8–10','Kep':'$9–11','Kirirom':'$6–8','Sihanoukville':'$9–12'};
const CAT={craft:['#C85A32','#D4AF37'],food:['#D4AF37','#C85A32'],nature:['#2D6A4F','#8bbf9f'],culture:['#7a4aa8','#D4AF37'],adventure:['#2d6a8f','#2D6A4F'],wellness:['#b5779a','#f3c6a5']};
const FACT={craft:"Fun fact: one hand-woven silk krama can take days to finish, and each pattern carries a family story!",food:"Fun fact: Khmer cooking balances sweet, salty, sour and fresh herbs. The kroeung paste is pounded by hand!",nature:"Tip: bring a hat and a reusable bottle. Every visit helps this community protect its land and water.",culture:"Fun fact: Khmer culture is over a thousand years old. Greet your host with a sampeah, palms together!",adventure:"Tip: go early! The light is golden, it’s cooler, and your local guide knows the secret spots.",wellness:"Fun fact: the humble krama scarf and herbal steam have helped Cambodians relax for generations."};
const KM={craft:"ក្រមាត្បាញដោយដៃមួយអាចចំណាយពេលច្រើនថ្ងៃ ហើយរាល់ឆ្នាំងមានរឿងរ៉ាវគ្រួសារ!",food:"ម្ហូបខ្មែរមានរសជាតិចំរុះ ហើយគ្រឿងសម្ល ត្រូវបានគោះដោយដៃ!",nature:"សូមយកមួក និងដបទឹកមកជាមួយ ដើម្បីជួយថែរក្សាធម្មជាតិរបស់សហគមន៍។",culture:"វប្បធម៌ខ្មែរមានអាយុកាលជាង ១០០០ ឆ្នាំ។ សូមសំពះជាមួយម្ចាស់ផ្ទះ!",adventure:"សូមចេញដំណើរពេលព្រឹកព្រហាម ព្រោះរាក់ត្រជាក់ ហើយមគ្គុទ្ទេសក៍ដឹងកន្លែងស្អាតៗ!",wellness:"ក្រមា និងចំហាយថ្នាំបុរាណ ជួយឲ្យខ្លួនប្រាណសម្រាកអស់ជំនាន់មកហើយ។"};
const DESC={craft:"Learn a heritage craft hands-on with a local family.",food:"Cook, taste and share a meal made from local ingredients.",nature:"Explore beautiful nature with a community guide.",culture:"Discover living Khmer traditions and stories.",adventure:"An easy, guided adventure off the tourist trail.",wellness:"Slow down with a calming, traditional local experience."};
const RAW=`Phnom Penh|Koh Dach Silk Weaving|craft|25|3|8|🧵
Phnom Penh|Royal Palace Dawn Walk|culture|18|2|10|🛕
Phnom Penh|Mekong Sunset Cyclo Ride|adventure|15|2|4|🚲
Phnom Penh|Russian Market Street-Food Crawl|food|22|3|8|🍜
Phnom Penh|Koh Chen Silversmith Workshop|craft|30|3|6|🔨
Siem Reap|Kompong Phluk Mangrove Kayak|nature|35|4|8|🛶
Siem Reap|Golden Silk Farm & Loom|craft|28|3|8|🧵
Siem Reap|Rice Paddy Bike & Picnic|adventure|24|4|10|🚲
Siem Reap|Apsara Dance Behind the Scenes|culture|32|2|12|💃
Siem Reap|Village Kitchen: Fish Amok Class|food|26|3|8|🍲
Battambang|Bamboo Train & Sugarcane Juice|adventure|14|2|8|🚃
Battambang|Phnom Sampov Bat Cave Sunset|nature|12|3|12|🦇
Battambang|Rice Paper & Noodle Makers|food|18|3|8|🍜
Battambang|Pottery Village Wheel Class|craft|20|2|6|🏺
Battambang|Colonial Town Art Walk|culture|16|2|10|🎨
Kampot|La Plantation Pepper Tasting|food|20|3|10|🌶️
Kampot|River Firefly Boat Night|nature|18|2|10|✨
Kampot|Salt Fields at Dawn|culture|15|2|8|🧂
Kampot|Bokor Hill Sunrise Hike|adventure|30|5|8|⛰️
Kampot|Durian Orchard Tasting|food|12|2|10|🍈
Kep|Crab Market & Cooking Class|food|28|3|8|🦀
Kep|Rabbit Island Kayak Escape|nature|26|4|8|🏝️
Kep|National Park Jungle Walk|adventure|14|3|10|🥾
Kep|Coconut Palm-Sugar Making|craft|16|2|6|🥥
Kep|Seaside Yoga at Dawn|wellness|15|1|12|🧘
Kirirom|Chambok Waterfall Trek|nature|22|4|10|💦
Kirirom|Community Homestay Dinner|food|24|3|10|🍚
Kirirom|Pine Forest Cycling|adventure|18|3|10|🚲
Kirirom|Herbal Sauna & Kroma Massage|wellness|20|2|8|🌿
Kirirom|Bamboo Basket Weaving Hut|craft|14|2|6|🧺
Sihanoukville|Koh Rong Samloem Snorkel|adventure|40|5|10|🤿
Sihanoukville|Fishing Village Squid Night|food|25|3|8|🦑
Sihanoukville|Ream Mangrove Walk|nature|20|3|10|🌴
Sihanoukville|Wooden Boat Builders Yard|craft|18|2|8|⛵
Sihanoukville|Beach Bonfire & Khmer Music|culture|16|2|20|🔥`;
const seed=RAW.split('\n').map((l,i)=>{const [prov,title,cat,price,hours,max,emoji]=l.split('|');return{id:i+1,prov,title,cat,price:+price,hours:+hours,max:+max,emoji}});
const T={en:{a:'Go beyond the temples.',b:'Meet Cambodia.',book:'Book Experience',sched:'My Trip Schedule'},km:{a:'ទៅឲ្យហួសពីប្រាសាទ។',b:'ស្គាល់កម្ពុជា។',book:'កក់បទពិសោធន៍',sched:'កាលវិភាគដំណើរ'}};
const I='w-full border border-line bg-cream rounded-xl px-3 py-2 text-sm';
const rd=f=>new Promise(r=>{const x=new FileReader();x.onload=()=>r(x.result);x.readAsDataURL(f)});
const shrink=(src,w=800)=>new Promise(r=>{const i=new Image();i.onload=()=>{const s=Math.min(1,w/i.width),c=document.createElement('canvas');c.width=i.width*s;c.height=i.height*s;c.getContext('2d').drawImage(i,0,0,c.width,c.height);r(c.toDataURL('image/jpeg',.8))};i.src=src});
const gem=async(key,prompt,img,srch)=>{if(!key)throw 0;const g=new GoogleGenAI({apiKey:key});
 const contents=img?[{role:'user',parts:[{text:prompt},{inlineData:{mimeType:'image/jpeg',data:img.split(',')[1]}}]}]:prompt;
 const r=await g.models.generateContent({model:'gemini-2.5-flash',contents,config:srch?{tools:[{googleSearch:{}}]}:undefined});return r.text};
const ai=async(key,prompt,fb,img,srch)=>{try{return await gem(key,prompt,img,srch)}catch(e){await new Promise(r=>setTimeout(r,700));return typeof fb==='function'?fb():fb}};

function Modal({onClose,children,w='max-w-md'}){return <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4" onClick={onClose}><motion.div initial={{scale:.7,opacity:0,y:30}} animate={{scale:1,opacity:1,y:0}} transition={{type:'spring',stiffness:300,damping:20}} className={'bg-card rounded-3xl p-6 w-full max-h-[90vh] overflow-auto '+w} onClick={e=>e.stopPropagation()}>{children}</motion.div></div>}

const HN=['Sokunthea','Vanna','Chantha','Dara','Bopha','Rithy'];seed.forEach(e=>{e.local=true;e.unit=e.cat==='adventure'?'group':'person';e.host=[1,7].includes(e.id)?'Srey Mom':HN[e.id%6]});
const UNITS={person:['per person','ក្នុងម្នាក់'],group:['per group','ក្នុងមួយក្រុម'],hour:['per hour','ក្នុងមួយម៉ោង'],session:['per session','ក្នុងមួយលើក'],day:['per day','ក្នុងមួយថ្ងៃ']};
const GET={craft:['Hands-on lesson with a master artisan','All materials included','A handmade keepsake to take home','Local tea & snacks'],food:['Fresh ingredients from the local market','Cook & taste with a host family','Recipe card to take home','Drinks included'],nature:['Local community guide','Safety gear & water','Photo stops at the best spots','Your fee supports conservation'],culture:['Stories told by locals','Small gifts & entry included','Traditional music or dance','Etiquette tips for visitors'],adventure:['Experienced local guide','Equipment provided','Snacks & cold water','Beginner-friendly pace'],wellness:['Traditional herbal treatment','Calm, clean, family-run space','Herbal tea afterwards','Time to unwind']};
const AFTER={'Phnom Penh':'Catch the sunset on the Riverside, enjoy a Khmer massage, then rest at a guesthouse near Wat Phnom. 🌇','Siem Reap':'Get a relaxing foot spa, watch the sunset over the rice fields, then sleep at a cozy homestay. 🌅','Battambang':'See the bat exodus at dusk, sip coffee in the old town, then rest in a colonial guesthouse. 🦇','Kampot':'Sunset on the river, pepper crab for dinner, then a riverside bungalow to sleep. 🦀','Kep':'Sunset over the sea, fresh crab at the market, then a seaside bungalow. 🌊','Kirirom':'Soak in a herbal sauna, stargaze in the pine forest, then sleep at a community homestay. ⭐','Sihanoukville':'Beach sunset, a seaside massage, then a bungalow by the water. 🏝️'};
const seedRev=id=>[{n:'Julia',r:5,c:'Lovely host, I learned so much!'},{n:'Amir',r:4+(id%2),c:'Authentic and friendly. Worth the trip.'}];
const rv=(R,id)=>[...(R[id]||[]),...(id>1000?[]:seedRev(id))];
const avg=(R,id)=>{const a=rv(R,id);return a.length?a.reduce((s,x)=>s+x.r,0)/a.length:0};
const vw=(V,id)=>(id>1000?0:150+id*43)+(V[id]||0);
const T2={en:{a:'Get the authentic experience',b:'and trip you’ll never forget.',s:'Meet real Cambodian hosts, taste family recipes, weave, paddle and wander. Every journey is made by local communities, just for you.'},km:{a:'ទទួលបានបទពិសោធន៍ពិតប្រាកដ',b:'និងដំណើរដែលអ្នកមិនភ្លេច។',s:'ជួបម្ចាស់ផ្ទះខ្មែរពិតៗ ភ្លក់ម្ហូបគ្រួសារ ត្បាញ ចែវទូក និងដើរលេង។'}};
const Bi=({en,km,cls=''})=><div className={cls}>{en}<div className="text-terra text-[.92em]">{km}</div></div>;
const Stars=({v,set})=><span>{[1,2,3,4,5].map(i=><button key={i} onClick={()=>set&&set(i)} className={'text-2xl leading-none '+(i<=Math.round(v)?'text-gold':'text-line')}>★</button>)}</span>;
const saveImg=async(el,name)=>{const c=await html2canvas(el,{scale:2,backgroundColor:null});const a=document.createElement('a');a.href=c.toDataURL('image/png');a.download=name;a.click();return null};

function Card({e,R,V,onOpen}){const [a,b]=CAT[e.cat]||CAT.craft;const n=rv(R,e.id).length;
 return <div onClick={onOpen} className={'rounded-3xl bg-card border border-line shadow-sm overflow-hidden '+(onOpen?'cursor-pointer hover:-translate-y-1 hover:shadow-xl transition':'')}>
  <div className="relative h-52" style={{background:e.photo?`url(${e.photo}) center/cover`:`linear-gradient(135deg,${a},${b})`}}>
  
   {!e.photo&&<><div className="absolute inset-0 kbach"/><div className="absolute inset-0 grid place-items-center text-7xl drop-shadow-lg">{e.emoji}</div></>}{e.local&&<img src={`/photos/${e.id}.jpg`} className="absolute inset-0 w-full h-full object-cover" onError={x=>{x.target.style.display='none'}}/>}
   <span className="absolute top-3 left-3 bg-palm text-white text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full">{e.cat}</span>
   <span className="absolute top-3 right-3 bg-card text-ink text-sm font-bold px-3 py-1 rounded-full">${e.price||0} <span className="font-normal text-xs">{UNITS[e.unit||'person'][0]}</span></span></div>
  <div className="p-4"><div className="text-[11px] font-bold tracking-wider uppercase text-terra">📍 {e.prov}</div>
   <h3 className="serif font-extrabold text-xl leading-tight mt-1">{e.title||'Your experience title'}</h3>
   <p className="text-sm text-mute mt-1">{e.desc||DESC[e.cat]}</p>
   <div className="flex flex-wrap gap-x-3 text-xs text-mute mt-3"><span>⏱ {e.hours||'–'} hrs</span><span>👥 max {e.max}</span>{R&&<><span className="text-gold font-bold">★ {n?avg(R,e.id).toFixed(1):'New'} ({n})</span><span>👁 {vw(V,e.id)}</span></>}</div></div></div>}

function Place({e,R,V,user,onClose,addRev,onPlan,onHost}){const [r,setR]=useState(5),[c,setC]=useState('');const [a,b]=CAT[e.cat]||CAT.craft;const rs=rv(R,e.id);
 return <Modal onClose={onClose} w="max-w-2xl">
  <div className="relative h-44 -m-6 mb-4 rounded-t-3xl grid place-items-center text-7xl" style={{background:e.photo?`url(${e.photo}) center/cover`:`linear-gradient(135deg,${a},${b})`}}>{!e.photo&&e.emoji}<button onClick={onClose} className="absolute top-2 right-3 bg-card rounded-full w-6 h-6 text-xs">✕</button></div>
  {!!(e.gallery&&e.gallery.length)&&<div className="flex gap-2 mb-3">{e.gallery.map((g,i)=><img key={i} src={g} className="h-16 w-16 object-cover rounded-xl"/>)}</div>}
  <div className="text-xs font-bold tracking-wider uppercase text-terra">📍 {e.prov} · {e.cat}</div>
  <h2 className="serif font-extrabold text-3xl">{e.title}</h2>
  <div className="flex flex-wrap gap-3 text-sm mt-1"><span className="text-gold font-bold">{rs.length?'★ '+avg(R,e.id).toFixed(1)+' ('+rs.length+' reviews)':'★ No reviews yet'}</span><span className="text-mute">👁 {vw(V,e.id)} views</span><span className="text-mute">⏱ {e.hours} hrs · 👥 max {e.max}</span></div>
  <div className="mt-3 text-2xl font-bold text-terra">${e.price} <span className="text-sm font-normal text-mute">{UNITS[e.unit||'person'][0]}</span></div>
  <p className="mt-3 text-sm">{e.desc||DESC[e.cat]}</p>
  <button onClick={()=>onHost(e.host)} className="mt-4 w-full flex items-center gap-3 p-3 rounded-2xl border border-line text-left hover:border-terra"><span className="w-10 h-10 rounded-full bg-terra text-white grid place-items-center font-bold">{(e.host||'L')[0]}</span><span className="flex-1 text-sm"><b>{e.host}</b><br/><span className="text-mute">Community host · see profile & latest updates</span></span><span className="text-terra">→</span></button>
  <h4 className="font-bold mt-4">What you get</h4><ul className="text-sm mt-1 grid sm:grid-cols-2 gap-1">{GET[e.cat].map(g=><li key={g}>✅ {g}</li>)}</ul>
  <p className="text-sm text-mute mt-3">🛺 Getting there: tuk-tuk via PassApp/Grab ≈ $2–5 in town{FARE[e.prov]?`; bus from Phnom Penh ≈ ${FARE[e.prov]} (Virak Buntham / Giant Ibis)`:''}. Walk-ins welcome!</p>
  <button onClick={()=>{onPlan(e);onClose()}} className="mt-4 w-full bg-terra text-white font-bold rounded-full py-3">➕ Add to my trip plan</button>
  <h4 className="font-bold mt-6">Reviews</h4>
  <div className="mt-2 space-y-2">{rs.map((x,i)=><div key={i} className="p-3 rounded-2xl bg-cream border border-line text-sm"><b>{x.n}</b> <span className="text-gold">{'★'.repeat(x.r)}</span><div>{x.c}</div></div>)}{!rs.length&&<div className="text-sm text-mute">Be the first to review!</div>}</div>
  <div className="mt-3 p-3 rounded-2xl border border-line"><b className="text-sm">Rate this place</b><div><Stars v={r} set={setR}/></div>
   <textarea className={I+' mt-1'} rows="2" placeholder="Share your experience…" value={c} onChange={x=>setC(x.target.value)}/>
   <button onClick={()=>{if(c.trim()){addRev(e.id,{n:user.name,r,c});setC('')}}} className="mt-2 bg-palm text-white rounded-full px-5 py-2 text-sm font-bold">Post review</button></div></Modal>}

const seedPosts=h=>h==='Srey Mom'?[{host:h,t:'Fresh palm sugar & woven scarves ready today! 🌴',w:'2h ago'},{host:h,t:'Thank you to our guests from Japan, you wove beautiful kramas! 💛',w:'3d ago'}]:HN.includes(h)?[{host:h,t:'Open daily 8am–5pm. Walk-ins welcome, come say hello! 🌞',w:'1d ago'}]:[];
const Post=({p})=><div className="p-3 rounded-2xl bg-cream border border-line text-sm"><div className="text-[11px] text-mute mb-1">{p.host} · {p.w}</div>{p.t}{p.img&&<img src={p.img} className="mt-2 rounded-xl max-h-60 w-full object-cover"/>}</div>;
function Host({h,exps,R,V,posts,onClose,onOpen}){const my=exps.filter(e=>e.host===h),ps=[...posts.filter(p=>p.host===h),...seedPosts(h)],rs=my.flatMap(e=>rv(R,e.id));
 return <Modal onClose={onClose} w="max-w-xl"><div className="relative h-28 -m-6 rounded-t-3xl" style={{background:'linear-gradient(135deg,#C85A32,#D4AF37)'}}><button onClick={onClose} className="absolute top-2 right-3 bg-card rounded-full w-6 h-6 text-xs">✕</button></div>
  <div className="flex items-end gap-3 mt-3 relative"><div className="w-20 h-20 rounded-full bg-terra text-white grid place-items-center text-3xl font-bold border-4 border-card -mt-1">{h[0]}</div><div><div className="serif font-extrabold text-2xl">{h}</div><div className="text-xs text-mute">🏡 Community host{my[0]?' · '+my[0].prov:''}</div></div></div>
  <div className="grid grid-cols-3 gap-2 mt-4 text-center text-sm">{[['⭐',rs.length?(rs.reduce((s,x)=>s+x.r,0)/rs.length).toFixed(1):'0.0'],['👁',my.reduce((s,e)=>s+vw(V,e.id),0)],['📍',my.length+' places']].map(([i,v])=><div key={i} className="bg-cream border border-line rounded-xl p-2">{i} <b>{v}</b></div>)}</div>
  <h4 className="font-bold mt-4">Latest updates</h4><div className="space-y-2 mt-2">{ps.map((p,i)=><Post key={i} p={p}/>)}{!ps.length&&<div className="text-sm text-mute">No updates yet.</div>}</div>
  <h4 className="font-bold mt-4">Places</h4><div className="space-y-2 mt-2">{my.map(e=><button key={e.id} onClick={()=>onOpen(e)} className="w-full text-left p-2 rounded-xl border border-line text-sm hover:border-terra">{e.emoji} <b>{e.title}</b> · ${e.price} {UNITS[e.unit||'person'][0]}</button>)}</div></Modal>}
function Guide({who,setWho,k,ctx,exps}){
 const [open,setOpen]=useState(false),[msgs,setMsgs]=useState([{b:1,t:'Hi! I’m your guide. Ask me about any place, how to get there, or what to do after 😊'}]),[q,setQ]=useState(''),[busy,setBusy]=useState(false);const nm=who==='sophea'?'Sophea':'Sokha';
 const fb=t=>{const s=t.toLowerCase(),pv=P.find(p=>s.includes(p.toLowerCase()));
  if(ctx){const u=UNITS[ctx.unit||'person'][0];
   if(/price|cost|how much|fee/.test(s))return `${ctx.title} costs $${ctx.price} ${u}. ⏱ About ${ctx.hours} hours, up to ${ctx.max} guests.`;
   if(/include|what do i get|offer|bring/.test(s))return `At ${ctx.title} you get: ${GET[ctx.cat].join(', ')}. 💛`;
   if(/host|owner|who/.test(s))return `Your host is ${ctx.host}, a community member in ${ctx.prov}. Open their profile on the place page to see latest updates!`;
   if(/how long|duration|hour|group/.test(s))return `${ctx.title} takes about ${ctx.hours} hours and welcomes up to ${ctx.max} guests.`}
  if(/get|transport|tuk|bus|go there/.test(s))return `${ctx?'To reach '+ctx.title+': ':''}use PassApp or Grab tuk-tuk in town (about $2–5). Between provinces, Virak Buntham (VET) or Giant Ibis buses leave Phnom Penh several times a day${ctx&&FARE[ctx.prov]?' (about '+FARE[ctx.prov]+')':''}. 🚌`;
  if(/after|relax|spa|sunset|sleep|stay|hotel|rest/.test(s))return AFTER[ctx?ctx.prov:pv]||'After your activity, try a Khmer massage, watch the sunset, then sleep at a cozy local guesthouse. 🌇';
  if(pv)return `In ${pv} you can try: `+exps.filter(e=>e.prov===pv).slice(0,5).map(e=>`${e.title} ($${e.price} ${UNITS[e.unit||'person'][0]})`).join('; ')+'.';
  return 'Tap any place for its profile, rating and reviews. Add places to My Trip Plan, then export it or send it to Google Calendar. Use Create a Memory for a photo keepsake. 💛'};
 const send=async t=>{if(!t.trim())return;setMsgs(m=>[...m,{t}]);setQ('');setBusy(true);const live=/get|transport|after|relax|spa|sunset|sleep|stay|hotel|eat|restaurant|recommend/.test(t.toLowerCase());
  const det=ctx?`${ctx.title} (${ctx.prov}), $${ctx.price} ${UNITS[ctx.unit||'person'][0]}, ${ctx.hours}h, max ${ctx.max}, includes ${GET[ctx.cat].join(', ')}, host ${ctx.host}`:'no place selected';
  const a=await ai(k,`You are ${nm}, a cute Cambodian tour guide. Max 4 short sentences. ${live?'Use Google Search to recommend REAL existing places (spa, sunset spot, restaurant, hotel, transport) near the place.':'Answer only from the place details.'} Place details: ${det}. Question: ${t}`,()=>fb(t),null,live);setMsgs(m=>[...m,{b:1,t:a}]);setBusy(false)};
 const tr=async()=>{const l=msgs[msgs.length-1];if(!l.b)return;setBusy(true);const a=await ai(k,'Translate to Khmer: '+l.t,'សួស្តី! ខ្ញុំជាមគ្គុទ្ទេសក៍របស់អ្នក។ សូមសួរសំណួរបានគ្រប់ពេល។ 💛');setMsgs(m=>[...m,{b:1,t:a}]);setBusy(false)};
 return <div className="fixed bottom-2 right-2 z-40 flex flex-col items-end">
  {open&&<div className="pop w-96 max-w-[92vw] bg-card border-2 border-gold rounded-3xl shadow-2xl p-3 mb-1">
   <div className="flex justify-between items-center text-sm"><b className="text-terra">{nm}{ctx?' · '+ctx.title:''}</b><span>{['sophea','sokha'].map(w=><button key={w} onClick={()=>setWho(w)} className={'ml-1 px-2 rounded-full border text-xs '+(who===w?'bg-gold border-gold':'border-line')}>{w==='sophea'?'👧':'👦'}</button>)}<button onClick={()=>setOpen(false)} className="ml-2 text-xs">✕</button></span></div>
   <div className="h-56 overflow-auto my-2 space-y-2 text-sm">{msgs.map((m,i)=><div key={i} className={m.b?'bg-cream border border-line rounded-2xl p-2':'bg-terra text-white rounded-2xl p-2 ml-8'}>{m.t}</div>)}{busy&&<div className="text-mute">…</div>}</div>
   <div className="flex flex-wrap gap-1 mb-2">{['How to get there?','What do I get here?','What to do after the activity?','Where to relax & sleep?'].map(c=><button key={c} onClick={()=>send(c)} className="text-[11px] border border-terra text-terra rounded-full px-2 py-1">{c}</button>)}<button onClick={tr} className="text-[11px] border border-palm text-palm rounded-full px-2 py-1">🔁 ខ្មែរ</button></div>
   <div className="flex gap-1"><input className={I} value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send(q)} placeholder="Want to ask a question?"/><button onClick={()=>send(q)} className="bg-terra text-white rounded-xl px-3">➤</button></div></div>}
  <div className="flex items-end cursor-pointer" onClick={()=>setOpen(!open)}>{!open&&<div className="bob bg-card border-2 border-gold rounded-2xl px-3 py-2 text-sm font-bold mb-16 mr-1 shadow-lg">Want to ask a question? 💬</div>}<motion.img whileHover={{scale:1.08,rotate:-3}} whileTap={{scale:.92}} transition={{type:'spring',stiffness:400,damping:10}} src={who==='sophea'?GIRL:BOY} className="h-44 drop-shadow-lg" alt=""/></div></div>}
function Login({onLogin}){const [r,setR]=useState('traveler'),[n,setN]=useState(''),[em,setEm]=useState(''),[pw,setPw]=useState('');
 return <div className="min-h-screen kbach grid place-items-center p-5"><div className="pop w-full max-w-md bg-card border border-line rounded-3xl p-7 shadow-xl">
  <img src={LOGO} className="h-12 mx-auto" alt="DerLeng"/><h1 className="serif font-extrabold text-3xl text-center mt-3">Welcome back</h1><div className="text-center text-terra text-sm">សូមស្វាគមន៍ត្រឡប់មកវិញ</div>
  <div className="grid grid-cols-2 gap-2 mt-5">{[['traveler','🌍 Traveler','អ្នកទេសចរណ៍'],['community','🏡 Community host','សហគមន៍']].map(([id,l,km])=><button key={id} onClick={()=>setR(id)} className={'rounded-2xl border p-3 text-sm font-bold '+(r===id?'border-terra bg-terra/10 text-terra':'border-line')}>{l}<div className="font-normal text-xs">{km}</div></button>)}</div>
  <div className="space-y-3 mt-4 text-sm"><input className={I} placeholder="Your name · ឈ្មោះ" value={n} onChange={e=>setN(e.target.value)}/><input className={I} placeholder="Email · អ៊ីមែល" value={em} onChange={e=>setEm(e.target.value)}/><input type="password" className={I} placeholder="Password · ពាក្យសម្ងាត់" value={pw} onChange={e=>setPw(e.target.value)}/></div>
  <button onClick={()=>onLogin({name:n.trim()||(r==='traveler'?'Traveler':'Srey Mom'),role:r})} className="mt-5 w-full bg-terra text-white font-bold rounded-full py-3">Log in / Sign up · ចូល</button>
  <p className="text-[11px] text-mute text-center mt-3">Demo login: any details work. Nothing leaves your browser.</p></div></div>}

function Explore({exps,prov,setProv,R,V,lang,onOpen}){const t=T2[lang];const list=exps.filter(e=>prov==='All'||e.prov===prov);
 return <div>
  <section className="kbach bg-gradient-to-br from-[#f6e6d8] to-cream"><div className="max-w-6xl mx-auto px-5 py-12 flex items-center justify-between gap-6">
   <div><div className="text-xs font-bold tracking-widest text-terra">✦ COMMUNITY-MADE JOURNEYS</div>
   <h1 className="serif font-extrabold text-4xl md:text-6xl mt-3 leading-tight">{t.a}<br/><span className="text-terra">{t.b}</span></h1>
   <p className="text-mute mt-4 max-w-xl">{t.s}</p>
   <div className="flex flex-wrap gap-2 mt-5 text-sm font-bold">{['🧵 Craft','🍜 Food','🌿 Nature','🛕 Culture','🛶 Adventure'].map(c=><span key={c} className="bg-card border border-line rounded-full px-4 py-1.5">{c}</span>)}</div>
   <div className="flex gap-6 mt-5 text-sm"><div><b className="serif text-2xl text-terra">{exps.length}</b><br/>local experiences</div><div><b className="serif text-2xl text-terra">7</b><br/>provinces</div><div><b className="serif text-2xl text-terra">100%</b><br/>community-run</div></div></div>
   <div className="hidden md:grid w-52 h-52 rounded-full border border-terra/40 place-items-center text-center shrink-0"><div><div className="text-2xl text-terra">សូមស្វាគមន៍</div><div className="serif font-extrabold text-2xl text-terra">Welcome</div><div className="text-[10px] tracking-widest text-mute">TO CAMBODIA</div></div></div></div></section>
  <div className="max-w-6xl mx-auto px-5 py-5 flex gap-2 overflow-x-auto">{['All',...P].map(p=><button key={p} onClick={()=>setProv(p)} className={'shrink-0 rounded-full px-4 py-2 text-sm font-medium border transition '+(prov===p?'bg-terra text-white border-terra shadow':'bg-card border-line')}>{p==='All'?'✦ All journeys':p}</button>)}</div>
  <div className="max-w-6xl mx-auto px-5"><h2 className="serif font-extrabold text-3xl">Stories worth traveling for</h2><p className="text-sm text-mute">Tap any place to see its profile. Walk-ins welcome, no booking needed.</p></div>
  <div className="max-w-6xl mx-auto px-5 py-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-32">{list.map(e=><Card key={e.id} e={e} R={R} V={V} onOpen={()=>onOpen(e)}/>)}</div></div>}

const TH={beach:{n:'🏖 Beach',bg:'#c5e4e3',ac:'#4b6a8a',ink:'#4b6a8a',d:['☀️','🪼','🌴','🌴']},nature:{n:'🌿 Nature',bg:'#cfe8d5',ac:'#2D6A4F',ink:'#2D6A4F',d:['🦋','🍄','🌳','🌿']},history:{n:'🛕 History',bg:'#f1d9bf',ac:'#C85A32',ink:'#8a3f1f',d:['🌞','🏺','🛕','🌴']},food:{n:'🍜 Food & Culture',bg:'#f9e3a8',ac:'#b5779a',ink:'#7a4aa8',d:['🥥','🎭','🍜','🌺']}};
const DP=[{top:96,right:14,fontSize:44},{left:4,top:'46%',fontSize:46},{bottom:6,right:10,fontSize:76},{bottom:6,right:78,fontSize:46}];
const gcal=it=>{const s=new Date(it.date+'T'+(it.time||'09:00')),e=new Date(+s+72e5),f=d=>d.toISOString().replace(/[-:]|\.\d{3}/g,'');return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(it.title)}&dates=${f(s)}/${f(e)}&details=${encodeURIComponent(it.note||'')}&location=${encodeURIComponent((it.prov||'')+' Cambodia')}`};
function Plan({plan,setPlan,exps}){const [th,setTh]=useState('beach'),[ttl,setTtl]=useState('Schedule'),[f,setF]=useState({title:'',date:'',time:'09:00',note:''}),[img,setImg]=useState(''),ref=useRef();const T=TH[th];const u=k=>e=>setF({...f,[k]:e.target.value});
 const items=[...plan].sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
 const add=()=>{if(!f.title.trim())return;const m=exps.find(e=>e.title===f.title);setPlan([...plan,{...f,id:Date.now(),prov:m?m.prov:''}]);setF({title:'',date:'',time:'09:00',note:''})};
 return <div className="max-w-5xl mx-auto px-5 py-10 pb-48"><h1 className="serif font-extrabold text-4xl">My Trip Plan</h1><p className="text-mute text-sm">Pick a vibe for where you’re going, write your plan, then send it to Google Calendar or save it as an image.</p>
  <div className="grid md:grid-cols-5 gap-6 mt-6"><div className="md:col-span-2 space-y-3 bg-card border border-line rounded-3xl p-5 h-fit text-sm">
   <b>Where are you going?</b><div className="flex flex-wrap gap-2">{Object.entries(TH).map(([id,x])=><button key={id} onClick={()=>setTh(id)} className={'px-3 py-1 rounded-full border text-xs '+(th===id?'border-terra bg-terra/10 font-bold':'border-line')}>{x.n}</button>)}</div>
   <b className="block pt-2">Add a place or plan</b><input list="pl" className={I} placeholder="Place or activity" value={f.title} onChange={u('title')}/><datalist id="pl">{exps.map(e=><option key={e.id} value={e.title}/>)}</datalist>
   <div className="grid grid-cols-2 gap-2"><input type="date" className={I} value={f.date} onChange={u('date')}/><input type="time" className={I} value={f.time} onChange={u('time')}/></div>
   <textarea className={I} rows="2" placeholder="Notes (what to bring, who joins…)" value={f.note} onChange={u('note')}/>
   <button onClick={add} className="w-full bg-terra text-white rounded-full py-2 font-bold">➕ Add to plan</button>
   <button onClick={async()=>{const r=await saveImg(ref.current,'derleng-trip-plan.png');if(r)setImg(r)}} className="w-full border-2 border-palm text-palm rounded-full py-2 font-bold">🖼 Export as image</button></div>
  <div className="md:col-span-3"><div ref={ref} className="max-w-md mx-auto" style={{background:T.bg,backgroundImage:'radial-gradient(rgba(255,255,255,.6) 3px,transparent 4px)',backgroundSize:'34px 34px',borderRadius:18,padding:'18px 16px 26px',position:'relative',overflow:'hidden'}}>
   <input value={ttl} onChange={e=>setTtl(e.target.value)} className="w-full text-center bg-transparent outline-none uppercase" style={{fontFamily:'Caveat,cursive',fontSize:52,fontWeight:700,color:T.ink}}/>
   <div style={{background:'#e8c9a4',width:150,height:26,margin:'0 auto -14px',transform:'rotate(-2deg)',position:'relative',zIndex:2,borderRadius:3}}/>
   <div style={{background:'#fff',borderRadius:26,padding:'26px 16px 90px',minHeight:420,position:'relative',color:'#2a211c'}}>
    {!items.length&&<div className="text-sm text-center py-10" style={{opacity:.55}}>Add places on the left ✨</div>}
    {items.map(it=><div key={it.id} className="flex gap-3 py-2 border-b" style={{borderColor:T.bg}}><div className="w-20 shrink-0 text-xs font-bold" style={{color:T.ac}}>{it.date||'Any day'}<br/>{it.time}</div><div className="flex-1 text-sm"><b>{it.title}</b>{it.prov&&<span style={{opacity:.6}}> · {it.prov}</span>}<div style={{opacity:.8}}>{it.note}</div>
     <div data-html2canvas-ignore="true" className="text-xs mt-1 flex gap-3">{it.date&&<a href={gcal(it)} target="_blank" rel="noopener" style={{color:T.ac}} className="font-bold underline">📆 Google Calendar</a>}<button onClick={()=>setPlan(plan.filter(x=>x.id!==it.id))} style={{opacity:.6}}>Remove</button></div></div></div>)}</div>
   {T.d.map((e,i)=><span key={i} style={{position:'absolute',...DP[i]}}>{e}</span>)}</div></div></div>
  {img&&<Modal onClose={()=>setImg('')}><p className="text-xs text-mute mb-2">Press and hold (or right-click) to save.</p><img src={img} className="mx-auto max-h-[65vh]"/></Modal>}</div>}
const FR={pastel:{n:'Cute Pastel',bg:'#fde4ec',bd:'#ffffff',ink:'#c2577a',st:['🌸','💖','✨','🎀']},film:{n:'Aesthetic Film',bg:'#1c1917',bd:'#f5f5f4',ink:'#e7e5e4',st:['🎞️','📷','🇰🇭','✨']},sunset:{n:'Golden Sunset',bg:'linear-gradient(180deg,#f9c97a,#e8825a)',bd:'#fff8e8',ink:'#7a3b1d',st:['🌅','🇰🇭','✨','🥥']},nature:{n:'Lush Nature',bg:'#cfe8d5',bd:'#ffffff',ink:'#1f5a3f',st:['🌿','🥥','🦋','🇰🇭']}};
const POS=[{top:6,right:6},{top:'35%',left:2},{top:'62%',right:2},{bottom:50,left:10}];
function Booth(){
 const [ph,setPh]=useState([]),[fr,setFr]=useState('pastel'),[cap,setCap]=useState(''),[out,setOut]=useState(''),ref=useRef(),inp=useRef();const F=FR[fr],n=ph.length,two=n>=4,H=n<=1?280:n<=3?150:n<=6?105:85;
 return <div className="max-w-5xl mx-auto px-5 py-10 pb-32"><div className="text-center rounded-3xl p-8 kbach" style={{background:'linear-gradient(135deg,#f9d9c3,#fbeec8)'}}><div className="text-5xl bob">📸✨</div><h1 className="serif font-extrabold text-4xl md:text-6xl mt-2">Want to create <span className="text-terra">a memory?</span></h1><p className="text-mute mt-2 max-w-lg mx-auto">Pick up to 8 favorite photos, write your own caption, and turn your Cambodia trip into a keepsake to save and share. 💛</p></div>
  <div className="grid md:grid-cols-2 gap-6 mt-8 bg-card rounded-3xl border border-line p-6">
   <div className="space-y-5 text-sm"><div><b>1 · Add 1–8 photos</b><div onClick={()=>inp.current.click()} className="mt-2 border-2 border-dashed border-line rounded-2xl p-8 text-center cursor-pointer hover:border-terra">⬆️ Tap to choose photos ({n}/8)</div>
    <input ref={inp} hidden type="file" accept="image/*" multiple onChange={async e=>{const o=[];for(const f of [...e.target.files].slice(0,8))o.push(await shrink(await rd(f),700));setPh(o)}}/></div>
    <div><b>2 · Write a caption</b><textarea className={I+' mt-2'} rows="2" maxLength="90" placeholder="e.g. Best day of our trip! 🇰🇭" value={cap} onChange={e=>setCap(e.target.value)}/></div>
    <div><b>3 · Choose a frame</b><div className="grid grid-cols-2 gap-2 mt-2">{Object.entries(FR).map(([id,f])=><button key={id} onClick={()=>setFr(id)} className={'rounded-xl border px-3 py-2 text-left '+(fr===id?'border-terra bg-terra/10 font-bold':'border-line')}>{f.n}</button>)}</div></div>
    <button disabled={!n} onClick={async()=>{const r=await saveImg(ref.current,'derleng-memory.png');if(r)setOut(r)}} className="w-full bg-terra text-white font-bold rounded-full py-3 disabled:opacity-40">⬇ Save to my phone / laptop</button></div>
   <div className="grid place-items-center bg-cream rounded-2xl p-5 overflow-auto"><div ref={ref} style={{background:F.bg,width:two?330:270,padding:16,position:'relative',borderRadius:6,fontFamily:'Caveat,cursive',color:F.ink}}>
    <div className="text-center serif font-extrabold text-lg">DerLeng</div><div className="text-center text-[9px] tracking-widest mb-2">CAMBODIA MEMORIES</div>
    <div style={{display:'grid',gridTemplateColumns:two?'1fr 1fr':'1fr',gap:8}}>{(n?ph:[null]).map((p,i)=><div key={i} style={{background:F.bd,padding:5,boxShadow:'0 2px 6px #0003',gridColumn:two&&n%2&&i===n-1?'span 2':'auto'}}>{p?<div style={{height:H,background:`url(${p}) center/cover`}}/>:<div style={{height:H,background:'#0001',display:'grid',placeItems:'center',fontSize:36}}>📷</div>}</div>)}</div>
    <div style={{fontSize:24,textAlign:'center',lineHeight:1.1,minHeight:50,marginTop:10}}>{cap||'Your caption appears here ✨'}</div>
    {F.st.map((e,i)=><span key={i} style={{position:'absolute',fontSize:32,...POS[i]}}>{e}</span>)}</div></div></div>
  {out&&<Modal onClose={()=>setOut('')}><p className="text-xs text-mute mb-2">Press and hold (phone) or right-click (laptop) to save.</p><img src={out} className="mx-auto max-h-[65vh]"/></Modal>}</div>}

function Pick({val,set,label,max=3}){const r=useRef();return <div><div onClick={()=>r.current.click()} className="border-2 border-dashed border-line rounded-2xl p-5 text-center cursor-pointer hover:border-terra"><div className="text-3xl">📸</div><div className="font-bold mt-1 text-sm">{label}</div></div>
 <input ref={r} type="file" accept="image/*" multiple={max>1} hidden onChange={async e=>{const o=[];for(const f of [...e.target.files].slice(0,max))o.push(await shrink(await rd(f),max===1?1200:800));set(o)}}/>
 <div className="flex gap-2 mt-2">{val.map((v,i)=><img key={i} src={v} className={(max===1?'h-32 w-full':'h-20 w-20')+' object-cover rounded-xl'}/>)}</div></div>}

function Community({user,exps,R,V,posts,addPost,onPublish}){
 const [step,setStep]=useState(1),[adding,setAdding]=useState(false),[f,setF]=useState({cover:[],gallery:[],title:'',prov:'Siem Reap',cat:'craft',price:20,unit:'person',hours:3,max:8,desc:''}),[en,setEn]=useState(''),[busy,setBusy]=useState(false),[txt,setTxt]=useState(''),[pimg,setPimg]=useState(''),pr=useRef();
 const u=key=>e=>setF({...f,[key]:e.target.value});
 const tr=async()=>{if(!f.desc.trim())return;setBusy(true);const kh=/[\u1780-\u17FF]/.test(f.desc);setEn(await ai(KEY,(kh?'Translate to English: ':'Translate to Khmer: ')+f.desc,()=>kh?'Welcome to our home! We share our craft, food and stories with every traveler.':'សូមស្វាគមន៍មកកាន់ផ្ទះរបស់យើង! យើងចែករំលែកសិប្បកម្ម និងរឿងរ៉ាវជាមួយភ្ញៀវគ្រប់រូប។'));setBusy(false)};
 const mine=exps.filter(e=>e.host===user.name),reg=mine.length>0,wiz=!reg||adding;const all=mine.flatMap(e=>rv(R,e.id).map(x=>({...x,p:e.title})));
 const tv=mine.reduce((s,e)=>s+vw(V,e.id),0),ar=all.length?all.reduce((s,x)=>s+x.r,0)/all.length:0,my=posts.filter(p=>p.host===user.name);
 return <div className="max-w-6xl mx-auto px-5 py-10 kbach pb-24"><div className="text-xs font-bold tracking-widest text-terra">COMMUNITY HOST STUDIO · ស្ទូឌីយោម្ចាស់ផ្ទះ</div><h1 className="serif font-extrabold text-4xl mt-1">Suostei, {user.name}! 👋</h1>
  {!reg&&<Bi en="Create your first listing to open your page. It’s quick and easy!" km="បង្កើតបញ្ជីដំបូងរបស់អ្នក ដើម្បីបើកទំព័ររបស់អ្នក។" cls="text-mute mt-1"/>}
  {reg&&<div className="grid grid-cols-3 gap-3 mt-5">{[['⭐',ar.toFixed(1),'Rating · ការវាយតម្លៃ'],['👁',tv,'Views · អ្នកមើល'],['💬',all.length,'Reviews · មតិ']].map(([i,v,l])=><div key={l} className="bg-card border border-line rounded-2xl p-4 text-center"><div className="text-2xl">{i}</div><div className="serif font-extrabold text-3xl">{v}</div><div className="text-xs text-mute">{l}</div></div>)}</div>}
  <div className="grid lg:grid-cols-3 gap-6 mt-6">
  {wiz&&<div className="lg:col-span-2 bg-card border border-line rounded-3xl p-6">
   <div className="flex justify-between items-center"><Bi en="Create your listing" km="បង្កើតបញ្ជីរបស់អ្នក" cls="serif font-extrabold text-2xl"/><span className="text-xs text-mute">{step}/3</span></div>
   <div className="h-2 bg-cream rounded-full mt-3"><div className="h-2 bg-gold rounded-full transition-all" style={{width:step*33.4+'%'}}/></div>
   {step===1&&<div className="mt-5 space-y-3"><Bi en="Step 1 · Add a big signature photo, then up to 4 more" km="ជំហានទី ១ · បន្ថែមរូបថតធំសម្គាល់ និងរូបផ្សេងទៀតរហូតដល់ ៤" cls="font-bold"/><div className="text-sm text-mute space-y-2"><Bi en="☀️ Take photos in daylight" km="ថតនៅពេលមានពន្លឺថ្ងៃ"/><Bi en="🙌 Show your hands at work" km="បង្ហាញដៃអ្នកកំពុងធ្វើការ"/></div>
    <Pick max={1} val={f.cover} set={p=>setF({...f,cover:p})} label="Big signature photo · រូបថតធំសម្គាល់"/><Pick max={4} val={f.gallery} set={p=>setF({...f,gallery:p})} label="More photos · រូបថតបន្ថែម"/></div>}
   {step===2&&<div className="mt-5 grid gap-3 text-sm"><Bi en="Step 2 · Tell us the details" km="ជំហានទី ២ · បញ្ចូលព័ត៌មានលម្អិត" cls="font-bold"/>
    <input className={I} placeholder="Title · ចំណងជើង" value={f.title} onChange={u('title')}/>
    <div className="grid grid-cols-2 gap-2"><select className={I} value={f.prov} onChange={u('prov')}>{P.map(p=><option key={p}>{p}</option>)}</select><select className={I} value={f.cat} onChange={u('cat')}>{Object.keys(CAT).map(c=><option key={c}>{c}</option>)}</select></div>
    <Bi en="How do you charge?" km="តើអ្នកគិតថ្លៃដូចម្តេច?" cls="font-bold"/>
    <div className="grid grid-cols-2 gap-2"><input type="number" className={I} value={f.price} onChange={u('price')} placeholder="$ Price · តម្លៃ"/><select className={I} value={f.unit} onChange={u('unit')}>{Object.entries(UNITS).map(([id,x])=><option key={id} value={id}>{x[0]} · {x[1]}</option>)}</select></div>
    <div className="grid grid-cols-2 gap-2"><input type="number" className={I} value={f.hours} onChange={u('hours')} placeholder="Hours · ម៉ោង"/><input type="number" className={I} value={f.max} onChange={u('max')} placeholder="Max guests · ភ្ញៀវអតិបរមា"/></div>
    <textarea className={I} rows="3" placeholder="Write here · សរសេរនៅទីនេះ" value={f.desc} onChange={u('desc')}/>
    <Bi en="Write in Khmer or English, then tap Auto-Translate." km="សរសេរជាខ្មែរ ឬអង់គ្លេស រួចចុចបកប្រែស្វ័យប្រវត្តិ។" cls="text-mute"/>
    <button onClick={tr} className="justify-self-start bg-palm text-white rounded-full px-4 py-2 font-bold">{busy?'…':'🔁 Auto-Translate · បកប្រែ'}</button>{en&&<div className="p-3 rounded-xl bg-cream border border-line">{en}</div>}</div>}
   {step===3&&<div className="mt-5"><Bi en="Step 3 · Preview & publish" km="ជំហានទី ៣ · មើលជាមុន និងបង្ហោះ" cls="font-bold"/><div className="max-w-sm mt-3"><Card e={{...f,emoji:'⭐',photo:f.cover[0]}}/></div><button onClick={()=>{onPublish({...f,id:Date.now(),price:+f.price,hours:+f.hours,max:+f.max,emoji:'⭐',photo:f.cover[0],gallery:f.gallery,title:f.title||'Untitled experience',host:user.name});setAdding(false);setStep(1);setF({...f,cover:[],gallery:[],title:'',desc:''});setEn('')}} className="mt-4 bg-terra text-white font-bold rounded-full px-6 py-3">🚀 Publish · បង្ហោះ</button></div>}
   <div className="flex justify-between mt-6"><button disabled={step===1} onClick={()=>setStep(step-1)} className="text-mute disabled:opacity-30">← Back · ត្រឡប់</button>{step<3&&<button onClick={()=>setStep(step+1)} className="bg-ink text-cream rounded-full px-5 py-2 font-bold">Next · បន្ទាប់ →</button>}</div></div>}
  {reg&&!wiz&&<div className="lg:col-span-2 space-y-6">
   <div className="bg-card border border-line rounded-3xl p-5"><h3 className="serif font-extrabold text-xl">Post an update</h3>
    <textarea className={I+' mt-3'} rows="2" placeholder="What’s new today? Fresh products, events, offers…" value={txt} onChange={e=>setTxt(e.target.value)}/>{pimg&&<img src={pimg} className="mt-2 rounded-xl max-h-48"/>}
    <div className="flex justify-between mt-2"><button onClick={()=>pr.current.click()} className="text-sm text-terra font-bold">🖼 Add photo</button><input ref={pr} hidden type="file" accept="image/*" onChange={async e=>{if(e.target.files[0])setPimg(await shrink(await rd(e.target.files[0]),900))}}/>
     <button onClick={()=>{if(!txt.trim()&&!pimg)return;addPost({host:user.name,t:txt,img:pimg,w:'just now'});setTxt('');setPimg('')}} className="bg-terra text-white rounded-full px-5 py-2 text-sm font-bold">Post</button></div></div>
   <div className="bg-card border border-line rounded-3xl p-5"><h3 className="serif font-extrabold text-xl mb-2">Your updates</h3><div className="space-y-2">{[...my,...seedPosts(user.name)].map((p,i)=><Post key={i} p={p}/>)}{!my.length&&!seedPosts(user.name).length&&<div className="text-sm text-mute">Nothing posted yet.</div>}</div></div></div>}
  <div className="space-y-6">{reg&&!adding&&<button onClick={()=>setAdding(true)} className="w-full border-2 border-terra text-terra rounded-full py-2 font-bold">＋ Add another listing</button>}
   {reg&&<div className="bg-card border border-line rounded-3xl p-5 overflow-x-auto"><h3 className="serif font-extrabold text-xl mb-2">Your places</h3><table className="w-full text-sm"><tbody>{mine.map(e=><tr key={e.id} className="border-t border-line"><td className="py-2">{e.title}</td><td className="text-gold font-bold">★ {rv(R,e.id).length?avg(R,e.id).toFixed(1):'0'}</td><td>👁 {vw(V,e.id)}</td></tr>)}</tbody></table></div>}
   {reg&&<div className="bg-card border border-line rounded-3xl p-5"><h3 className="serif font-extrabold text-xl mb-2">Guest comments</h3><div className="space-y-2 text-sm max-h-60 overflow-auto">{all.slice(0,8).map((x,i)=><div key={i} className="p-2 rounded-xl bg-cream border border-line"><b>{x.n}</b> <span className="text-gold">{'★'.repeat(x.r)}</span> <span className="text-mute text-xs">on {x.p}</span><div>{x.c}</div></div>)}{!all.length&&<div className="text-mute">0 comments yet</div>}</div></div>}</div></div></div>}

function App(){
 const [user,setUser]=useState(()=>ld('dl_user',null)),[tab,setTab]=useState('explore'),[prov,setProv]=useState('All'),[who,setWho]=useState('sophea'),[lang,setLang]=useState('en'),
 [exps,setExps]=useState(()=>{const d=ld('dl_exps3',null);if(d)return d;sv('dl_exps3',seed);return seed}),
 [plan,setPlanS]=useState(()=>ld('dl_plan',[])),[R,setR]=useState(()=>ld('dl_rev',{})),[V,setV]=useState(()=>ld('dl_views',{})),[posts,setPosts]=useState(()=>ld('dl_posts',[])),
 [sel,setSel]=useState(null),[last,setLast]=useState(null),[hostSel,setHostSel]=useState(null),[toast,setToast]=useState('');const k=KEY;
 const setPlan=p=>{setPlanS(p);sv('dl_plan',p)};const say=m=>{setToast(m);setTimeout(()=>setToast(''),3000)};
 if(!user)return <Login onLogin={u=>{sv('dl_user',u);setUser(u)}}/>;
 const Tab=({id,l})=><button onClick={()=>setTab(id)} className={'px-4 py-3 text-sm font-bold border-b-2 '+(tab===id?'border-terra text-terra':'border-transparent text-mute')}>{l}</button>;
 const trav=user.role==='traveler';const open=e=>{const n={...V,[e.id]:(V[e.id]||0)+1};setV(n);sv('dl_views',n);setSel(e);setLast(e);setHostSel(null)};
 return <div>
  <header className="sticky z-40 bg-card border-b border-line" style={{top:'env(safe-area-inset-top,0px)'}}><div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between gap-3">
   <img src={LOGO} className="h-9" alt="DerLeng"/>
   <div className="text-sm font-bold">{trav?'🌍':'🏡'} {user.name}</div>
   <div className="flex items-center gap-3 text-sm"><button className={lang==='en'?'font-bold text-terra':'text-mute'} onClick={()=>setLang('en')}>EN</button><button className={lang==='km'?'font-bold text-terra':'text-mute'} onClick={()=>setLang('km')}>ខ្មែរ</button><button onClick={()=>{sv('dl_user',null);setUser(null)}} className="text-mute">Log out</button></div></div>
   {trav&&<div className="flex justify-center border-t border-line"><Tab id="explore" l="✦ Explore"/><Tab id="plan" l="📅 My Trip Plan"/><Tab id="booth" l="💌 Create a Memory"/></div>}</header>
  {trav&&tab==='explore'&&<Explore {...{exps,prov,setProv,R,V,lang}} onOpen={open}/>}
  {trav&&tab==='plan'&&<Plan plan={plan} setPlan={setPlan} exps={exps}/>}
  {trav&&tab==='booth'&&<Booth/>}
  {!trav&&<Community user={user} exps={exps} R={R} V={V} posts={posts} addPost={p=>{const n=[p,...posts];setPosts(n);sv('dl_posts',n)}} onPublish={e=>{const n=[e,...exps];setExps(n);sv('dl_exps3',n);say('Published! Your page is open ✨')}}/>}
  {trav&&<Guide who={who} setWho={setWho} k={k} ctx={sel||last} exps={exps}/>}
  {sel&&!hostSel&&<Place e={sel} R={R} V={V} user={user} onClose={()=>setSel(null)} onHost={h=>setHostSel(h)} addRev={(id,r)=>{const n={...R,[id]:[r,...(R[id]||[])]};setR(n);sv('dl_rev',n)}} onPlan={e=>{setPlan([...plan,{id:Date.now(),title:e.title,prov:e.prov,date:'',time:'09:00',note:''}]);say('Added to your trip plan 📅')}}/>}
  {hostSel&&<Host h={hostSel} exps={exps} R={R} V={V} posts={posts} onClose={()=>setHostSel(null)} onOpen={e=>open(e)}/>}
  {toast&&<div className="pop fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-palm text-white px-5 py-3 rounded-full font-bold shadow-xl">{toast}</div>}</div>}
export default App;
