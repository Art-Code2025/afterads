import React from 'react';
import { Link } from 'react-router-dom';

const BrandStorySection: React.FC = () => {
  return (
    <section className="bg-beige-50 py-16 relative overflow-hidden">
      {/* Decorative blurred blobs */}
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-burgundy-200 rounded-full filter blur-3xl opacity-20 animate-float" />
      <div className="absolute -top-10 -left-10 w-56 h-56 bg-burgundy-300 rounded-full filter blur-3xl opacity-20 animate-float" />

      <div className="container-responsive grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Story Text */}
        <div className="space-y-6 order-2 md:order-1 animate-fade-in-up">
          <h2 className="text-responsive-3xl font-luxury text-burgundy-700">
            قصة علامتنا
          </h2>
          <p className="text-responsive-base leading-relaxed text-burgundy-800">
            بدأت حكايتنا بشغف لا ينتهي لاكتشاف أفخم المكونات العطرية حول العالم ومزجها في زجاجة تُلامس الروح قبل الحواس. نؤمن بأن العطر هو توقيعك الخاص، لذا نصنع كل تركيبة بدقة وحب لتروي قصتك أنت.
          </p>
          <Link
            to="/about"
            className="btn-zico-outline inline-block mt-4"
          >
            اكتشف المزيد
          </Link>
        </div>

        {/* Story Image */}
        <div className="relative order-1 md:order-2 animate-fade-in">
          <img
            src="https://images.unsplash.com/photo-1505247964246-1f0f2e6b6540?auto=format&fit=crop&w=800&q=80"
            alt="Zico Brand Story"
            className="rounded-responsive shadow-zico-lg w-full h-auto object-cover"
          />
          <span className="absolute inset-0 bg-gradient-to-br from-transparent to-beige-200 rounded-responsive pointer-events-none" />
        </div>
      </div>
    </section>
  );
};

export default BrandStorySection; 