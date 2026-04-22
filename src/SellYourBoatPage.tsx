import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { postData } from './lib/api';

const SellYourBoatPage = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        make: '',
        modelYear: '',
        details: ''
    });
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');
        try {
            await postData('/appraisals', {
                full_name: `${formData.firstName} ${formData.lastName}`,
                email: formData.email,
                boat_model: formData.make,
                boat_year: formData.modelYear,
                description: formData.details
            });
            setStatus('success');
        } catch (err) {
            console.error('Submission failed:', err);
            setStatus('idle');
        }
    };
    return (
        <div className="pt-24 min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-6 md:px-8 py-16 grid grid-cols-1 lg:grid-cols-2 gap-16 pt-16">

                {/* Left Side: Information */}
                <div className="flex flex-col justify-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-block px-4 py-1 bg-secondary/10 text-secondary font-bold text-[9px] tracking-[0.25em] uppercase rounded-full mb-6">
                            Exclusive Brokerage
                        </div>
                        <h1 className="font-extrabold text-5xl text-primary tracking-tight leading-tight mb-6 uppercase">
                            List Your Vessel With Adriatica
                        </h1>
                        <p className="text-secondary text-lg leading-relaxed mb-12">
                            Our curated network of high-net-worth individuals and international clientele ensures your aquatic asset receives the audience it deserves. Experience a seamless transition engineered by master mariners.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-bold text-lg text-primary mb-1">Global Reach</h3>
                                    <p className="text-sm text-secondary leading-relaxed">Direct access to qualified buyers across the Middle East, Europe, and beyond.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-bold text-lg text-primary mb-1">Unmatched Marketing</h3>
                                    <p className="text-sm text-secondary leading-relaxed">Professional cinematography, premium placements, and an elegant digital presentation.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-bold text-lg text-primary mb-1">Concierge Service</h3>
                                    <p className="text-sm text-secondary leading-relaxed">From comprehensive appraisal to final paperwork, we manage the entire transaction discreetly.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right Side: Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="bg-white p-8 md:p-12 shadow-xl rounded-sm"
                >
                    {status === 'success' ? (
                        <div className="text-center py-12">
                            <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-6" />
                            <h2 className="text-2xl font-bold text-primary uppercase mb-4">Request Received</h2>
                            <p className="text-secondary mb-8">Our brokerage team has received your appraisal request. We will contact you shortly via email.</p>
                            <button onClick={() => setStatus('idle')} className="text-primary font-bold text-[10px] uppercase tracking-widest border-b border-primary/20 pb-1">Submit Another Vessel</button>
                        </div>
                    ) : (
                        <>
                            <h2 className="font-bold text-3xl text-primary mb-2">Start the Process</h2>
                            <p className="text-secondary text-sm mb-8">Enter your vessel's details for an initial appraisal.</p>

                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="font-bold text-[10px] text-gray-500 tracking-widest uppercase block">First Name</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full bg-gray-50 border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                            placeholder="John"
                                            value={formData.firstName}
                                            onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="font-bold text-[10px] text-gray-500 tracking-widest uppercase block">Last Name</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full bg-gray-50 border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                            placeholder="Smith"
                                            value={formData.lastName}
                                            onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="font-bold text-[10px] text-gray-500 tracking-widest uppercase block">Email Address</label>
                                    <input
                                        required
                                        type="email"
                                        className="w-full bg-gray-50 border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="john@example.com"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="font-bold text-[10px] text-gray-500 tracking-widest uppercase block">Boat Make / Brand</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full bg-gray-50 border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                            placeholder="e.g. Seastorm"
                                            value={formData.make}
                                            onChange={e => setFormData({ ...formData, make: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="font-bold text-[10px] text-gray-500 tracking-widest uppercase block">Model & Year</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full bg-gray-50 border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                            placeholder="36X, 2021"
                                            value={formData.modelYear}
                                            onChange={e => setFormData({ ...formData, modelYear: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="font-bold text-[10px] text-gray-500 tracking-widest uppercase block">Additional Details</label>
                                    <textarea
                                        rows={4}
                                        className="w-full bg-gray-50 border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                                        placeholder="Please include engine hours, location, and any custom options..."
                                        value={formData.details}
                                        onChange={e => setFormData({ ...formData, details: e.target.value })}
                                    ></textarea>
                                </div>

                                <button
                                    disabled={status === 'submitting'}
                                    className="w-full bg-primary text-white py-4 font-bold text-[11px] tracking-widest uppercase rounded-sm hover:scale-[0.98] transition-transform flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                                >
                                    {status === 'submitting' ? 'Processing...' : 'Request Appraisal'} <ArrowRight className="w-4 h-4" />
                                </button>
                            </form>
                        </>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default SellYourBoatPage;
