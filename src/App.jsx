import React, { useState, useEffect, useCallback, useRef } from "react";

// ─── INLINE LINE ICONS ────────────────────────────────────────────────────────
// Hand-drawn instead of pulled from a package — this removes the lucide-react
// dependency entirely so a deploy can never fail because a new package didn't
// make it into package-lock.json. Same simple call signature (size prop) as
// the icon library it replaces, so nothing else in the file needs to change.
const iconBase = { viewBox:"0 0 24 24", fill:"none", stroke:"currentColor", strokeWidth:2, strokeLinecap:"round", strokeLinejoin:"round" };
function MapPin({ size=16, ...p }) { return <svg width={size} height={size} {...iconBase} {...p}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0116 0z"/><circle cx="12" cy="10" r="3"/></svg>; }
function Compass({ size=16, ...p }) { return <svg width={size} height={size} {...iconBase} {...p}><circle cx="12" cy="12" r="10"/><path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"/></svg>; }
function Sparkles({ size=16, ...p }) { return <svg width={size} height={size} {...iconBase} {...p}><path d="M12 3v4M12 17v4M5 5l2.5 2.5M16.5 16.5L19 19M3 12h4M17 12h4M5 19l2.5-2.5M16.5 7.5L19 5"/></svg>; }
function ShieldCheck({ size=16, ...p }) { return <svg width={size} height={size} {...iconBase} {...p}><path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3z"/><path d="M9 12l2 2 4-4"/></svg>; }
function Users({ size=16, ...p }) { return <svg width={size} height={size} {...iconBase} {...p}><circle cx="9" cy="8" r="3.2"/><path d="M2.5 20c0-3.6 2.9-6.2 6.5-6.2s6.5 2.6 6.5 6.2"/><path d="M16.2 4.3a3.2 3.2 0 010 6.2"/><path d="M18 13.9c2.6.5 4.5 2.7 4.5 5.9"/></svg>; }
function Star({ size=16, ...p }) { return <svg width={size} height={size} {...iconBase} fill="currentColor" stroke="none" {...p}><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.5 1.3 6.6L12 17.3l-5.9 3.2 1.3-6.6-4.9-4.5 6.6-.8L12 2.5z"/></svg>; }
function Mail({ size=16, ...p }) { return <svg width={size} height={size} {...iconBase} {...p}><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M3.5 6.5L12 13l8.5-6.5"/></svg>; }
function Phone({ size=16, ...p }) { return <svg width={size} height={size} {...iconBase} {...p}><path d="M4.5 3.5h4l1.5 5-2.5 1.7a12 12 0 006 6l1.7-2.5 5 1.5v4a1.5 1.5 0 01-1.6 1.5A17 17 0 013 5.1 1.5 1.5 0 014.5 3.5z"/></svg>; }
function ChevronDown({ size=16, ...p }) { return <svg width={size} height={size} {...iconBase} {...p}><path d="M5.5 8.5L12 15l6.5-6.5"/></svg>; }
function Clock({ size=16, ...p }) { return <svg width={size} height={size} {...iconBase} {...p}><circle cx="12" cy="12" r="9.5"/><path d="M12 7v5l3.5 2"/></svg>; }
function Award({ size=16, ...p }) { return <svg width={size} height={size} {...iconBase} {...p}><circle cx="12" cy="8.5" r="5.5"/><path d="M8.3 13.2L7 21l5-2.6 5 2.6-1.3-7.8"/></svg>; }
function Globe2({ size=16, ...p }) { return <svg width={size} height={size} {...iconBase} {...p}><circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19M12 2.5c2.8 2.6 4.3 6 4.3 9.5s-1.5 6.9-4.3 9.5c-2.8-2.6-4.3-6-4.3-9.5S9.2 5.1 12 2.5z"/></svg>; }
function Route({ size=16, ...p }) { return <svg width={size} height={size} {...iconBase} {...p}><circle cx="5.5" cy="18.5" r="2.3"/><circle cx="18.5" cy="5.5" r="2.3"/><path d="M7.6 17.2C12 14 12 10 16.4 6.8"/></svg>; }
function MessageCircle({ size=16, ...p }) { return <svg width={size} height={size} {...iconBase} {...p}><path d="M21 11.5a8.5 8.5 0 01-12.1 7.7L3 21l1.8-5.9A8.5 8.5 0 1121 11.5z"/></svg>; }

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
// Refined palette: a single deep emerald as the brand anchor, a muted brass
// (not bright gold) reserved for genuine highlights, and a quiet clay tone
// for the rare warm accent — instead of three competing saturated hues
// fighting for attention across every badge and button.
const C = {
  teal:"#0E4A3D", tealMid:"#1F7A5C", tealLight:"#E6EEEA", tealPale:"#F5F8F6",
  amber:"#8A6A34", amberMid:"#A9895A", amberLight:"#F1ECE0",
  coral:"#8B4B3B", coralLight:"#F1E5E0",
  ink:"#1A1A1A", inkMid:"#3D3D3D", inkSoft:"#68686A",
  border:"#E6E4DF", surface:"#FAF9F6", white:"#FFFFFF",
  error:"#A83A32", errorLight:"#F5E7E4",
  info:"#3C4E5C", infoLight:"#EBEEF0",
};
const serif = "'Playfair Display','Georgia',serif";
const sans  = "'Inter',system-ui,sans-serif";

// ─── i18n / MULTI-LANGUAGE SYSTEM ────────────────────────────────────────────
const LANGUAGES = [
  { code:"en", label:"English",  flag:"🇬🇧" },
  { code:"si", label:"සිංහල",    flag:"🇱🇰" },
  { code:"ta", label:"தமிழ்",     flag:"🇱🇰" },
  { code:"de", label:"Deutsch",  flag:"🇩🇪" },
  { code:"fr", label:"Français", flag:"🇫🇷" },
  { code:"zh", label:"中文",      flag:"🇨🇳" },
];
// Full language names, used to instruct the AI to write itinerary content
// (title, tagline, activity descriptions, etc.) directly in the selected
// language — no separate translation call needed, the same generation
// request just asks for the target language.
const LANG_NAMES = { en:"English", si:"Sinhala", ta:"Tamil", de:"German", fr:"French", zh:"Chinese" };

// Translations cover the highest-traffic surface: nav, home page hero/services,
// the journey wizard, common buttons, and footer. Deeper content (destination
// descriptions, guide bios) stays in English since that's mostly static
// reference copy. AI-generated itineraries are localized by asking the model
// to write directly in the selected language (see generate() in JourneyPage).
const TRANSLATIONS = {
  en: {
    nav_home:"Home", nav_destinations:"Destinations", nav_map:"Sri Lanka Map", nav_plan:"Plan a trip",
    nav_findguide:"Find a Guide", nav_guideportal:"Guide Portal", nav_signin:"Sign in", nav_signout:"Sign out",
    nav_planmytrip:"Plan my trip",
    hero_badge:"Pearl of the Indian Ocean", hero_title1:"Discover", hero_title2:"Sri Lanka", hero_title3:"your way",
    hero_sub:"AI-crafted journeys or certified local guides — tailored to exactly how you want to explore.",
    hero_cta1:"✨ Create my journey", hero_cta2:"Browse guides",
    stat_dest:"Destinations", stat_guides:"Certified guides", stat_rating:"Avg rating", stat_travellers:"Travellers",
    services_label:"Our services", services_title:"How would you like to explore?",
    svc1_title:"Create your journey", svc1_desc:"Answer a few questions and get a day-by-day itinerary crafted by AI — real restaurants, trails, and hidden gems.", svc1_cta:"Get started →",
    svc2_title:"Search for a guide", svc2_desc:"Browse SLTDA-certified local guides, share your itinerary, and request personalised price quotes.", svc2_cta:"Browse guides →",
    why_label:"Why CeylonTrails", why_title:"Everything in one place",
    why1_t:"AI itinerary builder", why1_s:"Real AI crafts a unique plan with named restaurants, trails and hotels.",
    why2_t:"Verified guides", why2_s:"Every guide is SLTDA-certified. We verify credentials before listing.",
    why3_t:"Bid & compare", why3_s:"Submit your itinerary and collect price bids. No obligation.",
    why4_t:"Responsible tourism", why4_s:"We partner only with eco-conscious guides and sustainable operators.",
    wiz_title:"Build your perfect trip", wiz_sub:"A few quick questions. Real AI builds your day-by-day Sri Lanka itinerary.",
    wiz_back:"← Back", wiz_next:"Next →", wiz_generate:"✨ Generate my itinerary",
    q_start:"Where and when does your trip start?", q_travel:"What kind of travel excites you?", q_activities:"What activities do you enjoy?", q_food:"What food do you enjoy?", q_groupbudget:"Who's going & what's your budget?", q_transport:"How do you want to get around?", q_pace:"What pace do you prefer?", q_hotelstyle:"How do you want to handle hotels?", q_places:"Any specific places you want to visit?",
    btn_planmytripshere:"✨ Plan a trip here",
    res_eyebrow:"Your AI itinerary", res_pdf:"📄 Download PDF", res_share:"🔗 Share itinerary",
    res_save_idle:"💾 Save for later", res_save_saving:"Saving…", res_save_saved:"✅ Saved!", res_save_error:"⚠️ Try again",
    res_openmaps:"🗺️ Open full route in Google Maps", res_taphint:"💡 Tap any activity row to see photo, hours & map",
    res_tripstarts:"Trip starts", res_tripends:"Trip ends", res_return:"Return journey", res_endtrip:"End of trip",
  },
  si: {
    nav_home:"මුල් පිටුව", nav_destinations:"ගමනාන්ත", nav_map:"ශ්‍රී ලංකා සිතියම", nav_plan:"සැලැස්මක් කරන්න",
    nav_findguide:"මාර්ගෝපදේශකයෙකු සොයන්න", nav_guideportal:"මාර්ගෝපදේශක ද්වාරය", nav_signin:"පුරන්න", nav_signout:"ඉවත් වන්න",
    nav_planmytrip:"මගේ සංචාරය සැලසුම් කරන්න",
    hero_badge:"ඉන්දියන් සාගරයේ මුතු ඇටය", hero_title1:"සොයාගන්න", hero_title2:"ශ්‍රී ලංකාව", hero_title3:"ඔබේ ආකාරයෙන්",
    hero_sub:"AI මගින් සැලසුම් කළ ගමන් හෝ සහතික කළ දේශීය මාර්ගෝපදේශකයින් — ඔබට අවශ්‍ය ආකාරයටම සකස් කර ඇත.",
    hero_cta1:"✨ මගේ ගමන සාදන්න", hero_cta2:"මාර්ගෝපදේශකයින් බලන්න",
    stat_dest:"ගමනාන්ත", stat_guides:"සහතික කළ මාර්ගෝපදේශකයින්", stat_rating:"සාමාන්‍ය ශ්‍රේණිගත කිරීම", stat_travellers:"සංචාරකයින්",
    services_label:"අපගේ සේවාවන්", services_title:"ඔබ ගවේෂණය කිරීමට කැමති ආකාරය කුමක්ද?",
    svc1_title:"ඔබේ ගමන සාදන්න", svc1_desc:"ප්‍රශ්න කිහිපයකට පිළිතුරු දී AI මගින් සැලසුම් කළ දිනපතා සංචාර සැලැස්මක් ලබාගන්න.", svc1_cta:"ආරම්භ කරන්න →",
    svc2_title:"මාර්ගෝපදේශකයෙකු සොයන්න", svc2_desc:"SLTDA සහතික කළ දේශීය මාර්ගෝපදේශකයින් බලා, ඔබේ සැලැස්ම බෙදාගෙන මිල ගණන් ඉල්ලන්න.", svc2_cta:"මාර්ගෝපදේශකයින් බලන්න →",
    why_label:"CeylonTrails තෝරාගන්නේ ඇයි", why_title:"සියල්ල එක තැනක",
    why1_t:"AI සංචාර සැලසුම් කරණය", why1_s:"සැබෑ AI මගින් නම් කළ අවන්හල්, මං පෙත් සහ හෝටල් සහිත සුවිශේෂී සැලැස්මක් සකස් කරයි.",
    why2_t:"සත්‍යාපිත මාර්ගෝපදේශකයින්", why2_s:"සෑම මාර්ගෝපදේශකයෙකුම SLTDA සහතික කර ඇත.",
    why3_t:"ලංසු සහ සැසඳීම", why3_s:"ඔබේ සැලැස්ම ඉදිරිපත් කර මිල ගණන් රැස් කරගන්න. බැඳීමක් නැත.",
    why4_t:"වගකිවයුතු සංචාරක ව්‍යාපාරය", why4_s:"අපි පරිසර හිතකාමී මාර්ගෝපදේශකයින් සමඟ පමණක් සහයෝගයෙන් කටයුතු කරමු.",
    wiz_title:"ඔබේ පරිපූර්ණ ගමන සාදන්න", wiz_sub:"ඉක්මන් ප්‍රශ්න කිහිපයක්. සැබෑ AI ඔබේ දිනපතා ශ්‍රී ලංකා සංචාර සැලැස්ම සාදයි.",
    wiz_back:"← ආපසු", wiz_next:"ඊළඟ →", wiz_generate:"✨ මගේ සැලැස්ම සාදන්න",
    q_start:"ඔබේ ගමන ආරම්භ වන්නේ කොතැනින් සහ කවදාද?", q_travel:"ඔබව සිත්ගන්නා සංචාර වර්ගය කුමක්ද?", q_activities:"ඔබ රසවිඳින ක්‍රියාකාරකම් මොනවාද?", q_food:"ඔබ රසවිඳින ආහාර මොනවාද?", q_groupbudget:"යන්නේ කවුද සහ ඔබේ අයවැය කීයද?", q_transport:"ඔබ සැරිසැරීමට කැමති ආකාරය කුමක්ද?", q_pace:"ඔබ කැමති වේගය කුමක්ද?", q_hotelstyle:"හෝටල් කළමනාකරණය කරන්නේ කෙසේද?", q_places:"ඔබ බැලීමට කැමති විශේෂිත ස්ථාන තිබේද?",
    btn_planmytripshere:"✨ මෙහි ගමනක් සැලසුම් කරන්න",
    res_eyebrow:"ඔබේ AI සංචාර සැලැස්ම", res_pdf:"📄 PDF බාගන්න", res_share:"🔗 සැලැස්ම බෙදාගන්න",
    res_save_idle:"💾 පසුව සඳහා සුරකින්න", res_save_saving:"සුරකිමින්…", res_save_saved:"✅ සුරැකිණි!", res_save_error:"⚠️ නැවත උත්සාහ කරන්න",
    res_openmaps:"🗺️ Google සිතියමේ සම්පූර්ණ මාර්ගය විවෘත කරන්න", res_taphint:"💡 ඡායාරූප, වේලාවන් සහ සිතියම බැලීමට ඕනෑම ක්‍රියාකාරකමක් ස්පර්ශ කරන්න",
    res_tripstarts:"සංචාරය ආරම්භය", res_tripends:"සංචාරය අවසානය", res_return:"ආපසු ගමන", res_endtrip:"සංචාරයේ අවසානය",
  },
  ta: {
    nav_home:"முகப்பு", nav_destinations:"இடங்கள்", nav_map:"இலங்கை வரைபடம்", nav_plan:"பயணம் திட்டமிடுங்கள்",
    nav_findguide:"வழிகாட்டியைக் கண்டறியவும்", nav_guideportal:"வழிகாட்டி வாயில்", nav_signin:"உள்நுழைய", nav_signout:"வெளியேறு",
    nav_planmytrip:"எனது பயணத்தைத் திட்டமிடுங்கள்",
    hero_badge:"இந்தியப் பெருங்கடலின் முத்து", hero_title1:"கண்டறியுங்கள்", hero_title2:"இலங்கை", hero_title3:"உங்கள் வழியில்",
    hero_sub:"AI வடிவமைத்த பயணங்கள் அல்லது சான்றளிக்கப்பட்ட உள்ளூர் வழிகாட்டிகள் — நீங்கள் விரும்பும் வகையில் தயாரிக்கப்பட்டது.",
    hero_cta1:"✨ எனது பயணத்தை உருவாக்கு", hero_cta2:"வழிகாட்டிகளைப் பார்வையிடுங்கள்",
    stat_dest:"இடங்கள்", stat_guides:"சான்றளிக்கப்பட்ட வழிகாட்டிகள்", stat_rating:"சராசரி மதிப்பீடு", stat_travellers:"பயணிகள்",
    services_label:"எங்கள் சேவைகள்", services_title:"நீங்கள் எவ்வாறு ஆராய விரும்புகிறீர்கள்?",
    svc1_title:"உங்கள் பயணத்தை உருவாக்குங்கள்", svc1_desc:"சில கேள்விகளுக்கு பதிலளித்து AI வடிவமைத்த தினசரி பயணத் திட்டத்தைப் பெறுங்கள்.", svc1_cta:"தொடங்குங்கள் →",
    svc2_title:"வழிகாட்டியைத் தேடுங்கள்", svc2_desc:"SLTDA சான்றளிக்கப்பட்ட உள்ளூர் வழிகாட்டிகளை உலாவி, உங்கள் திட்டத்தைப் பகிர்ந்து விலைமனுக்களைக் கோருங்கள்.", svc2_cta:"வழிகாட்டிகளைப் பார்வையிடுங்கள் →",
    why_label:"ஏன் CeylonTrails", why_title:"அனைத்தும் ஒரே இடத்தில்",
    why1_t:"AI பயணத் திட்டமிடுபவர்", why1_s:"உண்மையான AI பெயரிடப்பட்ட உணவகங்கள், பாதைகள் மற்றும் ஹோட்டல்களுடன் தனித்துவமான திட்டத்தை உருவாக்குகிறது.",
    why2_t:"சரிபார்க்கப்பட்ட வழிகாட்டிகள்", why2_s:"ஒவ்வொரு வழிகாட்டியும் SLTDA சான்றளிக்கப்பட்டவர்.",
    why3_t:"விலைமனு & ஒப்பீடு", why3_s:"உங்கள் திட்டத்தைச் சமர்ப்பித்து விலை மனுக்களைச் சேகரிக்கவும். கடப்பாடு இல்லை.",
    why4_t:"பொறுப்பான சுற்றுலா", why4_s:"சுற்றுச்சூழல் உணர்வுள்ள வழிகாட்டிகளுடன் மட்டுமே நாங்கள் கூட்டாண்மை செய்கிறோம்.",
    wiz_title:"உங்கள் சரியான பயணத்தை உருவாக்குங்கள்", wiz_sub:"சில விரைவான கேள்விகள். உண்மையான AI உங்கள் தினசரி இலங்கை பயணத் திட்டத்தை உருவாக்குகிறது.",
    wiz_back:"← பின்", wiz_next:"அடுத்து →", wiz_generate:"✨ எனது திட்டத்தை உருவாக்கு",
    q_start:"உங்கள் பயணம் எங்கே, எப்போது தொடங்குகிறது?", q_travel:"எந்த வகை பயணம் உங்களை கவர்கிறது?", q_activities:"நீங்கள் எந்த செயல்பாடுகளை விரும்புகிறீர்கள்?", q_food:"நீங்கள் எந்த உணவை விரும்புகிறீர்கள்?", q_groupbudget:"யார் வருகிறார்கள் & உங்கள் பட்ஜெட் என்ன?", q_transport:"நீங்கள் எவ்வாறு சுற்றி வர விரும்புகிறீர்கள்?", q_pace:"நீங்கள் விரும்பும் வேகம் என்ன?", q_hotelstyle:"ஹோட்டல்களை எவ்வாறு கையாள விரும்புகிறீர்கள்?", q_places:"நீங்கள் பார்க்க விரும்பும் குறிப்பிட்ட இடங்கள் உள்ளனவா?",
    btn_planmytripshere:"✨ இங்கே ஒரு பயணத்தைத் திட்டமிடுங்கள்",
    res_eyebrow:"உங்கள் AI பயணத் திட்டம்", res_pdf:"📄 PDF பதிவிறக்கு", res_share:"🔗 திட்டத்தைப் பகிரவும்",
    res_save_idle:"💾 பின்னர் சேமிக்க", res_save_saving:"சேமிக்கிறது…", res_save_saved:"✅ சேமிக்கப்பட்டது!", res_save_error:"⚠️ மீண்டும் முயற்சிக்கவும்",
    res_openmaps:"🗺️ Google வரைபடத்தில் முழு பாதையையும் திறக்கவும்", res_taphint:"💡 புகைப்படம், நேரம் & வரைபடத்தைக் காண எந்த செயல்பாட்டு வரிசையையும் தட்டவும்",
    res_tripstarts:"பயணம் தொடக்கம்", res_tripends:"பயணம் முடிவு", res_return:"திரும்பும் பயணம்", res_endtrip:"பயணத்தின் முடிவு",
  },
  de: {
    nav_home:"Startseite", nav_destinations:"Reiseziele", nav_map:"Sri-Lanka-Karte", nav_plan:"Reise planen",
    nav_findguide:"Reiseführer finden", nav_guideportal:"Reiseführer-Portal", nav_signin:"Anmelden", nav_signout:"Abmelden",
    nav_planmytrip:"Meine Reise planen",
    hero_badge:"Perle des Indischen Ozeans", hero_title1:"Entdecke", hero_title2:"Sri Lanka", hero_title3:"auf deine Weise",
    hero_sub:"KI-gestaltete Reisen oder zertifizierte lokale Reiseführer — genau auf deine Wünsche zugeschnitten.",
    hero_cta1:"✨ Meine Reise erstellen", hero_cta2:"Reiseführer durchsuchen",
    stat_dest:"Reiseziele", stat_guides:"Zertifizierte Führer", stat_rating:"Durchschn. Bewertung", stat_travellers:"Reisende",
    services_label:"Unsere Leistungen", services_title:"Wie möchtest du Sri Lanka erkunden?",
    svc1_title:"Erstelle deine Reise", svc1_desc:"Beantworte ein paar Fragen und erhalte einen tagesgenauen Reiseplan von KI — echte Restaurants, Wege und Geheimtipps.", svc1_cta:"Loslegen →",
    svc2_title:"Reiseführer suchen", svc2_desc:"Durchsuche SLTDA-zertifizierte lokale Reiseführer, teile deinen Plan und fordere individuelle Angebote an.", svc2_cta:"Reiseführer durchsuchen →",
    why_label:"Warum CeylonTrails", why_title:"Alles an einem Ort",
    why1_t:"KI-Reiseplaner", why1_s:"Echte KI erstellt einen einzigartigen Plan mit benannten Restaurants, Wegen und Hotels.",
    why2_t:"Verifizierte Reiseführer", why2_s:"Jeder Führer ist SLTDA-zertifiziert. Wir prüfen die Qualifikationen vor der Listung.",
    why3_t:"Angebote & Vergleich", why3_s:"Reiche deinen Plan ein und sammle Preisangebote. Unverbindlich.",
    why4_t:"Verantwortungsvoller Tourismus", why4_s:"Wir arbeiten nur mit umweltbewussten Führern und nachhaltigen Anbietern zusammen.",
    wiz_title:"Erstelle deine perfekte Reise", wiz_sub:"Ein paar kurze Fragen. Echte KI erstellt deinen tagesgenauen Sri-Lanka-Reiseplan.",
    wiz_back:"← Zurück", wiz_next:"Weiter →", wiz_generate:"✨ Meinen Reiseplan erstellen",
    q_start:"Wo und wann beginnt deine Reise?", q_travel:"Welche Art von Reise begeistert dich?", q_activities:"Welche Aktivitäten magst du?", q_food:"Welches Essen magst du?", q_groupbudget:"Wer reist mit & wie ist dein Budget?", q_transport:"Wie möchtest du dich fortbewegen?", q_pace:"Welches Tempo bevorzugst du?", q_hotelstyle:"Wie möchtest du mit Hotels umgehen?", q_places:"Gibt es bestimmte Orte, die du besuchen möchtest?",
    btn_planmytripshere:"✨ Hier eine Reise planen",
    res_eyebrow:"Dein KI-Reiseplan", res_pdf:"📄 PDF herunterladen", res_share:"🔗 Reiseplan teilen",
    res_save_idle:"💾 Für später speichern", res_save_saving:"Speichern…", res_save_saved:"✅ Gespeichert!", res_save_error:"⚠️ Erneut versuchen",
    res_openmaps:"🗺️ Vollständige Route in Google Maps öffnen", res_taphint:"💡 Tippe auf eine Aktivität für Foto, Öffnungszeiten & Karte",
    res_tripstarts:"Reisebeginn", res_tripends:"Reiseende", res_return:"Rückreise", res_endtrip:"Ende der Reise",
  },
  fr: {
    nav_home:"Accueil", nav_destinations:"Destinations", nav_map:"Carte du Sri Lanka", nav_plan:"Planifier un voyage",
    nav_findguide:"Trouver un guide", nav_guideportal:"Portail guide", nav_signin:"Connexion", nav_signout:"Déconnexion",
    nav_planmytrip:"Planifier mon voyage",
    hero_badge:"Perle de l'océan Indien", hero_title1:"Découvrez", hero_title2:"le Sri Lanka", hero_title3:"à votre façon",
    hero_sub:"Voyages conçus par IA ou guides locaux certifiés — adaptés exactement à votre façon d'explorer.",
    hero_cta1:"✨ Créer mon voyage", hero_cta2:"Parcourir les guides",
    stat_dest:"Destinations", stat_guides:"Guides certifiés", stat_rating:"Note moyenne", stat_travellers:"Voyageurs",
    services_label:"Nos services", services_title:"Comment souhaitez-vous explorer ?",
    svc1_title:"Créez votre voyage", svc1_desc:"Répondez à quelques questions et obtenez un itinéraire jour par jour conçu par IA — vrais restaurants, sentiers et trésors cachés.", svc1_cta:"Commencer →",
    svc2_title:"Rechercher un guide", svc2_desc:"Parcourez les guides locaux certifiés SLTDA, partagez votre itinéraire et demandez des devis personnalisés.", svc2_cta:"Parcourir les guides →",
    why_label:"Pourquoi CeylonTrails", why_title:"Tout en un seul endroit",
    why1_t:"Créateur d'itinéraire IA", why1_s:"Une vraie IA crée un plan unique avec des restaurants, sentiers et hôtels nommés.",
    why2_t:"Guides vérifiés", why2_s:"Chaque guide est certifié SLTDA. Nous vérifions les qualifications avant la mise en ligne.",
    why3_t:"Devis & comparaison", why3_s:"Soumettez votre itinéraire et recueillez des devis. Sans engagement.",
    why4_t:"Tourisme responsable", why4_s:"Nous collaborons uniquement avec des guides éco-responsables et des opérateurs durables.",
    wiz_title:"Créez votre voyage parfait", wiz_sub:"Quelques questions rapides. Une vraie IA crée votre itinéraire jour par jour au Sri Lanka.",
    wiz_back:"← Retour", wiz_next:"Suivant →", wiz_generate:"✨ Générer mon itinéraire",
    q_start:"Où et quand commence votre voyage ?", q_travel:"Quel type de voyage vous passionne ?", q_activities:"Quelles activités aimez-vous ?", q_food:"Quelle cuisine aimez-vous ?", q_groupbudget:"Qui voyage & quel est votre budget ?", q_transport:"Comment souhaitez-vous vous déplacer ?", q_pace:"Quel rythme préférez-vous ?", q_hotelstyle:"Comment souhaitez-vous gérer les hôtels ?", q_places:"Des lieux spécifiques que vous souhaitez visiter ?",
    btn_planmytripshere:"✨ Planifier un voyage ici",
    res_eyebrow:"Votre itinéraire IA", res_pdf:"📄 Télécharger le PDF", res_share:"🔗 Partager l'itinéraire",
    res_save_idle:"💾 Enregistrer pour plus tard", res_save_saving:"Enregistrement…", res_save_saved:"✅ Enregistré !", res_save_error:"⚠️ Réessayer",
    res_openmaps:"🗺️ Ouvrir l'itinéraire complet dans Google Maps", res_taphint:"💡 Touchez une activité pour voir photo, horaires et carte",
    res_tripstarts:"Début du voyage", res_tripends:"Fin du voyage", res_return:"Voyage retour", res_endtrip:"Fin du voyage",
  },
  zh: {
    nav_home:"首页", nav_destinations:"目的地", nav_map:"斯里兰卡地图", nav_plan:"规划行程",
    nav_findguide:"寻找导游", nav_guideportal:"导游门户", nav_signin:"登录", nav_signout:"退出登录",
    nav_planmytrip:"规划我的行程",
    hero_badge:"印度洋明珠", hero_title1:"探索", hero_title2:"斯里兰卡", hero_title3:"用您的方式",
    hero_sub:"AI 定制行程或认证当地导游 — 完全按照您想要的探索方式量身定制。",
    hero_cta1:"✨ 创建我的行程", hero_cta2:"浏览导游",
    stat_dest:"目的地", stat_guides:"认证导游", stat_rating:"平均评分", stat_travellers:"旅行者",
    services_label:"我们的服务", services_title:"您想如何探索？",
    svc1_title:"创建您的行程", svc1_desc:"回答几个问题，获取由 AI 精心制作的逐日行程 — 真实的餐厅、步道和隐藏景点。", svc1_cta:"开始 →",
    svc2_title:"寻找导游", svc2_desc:"浏览经 SLTDA 认证的当地导游，分享您的行程并请求个性化报价。", svc2_cta:"浏览导游 →",
    why_label:"为什么选择 CeylonTrails", why_title:"一切尽在一处",
    why1_t:"AI 行程规划器", why1_s:"真正的 AI 打造独特行程，包含具体的餐厅、步道和酒店。",
    why2_t:"认证导游", why2_s:"每位导游均经过 SLTDA 认证。我们在列出之前核实资质。",
    why3_t:"报价与比较", why3_s:"提交您的行程并收集报价。无需承诺。",
    why4_t:"负责任的旅游", why4_s:"我们只与具有环保意识的导游和可持续运营商合作。",
    wiz_title:"打造您的完美行程", wiz_sub:"几个简短的问题。真正的 AI 为您打造逐日斯里兰卡行程。",
    wiz_back:"← 返回", wiz_next:"下一步 →", wiz_generate:"✨ 生成我的行程",
    q_start:"您的行程从哪里、何时开始？", q_travel:"什么样的旅行让您兴奋？", q_activities:"您喜欢什么活动？", q_food:"您喜欢什么美食？", q_groupbudget:"谁同行，您的预算是多少？", q_transport:"您想如何出行？", q_pace:"您喜欢什么节奏？", q_hotelstyle:"您想如何安排酒店？", q_places:"有什么特定地点想去吗？",
    btn_planmytripshere:"✨ 在此规划行程",
    res_eyebrow:"您的 AI 行程", res_pdf:"📄 下载 PDF", res_share:"🔗 分享行程",
    res_save_idle:"💾 保存以便稍后查看", res_save_saving:"保存中…", res_save_saved:"✅ 已保存！", res_save_error:"⚠️ 请重试",
    res_openmaps:"🗺️ 在 Google 地图中打开完整路线", res_taphint:"💡 点击任意活动可查看照片、营业时间和地图",
    res_tripstarts:"行程开始", res_tripends:"行程结束", res_return:"返程", res_endtrip:"行程结束",
  },
};

// Translations for wizard OPTION labels/subtitles, keyed by the stable option
// value (v) so the option arrays above never need to change per language.
// Structure: OPT_T[lang][value] = { l: label, s: subtitle (optional) }
const OPT_T = {
  en: {
    beach:{l:"Beach & Coast",s:"Sun, sand, surf & sea"}, hills:{l:"Hill Country",s:"Tea trails, mist & waterfalls"},
    cultural:{l:"Cultural & Historic",s:"Temples, ruins & stories"}, wildlife:{l:"Wildlife & Nature",s:"Safari, jungle & birds"},
    adventure:{l:"Adventure",s:"Hiking, rafting & climbing"}, rural:{l:"Rural Sri Lanka",s:"Villages, farms & local life"},
    mixed:{l:"All of Sri Lanka",s:"A bit of everything"},
    solo:{l:"Solo",s:"Just me"}, couple:{l:"Couple",s:"Two travellers"}, family:{l:"Family",s:"With kids"}, friends:{l:"Friends group",s:"3 or more"},
    budget:{l:"Budget",s:"< $50/day"}, mid:{l:"Mid-range",s:"$50–$150/day"}, luxury:{l:"Luxury",s:"$150+/day"},
    srilankan:"Sri Lankan", seafood:"Seafood", vegetarian:"Vegetarian", vegan:"Vegan", western:"Western", southindian:"South Indian", streetfood:"Street food", finedining:"Fine dining",
    relaxation:{l:"Relaxation"}, sightseeing:{l:"Sightseeing"}, "food-tours":{l:"Food tours"}, wellness:{l:"Wellness & Spa"},
    "water-sports":{l:"Water sports"}, "wildlife-safari":{l:"Wildlife safari"}, hiking:{l:"Hiking & Trekking"}, "adventure-act":{l:"Adventure sports"},
    "tuk-tuk":{l:"Tuk-tuk",s:"Authentic & fun, best for short hops"}, "private-car":{l:"Private car",s:"Comfortable & flexible"},
    train:{l:"Scenic train",s:"Iconic hill country routes"}, bus:{l:"Public bus",s:"Budget-friendly, local experience"},
    relaxed:{l:"Relaxed",s:"Max 2 activities/day, long lunches"}, balanced:{l:"Balanced",s:"3–4 activities, some downtime"}, packed:{l:"Action-packed",s:"See as much as possible"},
    airport:{l:"Bandaranaike International Airport",s:"Katunayake — most international flights"}, colombo:{l:"Colombo City Centre",s:"Already in the city"}, custom:{l:"Another city / hotel",s:"I'm starting somewhere else"},
    daysq:"Pick your dates and we'll count the days automatically", roundtripq:"At the end of the trip, do you want to return to your starting point?",
    roundtrip_yes:{l:"Yes, round trip",s:"End back where I started"}, roundtrip_no:{l:"No, one-way",s:"I'll end up somewhere else"},
    activities_sub:"Pick any that apply", food_sub:"Pick any that apply", group_sub:"Group type", budget_sub:"Daily budget per person",
    transport_sub:"Your AI itinerary will be built around your transport choice", pace_sub:"This shapes how many activities per day we plan",
    hotelstyle_sub:"Some travellers prefer settling into one place, others love moving around",
    hotel_base:{l:"Stay in one hotel",s:"Pick one base and take day trips out — less packing, more relaxing"},
    hotel_multi:{l:"Move around the country",s:"A new hotel every 1-3 nights — see more places, more variety"},
    places_sub:"If you already know a place in Sri Lanka you want to include — a temple, a waterfall, a town, a restaurant — add it here and we'll fit it into your itinerary.",
    places_placeholder:"e.g. Ravana Falls, Ella · Nine Arch Bridge · Galle Fort", places_add:"Add +", places_empty:"No specific places added — your itinerary will be fully AI-generated based on your style choices.",
    places_optional:"This step is completely optional.", places_tip:"We'll fit your places into the route logically — if a place doesn't match your travel style region, we'll suggest the nearest travel day to include it.",
    villagehomestay:{l:"Village homestay",s:"Sleep in a local family home"}, paddyfarming:{l:"Paddy farming",s:"Plant & harvest with farmers"},
    cookingclass:{l:"Village cooking class",s:"Learn real Sri Lankan recipes"}, spicegarden:{l:"Spice garden tour",s:"Cinnamon, pepper, cardamom"},
    fishingvillage:{l:"Fishing village",s:"Join fishermen at dawn"}, veddacommunity:{l:"Vedda community",s:"Indigenous culture & history"},
    elephantvillage:{l:"Working elephant camp",s:"Ethical elephant interaction"}, potteryweaving:{l:"Pottery & weaving",s:"Traditional crafts with artisans"},
    q_rural_title:"What rural experiences interest you?", q_final_title:"Almost done — any final touches?",
    rural_sub:"Pick the rural experiences you'd love — we'll build your itinerary around them.",
    final_sub:"Almost done! Two final details:", starttime_label:"🕐 What time does your trip start?",
    starttime_sub:"This affects what we plan for Day 1 — an evening start means check-in only, morning start means a full day.",
    tripsummary_label:"📋 Trip summary",
    sum_dates:"Dates", sum_duration:"Duration", sum_starttime:"Start time", sum_startfrom:"Starting from", sum_triptype:"Trip type",
    sum_style:"Style", sum_group:"Group", sum_budget:"Budget", sum_transport:"Transport", sum_pace:"Pace", sum_hotelstyle:"Hotel style", sum_places:"Your places",
    sum_notset:"Not set", sum_notselected:"Not selected", sum_roundtrip_full:"Round trip — returning to start", sum_oneway:"One-way",
    sum_onebase:"One base hotel", sum_moving:"Moving around",
    cal_from:"From", cal_to:"To",
  },
  si: {
    beach:{l:"වෙරළ සහ වෙරළබඩ",s:"හිරු, වැලි, රළ සහ මුහුද"}, hills:{l:"කඳුකර රට",s:"තේ මං පෙත්, මීදුම සහ දිය ඇලි"},
    cultural:{l:"සංස්කෘතික සහ ඓතිහාසික",s:"විහාර, නටබුන් සහ කථා"}, wildlife:{l:"වනජීවී සහ ස්වභාවික",s:"සෆාරි, වනාන්තර සහ පක්ෂීන්"},
    adventure:{l:"සාහසික",s:"කඳු නැගීම, රාෆ්ටින් සහ නැගීම"}, rural:{l:"ග්‍රාමීය ශ්‍රී ලංකාව",s:"ගම්මාන, ගොවිපල සහ දේශීය ජීවිතය"},
    mixed:{l:"සම්පූර්ණ ශ්‍රී ලංකාව",s:"සියල්ලෙන්ම ටිකක්"},
    solo:{l:"තනියම",s:"මම පමණයි"}, couple:{l:"යුවළ",s:"සංචාරකයින් දෙදෙනෙක්"}, family:{l:"පවුල",s:"දරුවන් සමඟ"}, friends:{l:"මිතුරු කණ්ඩායම",s:"3 හෝ වැඩි"},
    budget:{l:"අයවැය",s:"< $50/දිනකට"}, mid:{l:"මධ්‍ය පරාසය",s:"$50–$150/දිනකට"}, luxury:{l:"සුඛෝපභෝගී",s:"$150+/දිනකට"},
    srilankan:"ශ්‍රී ලාංකික", seafood:"මුහුදු ආහාර", vegetarian:"නිර්මාංශ", vegan:"වීගන්", western:"බටහිර", southindian:"දකුණු ඉන්දියානු", streetfood:"වීදි ආහාර", finedining:"උසස් ආහාරපාන",
    relaxation:{l:"විවේකය"}, sightseeing:{l:"සංචාරක ස්ථාන"}, "food-tours":{l:"ආහාර සංචාර"}, wellness:{l:"සුවතා සහ ස්පා"},
    "water-sports":{l:"ජල ක්‍රීඩා"}, "wildlife-safari":{l:"වනජීවී සෆාරි"}, hiking:{l:"කඳු නැගීම සහ ට්‍රෙකින්"}, "adventure-act":{l:"සාහසික ක්‍රීඩා"},
    "tuk-tuk":{l:"ටුක්-ටුක්",s:"සැබෑ සහ විනෝදජනක, කෙටි ගමන් සඳහා හොඳම"}, "private-car":{l:"පෞද්ගලික කාර්",s:"සුවපහසු සහ නම්‍යශීලී"},
    train:{l:"දර්ශනීය දුම්රිය",s:"සුප්‍රසිද්ධ කඳුකර මාර්ග"}, bus:{l:"පොදු බස්",s:"අයවැයට හිතකර, දේශීය අත්දැකීම"},
    relaxed:{l:"සැහැල්ලු",s:"උපරිම ක්‍රියාකාරකම් 2ක්/දිනකට, දිගු දිවා ආහාර"}, balanced:{l:"සමතුලිත",s:"ක්‍රියාකාරකම් 3-4, සුළු විවේකය"}, packed:{l:"ක්‍රියාශීලී",s:"හැකි තරම් බලන්න"},
    airport:{l:"බණ්ඩාරනායක ජාත්‍යන්තර ගුවන් තොටුපල",s:"කටුනායක — බොහෝ ජාත්‍යන්තර ගුවන් ගමන්"}, colombo:{l:"කොළඹ නගර මධ්‍යය",s:"දැනටමත් නගරයේ"}, custom:{l:"වෙනත් නගරයක් / හෝටලයක්",s:"මම ආරම්භ කරන්නේ වෙනත් තැනකින්"},
    daysq:"ඔබේ දින තෝරාගන්න, අපි ස්වයංක්‍රීයව දින ගණන් කරන්නෙමු", roundtripq:"ගමන අවසානයේ, ඔබ ඔබේ ආරම්භක ස්ථානයට ආපසු යාමට කැමතිද?",
    roundtrip_yes:{l:"ඔව්, වටරවුම් ගමන",s:"මා ආරම්භ කළ තැනටම ආපසු"}, roundtrip_no:{l:"නැත, එක් මාර්ගයක්",s:"මම වෙනත් තැනකින් අවසන් කරමි"},
    activities_sub:"අදාළ ඕනෑම දෙයක් තෝරන්න", food_sub:"අදාළ ඕනෑම දෙයක් තෝරන්න", group_sub:"කණ්ඩායම් වර්ගය", budget_sub:"පුද්ගලයෙකුට දෛනික අයවැය",
    transport_sub:"ඔබේ AI සංචාර සැලැස්ම ඔබේ ප්‍රවාහන තේරීම වටා සාදනු ලැබේ", pace_sub:"මෙය දිනකට ක්‍රියාකාරකම් කීයක් සැලසුම් කරනවාද යන්න හැඩගස්වයි",
    hotelstyle_sub:"සමහර සංචාරකයින් එක් ස්ථානයක පදිංචි වීමට කැමති අතර අනෙක් අය වටා ගමන් කිරීමට කැමතියි",
    hotel_base:{l:"එක් හෝටලයක නවාතැන් ගන්න",s:"එක් පදනමක් තෝරාගෙන දින චාරිකා කරන්න — අඩු පැකින්, වැඩි විවේකය"},
    hotel_multi:{l:"රට පුරා ගමන් කරන්න",s:"සෑම රාත්‍රී 1-3කටම නව හෝටලයක් — වැඩි ස්ථාන, වැඩි විවිධත්වය"},
    places_sub:"ඔබ දැනටමත් ඇතුළත් කිරීමට අවශ්‍ය ශ්‍රී ලංකාවේ ස්ථානයක් දන්නේ නම් — විහාරයක්, දිය ඇල්ලක්, නගරයක්, අවන්හලක් — එය මෙහි එක් කරන්න.",
    places_placeholder:"උදා: රාවණා ඇල්ල, ඇල්ල · නයින් ආච් පාලම · ගාල්ල කොටුව", places_add:"එක් කරන්න +", places_empty:"විශේෂිත ස්ථාන එකතු කර නැත — ඔබේ සැලැස්ම ඔබේ විලාසය තේරීම් මත පදනම්ව සම්පූර්ණයෙන්ම AI-ජනිත වනු ඇත.",
    places_optional:"මෙම පියවර සම්පූර්ණයෙන්ම විකල්පමයි.", places_tip:"අපි ඔබේ ස්ථාන තාර්කිකව මාර්ගයට ගලපන්නෙමු.",
    villagehomestay:{l:"ගම් නිවාසය",s:"දේශීය පවුලක නිවසක නිදාගන්න"}, paddyfarming:{l:"කුඹුරු ගොවිතැන",s:"ගොවීන් සමඟ සිටුවා අස්වැන්න නෙළන්න"},
    cookingclass:{l:"ගම් පිසීම් පන්තිය",s:"සැබෑ ශ්‍රී ලාංකික වට්ටෝරු ඉගෙන ගන්න"}, spicegarden:{l:"කුළුබඩු උද්‍යාන චාරිකාව",s:"කුරුඳු, ගම්මිරිස්, කරදමුංගු"},
    fishingvillage:{l:"ධීවර ගම්මානය",s:"උදෑසන ධීවරයන් සමඟ එක්වන්න"}, veddacommunity:{l:"වැද්දා ප්‍රජාව",s:"ආදිවාසී සංස්කෘතිය සහ ඉතිහාසය"},
    elephantvillage:{l:"වැඩ කරන අලි කඳවුර",s:"සදාචාරාත්මක අලි අන්තර්ක්‍රියා"}, potteryweaving:{l:"මැටි බඳුන් සහ වියමන්",s:"ශිල්පීන් සමඟ සාම්ප්‍රදායික ශිල්ප"},
    q_rural_title:"ඔබට උනන්දුවක් දක්වන ග්‍රාමීය අත්දැකීම් මොනවාද?", q_final_title:"බොහෝදුරට අවසන් — අවසන් ස්පර්ශ ඕනෑද?",
    rural_sub:"ඔබ කැමති ග්‍රාමීය අත්දැකීම් තෝරන්න — අපි ඒවා වටා ඔබේ සැලැස්ම සාදන්නෙමු.",
    final_sub:"බොහෝදුරට අවසන්! අවසාන විස්තර දෙකක්:", starttime_label:"🕐 ඔබේ ගමන ආරම්භ වන්නේ කුමන වේලාවටද?",
    starttime_sub:"මෙය 1 වන දිනය සඳහා අප සැලසුම් කරන දේට බලපායි.",
    tripsummary_label:"📋 ගමන් සාරාංශය",
    sum_dates:"දින", sum_duration:"කාලසීමාව", sum_starttime:"ආරම්භක වේලාව", sum_startfrom:"ආරම්භය", sum_triptype:"ගමන් වර්ගය",
    sum_style:"විලාසය", sum_group:"කණ්ඩායම", sum_budget:"අයවැය", sum_transport:"ප්‍රවාහනය", sum_pace:"වේගය", sum_hotelstyle:"හෝටල් විලාසය", sum_places:"ඔබේ ස්ථාන",
    sum_notset:"සකසා නැත", sum_notselected:"තෝරාගෙන නැත", sum_roundtrip_full:"වටරවුම් ගමන — ආරම්භයට ආපසු", sum_oneway:"එක් මාර්ගයක්",
    sum_onebase:"එක් මූලික හෝටලයක්", sum_moving:"ගමන් කරමින්",
    cal_from:"සිට", cal_to:"දක්වා",
  },
  ta: {
    beach:{l:"கடற்கரை & கடற்கரை",s:"சூரியன், மணல், அலை & கடல்"}, hills:{l:"மலை நாடு",s:"தேயிலைப் பாதைகள், மூடுபனி & நீர்வீழ்ச்சிகள்"},
    cultural:{l:"கலாச்சார & வரலாற்று",s:"கோவில்கள், இடிபாடுகள் & கதைகள்"}, wildlife:{l:"வனவிலங்கு & இயற்கை",s:"சஃபாரி, காடு & பறவைகள்"},
    adventure:{l:"சாகசம்",s:"மலையேற்றம், ராஃப்டிங் & ஏறுதல்"}, rural:{l:"கிராமப்புற இலங்கை",s:"கிராமங்கள், பண்ணைகள் & உள்ளூர் வாழ்க்கை"},
    mixed:{l:"முழு இலங்கை",s:"எல்லாவற்றிலும் கொஞ்சம்"},
    solo:{l:"தனியாக",s:"நான் மட்டும்"}, couple:{l:"ஜோடி",s:"இரண்டு பயணிகள்"}, family:{l:"குடும்பம்",s:"குழந்தைகளுடன்"}, friends:{l:"நண்பர்கள் குழு",s:"3 அல்லது அதற்கு மேல்"},
    budget:{l:"பட்ஜெட்",s:"< $50/நாள்"}, mid:{l:"நடுத்தர",s:"$50–$150/நாள்"}, luxury:{l:"ஆடம்பர",s:"$150+/நாள்"},
    srilankan:"இலங்கை", seafood:"கடல் உணவு", vegetarian:"சைவம்", vegan:"வீகன்", western:"மேற்கத்திய", southindian:"தென்னிந்திய", streetfood:"தெரு உணவு", finedining:"உயர்தர உணவு",
    relaxation:{l:"ஓய்வு"}, sightseeing:{l:"சுற்றுலா இடங்கள்"}, "food-tours":{l:"உணவு சுற்றுலா"}, wellness:{l:"நல்வாழ்வு & ஸ்பா"},
    "water-sports":{l:"நீர் விளையாட்டு"}, "wildlife-safari":{l:"வனவிலங்கு சஃபாரி"}, hiking:{l:"மலையேற்றம் & ட்ரெக்கிங்"}, "adventure-act":{l:"சாகச விளையாட்டு"},
    "tuk-tuk":{l:"டுக்-டுக்",s:"உண்மையான & வேடிக்கையான, குறுகிய தூரத்திற்கு சிறந்தது"}, "private-car":{l:"தனியார் கார்",s:"வசதியான & நெகிழ்வான"},
    train:{l:"இயற்கை காட்சி ரயில்",s:"புகழ்பெற்ற மலை நாட்டு பாதைகள்"}, bus:{l:"பொது பேருந்து",s:"பட்ஜெட்-நட்பு, உள்ளூர் அனுபவம்"},
    relaxed:{l:"நிதானமான",s:"அதிகபட்சம் 2 செயல்பாடுகள்/நாள், நீண்ட மதிய உணவு"}, balanced:{l:"சமநிலையான",s:"3–4 செயல்பாடுகள், சில ஓய்வு நேரம்"}, packed:{l:"செயல் நிறைந்த",s:"முடிந்தவரை பார்க்கவும்"},
    airport:{l:"பண்டாரநாயக்க சர்வதேச விமான நிலையம்",s:"கட்டுநாயக்க — பெரும்பாலான சர்வதேச விமானங்கள்"}, colombo:{l:"கொழும்பு நகர மையம்",s:"ஏற்கனவே நகரத்தில்"}, custom:{l:"வேறு நகரம் / ஹோட்டல்",s:"நான் வேறு இடத்தில் தொடங்குகிறேன்"},
    daysq:"உங்கள் தேதிகளைத் தேர்ந்தெடுக்கவும், நாங்கள் தானாகவே நாட்களை எண்ணுவோம்", roundtripq:"பயணத்தின் முடிவில், நீங்கள் தொடக்க இடத்திற்குத் திரும்ப விரும்புகிறீர்களா?",
    roundtrip_yes:{l:"ஆம், சுற்றுப் பயணம்",s:"நான் தொடங்கிய இடத்திற்கே திரும்புதல்"}, roundtrip_no:{l:"இல்லை, ஒரு வழி",s:"நான் வேறு இடத்தில் முடிப்பேன்"},
    activities_sub:"பொருந்தும் எதையும் தேர்ந்தெடுக்கவும்", food_sub:"பொருந்தும் எதையும் தேர்ந்தெடுக்கவும்", group_sub:"குழு வகை", budget_sub:"ஒரு நபருக்கான தினசரி பட்ஜெட்",
    transport_sub:"உங்கள் AI பயணத் திட்டம் உங்கள் போக்குவரத்து தேர்வைச் சுற்றி உருவாக்கப்படும்", pace_sub:"இது ஒரு நாளைக்கு எத்தனை செயல்பாடுகளை திட்டமிடுகிறோம் என்பதை வடிவமைக்கிறது",
    hotelstyle_sub:"சில பயணிகள் ஒரே இடத்தில் தங்குவதை விரும்புகிறார்கள், மற்றவர்கள் நகர்வதை விரும்புகிறார்கள்",
    hotel_base:{l:"ஒரே ஹோட்டலில் தங்குங்கள்",s:"ஒரு தளத்தைத் தேர்ந்தெடுத்து நாள் பயணங்களை மேற்கொள்ளுங்கள்"},
    hotel_multi:{l:"நாடு முழுவதும் சுற்றுங்கள்",s:"ஒவ்வொரு 1-3 இரவுகளுக்கும் புதிய ஹோட்டல் — அதிக இடங்கள், அதிக வகைகள்"},
    places_sub:"நீங்கள் ஏற்கனவே சேர்க்க விரும்பும் இலங்கையில் ஒரு இடத்தைத் தெரிந்திருந்தால் — ஒரு கோவில், ஒரு நீர்வீழ்ச்சி, ஒரு நகரம், ஒரு உணவகம் — இங்கே சேர்க்கவும்.",
    places_placeholder:"எ.கா. ரவணா எல்லா, எல்லா · நைன் ஆர்ச் பாலம் · காலி கோட்டை", places_add:"சேர் +", places_empty:"குறிப்பிட்ட இடங்கள் சேர்க்கப்படவில்லை — உங்கள் திட்டம் முழுமையாக AI-உருவாக்கப்படும்.",
    places_optional:"இந்த படி முற்றிலும் விருப்பத்தேர்வு.", places_tip:"உங்கள் இடங்களை பாதையில் தர்க்கரீதியாக பொருத்துவோம்.",
    villagehomestay:{l:"கிராம தங்குமிடம்",s:"உள்ளூர் குடும்ப வீட்டில் தங்குங்கள்"}, paddyfarming:{l:"நெல் சாகுபடி",s:"விவசாயிகளுடன் நடவு & அறுவடை"},
    cookingclass:{l:"கிராம சமையல் வகுப்பு",s:"உண்மையான இலங்கை சமையல் கற்றுக்கொள்ளுங்கள்"}, spicegarden:{l:"மசாலா தோட்ட சுற்றுலா",s:"இலவங்கப்பட்டை, மிளகு, ஏலக்காய்"},
    fishingvillage:{l:"மீன்பிடி கிராமம்",s:"விடியற்காலையில் மீனவர்களுடன் சேருங்கள்"}, veddacommunity:{l:"வேடர் சமூகம்",s:"பழங்குடி கலாச்சாரம் & வரலாறு"},
    elephantvillage:{l:"வேலை செய்யும் யானை முகாம்",s:"நெறிமுறை யானை தொடர்பு"}, potteryweaving:{l:"மட்பாண்டம் & நெசவு",s:"கைவினைஞர்களுடன் பாரம்பரிய கைவினை"},
    q_rural_title:"எந்த கிராமப்புற அனுபவங்கள் உங்களுக்கு ஆர்வமாக உள்ளன?", q_final_title:"கிட்டத்தட்ட முடிந்தது — இறுதி தொடுதல்கள் ஏதேனும்?",
    rural_sub:"நீங்கள் விரும்பும் கிராமப்புற அனுபவங்களைத் தேர்ந்தெடுக்கவும்.",
    final_sub:"கிட்டத்தட்ட முடிந்தது! இரண்டு இறுதி விவரங்கள்:", starttime_label:"🕐 உங்கள் பயணம் எந்த நேரத்தில் தொடங்குகிறது?",
    starttime_sub:"இது 1வது நாளுக்கு நாங்கள் திட்டமிடுவதை பாதிக்கிறது.",
    tripsummary_label:"📋 பயண சுருக்கம்",
    sum_dates:"தேதிகள்", sum_duration:"கால அளவு", sum_starttime:"தொடக்க நேரம்", sum_startfrom:"தொடங்கும் இடம்", sum_triptype:"பயண வகை",
    sum_style:"பாணி", sum_group:"குழு", sum_budget:"பட்ஜெட்", sum_transport:"போக்குவரத்து", sum_pace:"வேகம்", sum_hotelstyle:"ஹோட்டல் பாணி", sum_places:"உங்கள் இடங்கள்",
    sum_notset:"அமைக்கப்படவில்லை", sum_notselected:"தேர்ந்தெடுக்கப்படவில்லை", sum_roundtrip_full:"சுற்றுப் பயணம் — தொடக்கத்திற்குத் திரும்புதல்", sum_oneway:"ஒரு வழி",
    sum_onebase:"ஒரு அடிப்படை ஹோட்டல்", sum_moving:"நகர்கிறது",
    cal_from:"இலிருந்து", cal_to:"வரை",
  },
  de: {
    beach:{l:"Strand & Küste",s:"Sonne, Sand, Surfen & Meer"}, hills:{l:"Hügelland",s:"Teewege, Nebel & Wasserfälle"},
    cultural:{l:"Kulturell & Historisch",s:"Tempel, Ruinen & Geschichten"}, wildlife:{l:"Tierwelt & Natur",s:"Safari, Dschungel & Vögel"},
    adventure:{l:"Abenteuer",s:"Wandern, Rafting & Klettern"}, rural:{l:"Ländliches Sri Lanka",s:"Dörfer, Bauernhöfe & lokales Leben"},
    mixed:{l:"Ganz Sri Lanka",s:"Ein bisschen von allem"},
    solo:{l:"Allein",s:"Nur ich"}, couple:{l:"Paar",s:"Zwei Reisende"}, family:{l:"Familie",s:"Mit Kindern"}, friends:{l:"Freundesgruppe",s:"3 oder mehr"},
    budget:{l:"Budget",s:"< $50/Tag"}, mid:{l:"Mittelklasse",s:"$50–$150/Tag"}, luxury:{l:"Luxus",s:"$150+/Tag"},
    srilankan:"Sri-lankisch", seafood:"Meeresfrüchte", vegetarian:"Vegetarisch", vegan:"Vegan", western:"Westlich", southindian:"Südindisch", streetfood:"Streetfood", finedining:"Gehobene Küche",
    relaxation:{l:"Entspannung"}, sightseeing:{l:"Sightseeing"}, "food-tours":{l:"Food-Touren"}, wellness:{l:"Wellness & Spa"},
    "water-sports":{l:"Wassersport"}, "wildlife-safari":{l:"Tierbeobachtung"}, hiking:{l:"Wandern & Trekking"}, "adventure-act":{l:"Abenteuersport"},
    "tuk-tuk":{l:"Tuk-Tuk",s:"Authentisch & lustig, am besten für kurze Strecken"}, "private-car":{l:"Privatwagen",s:"Komfortabel & flexibel"},
    train:{l:"Panoramazug",s:"Berühmte Bergstrecken"}, bus:{l:"Öffentlicher Bus",s:"Günstig, lokale Erfahrung"},
    relaxed:{l:"Entspannt",s:"Max. 2 Aktivitäten/Tag, lange Mittagessen"}, balanced:{l:"Ausgewogen",s:"3–4 Aktivitäten, etwas Freizeit"}, packed:{l:"Vollgepackt",s:"So viel wie möglich sehen"},
    airport:{l:"Bandaranaike International Airport",s:"Katunayake — die meisten internationalen Flüge"}, colombo:{l:"Colombo Stadtzentrum",s:"Bereits in der Stadt"}, custom:{l:"Andere Stadt / Hotel",s:"Ich starte woanders"},
    daysq:"Wähle deine Daten und wir zählen automatisch die Tage", roundtripq:"Möchtest du am Ende der Reise zu deinem Startpunkt zurückkehren?",
    roundtrip_yes:{l:"Ja, Rundreise",s:"Zurück zum Startpunkt"}, roundtrip_no:{l:"Nein, einfache Fahrt",s:"Ich ende woanders"},
    activities_sub:"Wähle alles Zutreffende", food_sub:"Wähle alles Zutreffende", group_sub:"Gruppentyp", budget_sub:"Tagesbudget pro Person",
    transport_sub:"Dein KI-Reiseplan wird um deine Transportwahl herum erstellt", pace_sub:"Dies bestimmt, wie viele Aktivitäten wir pro Tag planen",
    hotelstyle_sub:"Manche Reisende bevorzugen einen festen Ort, andere reisen gerne herum",
    hotel_base:{l:"In einem Hotel bleiben",s:"Eine Basis wählen und Tagesausflüge machen"},
    hotel_multi:{l:"Im Land herumreisen",s:"Alle 1-3 Nächte ein neues Hotel — mehr Orte, mehr Abwechslung"},
    places_sub:"Falls du bereits einen Ort in Sri Lanka kennst, den du einbeziehen möchtest — füge ihn hier hinzu.",
    places_placeholder:"z.B. Ravana Falls, Ella · Nine Arch Bridge · Galle Fort", places_add:"Hinzufügen +", places_empty:"Keine bestimmten Orte hinzugefügt — dein Plan wird vollständig KI-generiert.",
    places_optional:"Dieser Schritt ist völlig optional.", places_tip:"Wir fügen deine Orte logisch in die Route ein.",
    villagehomestay:{l:"Dorf-Homestay",s:"Übernachte bei einer lokalen Familie"}, paddyfarming:{l:"Reisanbau",s:"Pflanzen & Ernten mit Bauern"},
    cookingclass:{l:"Dorf-Kochkurs",s:"Echte sri-lankische Rezepte lernen"}, spicegarden:{l:"Gewürzgarten-Tour",s:"Zimt, Pfeffer, Kardamom"},
    fishingvillage:{l:"Fischerdorf",s:"Bei Sonnenaufgang mit Fischern"}, veddacommunity:{l:"Vedda-Gemeinschaft",s:"Indigene Kultur & Geschichte"},
    elephantvillage:{l:"Arbeitselefanten-Camp",s:"Ethische Elefanten-Begegnung"}, potteryweaving:{l:"Töpferei & Weberei",s:"Traditionelles Handwerk mit Künstlern"},
    q_rural_title:"Welche ländlichen Erlebnisse interessieren dich?", q_final_title:"Fast fertig — letzte Details?",
    rural_sub:"Wähle die ländlichen Erlebnisse, die dir gefallen würden.",
    final_sub:"Fast fertig! Zwei letzte Details:", starttime_label:"🕐 Wann beginnt deine Reise?",
    starttime_sub:"Dies beeinflusst, was wir für Tag 1 planen.",
    tripsummary_label:"📋 Reisezusammenfassung",
    sum_dates:"Daten", sum_duration:"Dauer", sum_starttime:"Startzeit", sum_startfrom:"Start von", sum_triptype:"Reiseart",
    sum_style:"Stil", sum_group:"Gruppe", sum_budget:"Budget", sum_transport:"Transport", sum_pace:"Tempo", sum_hotelstyle:"Hotelstil", sum_places:"Deine Orte",
    sum_notset:"Nicht festgelegt", sum_notselected:"Nicht ausgewählt", sum_roundtrip_full:"Rundreise — zurück zum Start", sum_oneway:"Einfache Fahrt",
    sum_onebase:"Eine Basis-Hotel", sum_moving:"Unterwegs",
    cal_from:"Von", cal_to:"Bis",
  },
  fr: {
    beach:{l:"Plage & Côte",s:"Soleil, sable, surf & mer"}, hills:{l:"Pays des collines",s:"Sentiers de thé, brume & cascades"},
    cultural:{l:"Culturel & Historique",s:"Temples, ruines & histoires"}, wildlife:{l:"Faune & Nature",s:"Safari, jungle & oiseaux"},
    adventure:{l:"Aventure",s:"Randonnée, rafting & escalade"}, rural:{l:"Sri Lanka rural",s:"Villages, fermes & vie locale"},
    mixed:{l:"Tout le Sri Lanka",s:"Un peu de tout"},
    solo:{l:"Solo",s:"Juste moi"}, couple:{l:"Couple",s:"Deux voyageurs"}, family:{l:"Famille",s:"Avec enfants"}, friends:{l:"Groupe d'amis",s:"3 ou plus"},
    budget:{l:"Économique",s:"< 50$/jour"}, mid:{l:"Moyenne gamme",s:"50–150$/jour"}, luxury:{l:"Luxe",s:"150$+/jour"},
    srilankan:"Sri-lankais", seafood:"Fruits de mer", vegetarian:"Végétarien", vegan:"Végétalien", western:"Occidental", southindian:"Sud-indien", streetfood:"Street food", finedining:"Gastronomie",
    relaxation:{l:"Détente"}, sightseeing:{l:"Visites touristiques"}, "food-tours":{l:"Circuits gastronomiques"}, wellness:{l:"Bien-être & Spa"},
    "water-sports":{l:"Sports nautiques"}, "wildlife-safari":{l:"Safari faune"}, hiking:{l:"Randonnée"}, "adventure-act":{l:"Sports d'aventure"},
    "tuk-tuk":{l:"Tuk-tuk",s:"Authentique & amusant, idéal pour les courts trajets"}, "private-car":{l:"Voiture privée",s:"Confortable & flexible"},
    train:{l:"Train panoramique",s:"Routes emblématiques des collines"}, bus:{l:"Bus public",s:"Économique, expérience locale"},
    relaxed:{l:"Détendu",s:"Max 2 activités/jour, longs déjeuners"}, balanced:{l:"Équilibré",s:"3–4 activités, un peu de repos"}, packed:{l:"Intense",s:"Voir un maximum"},
    airport:{l:"Aéroport international de Bandaranaike",s:"Katunayake — la plupart des vols internationaux"}, colombo:{l:"Centre-ville de Colombo",s:"Déjà en ville"}, custom:{l:"Autre ville / hôtel",s:"Je commence ailleurs"},
    daysq:"Choisissez vos dates, nous compterons les jours automatiquement", roundtripq:"À la fin du voyage, souhaitez-vous revenir à votre point de départ ?",
    roundtrip_yes:{l:"Oui, aller-retour",s:"Retour au point de départ"}, roundtrip_no:{l:"Non, aller simple",s:"Je finirai ailleurs"},
    activities_sub:"Choisissez tout ce qui s'applique", food_sub:"Choisissez tout ce qui s'applique", group_sub:"Type de groupe", budget_sub:"Budget quotidien par personne",
    transport_sub:"Votre itinéraire IA sera construit autour de votre choix de transport", pace_sub:"Cela détermine combien d'activités nous planifions par jour",
    hotelstyle_sub:"Certains voyageurs préfèrent s'installer à un endroit, d'autres aiment se déplacer",
    hotel_base:{l:"Rester dans un hôtel",s:"Choisissez une base et faites des excursions"},
    hotel_multi:{l:"Voyager à travers le pays",s:"Un nouvel hôtel tous les 1-3 nuits — plus d'endroits, plus de variété"},
    places_sub:"Si vous connaissez déjà un endroit au Sri Lanka que vous souhaitez inclure, ajoutez-le ici.",
    places_placeholder:"ex. Ravana Falls, Ella · Nine Arch Bridge · Galle Fort", places_add:"Ajouter +", places_empty:"Aucun lieu spécifique ajouté — votre itinéraire sera entièrement généré par l'IA.",
    places_optional:"Cette étape est entièrement facultative.", places_tip:"Nous intégrerons vos lieux logiquement dans l'itinéraire.",
    villagehomestay:{l:"Séjour en village",s:"Dormez dans une famille locale"}, paddyfarming:{l:"Riziculture",s:"Plantez & récoltez avec les agriculteurs"},
    cookingclass:{l:"Cours de cuisine villageoise",s:"Apprenez de vraies recettes sri-lankaises"}, spicegarden:{l:"Visite du jardin d'épices",s:"Cannelle, poivre, cardamome"},
    fishingvillage:{l:"Village de pêcheurs",s:"Rejoignez les pêcheurs à l'aube"}, veddacommunity:{l:"Communauté Vedda",s:"Culture & histoire indigènes"},
    elephantvillage:{l:"Camp d'éléphants de travail",s:"Interaction éthique avec les éléphants"}, potteryweaving:{l:"Poterie & tissage",s:"Artisanat traditionnel avec des artisans"},
    q_rural_title:"Quelles expériences rurales vous intéressent ?", q_final_title:"Presque terminé — des derniers détails ?",
    rural_sub:"Choisissez les expériences rurales que vous aimeriez.",
    final_sub:"Presque terminé ! Deux derniers détails :", starttime_label:"🕐 À quelle heure commence votre voyage ?",
    starttime_sub:"Cela affecte ce que nous planifions pour le jour 1.",
    tripsummary_label:"📋 Résumé du voyage",
    sum_dates:"Dates", sum_duration:"Durée", sum_starttime:"Heure de début", sum_startfrom:"Départ de", sum_triptype:"Type de voyage",
    sum_style:"Style", sum_group:"Groupe", sum_budget:"Budget", sum_transport:"Transport", sum_pace:"Rythme", sum_hotelstyle:"Style d'hôtel", sum_places:"Vos lieux",
    sum_notset:"Non défini", sum_notselected:"Non sélectionné", sum_roundtrip_full:"Aller-retour — retour au départ", sum_oneway:"Aller simple",
    sum_onebase:"Un hôtel de base", sum_moving:"En déplacement",
    cal_from:"Du", cal_to:"Au",
  },
  zh: {
    beach:{l:"海滩与海岸",s:"阳光、沙滩、冲浪与大海"}, hills:{l:"山区",s:"茶园小径、薄雾与瀑布"},
    cultural:{l:"文化与历史",s:"寺庙、遗迹与故事"}, wildlife:{l:"野生动物与自然",s:"野生动物园、丛林与鸟类"},
    adventure:{l:"冒险",s:"徒步、漂流与攀登"}, rural:{l:"斯里兰卡乡村",s:"村庄、农场与当地生活"},
    mixed:{l:"全斯里兰卡",s:"一点点全部体验"},
    solo:{l:"独自旅行",s:"只有我"}, couple:{l:"情侣",s:"两位旅行者"}, family:{l:"家庭",s:"带孩子"}, friends:{l:"朋友团体",s:"3人或以上"},
    budget:{l:"经济型",s:"< $50/天"}, mid:{l:"中档",s:"$50–$150/天"}, luxury:{l:"豪华型",s:"$150+/天"},
    srilankan:"斯里兰卡菜", seafood:"海鲜", vegetarian:"素食", vegan:"纯素", western:"西餐", southindian:"南印度菜", streetfood:"街头小吃", finedining:"高级餐饮",
    relaxation:{l:"放松"}, sightseeing:{l:"观光"}, "food-tours":{l:"美食之旅"}, wellness:{l:"健康与水疗"},
    "water-sports":{l:"水上运动"}, "wildlife-safari":{l:"野生动物园"}, hiking:{l:"徒步与远足"}, "adventure-act":{l:"冒险运动"},
    "tuk-tuk":{l:"嘟嘟车",s:"地道有趣，适合短途出行"}, "private-car":{l:"私人轿车",s:"舒适灵活"},
    train:{l:"观光火车",s:"标志性的山区路线"}, bus:{l:"公共巴士",s:"经济实惠，体验当地生活"},
    relaxed:{l:"轻松",s:"每天最多2个活动，悠长午餐"}, balanced:{l:"均衡",s:"3-4个活动，留有休息时间"}, packed:{l:"紧凑充实",s:"尽可能多游览"},
    airport:{l:"班达拉奈克国际机场",s:"卡图纳亚克 — 大多数国际航班"}, colombo:{l:"科伦坡市中心",s:"已在市内"}, custom:{l:"其他城市/酒店",s:"我从别处出发"},
    daysq:"选择您的日期，我们将自动计算天数", roundtripq:"行程结束时，您想返回出发地点吗？",
    roundtrip_yes:{l:"是，往返行程",s:"返回出发地点"}, roundtrip_no:{l:"否，单程",s:"我会在其他地方结束行程"},
    activities_sub:"选择所有适用项", food_sub:"选择所有适用项", group_sub:"团体类型", budget_sub:"每人每日预算",
    transport_sub:"您的 AI 行程将围绕您的交通选择构建", pace_sub:"这决定了我们每天规划多少活动",
    hotelstyle_sub:"有些旅行者喜欢固定一处住宿，有些则喜欢四处游览",
    hotel_base:{l:"入住一家酒店",s:"选择一个基地并安排一日游"},
    hotel_multi:{l:"环岛旅行",s:"每1-3晚换一家新酒店 — 探索更多地方"},
    places_sub:"如果您已经知道想要加入的斯里兰卡地点 — 寺庙、瀑布、城镇、餐厅 — 请在此添加。",
    places_placeholder:"例如：拉瓦纳瀑布, 埃拉 · 九拱桥 · 加勒堡", places_add:"添加 +", places_empty:"未添加特定地点 — 您的行程将完全由 AI 根据您的风格选择生成。",
    places_optional:"此步骤完全可选。", places_tip:"我们会合理地将您的地点融入路线中。",
    villagehomestay:{l:"乡村民宿",s:"入住当地家庭"}, paddyfarming:{l:"稻田耕作",s:"与农民一起种植和收割"},
    cookingclass:{l:"乡村烹饪课",s:"学习正宗斯里兰卡食谱"}, spicegarden:{l:"香料园之旅",s:"肉桂、胡椒、豆蔻"},
    fishingvillage:{l:"渔村",s:"黎明时分加入渔民"}, veddacommunity:{l:"维达社区",s:"原住民文化与历史"},
    elephantvillage:{l:"工作象营",s:"符合伦理的大象互动"}, potteryweaving:{l:"陶艺与编织",s:"与工匠一起体验传统工艺"},
    q_rural_title:"您对哪些乡村体验感兴趣？", q_final_title:"快完成了 — 还有最后的细节吗？",
    rural_sub:"选择您喜欢的乡村体验。",
    final_sub:"快完成了！最后两个细节：", starttime_label:"🕐 您的行程几点开始？",
    starttime_sub:"这会影响我们为第1天规划的内容。",
    tripsummary_label:"📋 行程摘要",
    sum_dates:"日期", sum_duration:"行程长度", sum_starttime:"出发时间", sum_startfrom:"出发地", sum_triptype:"行程类型",
    sum_style:"风格", sum_group:"团体", sum_budget:"预算", sum_transport:"交通方式", sum_pace:"节奏", sum_hotelstyle:"酒店风格", sum_places:"您的地点",
    sum_notset:"未设置", sum_notselected:"未选择", sum_roundtrip_full:"往返行程 — 返回出发地", sum_oneway:"单程",
    sum_onebase:"一个基地酒店", sum_moving:"四处游览",
    cal_from:"从", cal_to:"到",
  },
};
function optT(lang, value) {
  return OPT_T[lang]?.[value] || OPT_T.en[value] || { l:value, s:"" };
}

const LangContext = React.createContext({ lang:"en", setLang:()=>{}, t:(k)=>k });
function useLang() { return React.useContext(LangContext); }
function LangProvider({ children }) {
  const [lang, setLang] = useState(()=>localStorage.getItem("ct_lang") || "en");
  const changeLang = (code) => { setLang(code); localStorage.setItem("ct_lang", code); };
  const t = (key) => {
    if (TRANSLATIONS[lang]?.[key] !== undefined) return TRANSLATIONS[lang][key];
    if (TRANSLATIONS.en[key] !== undefined) return TRANSLATIONS.en[key];
    // Fall back to OPT_T — many wizard subtitle/label strings live there as
    // flat string values (not {l,s} objects), since they're shared with the
    // option-translation lookup table rather than duplicated in TRANSLATIONS.
    const optVal = OPT_T[lang]?.[key] ?? OPT_T.en?.[key];
    if (typeof optVal === "string") return optVal;
    return key;
  };
  const ot = (value) => optT(lang, value); // option translation: returns {l, s}
  return <LangContext.Provider value={{ lang, setLang:changeLang, t, ot }}>{children}</LangContext.Provider>;
}

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
  { id:"hills",     label:"⛰️ Hill Country",   color:["#2E5844","#1A3A2A"] },
  { id:"cultural",  label:"🏛️ Cultural",       color:["#8A6A34","#6B4A26"] },
  { id:"wildlife",  label:"🐘 Wildlife",        color:["#0B3A30","#0A2A20"] },
  { id:"adventure", label:"🧗 Adventure",       color:["#8B4B3B","#7A2010"] },
  { id:"rural",     label:"🌾 Rural",           color:["#7A6010","#4A3A08"] },
  { id:"hidden",    label:"💎 Hidden Gems",     color:["#5B3A8E","#3A1F5E"] },
];

const DESTINATIONS = {
  beaches:[
    { name:"Mirissa",        tag:"Whale watching capital",      desc:"A crescent of golden sand fringed with palms. Blue-whale sightings Nov–Apr.",          best:"Nov–Apr", crowd:"Moderate", wiki:"Mirissa", lat:5.9483, lng:80.4589 },
    { name:"Unawatuna",      tag:"Coral reef swimming",         desc:"Calm waters for snorkelling. The reef is 200m offshore with sea turtles & parrotfish.", best:"Dec–Mar", crowd:"High",     wiki:"Unawatuna", lat:6.0108, lng:80.2492 },
    { name:"Hikkaduwa",      tag:"Surf & reef life",            desc:"Sri Lanka's original beach resort — consistent surf, glass-bottom boats, nesting turtles.", best:"Nov–Apr", crowd:"High",  wiki:"Hikkaduwa", lat:6.1395, lng:80.1063 },
    { name:"Tangalle",       tag:"Secluded & serene",           desc:"Undeveloped beach with rock pools, fishing catamarans, extraordinary sunsets.",           best:"Dec–Apr", crowd:"Low",      wiki:"Tangalle", lat:6.0241, lng:80.7937 },
    { name:"Arugam Bay",     tag:"East coast surf mecca",       desc:"World-class right-hand point breaks on the east coast — warm and dry when west is wet.",  best:"May–Oct", crowd:"Moderate", wiki:"Arugam Bay", lat:6.8404, lng:81.8360 },
    { name:"Nilaveli",       tag:"Pigeon Island snorkelling",   desc:"Crystal waters off the northeast, home to blacktip reef sharks and hawksbill turtles.",   best:"May–Sep", crowd:"Low",      wiki:"Nilaveli", lat:8.6916, lng:81.1956 },
    { name:"Bentota",        tag:"Watersports & river safari",  desc:"Golden beach meets the Bentota river — jet-skiing, banana boats and mangrove safaris.",   best:"Nov–Apr", crowd:"Moderate", wiki:"Bentota", lat:6.4260, lng:79.9959 },
    { name:"Pasikuda",       tag:"Shallow turquoise bay",       desc:"One of the few beaches where you can walk far out into calm, shallow, swimmable water.",  best:"Apr–Sep", crowd:"Low",      wiki:"Pasikuda", lat:7.9219, lng:81.5650 },
    { name:"Uppuveli",       tag:"Trinco's quiet sister beach", desc:"A long, calm stretch near Trincomalee — far fewer crowds than Nilaveli, easy snorkelling access.", best:"May–Sep", crowd:"Low", wiki:"Uppuveli", lat:8.6019, lng:81.2092 },
    { name:"Talalla",        tag:"Yoga retreat beach",          desc:"A quiet southern beach known for wellness retreats, gentle surf and almost no development.", best:"Dec–Mar", crowd:"Low", wiki:"Talalla", lat:5.9667, lng:80.6500 },
    { name:"Polhena",        tag:"Natural reef pool",           desc:"A shallow reef-protected lagoon near Matara — safe swimming for families and beginner snorkellers.", best:"Dec–Mar", crowd:"Low", wiki:"Polhena Beach", lat:5.9333, lng:80.5500 },
    { name:"Marble Beach",   tag:"Pristine military-protected cove", desc:"A near-untouched cove near Trincomalee inside a navy base — turquoise water, white sand, zero crowds.", best:"May–Sep", crowd:"Low", wiki:"Marble Beach Trincomalee", lat:8.5167, lng:81.2333 },
    { name:"Kalkudah",       tag:"East coast hidden bay",        desc:"A sheltered, shallow bay next to Pasikuda — calmer water and far fewer tourists.", best:"Apr–Sep", crowd:"Low", wiki:"Kalkudah", lat:7.9333, lng:81.5500 },
    { name:"Goyambokka",     tag:"Secret rocky cove",            desc:"A series of small private coves near Tangalle, accessible by a short jungle path — total seclusion.", best:"Dec–Apr", crowd:"Low", wiki:"Goyambokka Beach", lat:6.0083, lng:80.7833 },
    { name:"Dalawella",      tag:"Famous swing & rock pool beach", desc:"Home to the viral coconut tree swing — a calm bay with a natural rock pool perfect for swimming.", best:"Dec–Mar", crowd:"Moderate", wiki:"Dalawella Beach", lat:6.0167, lng:80.2500 },
  ],
  hills:[
    { name:"Ella",           tag:"Nine Arch Bridge & tea",      desc:"Misty village at 1000m. Walk tea ridges to Little Adam's Peak, watch the steam train.",   best:"Jan–Mar", crowd:"High",     wiki:"Ella, Sri Lanka", lat:6.8667, lng:81.0466 },
    { name:"Kandy",          tag:"Cultural heartland",          desc:"Cultural capital in a lush highland bowl. Temple of the Tooth — arrive for evening puja.", best:"Year-round", crowd:"High",  wiki:"Kandy", lat:7.2906, lng:80.6337 },
    { name:"Nuwara Eliya",   tag:"'Little England' tea country",desc:"Colonial bungalows, rose gardens, manicured tea estates at 1868m.",                       best:"Mar–May", crowd:"Moderate", wiki:"Nuwara Eliya", lat:6.9497, lng:80.7891 },
    { name:"Haputale",       tag:"Off-the-beaten ridge",        desc:"A ridge town with drops on both sides — see the Indian Ocean and highlands simultaneously.", best:"Jan–Apr", crowd:"Low",    wiki:"Haputale", lat:6.7670, lng:80.9550 },
    { name:"Horton Plains",  tag:"World's End cliff",           desc:"High-altitude plateau at 2100m with cloud forest and the dramatic 1000m cliff drop.",      best:"Jan–Mar", crowd:"Moderate", wiki:"Horton Plains National Park", lat:6.8021, lng:80.7958 },
    { name:"Knuckles Range", tag:"UNESCO wilderness trek",       desc:"UNESCO-listed range — 34 waterfalls, 13 peaks, villages unchanged for centuries.",          best:"Feb–Apr", crowd:"Low",     wiki:"Knuckles Mountain Range", lat:7.4500, lng:80.7833 },
    { name:"Bandarawela",    tag:"Quiet hill station",          desc:"Less touristy than Ella, with colonial architecture and easy access to tea factories.",   best:"Jan–Apr", crowd:"Low",      wiki:"Bandarawela", lat:6.8294, lng:80.9886 },
    { name:"Hatton",         tag:"Gateway to Adam's Peak",       desc:"A working tea-estate town surrounded by misty mountains — base camp for the Adam's Peak pilgrimage.", best:"Dec–Apr", crowd:"Low", wiki:"Hatton, Sri Lanka", lat:6.8910, lng:80.5957 },
    { name:"Idalgashinna",   tag:"Misty railway ridge walk",     desc:"A remote hill-country railway halt with a famous ridge walk between Haputale and Bandarawela.", best:"Jan–Apr", crowd:"Low", wiki:"Idalgashinna", lat:6.8000, lng:80.9333 },
    { name:"Single Tree Hill", tag:"Nuwara Eliya panoramic viewpoint", desc:"A short, easy climb near Nuwara Eliya rewarded with sweeping views over tea estates and the town below.", best:"Jan–Apr", crowd:"Low", wiki:"Single Tree Hill", lat:6.9333, lng:80.8000 },
    { name:"Pattipola",      tag:"Sri Lanka's highest railway station", desc:"A misty highland station at 1,890m — the start point for scenic walks toward Horton Plains.", best:"Jan–Apr", crowd:"Low", wiki:"Pattipola", lat:6.8167, lng:80.8000 },
    { name:"Lipton's Seat",  tag:"Tea baron's panoramic view",   desc:"Where Sir Thomas Lipton once surveyed his tea empire — 360° views over Uva Province tea country.", best:"Jan–Apr", crowd:"Low", wiki:"Lipton's Seat", lat:6.7167, lng:80.9667 },
    { name:"Ambewela",       tag:"Sri Lanka's 'Little New Zealand'", desc:"Rolling green dairy farms and pine forests at altitude — a strikingly different highland landscape.", best:"Jan–Apr", crowd:"Low", wiki:"Ambewela", lat:6.8833, lng:80.7667 },
    { name:"Diyatalawa",     tag:"Sleepy colonial army town",    desc:"A peaceful valley town with old British military buildings and views over rolling green hills.", best:"Jan–Apr", crowd:"Low", wiki:"Diyatalawa", lat:6.8167, lng:80.9667 },
    { name:"Madulkelle",     tag:"Tea estate treehouse stays",   desc:"A remote tea estate near Kandy known for boutique treehouse accommodation deep in the hills.", best:"Year-round", crowd:"Low", wiki:"Madulkelle", lat:7.3500, lng:80.6833 },
  ],
  cultural:[
    { name:"Sigiriya",       tag:"Lion Rock fortress",          desc:"5th-century rock citadel rising 200m from the jungle. Cloud maiden frescoes, mirror wall.", best:"Year-round", crowd:"High", wiki:"Sigiriya", lat:7.9570, lng:80.7603 },
    { name:"Anuradhapura",   tag:"Ancient sacred city",         desc:"One of the oldest continuously inhabited cities. The 2300-year-old sacred Bo tree.",       best:"Year-round", crowd:"Moderate", wiki:"Anuradhapura", lat:8.3114, lng:80.4037 },
    { name:"Polonnaruwa",    tag:"Medieval capital ruins",       desc:"Compact ruins toured by bicycle in a day. Gal Vihara Buddha sculptures unmissable.",       best:"Year-round", crowd:"Moderate", wiki:"Polonnaruwa", lat:7.9403, lng:81.0188 },
    { name:"Dambulla Cave Temple", tag:"Golden Rock sanctuary", desc:"Five cave temples painted floor-to-ceiling with murals, 153 Buddha statues.",              best:"Year-round", crowd:"Moderate", wiki:"Dambulla cave temple", lat:7.8675, lng:80.6517 },
    { name:"Galle Fort",     tag:"Dutch colonial ramparts",     desc:"UNESCO 17th-century Dutch fort with cobbled streets and the best café scene in the south.", best:"Nov–Apr", crowd:"High",     wiki:"Galle Fort", lat:6.0269, lng:80.2167 },
    { name:"Jaffna",         tag:"Tamil culture & cuisine",     desc:"Sri Lanka's north — Hindu temples with soaring gopurams, the island's spiciest cuisine.",  best:"May–Sep", crowd:"Low",      wiki:"Jaffna", lat:9.6615, lng:80.0255 },
    { name:"Kandy Temple of the Tooth", tag:"Sri Lanka's holiest relic", desc:"Houses the sacred tooth relic of the Buddha — evening puja ceremony is unmissable.", best:"Year-round", crowd:"High", wiki:"Temple of the Sacred Tooth Relic", lat:7.2936, lng:80.6413 },
    { name:"Nallur Kandaswamy Temple", tag:"Jaffna's golden gopuram", desc:"Sri Lanka's most important Hindu temple — a 25-day annual festival draws pilgrims from across the island.", best:"Jul–Aug", crowd:"Moderate", wiki:"Nallur Kandaswamy Temple", lat:9.6708, lng:80.0247 },
    { name:"Mihintale",      tag:"Birthplace of Buddhism in Sri Lanka", desc:"The sacred hill where Buddhism was first introduced to the island in 247 BC — 1,840 ancient steps to the summit stupa.", best:"Year-round", crowd:"Low", wiki:"Mihintale", lat:8.3583, lng:80.5083 },
    { name:"Aluvihare Rock Temple", tag:"Where Buddhist scriptures were first written", desc:"A cave temple complex near Matale where the Tripitaka was first committed to writing in the 1st century BC.", best:"Year-round", crowd:"Low", wiki:"Aluvihare Rock Temple", lat:7.5167, lng:80.6167 },
    { name:"Yapahuwa",       tag:"Forgotten rock fortress capital", desc:"A brief 13th-century royal capital on a rock outcrop — an ornate stone staircase and far fewer visitors than Sigiriya.", best:"Year-round", crowd:"Low", wiki:"Yapahuwa", lat:7.8333, lng:80.3000 },
    { name:"Kataragama",     tag:"Sacred multi-faith pilgrimage town", desc:"A unique site sacred to Buddhists, Hindus and Muslims alike — fire-walking rituals during the annual festival.", best:"Jul–Aug", crowd:"Moderate", wiki:"Kataragama", lat:6.4167, lng:81.3333 },
    { name:"Jaffna Fort",    tag:"Dutch colonial stronghold",    desc:"One of the largest Dutch-built forts in Asia, overlooking the lagoon — restored after decades of conflict.", best:"May–Sep", crowd:"Low", wiki:"Jaffna Fort", lat:9.6608, lng:80.0064 },
    { name:"Embekke Devalaya", tag:"Masterpiece of wood carving",  desc:"A 14th-century temple near Kandy famous for its intricately carved wooden pillars depicting Sri Lankan folklore.", best:"Year-round", crowd:"Low", wiki:"Embekke Devalaya", lat:7.2333, lng:80.6167 },
    { name:"Lankatilaka Temple", tag:"Gothic-Kandyan cave temple", desc:"A striking rock-built temple near Kandy blending Hindu and Buddhist architecture across multiple levels.", best:"Year-round", crowd:"Low", wiki:"Lankatilaka Vihara", lat:7.2500, lng:80.5667 },
  ],
  wildlife:[
    { name:"Yala National Park",    tag:"Highest leopard density",    desc:"World's highest leopard density per km². Sloth bears, crocs, 200+ bird species.",  best:"Feb–Jul", crowd:"High",     wiki:"Yala National Park", lat:6.3725, lng:81.5185 },
    { name:"Wilpattu National Park",tag:"Secretive & untouched",      desc:"Sri Lanka's largest park — lakes where leopards and sloth bears appear in silence.", best:"Feb–Oct", crowd:"Low",      wiki:"Wilpattu National Park", lat:8.4500, lng:80.0333 },
    { name:"Udawalawe",             tag:"Elephant sanctuary",         desc:"Herds of 30–50 elephants cross the grasslands at dusk. Also the Elephant Transit Home.", best:"Year-round", crowd:"Moderate", wiki:"Udawalawa National Park", lat:6.4567, lng:80.8986 },
    { name:"Sinharaja Rainforest",  tag:"UNESCO biosphere reserve",   desc:"Last wet lowland rainforest — 26 of Sri Lanka's 33 endemic birds found here.",     best:"Aug–Sep", crowd:"Low",      wiki:"Sinharaja Forest Reserve", lat:6.4093, lng:80.4904 },
    { name:"Minneriya",             tag:"The Gathering",              desc:"300+ wild elephants gather at the Minneriya tank Jul–Oct — largest in Asia.",        best:"Jul–Oct", crowd:"Moderate", wiki:"Minneriya National Park", lat:8.0333, lng:80.8833 },
    { name:"Bundala",               tag:"Flamingo wetlands",          desc:"Thousands of migratory flamingos and painted storks. Far quieter than Yala.",        best:"Sep–Mar", crowd:"Low",      wiki:"Bundala National Park", lat:6.1972, lng:81.2206 },
    { name:"Kumana National Park",  tag:"Birdwatcher's paradise",     desc:"Remote eastern park with vast bird colonies — far fewer visitors than Yala.",        best:"May–Sep", crowd:"Low",      wiki:"Kumana National Park", lat:6.5667, lng:81.6667 },
    { name:"Horagolla National Park", tag:"Urban wildlife sanctuary",  desc:"A small forest reserve near Colombo with monkeys, mongooses and over 100 bird species — easy day trip.", best:"Year-round", crowd:"Low", wiki:"Horagolla National Park", lat:7.0833, lng:80.0833 },
    { name:"Kalametiya Bird Sanctuary", tag:"Lagoon birdwatching",    desc:"A coastal lagoon sanctuary near Tangalle — flamingos, herons and crocodiles in a peaceful wetland.", best:"Sep–Mar", crowd:"Low", wiki:"Kalametiya", lat:6.0500, lng:80.8167 },
    { name:"Horowpathana", tag:"Elephant corridor sanctuary",       desc:"A lesser-known sanctuary connecting elephant migration routes between Wilpattu and Wasgamuwa.", best:"Year-round", crowd:"Low", wiki:"Horowpathana", lat:8.5833, lng:80.6167 },
    { name:"Wasgamuwa National Park", tag:"Largest elephant herds in Sri Lanka", desc:"Home to the densest elephant population on the island, plus leopards and sloth bears — rarely crowded.", best:"May–Sep", crowd:"Low", wiki:"Wasgamuwa National Park", lat:7.6167, lng:80.8167 },
    { name:"Pigeon Island", tag:"Coral reef marine park",            desc:"A protected marine sanctuary off Nilaveli — blacktip reef sharks, sea turtles and pristine coral.", best:"May–Sep", crowd:"Moderate", wiki:"Pigeon Island National Park", lat:8.7167, lng:81.2000 },
    { name:"Maduru Oya National Park", tag:"Remote elephant & deer reserve", desc:"A vast, rarely-visited eastern park with elephants, sambar deer and ancient irrigation ruins.", best:"May–Sep", crowd:"Low", wiki:"Maduru Oya National Park", lat:7.4500, lng:81.2333 },
    { name:"Galway's Land National Park", tag:"Nuwara Eliya's pocket forest", desc:"A small montane forest reserve in the heart of Nuwara Eliya — easy walking trails and rich birdlife.", best:"Year-round", crowd:"Low", wiki:"Galway's Land National Park", lat:6.9667, lng:80.7667 },
    { name:"Lunugamvehera National Park", tag:"Elephant corridor between Yala & Udawalawe", desc:"A connecting park between two famous reserves — large elephant herds with far fewer safari jeeps.", best:"Feb–Jul", crowd:"Low", wiki:"Lunugamvehera National Park", lat:6.4500, lng:81.2167 },
  ],
  adventure:[
    { name:"Adam's Peak",           tag:"Sacred pilgrimage climb",    desc:"5,243-step night climb to Sri Lanka's holiest summit. Triangular shadow at sunrise.", best:"Dec–May", crowd:"High",  wiki:"Adam's Peak", lat:6.8094, lng:80.4994 },
    { name:"Ella Rock Hike",        tag:"Ridge walk above the clouds",desc:"3-hour hike through tea estates to 360° highland views. Best with a local guide.",   best:"Jan–Apr", crowd:"Moderate", wiki:"Ella Rock", lat:6.8500, lng:81.0333 },
    { name:"Kitulgala White Water", tag:"Class 3–4 rapids",           desc:"The Kelani River — filming location of 'Bridge on the River Kwai'. Best rafting.",   best:"May–Dec", crowd:"Moderate", wiki:"Kitulgala", lat:6.9897, lng:80.4178 },
    { name:"Pidurutalagala",        tag:"Sri Lanka's highest peak",   desc:"2,524m peak in the Central Highlands — shola forests, cloud forest, open grassland.", best:"Jan–Apr", crowd:"Low",    wiki:"Pidurutalagala", lat:6.9719, lng:80.7647 },
    { name:"Kite Surfing, Kalpitiya",tag:"Best kite conditions in Asia",desc:"15–25 knot winds 9 months/year — one of Asia's top kite surfing destinations.", best:"May–Oct", crowd:"Low",    wiki:"Kalpitiya", lat:8.2333, lng:79.7667 },
    { name:"Knuckles Camping",      tag:"Multi-day trek & wild camp", desc:"UNESCO Knuckles Range — 2–4 day treks through waterfalls and endemic orchid habitats.", best:"Feb–Apr", crowd:"Low",  wiki:"Knuckles Mountain Range", lat:7.4500, lng:80.7833 },
    { name:"Bodu Bala Surf, Weligama", tag:"Learn to surf",          desc:"Gentle beginner-friendly waves — the best place in Sri Lanka to take your first surf lesson.", best:"Nov–Apr", crowd:"Moderate", wiki:"Weligama", lat:5.9740, lng:80.4297 },
    { name:"Belilena Caves",  tag:"Prehistoric cave exploration",  desc:"A Stone Age cave system near Kitulgala where some of Sri Lanka's oldest human remains were discovered.", best:"Year-round", crowd:"Low", wiki:"Belilena Cave", lat:7.0167, lng:80.3833 },
    { name:"Diyaluma Falls Hike", tag:"Cliff-top natural infinity pool", desc:"Hike to the top of Sri Lanka's 2nd-tallest waterfall for a swim in natural rock pools with no barriers.", best:"Year-round", crowd:"Low", wiki:"Diyaluma Falls", lat:6.7333, lng:81.0167 },
    { name:"Mini World's End, Riverston", tag:"Off-grid cliff trek", desc:"A quieter alternative to Horton Plains — dramatic cliff views in the Knuckles range, almost no tourists.", best:"Jan–Apr", crowd:"Low", wiki:"Riverston, Sri Lanka", lat:7.4860, lng:80.7370 },
    { name:"Bopath Ella Hike", tag:"Leaf-shaped waterfall trek",    desc:"A short jungle hike to a perfectly bodhi-leaf-shaped waterfall near Ratnapura — virtually unknown to tourists.", best:"Year-round", crowd:"Low", wiki:"Bopath Ella Falls", lat:6.6833, lng:80.3833 },
    { name:"Knuckles Multi-Day Trek", tag:"Wilderness camping expedition", desc:"2-4 day treks through cloud forest, waterfalls and endemic orchid habitats in the UNESCO Knuckles range.", best:"Feb–Apr", crowd:"Low", wiki:"Knuckles Mountain Range", lat:7.4500, lng:80.7833 },
    { name:"Rock Climbing, Ritigala", tag:"Jungle rock scrambling",  desc:"Scramble through forgotten monastery ruins on a misty rock outcrop — part hike, part archaeological adventure.", best:"Year-round", crowd:"Low", wiki:"Ritigala", lat:8.1167, lng:80.6500 },
    { name:"Canyoning, Kitulgala", tag:"Waterfall abseiling",       desc:"Abseil down jungle waterfalls and swim through canyon pools near the Kelani River rafting hub.", best:"May–Dec", crowd:"Low", wiki:"Kitulgala", lat:6.9897, lng:80.4178 },
    { name:"Horton Plains Trek", tag:"World's End cliff hike",      desc:"A 9.5km loop hike to a sudden 1,000m vertical cliff drop through cloud forest and open plateau.", best:"Jan–Mar", crowd:"Moderate", wiki:"Horton Plains National Park", lat:6.8021, lng:80.7958 },
  ],
  rural:[
    { name:"Knuckles Villages",     tag:"Untouched mountain hamlets", desc:"Ancient villages tucked into the UNESCO Knuckles Range — homestays with farming families who still follow centuries-old traditions.", best:"Feb–Apr", crowd:"Low", wiki:"Knuckles Mountain Range", lat:7.4500, lng:80.7833 },
    { name:"Weligama Fisher Village",tag:"Dawn fish auction at sea",  desc:"Wake before sunrise to join the famous stilt fishermen. Watch the morning catch auctioned on the beach as the village comes to life.", best:"Nov–Apr", crowd:"Low", wiki:"Weligama", lat:5.9740, lng:80.4297 },
    { name:"Dambulla Farming Village",tag:"Paddy fields & spice gardens","desc":"Spend a day with a Sri Lankan farming family — plant paddy, harvest spices, cook over a wood fire and eat together on the floor.", best:"Year-round", crowd:"Low", wiki:"Dambulla", lat:7.8675, lng:80.6517 },
    { name:"Mahiyanganaya",         tag:"Vedda indigenous community", desc:"Meet the Vedda people, Sri Lanka's original indigenous inhabitants, who still maintain hunter-gatherer traditions in the jungle.", best:"Year-round", crowd:"Low", wiki:"Mahiyanganaya", lat:7.3333, lng:81.0167 },
    { name:"Belihuloya Valley",     tag:"Hidden river valley retreat",desc:"A little-known valley of paddy terraces, waterfalls and spice plantations near Ratnapura. Completely off the tourist trail.", best:"Year-round", crowd:"Low", wiki:"Belihuloya", lat:6.6333, lng:80.7167 },
    { name:"Tangalle Village Coast",tag:"Fishing village life",       desc:"Behind Tangalle's famous beach lies a maze of lagoon-side fishing villages — catamarans, crab baskets and roadside coconut sellers.", best:"Dec–Apr", crowd:"Low", wiki:"Tangalle", lat:6.0241, lng:80.7937 },
    { name:"Madu River Village",    tag:"Cinnamon island canoe trip", desc:"Paddle through mangroves to a cinnamon-peeling village deep in the Madu River wetlands.", best:"Year-round", crowd:"Low", wiki:"Madu River", lat:6.2667, lng:80.0500 },
    { name:"Anamaduwa Village",     tag:"Traditional rice farming village", desc:"A North Western paddy-farming village where you can plant rice by hand alongside local farmers.", best:"Year-round", crowd:"Low", wiki:"Anamaduwa", lat:8.0667, lng:80.0000 },
    { name:"Hambantota Salt Pans",  tag:"Traditional salt harvesting", desc:"Watch centuries-old salt harvesting techniques at the lewaya (salterns) on the southeastern coast.", best:"Year-round", crowd:"Low", wiki:"Hambantota", lat:6.1167, lng:81.1167 },
    { name:"Walawe Village Life",   tag:"Riverside farming community", desc:"A quiet village along the Walawe river where families farm and fish much as they have for generations.", best:"Year-round", crowd:"Low", wiki:"Walawe River", lat:6.4000, lng:80.8833 },
    { name:"Nilgala Forest Village", tag:"Vedda ancestral homeland",  desc:"Deep in Vedda indigenous territory — bow-hunting demonstrations and forest-honey gathering traditions.", best:"Year-round", crowd:"Low", wiki:"Nilgala", lat:7.1500, lng:81.1500 },
    { name:"Sooriyawewa Village",   tag:"Ancient tank irrigation farming", desc:"A farming community built around a 2,000-year-old reservoir, still used for paddy irrigation today.", best:"Year-round", crowd:"Low", wiki:"Sooriyawewa", lat:6.2667, lng:81.0167 },
    { name:"Kataragama Village Trail", tag:"Multi-faith pilgrim village", desc:"A rural community around the sacred town where Buddhist, Hindu and Muslim traditions blend daily.", best:"Year-round", crowd:"Low", wiki:"Kataragama", lat:6.4167, lng:81.3333 },
    { name:"Ridiyagama Farms",      tag:"Organic spice & dairy farm visit", desc:"A working organic farm near Hambantota offering hands-on spice harvesting and dairy demonstrations.", best:"Year-round", crowd:"Low", wiki:"Ridiyagama", lat:6.1500, lng:80.9500 },
    { name:"Ibbankatuwa Village",   tag:"Megalithic burial site village", desc:"A village near Dambulla built around one of Sri Lanka's oldest known burial grounds, dating back 2,700 years.", best:"Year-round", crowd:"Low", wiki:"Ibbankatuwa", lat:7.8500, lng:80.6000 },
  ],
  hidden:[
    { name:"Riverston",             tag:"Sri Lanka's Mini World's End", desc:"A lesser-known cliff viewpoint in the Knuckles range with the same dramatic drop as Horton Plains — but almost no tourists.", best:"Jan–Apr", crowd:"Low", wiki:"Riverston, Sri Lanka", lat:7.4860, lng:80.7370 },
    { name:"Meemure Village",       tag:"Sri Lanka's most remote village", desc:"Only reachable on foot or by jeep through the Knuckles — a time-capsule village with no real road access.", best:"Jan–Apr", crowd:"Low", wiki:"Meemure", lat:7.4090, lng:80.7960 },
    { name:"Diyaluma Falls",        tag:"Sri Lanka's 2nd tallest waterfall", desc:"220m falls with natural infinity pools at the top — hike up for a swim with almost no crowds.", best:"Year-round", crowd:"Low", wiki:"Diyaluma Falls", lat:6.7333, lng:81.0167 },
    { name:"Ritigala",              tag:"Forgotten monastery ruins",  desc:"Jungle-swallowed 1st-century monastic ruins on a misty mountain — one of Sri Lanka's least visited ancient sites.", best:"Year-round", crowd:"Low", wiki:"Ritigala", lat:8.1167, lng:80.6500 },
    { name:"Hiriwadunna Village",   tag:"Bullock cart & catamaran tour", desc:"A tiny village near Sigiriya where you ride a bullock cart, paddle a catamaran, and eat a home-cooked rural lunch.", best:"Year-round", crowd:"Low", wiki:"Hiriwadunna", lat:7.9000, lng:80.7000 },
    { name:"Bopath Ella Falls",     tag:"Bodhi-leaf shaped waterfall", desc:"A perfectly leaf-shaped waterfall near Ratnapura that almost no foreign tourists know about.", best:"Year-round", crowd:"Low", wiki:"Bopath Ella Falls", lat:6.6833, lng:80.3833 },
    { name:"Madunagala Hot Springs",tag:"Natural volcanic hot springs", desc:"Rare natural hot water springs in the south, believed to have healing properties — completely undeveloped.", best:"Year-round", crowd:"Low", wiki:"Madunagala", lat:6.2167, lng:80.9167 },
    { name:"Delft Island",          tag:"Wild ponies & baobab trees",   desc:"A remote coral island off Jaffna with feral horses descended from Dutch colonial stock and ancient baobabs.", best:"May–Sep", crowd:"Low", wiki:"Delft Island", lat:9.5167, lng:79.6833 },
    { name:"Galway's Land",         tag:"Nuwara Eliya's secret forest", desc:"A pocket of montane forest in the heart of Nuwara Eliya that almost no visitors know exists.", best:"Year-round", crowd:"Low", wiki:"Galway's Land National Park", lat:6.9667, lng:80.7667 },
    { name:"Yapahuwa Rock Fortress", tag:"The forgotten Sigiriya",     desc:"A 13th-century royal rock fortress with an ornate stone staircase — nearly identical drama to Sigiriya, near-zero crowds.", best:"Year-round", crowd:"Low", wiki:"Yapahuwa", lat:7.8333, lng:80.3000 },
    { name:"Kurulu Kele Bird Sanctuary", tag:"Unmapped birding hotspot", desc:"A small, locally-known forest patch near Anuradhapura where birders quietly spot rare endemic species.", best:"Year-round", crowd:"Low", wiki:"Anuradhapura birds", lat:8.3000, lng:80.3500 },
    { name:"Maragala Mountain",     tag:"Untouched eastern peak",       desc:"A rarely-climbed mountain near Monaragala with 360° views and a single-day hike almost no tourists attempt.", best:"Jan–Apr", crowd:"Low", wiki:"Maragala Mountain", lat:6.8667, lng:81.3500 },
    { name:"Kurundu Oya Falls",     tag:"Secret jungle waterfall",      desc:"A waterfall near Kitulgala known only to locals — reached via an unmarked jungle trail.", best:"Year-round", crowd:"Low", wiki:"Kitulgala waterfalls", lat:6.9833, lng:80.4000 },
    { name:"Nagadeepa Island",      tag:"Sacred island off Jaffna",     desc:"A tiny island temple accessible only by ferry — sacred to both Buddhists and Hindus, rarely visited by foreign tourists.", best:"May–Sep", crowd:"Low", wiki:"Nainativu", lat:9.5833, lng:79.7833 },
    { name:"Kurulu Bedda",          tag:"Hidden waterfall pool",         desc:"A secluded swimming hole near Galle reachable only via a guided jungle path — almost entirely unknown to tourists.", best:"Year-round", crowd:"Low", wiki:"Galle waterfalls", lat:6.1167, lng:80.2667 },
  ],
};

// Curated gallery image keywords for the small photo strip shown per place card
const PLACE_GALLERY_KEYWORDS = {};
Object.values(DESTINATIONS).flat().forEach(p => {
  PLACE_GALLERY_KEYWORDS[p.name] = [
    `${p.name} Sri Lanka landscape`,
    `${p.name} Sri Lanka aerial view`,
    `${p.name} Sri Lanka close up`,
  ];
});

// ─── SHARED GEO LOOKUP (place name → lat/lng) ────────────────────────────────
// Built from DESTINATIONS region data — used to intelligently match a newly
// added place (from Destinations or the Sri Lanka Map) to the closest day
// in the tourist's existing itinerary, rather than always dumping it on Day 1.
const PLACE_GEO = {};
Object.values(DESTINATIONS).flat().forEach(p => {
  if (p.lat && p.lng) PLACE_GEO[p.name] = { lat:p.lat, lng:p.lng };
});

function haversineKm(a, b) {
  if (!a || !b) return 99999;
  const R = 6371, dLat = (b.lat-a.lat)*Math.PI/180, dLng = (b.lng-a.lng)*Math.PI/180;
  const x = Math.sin(dLat/2)**2 + Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
}

// Finds the index of the itinerary day whose location is geographically
// closest to the new place being added. Falls back to Day 1 if no
// coordinates are known for either side (can't compute a sensible match).
function findBestMatchingDay(itin, placeName, placeLatLng) {
  if (!itin?.days?.length) return 0;
  const targetGeo = placeLatLng || PLACE_GEO[placeName];
  if (!targetGeo) return 0; // unknown location — safest is Day 1

  let bestIdx = 0, bestDist = Infinity;
  itin.days.forEach((d, i) => {
    // Try to resolve this day's location string against known place coordinates
    const dayLocClean = (d.location||"").split(",")[0].trim();
    const dayGeo = PLACE_GEO[dayLocClean] ||
      Object.keys(PLACE_GEO).find(k => dayLocClean.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(dayLocClean.toLowerCase()));
    const resolvedGeo = typeof dayGeo === "string" ? PLACE_GEO[dayGeo] : dayGeo;
    if (resolvedGeo) {
      const dist = haversineKm(targetGeo, resolvedGeo);
      if (dist < bestDist) { bestDist = dist; bestIdx = i; }
    }
  });
  // If nothing matched within 60km of any day, it doesn't really belong anywhere specific —
  // still place it on the closest day found (better than always defaulting to Day 1 blindly)
  return bestIdx;
}

// ─── GUIDE DATA ──────────────────────────────────────────────────────────────
const GUIDES = [
  { id:1, initials:"CP", g1:"#B9CFC5", g2:"#1F7A5C", gtxt:"#04342C",
    name:"Chaminda Perera", specialty:"Beach & Coastal Expert",
    areas:"Southern Coast · East Coast · Trincomalee", langs:"English · Sinhala · German",
    exp:8, rating:4.9, reviews:47, ministry:true,
    bio:"Chaminda grew up in Galle and has spent 8 years sharing the magic of Sri Lanka's coastline. From secret surf spots to whale-watching expeditions, his southern and eastern shore knowledge is unmatched. He holds a first-aid certification and is fluent in three languages.",
    tours:["Southern Coast Grand Tour","Whale Watching Day","East Coast Sunrise Drive","Galle Fort History Walk"],
    rev1:{ who:"James T. — United Kingdom", stars:5, text:"Chaminda took us to a secret snorkelling bay not in any guidebook. His passion for Sri Lanka is infectious." },
    rev2:{ who:"Lisa K. — Germany", stars:5, text:"Sehr freundlich und professionell! Wir empfehlen ihn wärmstens weiter — best guide we've ever had." },
  },
  { id:2, initials:"NF", g1:"#C9AD7C", g2:"#8A6A34", gtxt:"#2C1800",
    name:"Nalini Fernando", specialty:"Hill Country & Tea Trails",
    areas:"Kandy · Nuwara Eliya · Ella · Haputale", langs:"English · Tamil · French",
    exp:6, rating:4.8, reviews:32, ministry:true,
    bio:"Nalini was born in Kandy and grew up among the misty tea estates of the Central Highlands. She studied tourism at the University of Peradeniya and specialises in culturally immersive experiences — tea factory visits, temple ceremonies, village homestays.",
    tours:["Ella Train & Nine Arch Bridge","Tea Plucking Experience","Kandy Temple of Tooth","Knuckles Mountain Trek"],
    rev1:{ who:"Sophie M. — France", stars:5, text:"Nalini est une guide extraordinaire. Elle nous a fait découvrir des endroits magnifiques loin des sentiers battus." },
    rev2:{ who:"Aarav S. — India", stars:5, text:"Our Ella trip was perfect. Nalini timed the train ride perfectly and knew every viewpoint." },
  },
  { id:3, initials:"RJ", g1:"#F5C4B3", g2:"#8B4B3B", gtxt:"#3A1208",
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
    <span style={{ fontSize:11, fontWeight:600, padding:"4px 11px", borderRadius:20, letterSpacing:.2,
      background:amber?C.amberLight:green?C.tealLight:C.tealLight,
      color:amber?C.amber:green?C.teal:C.teal }}>{children}</span>
  );
}
function Stars({ n }) { return <span style={{color:C.amberMid}}>{"★".repeat(n)}</span>; }
function Btn({ onClick, children, variant="teal", full, style:xtra={} }) {
  const bg  = variant==="amber"?C.amber:variant==="outline"?"transparent":C.teal;
  const clr = variant==="outline"?C.inkSoft:"#fff";
  const brd = variant==="outline"?`1.5px solid ${C.border}`:"none";
  const shadow = variant==="outline"?"none":"0 2px 10px rgba(20,20,18,.14)";
  return (
    <button onClick={onClick} style={{ padding:"11px 26px", background:bg, color:clr, border:brd,
      borderRadius:10, fontSize:14, fontWeight:600, cursor:"pointer", width:full?"100%":undefined,
      fontFamily:sans, letterSpacing:"0.1px", boxShadow:shadow,
      transition:"transform .15s ease, box-shadow .15s ease, opacity .15s ease", ...xtra }}
      onMouseEnter={e=>{ e.currentTarget.style.opacity="0.92"; e.currentTarget.style.transform="translateY(-1px)"; if(variant!=="outline") e.currentTarget.style.boxShadow="0 4px 18px rgba(20,20,18,.2)"; }}
      onMouseLeave={e=>{ e.currentTarget.style.opacity="1"; e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow=shadow; }}>{children}</button>
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

// ─── PEXELS IMAGE SYSTEM (replaces dead source.unsplash.com) ────────────────
// source.unsplash.com was permanently shut down — all destination/gallery
// photos now come from the Pexels API via our backend proxy, with an
// in-memory client cache so repeat lookups for the same place are instant.
const PHOTOS_BASE = import.meta.env.PROD ? "/api/photos" : "http://localhost:3001/api/photos";
const photoCache = {}; // query -> photos[]
const photoFetchPromises = {}; // query -> in-flight promise (dedupe concurrent calls)

async function fetchPexelsPhotos(query, count=6) {
  if (photoCache[query]) return photoCache[query];
  if (photoFetchPromises[query]) return photoFetchPromises[query];
  const promise = (async () => {
    try {
      const res = await fetch(`${PHOTOS_BASE}/search?query=${encodeURIComponent(query)}&count=${count}`);
      const data = await res.json();
      const photos = data.photos || [];
      photoCache[query] = photos;
      return photos;
    } catch {
      photoCache[query] = [];
      return [];
    } finally {
      delete photoFetchPromises[query];
    }
  })();
  photoFetchPromises[query] = promise;
  return promise;
}

// Get a single cover photo URL for a place (synchronous-style via hook below)
function useDestPhoto(placeName) {
  const [url, setUrl] = useState(null);
  useEffect(()=>{
    if (!placeName) return;
    let active = true;
    const keyword = UNSPLASH_KEYWORDS[placeName]
      ? UNSPLASH_KEYWORDS[placeName].replace(/-/g," ")
      : `${placeName} Sri Lanka`;
    fetchPexelsPhotos(keyword, 3).then(photos=>{
      if (active && photos.length) setUrl(photos[0].url);
    });
    return ()=>{ active=false; };
  },[placeName]);
  return url;
}

// Get a small gallery (array of photo objects) for a place
function useDestGallery(placeName, count=6) {
  const [photos, setPhotos] = useState([]);
  useEffect(()=>{
    if (!placeName) { setPhotos([]); return; }
    let active = true;
    const keyword = UNSPLASH_KEYWORDS[placeName]
      ? UNSPLASH_KEYWORDS[placeName].replace(/-/g," ")
      : `${placeName} Sri Lanka`;
    fetchPexelsPhotos(keyword, count).then(p=>{ if (active) setPhotos(p); });
    return ()=>{ active=false; };
  },[placeName, count]);
  return photos;
}

// Reusable cover-image component backed by Pexels — replaces broken <img src={getUnsplashUrl(...)}>
function DestImage({ placeName, alt, style }) {
  const url = useDestPhoto(placeName);
  if (!url) return <div style={{ ...style, background:"rgba(255,255,255,.08)" }}/>;
  return <img src={url} alt={alt||placeName} style={style} onError={e=>e.target.style.display="none"}/>;
}

// Reusable mini gallery strip (3 small thumbnails) backed by Pexels
function DestGalleryStrip({ placeName, onOpenGallery }) {
  const photos = useDestGallery(placeName, 3);
  if (!photos.length) {
    return (
      <div style={{ display:"flex", gap:4, marginBottom:10 }}>
        {[0,1,2].map(i=><div key={i} style={{ flex:1, height:44, borderRadius:6, background:C.surface }}/>)}
      </div>
    );
  }
  return (
    <div style={{ display:"flex", gap:4, marginBottom:10 }} onClick={e=>e.stopPropagation()}>
      {photos.slice(0,3).map((p,i)=>(
        <div key={p.id||i} onClick={onOpenGallery} style={{ flex:1, height:44, borderRadius:6, overflow:"hidden", cursor:"pointer" }}>
          <img src={p.url_small||p.url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>e.target.style.opacity=0}/>
        </div>
      ))}
    </div>
  );
}

// Legacy-compatible getUnsplashUrl — now returns null synchronously since
// Pexels requires an async fetch. Components using this should migrate to
// useDestPhoto(). Kept only so any remaining call sites don't crash.
function getUnsplashUrl() { return null; }
function getUnsplashGallery() { return []; }

// ─── PLACE IMAGE HOOK (Pexels-backed, used by gallery/cards) ────────────────
function useWikiImages(title, count=6) {
  const [imgs, setImgs] = useState([]);
  const [thumb, setThumb] = useState(null);

  useEffect(() => {
    if (!title) return;
    let active = true;
    const keyword = UNSPLASH_KEYWORDS[title]
      ? UNSPLASH_KEYWORDS[title].replace(/-/g," ")
      : `${title} Sri Lanka`;
    fetchPexelsPhotos(keyword, count).then(photos => {
      if (!active) return;
      const urls = photos.map(p => p.url);
      setThumb(urls[0] || null);
      setImgs(urls);
    });
    return () => { active = false; };
  }, [title, count]);

  return { thumb, imgs };
}

// ─── PLACE CARD (with Wikipedia cover photo) ─────────────────────────────────
function PlaceCard({ p, catColor, onGallery, onPlanTrip }) {
  const { thumb } = useWikiImages(p.wiki, 1);
  const crowdColor  = { Low:"#3A6B10", Moderate:C.amber, High:C.coral };
  const crowdBg     = { Low:"#E6EEEA", Moderate:C.amberLight, High:C.coralLight };
  const crowdBorder = { Low:"#B9CFC5", Moderate:"#DFCBA0", High:"#DCC5BC" };

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
  html, body { max-width: 100%; overflow-x: hidden; }
  #root { max-width: 100vw; overflow-x: hidden; }
  img, svg, video, table { max-width: 100%; }

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
    .activity-row-collapsed { gap: 8px !important; }

    /* Draggable itinerary row — shrink handle/swap button so text has room */
    .drag-handle { font-size: 12px !important; margin-top: 10px !important; }
    .swap-btn { padding: 4px 6px !important; font-size: 11px !important; margin-top: 6px !important; }
    .drag-act-row { padding: 6px 2px !important; gap: 2px !important; }

    /* Journey map scroll hint */
    .journey-map { overflow-x: auto !important; -webkit-overflow-scrolling: touch !important; }

    /* Destination tabs — scrollable */
    .dest-tabs { overflow-x: auto !important; -webkit-overflow-scrolling: touch !important; white-space: nowrap !important; }

    /* Region sub-tabs */
    .region-tabs { flex-wrap: nowrap !important; overflow-x: auto !important; }

    /* Hero section padding */
    .hero-section { padding: 3rem 1rem 2rem !important; }

    /* Premium/payment modals — ensure they never overflow narrow screens */
    .premium-modal { max-width: calc(100vw - 28px) !important; }

    /* Admin panel — collapse the sidebar to icon-only so guide list + detail fit */
    .admin-nav-sidebar { width: 60px !important; }
    .admin-nav-label { display: none !important; }
    .admin-nav-section-title { display: none !important; }
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
function NavWithAuth({ page, setPage, onGuideOpen, user, signOut, onSignInClick, viewMode, setViewMode }) {
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [destHover, setDestHover] = useState(false);
  const [langOpen,  setLangOpen]  = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const hoverTimer = useRef(null);
  const { lang, setLang, t } = useLang();
  const currentLangObj = LANGUAGES.find(l=>l.code===lang) || LANGUAGES[0];
  const isGuideMode = viewMode === "guide";

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
          <span onClick={()=>setPage("home")} style={{ fontSize:14, color:page==="home"?C.teal:C.inkSoft, fontWeight:page==="home"?600:400, cursor:"pointer", borderBottom:page==="home"?`2px solid ${C.teal}`:"2px solid transparent", paddingBottom:2 }}>{t("nav_home")}</span>

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

          <span onClick={()=>setPage("srilankamap")} style={{ fontSize:14, color:page==="srilankamap"?C.teal:C.inkSoft, fontWeight:page==="srilankamap"?600:400, cursor:"pointer", borderBottom:page==="srilankamap"?`2px solid ${C.teal}`:"2px solid transparent", paddingBottom:2, whiteSpace:"nowrap" }}>{t("nav_map")}</span>
          <span onClick={()=>setPage("journey")} style={{ fontSize:14, color:page==="journey"?C.teal:C.inkSoft, fontWeight:page==="journey"?600:400, cursor:"pointer", borderBottom:page==="journey"?`2px solid ${C.teal}`:"2px solid transparent", paddingBottom:2, whiteSpace:"nowrap" }}>{t("nav_plan")}</span>
          <span onClick={onGuideOpen} style={{ fontSize:14, color:C.inkSoft, cursor:"pointer", paddingBottom:2, whiteSpace:"nowrap" }}>{t("nav_findguide")}</span>
          <span onClick={()=>setPage("about")} style={{ fontSize:14, color:page==="about"?C.teal:C.inkSoft, fontWeight:page==="about"?600:400, cursor:"pointer", borderBottom:page==="about"?`2px solid ${C.teal}`:"2px solid transparent", paddingBottom:2, whiteSpace:"nowrap" }}>About</span>
          {isGuideMode && (
            <span onClick={()=>setPage("guideportal")} style={{ fontSize:14, color:page==="guideportal"?C.teal:C.inkSoft, fontWeight:page==="guideportal"?600:400, cursor:"pointer", borderBottom:page==="guideportal"?"2px solid "+C.teal:"2px solid transparent", paddingBottom:2, whiteSpace:"nowrap" }}>Guide Dashboard</span>
          )}
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {/* Language switcher */}
          <div style={{ position:"relative" }}>
            <button onClick={()=>setLangOpen(o=>!o)} style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 10px", background:"none", border:`1px solid ${C.border}`, borderRadius:10, cursor:"pointer", fontFamily:sans, fontSize:13 }}>
              <span>{currentLangObj.flag}</span>
              <span style={{ fontSize:11, fontWeight:600, color:C.inkSoft, display:"none" }} className="lang-code-label">{currentLangObj.code.toUpperCase()}</span>
              <span style={{ fontSize:9, opacity:.6 }}>▾</span>
            </button>
            {langOpen && (
              <>
                <div onClick={()=>setLangOpen(false)} style={{ position:"fixed", inset:0, zIndex:450 }}/>
                <div style={{ position:"absolute", top:"calc(100% + 8px)", right:0, background:"#fff", borderRadius:12, boxShadow:"0 8px 30px rgba(0,0,0,.15)", border:`1px solid ${C.border}`, padding:6, width:160, zIndex:500 }}>
                  {LANGUAGES.map(l=>(
                    <div key={l.code} onClick={()=>{ setLang(l.code); setLangOpen(false); }} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px", borderRadius:8, cursor:"pointer", background:lang===l.code?C.tealPale:"transparent", fontSize:13, color:lang===l.code?C.teal:C.ink, fontWeight:lang===l.code?600:400 }}
                      onMouseEnter={e=>{ if(lang!==l.code) e.currentTarget.style.background=C.surface; }}
                      onMouseLeave={e=>{ if(lang!==l.code) e.currentTarget.style.background="transparent"; }}>
                      <span style={{ fontSize:16 }}>{l.flag}</span><span>{l.label}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          {/* Auth button */}
          {user ? (
            <div style={{ display:"flex", alignItems:"center", gap:8, position:"relative" }}>
              <div onClick={()=>setAccountOpen(o=>!o)} style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }} title="Account">
                <div style={{ width:32, height:32, borderRadius:"50%", background:C.teal, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700 }}>
                  {displayName?.[0]?.toUpperCase()||"U"}
                </div>
                <span style={{ fontSize:13, fontWeight:600, color:C.ink }}>{displayName}</span>
                {isGuideMode && <span style={{ fontSize:9, fontWeight:700, padding:"2px 7px", borderRadius:10, background:C.amberLight, color:C.amber, textTransform:"uppercase", letterSpacing:.4 }}>Guide</span>}
                <ChevronDown size={13} style={{ color:C.inkSoft }}/>
              </div>
              {accountOpen && (
                <>
                  <div onClick={()=>setAccountOpen(false)} style={{ position:"fixed", inset:0, zIndex:450 }}/>
                  <div style={{ position:"absolute", top:"calc(100% + 8px)", right:0, background:"#fff", borderRadius:14, boxShadow:"0 8px 30px rgba(0,0,0,.15)", border:`1px solid ${C.border}`, padding:6, width:220, zIndex:500 }}>
                    <div onClick={()=>{ setPage(isGuideMode?"guideportal":"myitineraries"); setAccountOpen(false); }}
                      style={{ padding:"10px 12px", borderRadius:9, cursor:"pointer", fontSize:13, fontWeight:600, color:C.ink }}
                      onMouseEnter={e=>e.currentTarget.style.background=C.surface} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      {isGuideMode ? "🧭 Guide Dashboard" : "🗺️ My Itineraries"}
                    </div>
                    <div style={{ height:1, background:C.border, margin:"4px 0" }}/>
                    <div onClick={()=>{ setViewMode(isGuideMode?"tourist":"guide"); setPage(isGuideMode?"home":"guideportal"); setAccountOpen(false); }}
                      style={{ padding:"10px 12px", borderRadius:9, cursor:"pointer", fontSize:13, fontWeight:600, color:C.teal }}
                      onMouseEnter={e=>e.currentTarget.style.background=C.tealPale} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      {isGuideMode ? "Switch to tourist view" : "Switch to guide view"}
                    </div>
                    <div style={{ height:1, background:C.border, margin:"4px 0" }}/>
                    <div onClick={()=>{ signOut(); setViewMode("tourist"); setAccountOpen(false); }}
                      style={{ padding:"10px 12px", borderRadius:9, cursor:"pointer", fontSize:13, color:C.inkSoft }}
                      onMouseEnter={e=>e.currentTarget.style.background=C.surface} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      {t("nav_signout")}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div style={{ position:"relative" }}>
              <button onClick={()=>setSignInOpen(o=>!o)} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", background:"transparent", color:C.teal, border:`1.5px solid ${C.teal}`, borderRadius:12, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:sans }}>
                {t("nav_signin")} <ChevronDown size={13}/>
              </button>
              {signInOpen && (
                <>
                  <div onClick={()=>setSignInOpen(false)} style={{ position:"fixed", inset:0, zIndex:450 }}/>
                  <div style={{ position:"absolute", top:"calc(100% + 8px)", right:0, background:"#fff", borderRadius:14, boxShadow:"0 8px 30px rgba(0,0,0,.15)", border:`1px solid ${C.border}`, padding:6, width:220, zIndex:500 }}>
                    <div onClick={()=>{ setSignInOpen(false); onSignInClick("tourist"); }}
                      style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:9, cursor:"pointer" }}
                      onMouseEnter={e=>e.currentTarget.style.background=C.surface} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <span style={{ width:30, height:30, borderRadius:9, background:C.tealLight, color:C.teal, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><Users size={15}/></span>
                      <div><div style={{ fontSize:13, fontWeight:600, color:C.ink }}>Sign in as tourist</div><div style={{ fontSize:11, color:C.inkSoft }}>Plan trips, book guides</div></div>
                    </div>
                    <div onClick={()=>{ setSignInOpen(false); onSignInClick("guide"); }}
                      style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:9, cursor:"pointer" }}
                      onMouseEnter={e=>e.currentTarget.style.background=C.surface} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <span style={{ width:30, height:30, borderRadius:9, background:C.amberLight, color:C.amber, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><Compass size={15}/></span>
                      <div><div style={{ fontSize:13, fontWeight:600, color:C.ink }}>Sign in as guide</div><div style={{ fontSize:11, color:C.inkSoft }}>Manage bids & bookings</div></div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          <button onClick={()=>setPage("journey")} style={{ padding:"9px 18px", background:C.teal, color:"#fff", border:"none", borderRadius:12, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:sans, whiteSpace:"nowrap" }}>{t("nav_planmytrip")}</button>
          <button onClick={()=>setMenuOpen(o=>!o)} style={{ display:"flex", flexDirection:"column", gap:5, padding:8, background:"none", border:`1px solid ${C.border}`, borderRadius:10, cursor:"pointer" }}>
            <span style={{ width:20, height:2, background:menuOpen?C.teal:C.ink, borderRadius:2 }}/>
            <span style={{ width:20, height:2, background:menuOpen?C.teal:C.ink, borderRadius:2 }}/>
            <span style={{ width:20, height:2, background:menuOpen?C.teal:C.ink, borderRadius:2 }}/>
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div style={{ position:"fixed", top:64, left:0, right:0, zIndex:399, background:"#fff", borderBottom:`1px solid ${C.border}`, boxShadow:"0 8px 24px rgba(0,0,0,.1)", padding:"0.5rem 1.25rem 1.25rem", maxHeight:"85vh", overflowY:"auto" }}>
          {[["home",t("nav_home"),MapPin],["destinations",t("nav_destinations"),Compass],["srilankamap",t("nav_map"),Globe2],["journey",t("nav_plan"),Sparkles],["guides",t("nav_findguide"),Users],["about","About",ShieldCheck],...(isGuideMode?[["guideportal","Guide Dashboard",Award]]:[])].map(([p,l,Icon])=>(
            <div key={p} onClick={()=>{ if(p==="guides") onGuideOpen(); else setPage(p); setMenuOpen(false); }} style={{ padding:"11px 2px", fontSize:14.5, fontWeight:page===p?600:400, color:page===p?C.teal:C.ink, cursor:"pointer", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ width:20, display:"flex", alignItems:"center", justifyContent:"center", color:page===p?C.teal:C.inkSoft }}><Icon size={16}/></span>{l}
            </div>
          ))}
          {/* Compact language row inside mobile menu */}
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", padding:"12px 0 4px" }}>
            {LANGUAGES.map(lg=>(
              <button key={lg.code} onClick={()=>setLang(lg.code)} style={{ padding:"6px 10px", borderRadius:20, border:`1.5px solid ${lang===lg.code?C.teal:C.border}`, background:lang===lg.code?C.tealPale:"#fff", color:lang===lg.code?C.teal:C.inkSoft, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:sans }}>{lg.flag} {lg.code.toUpperCase()}</button>
            ))}
          </div>
          {user ? (
            <>
              <div onClick={()=>{ setPage(isGuideMode?"guideportal":"myitineraries"); setMenuOpen(false); }} style={{ padding:"11px 2px", fontSize:14.5, fontWeight:600, color:C.ink, cursor:"pointer", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ width:20, display:"flex", alignItems:"center", justifyContent:"center", color:C.inkSoft }}>{isGuideMode?<Award size={16}/>:<MapPin size={16}/>}</span>{isGuideMode?"Guide Dashboard":"My Itineraries"}
              </div>
              <div onClick={()=>{ setViewMode(isGuideMode?"tourist":"guide"); setPage(isGuideMode?"home":"guideportal"); setMenuOpen(false); }}
                style={{ padding:"11px 2px", fontSize:14.5, fontWeight:600, color:C.teal, cursor:"pointer", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ width:20, display:"flex", alignItems:"center", justifyContent:"center" }}><Compass size={16}/></span>
                {isGuideMode ? "Switch to tourist view" : "Switch to guide view"}
              </div>
              <div style={{ marginTop:10, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:13, color:C.ink, display:"flex", alignItems:"center", gap:6 }}><Users size={14}/> {displayName}{isGuideMode && <span style={{ fontSize:9, fontWeight:700, padding:"2px 7px", borderRadius:10, background:C.amberLight, color:C.amber, textTransform:"uppercase" }}>Guide</span>}</span>
                <button onClick={()=>{ signOut(); setViewMode("tourist"); setMenuOpen(false); }} style={{ fontSize:12, color:C.coral, background:"none", border:`1px solid ${C.coral}`, borderRadius:8, padding:"5px 12px", cursor:"pointer", fontFamily:sans }}>{t("nav_signout")}</button>
              </div>
            </>
          ) : (
            <div style={{ marginTop:10, display:"flex", flexDirection:"column", gap:8 }}>
              <button onClick={()=>{ onSignInClick("tourist"); setMenuOpen(false); }} style={{ width:"100%", padding:"11px", background:"transparent", color:C.teal, border:`1.5px solid ${C.teal}`, borderRadius:12, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:sans }}>Sign in as tourist</button>
              <button onClick={()=>{ onSignInClick("guide"); setMenuOpen(false); }} style={{ width:"100%", padding:"11px", background:"transparent", color:C.amber, border:`1.5px solid ${C.amber}`, borderRadius:12, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:sans }}>Sign in as guide</button>
            </div>
          )}
          <button onClick={()=>{ setPage("journey"); setMenuOpen(false); }} style={{ marginTop:8, width:"100%", padding:"11px", background:C.teal, color:"#fff", border:"none", borderRadius:12, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:sans }}>{t("hero_cta1")}</button>
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
          {[["home","🏠 Home"],["destinations","🗺️ Destinations"],["srilankamap","🗺️ Sri Lanka Map"],["journey","✨ Plan a trip"],["guides","🧭 Find a Guide"],["contact","✉️ Contact us"]].map(([p,l])=>(
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
        <rect x="55" y="80" width="50" height="130" rx="4" fill="#C9AD7C"/><polygon points="55,80 80,20 105,80" fill="#A9895A"/>
        <rect x="68" y="110" width="10" height="14" rx="2" fill="#0E4A3D"/><rect x="82" y="110" width="10" height="14" rx="2" fill="#0E4A3D"/>
        <ellipse cx="30" cy="190" rx="18" ry="22" fill="#1F7A5C"/><ellipse cx="130" cy="188" rx="16" ry="20" fill="#1F7A5C"/>
      </svg>
      <svg style={{ position:"absolute", left:"4%", bottom:"22%", width:110, opacity:.18 }} viewBox="0 0 120 100" fill="none">
        <ellipse cx="65" cy="60" rx="40" ry="28" fill="#C9AD7C"/><ellipse cx="30" cy="55" rx="18" ry="14" fill="#C9AD7C"/>
        <path d="M18 62 Q8 75 12 85 Q14 90 18 88" stroke="#A9895A" strokeWidth="5" fill="none" strokeLinecap="round"/>
        <ellipse cx="22" cy="50" rx="10" ry="12" fill="#A9895A"/><circle cx="24" cy="53" r="2.5" fill="#0E4A3D"/>
        <rect x="42" y="82" width="12" height="18" rx="4" fill="#A9895A"/><rect x="58" y="82" width="12" height="18" rx="4" fill="#A9895A"/>
        <rect x="74" y="82" width="12" height="18" rx="4" fill="#A9895A"/><rect x="88" y="82" width="12" height="18" rx="4" fill="#A9895A"/>
      </svg>
      <svg style={{ position:"absolute", left:"13%", top:"7%", width:86, opacity:.17 }} viewBox="0 0 100 150" fill="none">
        <ellipse cx="50" cy="80" rx="36" ry="44" fill="#C9AD7C"/><rect x="28" y="110" width="44" height="18" rx="2" fill="#A9895A"/>
        <rect x="20" y="128" width="60" height="10" rx="2" fill="#A9895A"/><rect x="46" y="20" width="8" height="60" rx="2" fill="#A9895A"/>
        <polygon points="42,30 50,8 58,30" fill="#C9AD7C"/>
      </svg>
      <svg style={{ position:"absolute", right:"2%", bottom:"10%", width:78, opacity:.17 }} viewBox="0 0 90 160" fill="none">
        <rect x="40" y="60" width="10" height="100" rx="3" fill="#A9895A"/>
        <path d="M45,60 Q20,40 5,50" stroke="#1F7A5C" strokeWidth="6" fill="none" strokeLinecap="round"/>
        <path d="M45,60 Q70,38 82,44" stroke="#1F7A5C" strokeWidth="6" fill="none" strokeLinecap="round"/>
        <path d="M45,60 Q30,30 35,15" stroke="#1F7A5C" strokeWidth="6" fill="none" strokeLinecap="round"/>
        <path d="M45,60 Q60,30 55,15" stroke="#1F7A5C" strokeWidth="6" fill="none" strokeLinecap="round"/>
      </svg>
      <svg style={{ position:"absolute", left:0, bottom:0, width:"55%", height:"30%", opacity:.1 }} viewBox="0 0 500 200" preserveAspectRatio="none" fill="none">
        <path d="M0,200 Q50,100 120,130 Q180,80 260,110 Q320,60 400,90 Q450,70 500,100 L500,200 Z" fill="#1F7A5C"/>
        <path d="M0,200 Q80,140 150,160 Q220,110 300,140 Q370,100 440,130 L500,140 L500,200 Z" fill="#0E4A3D"/>
      </svg>
      <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:.04 }}>
        <defs><pattern id="dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="white"/></pattern></defs>
        <rect width="100%" height="100%" fill="url(#dots)"/>
      </svg>
    </div>
  );
}

// ─── HOME PAGE ───────────────────────────────────────────────────────────────
// ─── SRI LANKA SLIDESHOW (home page) ─────────────────────────────────────────
const SLIDESHOW_SLIDES = [
  { name:"Sigiriya",       category:"Cultural",  title:"The Lion Rock Fortress", desc:"Climb a 5th-century citadel rising 200m above the jungle canopy — ancient frescoes, a mirror wall, and views that stretch for miles.", color:["#8A6A34","#6B4A26"] },
  { name:"Mirissa",        category:"Beaches",   title:"Where Whales Surface at Dawn", desc:"Golden sand fringed with palms, and some of the best blue-whale watching anywhere on Earth between November and April.", color:[C.tealMid,"#0A8060"] },
  { name:"Ella",           category:"Hill Country", title:"Misty Tea Country in the Clouds", desc:"Walk emerald tea ridges to the Nine Arch Bridge, catch the iconic blue train winding through the highlands.", color:["#2E5844","#1A3A2A"] },
  { name:"Yala National Park", category:"Wildlife", title:"The World's Densest Leopard Territory", desc:"Track leopards, elephants and sloth bears across golden grasslands in Sri Lanka's most thrilling national park.", color:["#0B3A30","#0A2A20"] },
  { name:"Galle Fort",     category:"Cultural",  title:"A Living Dutch Colonial Town", desc:"Cobbled ramparts, boutique cafés and centuries of history meet the Indian Ocean at this UNESCO World Heritage fort.", color:["#6B4A26","#4A2A05"] },
  { name:"Nine Arch Bridge", category:"Adventure", title:"Sri Lanka's Most Photographed Bridge", desc:"Watch the blue train thread through a colonial-era stone viaduct, framed by tea estates and morning mist.", color:["#8B4B3B","#7A2010"] },
  { name:"Nuwara Eliya",   category:"Hill Country", title:"Little England in the Clouds", desc:"Colonial bungalows, rose gardens, and manicured tea estates at 1,868m — Sri Lanka's coolest, quietest corner.", color:["#0E4A3D","#063D2E"] },
  { name:"Trincomalee",    category:"Beaches",   title:"Untouched Coral & Deep Harbours", desc:"Crystal waters, Pigeon Island's coral reef, and whale watching on Sri Lanka's least crowded coastline.", color:["#3C4E5C","#0D3A66"] },
];

function SriLankaSlideshow({ setPage }) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const slide = SLIDESHOW_SLIDES[idx];
  const photoUrl = useDestPhoto(slide.name);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIdx(i => (i+1) % SLIDESHOW_SLIDES.length), 5000);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <section
      onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)}
      style={{ position:"relative", height:"min(640px, 80vh)", overflow:"hidden", background:`linear-gradient(160deg,${slide.color[0]},${slide.color[1]})` }}>
      <style>{`
        @keyframes slideKenBurns { from{ transform:scale(1.08) translateX(0); } to{ transform:scale(1.18) translateX(-1.5%); } }
        @keyframes slideFadeIn { from{ opacity:0; transform:translateY(16px); } to{ opacity:1; transform:translateY(0); } }
        @keyframes slidePillPop { from{ opacity:0; transform:scale(.85); } to{ opacity:1; transform:scale(1); } }
        .slideshow-img { animation: slideKenBurns 6s ease-out forwards; }
        .slideshow-text > * { animation: slideFadeIn .6s ease both; }
        .slideshow-text > *:nth-child(1) { animation-delay:.05s; }
        .slideshow-text > *:nth-child(2) { animation-delay:.15s; }
        .slideshow-text > *:nth-child(3) { animation-delay:.25s; }
      `}</style>

      {/* Background photo with Ken Burns zoom */}
      {photoUrl && (
        <img key={slide.name} src={photoUrl} alt={slide.name} className="slideshow-img"
          style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }}/>
      )}
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(90deg, rgba(0,0,0,.65) 0%, rgba(0,0,0,.35) 45%, rgba(0,0,0,.15) 100%)" }}/>
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,.55) 0%, transparent 40%)" }}/>

      {/* Content */}
      <div key={idx+"-text"} className="slideshow-text" style={{ position:"relative", zIndex:2, height:"100%", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"3rem 2rem 4.5rem", maxWidth:1100, margin:"0 auto" }}>
        <span style={{ display:"inline-block", width:"fit-content", fontSize:11, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase", color:"#fff", background:`linear-gradient(135deg,${C.amberMid},${C.amber})`, padding:"6px 16px", borderRadius:30, marginBottom:16, animation:"slidePillPop .5s ease both .3s" }}>
          ✨ {slide.category}
        </span>
        <h2 style={{ fontFamily:serif, fontSize:"clamp(28px,5vw,48px)", fontWeight:700, color:"#fff", marginBottom:12, maxWidth:600, lineHeight:1.15 }}>{slide.title}</h2>
        <p style={{ fontSize:15, color:"rgba(255,255,255,.85)", maxWidth:520, lineHeight:1.7, marginBottom:24 }}>{slide.desc}</p>
        <div style={{ display:"flex", gap:12, alignItems:"center", flexWrap:"wrap" }}>
          <button onClick={()=>setPage("destinations")} style={{ padding:"12px 26px", background:C.amberMid, color:"#2C1800", fontSize:14, fontWeight:700, border:"none", borderRadius:12, cursor:"pointer", fontFamily:sans, boxShadow:"0 4px 20px rgba(169,137,90,.35)" }}>
            Explore {slide.name} →
          </button>
          <button onClick={()=>setPage("journey")} style={{ padding:"12px 22px", background:"rgba(255,255,255,.12)", color:"#fff", fontSize:13, fontWeight:600, border:"1px solid rgba(255,255,255,.3)", borderRadius:12, cursor:"pointer", fontFamily:sans, backdropFilter:"blur(6px)" }}>
            ✨ Plan a trip here
          </button>
        </div>
      </div>

      {/* Slide dots / progress indicators */}
      <div style={{ position:"absolute", bottom:20, left:"50%", transform:"translateX(-50%)", display:"flex", gap:8, zIndex:3 }}>
        {SLIDESHOW_SLIDES.map((s,i)=>(
          <button key={i} onClick={()=>setIdx(i)} aria-label={`Show ${s.name}`}
            style={{ width: i===idx?28:8, height:8, borderRadius:8, border:"none", cursor:"pointer", background: i===idx?C.amberMid:"rgba(255,255,255,.4)", transition:"width .3s,background .3s", padding:0 }}/>
        ))}
      </div>

      {/* Prev/Next arrows */}
      <button onClick={()=>setIdx(i=>(i-1+SLIDESHOW_SLIDES.length)%SLIDESHOW_SLIDES.length)} aria-label="Previous"
        style={{ position:"absolute", left:16, top:"50%", transform:"translateY(-50%)", width:42, height:42, borderRadius:"50%", border:"1px solid rgba(255,255,255,.3)", background:"rgba(0,0,0,.3)", color:"#fff", fontSize:18, cursor:"pointer", zIndex:3, backdropFilter:"blur(4px)" }}>‹</button>
      <button onClick={()=>setIdx(i=>(i+1)%SLIDESHOW_SLIDES.length)} aria-label="Next"
        style={{ position:"absolute", right:16, top:"50%", transform:"translateY(-50%)", width:42, height:42, borderRadius:"50%", border:"1px solid rgba(255,255,255,.3)", background:"rgba(0,0,0,.3)", color:"#fff", fontSize:18, cursor:"pointer", zIndex:3, backdropFilter:"blur(4px)" }}>›</button>
    </section>
  );
}

function HomePage({ setPage, onGuideOpen }) {
  const { t, ot } = useLang();
  return (
    <div>
      <section style={{ position:"relative", minHeight:"92vh", background:"linear-gradient(160deg,#0A2620 0%,#0E4A3D 38%,#0B3A30 60%,#9C6A10 100%)", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", padding:"6rem 2rem 5rem" }}>
        <HeroArt />
        <div style={{ position:"relative", zIndex:2, textAlign:"center", maxWidth:720 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(255,255,255,.12)", border:"1px solid rgba(255,255,255,.22)", borderRadius:40, padding:"6px 16px", fontSize:12, fontWeight:500, color:"rgba(255,255,255,.9)", letterSpacing:"0.5px", textTransform:"uppercase", marginBottom:28 }}>
            <span style={{ width:6, height:6, background:C.amberMid, borderRadius:"50%", display:"inline-block" }}/> {t("hero_badge")}
          </div>
          <h1 style={{ fontFamily:serif, fontSize:"clamp(38px,6vw,62px)", fontWeight:700, color:"#fff", lineHeight:1.1, marginBottom:22 }}>
            {t("hero_title1")}<br/><span style={{ color:C.amberMid, fontStyle:"italic" }}>{t("hero_title2")}</span><br/>{t("hero_title3")}
          </h1>
          <p style={{ fontSize:17, color:"rgba(255,255,255,.75)", maxWidth:520, margin:"0 auto 36px", lineHeight:1.7, fontWeight:300 }}>
            {t("hero_sub")}
          </p>
          <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
            <button onClick={()=>setPage("journey")} style={{ padding:"14px 32px", background:C.amberMid, color:"#2C1800", fontSize:15, fontWeight:600, border:"none", borderRadius:12, cursor:"pointer", boxShadow:"0 4px 20px rgba(169,137,90,.4)", fontFamily:sans }}>{t("hero_cta1")}</button>
            <button onClick={onGuideOpen} style={{ padding:"14px 32px", background:"rgba(255,255,255,.1)", color:"#fff", fontSize:15, fontWeight:500, border:"1px solid rgba(255,255,255,.35)", borderRadius:12, cursor:"pointer", backdropFilter:"blur(8px)", fontFamily:sans }}>{t("hero_cta2")}</button>
          </div>
          <div className="hero-stats" style={{ display:"flex", justifyContent:"center", gap:"3rem", marginTop:"4rem", paddingTop:"2.5rem", borderTop:"1px solid rgba(255,255,255,.12)" }}>
            {[["200+",t("stat_dest")],["150+",t("stat_guides")],["4.9★",t("stat_rating")],["12K+",t("stat_travellers")]].map(([n,l])=>(
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
          <div style={{ fontSize:11, fontWeight:600, color:C.tealMid, textTransform:"uppercase", letterSpacing:2, marginBottom:10 }}>{t("services_label")}</div>
          <h2 style={{ fontFamily:serif, fontSize:"clamp(28px,4vw,42px)", fontWeight:700, color:C.ink, marginBottom:14 }}>{t("services_title")}</h2>
        </div>
        <div className="services-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.5rem", maxWidth:900, margin:"0 auto" }}>
          <div onClick={()=>setPage("journey")} style={{ borderRadius:24, padding:"3rem 2.5rem", cursor:"pointer", background:"linear-gradient(145deg,#E6F8F2,#C8EFE2)", border:"1px solid #B2E5D0", transition:"transform .2s,box-shadow .2s" }}
            onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow="0 12px 40px rgba(0,0,0,.12)"; }}
            onMouseLeave={e=>{ e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}>
            <div style={{ width:64, height:64, borderRadius:18, background:"rgba(31,122,92,.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:30, marginBottom:20 }}>🗺️</div>
            <div style={{ display:"flex", gap:6, marginBottom:14 }}><Pill>AI-powered</Pill><Pill>Personalised</Pill></div>
            <h3 style={{ fontFamily:serif, fontSize:24, fontWeight:700, color:C.ink, marginBottom:10 }}>{t("svc1_title")}</h3>
            <p style={{ fontSize:14, color:C.inkSoft, lineHeight:1.7, marginBottom:24 }}>{t("svc1_desc")}</p>
            <Btn onClick={e=>{ e.stopPropagation(); setPage("journey"); }}>{t("svc1_cta")}</Btn>
          </div>
          <div onClick={onGuideOpen} style={{ borderRadius:24, padding:"3rem 2.5rem", cursor:"pointer", background:"linear-gradient(145deg,#F1ECE0,#FAE8BA)", border:"1px solid #DFCBA0", transition:"transform .2s,box-shadow .2s" }}
            onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow="0 12px 40px rgba(0,0,0,.12)"; }}
            onMouseLeave={e=>{ e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}>
            <div style={{ width:64, height:64, borderRadius:18, background:"rgba(138,106,52,.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:30, marginBottom:20 }}>🧭</div>
            <div style={{ display:"flex", gap:6, marginBottom:14 }}><Pill amber>Ministry verified</Pill><Pill amber>Bid system</Pill></div>
            <h3 style={{ fontFamily:serif, fontSize:24, fontWeight:700, color:C.ink, marginBottom:10 }}>{t("svc2_title")}</h3>
            <p style={{ fontSize:14, color:C.inkSoft, lineHeight:1.7, marginBottom:24 }}>{t("svc2_desc")}</p>
            <Btn variant="amber" onClick={e=>{ e.stopPropagation(); onGuideOpen(); }}>{t("svc2_cta")}</Btn>
          </div>
        </div>
      </section>

      {/* SRI LANKA SLIDESHOW — replaces the old broken category-card grid */}
      <SriLankaSlideshow setPage={setPage}/>

      {/* WHY */}
      <section style={{ padding:"5rem 2rem", background:C.white }}>
        <div style={{ maxWidth:1000, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:"3rem" }}>
            <div style={{ fontSize:11, fontWeight:600, color:C.tealMid, textTransform:"uppercase", letterSpacing:2, marginBottom:10 }}>{t("why_label")}</div>
            <h2 style={{ fontFamily:serif, fontSize:"clamp(26px,4vw,38px)", fontWeight:700, color:C.ink }}>{t("why_title")}</h2>
          </div>
          <div className="why-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1.5rem" }}>
            {[{Icon:Sparkles,t:t("why1_t"),s:t("why1_s")},{Icon:ShieldCheck,t:t("why2_t"),s:t("why2_s")},{Icon:MessageCircle,t:t("why3_t"),s:t("why3_s")},{Icon:Compass,t:t("why4_t"),s:t("why4_s")}].map(w=>(
              <div key={w.t} style={{ padding:"1.8rem 1.5rem", border:`1px solid ${C.border}`, borderRadius:20, transition:"border-color .2s" }}
                onMouseEnter={e=>e.currentTarget.style.borderColor=C.tealMid}
                onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                <div style={{ width:46, height:46, borderRadius:14, background:C.tealLight, color:C.teal, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14 }}><w.Icon size={21}/></div>
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
            <p style={{ fontSize:12, color:"rgba(255,255,255,.45)", marginTop:10, display:"flex", flexDirection:"column", gap:4 }}>
              <span style={{ display:"flex", alignItems:"center", gap:6 }}><Mail size={13}/> {BUSINESS_INFO.email}</span>
              <span style={{ display:"flex", alignItems:"center", gap:6 }}><MapPin size={13}/> {BUSINESS_INFO.address}</span>
            </p>
            <div style={{ display:"flex", gap:8, marginTop:14 }}>
              {SOCIAL_LINKS.map(s=>(
                <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" title={s.label}
                  style={{ width:32, height:32, borderRadius:"50%", background:"rgba(255,255,255,.08)", display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,.75)", textDecoration:"none", flexShrink:0 }}><SocialGlyph name={s.label} size={14}/></a>
              ))}
            </div>
          </div>
          <div style={{ display:"flex", gap:"3rem", flexWrap:"wrap" }}>
            {[["Explore",[["Destinations","destinations"],["Plan a Trip","journey"],["Find a Guide","__guide__"]]],["Company",[["About us","about"],["Contact","contact"]]],["Legal",[["Privacy Policy","privacy"],["Terms of Service","terms"]]]].map(([h,ls])=>(
              <div key={h}>
                <h5 style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,.5)", textTransform:"uppercase", letterSpacing:1, marginBottom:12 }}>{h}</h5>
                {ls.map(([l,target])=>(
                  <div key={l} onClick={()=>{ if(target==="__guide__") onGuideOpen(); else if(target) setPage(target); }}
                    style={{ fontSize:13, color:"rgba(255,255,255,.6)", marginBottom:8, cursor:target?"pointer":"default" }}>{l}</div>
                ))}
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
                <div style={{ width:56, height:56, borderRadius:10, overflow:"hidden", flexShrink:0, background:`linear-gradient(135deg,${C.teal},#0B3A30)` }}>
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
  "Bentota":"Southern Province", "Pasikuda":"Eastern Province",
  // Hills
  "Ella":"Uva Province", "Kandy":"Central Province", "Nuwara Eliya":"Central Province",
  "Haputale":"Uva Province", "Horton Plains":"Central Province", "Knuckles Range":"Central Province",
  "Bandarawela":"Uva Province",
  // Cultural
  "Sigiriya":"North Central Province", "Anuradhapura":"North Central Province",
  "Polonnaruwa":"North Central Province", "Dambulla Cave Temple":"Central Province",
  "Galle Fort":"Southern Province", "Jaffna":"Northern Province", "Kandy Temple of the Tooth":"Central Province",
  // Wildlife
  "Yala National Park":"Southern Province", "Wilpattu National Park":"North Western Province",
  "Udawalawe":"Southern Province", "Sinharaja Rainforest":"Southern Province",
  "Minneriya":"North Central Province", "Bundala":"Southern Province", "Kumana National Park":"Eastern Province",
  // Adventure
  "Adam's Peak":"Sabaragamuwa Province", "Ella Rock Hike":"Uva Province",
  "Kitulgala White Water":"Sabaragamuwa Province", "Pidurutalagala":"Central Province",
  "Kite Surfing, Kalpitiya":"North Western Province", "Knuckles Camping":"Central Province",
  "Bodu Bala Surf, Weligama":"Southern Province",
  // Rural
  "Knuckles Villages":"Central Province", "Weligama Fisher Village":"Southern Province",
  "Dambulla Farming Village":"Central Province", "Mahiyanganaya":"Uva Province",
  "Belihuloya Valley":"Sabaragamuwa Province", "Tangalle Village Coast":"Southern Province",
  "Madu River Village":"Southern Province",
  // Hidden Gems
  "Riverston":"Central Province", "Meemure Village":"Central Province", "Diyaluma Falls":"Uva Province",
  "Ritigala":"North Central Province", "Hiriwadunna Village":"North Central Province",
  "Bopath Ella Falls":"Sabaragamuwa Province", "Madunagala Hot Springs":"Southern Province",
  // Newly expanded places (15-per-category pass)
  "Uppuveli":"Eastern Province", "Talalla":"Southern Province", "Polhena":"Southern Province",
  "Marble Beach":"Eastern Province", "Kalkudah":"Eastern Province", "Goyambokka":"Southern Province",
  "Dalawella":"Southern Province",
  "Hatton":"Central Province", "Idalgashinna":"Uva Province", "Single Tree Hill":"Central Province",
  "Pattipola":"Central Province", "Lipton's Seat":"Uva Province", "Ambewela":"Central Province",
  "Diyatalawa":"Uva Province", "Madulkelle":"Central Province",
  "Nallur Kandaswamy Temple":"Northern Province", "Mihintale":"North Central Province",
  "Aluvihare Rock Temple":"Central Province", "Yapahuwa":"North Western Province",
  "Kataragama":"Uva Province", "Jaffna Fort":"Northern Province", "Embekke Devalaya":"Central Province",
  "Lankatilaka Temple":"Central Province",
  "Horagolla National Park":"Western Province", "Kalametiya Bird Sanctuary":"Southern Province",
  "Horowpathana":"North Central Province", "Wasgamuwa National Park":"Central Province",
  "Pigeon Island":"Eastern Province", "Maduru Oya National Park":"Eastern Province",
  "Galway's Land National Park":"Central Province", "Lunugamvehera National Park":"Southern Province",
  "Belilena Caves":"Sabaragamuwa Province", "Diyaluma Falls Hike":"Uva Province",
  "Mini World's End, Riverston":"Central Province", "Bopath Ella Hike":"Sabaragamuwa Province",
  "Knuckles Multi-Day Trek":"Central Province", "Rock Climbing, Ritigala":"North Central Province",
  "Canyoning, Kitulgala":"Sabaragamuwa Province", "Horton Plains Trek":"Central Province",
  "Anamaduwa Village":"North Western Province", "Hambantota Salt Pans":"Southern Province",
  "Walawe Village Life":"Sabaragamuwa Province", "Nilgala Forest Village":"Uva Province",
  "Sooriyawewa Village":"Southern Province", "Kataragama Village Trail":"Uva Province",
  "Ridiyagama Farms":"Southern Province", "Ibbankatuwa Village":"Central Province",
  "Delft Island":"Northern Province", "Galway's Land":"Central Province",
  "Yapahuwa Rock Fortress":"North Western Province", "Kurulu Kele Bird Sanctuary":"North Central Province",
  "Maragala Mountain":"Uva Province", "Kurundu Oya Falls":"Sabaragamuwa Province",
  "Nagadeepa Island":"Northern Province", "Kurulu Bedda":"Southern Province",
};

// Regions grouped under "Places to Visit"
const PLACES_REGIONS = [
  { id:"beaches",  label:"🏖️ Beaches",         province:"Southern & Eastern", color:[C.tealMid,"#0A8060"] },
  { id:"hills",    label:"⛰️ Hill Country",     province:"Central & Uva",      color:["#2E5844","#1A3A2A"] },
  { id:"cultural", label:"🏛️ Cultural Sites",   province:"North Central",      color:["#8A6A34","#6B4A26"] },
  { id:"wildlife", label:"🐘 Wildlife & Nature", province:"Southern & NW",      color:["#0B3A30","#0A2A20"] },
  { id:"adventure",label:"🧗 Adventure",         province:"Central & Sabara.",  color:["#8B4B3B","#7A2010"] },
  { id:"rural",    label:"🌾 Rural Sri Lanka",   province:"All provinces",      color:["#7A6010","#4A3A08"] },
  { id:"hidden",   label:"💎 Hidden Gems",       province:"Off the beaten path", color:["#5B3A8E","#3A1F5E"] },
];

const ALL_TABS = [
  { id:"places",      label:"📍 Places to Visit",  type:"places_regions" },
  { id:"hotels",      label:"🏨 Hotels",          type:"places" },
  { id:"restaurants", label:"🍛 Restaurants",      type:"places" },
];


function DestinationsPage({ setPage, onGuideOpen, savedItin, setSavedItin }) {
  const init = sessionStorage.getItem("explorecat") || "places";
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
      if (catId === "hotels") {
        // Query multiple regions so we get a good spread of hotels across the
        // whole island and enough results per star tier, rather than one
        // generic "hotels in Sri Lanka" search that just returns Colombo results.
        const regions = ["Colombo","Kandy","Galle","Ella","Nuwara Eliya","Mirissa","Sigiriya","Negombo","Trincomalee","Bentota"];
        const queries = regions.map(r => placesSearch(`hotels in ${r}, Sri Lanka`));
        const results = await Promise.all(queries);
        if (results[0]?.error==="no_key") { setError("no_key"); setLoading(false); return; }
        // Merge + de-duplicate by place_id
        const merged = {};
        results.forEach(r => (r.results||[]).forEach(p => { merged[p.place_id] = p; }));
        setPlaces(Object.values(merged));
      } else {
        const query = GPLACES_CAT_QUERIES[catId];
        const data  = await placesSearch(query);
        if (data.error==="no_key") { setError("no_key"); setLoading(false); return; }
        if (data.status==="REQUEST_DENIED") { setError("denied"); setLoading(false); return; }
        setPlaces(data.results||[]);
      }
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
      const dayIdx = findBestMatchingDay(savedItin, place.name, place.geometry?.location);
      setSavedItin({...savedItin, days:savedItin.days.map((d,i)=>i===dayIdx?{...d,activities:[...d.activities,newAct]}:d)});
      setToast(true); setTimeout(()=>setToast(false),2500);
    } else { alert("Create an itinerary first from 'Plan a trip', then come back to add places."); }
  };

  // Adds a curated "Places to Visit" card (region data, has lat/lng) to the closest matching day
  const addPlaceToItin = (place) => {
    const newAct = {
      time:"15:00", type:"sightseeing",
      place:place.name, area:PROVINCE_MAP[place.name]||"Sri Lanka",
      text:place.desc||`Visit ${place.name}`,
      why:place.tag||"Added from Destinations", hours:"", price:"",
      mapQuery:`${place.name}, Sri Lanka`,
      unsplashQuery:`${place.name} Sri Lanka`,
    };
    if (savedItin) {
      const dayIdx = findBestMatchingDay(savedItin, place.name, place.lat&&place.lng?{lat:place.lat,lng:place.lng}:null);
      setSavedItin({...savedItin, days:savedItin.days.map((d,i)=>i===dayIdx?{...d,activities:[...d.activities,newAct]}:d)});
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
      <div style={{ background:"linear-gradient(160deg,#0A2620 0%,#0E4A3D 70%,#0B3A30 100%)", padding:"3rem 2rem 2.5rem", position:"relative", overflow:"hidden" }}>
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
                  {/* Cover image via Pexels */}
                  <div style={{ height:160, background:`linear-gradient(135deg,${regionCat?.color[0]||C.teal},${regionCat?.color[1]||"#0B3A30"})`, position:"relative", overflow:"hidden" }}>
                    <DestImage placeName={p.name} alt={p.name} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
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
                        background:p.crowd==="Low"?"#E6EEEA":p.crowd==="High"?C.coralLight:C.amberLight,
                        color:p.crowd==="Low"?"#3A6B10":p.crowd==="High"?C.coral:C.amber,
                        border:`1px solid ${p.crowd==="Low"?"#B9CFC5":p.crowd==="High"?"#DCC5BC":"#DFCBA0"}`,
                      }}>{p.crowd} crowds</span>
                    </div>
                    <p style={{ fontSize:12, color:C.inkSoft, lineHeight:1.6, marginBottom:10 }}>{p.desc}</p>
                    {/* Mini gallery preview strip — click any thumbnail to open full gallery */}
                    <DestGalleryStrip placeName={p.name} onOpenGallery={()=>setGallery(p)}/>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", paddingTop:8, borderTop:`1px solid ${C.border}` }}>
                      <span style={{ fontSize:11, color:C.inkSoft }}>📅 Best: <strong style={{ color:C.ink }}>{p.best}</strong></span>
                      <div style={{ display:"flex", gap:8 }}>
                        <button onClick={e=>{ e.stopPropagation(); addPlaceToItin(p); }} style={{ fontSize:11, fontWeight:600, padding:"4px 10px", background:C.teal, color:"#fff", border:"none", borderRadius:8, cursor:"pointer", fontFamily:sans }}>+ Add to trip</button>
                        <button onClick={e=>{ e.stopPropagation(); setPage("journey"); }} style={{ fontSize:12, fontWeight:600, color:C.teal, background:"none", border:"none", cursor:"pointer", fontFamily:sans }}>Plan trip →</button>
                      </div>
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
        <PlaceDetailPanel place={selected} wishlist={wishlist} onAddToItin={()=>{ addToItin(selected); setSelected(null); }} onClose={()=>setSelected(null)} category={activeTab}/>
      )}
    </div>
  );
}

// Extracted Places tab content (Hotels/Restaurants)
function PlacesTabContent({ catId, places, loading, error, tab, wishlist, selected, setSelected, addToItin, onRetry }) {
  const [starFilter, setStarFilter] = useState("all");

  // Star tier bucket: Google ratings (1-5) used as a proxy for hotel quality tier
  const tierOf = (rating) => {
    if (!rating) return null;
    if (rating >= 4.5) return 5;
    if (rating >= 4.0) return 4;
    if (rating >= 3.0) return 3;
    return 2;
  };

  const filteredPlaces = catId==="hotels" && starFilter!=="all"
    ? places.filter(p => tierOf(p.rating) === Number(starFilter))
    : places;

  // Count per tier for the filter badges
  const tierCounts = { 5:0, 4:0, 3:0, 2:0 };
  if (catId==="hotels") places.forEach(p => { const t = tierOf(p.rating); if (t) tierCounts[t]++; });

  return (
    <>
      {error==="no_key" && (
        <div style={{ background:C.amberLight, border:`1.5px solid #DFCBA0`, borderRadius:16, padding:"2rem", textAlign:"center" }}>
          <div style={{ fontSize:32, marginBottom:10 }}>🔑</div>
          <h3 style={{ fontFamily:serif, fontSize:18, fontWeight:700, color:C.ink, marginBottom:8 }}>Google Places API key needed</h3>
          <p style={{ fontSize:14, color:C.inkSoft, lineHeight:1.7, maxWidth:440, margin:"0 auto" }}>Add <code style={{ background:"rgba(0,0,0,.08)", padding:"2px 6px", borderRadius:4 }}>GOOGLE_PLACES_KEY</code> to your proxy <code>.env</code> and Vercel environment variables.</p>
        </div>
      )}
      {error==="denied" && <div style={{ background:C.coralLight, border:`1.5px solid #DCC5BC`, borderRadius:16, padding:"2rem", textAlign:"center" }}><p style={{ fontSize:14, color:C.coral }}>⚠️ API key rejected — enable <strong>Places API</strong> in Google Cloud Console.</p></div>}
      {error && error!=="no_key" && error!=="denied" && (
        <div style={{ textAlign:"center", padding:"2rem" }}>
          <p style={{ color:C.coral, fontSize:14, marginBottom:12 }}>{error}</p>
          <Btn onClick={onRetry}>Try again</Btn>
        </div>
      )}
      {loading && (
        <div style={{ textAlign:"center", padding:"4rem" }}>
          <div style={{ width:44, height:44, border:`3px solid ${C.tealLight}`, borderTopColor:C.teal, borderRadius:"50%", animation:"spin .8s linear infinite", margin:"0 auto 14px" }}/>
          <p style={{ fontSize:14, color:C.inkSoft }}>{catId==="hotels"?"Searching hotels across Sri Lanka…":"Finding the best places in Sri Lanka…"}</p>
        </div>
      )}

      {/* Star tier filter — hotels only */}
      {!loading && !error && catId==="hotels" && places.length>0 && (
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20 }}>
          <button onClick={()=>setStarFilter("all")} style={{ padding:"8px 16px", borderRadius:20, border:`1.5px solid ${starFilter==="all"?C.teal:C.border}`, background:starFilter==="all"?C.teal:"#fff", color:starFilter==="all"?"#fff":C.ink, cursor:"pointer", fontFamily:sans, fontSize:13, fontWeight:600 }}>
            All hotels ({places.length})
          </button>
          {[5,4,3,2].map(t=>(
            <button key={t} onClick={()=>setStarFilter(String(t))} style={{ padding:"8px 16px", borderRadius:20, border:`1.5px solid ${starFilter===String(t)?C.amber:C.border}`, background:starFilter===String(t)?C.amber:"#fff", color:starFilter===String(t)?"#fff":C.ink, cursor:"pointer", fontFamily:sans, fontSize:13, fontWeight:600 }}>
              {"★".repeat(t)} ({tierCounts[t]})
            </button>
          ))}
        </div>
      )}

      {!loading && !error && filteredPlaces.length>0 && (
        <div className="dest-grid-4" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1.2rem" }}>
          {filteredPlaces.map(p=>(
            <div key={p.place_id} onClick={()=>setSelected(p)} style={{ border:`1.5px solid ${C.border}`, borderRadius:16, overflow:"hidden", background:C.white, cursor:"pointer", transition:"transform .2s,box-shadow .2s" }}
              onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 8px 30px rgba(0,0,0,.1)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}>
              <div style={{ height:160, background:`linear-gradient(135deg,${C.teal},#0B3A30)`, overflow:"hidden", position:"relative" }}>
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
      {!loading && !error && filteredPlaces.length===0 && <div style={{ textAlign:"center", padding:"3rem", color:C.inkSoft }}><div style={{ fontSize:40, marginBottom:10 }}>🔍</div><p>No results found{catId==="hotels"&&starFilter!=="all"?` for ${starFilter}★ hotels — try a different tier`:""}.</p></div>}
      {selected && <PlaceDetailPanel place={selected} wishlist={wishlist} onAddToItin={()=>{ addToItin(selected); setSelected(null); }} onClose={()=>setSelected(null)} category={catId}/>}
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
  breakfast:  { emoji:"☕", label:"Breakfast",  color:"#F1ECE0", border:"#DFCBA0", text:C.amber },
  lunch:      { emoji:"🍛", label:"Lunch",       color:"#F1ECE0", border:"#DFCBA0", text:C.amber },
  dinner:     { emoji:"🍽️", label:"Dinner",      color:"#F1ECE0", border:"#DFCBA0", text:C.amber },
  cafe:       { emoji:"☕", label:"Café",        color:"#F1ECE0", border:"#DFCBA0", text:C.amber },
  sightseeing:{ emoji:"🏛️", label:"Sightseeing", color:C.tealLight, border:"#B9CFC5", text:C.teal },
  hike:       { emoji:"🥾", label:"Hike",        color:C.tealLight, border:"#B9CFC5", text:C.teal },
  safari:     { emoji:"🐘", label:"Safari",      color:C.tealLight, border:"#B9CFC5", text:C.teal },
  beach:      { emoji:"🏖️", label:"Beach",       color:C.tealLight, border:"#B9CFC5", text:C.teal },
  transport:  { emoji:"🚂", label:"Travel",      color:"#F3F3F3",   border:C.border,  text:C.inkSoft },
  checkin:    { emoji:"🏨", label:"Check-in",    color:"#F3F3F3",   border:C.border,  text:C.inkSoft },
  sunset:     { emoji:"🌅", label:"Sunset",      color:"#F1ECE0", border:"#DFCBA0", text:C.amber },
  activity:   { emoji:"🎯", label:"Activity",    color:C.tealLight, border:"#B9CFC5", text:C.teal },
};
const fallbackMeta = { emoji:"📍", label:"Stop", color:C.tealLight, border:"#B9CFC5", text:C.teal };

// ─── ACTIVITY ROW ────────────────────────────────────────────────────────────
function ActivityRow({ act, isLast, hideBorder }) {
  const [open, setOpen] = useState(false);
  const [photo, setPhoto] = useState(null);
  const meta = ACT_TYPE_META[act.type] || fallbackMeta;

  // Thumbnail for collapsed row — fetched once via Pexels, cached by query
  const thumbQuery = act.unsplashQuery
    || (UNSPLASH_KEYWORDS[act.place]||"").replace(/-/g," ")
    || `${act.place||"Sri Lanka"} Sri Lanka`;
  const thumbUrl = useDestPhoto(thumbQuery);

  const handleExpand = async () => {
    const next = !open; setOpen(next);
    if (next && photo===null) {
      const query = act.unsplashQuery
        || (UNSPLASH_KEYWORDS[act.place]||"").replace(/-/g," ")
        || `${act.place||"Sri Lanka"} Sri Lanka`;
      const photos = await fetchPexelsPhotos(query, 1);
      setPhoto(photos[0]?.url || "");
    }
  };

  return (
    <div style={{ borderBottom:hideBorder||isLast?"none":`1px solid ${C.border}` }}>
      <div className="activity-row-collapsed" onClick={handleExpand} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"10px 0", cursor:"pointer" }}
        onMouseEnter={e=>e.currentTarget.style.background="#FAFAF8"}
        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
        {/* Thumbnail always visible */}
        <div className="act-thumb" style={{ width:44, height:44, borderRadius:8, overflow:"hidden", flexShrink:0, background:`linear-gradient(135deg,${C.teal},#0B3A30)`, position:"relative", marginTop:2 }}>
          {thumbUrl && <img src={thumbUrl} alt={act.place||""} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>e.target.style.display="none"}/>}
          <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.1)" }}/>
        </div>
        {/* Text column — time/badge on their own line, then place/text below, wraps cleanly */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap", marginBottom:2 }}>
            <span style={{ fontSize:11, color:C.inkSoft, fontWeight:600, flexShrink:0 }}>{act.time}</span>
            <span style={{ fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:20, flexShrink:0, background:meta.color, color:meta.text, border:`1px solid ${meta.border}`, whiteSpace:"nowrap" }}>{meta.emoji} {meta.label}</span>
            {act.travelFromPrev && <span style={{ fontSize:10, color:C.teal, fontWeight:500 }}>↳ {act.travelFromPrev}</span>}
          </div>
          {act.place && <div style={{ fontSize:13, fontWeight:600, color:C.ink, marginBottom:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{act.place}</div>}
          <div style={{ fontSize:11, color:C.inkSoft, lineHeight:1.5, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{act.text}</div>
        </div>
        <span style={{ fontSize:12, color:C.inkSoft, flexShrink:0, transform:open?"rotate(180deg)":"none", transition:"transform .2s", marginTop:6 }}>▾</span>
      </div>
      {open&&(
        <div style={{ marginLeft:0, marginBottom:14, borderRadius:14, border:`1.5px solid ${meta.border}`, background:meta.color, overflow:"hidden" }}>
          <div style={{ height:180, background:`linear-gradient(135deg,${C.teal},#0B3A30)`, position:"relative", overflow:"hidden" }}>
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
const DAY_COLORS = ["#2563EB","#3D7A52","#EA580C","#7C3AED","#A83A32","#0891B2","#D97706","#BE185D","#065F46","#1D4ED8"];

// Pexels-backed image for the journey map stop detail overlay
function StopDetailImage({ query, alt, onLoaded }) {
  const url = useDestPhoto(query);
  useEffect(()=>{ if (url) onLoaded?.(); }, [url]);
  if (!url) return null;
  return <img src={url} alt={alt} style={{ width:"100%", height:"100%", objectFit:"cover", opacity:.85 }}/>;
}

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
              <StopDetailImage query={selectedStop.query} alt={selectedStop.place} onLoaded={()=>setPhotoLoaded(p=>({...p,[selectedStop.place]:true}))}/>
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
      <div style={{ background:C.tealPale, border:`1px solid #B9CFC5`, borderRadius:12, padding:"10px 14px", marginBottom:16, display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
        <span style={{ fontSize:16 }}>↕️</span>
        <span style={{ fontSize:12, color:C.teal, fontWeight:500 }}>Drag any activity to reorder. Click 🔄 to swap a place.</span>
        {premium && !premium.isUnlocked(itinId) && <span style={{ fontSize:11, color:C.amber, marginLeft:"auto" }}>🔒 Unlock premium to reorder Days 2+</span>}
      </div>
      {days.map((d, dayIdx)=>{
        const isLocked = premium && !premium.isUnlocked(itinId) && dayIdx > 0;
        return (
          <div key={d.day} style={{ position:"relative", marginBottom:16 }}>
            <div style={{ border:`1.5px solid ${isLocked?"#E6E4DF":C.border}`, borderRadius:16, overflow:"hidden", background:C.white, boxShadow:"0 2px 12px rgba(0,0,0,.04)", opacity:isLocked?.5:1 }}>
              <div style={{ padding:"14px 20px", background:`linear-gradient(135deg,${isLocked?"#999":"#0E4A3D"},${isLocked?"#bbb":"#0B3A30"})`, display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
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
                      <div className="drag-act-row" style={{ display:"flex", alignItems:"flex-start", gap:4, padding:"8px 4px", borderBottom:actIdx<d.activities.length-1?`1px solid ${C.border}`:"none" }}>
                        {!isLocked && <span className="drag-handle" style={{ cursor:"grab", fontSize:14, color:C.inkSoft, flexShrink:0, userSelect:"none", marginTop:12 }}>⠿</span>}
                        <div style={{ flex:1, minWidth:0 }}>
                          <ActivityRow act={a} isLast={actIdx===d.activities.length-1} hideBorder/>
                        </div>
                        {!isLocked && <button className="swap-btn" onClick={()=>setSwap({dayIdx, actIdx, act:a})} title="Swap this place" style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:8, padding:"4px 8px", cursor:"pointer", fontSize:12, color:C.inkSoft, flexShrink:0, marginTop:8 }}>🔄</button>}
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
  {v:"beach",    i:"🏖️"},
  {v:"hills",    i:"⛰️"},
  {v:"cultural", i:"🏛️"},
  {v:"wildlife", i:"🐘"},
  {v:"adventure",i:"🧗"},
  {v:"rural",    i:"🌾"},
  {v:"mixed",    i:"🗺️"},
];
const GROUP_OPTS = [
  {v:"solo",i:"🧳"},
  {v:"couple",i:"💑"},
  {v:"family",i:"👨‍👩‍👧"},
  {v:"friends",i:"🎉"},
];
const BUDGET_OPTS = [
  {v:"budget"},
  {v:"mid"},
  {v:"luxury"},
];
const FOOD_OPT_KEYS = ["srilankan","seafood","vegetarian","vegan","western","southindian","streetfood","finedining"];
const ACT_OPTS = [
  {v:"adventure",i:"🧗"},
  {v:"relaxation",i:"🌅"},
  {v:"sightseeing",i:"📸"},
  {v:"food-tours",i:"🍛"},
  {v:"wellness",i:"🧘"},
  {v:"water-sports",i:"🤿"},
  {v:"wildlife-safari",i:"🦁"},
  {v:"hiking",i:"🥾"},
];
const TRANSPORT_OPTS = [
  {v:"tuk-tuk",i:"🛺"},
  {v:"private-car",i:"🚗"},
  {v:"train",i:"🚂"},
  {v:"bus",i:"🚌"},
];
const PACE_OPTS = [
  {v:"relaxed",i:"🌿"},
  {v:"balanced",i:"⚖️"},
  {v:"packed",i:"⚡"},
];

const START_OPTS = [
  {v:"airport", i:"✈️"},
  {v:"colombo", i:"🏙️"},
  {v:"custom",  i:"📍"},
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
    <div style={{ background:"#FFF8E6", border:"1.5px solid #DFCBA0", borderRadius:14, padding:"14px 16px", marginTop:16 }}>
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
// ─── ITINERARY LOADING ANIMATION ─────────────────────────────────────────────
// Cycles through Sri Lankan tourism motifs (temple, beach, tea, elephant, train,
// surf) with a gentle bounce/fade — replaces the plain spinner so the wait
// feels purposeful and on-brand rather than a generic loading state.
const LOADING_SCENES = [
  { icon:"🛕", label:"Exploring ancient temples…", color:"#8A6A34" },
  { icon:"🏖️", label:"Scouting golden beaches…",    color:"#3C4E5C" },
  { icon:"🍃", label:"Wandering tea plantations…",  color:"#0E4A3D" },
  { icon:"🐘", label:"Tracking wildlife trails…",   color:"#6B4A26" },
  { icon:"🚂", label:"Riding the highland railway…",color:"#8B4B3B" },
  { icon:"🍛", label:"Tasting local flavours…",     color:"#A9895A" },
];

function ItineraryLoadingAnimation() {
  const [sceneIdx, setSceneIdx] = useState(0);
  const [dots, setDots] = useState("");

  useEffect(()=>{
    const t = setInterval(()=>setSceneIdx(i=>(i+1)%LOADING_SCENES.length), 1800);
    return ()=>clearInterval(t);
  },[]);
  useEffect(()=>{
    const t = setInterval(()=>setDots(d=>d.length>=3?"":d+"."), 450);
    return ()=>clearInterval(t);
  },[]);

  const scene = LOADING_SCENES[sceneIdx];

  return (
    <div style={{ minHeight:"80vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:24, padding:"2rem", background:`linear-gradient(160deg,${scene.color}08,transparent)`, transition:"background 1.2s" }}>
      <style>{`
        @keyframes loadIconBounce { 0%,100%{ transform:translateY(0) scale(1); } 50%{ transform:translateY(-14px) scale(1.08); } }
        @keyframes loadIconFadeIn { from{ opacity:0; transform:scale(.7) rotate(-8deg); } to{ opacity:1; transform:scale(1) rotate(0deg); } }
        @keyframes loadRingPulse { 0%{ transform:scale(.92); opacity:.5; } 50%{ transform:scale(1.06); opacity:.15; } 100%{ transform:scale(.92); opacity:.5; } }
        @keyframes loadProgressSlide { 0%{ transform:translateX(-100%); } 100%{ transform:translateX(250%); } }
      `}</style>

      {/* Icon stage with pulsing ring backdrop */}
      <div style={{ position:"relative", width:140, height:140, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ position:"absolute", inset:0, borderRadius:"50%", background:scene.color, animation:"loadRingPulse 2s ease-in-out infinite" }}/>
        <div style={{ position:"absolute", inset:14, borderRadius:"50%", background:"#fff", boxShadow:"0 8px 32px rgba(0,0,0,.1)" }}/>
        <div key={sceneIdx} style={{ position:"relative", fontSize:56, animation:"loadIconFadeIn .4s ease, loadIconBounce 1.8s ease-in-out infinite .4s" }}>
          {scene.icon}
        </div>
      </div>

      <div style={{ textAlign:"center" }}>
        <p key={sceneIdx+"-label"} style={{ fontSize:16, fontWeight:600, color:C.ink, fontFamily:sans, marginBottom:6, animation:"loadIconFadeIn .4s ease" }}>
          {scene.label}{dots}
        </p>
        <p style={{ fontSize:13, color:"#999", fontFamily:sans }}>Crafting your personalised Sri Lanka itinerary</p>
      </div>

      {/* Progress bar with sliding shimmer (indeterminate — we don't know exact completion %) */}
      <div style={{ width:200, height:5, background:C.border, borderRadius:6, overflow:"hidden", position:"relative" }}>
        <div style={{ position:"absolute", top:0, left:0, width:"40%", height:"100%", background:`linear-gradient(90deg,transparent,${scene.color},transparent)`, animation:"loadProgressSlide 1.6s ease-in-out infinite", borderRadius:6 }}/>
      </div>

      {/* Scene dots indicator */}
      <div style={{ display:"flex", gap:6 }}>
        {LOADING_SCENES.map((s,i)=>(
          <div key={i} style={{ width:i===sceneIdx?20:6, height:6, borderRadius:6, background:i===sceneIdx?scene.color:C.border, transition:"all .3s" }}/>
        ))}
      </div>
    </div>
  );
}

function JourneyPage({ setPage, savedItin, setSavedItin, onGuideOpen, user, onLoginNeeded, premium }) {
  const { t, ot, lang } = useLang();
  const [step, setStep]    = useState(()=>{
    // Restore step from any previous session (refresh, login redirect, accidental close)
    const saved = localStorage.getItem("ct_wizard_step");
    return saved ? (parseInt(saved)||0) : 0;
  });
  const [ans, setAns]      = useState(()=>{
    // Restore wizard answers from any previous session
    const saved = localStorage.getItem("ct_wizard_ans");
    if (saved) { try { return JSON.parse(saved); } catch {} }
    return { days:5, nights:4, travel:"", food:[], budget:"", group:"", activities:[], transport:"", pace:"balanced", hotelStyle:"multi", customPlaces:[], startCity:"airport", startTime:"09:00", startDate:"", endDate:"", roundTrip:true };
  });
  const [loading, setLoad] = useState(false);
  const [itin, setItin]    = useState(savedItin||null);
  const [itinDays, setItinDays] = useState(savedItin?.days||null);
  const [placeInput, setPlaceInput] = useState("");
  const [startLabel, setStartLabel] = useState("Sri Lanka");
  const [shareModal, setShareModal] = useState(null); // {url, loading} or null
  const [saveStatus, setSaveStatus] = useState(null); // null | "saving" | "saved" | "error"

  // Continuously persist wizard progress so a refresh never loses answers —
  // only while still in the wizard (step < 10); once an itinerary is generated
  // and saved, we clear this draft since savedItin now holds the real data.
  useEffect(()=>{
    if (step < 10) {
      localStorage.setItem("ct_wizard_step", String(step));
      localStorage.setItem("ct_wizard_ans", JSON.stringify(ans));
    } else {
      localStorage.removeItem("ct_wizard_step");
      localStorage.removeItem("ct_wizard_ans");
    }
  }, [step, ans]);

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
    <style>body{font-family:Georgia,serif;max-width:750px;margin:40px auto;color:#1A1A1A;line-height:1.6;}h1{font-size:28px;color:#0E4A3D;margin-bottom:6px;}.tagline{font-size:15px;color:#6B6B6B;margin-bottom:24px;font-style:italic;}.day{margin-bottom:28px;border:1px solid #E6E4DF;border-radius:12px;overflow:hidden;}.day-head{background:#0E4A3D;color:#fff;padding:12px 18px;font-size:15px;font-weight:bold;}.act{display:flex;gap:14px;padding:10px 18px;border-bottom:1px solid #f0f0f0;font-size:13px;font-family:sans-serif;}.act:last-child{border-bottom:none;}.time{color:#6B6B6B;min-width:48px;font-weight:600;font-size:11px;padding-top:2px;}.place{font-weight:700;color:#1A1A1A;margin-bottom:2px;}.why{margin-top:4px;font-size:11px;color:#0E4A3D;font-style:italic;}.meta{display:flex;gap:12px;margin-top:4px;font-size:11px;color:#6B6B6B;}.map-link{color:#0E4A3D;text-decoration:none;}.footer{margin-top:32px;padding-top:16px;border-top:1px solid #E6E4DF;font-size:11px;color:#aaa;font-family:sans-serif;text-align:center;}</style>
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

    // ── Geo-aware city database ────────────────────────────────────────────────
    // Each city has real lat/lng so we can rank by ACTUAL distance from the
    // starting point, not just hand the AI a flat alphabetic list.
    const CITY_GEO = {
      // Starting points / hubs
      "Colombo":{lat:6.9271,lng:79.8612}, "Bandaranaike International Airport, Katunayake":{lat:7.1808,lng:79.8841},
      "Kurunegala":{lat:7.4863,lng:80.3623}, "Jaffna":{lat:9.6615,lng:80.0255}, "Negombo":{lat:7.2083,lng:79.8358},
      "Anuradhapura":{lat:8.3114,lng:80.4037}, "Trincomalee":{lat:8.5874,lng:81.2152}, "Batticaloa":{lat:7.7170,lng:81.7000},
      "Galle":{lat:6.0535,lng:80.2210}, "Matara":{lat:5.9549,lng:80.5550}, "Ratnapura":{lat:6.6828,lng:80.4012},
      "Badulla":{lat:6.9934,lng:81.0550}, "Polonnaruwa":{lat:7.9403,lng:81.0188}, "Kandy":{lat:7.2906,lng:80.6337},
      // Beach
      "Mirissa":{lat:5.9483,lng:80.4589}, "Unawatuna":{lat:6.0108,lng:80.2492}, "Hikkaduwa":{lat:6.1395,lng:80.1063},
      "Tangalle":{lat:6.0241,lng:80.7937}, "Weligama":{lat:5.9740,lng:80.4297}, "Arugam Bay":{lat:6.8404,lng:81.8360},
      "Nilaveli":{lat:8.6916,lng:81.1956}, "Bentota":{lat:6.4260,lng:79.9959}, "Beruwala":{lat:6.4790,lng:79.9826},
      "Kalpitiya":{lat:8.2333,lng:79.7667}, "Pasikuda":{lat:7.9219,lng:81.5650}, "Uppuveli":{lat:8.6019,lng:81.2092},
      // Hills
      "Nuwara Eliya":{lat:6.9497,lng:80.7891}, "Ella":{lat:6.8667,lng:81.0466}, "Haputale":{lat:6.7670,lng:80.9550},
      "Bandarawela":{lat:6.8294,lng:80.9886}, "Hatton":{lat:6.8910,lng:80.5957}, "Knuckles":{lat:7.4500,lng:80.7833},
      "Horton Plains":{lat:6.8021,lng:80.7958},
      // Cultural
      "Sigiriya":{lat:7.9570,lng:80.7603}, "Dambulla":{lat:7.8675,lng:80.6517}, "Galle Fort":{lat:6.0269,lng:80.2167},
      // Wildlife
      "Yala":{lat:6.3725,lng:81.5185}, "Tissamaharama":{lat:6.2772,lng:81.2855}, "Udawalawe":{lat:6.4567,lng:80.8986},
      "Sinharaja":{lat:6.4093,lng:80.4904}, "Wilpattu":{lat:8.4500,lng:80.0333}, "Minneriya":{lat:8.0333,lng:80.8833},
      "Habarana":{lat:8.0362,lng:80.7501}, "Bundala":{lat:6.1972,lng:81.2206},
      // Adventure
      "Kitulgala":{lat:6.9897,lng:80.4178}, "Adam's Peak":{lat:6.8094,lng:80.4994}, "Knuckles Range":{lat:7.4500,lng:80.7833},
      // Rural
      "Knuckles Villages":{lat:7.4500,lng:80.7833}, "Mahiyanganaya":{lat:7.3333,lng:81.0167}, "Belihuloya":{lat:6.6333,lng:80.7167}, "Matale":{lat:7.4675,lng:80.6234},
    };

    const STYLE_CITIES = {
      beach:    { allowed:["Negombo","Galle","Unawatuna","Mirissa","Hikkaduwa","Tangalle","Weligama","Arugam Bay","Nilaveli","Trincomalee","Bentota","Beruwala","Kalpitiya","Pasikuda","Uppuveli"], forbidden:["Kandy","Ella","Nuwara Eliya","Sigiriya","Dambulla","Anuradhapura","Polonnaruwa","Yala","Wilpattu"] },
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

    // ── Haversine distance (km) ────────────────────────────────────────────────
    function distKm(a, b) {
      if (!a || !b) return 99999; // unknown city = treat as very far, don't prioritise
      const R = 6371, dLat = (b.lat-a.lat)*Math.PI/180, dLng = (b.lng-a.lng)*Math.PI/180;
      const x = Math.sin(dLat/2)**2 + Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLng/2)**2;
      return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
    }

    // Try to resolve the starting point's coordinates — match against known cities
    // (handles "Bandaranaike International Airport, Katunayake" etc by checking substrings)
    const startKey = Object.keys(CITY_GEO).find(k =>
      customStart.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(customStart.toLowerCase().split(",")[0].trim())
    );
    const startGeo = startKey ? CITY_GEO[startKey] : null;

    // Rank the style's allowed cities by ACTUAL distance from the starting point.
    // This is what fixes "Kurunegala → hills always suggests Kandy" — now it ranks
    // Kandy vs Ella vs Nuwara Eliya etc by real km from Kurunegala, and "Jaffna → beach"
    // properly prioritises Nilaveli/Trincomalee/Arugam Bay over Negombo (which is far south).
    let rankedCities = cities.allowed;
    if (startGeo) {
      rankedCities = [...cities.allowed].sort((a,b) => {
        const da = distKm(startGeo, CITY_GEO[a]);
        const db = distKm(startGeo, CITY_GEO[b]);
        return da - db;
      });
    }
    const nearestCity = rankedCities[0] || cities.allowed[0];
    const nearestDist = startGeo && CITY_GEO[nearestCity] ? Math.round(distKm(startGeo, CITY_GEO[nearestCity])) : null;

    const allowedCities = [...rankedCities];
    if (ans.startCity==="custom" && ans.customStart) {
      allowedCities.unshift(ans.customStart.trim() + " (starting point)");
    }

    // ── Hotel-base strategy ────────────────────────────────────────────────────
    // "base"  = stay in ONE hotel/region for the whole trip, day-trip out and back
    // "multi" = move to a new hotel/region every 1-3 days, see more of the country
    const hotelStrategy = ans.hotelStyle || "multi";
    const hotelStrategyNote = hotelStrategy==="base"
      ? `HOTEL STRATEGY — SINGLE BASE: The tourist wants to stay in ONE hotel for the ENTIRE trip and take day trips out and back. Pick ONE hotel in ${nearestCity} (the city closest to ${customStart} that matches their travel style — ${nearestDist?`only ${nearestDist}km away`:"a great match"}). Every day's activities must be a round-trip from that same hotel — do NOT check out and move to a new hotel at any point. Activities further away (1-2 hrs) are fine as day trips, but the tourist returns to the SAME hotel each night.`
      : `HOTEL STRATEGY — MULTI-STOP JOURNEY: The tourist wants to see different parts of the country and is happy to change hotels. Plan a logical route starting near ${customStart}, moving through 2-4 different towns/regions over the trip (geographically sensible order, not backtracking), staying 1-3 nights in each before moving to the next. Start with the city nearest to ${customStart} (${nearestCity}) and progress outward.`;

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

    // ── Round trip note (return to starting point on the last day) ────────────
    const roundTripNote = ans.roundTrip
      ? `RETURN JOURNEY (CRITICAL): This is a ROUND TRIP — the tourist must end up back at ${customStart} on the final day. The LAST activity of the LAST day MUST be a transport/drive activity from wherever they are back to ${customStart}${ans.startCity==="airport"?" (so they can catch their departure flight)":""}, with a realistic drive time. Plan the route for the final 1-2 days so the geography naturally brings them back toward ${customStart} rather than ending far away.`
      : `ONE-WAY TRIP: The tourist does NOT need to return to ${customStart} — the trip can end wherever makes the most sense for their route. No need to plan a return journey.`;

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
- Style: ${styleKey} | Food: ${ans.food.map(fk=>optT("en",fk)).join(", ")||"open"} | Activities: ${ans.activities.join(", ")||"sightseeing"}
- Transport: ${ans.transport||"private-car"} | Pace: ${ans.pace||"balanced"} (${actsPerDay} activities/day)
- Starting from: ${customStart} at ${ans.startTime||"09:00"}
${customNote ? `- ${customNote}` : ""}

${startTimeNote}

${hotelStrategyNote}

${roundTripNote}

HOTEL RULES (CRITICAL):
- Select ONE specific real hotel per destination matching "${hotelTier}"
- Day 1: First activity = drive from ${customStart} to hotel with REAL drive time (e.g. "45 min drive from Colombo on A3 highway")
- Day 1: Second activity = hotel check-in with hotel name, area, why chosen
- Every morning: first activity = breakfast AT THE HOTEL where they slept
- Every evening: last activity = dinner near hotel + return to hotel
- Last day: include hotel check-out + drive back to ${customStart} if needed

LOCATION RULES (CRITICAL — DISTANCE FROM STARTING POINT MATTERS):
- Cities below are listed in order of PROXIMITY to ${customStart} (closest first) — strongly prefer the cities at the TOP of this list, only use cities further down if the trip is long enough to justify the extra travel
- RANKED BY DISTANCE FROM ${customStart}: ${allowedCities.join(", ")}
- The single BEST match for a short trip is: ${nearestCity}${nearestDist?` (approx ${nearestDist}km from ${customStart})`:""}
- FORBIDDEN (wrong region for this style): ${cities.forbidden.length ? cities.forbidden.join(", ") : "none"}
- Do NOT default to famous/touristy cities (e.g. Kandy, Negombo) just because they're well-known — pick whichever ALLOWED city is geographically closest to the starting point and matches the trip length
- All activities must be within 30 min of the hotel unless it's an explicitly planned excursion

${busNote}

${lang !== "en" ? `LANGUAGE (CRITICAL): Write all human-readable narrative text in ${LANG_NAMES[lang] || "English"} — this means title, tagline, hotel.why, day theme, and every activity's "text" and "why" field must be written in ${LANG_NAMES[lang] || "English"}. Keep "place", "area", "mapQuery", "hours" and "price" in their original form (real names/numbers) so they still work with Google Maps and stay accurate — do NOT translate proper nouns or numbers, only the descriptive sentences around them.` : ""}

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

      // ── Correct unrealistic travel-time estimates ──────────────────────────
      // The AI guesses travelFromPrev as free text, which is often wrong (e.g.
      // claiming "45 min drive" for two towns that are actually 3 hours apart).
      // Where we can resolve both the previous and current location to a known
      // city with real coordinates, replace the guess with a distance-based
      // estimate using realistic Sri Lankan road speeds.
      function resolveCityGeo(areaText) {
        if (!areaText) return null;
        const cleanText = areaText.split(",")[0].trim().toLowerCase();
        const key = Object.keys(CITY_GEO).find(k =>
          cleanText.includes(k.toLowerCase()) || k.toLowerCase().includes(cleanText)
        );
        return key ? CITY_GEO[key] : null;
      }
      function estimateDriveTime(fromGeo, toGeo) {
        const km = distKm(fromGeo, toGeo);
        if (!isFinite(km) || km < 3) return null; // too close/unknown to be meaningful
        // Sri Lanka realistic average road speeds — hill/winding roads are much
        // slower than coastal highways, and long hauls average out faster.
        const avgKmh = km > 80 ? 55 : km > 30 ? 42 : 28;
        const rawMins = (km / avgKmh) * 60;
        const mins = rawMins < 60 ? Math.max(10, Math.round(rawMins / 5) * 5) : Math.round(rawMins);
        const hrs = Math.floor(mins / 60), rem = mins % 60;
        const label = hrs > 0 ? `${hrs} hr${hrs > 1 ? "s" : ""}${rem > 0 ? ` ${rem} min` : ""} drive` : `${mins} min drive`;
        return { km: Math.round(km), label };
      }
      let prevAreaForTravel = customStart;
      (parsed.days || []).forEach(day => {
        (day.activities || []).forEach(act => {
          if (act.type === "transport") {
            const fromGeo = resolveCityGeo(prevAreaForTravel);
            const toGeo   = resolveCityGeo(act.area || day.location);
            const est = fromGeo && toGeo ? estimateDriveTime(fromGeo, toGeo) : null;
            if (est) act.travelFromPrev = `${est.label} (~${est.km}km)`;
          }
          prevAreaForTravel = act.area || day.location || prevAreaForTravel;
        });
      });

      // Attach trip meta so it travels with the itinerary into guide requests, PDF, etc.
      parsed.tripMeta = {
        startDate: ans.startDate, endDate: ans.endDate, startTime: ans.startTime,
        startLocation: customStart, roundTrip: ans.roundTrip,
        endLocation: ans.roundTrip ? customStart : (parsed.days.slice(-1)[0]?.location || customStart),
      };
      setItin(parsed); setSavedItin(parsed); setItinDays(parsed.days);
    } catch(err) {
      console.error("AI error:", err);
      const isConnectionError = err.message.includes("fetch") || err.message.includes("Failed") || err.message.includes("ECONNREFUSED") || err.message.includes("NetworkError");
      if (isConnectionError) {
        setLoad(false); setStep(0);
        alert("⚠️ Cannot reach the proxy server.\n\nMake sure you started it:\n  cd proxy\n  npm start");
        return;
      }
      // Fallback itinerary — uses the geo-ranked nearest city for this style,
      // NOT hardcoded to Negombo. This is what fixes "Jaffna + beach" always
      // showing Negombo even when Nilaveli/Trincomalee are far closer.
      const fbCity = nearestCity || "Negombo";
      const fbArea = `${fbCity}, Sri Lanka`;
      const styleLabel = {beach:"Beach Escape",hills:"Hill Country Retreat",cultural:"Cultural Discovery",wildlife:"Wildlife Safari",adventure:"Adventure Trip",rural:"Rural Experience",mixed:"Sri Lanka Adventure"}[styleKey]||"Sri Lanka Adventure";
      const styleTagline = {beach:"Relax and recharge on Sri Lanka's golden coast",hills:"Misty mountains, tea trails and cool highland air",cultural:"Ancient temples, royal ruins and timeless heritage",wildlife:"Safaris and close encounters with Sri Lanka's wildlife",adventure:"Hikes, rapids and adrenaline in the wild",rural:"Village life, farms and authentic local culture",mixed:"A taste of everything Sri Lanka has to offer"}[styleKey]||"A memorable Sri Lanka journey";
      const fbActType = {beach:"beach",hills:"sightseeing",cultural:"sightseeing",wildlife:"safari",adventure:"hike",rural:"rural",mixed:"sightseeing"}[styleKey]||"sightseeing";
      const fbActLabel = {beach:"beach time",hills:"a scenic walk",cultural:"the historic sites",wildlife:"a safari drive",adventure:"the trail",rural:"the village",mixed:"the main sights"}[styleKey]||"the main sights";
      const hotelName = ans.budget==="luxury" ? `${fbCity} Grand Resort` : ans.budget==="mid" ? `${fbCity} Heritage Hotel` : `${fbCity} Traveller's Inn`;
      const fallDays = [{
        day:1, location:fbArea, theme:"Arrival & settle in",
        hotel: hotelName,
        activities:[
          {time:ans.startTime||"09:00",type:"transport",place:`${customStart} → ${fbCity}`,area:customStart,text:`Drive from ${customStart} to ${fbCity}${nearestDist?` (approx ${nearestDist}km)`:""}.`,why:`${fbCity} is the closest ${styleKey} destination to ${customStart}.`,hours:"",price:"$15–40 taxi",mapQuery:fbArea,travelFromPrev:"",unsplashQuery:`${fbCity} Sri Lanka`},
          {time:"11:00",type:"checkin",place:hotelName,area:fbArea,text:`Check in to ${hotelName}. Drop your bags and freshen up.`,why:`Well located for exploring ${fbCity} and the surrounding area.`,hours:"Check-in from 2pm, early check-in on request",price:ans.budget==="luxury"?"$150–300/night":ans.budget==="mid"?"$50–100/night":"$20–40/night",mapQuery:`${hotelName}, ${fbArea}`,travelFromPrev:nearestDist?`${Math.round(nearestDist/60)} hr drive`:"drive",unsplashQuery:`${fbCity} hotel Sri Lanka`},
          {time:"13:00",type:"lunch",place:`${fbCity} Local Kitchen`,area:fbArea,text:"Rice and curry with the day's fresh local specialities.",why:"A great introduction to regional Sri Lankan cooking.",hours:"11am–10pm",price:"$8–20",mapQuery:`restaurant, ${fbArea}`,travelFromPrev:"5 min walk",unsplashQuery:"Sri Lanka rice curry meal"},
          ...(isEveningStart?[]:[{time:"16:00",type:fbActType,place:`${fbCity} Highlights`,area:fbArea,text:`Spend the afternoon enjoying ${fbActLabel} around ${fbCity}.`,why:`This is exactly what ${fbCity} is known for.`,hours:"Always open",price:"Free–$10",mapQuery:fbArea,travelFromPrev:"10 min drive",unsplashQuery:`${fbCity} Sri Lanka scenery`}]),
          {time:isEveningStart?"20:00":"19:00",type:"dinner",place:`${fbCity} Dining Room`,area:fbArea,text:"Relaxed dinner with regional dishes and fresh local ingredients.",why:"Consistently well-rated by visitors to the area.",hours:"6pm–11pm",price:"$15–35",mapQuery:`restaurant, ${fbArea}`,travelFromPrev:"10 min walk",unsplashQuery:`${fbCity} dinner restaurant`},
        ]
      }];
      while(fallDays.length<N){
        const n=fallDays.length+1;
        fallDays.push({day:n,location:fbArea,theme:`Day ${n} — exploring ${fbCity}`,hotel:hotelName,
          activities:[
            {time:"08:00",type:"breakfast",place:hotelName+" Restaurant",area:fbArea,text:"Full Sri Lankan breakfast with hoppers, string hoppers and fresh tropical fruit at the hotel.",why:"Start the day well — the hotel breakfast is included and excellent.",hours:"7am–10am",price:"Included",mapQuery:`${hotelName}, ${fbArea}`,travelFromPrev:"",unsplashQuery:"Sri Lanka hotel breakfast hoppers"},
            {time:"10:00",type:fbActType,place:`${fbCity} Exploration`,area:fbArea,text:`Continue exploring ${fbActLabel} around ${fbCity}.`,why:`One of the best reasons to visit ${fbCity}.`,hours:"Always open",price:"Free–$15",mapQuery:fbArea,travelFromPrev:"15 min drive",unsplashQuery:`${fbCity} Sri Lanka`},
            {time:"13:00",type:"lunch",place:`${fbCity} Café`,area:fbArea,text:"Local specialities with fresh seasonal ingredients.",why:"A local favourite among visitors to the area.",hours:"11am–9pm",price:"$8–15",mapQuery:`cafe, ${fbArea}`,travelFromPrev:"10 min walk",unsplashQuery:"Sri Lanka local food"},
            {time:"19:00",type:"dinner",place:hotelName+" Restaurant",area:fbArea,text:"Evening meal back at the hotel after a full day exploring.",why:"Convenient and relaxing after a day out.",hours:"6pm–10pm",price:"$15–30",mapQuery:`${hotelName}, ${fbArea}`,travelFromPrev:"2 min walk",unsplashQuery:`${fbCity} evening dinner`},
          ]
        });
      }
      const fbTripMeta = {
        startDate: ans.startDate, endDate: ans.endDate, startTime: ans.startTime,
        startLocation: customStart, roundTrip: ans.roundTrip,
        endLocation: ans.roundTrip ? customStart : fbCity,
      };
      setItin({ title:`${N}-Day ${styleLabel}`, tagline:styleTagline, hotel:{name:hotelName,area:fbCity,stars:ans.budget==="luxury"?5:3,why:`Well located for exploring ${fbCity}`}, highlights:[`Stay in ${fbCity}`,"Local cuisine daily","Authentic experiences"], days:fallDays.slice(0,N), tripMeta:fbTripMeta });
      setSavedItin({ title:`${N}-Day ${styleLabel}`, tagline:styleTagline, hotel:{name:hotelName,area:fbCity,stars:ans.budget==="luxury"?5:3,why:`Well located for exploring ${fbCity}`}, highlights:[`Stay in ${fbCity}`,"Local cuisine daily","Authentic experiences"], days:fallDays.slice(0,N), tripMeta:fbTripMeta });
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
    if (loading) return <ItineraryLoadingAnimation/>;
    if (!itin) return null;
    return (
      <div style={{ minHeight:"100vh", background:C.surface }}>
        <div style={{ background:`linear-gradient(135deg,${C.teal},#0B3A30)`, padding:"3rem 2rem" }}>
          <div style={{ maxWidth:820, margin:"0 auto" }}>
            <div style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,.6)", textTransform:"uppercase", letterSpacing:2, marginBottom:10 }}>{t("res_eyebrow")}</div>
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
              <button onClick={downloadPDF} style={{ padding:"10px 20px", background:"rgba(255,255,255,.15)", color:"#fff", border:"1px solid rgba(255,255,255,.35)", borderRadius:12, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:sans }}>{t("res_pdf")}</button>
              <button onClick={async()=>{
                setShareModal({ url:null, loading:true });
                try {
                  if (!window.firebase?.firestore) await loadScript("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js");
                  const shareId = await saveSharedItinerary({ ...itin, days: itinDays||itin.days }, user?.uid);
                  const url = `${window.location.origin}${window.location.pathname}?share=${shareId}`;
                  setShareModal({ url, loading:false });
                } catch(e) { setShareModal({ url:null, loading:false, error:e.message }); }
              }} style={{ padding:"10px 20px", background:"rgba(255,255,255,.15)", color:"#fff", border:"1px solid rgba(255,255,255,.35)", borderRadius:12, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:sans }}>{t("res_share")}</button>
              <button onClick={async()=>{
                if (!user) { onLoginNeeded(); return; }
                setSaveStatus("saving");
                try {
                  if (!window.firebase?.firestore) await loadScript("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js");
                  await saveUserItinerary(user.uid, { ...itin, days: itinDays||itin.days });
                  setSaveStatus("saved");
                  setTimeout(()=>setSaveStatus(null), 2500);
                } catch(e) { setSaveStatus("error"); setTimeout(()=>setSaveStatus(null), 3000); }
              }} disabled={saveStatus==="saving"} style={{ padding:"10px 20px", background: saveStatus==="saved"?"#3D7A52":"rgba(255,255,255,.15)", color:"#fff", border:"1px solid rgba(255,255,255,.35)", borderRadius:12, fontSize:13, fontWeight:600, cursor:saveStatus==="saving"?"wait":"pointer", fontFamily:sans }}>
                {saveStatus==="saving"?t("res_save_saving"):saveStatus==="saved"?t("res_save_saved"):saveStatus==="error"?t("res_save_error"):t("res_save_idle")}
              </button>
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
                {t("res_openmaps")}
              </button>
              <p style={{ fontSize:12, color:"rgba(255,255,255,.5)", margin:0 }}>{t("res_taphint")}</p>
            </div>
          </div>
        </div>
        <div style={{ maxWidth:820, margin:"0 auto", padding:"2.5rem 2rem" }}>
          {/* Start → End journey banner with full date/time/location */}
          <div className="trip-banner" style={{ display:"flex", alignItems:"center", gap:12, background:"#fff", border:`1.5px solid ${C.border}`, borderRadius:14, padding:"16px 18px", marginBottom:20, flexWrap:"wrap" }}>
            <div style={{ textAlign:"center", flex:1, minWidth:140 }}>
              <div style={{ fontSize:10, fontWeight:700, color:C.inkSoft, textTransform:"uppercase", letterSpacing:.8, marginBottom:3 }}>{t("res_tripstarts")}</div>
              <div style={{ fontSize:14, fontWeight:700, color:C.teal }}>📍 {startLabel}</div>
              {ans.startDate && <div style={{ fontSize:11, color:C.inkSoft, marginTop:2 }}>{new Date(ans.startDate).toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short",year:"numeric"})}</div>}
              <div style={{ fontSize:11, color:C.inkSoft }}>🕐 {ans.startTime||"09:00"}</div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2, flexShrink:0 }}>
              <div style={{ width:60, height:2, background:`linear-gradient(90deg,${C.teal},${C.amber})`, borderRadius:2 }}/>
              <div style={{ fontSize:11, color:C.inkSoft, fontWeight:600 }}>{ans.days}d · {ans.nights}n {ans.roundTrip?"🔁":"➡️"}</div>
              <div style={{ width:60, height:2, background:`linear-gradient(90deg,${C.teal},${C.amber})`, borderRadius:2 }}/>
            </div>
            <div style={{ textAlign:"center", flex:1, minWidth:140 }}>
              <div style={{ fontSize:10, fontWeight:700, color:C.inkSoft, textTransform:"uppercase", letterSpacing:.8, marginBottom:3 }}>{t("res_tripends")}</div>
              <div style={{ fontSize:14, fontWeight:700, color:C.amber }}>🏁 {ans.roundTrip ? startLabel : ((itinDays||itin.days).slice(-1)[0]?.location || startLabel)}</div>
              {ans.endDate && <div style={{ fontSize:11, color:C.inkSoft, marginTop:2 }}>{new Date(ans.endDate).toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short",year:"numeric"})}</div>}
              <div style={{ fontSize:11, color:C.inkSoft }}>{ans.roundTrip ? t("res_return") : t("res_endtrip")}</div>
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
          <div style={{ marginTop:"2rem", background:"linear-gradient(135deg,#F1ECE0,#FFF7E6)", border:"1.5px solid #DFCBA0", borderRadius:20, padding:"2rem" }}>
            <h3 style={{ fontFamily:serif, fontSize:20, fontWeight:700, color:C.ink, marginBottom:8 }}>📩 Want a local guide for this trip?</h3>
            <p style={{ fontSize:14, color:C.inkSoft, lineHeight:1.7, marginBottom:20 }}>Share this itinerary with one of our SLTDA-certified guides and receive a personalised price quote within 24 hours.</p>
            <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
              <Btn variant="amber" onClick={onGuideOpen}>Find a guide & request bid →</Btn>
              <Btn variant="outline" onClick={downloadPDF}>{t("res_pdf")}</Btn>
              <Btn variant="outline" onClick={()=>{ setStep(0); setItin(null); setItinDays(null); setStartLabel("Sri Lanka"); setAns({ days:5, nights:4, travel:"", food:[], budget:"", group:"", activities:[], transport:"", pace:"balanced", hotelStyle:"multi", customPlaces:[], startCity:"airport", startTime:"09:00", startDate:"", endDate:"", roundTrip:true }); }}>↺ New itinerary</Btn>
            </div>
          </div>
        </div>

        {/* Share itinerary modal */}
        {shareModal && (
          <div onClick={e=>e.target===e.currentTarget&&setShareModal(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.6)", zIndex:900, display:"flex", alignItems:"center", justifyContent:"center", padding:16, backdropFilter:"blur(6px)" }}>
            <div style={{ background:"#fff", borderRadius:24, width:"100%", maxWidth:440, padding:"1.8rem", boxShadow:"0 20px 60px rgba(0,0,0,.25)" }}>
              <h3 style={{ fontFamily:serif, fontSize:19, fontWeight:700, color:C.ink, marginBottom:6 }}>🔗 Share your itinerary</h3>
              <p style={{ fontSize:13, color:C.inkSoft, marginBottom:16, lineHeight:1.6 }}>Anyone with this link can view your trip plan — no account needed.</p>
              {shareModal.loading && (
                <div style={{ textAlign:"center", padding:"1.5rem" }}>
                  <div style={{ width:32, height:32, border:`3px solid ${C.tealLight}`, borderTopColor:C.teal, borderRadius:"50%", animation:"spin .8s linear infinite", margin:"0 auto 10px" }}/>
                  <p style={{ fontSize:13, color:C.inkSoft }}>Creating your shareable link…</p>
                </div>
              )}
              {shareModal.error && <div style={{ background:"#F5E7E4", border:"1px solid #E3C3BC", borderRadius:10, padding:"10px 14px", fontSize:12, color:"#A83A32" }}>Couldn't create link: {shareModal.error}</div>}
              {shareModal.url && (
                <>
                  <div style={{ display:"flex", gap:8, marginBottom:14 }}>
                    <input readOnly value={shareModal.url} onClick={e=>e.target.select()}
                      style={{ flex:1, padding:"11px 14px", border:`1.5px solid ${C.border}`, borderRadius:10, fontSize:12, fontFamily:sans, color:C.ink, outline:"none", minWidth:0 }}/>
                    <button onClick={()=>{ navigator.clipboard.writeText(shareModal.url); }} style={{ padding:"11px 16px", background:C.teal, color:"#fff", border:"none", borderRadius:10, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:sans, whiteSpace:"nowrap" }}>Copy</button>
                  </div>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    <a href={`https://wa.me/?text=${encodeURIComponent("Check out my Sri Lanka trip plan: "+shareModal.url)}`} target="_blank" rel="noopener noreferrer"
                      style={{ flex:1, textAlign:"center", padding:"10px", background:"#25D366", color:"#fff", borderRadius:10, fontSize:13, fontWeight:600, textDecoration:"none", fontFamily:sans }}>💬 WhatsApp</a>
                    <a href={`mailto:?subject=${encodeURIComponent("My Sri Lanka itinerary")}&body=${encodeURIComponent("Take a look at my trip plan: "+shareModal.url)}`}
                      style={{ flex:1, textAlign:"center", padding:"10px", background:C.surface, color:C.ink, border:`1px solid ${C.border}`, borderRadius:10, fontSize:13, fontWeight:600, textDecoration:"none", fontFamily:sans }}>✉️ Email</a>
                  </div>
                </>
              )}
              <button onClick={()=>setShareModal(null)} style={{ width:"100%", marginTop:14, padding:"10px", background:"none", border:`1px solid ${C.border}`, borderRadius:10, fontSize:13, color:C.inkSoft, cursor:"pointer", fontFamily:sans }}>Close</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Wizard steps
  const STEPS_TOTAL = 10;
  const steps = [
    // 0: Starting point + calendar date range
    <>
      <StepDots cur={0} total={STEPS_TOTAL}/>
            <h2 style={{ fontFamily:serif, fontSize:26, fontWeight:700, color:C.ink, marginBottom:8 }}>{t("q_start")}</h2>
      <p style={{ fontSize:13, color:C.inkSoft, marginBottom:16 }}>{t("daysq")}</p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr", gap:10, marginBottom:18 }}>
        {START_OPTS.map(o=><OptBtn key={o.v} sel={ans.startCity===o.v} onClick={()=>upd("startCity",o.v)} icon={o.i} label={ot(o.v).l} sub={ot(o.v).s}/>)}
      </div>
      {ans.startCity==="custom" && (
        <input value={ans.customStart||""} onChange={e=>upd("customStart",e.target.value)} placeholder="e.g. Galle, Negombo, Kandy…"
          style={{ width:"100%", marginBottom:18, padding:"12px 14px", border:`1.5px solid ${C.border}`, borderRadius:12, fontSize:13, fontFamily:sans, outline:"none", boxSizing:"border-box" }}/>
      )}

      {/* Calendar date range */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
        <div>
          <label style={{ fontSize:12, fontWeight:600, color:C.ink, display:"block", marginBottom:6 }}>📅 {t("cal_from")}</label>
          <input type="date" value={ans.startDate||""} min={new Date().toISOString().split("T")[0]}
            onChange={e=>{
              const newStart = e.target.value;
              setAns(a=>{
                const next = {...a, startDate:newStart};
                // Auto-recalculate days/nights if end date already set
                if (a.endDate && newStart) {
                  const d = Math.max(1, Math.round((new Date(a.endDate)-new Date(newStart))/86400000)+1);
                  next.days = d; next.nights = d-1;
                }
                return next;
              });
            }}
            style={{ width:"100%", padding:"11px 12px", border:`1.5px solid ${C.border}`, borderRadius:10, fontSize:13, fontFamily:sans, outline:"none", boxSizing:"border-box" }}/>
        </div>
        <div>
          <label style={{ fontSize:12, fontWeight:600, color:C.ink, display:"block", marginBottom:6 }}>📅 {t("cal_to")}</label>
          <input type="date" value={ans.endDate||""} min={ans.startDate||new Date().toISOString().split("T")[0]}
            onChange={e=>{
              const newEnd = e.target.value;
              setAns(a=>{
                const next = {...a, endDate:newEnd};
                if (a.startDate && newEnd) {
                  const d = Math.max(1, Math.round((new Date(newEnd)-new Date(a.startDate))/86400000)+1);
                  next.days = d; next.nights = d-1;
                }
                return next;
              });
            }}
            style={{ width:"100%", padding:"11px 12px", border:`1.5px solid ${C.border}`, borderRadius:10, fontSize:13, fontFamily:sans, outline:"none", boxSizing:"border-box" }}/>
        </div>
      </div>

      {ans.startDate && ans.endDate && (
        <div style={{ background:C.tealPale, border:`1px solid #B9CFC5`, borderRadius:12, padding:"10px 14px", fontSize:12, color:C.teal, marginBottom:14 }}>
          💡 {ans.days} {ans.days===1?"day":"days"}, {ans.nights} {ans.nights===1?"night":"nights"} — {new Date(ans.startDate).toLocaleDateString("en-GB",{day:"numeric",month:"short"})} to {new Date(ans.endDate).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}
        </div>
      )}

      {/* Round trip choice */}
      <label style={{ fontSize:12, fontWeight:600, color:C.ink, display:"block", marginBottom:8 }}>{t("roundtripq")}</label>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        <OptBtn sel={ans.roundTrip===true} onClick={()=>upd("roundTrip",true)} icon="🔁" label={ot("roundtrip_yes").l} sub={ot("roundtrip_yes").s}/>
        <OptBtn sel={ans.roundTrip===false} onClick={()=>upd("roundTrip",false)} icon="➡️" label={ot("roundtrip_no").l} sub={ot("roundtrip_no").s}/>
      </div>
    </>,

    // 1: Travel style
    <>
      <StepDots cur={1} total={STEPS_TOTAL}/>
            <h2 style={{ fontFamily:serif, fontSize:26, fontWeight:700, color:C.ink, marginBottom:24 }}>{t("q_travel")}</h2>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {TRAVEL_OPTS.map(o=><OptBtn key={o.v} sel={ans.travel===o.v} onClick={()=>upd("travel",o.v)} icon={o.i} label={ot(o.v).l} sub={ot(o.v).s}/>)}
      </div>
    </>,

    // 2: Activities
    <>
      <StepDots cur={2} total={STEPS_TOTAL}/>
            <h2 style={{ fontFamily:serif, fontSize:26, fontWeight:700, color:C.ink, marginBottom:8 }}>{t("q_activities")}</h2>
      <p style={{ fontSize:13, color:C.inkSoft, marginBottom:16 }}>{t("activities_sub")}</p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {ACT_OPTS.map(o=><OptBtn key={o.v} sel={ans.activities.includes(o.v)} onClick={()=>tog("activities",o.v)} icon={o.i} label={ot(o.v==="adventure"?"adventure-act":o.v).l}/>)}
      </div>
      <MismatchWarning travel={ans.travel} activities={ans.activities}/>
    </>,

    // 3: Food
    <>
      <StepDots cur={3} total={STEPS_TOTAL}/>
            <h2 style={{ fontFamily:serif, fontSize:26, fontWeight:700, color:C.ink, marginBottom:8 }}>{t("q_food")}</h2>
      <p style={{ fontSize:13, color:C.inkSoft, marginBottom:16 }}>{t("food_sub")}</p>
      <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
        {FOOD_OPT_KEYS.map(fk=>{ const s=ans.food.includes(fk); return <button key={fk} onClick={()=>tog("food",fk)} style={{ padding:"8px 16px", borderRadius:30, fontSize:13, fontWeight:500, cursor:"pointer", border:`1.5px solid ${s?C.amberMid:C.border}`, background:s?C.amberLight:C.surface, color:s?C.amber:C.inkSoft, fontFamily:sans }}>{ot(fk)}</button>; })}
      </div>
    </>,

    // 4: Group & budget
    <>
      <StepDots cur={4} total={STEPS_TOTAL}/>
            <h2 style={{ fontFamily:serif, fontSize:26, fontWeight:700, color:C.ink, marginBottom:18 }}>{t("q_groupbudget")}</h2>
      <p style={{ fontSize:13, color:C.inkSoft, marginBottom:10 }}>{t("group_sub")}</p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
        {GROUP_OPTS.map(o=><OptBtn key={o.v} sel={ans.group===o.v} onClick={()=>upd("group",o.v)} icon={o.i} label={ot(o.v).l} sub={ot(o.v).s}/>)}
      </div>
      <p style={{ fontSize:13, color:C.inkSoft, marginBottom:10 }}>{t("budget_sub")}</p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
        {BUDGET_OPTS.map(o=><OptBtn key={o.v} sel={ans.budget===o.v} onClick={()=>upd("budget",o.v)} label={ot(o.v).l} sub={ot(o.v).s}/>)}
      </div>
    </>,

    // 5: Transport
    <>
      <StepDots cur={5} total={STEPS_TOTAL}/>
            <h2 style={{ fontFamily:serif, fontSize:26, fontWeight:700, color:C.ink, marginBottom:8 }}>{t("q_transport")}</h2>
      <p style={{ fontSize:13, color:C.inkSoft, marginBottom:16 }}>{t("transport_sub")}</p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {TRANSPORT_OPTS.map(o=><OptBtn key={o.v} sel={ans.transport===o.v} onClick={()=>upd("transport",o.v)} icon={o.i} label={ot(o.v).l} sub={ot(o.v).s}/>)}
      </div>
    </>,

    // 6: Pace
    <>
      <StepDots cur={6} total={STEPS_TOTAL}/>
            <h2 style={{ fontFamily:serif, fontSize:26, fontWeight:700, color:C.ink, marginBottom:8 }}>{t("q_pace")}</h2>
      <p style={{ fontSize:13, color:C.inkSoft, marginBottom:16 }}>{t("pace_sub")}</p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr", gap:10 }}>
        {PACE_OPTS.map(o=><OptBtn key={o.v} sel={ans.pace===o.v} onClick={()=>upd("pace",o.v)} icon={o.i} label={ot(o.v).l} sub={ot(o.v).s}/>)}
      </div>
    </>,

    // 7: Hotel base style
    <>
      <StepDots cur={7} total={STEPS_TOTAL}/>
            <h2 style={{ fontFamily:serif, fontSize:26, fontWeight:700, color:C.ink, marginBottom:8 }}>{t("q_hotelstyle")}</h2>
      <p style={{ fontSize:13, color:C.inkSoft, marginBottom:16 }}>{t("hotelstyle_sub")}</p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr", gap:10 }}>
        <OptBtn sel={ans.hotelStyle==="base"} onClick={()=>upd("hotelStyle","base")} icon="🏨" label={ot("hotel_base").l} sub={ot("hotel_base").s}/>
        <OptBtn sel={ans.hotelStyle==="multi"} onClick={()=>upd("hotelStyle","multi")} icon="🧳" label={ot("hotel_multi").l} sub={ot("hotel_multi").s}/>
      </div>
    </>,

    // 8: Custom places
    <>
      <StepDots cur={8} total={STEPS_TOTAL}/>
            <h2 style={{ fontFamily:serif, fontSize:26, fontWeight:700, color:C.ink, marginBottom:6 }}>{t("q_places")}</h2>
      <p style={{ fontSize:13, color:C.inkSoft, marginBottom:20, lineHeight:1.6 }}>
        {t("places_sub")}
      </p>
      {/* Input row */}
      <div className="place-input-row" style={{ display:"flex", gap:8, marginBottom:16 }}>
        <input
          value={placeInput}
          onChange={e=>setPlaceInput(e.target.value)}
          onKeyDown={e=>{ if(e.key==="Enter"&&placeInput.trim()){ setAns(a=>({...a,customPlaces:[...a.customPlaces,placeInput.trim()]})); setPlaceInput(""); } }}
          placeholder={t("places_placeholder")}
          style={{ flex:1, padding:"12px 14px", border:`1.5px solid ${C.border}`, borderRadius:12, fontSize:13, fontFamily:sans, color:C.ink, outline:"none", minWidth:0 }}
        />
        <button
          onClick={()=>{ if(placeInput.trim()){ setAns(a=>({...a,customPlaces:[...a.customPlaces,placeInput.trim()]})); setPlaceInput(""); } }}
          style={{ padding:"12px 18px", background:C.teal, color:"#fff", border:"none", borderRadius:12, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:sans, whiteSpace:"nowrap", flexShrink:0 }}>
          {t("places_add")}
        </button>
      </div>
      {/* Added places list */}
      {ans.customPlaces.length > 0 ? (
        <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
          {ans.customPlaces.map((p,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", background:C.tealLight, border:`1px solid #B9CFC5`, borderRadius:12 }}>
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
          {t("places_empty")}<br/>
          <span style={{ fontSize:12, opacity:.7 }}>{t("places_optional")}</span>
        </div>
      )}
      <div style={{ background:C.amberLight, border:`1px solid #DFCBA0`, borderRadius:12, padding:"10px 14px", fontSize:12, color:C.amber, marginTop:16, lineHeight:1.6 }}>
        💡 {t("places_tip")}
      </div>
    </>,

    // 9: Rural experience opt-in (only shown if rural selected, else skipped visually)
    <>
      <StepDots cur={9} total={STEPS_TOTAL}/>
            <h2 style={{ fontFamily:serif, fontSize:26, fontWeight:700, color:C.ink, marginBottom:8 }}>
        {ans.travel==="rural" ? t("q_rural_title") : t("q_final_title")}
      </h2>
      {ans.travel==="rural" ? (
        <>
          <p style={{ fontSize:13, color:C.inkSoft, marginBottom:16 }}>{t("rural_sub")}</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {[
              {v:"village-homestay",  i:"🏡", ok:"villagehomestay"},
              {v:"paddy-farming",     i:"🌾", ok:"paddyfarming"},
              {v:"cooking-class",     i:"🍳", ok:"cookingclass"},
              {v:"spice-garden",      i:"🌿", ok:"spicegarden"},
              {v:"fishing-village",   i:"🎣", ok:"fishingvillage"},
              {v:"vedda-community",   i:"🏹", ok:"veddacommunity"},
              {v:"elephant-village",  i:"🐘", ok:"elephantvillage"},
              {v:"pottery-weaving",   i:"🏺", ok:"potteryweaving"},
            ].map(o=><OptBtn key={o.v} sel={ans.activities.includes(o.v)} onClick={()=>tog("activities",o.v)} icon={o.i} label={ot(o.ok).l} sub={ot(o.ok).s}/>)}
          </div>
        </>
      ) : (
        <>
          {/* Start time picker */}
          <p style={{ fontSize:13, color:C.inkSoft, marginBottom:16, lineHeight:1.6 }}>{t("final_sub")}</p>

          <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:"16px 18px", marginBottom:16 }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.ink, marginBottom:10 }}>{t("starttime_label")}</div>
            <p style={{ fontSize:12, color:C.inkSoft, marginBottom:12 }}>{t("starttime_sub")}</p>
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
            <div style={{ fontSize:13, fontWeight:700, color:C.ink, marginBottom:10 }}>{t("tripsummary_label")}</div>
            {[
              ["📅",t("sum_dates"),ans.startDate&&ans.endDate?`${new Date(ans.startDate).toLocaleDateString("en-GB",{day:"numeric",month:"short"})} → ${new Date(ans.endDate).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}`:t("sum_notset")],
              ["📅",t("sum_duration"),`${ans.days} ${ans.days===1?"day":"days"}, ${ans.nights} ${ans.nights===1?"night":"nights"}`],
              ["🕐",t("sum_starttime"),ans.startTime||"09:00"],
              ["📍",t("sum_startfrom"),ans.startCity==="airport"?ot("airport").l:ans.startCity==="colombo"?ot("colombo").l:ans.customStart||ot("colombo").l],
              ["🔁",t("sum_triptype"),ans.roundTrip?t("sum_roundtrip_full"):t("sum_oneway")],
              ["🗺️",t("sum_style"),ans.travel?ot(ans.travel).l:t("sum_notselected")],
              ["👥",t("sum_group"),ans.group?ot(ans.group).l:t("sum_notselected")],
              ["💰",t("sum_budget"),ans.budget?ot(ans.budget).l:t("sum_notselected")],
              ["🚗",t("sum_transport"),ans.transport?ot(ans.transport).l:t("sum_notselected")],
              ["⚡",t("sum_pace"),ot(ans.pace||"balanced").l],
              ["🏨",t("sum_hotelstyle"),ans.hotelStyle==="base"?t("sum_onebase"):t("sum_moving")],
              ...(ans.customPlaces.length?[["📍",t("sum_places"),ans.customPlaces.join(", ")]]:[]),
            ].map(([icon,label,val])=>(
              <div key={label} style={{ display:"flex", gap:12, padding:"6px 0", borderBottom:`1px solid ${C.border}`, fontSize:12 }}>
                <span style={{ fontSize:14 }}>{icon}</span>
                <span style={{ color:C.inkSoft, minWidth:90 }}>{label}</span>
                <span style={{ fontWeight:600, color:C.ink, flex:1 }}>{val}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </>,
  ];

  return (
    <div style={{ minHeight:"100vh", background:C.surface }}>
      <div style={{ background:"linear-gradient(135deg,#0A2620,#0E4A3D)", padding:"3rem 2rem 2.5rem", position:"relative", overflow:"hidden" }}>
        <HeroArt/>
        <div style={{ position:"relative", zIndex:2, maxWidth:680, margin:"0 auto", textAlign:"center" }}>
          <div style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,.6)", textTransform:"uppercase", letterSpacing:2, marginBottom:10 }}>Journey Creator</div>
          <h1 style={{ fontFamily:serif, fontSize:"clamp(26px,4vw,42px)", fontWeight:700, color:"#fff", marginBottom:10 }}>{t("wiz_title")}</h1>
          <p style={{ fontSize:15, color:"rgba(255,255,255,.7)", fontWeight:300 }}>{t("wiz_sub")}</p>
        </div>
      </div>
      <div style={{ maxWidth:640, margin:"2.5rem auto", padding:"0 1.5rem 4rem" }}>
        <div className="wizard-card" style={{ background:C.white, borderRadius:24, padding:"2.5rem", border:`1px solid ${C.border}`, boxShadow:"0 4px 24px rgba(0,0,0,.06)" }}>
          {steps[step]}
          <div className="wizard-btn-row" style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:28, paddingTop:20, borderTop:`1px solid ${C.border}`, gap:12 }}>
            {step>0 ? <Btn variant="outline" onClick={()=>setStep(s=>s-1)}>{t("wiz_back")}</Btn> : <span/>}
            {step<9
              ? <Btn onClick={()=>{
                  if (step===0) {
                    if (!ans.startDate || !ans.endDate) { alert("Please pick your start and end dates."); return; }
                    if (ans.roundTrip===undefined) { alert("Please choose whether this is a round trip or one-way."); return; }
                  }
                  setStep(s=>s+1);
                }}>{t("wiz_next")}</Btn>
              : <Btn variant="amber" onClick={()=>{
                  if(!user){
                    // Wizard answers are already auto-saved to localStorage —
                    // they'll be restored automatically after login.
                    onLoginNeeded();
                    return;
                  }
                  generate();
                }}>{t("wiz_generate")}</Btn>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── GUIDE DRAWER ────────────────────────────────────────────────────────────
// ─── BOOKING MANAGEMENT PANEL ─────────────────────────────────────────────────
// Shown to both tourist and guide once a booking is confirmed (paid). Handles:
//  - In-app chat between the two parties
//  - Trip completion confirmation (both must confirm to release held funds)
//  - No-show reporting (tourist only)
//  - Optional WhatsApp/phone contact sharing
// ─── TRIP PROGRESS BAR ────────────────────────────────────────────────────────
// Visual stepper shown to both tourist and guide so either side can see exactly
// where a booking stands: paid & confirmed → trip taking place → both sides
// confirmed it happened → remaining balance released to the guide.
function TripProgressBar({ status, iConfirmedUnderway, theyConfirmedUnderway, iConfirmed, theyConfirmed }) {
  const bothUnderway = iConfirmedUnderway && theyConfirmedUnderway;
  const bothConfirmed = iConfirmed && theyConfirmed;
  const isDisputed = status === "disputed";
  const isUnderway = status === "underway" || status === "completed";
  const isCompleted = status === "completed";

  // Determine how far along the 4-stage journey we are (0-3)
  let activeIdx = 0; // 0: booked & paid
  if (isUnderway) activeIdx = 1; // 1: both confirmed the trip started
  if (isUnderway && (iConfirmed || theyConfirmed)) activeIdx = 2; // 2: at least one side confirmed completion
  if (isCompleted) activeIdx = 3; // 3: both confirmed, payment released

  const stage1Label = status==="confirmed" && (iConfirmedUnderway || theyConfirmedUnderway) && !bothUnderway
    ? "Confirming underway…" : "Trip underway";
  const steps = [
    { label:"Booked & paid" },
    { label: stage1Label },
    { label: bothConfirmed ? "Both confirmed" : "Awaiting confirmation" },
    { label:"Balance released" },
  ];

  return (
    <div style={{ marginBottom:12 }}>
      <div style={{ display:"flex", alignItems:"center" }}>
        {steps.map((s, i) => (
          <React.Fragment key={i}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flex:"0 0 auto" }}>
              <div style={{
                width:20, height:20, borderRadius:"50%", flexShrink:0,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:11, fontWeight:700, color:"#fff",
                background: isDisputed && i>=2 ? "#A83A32" : i <= activeIdx ? C.teal : "#D8E3DE",
              }}>
                {i < activeIdx || (i===activeIdx && isCompleted) ? "✓" : i+1}
              </div>
            </div>
            {i < steps.length-1 && (
              <div style={{ flex:1, height:3, borderRadius:2, margin:"0 2px",
                background: isDisputed && i>=1 ? "#FCA5A5" : i < activeIdx ? C.teal : "#D8E3DE" }}/>
            )}
          </React.Fragment>
        ))}
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
        {steps.map((s,i)=>(
          <span key={i} style={{ fontSize:9.5, color: i<=activeIdx?C.ink:C.inkSoft, fontWeight:i===activeIdx?700:400, textAlign:i===0?"left":i===steps.length-1?"right":"center", flex:1 }}>
            {s.label}
          </span>
        ))}
      </div>
      {isDisputed && <div style={{ fontSize:11, color:"#A83A32", marginTop:6 }}>⚠️ Progress paused — this booking is under CeylonTrails admin review.</div>}
    </div>
  );
}

function BookingManagementPanel({ req, role, user, onUpdate, onReviewGuide, onAddToTrips, guidePhone }) {
  const [showChat, setShowChat]   = useState(false);
  const [messages, setMessages]   = useState([]);
  const [msgInput, setMsgInput]   = useState("");
  const [loadingMsgs, setLM]      = useState(false);
  const [confirmingUnderway, setConfirmingUnderway] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [showNoShow, setShowNoShow] = useState(false);
  const [noShowReason, setNoShowReason] = useState("");

  const myUnderwayField    = role==="tourist" ? "touristConfirmedUnderway" : "guideConfirmedUnderway";
  const theirUnderwayField = role==="tourist" ? "guideConfirmedUnderway" : "touristConfirmedUnderway";
  const iConfirmedUnderway    = !!req[myUnderwayField];
  const theyConfirmedUnderway = !!req[theirUnderwayField];

  const myConfirmField   = role==="tourist" ? "touristConfirmedComplete" : "guideConfirmedComplete";
  const theirConfirmField= role==="tourist" ? "guideConfirmedComplete" : "touristConfirmedComplete";
  const iConfirmed    = !!req[myConfirmField];
  const theyConfirmed = !!req[theirConfirmField];
  const otherPartyName = role==="tourist" ? req.guideName : (req.touristName||req.touristEmail);

  const loadChat = async () => {
    setLM(true);
    if (!window.firebase?.firestore) await loadScript("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js");
    const msgs = await loadBookingMessages(req.id);
    setMessages(msgs);
    setLM(false);
  };

  const handleSend = async () => {
    if (!msgInput.trim()) return;
    const text = msgInput;
    setMsgInput("");
    try {
      await sendBookingMessage(req.id, role, role==="tourist"?(user?.displayName||user?.email):req.guideName, text);
      setMessages(m=>[...m, { fromRole:role, text, sentAt:new Date().toISOString() }]);
    } catch(e) { alert("Could not send message: " + e.message); }
  };

  const handleConfirmUnderway = async () => {
    if (!window.confirm("Confirm that this trip has started / is underway?")) return;
    setConfirmingUnderway(true);
    try {
      const bothNow = await confirmTripUnderway(req.id, role);
      onUpdate({ [myUnderwayField]: true, status: bothNow ? "underway" : req.status });
    } catch(e) { alert("Could not confirm: " + e.message); }
    setConfirmingUnderway(false);
  };

  const handleConfirmComplete = async () => {
    if (!window.confirm("Confirm that this trip happened as planned? This helps release payment to your " + (role==="tourist"?"guide":"client") + ".")) return;
    setConfirming(true);
    try {
      const bothNow = await confirmTripCompletion(req.id, role, req.guideId);
      onUpdate({ [myConfirmField]: true, status: bothNow ? "completed" : req.status, payment: bothNow ? { ...req.payment, heldReleased:true } : req.payment });
    } catch(e) { alert("Could not confirm: " + e.message); }
    setConfirming(false);
  };

  const handleReportNoShow = async () => {
    if (!noShowReason.trim()) { alert("Please describe what happened."); return; }
    try {
      await reportNoShow(req.id, noShowReason);
      onUpdate({ status:"disputed", disputeReason:noShowReason });
      setShowNoShow(false);
    } catch(e) { alert("Could not submit report: " + e.message); }
  };

  return (
    <div style={{ background: req.status==="disputed"?"#F5E7E4":req.status==="completed"?C.tealPale:C.tealPale, border:`1px solid ${req.status==="disputed"?"#E3C3BC":"#B9CFC5"}`, borderRadius:10, padding:"12px 14px" }}>
      <div style={{ fontSize:12, color: req.status==="disputed"?"#A83A32":C.teal, marginBottom:10 }}>
        {req.status==="completed" ? "✅ Trip completed" :
         req.status==="underway"  ? "🚗 Trip underway" :
         req.status==="disputed"  ? "⚠️ Under review by CeylonTrails admin" :
         "✅ Booking confirmed"} · Paid ${req.payment.total}
      </div>

      <TripProgressBar status={req.status} iConfirmedUnderway={iConfirmedUnderway} theyConfirmedUnderway={theyConfirmedUnderway} iConfirmed={iConfirmed} theyConfirmed={theyConfirmed}/>

      {/* Payment split — guide only. Showing the tourist that part of "their" guide's
          money is being held isn't something they need to see; they've simply paid
          the agreed total and the platform handles the mechanics behind the scenes. */}
      {req.status!=="disputed" && role==="guide" && (
        <div style={{ background:"rgba(255,255,255,.7)", borderRadius:8, padding:"8px 10px", fontSize:11, color:C.ink, marginBottom:10 }}>
          <div style={{ display:"flex", justifyContent:"space-between" }}><span>Paid to you now (30%)</span><strong>${req.payment.guideInstantShare ?? Math.round(req.payment.guideAmount*0.3*100)/100}</strong></div>
          <div style={{ display:"flex", justifyContent:"space-between" }}>
            <span>{req.payment.heldReleased ? "Released to you (70%)" : "🔒 Held until both confirm (70%)"}</span>
            <strong>${req.payment.guideHeldShare ?? Math.round(req.payment.guideAmount*0.7*100)/100}</strong>
          </div>
        </div>
      )}

      {/* Chat toggle */}
      <button onClick={()=>{ setShowChat(s=>!s); if(!showChat) loadChat(); }} style={{ width:"100%", padding:"9px", background:"#fff", border:`1px solid ${C.border}`, borderRadius:8, fontSize:12, fontWeight:600, color:C.ink, cursor:"pointer", fontFamily:sans, marginBottom:8 }}>
        💬 {showChat?"Hide":"Message"} {otherPartyName}
      </button>

      {showChat && (
        <div style={{ background:"#fff", border:`1px solid ${C.border}`, borderRadius:10, marginBottom:10, overflow:"hidden" }}>
          <div style={{ maxHeight:220, overflowY:"auto", padding:"10px" }}>
            {loadingMsgs && <p style={{ fontSize:11, color:C.inkSoft, textAlign:"center" }}>Loading messages…</p>}
            {!loadingMsgs && messages.length===0 && <p style={{ fontSize:11, color:C.inkSoft, textAlign:"center" }}>No messages yet — say hello!</p>}
            {messages.map((m,i)=>(
              <div key={m.id||i} style={{ display:"flex", justifyContent:m.fromRole===role?"flex-end":"flex-start", marginBottom:6 }}>
                <div style={{ maxWidth:"75%", background:m.fromRole===role?C.teal:C.surface, color:m.fromRole===role?"#fff":C.ink, padding:"7px 11px", borderRadius:12, fontSize:12 }}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:6, padding:"8px", borderTop:`1px solid ${C.border}` }}>
            <input value={msgInput} onChange={e=>setMsgInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSend()}
              placeholder="Type a message…" style={{ flex:1, padding:"8px 10px", border:`1px solid ${C.border}`, borderRadius:8, fontSize:12, fontFamily:sans, outline:"none", minWidth:0 }}/>
            <button onClick={handleSend} style={{ padding:"8px 14px", background:C.teal, color:"#fff", border:"none", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:sans }}>Send</button>
          </div>
          {role==="tourist" && req.guidePhone && (
            <div style={{ padding:"8px 10px", borderTop:`1px solid ${C.border}`, fontSize:11, color:C.inkSoft }}>
              📞 Guide's phone (shared by them): <a href={`tel:${req.guidePhone}`} style={{ color:C.teal, fontWeight:600 }}>{req.guidePhone}</a>
            </div>
          )}
          {role==="guide" && guidePhone && !req.guidePhone && (
            <button onClick={async()=>{
              try {
                await window.firebase.firestore().collection("tripRequests").doc(req.id).update({ guidePhone });
                onUpdate({ guidePhone });
              } catch(e) { alert("Could not share phone: " + e.message); }
            }} style={{ width:"100%", padding:"8px", borderTop:`1px solid ${C.border}`, background:"none", border:"none", borderTopColor:C.border, fontSize:11, color:C.teal, cursor:"pointer", fontFamily:sans, fontWeight:600 }}>
              📞 Share my phone number with this tourist
            </button>
          )}
          {role==="guide" && req.guidePhone && (
            <div style={{ padding:"8px 10px", borderTop:`1px solid ${C.border}`, fontSize:11, color:C.inkSoft }}>
              📞 You shared: <strong>{req.guidePhone}</strong>
            </div>
          )}
        </div>
      )}

      {/* Stage 1: mutual "trip underway" confirmation */}
      {req.status==="confirmed" && (
        <div style={{ marginBottom:8 }}>
          {!iConfirmedUnderway ? (
            <button onClick={handleConfirmUnderway} disabled={confirmingUnderway} style={{ width:"100%", padding:"9px", background:C.teal, color:"#fff", border:"none", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:sans, opacity:confirmingUnderway?.6:1 }}>
              {confirmingUnderway?"Confirming…":"🚗 Mark trip as underway"}
            </button>
          ) : (
            <div style={{ fontSize:11, color:C.teal, textAlign:"center", padding:"6px 0" }}>
              ✓ You confirmed the trip is underway · {theyConfirmedUnderway ? "Both sides confirmed!" : `Waiting for ${otherPartyName} to confirm too`}
            </div>
          )}
          {role==="tourist" && !iConfirmedUnderway && (
            <button onClick={()=>setShowNoShow(true)} style={{ width:"100%", marginTop:6, padding:"7px", background:"none", border:"none", color:C.coral, fontSize:11, cursor:"pointer", fontFamily:sans, textDecoration:"underline" }}>
              The guide didn't show up — report this
            </button>
          )}
        </div>
      )}

      {/* Stage 2: mutual "trip completed" confirmation — only once both sides have
          already confirmed the trip started */}
      {req.status==="underway" && (
        <div style={{ marginBottom:8 }}>
          {!iConfirmed ? (
            <button onClick={handleConfirmComplete} disabled={confirming} style={{ width:"100%", padding:"9px", background:C.teal, color:"#fff", border:"none", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:sans, opacity:confirming?.6:1 }}>
              {confirming?"Confirming…":"✅ Confirm trip completed"}
            </button>
          ) : (
            <div style={{ fontSize:11, color:C.teal, textAlign:"center", padding:"6px 0" }}>
              ✓ You confirmed · {theyConfirmed ? "Both sides confirmed — payment released!" : `Waiting for ${otherPartyName} to confirm too`}
            </div>
          )}
        </div>
      )}

      {req.status==="completed" && role==="tourist" && (
        <button onClick={()=>onReviewGuide?.({ guideName:req.guideName, tripRef:req.id })} style={{ width:"100%", padding:"9px", background:C.amber, color:"#fff", border:"none", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:sans }}>
          ⭐ Leave a review for {req.guideName}
        </button>
      )}

      {req.status==="completed" && role==="guide" && (
        <button onClick={()=>onAddToTrips?.(req)} style={{ width:"100%", padding:"9px", background:C.amber, color:"#fff", border:"none", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:sans }}>
          ➕ Add this trip to my profile
        </button>
      )}

      {/* No-show report modal */}
      {showNoShow && (
        <div onClick={e=>e.target===e.currentTarget&&setShowNoShow(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.6)", zIndex:1100, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
          <div style={{ background:"#fff", borderRadius:16, padding:"1.4rem", width:"100%", maxWidth:380 }}>
            <h4 style={{ fontFamily:serif, fontSize:16, fontWeight:700, color:C.ink, marginBottom:8 }}>Report a no-show</h4>
            <p style={{ fontSize:12, color:C.inkSoft, marginBottom:10, lineHeight:1.6 }}>This pauses the held payment and flags the booking for CeylonTrails admin review.</p>
            <textarea value={noShowReason} onChange={e=>setNoShowReason(e.target.value)} rows={3} placeholder="What happened?"
              style={{ width:"100%", padding:"9px 11px", border:`1px solid ${C.border}`, borderRadius:8, fontSize:12, fontFamily:sans, outline:"none", resize:"vertical", boxSizing:"border-box", marginBottom:12 }}/>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={handleReportNoShow} style={{ flex:1, padding:"10px", background:C.coral, color:"#fff", border:"none", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:sans }}>Submit report</button>
              <button onClick={()=>setShowNoShow(false)} style={{ flex:1, padding:"10px", background:"none", border:`1px solid ${C.border}`, borderRadius:8, fontSize:12, cursor:"pointer", fontFamily:sans }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GuideDrawer({ open, onClose, itin, user, onLoginNeeded, onReviewGuide }) {
  const [screen,    setScreen]   = useState("terms");
  const [termsOk,   setTermsOk]  = useState(false);
  const [selected,  setSelected] = useState(null);
  const [guides,    setGuides]   = useState([]);
  const [loadingG,  setLoadingG] = useState(false);
  const [myRequests,setMyRequests]=useState([]);
  const [showReqs,  setShowReqs] = useState(false);
  const [sendMsg,   setSendMsg]  = useState("");
  const [sending,   setSending]  = useState(false);
  const [payModal,  setPayModal] = useState(null); // {request}
  const [paying,    setPaying]   = useState(false);
  const [payStep,   setPayStep]  = useState("confirm");
  const [payTermsOk, setPayTermsOk] = useState(false);
  const [approvedReviews, setApprovedReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(()=>{
    if(open){ setScreen("terms"); setTermsOk(false); setSelected(null); setShowReqs(false); }
  },[open]);

  // Load admin-approved reviews for whichever guide's portfolio is open —
  // this is where reviews the admin has moderated actually become visible
  // to other tourists.
  useEffect(()=>{
    if (screen==="portfolio" && selected) {
      const guideName = selected.fullName || selected.name;
      setLoadingReviews(true);
      loadApprovedReviewsForGuide(guideName).then(rs=>{ setApprovedReviews(rs); setLoadingReviews(false); });
    }
  },[screen, selected]);

  const loadGuides = async () => {
    setLoadingG(true);
    // Load Firestore if needed
    if(window.firebase && !window.firebase.firestore){
      await loadScript("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js");
    }
    const fromFirestore = await loadApprovedGuides();
    console.log("Approved guides from Firestore:", fromFirestore.length, fromFirestore);
    if(fromFirestore.length > 0){
      setGuides(fromFirestore);
    } else {
      console.warn("No approved guides found in Firestore — showing demo guides instead. Check browser console for Firestore errors above, and confirm a guide has status:'approved' in the Firebase console.");
      // Fallback to static guides if Firestore empty
      setGuides(GUIDES.map(g=>({
        uid:String(g.id), fullName:g.name, specialty:g.specialty,
        areas:g.areas, langs:g.langs.split(" · "),
        experience:g.exp, rating:g.rating, reviews:g.reviews,
        bio:g.bio, sltdaNo:"SLTDA-VERIFIED", status:"approved",
        specialties:g.specialty.split(" & "), photo:"",
        tours:g.tours, rev1:g.rev1, rev2:g.rev2,
        // Keep gradient data for avatar fallback
        initials:g.initials, g1:g.g1, g2:g.g2, gtxt:g.gtxt,
      })));
    }
    setLoadingG(false);
  };

  const loadMyRequests = async () => {
    if(!user) return;
    if(window.firebase && !window.firebase.firestore){
      await loadScript("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js");
    }
    const reqs = await loadTouristRequests(user.uid);
    setMyRequests(reqs);
  };

  const sendRequest = async () => {
    if(!user){ onLoginNeeded(); return; }
    if(!selected) return;
    setSending(true);
    try {
      // Store the FULL itinerary (not truncated) so the guide can see every day's
      // activities before deciding whether to bid. Previously this was sliced to
      // 2000 chars which cut off mid-JSON and left guides unable to see the trip.
      const fullItin = itin ? { ...itin, days: itin.days } : null;
      await saveTripRequest({
        guideId:      selected.uid || String(selected.id),
        guideName:    selected.fullName || selected.name,
        guideEmail:   selected.email || "",
        touristUid:   user.uid,
        touristEmail: user.email,
        touristName:  user.displayName || user.email?.split("@")[0] || "Tourist",
        itinTitle:    itin?.title || "Custom trip",
        itinTagline:  itin?.tagline || "",
        itinDays:     itin?.days?.length || 0,
        itinFull:     fullItin, // complete itinerary object — guide can view full day-by-day plan
        // Trip start/end details — so the guide knows exactly when and where
        tripStartDate: itin?.tripMeta?.startDate || "",
        tripEndDate:   itin?.tripMeta?.endDate || "",
        tripStartTime: itin?.tripMeta?.startTime || "",
        tripStartLocation: itin?.tripMeta?.startLocation || "",
        tripEndLocation:   itin?.tripMeta?.endLocation || "",
        tripRoundTrip: itin?.tripMeta?.roundTrip ?? null,
        message:      sendMsg,
        status:       "pending",
      });
      setScreen("success");
      setSendMsg("");
    } catch(e){ alert("Error sending request: "+e.message); }
    setSending(false);
  };

  const handleAcceptBid = async () => {
    if(!payModal) return;
    setPaying(true);
    // Simulate PayPal processing
    setTimeout(async()=>{
      try{
        const total = Number(payModal.bid?.price||0);
        const commission = Math.round(total * 0.15 * 100) / 100;
        const guideAmount = Math.round((total - commission) * 100) / 100;
        const guideInstantShare = Math.round(guideAmount * GUIDE_INSTANT_RATE * 100) / 100;
        const guideHeldShare = Math.round((guideAmount - guideInstantShare) * 100) / 100;
        await payFullAndEscrow(payModal.id, total, payModal.guideId);
        setMyRequests(rs=>rs.map(r=>r.id===payModal.id?{...r,status:"confirmed",touristConfirmedComplete:false,guideConfirmedComplete:false,payment:{total,commission,guideAmount,guideInstantShare,guideHeldShare,heldReleased:false}}:r));
        setPayStep("success");
      } catch(e){ alert("Payment error: "+e.message); }
      setPaying(false);
    }, 2000);
  };

  if(!open) return null;

  const g = selected;

  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.45)", zIndex:600, backdropFilter:"blur(3px)" }}/>
      <div style={{ position:"fixed", top:0, right:0, bottom:0, width:500, maxWidth:"100vw", background:C.white, zIndex:700, boxShadow:"-8px 0 48px rgba(0,0,0,.18)", display:"flex", flexDirection:"column", animation:"slideIn .25s ease" }}>
        <style>{`@keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>

        {/* Header */}
        <div style={{ padding:"16px 20px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <div>
            <div style={{ fontFamily:serif, fontSize:17, fontWeight:700, color:C.ink }}>
              {screen==="terms"?"Before you continue":screen==="list"?"Find a Guide":screen==="portfolio"&&g?g.fullName||g.name:screen==="request"?"Send trip request":screen==="success"?"Request sent!":"Find a Guide"}
            </div>
            {screen==="list"&&<div style={{ fontSize:12, color:C.inkSoft, marginTop:2 }}>{guides.length} SLTDA-verified guides available</div>}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            {screen==="portfolio"&&<button onClick={()=>setScreen("list")} style={{ fontSize:12, fontWeight:600, color:C.teal, background:"none", border:"none", cursor:"pointer", fontFamily:sans }}>← All guides</button>}
            {screen==="request"&&<button onClick={()=>setScreen("portfolio")} style={{ fontSize:12, fontWeight:600, color:C.teal, background:"none", border:"none", cursor:"pointer", fontFamily:sans }}>← Back</button>}
            <button onClick={onClose} style={{ width:32, height:32, borderRadius:"50%", border:`1px solid ${C.border}`, background:C.surface, cursor:"pointer", fontSize:15, color:C.inkSoft }}>✕</button>
          </div>
        </div>

        {/* My requests tab (when logged in) */}
        {screen==="list" && user && (
          <div style={{ padding:"8px 20px", borderBottom:`1px solid ${C.border}`, display:"flex", gap:8 }}>
            <button onClick={()=>setShowReqs(false)} style={{ flex:1, padding:"8px", background:!showReqs?C.teal:"transparent", color:!showReqs?"#fff":C.inkSoft, border:"none", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:sans }}>Browse guides</button>
            <button onClick={()=>{ setShowReqs(true); loadMyRequests(); }} style={{ flex:1, padding:"8px", background:showReqs?C.teal:"transparent", color:showReqs?"#fff":C.inkSoft, border:"none", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:sans }}>My requests {myRequests.filter(r=>r.bid&&r.status!=="accepted").length>0&&`(${myRequests.filter(r=>r.bid&&r.status!=="accepted").length} bids)`}</button>
          </div>
        )}

        <div style={{ flex:1, overflowY:"auto", padding:"20px" }}>

          {/* ── Terms ── */}
          {screen==="terms"&&(
            <>
              <p style={{ fontSize:14, color:C.inkSoft, marginBottom:16, lineHeight:1.7 }}>Please read and accept the following before browsing certified guides.</p>
              <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:"14px 16px", maxHeight:220, overflowY:"auto", fontSize:13, color:C.inkSoft, lineHeight:1.7, marginBottom:16 }}>
                {[["1. Guide verification","All guides are SLTDA-verified. Certifications reviewed annually."],["2. Booking & payment","Payments processed through CeylonTrails. 15% commission applies. No hidden fees to tourists."],["3. Bid requests","Guides respond within 24 hours. No obligation to accept any bid."],["4. Cancellation","48+ hours before trip: full refund. Within 48 hours: 25% fee may apply."],["5. Liability","CeylonTrails is an intermediary. Guides carry SLTDA-mandated insurance."],["6. Reviews","Honest reviews encouraged. Fraudulent reviews will be removed."],["7. Privacy","Your details only shared with guides you explicitly select."]].map(([t,d])=><p key={t} style={{ marginBottom:10 }}><strong style={{ color:C.ink }}>{t}</strong> — {d}</p>)}
              </div>
              <label style={{ display:"flex", alignItems:"center", gap:10, fontSize:14, color:C.ink, cursor:"pointer", padding:"12px 14px", border:`1px solid ${C.border}`, borderRadius:12, background:C.surface, marginBottom:20 }}>
                <input type="checkbox" checked={termsOk} onChange={e=>setTermsOk(e.target.checked)} style={{ accentColor:C.teal, width:16, height:16 }}/>
                I have read and agree to CeylonTrails' terms and conditions
              </label>
              <Btn full onClick={()=>{ if(!termsOk){alert("Please accept the terms.");return;} loadGuides(); setScreen("list"); }}>Accept & browse guides →</Btn>
            </>
          )}

          {/* ── My Requests (bids received) ── */}
          {screen==="list" && showReqs && (
            <>
              {myRequests.length===0 && <div style={{ textAlign:"center", padding:"3rem", color:C.inkSoft }}><div style={{ fontSize:40, marginBottom:12 }}>📩</div><p>No trip requests sent yet. Browse guides and send a request first.</p></div>}
              {myRequests.map(req=>{
                const commission = req.bid?.price ? Math.round(Number(req.bid.price)*0.15*100)/100 : 0;
                const guideGets  = req.bid?.price ? Math.round(Number(req.bid.price)*0.85*100)/100 : 0;
                return (
                  <div key={req.id} style={{ border:`1.5px solid ${C.border}`, borderRadius:16, padding:"1.2rem", marginBottom:12, background:C.white }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:8, marginBottom:10 }}>
                      <div>
                        <div style={{ fontSize:14, fontWeight:700, color:C.ink }}>{req.guideName}</div>
                        <div style={{ fontSize:12, color:C.inkSoft, marginTop:2 }}>{req.itinTitle} · {req.itinDays} days</div>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20,
                          background:req.status==="completed"?C.tealLight:req.status==="confirmed"||req.status==="underway"?C.tealLight:req.status==="disputed"?"#F1ECD8":req.status==="guide_declined"?"#FEE2E2":req.status==="declined"?"#F1F5F9":req.bid?C.amberLight:C.surface,
                          color:req.status==="completed"?C.teal:req.status==="confirmed"||req.status==="underway"?C.teal:req.status==="disputed"?"#8A6A34":req.status==="guide_declined"?"#A83A32":req.status==="declined"?"#64748B":req.bid?C.amber:C.inkSoft,
                          border:`1px solid ${req.status==="completed"||req.status==="confirmed"||req.status==="underway"?"#B9CFC5":req.status==="disputed"?"#C9AD7C":req.status==="guide_declined"?"#E3C3BC":req.status==="declined"?"#E2E8F0":req.bid?"#DFCBA0":C.border}` }}>
                          {req.status==="completed"?"✅ Trip completed":req.status==="underway"?"🚗 Trip underway":req.status==="confirmed"?"✅ Confirmed":req.status==="disputed"?"⚠️ Under review":req.status==="guide_declined"?"🚫 Guide unavailable":req.status==="declined"?"❌ You declined":req.bid?"💬 Bid received":"⏳ Awaiting bid"}
                        </span>
                        {req.status!=="confirmed" && req.status!=="underway" && (
                          <button onClick={async()=>{
                            if (!window.confirm("Remove this request from your list? The guide will still have a record of it.")) return;
                            try {
                              await removeTripRequestForTourist(req.id);
                              setMyRequests(rs=>rs.filter(r=>r.id!==req.id));
                            } catch(e) { alert("Could not remove: " + e.message); }
                          }} title="Remove from my list" style={{ width:24, height:24, borderRadius:"50%", border:`1px solid ${C.border}`, background:"#fff", color:C.inkSoft, fontSize:12, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>🗑</button>
                        )}
                      </div>
                    </div>
                    {req.status==="guide_declined" && (
                      <div style={{ background:"#F5E7E4", borderRadius:10, padding:"10px 14px", fontSize:12, color:"#A83A32" }}>
                        {req.guideName} isn't able to take this trip. Try browsing other guides.
                      </div>
                    )}
                    {req.status==="declined" && (
                      <div style={{ background:"#FAF9F6", borderRadius:10, padding:"10px 14px", fontSize:12, color:"#64748B" }}>
                        You declined this bid from {req.guideName}. Browse other guides to send a new request.
                      </div>
                    )}
                    {req.bid && req.status!=="confirmed" && req.status!=="completed" && req.status!=="disputed" && req.status!=="declined" && req.status!=="guide_declined" && (
                      <div style={{ background:C.amberLight, border:`1px solid #DFCBA0`, borderRadius:10, padding:"12px 14px", marginBottom:12 }}>
                        <div style={{ fontSize:13, fontWeight:700, color:C.ink, marginBottom:4 }}>Bid from {req.guideName}</div>
                        <div style={{ fontSize:20, fontWeight:800, color:C.amber, marginBottom:4 }}>${req.bid.price} USD</div>
                        <div style={{ fontSize:11, color:C.inkSoft, marginBottom:6 }}>📅 {req.bid.dates}</div>
                        {req.bid.message && <div style={{ fontSize:12, color:C.ink, fontStyle:"italic", borderLeft:`3px solid ${C.amber}`, paddingLeft:8, lineHeight:1.6, marginBottom:8 }}>"{req.bid.message}"</div>}
                        {/* Commission breakdown */}
                        <div style={{ background:"rgba(255,255,255,.7)", borderRadius:8, padding:"8px 10px", fontSize:11, color:C.ink, marginBottom:10 }}>
                          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}><span>Guide receives (85%)</span><span style={{ fontWeight:700, color:C.teal }}>${guideGets}</span></div>
                          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}><span>CeylonTrails commission (15%)</span><span style={{ fontWeight:700, color:C.inkSoft }}>${commission}</span></div>
                          <div style={{ display:"flex", justifyContent:"space-between", paddingTop:4, borderTop:`1px solid ${C.border}` }}><span style={{ fontWeight:700 }}>You pay total</span><span style={{ fontWeight:800, color:C.ink }}>${req.bid.price}</span></div>
                        </div>
                        <div style={{ display:"flex", gap:8 }}>
                          <button onClick={()=>{ setPayModal(req); setPayStep("confirm"); setPayTermsOk(false); }} style={{ flex:1, padding:"10px", background:C.teal, color:"#fff", border:"none", borderRadius:10, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:sans }}>✅ Accept & Pay</button>
                          <button onClick={async()=>{
                            try {
                              await window.firebase.firestore().collection("tripRequests").doc(req.id).update({status:"declined"});
                              setMyRequests(rs=>rs.map(r=>r.id===req.id?{...r,status:"declined"}:r));
                            } catch(e) {
                              console.error("Decline bid failed:", e);
                              alert("Could not decline this bid: " + e.message);
                            }
                          }} style={{ flex:1, padding:"10px", background:"none", color:C.coral, border:`1px solid ${C.coral}`, borderRadius:10, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:sans }}>❌ Decline</button>
                        </div>
                      </div>
                    )}
                    {(req.status==="confirmed" || req.status==="completed" || req.status==="disputed") && req.payment && (
                      <BookingManagementPanel req={req} role="tourist" user={user} onUpdate={(updated)=>setMyRequests(rs=>rs.map(r=>r.id===req.id?{...r,...updated}:r))} onReviewGuide={onReviewGuide}/>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {/* ── Guide list ── */}
          {screen==="list" && !showReqs && (
            <>
              {loadingG && <div style={{ textAlign:"center", padding:"3rem" }}><div style={{ width:36, height:36, border:`3px solid ${C.tealLight}`, borderTopColor:C.teal, borderRadius:"50%", animation:"spin .8s linear infinite", margin:"0 auto 12px" }}/><p style={{ fontSize:13, color:C.inkSoft }}>Loading certified guides…</p></div>}
              {!loadingG && guides.length===0 && <div style={{ textAlign:"center", padding:"3rem", color:C.inkSoft }}><div style={{ fontSize:40, marginBottom:12 }}>🧭</div><p>No approved guides yet. Check back soon!</p></div>}
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {guides.map(g=>(
                  <div key={g.uid||g.id} onClick={()=>{ setSelected(g); setScreen("portfolio"); }} style={{ border:`1.5px solid ${C.border}`, borderRadius:16, padding:"14px 16px", cursor:"pointer", background:C.white, transition:"border-color .2s,box-shadow .2s" }}
                    onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.tealMid; e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,.08)"; }}
                    onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.border; e.currentTarget.style.boxShadow="none"; }}>
                    <div style={{ display:"flex", gap:12, alignItems:"flex-start", marginBottom:10 }}>
                      {/* Photo or avatar */}
                      {g.photo
                        ? <img src={g.photo} alt={g.fullName||g.name} style={{ width:52, height:52, borderRadius:14, objectFit:"cover", flexShrink:0 }}/>
                        : g.initials
                          ? <Av g={g} size={52}/>
                          : <div style={{ width:52, height:52, borderRadius:14, background:C.teal, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontFamily:serif, fontSize:18, fontWeight:700, flexShrink:0 }}>{(g.fullName||"G")[0]}</div>
                      }
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:15, fontWeight:600, color:C.ink, marginBottom:2 }}>{g.fullName||g.name}</div>
                        <div style={{ fontSize:12, color:C.inkSoft, marginBottom:6 }}>{g.specialty||(g.specialties||[]).slice(0,2).join(", ")}</div>
                        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                          <Pill green>🛡️ SLTDA Verified</Pill>
                          {(() => {
                            const av = g.availability || "available";
                            const map = {
                              available:   { label:"✅ Available",  bg:C.tealLight,   fg:C.teal,   bd:"#B9CFC5" },
                              "on-trip":   { label: g.freeDate ? `🚗 Free from ${new Date(g.freeDate).toLocaleDateString()}` : "🚗 On a trip", bg:C.amberLight, fg:C.amber, bd:"#DFCBA0" },
                              unavailable: { label:"⏸ Unavailable", bg:"#F1F5F9",      fg:"#64748B", bd:"#E2E8F0" },
                            };
                            const m = map[av] || map.available;
                            return <span style={{ fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:20, background:m.bg, color:m.fg, border:`1px solid ${m.bd}` }}>{m.label}</span>;
                          })()}
                        </div>
                      </div>
                      <div style={{ textAlign:"right", flexShrink:0 }}>
                        {g.rating>0 && <div style={{ fontSize:13, fontWeight:600, color:C.ink }}><Stars n={Math.floor(g.rating)}/> {g.rating}</div>}
                        <div style={{ fontSize:11, color:C.inkSoft, marginTop:2 }}>{g.experience} yrs exp</div>
                      </div>
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:C.inkSoft, paddingTop:10, borderTop:`1px solid ${C.border}`, flexWrap:"wrap", gap:4 }}>
                      <span>🗣️ {Array.isArray(g.languages)?g.languages.slice(0,3).join(" · "):g.langs}</span>
                      <span>📍 {Array.isArray(g.areas)?g.areas.slice(0,2).join(", "):g.areas?.slice(0,30)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── Guide portfolio ── */}
          {screen==="portfolio" && g && (
            <>
              <div style={{ display:"flex", gap:14, alignItems:"flex-start", marginBottom:16 }}>
                {g.photo
                  ? <img src={g.photo} alt={g.fullName} style={{ width:72, height:72, borderRadius:18, objectFit:"cover", flexShrink:0 }}/>
                  : g.initials
                    ? <Av g={g} size={72} r={18}/>
                    : <div style={{ width:72, height:72, borderRadius:18, background:C.teal, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontFamily:serif, fontSize:26, fontWeight:700, flexShrink:0 }}>{(g.fullName||"G")[0]}</div>
                }
                <div>
                  <div style={{ fontFamily:serif, fontSize:20, fontWeight:700, color:C.ink, marginBottom:4 }}>{g.fullName||g.name}</div>
                  <div style={{ fontSize:13, color:C.inkSoft, marginBottom:10 }}>{g.specialty||(g.specialties||[]).slice(0,2).join(", ")}</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    <Pill green>🛡️ SLTDA Certified</Pill>
                    {g.rating>0&&<Pill amber>★ {g.rating}</Pill>}
                    <span style={{ fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:20, background:"#E5F0FC", color:"#3C4E5C", border:"1px solid #B4D0EF" }}>{g.experience} yrs</span>
                    {(() => {
                      const av = g.availability || "available";
                      const map = {
                        available:   { label:"✅ Available now",  bg:C.tealLight,   fg:C.teal,   bd:"#B9CFC5" },
                        "on-trip":   { label: g.freeDate ? `🚗 Free from ${new Date(g.freeDate).toLocaleDateString()}` : "🚗 Currently on a trip", bg:C.amberLight, fg:C.amber, bd:"#DFCBA0" },
                        unavailable: { label:"⏸ Unavailable",     bg:"#F1F5F9",      fg:"#64748B", bd:"#E2E8F0" },
                      };
                      const m = map[av] || map.available;
                      return <span style={{ fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:20, background:m.bg, color:m.fg, border:`1px solid ${m.bd}` }}>{m.label}</span>;
                    })()}
                  </div>
                </div>
              </div>

              <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:"12px 14px", fontSize:13, color:C.inkSoft, lineHeight:1.7, marginBottom:14 }}>
                {g.bio||"No bio yet."}
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14 }}>
                {[
                  ["Languages", Array.isArray(g.languages)?g.languages.join(", "):g.langs],
                  ["Areas", Array.isArray(g.areas)?g.areas.join(", "):g.areas],
                  ["Reviews", `${g.reviews||0} verified`],
                  ["Experience", `${g.experience} years`]
                ].map(([l,v])=>(
                  <div key={l} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 12px" }}>
                    <div style={{ fontSize:10, color:C.inkSoft, textTransform:"uppercase", letterSpacing:.8, marginBottom:4, fontWeight:600 }}>{l}</div>
                    <div style={{ fontSize:12, fontWeight:600, color:C.ink, lineHeight:1.4 }}>{v||"—"}</div>
                  </div>
                ))}
              </div>

              {/* Admin-approved reviews — this is the only place tourist reviews
                  become publicly visible, after CeylonTrails moderation. */}
              <div style={{ marginBottom:14 }}>
                <p style={{ fontSize:11, fontWeight:600, color:C.inkSoft, textTransform:"uppercase", letterSpacing:.8, marginBottom:8 }}>Reviews</p>
                {loadingReviews && <p style={{ fontSize:12, color:C.inkSoft }}>Loading reviews…</p>}
                {!loadingReviews && approvedReviews.length===0 && <p style={{ fontSize:12, color:C.inkSoft }}>No published reviews yet.</p>}
                {!loadingReviews && approvedReviews.slice(0,5).map(r=>(
                  <div key={r.id} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 12px", marginBottom:8 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                      <span style={{ fontSize:12, fontWeight:700, color:C.ink }}>{r.touristName}</span>
                      <span style={{ fontSize:12, color:C.amber }}>{"★".repeat(r.rating||5)}</span>
                    </div>
                    <div style={{ fontSize:12, fontWeight:600, color:C.ink, marginBottom:2 }}>{r.title}</div>
                    <div style={{ fontSize:12, color:C.inkSoft, lineHeight:1.6 }}>{r.body}</div>
                  </div>
                ))}
              </div>

              {(g.specialties||g.tours)&&<>
                <p style={{ fontSize:11, fontWeight:600, color:C.inkSoft, textTransform:"uppercase", letterSpacing:.8, marginBottom:8 }}>{g.specialties?"Specialties":"Signature Tours"}</p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:16 }}>
                  {(g.specialties||g.tours||[]).map(t=><Pill key={t}>{t}</Pill>)}
                </div>
              </>}

              {/* Request bid box */}
              <div style={{ background:"linear-gradient(135deg,#F1ECE0,#FFFBF0)", border:"1.5px solid #DFCBA0", borderRadius:16, padding:"18px" }}>
                <h4 style={{ fontFamily:serif, fontSize:16, fontWeight:700, color:C.ink, marginBottom:8 }}>📩 Request a bid from {(g.fullName||g.name)?.split(" ")[0]}</h4>
                {itin&&<div style={{ background:"rgba(255,255,255,.65)", borderRadius:10, padding:"10px 12px", marginBottom:14, border:"1px solid rgba(138,106,52,.2)", fontSize:12, color:C.inkSoft }}><strong style={{ color:C.ink, fontSize:13, display:"block", marginBottom:3 }}>📋 {itin.title}</strong>{itin.tagline}</div>}
                <p style={{ fontSize:13, color:C.inkSoft, lineHeight:1.6, marginBottom:12 }}>Add a personal message to help the guide understand your needs:</p>
                <textarea value={sendMsg} onChange={e=>setSendMsg(e.target.value)} rows={3} placeholder="e.g. We're a family of 4 visiting in January, interested in cultural sites and local food..."
                  style={{ width:"100%", padding:"10px 12px", border:`1.5px solid ${C.border}`, borderRadius:10, fontSize:13, fontFamily:sans, outline:"none", resize:"vertical", boxSizing:"border-box", marginBottom:12 }}/>
                <Btn variant="amber" full onClick={()=>sendRequest()} style={{ opacity:sending?.6:1 }}>
                  {sending?"Sending…":"Submit bid request →"}
                </Btn>
                <div style={{ fontSize:11, color:C.inkSoft, marginTop:8, textAlign:"center" }}>No obligation · Guide responds within 24 hours</div>
              </div>
            </>
          )}

          {/* ── Success ── */}
          {screen==="success" && (
            <div style={{ textAlign:"center", padding:"3rem 1rem" }}>
              <div style={{ width:72, height:72, borderRadius:"50%", background:C.tealLight, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 18px", fontSize:30 }}>✅</div>
              <h3 style={{ fontFamily:serif, fontSize:22, fontWeight:700, color:C.ink, marginBottom:10 }}>Request sent!</h3>
              <p style={{ fontSize:14, color:C.inkSoft, lineHeight:1.7, maxWidth:340, margin:"0 auto 20px" }}>The guide will review your itinerary and respond with a bid within 24 hours. Check "My requests" to see their reply.</p>
              <div style={{ background:C.tealPale, border:"1px solid #B2E5D0", borderRadius:12, padding:"12px 16px", marginBottom:20, fontSize:13, color:C.teal, textAlign:"left", lineHeight:1.6 }}>💡 No obligation — you can request bids from multiple guides and compare before deciding.</div>
              <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
                <Btn onClick={()=>{ setScreen("list"); setShowReqs(false); }}>Find another guide</Btn>
                <Btn variant="outline" onClick={()=>{ setScreen("list"); setShowReqs(true); loadMyRequests(); }}>View my requests</Btn>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Payment modal */}
      {payModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.65)", zIndex:800, display:"flex", alignItems:"center", justifyContent:"center", padding:14, backdropFilter:"blur(6px)" }}>
          <div className="premium-modal" style={{ background:"#fff", borderRadius:20, width:"100%", maxWidth:400, boxShadow:"0 24px 80px rgba(0,0,0,.3)", overflow:"hidden", maxHeight:"94vh", display:"flex", flexDirection:"column" }}>
            {payStep==="confirm" && (
              <>
                <div style={{ background:`linear-gradient(135deg,${C.teal},#0B3A30)`, padding:"1.3rem 1.2rem", textAlign:"center", flexShrink:0 }}>
                  <div style={{ fontFamily:serif, fontSize:18, fontWeight:700, color:"#fff", marginBottom:4 }}>Confirm & Pay</div>
                  <div style={{ fontSize:12.5, color:"rgba(255,255,255,.8)" }}>Booking with {payModal.guideName}</div>
                </div>
                <div style={{ padding:"1.2rem", overflowY:"auto", flex:1 }}>
                  <div style={{ background:C.surface, borderRadius:14, padding:"14px", marginBottom:14 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:C.ink, marginBottom:12 }}>You pay today (full amount)</div>
                    {[
                      ["Total amount", `$${payModal.bid?.price} USD`],
                      ["Dates", payModal.bid?.dates||"As agreed"],
                    ].map(([l,v])=>(
                      <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:`1px solid ${C.border}`, fontSize:13 }}>
                        <span style={{ color:C.inkSoft }}>{l}</span><span style={{ fontWeight:700, color:C.ink }}>{v}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ background:C.tealPale, border:`1px solid #B9CFC5`, borderRadius:14, padding:"14px", marginBottom:14 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:C.teal, marginBottom:10 }}>🛡️ How your payment is protected</div>
                    <div style={{ fontSize:12, color:C.ink, lineHeight:1.7 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                        <span>✅ Paid to guide now (30%)</span>
                        <strong>${Math.round(Number(payModal.bid?.price)*0.85*0.30*100)/100}</strong>
                      </div>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                        <span>🔒 Held until trip is confirmed complete (70%)</span>
                        <strong>${Math.round(Number(payModal.bid?.price)*0.85*0.70*100)/100}</strong>
                      </div>
                      <div style={{ display:"flex", justifyContent:"space-between", paddingTop:6, borderTop:"1px solid #B9CFC5" }}>
                        <span>CeylonTrails commission (15%)</span>
                        <strong>${Math.round(Number(payModal.bid?.price)*0.15*100)/100}</strong>
                      </div>
                    </div>
                    <p style={{ fontSize:11, color:C.teal, marginTop:10, lineHeight:1.5 }}>
                      We hold most of the guide's payment until you both confirm the trip happened — so if a guide doesn't show up, the bulk of your money was never released to them.
                    </p>
                  </div>

                  {/* Payment terms & conditions */}
                  <div style={{ fontSize:12, fontWeight:700, color:C.ink, marginBottom:8 }}>📋 Payment Terms & Conditions</div>
                  <div style={{ background:"#FAF9F6", border:`1px solid ${C.border}`, borderRadius:10, padding:"12px 14px", maxHeight:160, overflowY:"auto", fontSize:11, color:C.inkSoft, lineHeight:1.7, marginBottom:14 }}>
                    <p style={{ marginBottom:8 }}><strong style={{ color:C.ink }}>1. Booking confirmation —</strong> Payment confirms your booking with this guide for the agreed dates and price. The guide is notified immediately.</p>
                    <p style={{ marginBottom:8 }}><strong style={{ color:C.ink }}>2. Commission —</strong> CeylonTrails retains 15% of the total as a platform fee; the guide receives 85%.</p>
                    <p style={{ marginBottom:8 }}><strong style={{ color:C.ink }}>3. Cancellation —</strong> Cancelling 48+ hours before the trip start date qualifies for a full refund. Within 48 hours, a 25% cancellation fee may apply.</p>
                    <p style={{ marginBottom:8 }}><strong style={{ color:C.ink }}>4. Refunds —</strong> If the guide cancels or fails to show up, you receive a full refund. Refunds are processed within 5-7 business days.</p>
                    <p style={{ marginBottom:8 }}><strong style={{ color:C.ink }}>5. Disputes —</strong> Any disagreement about service quality should be reported to CeylonTrails within 48 hours of the trip ending. Our decision on refunds is final.</p>
                    <p style={{ marginBottom:0 }}><strong style={{ color:C.ink }}>6. Payment security —</strong> This is a demo PayPal flow — no real charge will be made. Live payments will go through PayPal's secure checkout once enabled.</p>
                  </div>
                  <label style={{ display:"flex", alignItems:"flex-start", gap:10, fontSize:12, color:C.ink, cursor:"pointer", padding:"10px 12px", border:`1px solid ${C.border}`, borderRadius:10, background:C.surface, marginBottom:16 }}>
                    <input type="checkbox" checked={payTermsOk} onChange={e=>setPayTermsOk(e.target.checked)} style={{ accentColor:C.teal, width:16, height:16, marginTop:2, flexShrink:0 }}/>
                    I have read and agree to the payment terms and cancellation policy above
                  </label>

                  <button onClick={()=>{ if(!payTermsOk){ alert("Please accept the payment terms to continue."); return; } setPayStep("paypal"); }} style={{ width:"100%", padding:"13px 10px", background:payTermsOk?"#3C4E5C":"#9CA3AF", color:"#fff", border:"none", borderRadius:11, fontSize:13.5, fontWeight:700, cursor:payTermsOk?"pointer":"not-allowed", fontFamily:sans, marginBottom:10, display:"flex", alignItems:"center", justifyContent:"center", gap:6, flexWrap:"wrap" }}>
                    <span style={{ fontWeight:900 }}>Pay</span><span style={{ fontWeight:300, color:"#80CFFF" }}>Pal</span>
                    <span>→ Pay ${payModal.bid?.price}</span>
                  </button>
                  <button onClick={()=>{ setPayModal(null); setPayTermsOk(false); }} style={{ width:"100%", padding:"10px", background:"none", border:`1px solid ${C.border}`, borderRadius:10, fontSize:13, color:C.inkSoft, cursor:"pointer", fontFamily:sans }}>Cancel</button>
                </div>
              </>
            )}

            {payStep==="paypal" && (
              <div style={{ padding:"1.2rem", overflowY:"auto" }}>
                <div style={{ textAlign:"center", marginBottom:16 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:"#3C4E5C", marginBottom:4 }}>PayPal Checkout</div>
                  <div style={{ fontSize:12, color:C.inkSoft }}>CeylonTrails — Guide Booking · ${payModal.bid?.price}</div>
                </div>
                <div style={{ background:"#F6F5F2", borderRadius:10, padding:"12px", marginBottom:14, textAlign:"center", fontSize:15, fontWeight:700 }}>Total: ${payModal.bid?.price} USD</div>
                <input readOnly value="tourist@email.com" style={{ width:"100%", padding:"11px 12px", border:`1px solid ${C.border}`, borderRadius:8, fontSize:13, fontFamily:sans, background:"#F6F5F2", marginBottom:8, boxSizing:"border-box" }}/>
                <input readOnly type="password" value="••••••••" style={{ width:"100%", padding:"11px 12px", border:`1px solid ${C.border}`, borderRadius:8, fontSize:13, fontFamily:sans, background:"#F6F5F2", marginBottom:14, boxSizing:"border-box" }}/>
                <button onClick={handleAcceptBid} disabled={paying} style={{ width:"100%", padding:"13px", background:paying?"#aaa":"#3C4E5C", color:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:700, cursor:paying?"wait":"pointer", fontFamily:sans, marginBottom:8 }}>
                  {paying?<span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}><span style={{ width:16, height:16, border:"2px solid rgba(255,255,255,.4)", borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", animation:"spin .8s linear infinite" }}/> Processing…</span>:`Pay $${payModal.bid?.price}`}
                </button>
                <button onClick={()=>setPayStep("confirm")} style={{ width:"100%", padding:"10px", background:"none", border:"none", color:C.inkSoft, fontSize:12, cursor:"pointer", fontFamily:sans }}>← Back</button>
                <div style={{ textAlign:"center", fontSize:10, color:C.inkSoft, marginTop:6 }}>🔒 Demo mode — no real charge</div>
              </div>
            )}

            {payStep==="success" && (
              <div style={{ padding:"1.8rem 1.4rem", textAlign:"center", overflowY:"auto" }}>
                <div style={{ width:64, height:64, borderRadius:"50%", background:C.tealLight, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", fontSize:28 }}>✅</div>
                <div style={{ fontFamily:serif, fontSize:20, fontWeight:700, color:C.ink, marginBottom:8 }}>Booking Confirmed!</div>
                <p style={{ fontSize:13, color:C.inkSoft, lineHeight:1.7, marginBottom:8 }}>Payment of <strong>${payModal.bid?.price}</strong> processed successfully.</p>
                <div style={{ background:C.tealPale, borderRadius:10, padding:"10px 14px", fontSize:12, color:C.teal, marginBottom:14, textAlign:"left" }}>
                  <div>✓ Guide paid now: <strong>${Math.round(Number(payModal.bid?.price)*0.85*0.30*100)/100}</strong></div>
                  <div>🔒 Held until trip completes: <strong>${Math.round(Number(payModal.bid?.price)*0.85*0.70*100)/100}</strong></div>
                  <div>✓ CeylonTrails commission: <strong>${Math.round(Number(payModal.bid?.price)*0.15*100)/100}</strong></div>
                </div>
                <div style={{ background:C.amberLight, borderRadius:10, padding:"10px 14px", fontSize:11.5, color:C.amber, marginBottom:20, textAlign:"left", lineHeight:1.6 }}>
                  💬 You can now message {payModal.guideName} directly from "My requests" to coordinate pickup, meeting points and any details.
                </div>
                <button onClick={()=>{ setPayModal(null); setPayStep("confirm"); }} style={{ width:"100%", padding:"13px", background:C.teal, color:"#fff", border:"none", borderRadius:12, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:sans }}>Done</button>
              </div>
            )}
          </div>
        </div>
      )}
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
async function placesNearby(lat, lng, type="tourist_attraction", radius=1500) {
  try {
    const res = await fetch(`${PLACES_BASE}/nearby?lat=${lat}&lng=${lng}&type=${type}&radius=${radius}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch { return []; }
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
      <div style={{ background:`linear-gradient(135deg,${C.teal},#0B3A30)`, padding:"2.5rem 2rem 2rem" }}>
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
          <div style={{ background:C.amberLight, border:`1.5px solid #DFCBA0`, borderRadius:16, padding:"2rem", textAlign:"center" }}>
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
          <div style={{ background:C.coralLight, border:`1.5px solid #DCC5BC`, borderRadius:16, padding:"2rem", textAlign:"center" }}>
            <div style={{ fontSize:32, marginBottom:12 }}>⚠️</div>
            <h3 style={{ fontFamily:serif, fontSize:18, fontWeight:700, color:C.ink, marginBottom:8 }}>API key not authorised</h3>
            <p style={{ fontSize:14, color:C.inkSoft, lineHeight:1.7 }}>Your Google key was rejected. Make sure <strong>Places API</strong> is enabled in Google Cloud Console for your project.</p>
          </div>
        )}

        {/* Other error */}
        {error && error!=="no_key" && error!=="denied" && (
          <div style={{ background:C.coralLight, border:`1.5px solid #DCC5BC`, borderRadius:16, padding:"1.5rem", textAlign:"center" }}>
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
                <div style={{ height:160, background:`linear-gradient(135deg,${C.teal},#0B3A30)`, overflow:"hidden", position:"relative" }}>
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
          category={cat}
        />
      )}
    </div>
  );
}

function PlaceDetailPanel({ place:p, wishlist, onAddToItin, onClose, category }) {
  const [details, setDetails]   = useState(null);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [loadingD, setLoadingD] = useState(true);
  const [nearby, setNearby]     = useState([]);
  const [loadingNearby, setLN]  = useState(false);

  useEffect(()=>{
    placesDetails(p.place_id)
      .then(async d=>{
        setDetails(d.result); setLoadingD(false);
        // Fetch nearby attractions once we have coordinates
        const loc = d.result?.geometry?.location;
        if (loc) {
          setLN(true);
          // Hotels/restaurants → show nearby tourist attractions.
          // For restaurants we also blend in nearby parks/scenic spots ("relaxing places").
          const nearbyType = category==="restaurants" ? "park" : "tourist_attraction";
          const results = await placesNearby(loc.lat, loc.lng, nearbyType, 2000);
          // Filter out the place itself and cap at 5
          setNearby((results||[]).filter(r=>r.place_id!==p.place_id).slice(0,5));
          setLN(false);
        }
      })
      .catch(()=>setLoadingD(false));
  },[p.place_id]);

  const d = details || p;
  const photos = d.photos || p.photos || [];

  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.55)", zIndex:700, display:"flex", justifyContent:"flex-end", backdropFilter:"blur(3px)" }}>
      <div style={{ width:480, maxWidth:"100vw", height:"100%", background:C.white, overflowY:"auto", boxShadow:"-8px 0 48px rgba(0,0,0,.2)" }}>
        {/* Photo gallery */}
        <div style={{ height:240, background:`linear-gradient(135deg,${C.teal},#0B3A30)`, position:"relative", flexShrink:0 }}>
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
            <span style={{ color:C.amberMid, fontSize:15 }}>{"★".repeat(Math.round(p.rating||0))}{"☆".repeat(5-Math.round(p.rating||0))}</span>
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
              style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 14px", background:C.tealPale, border:`1px solid #B9CFC5`, borderRadius:10, fontSize:13, color:C.teal, textDecoration:"none", fontWeight:600, marginBottom:14, wordBreak:"break-all" }}>
              🌐 <span style={{ flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{d.website.replace(/^https?:\/\/(www\.)?/,"")}</span>
              <span style={{ flexShrink:0, fontSize:11, opacity:.7 }}>↗</span>
            </a>
          )}

          {/* Nearby places — attractions for hotels, relaxing spots for restaurants */}
          {(loadingNearby || nearby.length>0) && (
            <div style={{ marginBottom:14 }}>
              <p style={{ fontSize:12, fontWeight:700, color:C.ink, textTransform:"uppercase", letterSpacing:.8, marginBottom:8 }}>
                {category==="restaurants" ? "🌳 Nearby relaxing spots" : "📍 Nearby places of interest"}
              </p>
              {loadingNearby && <div style={{ fontSize:12, color:C.inkSoft }}>Finding nearby places…</div>}
              {!loadingNearby && nearby.map(n=>(
                <a key={n.place_id} href={`https://maps.google.com/?q=${encodeURIComponent(n.name+", Sri Lanka")}`} target="_blank" rel="noopener noreferrer"
                  style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px", borderRadius:10, textDecoration:"none", marginBottom:4, transition:"background .15s" }}
                  onMouseEnter={e=>e.currentTarget.style.background=C.surface} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <span style={{ fontSize:16, flexShrink:0 }}>{category==="restaurants"?"🌿":"🏛️"}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:C.ink, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{n.name}</div>
                    {n.rating && <div style={{ fontSize:10, color:C.inkSoft }}>{n.rating}★ · {((n.vicinity||"").split(",")[0])}</div>}
                  </div>
                  <span style={{ fontSize:11, color:C.teal, flexShrink:0 }}>↗</span>
                </a>
              ))}
            </div>
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
              style={{ padding:"12px", background:wishlist.has(p.place_id)?C.amberLight:C.surface, color:wishlist.has(p.place_id)?C.amber:C.ink, border:`1.5px solid ${wishlist.has(p.place_id)?"#DFCBA0":C.border}`, borderRadius:12, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:sans }}>
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
  { id:"yala",        lat:6.37,  lng:81.52, emoji:"🐆", name:"Yala National Park",      fact:"Highest leopard density on earth — also home to sloth bears, crocodiles & 200+ bird species.",        color:"#8B4B3B" },
  { id:"sigiriya",    lat:7.95,  lng:80.76, emoji:"🏰", name:"Sigiriya",                fact:"5th-century Lion Rock fortress rising 200m from the jungle — ancient frescoes and mirror wall.",       color:"#8A6A34" },
  { id:"kandy",       lat:7.29,  lng:80.63, emoji:"🌿", name:"Kandy",                   fact:"Cultural heartland — Temple of the Tooth, botanical gardens, traditional Kandyan dance.",              color:"#0E4A3D" },
  { id:"ella",        lat:6.87,  lng:81.05, emoji:"🚂", name:"Ella",                    fact:"Misty mountain village — Nine Arch Bridge, Little Adam's Peak, and the iconic scenic train.",          color:"#0E4A3D" },
  { id:"mirissa",     lat:5.95,  lng:80.46, emoji:"🐋", name:"Mirissa",                 fact:"Blue whale watching capital of Sri Lanka — best sightings November to April.",                        color:"#3C4E5C" },
  { id:"colombo",     lat:6.92,  lng:79.86, emoji:"🏙️", name:"Colombo",                 fact:"Commercial capital — Pettah market, Galle Face Green, Ministry of Crab, and the Fort district.",      color:"#3D3D3D" },
  { id:"galle",       lat:6.05,  lng:80.22, emoji:"🏛️", name:"Galle Fort",              fact:"UNESCO 17th-century Dutch fort — cobbled streets, boutique cafés and the best sunset rampart walk.", color:"#8A6A34" },
  { id:"anuradhapura",lat:8.34,  lng:80.38, emoji:"🛕", name:"Anuradhapura",            fact:"Ancient sacred city — 2,300-year-old Sri Maha Bodhi tree, massive stupas, and ancient tanks.",       color:"#8A6A34" },
  { id:"trinco",      lat:8.59,  lng:81.23, emoji:"🤿", name:"Trincomalee",             fact:"Natural deep harbour — Pigeon Island coral reef, Nilaveli beach, and whale watching.",               color:"#3C4E5C" },
  { id:"udawalawe",   lat:6.47,  lng:80.90, emoji:"🐘", name:"Udawalawe",               fact:"Best place to see wild Asian elephants — herds of 30–50 cross the grasslands at dusk.",              color:"#6B4A26" },
  { id:"nuwaraeliya", lat:6.97,  lng:80.78, emoji:"☕", name:"Nuwara Eliya",            fact:"Tea capital at 1868m — colonial bungalows, rose gardens and the Gregory Lake valley in morning mist.", color:"#0E4A3D" },
  { id:"arugambay",   lat:6.84,  lng:81.83, emoji:"🏄", name:"Arugam Bay",              fact:"World-class surf point break on the east coast — dry and warm when the west is wet.",                color:"#3C4E5C" },
  { id:"dambulla",    lat:7.87,  lng:80.65, emoji:"🕌", name:"Dambulla Cave Temple",    fact:"Five cave temples painted floor-to-ceiling with Buddhist murals and 153 golden statues.",             color:"#8A6A34" },
  { id:"wilpattu",    lat:8.45,  lng:80.03, emoji:"🦁", name:"Wilpattu National Park",  fact:"Sri Lanka's largest park — secretive leopards, sloth bears and natural lakes (villus).",             color:"#8B4B3B" },
  { id:"kalpitiya",   lat:8.23,  lng:79.76, emoji:"🪁", name:"Kalpitiya",               fact:"Best kite surfing in Asia — 15–25 knot winds for 9 months, plus spinner dolphin watching.",          color:"#3C4E5C" },
  // Jaffna & the North — previously missing entirely
  { id:"jaffna",      lat:9.66,  lng:80.03, emoji:"🛕", name:"Jaffna",                  fact:"Sri Lanka's Tamil heartland — soaring Hindu temple gopurams, fiery cuisine, and a unique island culture.", color:"#8A6A34" },
  { id:"nallur",      lat:9.67,  lng:80.02, emoji:"🕉️", name:"Nallur Kandaswamy Temple",fact:"Jaffna's most sacred Hindu temple — golden gopuram tower and a spectacular 25-day annual festival.",  color:"#8A6A34" },
  { id:"deltft",      lat:9.50,  lng:79.70, emoji:"🐴", name:"Delft Island",            fact:"A remote coral island off Jaffna with wild ponies, ancient baobab trees, and a ruined Dutch fort.",   color:"#3C4E5C" },
  { id:"jaffnafort",  lat:9.66,  lng:80.01, emoji:"🏯", name:"Jaffna Fort",             fact:"One of the largest Dutch-built forts in Asia, overlooking the lagoon — restored after the civil war.", color:"#6B4A26" },
  { id:"casuarina",   lat:9.81,  lng:79.97, emoji:"🏖️", name:"Casuarina Beach",         fact:"Shallow, calm turquoise water on Karainagar Island — one of the safest swimming beaches in Sri Lanka.", color:"#3C4E5C" },
  // More major tourism spots filled in across the country
  { id:"adamspeak",   lat:6.81,  lng:80.50, emoji:"⛰️", name:"Adam's Peak",             fact:"5,243-step night pilgrimage to a sacred summit — watch the triangular shadow fall across the clouds at sunrise.", color:"#6B4A26" },
  { id:"polonnaruwa", lat:7.94,  lng:81.02, emoji:"🗿", name:"Polonnaruwa",             fact:"Medieval royal capital — cycle between ruins and the world-famous Gal Vihara rock-carved Buddhas.", color:"#8A6A34" },
  { id:"hikkaduwa",   lat:6.14,  lng:80.11, emoji:"🐢", name:"Hikkaduwa",               fact:"Sri Lanka's original surf town — coral reef snorkelling and nightly sea turtle nesting watches.",   color:"#3C4E5C" },
  { id:"sinharaja",   lat:6.41,  lng:80.49, emoji:"🌳", name:"Sinharaja Rainforest",    fact:"UNESCO biosphere reserve — Sri Lanka's last major lowland rainforest, home to 26 endemic bird species.", color:"#0B3A30" },
  { id:"horton",      lat:6.80,  lng:80.80, emoji:"🌫️", name:"Horton Plains",           fact:"High-altitude cloud forest plateau ending at World's End — a sudden 1,000m vertical cliff drop.",   color:"#2E5844" },
  { id:"minneriya",   lat:8.03,  lng:80.88, emoji:"🐘", name:"Minneriya",               fact:"\"The Gathering\" — up to 300 wild elephants converge on the ancient tank reservoir from July to October.", color:"#6B4A26" },
  { id:"weligama",    lat:5.97,  lng:80.43, emoji:"🏄‍♂️", name:"Weligama",               fact:"Sri Lanka's best beginner surf beach, plus the famous stilt fishermen perched just offshore.",     color:"#3C4E5C" },
  { id:"haputale",    lat:6.77,  lng:80.96, emoji:"🍵", name:"Haputale",                fact:"A ridge-top tea town where you can see both the Indian Ocean and the central highlands at once.",   color:"#0E4A3D" },
  { id:"negombo",     lat:7.21,  lng:79.84, emoji:"🎣", name:"Negombo",                 fact:"Closest beach town to the airport — Dutch canal network, fish market, and easy first-night base.",   color:"#3C4E5C" },
  { id:"batticaloa",  lat:7.72,  lng:81.70, emoji:"🦀", name:"Batticaloa",              fact:"East coast lagoon town famous for its 'singing fish' legend and untouched mangrove waterways.",     color:"#3C4E5C" },
  { id:"ritigala",    lat:8.12,  lng:80.65, emoji:"💎", name:"Ritigala",                fact:"Jungle-swallowed 1st-century monastery ruins on a misty mountain — one of Sri Lanka's least visited ancient sites.", color:"#5B3A8E" },
  { id:"knuckles",    lat:7.45,  lng:80.78, emoji:"🥾", name:"Knuckles Mountain Range", fact:"UNESCO wilderness of 34 waterfalls and 13 peaks — multi-day trekking through cloud forest.",        color:"#2E5844" },
];


function SriLankaMapPage({ setPage, savedItin, setSavedItin }) {
  const mapRef    = useRef(null);
  const mapObj    = useRef(null);
  const [selectedPin, setSelectedPin] = useState(null);
  const [addedToast, setAddedToast]   = useState(false);

  const addPinToItin = (pin) => {
    const newAct = {
      time:"15:00", type:"sightseeing",
      place:pin.name, area:"Sri Lanka",
      text:pin.fact, why:"Added from the Sri Lanka Map", hours:"", price:"",
      mapQuery:`${pin.name}, Sri Lanka`,
      unsplashQuery:`${pin.name} Sri Lanka`,
    };
    const dayIdx = findBestMatchingDay(savedItin, pin.name, { lat:pin.lat, lng:pin.lng });
    setSavedItin({ ...savedItin, days: savedItin.days.map((d,i)=>i===dayIdx?{...d,activities:[...d.activities,newAct]}:d) });
    setAddedToast(true); setTimeout(()=>setAddedToast(false), 2500);
  };

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
      {addedToast && (
        <div style={{ position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)", background:C.teal, color:"#fff", padding:"12px 24px", borderRadius:30, fontSize:14, fontWeight:600, zIndex:800, boxShadow:"0 4px 20px rgba(0,0,0,.2)", whiteSpace:"nowrap" }}>
          ✅ Added to your itinerary!
        </div>
      )}
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
      <div style={{ background:`linear-gradient(135deg,${C.teal},#0B3A30)`, padding:"2rem 2rem 1.5rem" }}>
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
                  {savedItin ? (
                    <Btn variant="amber" onClick={()=>addPinToItin(selectedPin)} style={{ width:"100%", justifyContent:"center" }}>
                      ➕ Add to my trip
                    </Btn>
                  ) : (
                    <Btn onClick={()=>{ setPage("journey"); sessionStorage.setItem("suggestDest", selectedPin.name); }} style={{ width:"100%", justifyContent:"center" }}>
                      ✨ Plan a trip here
                    </Btn>
                  )}
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
        background: open ? "#8B4B3B" : "#fff",
        color: open ? "#fff" : "#8B4B3B",
        border:"2px solid #8B4B3B",
        fontSize:open?16:18, cursor:"pointer",
        boxShadow:"0 4px 20px rgba(139,75,59,.3)",
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
          border:"1.5px solid #DCC5BC",
          display:"flex", flexDirection:"column",
          maxHeight:"70vh",
        }}>
          {/* Header */}
          <div style={{ padding:"14px 16px", background:"#8B4B3B", borderRadius:"18px 18px 0 0", flexShrink:0 }}>
            <div style={{ fontFamily:serif, fontSize:16, fontWeight:700, color:"#fff" }}>🆘 Emergency & Important Numbers</div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,.75)", marginTop:3 }}>Sri Lanka — tap any number to call</div>
          </div>

          {/* Category tabs */}
          <div style={{ display:"flex", overflowX:"auto", borderBottom:"1px solid #E6E4DF", flexShrink:0 }}>
            {EMERGENCY_DATA.map((cat,i)=>(
              <button key={i} onClick={()=>setActiveTab(i)} style={{
                padding:"10px 12px", border:"none", background:"transparent",
                fontSize:11, fontWeight:activeTab===i?700:400,
                color:activeTab===i?"#8B4B3B":C.inkSoft, cursor:"pointer",
                borderBottom:activeTab===i?"2.5px solid #8B4B3B":"2.5px solid transparent",
                whiteSpace:"nowrap", fontFamily:sans, flexShrink:0,
              }}>{cat.category.split(" ")[0]}</button>
            ))}
          </div>

          {/* Items */}
          <div style={{ flex:1, overflowY:"auto", padding:"8px 0" }}>
            <div style={{ padding:"6px 16px", fontSize:11, fontWeight:700, color:"#8B4B3B", textTransform:"uppercase", letterSpacing:.8 }}>
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
                  background:"#8B4B3B", color:"#fff",
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
        <div style={{ background:`linear-gradient(135deg,${C.teal},#0B3A30)`, padding:"2rem 2rem 1.5rem", textAlign:"center", position:"relative" }}>
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

          {error && <div style={{ background:"#FEF0F0", border:"1px solid #DCC5BC", borderRadius:10, padding:"8px 12px", fontSize:12, color:C.coral, marginBottom:12 }}>{error}</div>}

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
  const { user } = useAuth();

  const handleDemoPayment = () => {
    setPaying(true);
    setTimeout(async ()=>{
      // Log this as platform income so it shows up in the admin revenue
      // dashboard — this is 100% CeylonTrails revenue, no guide involved.
      try {
        if (!window.firebase?.firestore) await loadScript("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js");
        await window.firebase.firestore().collection("premiumPayments").add({
          itinId: itinId||null, uid: user?.uid||null, userEmail: user?.email||null,
          amount: UNLOCK_PRICE, paidAt: new Date().toISOString(), method: "PayPal (demo)",
        });
      } catch(e) { console.warn("Could not log premium payment:", e.message); }
      setPaying(false); setStep("success");
    }, 2000);
  };

  return (
    <>
      <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", zIndex:5 }}>
        <button onClick={()=>{ setShow(true); setStep("lock"); }} style={{ padding:"10px 24px", background:C.amber, color:"#fff", border:"none", borderRadius:12, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:sans, boxShadow:"0 4px 16px rgba(0,0,0,.25)", display:"flex", alignItems:"center", gap:8 }}>
          🔒 Unlock this day — ${UNLOCK_PRICE}
        </button>
      </div>

      {show && (
        <div onClick={e=>e.target===e.currentTarget&&setShow(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.6)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:14, backdropFilter:"blur(6px)" }}>
          <div className="premium-modal" style={{ background:"#fff", borderRadius:20, width:"100%", maxWidth:380, boxShadow:"0 24px 80px rgba(0,0,0,.3)", overflow:"hidden", animation:"slideUp .25s ease", maxHeight:"92vh", overflowY:"auto" }}>
            {step==="lock" && <>
              <div style={{ background:`linear-gradient(135deg,${C.amber},#D97706)`, padding:"1.3rem 1.2rem", textAlign:"center" }}>
                <div style={{ fontSize:36, marginBottom:8 }}>🔒</div>
                <div style={{ fontFamily:serif, fontSize:18, fontWeight:700, color:"#fff", marginBottom:4 }}>Premium Feature</div>
                <div style={{ fontSize:12.5, color:"rgba(255,255,255,.85)", lineHeight:1.5 }}>Unlock all days, maps, swapping & drag-drop</div>
              </div>
              <div style={{ padding:"1.3rem" }}>
                <div style={{ background:C.amberLight, border:`1.5px solid #DFCBA0`, borderRadius:14, padding:"12px", textAlign:"center", marginBottom:18 }}>
                  <div style={{ fontSize:24, fontWeight:800, color:C.amber }}>${UNLOCK_PRICE} USD</div>
                  <div style={{ fontSize:11.5, color:C.inkSoft, marginTop:2 }}>One-time payment · Instant access</div>
                </div>
                <button onClick={()=>setStep("demo")} style={{ width:"100%", padding:"13px 10px", background:"#3C4E5C", color:"#fff", border:"none", borderRadius:11, fontSize:13.5, fontWeight:700, cursor:"pointer", fontFamily:sans, marginBottom:10, display:"flex", alignItems:"center", justifyContent:"center", gap:6, flexWrap:"wrap" }}>
                  <span style={{ fontWeight:900 }}>Pay</span><span style={{ fontWeight:300, color:"#80CFFF" }}>Pal</span>
                  <span>→ Pay ${UNLOCK_PRICE}.00</span>
                </button>
                <div style={{ textAlign:"center", fontSize:10.5, color:C.inkSoft }}>✓ Secure · ✓ Instant · ✓ No subscription</div>
                <button onClick={()=>setShow(false)} style={{ width:"100%", marginTop:10, padding:"10px", background:"none", border:`1px solid ${C.border}`, borderRadius:10, fontSize:13, color:C.inkSoft, cursor:"pointer", fontFamily:sans }}>Cancel</button>
              </div>
            </>}
            {step==="demo" && (
              <div style={{ padding:"1.3rem" }}>
                <div style={{ textAlign:"center", marginBottom:16 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:"#3C4E5C", marginBottom:4 }}>PayPal Checkout</div>
                  <div style={{ fontSize:12, color:C.inkSoft }}>CeylonTrails — Full Itinerary Access</div>
                </div>
                <div style={{ background:"#F6F5F2", borderRadius:10, padding:"12px", marginBottom:16, textAlign:"center", fontSize:15, fontWeight:700, color:C.ink }}>Total: ${UNLOCK_PRICE}.00 USD</div>
                <input readOnly value="demo@paypal.com" style={{ width:"100%", padding:"11px 12px", border:`1px solid ${C.border}`, borderRadius:8, fontSize:13, fontFamily:sans, background:"#F6F5F2", marginBottom:8, boxSizing:"border-box" }}/>
                <input readOnly type="password" value="••••••••" style={{ width:"100%", padding:"11px 12px", border:`1px solid ${C.border}`, borderRadius:8, fontSize:13, fontFamily:sans, background:"#F6F5F2", marginBottom:14, boxSizing:"border-box" }}/>
                <button onClick={handleDemoPayment} disabled={paying} style={{ width:"100%", padding:"13px", background:paying?"#aaa":"#3C4E5C", color:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:700, cursor:paying?"wait":"pointer", fontFamily:sans, marginBottom:8 }}>
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
async function loadApprovedGuides() {
  if (!window.firebase?.firestore) return [];
  try {
    // No orderBy here — combining where+orderBy on different fields requires
    // a Firestore composite index. Sort client-side instead to avoid that.
    const snap = await window.firebase.firestore().collection("guides")
      .where("status","==","approved").limit(50).get();
    const guides = snap.docs.map(d=>({id:d.id,...d.data()}));
    guides.sort((a,b)=> new Date(b.registeredAt||0) - new Date(a.registeredAt||0));
    return guides;
  } catch(e) {
    console.error("loadApprovedGuides FAILED:", e.message, e);
    return [];
  }
}

async function saveTripRequest(request) {
  if (!window.firebase?.firestore) return null;
  const ref = await window.firebase.firestore().collection("tripRequests").add({
    ...request, createdAt:new Date().toISOString(), status:"pending"
  });
  return ref.id;
}

// ─── CONTACT US ────────────────────────────────────────────────────────────
async function saveContactMessage(msg) {
  if (!window.firebase?.firestore) {
    await loadScript("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js");
  }
  await window.firebase.firestore().collection("contactMessages").add({
    ...msg, createdAt: new Date().toISOString(), status: "new",
  });
}

// ─── SHAREABLE ITINERARY LINKS ────────────────────────────────────────────────
// Anyone with the link can view (no login required) — read-only public copy.
function generateShareId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
async function saveSharedItinerary(itin, ownerUid) {
  if (!window.firebase?.firestore) return null;
  const shareId = generateShareId();
  await window.firebase.firestore().collection("sharedItineraries").doc(shareId).set({
    itin, ownerUid: ownerUid||null, createdAt: new Date().toISOString(), views: 0,
  });
  return shareId;
}
async function loadSharedItinerary(shareId) {
  if (!window.firebase?.firestore) return null;
  try {
    const doc = await window.firebase.firestore().collection("sharedItineraries").doc(shareId).get();
    if (!doc.exists) return null;
    // Fire-and-forget view counter increment — don't block the render on this
    window.firebase.firestore().collection("sharedItineraries").doc(shareId)
      .update({ views: (doc.data().views||0) + 1 }).catch(()=>{});
    return doc.data();
  } catch(e) { console.error("loadSharedItinerary FAILED:", e.message); return null; }
}

// ─── SAVED ITINERARIES ("My Itineraries" — view past trips later) ───────────
async function saveUserItinerary(uid, itin) {
  if (!window.firebase?.firestore) return null;
  try {
    const ref = await window.firebase.firestore().collection("userItineraries").add({
      uid, itin, savedAt: new Date().toISOString(),
    });
    return ref.id;
  } catch(e) { console.error("saveUserItinerary FAILED:", e.message); throw e; }
}
async function loadUserItineraries(uid) {
  if (!window.firebase?.firestore || !uid) return [];
  try {
    const snap = await window.firebase.firestore().collection("userItineraries").where("uid","==",uid).limit(50).get();
    const items = snap.docs.map(d=>({id:d.id,...d.data()}));
    items.sort((a,b)=> new Date(b.savedAt||0) - new Date(a.savedAt||0));
    return items;
  } catch(e) { console.error("loadUserItineraries FAILED:", e.message); return []; }
}
async function deleteUserItinerary(docId) {
  if (!window.firebase?.firestore) return;
  await window.firebase.firestore().collection("userItineraries").doc(docId).delete();
}

async function loadTouristRequests(touristUid) {
  if (!window.firebase?.firestore) return [];
  try {
    const snap = await window.firebase.firestore().collection("tripRequests")
      .where("touristUid","==",touristUid).limit(50).get();
    // Hide requests the tourist has removed from their own view — the record
    // stays in Firestore (removedByTourist:true) so the guide/admin still see it.
    const reqs = snap.docs.map(d=>({id:d.id,...d.data()})).filter(r=>!r.removedByTourist);
    reqs.sort((a,b)=> new Date(b.createdAt||0) - new Date(a.createdAt||0));
    return reqs;
  } catch(e) { console.error("loadTouristRequests FAILED:", e.message); return []; }
}
async function removeTripRequestForTourist(requestId) {
  if (!window.firebase?.firestore) return;
  await window.firebase.firestore().collection("tripRequests").doc(requestId).update({
    removedByTourist: true, removedByTouristAt: new Date().toISOString(),
  });
}

// ─── ESCROW PAYMENT MODEL ─────────────────────────────────────────────────────
// The tourist pays the FULL amount to CeylonTrails in ONE payment. We then:
//  • Release 30% to the guide IMMEDIATELY (working capital, shows good faith)
//  • HOLD the remaining 70% in platform custody — not paid to the guide yet
//  • Release that 70% only once BOTH tourist and guide confirm the trip
//    actually happened. There is no auto-release if only one side confirms —
//    this protects the tourist if a guide takes the 30% and disappears, and
//    protects the guide from a tourist who simply never bothers to confirm
//    (admin can step in and resolve disputes manually in that case).
const GUIDE_INSTANT_RATE = 0.30; // % of the GUIDE's 85% share paid out immediately

async function payFullAndEscrow(requestId, bidAmount, guideId) {
  if (!window.firebase?.firestore) return;
  const commission        = Math.round(bidAmount * 0.15 * 100) / 100;
  const guideTotalShare   = Math.round((bidAmount - commission) * 100) / 100;
  const guideInstantShare = Math.round(guideTotalShare * GUIDE_INSTANT_RATE * 100) / 100;
  const guideHeldShare    = Math.round((guideTotalShare - guideInstantShare) * 100) / 100;

  await window.firebase.firestore().collection("tripRequests").doc(requestId).update({
    status: "confirmed", // full payment received, booking confirmed, trip not yet completed
    payment: {
      total: bidAmount, commission, guideAmount: guideTotalShare,
      guideInstantShare, guideHeldShare,
      paidAt: new Date().toISOString(),
      heldReleased: false, method: "PayPal",
    },
    confirmedAt: new Date().toISOString(),
    touristConfirmedUnderway: false,
    guideConfirmedUnderway: false,
    touristConfirmedComplete: false,
    guideConfirmedComplete: false,
  });

  // Pay out the guide's instant 30% share right away
  if (guideId) {
    try {
      const ref = window.firebase.firestore().collection("guides").doc(guideId);
      const doc = await ref.get();
      const prev = doc.exists ? doc.data() : {};
      await ref.update({
        totalEarned: (prev.totalEarned || 0) + guideInstantShare,
        confirmedBookings: (prev.confirmedBookings || 0) + 1,
      });
    } catch(e) { console.warn("Could not pay guide instant share:", e.message); }
  }
}

// Called when either side ticks "the trip has started". Requires BOTH to
// confirm before the booking moves from "confirmed" (paid, not yet begun) to
// "underway" — this is a status checkpoint, not a payment event.
async function confirmTripUnderway(requestId, who) {
  if (!window.firebase?.firestore) return false;
  const ref = window.firebase.firestore().collection("tripRequests").doc(requestId);
  const field = who === "tourist" ? "touristConfirmedUnderway" : "guideConfirmedUnderway";
  await ref.update({ [field]: true, [`${field}At`]: new Date().toISOString() });

  const doc = await ref.get();
  const data = doc.data();
  const bothConfirmed = data.touristConfirmedUnderway && data.guideConfirmedUnderway;
  if (bothConfirmed && data.status === "confirmed") {
    await ref.update({ status: "underway" });
  }
  return bothConfirmed;
}

// Called when either side ticks "this trip happened". Requires BOTH to confirm
// before the held 70% releases — no auto-release on a single confirmation.
// Only meaningful once the trip has already been mutually marked underway.
async function confirmTripCompletion(requestId, who, guideId) {
  if (!window.firebase?.firestore) return false;
  const ref = window.firebase.firestore().collection("tripRequests").doc(requestId);
  const field = who === "tourist" ? "touristConfirmedComplete" : "guideConfirmedComplete";
  await ref.update({ [field]: true, [`${field}At`]: new Date().toISOString() });

  const doc = await ref.get();
  const data = doc.data();
  const bothConfirmed = data.touristConfirmedComplete && data.guideConfirmedComplete;
  if (bothConfirmed && data.payment && !data.payment.heldReleased) {
    await ref.update({
      status: "completed",
      "payment.heldReleased": true,
      "payment.heldReleasedAt": new Date().toISOString(),
    });
    if (guideId) {
      try {
        const gRef = window.firebase.firestore().collection("guides").doc(guideId);
        const gDoc = await gRef.get();
        const prev = gDoc.exists ? gDoc.data() : {};
        await gRef.update({ totalEarned: (prev.totalEarned || 0) + (data.payment.guideHeldShare || 0) });
      } catch(e) { console.warn("Could not release held balance to guide:", e.message); }
    }
  }
  return bothConfirmed;
}

// Tourist reports the guide never showed up — flags for admin review and
// freezes the held 70% from being released until manually resolved.
async function reportNoShow(requestId, reason) {
  if (!window.firebase?.firestore) return;
  await window.firebase.firestore().collection("tripRequests").doc(requestId).update({
    status: "disputed", disputeReason: reason || "Tourist reported the guide did not show up.",
    disputedAt: new Date().toISOString(),
  });
}

// ─── IN-APP BOOKING CHAT ──────────────────────────────────────────────────────
async function sendBookingMessage(requestId, fromRole, fromName, text) {
  if (!window.firebase?.firestore || !text?.trim()) return;
  await window.firebase.firestore().collection("bookingMessages").add({
    requestId, fromRole, fromName, text: text.trim(), sentAt: new Date().toISOString(),
  });
}
async function loadBookingMessages(requestId) {
  if (!window.firebase?.firestore || !requestId) return [];
  try {
    const snap = await window.firebase.firestore().collection("bookingMessages")
      .where("requestId","==",requestId).limit(200).get();
    const msgs = snap.docs.map(d=>({id:d.id,...d.data()}));
    msgs.sort((a,b)=> new Date(a.sentAt) - new Date(b.sentAt));
    return msgs;
  } catch(e) { console.error("loadBookingMessages FAILED:", e.message); return []; }
}

const GUIDE_TERMS = `CEYLONTRAILS GUIDE TERMS & RULES

By submitting a bid, you agree to the following:

1. COMMISSION: CeylonTrails deducts 15% from each booking. You receive 85% of the agreed price.

2. PAYMENT STRUCTURE: The tourist pays the full amount to CeylonTrails in one payment. We release 30% of your share to you immediately once the booking is confirmed. The remaining 70% is held by CeylonTrails and released to you once BOTH you and the tourist confirm the trip was completed. This protects tourists from no-shows while ensuring you're paid in full for completed work.

3. CONDUCT: You must behave professionally at all times. Harassment, discrimination or misconduct will result in immediate removal from the platform.

4. PUNCTUALITY: You must arrive on time. Lateness of more than 30 minutes without notice may result in a full refund to the tourist.

5. ACCURACY: Your bid must cover all services stated. Hidden charges to tourists are strictly prohibited.

6. CANCELLATION: Cancelling within 48 hours of a confirmed booking without a valid reason incurs a penalty deducted from your next payment.

7. SLTDA COMPLIANCE: Your licence must remain valid. Expired licence = suspended account.

8. PAYMENTS: All payments are processed through CeylonTrails. Accepting cash directly from tourists for platform-booked tours is not permitted.

9. DISPUTES: All disputes are mediated by CeylonTrails. Our decision is final.

By proceeding, you confirm you have read and agree to all terms above.`;

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
  try {
    const snap = await window.firebase.firestore().collection("tripRequests").where("guideId","==",guideId).limit(50).get();
    const reqs = snap.docs.map(d=>({id:d.id,...d.data()}));
    reqs.sort((a,b)=> new Date(b.createdAt||0) - new Date(a.createdAt||0));
    return reqs;
  } catch(e) { console.error("loadTripRequests FAILED:", e.message); return []; }
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
// Compresses an image file down to a small base64 JPEG so it fits Firestore's 1MB doc limit.
// maxDim = longest side in pixels, quality = JPEG quality (0-1).
function compressImage(file, maxDim=600, quality=0.7) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) { height = Math.round(height * (maxDim/width)); width = maxDim; }
        else if (height > maxDim) { width = Math.round(width * (maxDim/height)); height = maxDim; }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("Could not read image"));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

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

// ─── GUIDE REGISTER FIELD HELPER (outside component to prevent remount) ───────
function GuideField({ label, value, onChange, type="text", placeholder, hint, error }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ fontSize:12, fontWeight:600, color:C.ink, display:"block", marginBottom:5 }}>
        {label} <span style={{ color:C.coral }}>*</span>
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{ width:"100%", padding:"11px 14px", border:`1.5px solid ${error?C.coral:C.border}`, borderRadius:10, fontSize:14, fontFamily:sans, outline:"none", boxSizing:"border-box", transition:"border-color .15s" }}
      />
      {error && <div style={{ fontSize:11, color:C.coral, marginTop:4 }}>⚠️ {error}</div>}
      {hint && !error && <div style={{ fontSize:11, color:C.inkSoft, marginTop:4 }}>{hint}</div>}
    </div>
  );
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
    try {
      // Compress to keep the whole profile document well under Firestore's 1MB limit
      const compressed = await compressImage(file, 500, 0.7);
      upd("photo", compressed);
    } catch(e) { setErrors(er=>({...er,photo:"Could not process that image — try a different photo"})); }
  };

  const handleLicence = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") && file.type!=="application/pdf") {
      setErrors(er=>({...er,licenceDoc:"Please select an image or PDF file"})); return;
    }
    try {
      if (file.type==="application/pdf") {
        // PDFs can't be recompressed client-side — cap size strictly
        if (file.size > 500*1024) { setErrors(er=>({...er,licenceDoc:"PDF must be under 500KB. Try compressing it or use a photo of the document instead."})); return; }
        const b64 = await fileToBase64(file);
        upd("licenceDoc", b64);
        upd("licenceDocName", file.name);
      } else {
        // Compress image licence photos too
        const compressed = await compressImage(file, 700, 0.7);
        upd("licenceDoc", compressed);
        upd("licenceDocName", file.name.replace(/\.\w+$/, ".jpg"));
      }
    } catch(e) { setErrors(er=>({...er,licenceDoc:"Could not process that file — try a clearer photo or smaller PDF"})); }
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
      const payload = {
        ...form, email:user.email, uid:user.uid,
        status:"pending", role:"guide",
        registeredAt: new Date().toISOString(),
        availability:"available", tripsCompleted:0, rating:0, reviews:[],
      };
      // Pre-flight size check — Firestore documents max out at 1MB (1,048,576 bytes)
      const approxSize = new Blob([JSON.stringify(payload)]).size;
      if (approxSize > 950*1024) {
        alert(`Your profile data is too large (${Math.round(approxSize/1024)}KB). Please use a smaller profile photo and/or licence document, then try again.`);
        setSaving(false);
        return;
      }
      await saveGuideProfile(user.uid, payload);
      await sendAdminNotification(form.fullName, user.email, form.sltdaNo);
      onComplete();
    } catch(e) { alert("Error saving profile: "+e.message); }
    setSaving(false);
  };

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
            <div style={{ fontSize:11, color:C.inkSoft, marginTop:3 }}>JPG or PNG · Auto-compressed · Clear face photo</div>
            {errors.photo && <div style={{ fontSize:11, color:C.coral, marginTop:3 }}>⚠️ {errors.photo}</div>}
          </div>
        </div>
        <input ref={photoRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display:"none" }}/>
      </div>

      <GuideField label="Full name (as on NIC)" value={form.fullName} onChange={e=>upd("fullName",e.target.value)} placeholder="e.g. Chaminda Perera" hint="Letters and spaces only" error={errors.fullName}/>
      <GuideField label="Phone number" value={form.phone} onChange={e=>upd("phone",e.target.value)} type="tel" placeholder="+94 77 123 4567" hint="Include country code" error={errors.phone}/>
      <GuideField label="NIC number" value={form.nic} onChange={e=>upd("nic",e.target.value)} placeholder="e.g. 199012345678 or 900123456V" hint="Old format: 9 digits + V/X · New format: 12 digits" error={errors.nic}/>
      <GuideField label="Home address" value={form.address} onChange={e=>upd("address",e.target.value)} placeholder="Street, City, Province" error={errors.address}/>
      <GuideField label="SLTDA Licence number" value={form.sltdaNo} onChange={e=>upd("sltdaNo",e.target.value)} placeholder="e.g. SLTDA/GT/2024/001" error={errors.sltdaNo}/>

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
              <div style={{ fontSize:11, color:C.inkSoft, marginTop:3 }}>Image (auto-compressed) or PDF · Max 500KB for PDF</div>
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
      <div style={{ background:C.amberLight, border:`1px solid #DFCBA0`, borderRadius:10, padding:"12px 14px", marginTop:12, fontSize:12, color:C.amber, lineHeight:1.6 }}>
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


// Formats the tourist's already-chosen trip dates for display to a guide.
// Guides must NOT set/propose their own dates — the tourist already picked
// these when building the itinerary, so we always read from the request.
function fmtTripDates(req) {
  if (!req) return "Dates not set by tourist yet";
  const { tripStartDate, tripEndDate } = req;
  if (!tripStartDate || !tripEndDate) return "Dates not set by tourist yet";
  const opts = { day:"numeric", month:"short", year:"numeric" };
  const s = new Date(tripStartDate).toLocaleDateString("en-GB", opts);
  const e = new Date(tripEndDate).toLocaleDateString("en-GB", opts);
  return `${s} → ${e}`;
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
  const [bidText, setBidText]   = useState({ price:"", message:"" });
  const [newTour, setNewTour]   = useState({ title:"", location:"", date:"", rating:5, notes:"" });
  const [addingTour, setAddTour]= useState(false);
  const [notifyToast, setNotifyToast] = useState(null); // one-time toast for declined/paid bids
  const [viewItin, setViewItin] = useState(null); // full itinerary being viewed in modal
  const seenStatuses = useRef({}); // tracks last-seen status per request to detect changes

  useEffect(()=>{
    if (activeTab==="requests") {
      setLR(true);
      loadTripRequests(user.uid).then(r=>{
        // Detect status changes since last load (declined / paid / completed) for one-time toast
        r.forEach(req=>{
          const prevStatus = seenStatuses.current[req.id];
          if (prevStatus && prevStatus!==req.status) {
            if (req.status==="declined") setNotifyToast({ type:"declined", text:`A tourist declined your bid for "${req.itinTitle||"a trip"}".` });
            if (req.status==="confirmed") setNotifyToast({ type:"accepted", text:`💰 Booking confirmed for "${req.itinTitle||"a trip"}"! Your initial payment has landed.` });
            if (req.status==="completed") setNotifyToast({ type:"accepted", text:`✅ Trip completed for "${req.itinTitle||"a trip"}"! Your remaining payment has been released.` });
          }
          seenStatuses.current[req.id] = req.status;
        });
        setRequests(r); setLR(false);
      }).catch(()=>setLR(false));
    }
  },[activeTab]);

  const updateAvailability = async (val, date) => {
    setAvail(val);
    await saveGuideProfile(user.uid, { availability:val, freeDate:date||"" });
    onProfileUpdate({ ...profile, availability:val, freeDate:date||"" });
  };

  // Returns true if this request's tourist-set dates overlap with another
  // accepted/confirmed booking's tourist-set dates. Real date-range comparison
  // now that dates always come from the tourist, not free text from the guide.
  const checkDateOverlap = (req) => {
    if (!req?.tripStartDate || !req?.tripEndDate) return null;
    const s1 = new Date(req.tripStartDate), e1 = new Date(req.tripEndDate);
    const confirmed = requests.filter(r => (r.status==="accepted"||r.status==="confirmed") && r.id!==req.id && r.tripStartDate && r.tripEndDate);
    return confirmed.find(r => {
      const s2 = new Date(r.tripStartDate), e2 = new Date(r.tripEndDate);
      return s1 <= e2 && s2 <= e1;
    }) || null;
  };

  const submitBidHandler = async () => {
    if (!bidModal || !bidText.price) return;
    if (bidModal.bid && !window.confirm("You already submitted a bid for this request. Submit a new one to replace it?")) return;
    const overlap = checkDateOverlap(bidModal);
    if (overlap && !window.confirm(`⚠️ Warning: these dates overlap with an already-confirmed booking ("${overlap.itinTitle}"). Submit anyway?`)) return;
    // Dates always come from the tourist's chosen trip dates — never guide-entered.
    const finalBid = { ...bidText, dates: fmtTripDates(bidModal) };
    await submitBid(bidModal.id, finalBid);
    setRequests(rs=>rs.map(r=>r.id===bidModal.id?{...r,bid:finalBid,bidStatus:"submitted"}:r));
    setBid(null); setBidText({ price:"", message:"" });
  };

  const addCompletedTour = async () => {
    if (!newTour.title) return;
    const tours = [...(profile?.activeTours||[]), { ...newTour, addedAt:new Date().toISOString() }];
    await saveGuideProfile(user.uid, { activeTours:tours, tripsCompleted:(profile?.tripsCompleted||0)+1 });
    onProfileUpdate({ ...profile, activeTours:tours, tripsCompleted:(profile?.tripsCompleted||0)+1 });
    setNewTour({ title:"", location:"", date:"", rating:5, notes:"" });
    setAddTour(false);
  };

  // Pre-fills the "add tour" form from a completed booking's details so the
  // guide just has to review & save rather than retype everything, then jumps
  // them to the Tours tab where the form lives.
  const handleAddToTripsFromReq = (req) => {
    setNewTour({
      title: req.itinTitle || "",
      location: req.tripEndLocation || req.tripStartLocation || "",
      date: req.tripEndDate || req.tripStartDate || "",
      rating: 5,
      notes: `Guided ${req.touristName || req.touristEmail || "a tourist"} · ${req.itinDays || "?"} days`,
    });
    setAddTour(true);
    setTab("tours");
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
      {/* Notification toast - declined or paid bid */}
      {notifyToast && (
        <div onClick={()=>setNotifyToast(null)} style={{ position:"fixed", top:80, left:"50%", transform:"translateX(-50%)", zIndex:1000, background:notifyToast.type==="declined"?C.coral:C.teal, color:"#fff", padding:"14px 22px", borderRadius:16, fontSize:13, fontWeight:600, boxShadow:"0 8px 32px rgba(0,0,0,.25)", cursor:"pointer", maxWidth:"90vw", textAlign:"center" }}>
          {notifyToast.text} <span style={{ opacity:.7, marginLeft:8 }}>✕</span>
        </div>
      )}
      {/* Full itinerary viewer — shown before guide decides to bid */}
      {viewItin && (
        <div onClick={e=>e.target===e.currentTarget&&setViewItin(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.65)", zIndex:950, display:"flex", alignItems:"center", justifyContent:"center", padding:14, backdropFilter:"blur(6px)" }}>
          <div className="premium-modal" style={{ background:"#fff", borderRadius:20, width:"100%", maxWidth:700, maxHeight:"90vh", display:"flex", flexDirection:"column", boxShadow:"0 24px 80px rgba(0,0,0,.3)", overflow:"hidden" }}>
            <div style={{ background:`linear-gradient(135deg,${C.teal},#0B3A30)`, padding:"1.2rem 1.4rem", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
              <div>
                <div style={{ fontFamily:serif, fontSize:17, fontWeight:700, color:"#fff" }}>{viewItin.title}</div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,.75)", marginTop:2 }}>{viewItin.tagline}</div>
              </div>
              <button onClick={()=>setViewItin(null)} style={{ width:32, height:32, borderRadius:"50%", border:"1px solid rgba(255,255,255,.3)", background:"rgba(255,255,255,.1)", color:"#fff", fontSize:16, cursor:"pointer", flexShrink:0 }}>✕</button>
            </div>
            <div style={{ padding:"1.2rem 1.4rem", overflowY:"auto", flex:1 }}>
              {viewItin.tripMeta && (
                <div style={{ display:"flex", gap:14, flexWrap:"wrap", background:C.tealPale, border:`1px solid #B9CFC5`, borderRadius:10, padding:"10px 14px", marginBottom:16, fontSize:12, color:C.teal }}>
                  {viewItin.tripMeta.startDate && <span>📅 {new Date(viewItin.tripMeta.startDate).toLocaleDateString("en-GB",{day:"numeric",month:"short"})} → {viewItin.tripMeta.endDate?new Date(viewItin.tripMeta.endDate).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}):""}</span>}
                  {viewItin.tripMeta.startLocation && <span>📍 From {viewItin.tripMeta.startLocation}</span>}
                  <span>{viewItin.tripMeta.roundTrip?"🔁 Round trip":"➡️ One-way"}</span>
                </div>
              )}
              {(viewItin.days||[]).map(d=>(
                <div key={d.day} style={{ border:`1.5px solid ${C.border}`, borderRadius:14, overflow:"hidden", marginBottom:12 }}>
                  <div style={{ padding:"10px 16px", background:"#F6F5F2", display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ background:C.teal, color:"#fff", fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20 }}>Day {d.day}</span>
                    <span style={{ fontSize:13, fontWeight:700, color:C.ink }}>{d.location}</span>
                    <span style={{ fontSize:11, color:C.inkSoft, marginLeft:"auto" }}>{d.theme}</span>
                  </div>
                  <div style={{ padding:"4px 16px 8px" }}>
                    {(d.activities||[]).map((a,i)=>(
                      <div key={i} style={{ display:"flex", gap:10, padding:"7px 0", borderBottom:i<d.activities.length-1?`1px solid ${C.border}`:"none", fontSize:12 }}>
                        <span style={{ color:C.inkSoft, fontWeight:600, flexShrink:0, minWidth:42 }}>{a.time}</span>
                        <div style={{ flex:1, minWidth:0 }}>
                          {a.place && <div style={{ fontWeight:600, color:C.ink }}>{a.place}</div>}
                          <div style={{ color:C.inkSoft }}>{a.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding:"1rem 1.4rem", borderTop:`1px solid ${C.border}`, flexShrink:0 }}>
              <Btn full onClick={()=>setViewItin(null)}>Close</Btn>
            </div>
          </div>
        </div>
      )}
      {/* Bid modal */}
      {bidModal && (
        <div onClick={e=>e.target===e.currentTarget&&setBid(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.55)", zIndex:900, display:"flex", alignItems:"center", justifyContent:"center", padding:16, backdropFilter:"blur(4px)" }}>
          <div style={{ background:"#fff", borderRadius:20, width:"100%", maxWidth:480, padding:"1.5rem", boxShadow:"0 20px 60px rgba(0,0,0,.25)", maxHeight:"85vh", display:"flex", flexDirection:"column" }}>
            <h3 style={{ fontFamily:serif, fontSize:18, fontWeight:700, color:C.ink, marginBottom:4, flexShrink:0 }}>Submit your bid</h3>
            <p style={{ fontSize:12, color:C.inkSoft, marginBottom:8, flexShrink:0 }}>For: <strong>{bidModal.itinTitle||"Trip request"}</strong></p>
            {bidModal.itinFull && (
              <button onClick={()=>setViewItin(bidModal.itinFull)} style={{ background:"none", border:"none", color:C.teal, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:sans, textAlign:"left", padding:0, marginBottom:12, flexShrink:0 }}>
                🗺️ View full itinerary before pricing →
              </button>
            )}

            {/* Guide Terms */}
            <div style={{ background:"#FAF9F6", border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 12px", marginBottom:12, maxHeight:120, overflowY:"auto", fontSize:11, color:C.inkSoft, lineHeight:1.6, flexShrink:0 }}>
              <div style={{ fontSize:11, fontWeight:700, color:C.ink, marginBottom:6 }}>📋 CeylonTrails Guide Rules (read before bidding)</div>
              {GUIDE_TERMS.split('\n').filter(l=>l.trim()).map((l,i)=>(
                <div key={i} style={{ marginBottom:3, color:l.startsWith('CEYLON')||l.match(/^\d+\./)? C.ink:C.inkSoft, fontWeight:l.match(/^\d+\./)?600:400 }}>{l}</div>
              ))}
            </div>

            <div style={{ overflowY:"auto", flex:1 }}>
            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:12, fontWeight:600, color:C.ink, display:"block", marginBottom:5 }}>Trip dates (set by tourist)</label>
              <div style={{ width:"100%", padding:"10px 12px", border:`1.5px solid ${C.border}`, borderRadius:10, fontSize:13, fontFamily:sans, background:C.surface, color:C.ink, boxSizing:"border-box" }}>
                📅 {fmtTripDates(bidModal)}
              </div>
              <p style={{ fontSize:11, color:C.inkSoft, marginTop:4 }}>You're bidding to guide on these exact dates — they can't be changed here.</p>
            </div>
            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:12, fontWeight:600, color:C.ink, display:"block", marginBottom:5 }}>Price (USD total)</label>
              <input type="number" value={bidText.price} onChange={e=>setBidText(b=>({...b,price:e.target.value}))} placeholder="e.g. 250"
                style={{ width:"100%", padding:"10px 12px", border:`1.5px solid ${C.border}`, borderRadius:10, fontSize:13, fontFamily:sans, outline:"none", boxSizing:"border-box" }}/>
            </div>
            <label style={{ fontSize:12, fontWeight:600, color:C.ink, display:"block", marginBottom:5 }}>Message to tourist</label>
            <textarea value={bidText.message} onChange={e=>setBidText(b=>({...b,message:e.target.value}))} rows={3} placeholder="Hello! I would love to guide you through Sri Lanka..."
              style={{ width:"100%", padding:"10px 12px", border:`1.5px solid ${C.border}`, borderRadius:10, fontSize:13, fontFamily:sans, outline:"none", resize:"vertical", boxSizing:"border-box", marginBottom:16 }}/>
            <div style={{ display:"flex", gap:10, marginTop:12 }}>
              <Btn onClick={submitBidHandler} style={{ flex:1 }}>Send bid →</Btn>
              <Btn variant="outline" onClick={()=>setBid(null)}>Cancel</Btn>
            </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ background:`linear-gradient(135deg,${C.teal},#0B3A30)`, padding:"2rem 2rem 1.5rem" }}>
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
            {requests.map(req=>{
              const statusMeta = {
                pending:  { label:"⏳ Awaiting your bid", bg:C.amberLight, fg:C.amber, bd:"#DFCBA0" },
                accepted: { label:"✅ Booking confirmed & paid", bg:C.tealLight, fg:C.teal, bd:"#B9CFC5" },
                declined: { label:"❌ Tourist declined",   bg:"#FEE2E2",   fg:"#A83A32", bd:"#E3C3BC" },
                guide_declined: { label:"🚫 You declined", bg:"#F1F5F9", fg:"#64748B", bd:"#E2E8F0" },
              };
              const sm = req.bid && req.status==="pending" ? { label:"✓ Bid sent — waiting on tourist", bg:C.tealLight, fg:C.teal, bd:"#B9CFC5" } : (statusMeta[req.status] || statusMeta.pending);
              return (
              <div key={req.id} style={{ border:`1.5px solid ${C.border}`, borderRadius:16, padding:"1.2rem", marginBottom:12, background:C.white, opacity:req.status==="declined"?.7:1 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:10, marginBottom:10 }}>
                  <div>
                    <div style={{ fontSize:15, fontWeight:700, color:C.ink, marginBottom:3 }}>{req.itinTitle||"Trip Request"}</div>
                    <div style={{ fontSize:12, color:C.inkSoft }}>From: {req.touristName||req.touristEmail||"Tourist"} · {req.itinDays||"?"} days · {req.group||"solo"}</div>
                  </div>
                  <span style={{ fontSize:11, fontWeight:700, padding:"4px 12px", borderRadius:20, background:sm.bg, color:sm.fg, border:`1px solid ${sm.bd}`, whiteSpace:"nowrap" }}>
                    {sm.label}
                  </span>
                </div>
                {req.itinTagline && <p style={{ fontSize:13, color:C.inkSoft, marginBottom:10 }}>{req.itinTagline}</p>}
                {(req.tripStartDate || req.tripStartLocation) && (
                  <div style={{ display:"flex", flexWrap:"wrap", gap:10, background:C.surface, borderRadius:8, padding:"8px 12px", marginBottom:10, fontSize:11, color:C.inkSoft }}>
                    {req.tripStartDate && <span>📅 {new Date(req.tripStartDate).toLocaleDateString("en-GB",{day:"numeric",month:"short"})}{req.tripEndDate?` → ${new Date(req.tripEndDate).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}`:""}</span>}
                    {req.tripStartTime && <span>🕐 Starts {req.tripStartTime}</span>}
                    {req.tripStartLocation && <span>📍 From {req.tripStartLocation}</span>}
                    {req.tripRoundTrip!=null && <span>{req.tripRoundTrip?"🔁 Round trip":"➡️ One-way"}</span>}
                  </div>
                )}
                {req.message && <div style={{ background:C.surface, borderRadius:8, padding:"8px 12px", fontSize:12, color:C.ink, marginBottom:10, borderLeft:`3px solid ${C.border}` }}>"{req.message}"</div>}
                {req.itinFull && (
                  <button onClick={()=>setViewItin(req.itinFull)} style={{ width:"100%", padding:"9px", background:C.tealPale, border:`1px solid #B9CFC5`, borderRadius:10, fontSize:12.5, fontWeight:600, color:C.teal, cursor:"pointer", fontFamily:sans, marginBottom:10, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                    🗺️ View full {req.itinDays}-day itinerary before bidding
                  </button>
                )}
                {req.bid && (req.status==="pending"||req.status==="declined") && (
                  <div style={{ background:req.status==="declined"?"#F5E7E4":C.tealPale, borderRadius:8, padding:"8px 12px", fontSize:12, color:req.status==="declined"?"#A83A32":C.teal, marginBottom:req.status==="declined"?10:0 }}>
                    Your bid: <strong>${req.bid.price}</strong> · {req.bid.dates}
                  </div>
                )}
                {(req.status==="confirmed"||req.status==="completed"||req.status==="disputed") && req.payment && (
                  <BookingManagementPanel req={req} role="guide" user={user} guidePhone={profile?.phone} onUpdate={(updated)=>setRequests(rs=>rs.map(r=>r.id===req.id?{...r,...updated}:r))} onAddToTrips={handleAddToTripsFromReq}/>
                )}
                {!req.bid && req.status==="pending" && (
                  <div style={{ display:"flex", gap:8 }}>
                    <Btn onClick={()=>{ setBid(req); setBidText({ price:"", message:"" }); }} style={{ flex:1 }}>Submit bid →</Btn>
                    <button onClick={async()=>{
                      if(!req.id){ alert("Error: this request is missing an ID."); return; }
                      if(!window.confirm("Decline this trip request? The tourist will be notified you're not available.")) return;
                      try {
                        await window.firebase.firestore().collection("tripRequests").doc(req.id).update({ status:"guide_declined" });
                        setRequests(rs=>rs.map(r=>r.id===req.id?{...r,status:"guide_declined"}:r));
                      } catch(e) {
                        console.error("Decline failed:", e);
                        alert("Could not decline this request: " + e.message);
                      }
                    }} style={{ padding:"0 16px", background:"none", color:C.coral, border:`1.5px solid ${C.coral}`, borderRadius:12, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:sans }}>
                      Decline
                    </button>
                  </div>
                )}
                {req.status==="guide_declined" && (
                  <div style={{ background:"#F1F5F9", borderRadius:8, padding:"8px 12px", fontSize:12, color:"#64748B" }}>
                    You declined this request — the tourist has been notified.
                  </div>
                )}
                {req.status==="declined" && (
                  <Btn variant="outline" onClick={()=>{ setBid(req); setBidText({ price:"", message:"" }); }}>Send a new bid →</Btn>
                )}
              </div>
            );})}
            {/* Demo requests if empty */}
            {!loadingReqs && requests.length===0 && (
              <div style={{ marginTop:16, background:C.tealPale, border:`1px solid #B9CFC5`, borderRadius:12, padding:"12px 16px", fontSize:12, color:C.teal }}>
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
              Earnings update automatically whenever a tourist accepts and pays for one of your bids.
            </p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, maxWidth:500, margin:"0 auto" }}>
              {[
                [`$${(profile?.totalEarned||0).toFixed(2)}`,"Total earned (85% share)"],
                [`${profile?.confirmedBookings||0}`,"Confirmed bookings"],
              ].map(([v,l])=>(
                <div key={l} style={{ background:C.white, border:`1.5px solid ${C.border}`, borderRadius:14, padding:"1rem" }}>
                  <div style={{ fontFamily:serif, fontSize:22, fontWeight:700, color:C.teal }}>{v}</div>
                  <div style={{ fontSize:11, color:C.inkSoft, marginTop:4 }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:24, background:C.amberLight, border:`1px solid #DFCBA0`, borderRadius:12, padding:"12px 16px", fontSize:12, color:C.amber, maxWidth:400, margin:"24px auto 0" }}>
              💡 This reflects demo PayPal payments processed in-app. Contact support@ceylontrails.lk to set up real bank payouts.
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
// Reviews a tourist will actually see on a guide's public portfolio — only
// ones an admin has moderated and approved, matched by guide name.
async function loadApprovedReviewsForGuide(guideName) {
  if (!window.firebase?.firestore || !guideName) return [];
  try {
    const snap = await window.firebase.firestore().collection("guideReviews")
      .where("guideName","==",guideName).where("status","==","approved").limit(30).get();
    const items = snap.docs.map(d=>({id:d.id,...d.data()}));
    items.sort((a,b)=> new Date(b.createdAt||0) - new Date(a.createdAt||0));
    return items;
  } catch(e) { console.error("loadApprovedReviewsForGuide FAILED:", e.message); return []; }
}
async function loadGuideReviews(status="pending") {
  if (!window.firebase?.firestore) return [];
  try {
    const snap = await window.firebase.firestore().collection("guideReviews")
      .where("status","==",status).limit(50).get();
    const reviews = snap.docs.map(d=>({id:d.id,...d.data()}));
    reviews.sort((a,b)=> new Date(b.createdAt||0) - new Date(a.createdAt||0));
    return reviews;
  } catch(e) { console.error("loadGuideReviews FAILED:", e.message); return []; }
}
async function updateReviewStatus(reviewId, status) {
  await window.firebase.firestore().collection("guideReviews").doc(reviewId).update({ status });
  // If approved, also append to guide's profile reviews array
}

function GuideReviewModal({ onClose, user, prefill }) {
  const [form, setForm]     = useState({ guideName:prefill?.guideName||"", tripRef:prefill?.tripRef||"", rating:5, title:"", body:"", touristName:"" });
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
        <div style={{ background:`linear-gradient(135deg,${C.teal},#0B3A30)`, padding:"1.2rem 1.4rem", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
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

            <div style={{ background:C.amberLight, border:`1px solid #DFCBA0`, borderRadius:10, padding:"10px 12px", fontSize:11, color:C.amber, marginBottom:16, lineHeight:1.6 }}>
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
// ─── ADMIN ANALYTICS DASHBOARD ────────────────────────────────────────────────
function AdminAnalyticsDashboard({ analytics, loading, onRefresh }) {
  if (loading || !analytics) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", gap:14, color:"#64748B" }}>
      <div style={{ width:40, height:40, border:"3px solid #E3E1DC", borderTopColor:"#2E3F4E", borderRadius:"50%", animation:"spin .8s linear infinite" }}/>
      <p style={{ fontSize:13 }}>Crunching the numbers…</p>
    </div>
  );

  const maxMonthRevenue = Math.max(1, ...Object.values(analytics.monthBuckets).map(m=>m.revenue));
  const maxDestCount = Math.max(1, ...analytics.popularDest.map(([,c])=>c));

  const StatCard = ({ icon, label, value, sub, color="#2E3F4E" }) => (
    <div style={{ background:"#fff", border:"1px solid #E3E1DC", borderRadius:14, padding:"16px 18px" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
        <span style={{ fontSize:20 }}>{icon}</span>
        {sub && <span style={{ fontSize:11, color:"#3D7A52", fontWeight:600 }}>{sub}</span>}
      </div>
      <div style={{ fontFamily:serif, fontSize:24, fontWeight:700, color }}>{value}</div>
      <div style={{ fontSize:12, color:"#64748B", marginTop:2 }}>{label}</div>
    </div>
  );

  return (
    <div style={{ maxWidth:900 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:10 }}>
        <div>
          <h2 style={{ fontFamily:serif, fontSize:22, fontWeight:700, color:"#16232B" }}>📊 Business Analytics</h2>
          <p style={{ fontSize:12, color:"#64748B", marginTop:2 }}>Bookings, revenue, and guide performance at a glance</p>
        </div>
        <button onClick={onRefresh} style={{ padding:"8px 16px", background:"#EBEEF0", color:"#2E3F4E", border:"1px solid #B4D0EF", borderRadius:10, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:sans }}>↺ Refresh</button>
      </div>

      {/* Top stat cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:12, marginBottom:24 }}>
        <StatCard icon="💰" label="Total revenue" value={`$${analytics.totalRevenue.toFixed(0)}`} color="#3D7A52"/>
        <StatCard icon="🏛️" label="CeylonTrails commission" value={`$${analytics.totalCommission.toFixed(0)}`} color="#2E3F4E"/>
        <StatCard icon="🔓" label="Premium unlock revenue" value={`$${(analytics.totalPremiumRevenue||0).toFixed(0)}`} color="#B45309"/>
        <StatCard icon="🧭" label="Guide earnings paid" value={`$${analytics.totalGuideEarnings.toFixed(0)}`} color="#8A6A34"/>
        <StatCard icon="✅" label="Confirmed bookings" value={analytics.totalBookings} sub={`${analytics.conversionRate}% conversion`}/>
        <StatCard icon="📩" label="Total trip requests" value={analytics.totalRequests}/>
        <StatCard icon="🧑‍🤝‍🧑" label="Approved guides" value={`${analytics.approvedGuides} / ${analytics.totalGuides}`} sub={analytics.pendingGuides>0?`${analytics.pendingGuides} pending`:null}/>
        <StatCard icon="⚠️" label="Open disputes" value={analytics.disputedCount||0} color={analytics.disputedCount>0?"#A83A32":"#2E3F4E"}/>
      </div>

      {/* Bookings & revenue trend (last 6 months) */}
      <div style={{ background:"#fff", border:"1px solid #E3E1DC", borderRadius:16, padding:"18px 20px", marginBottom:20 }}>
        <h3 style={{ fontSize:14, fontWeight:700, color:"#16232B", marginBottom:16 }}>Revenue trend — last 6 months</h3>
        <div style={{ display:"flex", alignItems:"flex-end", gap:14, height:140 }}>
          {Object.entries(analytics.monthBuckets).map(([month, data])=>(
            <div key={month} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
              <div style={{ fontSize:10, color:"#64748B", fontWeight:600 }}>{data.revenue>0?`$${data.revenue.toFixed(0)}`:""}</div>
              <div style={{ width:"100%", maxWidth:36, height:`${Math.max(4, (data.revenue/maxMonthRevenue)*100)}px`, background:"linear-gradient(180deg,#2E3F4E,#16232B)", borderRadius:"6px 6px 0 0", transition:"height .3s" }}/>
              <div style={{ fontSize:11, color:"#64748B" }}>{month}</div>
              <div style={{ fontSize:9, color:"#94A3B8" }}>{data.bookings} bkg</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        {/* Popular destinations */}
        <div style={{ background:"#fff", border:"1px solid #E3E1DC", borderRadius:16, padding:"18px 20px" }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:"#16232B", marginBottom:14 }}>🗺️ Popular trip styles</h3>
          {analytics.popularDest.length===0 && <p style={{ fontSize:12, color:"#94A3B8" }}>No trip requests yet</p>}
          {analytics.popularDest.map(([title, count])=>(
            <div key={title} style={{ marginBottom:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4 }}>
                <span style={{ color:"#16232B", fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:180 }}>{title}</span>
                <span style={{ color:"#64748B" }}>{count}</span>
              </div>
              <div style={{ height:6, background:"#F1F5F9", borderRadius:6, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${(count/maxDestCount)*100}%`, background:"#2E3F4E", borderRadius:6 }}/>
              </div>
            </div>
          ))}
        </div>

        {/* Top performing guides */}
        <div style={{ background:"#fff", border:"1px solid #E3E1DC", borderRadius:16, padding:"18px 20px" }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:"#16232B", marginBottom:14 }}>🏆 Top performing guides</h3>
          {analytics.topGuides.length===0 && <p style={{ fontSize:12, color:"#94A3B8" }}>No completed bookings yet</p>}
          {analytics.topGuides.map((g,i)=>(
            <div key={g.name+i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:i<analytics.topGuides.length-1?"1px solid #F1F5F9":"none" }}>
              <span style={{ width:22, height:22, borderRadius:"50%", background:i===0?"#C9AD7C":i===1?"#E2E8F0":"#FDBA74", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"#16232B", flexShrink:0 }}>{i+1}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12, fontWeight:600, color:"#16232B", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{g.name}</div>
                <div style={{ fontSize:11, color:"#64748B" }}>{g.bookings} booking{g.bookings!==1?"s":""}</div>
              </div>
              <div style={{ fontSize:13, fontWeight:700, color:"#3D7A52" }}>${g.earnings.toFixed(0)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminPanel({ onClose }) {
  const ADMIN_PWD = import.meta.env.VITE_ADMIN_PASSWORD || "ceylontrails2024";
  const [authed,    setAuthed]  = useState(()=>sessionStorage.getItem("ct_admin")==="1");
  const [pwd,       setPwd]     = useState("");
  const [guides,    setGuides]  = useState([]);
  const [reviews,   setReviews] = useState([]);
  const [loading,   setLoading] = useState(false);
  const [selected,  setSelected]= useState(null);
  const [filterTab, setFilter]  = useState("dashboard");
  const [rejMsg,    setRejMsg]  = useState("");
  const [actioning, setActioning]=useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Pulls bookings (tripRequests) + guides and computes business metrics client-side.
  // Kept lightweight (no separate analytics collection) since Firestore reads
  // are cheap at this scale and this avoids needing a backend cron job.
  const loadAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      if (!window.firebase?.firestore) await loadScript("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js");
      const [reqSnap, guideSnap, premiumSnap] = await Promise.all([
        window.firebase.firestore().collection("tripRequests").limit(500).get(),
        window.firebase.firestore().collection("guides").limit(200).get(),
        window.firebase.firestore().collection("premiumPayments").limit(1000).get(),
      ]);
      const requests = reqSnap.docs.map(d=>d.data());
      const allGuides = guideSnap.docs.map(d=>({id:d.id,...d.data()}));
      const premiumPayments = premiumSnap.docs.map(d=>d.data());

      const accepted = requests.filter(r=>(r.status==="confirmed"||r.status==="underway"||r.status==="completed") && r.payment);
      const disputed = requests.filter(r=>r.status==="disputed");
      const bookingRevenue  = accepted.reduce((s,r)=>s+(r.payment.total||0), 0);
      const bookingCommission = accepted.reduce((s,r)=>s+(r.payment.commission||0), 0);
      const totalGuideEarnings = accepted.reduce((s,r)=>s+(r.payment.guideAmount||0), 0);
      // Itinerary premium unlocks — pure platform income, no guide split, so it
      // counts toward both total revenue and CeylonTrails' own commission line.
      const totalPremiumRevenue = premiumPayments.reduce((s,p)=>s+(p.amount||0), 0);
      const totalRevenue    = bookingRevenue + totalPremiumRevenue;
      const totalCommission = bookingCommission + totalPremiumRevenue;

      // Bookings by month (last 6 months) for the trend chart
      const monthBuckets = {};
      const now = new Date();
      for (let i=5; i>=0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
        const key = d.toLocaleDateString("en-GB",{month:"short",year:"2-digit"});
        monthBuckets[key] = { bookings:0, revenue:0 };
      }
      accepted.forEach(r=>{
        const d = new Date(r.acceptedAt||r.createdAt||Date.now());
        const key = d.toLocaleDateString("en-GB",{month:"short",year:"2-digit"});
        if (monthBuckets[key]) { monthBuckets[key].bookings++; monthBuckets[key].revenue += (r.payment.total||0); }
      });

      // Popular destinations — count itinTitle keywords across all requests
      const destCounts = {};
      requests.forEach(r=>{
        const title = (r.itinTitle||"").replace(/^\d+-Day\s*/i,"").trim();
        if (title) destCounts[title] = (destCounts[title]||0) + 1;
      });
      const popularDest = Object.entries(destCounts).sort((a,b)=>b[1]-a[1]).slice(0,6);

      // Guide performance — bookings + earnings per guide
      const guidePerf = {};
      accepted.forEach(r=>{
        if (!r.guideId) return;
        if (!guidePerf[r.guideId]) guidePerf[r.guideId] = { name:r.guideName||"Unknown", bookings:0, earnings:0 };
        guidePerf[r.guideId].bookings++;
        guidePerf[r.guideId].earnings += (r.payment?.guideAmount||0);
      });
      const topGuides = Object.values(guidePerf).sort((a,b)=>b.earnings-a.earnings).slice(0,5);

      setAnalytics({
        totalBookings: accepted.length,
        totalRequests: requests.length,
        totalRevenue, totalCommission, totalGuideEarnings, totalPremiumRevenue,
        conversionRate: requests.length ? Math.round((accepted.length/requests.length)*100) : 0,
        totalGuides: allGuides.length,
        approvedGuides: allGuides.filter(g=>g.status==="approved").length,
        pendingGuides: allGuides.filter(g=>g.status==="pending").length,
        disputedCount: disputed.length,
        monthBuckets, popularDest, topGuides,
      });
    } catch(e) { console.error("Analytics load failed:", e.message); }
    setLoadingAnalytics(false);
  };

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

  useEffect(()=>{ if(authed) { loadGuides(); loadAnalytics(); } },[authed]);

  const approve = async (guide) => {
    if (!guide?.uid) { alert("Error: this guide record is missing a UID and can't be updated."); return; }
    setActioning(true);
    try {
      await window.firebase.firestore().collection("guides").doc(guide.uid).update({ status:"approved", approvedAt:new Date().toISOString() });
      setGuides(gs=>gs.map(g=>g.uid===guide.uid?{...g,status:"approved"}:g));
      setSelected(s=>s?{...s,status:"approved"}:s);
    } catch(e) {
      console.error("Approve failed:", e);
      alert("Approval failed: " + e.message + "\n\nThis is usually a Firestore security rules issue — check that your rules allow writes to the 'guides' collection.");
    }
    setActioning(false);
  };

  const reject = async (guide) => {
    if (!guide?.uid) { alert("Error: this guide record is missing a UID and can't be updated."); return; }
    if (!rejMsg.trim()) { alert("Please enter a reason for rejection"); return; }
    setActioning(true);
    try {
      await window.firebase.firestore().collection("guides").doc(guide.uid).update({ status:"rejected", rejectedAt:new Date().toISOString(), rejectionReason:rejMsg });
      setGuides(gs=>gs.map(g=>g.uid===guide.uid?{...g,status:"rejected",rejectionReason:rejMsg}:g));
      setSelected(s=>s?{...s,status:"rejected"}:s);
      setRejMsg("");
    } catch(e) {
      console.error("Reject failed:", e);
      alert("Rejection failed: " + e.message + "\n\nThis is usually a Firestore security rules issue — check that your rules allow writes to the 'guides' collection.");
    }
    setActioning(false);
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
    <div style={{ position:"fixed", inset:0, background:"#F6F5F2", zIndex:1000, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      {/* Header */}
      <div style={{ background:`linear-gradient(135deg,#16232B,#2E3F4E)`, padding:"14px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:22 }}>🔐</span>
          <div>
            <div style={{ fontFamily:serif, fontSize:16, fontWeight:700, color:"#fff" }}>CeylonTrails Admin</div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,.6)" }}>Welcome back — here's what's happening</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={()=>{ loadGuides(); loadAnalytics(); if(filterTab==="reviews") loadReviews(); }} style={{ padding:"7px 14px", background:"rgba(255,255,255,.1)", color:"#fff", border:"1px solid rgba(255,255,255,.25)", borderRadius:8, fontSize:12, cursor:"pointer", fontFamily:sans }}>↺ Refresh</button>
          <button onClick={()=>{ sessionStorage.removeItem("ct_admin"); onClose(); }} style={{ padding:"7px 14px", background:"rgba(255,255,255,.1)", color:"#fff", border:"1px solid rgba(255,255,255,.25)", borderRadius:8, fontSize:12, cursor:"pointer", fontFamily:sans }}>✕ Close</button>
        </div>
      </div>

      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
        {/* Left: main navigation menu — always visible, replaces the old cramped tab strip */}
        <div className="admin-nav-sidebar" style={{ width:200, background:"#16232B", display:"flex", flexDirection:"column", flexShrink:0, overflowY:"auto" }}>
          <div className="admin-nav-section-title" style={{ padding:"16px 14px 8px", fontSize:10, fontWeight:700, color:"rgba(255,255,255,.4)", textTransform:"uppercase", letterSpacing:1 }}>Main menu</div>
          {[
            { id:"dashboard", icon:"📊", label:"Dashboard" },
            { id:"pending",   icon:"⏳", label:"Pending guides", count:guides.filter(g=>g.status==="pending").length },
            { id:"approved",  icon:"✅", label:"Approved guides", count:guides.filter(g=>g.status==="approved").length },
            { id:"rejected",  icon:"❌", label:"Rejected guides", count:guides.filter(g=>g.status==="rejected").length },
            { id:"reviews",   icon:"📝", label:"Reviews", count:reviews.length },
          ].map(item=>(
            <button key={item.id} onClick={()=>{ setFilter(item.id); setSelected(null); if(item.id==="reviews") loadReviews(); if(item.id==="dashboard") loadAnalytics(); }}
              style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 14px", border:"none", background:filterTab===item.id?"rgba(255,255,255,.1)":"transparent", color:filterTab===item.id?"#fff":"rgba(255,255,255,.65)", fontSize:13, fontWeight:filterTab===item.id?600:400, cursor:"pointer", fontFamily:sans, borderLeft:filterTab===item.id?"3px solid #4F9CF9":"3px solid transparent", textAlign:"left", width:"100%" }}>
              <span style={{ fontSize:15, width:18, textAlign:"center", flexShrink:0 }}>{item.icon}</span>
              <span className="admin-nav-label" style={{ flex:1 }}>{item.label}</span>
              {item.count>0 && <span className="admin-nav-label" style={{ background:filterTab===item.id?"#4F9CF9":"rgba(255,255,255,.15)", color:"#fff", fontSize:10, fontWeight:700, padding:"1px 7px", borderRadius:10 }}>{item.count}</span>}
            </button>
          ))}
          <div className="admin-nav-label" style={{ marginTop:"auto", padding:"14px", borderTop:"1px solid rgba(255,255,255,.1)", fontSize:10, color:"rgba(255,255,255,.35)" }}>
            CeylonTrails Admin v2
          </div>
        </div>

        {/* Guide/review list (hidden on dashboard — full width dashboard instead) */}
        {filterTab!=="analytics" && filterTab!=="dashboard" && (
        <div style={{ width:300, background:"#fff", borderRight:"1px solid #E3E1DC", display:"flex", flexDirection:"column", flexShrink:0 }}>
          {/* Section title */}
          <div style={{ padding:"14px 16px", borderBottom:"1px solid #E3E1DC" }}>
            <div style={{ fontSize:14, fontWeight:700, color:"#16232B", textTransform:"capitalize" }}>
              {filterTab==="reviews"?"📝 Tourist Reviews":`${{pending:"⏳",approved:"✅",rejected:"❌"}[filterTab]||""} ${filterTab} Guides`}
            </div>
          </div>

          {/* Guide or Review list */}
          <div style={{ flex:1, overflowY:"auto" }}>
            {loading && <div style={{ padding:"2rem", textAlign:"center", color:"#64748B", fontSize:13 }}>Loading…</div>}

            {/* Reviews tab */}
            {filterTab==="reviews" && reviews.map(r=>(
              <div key={r.id} style={{ padding:"12px 14px", borderBottom:"1px solid #F6F5F2", cursor:"pointer", background:selected?.id===r.id?"#EBEEF0":"transparent" }}
                onClick={()=>setSelected({...r, _isReview:true})}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:"#16232B", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.title||"Review"}</div>
                  <span style={{ fontSize:10, padding:"2px 8px", borderRadius:20, background:r.status==="approved"?"#DCFCE7":"#F1ECD8", color:r.status==="approved"?"#3D7A52":"#8A6A34", fontWeight:700, flexShrink:0, marginLeft:6 }}>{r.status}</span>
                </div>
                <div style={{ fontSize:11, color:"#64748B" }}>Guide: {r.guideName} · Trip: {r.tripRef}</div>
                <div style={{ fontSize:11, color:"#64748B", marginTop:2 }}>By: {r.touristName} · {"⭐".repeat(r.rating)}</div>
              </div>
            ))}
            {filterTab==="reviews" && reviews.length===0 && <div style={{ padding:"2rem", textAlign:"center", color:"#64748B", fontSize:13 }}>No reviews yet</div>}

            {/* Guides list */}
            {filterTab!=="reviews" && !loading && filtered.length===0 && <div style={{ padding:"2rem", textAlign:"center", color:"#64748B", fontSize:13 }}>No {filterTab} guides</div>}
            {filterTab!=="reviews" && filtered.map(g=>(
              <div key={g.uid} onClick={()=>setSelected(g)} style={{ padding:"14px 16px", borderBottom:"1px solid #F6F5F2", cursor:"pointer", background:selected?.uid===g.uid?"#EBEEF0":"transparent", transition:"background .15s" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:40, height:40, borderRadius:"50%", overflow:"hidden", flexShrink:0, background:"#E2E8F0" }}>
                    {g.photo ? <img src={g.photo} alt={g.fullName} style={{ width:"100%", height:"100%", objectFit:"cover" }}/> : <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>👤</div>}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:"#16232B", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{g.fullName}</div>
                    <div style={{ fontSize:11, color:"#64748B", marginTop:1 }}>{g.email}</div>
                    <div style={{ fontSize:10, color:"#64748B", marginTop:2 }}>Registered: {g.registeredAt?new Date(g.registeredAt).toLocaleDateString():"—"}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Right: guide/review detail, OR full-width analytics dashboard */}
        <div style={{ flex:1, overflowY:"auto", padding: (filterTab==="analytics"||filterTab==="dashboard") ? "1.5rem 2rem" : "1.5rem" }}>
          {(filterTab==="analytics"||filterTab==="dashboard") ? (
            <AdminAnalyticsDashboard analytics={analytics} loading={loadingAnalytics} onRefresh={loadAnalytics}/>
          ) : !selected ? (
            <div style={{ height:"100%", display:"flex", alignItems:"center", justifyContent:"center", color:"#94A3B8", flexDirection:"column", gap:12 }}>
              <span style={{ fontSize:48 }}>👈</span>
              <p style={{ fontSize:14 }}>Select an item to review</p>
            </div>
          ) : selected._isReview ? (
            /* ── Review detail ── */
            <div style={{ maxWidth:600 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:10 }}>
                <h2 style={{ fontFamily:serif, fontSize:20, fontWeight:700, color:"#16232B" }}>{selected.title}</h2>
                <span style={{ fontSize:12, padding:"5px 14px", borderRadius:20, background:selected.status==="approved"?"#DCFCE7":"#F1ECD8", color:selected.status==="approved"?"#3D7A52":"#8A6A34", fontWeight:700, border:`1px solid ${selected.status==="approved"?"#86EFAC":"#C9AD7C"}` }}>{selected.status}</span>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
                {[["Tourist",selected.touristName],["Email",selected.touristEmail],["Guide",selected.guideName],["Trip Ref",selected.tripRef],["Rating","⭐".repeat(selected.rating)],["Submitted",selected.createdAt?new Date(selected.createdAt).toLocaleDateString():"—"]].map(([l,v])=>(
                  <div key={l} style={{ background:"#fff", borderRadius:10, padding:"10px 14px", border:"1px solid #E3E1DC" }}>
                    <div style={{ fontSize:11, color:"#64748B", marginBottom:3, fontWeight:600 }}>{l}</div>
                    <div style={{ fontSize:13, fontWeight:600, color:"#16232B" }}>{v||"—"}</div>
                  </div>
                ))}
              </div>
              <div style={{ background:"#fff", borderRadius:12, padding:"14px", border:"1px solid #E3E1DC", marginBottom:20 }}>
                <div style={{ fontSize:12, fontWeight:600, color:"#64748B", marginBottom:8 }}>Review content</div>
                <p style={{ fontSize:13, color:"#16232B", lineHeight:1.7 }}>{selected.body}</p>
              </div>
              <div style={{ background:"#F1ECD8", border:"1px solid #C9AD7C", borderRadius:12, padding:"12px 14px", marginBottom:16, fontSize:12, color:"#92400E", lineHeight:1.6 }}>
                ⚠️ <strong>Verify before approving:</strong> Check that trip reference "{selected.tripRef}" matches actual booking records. The guide "{selected.guideName}" should confirm this tour took place.
              </div>
              <div style={{ display:"flex", gap:10 }}>
                {selected.status!=="approved" && (
                  <button onClick={async()=>{ setActioning(true); await updateReviewStatus(selected.id,"approved"); setReviews(rs=>rs.map(r=>r.id===selected.id?{...r,status:"approved"}:r)); setSelected(s=>({...s,status:"approved"})); setActioning(false); }} disabled={actioning}
                    style={{ flex:1, padding:"12px", background:"#3D7A52", color:"#fff", border:"none", borderRadius:10, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:sans, opacity:actioning?.6:1 }}>
                    ✅ Approve & Publish
                  </button>
                )}
                <button onClick={async()=>{ if(!window.confirm("Delete this review permanently?")) return; setActioning(true); await window.firebase.firestore().collection("guideReviews").doc(selected.id).delete(); setReviews(rs=>rs.filter(r=>r.id!==selected.id)); setSelected(null); setActioning(false); }} disabled={actioning}
                  style={{ flex:1, padding:"12px", background:"#A83A32", color:"#fff", border:"none", borderRadius:10, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:sans, opacity:actioning?.6:1 }}>
                  🗑️ Delete Review
                </button>
              </div>
            </div>
          ) : (
            <div style={{ maxWidth:700 }}>
              {/* Status badge */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:12 }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:64, height:64, borderRadius:"50%", overflow:"hidden", border:"2px solid #E3E1DC", flexShrink:0 }}>
                    {selected.photo ? <img src={selected.photo} alt={selected.fullName} style={{ width:"100%", height:"100%", objectFit:"cover" }}/> : <div style={{ width:"100%", height:"100%", background:"#E2E8F0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>👤</div>}
                  </div>
                  <div>
                    <div style={{ fontFamily:serif, fontSize:20, fontWeight:700, color:"#16232B" }}>{selected.fullName}</div>
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
                  <div key={l} style={{ background:"#fff", borderRadius:10, padding:"10px 14px", border:"1px solid #E3E1DC" }}>
                    <div style={{ fontSize:11, color:"#64748B", marginBottom:3, fontWeight:600 }}>{l}</div>
                    <div style={{ fontSize:13, fontWeight:600, color:"#16232B" }}>{v||"—"}</div>
                  </div>
                ))}
              </div>

              {/* Languages & Specialties */}
              {[["Languages",selected.languages],["Specialties",selected.specialties],["Areas",selected.areas]].map(([l,arr])=>arr?.length>0&&(
                <div key={l} style={{ marginBottom:14 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:"#64748B", marginBottom:6 }}>{l}</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {(arr||[]).map(x=><span key={x} style={{ fontSize:11, padding:"3px 10px", borderRadius:20, background:"#EBEEF0", color:"#2E3F4E", fontWeight:600 }}>{x}</span>)}
                  </div>
                </div>
              ))}

              {/* Bio */}
              {selected.bio && (
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:"#64748B", marginBottom:6 }}>Bio</div>
                  <div style={{ background:"#fff", borderRadius:10, padding:"12px 14px", border:"1px solid #E3E1DC", fontSize:13, color:"#16232B", lineHeight:1.65 }}>{selected.bio}</div>
                </div>
              )}

              {/* SLTDA Licence document */}
              {selected.licenceDoc && (
                <div style={{ marginBottom:20 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:"#64748B", marginBottom:6 }}>SLTDA Licence Document</div>
                  {selected.licenceDocName?.endsWith(".pdf")
                    ? <a href={selected.licenceDoc} download={selected.licenceDocName} style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"10px 16px", background:"#EBEEF0", borderRadius:10, color:"#2E3F4E", textDecoration:"none", fontSize:13, fontWeight:600 }}>📄 {selected.licenceDocName} — Download</a>
                    : <img src={selected.licenceDoc} alt="SLTDA Licence" style={{ maxWidth:"100%", borderRadius:10, border:"1px solid #E3E1DC", maxHeight:300, objectFit:"contain" }}/>
                  }
                </div>
              )}

              {/* Action buttons */}
              {selected.status==="pending" && (
                <div style={{ background:"#fff", borderRadius:14, padding:"1.2rem", border:"1px solid #E3E1DC" }}>
                  <h4 style={{ fontSize:14, fontWeight:700, color:"#16232B", marginBottom:14 }}>Review Decision</h4>
                  <div style={{ display:"flex", gap:10, marginBottom:14, flexWrap:"wrap" }}>
                    <button onClick={()=>approve(selected)} disabled={actioning} style={{ flex:1, padding:"12px", background:"#3D7A52", color:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:sans, opacity:actioning?.6:1, minWidth:120 }}>
                      ✅ Approve Guide
                    </button>
                  </div>
                  <div>
                    <label style={{ fontSize:12, fontWeight:600, color:"#64748B", display:"block", marginBottom:6 }}>Rejection reason (required to reject)</label>
                    <textarea value={rejMsg} onChange={e=>setRejMsg(e.target.value)} rows={2} placeholder="e.g. SLTDA licence could not be verified. Please reapply with a clearer document."
                      style={{ width:"100%", padding:"10px 12px", border:"1.5px solid #E3E1DC", borderRadius:8, fontSize:13, fontFamily:sans, outline:"none", resize:"vertical", boxSizing:"border-box", marginBottom:8 }}/>
                    <button onClick={()=>reject(selected)} disabled={actioning||!rejMsg.trim()} style={{ width:"100%", padding:"12px", background:"#A83A32", color:"#fff", border:"none", borderRadius:10, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:sans, opacity:actioning||!rejMsg.trim()?.5:1 }}>
                      ❌ Reject Application
                    </button>
                  </div>
                </div>
              )}

              {selected.status==="approved" && (
                <div style={{ background:"#F0FDF4", border:"1.5px solid #86EFAC", borderRadius:12, padding:"14px", textAlign:"center", fontSize:13, color:"#3D7A52", fontWeight:600 }}>
                  ✅ This guide is approved · Active on platform since {selected.approvedAt?new Date(selected.approvedAt).toLocaleDateString():"—"}
                </div>
              )}

              {selected.status==="rejected" && (
                <div style={{ background:"#F5E7E4", border:"1.5px solid #E3C3BC", borderRadius:12, padding:"14px" }}>
                  <div style={{ fontSize:13, fontWeight:700, color:"#A83A32", marginBottom:4 }}>❌ Application Rejected</div>
                  <div style={{ fontSize:12, color:"#64748B" }}>Reason: {selected.rejectionReason||"No reason given"}</div>
                  <button onClick={()=>approve(selected)} style={{ marginTop:10, padding:"8px 16px", background:"#3D7A52", color:"#fff", border:"none", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:sans }}>Override — Approve</button>
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
function GuidePortalPage({ setPage, setViewMode }) {
  const { user, signInEmail, signUpEmail, signInGoogle } = useAuth();
  const [guideProfile, setGuideProfile] = useState(null);
  const [loading, setLoading]           = useState(true);
  const [mode, setMode]                 = useState("signin");
  const [email, setEmail]               = useState("");
  const [pass, setPass]                 = useState("");
  const [error, setError]               = useState("");
  const [authLoading, setAL]            = useState(false);

  // Being on this page at all means guide intent — keep nav mode in sync
  // even if someone landed here by a direct link rather than the sign-in
  // dropdown (e.g. a bookmark, or a fresh signup right on this page).
  useEffect(()=>{ if (user && setViewMode) setViewMode("guide"); },[user, setViewMode]);

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
        <div style={{ background:`linear-gradient(135deg,${C.teal},#0B3A30)`, padding:"2rem", textAlign:"center" }}>
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
          {error && <div style={{ background:C.coralLight, border:`1px solid #DCC5BC`, borderRadius:10, padding:"8px 12px", fontSize:12, color:C.coral, marginBottom:12 }}>{error}</div>}
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
      <div style={{ background:`linear-gradient(135deg,${C.teal},#0B3A30)`, padding:"2rem", textAlign:"center" }}>
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

// ─── SOCIAL / BUSINESS INFO ───────────────────────────────────────────────────
// Centralised so the footer and Contact page always show the same details —
// edit these once here to update everywhere.
const BUSINESS_INFO = {
  email: "hello@ceylontrails.lk",
  phone: "+94 76 123 4567",
  address: "World Trade Center, Echelon Square, Colombo 01, Sri Lanka",
  hours: "Mon–Sat, 9:00 AM – 6:00 PM (GMT+5:30)",
  mapQuery: "World Trade Center, Colombo 01, Sri Lanka",
};

// Real brand marks (simplified single-path monochrome versions, sized to a
// 24x24 viewBox) instead of emoji — emoji social icons are what made the
// footer look like a sticker pack rather than a real business.
function SocialGlyph({ name, size=16 }) {
  const common = { width:size, height:size, viewBox:"0 0 24 24", fill:"currentColor", xmlns:"http://www.w3.org/2000/svg" };
  switch(name) {
    case "Instagram": return (
      <svg {...common}><path d="M12 2c2.72 0 3.06.01 4.12.06 1.06.05 1.79.22 2.43.47.66.26 1.22.6 1.77 1.15.55.55.9 1.11 1.15 1.77.25.64.42 1.37.47 2.43.05 1.06.06 1.4.06 4.12s-.01 3.06-.06 4.12c-.05 1.06-.22 1.79-.47 2.43a4.9 4.9 0 01-1.15 1.77 4.9 4.9 0 01-1.77 1.15c-.64.25-1.37.42-2.43.47-1.06.05-1.4.06-4.12.06s-3.06-.01-4.12-.06c-1.06-.05-1.79-.22-2.43-.47a4.9 4.9 0 01-1.77-1.15 4.9 4.9 0 01-1.15-1.77c-.25-.64-.42-1.37-.47-2.43C2.01 15.06 2 14.72 2 12s.01-3.06.06-4.12c.05-1.06.22-1.79.47-2.43.26-.66.6-1.22 1.15-1.77A4.9 4.9 0 015.45 2.53c.64-.25 1.37-.42 2.43-.47C8.94 2.01 9.28 2 12 2zm0 1.8c-2.67 0-2.99.01-4.04.06-.87.04-1.34.18-1.65.3-.42.16-.71.35-1.02.66-.31.31-.5.6-.66 1.02-.12.31-.26.78-.3 1.65C4.28 8.51 4 8.83 4 10.2v3.6c0 1.37.01 3.06 1.65.99-.03 1.05-.06 1.37-.06 4.04 0s2.99-.01 4.04-.06c.87-.04 1.34-.18 1.65-.3.42-.16.71-.35 1.02-.66.31-.31.5-.6.66-1.02.12-.31.26-.78.3-1.65.05-1.05.06-1.37.06-4.04s-.01-2.99-.06-4.04c-.04-.87-.18-1.34-.3-1.65a2.7 2.7 0 00-.66-1.02 2.7 2.7 0 00-1.02-.66c-.31-.12-.78-.26-1.65-.3C14.99 3.81 14.67 3.8 12 3.8zm0 3.05a5.15 5.15 0 110 10.3 5.15 5.15 0 010-10.3zm0 1.8a3.35 3.35 0 100 6.7 3.35 3.35 0 000-6.7zm5.35-1.98a1.2 1.2 0 11-2.4 0 1.2 1.2 0 012.4 0z"/></svg>
    );
    case "Facebook": return (
      <svg {...common}><path d="M13.5 22v-8.5h2.85l.43-3.31H13.5V8.05c0-.96.27-1.61 1.64-1.61h1.75V3.48A23.4 23.4 0 0014.6 3.3c-2.5 0-4.21 1.53-4.21 4.32v2.4H7.53v3.31h2.86V22h3.11z"/></svg>
    );
    case "X": return (
      <svg {...common}><path d="M18.24 3h2.87l-6.27 7.17L22.2 21h-5.77l-4.52-5.9L6.72 21H3.85l6.7-7.66L2.7 3h5.92l4.08 5.39L18.24 3zm-1 16.3h1.59L7.85 4.6H6.14l11.1 14.7z"/></svg>
    );
    case "TikTok": return (
      <svg {...common}><path d="M16.6 2h-3.2v13.9a2.9 2.9 0 11-2.05-2.77V9.86a6.15 6.15 0 106.15 6.14V8.4a7.9 7.9 0 004.5 1.4V6.6a4.7 4.7 0 01-3.4-1.37A4.66 4.66 0 0116.6 2z"/></svg>
    );
    case "YouTube": return (
      <svg {...common}><path d="M22.5 12s0-3.28-.42-4.86a2.78 2.78 0 00-1.96-1.97C18.55 4.75 12 4.75 12 4.75s-6.55 0-8.12.42a2.78 2.78 0 00-1.96 1.97C1.5 8.72 1.5 12 1.5 12s0 3.28.42 4.86c.23.86.99 1.55 1.96 1.97 1.57.42 8.12.42 8.12.42s6.55 0 8.12-.42a2.78 2.78 0 001.96-1.97c.42-1.58.42-4.86.42-4.86zM9.9 15.3V8.7l5.7 3.3-5.7 3.3z"/></svg>
    );
    default: return null;
  }
}
const SOCIAL_LINKS = [
  { label:"Instagram", url:"https://instagram.com/ceylontrails" },
  { label:"Facebook",  url:"https://facebook.com/ceylontrails" },
  { label:"X",         url:"https://x.com/ceylontrails" },
  { label:"TikTok",    url:"https://tiktok.com/@ceylontrails" },
  { label:"YouTube",   url:"https://youtube.com/@ceylontrails" },
];

function ContactPage({ setPage }) {
  const [form, setForm] = useState({ name:"", email:"", subject:"", message:"" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const upd = (k,v) => setForm(f=>({...f,[k]:v}));

  const submit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Please fill in your name, email, and message.");
      return;
    }
    setError(""); setSending(true);
    try {
      await saveContactMessage(form);
      setSent(true);
      setForm({ name:"", email:"", subject:"", message:"" });
    } catch(e) { setError("Could not send your message: " + e.message); }
    setSending(false);
  };

  return (
    <div style={{ minHeight:"100vh", background:C.surface }}>
      <div style={{ background:`linear-gradient(135deg,${C.teal},#0B3A30)`, padding:"3.5rem 2rem 3rem", position:"relative", overflow:"hidden" }}>
        <HeroArt/>
        <div style={{ maxWidth:820, margin:"0 auto", position:"relative", zIndex:2, textAlign:"center" }}>
          <div style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,.6)", textTransform:"uppercase", letterSpacing:2, marginBottom:10 }}>Get in touch</div>
          <h1 style={{ fontFamily:serif, fontSize:"clamp(26px,4vw,40px)", fontWeight:700, color:"#fff", marginBottom:10 }}>Contact CeylonTrails</h1>
          <p style={{ fontSize:15, color:"rgba(255,255,255,.75)", maxWidth:520, margin:"0 auto" }}>Questions about a trip, a booking, or partnering with us as a guide — we'd love to hear from you.</p>
        </div>
      </div>

      <div style={{ maxWidth:1000, margin:"-2.5rem auto 4rem", padding:"0 1.5rem", position:"relative", zIndex:3 }}>
        <div className="info-2col" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>

          {/* Left: business info + map + social */}
          <div style={{ background:"#fff", borderRadius:20, border:`1px solid ${C.border}`, padding:"1.6rem", boxShadow:"0 4px 24px rgba(0,0,0,.06)" }}>
            <h3 style={{ fontFamily:serif, fontSize:18, fontWeight:700, color:C.ink, marginBottom:16 }}>Reach us directly</h3>
            {[
              [Mail, "Email", BUSINESS_INFO.email, `mailto:${BUSINESS_INFO.email}`],
              [Phone, "Phone", BUSINESS_INFO.phone, `tel:${BUSINESS_INFO.phone.replace(/\s/g,"")}`],
              [MapPin, "Address", BUSINESS_INFO.address, null],
              [Clock, "Hours", BUSINESS_INFO.hours, null],
            ].map(([Icon,label,val,href])=>(
              <div key={label} style={{ display:"flex", gap:12, marginBottom:14 }}>
                <span style={{ width:32, height:32, borderRadius:10, background:C.tealLight, color:C.teal, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><Icon size={16}/></span>
                <div>
                  <div style={{ fontSize:11, fontWeight:600, color:C.inkSoft, textTransform:"uppercase", letterSpacing:.6, marginBottom:2 }}>{label}</div>
                  {href
                    ? <a href={href} style={{ fontSize:14, fontWeight:600, color:C.teal, textDecoration:"none" }}>{val}</a>
                    : <div style={{ fontSize:14, fontWeight:600, color:C.ink }}>{val}</div>}
                </div>
              </div>
            ))}

            {/* Embedded location map — no API key needed for a basic embed */}
            <div style={{ borderRadius:14, overflow:"hidden", border:`1px solid ${C.border}`, marginTop:6, marginBottom:16 }}>
              <iframe
                title="CeylonTrails office location"
                src={`https://www.google.com/maps?q=${encodeURIComponent(BUSINESS_INFO.mapQuery)}&output=embed`}
                width="100%" height="220" style={{ border:0, display:"block" }} loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"/>
            </div>

            <div style={{ fontSize:11, fontWeight:600, color:C.inkSoft, textTransform:"uppercase", letterSpacing:.6, marginBottom:10 }}>Follow us</div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {SOCIAL_LINKS.map(s=>(
                <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer"
                  style={{ width:38, height:38, borderRadius:"50%", background:C.tealLight, display:"flex", alignItems:"center", justifyContent:"center", color:C.teal, textDecoration:"none", flexShrink:0 }}
                  title={s.label}><SocialGlyph name={s.label} size={16}/></a>
              ))}
            </div>
          </div>

          {/* Right: contact form */}
          <div style={{ background:"#fff", borderRadius:20, border:`1px solid ${C.border}`, padding:"1.6rem", boxShadow:"0 4px 24px rgba(0,0,0,.06)" }}>
            <h3 style={{ fontFamily:serif, fontSize:18, fontWeight:700, color:C.ink, marginBottom:16 }}>Send us a message</h3>
            {sent ? (
              <div style={{ textAlign:"center", padding:"2rem 0" }}>
                <div style={{ width:56, height:56, borderRadius:"50%", background:C.tealLight, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px", fontSize:24 }}>✅</div>
                <p style={{ fontSize:14, fontWeight:700, color:C.ink, marginBottom:6 }}>Message sent</p>
                <p style={{ fontSize:13, color:C.inkSoft, marginBottom:16 }}>Thanks for reaching out — our team will get back to you within 1–2 business days.</p>
                <Btn variant="outline" onClick={()=>setSent(false)}>Send another message</Btn>
              </div>
            ) : (
              <>
                {error && <div style={{ background:C.errorLight, color:C.error, borderRadius:10, padding:"10px 12px", fontSize:12, marginBottom:14 }}>{error}</div>}
                {[["Your name","name","text"],["Your email","email","email"],["Subject (optional)","subject","text"]].map(([label,key,type])=>(
                  <div key={key} style={{ marginBottom:12 }}>
                    <label style={{ fontSize:12, fontWeight:600, color:C.ink, display:"block", marginBottom:5 }}>{label}</label>
                    <input type={type} value={form[key]} onChange={e=>upd(key,e.target.value)}
                      style={{ width:"100%", padding:"10px 12px", border:`1.5px solid ${C.border}`, borderRadius:10, fontSize:13, fontFamily:sans, outline:"none", boxSizing:"border-box" }}/>
                  </div>
                ))}
                <div style={{ marginBottom:16 }}>
                  <label style={{ fontSize:12, fontWeight:600, color:C.ink, display:"block", marginBottom:5 }}>Message</label>
                  <textarea value={form.message} onChange={e=>upd("message",e.target.value)} rows={5}
                    style={{ width:"100%", padding:"10px 12px", border:`1.5px solid ${C.border}`, borderRadius:10, fontSize:13, fontFamily:sans, outline:"none", resize:"vertical", boxSizing:"border-box" }}/>
                </div>
                <Btn full onClick={submit} style={{ opacity: sending?.7:1 }}>{sending?"Sending…":"Send message"}</Btn>
              </>
            )}
          </div>
        </div>

        <div style={{ textAlign:"center", marginTop:24 }}>
          <button onClick={()=>setPage("home")} style={{ background:"none", border:"none", color:C.teal, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:sans }}>← Back to home</button>
        </div>
      </div>
    </div>
  );
}

// ─── ABOUT US ─────────────────────────────────────────────────────────────────
const ABOUT_STATS = [
  { icon:Globe2, label:"Destinations covered", value:"40+" },
  { icon:Users,  label:"SLTDA-certified guides", value:"50+" },
  { icon:Route,  label:"AI itineraries generated", value:"10,000+" },
  { icon:Award,  label:"Avg. traveller rating", value:"4.8/5" },
];
const ABOUT_FUNCTIONS = [
  { icon:Sparkles, title:"AI Journey Creator", desc:"A guided wizard turns your dates, budget, and interests into a real day-by-day Sri Lanka itinerary — named hotels, restaurants, and drive times, generated in seconds." },
  { icon:Compass,  title:"Certified Guide Marketplace", desc:"Browse SLTDA-verified local guides, share your itinerary, and collect competing price bids — you choose who takes you, with no obligation until you accept." },
  { icon:ShieldCheck, title:"Secure, Escrow-Style Booking", desc:"Payment is held safely and released to your guide in stages as the trip is mutually confirmed underway and completed — protecting both sides of every booking." },
  { icon:Star,     title:"Moderated Reviews", desc:"Every review is checked by our team before it's published to a guide's profile, keeping feedback genuine and trustworthy." },
];

function AboutPage({ setPage }) {
  return (
    <div style={{ minHeight:"100vh", background:C.surface }}>
      <div style={{ background:`linear-gradient(135deg,${C.teal},#0B3A30)`, padding:"3.5rem 2rem 3rem", position:"relative", overflow:"hidden" }}>
        <HeroArt/>
        <div style={{ maxWidth:820, margin:"0 auto", position:"relative", zIndex:2, textAlign:"center" }}>
          <div style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,.6)", textTransform:"uppercase", letterSpacing:2, marginBottom:10 }}>Our story</div>
          <h1 style={{ fontFamily:serif, fontSize:"clamp(26px,4vw,40px)", fontWeight:700, color:"#fff", marginBottom:10 }}>About CeylonTrails</h1>
          <p style={{ fontSize:15, color:"rgba(255,255,255,.75)", maxWidth:560, margin:"0 auto" }}>We built CeylonTrails to make planning a trip to Sri Lanka as thoughtful as the island itself — part AI-crafted itinerary, part real local expertise.</p>
        </div>
      </div>

      <div style={{ maxWidth:900, margin:"0 auto", padding:"3rem 1.5rem 4rem" }}>
        <div style={{ marginBottom:40 }}>
          <h2 style={{ fontFamily:serif, fontSize:24, fontWeight:700, color:C.ink, marginBottom:14 }}>Our mission</h2>
          <p style={{ fontSize:14, color:C.inkSoft, lineHeight:1.8, marginBottom:12 }}>
            Sri Lanka rewards travellers who go beyond the postcard stops — but researching real routes, honest drive times, and trustworthy local guides usually takes weeks. CeylonTrails compresses that into a few minutes: answer a short set of questions and our planner builds a realistic, day-by-day route, then connects you directly with SLTDA-certified guides who can bring it to life.
          </p>
          <p style={{ fontSize:14, color:C.inkSoft, lineHeight:1.8 }}>
            We're a small, Colombo-based team of travel planners and engineers who believe technology should make local tourism more accessible for visitors, and more sustainable and fairly paid for the guides and small businesses who depend on it.
          </p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:14, marginBottom:44 }}>
          {ABOUT_STATS.map(s=>(
            <div key={s.label} style={{ background:"#fff", border:`1px solid ${C.border}`, borderRadius:16, padding:"1.2rem", textAlign:"center" }}>
              <div style={{ width:40, height:40, borderRadius:12, background:C.tealLight, color:C.teal, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 10px" }}><s.icon size={19}/></div>
              <div style={{ fontFamily:serif, fontSize:22, fontWeight:700, color:C.ink }}>{s.value}</div>
              <div style={{ fontSize:12, color:C.inkSoft, marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <h2 style={{ fontFamily:serif, fontSize:24, fontWeight:700, color:C.ink, marginBottom:18 }}>What we do</h2>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:44 }} className="info-2col">
          {ABOUT_FUNCTIONS.map(f=>(
            <div key={f.title} style={{ background:"#fff", border:`1px solid ${C.border}`, borderRadius:16, padding:"1.4rem" }}>
              <div style={{ width:38, height:38, borderRadius:11, background:C.tealLight, color:C.teal, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:12 }}><f.icon size={18}/></div>
              <div style={{ fontSize:14, fontWeight:700, color:C.ink, marginBottom:6 }}>{f.title}</div>
              <div style={{ fontSize:13, color:C.inkSoft, lineHeight:1.7 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        <div style={{ background:"#fff", border:`1px solid ${C.border}`, borderRadius:16, padding:"1.6rem", marginBottom:32 }}>
          <h3 style={{ fontFamily:serif, fontSize:18, fontWeight:700, color:C.ink, marginBottom:10 }}>Responsible tourism</h3>
          <p style={{ fontSize:13, color:C.inkSoft, lineHeight:1.8 }}>We only list guides who hold current SLTDA certification, and guides keep 85% of every booking — CeylonTrails' commission funds the platform, not the other way around. We encourage itineraries that support local restaurants, homestays, and small operators over large chains wherever the trip allows it.</p>
        </div>

        <div style={{ textAlign:"center" }}>
          <Btn onClick={()=>setPage("journey")}>✨ Start planning your trip</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── LEGAL PAGES (Privacy Policy / Terms of Service) ─────────────────────────
const LEGAL_LAST_UPDATED = "1 July 2026";

function LegalPageLayout({ title, setPage, children }) {
  return (
    <div style={{ minHeight:"100vh", background:C.surface }}>
      <div style={{ background:`linear-gradient(135deg,${C.teal},#0B3A30)`, padding:"2.6rem 2rem" }}>
        <div style={{ maxWidth:780, margin:"0 auto" }}>
          <div style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,.6)", textTransform:"uppercase", letterSpacing:2, marginBottom:8 }}>Legal</div>
          <h1 style={{ fontFamily:serif, fontSize:"clamp(22px,3.4vw,32px)", fontWeight:700, color:"#fff", marginBottom:6 }}>{title}</h1>
          <p style={{ fontSize:13, color:"rgba(255,255,255,.6)" }}>Last updated: {LEGAL_LAST_UPDATED}</p>
        </div>
      </div>
      <div style={{ maxWidth:780, margin:"0 auto", padding:"2.5rem 1.5rem 4rem" }}>
        <div style={{ background:"#fff", border:`1px solid ${C.border}`, borderRadius:16, padding:"1.8rem 2rem" }}>
          {children}
        </div>
        <div style={{ textAlign:"center", marginTop:24 }}>
          <button onClick={()=>setPage("home")} style={{ background:"none", border:"none", color:C.teal, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:sans }}>← Back to home</button>
        </div>
      </div>
    </div>
  );
}

function LegalSection({ n, title, children }) {
  return (
    <div style={{ marginBottom:22 }}>
      <h3 style={{ fontSize:15, fontWeight:700, color:C.ink, marginBottom:8 }}>{n}. {title}</h3>
      <div style={{ fontSize:13.5, color:C.inkSoft, lineHeight:1.8 }}>{children}</div>
    </div>
  );
}

function PrivacyPolicyPage({ setPage }) {
  return (
    <LegalPageLayout title="Privacy Policy" setPage={setPage}>
      <p style={{ fontSize:13.5, color:C.inkSoft, lineHeight:1.8, marginBottom:20 }}>
        CeylonTrails ("we", "us", "our") respects your privacy. This policy explains what information we collect when you use our website and app, how we use it, and the choices you have.
      </p>
      <LegalSection n="1" title="Information we collect">
        Account details you provide (name, email) when you sign in with email or Google; itinerary preferences you enter in the trip planner (dates, budget, activities); booking and payment details when you request or confirm a guide; messages sent through in-app chat; and reviews you submit about guides.
      </LegalSection>
      <LegalSection n="2" title="How we use your information">
        To generate your itinerary, connect you with guides you choose to contact, process bookings and payments, send booking-related notifications, moderate reviews before publishing them, and improve the reliability of our AI trip planner.
      </LegalSection>
      <LegalSection n="3" title="Sharing with guides">
        When you send a trip request to a guide, we share the itinerary details and the contact information necessary for them to respond and, if you proceed, to guide your trip. We do not share your details with any guide you have not contacted.
      </LegalSection>
      <LegalSection n="4" title="Payment information">
        Payments are processed through our payment provider; CeylonTrails does not store your full card details on our servers. Booking amounts and commission splits are recorded to manage escrow-style release of guide payments.
      </LegalSection>
      <LegalSection n="5" title="Data retention">
        We retain booking records for as long as needed for support, dispute resolution, and legal requirements. You may request deletion of your account data by contacting us, subject to records we must keep for bookings already completed.
      </LegalSection>
      <LegalSection n="6" title="Your choices">
        You can update your profile details at any time, remove a trip request from your own view, and control which language and notifications you receive. Contact us to request a copy of the data we hold about you.
      </LegalSection>
      <LegalSection n="7" title="Contact">
        Questions about this policy can be sent to {BUSINESS_INFO.email}.
      </LegalSection>
    </LegalPageLayout>
  );
}

function TermsPage({ setPage }) {
  return (
    <LegalPageLayout title="Terms of Service" setPage={setPage}>
      <p style={{ fontSize:13.5, color:C.inkSoft, lineHeight:1.8, marginBottom:20 }}>
        These terms govern your use of CeylonTrails. By creating an account or booking a guide through our platform, you agree to them.
      </p>
      <LegalSection n="1" title="Guide verification">
        All guides listed on CeylonTrails are SLTDA-verified. We review certification documents before approving a guide profile, but CeylonTrails is a booking intermediary, not the guide's employer.
      </LegalSection>
      <LegalSection n="2" title="Booking and payment">
        Payments are processed through CeylonTrails. A 15% commission applies to guide bookings, with no hidden fees charged to tourists. Guides respond to trip requests with bids; there is no obligation to accept any bid you receive.
      </LegalSection>
      <LegalSection n="3" title="Escrow release">
        On acceptance, 30% of the guide's share is released immediately and 70% is held until both the tourist and guide mutually confirm the trip took place. This protects both parties from no-shows or disputes.
      </LegalSection>
      <LegalSection n="4" title="Cancellations">
        Cancellations made 48+ hours before the trip start date receive a full refund. Cancellations within 48 hours may be subject to a 25% fee to compensate the guide's reserved time.
      </LegalSection>
      <LegalSection n="5" title="Reviews">
        Reviews must reflect a genuine completed trip. All reviews are moderated by CeylonTrails before publishing. Fraudulent, defamatory, or fabricated reviews will be removed and may result in account suspension.
      </LegalSection>
      <LegalSection n="6" title="Liability">
        CeylonTrails is an intermediary connecting tourists and independent local guides. Guides are required to carry SLTDA-mandated insurance; CeylonTrails is not liable for the conduct of independent guides beyond the verification and moderation steps described in these terms.
      </LegalSection>
      <LegalSection n="7" title="Changes to these terms">
        We may update these terms from time to time; the "last updated" date at the top of this page will reflect the latest revision. Continued use of CeylonTrails after a change constitutes acceptance of the updated terms.
      </LegalSection>
      <LegalSection n="8" title="Contact">
        Questions about these terms can be sent to {BUSINESS_INFO.email}.
      </LegalSection>
    </LegalPageLayout>
  );
}

// Maps in-app page names to URL paths and back, so refreshing or sharing a
// direct link (e.g. /destinations, /journey) lands on the right page instead
// of always resetting to Home.
const PAGE_ROUTES = {
  home:"/", destinations:"/destinations", journey:"/journey", srilankamap:"/map",
  guideportal:"/guides/portal", myitineraries:"/my-trips", contact:"/contact",
  about:"/about", privacy:"/privacy", terms:"/terms",
};
const ROUTE_PAGES = Object.fromEntries(Object.entries(PAGE_ROUTES).map(([k,v])=>[v,k]));

function getPageFromUrl() {
  const path = window.location.pathname;
  return ROUTE_PAGES[path] || "home";
}

export default function App() {
  const [page, _setPage]        = useState(()=>getPageFromUrl());
  const [guideOpen, setGuide]   = useState(false);
  const [savedItin, setSaved]   = useState(null);
  const [showLogin, setLogin]   = useState(false);
  const [loginIntent, setLoginIntent] = useState("tourist"); // "tourist" | "guide" — which sign-in flow to show
  const [showWelcome, setWelcome] = useState(false);
  const [welcomeUser, setWelcomeUser] = useState(null);
  const openGuide = useCallback(()=>setGuide(true), []);
  const wishlist  = useWishlist();

  // Same account, switchable view — like Airbnb's "switch to hosting". Not a
  // permanent account type: any signed-in user can flip between browsing as
  // a tourist and managing bookings as a guide. Persisted so a refresh
  // doesn't dump a guide back into tourist-facing nav mid-shift.
  const [viewMode, _setViewMode] = useState(()=>localStorage.getItem("ct_viewmode") || "tourist");
  const setViewMode = useCallback((mode) => {
    _setViewMode(mode);
    localStorage.setItem("ct_viewmode", mode);
  }, []);

  // Wraps setPage so every in-app navigation also pushes a real URL —
  // enables working back/forward buttons, refresh-stays-on-page, and
  // shareable direct links to any section of the site.
  const setPage = useCallback((next) => {
    _setPage(next);
    const path = PAGE_ROUTES[next] || "/";
    if (window.location.pathname !== path) {
      window.history.pushState({ page: next }, "", path + window.location.search);
    }
  }, []);

  useEffect(()=>{
    const onPopState = (e) => {
      // Browser back/forward — read the page from the URL rather than from state
      _setPage(e.state?.page || getPageFromUrl());
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  },[]);

  const handleLoginSuccess = (user) => {
    setLogin(false);
    setWelcomeUser(user);
    setWelcome(true);
    if (loginIntent === "guide") {
      setViewMode("guide");
      setPage("guideportal");
    }
  };

  return (
    <LangProvider>
      <AuthProvider>
        <AppInner
          page={page} setPage={setPage}
          guideOpen={guideOpen} setGuide={setGuide} openGuide={openGuide}
          savedItin={savedItin} setSaved={setSaved}
          showLogin={showLogin} setLogin={setLogin}
          loginIntent={loginIntent} setLoginIntent={setLoginIntent}
          viewMode={viewMode} setViewMode={setViewMode}
          showWelcome={showWelcome} setWelcome={setWelcome}
          welcomeUser={welcomeUser} setWelcomeUser={setWelcomeUser}
          handleLoginSuccess={handleLoginSuccess}
          wishlist={wishlist}
      />
      </AuthProvider>
    </LangProvider>
  );
}

// ─── MY ITINERARIES PAGE (view saved trips later) ────────────────────────────
function MyItinerariesPage({ user, setPage, setSavedItin, onLoginNeeded }) {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(()=>{
    if (!user) { setLoading(false); return; }
    const load = async () => {
      try {
        if (!window.firebase?.firestore) await loadScript("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js");
        const r = await loadUserItineraries(user.uid);
        setItems(r);
      } catch(e) { console.error(e); }
      setLoading(false);
    };
    load();
  },[user]);

  const handleDelete = async (docId) => {
    if (!window.confirm("Delete this saved itinerary? This can't be undone.")) return;
    setDeleting(docId);
    try {
      await deleteUserItinerary(docId);
      setItems(its=>its.filter(i=>i.id!==docId));
    } catch(e) { alert("Could not delete: " + e.message); }
    setDeleting(null);
  };

  const handleView = (item) => {
    setSavedItin(item.itin);
    setPage("journey");
  };

  if (!user) return (
    <div style={{ minHeight:"70vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16, padding:"2rem", textAlign:"center" }}>
      <div style={{ fontSize:48 }}>🔒</div>
      <h2 style={{ fontFamily:serif, fontSize:22, fontWeight:700, color:C.ink }}>Sign in to view your saved trips</h2>
      <Btn onClick={onLoginNeeded}>Sign in →</Btn>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:C.surface }}>
      <div style={{ background:`linear-gradient(135deg,${C.teal},#0B3A30)`, padding:"2.5rem 2rem" }}>
        <div style={{ maxWidth:900, margin:"0 auto" }}>
          <div style={{ fontSize:11, color:"rgba(255,255,255,.6)", textTransform:"uppercase", letterSpacing:2, marginBottom:8 }}>Your trips</div>
          <h1 style={{ fontFamily:serif, fontSize:"clamp(24px,4vw,38px)", fontWeight:700, color:"#fff" }}>💾 My Itineraries</h1>
          <p style={{ fontSize:14, color:"rgba(255,255,255,.75)", marginTop:8 }}>All your saved trip plans in one place</p>
        </div>
      </div>

      <div style={{ maxWidth:900, margin:"0 auto", padding:"2rem" }}>
        {loading && (
          <div style={{ textAlign:"center", padding:"4rem" }}>
            <div style={{ width:40, height:40, border:`3px solid ${C.tealLight}`, borderTopColor:C.teal, borderRadius:"50%", animation:"spin .8s linear infinite", margin:"0 auto 14px" }}/>
            <p style={{ fontSize:13, color:C.inkSoft }}>Loading your saved trips…</p>
          </div>
        )}
        {!loading && items.length===0 && (
          <div style={{ textAlign:"center", padding:"4rem 2rem" }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🗺️</div>
            <h3 style={{ fontFamily:serif, fontSize:18, fontWeight:700, color:C.ink, marginBottom:8 }}>No saved itineraries yet</h3>
            <p style={{ fontSize:13, color:C.inkSoft, marginBottom:20 }}>Plan a trip and tap "💾 Save for later" to see it here.</p>
            <Btn onClick={()=>setPage("journey")}>✨ Plan a trip →</Btn>
          </div>
        )}
        <div style={{ display:"grid", gridTemplateColumns:"1fr", gap:14 }}>
          {items.map(item=>(
            <div key={item.id} style={{ background:"#fff", border:`1.5px solid ${C.border}`, borderRadius:18, padding:"1.4rem", display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:14 }}>
              <div style={{ flex:1, minWidth:220 }}>
                <h3 style={{ fontFamily:serif, fontSize:18, fontWeight:700, color:C.ink, marginBottom:4 }}>{item.itin?.title||"Untitled trip"}</h3>
                <p style={{ fontSize:13, color:C.inkSoft, marginBottom:8 }}>{item.itin?.tagline}</p>
                <div style={{ display:"flex", gap:12, flexWrap:"wrap", fontSize:11, color:C.inkSoft }}>
                  <span>📅 Saved {new Date(item.savedAt).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}</span>
                  <span>🗓️ {item.itin?.days?.length||0} days</span>
                  {item.itin?.tripMeta?.startLocation && <span>📍 From {item.itin.tripMeta.startLocation}</span>}
                </div>
              </div>
              <div style={{ display:"flex", gap:8, flexShrink:0 }}>
                <Btn onClick={()=>handleView(item)}>View →</Btn>
                <button onClick={()=>handleDelete(item.id)} disabled={deleting===item.id} style={{ padding:"11px 16px", background:"none", border:`1.5px solid ${C.coral}`, color:C.coral, borderRadius:11, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:sans, opacity:deleting===item.id?.5:1 }}>
                  {deleting===item.id?"…":"🗑️"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SHARED ITINERARY PAGE (public, read-only, no login needed) ─────────────
function SharedItineraryPage({ shareId, onGoHome }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(()=>{
    const load = async () => {
      try {
        if (!window.firebase?.firestore) await loadScript("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js");
        const result = await loadSharedItinerary(shareId);
        if (!result) { setNotFound(true); setLoading(false); return; }
        setData(result);
      } catch(e) { setNotFound(true); }
      setLoading(false);
    };
    load();
  },[shareId]);

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16 }}>
      <div style={{ width:48, height:48, border:`3px solid ${C.tealLight}`, borderTopColor:C.teal, borderRadius:"50%", animation:"spin .8s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p style={{ fontSize:14, color:C.inkSoft, fontFamily:sans }}>Loading shared itinerary…</p>
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16, padding:"2rem", textAlign:"center" }}>
      <div style={{ fontSize:48 }}>🔍</div>
      <h2 style={{ fontFamily:serif, fontSize:22, fontWeight:700, color:C.ink }}>This itinerary link wasn't found</h2>
      <p style={{ fontSize:13, color:C.inkSoft, maxWidth:380 }}>It may have been removed, or the link is incomplete.</p>
      <Btn onClick={onGoHome}>Go to CeylonTrails →</Btn>
    </div>
  );

  const itin = data.itin;

  return (
    <div style={{ minHeight:"100vh", background:C.surface, fontFamily:sans }}>
      <div style={{ background:`linear-gradient(135deg,${C.teal},#0B3A30)`, padding:"1.2rem 1.5rem" }}>
        <div style={{ maxWidth:820, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div onClick={onGoHome} style={{ cursor:"pointer", fontFamily:serif, fontSize:18, fontWeight:700, color:"#fff" }}>
            Ceylon<span style={{ color:C.amberMid }}>Trails</span>
          </div>
          <span style={{ fontSize:11, color:"rgba(255,255,255,.7)", padding:"4px 12px", background:"rgba(255,255,255,.12)", borderRadius:20 }}>👁️ Shared itinerary — view only</span>
        </div>
      </div>

      <div style={{ background:`linear-gradient(135deg,${C.teal},#0B3A30)`, padding:"2.5rem 2rem" }}>
        <div style={{ maxWidth:820, margin:"0 auto" }}>
          <h1 style={{ fontFamily:serif, fontSize:"clamp(24px,4vw,38px)", fontWeight:700, color:"#fff", marginBottom:8 }}>🗺️ {itin.title}</h1>
          <p style={{ fontSize:14, color:"rgba(255,255,255,.8)", marginBottom:14 }}>{itin.tagline}</p>
          {itin.tripMeta && (
            <div style={{ display:"flex", gap:16, flexWrap:"wrap", fontSize:12, color:"rgba(255,255,255,.75)" }}>
              {itin.tripMeta.startDate && <span>📅 {new Date(itin.tripMeta.startDate).toLocaleDateString("en-GB",{day:"numeric",month:"short"})} → {itin.tripMeta.endDate?new Date(itin.tripMeta.endDate).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}):""}</span>}
              {itin.tripMeta.startLocation && <span>📍 From {itin.tripMeta.startLocation}</span>}
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth:820, margin:"0 auto", padding:"2rem" }}>
        {itin.hotel && (
          <div style={{ display:"flex", alignItems:"center", gap:10, background:"#fff", border:`1.5px solid ${C.border}`, borderRadius:12, padding:"12px 16px", marginBottom:20 }}>
            <span style={{ fontSize:22 }}>🏨</span>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:C.ink }}>{itin.hotel.name}</div>
              <div style={{ fontSize:11, color:C.inkSoft }}>{"★".repeat(itin.hotel.stars||3)} · {itin.hotel.area}</div>
            </div>
          </div>
        )}

        {(itin.days||[]).map(d=>(
          <div key={d.day} style={{ border:`1.5px solid ${C.border}`, borderRadius:16, overflow:"hidden", background:C.white, marginBottom:16, boxShadow:"0 2px 12px rgba(0,0,0,.04)" }}>
            <div style={{ padding:"14px 20px", background:`linear-gradient(135deg,#0E4A3D,#0B3A30)`, display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ background:"rgba(255,255,255,.2)", color:"#fff", fontSize:11, fontWeight:700, padding:"4px 12px", borderRadius:20 }}>Day {d.day}</span>
              <span style={{ fontSize:15, fontWeight:700, color:"#fff", fontFamily:serif }}>{d.location}</span>
              <span style={{ fontSize:12, color:"rgba(255,255,255,.75)", marginLeft:"auto" }}>— {d.theme}</span>
            </div>
            <div style={{ padding:"6px 20px 10px" }}>
              {(d.activities||[]).map((a,i)=><ActivityRow key={i} act={a} isLast={i===d.activities.length-1}/>)}
            </div>
          </div>
        ))}

        <div style={{ marginTop:"2rem", background:"linear-gradient(135deg,#F1ECE0,#FFF7E6)", border:"1.5px solid #DFCBA0", borderRadius:20, padding:"2rem", textAlign:"center" }}>
          <h3 style={{ fontFamily:serif, fontSize:18, fontWeight:700, color:C.ink, marginBottom:8 }}>Want to plan your own Sri Lanka trip?</h3>
          <p style={{ fontSize:13, color:C.inkSoft, marginBottom:16 }}>Create a free AI-powered itinerary in minutes, just like this one.</p>
          <Btn variant="amber" onClick={onGoHome}>✨ Plan my own trip on CeylonTrails →</Btn>
        </div>
      </div>
    </div>
  );
}

function AppInner({ page, setPage, guideOpen, setGuide, openGuide, savedItin, setSaved, showLogin, setLogin, loginIntent, setLoginIntent, viewMode, setViewMode, showWelcome, setWelcome, welcomeUser, handleLoginSuccess, wishlist }) {
  const { user, signOut } = useAuth();
  const premium = usePremium();
  const [showAdmin,  setShowAdmin]  = useState(()=>window.location.search.includes("admin"));
  const [showReview, setShowReview] = useState(false);
  const [reviewPrefill, setReviewPrefill] = useState(null);
  const [shareId] = useState(()=>new URLSearchParams(window.location.search).get("share"));

  useEffect(()=>{
    const check = () => setShowAdmin(window.location.search.includes("admin"));
    window.addEventListener("popstate", check);
    return ()=>window.removeEventListener("popstate", check);
  },[]);

  // Shared itinerary links take over the whole page — no nav, no login wall
  if (shareId) {
    return <SharedItineraryPage shareId={shareId} onGoHome={()=>{ window.history.replaceState({},"",window.location.pathname); window.location.reload(); }}/>;
  }

  const openSignIn = (intent) => {
    if (intent === "guide") {
      // Guides authenticate through their own embedded form on the Guide
      // Portal page rather than the generic modal — jumping straight there
      // is what makes "sign in as guide" feel like a real, direct path.
      setViewMode("guide");
      setPage("guideportal");
    } else {
      setLoginIntent("tourist");
      setLogin(true);
    }
  };

  return (
    <div style={{ fontFamily:sans, color:C.ink, background:C.white, minHeight:"100vh" }}>
      <MobileStyles/>
      <NavWithAuth page={page} setPage={setPage} onGuideOpen={openGuide} user={user} signOut={signOut} onSignInClick={openSignIn} viewMode={viewMode} setViewMode={setViewMode}/>

      {page==="home"         && <HomePage         setPage={setPage} onGuideOpen={openGuide}/>}
      {page==="destinations" && <DestinationsPage setPage={setPage} onGuideOpen={openGuide} savedItin={savedItin} setSavedItin={setSaved}/>}
      {page==="journey"      && <JourneyPage      setPage={setPage} savedItin={savedItin} setSavedItin={setSaved} onGuideOpen={openGuide} user={user} onLoginNeeded={()=>openSignIn("tourist")} premium={premium}/>}
      {page==="srilankamap" && <SriLankaMapPage  setPage={setPage} savedItin={savedItin} setSavedItin={setSaved}/>}
      {page==="guideportal"  && <GuidePortalPage  setPage={setPage} setViewMode={setViewMode}/>}
      {page==="myitineraries" && <MyItinerariesPage user={user} setPage={setPage} setSavedItin={setSaved} onLoginNeeded={()=>openSignIn("tourist")}/>}
      {page==="contact"       && <ContactPage setPage={setPage}/>}
      {page==="about"         && <AboutPage setPage={setPage}/>}
      {page==="privacy"       && <PrivacyPolicyPage setPage={setPage}/>}
      {page==="terms"         && <TermsPage setPage={setPage}/>}

      <GuideDrawer open={guideOpen} onClose={()=>setGuide(false)} itin={savedItin} user={user} onLoginNeeded={()=>openSignIn("tourist")} onReviewGuide={(prefill)=>{ setReviewPrefill(prefill); setShowReview(true); }}/>
      <WishlistPanel wishlist={wishlist} savedItin={savedItin} setSavedItin={setSaved}/>
      <EmergencyButton/>

      {showLogin  && <LoginModal onClose={()=>setLogin(false)} onSuccess={handleLoginSuccess}/>}
      {showWelcome && <WelcomeToast user={welcomeUser} onDone={()=>setWelcome(false)}/>}
      {showReview && <GuideReviewModal onClose={()=>setShowReview(false)} user={user} prefill={reviewPrefill}/>}
      {showAdmin  && <AdminPanel onClose={()=>{ setShowAdmin(false); window.history.replaceState({},"",window.location.pathname); }}/>}
    </div>
  );
}
