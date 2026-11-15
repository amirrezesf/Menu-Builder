import React, { useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Check,
  Coffee,
  Download,
  Edit3,
  Eye,
  FileText,
  GripVertical,
  ImagePlus,
  KeyRound,
  Layers,
  Lock,
  Palette,
  Percent,
  Plus,
  Printer,
  QrCode,
  RotateCcw,
  Search,
  Smartphone,
  Sparkles,
  Trash2,
  Undo2,
  Upload,
  X,
} from 'lucide-react';
import {
  CATEGORY_EMOJI_MAP,
  compressImageToBase64,
  formatNumber,
  formatPrice,
  getThemeTokens,
  normalizePersian,
  parseImportLines,
  toEnglishDigits,
  useCafeStore,
} from '../store';
import {
  ALL_TAGS,
  BackgroundStyle,
  BulkPriceConfig,
  CafeSettings,
  FontWeightOption,
  ItemTag,
  MenuItem,
  TAG_LABELS,
} from '../types';
import { CustomerMenu } from './CustomerMenu';

type AdminTab = 'items' | 'categories' | 'settings' | 'qr';

interface AdminDashboardProps {
  onNavigateCustomer: () => void;
}

const COLOR_SWATCHES = [
  { name: 'زرشکی رز', primary: '#6f2c3e', accent: '#b98055' },
  { name: 'اسپرسو تیره', primary: '#3d281e', accent: '#c08552' },
  { name: 'سبز مریم‌گلی', primary: '#2d5a4c', accent: '#c99e67' },
  { name: 'سرمه‌ای کلاسیک', primary: '#1e3a5f', accent: '#d48c59' },
  { name: 'زغالی مدرن', primary: '#27272a', accent: '#b45309' },
];

const QUICK_CATEGORY_SUGGESTIONS = [
  { name: 'قهوه گرم', emoji: '☕' },
  { name: 'قهوه سرد', emoji: '🧊' },
  { name: 'نوشیدنیها', emoji: '🍹' },
  { name: 'کیک و دسر', emoji: '🍰' },
  { name: 'صبحانه', emoji: '🍳' },
  { name: 'ساندویچ', emoji: '🥪' },
];

