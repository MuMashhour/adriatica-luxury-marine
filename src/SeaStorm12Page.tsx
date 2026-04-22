import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchData } from './lib/api';

export default function SeaStorm12Page() {
    const [boat, setBoat] = useState<any>(null);
    const [activeColorIdx, setActiveColorIdx] = useState(0);
    const [imageIdx, setImageIdx] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData('/boats')
            .then(data => {
                const b = data.find((x: any) => x.name.includes('12'));
                setBoat(b);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="min-h-screen flex items-center justify-center font-bold uppercase tracking-widest text-primary">Tuning Performance...</div>;
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
        setImageIdx(0); // Reset to first image of the new color
    };

    const nextImage = () => setImageIdx((prev) => (prev + 1) % images.length);
    const prevImage = () => setImageIdx((prev) => (prev - 1 + images.length) % images.length);

    return (
        <div className="pt-20 pb-32 bg-white min-h-screen">
            <div className="max-w-[90rem] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">

                {/* Left: Image Carousel (Sticky) */}
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
                                alt={`SeaStorm 12 in ${activeColor.name} - View ${imageIdx + 1}`}
                                className="w-full h-full object-contain drop-shadow-2xl"
                            />
                        </AnimatePresence>

                        {/* Carousel Controls */}
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={prevImage}
                                    className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/70 backdrop-blur-md hover:bg-white text-primary p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
                                    aria-label="Previous image"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/70 backdrop-blur-md hover:bg-white text-primary p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
                                    aria-label="Next image"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </>
                        )}

                        {/* Indicators */}
                        {images.length > 1 && (
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 bg-white/60 backdrop-blur-md px-5 py-2.5 rounded-full shadow-sm">
                                {displayImages.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setImageIdx(i)}
                                        className={`w-2 h-2 rounded-full transition-all duration-300 ${i === imageIdx ? 'bg-primary scale-125' : 'bg-primary/30 hover:bg-primary/60'}`}
                                        aria-label={`Go to image ${i + 1}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-center px-4">
                        <div className="text-secondary tracking-widest text-[9px] uppercase font-bold">Resale Gallery</div>
                        <div className="text-secondary tracking-widest text-[9px] uppercase font-bold">{imageIdx + 1} / {displayImages.length}</div>
                    </div>
                </div>

                {/* Right: Product Info & Configuration */}
                <div className="lg:col-span-5 flex flex-col pt-4 lg:pt-12">
                    {/* Header */}
                    <div className="mb-14">
                        <div className="inline-block px-4 py-1.5 bg-gray-100 text-primary font-bold text-[9px] tracking-[0.25em] uppercase rounded-full mb-8">
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
                            <h3 className="font-bold text-[10px] text-gray-400 tracking-[0.2em] uppercase">Hull Finish</h3>
                            <span className="text-primary font-bold text-sm tracking-widest uppercase">{activeColor.name}</span>
                        </div>

                        <div className="flex flex-wrap gap-5">
                            {colors.map((color: any, idx: number) => (
                                <button
                                    key={color.name}
                                    onClick={() => handleColorChange(idx)}
                                    className={`relative w-14 h-14 rounded-full transition-all duration-300 flex items-center justify-center group ${activeColorIdx === idx ? 'ring-1 ring-primary ring-offset-[5px] scale-110' : 'hover:scale-110 shadow-sm border border-gray-100/50'}`}
                                    style={{ backgroundColor: color.hex }}
                                    title={color.name}
                                >
                                    {/* Subtle inner shadow for depth */}
                                    <div className="absolute inset-0 rounded-full shadow-inner opacity-40 mix-blend-overlay"></div>

                                    {activeColorIdx === idx && (
                                        <Check className={`w-5 h-5 relative z-10 ${['White', 'Yellow', 'Lime', '#f0f0f0', '#cfcfcf'].includes(color.name) || color.hex === '#f0f0f0' ? 'text-black/70' : 'text-white/90'}`} />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Specifications */}
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
                            <span className="font-bold text-[9px] text-gray-400 tracking-[0.2em] uppercase block mb-3">Capacity</span>
                            <span className="font-light text-primary text-3xl tracking-tighter">{boat.capacity}</span>
                            <span className="text-sm text-gray-400 ml-2">Persons</span>
                        </div>
                        <div>
                            <span className="font-bold text-[9px] text-gray-400 tracking-[0.2em] uppercase block mb-3">Hull Material</span>
                            <span className="font-light text-primary text-xl tracking-tight leading-none block pt-2">Premium HDPE</span>
                        </div>
                    </div>

                    <div className="pt-8 flex flex-col sm:flex-row gap-4">
                        <button className="bg-primary text-white px-10 py-5 font-bold text-[11px] tracking-[0.2em] uppercase rounded-sm hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-4 flex-1">
                            Request Appraisal
                            <ArrowRight className="w-4 h-4" />
                        </button>
                        <button className="border border-gray-200 text-primary px-10 py-5 font-bold text-[11px] tracking-[0.2em] uppercase rounded-sm hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-4">
                            Download Brochure
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
