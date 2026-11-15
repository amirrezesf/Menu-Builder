import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import latteRoseImg from './assets/images/latte_rose_cardamom_1794777075244.jpg';
import espressoImg from './assets/images/specialty_espresso_cup_1794777076585.jpg';
import icedLatteImg from './assets/images/iced_caramel_latte_1794777078250.jpg';
import pistachioCakeImg from './assets/images/saffron_pistachio_cake_1794777078154.jpg';
import croissantImg from './assets/images/artisan_croissant_plate_1794777078600.jpg';
import {
  ALL_TAGS,
  BackgroundStyle,
  BulkPriceConfig,
  BulkPricePreviewRow,
  CafeData,
  CafeSettings,
  Category,
  FontWeightOption,
  ItemTag,
  MenuItem,
  ParsedImportLine,
  PickEntry,
} from './types';

const STORAGE_KEYS = {
  DATA: 'cafe_menu_builder_data_v1',
  PIN: 'cafe_menu_builder_pin_v1',
  ONBOARDED: 'cafe_menu_builder_onboarded_v1',
  ENGLISH_DIGITS: 'cafe_menu_builder_en_digits_v1',
  PICKS: 'cafe_menu_builder_picks_v1',
};

const DEFAULT_ROSE_LOGO_SVG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
      <rect width="120" height="120" rx="28" fill="#6f2c3e"/>
      <circle cx="60" cy="60" r="44" stroke="#e9c8ad" stroke-width="2" stroke-opacity="0.6"/>
      <path d="M40 54h32v15c0 9.5-7.2 17-16 17s-16-7.5-16-17V54z" stroke="#faf6f0" stroke-width="3.2" stroke-linejoin="round"/>
      <path d="M72 58h5.5a6.5 6.5 0 0 1 0 13H72" stroke="#faf6f0" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M35 90h42" stroke="#e9c8ad" stroke-width="3" stroke-linecap="round"/>
      <path d="M56 44c0-6 4.5-10 4.5-15-4.5 2-8.5 6.5-8.5 11.5 0 1.4.4 2.6 1 3.5" stroke="#e9c8ad" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M62 44c3.5-2.5 6-6.5 6-11-3.8 1-6.5 4.2-6.5 8" stroke="#e9c8ad" stroke-width="2.6" stroke-linecap="round"/>
    </svg>`
  );

export function createSeedData(): CafeData {
  return {
    cafe: {
      name: 'کافه رز',
      slogan: 'عطر قهوه تازه، آرامش در قلب شهر',
      logo: DEFAULT_ROSE_LOGO_SVG,
      primaryColor: '#6f2c3e',
      accentColor: '#b98055',
      backgroundStyle: 'cream',
      fontWeight: 'medium',
      instagram: 'caferose.tehran',
      phone: '02188451234',
      address: 'تهران، خیابان فرشته، نبش کوچه مریم، پلاک ۱۲',
      mapLink: 'https://maps.google.com/?q=35.7921,51.4257',
      wifiPassword: 'RoseCoffee2026',
      workingHours: 'هر روز ۸:۳۰ تا ۲۳:۰۰',
    },
    categories: [
      { id: 'cat-hot', name: 'قهوه گرم', emoji: '☕', order: 0 },
      { id: 'cat-cold', name: 'قهوه سرد و نوشیدنی', emoji: '🧊', order: 1 },
      { id: 'cat-cake', name: 'کیک و دسر', emoji: '🍰', order: 2 },
      { id: 'cat-breakfast', name: 'صبحانه و میان‌وعده', emoji: '🥐', order: 3 },
    ],
    items: [
      {
        id: 'item-1',
        categoryId: 'cat-hot',
        name: 'لاته رز و هل',
        description: 'اسپرسو سینگل اوریجین، شیر مخملی، عصاره گل محمدی کاشان و هل تازه آسیاب‌شده',
        price: 148000,
        image: latteRoseImg,
        available: true,
        tags: ['bestseller', 'new'],
        order: 0,
      },
      {
        id: 'item-2',
        categoryId: 'cat-hot',
        name: 'اسپرسو دبل اسپشیالیتی',
        description: 'عصاره‌گیری دقیق از دان ۱۰۰٪ عربیکای برشته‌شده، طعم‌یاد شکلات تلخ و فندق',
        price: 88000,
        image: espressoImg,
        available: true,
        tags: ['vegan', 'sugar-free'],
        order: 1,
      },
      {
        id: 'item-3',
        categoryId: 'cat-hot',
        name: 'کاپوچینو کلاسیک',
        description: 'شیر بخارداده ابریشمی با فوم متراکم روی شات اسپرسوی تازه',
        price: 122000,
        image: '',
        available: true,
        tags: ['bestseller'],
        order: 2,
      },
      {
        id: 'item-4',
        categoryId: 'cat-hot',
        name: 'چای ماسالا تند',
        description: 'ترکیب ادویه‌های اصیل زنجبیل، دارچین، میخک و فلفل سیاه با شیر تازه',
        price: 115000,
        image: '',
        available: true,
        tags: ['spicy'],
        order: 3,
      },
      {
        id: 'item-5',
        categoryId: 'cat-hot',
        name: 'هات چاکلت بلژیکی',
        description: 'شکلات تلخ ۷۰٪ ذوب‌شده با شیر گرم و پودر کاکائو خالص',
        price: 138000,
        image: '',
        available: true,
        tags: [],
        order: 4,
      },
      {
        id: 'item-6',
        categoryId: 'cat-cold',
        name: 'آیس لاته کارامل نمکی',
        description: 'دبل اسپرسو روی یخ کریستالی با شیر سرد و سس کارامل دست‌ساز',
        price: 155000,
        image: icedLatteImg,
        available: true,
        tags: ['bestseller'],
        order: 0,
      },
      {
        id: 'item-7',
        categoryId: 'cat-cold',
        name: 'کلد برو اتیوپی',
        description: 'دم‌آوری سرد ۱۶ ساعته با نت‌های مرکباتی، هلو و شیرینی طبیعی بدون شکر',
        price: 132000,
        image: '',
        available: true,
        tags: ['vegan', 'sugar-free'],
        order: 1,
      },
      {
        id: 'item-8',
        categoryId: 'cat-cold',
        name: 'آیس ماچا جو دوسر',
        description: 'پودر ماچای تشریفاتی ژاپنی هم‌زده با بامبو روی یخ و شیر گیاهی جو دوسر',
        price: 168000,
        image: '',
        available: true,
        tags: ['vegan', 'new'],
        order: 2,
      },
      {
        id: 'item-9',
        categoryId: 'cat-cold',
        name: 'موهیتو رزماری و لیمو',
        description: 'لیموی تازه، نعناع معطر، شاخه رزماری و آب گازدار خنک بدون شکر افزوده',
        price: 118000,
        image: '',
        available: true,
        tags: ['vegan', 'sugar-free'],
        order: 3,
      },
      {
        id: 'item-10',
        categoryId: 'cat-cake',
        name: 'کیک زعفران و پسته',
        description: 'اسفنج لطیف زعفرانی با کرم گلاب و پسته سبز رفسنجان، تزیین‌شده با غنچه رز',
        price: 185000,
        image: pistachioCakeImg,
        available: true,
        tags: ['bestseller'],
        order: 0,
      },
      {
        id: 'item-11',
        categoryId: 'cat-cake',
        name: 'چیزکیک سن سباستین',
        description: 'بافت خامه‌ای کاراملی برشته با سس شکلات تلخ سرو شده در کنار اسلایس',
        price: 195000,
        image: '',
        available: true,
        tags: ['bestseller'],
        order: 1,
      },
      {
        id: 'item-12',
        categoryId: 'cat-cake',
        name: 'کیک هویج و گردو',
        description: 'ادویه دارچین و جوز هندی با گردوی برشته و فراستینگ پنیر خامه‌ای سبک',
        price: 162000,
        image: '',
        available: true,
        tags: [],
        order: 2,
      },
      {
        id: 'item-13',
        categoryId: 'cat-cake',
        name: 'تارت توت‌فرنگی فصل',
        description: 'خمیر ترد بادامی با کرم وانیل ماداگاسکار و توت‌فرنگی تازه دست‌چین',
        price: 175000,
        image: '',
        available: false,
        tags: ['new'],
        order: 3,
      },
      {
        id: 'item-14',
        categoryId: 'cat-breakfast',
        name: 'بشقاب کروسان و انجیر تازه',
        description: 'کروسان کره‌ای پخت روز همراه با پنیر خامه‌ای، عسل کوهستان و انجیر تازه',
        price: 245000,
        image: croissantImg,
        available: true,
        tags: ['bestseller', 'new'],
        order: 0,
      },
      {
        id: 'item-15',
        categoryId: 'cat-breakfast',
        name: 'تست آووکادو و تخم‌مرغ',
        description: 'نان خمیرترش برشته، پوره آووکادو، لیمو، چیلی فلیک و تخم‌مرغ عسلی',
        price: 265000,
        image: '',
        available: true,
        tags: ['spicy'],
        order: 1,
      },
      {
        id: 'item-16',
        categoryId: 'cat-breakfast',
        name: 'ساندویچ پستو و موزارلا',
        description: 'نان فوکاچیا گرم، سس پستو ریحان خانگی، موزارلای تازه و گوجه‌خشک',
        price: 278000,
        image: '',
        available: true,
        tags: [],
        order: 2,
      },
    ],
  };
}

export const CATEGORY_EMOJI_MAP: Record<string, string> = {
  'قهوه گرم': '☕',
  'قهوه سرد': '🧊',
  'نوشیدنیها': '🍹',
  'نوشیدنی‌ها': '🍹',
  'کیک و دسر': '🍰',
  'صبحانه': '🍳',
  'ساندویچ': '🥪',
};

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

export function toEnglishDigits(input: string | number): string {
  return String(input)
    .replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(ARABIC_DIGITS.indexOf(d)));
}

export function toPersianDigits(input: string | number): string {
  return String(input).replace(/\d/g, (d) => PERSIAN_DIGITS[Number(d)] ?? d);
}

export function formatNumber(value: number, useEnglishDigits: boolean): string {
  const rounded = Math.round(value);
  const withCommas = rounded.toLocaleString('en-US');
  if (useEnglishDigits) return withCommas;
  return toPersianDigits(withCommas.replace(/,/g, '٬'));
}

export function formatPrice(price: number, useEnglishDigits: boolean): string {
  return `${formatNumber(price, useEnglishDigits)} تومان`;
}

export function normalizePersian(text: string): string {
  return toEnglishDigits(text)
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/ة/g, 'ه')
    .replace(/\u200c/g, ' ')
    .trim()
    .toLowerCase();
}

export function getReadableTextColor(hex: string): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return '#ffffff';
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? '#18181b' : '#ffffff';
}

export function getThemeTokens(cafe: CafeSettings) {
  const bgStyle: BackgroundStyle = cafe.backgroundStyle || 'cream';
  const weight: FontWeightOption = cafe.fontWeight || 'medium';
  const weightVal = weight === 'normal' ? '400' : weight === 'bold' ? '700' : '500';

  if (bgStyle === 'dark') {
    return {
      bg: '#131110',
      surface: '#1d1a18',
      surfaceAlt: '#282320',
      text: '#f5f1eb',
      muted: '#a89f96',
      border: 'rgba(245, 241, 235, 0.11)',
      isDark: true,
      weightVal,
      primaryText: getReadableTextColor(cafe.primaryColor || '#6f2c3e'),
      accentText: getReadableTextColor(cafe.accentColor || '#b98055'),
    };
  }
  if (bgStyle === 'light') {
    return {
      bg: '#ffffff',
      surface: '#f8f8f7',
      surfaceAlt: '#f0efed',
      text: '#18181b',
      muted: '#64646c',
      border: 'rgba(24, 24, 27, 0.09)',
      isDark: false,
      weightVal,
      primaryText: getReadableTextColor(cafe.primaryColor || '#6f2c3e'),
      accentText: getReadableTextColor(cafe.accentColor || '#b98055'),
    };
  }
  return {
    bg: '#faf6f0',
    surface: '#ffffff',
    surfaceAlt: '#f2ebe0',
    text: '#1f1916',
    muted: '#6e5f56',
    border: 'rgba(31, 25, 22, 0.09)',
    isDark: false,
    weightVal,
    primaryText: getReadableTextColor(cafe.primaryColor || '#6f2c3e'),
    accentText: getReadableTextColor(cafe.accentColor || '#b98055'),
  };
}

export async function compressImageToBase64(file: File, maxDimension = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('خطا در خواندن فایل تصویر'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('فرمت تصویر معتبر نیست'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width >= height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('امکان پردازش تصویر وجود ندارد'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const isPng = file.type === 'image/png';
        const output = canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', isPng ? undefined : 0.82);
        resolve(output);
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export function parseImportLines(rawText: string): ParsedImportLine[] {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  return lines.map((raw) => {
    const clean = toEnglishDigits(raw).replace(/تومان/g, '').trim();
    // Try splitting by -, –, —, :, tab, or comma (English or Persian)
    const parts = clean
      .split(/\s*[-–—:\t,،]\s*/)
      .map((p) => p.trim())
      .filter(Boolean);

    if (parts.length >= 2) {
      // Find numeric token (prefer second part, or last numeric part)
      let priceIndex = -1;
      let parsedPrice = 0;
      for (let i = 1; i < parts.length; i++) {
        const numericStr = parts[i].replace(/[,٬\s]/g, '');
        if (/^\d+$/.test(numericStr)) {
          priceIndex = i;
          parsedPrice = parseInt(numericStr, 10);
          break;
        }
      }
      if (priceIndex !== -1 && parts[0]) {
        const descParts = parts.filter((_, idx) => idx !== 0 && idx !== priceIndex);
        return {
          raw,
          name: parts[0],
          price: parsedPrice,
          description: descParts.join(' - '),
          valid: parts[0].length > 0 && parsedPrice >= 0,
        };
      }
    }

    // Fallback: match trailing number separated by space
    const trailingMatch = clean.match(/^(.+?)\s+([\d,٬]+)$/);
    if (trailingMatch) {
      const name = trailingMatch[1].trim();
      const price = parseInt(trailingMatch[2].replace(/[,٬]/g, ''), 10);
      return {
        raw,
        name,
        price: Number.isFinite(price) ? price : 0,
        description: '',
        valid: Boolean(name) && Number.isFinite(price),
      };
    }

    return {
      raw,
      name: raw,
      price: 0,
      description: '',
      valid: false,
    };
  });
}

function loadStoredData(): CafeData {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DATA);
    if (!raw) return createSeedData();
    const parsed = JSON.parse(raw) as Partial<CafeData>;
    if (!parsed.cafe || !Array.isArray(parsed.categories) || !Array.isArray(parsed.items)) {
      return createSeedData();
    }
    return normalizeCafeData(parsed as CafeData);
  } catch {
    return createSeedData();
  }
}

export function normalizeCafeData(input: CafeData): CafeData {
  const seed = createSeedData();
  return {
    cafe: {
      name: input.cafe?.name ?? seed.cafe.name,
      slogan: input.cafe?.slogan ?? '',
      logo: input.cafe?.logo ?? '',
      primaryColor: input.cafe?.primaryColor || '#6f2c3e',
      accentColor: input.cafe?.accentColor || '#b98055',
      backgroundStyle:
        input.cafe?.backgroundStyle === 'light' ||
        input.cafe?.backgroundStyle === 'dark' ||
        input.cafe?.backgroundStyle === 'cream'
          ? input.cafe.backgroundStyle
          : 'cream',
      fontWeight:
        input.cafe?.fontWeight === 'normal' ||
        input.cafe?.fontWeight === 'medium' ||
        input.cafe?.fontWeight === 'bold'
          ? input.cafe.fontWeight
          : 'medium',
      instagram: input.cafe?.instagram ?? '',
      phone: input.cafe?.phone ?? '',
      address: input.cafe?.address ?? '',
      mapLink: input.cafe?.mapLink ?? '',
      wifiPassword: input.cafe?.wifiPassword ?? '',
      workingHours: input.cafe?.workingHours ?? '',
    },
    categories: (input.categories || []).map((c, idx) => ({
      id: String(c.id || `cat-${Date.now()}-${idx}`),
      name: String(c.name || 'دسته‌بندی'),
      emoji: String(c.emoji || '🍽️'),
      order: typeof c.order === 'number' ? c.order : idx,
    })),
    items: (input.items || []).map((item, idx) => ({
      id: String(item.id || `item-${Date.now()}-${idx}`),
      categoryId: String(item.categoryId || ''),
      name: String(item.name || 'آیتم بدون نام'),
      description: String(item.description || ''),
      price: typeof item.price === 'number' && Number.isFinite(item.price) ? Math.max(0, item.price) : 0,
      image: String(item.image || ''),
      available: typeof item.available === 'boolean' ? item.available : true,
      tags: Array.isArray(item.tags)
        ? item.tags.filter((t): t is ItemTag => ALL_TAGS.includes(t as ItemTag))
        : [],
      order: typeof item.order === 'number' ? item.order : idx,
    })),
  };
}

interface CafeContextValue {
  data: CafeData;
  useEnglishDigits: boolean;
  setUseEnglishDigits: (v: boolean) => void;
  adminPin: string;
  setAdminPin: (pin: string) => void;
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => void;
  // Picks ("لیست انتخاب من")
  picks: PickEntry[];
  addPick: (itemId: string) => void;
  decrementPick: (itemId: string) => void;
  clearPicks: () => void;
  // Cafe settings
  updateCafe: (patch: Partial<CafeSettings>) => void;
  // Categories
  addCategory: (name: string, emoji?: string) => Category;
  updateCategory: (id: string, patch: Partial<Pick<Category, 'name' | 'emoji'>>) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (orderedIds: string[]) => void;
  // Items
  addItem: (item: Omit<MenuItem, 'id' | 'order'>) => MenuItem;
  updateItem: (id: string, patch: Partial<MenuItem>) => void;
  deleteItem: (id: string) => void;
  toggleItemAvailability: (id: string) => void;
  importItemsBatch: (categoryId: string, rows: ParsedImportLine[]) => number;
  // Bulk pricing
  previewBulkPrice: (config: BulkPriceConfig) => BulkPricePreviewRow[];
  applyBulkPrice: (config: BulkPriceConfig) => void;
  undoBulkPrice: () => boolean;
  canUndoBulkPrice: boolean;
  // Export / Import / Reset
  exportJson: () => string;
  importJson: (jsonText: string) => { ok: boolean; error?: string };
  resetDemoData: () => void;
}

const CafeContext = createContext<CafeContextValue | null>(null);

export const CafeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<CafeData>(loadStoredData);
  const [useEnglishDigits, setUseEnglishDigits] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.ENGLISH_DIGITS) === 'true';
  });
  const [adminPin, setAdminPinState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.PIN) || '1234';
  });
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.ONBOARDED) === 'true';
  });
  const [picks, setPicks] = useState<PickEntry[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PICKS);
      return raw ? (JSON.parse(raw) as PickEntry[]) : [];
    } catch {
      return [];
    }
  });
  const [priceUndoSnapshot, setPriceUndoSnapshot] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DATA, JSON.stringify(data));
    } catch {
      // Ignore quota exceeded silently
    }
  }, [data]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ENGLISH_DIGITS, String(useEnglishDigits));
  }, [useEnglishDigits]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PICKS, JSON.stringify(picks));
  }, [picks]);

  // Apply live theme CSS variables & page title
  const tokens = useMemo(() => getThemeTokens(data.cafe), [data.cafe]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--cafe-primary', data.cafe.primaryColor || '#6f2c3e');
    root.style.setProperty('--cafe-accent', data.cafe.accentColor || '#b98055');
    root.style.setProperty('--cafe-bg', tokens.bg);
    root.style.setProperty('--cafe-surface', tokens.surface);
    root.style.setProperty('--cafe-surface-alt', tokens.surfaceAlt);
    root.style.setProperty('--cafe-text', tokens.text);
    root.style.setProperty('--cafe-muted', tokens.muted);
    root.style.setProperty('--cafe-border', tokens.border);
    root.style.setProperty('--cafe-weight', tokens.weightVal);
    document.title = data.cafe.name ? `${data.cafe.name} | منوی دیجیتال` : 'منوی دیجیتال کافه';
  }, [data.cafe, tokens]);

  const setAdminPin = (pin: string) => {
    const clean = toEnglishDigits(pin).replace(/\D/g, '').slice(0, 4);
    if (clean.length === 4) {
      setAdminPinState(clean);
      localStorage.setItem(STORAGE_KEYS.PIN, clean);
    }
  };

  const completeOnboarding = () => {
    setHasCompletedOnboarding(true);
    localStorage.setItem(STORAGE_KEYS.ONBOARDED, 'true');
  };

  const addPick = (itemId: string) => {
    setPicks((prev) => {
      const existing = prev.find((p) => p.itemId === itemId);
      if (existing) {
        return prev.map((p) => (p.itemId === itemId ? { ...p, quantity: p.quantity + 1 } : p));
      }
      return [...prev, { itemId, quantity: 1 }];
    });
  };

  const decrementPick = (itemId: string) => {
    setPicks((prev) =>
      prev
        .map((p) => (p.itemId === itemId ? { ...p, quantity: p.quantity - 1 } : p))
        .filter((p) => p.quantity > 0)
    );
  };

  const clearPicks = () => setPicks([]);

  const updateCafe = (patch: Partial<CafeSettings>) => {
    setData((prev) => ({
      ...prev,
      cafe: { ...prev.cafe, ...patch },
    }));
  };

  const addCategory = (name: string, emoji = '☕'): Category => {
    const cleanName = name.trim();
    const newCat: Category = {
      id: `cat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: cleanName,
      emoji: emoji || CATEGORY_EMOJI_MAP[cleanName] || '🍽️',
      order: data.categories.length,
    };
    setData((prev) => ({
      ...prev,
      categories: [...prev.categories, newCat],
    }));
    return newCat;
  };

  const updateCategory = (id: string, patch: Partial<Pick<Category, 'name' | 'emoji'>>) => {
    setData((prev) => ({
      ...prev,
      categories: prev.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  };

  const deleteCategory = (id: string) => {
    setData((prev) => ({
      ...prev,
      categories: prev.categories
        .filter((c) => c.id !== id)
        .map((c, idx) => ({ ...c, order: idx })),
      items: prev.items.filter((i) => i.categoryId !== id),
    }));
  };

  const reorderCategories = (orderedIds: string[]) => {
    setData((prev) => {
      const map = new Map(prev.categories.map((c) => [c.id, c]));
      const reordered: Category[] = [];
      orderedIds.forEach((id, idx) => {
        const found = map.get(id);
        if (found) reordered.push({ ...found, order: idx });
      });
      prev.categories.forEach((c) => {
        if (!orderedIds.includes(c.id)) {
          reordered.push({ ...c, order: reordered.length });
        }
      });
      return { ...prev, categories: reordered };
    });
  };

  const addItem = (item: Omit<MenuItem, 'id' | 'order'>): MenuItem => {
    const catItems = data.items.filter((i) => i.categoryId === item.categoryId);
    const created: MenuItem = {
      ...item,
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      order: catItems.length,
    };
    setData((prev) => ({
      ...prev,
      items: [...prev.items, created],
    }));
    return created;
  };

  const updateItem = (id: string, patch: Partial<MenuItem>) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  };

  const deleteItem = (id: string) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
    setPicks((prev) => prev.filter((p) => p.itemId !== id));
  };

  const toggleItemAvailability = (id: string) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, available: !item.available } : item
      ),
    }));
  };

  const importItemsBatch = (categoryId: string, rows: ParsedImportLine[]): number => {
    const validRows = rows.filter((r) => r.valid);
    if (validRows.length === 0) return 0;
    setData((prev) => {
      const baseOrder = prev.items.filter((i) => i.categoryId === categoryId).length;
      const created: MenuItem[] = validRows.map((r, idx) => ({
        id: `item-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 5)}`,
        categoryId,
        name: r.name,
        description: r.description,
        price: r.price,
        image: '',
        available: true,
        tags: [],
        order: baseOrder + idx,
      }));
      return {
        ...prev,
        items: [...prev.items, ...created],
      };
    });
    return validRows.length;
  };

  const computeNewPrice = (oldPrice: number, config: BulkPriceConfig): number => {
    let raw =
      config.mode === 'percent'
        ? oldPrice * (1 + config.amount / 100)
        : oldPrice + config.amount;
    raw = Math.max(0, raw);
    if (config.roundTo > 0) {
      raw = Math.round(raw / config.roundTo) * config.roundTo;
    } else {
      raw = Math.round(raw);
    }
    return raw;
  };

  const previewBulkPrice = (config: BulkPriceConfig): BulkPricePreviewRow[] => {
    return data.items
      .filter((item) => config.categoryId === 'all' || item.categoryId === config.categoryId)
      .map((item) => ({
        id: item.id,
        name: item.name,
        oldPrice: item.price,
        newPrice: computeNewPrice(item.price, config),
      }));
  };

  const applyBulkPrice = (config: BulkPriceConfig) => {
    const snapshot: Record<string, number> = {};
    data.items.forEach((item) => {
      snapshot[item.id] = item.price;
    });
    setPriceUndoSnapshot(snapshot);
    setData((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (config.categoryId !== 'all' && item.categoryId !== config.categoryId) return item;
        return { ...item, price: computeNewPrice(item.price, config) };
      }),
    }));
  };

  const undoBulkPrice = (): boolean => {
    if (!priceUndoSnapshot) return false;
    const snap = priceUndoSnapshot;
    setData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        typeof snap[item.id] === 'number' ? { ...item, price: snap[item.id] } : item
      ),
    }));
    setPriceUndoSnapshot(null);
    return true;
  };

  const exportJson = (): string => {
    return JSON.stringify(data, null, 2);
  };

  const importJson = (jsonText: string): { ok: boolean; error?: string } => {
    try {
      const parsed = JSON.parse(jsonText) as CafeData;
      if (!parsed || typeof parsed !== 'object' || !parsed.cafe || !Array.isArray(parsed.categories) || !Array.isArray(parsed.items)) {
        return { ok: false, error: 'ساختار فایل JSON با قالب منو مطابقت ندارد.' };
      }
      setData(normalizeCafeData(parsed));
      setPicks([]);
      setPriceUndoSnapshot(null);
      return { ok: true };
    } catch {
      return { ok: false, error: 'فایل انتخاب‌شده یک JSON معتبر نیست.' };
    }
  };

  const resetDemoData = () => {
    const seed = createSeedData();
    setData(seed);
    setPicks([]);
    setPriceUndoSnapshot(null);
  };

  return (
    <CafeContext.Provider
      value={{
        data,
        useEnglishDigits,
        setUseEnglishDigits,
        adminPin,
        setAdminPin,
        hasCompletedOnboarding,
        completeOnboarding,
        picks,
        addPick,
        decrementPick,
        clearPicks,
        updateCafe,
        addCategory,
        updateCategory,
        deleteCategory,
        reorderCategories,
        addItem,
        updateItem,
        deleteItem,
        toggleItemAvailability,
        importItemsBatch,
        previewBulkPrice,
        applyBulkPrice,
        undoBulkPrice,
        canUndoBulkPrice: Boolean(priceUndoSnapshot),
        exportJson,
        importJson,
        resetDemoData,
      }}
    >
      {children}
    </CafeContext.Provider>
  );
};

export function useCafeStore(): CafeContextValue {
  const ctx = useContext(CafeContext);
  if (!ctx) {
    throw new Error('useCafeStore must be used inside CafeProvider');
  }
  return ctx;
}
