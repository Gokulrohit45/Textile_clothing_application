import { useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { useProduct } from '../context/ProductContext';
import toast from 'react-hot-toast';

const AdminCoupons = () => {
  const { coupons, addCoupon, updateCoupon, deleteCoupon } = useProduct();
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ code: '', type: 'percentage', value: '', minOrder: '', maxUses: '', expiresAt: '', status: 'active' });

  const open = (c = null) => {
    setEditId(c?.id || null);
    setForm(c ? { ...c } : { code: '', type: 'percentage', value: '', minOrder: '', maxUses: '', expiresAt: '', status: 'active' });
    setModal(true);
  };

  const handleSave = () => {
    if (!form.code || !form.value) { toast.error('Fill required fields'); return; }
    const data = { ...form, code: form.code.toUpperCase(), value: Number(form.value), minOrder: Number(form.minOrder) || 0, maxUses: Number(form.maxUses) || 999 };
    if (editId) { updateCoupon(editId, data); toast.success('Coupon updated!'); }
    else { addCoupon(data); toast.success('Coupon added!'); }
    setModal(false);
  };

  const TYPE_LABELS = { percentage: '% Off', fixed: 'Flat Off', shipping: 'Free Shipping' };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-xl text-primary">Coupons</h2>
          <p className="text-neutral-400 text-sm">{coupons.length} coupons created</p>
        </div>
        <button onClick={() => open()} className="btn-primary gap-2"><Plus className="w-4 h-4" /> Add Coupon</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {coupons.map(c => (
          <div key={c.id} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-bold text-lg text-primary tracking-wider">{c.code}</span>
                  <span className={`badge ${c.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>{c.status}</span>
                </div>
                <p className="text-sm text-neutral-500">
                  {c.type === 'percentage' ? `${c.value}% discount` :
                   c.type === 'fixed' ? `₹${c.value} flat off` : 'Free shipping'}
                </p>
              </div>
              <div className="flex gap-1">
                <button id={`edit-coupon-${c.id}`} onClick={() => open(c)} className="btn-ghost p-1.5"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => { if (confirm(`Delete ${c.code}?`)) { deleteCoupon(c.id); toast.success('Deleted!'); } }} className="btn-ghost p-1.5 text-danger hover:bg-danger/5"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-neutral-50 rounded-xl p-2">
                <p className="font-semibold text-primary">₹{c.minOrder}</p>
                <p className="text-neutral-400">Min Order</p>
              </div>
              <div className="bg-neutral-50 rounded-xl p-2">
                <p className="font-semibold text-primary">{c.usedCount}/{c.maxUses}</p>
                <p className="text-neutral-400">Used</p>
              </div>
              <div className="bg-neutral-50 rounded-xl p-2">
                <p className="font-semibold text-primary">{c.expiresAt}</p>
                <p className="text-neutral-400">Expires</p>
              </div>
            </div>
            {/* Usage Progress */}
            <div className="mt-3">
              <div className="w-full bg-neutral-100 rounded-full h-1.5">
                <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${Math.min(100, (c.usedCount / c.maxUses) * 100)}%` }} />
              </div>
              <p className="text-xs text-neutral-400 mt-1">{Math.round((c.usedCount / c.maxUses) * 100)}% used</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <div className="overlay fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-primary">{editId ? 'Edit Coupon' : 'Add Coupon'}</h3>
              <button onClick={() => setModal(false)}><X className="w-5 h-5 text-neutral-400" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="label">Code *</label><input className="input uppercase" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="e.g. SUMMER20" /></div>
              <div>
                <label className="label">Type</label>
                <select className="input" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                  <option value="percentage">Percentage (%) Off</option>
                  <option value="fixed">Fixed (₹) Off</option>
                  <option value="shipping">Free Shipping</option>
                </select>
              </div>
              <div><label className="label">Value *</label><input type="number" className="input" value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} placeholder={form.type === 'percentage' ? 'e.g. 10 (for 10%)' : 'e.g. 200'} /></div>
              <div><label className="label">Min Order (₹)</label><input type="number" className="input" value={form.minOrder} onChange={e => setForm(p => ({ ...p, minOrder: e.target.value }))} /></div>
              <div><label className="label">Max Uses</label><input type="number" className="input" value={form.maxUses} onChange={e => setForm(p => ({ ...p, maxUses: e.target.value }))} /></div>
              <div><label className="label">Expires At</label><input type="date" className="input" value={form.expiresAt} onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))} /></div>
              <label className="flex items-center gap-2 cursor-pointer">
                <div onClick={() => setForm(p => ({ ...p, status: p.status === 'active' ? 'inactive' : 'active' }))} className={`w-10 h-5 rounded-full relative cursor-pointer transition-all ${form.status === 'active' ? 'bg-success' : 'bg-neutral-200'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${form.status === 'active' ? 'left-5' : 'left-0.5'}`} />
                </div>
                <span className="text-sm">Active</span>
              </label>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={handleSave} className="btn-primary flex-1">Save</button>
              <button onClick={() => setModal(false)} className="btn-ghost flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
