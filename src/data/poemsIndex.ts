import { ANTHOLOGY_POEMS_PART_1 } from './poemsPart1.ts';
import { ANTHOLOGY_POEMS_PART_2 } from './poemsPart2.ts';
import { STANDALONE_POEMS } from './poemsStandalone.ts';
import { NOVEL_POEMS } from './poemsNovel.ts';
import type { PoemCategory, PoemEntry, PoemLanguage } from '../types/literary.ts';

export const BASE_POEMS_CATALOG: PoemEntry[] = [
  ...STANDALONE_POEMS,
  ...ANTHOLOGY_POEMS_PART_1,
  ...ANTHOLOGY_POEMS_PART_2,
  ...NOVEL_POEMS,
];

export const POEM_LANGUAGES: PoemLanguage[] = ['मराठी', 'हिंदी', 'English'];

export const POEM_CATEGORIES: PoemCategory[] = [
  'विरह',
  'एकतर्फी प्रेम',
  'आठवणी',
  'सौंदर्य',
  'निसर्ग',
  'प्रेम',
  'जीवन',
  'Unsaid Feelings',
];
