import { useState, useEffect, useCallback, useRef } from "react";

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const C = {
  teal:"#0B6B52", tealMid:"#1D9E75", tealLight:"#E0F5EE", tealPale:"#F0FAF6",
  amber:"#C27A0E", amberMid:"#E8A825", amberLight:"#FDF3DC",
  coral:"#C45230", coralLight:"#FAECE7",
  ink:"#1A1A1A", inkMid:"#3D3D3D", inkSoft:"#6B6B6B",
  border:"#E4E4E4", surface:"#F7F7F5", white:"#FFFFFF",
};
const serif = "'Playfair Display','Georgia',serif";
const sans  = "'Inter',system-ui,sans-serif";

// ─── ACTIVITY ↔ REGION COMPATIBILITY ────────────────────────────────────────
// Maps activity choices to travel styles that support them
const ACT_COMPAT = {
  "water-sports": ["beach"],
  "safari":       ["wildlife"],
  "hike":         ["hills","adventure","wildlife"],
  "surfing":      ["beach"],
  "snorkelling":  ["beach"],
};
// What to suggest when there's a mismatch
const MISMATCH_SUGGESTIONS = {
  "water-sports+hills":   { msg:"Water sports aren't available in the hill country, but Kitulgala (2 hrs from Kandy) has excellent white-water rafting!", fix:"Add Kitulgala Day Trip" },
  "water-sports+cultural":{ msg:"The Cultural Triangle is inland, but you could add a coastal day at Trincomalee (90 min from Anuradhapura) for snorkelling.", fix:"Add Trincomalee beach day" },
  "water-sports+wildlife":{ msg:"Wildlife parks are inland, but Arugam Bay is a short drive from Yala for surf & beach.", fix:"Add Arugam Bay day" },
  "safari+beach":         { msg:"No safari parks on the coast — but Yala National Park is just 2 hrs from Mirissa!", fix:"Add Yala Safari day" },
  "safari+hills":         { msg:"No safari parks in the hills — but Minneriya (elephant gathering) is reachable from Kandy in 2 hrs.", fix:"Add Minneriya day" },
};

// ─── DESTINATION DATA ────────────────────────────────────────────────────────
const DEST_CATS = [
  { id:"beaches",   label:"🏖️ Beaches",       color:[C.tealMid,"#0A8060"] },
  { id:"hills",     label:"⛰️ Hill Country",   color:["#2A6040","#1A3A2A"] },
  { id:"cultural",  label:"🏛️ Cultural",       color:["#B87318","#7A4A0A"] },
  { id:"wildlife",  label:"🐘 Wildlife",        color:["#145840","#0A2A20"] },
  { id:"adventure", label:"🧗 Adventure",       color:["#C45230","#7A2010"] },
  { id:"rural",     label:"🌾 Rural",           color:["#7A6010","#4A3A08"] },
];

const DESTINATIONS = {
  beaches:[
    { name:"Mirissa",        tag:"Whale watching capital",      desc:"A crescent of golden sand fringed with palms. Blue-whale sightings Nov–Apr.",          best:"Nov–Apr", crowd:"Moderate", wiki:"Mirissa" },
    { name:"Unawatuna",      tag:"Coral reef swimming",         desc:"Calm waters for snorkelling. The reef is 200m offshore with sea turtles & parrotfish.", best:"Dec–Mar", crowd:"High",     wiki:"Unawatuna" },
    { name:"Hikkaduwa",      tag:"Surf & reef life",            desc:"Sri Lanka's original beach resort — consistent surf, glass-bottom boats, nesting turtles.", best:"Nov–Apr", crowd:"High",  wiki:"Hikkaduwa" },
    { name:"Tangalle",       tag:"Secluded & serene",           desc:"Undeveloped beach with rock pools, fishing catamarans, extraordinary sunsets.",           best:"Dec–Apr", crowd:"Low",      wiki:"Tangalle" },
    { name:"Arugam Bay",     tag:"East coast surf mecca",       desc:"World-class right-hand point breaks on the east coast — warm and dry when west is wet.",  best:"May–Oct", crowd:"Moderate", wiki:"Arugam Bay" },
    { name:"Nilaveli",       tag:"Pigeon Island snorkelling",   desc:"Crystal waters off the northeast, home to blacktip reef sharks and hawksbill turtles.",   best:"May–Sep", crowd:"Low",      wiki:"Nilaveli" },
  ],
  hills:[
    { name:"Ella",           tag:"Nine Arch Bridge & tea",      desc:"Misty village at 1000m. Walk tea ridges to Little Adam's Peak, watch the steam train.",   best:"Jan–Mar", crowd:"High",     wiki:"Ella, Sri Lanka" },
    { name:"Kandy",          tag:"Cultural heartland",          desc:"Cultural capital in a lush highland bowl. Temple of the Tooth — arrive for evening puja.", best:"Year-round", crowd:"High",  wiki:"Kandy" },
    { name:"Nuwara Eliya",   tag:"'Little England' tea country",desc:"Colonial bungalows, rose gardens, manicured tea estates at 1868m.",                       best:"Mar–May", crowd:"Moderate", wiki:"Nuwara Eliya" },
    { name:"Haputale",       tag:"Off-the-beaten ridge",        desc:"A ridge town with drops on both sides — see the Indian Ocean and highlands simultaneously.", best:"Jan–Apr", crowd:"Low",    wiki:"Haputale" },
    { name:"Horton Plains",  tag:"World's End cliff",           desc:"High-altitude plateau at 2100m with cloud forest and the dramatic 1000m cliff drop.",      best:"Jan–Mar", crowd:"Moderate", wiki:"Horton Plains National Park" },
    { name:"Knuckles Range", tag:"UNESCO wilderness trek",       desc:"UNESCO-listed range — 34 waterfalls, 13 peaks, villages unchanged for centuries.",          best:"Feb–Apr", crowd:"Low",     wiki:"Knuckles Mountain Range" },
  ],
  cultural:[
    { name:"Sigiriya",       tag:"Lion Rock fortress",          desc:"5th-century rock citadel rising 200m from the jungle. Cloud maiden frescoes, mirror wall.", best:"Year-round", crowd:"High", wiki:"Sigiriya" },
    { name:"Anuradhapura",   tag:"Ancient sacred city",         desc:"One of the oldest continuously inhabited cities. The 2300-year-old sacred Bo tree.",       best:"Year-round", crowd:"Moderate", wiki:"Anuradhapura" },
    { name:"Polonnaruwa",    tag:"Medieval capital ruins",       desc:"Compact ruins toured by bicycle in a day. Gal Vihara Buddha sculptures unmissable.",       best:"Year-round", crowd:"Moderate", wiki:"Polonnaruwa" },
    { name:"Dambulla Cave Temple", tag:"Golden Rock sanctuary", desc:"Five cave temples painted floor-to-ceiling with murals, 153 Buddha statues.",              best:"Year-round", crowd:"Moderate", wiki:"Dambulla cave temple" },
    { name:"Galle Fort",     tag:"Dutch colonial ramparts",     desc:"UNESCO 17th-century Dutch fort with cobbled streets and the best café scene in the south.", best:"Nov–Apr", crowd:"High",     wiki:"Galle Fort" },
    { name:"Jaffna",         tag:"Tamil culture & cuisine",     desc:"Sri Lanka's north — Hindu temples with soaring gopurams, the island's spiciest cuisine.",  best:"May–Sep", crowd:"Low",      wiki:"Jaffna" },
  ],
  wildlife:[
    { name:"Yala National Park",    tag:"Highest leopard density",    desc:"World's highest leopard density per km². Sloth bears, crocs, 200+ bird species.",  best:"Feb–Jul", crowd:"High",     wiki:"Yala National Park" },
    { name:"Wilpattu National Park",tag:"Secretive & untouched",      desc:"Sri Lanka's largest park — lakes where leopards and sloth bears appear in silence.", best:"Feb–Oct", crowd:"Low",      wiki:"Wilpattu National Park" },
    { name:"Udawalawe",             tag:"Elephant sanctuary",         desc:"Herds of 30–50 elephants cross the grasslands at dusk. Also the Elephant Transit Home.", best:"Year-round", crowd:"Moderate", wiki:"Udawalawa National Park" },
    { name:"Sinharaja Rainforest",  tag:"UNESCO biosphere reserve",   desc:"Last wet lowland rainforest — 26 of Sri Lanka's 33 endemic birds found here.",     best:"Aug–Sep", crowd:"Low",      wiki:"Sinharaja Forest Reserve" },
    { name:"Minneriya",             tag:"The Gathering",              desc:"300+ wild elephants gather at the Minneriya tank Jul–Oct — largest in Asia.",        best:"Jul–Oct", crowd:"Moderate", wiki:"Minneriya National Park" },
    { name:"Bundala",               tag:"Flamingo wetlands",          desc:"Thousands of migratory flamingos and painted storks. Far quieter than Yala.",        best:"Sep–Mar", crowd:"Low",      wiki:"Bundala National Park" },
  ],
  adventure:[
    { name:"Adam's Peak",           tag:"Sacred pilgrimage climb",    desc:"5,243-step night climb to Sri Lanka's holiest summit. Triangular shadow at sunrise.", best:"Dec–May", crowd:"High",  wiki:"Adam's Peak" },
    { name:"Ella Rock Hike",        tag:"Ridge walk above the clouds",desc:"3-hour hike through tea estates to 360° highland views. Best with a local guide.",   best:"Jan–Apr", crowd:"Moderate", wiki:"Ella Rock" },
    { name:"Kitulgala White Water", tag:"Class 3–4 rapids",           desc:"The Kelani River — filming location of 'Bridge on the River Kwai'. Best rafting.",   best:"May–Dec", crowd:"Moderate", wiki:"Kitulgala" },
    { name:"Pidurutalagala",        tag:"Sri Lanka's highest peak",   desc:"2,524m peak in the Central Highlands — shola forests, cloud forest, open grassland.", best:"Jan–Apr", crowd:"Low",    wiki:"Pidurutalagala" },
    { name:"Kite Surfing, Kalpitiya",tag:"Best kite conditions in Asia","desc":"15–25 knot winds 9 months/year — one of Asia's top kite surfing destinations.", best:"May–Oct", crowd:"Low",    wiki:"Kalpitiya" },
    { name:"Knuckles Camping",      tag:"Multi-day trek & wild camp", desc:"UNESCO Knuckles Range — 2–4 day treks through waterfalls and endemic orchid habitats.", best:"Feb–Apr", crowd:"Low",  wiki:"Knuckles Mountain Range" },
  ],
  rural:[
    { name:"Knuckles Villages",     tag:"Untouched mountain hamlets", desc:"Ancient villages tucked into the UNESCO Knuckles Range — homestays with farming families who still follow centuries-old traditions.", best:"Feb–Apr", crowd:"Low", wiki:"Knuckles Mountain Range" },
    { name:"Weligama Fisher Village",tag:"Dawn fish auction at sea",  desc:"Wake before sunrise to join the famous stilt fishermen. Watch the morning catch auctioned on the beach as the village comes to life.", best:"Nov–Apr", crowd:"Low", wiki:"Weligama" },
    { name:"Dambulla Farming Village",tag:"Paddy fields & spice gardens","desc":"Spend a day with a Sri Lankan farming family — plant paddy, harvest spices, cook over a wood fire and eat together on the floor.", best:"Year-round", crowd:"Low", wiki:"Dambulla" },
    { name:"Mahiyanganaya",         tag:"Vedda indigenous community", desc:"Meet the Vedda people, Sri Lanka's original indigenous inhabitants, who still maintain hunter-gatherer traditions in the jungle.", best:"Year-round", crowd:"Low", wiki:"Mahiyanganaya" },
    { name:"Belihuloya Valley",     tag:"Hidden river valley retreat",desc:"A little-known valley of paddy terraces, waterfalls and spice plantations near Ratnapura. Completely off the tourist trail.", best:"Year-round", crowd:"Low", wiki:"Belihuloya" },
    { name:"Tangalle Village Coast",tag:"Fishing village life",       desc:"Behind Tangalle's famous beach lies a maze of lagoon-side fishing villages — catamarans, crab baskets and roadside coconut sellers.", best:"Dec–Apr", crowd:"Low", wiki:"Tangalle" },
  ],
};

// ─── GUIDE DATA ──────────────────────────────────────────────────────────────
const GUIDES = [
  { id:1, initials:"CP", g1:"#9FE1CB", g2:"#1D9E75", gtxt:"#04342C",
    name:"Chaminda Perera", specialty:"Beach & Coastal Expert",
    areas:"Southern Coast · East Coast · Trincomalee", langs:"English · Sinhala · German",
    exp:8, rating:4.9, reviews:47, ministry:true,
    bio:"Chaminda grew up in Galle and has spent 8 years sharing the magic of Sri Lanka's coastline. From secret surf spots to whale-watching expeditions, his southern and eastern shore knowledge is unmatched. He holds a first-aid certification and is fluent in three languages.",
    tours:["Southern Coast Grand Tour","Whale Watching Day","East Coast Sunrise Drive","Galle Fort History Walk"],
    rev1:{ who:"James T. — United Kingdom", stars:5, text:"Chaminda took us to a secret snorkelling bay not in any guidebook. His passion for Sri Lanka is infectious." },
    rev2:{ who:"Lisa K. — Germany", stars:5, text:"Sehr freundlich und professionell! Wir empfehlen ihn wärmstens weiter — best guide we've ever had." },
  },
  { id:2, initials:"NF", g1:"#FAC775", g2:"#C27A0E", gtxt:"#2C1800",
    name:"Nalini Fernando", specialty:"Hill Country & Tea Trails",
    areas:"Kandy · Nuwara Eliya · Ella · Haputale", langs:"English · Tamil · French",
    exp:6, rating:4.8, reviews:32, ministry:true,
    bio:"Nalini was born in Kandy and grew up among the misty tea estates of the Central Highlands. She studied tourism at the University of Peradeniya and specialises in culturally immersive experiences — tea factory visits, temple ceremonies, village homestays.",
    tours:["Ella Train & Nine Arch Bridge","Tea Plucking Experience","Kandy Temple of Tooth","Knuckles Mountain Trek"],
    rev1:{ who:"Sophie M. — France", stars:5, text:"Nalini est une guide extraordinaire. Elle nous a fait découvrir des endroits magnifiques loin des sentiers battus." },
    rev2:{ who:"Aarav S. — India", stars:5, text:"Our Ella trip was perfect. Nalini timed the train ride perfectly and knew every viewpoint." },
  },
  { id:3, initials:"RJ", g1:"#F5C4B3", g2:"#C45230", gtxt:"#3A1208",
    name:"Ruwan Jayasinghe", specialty:"Ancient Cities & Cultural Triangle",
    areas:"Sigiriya · Anuradhapura · Polonnaruwa · Dambulla", langs:"English · Sinhala · Japanese",
    exp:11, rating:5.0, reviews:89, ministry:true,
    bio:"A licensed archaeologist and historian with 11 years guiding the Cultural Triangle. Ruwan brings ancient cities to life with stories not in any textbook. He has been featured in two travel documentaries and holds a government gold-star certification.",
    tours:["Sigiriya Dawn Climb","Anuradhapura Full Day","Polonnaruwa Bicycle Tour","Dambulla Cave & Sunset"],
    rev1:{ who:"Yuki T. — Japan", stars:5, text:"Ruwan-san's knowledge is incredible — he made Sigiriya feel like a living story set in the time of ancient kings." },
    rev2:{ who:"Michael B. — United States", stars:5, text:"Best tour guide I've ever had, anywhere. His archaeology knowledge is mind-blowing." },
  },
  { id:4, initials:"AS", g1:"#CECBF6", g2:"#534AB7", gtxt:"#1A1750",
    name:"Amara Silva", specialty:"Wildlife & Rainforest",
    areas:"Yala · Wilpattu · Sinharaja · Udawalawe", langs:"English · Sinhala",
    exp:5, rating:4.7, reviews:28, ministry:true,
    bio:"Amara holds a BSc in Wildlife Biology from the University of Sri Jayewardenepura. She leads educational safari experiences giving visitors deep understanding of Sri Lanka's extraordinary biodiversity — leopards, elephants, and 200+ endemic bird species.",
    tours:["Yala Leopard Safari","Wilpattu Wilderness Drive","Sinharaja Rainforest Walk","Udawalawe Elephant Camp"],
    rev1:{ who:"Emma R. — Netherlands", stars:5, text:"Amara spotted a leopard cub sleeping in a tree from 200m away! Her love of wildlife is beautiful." },
    rev2:{ who:"David L. — Australia", stars:5, text:"Sinharaja with Amara was the highlight of our whole trip — 34 bird species in one morning!" },
  },
];

// ─── TINY HELPERS ────────────────────────────────────────────────────────────
function Av({ g, size=52, r=14 }) {
  return (
    <div style={{ width:size, height:size, borderRadius:r, flexShrink:0,
      background:`linear-gradient(135deg,${g.g1},${g.g2})`,
      display:"flex", alignItems:"center", justifyContent:"center",
      fontFamily:serif, fontWeight:700, fontSize:size*0.34, color:g.gtxt }}>{g.initials}</div>
  );
}
function Pill({ children, amber, green }) {
  return (
    <span style={{ fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:20,
      background:amber?C.amberLight:green?"#EBF5D8":C.tealLight,
      color:amber?C.amber:green?"#3A6B10":C.teal,
      border:`1px solid ${amber?"#F0D48A":green?"#C1DB8E":"#9FE1CB"}` }}>{children}</span>
  );
}
function Stars({ n }) { return <span style={{color:C.amberMid}}>{"★".repeat(n)}</span>; }
function Btn({ onClick, children, variant="teal", full, style:xtra={} }) {
  const bg  = variant==="amber"?C.amber:variant==="outline"?"transparent":C.teal;
  const clr = variant==="outline"?C.inkSoft:"#fff";
  const brd = variant==="outline"?`1.5px solid ${C.border}`:"none";
  return (
    <button onClick={onClick} style={{ padding:"11px 26px", background:bg, color:clr, border:brd,
      borderRadius:12, fontSize:14, fontWeight:600, cursor:"pointer", width:full?"100%":undefined,
      fontFamily:sans, transition:"opacity .15s", ...xtra }}
      onMouseEnter={e=>e.currentTarget.style.opacity="0.82"}
      onMouseLeave={e=>e.currentTarget.style.opacity="1"}>{children}</button>
  );
}

// ─── UNSPLASH IMAGE HELPER ───────────────────────────────────────────────────
// Curated search keywords per destination for high-quality results
const UNSPLASH_KEYWORDS = {
  // Beaches
  "Mirissa":        "mirissa-beach-sri-lanka",
  "Unawatuna":      "unawatuna-beach-sri-lanka",
  "Hikkaduwa":      "hikkaduwa-beach-sri-lanka",
  "Tangalle":       "tangalle-beach-sri-lanka",
  "Arugam Bay":     "arugam-bay-surfing-sri-lanka",
  "Nilaveli":       "nilaveli-beach-trincomalee",
  // Hills
  "Ella":           "ella-sri-lanka-mountains",
  "Kandy":          "kandy-sri-lanka-temple",
  "Nuwara Eliya":   "nuwara-eliya-tea-plantation",
  "Haputale":       "haputale-sri-lanka-misty",
  "Horton Plains":  "horton-plains-sri-lanka",
  "Knuckles Range": "knuckles-mountain-sri-lanka",
  // Cultural
  "Sigiriya":       "sigiriya-rock-fortress-sri-lanka",
  "Anuradhapura":   "anuradhapura-ancient-city-sri-lanka",
  "Polonnaruwa":    "polonnaruwa-ruins-sri-lanka",
  "Dambulla Cave Temple":"dambulla-cave-temple-sri-lanka",
  "Galle Fort":     "galle-fort-sri-lanka",
  "Jaffna":         "jaffna-sri-lanka",
  // Wildlife
  "Yala National Park":     "yala-leopard-safari-sri-lanka",
  "Wilpattu National Park": "wilpattu-national-park-sri-lanka",
  "Udawalawe":              "udawalawe-elephants-sri-lanka",
  "Sinharaja Rainforest":   "sinharaja-rainforest-sri-lanka",
  "Minneriya":              "minneriya-elephants-gathering",
  "Bundala":                "bundala-wetlands-flamingos",
  // Adventure
  "Adam's Peak":            "adams-peak-sri-lanka-pilgrimage",
  "Ella Rock Hike":         "ella-rock-hike-sri-lanka",
  "Kitulgala White Water":  "kitulgala-white-water-rafting",
  "Pidurutalagala":         "sri-lanka-mountain-peak",
  "Kite Surfing, Kalpitiya":"kalpitiya-kite-surfing-sri-lanka",
  "Knuckles Camping":       "knuckles-range-trekking-sri-lanka",
  // Rural
  "Knuckles Villages":      "sri-lanka-village-rural-life",
  "Weligama Fisher Village":"weligama-stilt-fishermen-sri-lanka",
  "Dambulla Farming Village":"sri-lanka-paddy-field-farming",
  "Mahiyanganaya":          "sri-lanka-indigenous-village",
  "Belihuloya Valley":      "sri-lanka-river-valley-nature",
  "Tangalle Village Coast": "tangalle-fishing-village-sri-lanka",
};

// Get a beautiful Unsplash image URL for a place
function getUnsplashUrl(placeName, width=800, height=500) {
  const keyword = UNSPLASH_KEYWORDS[placeName]
    || placeName.toLowerCase().replace(/\s+/g,"-") + "-sri-lanka";
  return `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(keyword)}`;
}

// Get multiple Unsplash gallery images with slight variation
function getUnsplashGallery(placeName, count=6) {
  const keyword = UNSPLASH_KEYWORDS[placeName]
    || placeName.toLowerCase().replace(/\s+/g,"-") + "-sri-lanka";
  return Array.from({length:count}, (_,i) =>
    `https://source.unsplash.com/800x500/?${encodeURIComponent(keyword)}&sig=${i}`
  );
}

