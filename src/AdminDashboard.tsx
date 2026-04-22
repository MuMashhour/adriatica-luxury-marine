import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Layout, Ship, FileText, MessageSquare, Save, Plus, Trash2, X,
    ChevronRight, Upload, Image as ImageIcon, Palette, ChevronDown, ChevronUp, Eye
} from 'lucide-react';
import { fetchData, putData, postData, deleteData, uploadFile, getImageUrl } from './lib/api';

// ─── Reusable image uploader ───────────────────────────────────────────────
function ImageUploader({
    currentPath,
    onUploaded,
    label = 'Upload Image',
    small = false
}: {
    currentPath?: string | null;
    onUploaded: (path: string) => void;
    label?: string;
    small?: boolean;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(currentPath || null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        setPreview(currentPath || null);
    }, [currentPath]);

    const handleFile = async (file: File) => {
        setPreview(URL.createObjectURL(file));
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('image', file);
            const res = await uploadFile('/upload', fd);
            onUploaded(res.path);
        } catch {
            alert('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    return (
        <div
            className={`relative border-2 border-dashed border-gray-200 rounded-sm overflow-hidden cursor-pointer hover:border-primary transition-colors ${small ? 'h-24' : 'h-40'}`}
            onDrop={onDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
        >
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
            {preview ? (
                <>
                    <img src={getImageUrl(preview)} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                            <Upload className="w-3 h-3" /> Replace
                        </span>
                    </div>
                </>
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-300">
                    <ImageIcon className={small ? 'w-5 h-5' : 'w-8 h-8'} />
                    <span className="text-[9px] font-bold uppercase tracking-widest">{uploading ? 'Uploading...' : label}</span>
                </div>
            )}
            {uploading && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            )}
        </div>
    );
}

// ─── Multi-image uploader for a specific color ─────────────────────────────
function ColorImageManager({
    boatId,
    colorName,
    existingImages,
    onUpdate
}: {
    boatId: number;
    colorName: string;
    existingImages: any[];
    onUpdate: () => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const handleFiles = async (files: FileList) => {
        setUploading(true);
        try {
            const fd = new FormData();
            Array.from(files).forEach(f => fd.append('images', f));
            fd.append('color_name', colorName);
            await uploadFile(`/boats/${boatId}/images`, fd);
            onUpdate();
        } catch {
            alert('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (imageId: number) => {
        await deleteData(`/images/${imageId}`);
        onUpdate();
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
                {existingImages.map(img => (
                    <div key={img.id} className="relative group w-20 h-16 rounded-sm overflow-hidden bg-gray-100">
                        <img src={getImageUrl(img.image_path)} className="w-full h-full object-cover" alt="" />
                        <button
                            onClick={() => handleDelete(img.id)}
                            className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}
                <button
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className="w-20 h-16 rounded-sm border-2 border-dashed border-gray-200 hover:border-primary transition-colors flex flex-col items-center justify-center gap-1 text-gray-300 hover:text-primary"
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={e => { if (e.target.files) handleFiles(e.target.files); }}
                    />
                    {uploading ? (
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <>
                            <Plus className="w-4 h-4" />
                            <span className="text-[8px] font-bold uppercase">Add</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

// ─── Full boat modal ────────────────────────────────────────────────────────
function BoatModal({
    boat,
    onClose,
    onSaved
}: {
    boat: any | null;
    onClose: () => void;
    onSaved: () => void;
}) {
    const isNew = !boat;
    const [step, setStep] = useState<'info' | 'colors'>('info');
    const [savedBoatId, setSavedBoatId] = useState<number | null>(boat?.id ?? null);
    const [saving, setSaving] = useState(false);
    const [liveBoat, setLiveBoat] = useState<any>(boat);

    const [form, setForm] = useState({
        name: boat?.name || '',
        brand: boat?.brand || 'Seastorm',
        length: boat?.length || '',
        beam: boat?.beam || '',
        capacity: boat?.capacity || '',
        engine: boat?.engine || '',
        year: boat?.year || '',
        price: boat?.price || '',
        description: boat?.description || '',
        main_image: boat?.main_image || '',
        is_authorised_resale: boat?.is_authorised_resale ?? 1,
    });

    const [colors, setColors] = useState<any[]>(boat?.colors || []);
    const [newColorName, setNewColorName] = useState('');
    const [newColorHex, setNewColorHex] = useState('#000000');
    const [expandedColor, setExpandedColor] = useState<string | null>(null);
    const [boatImages, setBoatImages] = useState<any[]>(boat?.images || []);

    const reloadBoat = async (id: number) => {
        const b = await fetchData(`/boats/${id}`);
        setLiveBoat(b);
        setColors(b.colors || []);
        setBoatImages(b.images || []);
    };

    const saveInfo = async () => {
        setSaving(true);
        try {
            if (isNew && !savedBoatId) {
                const res = await postData('/boats', form);
                setSavedBoatId(res.id);
                await reloadBoat(res.id);
                setStep('colors');
            } else {
                const id = savedBoatId || boat.id;
                await putData(`/boats/${id}`, form);
                await reloadBoat(id);
                if (!isNew) { onSaved(); onClose(); }
                else setStep('colors');
            }
        } catch {
            alert('Error saving boat');
        } finally {
            setSaving(false);
        }
    };

    const addColor = async () => {
        if (!newColorName.trim() || !savedBoatId) return;
        await postData(`/boats/${savedBoatId}/colors`, { name: newColorName.trim(), hex: newColorHex });
        setNewColorName('');
        setNewColorHex('#000000');
        await reloadBoat(savedBoatId);
    };

    const removeColor = async (colorId: number) => {
        await deleteData(`/colors/${colorId}`);
        await reloadBoat(savedBoatId!);
    };

    const handleMainImageUploaded = async (path: string) => {
        setForm(f => ({ ...f, main_image: path }));
        if (savedBoatId) {
            await putData(`/boats/${savedBoatId}`, { ...form, main_image: path });
        }
    };

    const imagesForColor = (colorName: string) => boatImages.filter(i => i.color_name === colorName);

    return (
        <div className="fixed inset-0 bg-primary/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white w-full max-w-3xl rounded-sm shadow-2xl flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
                    <div>
                        <h3 className="font-extrabold text-xl text-primary uppercase tracking-tight">
                            {isNew ? 'New Vessel Entry' : `Edit: ${boat.name}`}
                        </h3>
                        <div className="flex gap-4 mt-2">
                            {(['info', 'colors'] as const).map(s => (
                                <button
                                    key={s}
                                    onClick={() => { if (savedBoatId || !isNew) setStep(s); }}
                                    className={`text-[9px] font-bold uppercase tracking-widest pb-1 border-b-2 transition-colors ${step === s ? 'border-primary text-primary' : 'border-transparent text-gray-300'} ${(isNew && !savedBoatId && s === 'colors') ? 'cursor-not-allowed opacity-40' : ''}`}
                                >
                                    {s === 'info' ? '1. Info & Image' : '2. Colors & Photos'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-300 hover:text-primary transition-colors" /></button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {step === 'info' && (
                        <div className="space-y-6">
                            {/* Main image */}
                            <div>
                                <label className="block text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">Main Display Image</label>
                                <ImageUploader
                                    currentPath={form.main_image}
                                    onUploaded={handleMainImageUploaded}
                                    label="Upload Main Image"
                                />
                            </div>
                            {/* Fields grid */}
                            <div className="grid grid-cols-2 gap-4">
                                {([
                                    ['Boat Name', 'name', 'e.g. SeaStorm 17'],
                                    ['Brand', 'brand', 'e.g. Seastorm'],
                                    ['Length', 'length', '17 ft (5.20m)'],
                                    ['Beam', 'beam', '6.9 ft (2.10m)'],
                                    ['Capacity', 'capacity', '6'],
                                    ['Engine / Power', 'engine', '60 HP'],
                                    ['Year', 'year', '2024'],
                                    ['Price (Display)', 'price', 'Upon Request'],
                                ] as [string, string, string][]).map(([lbl, key, ph]) => (
                                    <div key={key} className="space-y-1">
                                        <label className="block text-[9px] font-bold uppercase tracking-widest text-gray-400">{lbl}</label>
                                        <input
                                            value={(form as any)[key]}
                                            onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                            placeholder={ph}
                                            className="w-full border-b border-gray-200 py-2 text-sm focus:border-primary outline-none transition-colors"
                                        />
                                    </div>
                                ))}
                            </div>
                            {/* Description */}
                            <div className="space-y-1">
                                <label className="block text-[9px] font-bold uppercase tracking-widest text-gray-400">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    rows={3}
                                    className="w-full border border-gray-100 bg-gray-50 p-3 rounded-sm text-sm focus:border-primary outline-none"
                                    placeholder="Boat description..."
                                />
                            </div>
                            {/* Toggle */}
                            <label className="flex items-center gap-3 cursor-pointer">
                                <div
                                    onClick={() => setForm(f => ({ ...f, is_authorised_resale: f.is_authorised_resale ? 0 : 1 }))}
                                    className={`w-10 h-5 rounded-full transition-colors ${form.is_authorised_resale ? 'bg-primary' : 'bg-gray-300'}`}
                                >
                                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_authorised_resale ? 'translate-x-5' : 'translate-x-0'}`} />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Authorised Resale</span>
                            </label>
                        </div>
                    )}

                    {step === 'colors' && savedBoatId && (
                        <div className="space-y-6">
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Add color variants and upload photos for each color.</p>

                            {/* Add color form */}
                            <div className="flex gap-3 items-end bg-gray-50 p-4 rounded-sm">
                                <div className="flex-1 space-y-1">
                                    <label className="block text-[9px] font-bold uppercase tracking-widest text-gray-400">Color Name</label>
                                    <input
                                        value={newColorName}
                                        onChange={e => setNewColorName(e.target.value)}
                                        placeholder="e.g. Midnight Black"
                                        className="w-full border-b border-gray-200 py-2 text-sm focus:border-primary outline-none bg-transparent"
                                        onKeyDown={e => e.key === 'Enter' && addColor()}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-[9px] font-bold uppercase tracking-widest text-gray-400">Hex</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={newColorHex}
                                            onChange={e => setNewColorHex(e.target.value)}
                                            className="w-10 h-10 cursor-pointer rounded border-0 p-0.5 bg-transparent"
                                        />
                                        <input
                                            value={newColorHex}
                                            onChange={e => setNewColorHex(e.target.value)}
                                            className="w-24 border-b border-gray-200 py-2 text-sm font-mono focus:border-primary outline-none bg-transparent"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={addColor}
                                    disabled={!newColorName.trim()}
                                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:scale-95 transition-transform disabled:opacity-40"
                                >
                                    <Plus className="w-3 h-3" /> Add
                                </button>
                            </div>

                            {/* Colors list */}
                            {colors.length === 0 ? (
                                <p className="text-center text-gray-300 py-8 text-sm italic">No colors added yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {colors.map(color => (
                                        <div key={color.id} className="border border-gray-100 rounded-sm overflow-hidden">
                                            <div
                                                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                                                onClick={() => setExpandedColor(expandedColor === color.name ? null : color.name)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-6 h-6 rounded-full border border-gray-200" style={{ backgroundColor: color.hex }} />
                                                    <span className="font-bold text-sm text-primary">{color.name}</span>
                                                    <span className="text-[9px] text-gray-400 font-mono">{color.hex}</span>
                                                    <span className="text-[9px] text-gray-400">
                                                        {imagesForColor(color.name).length} photo{imagesForColor(color.name).length !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={e => { e.stopPropagation(); removeColor(color.id); }}
                                                        className="p-1 hover:text-red-600 transition-colors text-gray-300"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                    {expandedColor === color.name ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                                </div>
                                            </div>
                                            {expandedColor === color.name && (
                                                <div className="px-4 pb-4 border-t border-gray-100 pt-3 bg-gray-50">
                                                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-3">Photos for {color.name}</p>
                                                    <ColorImageManager
                                                        boatId={savedBoatId}
                                                        colorName={color.name}
                                                        existingImages={imagesForColor(color.name)}
                                                        onUpdate={() => reloadBoat(savedBoatId)}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center flex-shrink-0">
                    <button onClick={onClose} className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-primary transition-colors">
                        {step === 'colors' ? 'Done' : 'Cancel'}
                    </button>
                    {step === 'info' && (
                        <button
                            onClick={saveInfo}
                            disabled={saving || !form.name.trim()}
                            className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:scale-95 transition-transform shadow-lg disabled:opacity-40"
                        >
                            {saving ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-3 h-3" />}
                            {isNew ? 'Save & Add Colors' : 'Save Changes'}
                        </button>
                    )}
                    {step === 'colors' && (
                        <button
                            onClick={() => { onSaved(); onClose(); }}
                            className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:scale-95 transition-transform shadow-lg"
                        >
                            <ChevronRight className="w-3 h-3" /> Finish & Close
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

// ─── Section accordion for homepage editor ─────────────────────────────────
function EditorSection({
    title, children, defaultOpen = false,
    enabled, onToggle
}: {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
    enabled?: boolean;
    onToggle?: () => void;
}) {
    const [open, setOpen] = useState(defaultOpen);
    const hasToggle = enabled !== undefined && onToggle !== undefined;
    return (
        <div className={`border rounded-sm overflow-hidden transition-colors ${hasToggle && !enabled ? 'border-gray-200 opacity-60' : 'border-gray-100'}`}>
            <div className="w-full flex justify-between items-center px-6 py-4 bg-white">
                <button
                    onClick={() => setOpen(o => !o)}
                    className="flex items-center gap-3 text-left flex-1 min-w-0"
                >
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${hasToggle && !enabled ? 'text-gray-400 line-through' : 'text-primary'}`}>{title}</span>
                    {hasToggle && !enabled && (
                        <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Hidden</span>
                    )}
                </button>
                <div className="flex items-center gap-3 flex-shrink-0">
                    {hasToggle && (
                        <button
                            onClick={e => { e.stopPropagation(); onToggle(); }}
                            className={`flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border transition-all ${enabled ? 'border-red-200 text-red-500 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}
                        >
                            {enabled ? 'Disable' : 'Enable'}
                        </button>
                    )}
                    <button onClick={() => setOpen(o => !o)}>
                        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </button>
                </div>
            </div>
            {open && (
                <div className="px-6 pb-6 pt-2 bg-white border-t border-gray-100 space-y-4">
                    {children}
                </div>
            )}
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1">
            <label className="block text-[9px] font-bold uppercase tracking-widest text-gray-400">{label}</label>
            {children}
        </div>
    );
}

const inputCls = "w-full border-b border-gray-200 py-2 text-sm focus:border-primary outline-none transition-colors";
const textareaCls = "w-full border border-gray-100 bg-gray-50 p-3 rounded-sm text-sm focus:border-primary outline-none";

// ─── Main Admin Dashboard ───────────────────────────────────────────────────
export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<'website' | 'appraisals' | 'inquiries'>('website');
    const [boats, setBoats] = useState<any[]>([]);
    const [homeContent, setHomeContent] = useState<any>(null);
    const [appraisals, setAppraisals] = useState<any[]>([]);
    const [inquiries, setInquiries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [boatModal, setBoatModal] = useState<{ open: boolean; boat: any | null }>({ open: false, boat: null });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const pass = prompt('Enter Administrator Password:');
        if (pass === 'admin123') {
            setIsAuthorized(true);
            loadData();
        }
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [b, h, a, i] = await Promise.all([
                fetchData('/boats'),
                fetchData('/homepage'),
                fetchData('/appraisals'),
                fetchData('/inquiries')
            ]);
            setBoats(b);
            setHomeContent(h);
            setAppraisals(a);
            setInquiries(i);
        } catch (err) {
            console.error('Failed to load admin data:', err);
        }
        setLoading(false);
    };

    const handleSaveHomeContent = async () => {
        setSaving(true);
        try {
            await putData('/homepage', homeContent);
            alert('Homepage content saved!');
        } catch {
            alert('Failed to save homepage content');
        } finally {
            setSaving(false);
        }
    };

    const handleHomepageImageUpload = async (field: string, file: File) => {
        const fd = new FormData();
        fd.append('image', file);
        fd.append('field', field);
        try {
            const res = await fetch('http://localhost:5000/api/homepage/upload', { method: 'POST', body: fd });
            const data = await res.json();
            setHomeContent((c: any) => ({ ...c, [field]: data.path }));
        } catch {
            alert('Image upload failed');
        }
    };

    const set = (field: string, value: any) => setHomeContent((c: any) => ({ ...c, [field]: value }));

    if (!isAuthorized) return <div className="min-h-screen bg-primary flex items-center justify-center text-white font-bold uppercase tracking-[0.5em]">Authorization Required</div>;
    if (loading) return <div className="min-h-screen flex items-center justify-center font-bold uppercase tracking-widest text-primary">Loading Registry...</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <div className="w-64 bg-primary text-white flex flex-col p-8 border-r border-white/10 sticky top-0 h-screen">
                <div className="mb-12">
                    <span className="font-bold text-[10px] tracking-[0.3em] uppercase opacity-60 block mb-2">Admin Panel</span>
                    <h1 className="font-extrabold text-2xl tracking-tighter uppercase">ADRIATICA</h1>
                </div>
                <nav className="flex flex-col gap-4">
                    {([['website', Layout, 'Edit Website'], ['appraisals', FileText, 'Appraisals'], ['inquiries', MessageSquare, 'Inquiries']] as const).map(([tab, Icon, label]) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex items-center gap-4 px-4 py-3 rounded-sm transition-all text-xs font-bold uppercase tracking-widest ${activeTab === tab ? 'bg-white text-primary' : 'hover:bg-white/10'}`}
                        >
                            <Icon className="w-4 h-4" /> {label}
                        </button>
                    ))}
                </nav>
                <div className="mt-auto pt-8 border-t border-white/10">
                    <p className="text-[9px] uppercase tracking-widest opacity-40">System Active v2.0</p>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 p-12 overflow-y-auto">
                <header className="flex justify-between items-center mb-12">
                    <h2 className="text-3xl font-extrabold text-primary uppercase tracking-tight">
                        {activeTab === 'website' ? 'Website Editor' : activeTab === 'appraisals' ? 'Appraisal Requests' : 'Recent Inquiries'}
                    </h2>
                    <button onClick={loadData} className="text-[10px] font-bold uppercase tracking-widest text-primary/60 hover:text-primary transition-colors">Refresh Data</button>
                </header>

                <div className="max-w-5xl">
                    {/* ═══ WEBSITE EDITOR ═══════════════════════════════════════════════════ */}
                    {activeTab === 'website' && (
                        <div className="space-y-12">
                            {/* Homepage Content */}
                            <section>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-secondary/60">Homepage Sections</h3>
                                    <button
                                        onClick={handleSaveHomeContent}
                                        disabled={saving}
                                        className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:scale-95 transition-transform shadow-lg disabled:opacity-60"
                                    >
                                        {saving ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-3 h-3" />}
                                        Save All Changes
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {/* Hero */}
                                    <EditorSection title="Hero Section" defaultOpen={true} enabled={!!homeContent?.section_hero_enabled} onToggle={() => set('section_hero_enabled', homeContent?.section_hero_enabled ? 0 : 1)}>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Field label="Hero Title">
                                                <input value={homeContent?.hero_title || ''} onChange={e => set('hero_title', e.target.value)} className={inputCls} />
                                            </Field>
                                            <Field label="Hero Subtitle">
                                                <input value={homeContent?.hero_subtitle || ''} onChange={e => set('hero_subtitle', e.target.value)} className={inputCls} />
                                            </Field>
                                        </div>
                                        <Field label="Hero Background Image">
                                            <ImageUploader
                                                currentPath={homeContent?.hero_image}
                                                onUploaded={path => set('hero_image', path)}
                                                label="Upload Hero Background"
                                            />
                                        </Field>
                                    </EditorSection>

                                    {/* Vision */}
                                    <EditorSection title="Vision / About Section" enabled={!!homeContent?.section_vision_enabled} onToggle={() => set('section_vision_enabled', homeContent?.section_vision_enabled ? 0 : 1)}>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Field label="Section Title">
                                                <input value={homeContent?.vision_title || ''} onChange={e => set('vision_title', e.target.value)} className={inputCls} />
                                            </Field>
                                        </div>
                                        <Field label="Vision Body Text">
                                            <textarea value={homeContent?.vision_text || ''} rows={3} onChange={e => set('vision_text', e.target.value)} className={textareaCls} />
                                        </Field>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Field label="Mission Statement">
                                                <textarea value={homeContent?.vision_mission || ''} rows={3} onChange={e => set('vision_mission', e.target.value)} className={textareaCls} />
                                            </Field>
                                            <Field label="Vision Statement">
                                                <textarea value={homeContent?.vision_vision || ''} rows={3} onChange={e => set('vision_vision', e.target.value)} className={textareaCls} />
                                            </Field>
                                        </div>
                                        <Field label="Section Image (Left side photo)">
                                            <ImageUploader
                                                currentPath={homeContent?.vision_image}
                                                onUploaded={path => set('vision_image', path)}
                                                label="Upload Vision Image"
                                            />
                                        </Field>
                                    </EditorSection>

                                    {/* Featured */}
                                    <EditorSection title="Featured Vessels Section" enabled={!!homeContent?.section_featured_enabled} onToggle={() => set('section_featured_enabled', homeContent?.section_featured_enabled ? 0 : 1)}>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Field label="Section Title">
                                                <input value={homeContent?.featured_title || ''} onChange={e => set('featured_title', e.target.value)} className={inputCls} />
                                            </Field>
                                            <Field label="Section Subtitle">
                                                <input value={homeContent?.featured_subtitle || ''} onChange={e => set('featured_subtitle', e.target.value)} className={inputCls} />
                                            </Field>
                                        </div>

                                        <div className="border-t border-gray-100 pt-4 mt-2">
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-4">Main Featured Card</p>
                                            <div className="grid grid-cols-2 gap-4">
                                                <Field label="Boat Name"><input value={homeContent?.featured_main_name || ''} onChange={e => set('featured_main_name', e.target.value)} className={inputCls} /></Field>
                                                <Field label="Price"><input value={homeContent?.featured_main_price || ''} onChange={e => set('featured_main_price', e.target.value)} className={inputCls} /></Field>
                                                <Field label="Length"><input value={homeContent?.featured_main_length || ''} onChange={e => set('featured_main_length', e.target.value)} className={inputCls} /></Field>
                                                <Field label="Engine"><input value={homeContent?.featured_main_engine || ''} onChange={e => set('featured_main_engine', e.target.value)} className={inputCls} /></Field>
                                                <Field label="Year"><input value={homeContent?.featured_main_year || ''} onChange={e => set('featured_main_year', e.target.value)} className={inputCls} /></Field>
                                                <Field label="Color Swatches (comma-separated hex)">
                                                    <input value={homeContent?.featured_main_colors || ''} onChange={e => set('featured_main_colors', e.target.value)} className={inputCls} placeholder="#001e40,#94a3b8" />
                                                </Field>
                                            </div>
                                            <Field label="Description">
                                                <textarea value={homeContent?.featured_main_description || ''} rows={2} onChange={e => set('featured_main_description', e.target.value)} className={textareaCls} />
                                            </Field>
                                            <Field label="Main Card Image">
                                                <ImageUploader
                                                    currentPath={homeContent?.featured_main_image}
                                                    onUploaded={path => set('featured_main_image', path)}
                                                    label="Upload Main Card Photo"
                                                />
                                            </Field>
                                        </div>

                                        <div className="border-t border-gray-100 pt-4 mt-2 grid grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Secondary Card 1</p>
                                                <Field label="Title"><input value={homeContent?.featured_card1_title || ''} onChange={e => set('featured_card1_title', e.target.value)} className={inputCls} /></Field>
                                                <Field label="Text"><textarea value={homeContent?.featured_card1_text || ''} rows={2} onChange={e => set('featured_card1_text', e.target.value)} className={textareaCls} /></Field>
                                                <Field label="Image">
                                                    <ImageUploader small currentPath={homeContent?.featured_card1_image} onUploaded={path => set('featured_card1_image', path)} label="Upload Photo" />
                                                </Field>
                                            </div>
                                            <div className="space-y-4">
                                                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Secondary Card 2</p>
                                                <Field label="Title"><input value={homeContent?.featured_card2_title || ''} onChange={e => set('featured_card2_title', e.target.value)} className={inputCls} /></Field>
                                                <Field label="Text"><textarea value={homeContent?.featured_card2_text || ''} rows={2} onChange={e => set('featured_card2_text', e.target.value)} className={textareaCls} /></Field>
                                                <Field label="Image">
                                                    <ImageUploader small currentPath={homeContent?.featured_card2_image} onUploaded={path => set('featured_card2_image', path)} label="Upload Photo" />
                                                </Field>
                                            </div>
                                        </div>
                                    </EditorSection>

                                    {/* CTA */}
                                    <EditorSection title="CTA (Call to Action) Section" enabled={!!homeContent?.section_cta_enabled} onToggle={() => set('section_cta_enabled', homeContent?.section_cta_enabled ? 0 : 1)}>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Field label="Title">
                                                <input value={homeContent?.cta_title || ''} onChange={e => set('cta_title', e.target.value)} className={inputCls} />
                                            </Field>
                                        </div>
                                        <Field label="Text">
                                            <textarea value={homeContent?.cta_text || ''} rows={2} onChange={e => set('cta_text', e.target.value)} className={textareaCls} />
                                        </Field>
                                        <Field label="Background Image">
                                            <ImageUploader
                                                currentPath={homeContent?.cta_image}
                                                onUploaded={path => set('cta_image', path)}
                                                label="Upload CTA Background"
                                            />
                                        </Field>
                                    </EditorSection>

                                    {/* Footer */}
                                    <EditorSection title="Footer">
                                        <div className="grid grid-cols-2 gap-4">
                                            <Field label="Company Description">
                                                <input value={homeContent?.footer_description || ''} onChange={e => set('footer_description', e.target.value)} className={inputCls} placeholder="Premium Marine Brokerage" />
                                            </Field>
                                            <Field label="Locations">
                                                <input value={homeContent?.footer_locations || ''} onChange={e => set('footer_locations', e.target.value)} className={inputCls} placeholder="El Gouna | Hurghada | Cairo" />
                                            </Field>
                                        </div>
                                    </EditorSection>
                                </div>
                            </section>

                            {/* Inventory */}
                            <section>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-secondary/60">Manage Inventory</h3>
                                    <button
                                        onClick={() => setBoatModal({ open: true, boat: null })}
                                        className="flex items-center gap-2 border border-primary text-primary px-6 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                                    >
                                        <Plus className="w-3 h-3" /> Add Boat
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    {boats.map(boat => (
                                        <div key={boat.id} className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-6">
                                                <div className="w-20 h-14 bg-gray-100 rounded-sm overflow-hidden flex-shrink-0">
                                                    {boat.main_image ? (
                                                        <img src={getImageUrl(boat.main_image)} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300"><Ship className="w-6 h-6" /></div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-primary text-sm uppercase">{boat.name}</p>
                                                    <p className="text-[9px] text-gray-400 uppercase tracking-widest">{boat.brand} • {boat.price}</p>
                                                    <div className="flex gap-2 mt-2">
                                                        {(boat.colors || []).map((c: any) => (
                                                            <div key={c.id} title={c.name} className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: c.hex }} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setBoatModal({ open: true, boat })}
                                                    className="p-2 hover:text-primary transition-colors text-gray-400 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest"
                                                >
                                                    <Eye className="w-4 h-4" /> Edit
                                                </button>
                                                <button
                                                    onClick={() => { if (confirm(`Delete "${boat.name}"?`)) deleteData(`/boats/${boat.id}`).then(loadData); }}
                                                    className="p-2 hover:text-red-600 transition-colors text-gray-400"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}

                    {/* ═══ APPRAISALS ══════════════════════════════════════════════════════ */}
                    {activeTab === 'appraisals' && (
                        <div className="space-y-4">
                            {appraisals.length === 0 ? (
                                <p className="text-gray-400 text-center py-20 italic">No appraisal requests submitted yet.</p>
                            ) : appraisals.map(app => (
                                <div key={app.id} className="bg-white p-8 rounded-sm shadow-sm border border-gray-100 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-primary uppercase">{app.full_name}</h4>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-widest">{new Date(app.created_at).toLocaleDateString()} • {app.email}</p>
                                        </div>
                                        <div className="bg-gray-100 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest text-secondary">
                                            {app.boat_model} ({app.boat_year})
                                        </div>
                                    </div>
                                    <p className="text-sm text-secondary leading-relaxed border-l-2 border-primary/10 pl-4">{app.description}</p>
                                    <a href={`mailto:${app.email}`} className="inline-block text-[10px] font-bold uppercase tracking-widest text-primary border-b border-primary/20 hover:border-primary transition-all">Reply via Email</a>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ═══ INQUIRIES ═══════════════════════════════════════════════════════ */}
                    {activeTab === 'inquiries' && (
                        <div className="space-y-4">
                            {inquiries.length === 0 ? (
                                <p className="text-gray-400 text-center py-20 italic">No inquiries received yet.</p>
                            ) : inquiries.map(inq => (
                                <div key={inq.id} className="bg-white p-8 rounded-sm shadow-sm border border-gray-100 flex items-center justify-between">
                                    <div>
                                        <h4 className="font-bold text-primary uppercase">{inq.full_name}</h4>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">Inquiry for: <span className="text-primary">{inq.boat_name}</span></p>
                                        <p className="text-sm text-secondary mt-2">"{inq.message}"</p>
                                    </div>
                                    <div className="text-right flex-shrink-0 ml-8">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mb-2">{new Date(inq.created_at).toLocaleDateString()}</p>
                                        <a href={`mailto:${inq.email}`} className="text-[10px] font-bold uppercase tracking-widest text-primary border-b border-primary/20 hover:border-primary transition-all">Reply via Email</a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Boat Modal */}
            <AnimatePresence>
                {boatModal.open && (
                    <BoatModal
                        boat={boatModal.boat}
                        onClose={() => setBoatModal({ open: false, boat: null })}
                        onSaved={loadData}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
