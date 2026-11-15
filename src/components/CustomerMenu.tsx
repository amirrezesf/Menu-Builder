import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Check,
  Clock,
  Coffee,
  Copy,
  Instagram,
  MapPin,
  Minus,
  Phone,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Wifi,
  X,
} from 'lucide-react';
import {
  formatNumber,
  formatPrice,
  getThemeTokens,
  normalizePersian,
  useCafeStore,
} from '../store';
import { ALL_TAGS, ItemTag, MenuItem, TAG_LABELS } from '../types';

interface CustomerMenuProps {
  onNavigateAdmin?: () => void;
  isPreview?: boolean;
}

const TAG_ICONS: Partial<Record<ItemTag, string>> = {
  bestseller: '★',
  new: '✦',
  vegan: '🌿',
  spicy: '🌶️',
  'sugar-free': '◇',
};

export const CustomerMenu: React.FC<CustomerMenuProps> = ({
  onNavigateAdmin,
  isPreview = false,
}) => {
  const {
    data,
    useEnglishDigits,
    setUseEnglishDigits,
    picks,
    addPick,
    decrementPick,
    clearPicks,
  } = useCafeStore();

  const { cafe, categories, items } = data;
  const tokens = useMemo(() => getThemeTokens(cafe), [cafe]);

  const [isLoading, setIsLoading] = useState(!isPreview);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<ItemTag | 'all'>('all');
  const [activeCategoryId, setActiveCategoryId] = useState<string>('');
  const [detailItem, setDetailItem] = useState<MenuItem | null>(null);
  const [isPicksOpen, setIsPicksOpen] = useState(false);
  const [wifiCopied, setWifiCopied] = useState(false);

  const rootScrollRef = useRef<HTMLDivElement | null>(null);
  const categorySectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const tabButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const isManualScrollingRef = useRef(false);

  useEffect(() => {
    if (isPreview) {
      setIsLoading(false);
      return;
    }
    const timer = window.setTimeout(() => setIsLoading(false), 260);
    return () => window.clearTimeout(timer);
  }, [isPreview]);

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.order - b.order),
    [categories]
  );

  useEffect(() => {
    if (sortedCategories.length > 0 && !activeCategoryId) {
      setActiveCategoryId(sortedCategories[0].id);
    }
  }, [sortedCategories, activeCategoryId]);

  const filteredItemsByCategory = useMemo(() => {
    const q = normalizePersian(searchQuery);
    const map = new Map<string, MenuItem[]>();

    sortedCategories.forEach((cat) => {
      const catItems = items
        .filter((item) => item.categoryId === cat.id)
        .filter((item) => {
          if (selectedTag !== 'all' && !item.tags.includes(selectedTag)) return false;
          if (!q) return true;
          const haystack = normalizePersian(`${item.name} ${item.description}`);
          return haystack.includes(q);
        })
        .sort((a, b) => a.order - b.order);

      if (catItems.length > 0) {
        map.set(cat.id, catItems);
      }
    });

    return map;
  }, [items, sortedCategories, searchQuery, selectedTag]);

  const visibleCategories = useMemo(
    () => sortedCategories.filter((cat) => filteredItemsByCategory.has(cat.id)),
    [sortedCategories, filteredItemsByCategory]
  );

  // Scroll-spy to highlight sticky category tab as user scrolls
  useEffect(() => {
    if (visibleCategories.length === 0) return;

    const handleScroll = () => {
      if (isManualScrollingRef.current) return;
      const offset = isPreview ? 110 : 120;
      let currentId = visibleCategories[0].id;

      for (const cat of visibleCategories) {
        const el = categorySectionRefs.current[cat.id];
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const containerTop =
          isPreview && rootScrollRef.current
            ? rootScrollRef.current.getBoundingClientRect().top
            : 0;
        if (rect.top - containerTop <= offset) {
          currentId = cat.id;
        }
      }
      setActiveCategoryId((prev) => (prev === currentId ? prev : currentId));
    };

    const target: EventTarget =
      isPreview && rootScrollRef.current ? rootScrollRef.current : window;
    target.addEventListener('scroll', handleScroll, { passive: true });
    return () => target.removeEventListener('scroll', handleScroll);
  }, [visibleCategories, isPreview]);

  // Keep active tab centered horizontally in tab strip
  useEffect(() => {
    const btn = tabButtonRefs.current[activeCategoryId];
    if (btn) {
      btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [activeCategoryId]);

  const scrollToCategory = (catId: string) => {
    setActiveCategoryId(catId);
    const el = categorySectionRefs.current[catId];
    if (!el) return;
    isManualScrollingRef.current = true;

    if (isPreview && rootScrollRef.current) {
      const container = rootScrollRef.current;
      const topPos =
        el.getBoundingClientRect().top -
        container.getBoundingClientRect().top +
        container.scrollTop -
        64;
      container.scrollTo({ top: Math.max(0, topPos), behavior: 'smooth' });
    } else {
      const y = el.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    }

    window.setTimeout(() => {
      isManualScrollingRef.current = false;
    }, 550);
  };

  const getPickQty = (itemId: string) =>
    picks.find((p) => p.itemId === itemId)?.quantity || 0;

  const pickSummary = useMemo(() => {
    const itemMap = new Map(items.map((i) => [i.id, i]));
    let totalCount = 0;
    let totalPrice = 0;
    const detailed = picks
      .map((entry) => {
        const item = itemMap.get(entry.itemId);
        if (!item) return null;
        totalCount += entry.quantity;
        totalPrice += item.price * entry.quantity;
        return { item, quantity: entry.quantity };
      })
      .filter((x): x is { item: MenuItem; quantity: number } => x !== null);
    return { totalCount, totalPrice, detailed };
  }, [picks, items]);

  const handleCopyWifi = async () => {
    if (!cafe.wifiPassword) return;
    try {
      await navigator.clipboard.writeText(cafe.wifiPassword);
      setWifiCopied(true);
      window.setTimeout(() => setWifiCopied(false), 2000);
    } catch {
      // Fallback ignored
    }
  };

  const availableTagsInMenu = useMemo(() => {
    const set = new Set<ItemTag>();
    items.forEach((i) => i.tags.forEach((t) => set.add(t)));
    return ALL_TAGS.filter((t) => set.has(t));
  }, [items]);

  const primaryColor = cafe.primaryColor || '#6f2c3e';
  const accentColor = cafe.accentColor || '#b98055';

  const containerStyle: React.CSSProperties = {
    backgroundColor: tokens.bg,
    color: tokens.text,
    fontWeight: Number(tokens.weightVal),
  };

  const formatInstagramHref = (handle: string) => {
    const clean = handle.trim().replace(/^@/, '');
    if (clean.startsWith('http')) return clean;
    return `https://instagram.com/${clean}`;
  };

  const hasContactActions = Boolean(
    cafe.instagram.trim() || cafe.mapLink.trim() || cafe.phone.trim() || cafe.wifiPassword.trim()
  );

  return (
    <div
      ref={rootScrollRef}
      dir="rtl"
      style={containerStyle}
      className={
        isPreview
          ? 'relative h-full w-full overflow-y-auto no-scrollbar pb-24 transition-colors duration-200'
          : 'min-h-screen w-full pb-28 transition-colors duration-200'
      }
    >
      {/* Boutique Cafe Hero Header */}
      <header
        className="relative border-b"
        style={{
          borderColor: tokens.border,
          backgroundColor: tokens.surface,
        }}
      >
        <div
          className={`mx-auto px-4 pt-5 pb-5 ${
            isPreview ? 'max-w-md' : 'max-w-5xl sm:px-6 lg:px-8 sm:pt-7 sm:pb-6'
          }`}
        >
          {/* Top utility strip: Working hours + Digits toggle */}
          <div className="mb-4 flex items-center justify-between gap-3">
            {cafe.workingHours ? (
              <div
                className="flex items-center gap-1.5 text-xs sm:text-sm"
                style={{ color: tokens.muted }}
              >
                <Clock className="h-3.5 w-3.5 shrink-0" style={{ color: accentColor }} />
                <span className="truncate">{cafe.workingHours}</span>
              </div>
            ) : (
              <span />
            )}

            <button
              type="button"
              onClick={() => setUseEnglishDigits(!useEnglishDigits)}
              aria-label="تغییر نوع اعداد فارسی یا انگلیسی"
              className="min-h-[36px] shrink-0 rounded-lg border px-2.5 py-1 text-xs font-medium tabular-nums transition-colors"
              style={{
                borderColor: tokens.border,
                backgroundColor: tokens.surfaceAlt,
                color: tokens.text,
              }}
            >
              {useEnglishDigits ? 'اعداد فارسی (۱۲۳)' : 'English (123)'}
            </button>
          </div>

          {/* Cafe Brand Lockup */}
          <div className="flex items-center gap-4">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border sm:h-20 sm:w-20"
              style={{
                borderColor: tokens.border,
                backgroundColor: tokens.surfaceAlt,
              }}
            >
              {cafe.logo ? (
                <img
                  src={cafe.logo}
                  alt={cafe.name || 'لوگوی کافه'}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              ) : (
                <Coffee className="h-8 w-8" style={{ color: primaryColor }} />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h1
                className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl"
                style={{ color: tokens.text, textWrap: 'balance' }}
              >
                {cafe.name || 'نام کافه'}
              </h1>
              {cafe.slogan && (
                <p
                  className="mt-1 text-sm leading-relaxed sm:text-base"
                  style={{ color: tokens.muted }}
                >
                  {cafe.slogan}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons: Instagram, Map, Call, Wi-Fi */}
          {hasContactActions && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {cafe.instagram.trim() && (
                <a
                  href={formatInstagramHref(cafe.instagram)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium whitespace-nowrap transition-transform active:scale-[0.98] sm:text-sm"
                  style={{
                    borderColor: tokens.border,
                    backgroundColor: tokens.surfaceAlt,
                    color: tokens.text,
                  }}
                >
                  <Instagram className="h-4 w-4 shrink-0" style={{ color: primaryColor }} />
                  <span>اینستاگرام</span>
                </a>
              )}

              {cafe.mapLink.trim() && (
                <a
                  href={cafe.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium whitespace-nowrap transition-transform active:scale-[0.98] sm:text-sm"
                  style={{
                    borderColor: tokens.border,
                    backgroundColor: tokens.surfaceAlt,
                    color: tokens.text,
                  }}
                >
                  <MapPin className="h-4 w-4 shrink-0" style={{ color: primaryColor }} />
                  <span>مسیریابی</span>
                </a>
              )}

              {cafe.phone.trim() && (
                <a
                  href={`tel:${cafe.phone.trim()}`}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium whitespace-nowrap transition-transform active:scale-[0.98] sm:text-sm"
                  style={{
                    borderColor: tokens.border,
                    backgroundColor: tokens.surfaceAlt,
                    color: tokens.text,
                  }}
                >
                  <Phone className="h-4 w-4 shrink-0" style={{ color: primaryColor }} />
                  <span>تماس</span>
                </a>
              )}

              {cafe.wifiPassword.trim() && (
                <button
                  type="button"
                  onClick={handleCopyWifi}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium whitespace-nowrap transition-transform active:scale-[0.98] sm:text-sm"
                  style={{
                    borderColor: tokens.border,
                    backgroundColor: tokens.surfaceAlt,
                    color: tokens.text,
                  }}
                >
                  {wifiCopied ? (
                    <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                  ) : (
                    <Wifi className="h-4 w-4 shrink-0" style={{ color: accentColor }} />
                  )}
                  <span className="tabular-nums">
                    {wifiCopied ? 'رمز کپی شد' : `وای‌فای: ${cafe.wifiPassword}`}
                  </span>
                  {!wifiCopied && <Copy className="h-3.5 w-3.5 opacity-55" />}
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Sticky Category Tabs (compact height <= 56px to respect mobile sticky budget) */}
      {sortedCategories.length > 0 && (
        <nav
          aria-label="دسته‌بندی‌های منو"
          className="sticky top-0 z-30 border-b backdrop-blur-md"
          style={{
            borderColor: tokens.border,
            backgroundColor: tokens.isDark ? 'rgba(19,17,16,0.88)' : 'rgba(255,255,255,0.88)',
          }}
        >
          <div
            className={`mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar px-4 py-2 ${
              isPreview ? 'max-w-md' : 'max-w-5xl sm:px-6 lg:px-8'
            }`}
          >
            {(visibleCategories.length > 0 ? visibleCategories : sortedCategories).map((cat) => {
              const isActive = activeCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  ref={(el) => {
                    tabButtonRefs.current[cat.id] = el;
                  }}
                  type="button"
                  onClick={() => scrollToCategory(cat.id)}
                  className="inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all sm:text-sm"
                  style={
                    isActive
                      ? {
                          backgroundColor: primaryColor,
                          color: tokens.primaryText,
                        }
                      : {
                          backgroundColor: tokens.surfaceAlt,
                          color: tokens.text,
                        }
                  }
                >
                  <span aria-hidden="true">{cat.emoji}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {/* Search & Tag Filters */}
      <section
        className={`mx-auto px-4 pt-4 ${
          isPreview ? 'max-w-md' : 'max-w-5xl sm:px-6 lg:px-8 sm:pt-6'
        }`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Input */}
          <div className="relative flex-1 sm:max-w-md">
            <Search
              className="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2"
              style={{ color: tokens.muted }}
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جست‌وجو در نام یا توضیحات..."
              aria-label="جستجو در منو"
              className="min-h-[44px] w-full rounded-xl border pr-10 pl-10 text-sm transition-colors"
              style={{
                borderColor: tokens.border,
                backgroundColor: tokens.surface,
                color: tokens.text,
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="پاک کردن جستجو"
                className="absolute top-1/2 left-1.5 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg"
                style={{ color: tokens.muted }}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Interactive Tag Filter Buttons */}
          {availableTagsInMenu.length > 0 && (
            <div
              role="group"
              aria-label="فیلتر برچسب‌ها"
              className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5"
            >
              <button
                type="button"
                onClick={() => setSelectedTag('all')}
                className="min-h-[40px] shrink-0 rounded-xl border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors"
                style={
                  selectedTag === 'all'
                    ? {
                        backgroundColor: accentColor,
                        borderColor: accentColor,
                        color: tokens.accentText,
                      }
                    : {
                        backgroundColor: tokens.surface,
                        borderColor: tokens.border,
                        color: tokens.muted,
                      }
                }
              >
                همه
              </button>
              {availableTagsInMenu.map((tag) => {
                const active = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(active ? 'all' : tag)}
                    className="min-h-[40px] shrink-0 rounded-xl border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors"
                    style={
                      active
                        ? {
                            backgroundColor: accentColor,
                            borderColor: accentColor,
                            color: tokens.accentText,
                          }
                        : {
                            backgroundColor: tokens.surface,
                            borderColor: tokens.border,
                            color: tokens.text,
                          }
                    }
                  >
                    {TAG_LABELS[tag]}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Main Menu Body */}
      <main
        className={`mx-auto px-4 pt-5 pb-10 ${
          isPreview ? 'max-w-md' : 'max-w-5xl sm:px-6 lg:px-8 sm:pt-7'
        }`}
      >
        {isLoading ? (
          <div className="space-y-8">
            {[1, 2].map((sectionIdx) => (
              <div key={sectionIdx} className="space-y-4">
                <div className="h-7 w-36 rounded-lg skeleton-shimmer" />
                <div className={isPreview ? 'grid grid-cols-1 gap-3.5' : 'grid grid-cols-1 gap-4 md:grid-cols-2'}>
                  {[1, 2, 3, 4].map((cardIdx) => (
                    <div
                      key={cardIdx}
                      className="flex gap-3.5 rounded-2xl border p-3.5"
                      style={{ borderColor: tokens.border, backgroundColor: tokens.surface }}
                    >
                      <div className="h-24 w-24 shrink-0 rounded-xl skeleton-shimmer" />
                      <div className="flex flex-1 flex-col justify-between py-1">
                        <div className="space-y-2">
                          <div className="h-4 w-3/5 rounded skeleton-shimmer" />
                          <div className="h-3 w-full rounded skeleton-shimmer" />
                        </div>
                        <div className="h-4 w-24 rounded skeleton-shimmer" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : visibleCategories.length === 0 ? (
          <div
            className="my-8 rounded-3xl border px-6 py-12 text-center"
            style={{ borderColor: tokens.border, backgroundColor: tokens.surface }}
          >
            <Coffee className="mx-auto mb-3 h-10 w-10 opacity-40" />
            <p className="text-base font-semibold">آیتمی با این مشخصات پیدا نشد</p>
            <p className="mt-1 text-sm" style={{ color: tokens.muted }}>
              عبارت جست‌وجو یا فیلتر انتخاب‌شده را تغییر دهید.
            </p>
            {(searchQuery || selectedTag !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTag('all');
                }}
                className="mt-4 min-h-[44px] rounded-xl px-5 py-2 text-sm font-semibold"
                style={{ backgroundColor: primaryColor, color: tokens.primaryText }}
              >
                نمایش همه آیتم‌ها
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-10">
            {visibleCategories.map((cat) => {
              const catItems = filteredItemsByCategory.get(cat.id) || [];
              return (
                <section
                  key={cat.id}
                  ref={(el) => {
                    categorySectionRefs.current[cat.id] = el;
                  }}
                  aria-labelledby={`cat-heading-${cat.id}`}
                >
                  <div className="mb-4 flex items-baseline justify-between border-b pb-2.5" style={{ borderColor: tokens.border }}>
                    <h2
                      id={`cat-heading-${cat.id}`}
                      className="flex items-center gap-2 text-lg font-bold sm:text-xl"
                    >
                      <span aria-hidden="true">{cat.emoji}</span>
                      <span>{cat.name}</span>
                    </h2>
                    <span className="text-xs tabular-nums" style={{ color: tokens.muted }}>
                      {formatNumber(catItems.length, useEnglishDigits)} مورد
                    </span>
                  </div>

                  <div
                    className={
                      isPreview
                        ? 'grid grid-cols-1 gap-3.5'
                        : 'grid grid-cols-1 gap-4 md:grid-cols-2'
                    }
                  >
                    {catItems.map((item) => {
                      const qty = getPickQty(item.id);
                      return (
                        <MenuItemCard
                          key={item.id}
                          item={item}
                          categoryEmoji={cat.emoji}
                          qty={qty}
                          tokens={tokens}
                          primaryColor={primaryColor}
                          accentColor={accentColor}
                          useEnglishDigits={useEnglishDigits}
                          onOpenDetail={() => setDetailItem(item)}
                          onAdd={() => addPick(item.id)}
                          onDecrement={() => decrementPick(item.id)}
                        />
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>

      {/* Cafe Address & Discreet Footer */}
      <footer
        className="mx-auto border-t px-4 py-6 text-center text-xs sm:px-6"
        style={{
          borderColor: tokens.border,
          color: tokens.muted,
          maxWidth: isPreview ? '28rem' : '64rem',
        }}
      >
        {cafe.address && <p className="mb-2 leading-relaxed">{cafe.address}</p>}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span>{cafe.name}</span>
          {!isPreview && onNavigateAdmin && (
            <>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={onNavigateAdmin}
                className="min-h-[36px] underline-offset-4 hover:underline"
                style={{ color: tokens.muted }}
              >
                مدیریت منو
              </button>
            </>
          )}
        </div>
      </footer>

      {/* Floating "لیست انتخاب من" Bar */}
      <AnimatePresence>
        {pickSummary.totalCount > 0 && (
          <motion.div
            initial={{ y: 72, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 72, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={
              isPreview
                ? 'sticky bottom-3 z-40 mx-auto w-[calc(100%-24px)]'
                : 'fixed bottom-4 left-1/2 z-40 w-[calc(100%-24px)] max-w-md -translate-x-1/2'
            }
          >
            <button
              type="button"
              onClick={() => setIsPicksOpen(true)}
              className="flex min-h-[54px] w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 shadow-lg transition-transform active:scale-[0.98]"
              style={{
                backgroundColor: primaryColor,
                color: tokens.primaryText,
              }}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="flex h-7 min-w-[28px] items-center justify-center rounded-lg px-2 text-xs font-bold tabular-nums"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                  }}
                >
                  {formatNumber(pickSummary.totalCount, useEnglishDigits)}
                </span>
                <div className="text-right">
                  <div className="text-sm font-bold leading-tight">لیست انتخاب من</div>
                  <div className="text-[11px] opacity-85">سفارش از طریق گارسون</div>
                </div>
              </div>
              <span className="text-sm font-bold tabular-nums whitespace-nowrap">
                {formatPrice(pickSummary.totalPrice, useEnglishDigits)}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Item Detail Bottom Sheet */}
      <AnimatePresence>
        {detailItem && (
          <div
            className={
              isPreview
                ? 'absolute inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-[2px]'
                : 'fixed inset-0 z-50 flex items-end justify-center bg-black/55 backdrop-blur-xs sm:items-center sm:p-4'
            }
            onClick={() => setDetailItem(null)}
            role="dialog"
            aria-modal="true"
            aria-label={detailItem.name}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg overflow-hidden rounded-t-3xl border shadow-2xl sm:rounded-3xl"
              style={{
                backgroundColor: tokens.surface,
                borderColor: tokens.border,
                color: tokens.text,
              }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div className="h-1.5 w-10 rounded-full bg-current opacity-20" />
              </div>

              <div className="relative aspect-[4/3] w-full overflow-hidden" style={{ backgroundColor: tokens.surfaceAlt }}>
                {detailItem.image ? (
                  <img
                    src={detailItem.image}
                    alt={detailItem.name}
                    referrerPolicy="no-referrer"
                    className={`h-full w-full object-cover ${!detailItem.available ? 'grayscale opacity-60' : ''}`}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-6xl">
                    {categories.find((c) => c.id === detailItem.categoryId)?.emoji || '☕'}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setDetailItem(null)}
                  aria-label="بستن جزئیات"
                  className="absolute top-3 left-3 flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
                >
                  <X className="h-5 w-5" />
                </button>

                {!detailItem.available && (
                  <div className="absolute bottom-3 right-3 rounded-xl bg-black/80 px-3 py-1.5 text-xs font-bold text-white">
                    تموم شد
                  </div>
                )}
              </div>

              <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg font-bold sm:text-xl">{detailItem.name}</h3>
                  <span
                    className="shrink-0 text-base font-bold tabular-nums sm:text-lg"
                    style={{ color: primaryColor }}
                  >
                    {formatPrice(detailItem.price, useEnglishDigits)}
                  </span>
                </div>

                {detailItem.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs" style={{ color: accentColor }}>
                    {detailItem.tags.map((tag, idx) => (
                      <React.Fragment key={tag}>
                        {idx > 0 && <span aria-hidden="true">·</span>}
                        <span>
                          {TAG_ICONS[tag]} {TAG_LABELS[tag]}
                        </span>
                      </React.Fragment>
                    ))}
                  </div>
                )}

                {detailItem.description && (
                  <p className="mt-3 text-sm leading-7" style={{ color: tokens.muted }}>
                    {detailItem.description}
                  </p>
                )}

                <div className="mt-6">
                  {!detailItem.available ? (
                    <div
                      className="flex min-h-[48px] w-full items-center justify-center rounded-xl border text-sm font-semibold"
                      style={{
                        borderColor: tokens.border,
                        backgroundColor: tokens.surfaceAlt,
                        color: tokens.muted,
                      }}
                    >
                      این آیتم در حال حاضر تموم شده است
                    </div>
                  ) : getPickQty(detailItem.id) === 0 ? (
                    <button
                      type="button"
                      onClick={() => addPick(detailItem.id)}
                      className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold transition-transform active:scale-[0.98]"
                      style={{
                        backgroundColor: primaryColor,
                        color: tokens.primaryText,
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      <span>افزودن به لیست انتخاب من</span>
                    </button>
                  ) : (
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium" style={{ color: tokens.muted }}>
                        تعداد در لیست انتخاب شما:
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => decrementPick(detailItem.id)}
                          aria-label="کاهش تعداد"
                          className="flex h-11 w-11 items-center justify-center rounded-xl border"
                          style={{ borderColor: tokens.border, backgroundColor: tokens.surfaceAlt }}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="min-w-[28px] text-center text-base font-bold tabular-nums">
                          {formatNumber(getPickQty(detailItem.id), useEnglishDigits)}
                        </span>
                        <button
                          type="button"
                          onClick={() => addPick(detailItem.id)}
                          aria-label="افزایش تعداد"
                          className="flex h-11 w-11 items-center justify-center rounded-xl"
                          style={{ backgroundColor: primaryColor, color: tokens.primaryText }}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* "لیست انتخاب من" Bottom Sheet */}
      <AnimatePresence>
        {isPicksOpen && (
          <div
            className={
              isPreview
                ? 'absolute inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-[2px]'
                : 'fixed inset-0 z-50 flex items-end justify-center bg-black/55 backdrop-blur-xs sm:items-center sm:p-4'
            }
            onClick={() => setIsPicksOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="لیست انتخاب من"
          >
            <motion.div
              initial={{ y: 70, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 70, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border shadow-2xl sm:rounded-3xl"
              style={{
                backgroundColor: tokens.surface,
                borderColor: tokens.border,
                color: tokens.text,
              }}
            >
              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div className="h-1.5 w-10 rounded-full bg-current opacity-20" />
              </div>

              <div
                className="flex items-center justify-between border-b px-5 py-4"
                style={{ borderColor: tokens.border }}
              >
                <div>
                  <h3 className="text-lg font-bold">لیست انتخاب من</h3>
                  <p className="mt-0.5 text-xs font-medium" style={{ color: accentColor }}>
                    سفارش از طریق گارسون
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  {pickSummary.totalCount > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        clearPicks();
                        setIsPicksOpen(false);
                      }}
                      className="flex min-h-[40px] items-center gap-1 rounded-xl px-2.5 text-xs font-medium transition-colors hover:bg-red-500/10 text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>پاک کردن</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsPicksOpen(false)}
                    aria-label="بستن لیست"
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: tokens.surfaceAlt }}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4">
                <div
                  className="mb-4 flex items-center gap-2.5 rounded-2xl border px-3.5 py-2.5 text-xs leading-relaxed"
                  style={{
                    borderColor: tokens.border,
                    backgroundColor: tokens.surfaceAlt,
                    color: tokens.text,
                  }}
                >
                  <Sparkles className="h-4 w-4 shrink-0" style={{ color: primaryColor }} />
                  <span>
                    این لیست فقط برای یادداشت شخصی شماست؛ لطفاً هنگام ثبت سفارش به گارسون نشان دهید.
                  </span>
                </div>

                {pickSummary.detailed.length === 0 ? (
                  <p className="py-8 text-center text-sm" style={{ color: tokens.muted }}>
                    هنوز آیتمی به لیست اضافه نکرده‌اید.
                  </p>
                ) : (
                  <ul className="divide-y" style={{ borderColor: tokens.border }}>
                    {pickSummary.detailed.map(({ item, quantity }) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between gap-3 py-3"
                        style={{ borderColor: tokens.border }}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold">{item.name}</div>
                          <div className="mt-0.5 text-xs tabular-nums" style={{ color: tokens.muted }}>
                            {formatPrice(item.price * quantity, useEnglishDigits)}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => decrementPick(item.id)}
                            aria-label={`کاهش تعداد ${item.name}`}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border"
                            style={{ borderColor: tokens.border, backgroundColor: tokens.surfaceAlt }}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="min-w-[24px] text-center text-sm font-bold tabular-nums">
                            {formatNumber(quantity, useEnglishDigits)}
                          </span>
                          <button
                            type="button"
                            onClick={() => addPick(item.id)}
                            aria-label={`افزایش تعداد ${item.name}`}
                            className="flex h-10 w-10 items-center justify-center rounded-xl"
                            style={{ backgroundColor: primaryColor, color: tokens.primaryText }}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div
                className="border-t px-5 py-4"
                style={{ borderColor: tokens.border, backgroundColor: tokens.surfaceAlt }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: tokens.muted }}>
                    جمع کل ({formatNumber(pickSummary.totalCount, useEnglishDigits)} مورد)
                  </span>
                  <span className="text-base font-bold tabular-nums" style={{ color: primaryColor }}>
                    {formatPrice(pickSummary.totalPrice, useEnglishDigits)}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface MenuItemCardProps {
  item: MenuItem;
  categoryEmoji: string;
  qty: number;
  tokens: ReturnType<typeof getThemeTokens>;
  primaryColor: string;
  accentColor: string;
  useEnglishDigits: boolean;
  onOpenDetail: () => void;
  onAdd: () => void;
  onDecrement: () => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  categoryEmoji,
  qty,
  tokens,
  primaryColor,
  accentColor,
  useEnglishDigits,
  onOpenDetail,
  onAdd,
  onDecrement,
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <article
      className={`group relative flex gap-3.5 rounded-2xl border p-3.5 transition-all duration-150 ${
        item.available ? 'hover:-translate-y-0.5 hover:shadow-sm' : 'opacity-60'
      }`}
      style={{
        borderColor: tokens.border,
        backgroundColor: tokens.surface,
      }}
    >
      {/* Card click area for bottom sheet */}
      <div
        role="button"
        tabIndex={0}
        onClick={onOpenDetail}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpenDetail();
          }
        }}
        className="flex min-w-0 flex-1 cursor-pointer gap-3.5 text-right"
      >
        {/* Thumbnail or Emoji Placeholder */}
        <div
          className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl sm:h-28 sm:w-28"
          style={{ backgroundColor: tokens.surfaceAlt }}
        >
          {item.image && !imgError ? (
            <img
              src={item.image}
              alt={item.name}
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                !item.available ? 'grayscale' : ''
              }`}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl sm:text-4xl">
              <span aria-hidden="true">{categoryEmoji}</span>
            </div>
          )}

          {!item.available && (
            <span className="absolute inset-x-1.5 bottom-1.5 rounded-lg bg-black/80 py-0.5 text-center text-[11px] font-bold text-white">
              تموم شد
            </span>
          )}
        </div>

        {/* Text Info */}
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold leading-snug sm:text-base" style={{ color: tokens.text }}>
              {item.name}
            </h3>

            {item.tags.length > 0 && (
              <div
                className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] font-medium"
                style={{ color: accentColor }}
              >
                {item.tags.map((tag, idx) => (
                  <React.Fragment key={tag}>
                    {idx > 0 && <span aria-hidden="true">·</span>}
                    <span>{TAG_LABELS[tag]}</span>
                  </React.Fragment>
                ))}
              </div>
            )}

            {item.description && (
              <p
                className="mt-1.5 line-clamp-2 text-xs leading-relaxed"
                style={{ color: tokens.muted }}
              >
                {item.description}
              </p>
            )}
          </div>

          <div className="mt-2.5 flex items-center justify-between gap-2">
            <span
              className="text-sm font-bold tabular-nums sm:text-base"
              style={{ color: item.available ? primaryColor : tokens.muted }}
            >
              {formatPrice(item.price, useEnglishDigits)}
            </span>
          </div>
        </div>
      </div>

      {/* Add / Quantity Controls (isolated from card click) */}
      {item.available && (
        <div className="flex flex-col justify-end self-end">
          {qty === 0 ? (
            <button
              type="button"
              onClick={onAdd}
              aria-label={`افزودن ${item.name} به لیست انتخاب من`}
              className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform active:scale-95"
              style={{
                backgroundColor: tokens.surfaceAlt,
                color: primaryColor,
              }}
            >
              <Plus className="h-5 w-5" />
            </button>
          ) : (
            <div
              className="flex items-center gap-1 rounded-xl p-0.5"
              style={{ backgroundColor: tokens.surfaceAlt }}
            >
              <button
                type="button"
                onClick={onDecrement}
                aria-label={`کاهش تعداد ${item.name}`}
                className="flex h-9 w-9 items-center justify-center rounded-lg"
                style={{ color: tokens.text }}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-[20px] text-center text-xs font-bold tabular-nums">
                {formatNumber(qty, useEnglishDigits)}
              </span>
              <button
                type="button"
                onClick={onAdd}
                aria-label={`افزودن یک عدد ${item.name}`}
                className="flex h-9 w-9 items-center justify-center rounded-lg"
                style={{ backgroundColor: primaryColor, color: tokens.primaryText }}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  );
};
