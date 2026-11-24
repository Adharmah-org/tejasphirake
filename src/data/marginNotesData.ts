export interface ArchivalMarginNote {
  id: string;
  sourceTag: string;
  title: string;
  note: string;
  contextLine?: string;
}

export const POEM_MARGIN_NOTES: Record<string, ArchivalMarginNote[]> = {
  'nasleli-ti': [
    {
      id: 'nasleli-ti-1',
      sourceTag: 'अवतरण नोंद · २३ नोव्हेंबर २०२६',
      title: 'परीक्षा आणि आठवणींची प्रश्नपत्रिका',
      note: 'परीक्षेच्या खोलीतील ओळखीची बाकं, भिंत आणि वर्ग तसाच असताना तिच्या अनुपस्थितीत सारं काही रिकामं भासतं. ही कविता आठवणींचा पेपर सोडवताना कोरं राहिलेल्या एका उत्तराची मौन कहाणी मांडते.',
      contextLine: 'सगळी उत्तरं लिहिली मी, एकच कोरं राहिलं,',
    },
    {
      id: 'nasleli-ti-2',
      sourceTag: 'समर्पण संदर्भ',
      title: 'न बोललेले शब्द',
      note: '“मराठी विरहगीते”: रोज मला विसरून मी (Classmates) आणि जीव हा सांग ना (Tu Hi Re) या दोन गीतांच्या सोबतीने ६ पृष्ठांच्या सचित्र पुस्तिकेत ही कविता जतन केली आहे.',
    },
  ],
  'te-shan': [
    {
      id: 'te-shan-1',
      sourceTag: 'डायरी नोंद · २०१९',
      title: 'काव्याची पार्श्वभूमी',
      note: 'या कवितेतील प्रत्येक ओळ ही विरहाच्या क्षणातल्या संथ श्वासासारखी लिहिली गेली आहे. कोणतीही अलंकारिक कृत्रिमता न ठेवता संवादासारखा प्रवाही भाव ठेवण्यात आला आहे.',
      contextLine: 'ते क्षण अजूनही आठवतात...',
    },
  ],
  'tula-pahata-pahata': [
    {
      id: 'tula-pahata-1',
      sourceTag: 'हस्तलिखित प्रत',
      title: 'नजरेतील संवाद',
      note: 'पाहाणे आणि समजणे यामधील अंतर मिटवणारी ही रचना आहे. बेनियाज़ रूह च्या प्रारंभीच्या संग्रहातील सर्वाधिक जतन केली गेलेली कविता.',
    },
  ],
  'ek-prakash-zot': [
    {
      id: 'ek-prakash-1',
      sourceTag: 'नाट्य संदर्भ',
      title: 'मंचावरील स्वगत',
      note: 'मीच प्रश्न, मीच उत्तर च्या मंचावर ही रचना केवळ शब्द म्हणून नव्हे, तर तुटलेल्या पात्राच्या आत्मशोध प्रक्रियेची सुरूवात म्हणून सादर झाली आहे.',
    },
  ],
  'khamoshiyan': [
    {
      id: 'khamoshiyan-1',
      sourceTag: 'Preserved Notebook',
      title: 'Silence as Language',
      note: 'Written during midnight reflections. The verse treats unsaid silence as a more tangible presence than spoken speech.',
    },
  ],
  'a-love-truly-never-fades': [
    {
      id: 'altnf-title-1',
      sourceTag: 'Title Poem Note',
      title: 'The Novel Continuum',
      note: 'Serves as the emotional anchor for the entire published novel. Preserved verbatim in its original English verse layout.',
    },
  ],
  'beniyaaz-rooh': [
    {
      id: 'beniyaaz-rooh-1',
      sourceTag: 'Author Note',
      title: 'The Pseudonym Essence',
      note: 'BENIYAAZ ROOH signifies a soul detached from worldly demands yet completely immersed in unadulterated emotional truth.',
    },
  ],
};

export const THEATRE_SCENE_NOTES: Record<string, ArchivalMarginNote[]> = {
  'pravesh-1': [
    {
      id: 'th-pravesh-1-1',
      sourceTag: 'दिग्दर्शकीय टीप · प्रवेश १',
      title: 'रात्री ३:४८ आणि अर्धवट प्रश्नचिन्ह',
      note: 'पहिल्या प्रवेशात मंचावर टांगलेले ? चे वरचे वळण केवळ अंधुक प्रकाशात दिसावे. घड्याळाची टिकटिक आणि पंख्याची घरघर अर्जुनच्या डोक्यातील शांत गोंधळ अधोरेखित करतात.',
      contextLine: 'एक मिनिट पुढे गेलं. बाकी काहीच नाही.',
    },
    {
      id: 'th-pravesh-1-2',
      sourceTag: 'संवाद उपमजकूर',
      title: '“आवाज”ची उपस्थिती',
      note: '“आवाज” हा उपदेश करणारा सूत्रधार नसून अर्जुनच्या अंतर्मनातील शांत साक्षीदार आहे. संवादांमधील विराम प्रेक्षकांपर्यंत पोहोचण्यासाठी किमान तीन सेकंदांची शांतता राखावी.',
    },
  ],
  'pravesh-2': [
    {
      id: 'th-pravesh-2-1',
      sourceTag: 'अभिनय सूचना · प्रवेश २',
      title: 'जेवणाच्या ताटावरची शांतता',
      note: 'बाबा मोजक्याच शब्दांत बोलतात. ताटावरील चमच्याचा आवाज आणि आईची मूक नजर ही संवादापेक्षा अधिक बोलकी ठरावी.',
      contextLine: 'खाल्लं नाही त्याने.',
    },
  ],
};
