export const AROMA_CATEGORIES = [
  { value: 'fruit', label: '과일/꽃', icon: '🍓' },
  { value: 'sweet', label: '달콤/고소', icon: '🥐' },
  { value: 'spice', label: '허브/스파이스', icon: '🌿' },
  { value: 'earth', label: '숙성/기타', icon: '🪵' },
] as const;

export type AromaCategory = (typeof AROMA_CATEGORIES)[number]['value'];

export interface AromaItem {
  id: string;
  name: string;
  icon: string;
  category: AromaCategory;
  color: string;
}

export const AROMA_DATA: AromaItem[] = [
  { id: 'lemon', name: '레몬/시트러스', icon: '🍋', category: 'fruit', color: 'bg-yellow-100' },
  { id: 'apple', name: '사과/배', icon: '🍏', category: 'fruit', color: 'bg-green-100' },
  { id: 'strawberry', name: '딸기/베리', icon: '🍓', category: 'fruit', color: 'bg-red-100' },
  { id: 'plum', name: '자두/검은과일', icon: '🫐', category: 'fruit', color: 'bg-purple-100' },
  { id: 'flower', name: '꽃향기', icon: '🌸', category: 'fruit', color: 'bg-pink-100' },
  { id: 'honey', name: '꿀', icon: '🍯', category: 'sweet', color: 'bg-amber-100' },
  { id: 'vanilla', name: '바닐라', icon: '🍦', category: 'sweet', color: 'bg-yellow-50' },
  { id: 'butter', name: '버터', icon: '🧈', category: 'sweet', color: 'bg-yellow-200' },
  { id: 'chocolate', name: '초콜릿', icon: '🍫', category: 'sweet', color: 'bg-stone-200' },
  { id: 'bread', name: '빵/효모', icon: '🥐', category: 'sweet', color: 'bg-orange-100' },
  { id: 'grass', name: '풀/피망', icon: '🌿', category: 'spice', color: 'bg-green-200' },
  { id: 'mint', name: '민트', icon: '🍃', category: 'spice', color: 'bg-emerald-100' },
  { id: 'pepper', name: '후추/향신료', icon: '🌶️', category: 'spice', color: 'bg-red-200' },
  { id: 'oak', name: '오크나무', icon: '🪵', category: 'earth', color: 'bg-amber-200' },
  { id: 'leather', name: '가죽', icon: '👜', category: 'earth', color: 'bg-orange-900 text-white' },
  { id: 'earth', name: '흙/버섯', icon: '🍄', category: 'earth', color: 'bg-stone-300' },
  { id: 'smoke', name: '연기/토스트', icon: '💨', category: 'earth', color: 'bg-gray-200' },
  { id: 'mineral', name: '돌/미네랄', icon: '🪨', category: 'earth', color: 'bg-slate-200' },
];
