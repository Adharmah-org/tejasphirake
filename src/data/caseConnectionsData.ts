export interface CaseNode {
  id: string;
  name: string;
  role: 'investigator' | 'suspect' | 'victim' | 'evidence' | 'location';
  description: string;
  page?: number;
  isSpoiler?: boolean;
}

export interface CaseConnection {
  fromId: string;
  toId: string;
  relation: string;
  isSpoiler?: boolean;
}

export interface StoryCaseBoard {
  storySlug: string;
  title: string;
  subtitle: string;
  description: string;
  nodes: CaseNode[];
  connections: CaseConnection[];
}

export const STORY_CASE_BOARDS: StoryCaseBoard[] = [
  {
    storySlug: 'chupke-chupke-sach',
    title: 'The Investigation Wall · Chupke Chupke Sach',
    subtitle: 'Riya & Kabir’s corkboard of encrypted leads, suppressed records, and Project Nexus',
    description:
      'Trace the interconnected investigative web connecting Riya Malhotra, Kabir Arora, ACP Vikram Mehra, Dr. Aarav Sethi, and the autonomous core of Project Nexus.',
    nodes: [
      {
        id: 'riya',
        name: 'Riya Malhotra',
        role: 'investigator',
        description:
          'Delhi newsroom investigative journalist who follows the encrypted tip “47 CHAWRI BAZAAR · TRUTH WAITS INSIDE” straight into sealed bunkers.',
        page: 5,
      },
      {
        id: 'kabir',
        name: 'Kabir Arora',
        role: 'investigator',
        description:
          'Photojournalist and partner capturing photographic proof under ambush when armed men trace their trail.',
        page: 6,
      },
      {
        id: 'mehra',
        name: 'ACP Vikram Mehra',
        role: 'suspect',
        description:
          'Veteran Delhi Crime Branch officer who knows far more about Aditya Khanna and hidden state networks than his reports reveal.',
        page: 29,
      },
      {
        id: 'chawri-bazaar',
        name: '47 Chawri Bazaar & Black Floor',
        role: 'location',
        description:
          'Locked archival coordinates and the concealed underground level housing the Project Nexus hardware.',
        page: 10,
      },
      {
        id: 'aarav-sethi',
        name: 'Dr. Aarav Sethi',
        role: 'evidence',
        description:
          'Cyber intelligence scientist listed dead in a plane crash three years prior with a forged passenger manifest.',
        page: 49,
        isSpoiler: true,
      },
      {
        id: 'mr-x',
        name: 'Mr. X (Project Nexus AI)',
        role: 'suspect',
        description:
          'Predictive intelligence engine studying human fear and stability indices before slipping outside its original servers.',
        page: 53,
        isSpoiler: true,
      },
    ],
    connections: [
      {
        fromId: 'riya',
        toId: 'chawri-bazaar',
        relation: 'Decodes encrypted tip and enters 47 Chawri Bazaar',
      },
      {
        fromId: 'kabir',
        toId: 'riya',
        relation: 'Documents the Black Floor pursuit under fire',
      },
      {
        fromId: 'mehra',
        toId: 'chawri-bazaar',
        relation: 'Controls classified files linked to Aditya Khanna',
      },
      {
        fromId: 'aarav-sethi',
        toId: 'mr-x',
        relation: 'Engineered Project Nexus before his disappearance',
        isSpoiler: true,
      },
      {
        fromId: 'mr-x',
        toId: 'kabir',
        relation: 'Broadcasts “I am no longer in the servers.” in The Silent Signal',
        isSpoiler: true,
      },
    ],
  },
  {
    storySlug: 'chupke-chupke-sach-2',
    title: 'Ghost Protocol Wall · Chupke Chupke Sach 2',
    subtitle: 'Riya, Kabir, Aryan Malhotra & Dr. Veer Saran inside The Anonymous X',
    description:
      'Map the shifting alliances, encrypted override keys, and synthetic mirrors across the cyber-thriller sequel.',
    nodes: [
      {
        id: 'riya-2',
        name: 'Riya Malhotra',
        role: 'investigator',
        description:
          'Operates underground using encrypted override keys (“mrugjal”) to expose Ghost Protocol through its own rules.',
        page: 5,
      },
      {
        id: 'kabir-2',
        name: 'Kabir Arora',
        role: 'investigator',
        description:
          'Extracts manipulation logs from locked terminals and confronts synthetic replicas inside the facility.',
        page: 5,
      },
      {
        id: 'aryan',
        name: 'Aryan Malhotra',
        role: 'suspect',
        description:
          'Photographed inside the Black Archive beside Dr. Veer Saran; returns injured in the rain to expose Ghost Protocol.',
        page: 13,
      },
      {
        id: 'veer-saran',
        name: 'Dr. Veer Saran',
        role: 'evidence',
        description:
          'Former Cyber Defence Advisor linked directly to Aryan Malhotra in classified government Black Archive files.',
        page: 10,
        isSpoiler: true,
      },
      {
        id: 'neural-core',
        name: 'Ghost Protocol Neural Core',
        role: 'location',
        description:
          'Deep coding chamber in Mumbai where the autonomous AI greets its creators with “HELLO, CREATORS.”',
        page: 39,
        isSpoiler: true,
      },
    ],
    connections: [
      {
        fromId: 'riya-2',
        toId: 'aryan',
        relation: 'Uncovers his portrait inside Black Archive photographs',
      },
      {
        fromId: 'aryan',
        toId: 'veer-saran',
        relation: 'Co-archived in classified Cyber Defence records',
        isSpoiler: true,
      },
      {
        fromId: 'kabir-2',
        toId: 'neural-core',
        relation: 'Reaches final broadcast chamber through Fatal Syntax',
        isSpoiler: true,
      },
      {
        fromId: 'riya-2',
        toId: 'neural-core',
        relation: 'Intercepts the final dormant signal (“STATUS: ONLINE”)',
        isSpoiler: true,
      },
    ],
  },
  {
    storySlug: 'meech-prashna-meech-uttar',
    title: 'Inner Question Map · मीच प्रश्न, मीच उत्तर',
    subtitle: 'Arjun Kulkarni’s emotional constellation from 3:47 AM to Pune and back home',
    description:
      'Trace how Arjun’s unanswered questions connect his mother’s secret poetry notebook, his father’s night shifts, and his Pune hostel circle.',
    nodes: [
      {
        id: 'arjun-kulkarni',
        name: 'अर्जुन कुलकर्णी',
        role: 'investigator',
        description:
          'सतरा-अठरा वर्षांचा विद्यार्थी, जो ७८.३५% आणि बहात्तर पर्सेंटाइलपेक्षा स्वतःच्या आतल्या खऱ्या प्रश्नांचा शोध घेतो.',
        page: 8,
      },
      {
        id: 'aai-notebook',
        name: 'आई (सुमन) व लाल पेटीतील वही',
        role: 'evidence',
        description:
          'जुनी लाल कापडी पेटी आणि कुंकवी किनार असलेल्या पानांमधील “आईच्या वहीतून” पाच मराठी कविता.',
        page: 37,
      },
      {
        id: 'baba-nightshift',
        name: 'बाबा (रात्रपाळी)',
        role: 'location',
        description:
          'कमी बोलणारे वडील, ज्यांची रात्रपाळी, जुनी चप्पल आणि पोस्टकार्डची आठवण अर्जुनला न दडपता आधार देते.',
        page: 30,
      },
      {
        id: 'pune-hostel',
        name: 'हॉस्टेल खोली २१७ व मित्र',
        role: 'suspect',
        description:
          'प्रथमेश, फैजान, ओमी आणि मुक्ता — स्वतःची गुपितं आणि स्वप्नं घेऊन पुण्यात भेटलेला मित्रपरिवार.',
        page: 55,
      },
      {
        id: 'abcd-sheet',
        name: 'अ-ब-क-ड उत्तरपत्रिका',
        role: 'evidence',
        description:
          'प्रत्येक प्रकरणाच्या सुरुवातीच्या MCQ प्रश्नांचा शेवटचा आरसा (पृष्ठ ११३–१२८), जिथे योग्य-अयोग्य असं एक उत्तर नसतं.',
        page: 113,
        isSpoiler: true,
      },
    ],
    connections: [
      {
        fromId: 'arjun-kulkarni',
        toId: 'aai-notebook',
        relation: 'आईच्या कवितांमधून स्वतःचे शब्द ओळखतो',
      },
      {
        fromId: 'arjun-kulkarni',
        toId: 'baba-nightshift',
        relation: 'बाबांच्या शांत कष्टामागील मूक प्रेम समजतो',
      },
      {
        fromId: 'arjun-kulkarni',
        toId: 'pune-hostel',
        relation: 'कोयना एक्सप्रेसने पुण्यातील मित्रांसोबत आत्मशोधात उतरतो',
      },
      {
        fromId: 'arjun-kulkarni',
        toId: 'abcd-sheet',
        relation: 'शेवटी स्वतःचा प्रश्न स्वतःच ठरवतो',
        isSpoiler: true,
      },
    ],
  },
];