const EMOJI_PRESETS = ['☕', '🧊', '🍹', '🍵', '🍰', '🥐', '🍳', '🥪', '🥗', '🍨', '🫖', '🧁'];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateCustomer }) => {
  const {
    data,
    useEnglishDigits,
    setUseEnglishDigits,
    adminPin,
    setAdminPin,
    hasCompletedOnboarding,
    completeOnboarding,
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
    canUndoBulkPrice,
    exportJson,
    importJson,
    resetDemoData,
  } = useCafeStore();

  const { cafe, categories, items } = data;
  const tokens = useMemo(() => getThemeTokens(cafe), [cafe]);
  const primaryColor = cafe.primaryColor || '#6f2c3e';

  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('cafe_admin_unlocked') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>('items');
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2600);
  };

  useEffect(() => {
    if (isUnlocked && !hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, [isUnlocked, hasCompletedOnboarding]);

  const handleVerifyPin = (candidate: string) => {
    const clean = toEnglishDigits(candidate).replace(/\D/g, '');
    if (clean === adminPin) {
      setIsUnlocked(true);
      sessionStorage.setItem('cafe_admin_unlocked', 'true');
      setPinError('');
      setPinInput('');
    } else if (clean.length >= 4) {
      setPinError('پین وارد شده نادرست است');
      setPinInput('');
    }
  };

  const handleLock = () => {
    setIsUnlocked(false);
    sessionStorage.removeItem('cafe_admin_unlocked');
  };

  if (!isUnlocked) {
    return (
      <div
        dir="rtl"
        className="flex min-h-screen flex-col items-center justify-center px-4 py-8"
        style={{ backgroundColor: tokens.bg, color: tokens.text }}
      >
        <div
          className="w-full max-w-sm rounded-3xl border p-6 shadow-sm sm:p-8"
          style={{ backgroundColor: tokens.surface, borderColor: tokens.border }}
        >
          <div className="mb-6 text-center">
            <div
              className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ backgroundColor: tokens.surfaceAlt, color: primaryColor }}
            >
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold">ورود به پنل مدیریت</h1>
            <p className="mt-1 text-xs leading-relaxed" style={{ color: tokens.muted }}>
              {cafe.name ? `مدیریت منوی ${cafe.name}` : 'پین ۴ رقمی مدیریت را وارد کنید'}
            </p>
            {adminPin === '1234' && (
              <p className="mt-1.5 text-xs font-medium" style={{ color: cafe.accentColor || '#b98055' }}>
                پین پیش‌فرض: ۱۲۳۴
              </p>
            )}
          </div>

          {/* 4-dot PIN display */}
          <div className="mb-5 flex justify-center gap-3" dir="ltr">
            {[0, 1, 2, 3].map((idx) => {
              const filled = idx < pinInput.length;
              return (
                <div
                  key={idx}
                  className="flex h-12 w-12 items-center justify-center rounded-xl border text-lg font-bold transition-colors"
                  style={{
                    borderColor: filled ? primaryColor : tokens.border,
                    backgroundColor: tokens.surfaceAlt,
                  }}
                >
                  {filled ? '●' : ''}
                </div>
              );
            })}
          </div>

          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pinInput}
            onChange={(e) => {
              const val = toEnglishDigits(e.target.value).replace(/\D/g, '').slice(0, 4);
              setPinInput(val);
              setPinError('');
              if (val.length === 4) handleVerifyPin(val);
            }}
            placeholder="پین ۴ رقمی"
            aria-label="پین ۴ رقمی مدیریت"
            className="mb-3 min-h-[44px] w-full rounded-xl border px-3 text-center text-sm tracking-widest"
            style={{
              borderColor: tokens.border,
              backgroundColor: tokens.surfaceAlt,
              color: tokens.text,
            }}
          />

          {pinError && (
            <p className="mb-3 text-center text-xs font-medium text-red-600" role="alert">
              {pinError}
            </p>
          )}

          {/* Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2" dir="ltr">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => {
                  if (pinInput.length >= 4) return;
                  const next = pinInput + digit;
                  setPinInput(next);
                  setPinError('');
                  if (next.length === 4) handleVerifyPin(next);
                }}
                className="min-h-[48px] rounded-xl border text-base font-bold tabular-nums transition-transform active:scale-95"
                style={{
                  borderColor: tokens.border,
                  backgroundColor: tokens.surfaceAlt,
                }}
              >
                {useEnglishDigits ? digit : formatNumber(Number(digit), false)}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setPinInput('');
                setPinError('');
              }}
              className="min-h-[48px] rounded-xl border text-xs font-medium"
              style={{ borderColor: tokens.border, color: tokens.muted }}
            >
              پاک
            </button>
            <button
              type="button"
              onClick={() => {
                if (pinInput.length >= 4) return;
                const next = pinInput + '0';
                setPinInput(next);
                setPinError('');
                if (next.length === 4) handleVerifyPin(next);
              }}
              className="min-h-[48px] rounded-xl border text-base font-bold tabular-nums transition-transform active:scale-95"
              style={{
                borderColor: tokens.border,
                backgroundColor: tokens.surfaceAlt,
              }}
            >
              {useEnglishDigits ? '0' : '۰'}
            </button>
            <button
              type="button"
              onClick={() => setPinInput((p) => p.slice(0, -1))}
              className="min-h-[48px] rounded-xl border text-xs font-medium"
              style={{ borderColor: tokens.border, color: tokens.muted }}
            >
              حذف
            </button>
          </div>

          <button
            type="button"
            onClick={onNavigateCustomer}
            className="mt-5 flex min-h-[44px] w-full items-center justify-center gap-1.5 text-xs font-medium underline-offset-4 hover:underline"
            style={{ color: tokens.muted }}
          >
            <ArrowRight className="h-4 w-4" />
            <span>بازگشت به منوی مشتری</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full"
      style={{ backgroundColor: tokens.bg, color: tokens.text }}
    >
      {/* Clean 3-zone Admin Top Bar */}
      <header
        className="sticky top-0 z-30 border-b backdrop-blur-md"
        style={{
          borderColor: tokens.border,
          backgroundColor: tokens.isDark ? 'rgba(29,26,24,0.92)' : 'rgba(255,255,255,0.92)',
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          {/* Zone 1: Brand */}
          <div className="flex items-center gap-2.5 shrink-0">
            {cafe.logo ? (
              <img
                src={cafe.logo}
                alt={cafe.name}
                className="h-9 w-9 rounded-xl object-cover border"
                style={{ borderColor: tokens.border }}
              />
            ) : (
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ backgroundColor: primaryColor, color: tokens.primaryText }}
              >
                <Coffee className="h-4 w-4" />
              </div>
            )}
            <span className="text-base font-bold whitespace-nowrap">
              {cafe.name || 'پنل منو'}
            </span>
          </div>

          {/* Zone 2: Desktop Nav Tabs */}
          <nav className="hidden md:flex items-center gap-2" aria-label="بخش‌های مدیریت">
            {(
              [
                { id: 'items', label: 'آیتم‌ها', icon: FileText },
                { id: 'categories', label: 'دسته‌بندی‌ها', icon: Layers },
                { id: 'settings', label: 'ظاهر و تنظیمات', icon: Palette },
                { id: 'qr', label: 'QR و چاپ', icon: QrCode },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-colors"
                  style={
                    active
                      ? { backgroundColor: primaryColor, color: tokens.primaryText }
                      : { color: tokens.text }
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setMobilePreviewOpen(true)}
              className="inline-flex xl:hidden min-h-[40px] items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold whitespace-nowrap"
              style={{ borderColor: tokens.border, backgroundColor: tokens.surfaceAlt }}
            >
              <Smartphone className="h-4 w-4" />
              <span>پیش‌نمایش</span>
            </button>

            <button
              type="button"
              onClick={onNavigateCustomer}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold whitespace-nowrap"
              style={{
                borderColor: tokens.border,
                backgroundColor: tokens.surface,
                color: primaryColor,
              }}
            >
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">مشاهده منو</span>
            </button>

            <button
              type="button"
              onClick={handleLock}
              aria-label="قفل کردن پنل مدیریت"
              title="قفل کردن پنل"
              className="flex h-10 w-10 items-center justify-center rounded-xl border"
              style={{ borderColor: tokens.border, color: tokens.muted }}
            >
              <Lock className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mobile Bottom-row Tab Strip inside Admin */}
        <div
          className="flex md:hidden items-center gap-1.5 overflow-x-auto no-scrollbar border-t px-4 py-2"
          style={{ borderColor: tokens.border }}
        >
          {(
            [
              { id: 'items', label: 'آیتم‌ها', icon: FileText },
              { id: 'categories', label: 'دسته‌بندی‌ها', icon: Layers },
              { id: 'settings', label: 'ظاهر و تنظیمات', icon: Palette },
              { id: 'qr', label: 'QR و چاپ', icon: QrCode },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap"
                style={
                  active
                    ? { backgroundColor: primaryColor, color: tokens.primaryText }
                    : { backgroundColor: tokens.surfaceAlt, color: tokens.text }
                }
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Split Workspace: Left Controls + Right Live Phone Preview on xl */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-6 sm:px-6 xl:grid-cols-[1fr_370px]">
        <main className="min-w-0">
          {activeTab === 'items' && (
            <ItemsManagerSection
              categories={categories}
              items={items}
              tokens={tokens}
              primaryColor={primaryColor}
              useEnglishDigits={useEnglishDigits}
              onToggleAvailability={(id) => {
                toggleItemAvailability(id);
              }}
              onAddItem={addItem}
              onUpdateItem={updateItem}
              onDeleteItem={deleteItem}
              onImportBatch={importItemsBatch}
              previewBulkPrice={previewBulkPrice}
              applyBulkPrice={applyBulkPrice}
              undoBulkPrice={undoBulkPrice}
              canUndoBulkPrice={canUndoBulkPrice}
              showToast={showToast}
            />
          )}

          {activeTab === 'categories' && (
            <CategoriesManagerSection
              categories={categories}
              items={items}
              tokens={tokens}
              primaryColor={primaryColor}
              useEnglishDigits={useEnglishDigits}
              onAddCategory={addCategory}
              onUpdateCategory={updateCategory}
              onDeleteCategory={deleteCategory}
              onReorderCategories={reorderCategories}
              showToast={showToast}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsSection
              cafe={cafe}
              tokens={tokens}
              primaryColor={primaryColor}
              useEnglishDigits={useEnglishDigits}
              setUseEnglishDigits={setUseEnglishDigits}
              onUpdateCafe={updateCafe}
              onChangePin={(pin) => {
                setAdminPin(pin);
                showToast('پین مدیریت با موفقیت تغییر کرد');
              }}
              exportJson={exportJson}
              importJson={importJson}
              resetDemoData={() => {
                resetDemoData();
                showToast('داده‌های نمونه کافه رز بازیابی شد');
              }}
              onOpenWizard={() => setShowOnboarding(true)}
              showToast={showToast}
            />
          )}

          {activeTab === 'qr' && (
            <QrShareSection
              cafe={cafe}
              tokens={tokens}
              primaryColor={primaryColor}
              showToast={showToast}
            />
          )}
        </main>

        {/* Desktop Live Phone Preview Pane */}
        <aside className="hidden xl:block">
          <div className="sticky top-24">
            <div className="mb-3 flex items-center justify-between px-1">
              <span className="text-xs font-semibold" style={{ color: tokens.muted }}>
                پیش‌نمایش زنده منوی مشتری
              </span>
              <span className="text-[11px]" style={{ color: tokens.muted }}>
                نمای موبایل
              </span>
            </div>
            <div
              className="mx-auto h-[680px] w-[360px] overflow-hidden rounded-[38px] border-[7px] shadow-xl"
              style={{
                borderColor: tokens.isDark ? '#322d2a' : '#272320',
                backgroundColor: tokens.bg,
              }}
            >
              <CustomerMenu isPreview />
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile Live Preview Drawer */}
      <AnimatePresence>
        {mobilePreviewOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs xl:hidden"
            onClick={() => setMobilePreviewOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex h-[86vh] w-full max-w-[390px] flex-col overflow-hidden rounded-[34px] border-4 shadow-2xl"
              style={{
                borderColor: tokens.isDark ? '#322d2a' : '#272320',
                backgroundColor: tokens.bg,
              }}
            >
              <div
                className="flex items-center justify-between border-b px-4 py-2.5"
                style={{ borderColor: tokens.border, backgroundColor: tokens.surface }}
              >
                <span className="text-xs font-bold">پیش‌نمایش زنده</span>
                <button
                  type="button"
                  onClick={() => setMobilePreviewOpen(false)}
                  aria-label="بستن پیش‌نمایش"
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ backgroundColor: tokens.surfaceAlt }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <CustomerMenu isPreview />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* First-Run 3-Step Onboarding Wizard */}
      <AnimatePresence>
        {showOnboarding && (
          <OnboardingWizardModal
            cafe={cafe}
            categories={categories}
            items={items}
            tokens={tokens}
            primaryColor={primaryColor}
            useEnglishDigits={useEnglishDigits}
            onUpdateCafe={updateCafe}
            onAddCategory={addCategory}
            onDeleteCategory={deleteCategory}
            onAddItem={addItem}
            onClose={() => {
              completeOnboarding();
              setShowOnboarding(false);
            }}
            showToast={showToast}
          />
        )}
      </AnimatePresence>

      {/* Toast Feedback */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-xl px-4 py-2.5 text-xs font-semibold shadow-lg"
            style={{ backgroundColor: primaryColor, color: tokens.primaryText }}
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ============================================================================
   1. ITEMS MANAGER + ONE-TAP "تموم شد" + BULK PRICE + PASTE IMPORT
============================================================================ */

interface ItemsManagerSectionProps {
  categories: ReturnType<typeof useCafeStore>['data']['categories'];
  items: MenuItem[];
  tokens: ReturnType<typeof getThemeTokens>;
  primaryColor: string;
  useEnglishDigits: boolean;
  onToggleAvailability: (id: string) => void;
  onAddItem: (item: Omit<MenuItem, 'id' | 'order'>) => void;
  onUpdateItem: (id: string, patch: Partial<MenuItem>) => void;
  onDeleteItem: (id: string) => void;
  onImportBatch: (categoryId: string, rows: ReturnType<typeof parseImportLines>) => number;
  previewBulkPrice: (config: BulkPriceConfig) => ReturnType<ReturnType<typeof useCafeStore>['previewBulkPrice']>;
  applyBulkPrice: (config: BulkPriceConfig) => void;
  undoBulkPrice: () => boolean;
  canUndoBulkPrice: boolean;
  showToast: (msg: string) => void;
}

const ItemsManagerSection: React.FC<ItemsManagerSectionProps> = ({
  categories,
  items,
  tokens,
  primaryColor,
  useEnglishDigits,
  onToggleAvailability,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onImportBatch,
  previewBulkPrice,
  applyBulkPrice,
  undoBulkPrice,
  canUndoBulkPrice,
  showToast,
}) => {
  const [filterCatId, setFilterCatId] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  const [isBulkPriceOpen, setIsBulkPriceOpen] = useState(false);
  const [isPasteImportOpen, setIsPasteImportOpen] = useState(false);

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.order - b.order),
    [categories]
  );

  const catMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const filteredItems = useMemo(() => {
    const q = normalizePersian(search);
    return items
      .filter((item) => (filterCatId === 'all' ? true : item.categoryId === filterCatId))
      .filter((item) => {
        if (!q) return true;
        return normalizePersian(`${item.name} ${item.description}`).includes(q);
      })
      .sort((a, b) => {
        const catA = catMap.get(a.categoryId)?.order ?? 0;
        const catB = catMap.get(b.categoryId)?.order ?? 0;
        if (catA !== catB) return catA - catB;
        return a.order - b.order;
      });
  }, [items, filterCatId, search, catMap]);

  const unavailableCount = useMemo(() => items.filter((i) => !i.available).length, [items]);

  return (
    <div className="space-y-5">
      {/* Header + Power Tools */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold">مدیریت آیتم‌های منو</h1>
          <p className="mt-0.5 text-xs tabular-nums" style={{ color: tokens.muted }}>
            {formatNumber(items.length, useEnglishDigits)} آیتم
            {unavailableCount > 0 && ` · ${formatNumber(unavailableCount, useEnglishDigits)} مورد تموم شده`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsBulkPriceOpen(true)}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold"
            style={{ borderColor: tokens.border, backgroundColor: tokens.surface }}
          >
            <Percent className="h-4 w-4" style={{ color: primaryColor }} />
            <span>تغییر گروهی قیمت</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPasteImportOpen(true)}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold"
            style={{ borderColor: tokens.border, backgroundColor: tokens.surface }}
          >
            <FileText className="h-4 w-4" style={{ color: primaryColor }} />
            <span>افزودن متنی سریع</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (sortedCategories.length === 0) {
                showToast('ابتدا حداقل یک دسته‌بندی بسازید');
                return;
              }
              setEditingItem(null);
              setIsNewItemModalOpen(true);
            }}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-transform active:scale-95"
            style={{ backgroundColor: primaryColor, color: tokens.primaryText }}
          >
            <Plus className="h-4 w-4" />
            <span>آیتم جدید</span>
          </button>
        </div>
      </div>

      {/* Undo Banner if bulk price was just applied */}
      {canUndoBulkPrice && (
        <div
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3"
          style={{ borderColor: tokens.border, backgroundColor: tokens.surface }}
        >
          <span className="text-xs font-medium">
            تغییر قیمت گروهی اعمال شد. در صورت نیاز می‌توانید قیمت‌های قبلی را برگردانید.
          </span>
          <button
            type="button"
            onClick={() => {
              if (undoBulkPrice()) showToast('قیمت‌ها به حالت قبل برگشت');
            }}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold"
            style={{ borderColor: primaryColor, color: primaryColor }}
          >
            <Undo2 className="h-4 w-4" />
            <span>بازگردانی (Undo)</span>
          </button>
        </div>
      )}

      {/* Search & Category Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2"
            style={{ color: tokens.muted }}
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جست‌وجو در آیتم‌ها..."
            className="min-h-[44px] w-full rounded-xl border pr-10 pl-4 text-sm"
            style={{
              borderColor: tokens.border,
              backgroundColor: tokens.surface,
              color: tokens.text,
            }}
          />
        </div>

        <select
          value={filterCatId}
          onChange={(e) => setFilterCatId(e.target.value)}
          aria-label="فیلتر بر اساس دسته‌بندی"
          className="min-h-[44px] rounded-xl border px-3.5 text-sm"
          style={{
            borderColor: tokens.border,
            backgroundColor: tokens.surface,
            color: tokens.text,
          }}
        >
          <option value="all">همه دسته‌بندی‌ها</option>
          {sortedCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.emoji} {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Item List with Prominent One-Tap "تموم شد" Switch */}
      {filteredItems.length === 0 ? (
        <div
          className="rounded-3xl border px-6 py-12 text-center"
          style={{ borderColor: tokens.border, backgroundColor: tokens.surface }}
        >
          <p className="text-sm font-semibold">هیچ آیتمی یافت نشد</p>
          <p className="mt-1 text-xs" style={{ color: tokens.muted }}>
            با دکمه «آیتم جدید» یا «افزودن متنی سریع» آیتم‌های منو را اضافه کنید.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredItems.map((item) => {
            const cat = catMap.get(item.categoryId);
            return (
              <div
                key={item.id}
                className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-3.5 transition-opacity ${
                  !item.available ? 'opacity-75' : ''
                }`}
                style={{ borderColor: tokens.border, backgroundColor: tokens.surface }}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl text-2xl"
                    style={{ backgroundColor: tokens.surfaceAlt }}
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className={`h-full w-full object-cover ${!item.available ? 'grayscale' : ''}`}
                      />
                    ) : (
                      <span>{cat?.emoji || '☕'}</span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-bold">{item.name}</h3>
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs" style={{ color: tokens.muted }}>
                      <span>{cat?.name || 'بدون دسته'}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold tabular-nums" style={{ color: primaryColor }}>
                        {formatPrice(item.price, useEnglishDigits)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Controls: 1-Tap Availability Quick Switch + Edit + Delete */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={item.available}
                    onClick={() => {
                      onToggleAvailability(item.id);
                      showToast(
                        item.available
                          ? `«${item.name}» به حالت تموم شد تغییر یافت`
                          : `«${item.name}» دوباره موجود شد`
                      );
                    }}
                    className={`inline-flex min-h-[44px] min-w-[104px] items-center justify-center gap-2 rounded-xl border px-3 text-xs font-bold transition-colors ${
                      item.available
                        ? 'border-emerald-600/25 bg-emerald-600/10 text-emerald-700 dark:text-emerald-400'
                        : 'border-rose-600/30 bg-rose-600/12 text-rose-700 dark:text-rose-400'
                    }`}
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        item.available ? 'bg-emerald-600' : 'bg-rose-600'
                      }`}
                    />
                    <span>{item.available ? 'موجود' : 'تموم شد'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingItem(item);
                      setIsNewItemModalOpen(true);
                    }}
                    aria-label={`ویرایش ${item.name}`}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border"
                    style={{ borderColor: tokens.border, backgroundColor: tokens.surfaceAlt }}
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onDeleteItem(item.id);
                      showToast(`«${item.name}» حذف شد`);
                    }}
                    aria-label={`حذف ${item.name}`}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border text-rose-600 hover:bg-rose-500/10"
                    style={{ borderColor: tokens.border }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Item Modal */}
      <AnimatePresence>
        {isNewItemModalOpen && (
          <ItemFormModal
            initialItem={editingItem}
            categories={sortedCategories}
            tokens={tokens}
            primaryColor={primaryColor}
            onClose={() => {
              setIsNewItemModalOpen(false);
              setEditingItem(null);
            }}
            onSave={(payload) => {
              if (editingItem) {
                onUpdateItem(editingItem.id, payload);
                showToast('آیتم به‌روزرسانی شد');
              } else {
                onAddItem(payload);
                showToast('آیتم جدید اضافه شد');
              }
              setIsNewItemModalOpen(false);
              setEditingItem(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Bulk Price Modal */}
      <AnimatePresence>
        {isBulkPriceOpen && (
          <BulkPriceModal
            categories={sortedCategories}
            tokens={tokens}
            primaryColor={primaryColor}
            useEnglishDigits={useEnglishDigits}
            previewBulkPrice={previewBulkPrice}
            onApply={(cfg) => {
              applyBulkPrice(cfg);
              setIsBulkPriceOpen(false);
              showToast('قیمت‌های جدید اعمال شد');
            }}
            onClose={() => setIsBulkPriceOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Paste Import Modal */}
      <AnimatePresence>
        {isPasteImportOpen && (
          <PasteImportModal
            categories={sortedCategories}
            tokens={tokens}
            primaryColor={primaryColor}
            useEnglishDigits={useEnglishDigits}
            onImport={(catId, rows) => {
              const count = onImportBatch(catId, rows);
              setIsPasteImportOpen(false);
              showToast(`${formatNumber(count, useEnglishDigits)} آیتم جدید اضافه شد`);
            }}
            onClose={() => setIsPasteImportOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

/* ---------------- Item Add/Edit Modal ---------------- */

interface ItemFormModalProps {
  initialItem: MenuItem | null;
  categories: ReturnType<typeof useCafeStore>['data']['categories'];
  tokens: ReturnType<typeof getThemeTokens>;
  primaryColor: string;
  onSave: (item: Omit<MenuItem, 'id' | 'order'>) => void;
  onClose: () => void;
}

const ItemFormModal: React.FC<ItemFormModalProps> = ({
  initialItem,
  categories,
  tokens,
  primaryColor,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState(initialItem?.name || '');
  const [categoryId, setCategoryId] = useState(
    initialItem?.categoryId || categories[0]?.id || ''
  );
  const [priceStr, setPriceStr] = useState(initialItem ? String(initialItem.price) : '');
  const [description, setDescription] = useState(initialItem?.description || '');
  const [image, setImage] = useState(initialItem?.image || '');
  const [available, setAvailable] = useState(initialItem?.available ?? true);
  const [tags, setTags] = useState<ItemTag[]>(initialItem?.tags || []);
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState('');

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCompressing(true);
    setError('');
    try {
      const compressed = await compressImageToBase64(file, 800);
      setImage(compressed);
    } catch {
      setError('خطا در پردازش تصویر');
    } finally {
      setIsCompressing(false);
    }
  };

  const toggleTag = (tag: ItemTag) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const numericPrice = parseInt(toEnglishDigits(priceStr).replace(/[^\d]/g, ''), 10);
    if (!cleanName) {
      setError('نام آیتم را وارد کنید');
      return;
    }
    if (!categoryId) {
      setError('دسته‌بندی را انتخاب کنید');
      return;
    }
    onSave({
      name: cleanName,
      categoryId,
      price: Number.isFinite(numericPrice) ? numericPrice : 0,
      description: description.trim(),
      image,
      available,
      tags,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 backdrop-blur-xs sm:items-center sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border shadow-2xl sm:rounded-3xl"
        style={{ backgroundColor: tokens.surface, borderColor: tokens.border, color: tokens.text }}
      >
        <div
          className="flex items-center justify-between border-b px-5 py-4"
          style={{ borderColor: tokens.border }}
        >
          <h2 className="text-base font-bold">{initialItem ? 'ویرایش آیتم' : 'افزودن آیتم جدید'}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: tokens.surfaceAlt }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 space-y-4 overflow-y-auto p-5">
          {/* Photo upload */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold">تصویر آیتم (حداکثر ۸۰۰ پیکسل)</label>
            <div className="flex items-center gap-3">
              <div
                className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border"
                style={{ borderColor: tokens.border, backgroundColor: tokens.surfaceAlt }}
              >
                {image ? (
                  <img src={image} alt="پیش‌نمایش" className="h-full w-full object-cover" />
                ) : (
                  <ImagePlus className="h-6 w-6 opacity-45" />
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label
                  className="inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-xl border px-3.5 text-xs font-semibold"
                  style={{ borderColor: tokens.border, backgroundColor: tokens.surfaceAlt }}
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>{isCompressing ? 'در حال فشرده‌سازی...' : 'انتخاب عکس'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="sr-only"
                  />
                </label>
                {image && (
                  <button
                    type="button"
                    onClick={() => setImage('')}
                    className="min-h-[40px] rounded-xl px-3 text-xs font-medium text-rose-600"
                  >
                    حذف عکس
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold">نام آیتم</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثلاً: لاته رز و هل"
                className="min-h-[44px] w-full rounded-xl border px-3 text-sm"
                style={{ borderColor: tokens.border, backgroundColor: tokens.surfaceAlt }}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold">قیمت (تومان)</label>
              <input
                type="text"
                inputMode="numeric"
                value={priceStr}
                onChange={(e) => setPriceStr(e.target.value)}
                placeholder="مثلاً: 145000"
                className="min-h-[44px] w-full rounded-xl border px-3 text-sm tabular-nums"
                style={{ borderColor: tokens.border, backgroundColor: tokens.surfaceAlt }}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold">دسته‌بندی</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="min-h-[44px] w-full rounded-xl border px-3 text-sm"
              style={{ borderColor: tokens.border, backgroundColor: tokens.surfaceAlt }}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.emoji} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold">توضیحات</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ترکیبات و طعم‌یادها..."
              className="w-full rounded-xl border p-3 text-sm leading-relaxed"
              style={{ borderColor: tokens.border, backgroundColor: tokens.surfaceAlt }}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold">برچسب‌ها</label>
            <div className="flex flex-wrap gap-2">
              {ALL_TAGS.map((tag) => {
                const active = tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className="min-h-[38px] rounded-xl border px-3 text-xs font-medium transition-colors"
                    style={
                      active
                        ? { backgroundColor: primaryColor, borderColor: primaryColor, color: tokens.primaryText }
                        : { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }
                    }
                  >
                    {TAG_LABELS[tag]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border p-3.5" style={{ borderColor: tokens.border }}>
            <div>
              <div className="text-sm font-semibold">وضعیت موجودی</div>
              <div className="text-xs" style={{ color: tokens.muted }}>
                در صورت غیرفعال کردن، برچسب «تموم شد» نمایش داده می‌شود
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={available}
              onClick={() => setAvailable(!available)}
              className={`min-h-[40px] rounded-xl px-4 text-xs font-bold ${
                available ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
              }`}
            >
              {available ? 'موجود' : 'تموم شد'}
            </button>
          </div>

          {error && <p className="text-xs font-medium text-rose-600">{error}</p>}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] rounded-xl border px-4 text-xs font-semibold"
              style={{ borderColor: tokens.border }}
            >
              انصراف
            </button>
            <button
              type="submit"
              className="min-h-[44px] rounded-xl px-5 text-xs font-bold"
              style={{ backgroundColor: primaryColor, color: tokens.primaryText }}
            >
              {initialItem ? 'ذخیره تغییرات' : 'افزودن آیتم'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

/* ---------------- Bulk Price Modal ---------------- */

interface BulkPriceModalProps {
  categories: ReturnType<typeof useCafeStore>['data']['categories'];
  tokens: ReturnType<typeof getThemeTokens>;
  primaryColor: string;
  useEnglishDigits: boolean;
  previewBulkPrice: (config: BulkPriceConfig) => ReturnType<ReturnType<typeof useCafeStore>['previewBulkPrice']>;
  onApply: (config: BulkPriceConfig) => void;
  onClose: () => void;
}

const BulkPriceModal: React.FC<BulkPriceModalProps> = ({
  categories,
  tokens,
  primaryColor,
  useEnglishDigits,
  previewBulkPrice,
  onApply,
  onClose,
}) => {
  const [mode, setMode] = useState<'percent' | 'fixed'>('percent');
  const [amountInput, setAmountInput] = useState('10');
  const [roundTo, setRoundTo] = useState<0 | 1000 | 5000>(1000);
  const [categoryId, setCategoryId] = useState('all');

  const parsedAmount = useMemo(() => {
    const clean = toEnglishDigits(amountInput).replace(/[,٬\s]/g, '');
    const num = parseFloat(clean);
    return Number.isFinite(num) ? num : 0;
  }, [amountInput]);

  const config: BulkPriceConfig = {
    mode,
    amount: parsedAmount,
    roundTo,
    categoryId,
  };

  const previewRows = useMemo(() => previewBulkPrice(config), [previewBulkPrice, mode, parsedAmount, roundTo, categoryId]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 backdrop-blur-xs sm:items-center sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl border shadow-2xl sm:rounded-3xl"
        style={{ backgroundColor: tokens.surface, borderColor: tokens.border, color: tokens.text }}
      >
        <div
          className="flex items-center justify-between border-b px-5 py-4"
          style={{ borderColor: tokens.border }}
        >
          <div>
            <h2 className="text-base font-bold">تغییر گروهی قیمت‌ها</h2>
            <p className="text-xs" style={{ color: tokens.muted }}>
              پیش‌نمایش قیمت‌های جدید را پیش از اعمال بررسی کنید
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: tokens.surfaceAlt }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {/* Mode Toggle */}
          <div className="grid grid-cols-2 gap-2 rounded-xl p-1" style={{ backgroundColor: tokens.surfaceAlt }}>
            <button
              type="button"
              onClick={() => {
                setMode('percent');
                setAmountInput('10');
              }}
              className="min-h-[40px] rounded-lg text-xs font-bold transition-colors"
              style={
                mode === 'percent'
                  ? { backgroundColor: primaryColor, color: tokens.primaryText }
                  : { color: tokens.text }
              }
            >
              تغییر درصدی (٪)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('fixed');
                setAmountInput('10000');
              }}
              className="min-h-[40px] rounded-lg text-xs font-bold transition-colors"
              style={
                mode === 'fixed'
                  ? { backgroundColor: primaryColor, color: tokens.primaryText }
                  : { color: tokens.text }
              }
            >
              مبلغ ثابت (تومان)
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold">
                {mode === 'percent' ? 'درصد تغییر (مثبت یا منفی)' : 'مبلغ تغییر (تومان)'}
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                className="min-h-[44px] w-full rounded-xl border px-3 text-sm tabular-nums"
                style={{ borderColor: tokens.border, backgroundColor: tokens.surfaceAlt }}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold">محدوده دسته‌بندی</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="min-h-[44px] w-full rounded-xl border px-3 text-sm"
                style={{ borderColor: tokens.border, backgroundColor: tokens.surfaceAlt }}
              >
                <option value="all">همه آیتم‌ها</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold">رند کردن قیمت</label>
              <select
                value={roundTo}
                onChange={(e) => setRoundTo(Number(e.target.value) as 0 | 1000 | 5000)}
                className="min-h-[44px] w-full rounded-xl border px-3 text-sm"
                style={{ borderColor: tokens.border, backgroundColor: tokens.surfaceAlt }}
              >
                <option value={0}>بدون رند کردن</option>
                <option value={1000}>رند به ۱٬۰۰۰ تومان</option>
                <option value={5000}>رند به ۵٬۰۰۰ تومان</option>
              </select>
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap gap-1.5">
            {(mode === 'percent' ? ['5', '10', '15', '20', '-10'] : ['5000', '10000', '20000', '50000', '-10000']).map(
              (preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmountInput(preset)}
                  className="min-h-[36px] rounded-lg border px-2.5 text-xs font-medium tabular-nums"
                  style={{ borderColor: tokens.border, backgroundColor: tokens.surfaceAlt }}
                >
                  {Number(preset) > 0 ? '+' : ''}
                  {mode === 'percent'
                    ? `${formatNumber(Number(preset), useEnglishDigits)}٪`
                    : formatPrice(Number(preset), useEnglishDigits)}
                </button>
              )
            )}
          </div>

          {/* Live Preview Table */}
          <div className="rounded-2xl border overflow-hidden" style={{ borderColor: tokens.border }}>
            <div
              className="border-b px-3.5 py-2 text-xs font-bold"
              style={{ borderColor: tokens.border, backgroundColor: tokens.surfaceAlt }}
            >
              پیش‌نمایش ({formatNumber(previewRows.length, useEnglishDigits)} آیتم)
            </div>
            <div className="max-h-56 overflow-y-auto divide-y" style={{ borderColor: tokens.border }}>
              {previewRows.map((row) => (
                <div
                  key={row.id}
                  className="flex items-center justify-between gap-2 px-3.5 py-2.5 text-xs"
                  style={{ borderColor: tokens.border }}
                >
                  <span className="truncate font-medium">{row.name}</span>
                  <div className="flex items-center gap-2 shrink-0 tabular-nums">
                    <span className="line-through opacity-55">
                      {formatNumber(row.oldPrice, useEnglishDigits)}
                    </span>
                    <span aria-hidden="true">←</span>
                    <span className="font-bold" style={{ color: primaryColor }}>
                      {formatPrice(row.newPrice, useEnglishDigits)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className="flex items-center justify-end gap-2 border-t px-5 py-4"
          style={{ borderColor: tokens.border }}
        >
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] rounded-xl border px-4 text-xs font-semibold"
            style={{ borderColor: tokens.border }}
          >
            انصراف
          </button>
          <button
            type="button"
            disabled={previewRows.length === 0}
            onClick={() => onApply(config)}
            className="min-h-[44px] rounded-xl px-5 text-xs font-bold disabled:opacity-40"
            style={{ backgroundColor: primaryColor, color: tokens.primaryText }}
          >
            اعمال قیمت‌های جدید
          </button>
        </div>
      </motion.div>
    </div>
  );
};

/* ---------------- Paste Import Modal ---------------- */

interface PasteImportModalProps {
  categories: ReturnType<typeof useCafeStore>['data']['categories'];
  tokens: ReturnType<typeof getThemeTokens>;
  primaryColor: string;
  useEnglishDigits: boolean;
  onImport: (categoryId: string, rows: ReturnType<typeof parseImportLines>) => void;
  onClose: () => void;
}

const PasteImportModal: React.FC<PasteImportModalProps> = ({
  categories,
  tokens,
  primaryColor,
  useEnglishDigits,
  onImport,
  onClose,
}) => {
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [text, setText] = useState('');

  const parsed = useMemo(() => parseImportLines(text), [text]);
  const validCount = useMemo(() => parsed.filter((r) => r.valid).length, [parsed]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 backdrop-blur-xs sm:items-center sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl border shadow-2xl sm:rounded-3xl"
        style={{ backgroundColor: tokens.surface, borderColor: tokens.border, color: tokens.text }}
      >
        <div
          className="flex items-center justify-between border-b px-5 py-4"
          style={{ borderColor: tokens.border }}
        >
          <div>
            <h2 className="text-base font-bold">افزودن متنی سریع (Paste Import)</h2>
            <p className="text-xs" style={{ color: tokens.muted }}>
              هر خط یک آیتم: مثلاً «اسپرسو - 85000» یا «latte, 120000»
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: tokens.surfaceAlt }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <div>
            <label className="mb-1.5 block text-xs font-semibold">افزودن به دسته‌بندی</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="min-h-[44px] w-full rounded-xl border px-3 text-sm"
              style={{ borderColor: tokens.border, backgroundColor: tokens.surfaceAlt }}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold">متن لیست آیتم‌ها</label>
            <textarea
              rows={6}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`اسپرسو - 85000\nlatte, 120000\nچای ماسالا - ۱۱۵۰۰۰ - شیر و ادویه گرم`}
              className="w-full rounded-xl border p-3 text-sm leading-7"
              style={{ borderColor: tokens.border, backgroundColor: tokens.surfaceAlt }}
            />
          </div>

          {parsed.length > 0 && (
            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: tokens.border }}>
              <div
                className="border-b px-3.5 py-2 text-xs font-bold"
                style={{ borderColor: tokens.border, backgroundColor: tokens.surfaceAlt }}
              >
                نتیجه تشخیص ({formatNumber(validCount, useEnglishDigits)} مورد معتبر)
              </div>
              <div className="max-h-44 overflow-y-auto divide-y" style={{ borderColor: tokens.border }}>
                {parsed.map((row, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 px-3.5 py-2 text-xs"
                    style={{ borderColor: tokens.border }}
                  >
                    <div className="min-w-0 flex-1">
                      <span className={row.valid ? 'font-semibold' : 'text-rose-600'}>
                        {row.name}
                      </span>
                      {row.description && (
                        <span className="mr-2 opacity-65">({row.description})</span>
                      )}
                    </div>
                    <span className="shrink-0 tabular-nums font-bold">
                      {row.valid ? formatPrice(row.price, useEnglishDigits) : 'نامعتبر'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div
          className="flex items-center justify-end gap-2 border-t px-5 py-4"
          style={{ borderColor: tokens.border }}
        >
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] rounded-xl border px-4 text-xs font-semibold"
            style={{ borderColor: tokens.border }}
          >
            انصراف
          </button>
          <button
            type="button"
            disabled={validCount === 0 || !categoryId}
            onClick={() => onImport(categoryId, parsed)}
            className="min-h-[44px] rounded-xl px-5 text-xs font-bold disabled:opacity-40"
            style={{ backgroundColor: primaryColor, color: tokens.primaryText }}
          >
            افزودن {formatNumber(validCount, useEnglishDigits)} آیتم
          </button>
        </div>
      </motion.div>
    </div>
  );
};

/* ============================================================================
   2. CATEGORIES MANAGER (DRAG-AND-DROP + MOBILE UP/DOWN)
============================================================================ */

interface CategoriesManagerSectionProps {
  categories: ReturnType<typeof useCafeStore>['data']['categories'];
  items: MenuItem[];
  tokens: ReturnType<typeof getThemeTokens>;
  primaryColor: string;
  useEnglishDigits: boolean;
  onAddCategory: (name: string, emoji?: string) => void;
  onUpdateCategory: (id: string, patch: { name?: string; emoji?: string }) => void;
  onDeleteCategory: (id: string) => void;
  onReorderCategories: (orderedIds: string[]) => void;
  showToast: (msg: string) => void;
}

const CategoriesManagerSection: React.FC<CategoriesManagerSectionProps> = ({
  categories,
  items,
  tokens,
  primaryColor,
  useEnglishDigits,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onReorderCategories,
  showToast,
}) => {
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('☕');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmoji, setEditEmoji] = useState('');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...categories].sort((a, b) => a.order - b.order),
    [categories]
  );

  const moveByOffset = (idx: number, offset: -1 | 1) => {
    const target = idx + offset;
    if (target < 0 || target >= sorted.length) return;
    const ids = sorted.map((c) => c.id);
    const [removed] = ids.splice(idx, 1);
    ids.splice(target, 0, removed);
    onReorderCategories(ids);
  };

  const handleDropOn = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return;
    const ids = sorted.map((c) => c.id);
    const fromIdx = ids.indexOf(draggedId);
    const toIdx = ids.indexOf(targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    const [removed] = ids.splice(fromIdx, 1);
    ids.splice(toIdx, 0, removed);
    onReorderCategories(ids);
    setDraggedId(null);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onAddCategory(newName.trim(), newEmoji);
    setNewName('');
    showToast('دسته‌بندی جدید اضافه شد');
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">مدیریت دسته‌بندی‌ها</h1>
        <p className="mt-0.5 text-xs" style={{ color: tokens.muted }}>
          با کشیدن و رها کردن یا دکمه‌های بالا و پایین، ترتیب نمایش در منو را تغییر دهید.
        </p>
      </div>

      {/* Add Category Card */}
      <form
        onSubmit={handleCreate}
        className="rounded-2xl border p-4 space-y-3"
        style={{ borderColor: tokens.border, backgroundColor: tokens.surface }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {EMOJI_PRESETS.slice(0, 6).map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setNewEmoji(emoji)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-lg"
                style={
                  newEmoji === emoji
                    ? { borderColor: primaryColor, backgroundColor: tokens.surfaceAlt }
                    : { borderColor: tokens.border }
                }
              >
                {emoji}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="نام دسته‌بندی جدید (مثلاً: دمنوش‌ها)"
            className="min-h-[44px] flex-1 min-w-[200px] rounded-xl border px-3 text-sm"
            style={{ borderColor: tokens.border, backgroundColor: tokens.surfaceAlt }}
          />

          <button
            type="submit"
            disabled={!newName.trim()}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl px-4 text-xs font-bold disabled:opacity-40"
            style={{ backgroundColor: primaryColor, color: tokens.primaryText }}
          >
            <Plus className="h-4 w-4" />
            <span>افزودن</span>
          </button>
        </div>

        {/* Quick suggestions */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px]" style={{ color: tokens.muted }}>
            پیشنهاد سریع:
          </span>
          {QUICK_CATEGORY_SUGGESTIONS.filter(
            (sug) => !categories.some((c) => c.name === sug.name)
          ).map((sug) => (
            <button
              key={sug.name}
              type="button"
              onClick={() => {
                onAddCategory(sug.name, sug.emoji);
                showToast(`دسته «${sug.name}» اضافه شد`);
              }}
              className="min-h-[34px] rounded-lg border px-2.5 text-xs font-medium"
              style={{ borderColor: tokens.border, backgroundColor: tokens.surfaceAlt }}
            >
              + {sug.emoji} {sug.name}
            </button>
          ))}
        </div>
      </form>

      {/* Categories List */}
      <div className="space-y-2.5">
        {sorted.map((cat, idx) => {
          const itemCount = items.filter((i) => i.categoryId === cat.id).length;
          const isEditing = editingId === cat.id;

          return (
            <div
              key={cat.id}
              draggable={!isEditing}
              onDragStart={() => setDraggedId(cat.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDropOn(cat.id)}
              className="rounded-2xl border p-3.5 transition-shadow"
              style={{
                borderColor: draggedId === cat.id ? primaryColor : tokens.border,
                backgroundColor: tokens.surface,
              }}
            >
              {isEditing ? (
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={editEmoji}
                    onChange={(e) => setEditEmoji(e.target.value)}
                    className="h-11 w-14 rounded-xl border text-center text-lg"
                    style={{ borderColor: tokens.border, backgroundColor: tokens.surfaceAlt }}
                  />
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="min-h-[44px] flex-1 rounded-xl border px-3 text-sm"
                    style={{ borderColor: tokens.border, backgroundColor: tokens.surfaceAlt }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (editName.trim()) {
                        onUpdateCategory(cat.id, { name: editName.trim(), emoji: editEmoji || '🍽️' });
                        showToast('دسته‌بندی ویرایش شد');
                      }
                      setEditingId(null);
                    }}
                    className="min-h-[44px] rounded-xl px-4 text-xs font-bold"
                    style={{ backgroundColor: primaryColor, color: tokens.primaryText }}
                  >
                    ذخیره
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="min-h-[44px] rounded-xl border px-3 text-xs"
                    style={{ borderColor: tokens.border }}
                  >
                    انصراف
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="hidden sm:flex cursor-grab items-center opacity-45"
                      title="برای جابه‌جایی بکشید"
                    >
                      <GripVertical className="h-5 w-5" />
                    </span>
                    <span className="text-2xl">{cat.emoji}</span>
                    <div>
                      <div className="text-sm font-bold">{cat.name}</div>
                      <div className="text-xs tabular-nums" style={{ color: tokens.muted }}>
                        {formatNumber(itemCount, useEnglishDigits)} آیتم
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveByOffset(idx, -1)}
                      aria-label="انتقال به بالا"
                      className="flex h-11 w-11 items-center justify-center rounded-xl border disabled:opacity-30"
                      style={{ borderColor: tokens.border, backgroundColor: tokens.surfaceAlt }}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === sorted.length - 1}
                      onClick={() => moveByOffset(idx, 1)}
                      aria-label="انتقال به پایین"
                      className="flex h-11 w-11 items-center justify-center rounded-xl border disabled:opacity-30"
                      style={{ borderColor: tokens.border, backgroundColor: tokens.surfaceAlt }}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(cat.id);
                        setEditName(cat.name);
                        setEditEmoji(cat.emoji);
                      }}
                      aria-label={`ویرایش ${cat.name}`}
                      className="flex h-11 w-11 items-center justify-center rounded-xl border"
                      style={{ borderColor: tokens.border }}
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    {confirmDeleteId === cat.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteCategory(cat.id);
                            setConfirmDeleteId(null);
                            showToast(`دسته «${cat.name}» حذف شد`);
                          }}
                          className="min-h-[44px] rounded-xl bg-rose-600 px-3 text-xs font-bold text-white"
                        >
                          تایید حذف
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="min-h-[44px] rounded-xl border px-2.5 text-xs"
                          style={{ borderColor: tokens.border }}
                        >
                          لغو
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(cat.id)}
                        aria-label={`حذف ${cat.name}`}
                        className="flex h-11 w-11 items-center justify-center rounded-xl border text-rose-600"
                        style={{ borderColor: tokens.border }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ============================================================================
   3. SETTINGS & THEME & EXPORT/IMPORT & RESET DEMO DATA
============================================================================ */

interface SettingsSectionProps {
  cafe: ReturnType<typeof useCafeStore>['data']['cafe'];
  tokens: ReturnType<typeof getThemeTokens>;
  primaryColor: string;
  useEnglishDigits: boolean;
  setUseEnglishDigits: (v: boolean) => void;
  onUpdateCafe: (patch: Partial<CafeSettings>) => void;
  onChangePin: (pin: string) => void;
  exportJson: () => string;
  importJson: (jsonText: string) => { ok: boolean; error?: string };
  resetDemoData: () => void;
  onOpenWizard: () => void;
  showToast: (msg: string) => void;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({
  cafe,
  tokens,
  primaryColor,
  useEnglishDigits,
  setUseEnglishDigits,
  onUpdateCafe,
  onChangePin,
  exportJson,
  importJson,
  resetDemoData,
  onOpenWizard,
  showToast,
}) => {
  const [newPin, setNewPin] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const [importError, setImportError] = useState('');
  const jsonFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await compressImageToBase64(file, 400);
      onUpdateCafe({ logo: base64 });
      showToast('لوگوی کافه ذخیره شد');
    } catch {
      showToast('خطا در بارگذاری لوگو');
    }
  };

  const handleDownloadJson = () => {
    const content = exportJson();
    const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cafe-menu-${(cafe.name || 'backup').replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('فایل پشتیبان JSON دانلود شد');
  };

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError('');
    const reader = new FileReader();
    reader.onload = () => {
      const res = importJson(String(reader.result || ''));
      if (res.ok) {
        showToast('اطلاعات منو با موفقیت بازیابی شد');
      } else {
        setImportError(res.error || 'خطا در بازیابی فایل');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">ظاهر و تنظیمات کافه</h1>
          <p className="mt-0.5 text-xs" style={{ color: tokens.muted }}>
            تمام تغییرات به صورت زنده در منوی مشتری اعمال می‌شود.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenWizard}
          className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border px-3.5 text-xs font-semibold"
          style={{ borderColor: tokens.border, backgroundColor: tokens.surface }}
        >
          <Sparkles className="h-4 w-4" style={{ color: primaryColor }} />
          <span>اجرای راهنمای شروع</span>
        </button>
      </div>

      {/* Brand & Theme */}
      <section
        className="rounded-2xl border p-5 space-y-5"
        style={{ borderColor: tokens.border, backgroundColor: tokens.surface }}
      >
        <h2 className="text-base font-bold">هویت بصری و تم</h2>

        <div className="flex flex-wrap items-center gap-4">
          <div
            className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border"
            style={{ borderColor: tokens.border, backgroundColor: tokens.surfaceAlt }}
          >
            {cafe.logo ? (
              <img src={cafe.logo} alt={cafe.name} className="h-full w-full object-cover" />
            ) : (
              <Coffee className="h-8 w-8 opacity-40" />
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label
              className="inline-flex min-h-[42px] cursor-pointer items-center gap-1.5 rounded-xl border px-4 text-xs font-semibold"
              style={{ borderColor: tokens.border, backgroundColor: tokens.surfaceAlt }}
            >
              <Upload className="h-4 w-4" />
              <span>آپلود لوگو</span>
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="sr-only" />
            </label>
            {cafe.logo && (
              <button
                type="button"
                onClick={() => onUpdateCafe({ logo: '' })}
                className="min-h-[42px] rounded-xl px-3 text-xs font-medium text-rose-600"
              >
                حذف لوگو
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold">نام کافه</label>
            <input
              type="text"
              value={cafe.name}
              onChange={(e) => onUpdateCafe({ name: e.target.value })}
              className="min-h-[44px] w-full rounded-xl border px-3 text-sm"
              style={{ borderColor: tokens.border, backgroundColor: tokens.surfaceAlt }}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold">شعار یا معرفی کوتاه</label>
            <input
              type="text"
              value={cafe.slogan}
              onChange={(e) => onUpdateCafe({ slogan: e.target.value })}
              className="min-h-[44px] w-full rounded-xl border px-3 text-sm"
              style={{ borderColor: tokens.border, backgroundColor: tokens.surfaceAlt }}
            />
          </div>
        </div>

        {/* Color Swatches & Custom Pickers */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold">پالت رنگی پیشنهادی</label>
          <div className="flex flex-wrap gap-2">
            {COLOR_SWATCHES.map((sw) => (
              <button
                key={sw.name}
                type="button"
                onClick={() => onUpdateCafe({ primaryColor: sw.primary, accentColor: sw.accent })}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border px-3 text-xs font-medium"
                style={{
                  borderColor:
                    cafe.primaryColor === sw.primary ? sw.primary : tokens.border,
                  backgroundColor: tokens.surfaceAlt,
                }}
              >
                <span className="h-4 w-4 rounded-full" style={{ backgroundColor: sw.primary }} />
                <span className="h-4 w-4 rounded-full" style={{ backgroundColor: sw.accent }} />
                <span>{sw.name}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-1">
            <div>
              <label className="mb-1.5 block text-xs font-semibold">رنگ اصلی (Primary)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={cafe.primaryColor || '#6f2c3e'}
                  onChange={(e) => onUpdateCafe({ primaryColor: e.target.value })}
                  className="h-11 w-14 cursor-pointer rounded-xl border p-1"
                  style={{ borderColor: tokens.border }}
                />
                <span className="text-xs font-mono uppercase" dir="ltr">
                  {cafe.primaryColor}
                </span>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">رنگ مکمل (Accent)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={cafe.accentColor || '#b98055'}
                  onChange={(e) => onUpdateCafe({ accentColor: e.target.value })}
                  className="h-11 w-14 cursor-pointer rounded-xl border p-1"
                  style={{ borderColor: tokens.border }}
                />
                <span className="text-xs font-mono uppercase" dir="ltr">
                  {cafe.accentColor}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Background style & Font weight */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold">پس‌زمینه</label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'cream', label: 'کرم' },
                  { id: 'light', label: 'روشن' },
                  { id: 'dark', label: 'تیره' },
                ] as { id: BackgroundStyle; label: string }[]
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onUpdateCafe({ backgroundStyle: opt.id })}
                  className="min-h-[42px] rounded-xl border text-xs font-semibold"
                  style={
                    (cafe.backgroundStyle || 'cream') === opt.id
                      ? { backgroundColor: primaryColor, borderColor: primaryColor, color: tokens.primaryText }
                      : { borderColor: tokens.border, backgroundColor: tokens.surfaceAlt }
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold">وزن قلم</label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'normal', label: 'معمولی' },
                  { id: 'medium', label: 'متوسط' },
                  { id: 'bold', label: 'ضخیم' },
                ] as { id: FontWeightOption; label: string }[]
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onUpdateCafe({ fontWeight: opt.id })}
                  className="min-h-[42px] rounded-xl border text-xs font-semibold"
                  style={
                    (cafe.fontWeight || 'medium') === opt.id
                      ? { backgroundColor: primaryColor, borderColor: primaryColor, color: tokens.primaryText }
                      : { borderColor: tokens.border, backgroundColor: tokens.surfaceAlt }
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t pt-4" style={{ borderColor: tokens.border }}>
          <div>
            <div className="text-sm font-semibold">نمایش اعداد انگلیسی (123)</div>
            <div className="text-xs" style={{ color: tokens.muted }}>
              به صورت پیش‌فرض قیمت‌ها با ارقام فارسی نمایش داده می‌شوند
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={useEnglishDigits}
            onClick={() => setUseEnglishDigits(!useEnglishDigits)}
            className="min-h-[40px] rounded-xl border px-4 text-xs font-bold"
            style={
              useEnglishDigits
                ? { backgroundColor: primaryColor, borderColor: primaryColor, color: tokens.primaryText }
                : { borderColor: tokens.border, backgroundColor: tokens.surfaceAlt }
            }
          >
            {useEnglishDigits ? 'انگلیسی' : 'فارسی'}
          </button>
        </div>
      </section>

      {/* Contact & Hours */}
      <section
        className="rounded-2xl border p-5 space-y-4"
        style={{ borderColor: tokens.border, backgroundColor: tokens.surface }}
      >
        <h2 className="text-base font-bold">اطلاعات تماس و ساعت کاری</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold">ساعت کاری</label>
            <input
              type="text"
              value={cafe.workingHours}
              onChange={(e) => onUpdateCafe({ workingHours: e.target.value })}
              placeholder="هر روز ۸:۳۰ تا ۲۳:۰۰"
              className="min-h-[44px] w-full rounded-xl border px-3 text-sm"
              style={{ borderColor: tokens.border, backgroundColor: tokens.surfaceAlt }}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold">شماره تماس</label>
            <input
              type="text"
              dir="ltr"
              value={cafe.phone}
              onChange={(e) => onUpdateCafe({ phone: e.target.value })}
              placeholder="02188451234"
              className="min-h-[44px] w-full rounded-xl border px-3 text-sm text-left"
              style={{ borderColor: tokens.border, backgroundColor: tokens.surfaceAlt }}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold">اینستاگرام (نام کاربری)</label>
            <input
              type="text"
              dir="ltr"
              value={cafe.instagram}
              onChange={(e) => onUpdateCafe({ instagram: e.target.value })}
              placeholder="caferose.tehran"
              className="min-h-[44px] w-full rounded-xl border px-3 text-sm text-left"
              style={{ borderColor: tokens.border, backgroundColor: tokens.surfaceAlt }}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold">رمز وای‌فای کافه</label>
            <input
              type="text"
              dir="ltr"
              value={cafe.wifiPassword}
              onChange={(e) => onUpdateCafe({ wifiPassword: e.target.value })}
              placeholder="RoseCoffee2026"
              className="min-h-[44px] w-full rounded-xl border px-3 text-sm text-left"
              style={{ borderColor: tokens.border, backgroundColor: tokens.surfaceAlt }}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold">لینک نقشه (Google Maps / نشان)</label>
            <input
              type="url"
              dir="ltr"
              value={cafe.mapLink}
              onChange={(e) => onUpdateCafe({ mapLink: e.target.value })}
              className="min-h-[44px] w-full rounded-xl border px-3 text-sm text-left"
              style={{ borderColor: tokens.border, backgroundColor: tokens.surfaceAlt }}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold">آدرس</label>
            <input
              type="text"
              value={cafe.address}
              onChange={(e) => onUpdateCafe({ address: e.target.value })}
              className="min-h-[44px] w-full rounded-xl border px-3 text-sm"
              style={{ borderColor: tokens.border, backgroundColor: tokens.surfaceAlt }}
            />
          </div>
        </div>
      </section>

      {/* PIN Change & Backup & Reset */}
      <section
        className="rounded-2xl border p-5 space-y-5"
        style={{ borderColor: tokens.border, backgroundColor: tokens.surface }}
      >
        <h2 className="text-base font-bold">امنیت و پشتیبان‌گیری</h2>

        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[180px]">
            <label className="mb-1.5 block text-xs font-semibold">تغییر پین ۴ رقمی مدیریت</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={newPin}
              onChange={(e) => setNewPin(toEnglishDigits(e.target.value).replace(/\D/g, '').slice(0, 4))}
              placeholder="پین جدید (۴ رقم)"
              className="min-h-[44px] w-full rounded-xl border px-3 text-sm"
              style={{ borderColor: tokens.border, backgroundColor: tokens.surfaceAlt }}
            />
          </div>
          <button
            type="button"
            disabled={newPin.length !== 4}
            onClick={() => {
              onChangePin(newPin);
              setNewPin('');
            }}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl px-4 text-xs font-bold disabled:opacity-40"
            style={{ backgroundColor: primaryColor, color: tokens.primaryText }}
          >
            <KeyRound className="h-4 w-4" />
            <span>ذخیره پین</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 border-t pt-4" style={{ borderColor: tokens.border }}>
          <button
            type="button"
            onClick={handleDownloadJson}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border px-4 text-xs font-semibold"
            style={{ borderColor: tokens.border, backgroundColor: tokens.surfaceAlt }}
          >
            <Download className="h-4 w-4" style={{ color: primaryColor }} />
            <span>خروجی کامل (JSON)</span>
          </button>

          <button
            type="button"
            onClick={() => jsonFileInputRef.current?.click()}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border px-4 text-xs font-semibold"
            style={{ borderColor: tokens.border, backgroundColor: tokens.surfaceAlt }}
          >
            <Upload className="h-4 w-4" style={{ color: primaryColor }} />
            <span>بازیابی از فایل JSON</span>
          </button>
          <input
            ref={jsonFileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleImportJsonFile}
            className="sr-only"
          />

          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border px-4 text-xs font-semibold text-rose-600"
              style={{ borderColor: tokens.border }}
            >
              <RotateCcw className="h-4 w-4" />
              <span>بازنشانی داده‌های نمونه</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  resetDemoData();
                  setConfirmReset(false);
                }}
                className="min-h-[44px] rounded-xl bg-rose-600 px-4 text-xs font-bold text-white"
              >
                تایید بازنشانی «کافه رز»
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="min-h-[44px] rounded-xl border px-3 text-xs"
                style={{ borderColor: tokens.border }}
              >
                انصراف
              </button>
            </div>
          )}
        </div>

        {importError && <p className="text-xs font-medium text-rose-600">{importError}</p>}
      </section>
    </div>
  );
};

/* ============================================================================
   4. QR & SHARE SCREEN (A6 PRINTABLE TABLE-TENT + PNG DOWNLOAD)
============================================================================ */

interface QrShareSectionProps {
  cafe: ReturnType<typeof useCafeStore>['data']['cafe'];
  tokens: ReturnType<typeof getThemeTokens>;
  primaryColor: string;
  showToast: (msg: string) => void;
}

const QrShareSection: React.FC<QrShareSectionProps> = ({
  cafe,
  tokens,
  primaryColor,
  showToast,
}) => {
  const defaultUrl = useMemo(() => `${window.location.origin}/`, []);
  const [menuUrl, setMenuUrl] = useState(defaultUrl);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [isExportingPng, setIsExportingPng] = useState(false);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(menuUrl || defaultUrl, {
      width: 600,
      margin: 1,
      color: {
        dark: '#18181b',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [menuUrl, defaultUrl]);

  const handleDownloadPng = async () => {
    if (!qrDataUrl) return;
    setIsExportingPng(true);
    try {
      // A6 300dpi portrait aspect: 1240 x 1748
      const width = 1240;
      const height = 1748;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Background
      ctx.fillStyle = '#faf6f0';
      ctx.fillRect(0, 0, width, height);

      // Top decorative bar
      ctx.fillStyle = primaryColor;
      ctx.fillRect(0, 0, width, 44);

      // Subtle inner border
      ctx.strokeStyle = 'rgba(31,25,22,0.12)';
      ctx.lineWidth = 4;
      ctx.strokeRect(56, 86, width - 112, height - 142);

      // Logo if available
      let currentY = 175;
      if (cafe.logo) {
        try {
          const logoImg = await loadImageForCanvas(cafe.logo);
          const logoSize = 180;
          const logoX = (width - logoSize) / 2;
          ctx.save();
          roundRectPath(ctx, logoX, currentY, logoSize, logoSize, 36);
          ctx.clip();
          ctx.drawImage(logoImg, logoX, currentY, logoSize, logoSize);
          ctx.restore();
          currentY += logoSize + 52;
        } catch {
          currentY += 30;
        }
      }

      // Cafe Name
      ctx.fillStyle = '#1f1916';
      ctx.textAlign = 'center';
      ctx.font = 'bold 68px Vazirmatn, sans-serif';
      ctx.fillText(cafe.name || 'منوی کافه', width / 2, currentY);
      currentY += 58;

      if (cafe.slogan) {
        ctx.fillStyle = '#6e5f56';
        ctx.font = '400 32px Vazirmatn, sans-serif';
        ctx.fillText(cafe.slogan.slice(0, 48), width / 2, currentY);
        currentY += 70;
      } else {
        currentY += 30;
      }

      // QR card container
      const qrBoxSize = 620;
      const qrBoxX = (width - qrBoxSize) / 2;
      const qrBoxY = Math.max(currentY, 520);

      ctx.fillStyle = '#ffffff';
      roundRectPath(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 40);
      ctx.fill();
      ctx.strokeStyle = 'rgba(31,25,22,0.08)';
      ctx.lineWidth = 3;
      ctx.stroke();

      const qrImg = await loadImageForCanvas(qrDataUrl);
      ctx.drawImage(qrImg, qrBoxX + 46, qrBoxY + 46, qrBoxSize - 92, qrBoxSize - 92);

      // Callout pill/label below QR
      const calloutY = qrBoxY + qrBoxSize + 100;
      ctx.fillStyle = primaryColor;
      ctx.font = 'bold 54px Vazirmatn, sans-serif';
      ctx.fillText('منو را اسکن کنید', width / 2, calloutY);

      // Footer details (Wi-Fi / Instagram)
      let footerY = calloutY + 90;
      ctx.fillStyle = '#6e5f56';
      ctx.font = '500 30px Vazirmatn, sans-serif';
      if (cafe.wifiPassword) {
        ctx.fillText(`Wi-Fi: ${cafe.wifiPassword}`, width / 2, footerY);
        footerY += 48;
      }
      if (cafe.instagram) {
        ctx.fillText(`Instagram: @${cafe.instagram.replace(/^@/, '')}`, width / 2, footerY);
      }

      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = `table-tent-A6-${(cafe.name || 'menu').replace(/\s+/g, '-')}.png`;
      a.click();
      showToast('فایل PNG استند رومیزی A6 دانلود شد');
    } finally {
      setIsExportingPng(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">کد QR و استند رومیزی (A6)</h1>
        <p className="mt-0.5 text-xs" style={{ color: tokens.muted }}>
          استند آماده چاپ را دانلود یا مستقیم روی کاغذ A6 پرینت بگیرید.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Controls */}
        <div
          className="rounded-2xl border p-5 space-y-4 self-start"
          style={{ borderColor: tokens.border, backgroundColor: tokens.surface }}
        >
          <div>
            <label className="mb-1.5 block text-xs font-semibold">آدرس منوی عمومی</label>
            <input
              type="url"
              dir="ltr"
              value={menuUrl}
              onChange={(e) => setMenuUrl(e.target.value)}
              className="min-h-[44px] w-full rounded-xl border px-3 text-sm text-left"
              style={{ borderColor: tokens.border, backgroundColor: tokens.surfaceAlt }}
            />
          </div>

          <div className="flex flex-wrap gap-2.5 pt-2">
            <button
              type="button"
              disabled={!qrDataUrl || isExportingPng}
              onClick={handleDownloadPng}
              className="inline-flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-xl px-4 text-xs font-bold"
              style={{ backgroundColor: primaryColor, color: tokens.primaryText }}
            >
              <Download className="h-4 w-4" />
              <span>{isExportingPng ? 'در حال ساخت PNG...' : 'دانلود استند A6 (PNG)'}</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl border px-4 text-xs font-semibold"
              style={{ borderColor: tokens.border, backgroundColor: tokens.surfaceAlt }}
            >
              <Printer className="h-4 w-4" />
              <span>چاپ A6</span>
            </button>
          </div>
        </div>

        {/* Printable Table-Tent A6 Card */}
        <div className="flex justify-center">
          <div
            id="printable-table-tent"
            className="flex aspect-[105/148] w-full max-w-[330px] flex-col items-center justify-between overflow-hidden rounded-2xl border bg-[#faf6f0] p-6 text-center text-[#1f1916] shadow-md"
            style={{ borderColor: tokens.border }}
          >
            <div className="w-full">
              <div
                className="mx-auto mb-4 h-2 w-24 rounded-full"
                style={{ backgroundColor: primaryColor }}
              />
              {cafe.logo && (
                <img
                  src={cafe.logo}
                  alt={cafe.name}
                  className="mx-auto mb-3 h-16 w-16 rounded-2xl object-cover shadow-xs"
                />
              )}
              <h2 className="text-xl font-extrabold">{cafe.name || 'نام کافه'}</h2>
              {cafe.slogan && (
                <p className="mt-1 text-xs text-[#6e5f56]">{cafe.slogan}</p>
              )}
            </div>

            <div className="my-4 rounded-2xl border border-black/10 bg-white p-3.5 shadow-xs">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="کد QR منو" className="h-44 w-44" />
              ) : (
                <div className="h-44 w-44 skeleton-shimmer rounded-xl" />
              )}
            </div>

            <div className="w-full space-y-2">
              <div className="text-lg font-extrabold" style={{ color: primaryColor }}>
                منو را اسکن کنید
              </div>
              <div className="text-[11px] text-[#6e5f56] space-y-0.5">
                {cafe.wifiPassword && <div dir="ltr">Wi-Fi: {cafe.wifiPassword}</div>}
                {cafe.instagram && <div dir="ltr">@{cafe.instagram.replace(/^@/, '')}</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   5. FIRST-RUN 3-STEP ONBOARDING WIZARD
============================================================================ */

interface OnboardingWizardModalProps {
  cafe: ReturnType<typeof useCafeStore>['data']['cafe'];
  categories: ReturnType<typeof useCafeStore>['data']['categories'];
  items: MenuItem[];
  tokens: ReturnType<typeof getThemeTokens>;
  primaryColor: string;
  useEnglishDigits: boolean;
  onUpdateCafe: (patch: Partial<CafeSettings>) => void;
  onAddCategory: (name: string, emoji?: string) => void;
  onDeleteCategory: (id: string) => void;
  onAddItem: (item: Omit<MenuItem, 'id' | 'order'>) => void;
  onClose: () => void;
  showToast: (msg: string) => void;
}

const OnboardingWizardModal: React.FC<OnboardingWizardModalProps> = ({
  cafe,
  categories,
  items,
  tokens,
  primaryColor,
  useEnglishDigits,
  onUpdateCafe,
  onAddCategory,
  onDeleteCategory,
  onAddItem,
  onClose,
  showToast,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [customCatName, setCustomCatName] = useState('');
  const [quickItemName, setQuickItemName] = useState('');
  const [quickItemPrice, setQuickItemPrice] = useState('');
  const [quickItemCatId, setQuickItemCatId] = useState(categories[0]?.id || '');

  useEffect(() => {
    if (categories.length > 0 && !categories.some((c) => c.id === quickItemCatId)) {
      setQuickItemCatId(categories[0].id);
    }
  }, [categories, quickItemCatId]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await compressImageToBase64(file, 400);
      onUpdateCafe({ logo: base64 });
    } catch {
      showToast('خطا در آپلود لوگو');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="راه‌اندازی اولیه کافه"
    >
      <motion.div
        initial={{ y: 36, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 36, opacity: 0 }}
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border shadow-2xl sm:rounded-3xl"
        style={{ backgroundColor: tokens.surface, borderColor: tokens.border, color: tokens.text }}
      >
        <div
          className="flex items-center justify-between border-b px-5 py-4"
          style={{ borderColor: tokens.border }}
        >
          <div>
            <h2 className="text-base font-bold">راه‌اندازی سریع کافه</h2>
            <p className="text-xs" style={{ color: tokens.muted }}>
              گام {formatNumber(step, useEnglishDigits)} از {formatNumber(3, useEnglishDigits)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[38px] rounded-xl px-3 text-xs font-medium"
            style={{ color: tokens.muted }}
          >
            رد کردن
          </button>
        </div>

        {/* Step Indicator Bar */}
        <div className="grid grid-cols-3 gap-1.5 px-5 pt-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className="h-1.5 rounded-full transition-colors"
              style={{
                backgroundColor: s <= step ? primaryColor : tokens.surfaceAlt,
              }}
            />
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold">۱. نام، لوگو و رنگ کافه</h3>

              <div className="flex items-center gap-3">
                <div
                  className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border"
                  style={{ borderColor: tokens.border, backgroundColor: tokens.surfaceAlt }}
                >
                  {cafe.logo ? (
                    <img src={cafe.logo} alt={cafe.name} className="h-full w-full object-cover" />
                  ) : (
                    <Coffee className="h-7 w-7 opacity-40" />
                  )}
                </div>
                <label
                  className="inline-flex min-h-[42px] cursor-pointer items-center gap-1.5 rounded-xl border px-3.5 text-xs font-semibold"
                  style={{ borderColor: tokens.border, backgroundColor: tokens.surfaceAlt }}
                >
                  <Upload className="h-4 w-4" />
                  <span>انتخاب لوگو</span>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="sr-only" />
                </label>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold">نام کافه</label>
                <input
                  type="text"
                  value={cafe.name}
                  onChange={(e) => onUpdateCafe({ name: e.target.value })}
                  className="min-h-[44px] w-full rounded-xl border px-3 text-sm"
                  style={{ borderColor: tokens.border, backgroundColor: tokens.surfaceAlt }}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold">انتخاب پالت رنگ</label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_SWATCHES.map((sw) => (
                    <button
                      key={sw.name}
                      type="button"
                      onClick={() => onUpdateCafe({ primaryColor: sw.primary, accentColor: sw.accent })}
                      className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border px-3 text-xs font-medium"
                      style={{
                        borderColor: cafe.primaryColor === sw.primary ? sw.primary : tokens.border,
                        backgroundColor: tokens.surfaceAlt,
                      }}
                    >
                      <span className="h-4 w-4 rounded-full" style={{ backgroundColor: sw.primary }} />
                      <span>{sw.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold">۲. دسته‌بندی‌های منو</h3>
              <p className="text-xs" style={{ color: tokens.muted }}>
                روی پیشنهادهای آماده بزنید تا به منو اضافه یا حذف شوند:
              </p>

              <div className="flex flex-wrap gap-2">
                {QUICK_CATEGORY_SUGGESTIONS.map((sug) => {
                  const existing = categories.find((c) => c.name === sug.name);
                  return (
                    <button
                      key={sug.name}
                      type="button"
                      onClick={() => {
                        if (existing) {
                          onDeleteCategory(existing.id);
                        } else {
                          onAddCategory(sug.name, sug.emoji);
                        }
                      }}
                      className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border px-3.5 text-xs font-semibold"
                      style={
                        existing
                          ? { backgroundColor: primaryColor, borderColor: primaryColor, color: tokens.primaryText }
                          : { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }
                      }
                    >
                      <span>{sug.emoji}</span>
                      <span>{sug.name}</span>
                      {existing && <Check className="h-3.5 w-3.5" />}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={customCatName}
                  onChange={(e) => setCustomCatName(e.target.value)}
                  placeholder="یا نام دسته‌بندی دلخواه بنویسید..."
                  className="min-h-[44px] flex-1 rounded-xl border px-3 text-sm"
                  style={{ borderColor: tokens.border, backgroundColor: tokens.surfaceAlt }}
                />
                <button
                  type="button"
                  disabled={!customCatName.trim()}
                  onClick={() => {
                    onAddCategory(customCatName.trim(), CATEGORY_EMOJI_MAP[customCatName.trim()] || '🍽️');
                    setCustomCatName('');
                  }}
                  className="min-h-[44px] rounded-xl px-4 text-xs font-bold disabled:opacity-40"
                  style={{ backgroundColor: primaryColor, color: tokens.primaryText }}
                >
                  افزودن
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold">۳. افزودن اولین آیتم‌ها</h3>
              <p className="text-xs" style={{ color: tokens.muted }}>
                در حال حاضر {formatNumber(items.length, useEnglishDigits)} آیتم در منو ثبت شده است. می‌توانید آیتم جدید هم اضافه کنید:
              </p>

              <div className="space-y-3 rounded-2xl border p-3.5" style={{ borderColor: tokens.border }}>
                <select
                  value={quickItemCatId}
                  onChange={(e) => setQuickItemCatId(e.target.value)}
                  className="min-h-[44px] w-full rounded-xl border px-3 text-sm"
                  style={{ borderColor: tokens.border, backgroundColor: tokens.surfaceAlt }}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.emoji} {c.name}
                    </option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={quickItemName}
                    onChange={(e) => setQuickItemName(e.target.value)}
                    placeholder="نام آیتم"
                    className="min-h-[44px] rounded-xl border px-3 text-sm"
                    style={{ borderColor: tokens.border, backgroundColor: tokens.surfaceAlt }}
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={quickItemPrice}
                    onChange={(e) => setQuickItemPrice(e.target.value)}
                    placeholder="قیمت (تومان)"
                    className="min-h-[44px] rounded-xl border px-3 text-sm tabular-nums"
                    style={{ borderColor: tokens.border, backgroundColor: tokens.surfaceAlt }}
                  />
                </div>
                <button
                  type="button"
                  disabled={!quickItemName.trim() || !quickItemCatId}
                  onClick={() => {
                    const price = parseInt(toEnglishDigits(quickItemPrice).replace(/[^\d]/g, ''), 10) || 0;
                    onAddItem({
                      categoryId: quickItemCatId,
                      name: quickItemName.trim(),
                      description: '',
                      price,
                      image: '',
                      available: true,
                      tags: [],
                    });
                    setQuickItemName('');
                    setQuickItemPrice('');
                    showToast('آیتم اضافه شد');
                  }}
                  className="min-h-[42px] w-full rounded-xl text-xs font-bold disabled:opacity-40"
                  style={{ backgroundColor: primaryColor, color: tokens.primaryText }}
                >
                  + ثبت آیتم در منو
                </button>
              </div>
            </div>
          )}
        </div>

        <div
          className="flex items-center justify-between border-t px-5 py-4"
          style={{ borderColor: tokens.border }}
        >
          <button
            type="button"
            disabled={step === 1}
            onClick={() => setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : s))}
            className="min-h-[44px] rounded-xl border px-4 text-xs font-semibold disabled:opacity-30"
            style={{ borderColor: tokens.border }}
          >
            مرحله قبل
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)}
              className="min-h-[44px] rounded-xl px-5 text-xs font-bold"
              style={{ backgroundColor: primaryColor, color: tokens.primaryText }}
            >
              مرحله بعد
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] rounded-xl px-5 text-xs font-bold"
              style={{ backgroundColor: primaryColor, color: tokens.primaryText }}
            >
              تکمیل و ورود به پنل
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

/* ---------------- Canvas Helpers ---------------- */

function loadImageForCanvas(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
