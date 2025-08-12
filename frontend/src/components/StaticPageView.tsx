import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { FileText, Calendar, Eye, ArrowRight } from 'lucide-react';

interface StaticPage {
  id: number;
  title: string;
  slug: string;
  content: string;
  metaDescription?: string;
  isActive: boolean;
  showInFooter: boolean;
  createdAt: string;
  updatedAt: string;
}

const StaticPageView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<StaticPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);
        
        // Try to get pages from localStorage first (from App.tsx)
        let pages: StaticPage[] = [];
        const savedPages = localStorage.getItem('staticPages');
        if (savedPages) {
          try {
            const parsedPages = JSON.parse(savedPages);
            if (Array.isArray(parsedPages)) {
              pages = parsedPages;
            }
          } catch (error) {
            console.error('Error parsing saved static pages:', error);
          }
        }
        
        // If no pages in localStorage, use fallback mock data
        if (pages.length === 0) {
          const mockPages: StaticPage[] = [
          {
            id: 1,
            title: 'من نحن',
            slug: 'about-us',
            content: `
              <div class="prose prose-lg max-w-none">
                <h2>من نحن</h2>
                <p>نحن شركة رائدة في مجال الخدمات الرقمية والتجارة الإلكترونية، نسعى لتقديم أفضل الحلول التقنية لعملائنا.</p>
                
                <h3>رؤيتنا</h3>
                <p>أن نكون الشركة الرائدة في مجال التجارة الإلكترونية في المنطقة، ونساهم في تطوير الاقتصاد الرقمي.</p>
                
                <h3>مهمتنا</h3>
                <p>تقديم خدمات عالية الجودة تلبي احتياجات عملائنا وتساعدهم على تحقيق أهدافهم التجارية.</p>
                
                <h3>قيمنا</h3>
                <ul>
                  <li>الجودة والتميز في الخدمة</li>
                  <li>الشفافية والمصداقية</li>
                  <li>الابتكار والتطوير المستمر</li>
                  <li>خدمة العملاء المتميزة</li>
                </ul>
              </div>
            `,
            metaDescription: 'تعرف على شركتنا وخدماتنا المميزة في مجال التجارة الإلكترونية',
            isActive: true,
            showInFooter: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 2,
            title: 'سياسة الخصوصية',
            slug: 'privacy-policy',
            content: `
              <div class="prose prose-lg max-w-none">
                <h2>سياسة الخصوصية</h2>
                <p>نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. هذه السياسة توضح كيفية جمع واستخدام وحماية معلوماتك.</p>
                
                <h3>جمع المعلومات</h3>
                <p>نقوم بجمع المعلومات التالية:</p>
                <ul>
                  <li>المعلومات الشخصية مثل الاسم والبريد الإلكتروني</li>
                  <li>معلومات الاتصال والعنوان</li>
                  <li>معلومات الدفع (مشفرة وآمنة)</li>
                  <li>بيانات استخدام الموقع</li>
                </ul>
                
                <h3>استخدام المعلومات</h3>
                <p>نستخدم معلوماتك لـ:</p>
                <ul>
                  <li>معالجة الطلبات والمدفوعات</li>
                  <li>تحسين خدماتنا</li>
                  <li>التواصل معك بخصوص طلباتك</li>
                  <li>إرسال العروض والتحديثات (بموافقتك)</li>
                </ul>
                
                <h3>حماية البيانات</h3>
                <p>نستخدم أحدث تقنيات الأمان لحماية بياناتك، ولا نشارك معلوماتك مع أطراف ثالثة دون موافقتك.</p>
              </div>
            `,
            metaDescription: 'سياسة الخصوصية وحماية البيانات الشخصية',
            isActive: true,
            showInFooter: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 3,
            title: 'شروط الاستخدام',
            slug: 'terms-of-service',
            content: `
              <div class="prose prose-lg max-w-none">
                <h2>شروط الاستخدام</h2>
                <p>مرحباً بك في موقعنا. باستخدامك لهذا الموقع، فإنك توافق على الشروط والأحكام التالية.</p>
                
                <h3>استخدام الموقع</h3>
                <p>يحق لك استخدام الموقع للأغراض الشخصية والتجارية المشروعة فقط.</p>
                
                <h3>الطلبات والمدفوعات</h3>
                <ul>
                  <li>جميع الأسعار معروضة بالريال السعودي</li>
                  <li>الأسعار شاملة ضريبة القيمة المضافة</li>
                  <li>نحتفظ بالحق في تعديل الأسعار دون إشعار مسبق</li>
                  <li>الدفع مطلوب عند تأكيد الطلب</li>
                </ul>
                
                <h3>التسليم</h3>
                <p>نسعى لتسليم طلباتك في الوقت المحدد، وقد تختلف أوقات التسليم حسب الموقع والظروف.</p>
                
                <h3>المسؤولية</h3>
                <p>نحن غير مسؤولين عن أي أضرار غير مباشرة قد تنتج عن استخدام الموقع أو المنتجات.</p>
                
                <h3>تعديل الشروط</h3>
                <p>نحتفظ بالحق في تعديل هذه الشروط في أي وقت، وسيتم إشعارك بأي تغييرات مهمة.</p>
              </div>
            `,
            metaDescription: 'شروط وأحكام استخدام الموقع والخدمات',
            isActive: true,
            showInFooter: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          ];
          pages = mockPages;
        }
        
        const foundPage = pages.find(p => p.slug === slug && p.isActive);
        
        if (foundPage) {
          setPage(foundPage);
          // Update page title and meta description
          document.title = `${foundPage.title} - after ads`;
          if (foundPage.metaDescription) {
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
              metaDesc.setAttribute('content', foundPage.metaDescription);
            }
          }
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error('Error fetching page:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPage();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl text-gray-600 font-medium">جاري التحميل...</div>
        </div>
      </div>
    );
  }

  if (notFound || !page) {
    return <Navigate to="/" replace />;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => window.history.back()}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowRight className="w-5 h-5 ml-2" />
              العودة
            </button>
          </div>
          
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                {page.title}
              </h1>
              
              {page.metaDescription && (
                <p className="text-lg text-gray-600 mb-4">
                  {page.metaDescription}
                </p>
              )}
              
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>تم الإنشاء: {formatDate(page.createdAt)}</span>
                </div>
                
                {page.updatedAt !== page.createdAt && (
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>آخر تحديث: {formatDate(page.updatedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-8 sm:p-12">
              <div 
                className="prose prose-lg max-w-none prose-headings:text-black prose-p:text-black prose-li:text-black prose-strong:text-black prose-a:text-blue-600 prose-blockquote:text-gray-800 prose-code:text-black prose-pre:text-black"
                dangerouslySetInnerHTML={{ __html: page.content }}
                style={{
                  direction: 'rtl',
                  textAlign: 'right',
                  color: '#000000',
                  lineHeight: '1.8',
                  whiteSpace: 'pre-wrap'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaticPageView;