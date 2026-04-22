import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { fetchData, getImageUrl } from './lib/api';
import { waLink } from './lib/constants';

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
                                className="bg-white rounded-sm shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden group"
                            >
                                <div
                                    className="aspect-[4/3] overflow-hidden bg-gray-100 cursor-pointer"
                                    onClick={() => setCurrentPage(boat.name.toLowerCase().includes('12') ? 'seastorm12' : (boat.name.toLowerCase().includes('17') ? 'seastorm17' : 'home'))}
                                >
                                    <img
                                        src={getImageUrl(boat.main_image)}
                                        alt={boat.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                </div>
                                <div className="p-8">
                                    <h3
                                        className="font-bold text-2xl text-primary uppercase tracking-tight mb-2 cursor-pointer"
                                        onClick={() => setCurrentPage(boat.name.toLowerCase().includes('12') ? 'seastorm12' : (boat.name.toLowerCase().includes('17') ? 'seastorm17' : 'home'))}
                                    >
                                        {boat.name}
                                    </h3>
                                    <p className="text-secondary text-sm mb-6">
                                        {boat.length} • {boat.capacity} Persons • {boat.brand}
                                    </p>
                                    <div className="flex flex-col gap-3">
                                        <button
                                            onClick={() => setCurrentPage(boat.name.toLowerCase().includes('12') ? 'seastorm12' : (boat.name.toLowerCase().includes('17') ? 'seastorm17' : 'home'))}
                                            className="flex items-center text-primary font-bold text-[10px] tracking-widest uppercase gap-2 group-hover:gap-3 transition-all"
                                        >
                                            View Details <ArrowRight className="w-3 h-3" />
                                        </button>
                                        <a
                                            href={waLink(`Hi, I'd like to book an inspection for the ${boat.name}.`)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-white font-bold text-[10px] tracking-widest uppercase rounded-sm hover:scale-95 transition-transform"
                                        >
                                            <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                            </svg>
                                            Book Inspection
                                        </a>
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
