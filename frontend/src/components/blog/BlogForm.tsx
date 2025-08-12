import React, { useState, useEffect } from 'react';
import { blogAPI } from '../../utils/api';
import type { BlogPost } from '../../types/blog';
import { Save, X, Upload, Eye, EyeOff, Tag, User, Clock, FileText, Image as ImageIcon, Sparkles } from 'lucide-react';

interface BlogFormProps {
  initial?: BlogPost | null;
  onSaved: () => void;
  onCancel: () => void;
}

const BlogForm: React.FC<BlogFormProps> = ({ initial, onSaved, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    coverImageUrl: '',
    tags: [] as string[],
    author: '',
    readTime: 3,
    published: false,
    metaDescription: ''
  });
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (initial) {
      setFormData({
        title: initial.title || '',
        slug: initial.slug || '',
        content: initial.content || '',
        coverImageUrl: initial.coverImageUrl || '',
        tags: initial.tags || [],
        author: initial.author || '',
        readTime: initial.readTime || 3,
        published: initial.published || false,
        metaDescription: initial.metaDescription || ''
      });
    }
  }, [initial]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (initial?.id) {
        await blogAPI.update(initial.id, formData);
      } else {
        await blogAPI.create(formData);
      }
      onSaved();
    } catch (error) {
      console.error('Error saving blog post:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Controls */}
      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-dark-50 to-dark-100 rounded-2xl border border-dark-200">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 font-medium ${
              previewMode 
                ? 'bg-gradient-to-r from-dark-400 to-dark-500 text-white shadow-lg' 
                : 'bg-white text-dark-600 border border-dark-200 hover:bg-dark-50'
            }`}
          >
            {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {previewMode ? 'إخفاء المعاينة' : 'معاينة'}
          </button>
          
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="published"
              checked={formData.published}
              onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
              className="w-5 h-5 text-dark-600 border-dark-300 rounded focus:ring-dark-500 focus:ring-2"
            />
            <label htmlFor="published" className="text-dark-700 font-semibold cursor-pointer">
              نشر المقال
            </label>
          </div>
        </div>
        
        <div className="text-sm text-dark-500">
          <span className="font-medium">عدد الكلمات: </span>
          <span className="text-dark-700 font-bold">{formData.content.split(' ').filter(word => word.length > 0).length}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Title and Slug */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-dark-700 font-bold text-lg">
              <FileText className="w-5 h-5 text-dark-500" />
              عنوان المقال
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full px-6 py-4 border-2 border-dark-200 rounded-2xl focus:ring-4 focus:ring-dark-300/20 focus:border-dark-400 transition-all duration-300 text-dark-800 font-medium text-lg"
              placeholder="أدخل عنوان المقال..."
              required
            />
          </div>
          
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-dark-700 font-bold text-lg">
              <Sparkles className="w-5 h-5 text-dark-500" />
              الرابط (Slug)
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              className="w-full px-6 py-4 border-2 border-dark-200 rounded-2xl focus:ring-4 focus:ring-dark-300/20 focus:border-dark-400 transition-all duration-300 text-dark-800 font-medium"
              placeholder="blog-post-url"
              required
            />
          </div>
        </div>

        {/* Cover Image */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-dark-700 font-bold text-lg">
            <ImageIcon className="w-5 h-5 text-dark-500" />
            صورة الغلاف
          </label>
          <div className="relative">
            <input
              type="url"
              value={formData.coverImageUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, coverImageUrl: e.target.value }))}
              className="w-full px-6 py-4 border-2 border-dark-200 rounded-2xl focus:ring-4 focus:ring-dark-300/20 focus:border-dark-400 transition-all duration-300 text-dark-800"
              placeholder="رابط صورة الغلاف..."
            />
            {formData.coverImageUrl && (
              <div className="mt-4 relative rounded-2xl overflow-hidden border-2 border-dark-200">
                <img 
                  src={formData.coverImageUrl} 
                  alt="معاينة صورة الغلاف" 
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Meta Description */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-dark-700 font-bold text-lg">
            <FileText className="w-5 h-5 text-dark-500" />
            وصف المقال (Meta Description)
          </label>
          <textarea
            value={formData.metaDescription}
            onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
            className="w-full px-6 py-4 border-2 border-dark-200 rounded-2xl focus:ring-4 focus:ring-dark-300/20 focus:border-dark-400 transition-all duration-300 text-dark-800 resize-none"
            rows={3}
            placeholder="وصف مختصر للمقال يظهر في نتائث البحث..."
            maxLength={160}
          />
          <div className="text-sm text-dark-500 text-left">
            {formData.metaDescription.length}/160 حرف
          </div>
        </div>

        {/* Author and Read Time */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-dark-700 font-bold text-lg">
              <User className="w-5 h-5 text-dark-500" />
              الكاتب
            </label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
              className="w-full px-6 py-4 border-2 border-dark-200 rounded-2xl focus:ring-4 focus:ring-dark-300/20 focus:border-dark-400 transition-all duration-300 text-dark-800"
              placeholder="اسم الكاتب..."
            />
          </div>
          
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-dark-700 font-bold text-lg">
              <Clock className="w-5 h-5 text-dark-500" />
              وقت القراءة (بالدقائق)
            </label>
            <input
              type="number"
              value={formData.readTime}
              onChange={(e) => setFormData(prev => ({ ...prev, readTime: parseInt(e.target.value) || 3 }))}
              className="w-full px-6 py-4 border-2 border-dark-200 rounded-2xl focus:ring-4 focus:ring-dark-300/20 focus:border-dark-400 transition-all duration-300 text-dark-800"
              min="1"
              max="60"
            />
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-dark-700 font-bold text-lg">
            <Tag className="w-5 h-5 text-dark-500" />
            الوسوم
          </label>
          
          <div className="flex gap-3">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              className="flex-1 px-6 py-3 border-2 border-dark-200 rounded-xl focus:ring-4 focus:ring-dark-300/20 focus:border-dark-400 transition-all duration-300 text-dark-800"
              placeholder="أضف وسم جديد..."
            />
            <button
              type="button"
              onClick={addTag}
              className="px-6 py-3 bg-gradient-to-r from-dark-400 to-dark-500 text-white rounded-xl hover:from-dark-500 hover:to-dark-600 transition-all duration-300 font-semibold"
            >
              إضافة
            </button>
          </div>
          
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {formData.tags.map(tag => (
                <span 
                  key={tag} 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-dark-100 to-dark-200 text-dark-700 rounded-xl border border-dark-200 font-medium"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-dark-500 hover:text-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-dark-700 font-bold text-lg">
            <FileText className="w-5 h-5 text-dark-500" />
            محتوى المقال
          </label>
          
          {previewMode ? (
            <div className="bg-white border-2 border-dark-200 rounded-2xl p-8 min-h-[400px]">
              <div 
                className="prose prose-lg max-w-none prose-headings:text-dark-800 prose-p:text-dark-700 prose-a:text-dark-500" 
                dangerouslySetInnerHTML={{ __html: formData.content || '<p class="text-dark-400 italic">لا يوجد محتوى للمعاينة...</p>' }} 
              />
            </div>
          ) : (
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              className="w-full px-6 py-6 border-2 border-dark-200 rounded-2xl focus:ring-4 focus:ring-dark-300/20 focus:border-dark-400 transition-all duration-300 text-dark-800 resize-none font-mono"
              rows={20}
              placeholder="اكتب محتوى المقال هنا... يمكنك استخدام HTML للتنسيق"
              required
            />
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-8 border-t border-dark-200">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-dark-400 via-dark-500 to-dark-600 text-white rounded-2xl hover:from-dark-500 hover:via-dark-600 hover:to-dark-700 transition-all duration-300 font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {initial ? 'تحديث المقال' : 'حفظ المقال'}
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-4 bg-white border-2 border-dark-300 text-dark-700 rounded-2xl hover:bg-dark-50 hover:border-dark-400 transition-all duration-300 font-bold text-lg"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
};

export default BlogForm;