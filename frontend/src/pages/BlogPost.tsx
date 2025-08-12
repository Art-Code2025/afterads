import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogAPI } from '../utils/api.ts';
import { Calendar, User, Clock, Tag, ArrowRight, BookOpen, Share2, Heart } from 'lucide-react';

const BlogPost: React.FC = () => {
  const { slug = '' } = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const data = await blogAPI.getByIdOrSlug(slug);
        setPost(data);
        
        // Load related posts
        if (data?.tags?.length > 0) {
          const related = await blogAPI.getAll({ 
             published: 'true',
            tag: data.tags[0],
            limit: '3'
          });
          setRelatedPosts(Array.isArray(related) ? related.filter(p => p.id !== data.id) : []);
        }
      } catch (e) {
        setPost(null);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#292929' }} dir="rtl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#4da6ff' }}></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#292929' }} dir="rtl">
        <div className="text-center">
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10" style={{ color: '#4da6ff' }} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">المقال غير موجود</h1>
          <p className="mb-6" style={{ color: '#4da6ff' }}>عذراً، لم نتمكن من العثور على المقال المطلوب</p>
          <Link 
            to="/blog" 
            className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-xl transition-colors hover:bg-white/20"
            style={{ backgroundColor: '#4da6ff' }}
          >
            العودة للمدونة
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#292929' }} dir="rtl">
      {/* Breadcrumb */}
      <div className="bg-white/5 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto max-w-4xl px-4 py-4">
          <nav className="flex items-center gap-2 text-sm" style={{ color: '#4da6ff' }}>
            <Link to="/" className="hover:text-white transition-colors">الرئيسية</Link>
            <span>/</span>
            <Link to="/blog" className="hover:text-white transition-colors">المدونة</Link>
            <span>/</span>
            <span className="text-white font-medium">{post.title}</span>
          </nav>
        </div>
      </div>

      <article className="container mx-auto max-w-4xl px-4 py-12">
        {/* Article Header */}
        <header className="mb-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
            {/* Cover Image */}
            {post.coverImageUrl && (
              <div className="h-64 md:h-80 overflow-hidden">
                <img 
                  src={post.coverImageUrl} 
                  alt={post.title} 
                  className="w-full h-full object-cover" 
                />
              </div>
            )}
            
            <div className="p-8">
              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag: string) => (
                    <span key={tag} className="px-3 py-1 bg-white/10 text-sm rounded-lg font-medium" style={{ color: '#4da6ff' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
                {post.title}
              </h1>
              
              {/* Meta Description */}
              {post.metaDescription && (
                <p className="text-xl mb-6 leading-relaxed" style={{ color: '#4da6ff' }}>
                  {post.metaDescription}
                </p>
              )}
              
              {/* Article Meta */}
              <div className="flex flex-wrap items-center gap-6 mb-6" style={{ color: '#4da6ff' }}>
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  <span className="font-medium">{post.author || 'Admin'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>
                    {post.createdAt 
                      ? new Date(post.createdAt).toLocaleDateString('ar-SA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'اليوم'
                    }
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{post.readTime || 3} دقائق قراءة</span>
                </div>
              </div>
              
              {/* Social Actions */}
              <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                <button className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors" style={{ color: '#4da6ff' }}>
                  <Share2 className="w-4 h-4" />
                  مشاركة
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors" style={{ color: '#4da6ff' }}>
                  <Heart className="w-4 h-4" />
                  إعجاب
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 mb-8">
          <div 
            className="prose prose-lg max-w-none prose-headings:text-white prose-headings:font-bold prose-p:leading-relaxed prose-a:no-underline hover:prose-a:underline prose-strong:text-white prose-ul:text-white prose-ol:text-white"
            style={{ color: '#4da6ff' }}
            dangerouslySetInnerHTML={{ __html: post.content || '' }} 
          />
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#4da6ff' }}>
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              مقالات ذات صلة
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.slice(0, 3).map(relatedPost => (
                <Link 
                  key={relatedPost.id}
                  to={`/blog/${relatedPost.slug}`}
                  className="group block bg-white/5 rounded-xl overflow-hidden hover:bg-white/10 transition-all duration-200"
                >
                  <div className="h-32 overflow-hidden">
                    {relatedPost.coverImageUrl ? (
                      <img 
                        src={relatedPost.coverImageUrl} 
                        alt={relatedPost.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" 
                      />
                    ) : (
                      <div className="w-full h-full bg-white/10 flex items-center justify-center">
                        <BookOpen className="w-8 h-8" style={{ color: '#4da6ff' }} />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-white mb-2 line-clamp-2 group-hover:text-white transition-colors">
                      {relatedPost.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm" style={{ color: '#4da6ff' }}>
                      <Clock className="w-4 h-4" />
                      <span>{relatedPost.readTime || 3} دقائق</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back to Blog */}
        <div className="text-center mt-12">
          <Link 
            to="/blog" 
            className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-xl transition-all duration-200 font-medium hover:bg-white/20"
            style={{ backgroundColor: '#4da6ff' }}
          >
            العودة للمدونة
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </article>
    </div>
  );
};

export default BlogPost;