export interface MotifLinkTarget {
  label: string;
  meta: string;
  to: string;
}

export interface LiteraryMotifThread {
  id: string;
  title: string;
  devanagariLabel: string;
  description: string;
  poemSlugs: string[];
  targets: MotifLinkTarget[];
}

export const LITERARY_MOTIF_THREADS: LiteraryMotifThread[] = [
  {
    id: 'motif-347',
    title: '3:47 AM · The Hour of Unanswered Questions',
    devanagariLabel: 'रात्री ३:४७',
    description:
      'Where a hostel lamp stays lit after midnight and questions refuse to wait until morning.',
    poemSlugs: [
      'nasleli-ti',
      'padraat-baandhle',
      'nila-pen',
      'divas-nisatle',
    ],
    targets: [
      {
        label: 'मीच प्रश्न, मीच उत्तर (Novel · p. 1)',
        meta: 'Marathi Fiction',
        to: '/read/meech-prashna-meech-uttar?page=1',
      },
      {
        label: 'मीच प्रश्न, मीच उत्तर (तीन अंकी नाटक)',
        meta: 'Stage Play · Act I',
        to: '/theatre?act=1',
      },
      {
        label: 'नसलेली ती (Poem · ~ तेजस)',
        meta: 'Standalone Verse',
        to: '/poetry/nasleli-ti',
      },
    ],
  },
  {
    id: 'motif-chandana',
    title: 'चांदणं · Moonlight, Her Smile & Still Skies',
    devanagariLabel: 'चांदणं आणि तिचं हसू',
    description:
      'Moonlit silence, pink floral prints, and unspoken admiration held delicately in verse.',
    poemSlugs: [
      'tujhya-saundaryachi-najaakat',
      'tujhya-hasnyacha-chandana',
      'kojagiri-standalone-edition',
      'divas-nisatle',
    ],
    targets: [
      {
        label: 'तुझ्या सौंदर्याची नजाकत...',
        meta: 'Poem',
        to: '/poetry/tujhya-saundaryachi-najaakat',
      },
      {
        label: 'तुझ्या हसण्याचं चांदणं...',
        meta: 'Poem',
        to: '/poetry/tujhya-hasnyacha-chandana',
      },
      {
        label: 'कोजागरी (दूर असलेला चंद्र)',
        meta: 'Illustrated Edition',
        to: '/books/kojagiri-door-aslela-chandra',
      },
    ],
  },
  {
    id: 'motif-unsaid',
    title: 'अव्यक्त भावना · Words Held Back Between Two People',
    devanagariLabel: 'न सांगितलेले शब्द',
    description:
      'Drafts never sent, empty classroom benches, and farewells unspoken at the gate.',
    poemSlugs: [
      'nasleli-ti',
      'tujhya-hasnyacha-chandana',
      'divas-nisatle',
      'kojagiri-standalone-edition',
    ],
    targets: [
      {
        label: 'Midnight Page · Silent Memory',
        meta: 'Curated Excerpts',
        to: '/midnight-page',
      },
      {
        label: 'A Love Truly Never Fades',
        meta: '83-Poem Notebook',
        to: '/books/a-love-truly-never-fades',
      },
      {
        label: 'UNDEFINED Archive',
        meta: 'Unresolved Moments',
        to: '/undefined',
      },
    ],
  },
  {
    id: 'motif-aai',
    title: 'आईची वही · Handwritten Strength in Blue Ink',
    devanagariLabel: 'आईच्या वहीतून',
    description:
      'Quiet Marathi verses tucked into a mother’s notebook that steady every storm.',
    poemSlugs: [
      'padraat-baandhle',
      'rikaama-ghar',
      'postman',
      'nila-pen',
      'bhaakri-aani-kavita',
    ],
    targets: [
      {
        label: 'The Theatre · आईचा निळा प्रकाशकिरण',
        meta: 'Act II Spotlight',
        to: '/theatre?act=2',
      },
      {
        label: 'Author’s Preface · वाचण्याआधी दोन शब्द',
        meta: 'Unsaid Journal',
        to: '/journal/vaachnyaaadhi-don-shabda',
      },
      {
        label: 'मीच प्रश्न, मीच उत्तर (MBL Edition)',
        meta: 'Collector Manuscript',
        to: '/books/meech-prashna-meech-uttar-mbl',
      },
    ],
  },
];

export function getMotifThreadsForPoem(slug: string): LiteraryMotifThread[] {
  const direct = LITERARY_MOTIF_THREADS.filter((m) => m.poemSlugs.includes(slug));
  return direct.length > 0 ? direct : [LITERARY_MOTIF_THREADS[2]];
}
