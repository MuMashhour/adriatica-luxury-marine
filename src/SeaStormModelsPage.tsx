import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { fetchData } from './lib/api';
import seastorm17Green from './assets/seastorm/17green.jpg';
import seastorm17Grey from './assets/seastorm/17grey.jpg';
import seastorm17Red from './assets/seastorm/17red.jpg';
import seastorm17White from './assets/seastorm/17white.jpg';

export default function SeaStormModelsPage({ setCurrentPage }: { setCurrentPage: (page: string) => void }) {
    const [boats, setBoats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData('/boats')
            .then(data => setBoats(data.filter((b: any) => b.is_authorised_resale)))
            .finally(() => setLoading(false));
    }, []);
    return (
        <div className="pt-16 bg-surface min-h-screen">
            {/* Header Section */}
            <section className="py-20 bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 md:px-8 text-center">
                    <div className="inline-block px-4 py-1.5 bg-primary/10 text-primary font-bold text-[9px] tracking-[0.25em] uppercase rounded-full mb-6">
                        Authorised Resale
                    </div>
                    <h1 className="font-bold text-5xl md:text-7xl text-primary tracking-tighter uppercase mb-6">
                        SEASTORM
                    </h1>
                    <p className="text-secondary text-lg max-w-2xl mx-auto leading-relaxed">
                        Discover the pinnacle of Norwegian marine engineering.
                        Seastorm boats combine the indestructible nature of HDPE with
                        elegant, functional design for the ultimate Red Sea experience.
                    </p>
                </div>
            </section>

            {/* Models Grid */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-6 md:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {loading ? (
                            <div className="col-span-full text-center py-20 text-primary font-bold uppercase tracking-widest opacity-50">Syncing Fleet...</div>
                        ) : boats.map(boat => (
                            <motion.div
                                key={boat.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="bg-white rounded-sm shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden group cursor-pointer"
                                onClick={() => setCurrentPage(boat.name.toLowerCase().includes('12') ? 'seastorm12' : (boat.name.toLowerCase().includes('17') ? 'seastorm17' : 'home'))}
                            >
                                <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                                    <img
                                        src={boat.main_image}
                                        alt={boat.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                </div>
                                <div className="p-8">
                                    <h3 className="font-bold text-2xl text-primary uppercase tracking-tight mb-2">{boat.name}</h3>
                                    <p className="text-secondary text-sm mb-6">
                                        {boat.length} • {boat.capacity} Persons • {boat.brand}
                                    </p>
                                    <div className="flex items-center text-primary font-bold text-[10px] tracking-widest uppercase gap-2 group-hover:gap-3 transition-all">
                                        View Details <ArrowRight className="w-3 h-3" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
