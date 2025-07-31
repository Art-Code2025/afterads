import React, { useState } from 'react';
import { toast } from 'react-toastify';

const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // In a real app, an API call would be made here
    toast.success('شكراً لاشتراكك! سوف نصلك أحدث الإصدارات والعروض.', {
      position: 'bottom-right',
      autoClose: 2500,
    });
    setEmail('');
  };

  return (
    <section className="bg-burgundy-700 py-20 text-center text-white">
      <div className="container-responsive space-y-8">
        <h2 className="text-responsive-3xl font-luxury">اشترك في النشرة البريدية</h2>
        <p className="text-responsive-base max-w-xl mx-auto opacity-90">
          كن أول من يعرف عن مجموعاتنا الجديدة والعروض الحصرية.
        </p>
        <form
          onSubmit={handleSubscribe}
          className="flex flex-col sm:flex-row gap-4 justify-center max-w-xl mx-auto"
        >
          <input
            type="email"
            required
            placeholder="أدخل بريدك الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 rounded-lg px-6 py-3 text-burgundy-800 placeholder:text-burgundy-400 focus:outline-none focus:ring-4 focus:ring-burgundy-400/30"
          />
          <button
            type="submit"
            className="btn-zico bg-white text-burgundy-700 hover:text-white hover:bg-burgundy-700 transition"
          >
            اشتراك
          </button>
        </form>
      </div>
    </section>
  );
};

export default NewsletterSection; 