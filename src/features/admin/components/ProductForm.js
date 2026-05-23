"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Save, ArrowLeft, Loader2, Calculator, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { addProduct, updateProduct, uploadImage } from "@/features/admin/actions";
import { useToast } from "@/context/ToastContext"; 
import Link from "next/link";
import { Input } from "@/components/ui/input";
import currency from "currency.js"; // npm install currency.js

// --- CONFIGURATION CONSTANTS (Scalable Logic) ---
const GATEWAY_FEES = {
    stripe: { name: "Stripe", percent: 2.9, fixed: 0.30 },
    razorpay: { name: "CashFree", percent: 2.0, fixed: 0 },
    none: { name: "WhatsApp/COD", percent: 0, fixed: 0 }
};

const SHIPPING_RATES = {
    standard: { name: "Standard Local", base: 5.00 },
    heavy: { name: "National Heavy", base: 12.00 },
    express: { name: "Express Air", base: 20.00 }
};

export default function ProductForm({ initialData = null, isEditMode = false }) {
    const router = useRouter();
    const { addToast, removeToast } = useToast(); 
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadingImg, setUploadingImg] = useState(false);
    
    // Simulation State (For Profit Calc Only - Not saved to DB)
    const [simulatedGateway, setSimulatedGateway] = useState("stripe");

    // Form State
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        description: initialData?.description || "",
        category: initialData?.category || "",
        series: initialData?.series || "",
        year: initialData?.year || new Date().getFullYear(),
        
        // Pricing & Costs
        price: initialData?.price || "", // Selling Price
        originalPrice: initialData?.originalPrice || "",
        costPrice: initialData?.costPrice || "", // NEW: Cost Price
        taxRate: initialData?.taxRate || 0,      // NEW: Tax Rate
        
        // Shipping & Inventory
        weight: initialData?.weight || "",       // NEW: Weight
        shippingClass: initialData?.shippingClass || "standard", // NEW: Class
        stock: initialData?.stock ?? 0,
        
        // SEO (Preserved)
        seoTitle: initialData?.seoTitle || "",
        seoDescription: initialData?.seoDescription || "",
        seoKeywords: initialData?.seoKeywords || "",
    });

    const [images, setImages] = useState(initialData?.images || []);

    // --- REAL-TIME PROFIT ENGINE ---
    const profitAnalysis = useMemo(() => {
        const sellPrice = currency(formData.price || 0);
        const costPrice = currency(formData.costPrice || 0);
        const taxRate = Number(formData.taxRate || 0);
        
        // 1. Calculate Tax Deduction (Assuming inclusive for e-com, or calculate on top)
        // Logic: Tax Amount = Price - (Price / (1 + Rate/100))
        const taxAmount = sellPrice.subtract(sellPrice.divide(1 + (taxRate / 100)));

        // 2. Gateway Fee
        const gatewayConfig = GATEWAY_FEES[simulatedGateway];
        const gatewayFee = sellPrice.multiply(gatewayConfig.percent / 100).add(gatewayConfig.fixed);

        // 3. Shipping Cost
        const shipConfig = SHIPPING_RATES[formData.shippingClass] || SHIPPING_RATES.standard;
        const shippingCost = currency(shipConfig.base);

        // 4. Net Profit
        const totalDeductions = costPrice.add(taxAmount).add(gatewayFee).add(shippingCost);
        const netProfit = sellPrice.subtract(totalDeductions);
        
        // 5. Margin %
        const marginPercent = sellPrice.value > 0 
            ? netProfit.divide(sellPrice).multiply(100).value 
            : 0;

        return {
            tax: taxAmount,
            gateway: gatewayFee,
            shipping: shippingCost,
            totalDeductions,
            netProfit,
            marginPercent,
            isLoss: netProfit.value < 0
        };
    }, [formData.price, formData.costPrice, formData.taxRate, formData.shippingClass, simulatedGateway]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // --- CLOUDINARY LOGIC (Preserved) ---
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingImg(true);
        const loadId = addToast("Uploading image...", "loading"); 
        
        const data = new FormData();
        data.append('file', file);

        const res = await uploadImage(data);
        
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

        const stockValue = Number(formData.stock);
        const priceValue = Number(formData.price);

        if (stockValue < 0) {
             addToast("Stock cannot be negative", "warning");
             setIsSubmitting(false);
             return;
        }

        const payload = {
            ...formData,
            price: priceValue,
            originalPrice: Number(formData.originalPrice),
            year: Number(formData.year),
            stock: stockValue,
            inStock: stockValue > 0,
            
            // New Fields
            costPrice: Number(formData.costPrice),
            taxRate: Number(formData.taxRate),
            weight: Number(formData.weight),
            
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
            className="max-w-6xl mx-auto px-4 pb-20 md:pb-0" 
        >
            {/* Header */}
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
                {/* --- Left Column: Inputs --- */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Basic Details */}
                    <div className="bg-white p-4 md:p-6 rounded-md border border-gray-200 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-4 border-b pb-2">Basic Information</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputGroup label="Product Name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. 1969 Chevy Camaro" required />
                                <InputGroup label="Series" name="series" value={formData.series} onChange={handleChange} placeholder="e.g. Mainline" required />
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="col-span-1">
                                     <InputGroup label="Year" name="year" type="number" value={formData.year} onChange={handleChange} required />
                                </div>
                                <div className="col-span-1 md:col-span-2">
                                     <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                     <select 
                                        name="category" 
                                        value={formData.category} 
                                        onChange={handleChange}
                                        className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
                                        required
                                     >
                                        <option value="">Select Category</option>
                                        <option value="Muscle">Muscle</option>
                                        <option value="Exotic">Exotic</option>
                                        <option value="JDM">JDM</option>
                                        <option value="Trucks">Trucks</option>
                                        <option value="Fantasy">Fantasy</option>
                                        <option value="Race">Race</option>
                                     </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea 
                                    name="description" 
                                    value={formData.description} 
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm"
                                    placeholder="Product details, condition, and features..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Pricing & Inventory (Updated) */}
                    <div className="bg-white p-4 md:p-6 rounded-md border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-4 border-b pb-2">
                            <Calculator size={18} className="text-indigo-600" />
                            <h3 className="font-semibold text-gray-900">Pricing & Costs</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Revenue Side */}
                            <div className="space-y-4">
                                <InputGroup 
                                    label="Selling Price (MRP) ($)" 
                                    name="price" type="number" step="0.01" 
                                    value={formData.price} onChange={handleChange} 
                                    placeholder="0.00" required 
                                />
                                <InputGroup 
                                    label="Original Price ($)" 
                                    name="originalPrice" type="number" step="0.01" 
                                    value={formData.originalPrice} onChange={handleChange} 
                                    placeholder="Optional" 
                                />
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                                    <Input 
                                        type="number" name="stock" value={formData.stock} 
                                        onChange={handleChange} min="0" required 
                                        className="bg-gray-50"
                                    />
                                    <p className="text-[10px] text-gray-500">
                                        {Number(formData.stock) > 0 ? "Status: In Stock" : "Status: Out of Stock"}
                                    </p>
                                </div>
                            </div>

                            {/* Cost Side (New) */}
                            <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price (COGS)</label>
                                    <Input 
                                        name="costPrice" type="number" step="0.01" 
                                        value={formData.costPrice} onChange={handleChange} 
                                        className="bg-white" placeholder="0.00" 
                                    />
                                    <p className="text-[10px] text-gray-500 mt-1">Manufacturer cost + Inbound shipping</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <InputGroup 
                                        label="Tax Rate (%)" name="taxRate" type="number" 
                                        value={formData.taxRate} onChange={handleChange} placeholder="0" 
                                    />
                                    <InputGroup 
                                        label="Weight (g)" name="weight" type="number" min="0"
                                        value={formData.weight} onChange={handleChange} placeholder="0" 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SEO (Preserved) */}
                    <div className="bg-white p-4 md:p-6 rounded-md border border-gray-200 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-4 border-b pb-2">SEO Settings (Optional)</h3>
                         <div className="space-y-4">
                            <InputGroup label="Meta Title" name="seoTitle" value={formData.seoTitle} onChange={handleChange} placeholder="Custom page title" />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                                <textarea 
                                    name="seoDescription" 
                                    value={formData.seoDescription} 
                                    onChange={handleChange}
                                    rows={2}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm"
                                    placeholder="Brief summary for search engines"
                                />
                            </div>
                            <InputGroup label="Keywords" name="seoKeywords" value={formData.seoKeywords} onChange={handleChange} placeholder="hot wheels, diecast, rare, 2024" />
                         </div>
                    </div>
                </div>

                {/* --- Right Column: Analysis & Images --- */}
                <div className="space-y-6">
                    
                    {/* PROFIT ANALYSIS CARD (NEW) */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden sticky top-24">
                        <div className="bg-gray-900 px-6 py-4 border-b border-gray-800">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <TrendingUp size={18} className="text-green-400" /> Profit Analysis
                            </h3>
                            <p className="text-gray-400 text-xs mt-1">Real-time breakdown</p>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Simulation Controls */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Gateway</label>
                                    <select 
                                        value={simulatedGateway} 
                                        onChange={(e) => setSimulatedGateway(e.target.value)}
                                        className="w-full text-xs mt-1 p-2 border rounded bg-gray-50"
                                    >
                                        {Object.keys(GATEWAY_FEES).map(k => (
                                            <option key={k} value={k}>{GATEWAY_FEES[k].name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Shipping</label>
                                    <select 
                                        name="shippingClass" 
                                        value={formData.shippingClass} 
                                        onChange={handleChange}
                                        className="w-full text-xs mt-1 p-2 border rounded bg-gray-50"
                                    >
                                        {Object.keys(SHIPPING_RATES).map(k => (
                                            <option key={k} value={k}>{SHIPPING_RATES[k].name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* The Waterfall Calculation */}
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between font-medium text-gray-900">
                                    <span>Selling Price</span>
                                    <span>{currency(formData.price).format()}</span>
                                </div>
                                
                                <div className="pl-2 border-l-2 border-gray-100 space-y-1 text-gray-500 text-xs">
                                    <div className="flex justify-between">
                                        <span>- Cost Price</span>
                                        <span>{currency(formData.costPrice).format()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>- Tax ({formData.taxRate}%)</span>
                                        <span>{profitAnalysis.tax.format()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>- Gateway ({GATEWAY_FEES[simulatedGateway].percent}%)</span>
                                        <span>{profitAnalysis.gateway.format()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>- Shipping Est.</span>
                                        <span>{profitAnalysis.shipping.format()}</span>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 my-2 pt-3 flex justify-between items-center">
                                    <span className="font-bold text-gray-900 text-base">Net Profit</span>
                                    <div className="text-right">
                                        <p className={`text-xl font-bold ${profitAnalysis.isLoss ? 'text-red-600' : 'text-emerald-600'}`}>
                                            {profitAnalysis.netProfit.format()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Margin Badge */}
                            <div className={`
                                flex items-center justify-between px-4 py-3 rounded-lg border 
                                ${profitAnalysis.marginPercent < 10 
                                    ? 'bg-red-50 border-red-100 text-red-700' 
                                    : profitAnalysis.marginPercent > 20 
                                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                                        : 'bg-yellow-50 border-yellow-100 text-yellow-700'
                                }
                            `}>
                                <div className="flex items-center gap-2">
                                    {profitAnalysis.marginPercent < 10 ? <TrendingDown size={18}/> : <TrendingUp size={18}/>}
                                    <span className="font-bold text-sm">Net Margin</span>
                                </div>
                                <span className="font-bold text-lg">{profitAnalysis.marginPercent.toFixed(2)}%</span>
                            </div>
                            
                            {profitAnalysis.isLoss && (
                                <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                                    <p>Warning: You are selling at a loss based on these parameters.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product Images (Preserved) */}
                    <div className="bg-white p-4 md:p-6 rounded-md border border-gray-200 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-4 border-b pb-2">Product Images</h3>
                        
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            {images.map((img, idx) => (
                                <div key={idx} className="relative group aspect-square border rounded-md overflow-hidden bg-gray-50">
                                    <img src={img} alt="Product" className="w-full h-full object-contain" />
                                    <button 
                                        type="button"
                                        onClick={() => removeImage(idx)}
                                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                                    >
                                        <Loader2 size={14} className={uploadingImg ? "animate-spin" : "hidden"} />
                                        {!uploadingImg && <span className="text-xs font-bold px-1">✕</span>}
                                    </button>
                                </div>
                            ))}
                            {images.length < 4 && (
                                <label className="aspect-square border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition">
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploadingImg} />
                                    <span className="text-gray-400 font-medium text-xs text-center px-2">
                                        {uploadingImg ? "Uploading..." : "+ Upload Image"}
                                    </span>
                                </label>
                            )}
                        </div>
                        <p className="text-xs text-gray-400">Upload up to 4 images. First image is cover.</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function InputGroup({ label, name, type = "text", value, onChange, placeholder, required = false, step }) {
    return (
        <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input 
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                step={step}
                required={required}
                className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm"
            />
        </div>
    );
}