import { useState } from 'react';
import { Plus, Edit2, Trash2, X, ChevronDown, ChevronRight, Upload } from 'lucide-react';
import { useProduct } from '../context/ProductContext';
import toast from 'react-hot-toast';

const AdminCategories = () => {
  const { categories, subcategories, addCategory, updateCategory, deleteCategory, addSubcategory, updateSubcategory, deleteSubcategory, getSubcategoriesByCategory } = useProduct();
  const [expanded, setExpanded] = useState({});
  const [catModal, setCatModal] = useState(false);
  const [subModal, setSubModal] = useState(null); // categoryId
  const [editCat, setEditCat] = useState(null);
  const [editSub, setEditSub] = useState(null);
  const [catForm, setCatForm] = useState({ name: '', slug: '', image: '', status: 'active' });
  const [subForm, setSubForm] = useState({ name: '', slug: '' });

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
      setCatForm(prev => ({ ...prev, image: compressed }));
      toast.success('Image uploaded successfully!', { id: loadingToast });
    } catch (err) {
      toast.error('Image upload failed', { id: loadingToast });
      console.error(err);
    }
    e.target.value = '';
  };

  const openAddCat = () => { setEditCat(null); setCatForm({ name: '', slug: '', image: '', status: 'active' }); setCatModal(true); };
  const openEditCat = (c) => { setEditCat(c.id); setCatForm({ ...c }); setCatModal(true); };

  const openAddSub = (catId) => { setEditSub(null); setSubForm({ name: '', slug: '' }); setSubModal(catId); };
  const openEditSub = (sub) => { setEditSub(sub.id); setSubForm({ ...sub }); setSubModal(sub.categoryId); };

  const handleSaveCat = () => {
    if (!catForm.name) { toast.error('Enter category name'); return; }
    const slug = catForm.slug || catForm.name.toLowerCase().replace(/\s+/g, '-');
    if (editCat) { updateCategory(editCat, { ...catForm, slug }); toast.success('Updated!'); }
    else { addCategory({ ...catForm, slug }); toast.success('Category added!'); }
    setCatModal(false);
  };

  const handleSaveSub = () => {
    if (!subForm.name) { toast.error('Enter subcategory name'); return; }
    const slug = subForm.slug || subForm.name.toLowerCase().replace(/\s+/g, '-');
    if (editSub) { updateSubcategory(editSub, { ...subForm, slug }); toast.success('Updated!'); }
    else { addSubcategory({ ...subForm, slug, categoryId: subModal }); toast.success('Subcategory added!'); }
    setSubModal(null);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-xl text-primary">Categories</h2>
          <p className="text-neutral-400 text-sm">{categories.length} categories, {subcategories.length} subcategories</p>
        </div>
        <button onClick={openAddCat} className="btn-primary gap-2"><Plus className="w-4 h-4" /> Add Category</button>
      </div>

      <div className="space-y-3">
        {categories.map(cat => {
          const subs = getSubcategoriesByCategory(cat.id);
          const isExpanded = expanded[cat.id];
          return (
            <div key={cat.id} className="card overflow-hidden">
              <div
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-neutral-50 transition-colors"
                onClick={() => setExpanded(prev => ({ ...prev, [cat.id]: !prev[cat.id] }))}
              >
                <div className="flex items-center gap-3 flex-1">
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-neutral-400" /> : <ChevronRight className="w-4 h-4 text-neutral-400" />}
                  {cat.image && <img src={cat.image} alt={cat.name} className="w-10 h-10 rounded-lg object-cover" />}
                  <div>
                    <p className="font-semibold text-primary">{cat.name}</p>
                    <p className="text-xs text-neutral-400">
                      <span className="text-primary font-semibold hover:underline">
                        {isExpanded ? 'Hide' : 'Manage'} {subs.length} subcategories ↗
                      </span>
                      &nbsp;• /{cat.slug}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${cat.status === 'active' ? 'badge-success' : 'badge-danger'}`}>{cat.status}</span>
                  <button
                    id={`add-sub-direct-${cat.id}`}
                    onClick={e => { e.stopPropagation(); openAddSub(cat.id); }}
                    className="btn-outline py-1 px-2.5 text-xs gap-1 border border-primary hover:bg-primary hover:text-white transition-all rounded-lg"
                  >
                    <Plus className="w-3 h-3" /> Subcategory
                  </button>
                  <button id={`edit-cat-${cat.id}`} onClick={e => { e.stopPropagation(); openEditCat(cat); }} className="btn-ghost p-1.5"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={e => { e.stopPropagation(); if (confirm(`Delete ${cat.name}?`)) { deleteCategory(cat.id); toast.success('Deleted!'); } }} className="btn-ghost p-1.5 text-danger hover:bg-danger/5"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-neutral-100 p-4 bg-neutral-50/50">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Subcategories</p>
                    <button id={`add-sub-${cat.id}`} onClick={() => openAddSub(cat.id)} className="btn-ghost text-xs gap-1 py-1 px-2">
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  </div>
                  {subs.length === 0 ? (
                    <p className="text-sm text-neutral-400 text-center py-3">No subcategories yet</p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {subs.map(sub => (
                        <div key={sub.id} className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-neutral-100">
                          <div>
                            <p className="text-sm font-medium text-primary">{sub.name}</p>
                            <p className="text-xs text-neutral-400">/{sub.slug}</p>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => openEditSub(sub)} className="btn-ghost p-1"><Edit2 className="w-3 h-3" /></button>
                            <button onClick={() => { if (confirm(`Delete ${sub.name}?`)) { deleteSubcategory(sub.id); toast.success('Deleted!'); } }} className="btn-ghost p-1 text-danger hover:bg-danger/5"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Category Modal */}
      {catModal && (
        <div className="overlay fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setCatModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-primary">{editCat ? 'Edit Category' : 'Add Category'}</h3>
              <button onClick={() => setCatModal(false)}><X className="w-5 h-5 text-neutral-400" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="label">Name *</label><input className="input" value={catForm.name} onChange={e => setCatForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div><label className="label">Slug (URL)</label><input className="input" value={catForm.slug} onChange={e => setCatForm(p => ({ ...p, slug: e.target.value }))} placeholder="auto-generated if empty" /></div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="label mb-0">Image URL</label>
                  <label className="cursor-pointer text-xs font-semibold text-primary hover:text-primary-dark flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" /> Upload from local
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
                <input className="input" value={catForm.image} onChange={e => setCatForm(p => ({ ...p, image: e.target.value }))} placeholder="https://..." />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <div onClick={() => setCatForm(p => ({ ...p, status: p.status === 'active' ? 'inactive' : 'active' }))} className={`w-10 h-5 rounded-full relative cursor-pointer transition-all ${catForm.status === 'active' ? 'bg-success' : 'bg-neutral-200'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${catForm.status === 'active' ? 'left-5' : 'left-0.5'}`} />
                </div>
                <span className="text-sm">Active</span>
              </label>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={handleSaveCat} className="btn-primary flex-1">Save</button>
              <button onClick={() => setCatModal(false)} className="btn-ghost flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Subcategory Modal */}
      {subModal && (
        <div className="overlay fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSubModal(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-primary">{editSub ? 'Edit Subcategory' : 'Add Subcategory'}</h3>
              <button onClick={() => setSubModal(null)}><X className="w-5 h-5 text-neutral-400" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="label">Name *</label><input className="input" value={subForm.name} onChange={e => setSubForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div><label className="label">Slug</label><input className="input" value={subForm.slug} onChange={e => setSubForm(p => ({ ...p, slug: e.target.value }))} placeholder="auto-generated" /></div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={handleSaveSub} className="btn-primary flex-1">Save</button>
              <button onClick={() => setSubModal(null)} className="btn-ghost flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
