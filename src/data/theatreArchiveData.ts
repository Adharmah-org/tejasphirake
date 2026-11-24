import type {
  TheatreActItem,
  TheatreCharacterItem,
  TheatreExcerptScene,
} from '../types/literary.ts';

export const THEATRE_PLAY_META = {
  title: 'मीच प्रश्न, मीच उत्तर: तीन अंकी मराठी नाटक',
  subtitle: 'रंगमंचासाठी रूपांतरित तीन अंकी नाट्यसंहिता',
  bookSlug: 'meech-prashna-meech-uttar-natak',
  authorCredit: 'मूळ कथा व संहिता: तेजस पुर्वेश फिरके',
  pageCount: 46,
  language: 'मराठी',
  approximateRuntime: 'अंक पहिला ४५ मिनिटं · अंक दुसरा ४० मिनिटं · अंक तिसरा ३५ मिनिटं',
  stageArchitecture:
    'रंगमंचावर एक मोठं, अर्धवट लिहिलेलं प्रश्नचिन्ह (?) टांगलेलं असतं. प्रत्येक अंकात ते थोडं बदलतं. पहिल्या अंकात ते अपूर्ण आणि तुटलेलं. दुसऱ्या अंकात त्याचा खालचा बिंदू उजळतो. तिसऱ्या अंकात ते पूर्ण आणि उबदार प्रकाशात.',
  audienceQuestionDesign:
    'प्रत्येक अंकाच्या शेवटी “आवाज” प्रेक्षकांना एक छोटा प्रश्न विचारतो. उत्तर मोठ्याने द्यायचं नाही, मनात द्यायचं. हीच कादंबरीतली बहुपर्यायी प्रश्नांची जागा.',
  setDesign:
    'एक रिकामा गोल फिरता मंच (अर्जुनची खोली, घर, कट्टा, हॉस्टेल यांसाठी). एक स्टीलचा डबा (अंगणातला), एक पत्र्याची पेटी, चहाचे कप. बाकी काहीही नाही. बदल प्रकाश आणि आवाजाने.',
  musicNote:
    'एक गाभ्यातला सूर (बासरी किंवा तंबोरा) जो आईची ओवी “चुलीतला विस्तव…” गुणगुणताना उघडतो.',
};

export const THEATRE_CAST: TheatreCharacterItem[] = [
  { name: 'अर्जुन कुलकर्णी', role: 'सतरा ते अठरा वर्षांचा विद्यार्थी' },
  { name: 'आई (सुमन)', role: 'अर्जुनची आई, पंचेचाळीस, कविता लिहिते' },
  { name: 'बाबा', role: 'कारखान्यात रात्रपाळी करणारे, कमी बोलणारे' },
  { name: 'सूरज', role: 'बारा वर्षांचा पेपरवाला मुलगा' },
  { name: 'गण्या, दीपू', role: 'अर्जुनचे जुने मित्र' },
  { name: 'माने सर', role: 'भौतिकशास्त्राचे शिक्षक' },
  { name: 'जोशीकाकू', role: 'शेजारीण' },
  { name: 'प्रथमेश, फैजान, ओमी', role: 'हॉस्टेलमधले मित्र' },
  { name: 'मुक्ता', role: 'वर्गमैत्रीण' },
  {
    name: 'आवाज',
    role: 'रंगमंचामागचा “प्रश्न”चा आवाज (एकच कलाकार; कधी निवेदक, कधी अर्जुनच्या डोक्यातला आवाज)',
  },
];

