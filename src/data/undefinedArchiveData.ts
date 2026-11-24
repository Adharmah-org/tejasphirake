export type ArchivalStatusLabel =
  | 'CLASSIFIED'
  | 'UNRESOLVED'
  | 'PRESERVED'
  | 'SEALED';

export interface FirstDayPoemRecord {
  recordCode: string;
  accessionId: string;
  sequenceLabel: string;
  dateLabel: string;
  occasion?: string;
  location?: string;
  signature: string;
  status: ArchivalStatusLabel;
  languageLabel: string;
  artworkUrl: string;
  artworkAlt: string;
  verbatimLines: string[];
}

export interface UndefinedIndexEntry {
  indexCode: string;
  identifier: string;
  dateLabel: string;
  timeLabel: string;
  eventTitle: string;
  classification: ArchivalStatusLabel;
  partiallyConcealedTag: string;
  description: string;
  noteLine: string;
}

export const UNDEFINED_OPENING_TEXT = [
  'Some moments were documented.',
  'Some were never explained.',
  'Some remain undefined.',
];

export const UNDEFINED_CLOSING_TEXT = [
  'Not every record needs an explanation.',
  'Some things only need to remain.',
];

export const FIRST_WRITING_DAY_DATE = '20 January 2023';

export const FIRST_WRITING_DAY_RECORDS: FirstDayPoemRecord[] = [
  {
    recordCode: 'Record 001',
    accessionId: 'UND-2023-01-A',
    sequenceLabel: 'First poem',
    dateLabel: '20 January 2023',
    occasion: 'Her birthday',
    location: 'Engineering Graphics Room',
    signature: 'tejas',
    status: 'PRESERVED',
    languageLabel: 'मराठी',
    artworkUrl: '/assets/aistudio/quote_1689031132486_896c95ca.jpg',
    artworkAlt:
      'Original preserved poem artwork from 20 January 2023 signed tejas',
    verbatimLines: [
      'तू केस मोकळे सोड नि समोर उभी रहा अशी.....',
      'की, पहाटेच्या धुक्यातून परी अवतरली जशी ......',
      '',
      'आता तर माझ्या स्वप्नांवर तुझेच अधिराज्य आहे.',
      'तुला रोज बघण्याचा जणू डोळ्यांना आजार जडला आहे..',
    ],
  },
  {
    recordCode: 'Record 002',
    accessionId: 'UND-2023-01-B',
    sequenceLabel: 'Second poem',
    dateLabel: '20 January 2023',
    signature: 'UNRATED_PEOT',
    status: 'PRESERVED',
    languageLabel: 'मराठी',
    artworkUrl: '/assets/aistudio/quote_1680429545750_7bded918.jpg',
    artworkAlt:
      'Original preserved poem artwork from 20 January 2023 signed UNRATED_PEOT',
    verbatimLines: [
      'क्षणात ढळला रंग मावळतीचा,',
      'ती आठवणींची चाहूल होती......',
      'पुनवेची चांदणी भरास होती',
      'चंद्रावर मात्र अमावस्या होती.....',
      'सोबत गंधीत रातरानी',
      'मनी प्राजक्त बहरला होता',
      'ओढ होती भूतकाळची',
      'पुढ्यात वर्तमान सजला होता.......',
    ],
  },
  {
    recordCode: 'Record 003',
    accessionId: 'UND-2023-01-C',
    sequenceLabel: 'Third poem',
    dateLabel: '20 January 2023',
    signature: 'Unrated_peot',
    status: 'PRESERVED',
    languageLabel: 'हिंदी',
    artworkUrl: '/assets/aistudio/quote_1678332331394_7299a5d7.jpg',
    artworkAlt:
      'Original preserved poem artwork from 20 January 2023 signed Unrated_peot',
    verbatimLines: [
      'सभी "मौन" में छिपे हुए हैं।',
      'शब्दों में कोई शक्ति नहीं है, दमित भावनाओं के लिए आंसुओं के',
      'अलावा कोई रास्ता नहीं है न्याय का अधिकार नहीं है जीना ही',
      'जीना है।',
      'भावनाओं का कोई मतलब नहीं है',
      'यौवन की उज्ज्वल मुस्कान देने का साहस न करें पर खुदा कहीं',
      'नजर नहीं आता|',
      'निरंकुश है',
      'सभी प्यार में प्रतीक्षा कर रहे हैं|',
      'देने का साहस न करें',
      'यहां सभी दयालु हैं',
      'पर खुदा कहीं नजर नहीं आ रहा है ...|',
    ],
  },
];

export const UNDEFINED_INDEX_RECORDS: UndefinedIndexEntry[] = [
  {
    indexCode: 'IDX-01',
    identifier: 'ARC-221128-01',
    dateLabel: '28 November 2022',
    timeLabel: '11:15',
    eventTitle: 'First interaction.',
    classification: 'UNRESOLVED',
    partiallyConcealedTag: 'ORIGIN // LOGGED',
    description:
      'Recorded as the initial point of contact within this chronology. No transcript or outward commentary accompanies the entry.',
    noteLine: 'Surrounding circumstances remain outside the public record.',
  },
  {
    indexCode: 'IDX-02',
    identifier: 'ARC-221228-02',
    dateLabel: '28–29 December 2022',
    timeLabel: '23:30 to 01:17',
    eventTitle: 'Personal conversation.',
    classification: 'CLASSIFIED',
    partiallyConcealedTag: 'EXCHANGE // LOGGED',
    description:
      'An overnight conversation spanning from 23:30 across midnight to 01:17 between 28 and 29 December 2022. The words exchanged remain private.',
    noteLine: 'Verbatim correspondence remains offline.',
  },
  {
    indexCode: 'IDX-03',
    identifier: 'ARC-230309-03',
    dateLabel: '9 March 2023',
    timeLabel: '18:22',
    eventTitle: 'Photograph.',
    classification: 'SEALED',
    partiallyConcealedTag: 'VISUAL // RESTRICTED',
    description:
      'A single dated visual record logged at 18:22. The photograph itself is not exhibited in the public archive.',
    noteLine: 'Held off-record.',
  },
  {
    indexCode: 'IDX-04',
    identifier: 'ARC-251229-04',
    dateLabel: '29 December 2025',
    timeLabel: '19:45',
    eventTitle: 'Project relaunch.',
    classification: 'PRESERVED',
    partiallyConcealedTag: 'ARCHIVE // REOPENED',
    description:
      'Logged at 19:45 on the date the literary archive was taken up again for long-term preservation, assembling scattered editions and scripts under one roof.',
    noteLine: 'Preservation effort initiated.',
  },
  {
    indexCode: 'IDX-05',
    identifier: 'ARC-260628-05',
    dateLabel: '28 June 2026',
    timeLabel: '19:28',
    eventTitle: 'Final message.',
    classification: 'UNRESOLVED',
    partiallyConcealedTag: 'CORRESPONDENCE // CLOSED',
    description:
      'The closing correspondence logged at 19:28 in this sequence. Its contents are not reproduced here.',
    noteLine: 'No subsequent personal entries follow this transmission.',
  },
  {
    indexCode: 'IDX-06',
    identifier: 'ARC-260628-06',
    dateLabel: '28 June 2026',
    timeLabel: '23:17',
    eventTitle: 'Website completed and deployed.',
    classification: 'PRESERVED',
    partiallyConcealedTag: 'EDITION // ARCHIVED',
    description:
      'Final completion and live deployment of the BENIYAAZ ROOH archive logged at 23:17, placing the written works online on the same date.',
    noteLine: 'End of indexed sequence.',
  },
];
