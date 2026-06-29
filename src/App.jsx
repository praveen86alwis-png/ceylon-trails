import React, { useState, useEffect, useCallback, useRef } from "react";

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

  /* Desktop nav hidden on mobile */
  .desktop-nav { display: flex !important; }

  @media (max-width: 768px) {
    /* Nav */
    .desktop-nav { display: none !important; }

    /* Grids → responsive */
    .services-grid  { grid-template-columns: 1fr !important; }
    .dest-grid-5    { grid-template-columns: 1fr 1fr !important; }
    .dest-grid-4    { grid-template-columns: 1fr 1fr !important; }
    .why-grid       { grid-template-columns: 1fr 1fr !important; }
    .cheat-grid     { grid-template-columns: 1fr !important; }
    .footer-links   { flex-wrap: wrap !important; gap: 1.5rem !important; }
    .hero-stats     { flex-wrap: wrap !important; gap: 1.5rem !important; justify-content: center !important; }
    .guide-drawer   { width: 100% !important; }
    .opt-grid-2     { grid-template-columns: 1fr !important; }
    .info-2col      { grid-template-columns: 1fr !important; }

    /* Wizard card */
    .wizard-card    { padding: 1.2rem !important; border-radius: 16px !important; }

    /* Custom places input row — stack vertically on mobile */
    .place-input-row {
      flex-direction: column !important;
      align-items: stretch !important;
      gap: 10px !important;
    }
    .place-input-row input { width: 100% !important; }
    .place-input-row button { width: 100% !important; border-radius: 12px !important; }

    /* Buttons — full width on mobile in wizard */
    .wizard-btn-row { flex-direction: row !important; gap: 10px !important; }
    .wizard-btn-row button { flex: 1 !important; padding: 12px 10px !important; font-size: 13px !important; }

    /* Result page banner */
    .result-banner  { padding: 2rem 1rem !important; }
    .result-banner h1 { font-size: 22px !important; }

    /* Start/end banner */
    .trip-banner    { flex-direction: column !important; gap: 8px !important; text-align: center !important; }

    /* Floating wishlist button — move slightly in from edge */
    .wishlist-btn   { bottom: 80px !important; right: 16px !important; width: 50px !important; height: 50px !important; }
    .wishlist-panel { right: 16px !important; width: calc(100vw - 32px) !important; bottom: 140px !important; }

    /* Emergency button */
    .emergency-btn  { bottom: 80px !important; left: 16px !important; width: 50px !important; height: 50px !important; }
    .emergency-panel{ left: 16px !important; width: calc(100vw - 32px) !important; }

    /* Day cards */
    .day-card-header { flex-wrap: wrap !important; gap: 6px !important; }

    /* Activity row — thumbnail smaller */
    .act-thumb { width: 36px !important; height: 36px !important; }

    /* Journey map scroll hint */
    .journey-map { overflow-x: auto !important; -webkit-overflow-scrolling: touch !important; }

    /* Destination tabs — scrollable */
    .dest-tabs { overflow-x: auto !important; -webkit-overflow-scrolling: touch !important; white-space: nowrap !important; }

    /* Region sub-tabs */
    .region-tabs { flex-wrap: nowrap !important; overflow-x: auto !important; }

    /* Hero section padding */
    .hero-section { padding: 3rem 1rem 2rem !important; }
  }

  @media (max-width: 480px) {
    .dest-grid-5 { grid-template-columns: 1fr !important; }
    .dest-grid-4 { grid-template-columns: 1fr !important; }
    .why-grid    { grid-template-columns: 1fr !important; }
    .hero-stats  { gap: 1rem !important; }

    /* Nav height */
    nav { padding: 0 1rem !important; }

    /* Wizard steps */
    .wizard-card { padding: 1rem !important; }
  }

  /* Touch targets */
  @media (max-width: 768px) {
    button { min-height: 44px; }
    input, select, textarea { min-height: 44px; font-size: 16px !important; }
    a { min-height: 44px; display: inline-flex; align-items: center; }
  }

  html { scroll-behavior: smooth; }
  img  { max-width: 100%; }