export const THEATRE_ACTS: TheatreActItem[] = [
  {
    actNumber: 'अंक पहिला',
    title: 'प्रश्नांचा ताजमहाल',
    actPage: 4,
    closingQuestionTitle: 'मध्यंतरापूर्वी आवाजाचा प्रश्न',
    closingQuestionPage: 18,
    scenes: [
      { sceneNumber: 'प्रवेश १', title: 'रात्री ३:४८', page: 5 },
      { sceneNumber: 'प्रवेश २', title: 'जेवणाचं ताट', page: 6 },
      { sceneNumber: 'प्रवेश ३', title: '५५/१००', page: 7 },
      { sceneNumber: 'प्रवेश ४', title: 'फुटपाथवरचं पुस्तक', page: 8 },
      { sceneNumber: 'प्रवेश ५', title: 'डायरी', page: 9 },
      { sceneNumber: 'प्रवेश ६', title: 'गच्ची', page: 10 },
      { sceneNumber: 'प्रवेश ७', title: 'रात्रपाळीचा फोन', page: 11 },
      { sceneNumber: 'प्रवेश ८', title: 'आईची पेटी', page: 13 },
      { sceneNumber: 'प्रवेश ९', title: 'निकाल आणि पेढे', page: 14 },
      { sceneNumber: 'प्रवेश १०', title: 'कट्ट्यावरची शेवटची रात्र', page: 16 },
      { sceneNumber: 'प्रवेश ११', title: 'कोयना एक्सप्रेस', page: 17 },
    ],
  },
  {
    actNumber: 'अंक दुसरा',
    title: 'पुण्यातले सहा आवाज',
    actPage: 20,
    closingQuestionTitle: 'अंकाच्या शेवटी आवाजाचा प्रश्न',
    closingQuestionPage: 35,
    scenes: [
      { sceneNumber: 'प्रवेश १२', title: 'खोली २१७', page: 21 },
      { sceneNumber: 'प्रवेश १३', title: 'पहिला बेंच', page: 22 },
      { sceneNumber: 'प्रवेश १४', title: 'ओमीची मेस', page: 23 },
      { sceneNumber: 'प्रवेश १५', title: 'अकरा', page: 24 },
      { sceneNumber: 'प्रवेश १६', title: 'पोस्टकार्ड', page: 25 },
      { sceneNumber: 'प्रवेश १७', title: 'मुक्ताचा राग', page: 26 },
      { sceneNumber: 'प्रवेश १८', title: 'ओमीचं गुपित', page: 27 },
      { sceneNumber: 'प्रवेश १९', title: 'फैजानचा निर्णय', page: 28 },
      { sceneNumber: 'प्रवेश २०', title: 'प्रथमेशची रात्र', page: 30 },
      { sceneNumber: 'प्रवेश २१', title: 'भंगारातलं इंजिन', page: 31 },
      { sceneNumber: 'प्रवेश २२', title: 'दिवाळीची सुट्टी', page: 32 },
      { sceneNumber: 'प्रवेश २३', title: 'इंजिनचा आवाज', page: 33 },
    ],
  },
  {
    actNumber: 'अंक तिसरा',
    title: 'आणि मग सकाळ झाली',
    actPage: 36,
    closingQuestionTitle: 'शेवटचा प्रश्न',
    closingQuestionPage: 45,
    scenes: [
      { sceneNumber: 'प्रवेश २४', title: 'चहाची टपरी', page: 37 },
      { sceneNumber: 'प्रवेश २५', title: 'अंगणातला प्रसंग', page: 39 },
      { sceneNumber: 'प्रवेश २६', title: 'एक सामान्य सकाळ', page: 41 },
      { sceneNumber: 'प्रवेश २७', title: 'एक फॉर्म, एक नाव', page: 43 },
      { sceneNumber: 'प्रवेश २८', title: 'वाचनालयातली संध्याकाळ', page: 44 },
    ],
  },
];

export const DIRECTOR_NOTES: string[] = [
  'रंगमंचावर कमीत कमी वस्तू. गोल फिरता मंच किंवा फक्त प्रकाशाचे गोल वापरले तरी चालतात.',
  'बाबा क्वचित बोलतात, म्हणून त्यांच्या शांततेला वेळ द्या. शांतता हीच अभिनयाची जागा आहे.',
  'आईच्या कवितांसाठी एकच निळा प्रकाशकिरण, बाकी मंच मंद.',
  '“आवाज” भूमिका एकाच कलाकाराने करावी. हळू, उबदार, आणि कधीही उपदेश न करणारा.',
  'अंदाजे कालावधी: अंक पहिला ४५ मिनिटं, अंक दुसरा ४० मिनिटं, अंक तिसरा ३५ मिनिटं.',
];

