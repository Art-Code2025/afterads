import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, ExternalLink, Users, Headphones, UserCheck, Shield, RotateCcw } from 'lucide-react';

const ContactSection = () => {
  const openGoogleMaps = () => {
    window.open(
      "https://www.google.com/maps/place/24%C2%B045'04.5%22N+46%C2%B043'12.1%22E/@24.7512609,46.7200274,17z",
      "_blank"
    );
  };

  return (
    <div className="relative bg-gradient-to-br from-dark-900 via-dark-950 to-dark-900 py-12 sm:py-16 lg:py-20 overflow-hidden">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark-400/10 via-transparent to-dark-500/10" />
      <div className="absolute top-0 left-0 w-48 h-48 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-dark-400/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-48 h-48 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-dark-500/5 rounded-full blur-3xl" />
      <div className="absolute inset-0 bg-gradient-to-t from-dark-950/5 via-transparent to-dark-950/5" />
      
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Premium Header */}
        <div className="text-center mb-10 sm:mb-12 lg:mb-16">
          <div className="inline-block">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-dark-200 mb-3 sm:mb-4 bg-gradient-to-r from-dark-200 via-dark-300 to-dark-200 bg-clip-text">
              تواصل معنا
            </h2>
            <div className="h-0.5 sm:h-1 bg-gradient-to-r from-transparent via-dark-400 to-transparent rounded-full mb-4 sm:mb-6" />
          </div>
          <p className="text-dark-300 max-w-3xl mx-auto text-sm sm:text-base lg:text-lg font-light leading-relaxed px-4">
            نحن دائماً في خدمتكم بأعلى مستويات الجودة والاحترافية. يمكنكم التواصل معنا من خلال أي من الوسائل التالية
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Premium Location Card */}
          <div 
            className="group relative bg-gradient-to-br from-dark-900/80 via-dark-950/50 to-dark-900/80 backdrop-blur-2xl rounded-2xl sm:rounded-3xl overflow-hidden transform transition-all duration-500 hover:scale-105 cursor-pointer border border-dark-700/30 shadow-2xl hover:shadow-dark-400/20 md:col-span-2 lg:col-span-1"
            onClick={openGoogleMaps}
          >
            {/* Card Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-dark-400/10 via-transparent to-dark-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Premium Border Gradient */}
            <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-dark-700/40 via-dark-400/50 to-dark-700/40 p-px">
              <div className="w-full h-full bg-gradient-to-br from-dark-900/90 via-dark-950/90 to-dark-900/90 rounded-2xl sm:rounded-3xl" />
            </div>
            
            <div className="relative p-4 sm:p-6 lg:p-8">
              <div className="bg-gradient-to-br from-dark-400/20 to-dark-500/20 w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-500 backdrop-blur-xl border border-dark-700/30">
                <MapPin className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 text-dark-200 drop-shadow-lg" />
              </div>
              
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-center text-dark-200 mb-3 sm:mb-4">الموقع الحالي</h3>
              
              <div className="text-center">
                <p className="text-dark-300 text-sm sm:text-base mb-4 sm:mb-6 leading-relaxed">طريق الملك عبدالله، المملكة العربية السعودية</p>
                <button className="mx-auto flex items-center justify-center text-white font-medium bg-gradient-to-r from-dark-400 to-dark-500 backdrop-blur-xl border border-dark-400/30 py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl sm:rounded-2xl hover:from-dark-500 hover:to-dark-600 transition-all duration-300 transform hover:scale-105 shadow-lg text-sm sm:text-base">
                  <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                  <span>افتح في الخريطة</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Premium Email Card */}
          <div className="group relative bg-gradient-to-br from-dark-900/80 via-dark-950/50 to-dark-900/80 backdrop-blur-2xl rounded-2xl sm:rounded-3xl overflow-hidden transform transition-all duration-500 hover:scale-105 border border-dark-700/30 shadow-2xl hover:shadow-dark-400/20">
            {/* Card Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-dark-600/10 via-transparent to-dark-700/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Premium Border Gradient */}
            <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-dark-700/40 via-dark-600/50 to-dark-700/40 p-px">
              <div className="w-full h-full bg-gradient-to-br from-dark-900/90 via-dark-950/90 to-dark-900/90 rounded-2xl sm:rounded-3xl" />
            </div>
            
            <div className="relative p-4 sm:p-6 lg:p-8">
              <div className="bg-gradient-to-br from-dark-600/20 to-dark-700/20 w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-500 backdrop-blur-xl border border-dark-700/30">
                <Mail className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 text-dark-200 drop-shadow-lg" />
              </div>
              
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-center text-dark-200 mb-4 sm:mb-6">البريد الإلكتروني</h3>
              
              <div className="w-full">
                <a href="mailto:info@afterads.sa" 
                   className="flex items-center justify-center space-x-1 space-x-reverse py-3 sm:py-4 px-3 sm:px-4 rounded-xl sm:rounded-2xl bg-dark-900/60 backdrop-blur-xl border border-dark-700/40 hover:bg-dark-800/80 transition-all duration-300 group/email">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-dark-300 ml-2 group-hover/email:scale-110 transition-transform duration-300" />
                  <span className="text-dark-200 hover:text-dark-300 transition-colors text-sm sm:text-base font-medium break-all">info@afterads.sa</span>
                </a>
              </div>
            </div>
          </div>
          
          {/* Premium Phone Numbers Card */}
          <div className="group relative bg-gradient-to-br from-dark-900/80 via-dark-950/50 to-dark-900/80 backdrop-blur-2xl rounded-2xl sm:rounded-3xl overflow-hidden transform transition-all duration-500 hover:scale-105 border border-dark-700/30 shadow-2xl hover:shadow-dark-400/20 md:col-span-2 lg:col-span-1">
            {/* Card Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-dark-400/10 via-transparent to-dark-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Premium Border Gradient */}
            <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-dark-700/40 via-dark-400/50 to-dark-700/40 p-px">
              <div className="w-full h-full bg-gradient-to-br from-dark-900/90 via-dark-950/90 to-dark-900/90 rounded-2xl sm:rounded-3xl" />
            </div>
            
            <div className="relative p-4 sm:p-6 lg:p-8">
              <div className="bg-gradient-to-br from-dark-400/20 to-dark-500/20 w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-500 backdrop-blur-xl border border-dark-700/30">
                <Phone className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 text-dark-200 drop-shadow-lg" />
              </div>
              
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-center text-dark-200 mb-3 sm:mb-4">أرقام الجوال</h3>
              
              <div className="w-full space-y-3 sm:space-y-4">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center bg-gradient-to-r from-dark-400/20 to-dark-500/20 backdrop-blur-xl border border-dark-700/30 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl mb-2 sm:mb-3">
                    <Headphones className="w-3 h-3 sm:w-4 sm:h-4 text-dark-300 ml-1 sm:ml-2" />
                    <span className="text-dark-200 font-medium text-xs sm:text-sm">خدمة العملاء</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {["0563995580", "0502116888", "0547493606"].map((phone, index) => (
                    <a key={index} href={`tel:${phone}`} 
                       className="flex items-center justify-center py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-dark-900/60 backdrop-blur-xl border border-dark-700/40 hover:bg-dark-800/80 transition-all duration-300 group/phone">
                      <span className="text-dark-200 hover:text-dark-300 transition-colors font-medium text-sm sm:text-base group-hover/phone:scale-105 transition-transform duration-300">{phone}</span>
                    </a>
                  ))}
                </div>
                
                <div className="border-t border-dark-700/40 pt-3 sm:pt-4 mt-4 sm:mt-6">
                  <div className="text-center mb-2 sm:mb-3">
                    <div className="inline-flex items-center justify-center bg-gradient-to-r from-dark-600/20 to-dark-700/20 backdrop-blur-xl border border-dark-700/30 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl mb-2 sm:mb-3">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4 text-dark-300 ml-1 sm:ml-2" />
                      <span className="text-dark-200 font-medium text-xs sm:text-sm">أرقام الإدارة</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 sm:space-y-3">
                    <div className="text-center">
                      <p className="text-dark-300 font-medium text-xs sm:text-sm mb-1 sm:mb-2">مدير الفرع</p>
                      <a href="tel:0502532888" 
                         className="flex items-center justify-center py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-dark-900/60 backdrop-blur-xl border border-dark-700/40 hover:bg-dark-800/80 transition-all duration-300 group/phone">
                        <span className="text-dark-200 hover:text-dark-300 transition-colors text-sm sm:text-base group-hover/phone:scale-105 transition-transform duration-300">0502532888</span>
                      </a>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-dark-300 font-medium text-xs sm:text-sm mb-1 sm:mb-2">مدير إدارة المشاريع</p>
                      <a href="tel:0505242177" 
                         className="flex items-center justify-center py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-dark-900/60 backdrop-blur-xl border border-dark-700/40 hover:bg-dark-800/80 transition-all duration-300 group/phone">
                        <span className="text-dark-200 hover:text-dark-300 transition-colors text-sm sm:text-base group-hover/phone:scale-105 transition-transform duration-300">0505242177</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Footer */}
      <footer className="relative py-6 sm:py-8 mt-12 sm:mt-16 border-t border-dark-700/30">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-dark-800/30 to-transparent" />
        <div className="relative">
          {/* Policy Links Section */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-6">
            <Link
              to="/privacy-policy"
              className="inline-flex items-center text-dark-300 text-xs sm:text-sm font-medium hover:text-dark-200 transition-all duration-300 bg-dark-900/60 backdrop-blur-xl border border-dark-700/40 px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl hover:bg-dark-800/80 transform hover:scale-105"
            >
              <Shield className="w-4 h-4 ml-2 text-dark-400" />
              <span>سياسة الاستخدام والخصوصية</span>
            </Link>
            <Link
              to="/return-policy"
              className="inline-flex items-center text-dark-300 text-xs sm:text-sm font-medium hover:text-dark-200 transition-all duration-300 bg-dark-900/60 backdrop-blur-xl border border-dark-700/40 px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl hover:bg-dark-800/80 transform hover:scale-105"
            >
              <RotateCcw className="w-4 h-4 ml-2 text-dark-500" />
              <span>سياسة الاسترجاع والاستبدال</span>
            </Link>
          </div>
          
          {/* Copyright Section */}
          <div className="text-center">
            <div className="inline-flex items-center text-dark-300 text-xs sm:text-sm font-medium bg-dark-900/60 backdrop-blur-xl border border-dark-700/40 px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl">
              <span className="text-dark-200 font-bold">© 2025 after ads</span>
              <span className="mx-2">|</span>
              <span className="bg-gradient-to-r from-dark-400 to-dark-500 bg-clip-text text-transparent font-bold">تم التطوير بواسطة ArtCode</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ContactSection;