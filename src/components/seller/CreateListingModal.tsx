import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { ClothingCategory, ClothingCondition, ListingMode } from '../../types/index.js';

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (listingData: any) => Promise<void>;
}

export const CreateListingModal: React.FC<CreateListingModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ClothingCategory>('Women');
  const [subcategory, setSubcategory] = useState('Clothing');
  const [brand, setBrand] = useState('Zara');
  const [size, setSize] = useState('M');
  const [color, setColor] = useState('Beige');
  const [material, setMaterial] = useState('Cotton / Linen');
  const [condition, setCondition] = useState<ClothingCondition>('Like New (Worn Once)');
  const [defectsDisclosed, setDefectsDisclosed] = useState('No flaws or stains. Like new condition.');
  const [originalPrice, setOriginalPrice] = useState<number>(3999);
  const [sellingPrice, setSellingPrice] = useState<number>(1299);
  const [listingMode, setListingMode] = useState<ListingMode>('buy_and_exchange');
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80'
  ]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [pincode, setPincode] = useState('560038');
  const [acceptsReturns, setAcceptsReturns] = useState(true);
  const [termsAgreed, setTermsAgreed] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddSampleImage = (cat: string) => {
    const samples: Record<string, string[]> = {
      Women: [
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'
      ],
      Men: [
        'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80'
      ],
      Footwear: [
        'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80'
      ],
      'Bags & Totes': [
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80'
      ]
    };
    const list = samples[cat] || samples.Women;
    const randomPick = list[Math.floor(Math.random() * list.length)];
    setImages([...images, randomPick]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !sellingPrice || images.length === 0) {
      setError('Please provide a title, selling price, and at least one image.');
      return;
    }
    if (!termsAgreed) {
      setError('Please confirm garment authenticity & circular condition disclosure.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSubmit({
        title,
        description,
        category,
        subcategory,
        brand,
        size,
        color,
        material,
        condition,
        defectsDisclosed,
        originalPrice: Number(originalPrice) || Number(sellingPrice) * 2,
        sellingPrice: Number(sellingPrice),
        listingMode,
        images,
        city,
        state,
        pincode,
        acceptsReturns
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to list item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border border-slate-200 w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl relative my-8 max-h-[92vh] flex flex-col text-slate-900">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-display">List an Item on ThreadLoop</h2>
            <p className="text-xs text-slate-500">Zero listing fees • Sell or Swap with verified members across India</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Photos */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 text-xs">Garment Photos (Multiple Required)</label>
              <button
                type="button"
                onClick={() => handleAddSampleImage(category)}
                className="text-[11px] text-teal-700 font-semibold hover:underline flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Curated Fashion Photo</span>
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-[4/5] rounded-xl overflow-hidden border border-slate-200 group shadow-2xs">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((_, i) => i !== idx))}
                    className="absolute top-1.5 right-1.5 p-1 bg-white/90 hover:bg-rose-500 hover:text-white text-slate-700 rounded-md transition shadow-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* URL input helper */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Or paste an image URL..."
                value={imageUrlInput}
                onChange={e => setImageUrlInput(e.target.value)}
                className="flex-1 p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => {
                  if (imageUrlInput.trim()) {
                    setImages([...images, imageUrlInput.trim()]);
                    setImageUrlInput('');
                  }
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl"
              >
                Add URL
              </button>
            </div>
          </div>

          {/* Section 2: Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-900 block mb-1">Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Zara Tailored Linen Double-Breasted Blazer"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-teal-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-900 block mb-1">Category *</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-teal-600 focus:bg-white"
              >
                {['Women', 'Men', 'Unisex', 'Footwear', 'Bags & Totes', 'Vintage & Y2K', 'Accessories'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-900 block mb-1">Brand *</label>
              <input
                type="text"
                value={brand}
                onChange={e => setBrand(e.target.value)}
                placeholder="e.g. Zara, H&M, Levi's, Fabindia"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-teal-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-900 block mb-1">Size *</label>
              <input
                type="text"
                value={size}
                onChange={e => setSize(e.target.value)}
                placeholder="e.g. S, M, L, XL, UK 9, 32W"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-teal-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-900 block mb-1">Color & Material</label>
              <input
                type="text"
                value={color}
                onChange={e => setColor(e.target.value)}
                placeholder="e.g. Forest Green Cotton"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-teal-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Section 3: Condition & Disclosures */}
          <div className="space-y-3">
            <div>
              <label className="font-bold text-slate-900 block mb-1">Garment Condition *</label>
              <select
                value={condition}
                onChange={e => setCondition(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-teal-600 focus:bg-white"
              >
                <option value="Brand New with Tags">Brand New with Tags (Never Worn)</option>
                <option value="Like New (Worn Once)">Like New (Worn Once, Flawless)</option>
                <option value="Gently Used (Excellent)">Gently Used (Excellent Condition)</option>
                <option value="Well Loved (Good)">Well Loved (Minor Wear, Disclosed)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-900 block mb-1">Wear & Flaw Disclosure *</label>
              <textarea
                rows={2}
                value={defectsDisclosed}
                onChange={e => setDefectsDisclosed(e.target.value)}
                placeholder="Disclose any fading, missing buttons, tiny tears or alterations. Transparency ensures positive buyer feedback!"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-teal-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-900 block mb-1">Detailed Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Tell the story of this piece: fit notes, occasion styling, fabric feel..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-teal-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Section 4: Pricing & Mode */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900">Pricing & Transaction Mode (INR ₹)</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-600 block text-[11px] mb-1">Selling Price (INR ₹) *</label>
                <input
                  type="number"
                  required
                  min="100"
                  value={sellingPrice}
                  onChange={e => setSellingPrice(Number(e.target.value))}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-950 text-sm font-bold focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="text-slate-600 block text-[11px] mb-1">Original Retail Price (INR ₹)</label>
                <input
                  type="number"
                  min="100"
                  value={originalPrice}
                  onChange={e => setOriginalPrice(Number(e.target.value))}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-teal-600"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-600 block text-[11px] mb-1">Allow Wardrobe Exchanges?</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'buy_and_exchange', label: 'Buy or Swap ✨', desc: 'Recommended' },
                  { id: 'exchange_only', label: 'Swap Only 🔄', desc: 'Zero money' },
                  { id: 'buy_only', label: 'Buy Only 🛍️', desc: 'Standard resale' }
                ].map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setListingMode(m.id as any)}
                    className={`p-2.5 rounded-xl border text-center transition ${
                      listingMode === m.id
                        ? 'bg-teal-50 border-teal-500 text-teal-800 font-bold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs">{m.label}</div>
                    <div className="text-[10px] text-slate-400">{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 5: Pickup & Location */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-slate-600 block text-[11px] mb-1">Metro / City *</label>
              <input
                type="text"
                required
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-teal-600 focus:bg-white"
              />
            </div>
            <div>
              <label className="text-slate-600 block text-[11px] mb-1">State *</label>
              <input
                type="text"
                required
                value={state}
                onChange={e => setState(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-teal-600 focus:bg-white"
              />
            </div>
            <div>
              <label className="text-slate-600 block text-[11px] mb-1">Pickup PIN *</label>
              <input
                type="text"
                required
                maxLength={6}
                value={pincode}
                onChange={e => setPincode(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-teal-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Terms checkbox */}
          <div className="flex items-start space-x-2 pt-2">
            <input
              type="checkbox"
              id="terms"
              checked={termsAgreed}
              onChange={e => setTermsAgreed(e.target.checked)}
              className="mt-1 accent-teal-600"
            />
            <label htmlFor="terms" className="text-[11px] text-slate-600">
              I certify that this garment is authentic, owned by me, cleanly laundered, and all condition disclosures are accurate. Backed by ThreadLoop Circular Guarantee.
            </label>
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-[#0d9488] hover:bg-teal-700 text-white font-bold transition shadow-sm disabled:opacity-50"
            >
              {loading ? 'Publishing...' : 'Publish Listing (₹0 Fee)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