export const THEATRE_VERBATIM_EXCERPTS: TheatreExcerptScene[] = [
  {
    id: 'pravesh-1',
    heading: 'प्रवेश १ · रात्री ३:४८',
    page: 5,
    lines: [
      {
        type: 'stage',
        text: '(अंधार. घड्याळाची टिकटिक. एकच दिवा अर्जुनच्या डोक्यावर. तो पलंगावर बसलेला, हातात फिजिक्सचं पुस्तक. मागे टांगलेलं तुटकं प्रश्नचिन्ह मंद उजळतं.)',
      },
      {
        type: 'dialogue',
        speaker: 'आवाज',
        cue: '(हळू)',
        text: 'रात्र ३ वाजून ४८ मिनिटं. पंख्याची घरघर. खिडकीबाहेर कुणीही नाही. आणि अर्जुन... जागा.',
      },
      {
        type: 'dialogue',
        speaker: 'अर्जुन',
        cue: '(पुस्तकाकडे बघत)',
        text: 'न्यूटनचा गतीचा नियम. बल म्हणजे... बल म्हणजे... (पान उलटतो.) मला हे का कळत नाही?',
      },
      {
        type: 'stage',
        text: '(तो हात पुढे करून पुस्तक बंद करतो. पुन्हा उघडतो. घड्याळाची टिकटिक एकदम मोठी होते.)',
      },
      { type: 'dialogue', speaker: 'आवाज', text: 'हे वाक्य तू तीनशे वेळा पाठ केलंस.' },
      { type: 'dialogue', speaker: 'अर्जुन', text: 'मला वाटलं असंच समजेल.' },
      { type: 'dialogue', speaker: 'आवाज', text: 'समजलं का?' },
      {
        type: 'dialogue',
        speaker: 'अर्जुन',
        cue: '(गप्प. घड्याळ बघतो.)',
        text: 'एक मिनिट पुढे गेलं. बाकी काहीच नाही.',
      },
      { type: 'stage', text: '(दिवा विझतो.)' },
    ],
  },
  {
    id: 'pravesh-2',
    heading: 'प्रवेश २ · जेवणाचं ताट',
    page: 6,
    lines: [
      {
        type: 'stage',
        text: '(मंच फिरतो. स्वयंपाकघर. आई गॅसजवळ, बाबा ताटावर, अर्जुन समोर. तिघं शांत. फक्त चमच्याचा आवाज.)',
      },
      { type: 'dialogue', speaker: 'आई', text: 'अरे, भाजी वाढू का?' },
      { type: 'dialogue', speaker: 'अर्जुन', text: 'नको.' },
      { type: 'dialogue', speaker: 'आई', text: 'दोन घास तरी...' },
      { type: 'dialogue', speaker: 'अर्जुन', text: 'मला नको म्हटलं ना!' },
      { type: 'stage', text: '(शांतता. बाबा घास तोंडात घालतात. आई मागे वळते.)' },
      {
        type: 'dialogue',
        speaker: 'बाबा',
        cue: '(शांतपणे)',
        text: 'आईशी असं बोलत नाहीत.',
      },
      {
        type: 'dialogue',
        speaker: 'अर्जुन',
        text: 'मग कसं बोलतात? सगळे मला विचारतात, “अभ्यास कसा चाललाय? किती मार्क?” कुणी विचारतं का, मला कसं वाटतंय?',
      },
      {
        type: 'stage',
        text: '(आई एक क्षण त्याच्याकडे बघते. काही बोलत नाही. अर्जुन उठून जातो.)',
      },
      {
        type: 'dialogue',
        speaker: 'आई',
        cue: '(बाबांकडे बघत, हळू)',
        text: 'खाल्लं नाही त्याने.',
      },
      { type: 'dialogue', speaker: 'बाबा', text: 'भूक लागली की खाईल.' },
    ],
  },
];

export interface RevolvingStageStop {
  id: string;
  angle: number;
  actIndex: number;
  label: string;
  sceneRef: string;
  page: number;
  props: string[];
  lighting: string;
  soundCue: string;
  atmosphere: string;
}