// ─── WIKIPEDIA IMAGE HOOK (kept as fallback for activity rows) ───────────────
function useWikiImages(title, count=6) {
  const [imgs, setImgs] = useState([]);
  const [thumb, setThumb] = useState(null);
  const cache = useRef({});

  useEffect(() => {
    if (!title) return;
    // Use Unsplash first if we have a curated keyword
    const unsplashThumb = getUnsplashUrl(title);
    const unsplashImgs  = getUnsplashGallery(title, count);
    setThumb(unsplashThumb);
    setImgs(unsplashImgs);
    cache.current[title] = { thumb:unsplashThumb, imgs:unsplashImgs };
  }, [title]);

  return { thumb, imgs };
}

// ─── PLACE CARD (with Wikipedia cover photo) ─────────────────────────────────
function PlaceCard({ p, catColor, onGallery, onPlanTrip }) {
  const { thumb } = useWikiImages(p.wiki, 1);
  const crowdColor  = { Low:"#3A6B10", Moderate:C.amber, High:C.coral };
  const crowdBg     = { Low:"#EBF5D8", Moderate:C.amberLight, High:C.coralLight };
  const crowdBorder = { Low:"#C1DB8E", Moderate:"#F0D48A", High:"#EFBAA8" };

  return (
    <div style={{ border:`1.5px solid ${C.border}`, borderRadius:20, overflow:"hidden", background:C.white, transition:"box-shadow .2s,transform .2s", cursor:"pointer" }}
      onMouseEnter={e=>{ e.currentTarget.style.boxShadow="0 8px 32px rgba(0,0,0,.12)"; e.currentTarget.style.transform="translateY(-3px)"; }}
      onMouseLeave={e=>{ e.currentTarget.style.boxShadow="none"; e.currentTarget.style.transform="none"; }}
      onClick={()=>onGallery(p)}>
      {/* Photo header */}
      <div style={{ height:160, background:`linear-gradient(135deg,${catColor[0]},${catColor[1]})`, position:"relative", overflow:"hidden" }}>
        {thumb
          ? <img src={thumb} alt={p.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>e.target.style.display="none"} />
          : <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:52, opacity:.25 }}>
              {DEST_CATS.find(c=>c.color===catColor||true)?.label?.split(" ")[0]||"📍"}
            </div>
        }
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(0,0,0,.6) 0%,transparent 55%)" }}/>
        <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"12px 16px" }}>
          <div style={{ fontFamily:serif, fontSize:18, fontWeight:700, color:"#fff" }}>{p.name}</div>
        </div>
        <div style={{ position:"absolute", top:10, right:10, background:"rgba(0,0,0,.45)", backdropFilter:"blur(4px)", color:"#fff", fontSize:10, fontWeight:600, padding:"3px 8px", borderRadius:20 }}>
          🖼️ Gallery
        </div>
      </div>
      <div style={{ padding:"14px 16px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
          <Pill>{p.tag}</Pill>
          <span style={{ fontSize:11, fontWeight:600, padding:"3px 8px", borderRadius:20, background:crowdBg[p.crowd], color:crowdColor[p.crowd], border:`1px solid ${crowdBorder[p.crowd]}` }}>{p.crowd} crowds</span>
        </div>
        <p style={{ fontSize:13, color:C.inkSoft, lineHeight:1.65, marginBottom:12 }}>{p.desc}</p>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", paddingTop:10, borderTop:`1px solid ${C.border}` }}>
          <span style={{ fontSize:12, color:C.inkSoft }}>📅 Best: <strong style={{ color:C.ink }}>{p.best}</strong></span>
          <button onClick={e=>{ e.stopPropagation(); onPlanTrip(); }} style={{ fontSize:12, fontWeight:600, color:C.teal, background:"none", border:"none", cursor:"pointer", fontFamily:sans }}>Plan trip →</button>
        </div>
      </div>
    </div>
  );
}

