import { useState } from 'react';
import { Plus, Edit2, Trash2, X, Upload } from 'lucide-react';
import { useProduct } from '../context/ProductContext';
import toast from 'react-hot-toast';

const AdminBanners = () => {
  const { banners, addBanner, updateBanner, deleteBanner } = useProduct();
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ title: '', subtitle: '', cta: '', ctaLink: '/', image: '', bgColor: '#1A1A2E', textColor: '#FFFFFF', status: 'active', order: 1 });
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
    const file = e.target.files?.[0];
    if (!file) return;
    
    const loadingToast = toast.loading('Uploading and compressing image...');
    try {
      const compressed = await compressImage(file);
      setForm(prev => ({ ...prev, image: compressed }));
      toast.success('Image uploaded successfully!', { id: loadingToast });
    } catch (err) {
      toast.error('Image upload failed', { id: loadingToast });
      console.error(err);
    }
    e.target.value = '';
  };
  const open = (banner = null) => {
    setEditId(banner?.id || null);
    setForm(banner || { title: '', subtitle: '', cta: 'Shop Now', ctaLink: '/', image: '', bgColor: '#1A1A2E', textColor: '#FFFFFF', status: 'active', order: banners.length + 1 });
    setModal(true);
  };

  const handleSave = () => {
    if (!form.title || !form.image) { toast.error('Fill title and image URL'); return; }
    if (editId) { updateBanner(editId, form); toast.success('Banner updated!'); }
    else { addBanner(form); toast.success('Banner added!'); }
    setModal(false);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-xl text-primary">Banners</h2>
          <p className="text-neutral-400 text-sm">Manage homepage banner slides</p>
        </div>
        <button onClick={() => open()} className="btn-primary gap-2"><Plus className="w-4 h-4" /> Add Banner</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {banners.map(banner => (
          <div key={banner.id} className="card overflow-hidden group">
            <div className="relative aspect-video overflow-hidden">
              <img src={banner.image} alt={banner.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-3">
                <p className="font-display font-bold text-white text-lg leading-tight">{banner.title}</p>
                <p className="text-white/70 text-xs mt-0.5">{banner.subtitle}</p>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs text-neutral-400">Order: {banner.order}</span>
                <button
                  onClick={() => updateBanner(banner.id, { status: banner.status === 'active' ? 'inactive' : 'active' })}
                  className={`w-10 h-5 rounded-full transition-all relative cursor-pointer ${banner.status === 'active' ? 'bg-success' : 'bg-neutral-200'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${banner.status === 'active' ? 'left-5' : 'left-0.5'}`} />
                </button>
                <span className="text-xs text-neutral-500">{banner.status}</span>
              </div>
              <div className="flex gap-1">
                <button id={`edit-banner-${banner.id}`} onClick={() => open(banner)} className="btn-ghost p-1.5"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => { if (confirm('Delete banner?')) { deleteBanner(banner.id); toast.success('Deleted!'); } }} className="btn-ghost p-1.5 text-danger hover:bg-danger/5"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <div className="overlay fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-primary">{editId ? 'Edit Banner' : 'Add Banner'}</h3>
              <button onClick={() => setModal(false)}><X className="w-5 h-5 text-neutral-400" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="label">Title *</label><input className="input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
              <div><label className="label">Subtitle</label><input className="input" value={form.subtitle} onChange={e => setForm(p => ({ ...p, subtitle: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">CTA Text</label><input className="input" value={form.cta} onChange={e => setForm(p => ({ ...p, cta: e.target.value }))} /></div>
                <div><label className="label">CTA Link</label><input className="input" value={form.ctaLink} onChange={e => setForm(p => ({ ...p, ctaLink: e.target.value }))} /></div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="label mb-0">Image URL *</label>
                  <label className="cursor-pointer text-xs font-semibold text-primary hover:text-primary-dark flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" /> Upload from local
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
                <input className="input" value={form.image} onChange={e => setForm(p => ({ ...p, image: e.target.value }))} placeholder="https://..." />
              </div>
              {form.image && <img src={form.image} alt="Preview" className="w-full h-32 object-cover rounded-xl" />}
              <div className="grid grid-cols-3 gap-3">
                <div><label className="label">Order</label><input type="number" className="input" value={form.order} onChange={e => setForm(p => ({ ...p, order: Number(e.target.value) }))} /></div>
                <div><label className="label">BG Color</label><input type="color" className="w-full h-10 rounded-lg border border-neutral-200 cursor-pointer" value={form.bgColor} onChange={e => setForm(p => ({ ...p, bgColor: e.target.value }))} /></div>
                <div><label className="label">Text Color</label><input type="color" className="w-full h-10 rounded-lg border border-neutral-200 cursor-pointer" value={form.textColor} onChange={e => setForm(p => ({ ...p, textColor: e.target.value }))} /></div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <div onClick={() => setForm(p => ({ ...p, status: p.status === 'active' ? 'inactive' : 'active' }))} className={`w-10 h-5 rounded-full relative cursor-pointer transition-all ${form.status === 'active' ? 'bg-success' : 'bg-neutral-200'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${form.status === 'active' ? 'left-5' : 'left-0.5'}`} />
                </div>
                <span className="text-sm">Active</span>
              </label>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={handleSave} className="btn-primary flex-1">Save Banner</button>
              <button onClick={() => setModal(false)} className="btn-ghost flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBanners;
