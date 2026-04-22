/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import SeaStorm12Page from './SeaStorm12Page';
import SeaStorm17Page from './SeaStorm17Page';
import SeaStormModelsPage from './SeaStormModelsPage';
import SellYourBoatPage from './SellYourBoatPage';
import AdminDashboard from './AdminDashboard';
import { fetchData, getImageUrl } from './lib/api';
import { WA_PHONE_DISPLAY, waLink } from './lib/constants';
import {
  Search,
  ChevronDown,
  ArrowRight,
  Globe,
  Share2,
  Menu,
  X
} from 'lucide-react';

import logo from './adratica_nobgblack.svg';

// Fallback paths live in /public/site-images/ (served by Express / Vite static)
const FALLBACKS: Record<string, string> = {
  hero:      '/site-images/hero2.JPG',
  drone1:    '/site-images/drone1.jpg',
  drone2:    '/site-images/drone2.jpg',
  drone3:    '/site-images/drone3.jpg',
  drone4:    '/site-images/drone4.jpg',
  drone5:    '/site-images/drone5.jpg',
};

const resolveImg = (uploaded: string | null | undefined, fallbackKey: string) =>
  getImageUrl(uploaded || FALLBACKS[fallbackKey] || '');


// --- Components ---

const Navbar = ({ currentPage, setCurrentPage }: { currentPage: string, setCurrentPage: (page: string) => void }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 glass-nav shadow-sm h-12' : 'bg-white/80 glass-nav h-16'}`}>
      <div className="max-w-7xl mx-auto px-6 md:px-8 h-full flex justify-between items-center">
        <div className="flex items-center cursor-pointer" onClick={() => setCurrentPage('home')}>
          <img src={logo} alt="Adriatica Luxury Marine" className="h-6 md:h-8 w-auto object-contain" />
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8 font-medium text-[11px] tracking-[0.15em] uppercase">
          <button onClick={() => setCurrentPage('home')} className={`${currentPage === 'home' ? 'text-primary border-b-2 border-primary pb-1' : 'text-secondary hover:text-primary transition-colors'} cursor-pointer`}>Home</button>
          <button onClick={() => setCurrentPage('sell-your-boat')} className={`${currentPage === 'sell-your-boat' ? 'text-primary border-b-2 border-primary pb-1' : 'text-secondary hover:text-primary transition-colors'} cursor-pointer`}>Sell Your Boat</button>
          <div className={`relative group cursor-pointer flex items-center ${currentPage.startsWith('seastorm') ? 'text-primary' : 'text-secondary hover:text-primary'} transition-colors`}>
            Authorised Resale
            <ChevronDown className="ml-1 w-3 h-3" />
            <div className="absolute top-full left-0 mt-2 w-48 bg-white shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 py-4 flex flex-col gap-2 border border-gray-100">
              <button onClick={() => setCurrentPage('seastorm-models')} className="px-6 py-2 text-[10px] hover:bg-gray-50 text-primary text-left w-full cursor-pointer">SEASTORM</button>
              <a href="#" className="px-6 py-2 text-[10px] hover:bg-gray-50 text-primary">REGAL</a>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Search className="w-5 h-5 text-primary cursor-pointer hover:opacity-70 transition-opacity" />
          <button className="hidden md:block bg-primary text-white px-6 py-2 font-bold text-[10px] tracking-widest uppercase rounded-sm hover:scale-95 transition-transform">
            Inquire
          </button>
          <button className="md:hidden text-primary" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-white z-[60] flex flex-col p-8"
          >
            <div className="flex justify-between items-center mb-6">
              <img src={logo} alt="Adriatica Luxury Marine" className="h-8 w-auto object-contain" />
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X className="w-6 h-6 text-primary" />
              </button>
            </div>
            <div className="flex flex-col space-y-6 font-bold text-lg uppercase tracking-widest">
              <button onClick={() => { setCurrentPage('home'); setIsMobileMenuOpen(false); }} className={`text-left w-full ${currentPage === 'home' ? 'text-primary' : 'text-secondary'}`}>Home</button>
              <button onClick={() => { setCurrentPage('sell-your-boat'); setIsMobileMenuOpen(false); }} className={`text-left w-full ${currentPage === 'sell-your-boat' ? 'text-primary' : 'text-secondary'}`}>Sell Your Boat</button>
              <button onClick={() => { setCurrentPage('seastorm-models'); setIsMobileMenuOpen(false); }} className={`text-left w-full ${currentPage.startsWith('seastorm') ? 'text-primary' : 'text-secondary'}`}>Authorised Resale (SEASTORM)</button>
            </div>
            <button className="mt-auto bg-primary text-white w-full py-4 font-bold text-xs tracking-widest uppercase rounded-sm">
              Inquire
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = ({ content }: { content: any }) => (
  <section className="relative h-[85vh] w-full overflow-hidden flex items-center">
    <div className="absolute inset-0 z-0">
      <img
        className="w-full h-full object-cover"
        src={resolveImg(content?.hero_image, 'hero')}
        alt="Luxury Yacht Aerial View"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/70 via-primary/30 to-transparent"></div>
    </div>
    <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 w-full">
      <div className="text-white">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-bold text-6xl md:text-8xl tracking-tighter leading-[0.9] mb-8 max-w-5xl uppercase"
        >
          {content?.hero_title || 'Elevate Your Story.'} <br /> {content?.hero_subtitle || ''}
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-wrap gap-6"
        >
          <button className="bg-white text-primary px-10 py-4 font-bold text-[11px] tracking-widest uppercase rounded-sm hover:translate-y-[-2px] hover:shadow-xl transition-all">
            Browse Listings
          </button>
          <button className="border border-white/40 backdrop-blur-md text-white px-10 py-4 font-bold text-[11px] tracking-widest uppercase rounded-sm hover:bg-white/10 transition-all">
            The Resale Process
          </button>
        </motion.div>
      </div>
    </div>
  </section>
);

const VisionSection = ({ content }: { content: any }) => (
  <section className="py-24 md:py-32 bg-surface">
    <div className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
      <div className="relative">
        <div className="bg-gray-200 w-full aspect-[4/5] overflow-hidden rounded-sm">
          <img
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
            src={resolveImg(content?.vision_image, 'drone1')}
            alt="Yacht Helm"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
      <div className="space-y-8">
        <div className="inline-block px-4 py-1 bg-secondary/10 text-secondary font-bold text-[9px] tracking-[0.25em] uppercase rounded-full">
          Our Purpose
        </div>
        <h2 className="font-bold text-4xl md:text-5xl text-primary leading-tight tracking-tight">
          {content?.vision_title || 'Setting the Gold Standard in Marine Resale'}
        </h2>
        <div className="space-y-6 text-secondary leading-relaxed text-lg">
          <p>
            {content?.vision_text || 'Adriatica was born from a passion for the sea and a commitment to transparency.'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-200">
            <div>
              <span className="font-bold text-primary block mb-3 text-sm uppercase tracking-wider">The Mission</span>
              <p className="text-sm opacity-80">{content?.vision_mission || 'To provide a seamless, authoritative platform...'}</p>
            </div>
            <div>
              <span className="font-bold text-primary block mb-3 text-sm uppercase tracking-wider">The Vision</span>
              <p className="text-sm opacity-80">{content?.vision_vision || 'Becoming the undisputed concierge for high-end marine vessels...'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const FeaturedSection = ({ content }: { content: any }) => {
  const [selectedColor, setSelectedColor] = useState(0);

  const rawColors: string = content?.featured_main_colors || '#001e40,#94a3b8,#004f56,#48626e';
  const colors = rawColors.split(',').map(c => c.trim()).filter(Boolean);

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="font-extrabold text-4xl text-primary tracking-tight uppercase">
              {content?.featured_title || 'Featured Vessels'}
            </h2>
            <p className="text-secondary font-medium mt-2">
              {content?.featured_subtitle || 'Authorised resale selections from Seastorm & Regal.'}
            </p>
          </div>
          <a href="#" className="font-bold text-[10px] tracking-widest uppercase text-primary border-b border-primary/20 pb-1 hover:border-primary transition-all">
            View All Inventory
          </a>
        </div>

        {/* Main Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 bg-white overflow-hidden shadow-sm hover:shadow-2xl transition-shadow duration-500 rounded-sm">
          <div className="lg:col-span-7 overflow-hidden relative">
            <img
              className="w-full h-[400px] md:h-[550px] object-cover hover:scale-105 transition-transform duration-1000"
              src={resolveImg(content?.featured_main_image, 'drone2')}
              alt={content?.featured_main_name || 'Featured Vessel'}
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-6 left-6 bg-primary text-white px-4 py-1 font-bold text-[9px] tracking-widest uppercase">
              Authorised: Seastorm
            </div>
          </div>
          <div className="lg:col-span-5 p-8 md:p-12 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-6">
                <h3 className="font-bold text-3xl text-primary">{content?.featured_main_name || 'Seastorm 36X'}</h3>
                <span className="text-secondary font-bold text-xl">{content?.featured_main_price || '$285,000'}</span>
              </div>
              <div className="flex gap-6 mb-10">
                <div className="flex flex-col">
                  <span className="font-bold text-[9px] text-gray-400 tracking-widest uppercase mb-1">Length</span>
                  <span className="font-bold text-primary text-sm">{content?.featured_main_length || '36 ft'}</span>
                </div>
                <div className="w-[1px] bg-gray-200"></div>
                <div className="flex flex-col">
                  <span className="font-bold text-[9px] text-gray-400 tracking-widest uppercase mb-1">Engine</span>
                  <span className="font-bold text-primary text-sm">{content?.featured_main_engine || 'Twin 300HP'}</span>
                </div>
                <div className="w-[1px] bg-gray-200"></div>
                <div className="flex flex-col">
                  <span className="font-bold text-[9px] text-gray-400 tracking-widest uppercase mb-1">Year</span>
                  <span className="font-bold text-primary text-sm">{content?.featured_main_year || '2023'}</span>
                </div>
              </div>
              <p className="text-secondary text-sm leading-relaxed mb-10">
                {content?.featured_main_description || 'Engineered for the challenging waters of the Red Sea, the 36X combines raw power with an elegant mahogany-finished deck and state-of-the-art navigation.'}
              </p>

              {colors.length > 0 && (
                <div className="mb-10">
                  <span className="font-bold text-[9px] text-gray-400 tracking-widest uppercase block mb-4">Hull Customization</span>
                  <div className="flex gap-4">
                    {colors.map((color, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedColor(idx)}
                        className={`w-8 h-8 rounded-full transition-all duration-300 ${selectedColor === idx ? 'ring-2 ring-primary ring-offset-2 scale-110' : 'hover:scale-110'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button className="w-full py-4 border border-gray-200 text-primary font-bold text-[10px] tracking-widest uppercase rounded-sm hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2">
              View Details
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Secondary Cards */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="group cursor-pointer">
            <div className="aspect-video bg-white overflow-hidden rounded-sm mb-6">
              <img
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                src={resolveImg(content?.featured_card1_image, 'drone3')}
                alt={content?.featured_card1_title || 'Regal LX'}
                referrerPolicy="no-referrer"
              />
            </div>
            <h3 className="font-bold text-2xl text-primary mb-2">{content?.featured_card1_title || 'Regal LX Series'}</h3>
            <p className="text-sm text-secondary leading-relaxed">{content?.featured_card1_text || 'Redefining the standard for coastal day boats with unparalleled upholstery and social layouts.'}</p>
          </div>
          <div className="group cursor-pointer md:mt-12">
            <div className="aspect-video bg-white overflow-hidden rounded-sm mb-6">
              <img
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                src={resolveImg(content?.featured_card2_image, 'drone4')}
                alt={content?.featured_card2_title || 'Craftmanship'}
                referrerPolicy="no-referrer"
              />
            </div>
            <h3 className="font-bold text-2xl text-primary mb-2">{content?.featured_card2_title || 'Craftmanship Focus'}</h3>
            <p className="text-sm text-secondary leading-relaxed">{content?.featured_card2_text || 'Every authorised resale vessel undergoes a 120-point technical inspection by our master mariners.'}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

const CTASection = ({ content }: { content: any }) => (
  <section className="py-32 relative overflow-hidden flex items-center justify-center">
    <div className="absolute inset-0 z-0">
      <img
        src={resolveImg(content?.cta_image, 'drone5')}
        alt="Nautical Background"
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-primary/80 backdrop-blur-[2px]"></div>
    </div>

    <div className="max-w-3xl mx-auto px-6 relative z-10 text-center text-white">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="font-bold text-4xl md:text-5xl uppercase tracking-tighter mb-8"
      >
        {content?.cta_title || 'Find Your Perfect Vessel.'}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-lg opacity-70 mb-12 font-medium"
      >
        {content?.cta_text || "Browse Egypt's most exclusive fleet. Book an in-person inspection and see your next vessel up close."}
      </motion.p>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <a
          href={waLink('Hi, I\'d like to book a boat inspection.')}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white text-primary px-12 py-5 font-bold text-[11px] tracking-widest uppercase rounded-sm hover:scale-105 transition-transform shadow-xl text-center"
        >
          Book an Inspection
        </a>
        <a
          href={waLink('Hi, I\'d like to inquire about your available boats.')}
          target="_blank"
          rel="noopener noreferrer"
          className="border border-white/30 text-white px-12 py-5 font-bold text-[11px] tracking-widest uppercase rounded-sm hover:bg-white/10 transition-all backdrop-blur-sm text-center"
        >
          Browse & Inquire
        </a>
      </motion.div>
    </div>
  </section>
);

const Footer = ({ content, setCurrentPage }: { content: any; setCurrentPage: (page: string) => void }) => (
  <footer className="bg-gray-50 py-20 px-6 md:px-8 border-t border-gray-200">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
      <div className="col-span-1">
        <img src={logo} alt="Adriatica Luxury Marine" className="h-8 w-auto object-contain mb-4" />
        <p className="text-secondary text-[10px] leading-loose uppercase tracking-[0.2em] font-bold">
          {content?.footer_description || 'Premium Marine Brokerage'} <br />
          {content?.footer_locations || 'El Gouna | Hurghada | Cairo'}
        </p>
        <a
          href={waLink('Hi, I\'d like to get in touch with Adriatica.')}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-4 text-primary font-bold text-[10px] tracking-widest uppercase hover:opacity-70 transition-opacity"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          {WA_PHONE_DISPLAY}
        </a>
      </div>
      <div className="flex flex-col gap-5">
        <span className="font-bold text-[11px] text-primary tracking-widest uppercase mb-2">Explore</span>
        <button onClick={() => { window.scrollTo(0, 0); setCurrentPage('sell-your-boat'); }} className="text-left text-gray-500 hover:text-primary transition-all hover:translate-x-1 text-[10px] tracking-widest uppercase">Sell Your Boat</button>
        <button onClick={() => { window.scrollTo(0, 0); setCurrentPage('seastorm-models'); }} className="text-left text-gray-500 hover:text-primary transition-all hover:translate-x-1 text-[10px] tracking-widest uppercase">Authorised Resale</button>
      </div>
      <div className="flex flex-col gap-5">
        <span className="font-bold text-[11px] text-primary tracking-widest uppercase mb-2">Legal</span>
        <a href="#" className="text-gray-500 hover:text-primary transition-all hover:translate-x-1 text-[10px] tracking-widest uppercase">Contact</a>
        <a href="#" className="text-gray-500 hover:text-primary transition-all hover:translate-x-1 text-[10px] tracking-widest uppercase">Privacy Policy</a>
        <a href="#" className="text-gray-500 hover:text-primary transition-all hover:translate-x-1 text-[10px] tracking-widest uppercase">Terms of Service</a>
      </div>
      <div className="flex flex-col gap-8">
        <span className="font-bold text-[11px] text-primary tracking-widest uppercase mb-2">Join the Registry</span>
        <p className="text-[11px] text-secondary leading-relaxed uppercase tracking-wider">Receive exclusive off-market listings and technical insights directly.</p>
        <div className="flex border-b border-primary/20 pb-3 group">
          <input
            type="email"
            placeholder="YOUR EMAIL"
            className="bg-transparent border-none focus:ring-0 text-[10px] w-full font-bold tracking-widest placeholder:text-gray-300"
          />
          <button className="text-primary group-hover:translate-x-1 transition-transform">
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
    <div className="max-w-7xl mx-auto mt-24 pt-10 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-8">
      <div className="font-bold text-[9px] tracking-[0.2em] text-gray-400 uppercase flex items-center gap-4">
        © 2024 ADRIATICA LUXURY MARINE. ALL RIGHTS RESERVED.
        <button onClick={() => setCurrentPage('admin')} className="hover:text-primary transition-colors cursor-pointer opacity-50 hover:opacity-100">ADMIN</button>
      </div>
      <div className="flex gap-8 text-gray-400">
        <Globe className="w-5 h-5 cursor-pointer hover:text-primary transition-colors" />
        <Share2 className="w-5 h-5 cursor-pointer hover:text-primary transition-colors" />
      </div>
    </div>
  </footer>
);

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [homeContent, setHomeContent] = useState<any>(null);

  useEffect(() => {
    fetchData('/homepage').then(setHomeContent).catch(console.error);
  }, [currentPage]);

  return (
    <div className="min-h-screen font-sans flex flex-col">
      {currentPage !== 'admin' && <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />}
      <main className="flex-grow">
        {currentPage === 'home' && (
          <>
            {homeContent?.section_hero_enabled !== 0 && <Hero content={homeContent} />}
            {homeContent?.section_vision_enabled !== 0 && <VisionSection content={homeContent} />}
            {homeContent?.section_featured_enabled !== 0 && <FeaturedSection content={homeContent} />}
            {homeContent?.section_cta_enabled !== 0 && <CTASection content={homeContent} />}
          </>
        )}
        {currentPage === 'seastorm-models' && <SeaStormModelsPage setCurrentPage={setCurrentPage} />}
        {currentPage === 'seastorm12' && <SeaStorm12Page />}
        {currentPage === 'seastorm17' && <SeaStorm17Page />}
        {currentPage === 'sell-your-boat' && <SellYourBoatPage />}
        {currentPage === 'admin' && <AdminDashboard />}
      </main>
      {currentPage !== 'admin' && <Footer content={homeContent} setCurrentPage={setCurrentPage} />}
    </div>
  );
}
