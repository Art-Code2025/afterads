// تحويل النص العربي والإنجليزي إلى slug احترافي
export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    // استبدال المسافات بشرطات
    .replace(/\s+/g, '-')
    // إزالة الأحرف الخاصة
    .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-z0-9\-]/g, '')
    // إزالة الشرطات المتعددة
    .replace(/-+/g, '-')
    // إزالة الشرطات من البداية والنهاية
    .replace(/^-+|-+$/g, '');
};

// إنشاء رابط احترافي للمنتج
export const createProductSlug = (id: string | number, name: string): string => {
  const slug = slugify(name);
  return slug ? `${slug}-${id}` : `product-${id}`;
};

// إنشاء رابط احترافي للفئة
export const createCategorySlug = (id: string | number, name: string): string => {
  const slug = slugify(name);
  return slug ? `${slug}-${id}` : `category-${id}`;
};

// استخراج ID من slug
export const extractIdFromSlug = (slug: string): string => {
  const match = slug.match(/-([a-zA-Z0-9]+)$/);
  return match ? match[1] : '0';
};

// التحقق من صحة slug
export const isValidSlug = (slug: string): boolean => {
  // يجب أن ينتهي بـ dash متبوعاً بـ ID (أرقام أو أحرف)
  return /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-z0-9\-]+-[a-zA-Z0-9]+$/.test(slug);
};
