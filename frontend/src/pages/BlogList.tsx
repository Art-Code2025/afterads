import React, { useEffect, useState } from 'react';
import { blogAPI } from '../utils/api.ts';
import { Link } from 'react-router-dom';
import { Search, Calendar, User, Clock, Tag, ArrowRight, BookOpen, TrendingUp } from 'lucide-react';

type Post = { 
  id: string; 
  title: string; 
  slug: string; 
  coverImageUrl?: string; 
  tags?: string[]; 
  createdAt?: string; 
  published?: boolean;
  author?: string;
  readTime?: number;
  metaDescription?: string;
};

const BlogList: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTag, setSelectedTag] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params: any = { published: 'true' };
      if (q) params.search = q;
      if (selectedTag) params.tag = selectedTag;
      const data = await blogAPI.getAll(params);
      console.log('Blog data received:', data); // إضافة هذا السطر للفحص
      setPosts(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [q, selectedTag]);

  // Get all unique tags
  const allTags = Array.from(new Set(posts.flatMap(p => p.tags || [])));

  // Featured post (latest)
  const featuredPost = posts[0];
  const regularPosts = posts.slice(1);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#292929' }} dir="rtl">
      {/* Hero Section */}
      <div className="" style={{ backgroundColor: '#292929' }}>
        <div className="container mx-auto max-w-6xl px-4 py-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6 text-white">
              <BookOpen className="w-4 h-4" />
              مدونة تقنية متخصصة
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              اكتشف أحدث المقالات
              <span className="block" style={{ color: '#4da6ff' }}>والمحتوى التقني</span>
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: '#4da6ff' }}>
              مقالات متخصصة في التقنية والبرمجة وأحدث التطورات في عالم التكنولوجيا
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-12">
        {/* Search and Filters */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#4da6ff' }} />
              <input 
                className="w-full pr-12 pl-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-colors text-white placeholder-gray-300" 
                placeholder="ابحث عن مقال معين..." 
                value={q} 
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <select 
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-colors text-white"
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
            >
              <option value="" className="bg-gray-800 text-white">جميع الوسوم</option>
              {allTags.map(tag => (
                <option key={tag} value={tag} className="bg-gray-800 text-white">{tag}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#4da6ff' }}></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10" style={{ color: '#4da6ff' }} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">لا توجد مقالات</h3>
            <p style={{ color: '#4da6ff' }}>
              {q || selectedTag ? 'لا توجد مقالات تطابق البحث' : 'لم يتم نشر أي مقالات بعد'}
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Featured Post */}
            {featuredPost && (
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                  <div className="order-2 lg:order-1 p-8 lg:p-12 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-sm font-medium mb-4" style={{ color: '#4da6ff' }}>
                      <TrendingUp className="w-4 h-4" />
                      المقال المميز
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
                      {featuredPost.title}
                    </h2>
                    {featuredPost.metaDescription && (
                      <p className="text-lg mb-6 leading-relaxed" style={{ color: '#4da6ff' }}>
                        {featuredPost.metaDescription}
                      </p>
                    )}
                    <div className="flex items-center gap-6 text-sm mb-6" style={{ color: '#4da6ff' }}>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{featuredPost.author || 'Admin'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {featuredPost.createdAt 
                            ? new Date(featuredPost.createdAt).toLocaleDateString('ar-SA')
                            : 'اليوم'
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{featuredPost.readTime || 3} دقائق قراءة</span>
                      </div>
                    </div>
                    {featuredPost.tags && featuredPost.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {featuredPost.tags.slice(0, 4).map(tag => (
                          <span key={tag} className="px-3 py-1 bg-white/10 text-sm rounded-lg font-medium" style={{ color: '#4da6ff' }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <Link 
                      to={`/blog/${featuredPost.slug}`} 
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 font-medium w-fit text-white hover:bg-white/20"
                      style={{ backgroundColor: '#4da6ff' }}
                    >
                      اقرأ المقال كاملاً
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                  <div className="order-1 lg:order-2 h-64 lg:h-auto">
                    {featuredPost.coverImageUrl ? (
                      <img 
                        src={featuredPost.coverImageUrl} 
                        alt={featuredPost.title} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full bg-white/10 flex items-center justify-center">
                        <BookOpen className="w-16 h-16" style={{ color: '#4da6ff' }} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Regular Posts Grid */}
            {regularPosts.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#4da6ff' }}>
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  أحدث المقالات
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {regularPosts.map(post => (
                    <article key={post.id} className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden hover:bg-white/10 transition-all duration-200 group">
                      <div className="h-48 overflow-hidden">
                        {post.coverImageUrl ? (
                          <img 
                            src={post.coverImageUrl} 
                            alt={post.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" 
                          />
                        ) : (
                          <div className="w-full h-full bg-white/10 flex items-center justify-center">
                            <BookOpen className="w-12 h-12" style={{ color: '#4da6ff' }} />
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold text-xl text-white mb-3 line-clamp-2 group-hover:text-white transition-colors">
                          {post.title}
                        </h3>
                        {post.metaDescription && (
                          <p className="mb-4 line-clamp-2" style={{ color: '#4da6ff' }}>
                            {post.metaDescription}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm mb-4" style={{ color: '#4da6ff' }}>
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{post.author || 'Admin'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{post.readTime || 3} دقائق</span>
                          </div>
                        </div>
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="px-2 py-1 bg-white/10 text-xs rounded-lg font-medium" style={{ color: '#4da6ff' }}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <Link 
                          to={`/blog/${post.slug}`} 
                          className="inline-flex items-center gap-2 font-medium transition-colors hover:text-white"
                          style={{ color: '#4da6ff' }}
                        >
                          اقرأ المزيد
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogList;