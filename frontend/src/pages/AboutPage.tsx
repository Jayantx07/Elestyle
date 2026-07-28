import React from 'react';
import { Typography } from '../components/atoms/Typography';
import { Link } from 'react-router-dom';

const AboutPage: React.FC = () => {
  return (
    <div className="bg-[#FAF9F6] text-black font-sans min-h-screen pb-12">
      
      {/* Page Container (matching the boxed look in the design) */}
      <div className="max-w-[1200px] mx-auto bg-white shadow-2xl overflow-hidden mt-8">
        
        {/* 1. Hero Section */}
        <section className="relative w-full py-32 bg-[#EBE3D5] overflow-hidden flex items-center justify-center min-h-[500px]">
          {/* Abstract Liquid Background SVGs */}
          <svg className="absolute inset-0 w-full h-full object-cover pointer-events-none" viewBox="0 0 1440 600" preserveAspectRatio="xMidYMid slice" fill="none">
            {/* Base waves */}
            <path d="M0,0 C300,100 400,500 800,600 L0,600 Z" fill="#E2D4C0" opacity="0.5"/>
            <path d="M1440,0 C1100,50 1000,400 600,600 L1440,600 Z" fill="#F4EFE6" opacity="0.6"/>
            {/* Thin stroke lines */}
            <path d="M-100,200 C300,300 400,100 800,400 C1200,700 1500,200 1600,300" stroke="#C5B6A1" strokeWidth="1" fill="none"/>
            <path d="M-100,400 C200,600 500,300 900,500 C1200,600 1400,400 1600,500" stroke="#C5B6A1" strokeWidth="1" fill="none"/>
            <path d="M1200,-100 C1000,200 1300,400 1000,650" stroke="#C5B6A1" strokeWidth="1" fill="none"/>
          </svg>

          <div className="relative z-10 w-full max-w-4xl px-8 text-center flex flex-col items-center">
            <h1 className="font-fraunces text-4xl md:text-[54px] leading-[1.1] text-[#2c2a28] mb-6 uppercase tracking-wider text-center">
              Elevate Your <br/> Vision. Master <br/> Your Business.
            </h1>
            <p className="text-[10px] md:text-[11px] tracking-[0.2em] uppercase font-bold text-[#4a4744] text-center">
              Strategy. Mindset. Success. <br/> With ElleStyle.
            </p>
          </div>
        </section>



        {/* 3. WHAT WE DO */}
        <section id="programs" className="py-24 px-8 relative bg-[#E6DCC9] overflow-hidden text-center">
          {/* Subtle thin stroke line in background */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" viewBox="0 0 1200 400" fill="none">
             <path d="M-100,300 C200,400 400,100 800,200 C1100,250 1200,100 1300,50" stroke="#000" strokeWidth="1"/>
          </svg>

          <Typography variant="h2" className="uppercase font-fraunces text-[28px] tracking-widest mb-20 text-[#2c2a28] relative z-10">
            What We Do
          </Typography>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 relative z-10">
            <div className="flex flex-col items-center max-w-[260px] mx-auto">
              <svg className="w-10 h-10 mb-6 text-[#2c2a28]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="font-fraunces text-[17px] mb-3 text-[#2c2a28]">Planning Services</h3>
              <p className="text-[12px] leading-relaxed text-[#4a4744] text-center">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.
              </p>
            </div>
            
            <div className="flex flex-col items-center max-w-[260px] mx-auto">
              <svg className="w-10 h-10 mb-6 text-[#2c2a28]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="font-fraunces text-[17px] mb-3 text-[#2c2a28]">Promoting Services</h3>
              <p className="text-[12px] leading-relaxed text-[#4a4744] text-center">
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              </p>
            </div>

            <div className="flex flex-col items-center max-w-[260px] mx-auto">
              <svg className="w-10 h-10 mb-6 text-[#2c2a28]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="font-fraunces text-[17px] mb-3 text-[#2c2a28]">Customer Services</h3>
              <p className="text-[12px] leading-relaxed text-[#4a4744] text-center">
                Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Testimonials */}
        <section id="testimonials" className="bg-white pt-24 pb-16 relative overflow-hidden border-b border-gray-100">
          {/* Black wavy line left/right */}
          <svg className="absolute left-0 top-1/4 w-[150px] h-[300px] pointer-events-none opacity-20" fill="none">
            <path d="M-50,150 C20,100 80,200 50,300" stroke="#000" strokeWidth="1"/>
            <path d="M-20,0 C80,50 150,150 -50,250" stroke="#000" strokeWidth="1"/>
          </svg>
          <svg className="absolute right-0 top-1/3 w-[150px] h-[300px] pointer-events-none opacity-20" fill="none">
            <path d="M200,50 C100,100 50,200 150,300" stroke="#000" strokeWidth="1"/>
          </svg>

          <div className="max-w-5xl mx-auto px-8 relative z-10 flex flex-col md:flex-row items-start justify-between gap-8 md:gap-4">
            
            {/* Left Testimonial */}
            <div className="flex-1 flex flex-col items-center text-center px-4">
              <img src="https://ui-avatars.com/api/?name=Susan+Director&background=random" alt="Avatar" className="w-12 h-12 rounded-full mb-5 object-cover grayscale"/>
              <p className="text-[12px] italic text-[#4a4744] leading-relaxed mb-6 font-serif max-w-[220px]">
                "This platform became an absolute cornerstone. Amazing workflow and tools."
              </p>
              <p className="text-[9px] font-bold tracking-[0.15em] uppercase text-black mt-auto">Susan<br/><span className="text-gray-400 font-normal">Director</span></p>
            </div>

            {/* Center Testimonial (Featured) */}
            <div className="flex-1 flex flex-col items-center text-center px-4 md:border-x border-gray-200 py-2">
              <div className="text-4xl font-serif text-black mb-2 leading-none">"</div>
              <p className="text-[17px] font-fraunces text-black leading-relaxed mb-8 max-w-[280px]">
                "Your profession is about the vision in marketing and visions in motion."
              </p>
              <p className="text-[9px] font-bold tracking-[0.15em] uppercase text-black mt-auto">Emma<br/><span className="text-gray-400 font-normal">Communications</span></p>
            </div>

            {/* Right Testimonial */}
            <div className="flex-1 flex flex-col items-center text-center px-4">
              <img src="https://ui-avatars.com/api/?name=Michael+Review&background=random" alt="Avatar" className="w-12 h-12 rounded-full mb-5 object-cover grayscale"/>
              <p className="text-[12px] italic text-[#4a4744] leading-relaxed mb-6 font-serif max-w-[220px]">
                "My revenue has steadily increased. Key insights completely elevated our strategy."
              </p>
              <p className="text-[9px] font-bold tracking-[0.15em] uppercase text-black mt-auto">Michael<br/><span className="text-gray-400 font-normal">Testimonial</span></p>
            </div>

          </div>

          {/* Carousel Dots */}
          <div className="flex justify-center mt-12 gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
          </div>
        </section>

        {/* 5. Secondary ABOUT */}
        <section id="about" className="py-24 px-12 bg-white relative overflow-hidden">
          {/* Black wavy line background */}
          <svg className="absolute left-0 bottom-0 w-1/2 h-[400px] pointer-events-none opacity-20" fill="none" viewBox="0 0 500 400">
            <path d="M-50,350 C150,300 200,450 400,250 C500,150 450,50 600,100" stroke="#000" strokeWidth="1"/>
            <path d="M-100,200 C50,150 100,350 300,200 C450,50 550,150 700,-50" stroke="#000" strokeWidth="1"/>
          </svg>

          <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16 relative z-10">
            
            {/* Image */}
            <div className="w-full max-w-[300px] shrink-0">
              <div className="aspect-[3/4] bg-[#F7F5F0] overflow-hidden rounded-md shadow-sm">
                <img 
                  src="/images/about-woman.png" 
                  alt="About Us" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Text */}
            <div className="flex-1 w-full text-center md:text-left px-4">
              <Typography variant="h2" className="uppercase font-fraunces text-2xl tracking-widest mb-6 text-[#2c2a28]">
                About
              </Typography>
              <p className="text-[11px] leading-[1.8] text-[#4a4744] mb-5">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
              <p className="text-[11px] leading-[1.8] text-[#4a4744] mb-8">
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.
              </p>
              <a href="#" className="inline-block border-b border-black pb-0.5 text-[10px] font-bold tracking-[0.15em] uppercase hover:opacity-60 transition-opacity">
                Learn More
              </a>
            </div>

          </div>
        </section>

        {/* 6. JOIN THE MASTERMIND */}
        <section className="bg-black text-white py-24 px-12">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-start gap-16">
            
            <div className="flex-1">
              <Typography variant="h2" className="uppercase font-fraunces text-3xl tracking-widest mb-6 leading-tight">
                Join The <br/> Mastermind
              </Typography>
              <p className="text-[11px] leading-[1.8] text-gray-400 mb-8 max-w-sm">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
              <a href="#" className="inline-block border-b border-white pb-0.5 text-[10px] font-bold tracking-[0.15em] uppercase hover:text-gray-300 transition-colors">
                Learn More
              </a>
            </div>

            <div className="w-full md:w-[380px] shrink-0">
              <form className="flex flex-col gap-3">
                <input 
                  type="text" 
                  placeholder="Name" 
                  className="w-full bg-white text-black px-4 py-2.5 text-[11px] focus:outline-none"
                />
                <input 
                  type="email" 
                  placeholder="Email" 
                  className="w-full bg-white text-black px-4 py-2.5 text-[11px] focus:outline-none"
                />
                <textarea 
                  placeholder="Message" 
                  rows={3}
                  className="w-full bg-white text-black px-4 py-2.5 text-[11px] focus:outline-none resize-none"
                ></textarea>
                <button 
                  type="button"
                  className="self-start mt-1 bg-[#D1C3AD] text-black px-8 py-2.5 text-[10px] font-bold tracking-[0.15em] uppercase hover:bg-white transition-colors"
                >
                  Submit
                </button>
              </form>
            </div>

          </div>
        </section>



      </div>
    </div>
  );
};

export default AboutPage;
