import React from 'react';
import { ArrowRight, Sparkles, Star } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen bg-black overflow-hidden">
      <style>
        {`
          .glitch-text {
            font-family: 'Courier New', monospace;
            font-weight: bold;
            text-transform: uppercase;
            position: relative;
            color: white;
            font-size: clamp(3rem, 8vw, 6rem);
            line-height: 1;
            animation: glitch 2s infinite;
          }
          
          .glitch-text::before,
          .glitch-text::after {
            content: attr(data-text);
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
          }
          
          .glitch-text::before {
            animation: glitch-1 0.5s infinite;
            color: #ff0040;
            z-index: -1;
          }
          
          .glitch-text::after {
            animation: glitch-2 0.5s infinite;
            color: #00ffff;
            z-index: -2;
          }
          
          @keyframes glitch {
            0%, 100% { transform: translate(0); }
            20% { transform: translate(-2px, 2px); }
            40% { transform: translate(-2px, -2px); }
            60% { transform: translate(2px, 2px); }
            80% { transform: translate(2px, -2px); }
          }
          
          @keyframes glitch-1 {
            0%, 100% { transform: translate(0); }
            10% { transform: translate(-2px, -2px); }
            20% { transform: translate(2px, 2px); }
            30% { transform: translate(-2px, 2px); }
            40% { transform: translate(2px, -2px); }
            50% { transform: translate(-2px, -2px); }
            60% { transform: translate(2px, 2px); }
            70% { transform: translate(-2px, 2px); }
            80% { transform: translate(2px, -2px); }
            90% { transform: translate(-2px, -2px); }
          }
          
          @keyframes glitch-2 {
            0%, 100% { transform: translate(0); }
            10% { transform: translate(2px, 2px); }
            20% { transform: translate(-2px, -2px); }
            30% { transform: translate(2px, -2px); }
            40% { transform: translate(-2px, 2px); }
            50% { transform: translate(2px, 2px); }
            60% { transform: translate(-2px, -2px); }
            70% { transform: translate(2px, -2px); }
            80% { transform: translate(-2px, 2px); }
            90% { transform: translate(2px, 2px); }
          }
          
          .geometric-bg {
            background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.02) 30%, rgba(255,255,255,0.02) 70%, transparent 70%),
                        linear-gradient(-45deg, transparent 30%, rgba(255,255,255,0.02) 30%, rgba(255,255,255,0.02) 70%, transparent 70%);
            background-size: 60px 60px;
            animation: move-bg 20s linear infinite;
          }
          
          @keyframes move-bg {
            0% { background-position: 0 0, 0 0; }
            100% { background-position: 60px 60px, -60px 60px; }
          }
          
          .tech-grid {
            background-image: 
              linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px);
            background-size: 50px 50px;
            animation: grid-move 15s linear infinite;
          }
          
          @keyframes grid-move {
            0% { transform: translate(0, 0); }
            100% { transform: translate(50px, 50px); }
          }
          
          .neon-glow {
            box-shadow: 
              0 0 5px #00ffff,
              0 0 10px #00ffff,
              0 0 15px #00ffff,
              0 0 20px #00ffff;
            animation: neon-pulse 2s ease-in-out infinite alternate;
          }
          
          @keyframes neon-pulse {
            from { box-shadow: 0 0 5px #00ffff, 0 0 10px #00ffff, 0 0 15px #00ffff, 0 0 20px #00ffff; }
            to { box-shadow: 0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 30px #00ffff, 0 0 40px #00ffff; }
          }
        `}
      </style>
      
      {/* Background Elements */}
      <div className="absolute inset-0 geometric-bg opacity-30"></div>
      <div className="absolute inset-0 tech-grid opacity-20"></div>
      
      {/* Floating geometric shapes */}
      <div className="absolute top-20 left-20 w-32 h-32 border border-cyan-400/30 rotate-45 animate-spin-slow"></div>
      <div className="absolute bottom-32 right-32 w-24 h-24 border border-red-400/30 rotate-12 animate-pulse"></div>
      <div className="absolute top-1/2 left-10 w-16 h-16 border border-white/20 rotate-45 animate-bounce"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[80vh]">
          {/* Left Content (Text) */}
          <div className="space-y-8 text-center lg:text-left order-2 lg:order-1">
            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="glitch-text" data-text="Level UP">
                Level UP
              </h1>
              <h2 className="text-white text-2xl md:text-3xl lg:text-4xl font-light tracking-wider">
                YOUR BUSINESS
              </h2>
            </div>

            {/* Subtitle */}
            <div className="border-l-4 border-cyan-400 pl-6">
              <p className="text-gray-300 text-lg leading-relaxed">
                FROM PLANNING TO EXECUTION, WE'VE GOT YOU COVERED!
              </p>
              <p className="text-gray-400 text-sm mt-2">
                نحن نقدم حلول متكاملة لتطوير أعمالك من التخطيط إلى التنفيذ
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button className="group relative px-8 py-4 bg-transparent border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black transition-all duration-300 neon-glow">
                <span className="relative z-10 flex items-center gap-2 font-semibold">
                  GET STARTED
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              
              <button className="group relative px-8 py-4 bg-transparent border border-white/30 text-white hover:bg-white hover:text-black transition-all duration-300">
                <span className="relative z-10 flex items-center gap-2">
                  LEARN MORE
                  <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                </span>
              </button>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative order-1 lg:order-2">
            {/* Main Image Container */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-3xl blur-3xl group-hover:blur-2xl transition-all duration-500"></div>
              
              <div className="relative bg-gray-900/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-700/50 group-hover:shadow-cyan-500/20 transition-all duration-500">
                <div className="w-full h-96 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center relative overflow-hidden">
                  {/* Tech Pattern Overlay */}
                  <div className="absolute inset-0 opacity-30">
                    <div className="w-full h-full bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent animate-pulse"></div>
                  </div>
                  
                  {/* Central Icon/Logo */}
                  <div className="relative z-10 text-center">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center neon-glow">
                      <Star className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-white text-xl font-bold mb-2">AFTER ADS</h3>
                    <p className="text-gray-400 text-sm">Digital Solutions</p>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-cyan-400 rounded-full animate-bounce neon-glow"></div>
                <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-purple-500 rounded-full animate-bounce delay-1000"></div>
                <div className="absolute top-1/2 -right-6 w-4 h-4 bg-red-400 rounded-full animate-bounce delay-2000"></div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-8 -left-8 w-16 h-16 border-2 border-cyan-400/50 rounded-full animate-spin-slow"></div>
            <div className="absolute -bottom-8 -right-8 w-12 h-12 border-2 border-purple-400/50 rounded-full animate-spin-slow delay-1000"></div>
            
            {/* Floating Info Cards */}
             <div className="absolute top-8 -left-8 bg-gray-900/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-cyan-400/30 animate-float">
               <div className="flex items-center gap-3">
                 <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
                 <span className="text-sm font-medium text-white">Professional Services</span>
               </div>
             </div>
             
             <div className="absolute bottom-16 -right-12 bg-gray-900/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-purple-400/30 animate-float delay-1000">
               <div className="flex items-center gap-3">
                 <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                 <span className="text-sm font-medium text-white">Digital Innovation</span>
               </div>
             </div>
           </div>
         </div>
       </div>
     </section>
   );
 };
 
 export default Hero;