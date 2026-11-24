import type { MoodDefinition } from '../types/literary.ts';

export const MOOD_DEFINITIONS: MoodDefinition[] = [
  {
    key: 'viraha',
    title: 'Longing & Separation',
    devanagariLabel: 'विरह',
    description:
      'Poems and reflections on absence, passing time, and what memory leaves behind.',
    poemCategories: ['विरह'],
    bookSlugs: ['a-love-truly-never-fades', 'divas-nisatle', 'nasleli-ti'],
    journalSlugs: [],
  },
  {
    key: 'ektarfi',
    title: 'Unspoken Love',
    devanagariLabel: 'एकतर्फी प्रेम',
    description:
      'Silent affection held back behind friendship and unsent confessions.',
    poemCategories: ['एकतर्फी प्रेम'],
    bookSlugs: ['a-love-truly-never-fades', 'tujhya-hasnyacha-chandana'],
    journalSlugs: [],
  },
  {
    key: 'suspense',
    title: 'Mystery & Hidden Truths',
    devanagariLabel: 'सस्पेन्स आणि सत्य',
    description:
      'High-stakes investigative journalism, encrypted archives, cyber paranoia, and covert realities.',
    poemCategories: [],
    bookSlugs: ['chupke-chupke-sach', 'chupke-chupke-sach-2'],
    journalSlugs: ['chupke-chupke-sach-authors-note', 'chupke-chupke-sach-2-authors-note'],
  },
  {
    key: 'aatmashodh',
    title: 'Self-Discovery & Questions',
    devanagariLabel: 'आत्मशोध आणि प्रश्न',
    description:
      'Late-night questions at 3:47 AM, student pressures, hostel friendships, and choosing your own path.',
    poemCategories: ['जीवन'],
    bookSlugs: [
      'meech-prashna-meech-uttar',
      'meech-prashna-meech-uttar-natak',
      'meech-prashna-meech-uttar-mbl',
    ],
    journalSlugs: [
      'vaachnyaaadhi-don-shabda',
      'natakachi-rachana-aani-digdarshakasathi-suchana',
      'shevati-ek-gosht-closing-note',
    ],
  },
  {
    key: 'aathvani',
    title: 'Memories & Home',
    devanagariLabel: 'आठवणी',
    description:
      'Mother’s handwritten notebook, letters waiting at the doorstep, childhood streets, and traces of yesterday.',
    poemCategories: ['आठवणी'],
    bookSlugs: ['meech-prashna-meech-uttar', 'divas-nisatle', 'nasleli-ti'],
    journalSlugs: ['vaachnyaaadhi-don-shabda'],
  },
  {
    key: 'saundarya',
    title: 'Grace, Love & Wonder',
    devanagariLabel: 'सौंदर्य आणि प्रेम',
    description:
      'Poems on her smile, her presence, colour, and falling in love.',
    poemCategories: ['सौंदर्य', 'प्रेम'],
    bookSlugs: ['tujhya-saundaryachi-najaakat', 'a-love-truly-never-fades'],
    journalSlugs: [],
  },
  {
    key: 'nisarga',
    title: 'Moonlight & Nature',
    devanagariLabel: 'निसर्ग आणि चांदणं',
    description:
      'Kojagiri full moons, night breezes, coastal stillness, and festivals under open skies.',
    poemCategories: ['निसर्ग'],
    bookSlugs: ['kojagiri-door-aslela-chandra', 'a-love-truly-never-fades'],
    journalSlugs: [],
  },
  {
    key: 'unsaid',
    title: 'Unsaid Feelings',
    devanagariLabel: 'अव्यक्त भावना',
    description:
      'Hindi, Marathi, and English pieces born from things left unwritten between two people.',
    poemCategories: ['Unsaid Feelings'],
    bookSlugs: ['a-love-truly-never-fades', 'tujhya-hasnyacha-chandana', 'nasleli-ti'],
    journalSlugs: [],
  },
];