// ─── GALLERY LIGHTBOX ────────────────────────────────────────────────────────
function GalleryLightbox({ place, onClose }) {
  const { imgs, thumb } = useWikiImages(place?.wiki, 8);
  const [sel, setSel] = useState(0);
  const allImgs = imgs.length ? imgs : (thumb ? [thumb] : []);

  useEffect(()=>{ setSel(0); }, [place]);
  useEffect(()=>{
    const handler = e => { if(e.key==="Escape") onClose(); if(e.key==="ArrowRight") setSel(s=>Math.min(s+1,allImgs.length-1)); if(e.key==="ArrowLeft") setSel(s=>Math.max(s-1,0)); };
    window.addEventListener("keydown", handler);
    return ()=>window.removeEventListener("keydown", handler);
  }, [allImgs, onClose]);

  if (!place) return null;

  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,.88)", zIndex:900,
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      backdropFilter:"blur(6px)", padding:16,
    }}>
      {/* Header */}
      <div style={{ width:"100%", maxWidth:900, display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <div>
          <div style={{ fontFamily:serif, fontSize:22, fontWeight:700, color:"#fff" }}>{place.name}</div>
          <div style={{ fontSize:12, color:"rgba(255,255,255,.6)", marginTop:3 }}>{place.tag}</div>
        </div>
        <button onClick={onClose} style={{ width:36, height:36, borderRadius:"50%", border:"1px solid rgba(255,255,255,.3)", background:"rgba(255,255,255,.1)", color:"#fff", fontSize:16, cursor:"pointer" }}>✕</button>
      </div>

      {/* Main image */}
      <div style={{ width:"100%", maxWidth:900, flex:1, maxHeight:480, borderRadius:16, overflow:"hidden", position:"relative", background:"#111", marginBottom:12 }}>
        {allImgs.length > 0 ? (
          <img src={allImgs[sel]} alt={place.name} style={{ width:"100%", height:"100%", objectFit:"contain" }} />
        ) : (
          <div style={{ height:"100%", display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,.3)", fontSize:48 }}>🏞️</div>
        )}
        {/* Nav arrows */}
        {sel > 0 && <button onClick={()=>setSel(s=>s-1)} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", width:40, height:40, borderRadius:"50%", border:"none", background:"rgba(0,0,0,.5)", color:"#fff", fontSize:18, cursor:"pointer" }}>‹</button>}
        {sel < allImgs.length-1 && <button onClick={()=>setSel(s=>s+1)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", width:40, height:40, borderRadius:"50%", border:"none", background:"rgba(0,0,0,.5)", color:"#fff", fontSize:18, cursor:"pointer" }}>›</button>}
        <div style={{ position:"absolute", bottom:10, right:14, background:"rgba(0,0,0,.5)", color:"#fff", fontSize:11, padding:"3px 8px", borderRadius:12 }}>{sel+1} / {allImgs.length||"…"}</div>
      </div>

      {/* Thumbnail strip */}
      {allImgs.length > 1 && (
        <div style={{ display:"flex", gap:8, overflowX:"auto", maxWidth:900, width:"100%", paddingBottom:4 }}>
          {allImgs.map((img,i)=>(
            <div key={i} onClick={()=>setSel(i)} style={{ width:70, height:50, flexShrink:0, borderRadius:8, overflow:"hidden", cursor:"pointer", border:`2.5px solid ${i===sel?"#fff":"transparent"}`, opacity:i===sel?1:.65, transition:"opacity .15s" }}>
              <img src={img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── MOBILE CSS INJECTION ────────────────────────────────────────────────────
const MOBILE_CSS = `
  * { box-sizing: border-box; }

  /* Desktop nav links hidden on mobile — hamburger shows instead */
  .desktop-nav { display: flex !important; }

  @media (max-width: 768px) {
    .desktop-nav { display: none !important; }
    .services-grid { grid-template-columns: 1fr !important; }
    .dest-grid-5 { grid-template-columns: 1fr 1fr !important; }
    .dest-grid-4 { grid-template-columns: 1fr 1fr !important; }
    .why-grid { grid-template-columns: 1fr 1fr !important; }
    .footer-top { flex-direction: column !important; }
    .footer-links { flex-wrap: wrap !important; gap: 1.5rem !important; }
    .hero-stats { flex-wrap: wrap !important; gap: 1.5rem !important; justify-content: center !important; }
    .guide-drawer { width: 100% !important; }
    .opt-grid-2 { grid-template-columns: 1fr !important; }
    .info-2col { grid-template-columns: 1fr !important; }
    .cheat-grid { grid-template-columns: 1fr !important; }
    .itin-banner-row { flex-direction: column !important; }
  }

  @media (max-width: 480px) {
    .dest-grid-5 { grid-template-columns: 1fr !important; }
    .why-grid { grid-template-columns: 1fr !important; }
    .hero-stats { gap: 1rem !important; }
  }

  /* Bigger touch targets on mobile */
  @media (max-width: 768px) {
    button { min-height: 44px; }
    input, select { min-height: 44px; font-size: 16px !important; }
  }

  html { scroll-behavior: smooth; }
`;

function MobileStyles() {
  return <style>{MOBILE_CSS}</style>;
}

// ─── NAV ─────────────────────────────────────────────────────────────────────
// ─── NAV DROPDOWN DATA ───────────────────────────────────────────────────────
const NAV_DEST_CATS = [
  { id:"hotels",    icon:"🏨", label:"Hotels",           desc:"Luxury to budget stays" },
  { id:"restaurants",icon:"🍛",label:"Restaurants",      desc:"Local & international cuisine" },
  { id:"places",    icon:"🏛️", label:"Places to Visit",  desc:"Landmarks & attractions" },
  { id:"adventure", icon:"🧗", label:"Adventure Sites",  desc:"Thrills & outdoor activities" },
  { id:"beaches",   icon:"🏖️", label:"Beaches",          desc:"Coastline & water" },
  { id:"cultural",  icon:"🕌", label:"Cultural Sites",   desc:"History & heritage" },
];

function Nav({ page, setPage, onGuideOpen }) {
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [destHover, setDestHover] = useState(false);
  const hoverTimer = useRef(null);

  const openDest = (catId) => {
    setPage("explore");
    setDestHover(false);
    setMenuOpen(false);
    // Store category in sessionStorage so ExplorePage can read it
    sessionStorage.setItem("explorecat", catId);
  };

  const handleDestEnter = () => { clearTimeout(hoverTimer.current); setDestHover(true); };
  const handleDestLeave = () => { hoverTimer.current = setTimeout(()=>setDestHover(false), 200); };

  return (
    <>
      <nav style={{ position:"sticky", top:0, zIndex:400, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 1.5rem", height:64, background:"rgba(255,255,255,0.96)", backdropFilter:"blur(14px)", borderBottom:`1px solid rgba(0,0,0,0.06)` }}>
        <div onClick={()=>{ setPage("home"); setMenuOpen(false); }} style={{ cursor:"pointer", fontFamily:serif, fontSize:20, fontWeight:700, color:C.ink, flexShrink:0 }}>
          Ceylon<span style={{ color:C.tealMid }}>Trails</span>
          <sup style={{ fontFamily:sans, fontSize:9, color:C.amber, letterSpacing:1, textTransform:"uppercase", verticalAlign:"super", marginLeft:1 }}>LK</sup>
        </div>

        {/* Desktop nav */}
        <div className="desktop-nav" style={{ display:"flex", gap:"1.6rem", alignItems:"center" }}>
          <span onClick={()=>{ setPage("home"); setMenuOpen(false); }} style={{ fontSize:14, color:page==="home"?C.teal:C.inkSoft, fontWeight:page==="home"?600:400, cursor:"pointer", borderBottom:page==="home"?`2px solid ${C.teal}`:"2px solid transparent", paddingBottom:2 }}>Home</span>

          {/* Destinations with dropdown */}
          <div style={{ position:"relative" }} onMouseEnter={handleDestEnter} onMouseLeave={handleDestLeave}>
            <span style={{ fontSize:14, color:["destinations","explore"].includes(page)?C.teal:C.inkSoft, fontWeight:["destinations","explore"].includes(page)?600:400, cursor:"pointer", borderBottom:["destinations","explore"].includes(page)?`2px solid ${C.teal}`:"2px solid transparent", paddingBottom:2, display:"flex", alignItems:"center", gap:4, userSelect:"none" }}
              onClick={()=>setPage("destinations")}>
              Destinations <span style={{ fontSize:10, opacity:.6 }}>▾</span>
            </span>
            {destHover && (
              <div style={{ position:"absolute", top:"calc(100% + 14px)", left:"50%", transform:"translateX(-50%)", background:"#fff", borderRadius:16, boxShadow:"0 8px 40px rgba(0,0,0,.15)", border:`1px solid ${C.border}`, padding:12, width:360, zIndex:500, display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                {/* Arrow */}
                <div style={{ position:"absolute", top:-7, left:"50%", transform:"translateX(-50%)", width:14, height:14, background:"#fff", border:`1px solid ${C.border}`, borderBottom:"none", borderRight:"none", transform:"translateX(-50%) rotate(45deg)" }}/>
                {NAV_DEST_CATS.map(cat=>(
                  <div key={cat.id} onClick={()=>openDest(cat.id)} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10, cursor:"pointer", transition:"background .15s" }}
                    onMouseEnter={e=>e.currentTarget.style.background=C.tealPale}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <span style={{ fontSize:22, flexShrink:0 }}>{cat.icon}</span>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:C.ink }}>{cat.label}</div>
                      <div style={{ fontSize:11, color:C.inkSoft }}>{cat.desc}</div>
                    </div>
                  </div>
                ))}
                <div onClick={()=>{ setPage("destinations"); setDestHover(false); }} style={{ gridColumn:"1/-1", padding:"8px 12px", borderTop:`1px solid ${C.border}`, marginTop:4, textAlign:"center", fontSize:12, fontWeight:600, color:C.teal, cursor:"pointer" }}>
                  Browse all destinations →
                </div>
              </div>
            )}
          </div>

          <span onClick={()=>setPage("srilankamap")} style={{ fontSize:14, color:page==="srilankamap"?C.teal:C.inkSoft, fontWeight:page==="srilankamap"?600:400, cursor:"pointer", borderBottom:page==="srilankamap"?`2px solid ${C.teal}`:"2px solid transparent", paddingBottom:2, whiteSpace:"nowrap" }}>Sri Lanka Map</span>
          <span onClick={()=>setPage("journey")} style={{ fontSize:14, color:page==="journey"?C.teal:C.inkSoft, fontWeight:page==="journey"?600:400, cursor:"pointer", borderBottom:page==="journey"?`2px solid ${C.teal}`:"2px solid transparent", paddingBottom:2, whiteSpace:"nowrap" }}>Plan a trip</span>
          <span onClick={onGuideOpen} style={{ fontSize:14, color:C.inkSoft, cursor:"pointer", paddingBottom:2, whiteSpace:"nowrap" }}>Find a Guide</span>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={()=>setPage("journey")} style={{ padding:"9px 18px", background:C.teal, color:"#fff", border:"none", borderRadius:12, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:sans, whiteSpace:"nowrap" }}>Plan my trip</button>
          <button onClick={()=>setMenuOpen(o=>!o)} style={{ display:"flex", flexDirection:"column", gap:5, padding:8, background:"none", border:`1px solid ${C.border}`, borderRadius:10, cursor:"pointer" }} aria-label="Menu">
            <span style={{ width:20, height:2, background:menuOpen?C.teal:C.ink, borderRadius:2 }}/>
            <span style={{ width:20, height:2, background:menuOpen?C.teal:C.ink, borderRadius:2 }}/>
            <span style={{ width:20, height:2, background:menuOpen?C.teal:C.ink, borderRadius:2 }}/>
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div style={{ position:"fixed", top:64, left:0, right:0, zIndex:399, background:"#fff", borderBottom:`1px solid ${C.border}`, boxShadow:"0 8px 24px rgba(0,0,0,.1)", padding:"1rem 1.5rem 1.5rem", maxHeight:"80vh", overflowY:"auto" }}>
          {[["home","🏠 Home"],["destinations","🗺️ Destinations"],["srilankamap","🗺️ Sri Lanka Map"],["journey","✨ Plan a trip"],["guides","🧭 Find a Guide"]].map(([p,l])=>(
            <div key={p} onClick={()=>{ if(p==="guides") onGuideOpen(); else setPage(p); setMenuOpen(false); }}
              style={{ padding:"14px 0", fontSize:16, fontWeight:page===p?600:400, color:page===p?C.teal:C.ink, cursor:"pointer", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:10 }}>
              {l}
            </div>
          ))}
          <div style={{ marginTop:10 }}>
            <p style={{ fontSize:12, fontWeight:600, color:C.inkSoft, textTransform:"uppercase", letterSpacing:1, margin:"8px 0" }}>Explore by category</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {NAV_DEST_CATS.map(cat=>(
                <div key={cat.id} onClick={()=>{ openDest(cat.id); setMenuOpen(false); }} style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 12px", background:C.surface, borderRadius:10, cursor:"pointer", border:`1px solid ${C.border}` }}>
                  <span>{cat.icon}</span>
                  <span style={{ fontSize:13, fontWeight:600, color:C.ink }}>{cat.label}</span>
                </div>
              ))}
            </div>
          </div>
          <button onClick={()=>{ setPage("journey"); setMenuOpen(false); }} style={{ marginTop:14, width:"100%", padding:"14px", background:C.teal, color:"#fff", border:"none", borderRadius:12, fontSize:15, fontWeight:600, cursor:"pointer", fontFamily:sans }}>✨ Create my journey</button>
        </div>
      )}
    </>
  );
}

// ─── HERO SVG ART ────────────────────────────────────────────────────────────
function HeroArt() {
  return (
    <div style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden" }}>
      <svg style={{ position:"absolute", right:"6%", top:"8%", width:150, opacity:.18 }} viewBox="0 0 160 220" fill="none">
        <rect x="55" y="80" width="50" height="130" rx="4" fill="#FAC775"/><polygon points="55,80 80,20 105,80" fill="#E8A825"/>
        <rect x="68" y="110" width="10" height="14" rx="2" fill="#0B6B52"/><rect x="82" y="110" width="10" height="14" rx="2" fill="#0B6B52"/>
        <ellipse cx="30" cy="190" rx="18" ry="22" fill="#1D9E75"/><ellipse cx="130" cy="188" rx="16" ry="20" fill="#1D9E75"/>
      </svg>
      <svg style={{ position:"absolute", left:"4%", bottom:"22%", width:110, opacity:.18 }} viewBox="0 0 120 100" fill="none">
        <ellipse cx="65" cy="60" rx="40" ry="28" fill="#FAC775"/><ellipse cx="30" cy="55" rx="18" ry="14" fill="#FAC775"/>
        <path d="M18 62 Q8 75 12 85 Q14 90 18 88" stroke="#E8A825" strokeWidth="5" fill="none" strokeLinecap="round"/>
        <ellipse cx="22" cy="50" rx="10" ry="12" fill="#E8A825"/><circle cx="24" cy="53" r="2.5" fill="#0B6B52"/>
        <rect x="42" y="82" width="12" height="18" rx="4" fill="#E8A825"/><rect x="58" y="82" width="12" height="18" rx="4" fill="#E8A825"/>
        <rect x="74" y="82" width="12" height="18" rx="4" fill="#E8A825"/><rect x="88" y="82" width="12" height="18" rx="4" fill="#E8A825"/>
      </svg>
      <svg style={{ position:"absolute", left:"13%", top:"7%", width:86, opacity:.17 }} viewBox="0 0 100 150" fill="none">
        <ellipse cx="50" cy="80" rx="36" ry="44" fill="#FAC775"/><rect x="28" y="110" width="44" height="18" rx="2" fill="#E8A825"/>
        <rect x="20" y="128" width="60" height="10" rx="2" fill="#E8A825"/><rect x="46" y="20" width="8" height="60" rx="2" fill="#E8A825"/>
        <polygon points="42,30 50,8 58,30" fill="#FAC775"/>
      </svg>
      <svg style={{ position:"absolute", right:"2%", bottom:"10%", width:78, opacity:.17 }} viewBox="0 0 90 160" fill="none">
        <rect x="40" y="60" width="10" height="100" rx="3" fill="#E8A825"/>
        <path d="M45,60 Q20,40 5,50" stroke="#1D9E75" strokeWidth="6" fill="none" strokeLinecap="round"/>
        <path d="M45,60 Q70,38 82,44" stroke="#1D9E75" strokeWidth="6" fill="none" strokeLinecap="round"/>
        <path d="M45,60 Q30,30 35,15" stroke="#1D9E75" strokeWidth="6" fill="none" strokeLinecap="round"/>
        <path d="M45,60 Q60,30 55,15" stroke="#1D9E75" strokeWidth="6" fill="none" strokeLinecap="round"/>
      </svg>
      <svg style={{ position:"absolute", left:0, bottom:0, width:"55%", height:"30%", opacity:.1 }} viewBox="0 0 500 200" preserveAspectRatio="none" fill="none">
        <path d="M0,200 Q50,100 120,130 Q180,80 260,110 Q320,60 400,90 Q450,70 500,100 L500,200 Z" fill="#1D9E75"/>
        <path d="M0,200 Q80,140 150,160 Q220,110 300,140 Q370,100 440,130 L500,140 L500,200 Z" fill="#0B6B52"/>
      </svg>
      <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:.04 }}>
        <defs><pattern id="dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="white"/></pattern></defs>
        <rect width="100%" height="100%" fill="url(#dots)"/>
      </svg>
    </div>
  );
}

// ─── HOME PAGE ───────────────────────────────────────────────────────────────
function HomePage({ setPage, onGuideOpen }) {
  return (
    <div>
      <section style={{ position:"relative", minHeight:"92vh", background:"linear-gradient(160deg,#04322A 0%,#0B6B52 38%,#147856 60%,#9C6A10 100%)", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", padding:"6rem 2rem 5rem" }}>
        <HeroArt />
        <div style={{ position:"relative", zIndex:2, textAlign:"center", maxWidth:720 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(255,255,255,.12)", border:"1px solid rgba(255,255,255,.22)", borderRadius:40, padding:"6px 16px", fontSize:12, fontWeight:500, color:"rgba(255,255,255,.9)", letterSpacing:"0.5px", textTransform:"uppercase", marginBottom:28 }}>
            <span style={{ width:6, height:6, background:C.amberMid, borderRadius:"50%", display:"inline-block" }}/> Pearl of the Indian Ocean
          </div>
          <h1 style={{ fontFamily:serif, fontSize:"clamp(38px,6vw,62px)", fontWeight:700, color:"#fff", lineHeight:1.1, marginBottom:22 }}>
            Discover<br/><span style={{ color:C.amberMid, fontStyle:"italic" }}>Sri Lanka</span><br/>your way
          </h1>
          <p style={{ fontSize:17, color:"rgba(255,255,255,.75)", maxWidth:520, margin:"0 auto 36px", lineHeight:1.7, fontWeight:300 }}>
            AI-crafted journeys or certified local guides — tailored to exactly how you want to explore.
          </p>
          <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
            <button onClick={()=>setPage("journey")} style={{ padding:"14px 32px", background:C.amberMid, color:"#2C1800", fontSize:15, fontWeight:600, border:"none", borderRadius:12, cursor:"pointer", boxShadow:"0 4px 20px rgba(232,168,37,.4)", fontFamily:sans }}>✨ Create my journey</button>
            <button onClick={onGuideOpen} style={{ padding:"14px 32px", background:"rgba(255,255,255,.1)", color:"#fff", fontSize:15, fontWeight:500, border:"1px solid rgba(255,255,255,.35)", borderRadius:12, cursor:"pointer", backdropFilter:"blur(8px)", fontFamily:sans }}>Browse guides</button>
          </div>
          <div className="hero-stats" style={{ display:"flex", justifyContent:"center", gap:"3rem", marginTop:"4rem", paddingTop:"2.5rem", borderTop:"1px solid rgba(255,255,255,.12)" }}>
            {[["200+","Destinations"],["150+","Certified guides"],["4.9★","Avg rating"],["12K+","Travellers"]].map(([n,l])=>(
              <div key={l} style={{ textAlign:"center" }}>
                <div style={{ fontFamily:serif, fontSize:28, fontWeight:700, color:C.amberMid, lineHeight:1 }}>{n}</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,.55)", marginTop:4, textTransform:"uppercase", letterSpacing:"0.8px" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section style={{ padding:"6rem 2rem", background:C.white }}>
        <div style={{ textAlign:"center", marginBottom:"3.5rem" }}>
          <div style={{ fontSize:11, fontWeight:600, color:C.tealMid, textTransform:"uppercase", letterSpacing:2, marginBottom:10 }}>Our services</div>
          <h2 style={{ fontFamily:serif, fontSize:"clamp(28px,4vw,42px)", fontWeight:700, color:C.ink, marginBottom:14 }}>How would you like to explore?</h2>
        </div>
        <div className="services-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.5rem", maxWidth:900, margin:"0 auto" }}>
          <div onClick={()=>setPage("journey")} style={{ borderRadius:24, padding:"3rem 2.5rem", cursor:"pointer", background:"linear-gradient(145deg,#E6F8F2,#C8EFE2)", border:"1px solid #B2E5D0", transition:"transform .2s,box-shadow .2s" }}
            onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow="0 12px 40px rgba(0,0,0,.12)"; }}
            onMouseLeave={e=>{ e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}>
            <div style={{ width:64, height:64, borderRadius:18, background:"rgba(29,158,117,.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:30, marginBottom:20 }}>🗺️</div>
            <div style={{ display:"flex", gap:6, marginBottom:14 }}><Pill>AI-powered</Pill><Pill>Personalised</Pill></div>
            <h3 style={{ fontFamily:serif, fontSize:24, fontWeight:700, color:C.ink, marginBottom:10 }}>Create your journey</h3>
            <p style={{ fontSize:14, color:C.inkSoft, lineHeight:1.7, marginBottom:24 }}>Answer a few questions and get a day-by-day itinerary crafted by AI — real restaurants, trails, and hidden gems.</p>
            <Btn onClick={e=>{ e.stopPropagation(); setPage("journey"); }}>Get started →</Btn>
          </div>
          <div onClick={onGuideOpen} style={{ borderRadius:24, padding:"3rem 2.5rem", cursor:"pointer", background:"linear-gradient(145deg,#FDF5E0,#FAE8BA)", border:"1px solid #F0D48A", transition:"transform .2s,box-shadow .2s" }}
            onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow="0 12px 40px rgba(0,0,0,.12)"; }}
            onMouseLeave={e=>{ e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}>
            <div style={{ width:64, height:64, borderRadius:18, background:"rgba(194,122,14,.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:30, marginBottom:20 }}>🧭</div>
            <div style={{ display:"flex", gap:6, marginBottom:14 }}><Pill amber>Ministry verified</Pill><Pill amber>Bid system</Pill></div>
            <h3 style={{ fontFamily:serif, fontSize:24, fontWeight:700, color:C.ink, marginBottom:10 }}>Search for a guide</h3>
            <p style={{ fontSize:14, color:C.inkSoft, lineHeight:1.7, marginBottom:24 }}>Browse SLTDA-certified local guides, share your itinerary, and request personalised price quotes.</p>
            <Btn variant="amber" onClick={e=>{ e.stopPropagation(); onGuideOpen(); }}>Browse guides →</Btn>
          </div>
        </div>
      </section>

      {/* WHERE TO GO TEASER */}
      <section style={{ background:C.surface, padding:"5rem 2rem" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:28, flexWrap:"wrap", gap:12 }}>
            <div>
              <div style={{ fontSize:11, fontWeight:600, color:C.tealMid, textTransform:"uppercase", letterSpacing:2, marginBottom:8 }}>Where to go</div>
              <h2 style={{ fontFamily:serif, fontSize:"clamp(26px,4vw,38px)", fontWeight:700, color:C.ink }}>Sri Lanka by experience</h2>
            </div>
            <button onClick={()=>setPage("destinations")} style={{ padding:"10px 22px", border:`1.5px solid ${C.border}`, borderRadius:12, background:C.white, color:C.teal, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:sans }}>Explore all destinations →</button>
          </div>
          <div className="dest-grid-5" style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:"1rem" }}>
            {DEST_CATS.map(cat=>(
              <div key={cat.id} onClick={()=>setPage("destinations")} style={{ borderRadius:20, overflow:"hidden", position:"relative", cursor:"pointer", paddingBottom:"130%" }}
                onMouseEnter={e=>e.currentTarget.querySelector(".di").style.transform="scale(1.05)"}
                onMouseLeave={e=>e.currentTarget.querySelector(".di").style.transform="scale(1)"}>
                <div className="di" style={{ position:"absolute", inset:0, background:`linear-gradient(160deg,${cat.color[0]},${cat.color[1]})`, display:"flex", alignItems:"center", justifyContent:"center", transition:"transform .3s" }}>
                  <span style={{ fontSize:38, opacity:.35 }}>{cat.label.split(" ")[0]}</span>
                </div>
                <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(0,0,0,.55) 0%,transparent 50%)" }}/>
                <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"1rem" }}>
                  <div style={{ fontFamily:serif, fontSize:14, fontWeight:700, color:"#fff" }}>{cat.label.slice(cat.label.indexOf(" ")+1)}</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,.65)", marginTop:2 }}>{DESTINATIONS[cat.id].length} spots</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY */}
      <section style={{ padding:"5rem 2rem", background:C.white }}>
        <div style={{ maxWidth:1000, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:"3rem" }}>
            <div style={{ fontSize:11, fontWeight:600, color:C.tealMid, textTransform:"uppercase", letterSpacing:2, marginBottom:10 }}>Why CeylonTrails</div>
            <h2 style={{ fontFamily:serif, fontSize:"clamp(26px,4vw,38px)", fontWeight:700, color:C.ink }}>Everything in one place</h2>
          </div>
          <div className="why-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1.5rem" }}>
            {[{i:"🤖",t:"AI itinerary builder",s:"Real AI crafts a unique plan with named restaurants, trails and hotels."},{i:"🛡️",t:"Verified guides",s:"Every guide is SLTDA-certified. We verify credentials before listing."},{i:"💬",t:"Bid & compare",s:"Submit your itinerary and collect price bids. No obligation."},{i:"🌿",t:"Responsible tourism",s:"We partner only with eco-conscious guides and sustainable operators."}].map(w=>(
              <div key={w.t} style={{ padding:"1.8rem 1.5rem", border:`1px solid ${C.border}`, borderRadius:20, transition:"border-color .2s" }}
                onMouseEnter={e=>e.currentTarget.style.borderColor=C.tealMid}
                onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                <div style={{ fontSize:28, marginBottom:14 }}>{w.i}</div>
                <h4 style={{ fontSize:15, fontWeight:600, color:C.ink, marginBottom:6 }}>{w.t}</h4>
                <p style={{ fontSize:13, color:C.inkSoft, lineHeight:1.6 }}>{w.s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer style={{ background:"#0B1F18", padding:"3rem 2.5rem 2rem" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", paddingBottom:"2rem", borderBottom:"1px solid rgba(255,255,255,.08)", marginBottom:"1.5rem", flexWrap:"wrap", gap:"2rem" }}>
          <div>
            <div style={{ fontFamily:serif, fontSize:20, fontWeight:700, color:"#fff" }}>Ceylon<span style={{ color:C.tealMid }}>Trails</span></div>
            <p style={{ fontSize:13, color:"rgba(255,255,255,.45)", marginTop:8, maxWidth:240, lineHeight:1.6 }}>Personalised Sri Lanka travel, powered by AI and local expertise.</p>
          </div>
          <div style={{ display:"flex", gap:"3rem", flexWrap:"wrap" }}>
            {[["Explore",["Destinations","Plan a Trip","Find a Guide"]],["Company",["About us","Blog","Contact"]],["Legal",["Privacy Policy","Terms of Service"]]].map(([h,ls])=>(
              <div key={h}>
                <h5 style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,.5)", textTransform:"uppercase", letterSpacing:1, marginBottom:12 }}>{h}</h5>
                {ls.map(l=><div key={l} style={{ fontSize:13, color:"rgba(255,255,255,.6)", marginBottom:8, cursor:"pointer" }}>{l}</div>)}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"rgba(255,255,255,.3)", flexWrap:"wrap", gap:8 }}>
          <span>© 2025 CeylonTrails. All rights reserved.</span><span>SLTDA Partner Platform</span>
        </div>
      </footer>
    </div>
  );
}

// ─── DESTINATIONS PAGE ───────────────────────────────────────────────────────
function DestinationsPage({ setPage, onGuideOpen }) {
  const [activeTab, setActiveTab] = useState("beaches");
  const [gallery, setGallery] = useState(null);
  const places = DESTINATIONS[activeTab] || [];
  const cat = DEST_CATS.find(c=>c.id===activeTab);

  return (
    <div>
      <GalleryLightbox place={gallery} onClose={()=>setGallery(null)} />
      <div style={{ background:"linear-gradient(160deg,#04322A 0%,#0B6B52 70%,#147856 100%)", padding:"4rem 2rem 3rem", position:"relative", overflow:"hidden" }}>
        <HeroArt />
        <div style={{ position:"relative", zIndex:2, maxWidth:800, margin:"0 auto", textAlign:"center" }}>
          <div style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,.6)", textTransform:"uppercase", letterSpacing:2, marginBottom:12 }}>Explore Sri Lanka</div>
          <h1 style={{ fontFamily:serif, fontSize:"clamp(30px,5vw,50px)", fontWeight:700, color:"#fff", marginBottom:14 }}>Where would you like to go?</h1>
          <p style={{ fontSize:16, color:"rgba(255,255,255,.7)", lineHeight:1.7, maxWidth:520, margin:"0 auto", fontWeight:300 }}>From coral reefs to cloud forest, ancient ruins to wildlife safaris — every corner of Sri Lanka has a story.</p>
        </div>
      </div>
      <div style={{ position:"sticky", top:64, zIndex:300, background:C.white, borderBottom:`1px solid ${C.border}`, padding:"0 2rem" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"flex", gap:0, overflowX:"auto" }}>
          {DEST_CATS.map(c=>(
            <button key={c.id} onClick={()=>setActiveTab(c.id)} style={{ padding:"16px 22px", border:"none", background:"transparent", fontSize:14, fontWeight:activeTab===c.id?600:400, color:activeTab===c.id?C.teal:C.inkSoft, cursor:"pointer", borderBottom:activeTab===c.id?`2.5px solid ${C.teal}`:"2.5px solid transparent", whiteSpace:"nowrap", fontFamily:sans, transition:"color .2s" }}>{c.label}</button>
          ))}
        </div>
      </div>
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"3rem 2rem 5rem" }}>
        <p style={{ fontSize:13, color:C.inkSoft, marginBottom:24 }}>
          {places.length} destinations · <span style={{ color:C.teal, fontWeight:500 }}>Click any card to see a photo gallery</span>
        </p>
        <div className="dest-grid-4" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1.2rem" }}>
          {places.map(p=>(
            <PlaceCard key={p.name} p={p} catColor={cat.color} onGallery={setGallery} onPlanTrip={()=>setPage("journey")} />
          ))}
        </div>
        <div style={{ textAlign:"center", marginTop:"3rem" }}>
          <p style={{ fontSize:14, color:C.inkSoft, marginBottom:16 }}>Ready to plan your visit?</p>
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <Btn onClick={()=>setPage("journey")}>✨ Create AI itinerary</Btn>
            <Btn variant="amber" onClick={onGuideOpen}>Find a local guide →</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── API HELPER ──────────────────────────────────────────────────────────────
// Points to the local Gemini proxy (server.js).
// Sends { prompt, temperature } → receives { text } back.
const PROXY_URL = "http://localhost:3001/api/generate";

async function callClaude(body) {
  // Extract the prompt text from the Anthropic-style messages array
  const prompt = body.messages?.[0]?.content || "";

  const res = await fetch(PROXY_URL, {
    method:  "POST",
    headers: {
      "Content-Type":  "application/json",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Pragma":        "no-cache",
    },
    body: JSON.stringify({
      prompt,
      temperature: body.temperature ?? 1.0,
      // Unique field so no two requests are byte-identical (defeats any caching)
      _req_id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `Proxy returned HTTP ${res.status}`);
  }

  const data = await res.json();

  // Normalise to the shape the rest of the app expects: { content: [{ text }] }
  return {
    content: [{ text: data.text || "" }],
  };
}
const ACT_TYPE_META = {
  breakfast:  { emoji:"☕", label:"Breakfast",  color:"#FDF3DC", border:"#F0D48A", text:C.amber },
  lunch:      { emoji:"🍛", label:"Lunch",       color:"#FDF3DC", border:"#F0D48A", text:C.amber },
  dinner:     { emoji:"🍽️", label:"Dinner",      color:"#FDF3DC", border:"#F0D48A", text:C.amber },
  cafe:       { emoji:"☕", label:"Café",        color:"#FDF3DC", border:"#F0D48A", text:C.amber },
  sightseeing:{ emoji:"🏛️", label:"Sightseeing", color:C.tealLight, border:"#9FE1CB", text:C.teal },
  hike:       { emoji:"🥾", label:"Hike",        color:C.tealLight, border:"#9FE1CB", text:C.teal },
  safari:     { emoji:"🐘", label:"Safari",      color:C.tealLight, border:"#9FE1CB", text:C.teal },
  beach:      { emoji:"🏖️", label:"Beach",       color:C.tealLight, border:"#9FE1CB", text:C.teal },
  transport:  { emoji:"🚂", label:"Travel",      color:"#F3F3F3",   border:C.border,  text:C.inkSoft },
  checkin:    { emoji:"🏨", label:"Check-in",    color:"#F3F3F3",   border:C.border,  text:C.inkSoft },
  sunset:     { emoji:"🌅", label:"Sunset",      color:"#FDF3DC", border:"#F0D48A", text:C.amber },
  activity:   { emoji:"🎯", label:"Activity",    color:C.tealLight, border:"#9FE1CB", text:C.teal },
};
const fallbackMeta = { emoji:"📍", label:"Stop", color:C.tealLight, border:"#9FE1CB", text:C.teal };

// ─── ACTIVITY ROW ────────────────────────────────────────────────────────────
function ActivityRow({ act, isLast, hideBorder }) {
  const [open, setOpen] = useState(false);
  const [photo, setPhoto] = useState(null);
  const meta = ACT_TYPE_META[act.type] || fallbackMeta;

  const handleExpand = async () => {
    const next = !open; setOpen(next);
    if (next && photo===null) {
      // Use Unsplash for beautiful photos — extract place name for keyword
      const placeName = act.place || act.mapQuery?.split(",")?.[0] || "";
      const keyword = UNSPLASH_KEYWORDS[placeName]
        || (act.mapQuery || placeName).toLowerCase().replace(/\s+/g,"-");
      setPhoto(`https://source.unsplash.com/800x400/?${encodeURIComponent(keyword + "-sri-lanka")}`);
    }
  };

  return (
    <div style={{ borderBottom:hideBorder||isLast?"none":`1px solid ${C.border}` }}>
      <div onClick={handleExpand} style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 0", cursor:"pointer" }}
        onMouseEnter={e=>e.currentTarget.style.background="#FAFAF8"}
        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
        <span style={{ fontSize:11, color:C.inkSoft, minWidth:50, fontWeight:600, flexShrink:0 }}>{act.time}</span>
        <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20, flexShrink:0, background:meta.color, color:meta.text, border:`1px solid ${meta.border}`, whiteSpace:"nowrap" }}>{meta.emoji} {meta.label}</span>
        <div style={{ flex:1, minWidth:0 }}>
          {act.place&&<div style={{ fontSize:13, fontWeight:600, color:C.ink, marginBottom:1 }}>{act.place}</div>}
          <div style={{ fontSize:12, color:C.inkSoft, lineHeight:1.5, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:open?"normal":"nowrap" }}>{act.text}</div>
        </div>
        <span style={{ fontSize:12, color:C.inkSoft, flexShrink:0, transform:open?"rotate(180deg)":"none", transition:"transform .2s" }}>▾</span>
      </div>
      {open&&(
        <div style={{ marginLeft:64, marginBottom:14, borderRadius:14, border:`1.5px solid ${meta.border}`, background:meta.color, overflow:"hidden" }}>
          <div style={{ height:180, background:`linear-gradient(135deg,${C.teal},#147856)`, position:"relative", overflow:"hidden" }}>
            {photo && <img src={photo} alt={act.place} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>e.target.style.display="none"}/>}
            {act.place&&<div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"10px 14px", background:"linear-gradient(to top,rgba(0,0,0,.6),transparent)" }}><div style={{ fontFamily:serif, fontSize:16, fontWeight:700, color:"#fff" }}>{act.place}</div>{act.area&&<div style={{ fontSize:11, color:"rgba(255,255,255,.75)", marginTop:2 }}>📍 {act.area}</div>}</div>}
          </div>
          <div style={{ padding:"14px 16px" }}>
            <p style={{ fontSize:13, color:C.ink, lineHeight:1.65, marginBottom:12 }}>{act.text}</p>
            {act.why&&<div style={{ background:"rgba(255,255,255,.6)", borderRadius:10, padding:"8px 12px", marginBottom:10, fontSize:12, color:C.ink, lineHeight:1.55, borderLeft:`3px solid ${meta.text}` }}><strong style={{ color:meta.text }}>Why we recommend it: </strong>{act.why}</div>}
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
              {act.hours&&<span style={{ fontSize:11, fontWeight:500, padding:"4px 10px", borderRadius:20, background:"rgba(255,255,255,.7)", color:C.ink, border:`1px solid ${meta.border}` }}>🕐 {act.hours}</span>}
              {act.price&&<span style={{ fontSize:11, fontWeight:500, padding:"4px 10px", borderRadius:20, background:"rgba(255,255,255,.7)", color:C.ink, border:`1px solid ${meta.border}` }}>💰 {act.price}</span>}
              {act.mapQuery&&<a href={`https://maps.google.com/?q=${encodeURIComponent(act.mapQuery)}`} target="_blank" rel="noopener noreferrer" style={{ fontSize:11, fontWeight:600, padding:"4px 10px", borderRadius:20, background:C.teal, color:"#fff", textDecoration:"none" }}>📍 Google Maps</a>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── LOCAL CHEAT SHEET PANEL ─────────────────────────────────────────────────
function LocalCheatSheet({ location }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border:`1.5px solid ${C.border}`, borderRadius:16, overflow:"hidden", marginTop:16, background:C.white }}>
      <button onClick={()=>setOpen(o=>!o)} style={{
        width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"14px 20px", background:"none", border:"none", cursor:"pointer",
        fontFamily:sans, textAlign:"left",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:20 }}>📋</span>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:C.ink }}>Local Cheat Sheet</div>
            <div style={{ fontSize:11, color:C.inkSoft }}>Emergency numbers, tipping, transport, phrases & more</div>
          </div>
        </div>
        <span style={{ fontSize:14, color:C.inkSoft, transform:open?"rotate(180deg)":"none", transition:"transform .2s" }}>▾</span>
      </button>
      {open && (
        <div style={{ borderTop:`1px solid ${C.border}`, padding:"16px 20px" }}>
          <div className="cheat-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {CHEAT_SHEET.map((item,i)=>(
              <div key={i} style={{ background:C.surface, borderRadius:12, padding:"12px 14px", border:`1px solid ${C.border}` }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                  <span style={{ fontSize:18 }}>{item.icon}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:C.ink }}>{item.title}</span>
                </div>
                <p style={{ fontSize:11, color:C.inkSoft, lineHeight:1.6, margin:0 }}>{item.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SWAP MODAL ───────────────────────────────────────────────────────────────
function SwapModal({ act, dayLocation, onSwap, onClose }) {
  const [loading, setLoading] = useState(true);
  const [alts, setAlts]       = useState([]);
  const [custom, setCustom]   = useState("");

  useEffect(()=>{
    async function fetch_alts() {
      try {
        const prompt = `You are a Sri Lanka travel expert. Suggest 4 alternative places to replace "${act.place}" (type: ${act.type}) in ${dayLocation}, Sri Lanka.
Return ONLY a raw JSON array of 4 objects, no markdown:
[{"place":"Real Name","area":"Street, City","text":"One sentence what to do","why":"Why it's a great alternative","hours":"Opening hours","price":"Price range","mapQuery":"Place Name, City, Sri Lanka"}]`;
        const data = await callClaude({ model:"claude-sonnet-4-6", max_tokens:1000, temperature:1, messages:[{role:"user",content:prompt}] });
        const raw = data.content.map(c=>c.text||"").join("");
        const clean = raw.replace(/^```(?:json)?\s*/,"").replace(/\s*```$/,"").trim();
        setAlts(JSON.parse(clean));
      } catch { setAlts([]); }
      setLoading(false);
    }
    fetch_alts();
  },[]);

  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.55)", zIndex:800, display:"flex", alignItems:"center", justifyContent:"center", padding:16, backdropFilter:"blur(4px)" }}>
      <div style={{ background:C.white, borderRadius:20, width:"100%", maxWidth:520, maxHeight:"85vh", display:"flex", flexDirection:"column", boxShadow:"0 24px 80px rgba(0,0,0,.25)" }}>
        <div style={{ padding:"16px 20px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <div>
            <div style={{ fontFamily:serif, fontSize:17, fontWeight:700, color:C.ink }}>Swap this place</div>
            <div style={{ fontSize:12, color:C.inkSoft, marginTop:2 }}>Replacing: <strong>{act.place}</strong></div>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:"50%", border:`1px solid ${C.border}`, background:C.surface, cursor:"pointer", fontSize:15, color:C.inkSoft }}>✕</button>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"16px 20px" }}>
          {loading ? (
            <div style={{ textAlign:"center", padding:"2rem" }}>
              <div style={{ width:36, height:36, border:`3px solid ${C.tealLight}`, borderTopColor:C.teal, borderRadius:"50%", animation:"spin .8s linear infinite", margin:"0 auto 12px" }}/>
              <p style={{ fontSize:13, color:C.inkSoft }}>Finding alternatives in {dayLocation}…</p>
            </div>
          ) : (
            <>
              <p style={{ fontSize:12, fontWeight:600, color:C.inkSoft, textTransform:"uppercase", letterSpacing:.8, marginBottom:10 }}>AI suggestions</p>
              {alts.length > 0 ? alts.map((a,i)=>(
                <div key={i} onClick={()=>onSwap(a)} style={{ border:`1.5px solid ${C.border}`, borderRadius:12, padding:"12px 14px", marginBottom:8, cursor:"pointer", transition:"border-color .15s,background .15s" }}
                  onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.tealMid; e.currentTarget.style.background=C.tealPale; }}
                  onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.border; e.currentTarget.style.background="transparent"; }}>
                  <div style={{ fontSize:13, fontWeight:600, color:C.ink, marginBottom:2 }}>{a.place}</div>
                  <div style={{ fontSize:11, color:C.inkSoft, marginBottom:4 }}>📍 {a.area}</div>
                  <div style={{ fontSize:12, color:C.ink, marginBottom:4 }}>{a.text}</div>
                  <div style={{ fontSize:11, color:C.teal, fontStyle:"italic" }}>💡 {a.why}</div>
                  <div style={{ display:"flex", gap:8, marginTop:6, flexWrap:"wrap" }}>
                    {a.hours&&<span style={{ fontSize:10, padding:"2px 8px", borderRadius:20, background:C.tealLight, color:C.teal }}>🕐 {a.hours}</span>}
                    {a.price&&<span style={{ fontSize:10, padding:"2px 8px", borderRadius:20, background:C.amberLight, color:C.amber }}>💰 {a.price}</span>}
                  </div>
                </div>
              )) : <p style={{ fontSize:13, color:C.inkSoft }}>No suggestions available.</p>}

              <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:14, marginTop:8 }}>
                <p style={{ fontSize:12, fontWeight:600, color:C.inkSoft, textTransform:"uppercase", letterSpacing:.8, marginBottom:8 }}>Or type your own</p>
                <div style={{ display:"flex", gap:8 }}>
                  <input value={custom} onChange={e=>setCustom(e.target.value)} placeholder="e.g. Galle Dutch Hospital"
                    style={{ flex:1, padding:"10px 12px", border:`1.5px solid ${C.border}`, borderRadius:10, fontSize:13, fontFamily:sans, outline:"none" }}/>
                  <button onClick={()=>{ if(custom.trim()) onSwap({ place:custom.trim(), area:dayLocation, text:`Visit ${custom.trim()}`, why:"Your custom choice", hours:"", price:"", mapQuery:`${custom.trim()}, Sri Lanka` }); }} style={{ padding:"10px 16px", background:C.teal, color:"#fff", border:"none", borderRadius:10, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:sans }}>Use</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── DRAGGABLE ITINERARY ──────────────────────────────────────────────────────
function DraggableItinerary({ days, onUpdate }) {
  const [dragging, setDragging]     = useState(null); // {dayIdx, actIdx}
  const [dragOver,  setDragOver]    = useState(null); // {dayIdx, actIdx}
  const [swap,      setSwap]        = useState(null); // {dayIdx, actIdx, act}

  const handleDragStart = (dayIdx, actIdx) => setDragging({dayIdx, actIdx});
  const handleDragOver  = (e, dayIdx, actIdx) => { e.preventDefault(); setDragOver({dayIdx, actIdx}); };
  const handleDrop      = (e, toDayIdx, toActIdx) => {
    e.preventDefault();
    if (!dragging) return;
    const { dayIdx:fromDay, actIdx:fromAct } = dragging;
    if (fromDay===toDayIdx && fromAct===toActIdx) { setDragging(null); setDragOver(null); return; }
    const newDays = days.map(d=>({...d, activities:[...d.activities]}));
    const [moved] = newDays[fromDay].activities.splice(fromAct, 1);
    newDays[toDayIdx].activities.splice(toActIdx, 0, moved);
    // Re-assign times sequentially within each affected day
    [fromDay, toDayIdx].forEach(di=>{
      newDays[di].activities.forEach((a,i)=>{
        const baseHour = 7 + i*2;
        a.time = `${String(baseHour).padStart(2,"0")}:00`;
      });
    });
    onUpdate(newDays);
    setDragging(null); setDragOver(null);
  };
  const handleSwapDone = (dayIdx, actIdx, newAct) => {
    const newDays = days.map(d=>({...d, activities:[...d.activities]}));
    const old = newDays[dayIdx].activities[actIdx];
    newDays[dayIdx].activities[actIdx] = { ...old, ...newAct, type: old.type, time: old.time };
    onUpdate(newDays);
    setSwap(null);
  };

  return (
    <>
      {swap && <SwapModal act={swap.act} dayLocation={days[swap.dayIdx]?.location||""} onSwap={a=>handleSwapDone(swap.dayIdx, swap.actIdx, a)} onClose={()=>setSwap(null)}/>}
      <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:16, padding:"10px 14px", background:C.tealPale, border:`1px solid #9FE1CB`, borderRadius:12 }}>
        <span style={{ fontSize:16 }}>↕️</span>
        <span style={{ fontSize:12, color:C.teal, fontWeight:500 }}>Drag any activity to reorder within a day or move it to another day. Click 🔄 to swap a place.</span>
      </div>
      {days.map((d, dayIdx)=>(
        <div key={d.day} style={{ border:`1.5px solid ${C.border}`, borderRadius:16, marginBottom:16, overflow:"hidden", background:C.white, boxShadow:"0 2px 12px rgba(0,0,0,.04)" }}>
          <div style={{ padding:"14px 20px", background:`linear-gradient(135deg,${C.teal},#147856)`, display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ background:"rgba(255,255,255,.2)", color:"#fff", fontSize:11, fontWeight:700, padding:"4px 12px", borderRadius:20 }}>Day {d.day}</span>
            <span style={{ fontSize:15, fontWeight:700, color:"#fff", fontFamily:serif }}>{d.location}</span>
            <span style={{ fontSize:12, color:"rgba(255,255,255,.75)", marginLeft:"auto" }}>— {d.theme}</span>
          </div>
          <div style={{ padding:"6px 12px 10px" }}
            onDragOver={e=>{ if(d.activities.length===0) handleDragOver(e, dayIdx, 0); }}
            onDrop={e=>{ if(d.activities.length===0) handleDrop(e, dayIdx, 0); }}>
            {d.activities.map((a,actIdx)=>{
              const isDraggingThis = dragging?.dayIdx===dayIdx && dragging?.actIdx===actIdx;
              const isOver = dragOver?.dayIdx===dayIdx && dragOver?.actIdx===actIdx;
              return (
                <div key={actIdx}
                  draggable
                  onDragStart={()=>handleDragStart(dayIdx, actIdx)}
                  onDragOver={e=>handleDragOver(e, dayIdx, actIdx)}
                  onDrop={e=>handleDrop(e, dayIdx, actIdx)}
                  onDragEnd={()=>{ setDragging(null); setDragOver(null); }}
                  style={{
                    opacity: isDraggingThis ? 0.4 : 1,
                    background: isOver ? C.tealPale : "transparent",
                    border: isOver ? `2px dashed ${C.tealMid}` : "2px solid transparent",
                    borderRadius:10, marginBottom:2, transition:"background .15s",
                  }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 8px", borderBottom: actIdx<d.activities.length-1?`1px solid ${C.border}`:"none" }}>
                    {/* Drag handle */}
                    <span style={{ cursor:"grab", fontSize:14, color:C.inkSoft, flexShrink:0, userSelect:"none" }}>⠿</span>
                    <span style={{ fontSize:11, color:C.inkSoft, minWidth:46, fontWeight:600, flexShrink:0 }}>{a.time}</span>
                    {/* Travel time badge */}
                    {a.travelFromPrev && (
                      <span style={{ fontSize:9, padding:"2px 6px", borderRadius:20, background:"#F0F0F0", color:C.inkSoft, flexShrink:0, whiteSpace:"nowrap" }}>🚗 {a.travelFromPrev}</span>
                    )}
                    <div style={{ flex:1, minWidth:0 }}>
                      {a.place&&<div style={{ fontSize:13, fontWeight:600, color:C.ink }}>{a.place}</div>}
                      <div style={{ fontSize:11, color:C.inkSoft, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{a.text}</div>
                    </div>
                    {/* Swap button */}
                    <button onClick={()=>setSwap({dayIdx, actIdx, act:a})} title="Swap this place" style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:8, padding:"4px 8px", cursor:"pointer", fontSize:12, color:C.inkSoft, flexShrink:0 }}>🔄</button>
                    {/* Expand handled by ActivityRow below */}
                  </div>
                  {/* Full expandable row */}
                  <ActivityRow act={a} isLast={actIdx===d.activities.length-1} hideBorder/>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}
const TRAVEL_OPTS = [
  {v:"beach",    i:"🏖️", l:"Beach & Coast",      s:"Sun, sand, surf & sea"},
  {v:"hills",    i:"⛰️", l:"Hill Country",        s:"Tea trails, mist & waterfalls"},
  {v:"cultural", i:"🏛️", l:"Cultural & Historic", s:"Temples, ruins & stories"},
  {v:"wildlife", i:"🐘", l:"Wildlife & Nature",   s:"Safari, jungle & birds"},
  {v:"adventure",i:"🧗", l:"Adventure",           s:"Hiking, rafting & climbing"},
  {v:"rural",    i:"🌾", l:"Rural Sri Lanka",     s:"Villages, farms & local life"},
  {v:"mixed",    i:"🗺️", l:"All of Sri Lanka",    s:"A bit of everything"},
];
const GROUP_OPTS = [
  {v:"solo",i:"🧳",l:"Solo",s:"Just me"},
  {v:"couple",i:"💑",l:"Couple",s:"Two travellers"},
  {v:"family",i:"👨‍👩‍👧",l:"Family",s:"With kids"},
  {v:"friends",i:"🎉",l:"Friends group",s:"3 or more"},
];
const BUDGET_OPTS = [
  {v:"budget",l:"Budget",s:"< $50/day"},
  {v:"mid",l:"Mid-range",s:"$50–$150/day"},
  {v:"luxury",l:"Luxury",s:"$150+/day"},
];
const FOOD_OPTS = ["Sri Lankan","Seafood","Vegetarian","Vegan","Western","South Indian","Street food","Fine dining"];
const ACT_OPTS = [
  {v:"adventure",i:"🧗",l:"Adventure sports"},
  {v:"relaxation",i:"🌅",l:"Relaxation"},
  {v:"sightseeing",i:"📸",l:"Sightseeing"},
  {v:"food-tours",i:"🍛",l:"Food tours"},
  {v:"wellness",i:"🧘",l:"Wellness & Spa"},
  {v:"water-sports",i:"🤿",l:"Water sports"},
  {v:"wildlife-safari",i:"🦁",l:"Wildlife safari"},
  {v:"hiking",i:"🥾",l:"Hiking & Trekking"},
];
const TRANSPORT_OPTS = [
  {v:"tuk-tuk",i:"🛺",l:"Tuk-tuk",s:"Authentic & fun, best for short hops"},
  {v:"private-car",i:"🚗",l:"Private car",s:"Comfortable & flexible"},
  {v:"train",i:"🚂",l:"Scenic train",s:"Iconic hill country routes"},
  {v:"bus",i:"🚌",l:"Public bus",s:"Budget-friendly, local experience"},
];
const PACE_OPTS = [
  {v:"relaxed",i:"🌿",l:"Relaxed",s:"Max 2 activities/day, long lunches"},
  {v:"balanced",i:"⚖️",l:"Balanced",s:"3–4 activities, some downtime"},
  {v:"packed",i:"⚡",l:"Action-packed",s:"See as much as possible"},
];

const START_OPTS = [
  {v:"airport", i:"✈️", l:"Bandaranaike International Airport", s:"Katunayake — most international flights"},
  {v:"colombo", i:"🏙️", l:"Colombo City Centre",               s:"Already in the city"},
  {v:"custom",  i:"📍", l:"Another city / hotel",               s:"I'm starting somewhere else"},
];

// ─── LOCAL CHEAT SHEET DATA ──────────────────────────────────────────────────
const CHEAT_SHEET = [
  { icon:"🚨", title:"Emergency numbers",    content:"Police: 119 · Ambulance: 110 · Fire: 111 · Tourist Police: +94 11 242 1052" },
  { icon:"💵", title:"Currency & payments",  content:"Sri Lankan Rupee (LKR). ~320 LKR = $1 USD. ATMs widely available in cities. Cards accepted at hotels & tourist restaurants. Carry cash for local markets, tuk-tuks, and small towns." },
  { icon:"🛺", title:"Getting around",       content:"Tuk-tuk: always agree on price before riding (~50–150 LKR per km). Uber & PickMe apps work in cities. Trains: buy tickets at station, book in advance for 1st class. Buses: very cheap, very crowded." },
  { icon:"🍽️", title:"Food & drink safety",  content:"Drink only bottled water — never tap water. Street food is generally safe if hot and busy. Avoid raw salads at budget places. Ceylon tea is excellent and safe everywhere." },
  { icon:"👗", title:"Dress code",           content:"Remove shoes before entering temples. Cover shoulders and knees at all religious sites (Buddhist temples, Hindu kovils, mosques). Women should carry a sarong. Swimwear is fine at beaches, not in towns." },
  { icon:"💰", title:"Tipping culture",      content:"Not mandatory but appreciated. Restaurants: 10% if no service charge. Tuk-tuk drivers: round up. Hotel staff: 100–200 LKR/day. Guides: $5–10/day for good service." },
  { icon:"📱", title:"SIM & connectivity",   content:"Buy a tourist SIM at the airport arrivals (Dialog or Mobitel). ~$5 for 10GB data, valid 30 days. Mobile data is fast in cities, patchy in rural areas. Most hotels have WiFi." },
  { icon:"🌡️", title:"Health & safety",      content:"No vaccinations required but Hep A & Typhoid recommended. Carry mosquito repellent (DEET-based). Sunscreen essential — UV is intense. Travel insurance strongly recommended." },
  { icon:"🕐", title:"Opening hours",        content:"Shops: 9am–8pm (some closed Sundays). Banks: 9am–3pm weekdays. Temples: open daily, usually dawn to dusk. Poya (full moon) days: alcohol sales prohibited at most shops." },
  { icon:"🗣️", title:"Useful Sinhala phrases", content:"Hello: Ayubowan (ay-you-BOH-wan) · Thank you: Bohoma isthuti · Yes: Ow · No: Nehe · How much?: Kiyada? · Delicious: Rasai" },
];


function OptBtn({ sel, onClick, icon, label, sub }) {
  return (
    <button onClick={onClick} style={{ padding:"14px 14px", borderRadius:12, textAlign:"left", border:`1.5px solid ${sel?C.tealMid:C.border}`, background:sel?C.tealLight:C.surface, cursor:"pointer", display:"flex", flexDirection:"column", gap:3, fontFamily:sans, transition:"border-color .15s,background .15s" }}>
      {icon&&<span style={{ fontSize:22 }}>{icon}</span>}
      <span style={{ fontSize:14, fontWeight:600, color:C.ink }}>{label}</span>
      {sub&&<span style={{ fontSize:11, color:C.inkSoft }}>{sub}</span>}
    </button>
  );
}
function StepDots({ cur, total }) {
  const pct = Math.round((cur / (total - 1)) * 100);
  return (
    <div style={{ marginBottom:22 }}>
      {/* Progress bar — works on any screen width */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
        <span style={{ fontSize:11, fontWeight:600, color:C.teal }}>Step {cur + 1} of {total}</span>
        <span style={{ fontSize:11, color:C.inkSoft }}>{pct}% complete</span>
      </div>
      <div style={{ height:6, background:C.border, borderRadius:6, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg,${C.teal},${C.tealMid})`, borderRadius:6, transition:"width .3s ease" }}/>
      </div>
    </div>
  );
}

// ─── MISMATCH WARNING ────────────────────────────────────────────────────────
function MismatchWarning({ travel, activities }) {
  if (!travel || !activities.length) return null;
  const warnings = [];
  activities.forEach(act => {
    const compatStyles = ACT_COMPAT[act] || null;
    if (compatStyles && !compatStyles.includes(travel)) {
      const key = `${act}+${travel}`;
      const info = MISMATCH_SUGGESTIONS[key];
      if (info) warnings.push(info);
    }
  });
  if (!warnings.length) return null;
  return (
    <div style={{ background:"#FFF8E6", border:"1.5px solid #F0D48A", borderRadius:14, padding:"14px 16px", marginTop:16 }}>
      <div style={{ fontSize:13, fontWeight:700, color:C.amber, marginBottom:8 }}>⚠️ Activity compatibility note</div>
      {warnings.map((w,i)=>(
        <div key={i} style={{ fontSize:12, color:C.inkMid, lineHeight:1.6, marginBottom:6 }}>
          {w.msg}
          <span style={{ marginLeft:8, background:C.tealLight, color:C.teal, padding:"2px 8px", borderRadius:12, fontSize:11, fontWeight:600 }}>💡 {w.fix}</span>
        </div>
      ))}
    </div>
  );
}

// ─── JOURNEY PAGE ────────────────────────────────────────────────────────────
function JourneyPage({ setPage, savedItin, setSavedItin, onGuideOpen }) {
  const [step, setStep]    = useState(0);
  const [ans, setAns]      = useState({ days:5, nights:4, travel:"", food:[], budget:"", group:"", activities:[], transport:"", pace:"balanced", customPlaces:[], startCity:"airport" });
  const [loading, setLoad] = useState(false);
  const [itin, setItin]    = useState(savedItin||null);
  const [itinDays, setItinDays] = useState(savedItin?.days||null); // editable days for drag/drop
  const [placeInput, setPlaceInput] = useState("");

  const upd = (k,v) => setAns(a=>({...a,[k]:v}));
  const tog = (k,v) => setAns(a=>{ const arr=a[k], i=arr.indexOf(v); return {...a,[k]:i>-1?arr.filter(x=>x!==v):[...arr,v]}; });

  // Days/nights: nights always = days-1
  const adjDays = delta => setAns(a=>{ const d=Math.max(1,a.days+delta); return {...a, days:d, nights:d-1}; });

  // PDF download
  const downloadPDF = () => {
    if (!itin) return;
    const printWin = window.open("","_blank");
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>${itin.title}</title>
    <style>body{font-family:Georgia,serif;max-width:750px;margin:40px auto;color:#1A1A1A;line-height:1.6;}h1{font-size:28px;color:#0B6B52;margin-bottom:6px;}.tagline{font-size:15px;color:#6B6B6B;margin-bottom:24px;font-style:italic;}.day{margin-bottom:28px;border:1px solid #E4E4E4;border-radius:12px;overflow:hidden;}.day-head{background:#0B6B52;color:#fff;padding:12px 18px;font-size:15px;font-weight:bold;}.act{display:flex;gap:14px;padding:10px 18px;border-bottom:1px solid #f0f0f0;font-size:13px;font-family:sans-serif;}.act:last-child{border-bottom:none;}.time{color:#6B6B6B;min-width:48px;font-weight:600;font-size:11px;padding-top:2px;}.place{font-weight:700;color:#1A1A1A;margin-bottom:2px;}.why{margin-top:4px;font-size:11px;color:#0B6B52;font-style:italic;}.meta{display:flex;gap:12px;margin-top:4px;font-size:11px;color:#6B6B6B;}.map-link{color:#0B6B52;text-decoration:none;}.footer{margin-top:32px;padding-top:16px;border-top:1px solid #E4E4E4;font-size:11px;color:#aaa;font-family:sans-serif;text-align:center;}</style>
    </head><body>
    <h1>🗺️ ${itin.title}</h1><div class="tagline">${itin.tagline}</div>
    <p style="font-size:13px;font-family:sans-serif;color:#6B6B6B;margin-bottom:24px;">📅 ${ans.days} days · ${ans.nights} nights · ${ans.group||"solo"} · ${ans.budget||"mid-range"} budget</p>
    ${itin.days.map(d=>`<div class="day"><div class="day-head">Day ${d.day} — ${d.location} · ${d.theme}</div>
    ${d.activities.map(a=>`<div class="act"><div class="time">${a.time}</div><div style="flex:1">${a.place?`<div class="place">${a.place}</div>`:""}${a.area?`<div style="font-size:11px;color:#6B6B6B;">📍 ${a.area}</div>`:""}<div style="color:#3D3D3D;margin-top:3px;">${a.text}</div>${a.why?`<div class="why">💡 ${a.why}</div>`:""}<div class="meta">${a.hours?`<span>🕐 ${a.hours}</span>`:""} ${a.price?`<span>💰 ${a.price}</span>`:""} ${a.mapQuery?`<a class="map-link" href="https://maps.google.com/?q=${encodeURIComponent(a.mapQuery)}" target="_blank">📍 Google Maps</a>`:""}</div></div></div>`).join("")}
    </div>`).join("")}
    <div class="footer">Generated by CeylonTrails · ceylontrails.lk</div></body></html>`;
    printWin.document.write(html); printWin.document.close();
    printWin.onload = ()=>{ printWin.focus(); printWin.print(); };
  };

  const generate = async () => {
    setStep(10); setLoad(true);

    // ── CRITICAL: explicit per-style city/region WHITELISTS ──────────────────
    // This is what was causing wrong locations. We now tell the AI EXACTLY
    // which cities are allowed for each style, not just a route description.
    const STYLE_CITIES = {
      beach:    { allowed:["Galle","Unawatuna","Mirissa","Hikkaduwa","Tangalle","Weligama","Arugam Bay","Nilaveli","Trincomalee","Negombo","Bentota","Beruwala","Kalpitiya","Colombo (transit day 1 only)"], forbidden:["Kandy","Ella","Nuwara Eliya","Sigiriya","Dambulla","Anuradhapura","Polonnaruwa","Yala","Wilpattu"] },
      hills:    { allowed:["Kandy","Nuwara Eliya","Ella","Haputale","Bandarawela","Hatton","Dikoya","Nawalapitiya","Knuckles","Horton Plains","Colombo (transit day 1 only)"], forbidden:["Mirissa","Hikkaduwa","Galle","Sigiriya","Anuradhapura","Polonnaruwa","Yala"] },
      cultural: { allowed:["Dambulla","Sigiriya","Anuradhapura","Polonnaruwa","Mihintale","Medirigiriya","Ritigala","Kandy","Colombo (transit day 1 only)","Galle Fort (day trip)"], forbidden:["Mirissa","Hikkaduwa","Ella","Nuwara Eliya","Yala"] },
      wildlife: { allowed:["Yala","Tissamaharama","Udawalawe","Sinharaja","Wilpattu","Minneriya","Habarana","Bundala","Colombo (transit day 1 only)"], forbidden:["Mirissa","Hikkaduwa","Ella","Nuwara Eliya","Sigiriya"] },
      adventure:{ allowed:["Kitulgala","Ella","Adam's Peak (Dalhousie)","Knuckles Range","Kalpitiya","Colombo","Kandy"], forbidden:[] },
      rural:    { allowed:["Knuckles Villages","Mahiyanganaya","Belihuloya","Ratnapura","Weligama fishing village","Dambulla farming area","Matale spice trail","Polonnaruwa village","Colombo (transit day 1 only)"], forbidden:[] },
      mixed:    { allowed:["Colombo","Kandy","Dambulla","Sigiriya","Ella","Galle","Mirissa"], forbidden:[] },
    };
    const styleKey = ans.travel || "mixed";
    const cities = STYLE_CITIES[styleKey] || STYLE_CITIES.mixed;

    const ROUTE_NARRATIVE = {
      beach:    "Day 1: Colombo airport → Negombo (or drive south). Days 2+: Bentota → Galle → Unawatuna → Mirissa → Tangalle. For 7+ days add east coast: Arugam Bay or Trincomalee.",
      hills:    "Day 1: Colombo → Kandy (3hr drive or train). Days 2–3: Kandy area. Day 4: Kandy → Nuwara Eliya (2hr). Days 5–6: Nuwara Eliya → Ella (3hr). Last days: Ella → Haputale. NEVER go to coastal/cultural sites.",
      cultural: "Day 1: Colombo → Dambulla (4hr). Day 2: Sigiriya Rock. Day 3: Anuradhapura. Day 4: Polonnaruwa. Optional: Kandy for Temple of the Tooth. STAY IN THE CULTURAL TRIANGLE.",
      wildlife: "Day 1: Colombo → Udawalawe (4hr). Days 2–3: Udawalawe safaris. Day 4: Udawalawe → Yala (2hr). Days 5–6: Yala safaris. Optional: Sinharaja rainforest or Wilpattu.",
      adventure:"Day 1: Colombo → Kitulgala (white-water rafting). Day 2: Kitulgala → Ella. Day 3: Ella Rock hike. Day 4: Ella → Adam's Peak night climb. Day 5: Knuckles Range.",
      rural:    "Day 1: Colombo → Kandy → rural village near Knuckles or Matale. Days 2–3: Village homestay, farming, cooking. Day 4: Mahiyanganaya → Vedda community. Day 5: Belihuloya valley.",
      mixed:    "Day 1: Colombo. Day 2–3: Cultural Triangle (Sigiriya/Dambulla). Day 4–5: Hill country (Kandy/Ella). Last days: Southern Coast (Galle/Mirissa).",
    };

    const N = Math.min(ans.days, 10); // raised from 7 to 10
    const uid = Date.now().toString(36) + Math.random().toString(36).slice(2,6);
    const customNote = ans.customPlaces.length
      ? `\nMUST-VISIT PLACES (tourist requested these specifically — include each one on an appropriate day):\n${ans.customPlaces.map((p,i)=>`${i+1}. ${p}`).join("\n")}`
      : "";

    // Starting point
    const startNote = ans.startCity==="airport"
      ? "Day 1 starts at Bandaranaike International Airport, Katunayake (30km north of Colombo). First activity should be airport → first destination transfer with estimated drive time."
      : ans.startCity==="colombo"
      ? "Day 1 starts in Colombo city centre."
      : ans.startCity==="custom" && ans.customStart
      ? `Day 1 starts at: ${ans.customStart}.`
      : "Day 1 starts at Bandaranaike International Airport, Katunayake.";

    const actsPerDay = ans.pace==="relaxed" ? 3 : ans.pace==="packed" ? 5 : 4;

    const prompt = `[${uid}] You are a world-class Sri Lanka travel planner. Generate a COMPLETE ${N}-day itinerary.

TRIP DETAILS:
- Days: ${ans.days} | Nights: ${ans.nights} | Group: ${ans.group||"solo"} | Budget: ${ans.budget||"mid-range"}/person/day
- Travel style: ${styleKey.toUpperCase()}
- Food: ${ans.food.join(", ")||"open to anything"}
- Activities: ${ans.activities.join(", ")||"general sightseeing"}
- Transport: ${ans.transport||"private-car"} | Pace: ${ans.pace||"balanced"}
- Starting point: ${startNote}
${customNote}

ROUTE FOR ${styleKey.toUpperCase()} STYLE:
${ROUTE_NARRATIVE[styleKey] || ROUTE_NARRATIVE.mixed}

⛔ LOCATION ENFORCEMENT — MOST IMPORTANT RULE:
ALLOWED cities/regions: ${cities.allowed.join(", ")}
FORBIDDEN cities (NEVER use): ${cities.forbidden.length ? cities.forbidden.join(", ") : "none"}

MANDATORY RULES:
1. Return EXACTLY ${N} day objects numbered 1 to ${N}. Every single day must be included.
2. Each day MUST have EXACTLY ${actsPerDay} activities — not 2, not 1, exactly ${actsPerDay}.
3. Every activity: REAL specific named place. NEVER "a local café" or "nearby restaurant".
4. GROUP activities by proximity — morning activities near each other, afternoon activities near each other. NEVER put a beach in the morning and a museum 30km away in the evening without a transport activity between them.
5. Add a "travelFromPrev" field to every activity (except the first of each day) showing estimated travel time from the previous activity. Example: "15 min walk", "25 min drive", "2 hr train".
6. Include at least one transport/travel activity per day if moving between towns.
7. Return ONLY raw JSON — no markdown, no backticks, nothing before or after.
${ans.customPlaces.length ? `8. MUST include: ${ans.customPlaces.join(", ")} — fit them into the route logically.` : ""}

JSON schema:
{"title":"...","tagline":"...","highlights":["...","...","..."],"days":[{"day":1,"location":"City, Sri Lanka","theme":"Evocative day theme","activities":[{"time":"07:30","type":"breakfast","place":"Exact Real Name","area":"Street, City","text":"One sentence","why":"Why recommended","hours":"7am–11am","price":"$3–6","mapQuery":"Place Name, City, Sri Lanka","travelFromPrev":"10 min walk"}]}]}
Types: breakfast|lunch|dinner|cafe|sightseeing|hike|safari|beach|transport|checkin|sunset|activity|rural`;

    try {
      const data = await callClaude({
        model:      "claude-sonnet-4-6",
        max_tokens: 8000,
        temperature: 1,
        messages: [{ role: "user", content: prompt }],
      });
      if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
      const raw   = data.content.map(c => c.text || "").join("");
      const clean = raw.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "").trim();
      const parsed = JSON.parse(clean);
      if (!parsed.days || !parsed.days.length) throw new Error("No days returned");
      setItin(parsed); setSavedItin(parsed); setItinDays(parsed.days);
    } catch(err) {
      console.error("AI error:", err);
      // If proxy isn't running, show a clear message instead of wrong fallback
      const isConnectionError = err.message.includes("fetch") || err.message.includes("Failed") || err.message.includes("ECONNREFUSED") || err.message.includes("NetworkError");
      if (isConnectionError) {
        setLoad(false);
        setStep(0);
        alert("⚠️ Cannot reach the proxy server.\n\nMake sure you have started it:\n  cd proxy\n  npm install\n  cp .env.example .env   (add your API key)\n  npm start\n\nThen try again.");
        return;
      }
      // Fallback
      const destLabel = {beach:"Southern Coast",hills:"Kandy & Ella",cultural:"Sigiriya & Anuradhapura",wildlife:"Yala",adventure:"Ella & Kitulgala",mixed:"Sri Lanka"}[ans.travel]||"Sri Lanka";
      const fallDays = [
        {day:1,location:"Colombo → Dambulla",theme:"Arrival & Golden Temple",activities:[
          {time:"08:00",type:"checkin",place:"Jetwing Lake Hotel",area:"Dambulla",text:"Check in to this lakeside resort with direct views of Sigiriya Rock from the infinity pool.",why:"Best-positioned hotel in the Cultural Triangle.",hours:"24hr",price:"$80–140/night",mapQuery:"Jetwing Lake Hotel, Dambulla, Sri Lanka"},
          {time:"10:30",type:"breakfast",place:"Rock Face Café",area:"Sigiriya Village Road",text:"Hoppers, pol sambol and king coconut water at this open-air spot favoured by local guides.",why:"Freshest hoppers in the area — made to order.",hours:"7am–12pm",price:"$2–5",mapQuery:"Rock Face Café, Sigiriya, Sri Lanka"},
          {time:"14:00",type:"sightseeing",place:"Dambulla Cave Temple",area:"Dambulla Town",text:"Five caves painted floor-to-ceiling with Buddhist murals and 153 golden statues.",why:"Less crowded than Sigiriya, equally awe-inspiring.",hours:"7am–7pm",price:"$10",mapQuery:"Dambulla Cave Temple, Dambulla, Sri Lanka"},
          {time:"17:30",type:"sunset",place:"Pidurangala Rock",area:"Sigiriya",text:"Climb Pidurangala at dusk for the best free view of Sigiriya glowing orange.",why:"No entry fee, better angle than Sigiriya summit, half the crowd.",hours:"6am–6pm",price:"Free",mapQuery:"Pidurangala Rock, Sigiriya, Sri Lanka"},
        ]},
        {day:2,location:"Sigiriya",theme:"The Lion Rock at dawn",activities:[
          {time:"06:00",type:"breakfast",place:"Sigiri Village Café",area:"Main Road, Sigiriya",text:"Quick hoppers before the dawn Sigiriya climb.",why:"Only place open before 6am near the gate.",hours:"5:30am–9am",price:"$2–4",mapQuery:"Sigiri Village Café, Sigiriya, Sri Lanka"},
          {time:"07:00",type:"sightseeing",place:"Sigiriya Rock Fortress",area:"Sigiriya",text:"Climb the 5th-century citadel — frescoes, mirror wall, and the summit palace.",why:"Morning light on the cloud maidens is extraordinary.",hours:"7am–5:30pm",price:"$30",mapQuery:"Sigiriya Rock Fortress, Sigiriya, Sri Lanka"},
          {time:"12:30",type:"lunch",place:"Hotel Sigiriya Restaurant",area:"Sigiriya",text:"Rice and curry with an unbeatable view of the rock from the terrace.",why:"Best outdoor dining position near the fortress.",hours:"12pm–3pm",price:"$8–12",mapQuery:"Hotel Sigiriya, Sigiriya, Sri Lanka"},
          {time:"15:00",type:"sightseeing",place:"Polonnaruwa Ancient City",area:"Polonnaruwa",text:"Cycle the medieval ruins — hire a bike at the entrance gate.",why:"Gal Vihara Buddha sculptures are unmissable.",hours:"7am–6pm",price:"$25",mapQuery:"Polonnaruwa Ancient City, Polonnaruwa, Sri Lanka"},
        ]},
        {day:3,location:"Anuradhapura",theme:"Ancient sacred city",activities:[
          {time:"07:00",type:"breakfast",place:"Ranmihidu Restaurant",area:"Anuradhapura Town",text:"Idiyappam and coconut milk curry at this early-opening local spot.",why:"Most authentic breakfast in Anuradhapura — popular with monks.",hours:"6am–10am",price:"$2–4",mapQuery:"Ranmihidu Restaurant, Anuradhapura, Sri Lanka"},
          {time:"08:30",type:"sightseeing",place:"Sri Maha Bodhi",area:"Anuradhapura",text:"Visit the 2,300-year-old sacred Bo tree, one of the holiest sites in Buddhism.",why:"Dress modestly, visit early — the morning rituals are deeply moving.",hours:"Open daily",price:"Free",mapQuery:"Sri Maha Bodhi, Anuradhapura, Sri Lanka"},
          {time:"11:00",type:"sightseeing",place:"Ruwanwelisaya Stupa",area:"Anuradhapura",text:"Circumambulate the great white stupa of King Dutugemunu — 103 metres tall.",why:"The most revered stupa in Sri Lanka.",hours:"Open daily",price:"$25 (site pass)",mapQuery:"Ruwanwelisaya Stupa, Anuradhapura, Sri Lanka"},
          {time:"18:00",type:"dinner",place:"Shalini Restaurant",area:"Anuradhapura Town",text:"Family-run rice and curry with fresh dhal, jackfruit and pol sambol.",why:"Local institution — the jackfruit curry is extraordinary.",hours:"11am–9pm",price:"$3–6",mapQuery:"Shalini Restaurant, Anuradhapura, Sri Lanka"},
        ]},
      ];
      while(fallDays.length<N){
        const n=fallDays.length+1;
        fallDays.push({day:n,location:destLabel,theme:`Day ${n} — continued exploration`,activities:[
          {time:"08:00",type:"breakfast",place:"Guesthouse Dining Room",area:destLabel,text:"Sri Lankan breakfast at your accommodation.",why:"Fuel up before the day.",hours:"7am–10am",price:"$3–5",mapQuery:`${destLabel}, Sri Lanka`},
          {time:"10:00",type:"sightseeing",place:`${destLabel} Highlights`,area:destLabel,text:"Continue exploring the day's destination.",why:"Every corner of Sri Lanka holds something extraordinary.",hours:"9am–5pm",price:"Varies",mapQuery:`${destLabel}, Sri Lanka`},
        ]});
      }
      setItin({ title:`${ans.days}-Day Sri Lanka Journey`, tagline:`A curated journey through ${destLabel}`, highlights:["Named restaurants & hotels","Real trails & monuments","Timed to avoid crowds"], days:fallDays.slice(0,N) });
      setSavedItin({ title:`${ans.days}-Day Sri Lanka Journey`, tagline:`A curated journey through ${destLabel}`, highlights:["Named restaurants & hotels","Real trails & monuments","Timed to avoid crowds"], days:fallDays.slice(0,N) });
      setItinDays(fallDays.slice(0,N));
    }
    setLoad(false);
  };

  // Result page
  if (step===10) {
    if (loading) return (
      <div style={{ minHeight:"80vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:20, padding:"2rem" }}>
        <div style={{ width:56, height:56, border:`3px solid ${C.tealLight}`, borderTopColor:C.teal, borderRadius:"50%", animation:"spin .8s linear infinite" }}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{ fontSize:16, color:C.inkSoft, textAlign:"center", fontFamily:sans }}>Crafting your personalised Sri Lanka itinerary…</p>
        <p style={{ fontSize:13, color:"#aaa", textAlign:"center", fontFamily:sans }}>Finding real restaurants, trails & hidden gems — usually 15–25 seconds</p>
      </div>
    );
    if (!itin) return null;
    return (
      <div style={{ minHeight:"100vh", background:C.surface }}>
        <div style={{ background:`linear-gradient(135deg,${C.teal},#147856)`, padding:"3rem 2rem" }}>
          <div style={{ maxWidth:820, margin:"0 auto" }}>
            <div style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,.6)", textTransform:"uppercase", letterSpacing:2, marginBottom:10 }}>Your AI itinerary</div>
            <h1 style={{ fontFamily:serif, fontSize:"clamp(24px,4vw,40px)", fontWeight:700, color:"#fff", marginBottom:10 }}>🗺️ {itin.title}</h1>
            <p style={{ fontSize:15, color:"rgba(255,255,255,.75)", marginBottom:16 }}>{itin.tagline}</p>
            <p style={{ fontSize:13, color:"rgba(255,255,255,.65)", marginBottom:16 }}>📅 {ans.days} days · {ans.nights} nights · {ans.group||"solo"} · {ans.budget||"mid-range"} budget</p>
            {itin.highlights&&<div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:16 }}>{itin.highlights.map((h,i)=><span key={i} style={{ fontSize:12, fontWeight:500, padding:"4px 12px", borderRadius:20, background:"rgba(255,255,255,.15)", color:"rgba(255,255,255,.9)", border:"1px solid rgba(255,255,255,.25)" }}>✓ {h}</span>)}</div>}
            <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
              <button onClick={downloadPDF} style={{ padding:"10px 20px", background:"rgba(255,255,255,.15)", color:"#fff", border:"1px solid rgba(255,255,255,.35)", borderRadius:12, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:sans }}>📄 Download PDF</button>
              <p style={{ fontSize:12, color:"rgba(255,255,255,.5)", margin:0 }}>💡 Tap any activity to see photo, hours & map</p>
            </div>
          </div>
        </div>
        <div style={{ maxWidth:820, margin:"0 auto", padding:"2.5rem 2rem" }}>
          <DraggableItinerary days={itinDays||itin.days} onUpdate={newDays=>{ setItinDays(newDays); setSavedItin({...itin, days:newDays}); }}/>
          <LocalCheatSheet location={itin.days?.[0]?.location||"Sri Lanka"}/>
          <div style={{ marginTop:"2rem", background:"linear-gradient(135deg,#FDF5E0,#FFF7E6)", border:"1.5px solid #F0D48A", borderRadius:20, padding:"2rem" }}>
            <h3 style={{ fontFamily:serif, fontSize:20, fontWeight:700, color:C.ink, marginBottom:8 }}>📩 Want a local guide for this trip?</h3>
            <p style={{ fontSize:14, color:C.inkSoft, lineHeight:1.7, marginBottom:20 }}>Share this itinerary with one of our SLTDA-certified guides and receive a personalised price quote within 24 hours.</p>
            <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
              <Btn variant="amber" onClick={onGuideOpen}>Find a guide & request bid →</Btn>
              <Btn variant="outline" onClick={downloadPDF}>📄 Download PDF</Btn>
              <Btn variant="outline" onClick={()=>{ setStep(0); setItin(null); setItinDays(null); setAns({ days:5, nights:4, travel:"", food:[], budget:"", group:"", activities:[], transport:"", pace:"balanced", customPlaces:[], startCity:"airport" }); }}>↺ New itinerary</Btn>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Wizard steps
  const STEPS_TOTAL = 10;
  const steps = [
    // 0: Starting point
    <>
      <StepDots cur={0} total={STEPS_TOTAL}/>
            <h2 style={{ fontFamily:serif, fontSize:26, fontWeight:700, color:C.ink, marginBottom:8 }}>Where does your trip start?</h2>
      <p style={{ fontSize:13, color:C.inkSoft, marginBottom:16 }}>We'll plan your first day transfer from here</p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr", gap:10 }}>
        {START_OPTS.map(o=><OptBtn key={o.v} sel={ans.startCity===o.v} onClick={()=>upd("startCity",o.v)} icon={o.i} label={o.l} sub={o.s}/>)}
      </div>
      {ans.startCity==="custom" && (
        <input value={ans.customStart||""} onChange={e=>upd("customStart",e.target.value)} placeholder="e.g. Galle, Negombo, Kandy…"
          style={{ width:"100%", marginTop:10, padding:"12px 14px", border:`1.5px solid ${C.border}`, borderRadius:12, fontSize:13, fontFamily:sans, outline:"none", boxSizing:"border-box" }}/>
      )}
    </>,
    <>
      <StepDots cur={0} total={STEPS_TOTAL}/>
            <h2 style={{ fontFamily:serif, fontSize:26, fontWeight:700, color:C.ink, marginBottom:24 }}>How long is your trip?</h2>
      <div style={{ display:"flex", alignItems:"center", gap:20, padding:"18px 0", borderBottom:`1px solid ${C.border}` }}>
        <span style={{ flex:1, fontSize:14, fontWeight:500, color:C.ink }}>📅 Days in Sri Lanka</span>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <button onClick={()=>adjDays(-1)} style={{ width:36, height:36, borderRadius:"50%", border:`1.5px solid ${C.border}`, background:C.surface, fontSize:18, cursor:"pointer", color:C.ink, fontFamily:sans }}>−</button>
          <span style={{ fontSize:20, fontWeight:700, color:C.teal, minWidth:32, textAlign:"center" }}>{ans.days}</span>
          <button onClick={()=>adjDays(1)} style={{ width:36, height:36, borderRadius:"50%", border:`1.5px solid ${C.border}`, background:C.surface, fontSize:18, cursor:"pointer", color:C.ink, fontFamily:sans }}>+</button>
        </div>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:20, padding:"18px 0" }}>
        <span style={{ flex:1, fontSize:14, fontWeight:500, color:C.ink }}>🌙 Nights</span>
        <span style={{ fontSize:20, fontWeight:700, color:C.inkSoft, minWidth:32, textAlign:"center", paddingRight:52 }}>{ans.nights}</span>
      </div>
      <div style={{ background:C.tealPale, border:`1px solid #9FE1CB`, borderRadius:12, padding:"10px 14px", fontSize:12, color:C.teal, marginTop:4 }}>
        💡 Nights are always days − 1. A 5-day trip = 4 nights.
      </div>
    </>,

    // 1: Travel style
    <>
      <StepDots cur={1} total={STEPS_TOTAL}/>
            <h2 style={{ fontFamily:serif, fontSize:26, fontWeight:700, color:C.ink, marginBottom:24 }}>What kind of travel excites you?</h2>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {TRAVEL_OPTS.map(o=><OptBtn key={o.v} sel={ans.travel===o.v} onClick={()=>upd("travel",o.v)} icon={o.i} label={o.l} sub={o.s}/>)}
      </div>
    </>,

    // 2: Activities
    <>
      <StepDots cur={2} total={STEPS_TOTAL}/>
            <h2 style={{ fontFamily:serif, fontSize:26, fontWeight:700, color:C.ink, marginBottom:8 }}>What activities do you enjoy?</h2>
      <p style={{ fontSize:13, color:C.inkSoft, marginBottom:16 }}>Pick any that apply</p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {ACT_OPTS.map(o=><OptBtn key={o.v} sel={ans.activities.includes(o.v)} onClick={()=>tog("activities",o.v)} icon={o.i} label={o.l}/>)}
      </div>
      <MismatchWarning travel={ans.travel} activities={ans.activities}/>
    </>,

    // 3: Food
    <>
      <StepDots cur={3} total={STEPS_TOTAL}/>
            <h2 style={{ fontFamily:serif, fontSize:26, fontWeight:700, color:C.ink, marginBottom:8 }}>What food do you enjoy?</h2>
      <p style={{ fontSize:13, color:C.inkSoft, marginBottom:16 }}>Pick any that apply</p>
      <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
        {FOOD_OPTS.map(f=>{ const s=ans.food.includes(f); return <button key={f} onClick={()=>tog("food",f)} style={{ padding:"8px 16px", borderRadius:30, fontSize:13, fontWeight:500, cursor:"pointer", border:`1.5px solid ${s?C.amberMid:C.border}`, background:s?C.amberLight:C.surface, color:s?C.amber:C.inkSoft, fontFamily:sans }}>{f}</button>; })}
      </div>
    </>,

    // 4: Group & budget
    <>
      <StepDots cur={4} total={STEPS_TOTAL}/>
            <h2 style={{ fontFamily:serif, fontSize:26, fontWeight:700, color:C.ink, marginBottom:18 }}>Who's going & what's your budget?</h2>
      <p style={{ fontSize:13, color:C.inkSoft, marginBottom:10 }}>Group type</p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
        {GROUP_OPTS.map(o=><OptBtn key={o.v} sel={ans.group===o.v} onClick={()=>upd("group",o.v)} icon={o.i} label={o.l} sub={o.s}/>)}
      </div>
      <p style={{ fontSize:13, color:C.inkSoft, marginBottom:10 }}>Daily budget per person</p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
        {BUDGET_OPTS.map(o=><OptBtn key={o.v} sel={ans.budget===o.v} onClick={()=>upd("budget",o.v)} label={o.l} sub={o.s}/>)}
      </div>
    </>,

    // 5: Transport
    <>
      <StepDots cur={5} total={STEPS_TOTAL}/>
            <h2 style={{ fontFamily:serif, fontSize:26, fontWeight:700, color:C.ink, marginBottom:8 }}>How do you want to get around?</h2>
      <p style={{ fontSize:13, color:C.inkSoft, marginBottom:16 }}>Your AI itinerary will be built around your transport choice</p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {TRANSPORT_OPTS.map(o=><OptBtn key={o.v} sel={ans.transport===o.v} onClick={()=>upd("transport",o.v)} icon={o.i} label={o.l} sub={o.s}/>)}
      </div>
    </>,

    // 6: Pace
    <>
      <StepDots cur={6} total={STEPS_TOTAL}/>
            <h2 style={{ fontFamily:serif, fontSize:26, fontWeight:700, color:C.ink, marginBottom:8 }}>What pace do you prefer?</h2>
      <p style={{ fontSize:13, color:C.inkSoft, marginBottom:16 }}>This shapes how many activities per day we plan</p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr", gap:10 }}>
        {PACE_OPTS.map(o=><OptBtn key={o.v} sel={ans.pace===o.v} onClick={()=>upd("pace",o.v)} icon={o.i} label={o.l} sub={o.s}/>)}
      </div>
    </>,

    // 7: Custom places
    <>
      <StepDots cur={7} total={STEPS_TOTAL}/>
            <h2 style={{ fontFamily:serif, fontSize:26, fontWeight:700, color:C.ink, marginBottom:6 }}>Any specific places you want to visit?</h2>
      <p style={{ fontSize:13, color:C.inkSoft, marginBottom:20, lineHeight:1.6 }}>
        If you already know a place in Sri Lanka you want to include — a temple, a waterfall, a town, a restaurant — add it here and we'll fit it into your itinerary.
      </p>
      {/* Input row */}
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        <input
          value={placeInput}
          onChange={e=>setPlaceInput(e.target.value)}
          onKeyDown={e=>{ if(e.key==="Enter"&&placeInput.trim()){ setAns(a=>({...a,customPlaces:[...a.customPlaces,placeInput.trim()]})); setPlaceInput(""); } }}
          placeholder="e.g. Ravana Falls, Ella · Nine Arch Bridge · Galle Fort"
          style={{ flex:1, padding:"12px 14px", border:`1.5px solid ${C.border}`, borderRadius:12, fontSize:13, fontFamily:sans, color:C.ink, outline:"none" }}
        />
        <button
          onClick={()=>{ if(placeInput.trim()){ setAns(a=>({...a,customPlaces:[...a.customPlaces,placeInput.trim()]})); setPlaceInput(""); } }}
          style={{ padding:"12px 18px", background:C.teal, color:"#fff", border:"none", borderRadius:12, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:sans, whiteSpace:"nowrap" }}>
          Add +
        </button>
      </div>
      {/* Added places list */}
      {ans.customPlaces.length > 0 ? (
        <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
          {ans.customPlaces.map((p,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", background:C.tealLight, border:`1px solid #9FE1CB`, borderRadius:12 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:16 }}>📍</span>
                <span style={{ fontSize:13, fontWeight:600, color:C.teal }}>{p}</span>
              </div>
              <button onClick={()=>setAns(a=>({...a,customPlaces:a.customPlaces.filter((_,j)=>j!==i)}))} style={{ background:"none", border:"none", cursor:"pointer", fontSize:16, color:C.inkSoft, lineHeight:1 }}>×</button>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding:"16px", background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, fontSize:13, color:C.inkSoft, textAlign:"center", lineHeight:1.6 }}>
          No specific places added — your itinerary will be fully AI-generated based on your style choices.<br/>
          <span style={{ fontSize:12, opacity:.7 }}>This step is completely optional.</span>
        </div>
      )}
      <div style={{ background:C.amberLight, border:`1px solid #F0D48A`, borderRadius:12, padding:"10px 14px", fontSize:12, color:C.amber, marginTop:16, lineHeight:1.6 }}>
        💡 We'll fit your places into the route logically — if a place doesn't match your travel style region, we'll suggest the nearest travel day to include it.
      </div>
    </>,

    // 8: Rural experience opt-in (only shown if rural selected, else skipped visually)
    <>
      <StepDots cur={8} total={STEPS_TOTAL}/>
            <h2 style={{ fontFamily:serif, fontSize:26, fontWeight:700, color:C.ink, marginBottom:8 }}>
        {ans.travel==="rural" ? "What rural experiences interest you?" : "Almost done — any final touches?"}
      </h2>
      {ans.travel==="rural" ? (
        <>
          <p style={{ fontSize:13, color:C.inkSoft, marginBottom:16 }}>Pick the rural experiences you'd love — we'll build your itinerary around them.</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {[
              {v:"village-homestay",  i:"🏡", l:"Village homestay",     s:"Sleep in a local family home"},
              {v:"paddy-farming",     i:"🌾", l:"Paddy farming",        s:"Plant & harvest with farmers"},
              {v:"cooking-class",     i:"🍳", l:"Village cooking class", s:"Learn real Sri Lankan recipes"},
              {v:"spice-garden",      i:"🌿", l:"Spice garden tour",    s:"Cinnamon, pepper, cardamom"},
              {v:"fishing-village",   i:"🎣", l:"Fishing village",      s:"Join fishermen at dawn"},
              {v:"vedda-community",   i:"🏹", l:"Vedda community",      s:"Indigenous culture & history"},
              {v:"elephant-village",  i:"🐘", l:"Working elephant camp",s:"Ethical elephant interaction"},
              {v:"pottery-weaving",   i:"🏺", l:"Pottery & weaving",    s:"Traditional crafts with artisans"},
            ].map(o=><OptBtn key={o.v} sel={ans.activities.includes(o.v)} onClick={()=>tog("activities",o.v)} icon={o.i} label={o.l} sub={o.s}/>)}
          </div>
        </>
      ) : (
        <>
          <p style={{ fontSize:13, color:C.inkSoft, marginBottom:20, lineHeight:1.6 }}>You're ready to generate. Here's a summary of your trip preferences:</p>
          <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:"16px 18px" }}>
            {[
              ["📅","Duration",`${ans.days} days, ${ans.nights} nights`],
              ["🗺️","Style",ans.travel||"Not selected"],
              ["👥","Group",ans.group||"Not selected"],
              ["💰","Budget",ans.budget||"Not selected"],
              ["🚗","Transport",ans.transport||"Not selected"],
              ["⚡","Pace",ans.pace||"balanced"],
              ...(ans.customPlaces.length?[["📍","Your places",ans.customPlaces.join(", ")]]:[]),
            ].map(([icon,label,val])=>(
              <div key={label} style={{ display:"flex", gap:12, padding:"8px 0", borderBottom:`1px solid ${C.border}`, fontSize:13 }}>
                <span style={{ fontSize:15 }}>{icon}</span>
                <span style={{ color:C.inkSoft, minWidth:80 }}>{label}</span>
                <span style={{ fontWeight:600, color:C.ink, textTransform:"capitalize" }}>{val}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </>,
  ];

  return (
    <div style={{ minHeight:"100vh", background:C.surface }}>
      <div style={{ background:"linear-gradient(135deg,#04322A,#0B6B52)", padding:"3rem 2rem 2.5rem", position:"relative", overflow:"hidden" }}>
        <HeroArt/>
        <div style={{ position:"relative", zIndex:2, maxWidth:680, margin:"0 auto", textAlign:"center" }}>
          <div style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,.6)", textTransform:"uppercase", letterSpacing:2, marginBottom:10 }}>Journey Creator</div>
          <h1 style={{ fontFamily:serif, fontSize:"clamp(26px,4vw,42px)", fontWeight:700, color:"#fff", marginBottom:10 }}>Build your perfect trip</h1>
          <p style={{ fontSize:15, color:"rgba(255,255,255,.7)", fontWeight:300 }}>7 quick questions. Real AI builds your day-by-day Sri Lanka itinerary.</p>
        </div>
      </div>
      <div style={{ maxWidth:640, margin:"2.5rem auto", padding:"0 1.5rem 4rem" }}>
        <div style={{ background:C.white, borderRadius:24, padding:"2.5rem", border:`1px solid ${C.border}`, boxShadow:"0 4px 24px rgba(0,0,0,.06)" }}>
          {steps[step]}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:28, paddingTop:20, borderTop:`1px solid ${C.border}` }}>
            {step>0 ? <Btn variant="outline" onClick={()=>setStep(s=>s-1)}>← Back</Btn> : <span/>}
            {step<9
              ? <Btn onClick={()=>setStep(s=>s+1)}>Next →</Btn>
              : <Btn variant="amber" onClick={generate}>✨ Generate my itinerary</Btn>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── GUIDE DRAWER ────────────────────────────────────────────────────────────
function GuideDrawer({ open, onClose, itin }) {
  const [screen, setScreen] = useState("terms");
  const [termsOk, setTermsOk] = useState(false);
  const [selected, setSelected] = useState(null);
  useEffect(()=>{ if(open){ setScreen("terms"); setTermsOk(false); setSelected(null); } }, [open]);
  const g = selected!=null ? GUIDES.find(x=>x.id===selected) : null;
  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.45)", zIndex:600, backdropFilter:"blur(3px)" }}/>
      <div style={{ position:"fixed", top:0, right:0, bottom:0, width:480, maxWidth:"100vw", background:C.white, zIndex:700, boxShadow:"-8px 0 48px rgba(0,0,0,.18)", display:"flex", flexDirection:"column", animation:"slideIn .25s ease" }}>
        <style>{`@keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>
        <div style={{ padding:"18px 20px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <div>
            <div style={{ fontFamily:serif, fontSize:18, fontWeight:700, color:C.ink }}>
              {screen==="terms"?"Before you continue":screen==="list"?"Certified guides":screen==="portfolio"&&g?g.name:"Bid sent!"}
            </div>
            {screen==="list"&&<div style={{ fontSize:12, color:C.inkSoft, marginTop:2 }}>{GUIDES.length} SLTDA-verified guides</div>}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            {screen==="portfolio"&&<button onClick={()=>setScreen("list")} style={{ fontSize:12, fontWeight:600, color:C.teal, background:"none", border:"none", cursor:"pointer", fontFamily:sans }}>← All guides</button>}
            <button onClick={onClose} style={{ width:32, height:32, borderRadius:"50%", border:`1px solid ${C.border}`, background:C.surface, cursor:"pointer", fontSize:15, color:C.inkSoft, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
          </div>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"20px" }}>
          {screen==="terms"&&(
            <>
              <p style={{ fontSize:14, color:C.inkSoft, marginBottom:16, lineHeight:1.7 }}>Please read and accept the following before browsing our certified guides.</p>
              <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:"14px 16px", maxHeight:220, overflowY:"auto", fontSize:13, color:C.inkSoft, lineHeight:1.7, marginBottom:16 }}>
                {[["1. Guide verification","All guides are SLTDA-verified. Certifications reviewed annually."],["2. Booking & payment","Payments processed through CeylonTrails. Guides pay commission. No hidden fees to tourists."],["3. Bid requests","Guides respond within 24 hours. No obligation to accept any bid."],["4. Cancellation","48+ hours before trip: full refund. Within 48 hours: 25% fee may apply."],["5. Liability","CeylonTrails is an intermediary. Guides carry SLTDA-mandated insurance."],["6. Reviews","Honest reviews encouraged. Fraudulent reviews will be removed."],["7. Privacy","Your details only shared with guides you explicitly select."]].map(([t,d])=><p key={t} style={{ marginBottom:10 }}><strong style={{ color:C.ink }}>{t}</strong> — {d}</p>)}
              </div>
              <label style={{ display:"flex", alignItems:"center", gap:10, fontSize:14, color:C.ink, cursor:"pointer", padding:"12px 14px", border:`1px solid ${C.border}`, borderRadius:12, background:C.surface, marginBottom:20 }}>
                <input type="checkbox" checked={termsOk} onChange={e=>setTermsOk(e.target.checked)} style={{ accentColor:C.teal, width:16, height:16 }}/>
                I have read and agree to CeylonTrails' terms and conditions
              </label>
              <Btn full onClick={()=>{ if(!termsOk){alert("Please accept the terms to continue.");return;} setScreen("list"); }}>Accept & browse guides →</Btn>
            </>
          )}
          {screen==="list"&&(
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {GUIDES.map(g=>(
                <div key={g.id} onClick={()=>{ setSelected(g.id); setScreen("portfolio"); }} style={{ border:`1.5px solid ${C.border}`, borderRadius:16, padding:"14px 16px", cursor:"pointer", background:C.white, transition:"border-color .2s,box-shadow .2s" }}
                  onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.tealMid; e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,.08)"; }}
                  onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.border; e.currentTarget.style.boxShadow="none"; }}>
                  <div style={{ display:"flex", gap:12, alignItems:"flex-start", marginBottom:10 }}>
                    <Av g={g} size={52}/>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:15, fontWeight:600, color:C.ink, marginBottom:2 }}>{g.name}</div>
                      <div style={{ fontSize:12, color:C.inkSoft, marginBottom:6 }}>{g.specialty}</div>
                      {g.ministry&&<Pill green>🛡️ SLTDA Verified</Pill>}
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:C.ink }}><Stars n={Math.floor(g.rating)}/> {g.rating}</div>
                      <div style={{ fontSize:11, color:C.inkSoft, marginTop:2 }}>{g.reviews} reviews</div>
                    </div>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:C.inkSoft, paddingTop:10, borderTop:`1px solid ${C.border}` }}>
                    <span>🗣️ {g.langs}</span><span>{g.exp} yrs exp</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {screen==="portfolio"&&g&&(
            <>
              <div style={{ display:"flex", gap:14, alignItems:"flex-start", marginBottom:16 }}>
                <Av g={g} size={72} r={18}/>
                <div>
                  <div style={{ fontFamily:serif, fontSize:20, fontWeight:700, color:C.ink, marginBottom:4 }}>{g.name}</div>
                  <div style={{ fontSize:13, color:C.inkSoft, marginBottom:10 }}>{g.specialty}</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {g.ministry&&<Pill green>🛡️ SLTDA Certified</Pill>}
                    <Pill amber>★ {g.rating}</Pill>
                    <span style={{ fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:20, background:"#E5F0FC", color:"#185FA5", border:"1px solid #B4D0EF" }}>{g.exp} yrs</span>
                  </div>
                </div>
              </div>
              <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:"12px 14px", fontSize:13, color:C.inkSoft, lineHeight:1.7, marginBottom:14 }}>{g.bio}</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14 }}>
                {[["Languages",g.langs],["Areas",g.areas],["Reviews",`${g.reviews} verified`],["Experience",`${g.exp} years`]].map(([l,v])=>(
                  <div key={l} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 12px" }}>
                    <div style={{ fontSize:10, color:C.inkSoft, textTransform:"uppercase", letterSpacing:.8, marginBottom:4, fontWeight:600 }}>{l}</div>
                    <div style={{ fontSize:12, fontWeight:600, color:C.ink, lineHeight:1.4 }}>{v}</div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize:11, fontWeight:600, color:C.inkSoft, textTransform:"uppercase", letterSpacing:.8, marginBottom:8 }}>Signature tours</p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:16 }}>{g.tours.map(t=><Pill key={t}>{t}</Pill>)}</div>
              <p style={{ fontSize:11, fontWeight:600, color:C.inkSoft, textTransform:"uppercase", letterSpacing:.8, marginBottom:8 }}>Reviews</p>
              <div style={{ border:`1px solid ${C.border}`, borderRadius:12, padding:"4px 14px", marginBottom:16 }}>
                {[g.rev1,g.rev2].map((r,i)=>(
                  <div key={i} style={{ padding:"12px 0", borderBottom:i===0?`1px solid ${C.border}`:"none" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, fontWeight:600, color:C.ink, marginBottom:4 }}><span>{r.who}</span><Stars n={r.stars}/></div>
                    <div style={{ fontSize:13, color:C.inkSoft, lineHeight:1.6 }}>{r.text}</div>
                  </div>
                ))}
              </div>
              <div style={{ background:"linear-gradient(135deg,#FDF5E0,#FFFBF0)", border:"1.5px solid #F0D48A", borderRadius:16, padding:"18px" }}>
                <h4 style={{ fontFamily:serif, fontSize:16, fontWeight:700, color:C.ink, marginBottom:8 }}>📩 Request a bid from {g.name.split(" ")[0]}</h4>
                <p style={{ fontSize:13, color:C.inkSoft, lineHeight:1.6, marginBottom:14 }}>
                  {itin?<>We'll share your <strong style={{ color:C.ink }}>{itin.title}</strong> with {g.name.split(" ")[0]}, who will respond with a personalised price within 24 hours.</>:<>Share your travel dates with {g.name.split(" ")[0]} to receive a personalised quote within 24 hours.</>}
                </p>
                {itin&&<div style={{ background:"rgba(255,255,255,.65)", borderRadius:10, padding:"10px 12px", marginBottom:14, border:"1px solid rgba(194,122,14,.2)", fontSize:12, color:C.inkSoft }}><strong style={{ color:C.ink, fontSize:13, display:"block", marginBottom:3 }}>📋 {itin.title}</strong>{itin.tagline}</div>}
                <Btn variant="amber" full onClick={()=>setScreen("success")}>Submit bid request →</Btn>
              </div>
            </>
          )}
          {screen==="success"&&g&&(
            <div style={{ textAlign:"center", padding:"3rem 1rem" }}>
              <div style={{ width:72, height:72, borderRadius:"50%", background:C.tealLight, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 18px", fontSize:30 }}>✅</div>
              <h3 style={{ fontFamily:serif, fontSize:22, fontWeight:700, color:C.ink, marginBottom:10 }}>You're all set!</h3>
              <p style={{ fontSize:14, color:C.inkSoft, lineHeight:1.7, maxWidth:340, margin:"0 auto" }}>Your request has been sent to <strong>{g.name}</strong>. They'll respond with a personalised quote within 24 hours.</p>
              <div style={{ background:C.tealPale, border:"1px solid #B2E5D0", borderRadius:12, padding:"12px 16px", marginTop:20, fontSize:13, color:C.teal, textAlign:"left", lineHeight:1.6 }}>💡 No obligation — request bids from multiple guides and compare before deciding.</div>
              <div style={{ display:"flex", gap:10, justifyContent:"center", marginTop:24, flexWrap:"wrap" }}>
                <Btn onClick={()=>setScreen("list")}>Request another guide</Btn>
                <Btn variant="outline" onClick={onClose}>Close</Btn>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── ROOT APP ────────────────────────────────────────────────────────────────
// ─── WISHLIST CONTEXT ────────────────────────────────────────────────────────
function useWishlist() {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ct_wishlist")||"[]"); } catch { return []; }
  });
  const save = (newItems) => { setItems(newItems); localStorage.setItem("ct_wishlist", JSON.stringify(newItems)); };
  const add    = (item) => { if (!items.find(i=>i.place_id===item.place_id)) save([...items, item]); };
  const remove = (id)   => save(items.filter(i=>i.place_id!==id));
  const has    = (id)   => items.some(i=>i.place_id===id);
  return { items, add, remove, has };
}

// ─── GOOGLE PLACES EXPLORE PAGE ──────────────────────────────────────────────
const GPLACES_CAT_QUERIES = {
  hotels:      "hotels in Sri Lanka",
  restaurants: "best restaurants in Sri Lanka",
  places:      "top tourist attractions Sri Lanka",
  adventure:   "adventure activities Sri Lanka",
  beaches:     "best beaches Sri Lanka",
  cultural:    "cultural heritage sites Sri Lanka",
};
const GPLACES_CAT_LABELS = {
  hotels:"Hotels", restaurants:"Restaurants", places:"Places to Visit",
  adventure:"Adventure Sites", beaches:"Beaches", cultural:"Cultural Sites",
};

// API base — local proxy in dev, Vercel function in prod
const PLACES_BASE = import.meta.env.PROD ? "/api/places" : "http://localhost:3001/api/places";

async function placesSearch(query) {
  const res = await fetch(`${PLACES_BASE}/search?query=${encodeURIComponent(query)}`);
  if (!res.ok) { const e = await res.json(); throw new Error(e.error||"Search failed"); }
  return res.json();
}
async function placesDetails(place_id) {
  const res = await fetch(`${PLACES_BASE}/details?place_id=${encodeURIComponent(place_id)}`);
  if (!res.ok) { const e = await res.json(); throw new Error(e.error||"Details failed"); }
  return res.json();
}
function photoUrl(ref, maxwidth=800) {
  return `${PLACES_BASE}/photo?ref=${encodeURIComponent(ref)}&maxwidth=${maxwidth}`;
}

function ExplorePage({ setPage, savedItin, setSavedItin }) {
  const catId   = sessionStorage.getItem("explorecat") || "hotels";
  const [cat, setCat]           = useState(catId);
  const [places, setPlaces]     = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [selected, setSelected] = useState(null);
  const [addedToast, setToast]  = useState(false);
  const wishlist = useWishlist();

  useEffect(() => {
    const c = sessionStorage.getItem("explorecat") || "hotels";
    setCat(c); loadPlaces(c);
  }, []);

  const loadPlaces = async (catId) => {
    setLoading(true); setError(""); setPlaces([]);
    try {
      const query = GPLACES_CAT_QUERIES[catId];
      const data  = await placesSearch(query);
      if (data.error === "no_key") { setError("no_key"); setLoading(false); return; }
      if (data.status === "REQUEST_DENIED") { setError("denied"); setLoading(false); return; }
      setPlaces(data.results || []);
    } catch(e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const switchCat = (id) => {
    setCat(id); sessionStorage.setItem("explorecat", id);
    setSelected(null); loadPlaces(id);
  };

  const addToItin = (place) => {
    const newAct = {
      time:"10:00", type:"sightseeing",
      place: place.name,
      area:  place.formatted_address || "Sri Lanka",
      text:  `Visit ${place.name} — rated ${place.rating||"N/A"}★ by ${place.user_ratings_total||0} visitors`,
      why:   "Added from your Explore list",
      hours: place.opening_hours?.open_now ? "Currently open" : "Check Google Maps for hours",
      price: place.price_level ? "$".repeat(place.price_level) : "",
      mapQuery: `${place.name}, Sri Lanka`,
    };
    if (savedItin) {
      const updated = { ...savedItin, days: savedItin.days.map((d,i) => i===0 ? {...d, activities:[...d.activities, newAct]} : d) };
      setSavedItin(updated);
      setToast(true); setTimeout(()=>setToast(false), 2500);
    } else {
      alert("Create an itinerary first from 'Plan a trip', then come back to add places.");
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:C.surface }}>
      {/* Toast */}
      {addedToast && (
        <div style={{ position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)", background:C.teal, color:"#fff", padding:"12px 24px", borderRadius:30, fontSize:14, fontWeight:600, zIndex:800, boxShadow:"0 4px 20px rgba(0,0,0,.2)", whiteSpace:"nowrap" }}>
          ✅ Added to Day 1 of your itinerary!
        </div>
      )}

      {/* Header */}
      <div style={{ background:`linear-gradient(135deg,${C.teal},#147856)`, padding:"2.5rem 2rem 2rem" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ fontSize:11, color:"rgba(255,255,255,.6)", textTransform:"uppercase", letterSpacing:2, marginBottom:8 }}>Explore Sri Lanka</div>
          <h1 style={{ fontFamily:serif, fontSize:"clamp(26px,4vw,40px)", fontWeight:700, color:"#fff", marginBottom:16 }}>{GPLACES_CAT_LABELS[cat]}</h1>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {NAV_DEST_CATS.map(c=>(
              <button key={c.id} onClick={()=>switchCat(c.id)} style={{ padding:"8px 16px", borderRadius:20, border:"none", cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:sans, background:cat===c.id?"#fff":"rgba(255,255,255,.15)", color:cat===c.id?C.teal:"rgba(255,255,255,.85)", transition:"all .15s" }}>
                {c.icon} {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"2rem" }}>
        {/* No key */}
        {error==="no_key" && (
          <div style={{ background:C.amberLight, border:`1.5px solid #F0D48A`, borderRadius:16, padding:"2rem", textAlign:"center" }}>
            <div style={{ fontSize:32, marginBottom:12 }}>🔑</div>
            <h3 style={{ fontFamily:serif, fontSize:20, fontWeight:700, color:C.ink, marginBottom:8 }}>Google Places API key needed</h3>
            <p style={{ fontSize:14, color:C.inkSoft, lineHeight:1.7, maxWidth:480, margin:"0 auto 16px" }}>
              Add your key to <code style={{ background:"rgba(0,0,0,.08)", padding:"2px 6px", borderRadius:4 }}>GOOGLE_PLACES_KEY</code> in your proxy <code>.env</code> file and Vercel environment variables.
            </p>
            <div style={{ background:"rgba(255,255,255,.7)", borderRadius:12, padding:"14px", fontSize:13, color:C.ink, textAlign:"left", maxWidth:480, margin:"0 auto" }}>
              <p style={{ fontWeight:700, marginBottom:8 }}>proxy/.env — add this line:</p>
              <code style={{ background:"#f0f0f0", padding:"8px 12px", borderRadius:8, display:"block", fontSize:12 }}>GOOGLE_PLACES_KEY=AIzaYourKeyHere</code>
            </div>
          </div>
        )}

        {/* API denied */}
        {error==="denied" && (
          <div style={{ background:C.coralLight, border:`1.5px solid #EFBAA8`, borderRadius:16, padding:"2rem", textAlign:"center" }}>
            <div style={{ fontSize:32, marginBottom:12 }}>⚠️</div>
            <h3 style={{ fontFamily:serif, fontSize:18, fontWeight:700, color:C.ink, marginBottom:8 }}>API key not authorised</h3>
            <p style={{ fontSize:14, color:C.inkSoft, lineHeight:1.7 }}>Your Google key was rejected. Make sure <strong>Places API</strong> is enabled in Google Cloud Console for your project.</p>
          </div>
        )}

        {/* Other error */}
        {error && error!=="no_key" && error!=="denied" && (
          <div style={{ background:C.coralLight, border:`1.5px solid #EFBAA8`, borderRadius:16, padding:"1.5rem", textAlign:"center" }}>
            <p style={{ fontSize:14, color:C.coral }}>Error: {error}</p>
            <button onClick={()=>loadPlaces(cat)} style={{ marginTop:10, padding:"8px 20px", background:C.teal, color:"#fff", border:"none", borderRadius:10, cursor:"pointer", fontSize:13, fontFamily:sans }}>Try again</button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign:"center", padding:"4rem" }}>
            <div style={{ width:48, height:48, border:`3px solid ${C.tealLight}`, borderTopColor:C.teal, borderRadius:"50%", animation:"spin .8s linear infinite", margin:"0 auto 16px" }}/>
            <p style={{ fontSize:14, color:C.inkSoft }}>Finding the best {GPLACES_CAT_LABELS[cat].toLowerCase()} in Sri Lanka…</p>
          </div>
        )}

        {/* Results grid */}
        {!loading && !error && places.length > 0 && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1.2rem" }} className="dest-grid-4">
            {places.map(p=>(
              <div key={p.place_id} onClick={()=>setSelected(p)} style={{ border:`1.5px solid ${C.border}`, borderRadius:16, overflow:"hidden", background:C.white, cursor:"pointer", transition:"transform .2s,box-shadow .2s" }}
                onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 8px 30px rgba(0,0,0,.1)"; }}
                onMouseLeave={e=>{ e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}>
                <div style={{ height:160, background:`linear-gradient(135deg,${C.teal},#147856)`, overflow:"hidden", position:"relative" }}>
                  {p.photos?.[0]
                    ? <img src={photoUrl(p.photos[0].photo_reference)} alt={p.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>{ e.target.style.display="none"; }}/>
                    : <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:40, opacity:.3 }}>{NAV_DEST_CATS.find(c=>c.id===cat)?.icon||"📍"}</div>
                  }
                  <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"8px 12px", background:"linear-gradient(to top,rgba(0,0,0,.65),transparent)" }}>
                    <div style={{ fontFamily:serif, fontSize:15, fontWeight:700, color:"#fff" }}>{p.name}</div>
                  </div>
                  {wishlist.has(p.place_id) && (
                    <div style={{ position:"absolute", top:8, right:8, background:C.amber, color:"#fff", fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:20 }}>♥ Saved</div>
                  )}
                </div>
                <div style={{ padding:"12px 14px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                      <span style={{ color:C.amberMid, fontSize:12 }}>{"★".repeat(Math.round(p.rating||0))}</span>
                      <span style={{ fontSize:11, color:C.inkSoft }}>{p.rating} ({(p.user_ratings_total||0).toLocaleString()})</span>
                    </div>
                    {p.price_level && <span style={{ fontSize:12, color:C.teal, fontWeight:600 }}>{"$".repeat(p.price_level)}</span>}
                  </div>
                  <p style={{ fontSize:11, color:C.inkSoft, lineHeight:1.5, margin:0 }}>{(p.formatted_address||"").split(",").slice(-3).join(", ")}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No results */}
        {!loading && !error && places.length===0 && (
          <div style={{ textAlign:"center", padding:"3rem", color:C.inkSoft }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🔍</div>
            <p>No results found. Try a different category.</p>
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selected && (
        <PlaceDetailPanel
          place={selected}
          wishlist={wishlist}
          onAddToItin={()=>{ addToItin(selected); setSelected(null); }}
          onClose={()=>setSelected(null)}
        />
      )}
    </div>
  );
}

function PlaceDetailPanel({ place:p, wishlist, onAddToItin, onClose }) {
  const [details, setDetails]   = useState(null);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [loadingD, setLoadingD] = useState(true);

  useEffect(()=>{
    placesDetails(p.place_id)
      .then(d=>{ setDetails(d.result); setLoadingD(false); })
      .catch(()=>setLoadingD(false));
  },[p.place_id]);

  const d = details || p;
  const photos = d.photos || p.photos || [];

  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.55)", zIndex:700, display:"flex", justifyContent:"flex-end", backdropFilter:"blur(3px)" }}>
      <div style={{ width:480, maxWidth:"100vw", height:"100%", background:C.white, overflowY:"auto", boxShadow:"-8px 0 48px rgba(0,0,0,.2)" }}>
        {/* Photo gallery */}
        <div style={{ height:240, background:`linear-gradient(135deg,${C.teal},#147856)`, position:"relative", flexShrink:0 }}>
          {photos.length>0 && <img src={photoUrl(photos[photoIdx]?.photo_reference)} alt={p.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>e.target.style.display="none"}/>}
          <button onClick={onClose} style={{ position:"absolute", top:12, right:12, width:36, height:36, borderRadius:"50%", border:"none", background:"rgba(0,0,0,.45)", color:"#fff", fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
          {photos.length>1&&<>
            <button onClick={()=>setPhotoIdx(i=>Math.max(0,i-1))} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", width:34, height:34, borderRadius:"50%", border:"none", background:"rgba(0,0,0,.4)", color:"#fff", fontSize:18, cursor:"pointer" }}>‹</button>
            <button onClick={()=>setPhotoIdx(i=>Math.min(photos.length-1,i+1))} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", width:34, height:34, borderRadius:"50%", border:"none", background:"rgba(0,0,0,.4)", color:"#fff", fontSize:18, cursor:"pointer" }}>›</button>
            <div style={{ position:"absolute", bottom:8, right:12, fontSize:11, color:"rgba(255,255,255,.8)", background:"rgba(0,0,0,.3)", padding:"2px 8px", borderRadius:10 }}>{photoIdx+1}/{photos.length}</div>
          </>}
        </div>

        <div style={{ padding:"1.2rem 1.4rem" }}>
          {loadingD && <div style={{ textAlign:"center", padding:"1rem" }}><div style={{ width:28, height:28, border:`2px solid ${C.tealLight}`, borderTopColor:C.teal, borderRadius:"50%", animation:"spin .8s linear infinite", margin:"0 auto" }}/></div>}

          <h2 style={{ fontFamily:serif, fontSize:22, fontWeight:700, color:C.ink, marginBottom:4 }}>{p.name}</h2>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
            <span style={{ color:C.amberMid }}>{"★".repeat(Math.round(p.rating||0))}</span>
            <span style={{ fontSize:13, color:C.inkSoft }}>{p.rating} · {(p.user_ratings_total||0).toLocaleString()} reviews</span>
          </div>
          <p style={{ fontSize:13, color:C.inkSoft, marginBottom:14 }}>📍 {p.formatted_address}</p>

          {d.opening_hours?.weekday_text && (
            <div style={{ background:C.surface, borderRadius:10, padding:"10px 14px", marginBottom:14 }}>
              <div style={{ fontSize:12, fontWeight:700, color:C.ink, marginBottom:6 }}>⏰ Opening hours</div>
              {d.opening_hours.weekday_text.map((t,i)=><div key={i} style={{ fontSize:11, color:C.inkSoft, marginBottom:2 }}>{t}</div>)}
            </div>
          )}

          {d.formatted_phone_number && <p style={{ fontSize:13, color:C.ink, marginBottom:8 }}>📞 {d.formatted_phone_number}</p>}
          {d.website && <a href={d.website} target="_blank" rel="noopener noreferrer" style={{ fontSize:13, color:C.teal, display:"block", marginBottom:14, wordBreak:"break-all" }}>🌐 {d.website}</a>}

          {/* Reviews */}
          {d.reviews?.length>0 && <>
            <p style={{ fontSize:12, fontWeight:700, color:C.ink, textTransform:"uppercase", letterSpacing:.8, marginBottom:8 }}>Reviews</p>
            {d.reviews.slice(0,2).map((r,i)=>(
              <div key={i} style={{ padding:"10px 0", borderBottom:`1px solid ${C.border}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, fontWeight:600, color:C.ink, marginBottom:4 }}>
                  <span>{r.author_name}</span><span style={{ color:C.amberMid }}>{"★".repeat(r.rating)}</span>
                </div>
                <p style={{ fontSize:12, color:C.inkSoft, lineHeight:1.6, margin:0 }}>{r.text?.slice(0,200)}{r.text?.length>200?"…":""}</p>
              </div>
            ))}
          </>}

          {/* Action buttons */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:16 }}>
            <button onClick={onAddToItin} style={{ padding:"12px", background:C.teal, color:"#fff", border:"none", borderRadius:12, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:sans }}>
              ➕ Add to itinerary
            </button>
            <button onClick={()=>wishlist.has(p.place_id)?wishlist.remove(p.place_id):wishlist.add(p)}
              style={{ padding:"12px", background:wishlist.has(p.place_id)?C.amberLight:C.surface, color:wishlist.has(p.place_id)?C.amber:C.ink, border:`1.5px solid ${wishlist.has(p.place_id)?"#F0D48A":C.border}`, borderRadius:12, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:sans }}>
              {wishlist.has(p.place_id) ? "♥ Saved" : "♡ Wishlist"}
            </button>
          </div>
          <a href={`https://maps.google.com/?q=${encodeURIComponent(p.name+", Sri Lanka")}`} target="_blank" rel="noopener noreferrer"
            style={{ display:"block", textAlign:"center", marginTop:10, padding:"10px", border:`1px solid ${C.border}`, borderRadius:10, fontSize:12, color:C.teal, textDecoration:"none", fontWeight:600 }}>
            📍 Open in Google Maps
          </a>
        </div>
      </div>
    </div>
  );
}

function ExplorePage({ setPage, savedItin, setSavedItin }) {
  const catId   = sessionStorage.getItem("explorecat") || "hotels";
  const [cat, setCat]         = useState(catId);
  const [places, setPlaces]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [selected, setSelected] = useState(null);
  const [addedToItin, setAddedToItin] = useState(false);
  const wishlist = useWishlist();

  const GKEY = import.meta.env.VITE_GOOGLE_PLACES_KEY || "";

  useEffect(() => {
    const c = sessionStorage.getItem("explorecat") || "hotels";
    setCat(c); loadPlaces(c);
  }, []);

  const loadPlaces = async (catId) => {
    setLoading(true); setError(""); setPlaces([]);
    if (!GKEY) {
      setError("no_key"); setLoading(false); return;
    }
    try {
      // Use the proxy to avoid CORS
      const query = GPLACES_CAT_QUERIES[catId];
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GKEY}`;
      const res  = await fetch(`/api/places?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPlaces(data.results || []);
    } catch(e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const switchCat = (id) => {
    setCat(id); sessionStorage.setItem("explorecat", id);
    setSelected(null); loadPlaces(id);
  };

  const photoUrl = (ref) => GKEY
    ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${ref}&key=${GKEY}`
    : `https://source.unsplash.com/400x300/?${encodeURIComponent(cat+"-sri-lanka")}`;

  const addToItin = (place) => {
    const newAct = {
      time:"10:00", type:"sightseeing",
      place: place.name,
      area:  place.formatted_address || "Sri Lanka",
      text:  `Visit ${place.name} — ${place.types?.[0]?.replace(/_/g," ")||"attraction"} with a rating of ${place.rating||"N/A"}`,
      why:   "Added from your Explore list",
      hours: place.opening_hours?.open_now ? "Currently open" : "",
      price: place.price_level ? "$".repeat(place.price_level) : "",
      mapQuery: `${place.name}, Sri Lanka`,
    };
    if (savedItin) {
      const updated = { ...savedItin, days: savedItin.days.map((d,i) => i===0 ? {...d, activities:[...d.activities, newAct]} : d) };
      setSavedItin(updated);
      setAddedToItin(true);
      setTimeout(()=>setAddedToItin(false), 2500);
    } else {
      alert("Create an itinerary first, then come back to add places to it.");
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:C.surface }}>
      {/* Header */}
      <div style={{ background:`linear-gradient(135deg,${C.teal},#147856)`, padding:"2.5rem 2rem 2rem" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ fontSize:11, color:"rgba(255,255,255,.6)", textTransform:"uppercase", letterSpacing:2, marginBottom:8 }}>Explore Sri Lanka</div>
          <h1 style={{ fontFamily:serif, fontSize:"clamp(26px,4vw,40px)", fontWeight:700, color:"#fff", marginBottom:16 }}>{GPLACES_CAT_LABELS[cat]}</h1>
          {/* Category tabs */}
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {NAV_DEST_CATS.map(c=>(
              <button key={c.id} onClick={()=>switchCat(c.id)} style={{ padding:"8px 16px", borderRadius:20, border:"none", cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:sans, background:cat===c.id?"#fff":"rgba(255,255,255,.15)", color:cat===c.id?C.teal:"rgba(255,255,255,.85)", transition:"all .15s" }}>
                {c.icon} {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"2rem" }}>
        {/* Added to itinerary toast */}
        {addedToItin && (
          <div style={{ position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)", background:C.teal, color:"#fff", padding:"12px 24px", borderRadius:30, fontSize:14, fontWeight:600, zIndex:800, boxShadow:"0 4px 20px rgba(0,0,0,.2)" }}>
            ✅ Added to Day 1 of your itinerary!
          </div>
        )}

        {/* No API key message */}
        {error==="no_key" && (
          <div style={{ background:C.amberLight, border:`1.5px solid #F0D48A`, borderRadius:16, padding:"2rem", textAlign:"center" }}>
            <div style={{ fontSize:32, marginBottom:12 }}>🔑</div>
            <h3 style={{ fontFamily:serif, fontSize:20, fontWeight:700, color:C.ink, marginBottom:8 }}>Google Places API key needed</h3>
            <p style={{ fontSize:14, color:C.inkSoft, lineHeight:1.7, maxWidth:480, margin:"0 auto 16px" }}>
              To show real hotels, restaurants and places, add your Google Places API key to Vercel environment variables as <code style={{ background:"rgba(0,0,0,.08)", padding:"2px 6px", borderRadius:4 }}>VITE_GOOGLE_PLACES_KEY</code>.
            </p>
            <div style={{ background:"rgba(255,255,255,.7)", borderRadius:12, padding:"14px", fontSize:13, color:C.ink, textAlign:"left", maxWidth:480, margin:"0 auto" }}>
              <p style={{ fontWeight:700, marginBottom:8 }}>Steps to get a free key:</p>
              <p>1. Go to <strong>console.cloud.google.com</strong></p>
              <p>2. Enable <strong>Places API</strong></p>
              <p>3. Create credentials → API Key</p>
              <p>4. Add to Vercel: Settings → Environment Variables → <code>VITE_GOOGLE_PLACES_KEY</code></p>
            </div>
          </div>
        )}

        {loading && (
          <div style={{ textAlign:"center", padding:"4rem" }}>
            <div style={{ width:48, height:48, border:`3px solid ${C.tealLight}`, borderTopColor:C.teal, borderRadius:"50%", animation:"spin .8s linear infinite", margin:"0 auto 16px" }}/>
            <p style={{ fontSize:14, color:C.inkSoft }}>Finding the best {GPLACES_CAT_LABELS[cat].toLowerCase()} in Sri Lanka…</p>
          </div>
        )}

        {!loading && !error && places.length>0 && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1.2rem" }}>
            {places.map(p=>(
              <div key={p.place_id} onClick={()=>setSelected(p)} style={{ border:`1.5px solid ${C.border}`, borderRadius:16, overflow:"hidden", background:C.white, cursor:"pointer", transition:"transform .2s,box-shadow .2s" }}
                onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 8px 30px rgba(0,0,0,.1)"; }}
                onMouseLeave={e=>{ e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}>
                {/* Photo */}
                <div style={{ height:160, background:`linear-gradient(135deg,${C.teal},#147856)`, overflow:"hidden", position:"relative" }}>
                  {p.photos?.[0] && <img src={photoUrl(p.photos[0].photo_reference)} alt={p.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>e.target.style.display="none"}/>}
                  <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"8px 12px", background:"linear-gradient(to top,rgba(0,0,0,.6),transparent)" }}>
                    <div style={{ fontFamily:serif, fontSize:15, fontWeight:700, color:"#fff" }}>{p.name}</div>
                  </div>
                  {wishlist.has(p.place_id) && <div style={{ position:"absolute", top:10, right:10, background:C.amber, color:"#fff", fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:20 }}>♥ Saved</div>}
                </div>
                <div style={{ padding:"12px 14px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                      <span style={{ color:C.amberMid, fontSize:13 }}>{"★".repeat(Math.round(p.rating||0))}</span>
                      <span style={{ fontSize:12, color:C.inkSoft }}>{p.rating} ({p.user_ratings_total})</span>
                    </div>
                    {p.price_level && <span style={{ fontSize:12, color:C.teal, fontWeight:600 }}>{"$".repeat(p.price_level)}</span>}
                  </div>
                  <p style={{ fontSize:12, color:C.inkSoft, lineHeight:1.5, margin:0 }}>{p.formatted_address?.split(",").slice(-3).join(",")}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Place detail panel */}
      {selected && (
        <PlaceDetailPanel
          place={selected} photoUrl={photoUrl}
          wishlist={wishlist}
          onAddToItin={()=>addToItin(selected)}
          onClose={()=>setSelected(null)}
          gkey={GKEY}
        />
      )}
    </div>
  );
}

function PlaceDetailPanel({ place:p, photoUrl, wishlist, onAddToItin, onClose, gkey }) {
  const [details, setDetails] = useState(null);
  const [photoIdx, setPhotoIdx] = useState(0);
  const photos = p.photos || [];

  useEffect(()=>{
    if (!gkey) return;
    fetch(`/api/places?url=${encodeURIComponent(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${p.place_id}&fields=name,rating,formatted_phone_number,website,opening_hours,reviews,photos,formatted_address&key=${gkey}`)}`)
      .then(r=>r.json()).then(d=>setDetails(d.result)).catch(()=>{});
  },[p.place_id]);

  const d = details || p;

  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.55)", zIndex:700, display:"flex", justifyContent:"flex-end", backdropFilter:"blur(3px)" }}>
      <div style={{ width:480, maxWidth:"100vw", height:"100%", background:C.white, overflowY:"auto", boxShadow:"-8px 0 48px rgba(0,0,0,.2)", display:"flex", flexDirection:"column" }}>
        {/* Photos */}
        <div style={{ height:240, background:`linear-gradient(135deg,${C.teal},#147856)`, position:"relative", flexShrink:0 }}>
          {photos.length>0 && <img src={photoUrl(photos[photoIdx]?.photo_reference)} alt={p.name} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>}
          <button onClick={onClose} style={{ position:"absolute", top:12, right:12, width:36, height:36, borderRadius:"50%", border:"none", background:"rgba(0,0,0,.45)", color:"#fff", fontSize:16, cursor:"pointer" }}>✕</button>
          {photos.length>1 && <>
            <button onClick={()=>setPhotoIdx(i=>Math.max(0,i-1))} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", width:36, height:36, borderRadius:"50%", border:"none", background:"rgba(0,0,0,.4)", color:"#fff", fontSize:18, cursor:"pointer" }}>‹</button>
            <button onClick={()=>setPhotoIdx(i=>Math.min(photos.length-1,i+1))} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", width:36, height:36, borderRadius:"50%", border:"none", background:"rgba(0,0,0,.4)", color:"#fff", fontSize:18, cursor:"pointer" }}>›</button>
            <div style={{ position:"absolute", bottom:10, left:"50%", transform:"translateX(-50%)", fontSize:11, color:"rgba(255,255,255,.8)", background:"rgba(0,0,0,.3)", padding:"2px 8px", borderRadius:10 }}>{photoIdx+1}/{photos.length}</div>
          </>}
        </div>

        <div style={{ padding:"1.2rem 1.4rem", flex:1 }}>
          <h2 style={{ fontFamily:serif, fontSize:22, fontWeight:700, color:C.ink, marginBottom:4 }}>{p.name}</h2>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
            <span style={{ color:C.amberMid }}>{"★".repeat(Math.round(p.rating||0))}</span>
            <span style={{ fontSize:13, color:C.inkSoft }}>{p.rating} · {p.user_ratings_total} reviews</span>
          </div>
          <p style={{ fontSize:13, color:C.inkSoft, marginBottom:14 }}>📍 {p.formatted_address}</p>

          {d.opening_hours?.weekday_text && (
            <div style={{ background:C.surface, borderRadius:10, padding:"10px 14px", marginBottom:14 }}>
              <div style={{ fontSize:12, fontWeight:700, color:C.ink, marginBottom:6 }}>Opening hours</div>
              {d.opening_hours.weekday_text.map((t,i)=><div key={i} style={{ fontSize:11, color:C.inkSoft, marginBottom:2 }}>{t}</div>)}
            </div>
          )}

          {d.formatted_phone_number && <p style={{ fontSize:13, color:C.ink, marginBottom:8 }}>📞 {d.formatted_phone_number}</p>}
          {d.website && <a href={d.website} target="_blank" rel="noopener noreferrer" style={{ fontSize:13, color:C.teal, display:"block", marginBottom:14 }}>🌐 Visit website</a>}

          {/* Google Maps embed */}
          <div style={{ borderRadius:12, overflow:"hidden", marginBottom:14, height:200 }}>
            <iframe title="map" width="100%" height="200" style={{ border:0 }} loading="lazy"
              src={`https://www.google.com/maps/embed/v1/place?key=${gkey}&q=${encodeURIComponent(p.name+", Sri Lanka")}`}/>
          </div>

          {/* Reviews */}
          {d.reviews?.slice(0,2).map((r,i)=>(
            <div key={i} style={{ padding:"10px 0", borderBottom:`1px solid ${C.border}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, fontWeight:600, color:C.ink, marginBottom:4 }}>
                <span>{r.author_name}</span><span style={{ color:C.amberMid }}>{"★".repeat(r.rating)}</span>
              </div>
              <p style={{ fontSize:12, color:C.inkSoft, lineHeight:1.6, margin:0 }}>{r.text?.slice(0,200)}{r.text?.length>200?"…":""}</p>
            </div>
          ))}

          {/* Action buttons */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:16 }}>
            <button onClick={onAddToItin} style={{ padding:"12px", background:C.teal, color:"#fff", border:"none", borderRadius:12, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:sans }}>
              ➕ Add to itinerary
            </button>
            <button onClick={()=>wishlist.has(p.place_id)?wishlist.remove(p.place_id):wishlist.add(p)} style={{ padding:"12px", background:wishlist.has(p.place_id)?C.amberLight:C.surface, color:wishlist.has(p.place_id)?C.amber:C.ink, border:`1.5px solid ${wishlist.has(p.place_id)?"#F0D48A":C.border}`, borderRadius:12, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:sans }}>
              {wishlist.has(p.place_id) ? "♥ Saved" : "♡ Save to wishlist"}
            </button>
          </div>
          <a href={`https://maps.google.com/?q=${encodeURIComponent(p.name+", Sri Lanka")}`} target="_blank" rel="noopener noreferrer" style={{ display:"block", textAlign:"center", marginTop:10, fontSize:12, color:C.teal, textDecoration:"none" }}>📍 Open in Google Maps</a>
        </div>
      </div>
    </div>
  );
}

// ─── SRI LANKA MAP PAGE ───────────────────────────────────────────────────────
const MAP_PINS = [
  { id:"yala",       x:68,  y:82,  emoji:"🐆", name:"Yala National Park",     fact:"Highest leopard density on earth",        color:"#C45230" },
  { id:"sigiriya",   x:52,  y:38,  emoji:"🏰", name:"Sigiriya",               fact:"5th-century Lion Rock fortress",           color:"#B87318" },
  { id:"kandy",      x:45,  y:52,  emoji:"🌿", name:"Kandy",                  fact:"Temple of the Tooth & tea country",        color:"#0B6B52" },
  { id:"ella",       x:52,  y:65,  emoji:"🚂", name:"Ella",                   fact:"Scenic train & Nine Arch Bridge",          color:"#0B6B52" },
  { id:"mirissa",    x:42,  y:88,  emoji:"🐋", name:"Mirissa",                fact:"Blue whale watching capital",              color:"#185FA5" },
  { id:"colombo",    x:28,  y:62,  emoji:"🏙️", name:"Colombo",                fact:"Commercial capital & cultural hub",        color:"#3D3D3D" },
  { id:"galle",      x:32,  y:84,  emoji:"🏰", name:"Galle Fort",             fact:"17th-century Dutch colonial fortress",     color:"#B87318" },
  { id:"anuradhapura",x:42, y:22,  emoji:"🏛️", name:"Anuradhapura",           fact:"Ancient sacred city, 2300-year-old Bo tree",color:"#B87318"},
  { id:"trinco",     x:70,  y:28,  emoji:"🤿", name:"Trincomalee",            fact:"Natural harbour & coral reef snorkelling", color:"#185FA5" },
  { id:"udawalawe",  x:52,  y:76,  emoji:"🐘", name:"Udawalawe",              fact:"Largest elephant herds in Sri Lanka",       color:"#7A4A0A" },
  { id:"nuwaraeliya",x:46,  y:60,  emoji:"☕", name:"Nuwara Eliya",           fact:"Tea capital at 1868m elevation",           color:"#0B6B52" },
  { id:"arugambay",  x:80,  y:70,  emoji:"🏄", name:"Arugam Bay",             fact:"World-class surf point break",             color:"#185FA5" },
  { id:"dambulla",   x:48,  y:35,  emoji:"🕌", name:"Dambulla Cave Temple",   fact:"5 caves of ancient Buddhist murals",       color:"#B87318" },
  { id:"wilpattu",   x:30,  y:28,  emoji:"🦁", name:"Wilpattu National Park", fact:"Largest park, secret leopard sightings",   color:"#C45230" },
  { id:"kalpitiya",  x:22,  y:35,  emoji:"🪁", name:"Kalpitiya",              fact:"Best kite surfing in Asia",                color:"#185FA5" },
];

const GEO_LABELS = [
  { x:50, y:10, text:"Northern Province", size:10, opacity:.5 },
  { x:18, y:50, text:"Western Coast", size:9, opacity:.45, rotate:-90 },
  { x:82, y:50, text:"Eastern Coast", size:9, opacity:.45, rotate:90 },
  { x:50, y:95, text:"Indian Ocean", size:10, opacity:.4, italic:true },
  { x:50, y:55, text:"Central Highlands", size:9, opacity:.4 },
];

function SriLankaMapPage({ setPage }) {
  const [hoveredPin, setHoveredPin] = useState(null);
  const [selectedPin, setSelectedPin] = useState(null);

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#0A2A3A,#0B4A6B,#0A3A50)" }}>
      <style>{`
        @keyframes elephantWalk {
          0%,100% { transform: translateX(0px); }
          50% { transform: translateX(6px); }
        }
        @keyframes whaleTail {
          0%,100% { transform: rotate(-8deg); }
          50% { transform: rotate(8deg); }
        }
        @keyframes birdFly {
          0%,100% { transform: translate(0,0) rotate(0deg); }
          25% { transform: translate(4px,-3px) rotate(-5deg); }
          75% { transform: translate(-4px,-3px) rotate(5deg); }
        }
        @keyframes waveMove {
          0%,100% { transform: translateX(0) scaleY(1); }
          50% { transform: translateX(4px) scaleY(1.2); }
        }
        @keyframes pinPulse {
          0%,100% { transform: scale(1); filter: drop-shadow(0 0 4px rgba(255,255,255,.3)); }
          50% { transform: scale(1.15); filter: drop-shadow(0 0 8px rgba(255,255,255,.6)); }
        }
        @keyframes trainMove {
          0%,100% { transform: translateX(0); }
          50% { transform: translateX(5px); }
        }
        @keyframes kiteFloat {
          0%,100% { transform: translate(0,0) rotate(-5deg); }
          50% { transform: translate(3px,-5px) rotate(5deg); }
        }
        @keyframes surfWave {
          0%,100% { transform: scaleX(1); }
          50% { transform: scaleX(1.2) translateX(3px); }
        }
      `}</style>

      {/* Page header */}
      <div style={{ padding:"2.5rem 2rem 1rem", textAlign:"center" }}>
        <div style={{ fontSize:11, color:"rgba(255,255,255,.5)", textTransform:"uppercase", letterSpacing:2, marginBottom:10 }}>Interactive</div>
        <h1 style={{ fontFamily:serif, fontSize:"clamp(28px,5vw,48px)", fontWeight:700, color:"#fff", marginBottom:10 }}>Sri Lanka</h1>
        <p style={{ fontSize:14, color:"rgba(255,255,255,.6)", marginBottom:0 }}>Tap any icon to explore what makes each place magical</p>
      </div>

      <div style={{ maxWidth:800, margin:"0 auto", padding:"0 1.5rem 3rem", position:"relative" }}>
        {/* Map container */}
        <div style={{ position:"relative", width:"100%", paddingBottom:"130%", background:"rgba(255,255,255,.04)", borderRadius:24, border:"1px solid rgba(255,255,255,.08)", overflow:"hidden" }}>

          {/* Ocean background */}
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at center, rgba(24,95,165,.25) 0%, transparent 70%)" }}/>

          {/* Sri Lanka SVG outline */}
          <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%" }} viewBox="0 0 100 130" preserveAspectRatio="xMidYMid meet">
            {/* Island body */}
            <path d="M38,8 Q42,6 46,7 Q52,6 58,9 Q64,12 68,18 Q74,25 76,33 Q78,40 77,48 Q78,56 76,63 Q74,70 72,76 Q68,83 64,88 Q58,93 52,95 Q46,97 40,95 Q34,92 29,87 Q24,81 21,74 Q18,66 18,58 Q17,50 18,42 Q19,34 22,26 Q26,18 30,13 Q34,10 38,8 Z"
              fill="#1A6B4A" stroke="rgba(255,255,255,.15)" strokeWidth=".5"/>
            {/* Highland region */}
            <ellipse cx="48" cy="58" rx="12" ry="14" fill="#0B5A3A" opacity=".6"/>
            {/* Northern peninsula */}
            <path d="M46,7 Q48,2 50,1 Q52,2 54,7" fill="#1A6B4A" stroke="rgba(255,255,255,.1)" strokeWidth=".3"/>
            {/* Rivers */}
            <path d="M48,40 Q50,50 52,60 Q53,68 50,75" stroke="rgba(100,180,220,.4)" strokeWidth=".6" fill="none"/>
            <path d="M38,40 Q36,50 35,60 Q34,68 36,74" stroke="rgba(100,180,220,.3)" strokeWidth=".4" fill="none"/>

            {/* Geographic labels */}
            {GEO_LABELS.map((l,i)=>(
              <text key={i} x={l.x} y={l.y} textAnchor="middle" fontSize={l.size} fill={`rgba(255,255,255,${l.opacity})`} fontStyle={l.italic?"italic":"normal"} transform={l.rotate?`rotate(${l.rotate},${l.x},${l.y})`:undefined} fontFamily="Georgia,serif">{l.text}</text>
            ))}

            {/* Animated waves on coast */}
            <path d="M18,58 Q15,56 12,58 Q9,60 12,62" stroke="rgba(100,180,220,.5)" strokeWidth=".8" fill="none" style={{ animation:"waveMove 2s ease-in-out infinite" }}/>
            <path d="M76,48 Q79,46 82,48 Q85,50 82,52" stroke="rgba(100,180,220,.5)" strokeWidth=".8" fill="none" style={{ animation:"waveMove 2.3s ease-in-out infinite" }}/>
            <path d="M40,95 Q40,99 44,101 Q48,103 52,101" stroke="rgba(100,180,220,.6)" strokeWidth="1" fill="none" style={{ animation:"waveMove 1.8s ease-in-out infinite" }}/>

            {/* Animated animal icons on map */}
            {/* Elephant near Udawalawe */}
            <text x="50" y="77" fontSize="6" style={{ animation:"elephantWalk 2s ease-in-out infinite" }}>🐘</text>
            {/* Whale near Mirissa */}
            <text x="38" y="90" fontSize="5" style={{ animation:"whaleTail 2.5s ease-in-out infinite" }}>🐋</text>
            {/* Leopard near Yala */}
            <text x="65" y="83" fontSize="5" style={{ animation:"pinPulse 3s ease-in-out infinite" }}>🐆</text>
            {/* Bird near Wilpattu */}
            <text x="26" y="30" fontSize="5" style={{ animation:"birdFly 2s ease-in-out infinite" }}>🦜</text>
            {/* Train near Ella */}
            <text x="48" y="67" fontSize="5" style={{ animation:"trainMove 1.5s ease-in-out infinite" }}>🚂</text>
            {/* Kite near Kalpitiya */}
            <text x="20" y="37" fontSize="5" style={{ animation:"kiteFloat 2.2s ease-in-out infinite" }}>🪁</text>
            {/* Surf near Arugam */}
            <text x="76" y="71" fontSize="5" style={{ animation:"surfWave 1.8s ease-in-out infinite" }}>🏄</text>
          </svg>

          {/* Clickable pins */}
          {MAP_PINS.map(pin=>(
            <div key={pin.id}
              onClick={()=>setSelectedPin(selectedPin?.id===pin.id?null:pin)}
              onMouseEnter={()=>setHoveredPin(pin.id)}
              onMouseLeave={()=>setHoveredPin(null)}
              style={{
                position:"absolute",
                left:`${pin.x}%`, top:`${pin.y}%`,
                transform:"translate(-50%,-50%)",
                cursor:"pointer", zIndex:10,
                animation: hoveredPin===pin.id||selectedPin?.id===pin.id ? "pinPulse 1s ease-in-out infinite" : "none",
              }}>
              <div style={{
                width:36, height:36, borderRadius:"50%",
                background: selectedPin?.id===pin.id ? pin.color : "rgba(255,255,255,.15)",
                border:`2px solid ${pin.color}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:16, backdropFilter:"blur(4px)",
                transition:"all .2s",
                boxShadow: selectedPin?.id===pin.id ? `0 0 20px ${pin.color}80` : "none",
              }}>
                {pin.emoji}
              </div>
              {/* Hover tooltip */}
              {hoveredPin===pin.id && selectedPin?.id!==pin.id && (
                <div style={{ position:"absolute", bottom:"calc(100% + 8px)", left:"50%", transform:"translateX(-50%)", background:"rgba(0,0,0,.85)", color:"#fff", fontSize:11, fontWeight:600, padding:"5px 10px", borderRadius:8, whiteSpace:"nowrap", pointerEvents:"none", backdropFilter:"blur(8px)" }}>
                  {pin.name}
                </div>
              )}
            </div>
          ))}

          {/* Selected pin info panel */}
          {selectedPin && (
            <div style={{ position:"absolute", bottom:16, left:16, right:16, background:"rgba(10,20,30,.9)", backdropFilter:"blur(16px)", borderRadius:16, padding:"14px 16px", border:"1px solid rgba(255,255,255,.15)", zIndex:20 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:44, height:44, borderRadius:12, background:selectedPin.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>
                  {selectedPin.emoji}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:serif, fontSize:16, fontWeight:700, color:"#fff", marginBottom:3 }}>{selectedPin.name}</div>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,.65)", lineHeight:1.5 }}>{selectedPin.fact}</div>
                </div>
                <button onClick={()=>{ setPage("journey"); sessionStorage.setItem("suggestDest", selectedPin.name); }} style={{ flexShrink:0, padding:"8px 14px", background:C.tealMid, color:"#fff", border:"none", borderRadius:10, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:sans, whiteSpace:"nowrap" }}>
                  Plan trip →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div style={{ marginTop:16, display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center" }}>
          {[{e:"🐘",l:"Wildlife"},{e:"🏰",l:"Heritage"},{e:"🏄",l:"Water sports"},{e:"☕",l:"Hill country"},{e:"🐋",l:"Marine life"},{e:"🏙️",l:"Cities"}].map(({e,l})=>(
            <div key={l} style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", background:"rgba(255,255,255,.08)", borderRadius:20, border:"1px solid rgba(255,255,255,.12)" }}>
              <span style={{ fontSize:14 }}>{e}</span>
              <span style={{ fontSize:11, color:"rgba(255,255,255,.7)" }}>{l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage]       = useState("home");
  const [guideOpen, setGuide] = useState(false);
  const [savedItin, setSaved] = useState(null);
  const openGuide = useCallback(()=>setGuide(true), []);
  return (
    <div style={{ fontFamily:sans, color:C.ink, background:C.white, minHeight:"100vh" }}>
      <MobileStyles/>
      <Nav page={page} setPage={setPage} onGuideOpen={openGuide}/>
      {page==="home"         && <HomePage         setPage={setPage} onGuideOpen={openGuide}/>}
      {page==="destinations" && <DestinationsPage setPage={setPage} onGuideOpen={openGuide}/>}
      {page==="explore"      && <ExplorePage      setPage={setPage} savedItin={savedItin} setSavedItin={setSaved}/>}
      {page==="journey"      && <JourneyPage      setPage={setPage} savedItin={savedItin} setSavedItin={setSaved} onGuideOpen={openGuide}/>}
      {page==="srilankamap" && <SriLankaMapPage  setPage={setPage}/>}
      <GuideDrawer open={guideOpen} onClose={()=>setGuide(false)} itin={savedItin}/>
    </div>
  );
}
