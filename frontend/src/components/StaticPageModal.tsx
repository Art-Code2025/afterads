import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';

interface StaticPage {
  id: string | number; // Allow both string and number to match Dashboard
  title: string;
  slug: string;
  content: string;
  metaDescription?: string;
  isActive: boolean;
  showInFooter: boolean;
  createdAt: string;
  updatedAt?: string;
}

interface StaticPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pageData: any) => void;
  editingPage?: StaticPage | null;
}

const StaticPageModal: React.FC<StaticPageModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingPage
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [newPage, setNewPage] = useState({
    title: '',
    slug: '',
    content: '',
    metaDescription: '',
    isActive: true,
    showInFooter: true,
    imageFile: null as File | null,
    imageUrl: ''
  });

  // تحديث البيانات عندما يتغير editingPage أو يفتح المودال
  useEffect(() => {
    if (isOpen) {
      if (editingPage) {
        setNewPage({
          title: editingPage.title || '',
          slug: editingPage.slug || '',
          content: editingPage.content || '',
          metaDescription: editingPage.metaDescription || '',
          isActive: editingPage.isActive ?? true,
          showInFooter: editingPage.showInFooter ?? true,
          imageFile: null,
          imageUrl: ''
        });
      } else {
        // إعادة تعيين القيم للصفحة الجديدة
        setNewPage({
          title: '',
          slug: '',
          content: '',
          metaDescription: '',
          isActive: true,
          showInFooter: true,
          imageFile: null,
          imageUrl: ''
        });
      }
    }
  }, [editingPage, isOpen]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleImageUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      setNewPage(prev => ({ ...prev, imageFile: file, imageUrl }));
      toast.success('تم رفع الصورة بنجاح');
    };
    reader.readAsDataURL(file);
  };

  const insertTextAtCursor = (text: string) => {
    const textarea = document.getElementById('pageContent') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = textarea.value.substring(0, start) + text + textarea.value.substring(end);
      setNewPage(prev => ({ ...prev, content: newText }));
      
      // Reset cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + text.length, start + text.length);
      }, 0);
    }
  };

  const formatText = (format: string) => {
    const textarea = document.getElementById('pageContent') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    let formattedText = '';

    switch (format) {
      case 'bold':
        formattedText = `<strong>${selectedText || 'نص عريض'}</strong>`;
        break;
      case 'italic':
        formattedText = `<em>${selectedText || 'نص مائل'}</em>`;
        break;
      case 'underline':
        formattedText = `<u>${selectedText || 'نص مسطر'}</u>`;
        break;
      case 'h1':
        formattedText = `<h1>${selectedText || 'عنوان رئيسي'}</h1>`;
        break;
      case 'h2':
        formattedText = `<h2>${selectedText || 'عنوان فرعي'}</h2>`;
        break;
      case 'h3':
        formattedText = `<h3>${selectedText || 'عنوان فرعي صغير'}</h3>`;
        break;
      case 'ul':
        formattedText = `<ul>\n  <li>عنصر القائمة الأول</li>\n  <li>عنصر القائمة الثاني</li>\n</ul>`;
        break;
      case 'ol':
        formattedText = `<ol>\n  <li>العنصر الأول</li>\n  <li>العنصر الثاني</li>\n</ol>`;
        break;
      case 'blockquote':
        formattedText = `<blockquote class="border-r-4 border-gray-300 pr-4 py-2 my-4 italic text-gray-700">${selectedText || 'اقتباس مهم'}</blockquote>`;
        break;
      case 'alert':
        formattedText = `<div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded my-4">\n  <strong>تنبيه:</strong> ${selectedText || 'رسالة مهمة هنا'}\n</div>`;
        break;
      case 'hr':
        formattedText = `<hr class="my-6 border-gray-300" />`;
        break;
    }

    const newText = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
    setNewPage(prev => ({ ...prev, content: newText }));
  };

  const getWordCount = (text: string) => {
    return text.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // تحقق من الحقول المطلوبة: العنوان والرابط والمحتوى
    if (!newPage.title.trim()) {
      toast.error('يرجى إدخال عنوان الصفحة');
      return;
    }
    
    if (!newPage.slug.trim()) {
      toast.error('يرجى إدخال رابط الصفحة');
      return;
    }
    
    if (!newPage.content.trim()) {
      toast.error('يرجى إدخال محتوى الصفحة');
      return;
    }
    
    // إرسال البيانات الأساسية فقط - تم التحقق منها بالفعل
    const pageData = {
      title: newPage.title.trim(),
      slug: newPage.slug.trim(),
      content: newPage.content.trim(),
      metaDescription: newPage.metaDescription.trim(),
      isActive: newPage.isActive,
      showInFooter: newPage.showInFooter
    };
    
    // Update the Dashboard's newPage state with validated data
    // This ensures Dashboard savePage function receives valid data
    onSave(pageData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-black">
              {editingPage ? 'تعديل الصفحة' : 'إضافة صفحة جديدة'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  عنوان الصفحة *
                </label>
                <input
                  type="text"
                  value={newPage.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setNewPage(prev => ({
                      ...prev,
                      title,
                      slug: generateSlug(title)
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="مثال: من نحن"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  الرابط (Slug) *
                </label>
                <input
                  type="text"
                  value={newPage.slug}
                  onChange={(e) => setNewPage(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="about-us"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                وصف الصفحة (Meta Description)
              </label>
              <textarea
                value={newPage.metaDescription}
                onChange={(e) => setNewPage(prev => ({ ...prev, metaDescription: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="وصف مختصر للصفحة يظهر في نتائج البحث"
              />
            </div>

            {/* Image Upload */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">صورة الصفحة الرئيسية</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-blue-800 mb-2">
                    رفع صورة من الجهاز
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-blue-600 mt-1">الحد الأقصى: 5 ميجابايت</p>
                </div>
                {newPage.imageUrl && (
                  <div className="mt-4">
                    <img
                      src={newPage.imageUrl}
                      alt="معاينة الصورة"
                      className="max-w-xs h-32 object-cover rounded-lg border border-blue-300"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Rich Text Editor */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-black mb-4">محرر النصوص *</h3>
              
              {/* Toolbar */}
              <div className="space-y-3 mb-4">
                {/* Basic Formatting */}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => formatText('bold')}
                    className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-100 transition-colors font-bold text-black"
                    title="عريض"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    onClick={() => formatText('italic')}
                    className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-100 transition-colors italic text-black"
                    title="مائل"
                  >
                    I
                  </button>
                  <button
                    type="button"
                    onClick={() => formatText('underline')}
                    className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-100 transition-colors underline text-black"
                    title="مسطر"
                  >
                    U
                  </button>
                </div>

                {/* Headings */}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => formatText('h1')}
                    className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-100 transition-colors text-black"
                    title="عنوان رئيسي"
                  >
                    H1
                  </button>
                  <button
                    type="button"
                    onClick={() => formatText('h2')}
                    className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-100 transition-colors text-black"
                    title="عنوان فرعي"
                  >
                    H2
                  </button>
                  <button
                    type="button"
                    onClick={() => formatText('h3')}
                    className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-100 transition-colors text-black"
                    title="عنوان فرعي صغير"
                  >
                    H3
                  </button>
                </div>

                {/* Lists and Links */}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => formatText('ul')}
                    className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-100 transition-colors text-black"
                    title="قائمة نقطية"
                  >
                    • قائمة
                  </button>
                  <button
                    type="button"
                    onClick={() => formatText('ol')}
                    className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-100 transition-colors text-black"
                    title="قائمة مرقمة"
                  >
                    1. قائمة
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const url = prompt('أدخل الرابط:');
                      if (url) {
                        const text = prompt('أدخل نص الرابط:') || url;
                        insertTextAtCursor(`<a href="${url}" target="_blank" style="color: #2563eb; text-decoration: underline;">${text}</a>`);
                      }
                    }}
                    className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-100 transition-colors text-black"
                    title="إضافة رابط"
                  >
                    🔗 رابط
                  </button>
                </div>

                {/* Advanced Elements */}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => formatText('blockquote')}
                    className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-100 transition-colors text-black"
                    title="اقتباس"
                  >
                    "
                  </button>
                  <button
                    type="button"
                    onClick={() => formatText('alert')}
                    className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-100 transition-colors text-black"
                    title="تنبيه"
                  >
                    ⚠️
                  </button>
                  <button
                    type="button"
                    onClick={() => formatText('hr')}
                    className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-100 transition-colors text-black"
                    title="خط فاصل"
                  >
                    ―
                  </button>
                  <label className="px-3 py-1 bg-blue-500 text-white border border-blue-500 rounded text-sm hover:bg-blue-600 cursor-pointer inline-flex items-center">
                    📷 صورة من الجهاز
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            toast.error('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
                            return;
                          }
                          
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const imageUrl = event.target?.result as string;
                            const alt = prompt('أدخل وصف الصورة (اختياري):') || 'صورة';
                            insertTextAtCursor(`<img src="${imageUrl}" alt="${alt}" style="max-width: 100%; height: auto; margin: 20px 0; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">\n`);
                            toast.success('تم إضافة الصورة بنجاح');
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Preview Toggle and Word Count */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-black">عدد الكلمات:</span>
                    <span className="text-sm font-semibold text-blue-600">
                      {getWordCount(newPage.content)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                  >
                    {showPreview ? 'إخفاء المعاينة' : 'معاينة مباشرة'}
                  </button>
                </div>
              </div>

              {/* Editor and Preview */}
              <div className={`flex ${showPreview ? 'divide-x divide-gray-300' : ''}`}>
                <div className={showPreview ? 'w-1/2' : 'w-full'}>
                  <textarea
                    id="pageContent"
                    value={newPage.content}
                    onChange={(e) => setNewPage(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full h-96 p-4 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    style={{ 
                      whiteSpace: 'pre-wrap',
                      direction: 'rtl',
                      textAlign: 'right',
                      color: '#000000'
                    }}
                    placeholder="ابدأ كتابة محتوى الصفحة هنا...

يمكنك استخدام HTML أو الكتابة العادية. استخدم الأزرار أعلاه لإضافة التنسيق.

كل سطر جديد تكتبه سيظهر في سطر منفصل في الصفحة النهائية."
                    required
                  />
                </div>
                {showPreview && (
                  <div className="w-1/2 p-4 bg-gray-50 overflow-y-auto h-96">
                    <h4 className="text-sm font-semibold text-black mb-3">معاينة المحتوى:</h4>
                    <div 
                      className="prose prose-sm max-w-none"
                      style={{
                        whiteSpace: 'pre-wrap',
                        direction: 'rtl',
                        textAlign: 'right',
                        color: '#000000',
                        lineHeight: '1.8'
                      }}
                      dangerouslySetInnerHTML={{ __html: newPage.content }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Page Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={newPage.isActive}
                  onChange={(e) => setNewPage(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="mr-2 block text-sm text-black">
                  صفحة نشطة
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showInFooter"
                  checked={newPage.showInFooter}
                  onChange={(e) => setNewPage(prev => ({ ...prev, showInFooter: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="showInFooter" className="mr-2 block text-sm text-black">
                  إظهار في الفوتر
                </label>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-black bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-black border border-transparent rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                {editingPage ? 'تحديث الصفحة' : 'إنشاء الصفحة'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StaticPageModal;