export const THEATRE_STAGE_STOPS: RevolvingStageStop[] = [
  {
    id: 'arjun-room',
    angle: 0,
    actIndex: 0,
    label: 'अर्जुनची खोली',
    sceneRef: 'प्रवेश १ · रात्री ३:४८',
    page: 5,
    props: ['पलंग', 'फिजिक्सचं पुस्तक', 'तुटकं प्रश्नचिन्ह'],
    lighting: 'अर्जुनच्या डोक्यावर एकच मंद दिवा, बाकी संपूर्ण अंधार.',
    soundCue: 'घड्याळाची टिकटिक व पंख्याची घरघर.',
    atmosphere: 'रात्रीच्या शांततेत पाठांतराची दमछाक आणि डोक्यातला निनावी गोंधळ.',
  },
  {
    id: 'kitchen',
    angle: 72,
    actIndex: 0,
    label: 'स्वयंपाकघर आणि अंगण',
    sceneRef: 'प्रवेश २ व ८ · जेवणाचं ताट / आईची पेटी',
    page: 6,
    props: ['जेवणाचं ताट', 'स्टीलचा डबा', 'आईची पत्र्याची पेटी'],
    lighting: 'घरगुती उबदार पण संकोचलेला प्रकाश; आईच्या कवितेसाठी निळा किरण.',
    soundCue: 'ताटावर चमच्याचा मंद आवाज व आईची ओवी “चुलीतला विस्तव…”.',
    atmosphere: 'न बोललेले संवाद, बाबांचं शांत असणं आणि आईच्या वहीतली कविता.',
  },
  {
    id: 'katta-train',
    angle: 144,
    actIndex: 0,
    label: 'कट्टा आणि कोयना एक्सप्रेस',
    sceneRef: 'प्रवेश १० व ११ · निरोपाची रात्र',
    page: 16,
    props: ['चहाचे कप', 'प्रवासाची पत्र्याची पेटी'],
    lighting: 'रात्रीच्या प्लॅटफॉर्मवरचा पिवळसर झोत; मंचाचा वेग फिरता.',
    soundCue: 'लांब जाणारी रेल्वेची शिट्टी आणि मित्रांचा निरोप.',
    atmosphere: 'सतरा अठरा वर्षांच्या वळणावर गाव मागे सुटणं आणि पुण्याची चाहूल.',
  },
  {
    id: 'hostel-217',
    angle: 216,
    actIndex: 1,
    label: 'पुणे · खोली २१७ व मेस',
    sceneRef: 'प्रवेश १२ ते १८ · पुण्यातले सहा आवाज',
    page: 21,
    props: ['पत्र्याची पेटी', 'पोस्टकार्ड', 'चहाचे कप'],
    lighting: 'अर्धवट प्रश्नचिन्हाचा खालचा बिंदू प्रथमच प्रकाशात उजळतो.',
    soundCue: 'मेसचा गोंगाट, सहा मित्रांचे आवाज आणि मध्यरात्रीची शांतता.',
    atmosphere: 'प्रथमेश, फैजान, ओमी, मुक्ता आणि अर्जुन यांच्या स्वतःच्या गुपितांचा शोध.',
  },
  {
    id: 'courtyard-library',
    angle: 288,
    actIndex: 2,
    label: 'अंगण आणि वाचनालय',
    sceneRef: 'प्रवेश २५ ते २८ · आणि मग सकाळ झाली',
    page: 39,
    props: ['स्टीलचा डबा', 'एक फॉर्म', 'चहाची टपरी'],
    lighting: 'पूर्ण प्रश्नचिन्ह (?) उबदार सुवर्णप्रकाशात न्हाऊन निघतं.',
    soundCue: 'बासरीचा व तंबोऱ्याचा शांत गाभ्यातला सूर.',
    atmosphere: 'स्वतःचे प्रश्न आणि स्वतःचं उत्तर सापडलेली एक सामान्य, मोकळी सकाळ.',
  },
];

export interface ActSilentQuestion {
  actIndex: number;
  actLabel: string;
  heading: string;
  page: number;
  instruction: string;
  promptMarathi: string;
}

export const THEATRE_ACT_QUESTIONS: ActSilentQuestion[] = [
  {
    actIndex: 0,
    actLabel: 'अंक पहिला · मध्यंतरापूर्वी',
    heading: 'मध्यंतरापूर्वी आवाजाचा प्रश्न',
    page: 18,
    instruction: 'उत्तर मोठ्याने द्यायचं नाही, मनात द्यायचं.',
    promptMarathi:
      'तुम्ही शेवटच्या वेळी “मला कसं वाटतंय?” हा प्रश्न इतरांना न विचारता स्वतःला कधी विचारला होता?',
  },
  {
    actIndex: 1,
    actLabel: 'अंक दुसरा · संधिकाळ',
    heading: 'अंकाच्या शेवटी आवाजाचा प्रश्न',
    page: 35,
    instruction: 'गर्दीतल्या सहा आवाजांमध्ये स्वतःचा आवाज हरवला तर…',
    promptMarathi:
      'आपण जे जगतोय ते आपल्या निवडीचं उत्तर आहे, की फक्त इतरांच्या अपेक्षांची उत्तरपत्रिका?',
  },
  {
    actIndex: 2,
    actLabel: 'अंक तिसरा · पडदा पडण्यापूर्वी',
    heading: 'शेवटचा प्रश्न',
    page: 45,
    instruction: 'संपूर्ण ? उजळल्यानंतर प्रेक्षकांसाठी शांत विराम.',
    promptMarathi:
      'जिथे प्रश्नही आपला असतो आणि उत्तरही आपलंच, तिथे सकाळ कशी सुरू होते?',
  },
];

