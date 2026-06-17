import { useState } from 'react';
import { Plus, Edit2, Trash2, Search, X, ImagePlus } from 'lucide-react';
import { useProduct } from '../context/ProductContext';
import toast from 'react-hot-toast';

const EMPTY_PRODUCT = {
  name: '', categoryId: '', subcategoryId: '', price: '', originalPrice: '',
  description: '', sizes: [], colors: [], colorNames: [], images: [],
  videoUrl: '',
  isFeatured: false, isNew: false, status: 'active', tags: []
};

const getYoutubeEmbedUrl = (url) => {
  if (!url) return null;
  let videoId = '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    videoId = match[2];
  }
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
};

const PRESET_COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Navy Blue', hex: '#000080' },
  { name: 'Grey', hex: '#808080' },
  { name: 'Beige', hex: '#F5F5DC' },
  { name: 'Maroon', hex: '#800000' },
  { name: 'Olive Green', hex: '#808000' },
  { name: 'Red', hex: '#FF0000' },
  { name: 'Pink', hex: '#FFC0CB' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'Mustard', hex: '#FFD700' },
  { name: 'Brown', hex: '#A52A2A' },
  { name: 'Lavender', hex: '#E6E6FA' },
  { name: 'Green', hex: '#008000' }
];

const AdminProducts = () => {
  const { products, categories, subcategories, getSubcategoriesByCategory, addProduct, updateProduct, deleteProduct } = useProduct();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [colorInput, setColorInput] = useState({ hex: '#000000', name: '' });
  const [imageInput, setImageInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.id.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeTab === 'all' || p.categoryId === activeTab;
    return matchesSearch && matchesCategory;
  });

  const openAdd = () => { setEditId(null); setForm(EMPTY_PRODUCT); setModal(true); };
  const openEdit = (p) => { setEditId(p.id); setForm({ ...p }); setModal(true); };

  const handleSave = async () => {
    if (!form.name || !form.categoryId || !form.price) { toast.error('Fill required fields'); return; }
    const data = { ...form, price: Number(form.price), originalPrice: Number(form.originalPrice) || null };
    
    const loadingToast = toast.loading(editId ? 'Updating product...' : 'Adding product...');
    try {
      if (editId) {
        const success = await updateProduct(editId, data);
        if (success) {
          toast.success('Product updated!', { id: loadingToast });
          setModal(false);
        } else {
          toast.error('Failed to update product. Check server logs.', { id: loadingToast });
        }
      } else {
        const newP = await addProduct(data);
        if (newP) {
          toast.success('Product added!', { id: loadingToast });
          setModal(false);
        } else {
          toast.error('Failed to add product. Check server logs.', { id: loadingToast });
        }
      }
    } catch (err) {
      toast.error('Error saving product.', { id: loadingToast });
    }
  };

  const handleDelete = (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    deleteProduct(id);
    toast.success('Product deleted!');
  };

  const COLOR_MAP = {
    red: '#FF0000',
    green: '#008000',
    blue: '#0000FF',
    yellow: '#FFFF00',
    orange: '#FFA500',
    pink: '#FFC0CB',
    purple: '#800080',
    white: '#FFFFFF',
    black: '#000000',
    grey: '#808080',
    gray: '#808080',
    brown: '#A52A2A',
    navy: '#000080',
    teal: '#008080',
    cyan: '#00FFFF',
    magenta: '#FF00FF',
    gold: '#FFD700',
    silver: '#C0C0C0',
    beige: '#F5F5DC',
    olive: '#808000',
    maroon: '#800000',
    lime: '#00FF00',
    violet: '#EE82EE',
    indigo: '#4B0082'
  };

  const addColor = () => {
    if (!colorInput.name) { toast.error('Enter color name'); return; }
    
    let hex = colorInput.hex;
    const nameLower = colorInput.name.trim().toLowerCase();
    
    // Resolve color hex from name if hex is black (default) and name matches a standard color
    if (hex === '#000000' && COLOR_MAP[nameLower]) {
      hex = COLOR_MAP[nameLower];
    }
    
    setForm(prev => ({
      ...prev,
      colors: [...(prev.colors || []), hex],
      colorNames: [...(prev.colorNames || []), colorInput.name]
    }));
    setColorInput({ hex: '#000000', name: '' });
  };

  const removeColor = (i) => setForm(prev => ({
    ...prev,
    colors: prev.colors.filter((_, idx) => idx !== i),
    colorNames: prev.colorNames.filter((_, idx) => idx !== i),
  }));

  const togglePresetColor = (preset) => {
    const currentColorNames = form.colorNames || [];
    const nameIndex = currentColorNames.findIndex(n => n.toLowerCase() === preset.name.toLowerCase());
    
    if (nameIndex !== -1) {
      setForm(prev => ({
        ...prev,
        colors: (prev.colors || []).filter((_, idx) => idx !== nameIndex),
        colorNames: (prev.colorNames || []).filter((_, idx) => idx !== nameIndex)
      }));
    } else {
      setForm(prev => ({
        ...prev,
        colors: [...(prev.colors || []), preset.hex],
        colorNames: [...(prev.colorNames || []), preset.name]
      }));
    }
  };

  const isPresetSelected = (preset) => {
    const currentColorNames = form.colorNames || [];
    return currentColorNames.some(n => n.toLowerCase() === preset.name.toLowerCase());
  };

  const addSize = (size) => {
    if (!form.sizes?.includes(size)) setForm(prev => ({ ...prev, sizes: [...(prev.sizes || []), size] }));
  };
  const removeSize = (size) => setForm(prev => ({ ...prev, sizes: (prev.sizes || []).filter(s => s !== size) }));

  const addImage = () => {
    if (!imageInput.trim()) return;
    setForm(prev => ({ ...prev, images: [...(prev.images || []), imageInput.trim()] }));
    setImageInput('');
  };
  const removeImage = (i) => setForm(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }));

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const max_width = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > max_width) {
              height *= max_width / width;
              width = max_width;
            }
          } else {
            if (height > max_width) {
              width *= max_width / height;
              height = max_width;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(dataUrl);
        };
      };
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;
    
    const loadingToast = toast.loading('Uploading and compressing image...');
    try {
      const newImages = await Promise.all(files.map(file => compressImage(file)));
      setForm(prev => ({
        ...prev,
        images: [...(prev.images || []), ...newImages]
      }));
      toast.success('Images uploaded successfully!', { id: loadingToast });
    } catch (err) {
      toast.error('Image upload failed', { id: loadingToast });
      console.error(err);
    }
    e.target.value = '';
  };

  const handleAIGenerate = async () => {
    if (!form.images || form.images.length === 0) {
      toast.error('Please upload at least one image first.');
      return;
    }

    const firstImage = form.images[0];
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const loadingToast = toast.loading('AI is analyzing the image & generating details...');
    
    try {
      const res = await fetch(`${API_URL}/admin/generate-product-details`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: firstImage })
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate details');
      }

      let matchedCategoryId = '';
      let matchedSubcategoryId = '';

      if (data.suggestedCategory) {
        const catMatch = categories.find(c => c.name.toLowerCase() === data.suggestedCategory.toLowerCase() || c.id.toLowerCase() === data.suggestedCategory.toLowerCase());
        if (catMatch) matchedCategoryId = catMatch.id;
      }

      if (data.suggestedSubcategory && matchedCategoryId) {
        const catSubs = getSubcategoriesByCategory(matchedCategoryId);
        const subMatch = catSubs.find(s => s.name.toLowerCase() === data.suggestedSubcategory.toLowerCase() || s.slug.toLowerCase() === data.suggestedSubcategory.toLowerCase());
        if (subMatch) matchedSubcategoryId = subMatch.id;
      }

      setForm(prev => ({
        ...prev,
        name: data.name || prev.name,
        description: data.description || prev.description,
        material: data.material || prev.material,
        tags: [...new Set([...(prev.tags || []), ...(data.tags || [])])],
        categoryId: matchedCategoryId || prev.categoryId,
        subcategoryId: matchedSubcategoryId || prev.subcategoryId
      }));

      toast.success('Product details generated successfully!', { id: loadingToast });
    } catch (err) {
      console.error('AI Generation error:', err);
      toast.error(err.message || 'AI generation failed', { id: loadingToast });
    }
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Video is too large (max 2MB for Google Sheets database). Please use a YouTube link for larger videos.');
      e.target.value = '';
      return;
    }
    
    const loadingToast = toast.loading('Reading video file...');
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      setForm(prev => ({ ...prev, videoUrl: event.target.result }));
      toast.success('Video loaded successfully!', { id: loadingToast });
    };
    reader.onerror = () => {
      toast.error('Failed to read video file', { id: loadingToast });
    };
    e.target.value = '';
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    setForm(prev => ({ ...prev, tags: [...(prev.tags || []), tagInput.trim().toLowerCase()] }));
    setTagInput('');
  };

  const subOptions = form.categoryId ? getSubcategoriesByCategory(form.categoryId) : [];

  const CAT_LABELS = { cat1: 'Men', cat2: 'Women', cat3: 'Kids' };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display font-bold text-xl text-primary">Products</h2>
          <p className="text-neutral-400 text-sm">{products.length} total products</p>
        </div>
        <button id="admin-add-product" onClick={openAdd} className="btn-primary gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          className="input pl-10" placeholder="Search products..."
          value={search} onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Category Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[{ id: 'all', name: 'All Categories' }, ...categories].map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === cat.id
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white text-neutral-600 border border-neutral-200 hover:border-primary hover:text-primary'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-100">
              <tr>
                {['Product', 'Category', 'Price', 'Status', 'Featured', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.images?.[0]} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-neutral-100" />
                      <div>
                        <p className="text-sm font-medium text-primary">{p.name}</p>
                        <p className="text-xs text-neutral-400 font-mono">{p.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="badge-neutral text-xs">{CAT_LABELS[p.categoryId] || p.categoryId}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-primary">₹{p.price.toLocaleString()}</p>
                    {p.originalPrice && <p className="text-xs text-neutral-400 line-through">₹{p.originalPrice}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${p.status === 'active' ? 'badge-success' : 'badge-danger'}`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => updateProduct(p.id, { isFeatured: !p.isFeatured })}
                      className={`w-10 h-5 rounded-full transition-all duration-200 relative ${p.isFeatured ? 'bg-primary' : 'bg-neutral-200'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all duration-200 ${p.isFeatured ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button id={`edit-product-${p.id}`} onClick={() => openEdit(p)} className="btn-ghost p-1.5 rounded-lg"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button id={`delete-product-${p.id}`} onClick={() => handleDelete(p.id, p.name)} className="btn-ghost p-1.5 rounded-lg text-danger hover:bg-danger/5"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-center py-10 text-neutral-400 text-sm">No products found</p>}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 overlay flex items-center justify-center p-4" onClick={() => setModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-card-hover animate-scale-in max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-neutral-100 sticky top-0 bg-white z-10">
              <h3 className="font-bold text-primary">{editId ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={() => setModal(false)}><X className="w-5 h-5 text-neutral-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="label">Product Name *</label>
                  <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Product name" />
                </div>
                <div>
                  <label className="label">Category *</label>
                  <select className="input" value={form.categoryId} onChange={e => setForm(p => ({ ...p, categoryId: e.target.value, subcategoryId: '' }))}>
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Subcategory</label>
                  <select className="input" value={form.subcategoryId} onChange={e => setForm(p => ({ ...p, subcategoryId: e.target.value }))}>
                    <option value="">Select subcategory</option>
                    {subOptions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Discount Price (₹) *</label>
                  <input type="number" className="input" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="e.g. 999 (Final Selling Price)" />
                </div>
                <div>
                  <label className="label">Original Price (₹)</label>
                  <input type="number" className="input" value={form.originalPrice || ''} onChange={e => setForm(p => ({ ...p, originalPrice: e.target.value }))} placeholder="e.g. 1499 (Before Discount)" />
                </div>
                <div>
                  <label className="label">Material / Fabric</label>
                  <input className="input" value={form.material || ''} onChange={e => setForm(p => ({ ...p, material: e.target.value }))} placeholder="e.g. 100% Cotton" />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Description</label>
                  <textarea className="input resize-none" rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Product description" />
                </div>
              </div>

              {/* Sizes */}
              <div>
                <label className="label">Sizes</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {['XS','S','M','L','XL','XXL','28','30','32','34','36','2-3Y','3-4Y','4-5Y','5-6Y','6-7Y'].map(s => (
                    <button key={s} type="button"
                      onClick={() => form.sizes?.includes(s) ? removeSize(s) : addSize(s)}
                      className={`px-3 py-1 text-xs rounded-lg border transition-all ${form.sizes?.includes(s) ? 'bg-primary text-white border-primary' : 'border-neutral-200 text-neutral-600 hover:border-primary'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div>
                <label className="label">Colors</label>
                
                {/* Common Colors Presets */}
                <div className="mb-3 bg-neutral-50/50 p-3 rounded-xl border border-neutral-100">
                  <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-2">Common Colors (Click to Toggle)</span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_COLORS.map(preset => {
                      const selected = isPresetSelected(preset);
                      return (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => togglePresetColor(preset)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all duration-200 ${
                            selected
                              ? 'bg-primary border-primary text-white shadow-sm'
                              : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border"
                            style={{
                              backgroundColor: preset.hex,
                              borderColor: selected ? '#ffffff40' : '#00000015'
                            }}
                          />
                          {preset.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2 mb-2">
                  <input type="color" value={colorInput.hex} onChange={e => setColorInput(p => ({ ...p, hex: e.target.value }))} className="w-10 h-10 rounded-lg border border-neutral-200 cursor-pointer" />
                  <input className="input py-2" placeholder="Custom color name (e.g. Lime Green)" value={colorInput.name} onChange={e => setColorInput(p => ({ ...p, name: e.target.value }))} />
                  <button type="button" onClick={addColor} className="btn-primary btn-sm px-4">Add Custom</button>
                </div>
                
                {/* Selected Colors list */}
                {form.colors?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.colors.map((hex, i) => (
                      <div key={i} className="flex items-center gap-1.5 bg-neutral-50 rounded-full px-3 py-1 border border-neutral-200">
                        <div className="w-4 h-4 rounded-full border border-neutral-200" style={{ backgroundColor: hex }} />
                        <span className="text-xs text-neutral-600">{form.colorNames?.[i]}</span>
                        <button type="button" onClick={() => removeColor(i)}><X className="w-3 h-3 text-neutral-400" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Images */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="label mb-0">Image URLs</label>
                  <div className="flex items-center gap-3">
                    {form.images?.length > 0 && (
                      <button
                        type="button"
                        onClick={handleAIGenerate}
                        className="text-xs font-semibold text-accent-700 hover:text-accent-850 flex items-center gap-1 bg-accent/10 px-2.5 py-1 rounded-lg border border-accent/20 transition-all hover:scale-102"
                      >
                        ✨ Auto-Fill with AI
                      </button>
                    )}
                    <label className="cursor-pointer text-xs font-semibold text-primary hover:text-primary-dark flex items-center gap-1">
                      <ImagePlus className="w-3.5 h-3.5" /> Upload from local
                      <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  </div>
                </div>
                <div className="flex gap-2 mb-2">
                  <input className="input py-2" placeholder="https://..." value={imageInput} onChange={e => setImageInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addImage()} />
                  <button type="button" onClick={addImage} className="btn-primary btn-sm px-4">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.images?.map((img, i) => (
                    <div key={i} className="relative group">
                      <img src={img} alt="" className="w-14 h-14 rounded-lg object-cover border border-neutral-200" />
                      <button type="button" onClick={() => removeImage(i)}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-danger text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Video URL */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="label mb-0">Video URL (YouTube or MP4)</label>
                  <label className="cursor-pointer text-xs font-semibold text-primary hover:text-primary-dark flex items-center gap-1">
                    <ImagePlus className="w-3.5 h-3.5" /> Upload video
                    <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                  </label>
                </div>
                <input
                  className="input py-2"
                  placeholder="https://www.youtube.com/watch?v=... or https://example.com/video.mp4"
                  value={form.videoUrl || ''}
                  onChange={e => setForm(p => ({ ...p, videoUrl: e.target.value }))}
                />
                {form.videoUrl && (
                  <div className="mt-2 rounded-xl overflow-hidden aspect-video bg-black max-h-48 flex items-center justify-center">
                    {getYoutubeEmbedUrl(form.videoUrl) ? (
                      <iframe
                        src={getYoutubeEmbedUrl(form.videoUrl)}
                        title="Video preview"
                        className="w-full h-full"
                        allowFullScreen
                      />
                    ) : (
                      <video src={form.videoUrl} controls className="w-full h-full object-contain" />
                    )}
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="label">Tags</label>
                <div className="flex gap-2 mb-2">
                  <input className="input py-2" placeholder="e.g. casual" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag()} />
                  <button type="button" onClick={addTag} className="btn-primary btn-sm px-4">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.tags?.map((tag, i) => (
                    <span key={i} className="badge-neutral flex items-center gap-1">
                      #{tag}
                      <button type="button" onClick={() => setForm(prev => ({ ...prev, tags: prev.tags.filter((_, j) => j !== i) }))}><X className="w-2.5 h-2.5" /></button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex gap-4 flex-wrap">
                {[{ key: 'isFeatured', label: 'Featured' }, { key: 'isNew', label: 'New Arrival' }].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <div
                      onClick={() => setForm(p => ({ ...p, [key]: !p[key] }))}
                      className={`w-10 h-5 rounded-full transition-all duration-200 relative cursor-pointer ${form[key] ? 'bg-primary' : 'bg-neutral-200'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all duration-200 ${form[key] ? 'left-5' : 'left-0.5'}`} />
                    </div>
                    <span className="text-sm text-neutral-600">{label}</span>
                  </label>
                ))}
                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={() => setForm(p => ({ ...p, status: p.status === 'active' ? 'inactive' : 'active' }))}
                    className={`w-10 h-5 rounded-full transition-all duration-200 relative cursor-pointer ${form.status === 'active' ? 'bg-success' : 'bg-neutral-200'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all duration-200 ${form.status === 'active' ? 'left-5' : 'left-0.5'}`} />
                  </div>
                  <span className="text-sm text-neutral-600">Active</span>
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button id="save-product-btn" onClick={handleSave} className="btn-primary flex-1">
                  {editId ? 'Update Product' : 'Add Product'}
                </button>
                <button onClick={() => setModal(false)} className="btn-ghost flex-1">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
