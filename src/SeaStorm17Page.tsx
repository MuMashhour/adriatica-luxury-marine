import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchData } from './lib/api';

export default function SeaStorm17Page() {
    const [boat, setBoat] = useState<any>(null);
    const [activeColorIdx, setActiveColorIdx] = useState(0);
    const [imageIdx, setImageIdx] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData('/boats')
            .then(data => {
                const b = data.find((x: any) => x.name.includes('17'));
                setBoat(b);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="min-h-screen flex items-center justify-center font-bold uppercase tracking-widest text-primary">Syncing Systems...</div>;
    if (!boat) return <div className="min-h-screen flex items-center justify-center">Vessel not found in registry.</div>;

    const colors = boat.colors || [];
    const colorImages = boat.images || [];

    const activeColor = colors[activeColorIdx] || { name: 'Default' };
    const images = colorImages.filter((img: any) => img.color_name === activeColor.name).map((img: any) => img.image_path);

    // Fallback if no images found for color, use boat main image
    const displayImages = images.length > 0 ? images : [boat.main_image];
    const currentImage = displayImages[imageIdx] || '';

    const handleColorChange = (idx: number) => {
        setActiveColorIdx(idx);
        setImageIdx(0);
    };

    const nextImage = () => setImageIdx((prev) => (prev + 1) % images.length);
    const prevImage = () => setImageIdx((prev) => (prev - 1 + images.length) % images.length);

    return (
        <div className="pt-20 pb-32 bg-white min-h-screen">
            <div className="max-w-[90rem] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">

                {/* Left: Image Carousel */}
                <div className="lg:col-span-7 lg:sticky lg:top-32 space-y-6">
                    <div className="relative w-full bg-surface rounded-2xl overflow-hidden aspect-[16/11] sm:aspect-[4/3] lg:aspect-[16/12] group flex items-center justify-center p-8 sm:p-12 border border-gray-100/50 shadow-[inset_0_0_40px_rgba(0,0,0,0.02)]">
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={currentImage}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                src={currentImage}
                                alt={`SeaStorm 17 in ${activeColor.name}`}
                                className="w-full h-full object-contain drop-shadow-2xl"
                            />
                        </AnimatePresence>

                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={prevImage}
                                    className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/70 backdrop-blur-md hover:bg-white text-primary p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/70 backdrop-blur-md hover:bg-white text-primary p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </>
                        )}
                    </div>

                    <div className="flex justify-between items-center px-4">
                        <div className="text-secondary tracking-widest text-[9px] uppercase font-bold">SeaStorm 17 Perspective</div>
                        <div className="text-secondary tracking-widest text-[9px] uppercase font-bold">Model Visualization</div>
                    </div>
                </div>

                {/* Right: Info */}
                <div className="lg:col-span-5 flex flex-col pt-4 lg:pt-12">
                    <div className="mb-14">
                        <div className="inline-block px-4 py-1.5 bg-primary/10 text-primary font-bold text-[9px] tracking-[0.25em] uppercase rounded-full mb-8">
                            Authorised Resale Model
                        </div>
                        <h1 className="font-extrabold text-5xl md:text-6xl lg:text-7xl text-primary tracking-tighter uppercase leading-[0.9] mb-4">
                            {boat.name}
                        </h1>
                        <h2 className="text-2xl md:text-3xl font-light text-secondary tracking-tight">
                            {boat.brand} Advantage
                        </h2>
                    </div>

                    <p className="text-secondary text-lg leading-relaxed mb-14 font-light border-l-2 border-primary/20 pl-6">
                        {boat.description}
                    </p>

                    {/* Color Switcher */}
                    <div className="mb-16 pb-12 border-b border-gray-100">
                        <div className="flex justify-between items-end mb-8">
                            <h3 className="font-bold text-[10px] text-gray-400 tracking-[0.2em] uppercase">Hull Configuration</h3>
                            <span className="text-primary font-bold text-sm tracking-widest uppercase">{activeColor.name}</span>
                        </div>

                        <div className="flex flex-wrap gap-5">
                            {colors.map((color: any, idx: number) => (
                                <button
                                    key={color.name}
                                    onClick={() => handleColorChange(idx)}
                                    className={`relative w-14 h-14 rounded-full transition-all duration-300 flex items-center justify-center group ${activeColorIdx === idx ? 'ring-1 ring-primary ring-offset-[5px] scale-110' : 'hover:scale-110 shadow-sm border border-gray-100/50'}`}
                                    style={{ backgroundColor: color.hex }}
                                >
                                    <div className="absolute inset-0 rounded-full shadow-inner opacity-40 mix-blend-overlay"></div>
                                    {activeColorIdx === idx && (
                                        <Check className={`w-5 h-5 relative z-10 ${['White', '#f0f0f0', '#cfcfcf'].includes(color.name) || color.hex === '#f0f0f0' ? 'text-black/70' : 'text-white/90'}`} />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-y-12 gap-x-12 mb-16">
                        <div>
                            <span className="font-bold text-[9px] text-gray-400 tracking-[0.2em] uppercase block mb-3">Length Overall</span>
                            <span className="font-light text-primary text-3xl tracking-tighter">{boat.length}</span>
                        </div>
                        <div>
                            <span className="font-bold text-[9px] text-gray-400 tracking-[0.2em] uppercase block mb-3">Beam</span>
                            <span className="font-light text-primary text-3xl tracking-tighter">{boat.beam}</span>
                        </div>
                        <div>
                            <span className="font-bold text-[9px] text-gray-400 tracking-[0.2em] uppercase block mb-3">Max Capacity</span>
                            <span className="font-light text-primary text-3xl tracking-tighter">{boat.capacity}</span>
                            <span className="text-sm text-gray-400 ml-2">Persons</span>
                        </div>
                        <div>
                            <span className="font-bold text-[9px] text-gray-400 tracking-[0.2em] uppercase block mb-3">Engine Support</span>
                            <span className="font-light text-primary text-3xl tracking-tighter">{boat.engine}</span>
                        </div>
                    </div>

                    <div className="pt-8 flex flex-col sm:flex-row gap-4">
                        <button className="bg-primary text-white px-10 py-5 font-bold text-[11px] tracking-[0.2em] uppercase rounded-sm hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-4 flex-1">
                            Inquire Now
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
