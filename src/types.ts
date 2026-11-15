export type ItemTag = 'vegan' | 'spicy' | 'new' | 'bestseller' | 'sugar-free';

export type BackgroundStyle = 'light' | 'dark' | 'cream';

export type FontWeightOption = 'normal' | 'medium' | 'bold';

export interface CafeSettings {
  name: string;
  slogan: string;
  logo: string;
  primaryColor: string;
  accentColor: string;
  backgroundStyle?: BackgroundStyle;
  fontWeight?: FontWeightOption;
  instagram: string;
  phone: string;
  address: string;
  mapLink: string;
  wifiPassword: string;
  workingHours: string;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  order: number;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  available: boolean;
  tags: ItemTag[];
  order: number;
}

export interface CafeData {
  cafe: CafeSettings;
  categories: Category[];
  items: MenuItem[];
}

export interface PickEntry {
  itemId: string;
  quantity: number;
}

export interface BulkPriceConfig {
  mode: 'percent' | 'fixed';
  amount: number;
  roundTo: 0 | 1000 | 5000;
  categoryId: string;
}

export interface BulkPricePreviewRow {
  id: string;
  name: string;
  oldPrice: number;
  newPrice: number;
}

export interface ParsedImportLine {
  raw: string;
  name: string;
  price: number;
  description: string;
  valid: boolean;
}

export const TAG_LABELS: Record<ItemTag, string> = {
  bestseller: 'پرفروش',
  new: 'جدید',
  vegan: 'وگان',
  spicy: 'تند',
  'sugar-free': 'بدون شکر',
};

export const ALL_TAGS: ItemTag[] = ['bestseller', 'new', 'vegan', 'spicy', 'sugar-free'];