`;

function MobileStyles() {
  return <style>{MOBILE_CSS}</style>;
}

// ─── NAV ─────────────────────────────────────────────────────────────────────
// ─── NAV WITH AUTH ────────────────────────────────────────────────────────────
function NavWithAuth({ page, setPage, onGuideOpen, user, signOut, onLoginClick }) {
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [destHover, setDestHover] = useState(false);
  const hoverTimer = useRef(null);

  const openDest = (catId) => {
    setPage("destinations"); setDestHover(false); setMenuOpen(false);
    sessionStorage.setItem("explorecat", catId);
  };
  const handleDestEnter = () => { clearTimeout(hoverTimer.current); setDestHover(true); };
  const handleDestLeave = () => { hoverTimer.current = setTimeout(()=>setDestHover(false), 200); };

  const displayName = user?.displayName?.split(" ")[0] || user?.email?.split("@")[0];

  return (
    <>
      <nav style={{ position:"sticky", top:0, zIndex:400, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 1.5rem", height:64, background:"rgba(255,255,255,0.96)", backdropFilter:"blur(14px)", borderBottom:`1px solid rgba(0,0,0,0.06)` }}>
        <div onClick={()=>{ setPage("home"); setMenuOpen(false); }} style={{ cursor:"pointer", fontFamily:serif, fontSize:20, fontWeight:700, color:C.ink, flexShrink:0 }}>
          Ceylon<span style={{ color:C.tealMid }}>Trails</span>
          <sup style={{ fontFamily:sans, fontSize:9, color:C.amber, letterSpacing:1, textTransform:"uppercase", verticalAlign:"super", marginLeft:1 }}>LK</sup>
        </div>

        {/* Desktop links */}
        <div className="desktop-nav" style={{ display:"flex", gap:"1.6rem", alignItems:"center" }}>
          <span onClick={()=>setPage("home")} style={{ fontSize:14, color:page==="home"?C.teal:C.inkSoft, fontWeight:page==="home"?600:400, cursor:"pointer", borderBottom:page==="home"?`2px solid ${C.teal}`:"2px solid transparent", paddingBottom:2 }}>Home</span>

          <div style={{ position:"relative" }} onMouseEnter={handleDestEnter} onMouseLeave={handleDestLeave}>
            <span style={{ fontSize:14, color:page==="destinations"?C.teal:C.inkSoft, fontWeight:page==="destinations"?600:400, cursor:"pointer", borderBottom:page==="destinations"?`2px solid ${C.teal}`:"2px solid transparent", paddingBottom:2, display:"flex", alignItems:"center", gap:4 }}
              onClick={()=>setPage("destinations")}>
              Destinations <span style={{ fontSize:10, opacity:.6 }}>▾</span>
            </span>
            {destHover && (
              <div style={{ position:"absolute", top:"calc(100% + 14px)", left:"50%", transform:"translateX(-50%)", background:"#fff", borderRadius:16, boxShadow:"0 8px 40px rgba(0,0,0,.15)", border:`1px solid ${C.border}`, padding:12, width:340, zIndex:500, display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                <div style={{ position:"absolute", top:-7, left:"50%", width:14, height:14, background:"#fff", border:`1px solid ${C.border}`, borderBottom:"none", borderRight:"none", transform:"translateX(-50%) rotate(45deg)" }}/>
                {[
                  {id:"hotels",label:"🏨 Hotels",desc:"Luxury to budget stays"},
                  {id:"restaurants",label:"🍛 Restaurants",desc:"Local & international cuisine"},
                  {id:"places",label:"📍 Places to Visit",desc:"All regions by province"},
                ].map(cat=>(
                  <div key={cat.id} onClick={()=>openDest(cat.id)} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10, cursor:"pointer", transition:"background .15s" }}
                    onMouseEnter={e=>e.currentTarget.style.background=C.tealPale}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <span style={{ fontSize:22, flexShrink:0 }}>{cat.label.split(" ")[0]}</span>
                    <div><div style={{ fontSize:13, fontWeight:600, color:C.ink }}>{cat.label.slice(cat.label.indexOf(" ")+1)}</div><div style={{ fontSize:11, color:C.inkSoft }}>{cat.desc}</div></div>
                  </div>
                ))}
                <div onClick={()=>{ setPage("destinations"); setDestHover(false); }} style={{ gridColumn:"1/-1", padding:"8px 12px", borderTop:`1px solid ${C.border}`, marginTop:4, textAlign:"center", fontSize:12, fontWeight:600, color:C.teal, cursor:"pointer" }}>Browse all destinations →</div>
              </div>
            )}
          </div>

          <span onClick={()=>setPage("srilankamap")} style={{ fontSize:14, color:page==="srilankamap"?C.teal:C.inkSoft, fontWeight:page==="srilankamap"?600:400, cursor:"pointer", borderBottom:page==="srilankamap"?`2px solid ${C.teal}`:"2px solid transparent", paddingBottom:2, whiteSpace:"nowrap" }}>Sri Lanka Map</span>
          <span onClick={()=>setPage("journey")} style={{ fontSize:14, color:page==="journey"?C.teal:C.inkSoft, fontWeight:page==="journey"?600:400, cursor:"pointer", borderBottom:page==="journey"?`2px solid ${C.teal}`:"2px solid transparent", paddingBottom:2, whiteSpace:"nowrap" }}>Plan a trip</span>
          <span onClick={onGuideOpen} style={{ fontSize:14, color:C.inkSoft, cursor:"pointer", paddingBottom:2, whiteSpace:"nowrap" }}>Find a Guide</span>
          <span onClick={()=>setPage("guideportal")} style={{ fontSize:14, color:page==="guideportal"?C.teal:C.inkSoft, fontWeight:page==="guideportal"?600:400, cursor:"pointer", borderBottom:page==="guideportal"?"2px solid "+C.teal:"2px solid transparent", paddingBottom:2, whiteSpace:"nowrap" }}>Guide Portal</span>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {/* Auth button */}
          {user ? (
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:32, height:32, borderRadius:"50%", background:C.teal, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700 }}>
                {displayName?.[0]?.toUpperCase()||"U"}
              </div>
              <span style={{ fontSize:13, fontWeight:600, color:C.ink }}>{displayName}</span>
              <button onClick={signOut} style={{ fontSize:12, color:C.inkSoft, background:"none", border:`1px solid ${C.border}`, borderRadius:8, padding:"4px 10px", cursor:"pointer", fontFamily:sans }}>Sign out</button>
            </div>
          ) : (
            <button onClick={onLoginClick} style={{ padding:"8px 18px", background:"transparent", color:C.teal, border:`1.5px solid ${C.teal}`, borderRadius:12, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:sans }}>Sign in</button>
          )}
          <button onClick={()=>setPage("journey")} style={{ padding:"9px 18px", background:C.teal, color:"#fff", border:"none", borderRadius:12, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:sans, whiteSpace:"nowrap" }}>Plan my trip</button>
          <button onClick={()=>setMenuOpen(o=>!o)} style={{ display:"flex", flexDirection:"column", gap:5, padding:8, background:"none", border:`1px solid ${C.border}`, borderRadius:10, cursor:"pointer" }}>
            <span style={{ width:20, height:2, background:menuOpen?C.teal:C.ink, borderRadius:2 }}/>
            <span style={{ width:20, height:2, background:menuOpen?C.teal:C.ink, borderRadius:2 }}/>
            <span style={{ width:20, height:2, background:menuOpen?C.teal:C.ink, borderRadius:2 }}/>
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div style={{ position:"fixed", top:64, left:0, right:0, zIndex:399, background:"#fff", borderBottom:`1px solid ${C.border}`, boxShadow:"0 8px 24px rgba(0,0,0,.1)", padding:"1rem 1.5rem 1.5rem", maxHeight:"80vh", overflowY:"auto" }}>
          {[["home","🏠 Home"],["destinations","🗺️ Destinations"],["srilankamap","🗾 Sri Lanka Map"],["journey","✨ Plan a trip"],["guides","🧭 Find a Guide"],["guideportal","🧭 Guide Portal"]].map(([p,l])=>(
            <div key={p} onClick={()=>{ if(p==="guides") onGuideOpen(); else setPage(p); setMenuOpen(false); }} style={{ padding:"14px 0", fontSize:16, fontWeight:page===p?600:400, color:page===p?C.teal:C.ink, cursor:"pointer", borderBottom:`1px solid ${C.border}` }}>{l}</div>
          ))}
          {user ? (
            <div style={{ marginTop:14, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:14, color:C.ink }}>👤 {displayName}</span>
              <button onClick={()=>{ signOut(); setMenuOpen(false); }} style={{ fontSize:13, color:C.coral, background:"none", border:`1px solid ${C.coral}`, borderRadius:8, padding:"6px 14px", cursor:"pointer", fontFamily:sans }}>Sign out</button>
            </div>
          ) : (
            <button onClick={()=>{ onLoginClick(); setMenuOpen(false); }} style={{ marginTop:14, width:"100%", padding:"13px", background:"transparent", color:C.teal, border:`1.5px solid ${C.teal}`, borderRadius:12, fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:sans }}>Sign in / Create account</button>
          )}
          <button onClick={()=>{ setPage("journey"); setMenuOpen(false); }} style={{ marginTop:10, width:"100%", padding:"13px", background:C.teal, color:"#fff", border:"none", borderRadius:12, fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:sans }}>✨ Create my journey</button>
        </div>
      )}
    </>
  );
}
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
// ─── WISHLIST PANEL (floating) ────────────────────────────────────────────────
function WishlistPanel({ wishlist, savedItin, setSavedItin }) {
  const [open, setOpen] = useState(false);

  const addToItin = (place) => {
    if (!savedItin) { alert("Create an itinerary first from 'Plan a trip'."); return; }
    const newAct = {
      time:"10:00", type:"sightseeing",
      place: place.name, area: place.formatted_address||"Sri Lanka",
      text: `Visit ${place.name}`, why:"From your wishlist",
      hours:"", price: place.price_level?"$".repeat(place.price_level):"",
      mapQuery:`${place.name}, Sri Lanka`,
    };
    setSavedItin({ ...savedItin, days: savedItin.days.map((d,i)=>i===0?{...d,activities:[...d.activities,newAct]}:d) });
    alert(`✅ Added ${place.name} to Day 1 of your itinerary!`);
  };

  return (
    <>
      {/* Floating button */}
      <button onClick={()=>setOpen(o=>!o)} className="wishlist-btn" style={{
        position:"fixed", bottom:24, right:24, zIndex:500,
        width:56, height:56, borderRadius:"50%",
        background: open ? C.amber : C.white,
        color: open ? "#fff" : C.amber,
        border:`2px solid ${C.amber}`,
        fontSize:22, cursor:"pointer",
        boxShadow:"0 4px 20px rgba(0,0,0,.2)",
        display:"flex", alignItems:"center", justifyContent:"center",
        transition:"all .2s",
      }}>
        {open ? "✕" : "♡"}
        {wishlist.items.length>0 && !open && (
          <span style={{ position:"absolute", top:-4, right:-4, width:20, height:20, background:C.coral, color:"#fff", borderRadius:"50%", fontSize:10, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", border:"2px solid #fff" }}>
            {wishlist.items.length}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="wishlist-panel" style={{ position:"fixed", bottom:90, right:24, zIndex:500, width:340, maxWidth:"calc(100vw - 48px)", background:"#fff", borderRadius:20, boxShadow:"0 12px 48px rgba(0,0,0,.2)", border:`1px solid ${C.border}`, display:"flex", flexDirection:"column", maxHeight:"60vh" }}>
          <div style={{ padding:"14px 16px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
            <div>
              <div style={{ fontFamily:serif, fontSize:16, fontWeight:700, color:C.ink }}>♡ Wishlist</div>
              <div style={{ fontSize:11, color:C.inkSoft, marginTop:2 }}>{wishlist.items.length} saved {wishlist.items.length===1?"place":"places"}</div>
            </div>
            {wishlist.items.length>0 && <button onClick={()=>{ if(window.confirm("Clear wishlist?")) wishlist.items.forEach(i=>wishlist.remove(i.place_id)); }} style={{ fontSize:11, color:C.coral, background:"none", border:"none", cursor:"pointer", fontFamily:sans }}>Clear all</button>}
          </div>
          <div style={{ flex:1, overflowY:"auto", padding:12 }}>
            {wishlist.items.length===0 ? (
              <div style={{ textAlign:"center", padding:"2rem 1rem", color:C.inkSoft }}>
                <div style={{ fontSize:36, marginBottom:10 }}>♡</div>
                <p style={{ fontSize:13, lineHeight:1.6 }}>No saved places yet.<br/>Browse destinations and tap ♡ to save.</p>
              </div>
            ) : wishlist.items.map(p=>(
              <div key={p.place_id} style={{ display:"flex", gap:10, padding:"10px 0", borderBottom:`1px solid ${C.border}` }}>
                <div style={{ width:56, height:56, borderRadius:10, overflow:"hidden", flexShrink:0, background:`linear-gradient(135deg,${C.teal},#147856)` }}>
                  {p.photos?.[0] && <img src={`${import.meta.env.PROD?"/api/places":"http://localhost:3001/api/places"}/photo?ref=${encodeURIComponent(p.photos[0].photo_reference)}&maxwidth=120`} alt={p.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>e.target.style.display="none"}/>}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:C.ink, marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</div>
                  <div style={{ fontSize:11, color:C.inkSoft, marginBottom:6 }}>{p.rating}★ · {(p.formatted_address||"").split(",").slice(-2).join(",")}</div>
                  <div style={{ display:"flex", gap:6 }}>
                    <button onClick={()=>addToItin(p)} style={{ fontSize:11, fontWeight:600, padding:"4px 10px", background:C.teal, color:"#fff", border:"none", borderRadius:8, cursor:"pointer", fontFamily:sans }}>+ Itinerary</button>
                    <button onClick={()=>wishlist.remove(p.place_id)} style={{ fontSize:11, fontWeight:600, padding:"4px 10px", background:"none", color:C.coral, border:`1px solid ${C.coral}`, borderRadius:8, cursor:"pointer", fontFamily:sans }}>Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// ─── UNIFIED DESTINATIONS PAGE ───────────────────────────────────────────────
// Merges region cards (Beaches, Hill Country etc) + Google Places (Hotels, Restaurants etc)
// Province mapping for destinations
const PROVINCE_MAP = {
  // Beaches
  "Mirissa":"Southern Province", "Unawatuna":"Southern Province", "Hikkaduwa":"Southern Province",
  "Tangalle":"Southern Province", "Arugam Bay":"Eastern Province", "Nilaveli":"Eastern Province",
  // Hills
  "Ella":"Uva Province", "Kandy":"Central Province", "Nuwara Eliya":"Central Province",
  "Haputale":"Uva Province", "Horton Plains":"Central Province", "Knuckles Range":"Central Province",
  // Cultural
  "Sigiriya":"North Central Province", "Anuradhapura":"North Central Province",
  "Polonnaruwa":"North Central Province", "Dambulla Cave Temple":"Central Province",
  "Galle Fort":"Southern Province", "Jaffna":"Northern Province",
  // Wildlife
  "Yala National Park":"Southern Province", "Wilpattu National Park":"North Western Province",
  "Udawalawe":"Southern Province", "Sinharaja Rainforest":"Southern Province",
  "Minneriya":"North Central Province", "Bundala":"Southern Province",
  // Adventure
  "Adam's Peak":"Sabaragamuwa Province", "Ella Rock Hike":"Uva Province",
  "Kitulgala White Water":"Sabaragamuwa Province", "Pidurutalagala":"Central Province",
  "Kite Surfing, Kalpitiya":"North Western Province", "Knuckles Camping":"Central Province",
  // Rural
  "Knuckles Villages":"Central Province", "Weligama Fisher Village":"Southern Province",
  "Dambulla Farming Village":"Central Province", "Mahiyanganaya":"Uva Province",
  "Belihuloya Valley":"Sabaragamuwa Province", "Tangalle Village Coast":"Southern Province",
};

// Regions grouped under "Places to Visit"
const PLACES_REGIONS = [
  { id:"beaches",  label:"🏖️ Beaches",         province:"Southern & Eastern", color:[C.tealMid,"#0A8060"] },
  { id:"hills",    label:"⛰️ Hill Country",     province:"Central & Uva",      color:["#2A6040","#1A3A2A"] },
  { id:"cultural", label:"🏛️ Cultural Sites",   province:"North Central",      color:["#B87318","#7A4A0A"] },
  { id:"wildlife", label:"🐘 Wildlife & Nature", province:"Southern & NW",      color:["#145840","#0A2A20"] },
  { id:"adventure",label:"🧗 Adventure",         province:"Central & Sabara.",  color:["#C45230","#7A2010"] },
  { id:"rural",    label:"🌾 Rural Sri Lanka",   province:"All provinces",      color:["#7A6010","#4A3A08"] },
];

const ALL_TABS = [
  { id:"hotels",      label:"🏨 Hotels",          type:"places" },
  { id:"restaurants", label:"🍛 Restaurants",      type:"places" },
  { id:"places",      label:"📍 Places to Visit",  type:"places_regions" },
];


function DestinationsPage({ setPage, onGuideOpen, savedItin, setSavedItin }) {
  const init = sessionStorage.getItem("explorecat") || "hotels";
  const [activeTab, setActiveTab]       = useState(init);
  const [activeRegion, setActiveRegion] = useState("beaches"); // sub-region under Places to Visit
  const [gallery, setGallery]           = useState(null);
  const [places, setPlaces]             = useState([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [selected, setSelected]         = useState(null);
  const [addedToast, setToast]          = useState(false);
  const wishlist = useWishlist();

  const tab = ALL_TABS.find(t=>t.id===activeTab) || ALL_TABS[0];

  useEffect(()=>{
    if (tab.type==="places") loadPlaces(activeTab);
  }, [activeTab]);

  const loadPlaces = async (catId) => {
    setLoading(true); setError(""); setPlaces([]);
    try {
      const query = GPLACES_CAT_QUERIES[catId];
      const data  = await placesSearch(query);
      if (data.error==="no_key") { setError("no_key"); setLoading(false); return; }
      if (data.status==="REQUEST_DENIED") { setError("denied"); setLoading(false); return; }
      setPlaces(data.results||[]);
    } catch(e) { setError(e.message); }
    setLoading(false);
  };

  const switchTab = (id) => {
    setActiveTab(id); setSelected(null); setError(""); setPlaces([]);
    sessionStorage.setItem("explorecat", id);
  };

  const addToItin = (place) => {
    const newAct = {
      time:"10:00", type:"sightseeing",
      place:place.name, area:place.formatted_address||"Sri Lanka",
      text:`Visit ${place.name} — rated ${place.rating||"N/A"}★`,
      why:"Added from Destinations", hours:"", price:place.price_level?"$".repeat(place.price_level):"",
      mapQuery:`${place.name}, Sri Lanka`,
    };
    if (savedItin) {
      setSavedItin({...savedItin, days:savedItin.days.map((d,i)=>i===0?{...d,activities:[...d.activities,newAct]}:d)});
      setToast(true); setTimeout(()=>setToast(false),2500);
    } else { alert("Create an itinerary first from 'Plan a trip', then come back to add places."); }
  };

  // Region data for Places to Visit
  const regionData = DESTINATIONS[activeRegion] || [];
  const regionCat  = DEST_CATS.find(c=>c.id===activeRegion);

  return (
    <div style={{ minHeight:"100vh", background:C.surface }}>
      <GalleryLightbox place={gallery} onClose={()=>setGallery(null)}/>

      {addedToast && (
        <div style={{ position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)", background:C.teal, color:"#fff", padding:"12px 24px", borderRadius:30, fontSize:14, fontWeight:600, zIndex:800, boxShadow:"0 4px 20px rgba(0,0,0,.2)", whiteSpace:"nowrap" }}>
          ✅ Added to Day 1 of your itinerary!
        </div>
      )}

      {/* Hero */}
      <div style={{ background:"linear-gradient(160deg,#04322A 0%,#0B6B52 70%,#147856 100%)", padding:"3rem 2rem 2.5rem", position:"relative", overflow:"hidden" }}>
        <HeroArt/>
        <div style={{ position:"relative", zIndex:2, maxWidth:800, margin:"0 auto", textAlign:"center" }}>
          <div style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,.6)", textTransform:"uppercase", letterSpacing:2, marginBottom:10 }}>Explore Sri Lanka</div>
          <h1 style={{ fontFamily:serif, fontSize:"clamp(28px,5vw,46px)", fontWeight:700, color:"#fff", marginBottom:12 }}>Where would you like to go?</h1>
          <p style={{ fontSize:15, color:"rgba(255,255,255,.7)", lineHeight:1.7, maxWidth:520, margin:"0 auto", fontWeight:300 }}>Hotels, restaurants and every destination across all 9 provinces.</p>
        </div>
      </div>

      {/* Main tab bar */}
      <div style={{ position:"sticky", top:64, zIndex:300, background:C.white, borderBottom:`1px solid ${C.border}` }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"flex", padding:"0 1rem" }}>
          {ALL_TABS.map(t=>(
            <button key={t.id} onClick={()=>switchTab(t.id)} style={{
              padding:"14px 24px", border:"none", background:"transparent",
              fontSize:14, fontWeight:activeTab===t.id?700:400,
              color:activeTab===t.id?C.teal:C.inkSoft, cursor:"pointer",
              borderBottom:activeTab===t.id?`2.5px solid ${C.teal}`:"2.5px solid transparent",
              whiteSpace:"nowrap", fontFamily:sans, flexShrink:0,
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"2rem 2rem 5rem" }}>

        {/* ── HOTELS & RESTAURANTS (Google Places) ── */}
        {tab.type==="places" && (
          <PlacesTabContent
            catId={activeTab} places={places} loading={loading} error={error}
            tab={tab} wishlist={wishlist} selected={selected}
            setSelected={setSelected} addToItin={addToItin}
            onRetry={()=>loadPlaces(activeTab)}
          />
        )}

        {/* ── PLACES TO VISIT (regions grouped by province) ── */}
        {tab.type==="places_regions" && (
          <>
            {/* Region sub-tabs */}
            <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:24 }}>
              {PLACES_REGIONS.map(r=>(
                <button key={r.id} onClick={()=>setActiveRegion(r.id)} style={{
                  padding:"10px 18px", border:`1.5px solid ${activeRegion===r.id?r.color[0]:C.border}`,
                  borderRadius:20, background:activeRegion===r.id?r.color[0]:"#fff",
                  color:activeRegion===r.id?"#fff":C.ink,
                  cursor:"pointer", fontFamily:sans, fontSize:13, fontWeight:600,
                  transition:"all .15s",
                }}>
                  {r.label}
                  <span style={{ fontSize:10, marginLeft:6, opacity:.75 }}>· {r.province}</span>
                </button>
              ))}
            </div>

            {/* Region info */}
            {regionCat && (
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:10 }}>
                <div>
                  <h2 style={{ fontFamily:serif, fontSize:22, fontWeight:700, color:C.ink, marginBottom:4 }}>
                    {PLACES_REGIONS.find(r=>r.id===activeRegion)?.label}
                  </h2>
                  <p style={{ fontSize:13, color:C.inkSoft }}>
                    📍 {PLACES_REGIONS.find(r=>r.id===activeRegion)?.province} · {regionData.length} destinations ·
                    <span style={{ color:C.teal, fontWeight:500 }}> Click any card for photo gallery</span>
                  </p>
                </div>
                <Btn onClick={()=>setPage("journey")} style={{ flexShrink:0 }}>✨ Plan a trip here</Btn>
              </div>
            )}

            <div className="dest-grid-4" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1.2rem" }}>
              {regionData.map(p=>(
                <div key={p.name} onClick={()=>setGallery(p)} style={{ border:`1.5px solid ${C.border}`, borderRadius:16, overflow:"hidden", background:C.white, cursor:"pointer", transition:"transform .2s,box-shadow .2s" }}
                  onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 8px 30px rgba(0,0,0,.1)"; }}
                  onMouseLeave={e=>{ e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}>
                  {/* Cover image via Unsplash */}
                  <div style={{ height:160, background:`linear-gradient(135deg,${regionCat?.color[0]||C.teal},${regionCat?.color[1]||"#147856"})`, position:"relative", overflow:"hidden" }}>
                    <img src={getUnsplashUrl(p.name, 400, 240)} alt={p.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>e.target.style.display="none"}/>
                    <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(0,0,0,.6) 0%,transparent 55%)" }}/>
                    <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"10px 14px" }}>
                      <div style={{ fontFamily:serif, fontSize:16, fontWeight:700, color:"#fff" }}>{p.name}</div>
                      {/* Province badge */}
                      <div style={{ fontSize:10, color:"rgba(255,255,255,.8)", marginTop:3 }}>
                        📍 {PROVINCE_MAP[p.name]||"Sri Lanka"}
                      </div>
                    </div>
                    <div style={{ position:"absolute", top:8, right:8, background:"rgba(0,0,0,.45)", backdropFilter:"blur(4px)", color:"#fff", fontSize:10, fontWeight:600, padding:"3px 8px", borderRadius:20 }}>🖼️ Gallery</div>
                  </div>
                  <div style={{ padding:"12px 14px" }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                      <Pill>{p.tag}</Pill>
                      <span style={{ fontSize:11, fontWeight:600, padding:"3px 8px", borderRadius:20,
                        background:p.crowd==="Low"?"#EBF5D8":p.crowd==="High"?C.coralLight:C.amberLight,
                        color:p.crowd==="Low"?"#3A6B10":p.crowd==="High"?C.coral:C.amber,
                        border:`1px solid ${p.crowd==="Low"?"#C1DB8E":p.crowd==="High"?"#EFBAA8":"#F0D48A"}`,
                      }}>{p.crowd} crowds</span>
                    </div>
                    <p style={{ fontSize:12, color:C.inkSoft, lineHeight:1.6, marginBottom:10 }}>{p.desc}</p>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", paddingTop:8, borderTop:`1px solid ${C.border}` }}>
                      <span style={{ fontSize:11, color:C.inkSoft }}>📅 Best: <strong style={{ color:C.ink }}>{p.best}</strong></span>
                      <button onClick={e=>{ e.stopPropagation(); setPage("journey"); }} style={{ fontSize:12, fontWeight:600, color:C.teal, background:"none", border:"none", cursor:"pointer", fontFamily:sans }}>Plan trip →</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign:"center", marginTop:"2.5rem" }}>
              <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
                <Btn onClick={()=>setPage("journey")}>✨ Create AI itinerary</Btn>
                <Btn variant="amber" onClick={onGuideOpen}>Find a local guide →</Btn>
              </div>
            </div>
          </>
        )}
      </div>

      {selected && (
        <PlaceDetailPanel place={selected} wishlist={wishlist} onAddToItin={()=>{ addToItin(selected); setSelected(null); }} onClose={()=>setSelected(null)}/>
      )}
    </div>
  );
}

// Extracted Places tab content (Hotels/Restaurants)
function PlacesTabContent({ catId, places, loading, error, tab, wishlist, selected, setSelected, addToItin, onRetry }) {
  return (
    <>
      {error==="no_key" && (
        <div style={{ background:C.amberLight, border:`1.5px solid #F0D48A`, borderRadius:16, padding:"2rem", textAlign:"center" }}>
          <div style={{ fontSize:32, marginBottom:10 }}>🔑</div>
          <h3 style={{ fontFamily:serif, fontSize:18, fontWeight:700, color:C.ink, marginBottom:8 }}>Google Places API key needed</h3>
          <p style={{ fontSize:14, color:C.inkSoft, lineHeight:1.7, maxWidth:440, margin:"0 auto" }}>Add <code style={{ background:"rgba(0,0,0,.08)", padding:"2px 6px", borderRadius:4 }}>GOOGLE_PLACES_KEY</code> to your proxy <code>.env</code> and Vercel environment variables.</p>
        </div>
      )}
      {error==="denied" && <div style={{ background:C.coralLight, border:`1.5px solid #EFBAA8`, borderRadius:16, padding:"2rem", textAlign:"center" }}><p style={{ fontSize:14, color:C.coral }}>⚠️ API key rejected — enable <strong>Places API</strong> in Google Cloud Console.</p></div>}
      {error && error!=="no_key" && error!=="denied" && (
        <div style={{ textAlign:"center", padding:"2rem" }}>
          <p style={{ color:C.coral, fontSize:14, marginBottom:12 }}>{error}</p>
          <Btn onClick={onRetry}>Try again</Btn>
        </div>
      )}
      {loading && (
        <div style={{ textAlign:"center", padding:"4rem" }}>
          <div style={{ width:44, height:44, border:`3px solid ${C.tealLight}`, borderTopColor:C.teal, borderRadius:"50%", animation:"spin .8s linear infinite", margin:"0 auto 14px" }}/>
          <p style={{ fontSize:14, color:C.inkSoft }}>Finding the best places in Sri Lanka…</p>
        </div>
      )}
      {!loading && !error && places.length>0 && (
        <div className="dest-grid-4" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1.2rem" }}>
          {places.map(p=>(
            <div key={p.place_id} onClick={()=>setSelected(p)} style={{ border:`1.5px solid ${C.border}`, borderRadius:16, overflow:"hidden", background:C.white, cursor:"pointer", transition:"transform .2s,box-shadow .2s" }}
              onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 8px 30px rgba(0,0,0,.1)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}>
              <div style={{ height:160, background:`linear-gradient(135deg,${C.teal},#147856)`, overflow:"hidden", position:"relative" }}>
                {p.photos?.[0]
                  ? <img src={photoUrl(p.photos[0].photo_reference)} alt={p.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>e.target.style.display="none"}/>
                  : <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:40, opacity:.25 }}>{tab.label.split(" ")[0]}</div>
                }
                <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"8px 12px", background:"linear-gradient(to top,rgba(0,0,0,.65),transparent)" }}>
                  <div style={{ fontFamily:serif, fontSize:15, fontWeight:700, color:"#fff" }}>{p.name}</div>
                </div>
                {wishlist.has(p.place_id) && <div style={{ position:"absolute", top:8, right:8, background:C.amber, color:"#fff", fontSize:11, fontWeight:700, padding:"3px 8px", borderRadius:20 }}>♥</div>}
              </div>
              <div style={{ padding:"12px 14px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                  <span style={{ fontSize:12, color:C.amberMid }}>{"★".repeat(Math.round(p.rating||0))}<span style={{ color:C.inkSoft }}> {p.rating} ({(p.user_ratings_total||0).toLocaleString()})</span></span>
                  {p.price_level && <span style={{ fontSize:12, color:C.teal, fontWeight:600 }}>{"$".repeat(p.price_level)}</span>}
                </div>
                <p style={{ fontSize:11, color:C.inkSoft, lineHeight:1.5, margin:0 }}>{(p.formatted_address||"").split(",").slice(-3).join(", ")}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && !error && places.length===0 && <div style={{ textAlign:"center", padding:"3rem", color:C.inkSoft }}><div style={{ fontSize:40, marginBottom:10 }}>🔍</div><p>No results found.</p></div>}
      {selected && <PlaceDetailPanel place={selected} wishlist={wishlist} onAddToItin={()=>{ addToItin(selected); setSelected(null); }} onClose={()=>setSelected(null)}/>}
    </>
  );
}


// ─── API HELPER ──────────────────────────────────────────────────────────────
// Points to the local Gemini proxy (server.js).
// Sends { prompt, temperature } → receives { text } back.
const PROXY_URL = import.meta.env.PROD
  ? "/api/generate"
  : "http://localhost:3001/api/generate";

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
      // Use unsplashQuery from AI if available, else build from place name
      const query = act.unsplashQuery
        || UNSPLASH_KEYWORDS[act.place]
        || (act.mapQuery || act.place || "").toLowerCase().replace(/[,]/g,"").replace(/\s+/g,"-");
      setPhoto(`https://source.unsplash.com/800x400/?${encodeURIComponent(query)}`);
    }
  };

  // Thumbnail for collapsed row — uses unsplashQuery too
  const thumbQuery = act.unsplashQuery
    || UNSPLASH_KEYWORDS[act.place]
    || (act.place||"sri lanka").toLowerCase().replace(/\s+/g,"-");
  const thumbUrl = `https://source.unsplash.com/80x80/?${encodeURIComponent(thumbQuery)}`;

  return (
    <div style={{ borderBottom:hideBorder||isLast?"none":`1px solid ${C.border}` }}>
      <div onClick={handleExpand} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 0", cursor:"pointer" }}
        onMouseEnter={e=>e.currentTarget.style.background="#FAFAF8"}
        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
        {/* Thumbnail always visible */}
        <div style={{ width:44, height:44, borderRadius:8, overflow:"hidden", flexShrink:0, background:`linear-gradient(135deg,${C.teal},#147856)`, position:"relative" }}>
          <img src={thumbUrl} alt={act.place||""} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>e.target.style.display="none"}/>
          <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.1)" }}/>
        </div>
        <span style={{ fontSize:11, color:C.inkSoft, minWidth:44, fontWeight:600, flexShrink:0 }}>{act.time}</span>
        <span style={{ fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:20, flexShrink:0, background:meta.color, color:meta.text, border:`1px solid ${meta.border}`, whiteSpace:"nowrap" }}>{meta.emoji} {meta.label}</span>
        <div style={{ flex:1, minWidth:0 }}>
          {act.place&&<div style={{ fontSize:13, fontWeight:600, color:C.ink, marginBottom:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{act.place}</div>}
          <div style={{ fontSize:11, color:C.inkSoft, lineHeight:1.5, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{act.text}</div>
          {act.travelFromPrev&&<div style={{ fontSize:10, color:C.teal, marginTop:1, fontWeight:500 }}>↳ {act.travelFromPrev}</div>}
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

// ─── ANIMATED JOURNEY MAP ────────────────────────────────────────────────────
const DAY_COLORS = ["#2563EB","#16A34A","#EA580C","#7C3AED","#DC2626","#0891B2","#D97706","#BE185D","#065F46","#1D4ED8"];

function AnimatedJourneyMap({ days, transport, startLabel }) {
  const [progress,    setProgress]   = useState(0);   // 0..1 along path
  const [playing,     setPlaying]    = useState(false);
  const [selectedStop,setSelected]   = useState(null); // stop detail overlay
  const [photoLoaded, setPhotoLoaded]= useState({});
  const animRef  = useRef(null);
  const startRef = useRef(0);
  const lastRef  = useRef(0);

  // Build stops from all days
  const stops = [];
  if (startLabel) stops.push({ label:startLabel, type:"start", dayIdx:-1, icon:"🏁", color:"#64748B", place:startLabel, activity:"Your journey begins here", travel:"", query:startLabel+" Sri Lanka" });
  days.forEach((d,di)=>{
    const color = DAY_COLORS[di % DAY_COLORS.length];
    const typeIcons = { breakfast:"☕",lunch:"🍛",dinner:"🍽️",sightseeing:"🏛️",hike:"🥾",safari:"🐘",beach:"🏖️",sunset:"🌅",checkin:"🏨",transport:"🚗",activity:"🎯",rural:"🌾",cafe:"☕",cultural:"🏛️" };
    d.activities?.filter(a=>a.type!=="transport").forEach((a,ai)=>{
      if (ai < 3) { // max 3 stops per day to keep map readable
        stops.push({
          label: a.place || d.location,
          sublabel: d.location,
          type:"stop", dayIdx:di, day:d.day,
          icon: typeIcons[a.type]||"📍",
          color,
          place: a.place||d.location,
          activity: a.text||"",
          why: a.why||"",
          travel: a.travelFromPrev||"",
          hours: a.hours||"",
          price: a.price||"",
          query: a.unsplashQuery || a.mapQuery?.split(",")[0] || (a.place+" Sri Lanka"),
        });
      }
    });
  });

  const N = stops.length;
  const STOP_GAP = 200; // px between stops
  const W = N * STOP_GAP + 100;
  const H = 300;
  const ROAD_Y = H / 2;
  const AMP = 55; // wave amplitude

  // Generate winding SVG path
  const getStopX = i => 60 + i * STOP_GAP;
  const getStopY = i => {
    if (i===0) return ROAD_Y;
    // Alternating wave — each stop goes up or down
    return ROAD_Y + (i%2===0 ? AMP : -AMP);
  };

  // Build smooth cubic bezier path through all stops
  const buildPath = () => {
    if (N===0) return "";
    let d = `M ${getStopX(0)} ${getStopY(0)}`;
    for (let i=1; i<N; i++) {
      const x0=getStopX(i-1), y0=getStopY(i-1);
      const x1=getStopX(i),   y1=getStopY(i);
      const cx = (x0+x1)/2;
      d += ` C ${cx} ${y0} ${cx} ${y1} ${x1} ${y1}`;
    }
    return d;
  };
  const pathD = buildPath();

  // Helper: midpoint y interpolation (must be defined before getPosAtProgress)
  const midY = (y0, y1) => (y0 + y1) / 2;

  // Get point on path at fraction t (approximate via stop interpolation)
  const getPosAtProgress = (t) => {
    if (N <= 1) return { x:getStopX(0), y:getStopY(0) };
    const total = N - 1;
    const fIdx  = t * total;
    const i     = Math.min(Math.floor(fIdx), total-1);
    const frac  = fIdx - i;
    const x0=getStopX(i),   y0=getStopY(i);
    const x1=getStopX(i+1), y1=getStopY(i+1);
    const cx=(x0+x1)/2;
    const my0 = midY(y0, y0); // = y0
    const my1 = midY(y0, y1);
    const my2 = midY(y1, y1); // = y1
    const bx = (1-frac)**3*x0 + 3*(1-frac)**2*frac*cx + 3*(1-frac)*frac**2*cx + frac**3*x1;
    const by = (1-frac)**3*y0 + 3*(1-frac)**2*frac*my0 + 3*(1-frac)*frac**2*my1 + frac**3*y1;
    return { x:bx, y:by };
  };

  // Smooth animation
  const DURATION = N * 1800; // ms total
  const animate = (ts) => {
    if (!startRef.current) startRef.current = ts;
    const elapsed = ts - startRef.current;
    const t = Math.min(elapsed / DURATION, 1);
    setProgress(t);
    if (t < 1) { animRef.current = requestAnimationFrame(animate); }
    else { setPlaying(false); startRef.current = 0; }
  };
  const play = () => {
    if (playing) { cancelAnimationFrame(animRef.current); setPlaying(false); startRef.current=0; return; }
    setProgress(0); setPlaying(true);
    startRef.current = 0;
    animRef.current = requestAnimationFrame(animate);
  };
  const reset = () => { cancelAnimationFrame(animRef.current); setPlaying(false); setProgress(0); startRef.current=0; };
  useEffect(()=>()=>cancelAnimationFrame(animRef.current), []);

  const vehicle = transport==="train"?"🚂":transport==="bus"?"🚌":transport==="tuk-tuk"?"🛺":"🚗";
  const vPos = getPosAtProgress(progress);

  // Which stop is active
  const activeStopIdx = Math.round(progress * (N-1));

  return (
    <div style={{ background:C.white, border:`1.5px solid ${C.border}`, borderRadius:20, overflow:"hidden", marginTop:16 }}>
      <style>{`
        @keyframes pinDrop { 0%{transform:translateY(-12px);opacity:0} 60%{transform:translateY(3px)} 100%{transform:translateY(0);opacity:1} }
        @keyframes vehicleRide { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
        @keyframes roadDash { to{stroke-dashoffset:-20} }
      `}</style>

      {/* Stop detail overlay */}
      {selectedStop && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.7)", zIndex:900, display:"flex", alignItems:"center", justifyContent:"center", padding:16, backdropFilter:"blur(6px)" }}
          onClick={e=>e.target===e.currentTarget&&setSelected(null)}>
          <div style={{ background:"#fff", borderRadius:24, width:"100%", maxWidth:480, overflow:"hidden", boxShadow:"0 24px 80px rgba(0,0,0,.3)", animation:"pinDrop .3s ease" }}>
            {/* Photo header */}
            <div style={{ height:220, position:"relative", background:`linear-gradient(135deg,${selectedStop.color},${selectedStop.color}cc)`, overflow:"hidden" }}>
              <img
                src={`https://source.unsplash.com/800x500/?${encodeURIComponent(selectedStop.query)}`}
                alt={selectedStop.place}
                style={{ width:"100%", height:"100%", objectFit:"cover", opacity:.85 }}
                onLoad={()=>setPhotoLoaded(p=>({...p,[selectedStop.place]:true}))}
              />
              <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,.7) 0%, transparent 50%)" }}/>
              {/* Back button */}
              <button onClick={()=>setSelected(null)} style={{ position:"absolute", top:14, left:14, width:36, height:36, borderRadius:"50%", border:"none", background:"rgba(0,0,0,.4)", color:"#fff", fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>←</button>
              {/* Day badge */}
              {selectedStop.day && (
                <div style={{ position:"absolute", top:14, right:14, background:selectedStop.color, color:"#fff", fontSize:11, fontWeight:700, padding:"4px 12px", borderRadius:20 }}>Day {selectedStop.day}</div>
              )}
              {/* Icon overlay */}
              <div style={{ position:"absolute", bottom:16, left:16, display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:44, height:44, borderRadius:12, background:selectedStop.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, boxShadow:"0 2px 8px rgba(0,0,0,.3)" }}>{selectedStop.icon}</div>
                <div>
                  <div style={{ fontFamily:serif, fontSize:18, fontWeight:700, color:"#fff" }}>{selectedStop.place}</div>
                  {selectedStop.sublabel && selectedStop.sublabel!==selectedStop.place && (
                    <div style={{ fontSize:12, color:"rgba(255,255,255,.75)" }}>📍 {selectedStop.sublabel}</div>
                  )}
                </div>
              </div>
            </div>
            {/* Details */}
            <div style={{ padding:"1.2rem 1.4rem" }}>
              {selectedStop.activity && <p style={{ fontSize:14, color:C.ink, lineHeight:1.65, marginBottom:12 }}>{selectedStop.activity}</p>}
              {selectedStop.why && <div style={{ background:C.tealPale, borderLeft:`3px solid ${C.teal}`, borderRadius:"0 8px 8px 0", padding:"8px 12px", fontSize:12, color:C.ink, marginBottom:12, lineHeight:1.5 }}>💡 {selectedStop.why}</div>}
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:12 }}>
                {selectedStop.hours && <span style={{ fontSize:11, fontWeight:600, padding:"4px 10px", borderRadius:20, background:C.tealLight, color:C.teal }}>🕐 {selectedStop.hours}</span>}
                {selectedStop.price && <span style={{ fontSize:11, fontWeight:600, padding:"4px 10px", borderRadius:20, background:C.amberLight, color:C.amber }}>💰 {selectedStop.price}</span>}
                {selectedStop.travel && <span style={{ fontSize:11, fontWeight:600, padding:"4px 10px", borderRadius:20, background:"#F0F0F0", color:C.inkSoft }}>🚗 {selectedStop.travel}</span>}
              </div>
              {selectedStop.query && (
                <a href={`https://maps.google.com/?q=${encodeURIComponent(selectedStop.place+", Sri Lanka")}`} target="_blank" rel="noopener noreferrer"
                  style={{ display:"block", textAlign:"center", padding:"10px", border:`1px solid ${C.border}`, borderRadius:10, fontSize:13, color:C.teal, textDecoration:"none", fontWeight:600 }}>
                  📍 Open in Google Maps
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Map header */}
      <div style={{ padding:"16px 20px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
        <div>
          <div style={{ fontFamily:serif, fontSize:16, fontWeight:700, color:C.ink }}>🗺️ Journey Route</div>
          <div style={{ fontSize:12, color:C.inkSoft, marginTop:2 }}>{N} stops · {days.length} days · {vehicle} {transport||"private car"} · Tap any pin to explore</div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={play} style={{ padding:"8px 16px", background:playing?C.coral:C.teal, color:"#fff", border:"none", borderRadius:10, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:sans }}>
            {playing?"⏸ Pause":"▶ Play"}
          </button>
          <button onClick={reset} style={{ padding:"8px 14px", background:"none", color:C.inkSoft, border:`1.5px solid ${C.border}`, borderRadius:10, fontSize:12, cursor:"pointer", fontFamily:sans }}>↺</button>
        </div>
      </div>

      {/* Winding road SVG */}
      <div style={{ overflowX:"auto", background:"#F8F9FA", padding:"10px 0" }}>
        <div style={{ width:W, height:H, position:"relative", flexShrink:0 }}>
          <svg width={W} height={H} style={{ position:"absolute", top:0, left:0 }}>
            {/* Road shadow */}
            <path d={pathD} fill="none" stroke="rgba(0,0,0,.12)" strokeWidth={22} strokeLinecap="round" strokeLinejoin="round"/>
            {/* Road surface */}
            <path d={pathD} fill="none" stroke="#2D3436" strokeWidth={18} strokeLinecap="round" strokeLinejoin="round"/>
            {/* Road edge lines */}
            <path d={pathD} fill="none" stroke="#fff" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" opacity={0.3}/>
            {/* Dashed centre line */}
            <path d={pathD} fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeDasharray="12 10"
              style={{ animation:"roadDash 0.8s linear infinite" }}/>
            {/* Coloured progress overlay */}
            {progress > 0 && days.map((d,di)=>{
              const color = DAY_COLORS[di % DAY_COLORS.length];
              // Stops belonging to this day
              const dayStops = stops.filter(s=>s.dayIdx===di);
              if (!dayStops.length) return null;
              const firstIdx = stops.indexOf(dayStops[0]);
              const lastIdx  = stops.indexOf(dayStops[dayStops.length-1]);
              const tStart   = firstIdx/(N-1||1);
              const tEnd     = Math.min(lastIdx/(N-1||1), progress);
              if (tEnd <= tStart) return null;
              // Draw coloured segment — simplified as overlay
              const x0 = getStopX(firstIdx), y0 = getStopY(firstIdx);
              const x1 = getStopX(Math.round(tEnd*(N-1))), y1 = getStopY(Math.round(tEnd*(N-1)));
              return (
                <line key={di} x1={x0} y1={y0} x2={x1} y2={y1} stroke={color} strokeWidth={4} strokeLinecap="round" opacity={0.7}/>
              );
            })}
          </svg>

          {/* Stop pins */}
          {stops.map((stop,i)=>{
            const sx = getStopX(i);
            const sy = getStopY(i);
            const pinUp = i%2===0; // alternate pins above/below
            const isActive = i===activeStopIdx && progress>0;
            const isPassed = i < activeStopIdx;

            return (
              <div key={i} onClick={()=>setSelected(stop)} style={{
                position:"absolute",
                left: sx-22, top: pinUp ? sy-90 : sy+14,
                cursor:"pointer",
                animation: `pinDrop .4s ease ${i*0.08}s both`,
                zIndex: isActive?20:10,
                transition:"transform .2s",
                transform: isActive?"scale(1.15)":"scale(1)",
              }}>
                {/* Pin shape */}
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                  <div style={{
                    width:44, height:44, borderRadius:"50% 50% 50% 0",
                    transform:"rotate(-45deg)",
                    background: isPassed||isActive ? stop.color : "#fff",
                    border:`3px solid ${stop.color}`,
                    boxShadow: isActive?`0 4px 20px ${stop.color}60`:"0 2px 8px rgba(0,0,0,.2)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                  }}>
                    <span style={{ transform:"rotate(45deg)", fontSize:18 }}>{stop.icon}</span>
                  </div>
                  {pinUp && <div style={{ width:2, height:20, background:stop.color, opacity:.6 }}/>}
                </div>
                {!pinUp && <div style={{ width:2, height:20, background:stop.color, opacity:.6, marginBottom:0, order:-1 }}/>}

                {/* Label */}
                <div style={{
                  marginTop: pinUp?4:0, marginBottom: pinUp?0:4,
                  background:"#fff", borderRadius:8, padding:"3px 8px",
                  fontSize:10, fontWeight:700, color:stop.color,
                  border:`1.5px solid ${stop.color}22`,
                  boxShadow:"0 1px 4px rgba(0,0,0,.1)",
                  maxWidth:90, textAlign:"center", lineHeight:1.3,
                  whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
                  order: pinUp?1:-1,
                }}>
                  {stop.label.length>12 ? stop.label.slice(0,10)+"…" : stop.label}
                </div>

                {/* Travel time tag */}
                {stop.travel && i>0 && (
                  <div style={{ position:"absolute", left:"50%", transform:"translateX(-50%)", top: pinUp ? "auto" : -18, bottom: pinUp ? -18 : "auto", background:C.white, border:`1px solid ${C.border}`, borderRadius:10, padding:"1px 6px", fontSize:9, color:C.inkSoft, whiteSpace:"nowrap", fontWeight:600 }}>
                    {stop.travel.split(" ").slice(0,3).join(" ")}
                  </div>
                )}
              </div>
            );
          })}

          {/* Vehicle */}
          <div style={{
            position:"absolute",
            left: vPos.x - 14,
            top:  vPos.y - 14,
            fontSize:26,
            animation:"vehicleRide .8s ease-in-out infinite",
            filter:"drop-shadow(0 3px 6px rgba(0,0,0,.4))",
            zIndex:30,
            transition:"left .05s linear, top .05s linear",
            pointerEvents:"none",
          }}>
            {vehicle}
          </div>
        </div>
      </div>

      {/* Day colour legend */}
      <div style={{ padding:"10px 20px 14px", display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
        <span style={{ fontSize:11, color:C.inkSoft, fontWeight:600, marginRight:4 }}>Days:</span>
        {days.map((d,i)=>(
          <div key={i} style={{ display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ width:12, height:12, borderRadius:"50%", background:DAY_COLORS[i%DAY_COLORS.length], flexShrink:0 }}/>
            <span style={{ fontSize:11, color:C.inkSoft }}>Day {d.day} · {d.location}</span>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div style={{ padding:"0 20px 14px", display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ flex:1, height:4, background:C.border, borderRadius:4, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${progress*100}%`, background:`linear-gradient(90deg,${DAY_COLORS[0]},${DAY_COLORS[1]||DAY_COLORS[0]})`, borderRadius:4, transition:"width .1s" }}/>
        </div>
        <span style={{ fontSize:11, color:C.inkSoft, fontWeight:600, flexShrink:0 }}>{Math.round(progress*100)}%</span>
      </div>
    </div>
  );
}


// ─── LOCAL CHEAT SHEET ───────────────────────────────────────────────────────
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
function DraggableItinerary({ days, onUpdate, itinId, premium }) {
  const [dragging, setDragging]     = useState(null);
  const [dragOver,  setDragOver]    = useState(null);
  const [swap,      setSwap]        = useState(null);

  const handleDragStart = (dayIdx, actIdx) => {
    if (premium && !premium.isUnlocked(itinId) && dayIdx > 0) return; // block drag on locked days
    setDragging({dayIdx, actIdx});
  };
  const handleDragOver  = (e, dayIdx, actIdx) => { e.preventDefault(); setDragOver({dayIdx, actIdx}); };
  const handleDrop      = (e, toDayIdx, toActIdx) => {
    e.preventDefault();
    if (!dragging) return;
    if (premium && !premium.isUnlocked(itinId) && (dragging.dayIdx>0||toDayIdx>0)) return;
    const { dayIdx:fromDay, actIdx:fromAct } = dragging;
    if (fromDay===toDayIdx && fromAct===toActIdx) { setDragging(null); setDragOver(null); return; }
    const newDays = days.map(d=>({...d, activities:[...d.activities]}));
    const [moved] = newDays[fromDay].activities.splice(fromAct, 1);
    newDays[toDayIdx].activities.splice(toActIdx, 0, moved);
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
      <div style={{ background:C.tealPale, border:`1px solid #9FE1CB`, borderRadius:12, padding:"10px 14px", marginBottom:16, display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
        <span style={{ fontSize:16 }}>↕️</span>
        <span style={{ fontSize:12, color:C.teal, fontWeight:500 }}>Drag any activity to reorder. Click 🔄 to swap a place.</span>
        {premium && !premium.isUnlocked(itinId) && <span style={{ fontSize:11, color:C.amber, marginLeft:"auto" }}>🔒 Unlock premium to reorder Days 2+</span>}
      </div>
      {days.map((d, dayIdx)=>{
        const isLocked = premium && !premium.isUnlocked(itinId) && dayIdx > 0;
        return (
          <div key={d.day} style={{ position:"relative", marginBottom:16 }}>
            <div style={{ border:`1.5px solid ${isLocked?"#E4E4E4":C.border}`, borderRadius:16, overflow:"hidden", background:C.white, boxShadow:"0 2px 12px rgba(0,0,0,.04)", opacity:isLocked?.5:1 }}>
              <div style={{ padding:"14px 20px", background:`linear-gradient(135deg,${isLocked?"#999":"#0B6B52"},${isLocked?"#bbb":"#147856"})`, display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                <span style={{ background:"rgba(255,255,255,.2)", color:"#fff", fontSize:11, fontWeight:700, padding:"4px 12px", borderRadius:20 }}>Day {d.day}</span>
                <span style={{ fontSize:15, fontWeight:700, color:"#fff", fontFamily:serif }}>{d.location}</span>
                <span style={{ fontSize:12, color:"rgba(255,255,255,.75)", marginLeft:"auto" }}>— {d.theme}</span>
                {isLocked && <span style={{ fontSize:14 }}>🔒</span>}
              </div>
              <div style={{ padding:"6px 12px 10px", filter:isLocked?"blur(3px)":"none", pointerEvents:isLocked?"none":"auto" }}
                onDragOver={e=>{ if(d.activities.length===0) handleDragOver(e, dayIdx, 0); }}
                onDrop={e=>{ if(d.activities.length===0) handleDrop(e, dayIdx, 0); }}>
                {d.activities.map((a,actIdx)=>{
                  const isDraggingThis = dragging?.dayIdx===dayIdx && dragging?.actIdx===actIdx;
                  const isOver = dragOver?.dayIdx===dayIdx && dragOver?.actIdx===actIdx;
                  return (
                    <div key={actIdx}
                      draggable={!isLocked}
                      onDragStart={()=>handleDragStart(dayIdx, actIdx)}
                      onDragOver={e=>handleDragOver(e, dayIdx, actIdx)}
                      onDrop={e=>handleDrop(e, dayIdx, actIdx)}
                      onDragEnd={()=>{ setDragging(null); setDragOver(null); }}
                      style={{ opacity:isDraggingThis?.4:1, background:isOver?C.tealPale:"transparent", border:isOver?`2px dashed ${C.tealMid}`:"2px solid transparent", borderRadius:10, marginBottom:2 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 6px", borderBottom:actIdx<d.activities.length-1?`1px solid ${C.border}`:"none" }}>
                        {!isLocked && <span style={{ cursor:"grab", fontSize:14, color:C.inkSoft, flexShrink:0, userSelect:"none" }}>⠿</span>}
                        <div style={{ flex:1, minWidth:0 }}>
                          <ActivityRow act={a} isLast={actIdx===d.activities.length-1} hideBorder/>
                        </div>
                        {!isLocked && <button onClick={()=>setSwap({dayIdx, actIdx, act:a})} title="Swap this place" style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:8, padding:"4px 8px", cursor:"pointer", fontSize:12, color:C.inkSoft, flexShrink:0 }}>🔄</button>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {isLocked && <PremiumLock itinId={itinId} onUnlock={premium.unlock}/>}
          </div>
        );
      })}
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
function JourneyPage({ setPage, savedItin, setSavedItin, onGuideOpen, user, onLoginNeeded, premium }) {
  const [step, setStep]    = useState(()=>{
    // Restore step if user just logged in mid-wizard
    const saved = sessionStorage.getItem("ct_wizard_step");
    if (saved) { sessionStorage.removeItem("ct_wizard_step"); return parseInt(saved)||0; }
    return 0;
  });
  const [ans, setAns]      = useState(()=>{
    // Restore wizard answers if user just logged in mid-wizard
    const saved = sessionStorage.getItem("ct_wizard_ans");
    if (saved) { sessionStorage.removeItem("ct_wizard_ans"); try { return JSON.parse(saved); } catch {} }
    return { days:5, nights:4, travel:"", food:[], budget:"", group:"", activities:[], transport:"", pace:"balanced", customPlaces:[], startCity:"airport", startTime:"09:00" };
  });
  const [loading, setLoad] = useState(false);
  const [itin, setItin]    = useState(savedItin||null);
  const [itinDays, setItinDays] = useState(savedItin?.days||null);
  const [placeInput, setPlaceInput] = useState("");
  const [startLabel, setStartLabel] = useState("Sri Lanka");

  // Auto-generate ref — used after generate() is defined below
  const didAutoGenerate = useRef(false);

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

    const STYLE_CITIES = {
      beach:    { allowed:["Negombo","Galle","Unawatuna","Mirissa","Hikkaduwa","Tangalle","Weligama","Arugam Bay","Nilaveli","Trincomalee","Bentota","Beruwala","Kalpitiya"], forbidden:["Kandy","Ella","Nuwara Eliya","Sigiriya","Dambulla","Anuradhapura","Polonnaruwa","Yala","Wilpattu"] },
      hills:    { allowed:["Kandy","Nuwara Eliya","Ella","Haputale","Bandarawela","Hatton","Knuckles","Horton Plains"], forbidden:["Mirissa","Hikkaduwa","Galle","Sigiriya","Anuradhapura","Polonnaruwa","Yala"] },
      cultural: { allowed:["Dambulla","Sigiriya","Anuradhapura","Polonnaruwa","Kandy","Galle Fort"], forbidden:["Mirissa","Hikkaduwa","Ella","Nuwara Eliya","Yala"] },
      wildlife: { allowed:["Yala","Tissamaharama","Udawalawe","Sinharaja","Wilpattu","Minneriya","Habarana","Bundala"], forbidden:["Mirissa","Hikkaduwa","Ella","Nuwara Eliya","Sigiriya"] },
      adventure:{ allowed:["Kitulgala","Ella","Adam's Peak","Knuckles Range","Kalpitiya","Kandy"], forbidden:[] },
      rural:    { allowed:["Knuckles Villages","Mahiyanganaya","Belihuloya","Ratnapura","Weligama","Dambulla","Matale"], forbidden:[] },
      mixed:    { allowed:["Colombo","Kandy","Dambulla","Sigiriya","Ella","Galle","Mirissa"], forbidden:[] },
    };
    const styleKey = ans.travel || "mixed";
    const cities   = STYLE_CITIES[styleKey] || STYLE_CITIES.mixed;

    const N   = Math.min(ans.days, 10);
    const uid = Date.now().toString(36) + Math.random().toString(36).slice(2,6);

    // ── Starting point ─────────────────────────────────────────────────────────
    const customStart = ans.startCity==="custom" && ans.customStart
      ? ans.customStart.trim()
      : ans.startCity==="colombo" ? "Colombo"
      : ans.startCity==="airport" ? "Bandaranaike International Airport, Katunayake"
      : ans.customStart?.trim() || "Colombo";

    setStartLabel(customStart);

    const allowedCities = [...cities.allowed];
    if (ans.startCity==="custom" && ans.customStart) {
      allowedCities.unshift(ans.customStart.trim() + " (starting point)");
    }

    // ── Start time logic ────────────────────────────────────────────────────────
    const startHour = parseInt((ans.startTime||"09:00").split(":")[0]);
    const isEveningStart = startHour >= 18;
    const isAfternoonStart = startHour >= 14 && startHour < 18;
    const isMorningStart = startHour < 12;

    const startTimeNote = isEveningStart
      ? `TRIP STARTS AT ${ans.startTime} (EVENING): Day 1 MUST contain ONLY: drive from ${customStart} to hotel + hotel check-in + dinner. NO sightseeing, NO beaches, NO activities on Day 1. Full activities start from Day 2.`
      : isAfternoonStart
      ? `TRIP STARTS AT ${ans.startTime} (AFTERNOON): Day 1 should have drive to hotel + check-in + 1-2 light afternoon activities + dinner. Avoid heavy sightseeing on Day 1.`
      : `TRIP STARTS AT ${ans.startTime} (MORNING): Day 1 is a full day. Start with drive from ${customStart} to first destination, then full activities.`;

    // ── Budget → Hotel tier ─────────────────────────────────────────────────────
    const hotelTier = ans.budget==="luxury"
      ? "5-star luxury resort (e.g. Jetwing, Aman, Cape Weligama, Shangri-La, Anantara)"
      : ans.budget==="mid"
      ? "3-4 star boutique hotel or well-rated guesthouse"
      : "budget guesthouse, hostel or simple local inn";

    // ── Bus note ────────────────────────────────────────────────────────────────
    const busNote = ans.transport==="bus"
      ? `BUS RULES: For every inter-city leg include specific bus number/route (e.g. "CTB 15 Colombo–Kandy"), departure bus stand, journey time, price in LKR.`
      : "";

    const actsPerDay = ans.pace==="relaxed" ? 3 : ans.pace==="packed" ? 5 : 4;
    const customNote = ans.customPlaces.length
      ? `MUST-VISIT: ${ans.customPlaces.join(", ")}`
      : "";

    const prompt = `[${uid}] You are a world-class Sri Lanka travel planner creating a COMPLETE A-to-Z trip plan.

TRIP:
- ${N} days, ${ans.nights} nights | ${ans.group||"solo"} | Budget: ${ans.budget||"mid-range"} (${hotelTier})
- Style: ${styleKey} | Food: ${ans.food.join(", ")||"open"} | Activities: ${ans.activities.join(", ")||"sightseeing"}
- Transport: ${ans.transport||"private-car"} | Pace: ${ans.pace||"balanced"} (${actsPerDay} activities/day)
- Starting from: ${customStart} at ${ans.startTime||"09:00"}
${customNote ? `- ${customNote}` : ""}

${startTimeNote}

HOTEL RULES (CRITICAL):
- Select ONE specific real hotel per destination matching "${hotelTier}"
- Day 1: First activity = drive from ${customStart} to hotel with REAL drive time (e.g. "45 min drive from Colombo on A3 highway")
- Day 1: Second activity = hotel check-in with hotel name, area, why chosen
- Every morning from Day 2 onwards: first activity = breakfast AT THE HOTEL where they slept
- Every evening: last activity = dinner near hotel + return to hotel
- Last day: include hotel check-out + drive back to ${customStart} if needed
- Hotel stays in same location unless explicitly moving cities

LOCATION RULES:
- ALLOWED: ${allowedCities.join(", ")}
- FORBIDDEN: ${cities.forbidden.length ? cities.forbidden.join(", ") : "none"}
- All activities must be within 30 min of the hotel unless it's an explicitly planned excursion

${busNote}

MANDATORY FIELDS — every activity must have ALL of these:
- time: realistic clock time (e.g. "08:30")
- type: breakfast|lunch|dinner|cafe|sightseeing|hike|safari|beach|transport|checkin|sunset|activity|rural|hotel
- place: REAL specific named place (hotel name, restaurant name, beach name — NEVER generic)
- area: street and city
- text: what to do/order/see in one vivid sentence
- why: why this specific place is recommended
- hours: opening hours
- price: price range in USD or LKR
- mapQuery: "Place Name, City, Sri Lanka"
- travelFromPrev: travel time from previous activity (e.g. "5 min walk", "20 min drive", "45 min drive on A3 from Colombo")
- unsplashQuery: 4-6 word Unsplash search for a beautiful photo (e.g. "Negombo beach sunset Sri Lanka")

Return ONLY valid raw JSON — no markdown, no backticks:
{"title":"...","tagline":"...","hotel":{"name":"Full Hotel Name","area":"City","stars":5,"why":"One sentence why this hotel"},"highlights":["...","...","..."],"days":[{"day":1,"location":"City, Sri Lanka","theme":"Day theme","hotel":"Hotel Name (for reference)","activities":[{...all fields above...}]}]}`;

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
      const isConnectionError = err.message.includes("fetch") || err.message.includes("Failed") || err.message.includes("ECONNREFUSED") || err.message.includes("NetworkError");
      if (isConnectionError) {
        setLoad(false); setStep(0);
        alert("⚠️ Cannot reach the proxy server.\n\nMake sure you started it:\n  cd proxy\n  npm start");
        return;
      }
      // Fallback itinerary
      const destLabel = {beach:"Negombo / Southern Coast",hills:"Kandy & Ella",cultural:"Sigiriya & Anuradhapura",wildlife:"Yala",mixed:"Sri Lanka"}[styleKey]||"Sri Lanka";
      const hotelName = ans.budget==="luxury" ? "Jetwing Beach" : ans.budget==="mid" ? "Goldi Sands Hotel" : "Kings Gate Hotel";
      const fallDays = [{
        day:1, location:"Negombo, Sri Lanka", theme:"Arrival & settle in",
        hotel: hotelName,
        activities:[
          {time:ans.startTime||"09:00",type:"transport",place:`${customStart} → Negombo`,area:customStart,text:`Drive from ${customStart} to Negombo along the coastal road.`,why:"Negombo is the closest beach to Colombo — just 45 min away.",hours:"",price:"$15–30 taxi",mapQuery:`Negombo, Sri Lanka`,travelFromPrev:"",unsplashQuery:"Negombo beach Sri Lanka"},
          {time:"11:00",type:"checkin",place:hotelName,area:"Lewis Place, Negombo",text:`Check in to ${hotelName} on Negombo beach. Drop your bags and freshen up.`,why:"Beachfront location with excellent seafood restaurant on-site.",hours:"Check-in from 2pm, early check-in on request",price:ans.budget==="luxury"?"$150–300/night":ans.budget==="mid"?"$50–100/night":"$20–40/night",mapQuery:`${hotelName}, Negombo, Sri Lanka`,travelFromPrev:"45 min drive",unsplashQuery:"Negombo hotel beach resort"},
          {time:"13:00",type:"lunch",place:"Lords Restaurant",area:"Lewis Place, Negombo",text:"Fresh grilled lobster and prawn curry on the beachfront terrace.",why:"Best seafood restaurant in Negombo — catch of the day is always exceptional.",hours:"11am–10pm",price:"$15–30",mapQuery:"Lords Restaurant, Negombo, Sri Lanka",travelFromPrev:"5 min walk",unsplashQuery:"Negombo seafood restaurant"},
          ...(isEveningStart?[]:[{time:"16:00",type:"beach",place:"Negombo Beach",area:"Lewis Place, Negombo",text:"Relax on the golden sand, watch the fishing catamarans return at sunset.",why:"Calm waters, warm sand — perfect introduction to Sri Lanka's coast.",hours:"Always open",price:"Free",mapQuery:"Negombo Beach, Sri Lanka",travelFromPrev:"2 min walk",unsplashQuery:"Negombo beach sunset golden"}]),
          {time:isEveningStart?"20:00":"19:00",type:"dinner",place:"Bijou Restaurant",area:"Poruthota Road, Negombo",text:"Candlelit dinner with fresh lobster thermidor and coconut prawn curry.",why:"Consistently rated the finest dining in Negombo — book ahead for beachside table.",hours:"6pm–11pm",price:"$20–45",mapQuery:"Bijou Restaurant, Negombo, Sri Lanka",travelFromPrev:"10 min walk",unsplashQuery:"Negombo fine dining seafood"},
        ]
      }];
      while(fallDays.length<N){
        const n=fallDays.length+1;
        fallDays.push({day:n,location:"Negombo, Sri Lanka",theme:`Day ${n} — beach & relaxation`,hotel:hotelName,
          activities:[
            {time:"08:00",type:"breakfast",place:hotelName+" Restaurant",area:"Lewis Place, Negombo",text:"Full Sri Lankan breakfast with hoppers, string hoppers and fresh tropical fruit at the hotel.",why:"Start the day well — the hotel breakfast is included and excellent.",hours:"7am–10am",price:"Included",mapQuery:`${hotelName}, Negombo, Sri Lanka`,travelFromPrev:"",unsplashQuery:"Sri Lanka hotel breakfast hoppers"},
            {time:"10:00",type:"beach",place:"Negombo Beach",area:"Lewis Place, Negombo",text:"Morning swim and sunbathe on Negombo's quiet northern beach.",why:"Less crowded than the main stretch — calm waters perfect for swimming.",hours:"Always open",price:"Free",mapQuery:"Negombo Beach, Sri Lanka",travelFromPrev:"2 min walk",unsplashQuery:"Negombo beach morning swim"},
            {time:"13:00",type:"lunch",place:"The Icebear Restaurant",area:"Poruthota Road, Negombo",text:"Rice and curry with fresh fish, devilled squid and coconut sambol.",why:"Local favourite — the devilled seafood is extraordinary.",hours:"11am–9pm",price:"$8–15",mapQuery:"Icebear Restaurant, Negombo, Sri Lanka",travelFromPrev:"10 min walk",unsplashQuery:"Sri Lanka rice curry seafood"},
            {time:"19:00",type:"dinner",place:hotelName+" Beachside Bar",area:"Lewis Place, Negombo",text:"Sunset cocktails and grilled seafood platter on the beach.",why:"Watch the sun set over the Indian Ocean with your feet in the sand.",hours:"5pm–11pm",price:"$20–35",mapQuery:`${hotelName}, Negombo, Sri Lanka`,travelFromPrev:"2 min walk",unsplashQuery:"Negombo beach sunset cocktails"},
          ]
        });
      }
      setItin({ title:`${N}-Day Beach Escape`, tagline:`Relax and recharge on Sri Lanka's golden coast`, hotel:{name:hotelName,area:"Negombo",stars:ans.budget==="luxury"?5:3,why:"Beachfront location with excellent seafood"}, highlights:["Beachfront hotel","Fresh seafood daily","Sunset views"], days:fallDays.slice(0,N) });
      setSavedItin({ title:`${N}-Day Beach Escape`, tagline:`Relax and recharge on Sri Lanka's golden coast`, hotel:{name:hotelName,area:"Negombo",stars:ans.budget==="luxury"?5:3,why:"Beachfront location with excellent seafood"}, highlights:["Beachfront hotel","Fresh seafood daily","Sunset views"], days:fallDays.slice(0,N) });
      setItinDays(fallDays.slice(0,N));
    }
    setLoad(false);
  };

  // Auto-generate if user just logged in at last step
  useEffect(()=>{
    if (user && step===9 && !itin && !loading && !didAutoGenerate.current) {
      didAutoGenerate.current = true;
      generate();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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
            <p style={{ fontSize:13, color:"rgba(255,255,255,.65)", marginBottom:16 }}>📅 {ans.days} days · {ans.nights} nights · {ans.group||"solo"} · {ans.budget||"mid-range"} budget · Starting: {startLabel}</p>
            {itin.highlights&&<div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:16 }}>{itin.highlights.map((h,i)=><span key={i} style={{ fontSize:12, fontWeight:500, padding:"4px 12px", borderRadius:20, background:"rgba(255,255,255,.15)", color:"rgba(255,255,255,.9)", border:"1px solid rgba(255,255,255,.25)" }}>✓ {h}</span>)}</div>}
            {/* Hotel recommendation */}
            {itin.hotel && (
              <div style={{ display:"inline-flex", alignItems:"center", gap:10, background:"rgba(255,255,255,.12)", border:"1px solid rgba(255,255,255,.25)", borderRadius:12, padding:"10px 16px", marginBottom:14 }}>
                <span style={{ fontSize:22 }}>🏨</span>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:"#fff" }}>{itin.hotel.name}</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,.75)" }}>
                    {"★".repeat(itin.hotel.stars||3)} · {itin.hotel.area} · {itin.hotel.why}
                  </div>
                </div>
              </div>
            )}
            <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
              <button onClick={downloadPDF} style={{ padding:"10px 20px", background:"rgba(255,255,255,.15)", color:"#fff", border:"1px solid rgba(255,255,255,.35)", borderRadius:12, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:sans }}>📄 Download PDF</button>
              {/* Google Maps multi-waypoint route */}
              <button onClick={()=>{
                // Build Google Maps directions URL with all unique day locations as waypoints
                const stops = [];
                (itinDays||itin.days).forEach(d=>{
                  // Add each unique place that has a mapQuery
                  d.activities.filter(a=>a.mapQuery&&a.type!=="transport").forEach(a=>{
                    if (!stops.includes(a.mapQuery)) stops.push(a.mapQuery);
                  });
                });
                if (stops.length < 2) { alert("Not enough stops to build a route."); return; }
                const origin   = encodeURIComponent(stops[0]);
                const dest     = encodeURIComponent(stops[stops.length-1]);
                const waypoints= stops.slice(1,-1).map(s=>encodeURIComponent(s)).join("|");
                const mode = ans.transport==="train"?"transit":ans.transport==="bus"?"transit":"driving";
                const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}${waypoints?`&waypoints=${waypoints}`:""}&travelmode=${mode}`;
                window.open(url,"_blank");
              }} style={{ padding:"10px 20px", background:"#4285F4", color:"#fff", border:"none", borderRadius:12, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:sans, display:"flex", alignItems:"center", gap:6 }}>
                🗺️ Open full route in Google Maps
              </button>
              <p style={{ fontSize:12, color:"rgba(255,255,255,.5)", margin:0 }}>💡 Tap any activity row to see photo, hours & map</p>
            </div>
          </div>
        </div>
        <div style={{ maxWidth:820, margin:"0 auto", padding:"2.5rem 2rem" }}>
          {/* Start → End journey banner */}
          <div style={{ display:"flex", alignItems:"center", gap:12, background:"#fff", border:`1.5px solid ${C.border}`, borderRadius:14, padding:"14px 18px", marginBottom:20 }}>
            <div style={{ textAlign:"center", flex:1 }}>
              <div style={{ fontSize:10, fontWeight:700, color:C.inkSoft, textTransform:"uppercase", letterSpacing:.8, marginBottom:3 }}>Starting point</div>
              <div style={{ fontSize:14, fontWeight:700, color:C.teal }}>📍 {startLabel}</div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2, flexShrink:0 }}>
              <div style={{ width:60, height:2, background:`linear-gradient(90deg,${C.teal},${C.amber})`, borderRadius:2 }}/>
              <div style={{ fontSize:11, color:C.inkSoft, fontWeight:600 }}>{ans.days}d · {ans.nights}n</div>
              <div style={{ width:60, height:2, background:`linear-gradient(90deg,${C.teal},${C.amber})`, borderRadius:2 }}/>
            </div>
            <div style={{ textAlign:"center", flex:1 }}>
              <div style={{ fontSize:10, fontWeight:700, color:C.inkSoft, textTransform:"uppercase", letterSpacing:.8, marginBottom:3 }}>Ending point</div>
              <div style={{ fontSize:14, fontWeight:700, color:C.amber }}>🏁 {(itinDays||itin.days).slice(-1)[0]?.location || startLabel}</div>
            </div>
          </div>

          {/* Show ALL days with drag/drop and swap — locked ones get premium overlay */}
          <DraggableItinerary
            days={itinDays||itin.days}
            onUpdate={newDays=>{ setItinDays(newDays); setSavedItin({...itin, days:newDays}); }}
            itinId={itin.title+itin.tagline}
            premium={premium}
          />

          <AnimatedJourneyMap days={itinDays||itin.days} transport={ans.transport} startLabel={startLabel}/>
          <LocalCheatSheet location={itin.days?.[0]?.location||"Sri Lanka"}/>
          <div style={{ marginTop:"2rem", background:"linear-gradient(135deg,#FDF5E0,#FFF7E6)", border:"1.5px solid #F0D48A", borderRadius:20, padding:"2rem" }}>
            <h3 style={{ fontFamily:serif, fontSize:20, fontWeight:700, color:C.ink, marginBottom:8 }}>📩 Want a local guide for this trip?</h3>
            <p style={{ fontSize:14, color:C.inkSoft, lineHeight:1.7, marginBottom:20 }}>Share this itinerary with one of our SLTDA-certified guides and receive a personalised price quote within 24 hours.</p>
            <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
              <Btn variant="amber" onClick={onGuideOpen}>Find a guide & request bid →</Btn>
              <Btn variant="outline" onClick={downloadPDF}>📄 Download PDF</Btn>
              <Btn variant="outline" onClick={()=>{ setStep(0); setItin(null); setItinDays(null); setStartLabel("Sri Lanka"); setAns({ days:5, nights:4, travel:"", food:[], budget:"", group:"", activities:[], transport:"", pace:"balanced", customPlaces:[], startCity:"airport", startTime:"09:00" }); }}>↺ New itinerary</Btn>
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
      <div className="place-input-row" style={{ display:"flex", gap:8, marginBottom:16 }}>
        <input
          value={placeInput}
          onChange={e=>setPlaceInput(e.target.value)}
          onKeyDown={e=>{ if(e.key==="Enter"&&placeInput.trim()){ setAns(a=>({...a,customPlaces:[...a.customPlaces,placeInput.trim()]})); setPlaceInput(""); } }}
          placeholder="e.g. Ravana Falls, Ella · Nine Arch Bridge · Galle Fort"
          style={{ flex:1, padding:"12px 14px", border:`1.5px solid ${C.border}`, borderRadius:12, fontSize:13, fontFamily:sans, color:C.ink, outline:"none", minWidth:0 }}
        />
        <button
          onClick={()=>{ if(placeInput.trim()){ setAns(a=>({...a,customPlaces:[...a.customPlaces,placeInput.trim()]})); setPlaceInput(""); } }}
          style={{ padding:"12px 18px", background:C.teal, color:"#fff", border:"none", borderRadius:12, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:sans, whiteSpace:"nowrap", flexShrink:0 }}>
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
          {/* Start time picker */}
          <p style={{ fontSize:13, color:C.inkSoft, marginBottom:16, lineHeight:1.6 }}>Almost done! Two final details:</p>

          <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:"16px 18px", marginBottom:16 }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.ink, marginBottom:10 }}>🕐 What time does your trip start?</div>
            <p style={{ fontSize:12, color:C.inkSoft, marginBottom:12 }}>This affects what we plan for Day 1 — an evening start means check-in only, morning start means a full day.</p>
            <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
              <input type="time" value={ans.startTime||"09:00"} onChange={e=>upd("startTime",e.target.value)}
                style={{ padding:"10px 14px", border:`1.5px solid ${C.teal}`, borderRadius:10, fontSize:16, fontFamily:sans, fontWeight:600, color:C.ink, outline:"none", cursor:"pointer" }}/>
              <div style={{ fontSize:12, color:C.inkSoft }}>
                {(()=>{
                  const h = parseInt((ans.startTime||"09:00").split(":")[0]);
                  return h < 12 ? "🌅 Morning — full day planned"
                       : h < 14 ? "☀️ Midday — nearly full day"
                       : h < 18 ? "🌤️ Afternoon — lighter day 1"
                       : "🌙 Evening — check-in & dinner only";
                })()}
              </div>
            </div>
          </div>

          {/* Trip summary */}
          <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:"16px 18px" }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.ink, marginBottom:10 }}>📋 Trip summary</div>
            {[
              ["📅","Duration",`${ans.days} days, ${ans.nights} nights`],
              ["🕐","Start time",ans.startTime||"09:00"],
              ["📍","Starting from",ans.startCity==="airport"?"BIA Airport":ans.startCity==="colombo"?"Colombo":ans.customStart||"Colombo"],
              ["🗺️","Style",ans.travel||"Not selected"],
              ["👥","Group",ans.group||"Not selected"],
              ["💰","Budget",ans.budget||"Not selected"],
              ["🚗","Transport",ans.transport||"Not selected"],
              ["⚡","Pace",ans.pace||"balanced"],
              ...(ans.customPlaces.length?[["📍","Your places",ans.customPlaces.join(", ")]]:[]),
            ].map(([icon,label,val])=>(
              <div key={label} style={{ display:"flex", gap:12, padding:"6px 0", borderBottom:`1px solid ${C.border}`, fontSize:12 }}>
                <span style={{ fontSize:14 }}>{icon}</span>
                <span style={{ color:C.inkSoft, minWidth:90 }}>{label}</span>
                <span style={{ fontWeight:600, color:C.ink, textTransform:"capitalize", flex:1 }}>{val}</span>
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
        <div className="wizard-card" style={{ background:C.white, borderRadius:24, padding:"2.5rem", border:`1px solid ${C.border}`, boxShadow:"0 4px 24px rgba(0,0,0,.06)" }}>
          {steps[step]}
          <div className="wizard-btn-row" style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:28, paddingTop:20, borderTop:`1px solid ${C.border}`, gap:12 }}>
            {step>0 ? <Btn variant="outline" onClick={()=>setStep(s=>s-1)}>← Back</Btn> : <span/>}
            {step<9
              ? <Btn onClick={()=>setStep(s=>s+1)}>Next →</Btn>
              : <Btn variant="amber" onClick={()=>{
                  if(!user){
                    // Save wizard state so it survives login
                    sessionStorage.setItem("ct_wizard_ans", JSON.stringify(ans));
                    sessionStorage.setItem("ct_wizard_step", String(step));
                    onLoginNeeded();
                    return;
                  }
                  generate();
                }}>✨ Generate my itinerary</Btn>
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

          {d.formatted_phone_number && <p style={{ fontSize:13, color:C.ink, marginBottom:8, display:"flex", alignItems:"center", gap:8 }}>📞 <a href={`tel:${d.formatted_phone_number}`} style={{ color:C.teal, textDecoration:"none", fontWeight:600 }}>{d.formatted_phone_number}</a></p>}
          {d.website && (
            <a href={d.website} target="_blank" rel="noopener noreferrer"
              style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 14px", background:C.tealPale, border:`1px solid #9FE1CB`, borderRadius:10, fontSize:13, color:C.teal, textDecoration:"none", fontWeight:600, marginBottom:14, wordBreak:"break-all" }}>
              🌐 <span style={{ flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{d.website.replace(/^https?:\/\/(www\.)?/,"")}</span>
              <span style={{ flexShrink:0, fontSize:11, opacity:.7 }}>↗</span>
            </a>
          )}

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


// ─── SRI LANKA MAP PAGE ───────────────────────────────────────────────────────
const MAP_PINS = [
  { id:"yala",        lat:6.37,  lng:81.52, emoji:"🐆", name:"Yala National Park",      fact:"Highest leopard density on earth — also home to sloth bears, crocodiles & 200+ bird species.",        color:"#C45230" },
  { id:"sigiriya",    lat:7.95,  lng:80.76, emoji:"🏰", name:"Sigiriya",                fact:"5th-century Lion Rock fortress rising 200m from the jungle — ancient frescoes and mirror wall.",       color:"#B87318" },
  { id:"kandy",       lat:7.29,  lng:80.63, emoji:"🌿", name:"Kandy",                   fact:"Cultural heartland — Temple of the Tooth, botanical gardens, traditional Kandyan dance.",              color:"#0B6B52" },
  { id:"ella",        lat:6.87,  lng:81.05, emoji:"🚂", name:"Ella",                    fact:"Misty mountain village — Nine Arch Bridge, Little Adam's Peak, and the iconic scenic train.",          color:"#0B6B52" },
  { id:"mirissa",     lat:5.95,  lng:80.46, emoji:"🐋", name:"Mirissa",                 fact:"Blue whale watching capital of Sri Lanka — best sightings November to April.",                        color:"#185FA5" },
  { id:"colombo",     lat:6.92,  lng:79.86, emoji:"🏙️", name:"Colombo",                 fact:"Commercial capital — Pettah market, Galle Face Green, Ministry of Crab, and the Fort district.",      color:"#3D3D3D" },
  { id:"galle",       lat:6.05,  lng:80.22, emoji:"🏛️", name:"Galle Fort",              fact:"UNESCO 17th-century Dutch fort — cobbled streets, boutique cafés and the best sunset rampart walk.", color:"#B87318" },
  { id:"anuradhapura",lat:8.34,  lng:80.38, emoji:"🛕", name:"Anuradhapura",            fact:"Ancient sacred city — 2,300-year-old Sri Maha Bodhi tree, massive stupas, and ancient tanks.",       color:"#B87318" },
  { id:"trinco",      lat:8.59,  lng:81.23, emoji:"🤿", name:"Trincomalee",             fact:"Natural deep harbour — Pigeon Island coral reef, Nilaveli beach, and whale watching.",               color:"#185FA5" },
  { id:"udawalawe",   lat:6.47,  lng:80.90, emoji:"🐘", name:"Udawalawe",               fact:"Best place to see wild Asian elephants — herds of 30–50 cross the grasslands at dusk.",              color:"#7A4A0A" },
  { id:"nuwaraeliya", lat:6.97,  lng:80.78, emoji:"☕", name:"Nuwara Eliya",            fact:"Tea capital at 1868m — colonial bungalows, rose gardens and the Gregory Lake valley in morning mist.", color:"#0B6B52" },
  { id:"arugambay",   lat:6.84,  lng:81.83, emoji:"🏄", name:"Arugam Bay",              fact:"World-class surf point break on the east coast — dry and warm when the west is wet.",                color:"#185FA5" },
  { id:"dambulla",    lat:7.87,  lng:80.65, emoji:"🕌", name:"Dambulla Cave Temple",    fact:"Five cave temples painted floor-to-ceiling with Buddhist murals and 153 golden statues.",             color:"#B87318" },
  { id:"wilpattu",    lat:8.45,  lng:80.03, emoji:"🦁", name:"Wilpattu National Park",  fact:"Sri Lanka's largest park — secretive leopards, sloth bears and natural lakes (villus).",             color:"#C45230" },
  { id:"kalpitiya",   lat:8.23,  lng:79.76, emoji:"🪁", name:"Kalpitiya",               fact:"Best kite surfing in Asia — 15–25 knot winds for 9 months, plus spinner dolphin watching.",          color:"#185FA5" },
];


function SriLankaMapPage({ setPage }) {
  const mapRef    = useRef(null);
  const mapObj    = useRef(null);
  const [selectedPin, setSelectedPin] = useState(null);

  useEffect(()=>{
    if (mapObj.current || !mapRef.current) return;

    // Dynamically load Leaflet CSS + JS (free, no key needed)
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => {
      const L = window.L;
      const map = L.map(mapRef.current, {
        center: [7.87, 80.77],
        zoom: 7,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      // OpenStreetMap tiles — completely free
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      mapObj.current = map;

      // Add animated emoji markers
      MAP_PINS.forEach(pin => {
        const icon = L.divIcon({
          html: `<div style="
            width:44px;height:44px;border-radius:50%;
            background:${pin.color};border:3px solid #fff;
            display:flex;align-items:center;justify-content:center;
            font-size:20px;cursor:pointer;
            box-shadow:0 3px 14px rgba(0,0,0,.35);
            animation:mapPinBounce 2s ease-in-out infinite;
            transition:transform .2s;
          ">${pin.emoji}</div>`,
          className: "",
          iconSize: [44, 44],
          iconAnchor: [22, 22],
          popupAnchor: [0, -24],
        });

        const marker = L.marker([pin.lat, pin.lng], { icon })
          .addTo(map)
          .bindTooltip(pin.name, { permanent: false, direction: "top", className: "leaflet-tooltip-custom" });

        marker.on("click", () => {
          setSelectedPin(pin);
        });
      });
    };
    document.head.appendChild(script);

    return () => {
      if (mapObj.current) {
        mapObj.current.remove();
        mapObj.current = null;
      }
    };
  }, []);

  return (
    <div style={{ minHeight:"100vh", background:C.surface }}>
      <style>{`
        @keyframes mapPinBounce {
          0%,100% { transform:translateY(0); }
          50% { transform:translateY(-5px); }
        }
        .leaflet-tooltip-custom {
          background:#fff; border:1px solid ${C.border};
          border-radius:8px; padding:4px 10px;
          font-size:12px; font-weight:600; color:${C.ink};
          box-shadow:0 2px 8px rgba(0,0,0,.12);
        }
      `}</style>

      {/* Header */}
      <div style={{ background:`linear-gradient(135deg,${C.teal},#147856)`, padding:"2rem 2rem 1.5rem" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ fontSize:11, color:"rgba(255,255,255,.6)", textTransform:"uppercase", letterSpacing:2, marginBottom:8 }}>Interactive</div>
          <h1 style={{ fontFamily:serif, fontSize:"clamp(24px,4vw,40px)", fontWeight:700, color:"#fff", marginBottom:6 }}>Sri Lanka Map</h1>
          <p style={{ fontSize:14, color:"rgba(255,255,255,.7)" }}>Click any marker to explore what makes each place special</p>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"1.5rem 2rem 3rem" }}>
        <div style={{ display:"grid", gridTemplateColumns:selectedPin?"1fr 300px":"1fr", gap:16, alignItems:"start" }}>

          {/* Map */}
          <div style={{ borderRadius:16, overflow:"hidden", boxShadow:"0 4px 24px rgba(0,0,0,.12)", border:`1px solid ${C.border}` }}>
            <div ref={mapRef} style={{ height:580, width:"100%" }}/>
          </div>

          {/* Selected pin info */}
          {selectedPin && (
            <div style={{ background:C.white, borderRadius:16, border:`1.5px solid ${C.border}`, overflow:"hidden", boxShadow:"0 4px 20px rgba(0,0,0,.08)", position:"sticky", top:80 }}>
              <div style={{ height:120, background:selectedPin.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:52, position:"relative" }}>
                <span style={{ animation:"mapPinBounce 2s ease-in-out infinite", display:"inline-block" }}>{selectedPin.emoji}</span>
                <button onClick={()=>setSelectedPin(null)} style={{ position:"absolute", top:10, right:10, width:28, height:28, borderRadius:"50%", border:"none", background:"rgba(0,0,0,.3)", color:"#fff", fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
              </div>
              <div style={{ padding:"16px" }}>
                <h3 style={{ fontFamily:serif, fontSize:18, fontWeight:700, color:C.ink, marginBottom:8 }}>{selectedPin.name}</h3>
                <p style={{ fontSize:13, color:C.inkSoft, lineHeight:1.65, marginBottom:16 }}>{selectedPin.fact}</p>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  <Btn onClick={()=>{ setPage("journey"); sessionStorage.setItem("suggestDest", selectedPin.name); }} style={{ width:"100%", justifyContent:"center" }}>
                    ✨ Plan a trip here
                  </Btn>
                  <a href={`https://maps.google.com/?q=${encodeURIComponent(selectedPin.name+", Sri Lanka")}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ display:"block", textAlign:"center", padding:"10px", border:`1px solid ${C.border}`, borderRadius:10, fontSize:13, color:C.teal, textDecoration:"none", fontWeight:600 }}>
                    📍 Open in Google Maps
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Clickable legend */}
        <div style={{ marginTop:16, display:"flex", flexWrap:"wrap", gap:8 }}>
          {MAP_PINS.map(pin=>(
            <button key={pin.id} onClick={()=>{
              setSelectedPin(pin);
              if (mapObj.current) mapObj.current.setView([pin.lat, pin.lng], 9, { animate:true });
            }} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 14px", background:selectedPin?.id===pin.id?pin.color:"#fff", border:`1.5px solid ${selectedPin?.id===pin.id?pin.color:C.border}`, borderRadius:20, cursor:"pointer", fontFamily:sans, transition:"all .15s" }}>
              <span>{pin.emoji}</span>
              <span style={{ fontSize:12, fontWeight:600, color:selectedPin?.id===pin.id?"#fff":C.ink }}>{pin.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


function EmergencyButton() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  return (
    <>
      {/* Floating SOS button */}
      <button onClick={()=>setOpen(o=>!o)} style={{
        position:"fixed", bottom:24, left:24, zIndex:500,
        width:52, height:52, borderRadius:"50%",
        background: open ? "#C45230" : "#fff",
        color: open ? "#fff" : "#C45230",
        border:"2px solid #C45230",
        fontSize:open?16:18, cursor:"pointer",
        boxShadow:"0 4px 20px rgba(196,82,48,.3)",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontWeight:700, fontFamily:sans,
        transition:"all .2s",
      }}>
        {open ? "✕" : "🆘"}
      </button>

      {/* Emergency panel */}
      {open && (
        <div style={{
          position:"fixed", bottom:88, left:24, zIndex:500,
          width:360, maxWidth:"calc(100vw - 48px)",
          background:"#fff", borderRadius:20,
          boxShadow:"0 12px 48px rgba(0,0,0,.2)",
          border:"1.5px solid #EFBAA8",
          display:"flex", flexDirection:"column",
          maxHeight:"70vh",
        }}>
          {/* Header */}
          <div style={{ padding:"14px 16px", background:"#C45230", borderRadius:"18px 18px 0 0", flexShrink:0 }}>
            <div style={{ fontFamily:serif, fontSize:16, fontWeight:700, color:"#fff" }}>🆘 Emergency & Important Numbers</div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,.75)", marginTop:3 }}>Sri Lanka — tap any number to call</div>
          </div>

          {/* Category tabs */}
          <div style={{ display:"flex", overflowX:"auto", borderBottom:"1px solid #E4E4E4", flexShrink:0 }}>
            {EMERGENCY_DATA.map((cat,i)=>(
              <button key={i} onClick={()=>setActiveTab(i)} style={{
                padding:"10px 12px", border:"none", background:"transparent",
                fontSize:11, fontWeight:activeTab===i?700:400,
                color:activeTab===i?"#C45230":C.inkSoft, cursor:"pointer",
                borderBottom:activeTab===i?"2.5px solid #C45230":"2.5px solid transparent",
                whiteSpace:"nowrap", fontFamily:sans, flexShrink:0,
              }}>{cat.category.split(" ")[0]}</button>
            ))}
          </div>

          {/* Items */}
          <div style={{ flex:1, overflowY:"auto", padding:"8px 0" }}>
            <div style={{ padding:"6px 16px", fontSize:11, fontWeight:700, color:"#C45230", textTransform:"uppercase", letterSpacing:.8 }}>
              {EMERGENCY_DATA[activeTab].category}
            </div>
            {EMERGENCY_DATA[activeTab].items.map((item,i)=>(
              <div key={i} style={{ padding:"10px 16px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:C.ink, marginBottom:2 }}>{item.label}</div>
                  <div style={{ fontSize:11, color:C.inkSoft }}>{item.note}</div>
                </div>
                <a href={`tel:${item.number.replace(/\s/g,"")}`} style={{
                  flexShrink:0, padding:"6px 12px",
                  background:"#C45230", color:"#fff",
                  borderRadius:10, fontSize:12, fontWeight:700,
                  textDecoration:"none", fontFamily:sans,
                  display:"flex", alignItems:"center", gap:4,
                }}>
                  📞 {item.number}
                </a>
              </div>
            ))}
          </div>

          {/* Footer tip */}
          <div style={{ padding:"10px 16px", background:C.surface, borderRadius:"0 0 18px 18px", fontSize:11, color:C.inkSoft, flexShrink:0, borderTop:`1px solid ${C.border}` }}>
            💡 Save these numbers offline before your trip. Emergency services (119/110/111) work even without credit.
          </div>
        </div>
      )}
    </>
  );
}

// ─── AUTH CONTEXT ─────────────────────────────────────────────────────────────
const AuthContext = React.createContext(null);

function useAuth() { return React.useContext(AuthContext); }

function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [authReady, setReady] = useState(false);
  const [firebaseApp, setFB]  = useState(null);

  useEffect(()=>{
    // Load Firebase dynamically — no build step needed
    const initFirebase = async () => {
      try {
        // Load from CDN
        if (!window.firebase) {
          await Promise.all([
            loadScript("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"),
            loadScript("https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"),
          ]);
        }
        const config = {
          apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
          authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
          projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
        };
        // Init only once
        const app = window.firebase.apps.length
          ? window.firebase.app()
          : window.firebase.initializeApp(config);
        setFB(app);
        window.firebase.auth().onAuthStateChanged(u=>{ setUser(u); setReady(true); });
      } catch(e) {
        console.warn("Firebase init failed:", e.message);
        setReady(true);
      }
    };
    initFirebase();
  },[]);

  const signInEmail  = (email,pass) => window.firebase.auth().signInWithEmailAndPassword(email,pass);
  const signUpEmail  = (email,pass) => window.firebase.auth().createUserWithEmailAndPassword(email,pass);
  const signInGoogle = () => {
    const provider = new window.firebase.auth.GoogleAuthProvider();
    return window.firebase.auth().signInWithPopup(provider);
  };
  const signOut = () => window.firebase.auth().signOut();

  return (
    <AuthContext.Provider value={{ user, authReady, signInEmail, signUpEmail, signInGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

function loadScript(src) {
  return new Promise((resolve,reject)=>{
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement("script");
    s.src = src; s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
}

// ─── LOGIN MODAL ──────────────────────────────────────────────────────────────
function LoginModal({ onClose, onSuccess }) {
  const { signInEmail, signUpEmail, signInGoogle } = useAuth();
  const [mode, setMode]     = useState("signin"); // signin | signup
  const [email, setEmail]   = useState("");
  const [pass, setPass]     = useState("");
  const [error, setError]   = useState("");
  const [loading, setLoad]  = useState(false);

  const handle = async (fn) => {
    setLoad(true); setError("");
    try { const res = await fn(); onSuccess(res.user||res); }
    catch(e) { setError(e.message.replace("Firebase: ","").replace(/\(auth\/.*\)/,"")); }
    setLoad(false);
  };

  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.55)", zIndex:900, display:"flex", alignItems:"center", justifyContent:"center", padding:16, backdropFilter:"blur(6px)" }}>
      <div style={{ background:"#fff", borderRadius:24, width:"100%", maxWidth:420, boxShadow:"0 24px 80px rgba(0,0,0,.25)", overflow:"hidden", animation:"slideUp .25s ease" }}>
        <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>

        {/* Header */}
        <div style={{ background:`linear-gradient(135deg,${C.teal},#147856)`, padding:"2rem 2rem 1.5rem", textAlign:"center", position:"relative" }}>
          <button onClick={onClose} style={{ position:"absolute", top:12, right:12, width:32, height:32, borderRadius:"50%", border:"1px solid rgba(255,255,255,.3)", background:"rgba(255,255,255,.1)", color:"#fff", fontSize:16, cursor:"pointer" }}>✕</button>
          <div style={{ fontFamily:serif, fontSize:24, fontWeight:700, color:"#fff", marginBottom:4 }}>
            Ceylon<span style={{ color:C.amberMid }}>Trails</span>
          </div>
          <div style={{ fontSize:13, color:"rgba(255,255,255,.75)" }}>
            {mode==="signin" ? "Welcome back" : "Create your account"}
          </div>
        </div>

        <div style={{ padding:"1.5rem" }}>
          {/* Google sign-in */}
          <button onClick={()=>handle(signInGoogle)} disabled={loading} style={{ width:"100%", padding:"12px", border:`1.5px solid ${C.border}`, borderRadius:12, background:"#fff", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:sans, display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginBottom:16, opacity:loading?.6:1 }}>
            <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/></svg>
            Continue with Google
          </button>

          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
            <div style={{ flex:1, height:1, background:C.border }}/>
            <span style={{ fontSize:12, color:C.inkSoft }}>or</span>
            <div style={{ flex:1, height:1, background:C.border }}/>
          </div>

          {/* Email/password */}
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" type="email"
            style={{ width:"100%", padding:"12px 14px", border:`1.5px solid ${C.border}`, borderRadius:12, fontSize:14, fontFamily:sans, marginBottom:10, outline:"none", boxSizing:"border-box" }}/>
          <input value={pass} onChange={e=>setPass(e.target.value)} placeholder="Password" type="password"
            style={{ width:"100%", padding:"12px 14px", border:`1.5px solid ${C.border}`, borderRadius:12, fontSize:14, fontFamily:sans, marginBottom:14, outline:"none", boxSizing:"border-box" }}
            onKeyDown={e=>e.key==="Enter"&&handle(mode==="signin"?()=>signInEmail(email,pass):()=>signUpEmail(email,pass))}/>

          {error && <div style={{ background:"#FEF0F0", border:"1px solid #EFBAA8", borderRadius:10, padding:"8px 12px", fontSize:12, color:C.coral, marginBottom:12 }}>{error}</div>}

          <button onClick={()=>handle(mode==="signin"?()=>signInEmail(email,pass):()=>signUpEmail(email,pass))} disabled={loading||!email||!pass}
            style={{ width:"100%", padding:"13px", background:C.teal, color:"#fff", border:"none", borderRadius:12, fontSize:14, fontWeight:700, cursor:loading||!email||!pass?"not-allowed":"pointer", fontFamily:sans, opacity:loading||!email||!pass?.6:1 }}>
            {loading ? "Please wait…" : mode==="signin" ? "Sign in" : "Create account"}
          </button>

          <div style={{ textAlign:"center", marginTop:14, fontSize:13, color:C.inkSoft }}>
            {mode==="signin" ? <>Don't have an account? <span onClick={()=>{ setMode("signup"); setError(""); }} style={{ color:C.teal, fontWeight:600, cursor:"pointer" }}>Sign up</span></>
            : <>Already have an account? <span onClick={()=>{ setMode("signin"); setError(""); }} style={{ color:C.teal, fontWeight:600, cursor:"pointer" }}>Sign in</span></>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── WELCOME TOAST ────────────────────────────────────────────────────────────
function WelcomeToast({ user, onDone }) {
  const name = user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || "Traveller";
  useEffect(()=>{ const t = setTimeout(onDone, 3500); return ()=>clearTimeout(t); },[]);
  return (
    <div style={{ position:"fixed", top:80, left:"50%", transform:"translateX(-50%)", zIndex:1000, background:"#fff", borderRadius:20, padding:"20px 28px", boxShadow:"0 12px 48px rgba(0,0,0,.2)", border:`1.5px solid ${C.tealLight}`, textAlign:"center", animation:"slideDown .4s ease", minWidth:280 }}>
      <style>{`@keyframes slideDown{from{opacity:0;transform:translateX(-50%) translateY(-20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
      <div style={{ fontSize:32, marginBottom:8 }}>🌿</div>
      <div style={{ fontFamily:serif, fontSize:18, fontWeight:700, color:C.ink, marginBottom:4 }}>Hello, {name}!</div>
      <div style={{ fontSize:13, color:C.inkSoft, lineHeight:1.6 }}>Welcome to CeylonTrails.<br/>Your journey starts here.</div>
    </div>
  );
}

// ─── PREMIUM GATE ──────────────────────────────────────────────────────────────
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || "sb"; // "sb" = sandbox
const UNLOCK_PRICE = 2; // USD

function usePremium() {
  const { user } = useAuth();
  const [unlockedItins, setUnlocked] = useState(()=>{
    try { return JSON.parse(localStorage.getItem("ct_premium")||"[]"); } catch { return []; }
  });
  const unlock = (itinId) => {
    const next = [...new Set([...unlockedItins, itinId])];
    setUnlocked(next);
    localStorage.setItem("ct_premium", JSON.stringify(next));
  };
  const isUnlocked = (itinId) => !itinId || unlockedItins.includes(itinId);
  return { isUnlocked, unlock };
}


// ─── PREMIUM LOCK ─────────────────────────────────────────────────────────────
function PremiumLock({ itinId, onUnlock }) {
  const [show,   setShow]  = useState(false);
  const [paying, setPaying]= useState(false);
  const [step,   setStep]  = useState("lock");

  const handleDemoPayment = () => {
    setPaying(true);
    setTimeout(()=>{ setPaying(false); setStep("success"); }, 2000);
  };

  return (
    <>
      <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", zIndex:5 }}>
        <button onClick={()=>{ setShow(true); setStep("lock"); }} style={{ padding:"10px 24px", background:C.amber, color:"#fff", border:"none", borderRadius:12, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:sans, boxShadow:"0 4px 16px rgba(0,0,0,.25)", display:"flex", alignItems:"center", gap:8 }}>
          🔒 Unlock this day — ${UNLOCK_PRICE}
        </button>
      </div>

      {show && (
        <div onClick={e=>e.target===e.currentTarget&&setShow(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.6)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16, backdropFilter:"blur(6px)" }}>
          <div style={{ background:"#fff", borderRadius:24, width:"100%", maxWidth:400, boxShadow:"0 24px 80px rgba(0,0,0,.3)", overflow:"hidden", animation:"slideUp .25s ease" }}>
            {step==="lock" && <>
              <div style={{ background:`linear-gradient(135deg,${C.amber},#D97706)`, padding:"1.5rem", textAlign:"center" }}>
                <div style={{ fontSize:40, marginBottom:8 }}>🔒</div>
                <div style={{ fontFamily:serif, fontSize:20, fontWeight:700, color:"#fff", marginBottom:4 }}>Premium Feature</div>
                <div style={{ fontSize:13, color:"rgba(255,255,255,.85)" }}>Unlock all days, maps, swapping & drag-drop</div>
              </div>
              <div style={{ padding:"1.5rem" }}>
                <div style={{ background:C.amberLight, border:`1.5px solid #F0D48A`, borderRadius:14, padding:"14px", textAlign:"center", marginBottom:20 }}>
                  <div style={{ fontSize:28, fontWeight:800, color:C.amber }}>${UNLOCK_PRICE} USD</div>
                  <div style={{ fontSize:12, color:C.inkSoft, marginTop:2 }}>One-time payment · Instant access</div>
                </div>
                <button onClick={()=>setStep("demo")} style={{ width:"100%", padding:"14px", background:"#0070BA", color:"#fff", border:"none", borderRadius:12, fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:sans, marginBottom:10, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                  <span style={{ fontWeight:900, fontSize:16 }}>Pay</span><span style={{ fontWeight:300, fontSize:16, color:"#80CFFF" }}>Pal</span>
                  <span>→ Pay ${UNLOCK_PRICE}.00</span>
                </button>
                <div style={{ textAlign:"center", fontSize:11, color:C.inkSoft }}>✓ Secure · ✓ Instant · ✓ No subscription</div>
                <button onClick={()=>setShow(false)} style={{ width:"100%", marginTop:10, padding:"10px", background:"none", border:`1px solid ${C.border}`, borderRadius:10, fontSize:13, color:C.inkSoft, cursor:"pointer", fontFamily:sans }}>Cancel</button>
              </div>
            </>}
            {step==="demo" && (
              <div style={{ padding:"1.5rem" }}>
                <div style={{ textAlign:"center", marginBottom:16 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:"#0070BA", marginBottom:4 }}>PayPal Checkout</div>
                  <div style={{ fontSize:12, color:C.inkSoft }}>CeylonTrails — Full Itinerary Access</div>
                </div>
                <div style={{ background:"#F5F7FA", borderRadius:10, padding:"12px", marginBottom:16, textAlign:"center", fontSize:16, fontWeight:700, color:C.ink }}>Total: ${UNLOCK_PRICE}.00 USD</div>
                <input readOnly value="demo@paypal.com" style={{ width:"100%", padding:"11px 12px", border:`1px solid ${C.border}`, borderRadius:8, fontSize:13, fontFamily:sans, background:"#F5F7FA", marginBottom:8, boxSizing:"border-box" }}/>
                <input readOnly type="password" value="••••••••" style={{ width:"100%", padding:"11px 12px", border:`1px solid ${C.border}`, borderRadius:8, fontSize:13, fontFamily:sans, background:"#F5F7FA", marginBottom:14, boxSizing:"border-box" }}/>
                <button onClick={handleDemoPayment} disabled={paying} style={{ width:"100%", padding:"13px", background:paying?"#aaa":"#0070BA", color:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:700, cursor:paying?"wait":"pointer", fontFamily:sans, marginBottom:8 }}>
                  {paying ? <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}><span style={{ width:16, height:16, border:"2px solid rgba(255,255,255,.4)", borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", animation:"spin .8s linear infinite" }}/> Processing…</span> : `Pay $${UNLOCK_PRICE}.00`}
                </button>
                <button onClick={()=>setStep("lock")} style={{ width:"100%", padding:"10px", background:"none", border:"none", color:C.inkSoft, fontSize:12, cursor:"pointer", fontFamily:sans }}>← Back</button>
                <div style={{ textAlign:"center", fontSize:10, color:C.inkSoft, marginTop:6 }}>🔒 Demo mode — no real charge</div>
              </div>
            )}
            {step==="success" && (
              <div style={{ padding:"2rem", textAlign:"center" }}>
                <div style={{ width:72, height:72, borderRadius:"50%", background:C.tealLight, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", fontSize:32 }}>✅</div>
                <div style={{ fontFamily:serif, fontSize:22, fontWeight:700, color:C.ink, marginBottom:8 }}>Payment Successful!</div>
                <p style={{ fontSize:13, color:C.inkSoft, lineHeight:1.7, marginBottom:20 }}>Your full itinerary is now unlocked — all days, maps and features.</p>
                <button onClick={()=>{ setShow(false); onUnlock(itinId); }} style={{ width:"100%", padding:"13px", background:C.teal, color:"#fff", border:"none", borderRadius:12, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:sans }}>🗺️ View Full Itinerary</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ─── GUIDE PORTAL DATA ────────────────────────────────────────────────────────
const GUIDE_SPECIALTIES = ["Beach & Coastal","Hill Country & Tea","Cultural Triangle","Wildlife Safari","Adventure Sports","Rural & Village","City Tours","Photography Tours","Food & Culinary","Birdwatching","Historical Sites","Multi-region"];
const GUIDE_LANGUAGES   = ["English","Sinhala","Tamil","German","French","Japanese","Chinese","Korean","Russian","Arabic","Italian","Spanish"];
const GUIDE_AREAS       = ["Colombo & Western","Kandy & Central","Galle & Southern","Sigiriya & Cultural Triangle","Yala & Wildlife","Ella & Uva","Trincomalee & East","Jaffna & North","All Island"];

// ─── FIREBASE HELPERS ─────────────────────────────────────────────────────────
async function saveGuideProfile(uid, data) {
  if (!window.firebase) return;
  await window.firebase.firestore().collection("guides").doc(uid).set(data, { merge:true });
}
async function getGuideProfile(uid) {
  if (!window.firebase) return null;
  const doc = await window.firebase.firestore().collection("guides").doc(uid).get();
  return doc.exists ? doc.data() : null;
}
async function loadTripRequests(guideId) {
  if (!window.firebase) return [];
  const snap = await window.firebase.firestore().collection("tripRequests").where("guideId","==",guideId).orderBy("createdAt","desc").limit(20).get();
  return snap.docs.map(d=>({id:d.id,...d.data()}));
}
async function submitBid(requestId, bid) {
  if (!window.firebase) return;
  await window.firebase.firestore().collection("tripRequests").doc(requestId).update({
    bid, bidStatus:"submitted", bidAt: new Date().toISOString()
  });
}

// ─── GUIDE REGISTRATION FORM ──────────────────────────────────────────────────
// ─── VALIDATION HELPERS ───────────────────────────────────────────────────────
const VALIDATORS = {
  fullName:  { test: v => /^[a-zA-Z\s.'-]{2,60}$/.test(v.trim()),   msg:"Name must contain only letters (2–60 characters)" },
  phone:     { test: v => /^\+?[\d\s\-()]{7,20}$/.test(v.trim()),   msg:"Enter a valid phone number" },
  nic:       { test: v => /^[0-9]{9}[vVxX]$|^[0-9]{12}$/.test(v.trim()), msg:"Enter a valid NIC (9 digits + V/X or 12 digits)" },
  address:   { test: v => v.trim().length >= 5,                       msg:"Please enter your full address" },
  sltdaNo:   { test: v => v.trim().length >= 4,                       msg:"Enter your SLTDA licence number" },
  bio:       { test: v => v.trim().length >= 50,                      msg:"Bio must be at least 50 characters" },
};

function validateField(key, value) {
  if (!VALIDATORS[key]) return null;
  if (!value || value.toString().trim()==="") return "This field is required";
  return VALIDATORS[key].test(value) ? null : VALIDATORS[key].msg;
}

// ─── IMAGE UPLOAD HELPER ──────────────────────────────────────────────────────
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    if (file.size > 2 * 1024 * 1024) { reject(new Error("File must be under 2MB")); return; }
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

// ─── EMAIL NOTIFICATION (EmailJS) ────────────────────────────────────────────
async function sendAdminNotification(guideName, guideEmail, sltdaNo) {
  // Uses EmailJS free tier — set up at emailjs.com
  // Add VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, VITE_EMAILJS_PUBLIC_KEY to .env
  const serviceId  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  if (!serviceId || !templateId || !publicKey) return; // silently skip if not configured

  try {
    if (!window.emailjs) {
      await loadScript("https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js");
      window.emailjs.init(publicKey);
    }
    await window.emailjs.send(serviceId, templateId, {
      guide_name:  guideName,
      guide_email: guideEmail,
      sltda_no:    sltdaNo,
      timestamp:   new Date().toLocaleString(),
      admin_url:   window.location.origin + "?admin",
    });
  } catch(e) { console.warn("Email notification failed:", e.message); }
}

// ─── GUIDE REGISTER (with validation + photo upload) ─────────────────────────
function GuideRegister({ user, onComplete }) {
  const [step, setStep]     = useState(0);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm]     = useState({
    fullName:"", phone:"", nic:"", address:"",
    sltdaNo:"", experience:1, bio:"",
    languages:[], specialties:[], areas:[],
    activeTours:[], photo:"", licenceDoc:"", licenceDocName:"",
  });
  const photoRef   = useRef(null);
  const licenceRef = useRef(null);

  const upd = (k, v) => {
    setForm(f=>({...f,[k]:v}));
    // Clear error on change
    if (errors[k]) setErrors(e=>({...e,[k]:null}));
  };
  const tog = (k,v) => setForm(f=>{ const a=f[k], i=a.indexOf(v); return {...f,[k]:i>-1?a.filter(x=>x!==v):[...a,v]}; });

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setErrors(er=>({...er,photo:"Please select an image file (JPG, PNG)"})); return; }
    try { const b64 = await fileToBase64(file); upd("photo", b64); }
    catch(e) { setErrors(er=>({...er,photo:e.message})); }
  };

  const handleLicence = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") && file.type!=="application/pdf") {
      setErrors(er=>({...er,licenceDoc:"Please select an image or PDF file"})); return;
    }
    try {
      const b64 = await fileToBase64(file);
      upd("licenceDoc", b64);
      upd("licenceDocName", file.name);
    } catch(e) { setErrors(er=>({...er,licenceDoc:e.message})); }
  };

  // Validate current step before advancing
  const validateStep = (s) => {
    const newErrors = {};
    if (s===0) {
      ["fullName","phone","nic","address","sltdaNo"].forEach(k=>{
        const e = validateField(k, form[k]);
        if (e) newErrors[k] = e;
      });
      if (!form.photo) newErrors.photo = "Profile photo is required";
      if (!form.licenceDoc) newErrors.licenceDoc = "SLTDA licence document is required";
    }
    if (s===1) {
      if (form.languages.length===0)  newErrors.languages  = "Select at least one language";
      if (form.specialties.length===0) newErrors.specialties = "Select at least one specialty";
      if (form.areas.length===0)       newErrors.areas       = "Select at least one area";
      const bioErr = validateField("bio", form.bio);
      if (bioErr) newErrors.bio = bioErr;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length===0;
  };

  const submit = async () => {
    if (!validateStep(1)) return;
    setSaving(true);
    try {
      await saveGuideProfile(user.uid, {
        ...form, email:user.email, uid:user.uid,
        status:"pending", role:"guide",
        registeredAt: new Date().toISOString(),
        availability:"available", tripsCompleted:0, rating:0, reviews:[],
      });
      await sendAdminNotification(form.fullName, user.email, form.sltdaNo);
      onComplete();
    } catch(e) { alert("Error saving profile: "+e.message); }
    setSaving(false);
  };

  const Field = ({ label, k, type="text", placeholder, hint }) => (
    <div style={{ marginBottom:14 }}>
      <label style={{ fontSize:12, fontWeight:600, color:C.ink, display:"block", marginBottom:5 }}>
        {label} <span style={{ color:C.coral }}>*</span>
      </label>
      <input type={type} value={form[k]} onChange={e=>upd(k,e.target.value)} placeholder={placeholder}
        style={{ width:"100%", padding:"11px 14px", border:`1.5px solid ${errors[k]?C.coral:C.border}`, borderRadius:10, fontSize:14, fontFamily:sans, outline:"none", boxSizing:"border-box", transition:"border-color .15s" }}/>
      {errors[k] && <div style={{ fontSize:11, color:C.coral, marginTop:4 }}>⚠️ {errors[k]}</div>}
      {hint && !errors[k] && <div style={{ fontSize:11, color:C.inkSoft, marginTop:4 }}>{hint}</div>}
    </div>
  );

  const steps = [
    // Step 0 — Personal + uploads
    <>
      <h3 style={{ fontFamily:serif, fontSize:20, fontWeight:700, color:C.ink, marginBottom:4 }}>Personal Information</h3>
      <p style={{ fontSize:13, color:C.inkSoft, marginBottom:20 }}>All fields are required and will be verified by SLTDA.</p>

      {/* Profile photo upload */}
      <div style={{ marginBottom:16 }}>
        <label style={{ fontSize:12, fontWeight:600, color:C.ink, display:"block", marginBottom:8 }}>
          Profile photo <span style={{ color:C.coral }}>*</span>
        </label>
        <div onClick={()=>photoRef.current?.click()} style={{ display:"flex", alignItems:"center", gap:14, cursor:"pointer" }}>
          <div style={{ width:80, height:80, borderRadius:"50%", border:`2px dashed ${errors.photo?C.coral:C.border}`, background:C.surface, overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            {form.photo
              ? <img src={form.photo} alt="Profile" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
              : <span style={{ fontSize:28, opacity:.4 }}>📷</span>
            }
          </div>
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:C.teal }}>{form.photo?"Change photo":"Upload profile photo"}</div>
            <div style={{ fontSize:11, color:C.inkSoft, marginTop:3 }}>JPG or PNG · Max 2MB · Clear face photo</div>
            {errors.photo && <div style={{ fontSize:11, color:C.coral, marginTop:3 }}>⚠️ {errors.photo}</div>}
          </div>
        </div>
        <input ref={photoRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display:"none" }}/>
      </div>

      <Field label="Full name (as on NIC)" k="fullName" placeholder="e.g. Chaminda Perera" hint="Letters and spaces only"/>
      <Field label="Phone number" k="phone" type="tel" placeholder="+94 77 123 4567" hint="Include country code"/>
      <Field label="NIC number" k="nic" placeholder="e.g. 199012345678 or 900123456V" hint="Old format: 9 digits + V/X · New format: 12 digits"/>
      <Field label="Home address" k="address" placeholder="Street, City, Province"/>
      <Field label="SLTDA Licence number" k="sltdaNo" placeholder="e.g. SLTDA/GT/2024/001"/>

      {/* Licence document upload */}
      <div style={{ marginBottom:8 }}>
        <label style={{ fontSize:12, fontWeight:600, color:C.ink, display:"block", marginBottom:8 }}>
          SLTDA Licence document <span style={{ color:C.coral }}>*</span>
        </label>
        <div onClick={()=>licenceRef.current?.click()} style={{ border:`2px dashed ${errors.licenceDoc?C.coral:C.border}`, borderRadius:12, padding:"16px", textAlign:"center", cursor:"pointer", background:form.licenceDoc?C.tealPale:C.surface, transition:"background .15s" }}>
          {form.licenceDoc ? (
            <div>
              <div style={{ fontSize:22, marginBottom:4 }}>{form.licenceDocName?.endsWith(".pdf")?"📄":"🖼️"}</div>
              <div style={{ fontSize:13, fontWeight:600, color:C.teal }}>{form.licenceDocName}</div>
              <div style={{ fontSize:11, color:C.inkSoft, marginTop:3 }}>Click to replace</div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize:28, opacity:.4, marginBottom:4 }}>📎</div>
              <div style={{ fontSize:13, fontWeight:600, color:C.inkSoft }}>Upload SLTDA licence</div>
              <div style={{ fontSize:11, color:C.inkSoft, marginTop:3 }}>Image (JPG/PNG) or PDF · Max 2MB</div>
            </div>
          )}
        </div>
        <input ref={licenceRef} type="file" accept="image/*,application/pdf" onChange={handleLicence} style={{ display:"none" }}/>
        {errors.licenceDoc && <div style={{ fontSize:11, color:C.coral, marginTop:4 }}>⚠️ {errors.licenceDoc}</div>}
      </div>
    </>,

    // Step 1 — Professional
    <>
      <h3 style={{ fontFamily:serif, fontSize:20, fontWeight:700, color:C.ink, marginBottom:4 }}>Professional Details</h3>
      <p style={{ fontSize:13, color:C.inkSoft, marginBottom:16 }}>Tell tourists about your expertise. All sections required.</p>

      <label style={{ fontSize:12, fontWeight:600, color:C.ink, display:"block", marginBottom:6 }}>
        Years of experience <span style={{ color:C.coral }}>*</span>
      </label>
      <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:16 }}>
        <button onClick={()=>upd("experience",Math.max(1,form.experience-1))} style={{ width:36, height:36, borderRadius:"50%", border:`1.5px solid ${C.border}`, background:"none", fontSize:18, cursor:"pointer" }}>−</button>
        <span style={{ fontSize:20, fontWeight:700, color:C.teal, minWidth:32, textAlign:"center" }}>{form.experience}</span>
        <button onClick={()=>upd("experience",Math.min(40,form.experience+1))} style={{ width:36, height:36, borderRadius:"50%", border:`1.5px solid ${C.border}`, background:"none", fontSize:18, cursor:"pointer" }}>+</button>
        <span style={{ fontSize:13, color:C.inkSoft }}>years</span>
      </div>

      {[
        ["Languages spoken","languages",GUIDE_LANGUAGES],
        ["Specialties","specialties",GUIDE_SPECIALTIES],
        ["Areas covered","areas",GUIDE_AREAS],
      ].map(([label,key,opts])=>(
        <div key={key} style={{ marginBottom:16 }}>
          <label style={{ fontSize:12, fontWeight:600, color:C.ink, display:"block", marginBottom:6 }}>
            {label} <span style={{ color:C.coral }}>*</span>
          </label>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {opts.map(o=><button key={o} onClick={()=>tog(key,o)} style={{ padding:"6px 14px", borderRadius:20, border:`1.5px solid ${form[key].includes(o)?C.teal:C.border}`, background:form[key].includes(o)?C.tealLight:"#fff", color:form[key].includes(o)?C.teal:C.inkSoft, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:sans }}>{o}</button>)}
          </div>
          {errors[key] && <div style={{ fontSize:11, color:C.coral, marginTop:5 }}>⚠️ {errors[key]}</div>}
        </div>
      ))}

      <div style={{ marginBottom:8 }}>
        <label style={{ fontSize:12, fontWeight:600, color:C.ink, display:"block", marginBottom:6 }}>
          Bio <span style={{ color:C.coral }}>*</span>
          <span style={{ fontWeight:400, color:C.inkSoft, marginLeft:8 }}>({form.bio.length}/50 min)</span>
        </label>
        <textarea value={form.bio} onChange={e=>upd("bio",e.target.value)} rows={4}
          placeholder="I grew up in Kandy and have been guiding for 8 years. I specialise in cultural and hill country tours, speaking fluent English, German and Sinhala..."
          style={{ width:"100%", padding:"11px 14px", border:`1.5px solid ${errors.bio?C.coral:C.border}`, borderRadius:10, fontSize:13, fontFamily:sans, outline:"none", resize:"vertical", boxSizing:"border-box" }}/>
        {errors.bio && <div style={{ fontSize:11, color:C.coral, marginTop:4 }}>⚠️ {errors.bio}</div>}
      </div>
    </>,

    // Step 2 — Review
    <>
      <h3 style={{ fontFamily:serif, fontSize:20, fontWeight:700, color:C.ink, marginBottom:4 }}>Review & Submit</h3>
      <p style={{ fontSize:13, color:C.inkSoft, marginBottom:16 }}>Your application will be reviewed within 2–3 business days.</p>

      <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:16 }}>
        <div style={{ width:64, height:64, borderRadius:"50%", overflow:"hidden", border:`2px solid ${C.border}`, flexShrink:0 }}>
          {form.photo ? <img src={form.photo} alt="Profile" style={{ width:"100%", height:"100%", objectFit:"cover" }}/> : <div style={{ width:"100%", height:"100%", background:C.surface, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>👤</div>}
        </div>
        <div>
          <div style={{ fontFamily:serif, fontSize:18, fontWeight:700, color:C.ink }}>{form.fullName||"Your Name"}</div>
          <div style={{ fontSize:13, color:C.inkSoft }}>{form.specialties.slice(0,2).join(", ")||"Specialties"}</div>
        </div>
      </div>

      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:"16px" }}>
        {[
          ["📞 Phone", form.phone],
          ["🪪 NIC", form.nic],
          ["📍 Address", form.address],
          ["🛡️ SLTDA No", form.sltdaNo],
          ["⭐ Experience", `${form.experience} yrs`],
          ["🗣️ Languages", form.languages.join(", ")||"—"],
          ["🎯 Specialties", form.specialties.join(", ")||"—"],
          ["📍 Areas", form.areas.join(", ")||"—"],
          ["📎 Licence doc", form.licenceDocName||"—"],
        ].map(([l,v])=>(
          <div key={l} style={{ display:"flex", gap:10, padding:"7px 0", borderBottom:`1px solid ${C.border}`, fontSize:13 }}>
            <span style={{ minWidth:120, color:C.inkSoft }}>{l}</span>
            <span style={{ fontWeight:600, color:C.ink, flex:1 }}>{v||"—"}</span>
          </div>
        ))}
      </div>
      <div style={{ background:C.amberLight, border:`1px solid #F0D48A`, borderRadius:10, padding:"12px 14px", marginTop:12, fontSize:12, color:C.amber, lineHeight:1.6 }}>
        ⚠️ By submitting, you confirm all information is accurate and your SLTDA licence is valid.
      </div>
    </>,
  ];

  return (
    <div style={{ maxWidth:580, margin:"0 auto", padding:"2rem 1.5rem" }}>
      <StepDots cur={step} total={3}/>
      <div style={{ background:C.white, borderRadius:20, padding:"1.8rem", border:`1px solid ${C.border}`, boxShadow:"0 4px 20px rgba(0,0,0,.06)" }}>
        {steps[step]}
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:24, paddingTop:16, borderTop:`1px solid ${C.border}`, gap:12 }}>
          {step>0 ? <Btn variant="outline" onClick={()=>setStep(s=>s-1)}>← Back</Btn> : <span/>}
          {step<2
            ? <Btn onClick={()=>{ if(validateStep(step)) setStep(s=>s+1); }}>Next →</Btn>
            : <Btn variant="amber" onClick={submit} style={{ opacity:saving?.6:1 }}>{saving?"Submitting…":"Submit Application"}</Btn>
          }
        </div>
      </div>
    </div>
  );
}


// ─── GUIDE DASHBOARD ──────────────────────────────────────────────────────────
function GuideDashboard({ user, profile, onProfileUpdate }) {
  const [activeTab, setTab]     = useState("requests");
  const [requests, setRequests] = useState([]);
  const [loadingReqs, setLR]    = useState(false);
  const [availability, setAvail]= useState(profile?.availability||"available");
  const [freeDate, setFreeDate] = useState(profile?.freeDate||"");
  const [editProfile, setEditP] = useState(false);
  const [bidModal, setBid]      = useState(null); // {request}
  const [bidText, setBidText]   = useState({ price:"", message:"", dates:"" });
  const [newTour, setNewTour]   = useState({ title:"", location:"", date:"", rating:5, notes:"" });
  const [addingTour, setAddTour]= useState(false);

  useEffect(()=>{
    if (activeTab==="requests") {
      setLR(true);
      loadTripRequests(user.uid).then(r=>{ setRequests(r); setLR(false); }).catch(()=>setLR(false));
    }
  },[activeTab]);

  const updateAvailability = async (val, date) => {
    setAvail(val);
    await saveGuideProfile(user.uid, { availability:val, freeDate:date||"" });
    onProfileUpdate({ ...profile, availability:val, freeDate:date||"" });
  };

  const submitBidHandler = async () => {
    if (!bidModal || !bidText.price) return;
    await submitBid(bidModal.id, bidText);
    setRequests(rs=>rs.map(r=>r.id===bidModal.id?{...r,bid:bidText,bidStatus:"submitted"}:r));
    setBid(null); setBidText({ price:"", message:"", dates:"" });
  };

  const addCompletedTour = async () => {
    if (!newTour.title) return;
    const tours = [...(profile?.activeTours||[]), { ...newTour, addedAt:new Date().toISOString() }];
    await saveGuideProfile(user.uid, { activeTours:tours, tripsCompleted:(profile?.tripsCompleted||0)+1 });
    onProfileUpdate({ ...profile, activeTours:tours, tripsCompleted:(profile?.tripsCompleted||0)+1 });
    setNewTour({ title:"", location:"", date:"", rating:5, notes:"" });
    setAddTour(false);
  };

  const TABS = [
    { id:"requests",   label:"📩 Trip Requests", badge:requests.filter(r=>!r.bid).length },
    { id:"profile",    label:"👤 My Profile" },
    { id:"tours",      label:"🗺️ My Tours" },
    { id:"earnings",   label:"💰 Earnings" },
  ];

  const statusColors = { available:C.teal, "on-trip":"#EA580C", unavailable:"#64748B" };
  const statusLabels = { available:"✅ Available", "on-trip":"🚗 On a trip", unavailable:"⏸ Unavailable" };

  return (
    <div style={{ minHeight:"100vh", background:C.surface }}>
      {/* Bid modal */}
      {bidModal && (
        <div onClick={e=>e.target===e.currentTarget&&setBid(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.55)", zIndex:900, display:"flex", alignItems:"center", justifyContent:"center", padding:16, backdropFilter:"blur(4px)" }}>
          <div style={{ background:"#fff", borderRadius:20, width:"100%", maxWidth:480, padding:"1.5rem", boxShadow:"0 20px 60px rgba(0,0,0,.25)" }}>
            <h3 style={{ fontFamily:serif, fontSize:18, fontWeight:700, color:C.ink, marginBottom:4 }}>Submit your bid</h3>
            <p style={{ fontSize:12, color:C.inkSoft, marginBottom:16 }}>For: <strong>{bidModal.itinTitle||"Trip request"}</strong></p>
            {[["Price (USD total)","price","number","e.g. 250"],["Available dates","dates","text","e.g. 15–20 Jan 2026"]].map(([l,k,t,ph])=>(
              <div key={k} style={{ marginBottom:12 }}>
                <label style={{ fontSize:12, fontWeight:600, color:C.ink, display:"block", marginBottom:5 }}>{l}</label>
                <input type={t} value={bidText[k]} onChange={e=>setBidText(b=>({...b,[k]:e.target.value}))} placeholder={ph}
                  style={{ width:"100%", padding:"10px 12px", border:`1.5px solid ${C.border}`, borderRadius:10, fontSize:13, fontFamily:sans, outline:"none", boxSizing:"border-box" }}/>
              </div>
            ))}
            <label style={{ fontSize:12, fontWeight:600, color:C.ink, display:"block", marginBottom:5 }}>Message to tourist</label>
            <textarea value={bidText.message} onChange={e=>setBidText(b=>({...b,message:e.target.value}))} rows={3} placeholder="Hello! I would love to guide you through Sri Lanka..."
              style={{ width:"100%", padding:"10px 12px", border:`1.5px solid ${C.border}`, borderRadius:10, fontSize:13, fontFamily:sans, outline:"none", resize:"vertical", boxSizing:"border-box", marginBottom:16 }}/>
            <div style={{ display:"flex", gap:10 }}>
              <Btn onClick={submitBidHandler} style={{ flex:1 }}>Send bid →</Btn>
              <Btn variant="outline" onClick={()=>setBid(null)}>Cancel</Btn>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ background:`linear-gradient(135deg,${C.teal},#147856)`, padding:"2rem 2rem 1.5rem" }}>
        <div style={{ maxWidth:900, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:56, height:56, borderRadius:"50%", background:"rgba(255,255,255,.2)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:serif, fontSize:22, fontWeight:700, color:"#fff" }}>
              {profile?.fullName?.[0]||user.email?.[0]||"G"}
            </div>
            <div>
              <div style={{ fontFamily:serif, fontSize:20, fontWeight:700, color:"#fff" }}>{profile?.fullName||"Guide"}</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,.75)", marginTop:2 }}>
                {profile?.experience} yrs exp · {profile?.specialties?.slice(0,2).join(", ")||"Guide"}
              </div>
            </div>
          </div>
          {/* Availability toggle */}
          <div style={{ background:"rgba(255,255,255,.12)", borderRadius:14, padding:"10px 16px" }}>
            <div style={{ fontSize:11, color:"rgba(255,255,255,.7)", marginBottom:8, fontWeight:600 }}>My status</div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {Object.entries(statusLabels).map(([v,l])=>(
                <button key={v} onClick={()=>updateAvailability(v,"")} style={{ padding:"6px 12px", borderRadius:20, border:`1.5px solid ${availability===v?"#fff":"rgba(255,255,255,.3)"}`, background:availability===v?"#fff":"transparent", color:availability===v?statusColors[v]:"rgba(255,255,255,.85)", fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:sans }}>{l}</button>
              ))}
            </div>
            {availability==="on-trip" && (
              <div style={{ marginTop:8, display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:11, color:"rgba(255,255,255,.75)" }}>Free from:</span>
                <input type="date" value={freeDate} onChange={e=>{ setFreeDate(e.target.value); updateAvailability("on-trip",e.target.value); }}
                  style={{ padding:"4px 8px", border:"1px solid rgba(255,255,255,.4)", borderRadius:8, fontSize:12, background:"rgba(255,255,255,.1)", color:"#fff" }}/>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div style={{ maxWidth:900, margin:"14px auto 0", display:"flex", gap:16, flexWrap:"wrap" }}>
          {[
            [`${profile?.tripsCompleted||0}`, "Tours completed"],
            [`${profile?.rating||"—"}★`, "Average rating"],
            [`${requests.filter(r=>!r.bid).length}`, "Pending requests"],
            [profile?.sltdaNo?"✓ Verified":"⏳ Pending", "SLTDA Status"],
          ].map(([v,l])=>(
            <div key={l} style={{ background:"rgba(255,255,255,.12)", borderRadius:10, padding:"10px 16px", flex:1, minWidth:100 }}>
              <div style={{ fontFamily:serif, fontSize:18, fontWeight:700, color:"#fff" }}>{v}</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,.65)", marginTop:2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab nav */}
      <div style={{ background:C.white, borderBottom:`1px solid ${C.border}`, position:"sticky", top:0, zIndex:200 }}>
        <div style={{ maxWidth:900, margin:"0 auto", display:"flex", overflowX:"auto" }}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{ padding:"14px 20px", border:"none", background:"transparent", fontSize:13, fontWeight:activeTab===t.id?700:400, color:activeTab===t.id?C.teal:C.inkSoft, cursor:"pointer", borderBottom:activeTab===t.id?`2.5px solid ${C.teal}`:"2.5px solid transparent", whiteSpace:"nowrap", fontFamily:sans, display:"flex", alignItems:"center", gap:6 }}>
              {t.label}
              {t.badge>0 && <span style={{ background:C.coral, color:"#fff", fontSize:10, fontWeight:700, padding:"2px 6px", borderRadius:20 }}>{t.badge}</span>}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:900, margin:"0 auto", padding:"1.5rem 1.5rem 4rem" }}>

        {/* ── Trip Requests ── */}
        {activeTab==="requests" && (
          <>
            {loadingReqs && <div style={{ textAlign:"center", padding:"3rem", color:C.inkSoft }}>Loading requests…</div>}
            {!loadingReqs && requests.length===0 && (
              <div style={{ textAlign:"center", padding:"4rem", color:C.inkSoft }}>
                <div style={{ fontSize:48, marginBottom:16 }}>📩</div>
                <h3 style={{ fontFamily:serif, fontSize:18, fontWeight:700, color:C.ink, marginBottom:8 }}>No trip requests yet</h3>
                <p style={{ fontSize:13, lineHeight:1.7 }}>When tourists request a bid from you, they'll appear here. Make sure your profile is complete to attract more requests.</p>
              </div>
            )}
            {requests.map(req=>(
              <div key={req.id} style={{ border:`1.5px solid ${C.border}`, borderRadius:16, padding:"1.2rem", marginBottom:12, background:C.white }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:10, marginBottom:10 }}>
                  <div>
                    <div style={{ fontSize:15, fontWeight:700, color:C.ink, marginBottom:3 }}>{req.itinTitle||"Trip Request"}</div>
                    <div style={{ fontSize:12, color:C.inkSoft }}>From: {req.touristName||req.touristEmail||"Tourist"} · {req.itinDays||"?"} days · {req.group||"solo"}</div>
                  </div>
                  <span style={{ fontSize:11, fontWeight:700, padding:"4px 12px", borderRadius:20, background:req.bid?C.tealLight:C.amberLight, color:req.bid?C.teal:C.amber, border:`1px solid ${req.bid?"#9FE1CB":"#F0D48A"}` }}>
                    {req.bid?"✓ Bid sent":"⏳ Awaiting your bid"}
                  </span>
                </div>
                {req.itinTagline && <p style={{ fontSize:13, color:C.inkSoft, marginBottom:10 }}>{req.itinTagline}</p>}
                {req.message && <div style={{ background:C.surface, borderRadius:8, padding:"8px 12px", fontSize:12, color:C.ink, marginBottom:10, borderLeft:`3px solid ${C.border}` }}>"{req.message}"</div>}
                {req.bid ? (
                  <div style={{ background:C.tealPale, borderRadius:8, padding:"8px 12px", fontSize:12, color:C.teal }}>
                    Your bid: <strong>${req.bid.price}</strong> · {req.bid.dates}
                  </div>
                ) : (
                  <Btn onClick={()=>{ setBid(req); setBidText({ price:"", message:"", dates:"" }); }}>Submit bid →</Btn>
                )}
              </div>
            ))}
            {/* Demo requests if empty */}
            {!loadingReqs && requests.length===0 && (
              <div style={{ marginTop:16, background:C.tealPale, border:`1px solid #9FE1CB`, borderRadius:12, padding:"12px 16px", fontSize:12, color:C.teal }}>
                💡 Demo: Trip requests from tourists who choose "Find a Guide" and select you will appear here in real-time.
              </div>
            )}
          </>
        )}

        {/* ── Profile ── */}
        {activeTab==="profile" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:10 }}>
              <h2 style={{ fontFamily:serif, fontSize:20, fontWeight:700, color:C.ink }}>My Profile</h2>
              <Btn onClick={()=>setEditP(e=>!e)}>{editProfile?"✓ Done editing":"✏️ Edit profile"}</Btn>
            </div>
            {[
              { label:"Full Name",     key:"fullName",    type:"text" },
              { label:"Phone",         key:"phone",       type:"tel" },
              { label:"SLTDA No",      key:"sltdaNo",     type:"text" },
              { label:"Experience (years)", key:"experience", type:"number" },
            ].map(f=>(
              <div key={f.key} style={{ marginBottom:14 }}>
                <label style={{ fontSize:12, fontWeight:600, color:C.inkSoft, display:"block", marginBottom:4 }}>{f.label}</label>
                {editProfile
                  ? <input type={f.type} value={profile?.[f.key]||""} onChange={async e=>{ const v=e.target.value; await saveGuideProfile(user.uid,{[f.key]:v}); onProfileUpdate({...profile,[f.key]:v}); }}
                      style={{ width:"100%", padding:"10px 12px", border:`1.5px solid ${C.border}`, borderRadius:10, fontSize:13, fontFamily:sans, outline:"none", boxSizing:"border-box" }}/>
                  : <div style={{ fontSize:14, fontWeight:600, color:C.ink, padding:"8px 0" }}>{profile?.[f.key]||"—"}</div>
                }
              </div>
            ))}

            <label style={{ fontSize:12, fontWeight:600, color:C.inkSoft, display:"block", marginBottom:6 }}>Bio</label>
            {editProfile
              ? <textarea value={profile?.bio||""} onChange={async e=>{ const v=e.target.value; await saveGuideProfile(user.uid,{bio:v}); onProfileUpdate({...profile,bio:v}); }} rows={4}
                  style={{ width:"100%", padding:"10px 12px", border:`1.5px solid ${C.border}`, borderRadius:10, fontSize:13, fontFamily:sans, outline:"none", resize:"vertical", boxSizing:"border-box" }}/>
              : <p style={{ fontSize:13, color:C.ink, lineHeight:1.7 }}>{profile?.bio||"No bio yet."}</p>
            }

            <div style={{ marginTop:16 }}>
              <label style={{ fontSize:12, fontWeight:600, color:C.inkSoft, display:"block", marginBottom:8 }}>Languages</label>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {editProfile
                  ? GUIDE_LANGUAGES.map(l=><button key={l} onClick={async()=>{ const langs=(profile?.languages||[]).includes(l)?(profile.languages.filter(x=>x!==l)):[...(profile?.languages||[]),l]; await saveGuideProfile(user.uid,{languages:langs}); onProfileUpdate({...profile,languages:langs}); }}
                      style={{ padding:"5px 12px", borderRadius:20, border:`1.5px solid ${(profile?.languages||[]).includes(l)?C.teal:C.border}`, background:(profile?.languages||[]).includes(l)?C.tealLight:"#fff", color:(profile?.languages||[]).includes(l)?C.teal:C.inkSoft, fontSize:12, cursor:"pointer", fontFamily:sans }}>{l}</button>)
                  : (profile?.languages||[]).map(l=><Pill key={l}>{l}</Pill>)
                }
              </div>
            </div>

            <div style={{ marginTop:14 }}>
              <label style={{ fontSize:12, fontWeight:600, color:C.inkSoft, display:"block", marginBottom:8 }}>Specialties</label>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {editProfile
                  ? GUIDE_SPECIALTIES.map(s=><button key={s} onClick={async()=>{ const specs=(profile?.specialties||[]).includes(s)?(profile.specialties.filter(x=>x!==s)):[...(profile?.specialties||[]),s]; await saveGuideProfile(user.uid,{specialties:specs}); onProfileUpdate({...profile,specialties:specs}); }}
                      style={{ padding:"5px 12px", borderRadius:20, border:`1.5px solid ${(profile?.specialties||[]).includes(s)?C.teal:C.border}`, background:(profile?.specialties||[]).includes(s)?C.tealLight:"#fff", color:(profile?.specialties||[]).includes(s)?C.teal:C.inkSoft, fontSize:12, cursor:"pointer", fontFamily:sans }}>{s}</button>)
                  : (profile?.specialties||[]).map(s=><Pill key={s}>{s}</Pill>)
                }
              </div>
            </div>
          </div>
        )}

        {/* ── My Tours ── */}
        {activeTab==="tours" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:10 }}>
              <h2 style={{ fontFamily:serif, fontSize:20, fontWeight:700, color:C.ink }}>Completed Tours</h2>
              <Btn onClick={()=>setAddTour(t=>!t)}>+ Add tour</Btn>
            </div>

            {addingTour && (
              <div style={{ border:`1.5px solid ${C.teal}`, borderRadius:16, padding:"1.2rem", marginBottom:16, background:C.tealPale }}>
                <h4 style={{ fontFamily:serif, fontSize:16, fontWeight:700, color:C.ink, marginBottom:12 }}>Add completed tour</h4>
                {[["Tour title","title","text","e.g. 5-Day Beach Explorer"],["Location","location","text","e.g. Southern Coast"],["Date completed","date","date",""]].map(([l,k,t,ph])=>(
                  <div key={k} style={{ marginBottom:10 }}>
                    <label style={{ fontSize:12, fontWeight:600, color:C.inkSoft, display:"block", marginBottom:4 }}>{l}</label>
                    <input type={t} value={newTour[k]} onChange={e=>setNewTour(n=>({...n,[k]:e.target.value}))} placeholder={ph}
                      style={{ width:"100%", padding:"9px 12px", border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:13, fontFamily:sans, outline:"none", boxSizing:"border-box" }}/>
                  </div>
                ))}
                <label style={{ fontSize:12, fontWeight:600, color:C.inkSoft, display:"block", marginBottom:4 }}>Tourist rating (1–5)</label>
                <div style={{ display:"flex", gap:8, marginBottom:12 }}>
                  {[1,2,3,4,5].map(n=><button key={n} onClick={()=>setNewTour(t=>({...t,rating:n}))} style={{ width:36, height:36, borderRadius:"50%", border:`1.5px solid ${newTour.rating>=n?C.amber:C.border}`, background:newTour.rating>=n?C.amberLight:"#fff", color:newTour.rating>=n?C.amber:C.inkSoft, fontSize:16, cursor:"pointer" }}>★</button>)}
                </div>
                <div style={{ display:"flex", gap:10 }}>
                  <Btn onClick={addCompletedTour}>Save tour</Btn>
                  <Btn variant="outline" onClick={()=>setAddTour(false)}>Cancel</Btn>
                </div>
              </div>
            )}

            {(profile?.activeTours||[]).length===0 && !addingTour && (
              <div style={{ textAlign:"center", padding:"3rem", color:C.inkSoft }}>
                <div style={{ fontSize:40, marginBottom:12 }}>🗺️</div>
                <p>No completed tours yet. Add your first tour to build your portfolio!</p>
              </div>
            )}

            {(profile?.activeTours||[]).map((tour,i)=>(
              <div key={i} style={{ border:`1.5px solid ${C.border}`, borderRadius:14, padding:"1rem", marginBottom:10, background:C.white }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:C.ink, marginBottom:3 }}>{tour.title}</div>
                    <div style={{ fontSize:12, color:C.inkSoft }}>📍 {tour.location} · 📅 {tour.date}</div>
                  </div>
                  <div style={{ color:C.amberMid, fontSize:14 }}>{"★".repeat(tour.rating||5)}</div>
                </div>
                {tour.notes && <p style={{ fontSize:12, color:C.inkSoft, marginTop:8, lineHeight:1.5 }}>{tour.notes}</p>}
              </div>
            ))}
          </div>
        )}

        {/* ── Earnings ── */}
        {activeTab==="earnings" && (
          <div style={{ textAlign:"center", padding:"4rem 2rem" }}>
            <div style={{ fontSize:48, marginBottom:16 }}>💰</div>
            <h3 style={{ fontFamily:serif, fontSize:20, fontWeight:700, color:C.ink, marginBottom:8 }}>Earnings Dashboard</h3>
            <p style={{ fontSize:13, color:C.inkSoft, lineHeight:1.7, maxWidth:400, margin:"0 auto 24px" }}>
              Track your completed bookings and earnings here. Connect your payment account to receive direct payouts.
            </p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, maxWidth:500, margin:"0 auto" }}>
              {[["$0","This month"],["$0","Total earned"],[`${profile?.tripsCompleted||0}`,"Tours done"]].map(([v,l])=>(
                <div key={l} style={{ background:C.white, border:`1.5px solid ${C.border}`, borderRadius:14, padding:"1rem" }}>
                  <div style={{ fontFamily:serif, fontSize:22, fontWeight:700, color:C.teal }}>{v}</div>
                  <div style={{ fontSize:11, color:C.inkSoft, marginTop:4 }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:24, background:C.amberLight, border:`1px solid #F0D48A`, borderRadius:12, padding:"12px 16px", fontSize:12, color:C.amber, maxWidth:400, margin:"24px auto 0" }}>
              💡 Full earnings tracking and payouts coming soon. Contact support@ceylontrails.lk to set up direct payments.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TOURIST GUIDE REVIEW SYSTEM ─────────────────────────────────────────────
async function submitGuideReview(review) {
  if (!window.firebase?.firestore) return;
  await window.firebase.firestore().collection("guideReviews").add({
    ...review,
    status: "pending", // admin must approve before it shows
    createdAt: new Date().toISOString(),
  });
}
async function loadGuideReviews(status="pending") {
  if (!window.firebase?.firestore) return [];
  const snap = await window.firebase.firestore().collection("guideReviews")
    .where("status","==",status).orderBy("createdAt","desc").limit(50).get();
  return snap.docs.map(d=>({id:d.id,...d.data()}));
}
async function updateReviewStatus(reviewId, status) {
  await window.firebase.firestore().collection("guideReviews").doc(reviewId).update({ status });
  // If approved, also append to guide's profile reviews array
}

function GuideReviewModal({ onClose, user }) {
  const [form, setForm]     = useState({ guideName:"", tripRef:"", rating:5, title:"", body:"", touristName:"" });
  const [submitting, setSub]= useState(false);
  const [done, setDone]     = useState(false);
  const [errors, setErrors] = useState({});
  const upd = (k,v) => { setForm(f=>({...f,[k]:v})); setErrors(e=>({...e,[k]:null})); };

  const validate = () => {
    const e={};
    if (!form.guideName.trim())              e.guideName="Guide name is required";
    if (!form.tripRef.trim())                e.tripRef="Trip reference is required";
    if (form.body.trim().length < 20)        e.body="Review must be at least 20 characters";
    if (!form.title.trim())                  e.title="Title is required";
    if (!form.touristName.trim())            e.touristName="Your name is required";
    setErrors(e); return Object.keys(e).length===0;
  };

  const submit = async () => {
    if (!validate()) return;
    setSub(true);
    try {
      await submitGuideReview({ ...form, touristEmail:user?.email||"anonymous", touristUid:user?.uid||"" });
      setDone(true);
    } catch(e) { alert("Error submitting review: "+e.message); }
    setSub(false);
  };

  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.6)", zIndex:900, display:"flex", alignItems:"center", justifyContent:"center", padding:16, backdropFilter:"blur(6px)" }}>
      <div style={{ background:"#fff", borderRadius:24, width:"100%", maxWidth:480, boxShadow:"0 20px 60px rgba(0,0,0,.25)", overflow:"hidden", maxHeight:"90vh", display:"flex", flexDirection:"column" }}>
        {/* Header */}
        <div style={{ background:`linear-gradient(135deg,${C.teal},#147856)`, padding:"1.2rem 1.4rem", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <div>
            <div style={{ fontFamily:serif, fontSize:17, fontWeight:700, color:"#fff" }}>Review a Guide</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,.75)", marginTop:2 }}>Your review helps other tourists choose the right guide</div>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:"50%", border:"1px solid rgba(255,255,255,.3)", background:"rgba(255,255,255,.1)", color:"#fff", fontSize:16, cursor:"pointer" }}>✕</button>
        </div>

        {done ? (
          <div style={{ padding:"2rem", textAlign:"center" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
            <h3 style={{ fontFamily:serif, fontSize:20, fontWeight:700, color:C.ink, marginBottom:8 }}>Review submitted!</h3>
            <p style={{ fontSize:13, color:C.inkSoft, lineHeight:1.7, marginBottom:20 }}>Thank you. Our admin team will verify your review against the trip records within 24 hours before it goes live.</p>
            <Btn onClick={onClose}>Close</Btn>
          </div>
        ) : (
          <div style={{ padding:"1.2rem 1.4rem", overflowY:"auto", flex:1 }}>
            {/* Star rating */}
            <div style={{ marginBottom:16, textAlign:"center" }}>
              <label style={{ fontSize:12, fontWeight:600, color:C.inkSoft, display:"block", marginBottom:8 }}>Overall rating</label>
              <div style={{ display:"flex", justifyContent:"center", gap:8 }}>
                {[1,2,3,4,5].map(n=>(
                  <button key={n} onClick={()=>upd("rating",n)} style={{ fontSize:28, background:"none", border:"none", cursor:"pointer", transform:form.rating>=n?"scale(1.2)":"scale(1)", transition:"transform .15s" }}>
                    {form.rating>=n?"⭐":"☆"}
                  </button>
                ))}
              </div>
              <div style={{ fontSize:12, color:C.inkSoft, marginTop:4 }}>
                {["","Poor","Below average","Average","Good","Excellent"][form.rating]}
              </div>
            </div>

            {/* Fields */}
            {[
              ["Your name","touristName","text","e.g. John Smith"],
              ["Guide name","guideName","text","Full name of the guide"],
              ["Trip reference / booking number","tripRef","text","e.g. CT-2024-001 or your itinerary title"],
              ["Review title","title","text","e.g. Amazing cultural tour!"],
            ].map(([label,key,type,ph])=>(
              <div key={key} style={{ marginBottom:12 }}>
                <label style={{ fontSize:12, fontWeight:600, color:C.ink, display:"block", marginBottom:4 }}>
                  {label} <span style={{ color:C.coral }}>*</span>
                </label>
                <input type={type} value={form[key]} onChange={e=>upd(key,e.target.value)} placeholder={ph}
                  style={{ width:"100%", padding:"10px 12px", border:`1.5px solid ${errors[key]?C.coral:C.border}`, borderRadius:10, fontSize:13, fontFamily:sans, outline:"none", boxSizing:"border-box" }}/>
                {errors[key] && <div style={{ fontSize:11, color:C.coral, marginTop:3 }}>⚠️ {errors[key]}</div>}
              </div>
            ))}
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:12, fontWeight:600, color:C.ink, display:"block", marginBottom:4 }}>
                Your experience <span style={{ color:C.coral }}>*</span>
                <span style={{ fontWeight:400, color:C.inkSoft, marginLeft:8 }}>({form.body.length}/20 min)</span>
              </label>
              <textarea value={form.body} onChange={e=>upd("body",e.target.value)} rows={4} placeholder="Describe your experience with this guide in detail..."
                style={{ width:"100%", padding:"10px 12px", border:`1.5px solid ${errors.body?C.coral:C.border}`, borderRadius:10, fontSize:13, fontFamily:sans, outline:"none", resize:"vertical", boxSizing:"border-box" }}/>
              {errors.body && <div style={{ fontSize:11, color:C.coral, marginTop:3 }}>⚠️ {errors.body}</div>}
            </div>

            <div style={{ background:C.amberLight, border:`1px solid #F0D48A`, borderRadius:10, padding:"10px 12px", fontSize:11, color:C.amber, marginBottom:16, lineHeight:1.6 }}>
              ⚠️ Reviews are moderated. Our admin team verifies trip records before publishing. False reviews will be removed.
            </div>

            <button onClick={submit} disabled={submitting} style={{ width:"100%", padding:"13px", background:C.teal, color:"#fff", border:"none", borderRadius:12, fontSize:14, fontWeight:700, cursor:submitting?"wait":"pointer", fontFamily:sans, opacity:submitting?.6:1 }}>
              {submitting?"Submitting…":"Submit review"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ADMIN PANEL ──────────────────────────────────────────────────────────────
function AdminPanel({ onClose }) {
  const ADMIN_PWD = import.meta.env.VITE_ADMIN_PASSWORD || "ceylontrails2024";
  const [authed,    setAuthed]  = useState(()=>sessionStorage.getItem("ct_admin")==="1");
  const [pwd,       setPwd]     = useState("");
  const [guides,    setGuides]  = useState([]);
  const [reviews,   setReviews] = useState([]);
  const [loading,   setLoading] = useState(false);
  const [selected,  setSelected]= useState(null);
  const [filterTab, setFilter]  = useState("pending");
  const [rejMsg,    setRejMsg]  = useState("");
  const [actioning, setActioning]=useState(false);

  const loadReviews = async () => {
    try {
      if (!window.firebase?.firestore) {
        await loadScript("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js");
      }
      const [pending, approved] = await Promise.all([
        loadGuideReviews("pending"),
        loadGuideReviews("approved"),
      ]);
      setReviews([...pending, ...approved]);
    } catch(e) { console.warn("Reviews load failed:", e.message); }
  };

  const login = () => {
    if (pwd===ADMIN_PWD){ sessionStorage.setItem("ct_admin","1"); setAuthed(true); loadGuides(); }
    else alert("Incorrect password");
  };

  const loadGuides = async () => {
    setLoading(true);
    try {
      if (!window.firebase?.firestore) {
        await loadScript("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js");
      }
      const snap = await window.firebase.firestore().collection("guides").orderBy("registeredAt","desc").get();
      setGuides(snap.docs.map(d=>({id:d.id,...d.data()})));
    } catch(e) { alert("Error loading guides: "+e.message); }
    setLoading(false);
  };

  useEffect(()=>{ if(authed) loadGuides(); },[authed]);

  const approve = async (guide) => {
    setActioning(true);
    await window.firebase.firestore().collection("guides").doc(guide.uid).update({ status:"approved", approvedAt:new Date().toISOString() });
    setGuides(gs=>gs.map(g=>g.uid===guide.uid?{...g,status:"approved"}:g));
    setSelected(s=>s?{...s,status:"approved"}:s);
    setActioning(false);
  };

  const reject = async (guide) => {
    if (!rejMsg.trim()) { alert("Please enter a reason for rejection"); return; }
    setActioning(true);
    await window.firebase.firestore().collection("guides").doc(guide.uid).update({ status:"rejected", rejectedAt:new Date().toISOString(), rejectionReason:rejMsg });
    setGuides(gs=>gs.map(g=>g.uid===guide.uid?{...g,status:"rejected",rejectionReason:rejMsg}:g));
    setSelected(s=>s?{...s,status:"rejected"}:s);
    setRejMsg(""); setActioning(false);
  };

  const statusColor = { pending:C.amber, approved:C.teal, rejected:C.coral };
  const filtered = guides.filter(g=>g.status===filterTab);

  if (!authed) return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.7)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16, backdropFilter:"blur(8px)" }}>
      <div style={{ background:"#fff", borderRadius:20, padding:"2rem", width:"100%", maxWidth:380, textAlign:"center", boxShadow:"0 20px 60px rgba(0,0,0,.3)" }}>
        <div style={{ fontSize:36, marginBottom:12 }}>🔐</div>
        <h2 style={{ fontFamily:serif, fontSize:20, fontWeight:700, color:C.ink, marginBottom:4 }}>Admin Panel</h2>
        <p style={{ fontSize:13, color:C.inkSoft, marginBottom:20 }}>CeylonTrails Guide Management</p>
        <input type="password" value={pwd} onChange={e=>setPwd(e.target.value)} placeholder="Admin password"
          onKeyDown={e=>e.key==="Enter"&&login()}
          style={{ width:"100%", padding:"12px 14px", border:`1.5px solid ${C.border}`, borderRadius:10, fontSize:14, fontFamily:sans, outline:"none", marginBottom:12, boxSizing:"border-box" }}/>
        <Btn full onClick={login}>Enter Admin Panel</Btn>
        <button onClick={onClose} style={{ marginTop:10, width:"100%", padding:"10px", background:"none", border:"none", fontSize:13, color:C.inkSoft, cursor:"pointer", fontFamily:sans }}>Cancel</button>
      </div>
    </div>
  );

  return (
    <div style={{ position:"fixed", inset:0, background:"#F0F4F8", zIndex:1000, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      {/* Header */}
      <div style={{ background:`linear-gradient(135deg,#1A2A3A,#2D4A6A)`, padding:"14px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:22 }}>🔐</span>
          <div>
            <div style={{ fontFamily:serif, fontSize:16, fontWeight:700, color:"#fff" }}>CeylonTrails Admin</div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,.6)" }}>Guide Management Panel</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={loadGuides} style={{ padding:"7px 14px", background:"rgba(255,255,255,.1)", color:"#fff", border:"1px solid rgba(255,255,255,.25)", borderRadius:8, fontSize:12, cursor:"pointer", fontFamily:sans }}>↺ Refresh</button>
          <button onClick={()=>{ sessionStorage.removeItem("ct_admin"); onClose(); }} style={{ padding:"7px 14px", background:"rgba(255,255,255,.1)", color:"#fff", border:"1px solid rgba(255,255,255,.25)", borderRadius:8, fontSize:12, cursor:"pointer", fontFamily:sans }}>✕ Close</button>
        </div>
      </div>

      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
        {/* Left: guide list */}
        <div style={{ width:320, background:"#fff", borderRight:"1px solid #E0E6ED", display:"flex", flexDirection:"column", flexShrink:0 }}>
          {/* Filter tabs */}
          <div style={{ display:"flex", borderBottom:"1px solid #E0E6ED", overflowX:"auto" }}>
            {["pending","approved","rejected","reviews"].map(s=>(
              <button key={s} onClick={()=>{ setFilter(s); if(s==="reviews") loadReviews(); }} style={{ flex:1, padding:"12px 8px", border:"none", background:filterTab===s?"#EEF4FF":"transparent", color:filterTab===s?"#2D4A6A":"#64748B", fontSize:11, fontWeight:filterTab===s?700:400, cursor:"pointer", fontFamily:sans, borderBottom:filterTab===s?"2.5px solid #2D4A6A":"2.5px solid transparent", textTransform:"capitalize", whiteSpace:"nowrap" }}>
                {s==="reviews"?"📝 Reviews":s} <span style={{ background:filterTab===s?"#2D4A6A":"#E2E8F0", color:filterTab===s?"#fff":"#64748B", fontSize:10, fontWeight:700, padding:"1px 6px", borderRadius:10, marginLeft:4 }}>
                  {s==="reviews" ? reviews.length : guides.filter(g=>g.status===s).length}
                </span>
              </button>
            ))}
          </div>

          {/* Guide or Review list */}
          <div style={{ flex:1, overflowY:"auto" }}>
            {loading && <div style={{ padding:"2rem", textAlign:"center", color:"#64748B", fontSize:13 }}>Loading…</div>}

            {/* Reviews tab */}
            {filterTab==="reviews" && reviews.map(r=>(
              <div key={r.id} style={{ padding:"12px 14px", borderBottom:"1px solid #F0F4F8", cursor:"pointer", background:selected?.id===r.id?"#EEF4FF":"transparent" }}
                onClick={()=>setSelected({...r, _isReview:true})}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:"#1A2A3A", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.title||"Review"}</div>
                  <span style={{ fontSize:10, padding:"2px 8px", borderRadius:20, background:r.status==="approved"?"#DCFCE7":"#FEF9C3", color:r.status==="approved"?"#16A34A":"#CA8A04", fontWeight:700, flexShrink:0, marginLeft:6 }}>{r.status}</span>
                </div>
                <div style={{ fontSize:11, color:"#64748B" }}>Guide: {r.guideName} · Trip: {r.tripRef}</div>
                <div style={{ fontSize:11, color:"#64748B", marginTop:2 }}>By: {r.touristName} · {"⭐".repeat(r.rating)}</div>
              </div>
            ))}
            {filterTab==="reviews" && reviews.length===0 && <div style={{ padding:"2rem", textAlign:"center", color:"#64748B", fontSize:13 }}>No reviews yet</div>}

            {/* Guides list */}
            {filterTab!=="reviews" && !loading && filtered.length===0 && <div style={{ padding:"2rem", textAlign:"center", color:"#64748B", fontSize:13 }}>No {filterTab} guides</div>}
            {filterTab!=="reviews" && filtered.map(g=>(
              <div key={g.uid} onClick={()=>setSelected(g)} style={{ padding:"14px 16px", borderBottom:"1px solid #F0F4F8", cursor:"pointer", background:selected?.uid===g.uid?"#EEF4FF":"transparent", transition:"background .15s" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:40, height:40, borderRadius:"50%", overflow:"hidden", flexShrink:0, background:"#E2E8F0" }}>
                    {g.photo ? <img src={g.photo} alt={g.fullName} style={{ width:"100%", height:"100%", objectFit:"cover" }}/> : <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>👤</div>}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:"#1A2A3A", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{g.fullName}</div>
                    <div style={{ fontSize:11, color:"#64748B", marginTop:1 }}>{g.email}</div>
                    <div style={{ fontSize:10, color:"#64748B", marginTop:2 }}>Registered: {g.registeredAt?new Date(g.registeredAt).toLocaleDateString():"—"}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: guide or review detail */}
        <div style={{ flex:1, overflowY:"auto", padding:"1.5rem" }}>
          {!selected ? (
            <div style={{ height:"100%", display:"flex", alignItems:"center", justifyContent:"center", color:"#94A3B8", flexDirection:"column", gap:12 }}>
              <span style={{ fontSize:48 }}>👈</span>
              <p style={{ fontSize:14 }}>Select an item to review</p>
            </div>
          ) : selected._isReview ? (
            /* ── Review detail ── */
            <div style={{ maxWidth:600 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:10 }}>
                <h2 style={{ fontFamily:serif, fontSize:20, fontWeight:700, color:"#1A2A3A" }}>{selected.title}</h2>
                <span style={{ fontSize:12, padding:"5px 14px", borderRadius:20, background:selected.status==="approved"?"#DCFCE7":"#FEF9C3", color:selected.status==="approved"?"#16A34A":"#CA8A04", fontWeight:700, border:`1px solid ${selected.status==="approved"?"#86EFAC":"#FDE047"}` }}>{selected.status}</span>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
                {[["Tourist",selected.touristName],["Email",selected.touristEmail],["Guide",selected.guideName],["Trip Ref",selected.tripRef],["Rating","⭐".repeat(selected.rating)],["Submitted",selected.createdAt?new Date(selected.createdAt).toLocaleDateString():"—"]].map(([l,v])=>(
                  <div key={l} style={{ background:"#fff", borderRadius:10, padding:"10px 14px", border:"1px solid #E0E6ED" }}>
                    <div style={{ fontSize:11, color:"#64748B", marginBottom:3, fontWeight:600 }}>{l}</div>
                    <div style={{ fontSize:13, fontWeight:600, color:"#1A2A3A" }}>{v||"—"}</div>
                  </div>
                ))}
              </div>
              <div style={{ background:"#fff", borderRadius:12, padding:"14px", border:"1px solid #E0E6ED", marginBottom:20 }}>
                <div style={{ fontSize:12, fontWeight:600, color:"#64748B", marginBottom:8 }}>Review content</div>
                <p style={{ fontSize:13, color:"#1A2A3A", lineHeight:1.7 }}>{selected.body}</p>
              </div>
              <div style={{ background:"#FEF9C3", border:"1px solid #FDE047", borderRadius:12, padding:"12px 14px", marginBottom:16, fontSize:12, color:"#92400E", lineHeight:1.6 }}>
                ⚠️ <strong>Verify before approving:</strong> Check that trip reference "{selected.tripRef}" matches actual booking records. The guide "{selected.guideName}" should confirm this tour took place.
              </div>
              <div style={{ display:"flex", gap:10 }}>
                {selected.status!=="approved" && (
                  <button onClick={async()=>{ setActioning(true); await updateReviewStatus(selected.id,"approved"); setReviews(rs=>rs.map(r=>r.id===selected.id?{...r,status:"approved"}:r)); setSelected(s=>({...s,status:"approved"})); setActioning(false); }} disabled={actioning}
                    style={{ flex:1, padding:"12px", background:"#16A34A", color:"#fff", border:"none", borderRadius:10, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:sans, opacity:actioning?.6:1 }}>
                    ✅ Approve & Publish
                  </button>
                )}
                <button onClick={async()=>{ if(!window.confirm("Delete this review permanently?")) return; setActioning(true); await window.firebase.firestore().collection("guideReviews").doc(selected.id).delete(); setReviews(rs=>rs.filter(r=>r.id!==selected.id)); setSelected(null); setActioning(false); }} disabled={actioning}
                  style={{ flex:1, padding:"12px", background:"#DC2626", color:"#fff", border:"none", borderRadius:10, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:sans, opacity:actioning?.6:1 }}>
                  🗑️ Delete Review
                </button>
              </div>
            </div>
          ) : (
            <div style={{ maxWidth:700 }}>
              {/* Status badge */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:12 }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:64, height:64, borderRadius:"50%", overflow:"hidden", border:"2px solid #E0E6ED", flexShrink:0 }}>
                    {selected.photo ? <img src={selected.photo} alt={selected.fullName} style={{ width:"100%", height:"100%", objectFit:"cover" }}/> : <div style={{ width:"100%", height:"100%", background:"#E2E8F0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>👤</div>}
                  </div>
                  <div>
                    <div style={{ fontFamily:serif, fontSize:20, fontWeight:700, color:"#1A2A3A" }}>{selected.fullName}</div>
                    <div style={{ fontSize:13, color:"#64748B" }}>{selected.email}</div>
                  </div>
                </div>
                <span style={{ fontSize:12, fontWeight:700, padding:"6px 16px", borderRadius:20, background:statusColor[selected.status]+"22", color:statusColor[selected.status], border:`1.5px solid ${statusColor[selected.status]}44`, textTransform:"capitalize" }}>
                  {selected.status}
                </span>
              </div>

              {/* Details grid */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
                {[
                  ["Phone", selected.phone],
                  ["NIC", selected.nic],
                  ["Address", selected.address],
                  ["SLTDA No", selected.sltdaNo],
                  ["Experience", `${selected.experience} years`],
                  ["Registered", selected.registeredAt?new Date(selected.registeredAt).toLocaleString():"—"],
                ].map(([l,v])=>(
                  <div key={l} style={{ background:"#fff", borderRadius:10, padding:"10px 14px", border:"1px solid #E0E6ED" }}>
                    <div style={{ fontSize:11, color:"#64748B", marginBottom:3, fontWeight:600 }}>{l}</div>
                    <div style={{ fontSize:13, fontWeight:600, color:"#1A2A3A" }}>{v||"—"}</div>
                  </div>
                ))}
              </div>

              {/* Languages & Specialties */}
              {[["Languages",selected.languages],["Specialties",selected.specialties],["Areas",selected.areas]].map(([l,arr])=>arr?.length>0&&(
                <div key={l} style={{ marginBottom:14 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:"#64748B", marginBottom:6 }}>{l}</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {(arr||[]).map(x=><span key={x} style={{ fontSize:11, padding:"3px 10px", borderRadius:20, background:"#EEF4FF", color:"#2D4A6A", fontWeight:600 }}>{x}</span>)}
                  </div>
                </div>
              ))}

              {/* Bio */}
              {selected.bio && (
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:"#64748B", marginBottom:6 }}>Bio</div>
                  <div style={{ background:"#fff", borderRadius:10, padding:"12px 14px", border:"1px solid #E0E6ED", fontSize:13, color:"#1A2A3A", lineHeight:1.65 }}>{selected.bio}</div>
                </div>
              )}

              {/* SLTDA Licence document */}
              {selected.licenceDoc && (
                <div style={{ marginBottom:20 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:"#64748B", marginBottom:6 }}>SLTDA Licence Document</div>
                  {selected.licenceDocName?.endsWith(".pdf")
                    ? <a href={selected.licenceDoc} download={selected.licenceDocName} style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"10px 16px", background:"#EEF4FF", borderRadius:10, color:"#2D4A6A", textDecoration:"none", fontSize:13, fontWeight:600 }}>📄 {selected.licenceDocName} — Download</a>
                    : <img src={selected.licenceDoc} alt="SLTDA Licence" style={{ maxWidth:"100%", borderRadius:10, border:"1px solid #E0E6ED", maxHeight:300, objectFit:"contain" }}/>
                  }
                </div>
              )}

              {/* Action buttons */}
              {selected.status==="pending" && (
                <div style={{ background:"#fff", borderRadius:14, padding:"1.2rem", border:"1px solid #E0E6ED" }}>
                  <h4 style={{ fontSize:14, fontWeight:700, color:"#1A2A3A", marginBottom:14 }}>Review Decision</h4>
                  <div style={{ display:"flex", gap:10, marginBottom:14, flexWrap:"wrap" }}>
                    <button onClick={()=>approve(selected)} disabled={actioning} style={{ flex:1, padding:"12px", background:"#16A34A", color:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:sans, opacity:actioning?.6:1, minWidth:120 }}>
                      ✅ Approve Guide
                    </button>
                  </div>
                  <div>
                    <label style={{ fontSize:12, fontWeight:600, color:"#64748B", display:"block", marginBottom:6 }}>Rejection reason (required to reject)</label>
                    <textarea value={rejMsg} onChange={e=>setRejMsg(e.target.value)} rows={2} placeholder="e.g. SLTDA licence could not be verified. Please reapply with a clearer document."
                      style={{ width:"100%", padding:"10px 12px", border:"1.5px solid #E0E6ED", borderRadius:8, fontSize:13, fontFamily:sans, outline:"none", resize:"vertical", boxSizing:"border-box", marginBottom:8 }}/>
                    <button onClick={()=>reject(selected)} disabled={actioning||!rejMsg.trim()} style={{ width:"100%", padding:"12px", background:"#DC2626", color:"#fff", border:"none", borderRadius:10, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:sans, opacity:actioning||!rejMsg.trim()?.5:1 }}>
                      ❌ Reject Application
                    </button>
                  </div>
                </div>
              )}

              {selected.status==="approved" && (
                <div style={{ background:"#F0FDF4", border:"1.5px solid #86EFAC", borderRadius:12, padding:"14px", textAlign:"center", fontSize:13, color:"#16A34A", fontWeight:600 }}>
                  ✅ This guide is approved · Active on platform since {selected.approvedAt?new Date(selected.approvedAt).toLocaleDateString():"—"}
                </div>
              )}

              {selected.status==="rejected" && (
                <div style={{ background:"#FEF2F2", border:"1.5px solid #FECACA", borderRadius:12, padding:"14px" }}>
                  <div style={{ fontSize:13, fontWeight:700, color:"#DC2626", marginBottom:4 }}>❌ Application Rejected</div>
                  <div style={{ fontSize:12, color:"#64748B" }}>Reason: {selected.rejectionReason||"No reason given"}</div>
                  <button onClick={()=>approve(selected)} style={{ marginTop:10, padding:"8px 16px", background:"#16A34A", color:"#fff", border:"none", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:sans }}>Override — Approve</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── GUIDE PORTAL PAGE ────────────────────────────────────────────────────────
function GuidePortalPage({ setPage }) {
  const { user, signInEmail, signUpEmail, signInGoogle } = useAuth();
  const [guideProfile, setGuideProfile] = useState(null);
  const [loading, setLoading]           = useState(true);
  const [mode, setMode]                 = useState("signin");
  const [email, setEmail]               = useState("");
  const [pass, setPass]                 = useState("");
  const [error, setError]               = useState("");
  const [authLoading, setAL]            = useState(false);

  // Load guide profile if logged in
  useEffect(()=>{
    if (!user) { setLoading(false); return; }
    // Load Firestore SDK
    const loadFirestore = async () => {
      if (!window.firebase.firestore) {
        await new Promise((res,rej)=>{ const s=document.createElement("script"); s.src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"; s.onload=res; s.onerror=rej; document.head.appendChild(s); });
      }
      const p = await getGuideProfile(user.uid);
      setGuideProfile(p);
      setLoading(false);
    };
    loadFirestore().catch(()=>setLoading(false));
  },[user]);

  const handleAuth = async (fn) => {
    setAL(true); setError("");
    try { await fn(); } catch(e) { setError(e.message.replace("Firebase: ","").replace(/\(auth\/.*\)/,"")); }
    setAL(false);
  };

  if (loading) return (
    <div style={{ minHeight:"60vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:40, height:40, border:`3px solid ${C.tealLight}`, borderTopColor:C.teal, borderRadius:"50%", animation:"spin .8s linear infinite" }}/>
    </div>
  );

  // Not logged in — show guide login
  if (!user) return (
    <div style={{ minHeight:"80vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem", background:C.surface }}>
      <div style={{ background:"#fff", borderRadius:24, width:"100%", maxWidth:420, overflow:"hidden", boxShadow:"0 8px 40px rgba(0,0,0,.12)" }}>
        <div style={{ background:`linear-gradient(135deg,${C.teal},#147856)`, padding:"2rem", textAlign:"center" }}>
          <div style={{ fontSize:36, marginBottom:8 }}>🧭</div>
          <div style={{ fontFamily:serif, fontSize:22, fontWeight:700, color:"#fff", marginBottom:4 }}>Guide Portal</div>
          <div style={{ fontSize:13, color:"rgba(255,255,255,.75)" }}>CeylonTrails — For certified guides</div>
        </div>
        <div style={{ padding:"1.5rem" }}>
          <button onClick={()=>handleAuth(signInGoogle)} style={{ width:"100%", padding:"12px", border:`1.5px solid ${C.border}`, borderRadius:12, background:"#fff", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:sans, display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginBottom:16 }}>
            <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/></svg>
            Continue with Google
          </button>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}><div style={{ flex:1, height:1, background:C.border }}/><span style={{ fontSize:12, color:C.inkSoft }}>or</span><div style={{ flex:1, height:1, background:C.border }}/></div>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Guide email" type="email"
            style={{ width:"100%", padding:"11px 14px", border:`1.5px solid ${C.border}`, borderRadius:10, fontSize:14, fontFamily:sans, marginBottom:10, outline:"none", boxSizing:"border-box" }}/>
          <input value={pass} onChange={e=>setPass(e.target.value)} placeholder="Password" type="password"
            style={{ width:"100%", padding:"11px 14px", border:`1.5px solid ${C.border}`, borderRadius:10, fontSize:14, fontFamily:sans, marginBottom:14, outline:"none", boxSizing:"border-box" }}/>
          {error && <div style={{ background:C.coralLight, border:`1px solid #EFBAA8`, borderRadius:10, padding:"8px 12px", fontSize:12, color:C.coral, marginBottom:12 }}>{error}</div>}
          <button onClick={()=>handleAuth(mode==="signin"?()=>signInEmail(email,pass):()=>signUpEmail(email,pass))} disabled={authLoading||!email||!pass}
            style={{ width:"100%", padding:"13px", background:C.teal, color:"#fff", border:"none", borderRadius:12, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:sans, opacity:authLoading?.6:1, marginBottom:12 }}>
            {authLoading?"Please wait…":mode==="signin"?"Sign in to Guide Portal":"Create guide account"}
          </button>
          <div style={{ textAlign:"center", fontSize:13, color:C.inkSoft }}>
            {mode==="signin"?<>New guide? <span onClick={()=>{setMode("signup");setError("");}} style={{ color:C.teal, fontWeight:600, cursor:"pointer" }}>Register here</span></>:<>Have an account? <span onClick={()=>{setMode("signin");setError("");}} style={{ color:C.teal, fontWeight:600, cursor:"pointer" }}>Sign in</span></>}
          </div>
        </div>
      </div>
    </div>
  );

  // Logged in but no profile — show registration
  if (!guideProfile) return (
    <div style={{ minHeight:"100vh", background:C.surface }}>
      <div style={{ background:`linear-gradient(135deg,${C.teal},#147856)`, padding:"2rem", textAlign:"center" }}>
        <div style={{ fontSize:11, color:"rgba(255,255,255,.6)", textTransform:"uppercase", letterSpacing:2, marginBottom:8 }}>Guide Registration</div>
        <h1 style={{ fontFamily:serif, fontSize:"clamp(24px,4vw,36px)", fontWeight:700, color:"#fff", marginBottom:8 }}>Apply to become a CeylonTrails Guide</h1>
        <p style={{ fontSize:14, color:"rgba(255,255,255,.75)", maxWidth:500, margin:"0 auto" }}>Complete your profile to start receiving trip requests from tourists across the world.</p>
      </div>
      <GuideRegister user={user} onComplete={async()=>{ const p = await getGuideProfile(user.uid); setGuideProfile(p); }}/>
    </div>
  );

  // Pending approval
  if (guideProfile.status==="pending") return (
    <div style={{ minHeight:"80vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem" }}>
      <div style={{ textAlign:"center", maxWidth:480 }}>
        <div style={{ width:80, height:80, borderRadius:"50%", background:C.amberLight, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", fontSize:36 }}>⏳</div>
        <h2 style={{ fontFamily:serif, fontSize:24, fontWeight:700, color:C.ink, marginBottom:12 }}>Application under review</h2>
        <p style={{ fontSize:14, color:C.inkSoft, lineHeight:1.8, marginBottom:20 }}>
          Thank you, <strong>{guideProfile.fullName}</strong>! Your application has been submitted.<br/>
          Our team will verify your SLTDA credentials and send you an email within <strong>2–3 business days</strong>.
        </p>
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:"1rem", textAlign:"left" }}>
          {[["SLTDA No", guideProfile.sltdaNo],["Experience", `${guideProfile.experience} years`],["Specialties", guideProfile.specialties?.join(", ")||"—"],["Languages", guideProfile.languages?.join(", ")||"—"]].map(([l,v])=>(
            <div key={l} style={{ display:"flex", gap:12, padding:"6px 0", borderBottom:`1px solid ${C.border}`, fontSize:13 }}>
              <span style={{ color:C.inkSoft, minWidth:100 }}>{l}</span>
              <span style={{ fontWeight:600, color:C.ink }}>{v}</span>
            </div>
          ))}
        </div>
        <button onClick={()=>setGuideProfile(null)} style={{ marginTop:16, padding:"10px 24px", background:"none", border:`1px solid ${C.border}`, borderRadius:10, fontSize:13, color:C.inkSoft, cursor:"pointer", fontFamily:sans }}>Edit application</button>
      </div>
    </div>
  );

  // Approved — full dashboard
  return <GuideDashboard user={user} profile={guideProfile} onProfileUpdate={setGuideProfile}/>;
}

export default function App() {
  const [page, setPage]         = useState("home");
  const [guideOpen, setGuide]   = useState(false);
  const [savedItin, setSaved]   = useState(null);
  const [showLogin, setLogin]   = useState(false);
  const [showWelcome, setWelcome] = useState(false);
  const [welcomeUser, setWelcomeUser] = useState(null);
  const openGuide = useCallback(()=>setGuide(true), []);
  const wishlist  = useWishlist();

  const handleLoginSuccess = (user) => {
    setLogin(false);
    setWelcomeUser(user);
    setWelcome(true);
  };

  return (
    <AuthProvider>
      <AppInner
        page={page} setPage={setPage}
        guideOpen={guideOpen} setGuide={setGuide} openGuide={openGuide}
        savedItin={savedItin} setSaved={setSaved}
        showLogin={showLogin} setLogin={setLogin}
        showWelcome={showWelcome} setWelcome={setWelcome}
        welcomeUser={welcomeUser} setWelcomeUser={setWelcomeUser}
        handleLoginSuccess={handleLoginSuccess}
        wishlist={wishlist}
      />
    </AuthProvider>
  );
}

function AppInner({ page, setPage, guideOpen, setGuide, openGuide, savedItin, setSaved, showLogin, setLogin, showWelcome, setWelcome, welcomeUser, handleLoginSuccess, wishlist }) {
  const { user, signOut } = useAuth();
  const premium = usePremium();
  const [showAdmin,  setShowAdmin]  = useState(()=>window.location.search.includes("admin"));
  const [showReview, setShowReview] = useState(false);

  useEffect(()=>{
    const check = () => setShowAdmin(window.location.search.includes("admin"));
    window.addEventListener("popstate", check);
    return ()=>window.removeEventListener("popstate", check);
  },[]);

  return (
    <div style={{ fontFamily:sans, color:C.ink, background:C.white, minHeight:"100vh" }}>
      <MobileStyles/>
      <NavWithAuth page={page} setPage={setPage} onGuideOpen={openGuide} user={user} signOut={signOut} onLoginClick={()=>setLogin(true)}/>

      {page==="home"         && <HomePage         setPage={setPage} onGuideOpen={openGuide}/>}
      {page==="destinations" && <DestinationsPage setPage={setPage} onGuideOpen={openGuide} savedItin={savedItin} setSavedItin={setSaved}/>}
      {page==="journey"      && <JourneyPage      setPage={setPage} savedItin={savedItin} setSavedItin={setSaved} onGuideOpen={openGuide} user={user} onLoginNeeded={()=>setLogin(true)} premium={premium}/>}
      {page==="srilankamap" && <SriLankaMapPage  setPage={setPage}/>}
      {page==="guideportal"  && <GuidePortalPage  setPage={setPage}/>}

      <GuideDrawer open={guideOpen} onClose={()=>setGuide(false)} itin={savedItin} user={user} onLoginNeeded={()=>setLogin(true)}/>
      <WishlistPanel wishlist={wishlist} savedItin={savedItin} setSavedItin={setSaved}/>
      <EmergencyButton/>

      {/* Floating "Review a guide" button */}
      <button onClick={()=>setShowReview(true)} style={{ position:"fixed", bottom:90, right:24, zIndex:490, background:C.teal, color:"#fff", border:"none", borderRadius:20, padding:"8px 14px", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:sans, boxShadow:"0 2px 12px rgba(0,0,0,.2)", display:"flex", alignItems:"center", gap:6 }}>
        ⭐ Review a guide
      </button>

      {showLogin  && <LoginModal onClose={()=>setLogin(false)} onSuccess={handleLoginSuccess}/>}
      {showWelcome && <WelcomeToast user={welcomeUser} onDone={()=>setWelcome(false)}/>}
      {showReview && <GuideReviewModal onClose={()=>setShowReview(false)} user={user}/>}
      {showAdmin  && <AdminPanel onClose={()=>{ setShowAdmin(false); window.history.replaceState({},"",window.location.pathname); }}/>}
    </div>
  );
}
