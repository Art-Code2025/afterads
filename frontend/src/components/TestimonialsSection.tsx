import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  avatar: string;
  quote: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'ليان السعدي',
    avatar: 'https://randomuser.me/api/portraits/women/79.jpg',
    quote:
      '“أروع عطر جربته على الإطلاق، رائحته تبقى لساعات طويلة ويجعلني أشعر بالثقة.”',
  },
  {
    id: 2,
    name: 'محمد الغامدي',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    quote:
      '“خدمة عملاء ممتازة وتوصيل سريع، سأطلب مرة أخرى بالتأكيد!”',
  },
  {
    id: 3,
    name: 'فاطمة الدوسري',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    quote:
      '“التعبئة والتغليف فخم والعطر يفوق التوقعات من حيث الثبات والفوحان.”',
  },
];

const TestimonialsSection: React.FC = () => {
  const [index, setIndex] = useState(0);

  const prevTestimonial = () => {
    setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const nextTestimonial = () => {
    setIndex((prev) => (prev + 1) % testimonials.length);
  };

  const { name, avatar, quote } = testimonials[index];

  return (
    <section className="bg-dark-800 py-20">
      <div className="container-responsive text-center space-y-12">
        <h2 className="text-responsive-3xl font-luxury text-dark-200">
          آراء عملائنا
        </h2>

        <div className="relative max-w-2xl mx-auto">
          <div className="bg-dark-900 rounded-responsive shadow-dark-lg p-10 space-y-6 animate-fade-in-up">
            <p className="text-responsive-base leading-relaxed text-dark-300">
              {quote}
            </p>
            <div className="flex items-center justify-center gap-4">
              <img
                src={avatar}
                alt={name}
                className="w-12 h-12 rounded-full object-cover shadow-md"
              />
              <span className="text-dark-200 font-semibold">{name}</span>
            </div>
          </div>

          {/* Navigation buttons */}
          <button
            onClick={prevTestimonial}
            className="absolute -left-6 top-1/2 -translate-y-1/2 bg-dark-900 border border-dark-700 rounded-full p-2 shadow-sm hover:bg-dark-800 transition"
          >
            <ChevronLeft className="w-5 h-5 text-dark-200" />
          </button>
          <button
            onClick={nextTestimonial}
            className="absolute -right-6 top-1/2 -translate-y-1/2 bg-dark-900 border border-dark-700 rounded-full p-2 shadow-sm hover:bg-dark-800 transition"
          >
            <ChevronRight className="w-5 h-5 text-dark-200" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;