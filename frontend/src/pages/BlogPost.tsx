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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">المقال غير موجود</h1>
          <p className="text-gray-600 mb-6">عذراً، لم نتمكن من العثور على المقال المطلوب</p>
          <Link 
            to="/blog" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            العودة للمدونة
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto max-w-4xl px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-blue-600 transition-colors">الرئيسية</Link>
            <span>/</span>
            <Link to="/blog" className="hover:text-blue-600 transition-colors">المدونة</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{post.title}</span>
          </nav>
        </div>
      </div>

      <article className="container mx-auto max-w-4xl px-4 py-12">
        {/* Article Header */}
        <header className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
                    <span key={tag} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-lg font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                {post.title}
              </h1>
              
              {/* Meta Description */}
              {post.metaDescription && (
                <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                  {post.metaDescription}
                </p>
              )}
              
              {/* Article Meta */}
              <div className="flex flex-wrap items-center gap-6 text-gray-500 mb-6">
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
              <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors">
                  <Share2 className="w-4 h-4" />
                  مشاركة
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-colors">
                  <Heart className="w-4 h-4" />
                  إعجاب
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <div 
            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700" 
            dangerouslySetInnerHTML={{ __html: post.content || '' }} 
          />
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              مقالات ذات صلة
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.slice(0, 3).map(relatedPost => (
                <Link 
                  key={relatedPost.id}
                  to={`/blog/${relatedPost.slug}`}
                  className="group block bg-gray-50 rounded-xl overflow-hidden hover:shadow-md transition-all duration-200"
                >
                  <div className="h-32 overflow-hidden">
                    {relatedPost.coverImageUrl ? (
                      <img 
                        src={relatedPost.coverImageUrl} 
                        alt={relatedPost.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" 
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {relatedPost.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
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
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
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