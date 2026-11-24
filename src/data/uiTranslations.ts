/**
 * Instant 0ms bidirectional dictionary for recurring UI labels, navigation,
 * section headers, buttons, moods, and metadata across the entire archive.
 * Remaining unique literary prose/poems are batched in fast /api/translate calls
 * and cached in localStorage.
 */
const PAIRS: [string, string][] = [
  // Header & Navigation
  ['Library', 'पुस्तकालय'],
  ['Poetry', 'कविता'],
  ['Stories', 'कहानियाँ'],
  ['Theatre', 'रंगमंच'],
  ['Rooms', 'कक्ष'],
  ['Search', 'खोजें'],
  ['Search books, poems, stories, and notes', 'किताबें, कविताएँ, कहानियाँ और नोट्स खोजें'],
  ['Literary Rooms', 'साहित्यिक कक्ष'],
  ['The Library', 'पुस्तकालय'],
  ['Novels & preserved editions', 'उपन्यास और संरक्षित संस्करण'],
  ['Novels, plays & preserved editions', 'उपन्यास, नाटक और संरक्षित संस्करण'],
  ['The Poetry Room', 'कविता कक्ष'],
  ['Poetry Room', 'कविता कक्ष'],
  ['Marathi · Hindi · English anthology', 'मराठी · हिंदी · अंग्रेज़ी काव्य संग्रह'],
  ['Story Archives', 'कथा अभिलेखागार'],
  ['Chapters & character dossiers', 'अध्याय और पात्र विवरण'],
  ['Chapters & Character Dossiers', 'अध्याय और पात्र विवरण'],
  ['The Theatre', 'रंगमंच'],
  ['Three-act Marathi stage script', 'तीन अंकों का मराठी मंच नाटक'],
  ['तीन अंकी मराठी नाटक', 'तीन अंकों का मराठी नाटक'],
  ['Unsaid Journal', 'अनकही डायरी'],
  ['Prefaces & author notes', 'प्रस्तावना और लेखक के नोट्स'],
  ['Prefaces & author reflections', 'प्रस्तावना और लेखक के विचार'],
  ['Midnight Page', 'मिडनाइट पेज'],
  ['The Midnight Page', 'मिडनाइट पेज'],
  ['Nocturnal excerpts', 'चुनिंदा अंश'],
  ['Selected excerpts', 'चुनिंदा अंश'],
  ['Rotating manuscript excerpts', 'चुनिंदा पांडुलिपि अंश'],
  ['Choose Your Mood', 'अपना मूड चुनें'],
  ['Emotion-first discovery', 'भावनाओं के अनुसार खोज'],
  ['Browse by emotion', 'भावनाओं के अनुसार खोज'],
  ['Discover works by emotion', 'भावनाओं के अनुसार रचनाएँ खोजें'],
  ['My Bookshelf', 'मेरी किताबों की अलमारी'],
  ['Favourites & progress', 'पसंदीदा और पठन प्रगति'],
  ['Saved favourites & reading memory', 'सहेजी गई रचनाएँ और पठन स्मृति'],
  ["Author's Archive", 'लेखक का अभिलेखागार'],
  ['Biography, timeline & bibliography', 'जीवनी, समयरेखा और ग्रंथसूची'],
  ['About the Author', 'लेखक के बारे में'],
  ['Orig', 'मूल'],
  ['Original', 'मूल'],

  // Common Buttons & Reader Chrome
  ['Explore Books', 'किताबें देखें'],
  ['Explore The Library', 'पुस्तकालय देखें'],
  ['Meet the Author', 'लेखक से मिलें'],
  ['Enter Poetry', 'कविता कक्ष में जाएँ'],
  ['Featured Edition', 'प्रमुख संस्करण'],
  ['Open Publication', 'प्रकाशन खोलें'],
  ['Read Online', 'ऑनलाइन पढ़ें'],
  ['Read Full Poem', 'पूरी कविता पढ़ें'],
  ['Book Details →', 'पुस्तक विवरण →'],
  ['Full Biography →', 'पूरी जीवनी →'],
  ['Details', 'विवरण'],
  ['Read in Context', 'पूरा संदर्भ पढ़ें'],
  ['Read Note', 'नोट पढ़ें'],
  ['Continue Reading', 'पढ़ना जारी रखें'],
  ['Previous', 'पिछला'],
  ['Next', 'अगला'],
  ['Another Page', 'कोई और पृष्ठ'],
  ['Back to Original', 'मूल पाठ पर लौटें'],
  ['Back to Library', 'पुस्तकालय पर लौटें'],
  ['Back to Poetry Room', 'कविता कक्ष पर लौटें'],
  ['Back to Journal', 'डायरी पर लौटें'],
  ['All Highlights', 'सभी हाइलाइट्स'],
  ['Highlight Key Line', 'मुख्य पंक्ति हाइलाइट करें'],
  ['Key Line Highlighted', 'मुख्य पंक्ति हाइलाइटेड'],
  ['Open Hardcover Book', 'हार्डकवर पुस्तक खोलें'],
  ['Open Midnight Page →', 'मिडनाइट पेज खोलें →'],
  ['Open in Original Publication', 'मूल प्रकाशन में खोलें'],
  ['Open Mood Explorer →', 'मूड एक्सप्लोरर खोलें →'],
  ['Explore This Mood →', 'इस मूड को देखें →'],
  ['Read All Notes →', 'सभी नोट्स पढ़ें →'],
  ['Explore Story Archives', 'कथा अभिलेखागार देखें'],
  ['Enter The Theatre', 'रंगमंच में प्रवेश करें'],
  ['Reading Shield Active', 'रीडिंग शील्ड सक्रिय'],
  ['Daylight', 'डेलाइट'],
  ['Warm Paper', 'वॉर्म पेपर'],
  ['Sepia', 'सीपिया'],
  ['Midnight', 'मिडनाइट'],
  ['Bookmark', 'बुकमार्क'],
  ['Saved', 'सहेजा गया'],
  ['All', 'सभी'],
  ['Books', 'किताबें'],
  ['Journal', 'डायरी'],
  ['Author', 'लेखक'],
  ['Pages', 'पृष्ठ'],
  ['Language', 'भाषा'],
  ['Genre', 'शैली'],

  // Hero & Home Sections
  ['Some feelings leave.', 'कुछ एहसास चले जाते हैं।'],
  ['The words stay.', 'शब्द ठहर जाते हैं।'],
  ['Some feelings leave. The words stay.', 'कुछ एहसास चले जाते हैं। शब्द ठहर जाते हैं।'],
  ['Published Editions', 'प्रकाशित संस्करण'],
  ['Books & Editions', 'किताबें और संस्करण'],
  ['Preserved Pages', 'संरक्षित पृष्ठ'],
  ['Verbatim Poems', 'मूल कविताएँ'],
  ['Poems', 'कविताएँ'],
  ['Primary Languages', 'मुख्य भाषाएँ'],
  ['Languages', 'भाषाएँ'],
  ['The Library · Selected Catalogue', 'पुस्तकालय · चुनिंदा सूची'],
  ['Digital Library', 'डिजिटल पुस्तकालय'],
  ['Featured Publications', 'प्रमुख प्रकाशन'],
  ['Featured Literary Works', 'प्रमुख साहित्यिक कृतियाँ'],
  ['Explore All Works', 'सभी रचनाएँ देखें'],
  ['Published Works', 'प्रकाशित कृतियाँ'],
  ['Selected Poems', 'चुनिंदा कविताएँ'],
  ['The Poetry Room · Featured Verse', 'कविता कक्ष · प्रमुख रचना'],
  ['Companion Melody', 'सहयोगी धुन'],
  ['Story Archives · Fiction & Thrillers', 'कथा अभिलेखागार · कथा और थ्रिलर'],
  ['Discover by Emotion', 'भावना के अनुसार खोजें'],
  ['By Mood', 'मूड के अनुसार'],
  ['Preserved Spotlight Lines', 'संरक्षित विशेष पंक्तियाँ'],
  ['All Excerpts', 'सभी अंश'],
  ["Author's Notes & Prefaces", 'लेखक के नोट्स और प्रस्तावना'],
  ['Complete Literary Index', 'संपूर्ण साहित्यिक अनुक्रमणिका'],
  ['Rooms & Archives', 'कक्ष और अभिलेखागार'],
  ['10 Rooms', '10 कक्ष'],
  ['I · The Library', 'I · पुस्तकालय'],
  ['II · About the Author', 'II · लेखक के बारे में'],
  ['III · The Poetry Room', 'III · कविता कक्ष'],
  ['IV · The Theatre · तीन अंकी मराठी नाटक', 'IV · रंगमंच · तीन अंकों का मराठी नाटक'],
  ['V · Story Archives · Fiction & Thrillers', 'V · कथा अभिलेखागार · कथा और थ्रिलर'],
  ['Tejas Purvesh Phirake', 'तेजस पुर्वेश फिरके'],

  // Mood Titles & Labels (exact match with moodCatalog.ts)
  ['Longing & Separation', 'विरह और जुदाई'],
  ['Unspoken Love', 'अनकहा प्रेम'],
  ['Mystery & Hidden Truths', 'रहस्य और छिपा सच'],
  ['Self-Discovery & Questions', 'आत्मशोध और प्रश्न'],
  ['Memories & Home', 'यादें और घर'],
  ['Grace, Love & Wonder', 'सौंदर्य, प्रेम और विस्मय'],
  ['Moonlight & Nature', 'चाँदनी और प्रकृति'],
  ['Unsaid Feelings', 'अनकही भावनाएँ'],

  // UNDEFINED Archive
  ['An Archive of Unresolved Moments.', 'अनसुलझे क्षणों का अभिलेखागार।'],
  ['An archive of unresolved moments', 'अनसुलझे क्षणों का अभिलेखागार'],
  ['The First Writing Day', 'लेखन का पहला दिन'],
  ['The Undefined Index', 'अपरिभाषित अनुक्रमणिका'],
  ['Return to Archive', 'अभिलेखागार पर लौटें'],
  ['Read Preserved Text', 'संरक्षित पाठ पढ़ें'],
  ['Conceal Text', 'पाठ छिपाएँ'],
  ['Reveal All', 'सभी खोलें'],
  ['Seal All', 'सभी बंद करें'],
  ['First poem', 'पहली कविता'],
  ['Second poem', 'दूसरी कविता'],
  ['Third poem', 'तीसरी कविता'],

  // Reading Actions
  ['Save Poem', 'कविता सहेजें'],
  ['Saved to Bookshelf', 'अलमारी में सहेजा गया'],
  ['Minimal Mode', 'मिनिमल मोड'],

  // Ek Panna Keepsake Cards, Case Wall, Ambience, Margin Notes & Stage Lighting
  ['Ek Panna Card', 'एक पन्ना कार्ड'],
  ['Download PNG', 'PNG डाउनलोड करें'],
  ['Copy Quote', 'उद्धरण कॉपी करें'],
  ['Case & Connections Wall', 'केस और संबंध वॉल'],
  ['Hide Plot Spoilers', 'स्पॉइलर छिपाएँ'],
  ['Showing All Spoilers', 'सभी स्पॉइलर दिख रहे हैं'],
  ['Full Script', 'पूरी संहिता'],
  ['Stage Directions Focus', 'मंच निर्देश फ़ोकस'],
  ['Stage Lighting: On', 'मंच प्रकाश: चालू'],
  ['Stage Lighting: Off', 'मंच प्रकाश: बंद'],
  ['Reading Ambience', 'पठन वातावरण ध्वनि'],
  ['Monsoon Rain', 'मानसून की बारिश'],
  ['Midnight Wind', 'आधी रात की हवा'],
  ['Pages & Ember', 'पन्ने और मद्धम आंच'],

  // Kavita Kaksh · Precious Lines
  ['Most Precious Lines', 'अमूल्य पंक्तियाँ'],
  ['Kavita Kaksh · Selected Couplets', 'कविता कक्ष · चुनिंदा अमूल्य पंक्तियाँ'],
  ['Lines kept close to the candle', 'दीपशिखा के पास सहेजी गई पंक्तियाँ'],
  ['All Languages', 'सभी भाषाएँ'],
  ['All Themes', 'सभी विषय'],
  ['Clear filters', 'फ़िल्टर हटाएँ'],
  ['Read →', 'पढ़ें →'],

  // Footer
  ['All literary works preserved for online reading only.', 'सभी साहित्यिक कृतियाँ केवल ऑनलाइन पठन के लिए सुरक्षित हैं।'],
];

export const STATIC_EN_TO_HI = new Map<string, string>();
export const STATIC_HI_TO_EN = new Map<string, string>();

for (const [en, hi] of PAIRS) {
  STATIC_EN_TO_HI.set(en, hi);
  STATIC_HI_TO_EN.set(hi, en);
}

export function lookupStaticTranslation(
  core: string,
  targetLang: 'hi' | 'en'
): string | undefined {
  if (targetLang === 'hi') {
    return STATIC_EN_TO_HI.get(core);
  }
  return STATIC_HI_TO_EN.get(core);
}
