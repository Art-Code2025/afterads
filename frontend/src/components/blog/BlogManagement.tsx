import React, { useEffect, useState, useMemo } from 'react';
import { blogAPI } from '../../utils/api.ts';
import DeleteModal from '../DeleteModal';
import BlogForm from './BlogForm';
import type { BlogPost } from '../../types/blog';
import { Plus, Search, Filter, Edit, Trash2, Eye, Calendar, Tag, User, Clock, X, BookOpen, TrendingUp, Star, Zap } from 'lucide-react';

const BlogManagement: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [tag, setTag] = useState('');
  const [onlyPublished, setOnlyPublished] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params: Record<string,string> = {};
      if (q) params.search = q;
      if (tag) params.tag = tag;
      if (onlyPublished) params.published = 'true';
      const data = await blogAPI.getAll(params);
      setPosts(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{ load(); }, [q, tag, onlyPublished]);

  const allTags = useMemo(()=>{
    const s = new Set<string>();
    posts.forEach(p => (p.tags || []).forEach(t => s.add(t)));
    return Array.from(s);
  }, [posts]);

  const openAdd = () => { setEditing(null); setShowForm(true); };
  const openEdit = (p: BlogPost) => { setEditing(p); setShowForm(true); };
  const onSaved = async () => { setShowForm(false); setEditing(null); await load(); };
  const onCancel = () => { setShowForm(false); setEditing(null); };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await blogAPI.delete(deleteId);
      setDeleteId(null);
      await load();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F5] via-[#F5F1EB] to-[#FAF8F5]" dir="rtl">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-dark-300/5 to-dark-400/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-32 left-16 w-80 h-80 bg-gradient-to-br from-dark-400/5 to-dark-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-dark-200/3 to-dark-300/3 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 space-y-8 p-6 lg:p-12">
        {/* Enhanced Header */}
        <div className="text-center space-y-6 mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-dark-400 to-dark-500 rounded-3xl shadow-2xl mb-6">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-dark-700 via-dark-800 to-dark-700 bg-clip-text text-transparent">
              إدارة المدونة
            </h1>
            <p className="text-xl text-dark-600 max-w-2xl mx-auto leading-relaxed">
              منصة احترافية لإنشاء وتحرير ونشر المقالات بأسلوب متطور وجذاب
            </p>
          </div>
          <button 
            onClick={openAdd} 
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-dark-400 via-dark-500 to-dark-600 text-white rounded-2xl hover:from-dark-500 hover:via-dark-600 hover:to-dark-700 transition-all duration-300 shadow-2xl hover:shadow-dark-500/25 hover:-translate-y-1 font-bold text-lg"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
            <span>إضافة مقال جديد</span>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-dark-300/50 to-dark-400/50 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
          </button>
        </div>

        {/* Enhanced Filters */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-dark-200/20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="relative group">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-dark-400 w-5 h-5 group-focus-within:text-dark-600 transition-colors" />
              <input 
                placeholder="البحث في المقالات..." 
                className="w-full pr-12 pl-4 py-4 border-2 border-dark-200 rounded-2xl focus:ring-4 focus:ring-dark-300/20 focus:border-dark-400 transition-all duration-300 bg-white/50 backdrop-blur-sm text-dark-800 placeholder-dark-400" 
                value={q} 
                onChange={(e)=>setQ(e.target.value)} 
              />
            </div>
            <div className="relative group">
              <Tag className="absolute right-4 top-1/2 transform -translate-y-1/2 text-dark-400 w-5 h-5 group-focus-within:text-dark-600 transition-colors" />
              <select 
                className="w-full pr-12 pl-4 py-4 border-2 border-dark-200 rounded-2xl focus:ring-4 focus:ring-dark-300/20 focus:border-dark-400 transition-all duration-300 appearance-none bg-white/50 backdrop-blur-sm text-dark-800" 
                value={tag} 
                onChange={(e)=>setTag(e.target.value)}
              >
                <option value="">جميع الوسوم</option>
                {allTags.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-4 px-6 py-4 bg-gradient-to-r from-dark-100/50 to-dark-200/50 rounded-2xl border border-dark-200">
              <input 
                id="published" 
                type="checkbox" 
                checked={onlyPublished} 
                onChange={(e)=>setOnlyPublished(e.target.checked)}
                className="w-5 h-5 text-dark-600 border-dark-300 rounded-lg focus:ring-dark-500 focus:ring-2"
              />
              <label htmlFor="published" className="text-dark-700 font-semibold cursor-pointer">المنشورة فقط</label>
            </div>
            <button 
              onClick={load} 
              className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-dark-300 to-dark-400 hover:from-dark-400 hover:to-dark-500 text-white rounded-2xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              <Filter className="w-5 h-5" />
              تطبيق الفلاتر
            </button>
          </div>
        </div>

        {/* Enhanced Posts Grid */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-dark-200/20 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-dark-200 border-t-dark-500"></div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-dark-300/20 to-dark-400/20 blur-xl"></div>
              </div>
              <p className="mt-6 text-dark-600 font-medium">جاري تحميل المقالات...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-32">
              <div className="relative inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-dark-100 to-dark-200 rounded-full mb-8 shadow-2xl">
                <BookOpen className="w-16 h-16 text-dark-400" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-dark-200/30 to-dark-300/30 blur-xl"></div>
              </div>
              <h3 className="text-3xl font-bold text-dark-800 mb-4">لا توجد مقالات بعد</h3>
              <p className="text-dark-600 mb-8 text-lg max-w-md mx-auto leading-relaxed">
                ابدأ رحلتك في عالم التدوين وأنشئ أول مقال احترافي في مدونتك
              </p>
              <button 
                onClick={openAdd}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-dark-400 to-dark-500 text-white rounded-2xl hover:from-dark-500 hover:to-dark-600 transition-all duration-300 font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1"
              >
                <Plus className="w-6 h-6" />
                إضافة مقال جديد
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 p-8">
              {posts.map(post => (
                <div key={post.id} className="group relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border border-dark-100 hover:border-dark-300 hover:-translate-y-2">
                  {/* Cover Image */}
                  <div className="relative h-56 overflow-hidden">
                    {post.coverImageUrl ? (
                      <img 
                        src={post.coverImageUrl} 
                        alt={post.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-dark-100 via-dark-200 to-dark-300 flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-dark-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <span className={`px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm ${
                        post.published 
                          ? 'bg-green-500/90 text-white shadow-lg' 
                          : 'bg-yellow-500/90 text-white shadow-lg'
                      }`}>
                        {post.published ? 'منشور' : 'مسودة'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-dark-500">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">{post.readTime || 3} دقائق</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium text-dark-600">4.8</span>
                      </div>
                    </div>
                    
                    <h3 className="font-bold text-xl text-dark-800 line-clamp-2 group-hover:text-dark-600 transition-colors duration-300">
                      {post.title}
                    </h3>
                    
                    <div className="flex items-center gap-3 text-sm text-dark-500">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span className="font-medium">{post.author || 'Admin'}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString('ar-SA') : 'اليوم'}</span>
                      </div>
                    </div>
                    
                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {post.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="px-3 py-1 bg-gradient-to-r from-dark-100 to-dark-200 text-dark-700 text-xs rounded-full font-semibold border border-dark-200">
                            {tag}
                          </span>
                        ))}
                        {post.tags.length > 3 && (
                          <span className="px-3 py-1 bg-gradient-to-r from-dark-200 to-dark-300 text-dark-800 text-xs rounded-full font-bold">
                            +{post.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                      <button 
                        onClick={() => openEdit(post)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-dark-300 to-dark-400 text-white rounded-xl hover:from-dark-400 hover:to-dark-500 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1"
                      >
                        <Edit className="w-4 h-4" />
                        تعديل
                      </button>
                      <button 
                        onClick={() => setDeleteId(post.id ?? null)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        حذف
                      </button>
                    </div>
                  </div>
                  
                  {/* Hover Effect */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-dark-400/5 to-dark-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Enhanced Modal for Blog Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl border border-dark-200">
              <div className="flex items-center justify-between p-8 border-b border-dark-100 bg-gradient-to-r from-dark-50 to-dark-100">
                <h3 className="text-3xl font-bold text-dark-800 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-dark-400 to-dark-500 rounded-xl flex items-center justify-center">
                    <Edit className="w-5 h-5 text-white" />
                  </div>
                  {editing ? 'تعديل المقال' : 'إضافة مقال جديد'}
                </h3>
                <button
                  onClick={onCancel}
                  className="p-3 hover:bg-dark-100 rounded-xl transition-colors group"
                >
                  <X className="w-6 h-6 text-dark-500 group-hover:text-dark-700" />
                </button>
              </div>
              <div className="p-8 overflow-y-auto max-h-[calc(95vh-120px)]">
                <BlogForm initial={editing} onSaved={onSaved} onCancel={onCancel} />
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        <DeleteModal
          isOpen={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={confirmDelete}
          type="blog"
          title="حذف المقال"
          message="هل أنت متأكد من حذف هذا المقال؟ هذا الإجراء لا يمكن التراجع عنه."
          loading={deleting}
        />
      </div>
    </div>
  );
};

export default BlogManagement;