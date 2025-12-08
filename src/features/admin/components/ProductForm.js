"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Loader2, Save, ArrowLeft } from "lucide-react";
import { addProduct, updateProduct, uploadImage } from "@/features/admin/actions";
import { useToast } from "@/context/ToastContext"; // Import hook
import Link from "next/link";

export default function ProductForm({ initialData = null, isEditMode = false }) {
    const router = useRouter();
    // FIX: Destructure removeToast from the hook
    const { addToast, removeToast } = useToast(); 
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadingImg, setUploadingImg] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        description: initialData?.description || "",
        category: initialData?.category || "",
        series: initialData?.series || "",
        year: initialData?.year || new Date().getFullYear(),
        price: initialData?.price || "",
        originalPrice: initialData?.originalPrice || "",
        inStock: initialData?.inStock ?? true,
        // SEO
        seoTitle: initialData?.seoTitle || "",
        seoDescription: initialData?.seoDescription || "",
        seoKeywords: initialData?.seoKeywords || "",
    });

    const [images, setImages] = useState(initialData?.images || []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingImg(true);
        // Start loading toast and capture ID
        const loadId = addToast("Uploading image...", "loading"); 
        
        const data = new FormData();
        data.append('file', file);

        const res = await uploadImage(data);
        
        // FIX: Remove the specific loading toast using its ID
        removeToast(loadId); 
        
        if (res.success) {
            setImages(prev => [...prev, res.url]);
            addToast("Image uploaded successfully", "success");
        } else {
            addToast("Image upload failed", "error");
        }
        setUploadingImg(false);
    };

    const removeImage = (indexToRemove) => {
        setImages(prev => prev.filter((_, i) => i !== indexToRemove));
        addToast("Image removed", "info");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (images.length === 0) {
            addToast("Please upload at least one image", "warning");
            setIsSubmitting(false);
            return;
        }

        const payload = {
            ...formData,
            price: Number(formData.price),
            originalPrice: Number(formData.originalPrice),
            year: Number(formData.year),
            images: images
        };

        let res;
        if (isEditMode) {
            res = await updateProduct(initialData._id, payload);
        } else {
            res = await addProduct(payload);
        }

        if (res.success) {
            addToast(isEditMode ? "Product updated successfully!" : "Product created successfully!", "success");
            router.push('/admin');
        } else {
            addToast(res.error || "Something went wrong", "error");
        }
        setIsSubmitting(false);
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto px-4 pb-20 md:pb-0" 
        >
            {/* Header - Stacks on mobile */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pt-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin">
                        <button className="p-2 hover:bg-gray-100 rounded-md transition text-gray-500">
                            <ArrowLeft size={20} />
                        </button>
                    </Link>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                        {isEditMode ? "Edit Product" : "Add Product"}
                    </h1>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-md font-medium hover:bg-indigo-700 transition disabled:opacity-70 shadow-sm text-sm"
                >
                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {isEditMode ? "Update" : "Save Product"}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Left Column: Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Basic Details Card */}
                    <div className="bg-white p-4 md:p-6 rounded-md border border-gray-200 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-4 border-b pb-2">Basic Information</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputGroup label="Product Name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. 1969 Chevy Camaro" required />
                                <InputGroup label="Series" name="series" value={formData.series} onChange={handleChange} placeholder="e.g. Mainline 2024" required />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea 
                                    name="description" 
                                    rows={4} 
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">Category</label>
                                    <select name="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 outline-none text-sm bg-white" required>
                                        <option value="">Select...</option>
                                        <option value="Muscle">Muscle</option>
                                        <option value="Exotic">Exotic</option>
                                        <option value="JDM">JDM</option>
                                        <option value="Trucks">Trucks</option>
                                        <option value="Fantasy">Fantasy</option>
                                    </select>
                                </div>
                                <InputGroup label="Year" type="number" name="year" value={formData.year} onChange={handleChange} required />
                                <div className="flex items-center pt-2 md:pt-6">
                                    <label className="flex items-center gap-3 cursor-pointer select-none">
                                        <input 
                                            type="checkbox" 
                                            name="inStock" 
                                            checked={formData.inStock} 
                                            onChange={handleChange}
                                            className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300" 
                                        />
                                        <span className="text-sm font-medium text-gray-700">Available in Stock</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SEO Card */}
                    <div className="bg-white p-4 md:p-6 rounded-md border border-gray-200 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
                            <span>SEO</span>
                            <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Optional</span>
                        </h3>
                        <div className="space-y-4">
                            <InputGroup label="Meta Title" name="seoTitle" value={formData.seoTitle} onChange={handleChange} placeholder="Title for search results" />
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">Meta Description</label>
                                <textarea 
                                    name="seoDescription" 
                                    rows={2} 
                                    value={formData.seoDescription}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 outline-none transition text-sm resize-none"
                                />
                            </div>
                            <InputGroup label="Keywords" name="seoKeywords" value={formData.seoKeywords} onChange={handleChange} placeholder="hot wheels, cars, diecast" />
                        </div>
                    </div>
                </div>

                {/* Right Column: Pricing & Images */}
                <div className="space-y-6">
                    
                    {/* Pricing */}
                    <div className="bg-white p-4 md:p-6 rounded-md border border-gray-200 shadow-sm">
                         <h3 className="font-semibold text-gray-900 mb-4 border-b pb-2">Pricing</h3>
                         <div className="space-y-4">
                            <InputGroup label="Selling Price ($)" type="number" name="price" value={formData.price} onChange={handleChange} required />
                            <InputGroup label="MRP ($)" type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange} />
                         </div>
                    </div>

                    {/* Images */}
                    <div className="bg-white p-4 md:p-6 rounded-md border border-gray-200 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-4 border-b pb-2">Images</h3>
                        
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <AnimatePresence>
                                {images.map((img, index) => (
                                    <motion.div 
                                        key={img}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="relative aspect-square rounded-md border border-gray-200 overflow-hidden group"
                                    >
                                        <img src={img} className="w-full h-full object-cover" />
                                        <button 
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 bg-white/90 p-1 rounded-full text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition shadow-sm"
                                        >
                                            <X size={14} />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            
                            {/* Upload Button */}
                            {images.length < 4 && (
                                <label className={`
                                    aspect-square rounded-md border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition
                                    ${uploadingImg ? 'opacity-50 pointer-events-none' : ''}
                                `}>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                                    {uploadingImg ? (
                                        <Loader2 className="animate-spin text-indigo-500" size={24} />
                                    ) : (
                                        <>
                                            <Upload className="text-gray-400 mb-2" size={24} />
                                            <span className="text-xs text-gray-500 font-medium">Upload</span>
                                        </>
                                    )}
                                </label>
                            )}
                        </div>
                        <p className="text-xs text-gray-400">First image is cover.</p>
                    </div>

                </div>
            </div>
        </motion.div>
    );
}

function InputGroup({ label, ...props }) {
    return (
        <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <motion.input 
                whileFocus={{ scale: 1.01 }}
                {...props}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm"
            />
        </div>
    )
}