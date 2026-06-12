import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Package, MapPin, Lock, Save, Plus, Trash2, Edit2, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateProfile, getUserAddresses, addAddress, updateAddress, deleteAddress, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', email: user?.email || '' });
  const [pwdForm, setPwdForm] = useState({ current: '', newPwd: '', confirm: '' });
  const [addrModal, setAddrModal] = useState(false);
  const [editingAddr, setEditingAddr] = useState(null);
  const [addrForm, setAddrForm] = useState({ name: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', isDefault: false });

  const addresses = getUserAddresses();

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!form.name || !form.email || !form.phone) {
      toast.error('Name, email, and phone number are required.');
      return;
    }
    const loadingToast = toast.loading('Saving profile...');
    const res = await updateProfile(form);
    if (res.success) {
      toast.success('Profile updated successfully!', { id: loadingToast });
      setEditMode(false);
    } else {
      toast.error(res.error || 'Failed to update profile.', { id: loadingToast });
    }
  };

  const handleSaveAddress = () => {
    if (!addrForm.name || !addrForm.addressLine1 || !addrForm.city || !addrForm.pincode) {
      toast.error('Fill all required fields'); return;
    }
    if (editingAddr) {
      updateAddress(editingAddr, addrForm);
      toast.success('Address updated!');
    } else {
      addAddress(addrForm);
      toast.success('Address added!');
    }
    setAddrModal(false);
    setEditingAddr(null);
    setAddrForm({ name: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', isDefault: false });
  };

  const openAddAddr = () => {
    setEditingAddr(null);
    setAddrForm({ name: user?.name || '', phone: user?.phone || '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', isDefault: false });
    setAddrModal(true);
  };

  const openEditAddr = (addr) => {
    setEditingAddr(addr.id);
    setAddrForm({ ...addr });
    setAddrModal(true);
  };

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'security', label: 'Security', icon: Lock },
  ];

  return (
    <div className="container-main pt-24 pb-16 min-h-screen">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white font-display font-bold text-xl">
          {user?.name?.[0]}
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl text-primary">{user?.name}</h1>
          <p className="text-sm text-neutral-400">{user?.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="card p-4 h-fit">
          <nav className="space-y-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`admin-nav-item w-full ${activeTab === id ? 'active' : ''}`}
              >
                <Icon className="w-4 h-4" />
                {label}
                <ChevronRight className="w-3 h-3 ml-auto" />
              </button>
            ))}
            <button
              onClick={() => setActiveTab('orders')}
              className={`admin-nav-item w-full ${activeTab === 'orders' ? 'active' : ''}`}
            >
              <Package className="w-4 h-4" />
              My Orders
              <ChevronRight className="w-3 h-3 ml-auto" />
            </button>
            <hr className="border-neutral-100 my-2" />
            <button onClick={() => { logout(); navigate('/'); }} className="admin-nav-item w-full text-danger hover:text-danger hover:bg-danger/5">
              Sign Out
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="md:col-span-3">
          {activeTab === 'profile' && (
            <div className="card p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-lg text-primary">Personal Information</h2>
                {!editMode ? (
                  <button onClick={() => setEditMode(true)} className="btn-outline btn-sm gap-1">
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => setEditMode(false)} className="btn-ghost btn-sm">Cancel</button>
                    <button onClick={handleSaveProfile} className="btn-primary btn-sm gap-1">
                      <Save className="w-3.5 h-3.5" /> Save
                    </button>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Full Name', key: 'name', type: 'text' },
                  { label: 'Phone', key: 'phone', type: 'tel' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="label">{f.label}</label>
                    {editMode ? (
                      <input className="input" type={f.type} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
                    ) : (
                      <p className="px-4 py-3 bg-neutral-50 rounded-xl text-sm text-neutral-700">{user?.[f.key] || '—'}</p>
                    )}
                  </div>
                ))}
                <div>
                  <label className="label">Email</label>
                  {editMode ? (
                    <input className="input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
                  ) : (
                    <p className="px-4 py-3 bg-neutral-50 rounded-xl text-sm text-neutral-700">{user?.email || '—'}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="card p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-lg text-primary">My Addresses</h2>
                <button onClick={openAddAddr} className="btn-primary btn-sm gap-1">
                  <Plus className="w-3.5 h-3.5" /> Add Address
                </button>
              </div>
              {addresses.length === 0 ? (
                <div className="text-center py-10">
                  <MapPin className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                  <p className="text-neutral-500">No addresses yet</p>
                  <button onClick={openAddAddr} className="btn-primary btn-sm mt-4">Add Address</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map(addr => (
                    <div key={addr.id} className="p-4 border border-neutral-200 rounded-xl">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm text-primary">{addr.name}</span>
                            {addr.isDefault && <span className="badge-primary text-xs">Default</span>}
                          </div>
                          <p className="text-sm text-neutral-600">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}</p>
                          <p className="text-sm text-neutral-600">{addr.city}, {addr.state} – {addr.pincode}</p>
                          <p className="text-xs text-neutral-400 mt-1">📞 {addr.phone}</p>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => openEditAddr(addr)} className="btn-ghost p-2"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => { deleteAddress(addr.id); toast.success('Deleted'); }} className="btn-ghost p-2 text-danger hover:bg-danger/5"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card p-6 animate-fade-in">
              <h2 className="font-semibold text-lg text-primary mb-5">Change Password</h2>
              <div className="space-y-4 max-w-md">
                {[
                  { label: 'Current Password', key: 'current' },
                  { label: 'New Password', key: 'newPwd' },
                  { label: 'Confirm New Password', key: 'confirm' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="label">{f.label}</label>
                    <input
                      type="password" className="input"
                      placeholder={f.label}
                      value={pwdForm[f.key]}
                      onChange={e => setPwdForm(p => ({ ...p, [f.key]: e.target.value }))}
                    />
                  </div>
                ))}
                <button
                  className="btn-primary"
                  onClick={() => {
                    if (!pwdForm.current || !pwdForm.newPwd) { toast.error('Fill all fields'); return; }
                    if (pwdForm.newPwd !== pwdForm.confirm) { toast.error('Passwords do not match'); return; }
                    if (pwdForm.current !== user.password) { toast.error('Current password is incorrect'); return; }
                    updateProfile({ password: pwdForm.newPwd });
                    setPwdForm({ current: '', newPwd: '', confirm: '' });
                    toast.success('Password changed!');
                  }}
                >
                  Update Password
                </button>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="card p-6 animate-fade-in">
              <h2 className="font-semibold text-lg text-primary mb-5">My Orders</h2>
              <button onClick={() => navigate('/orders')} className="btn-primary gap-2">
                <Package className="w-4 h-4" /> View All Orders
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Address Modal */}
      {addrModal && (
        <div className="overlay flex items-center justify-center p-4" onClick={() => setAddrModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-card-hover animate-scale-in" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-primary mb-4">{editingAddr ? 'Edit Address' : 'New Address'}</h3>
            <div className="space-y-3">
              {[
                { label: 'Full Name *', key: 'name' }, { label: 'Phone *', key: 'phone' },
                { label: 'Address Line 1 *', key: 'addressLine1' }, { label: 'Address Line 2', key: 'addressLine2' },
                { label: 'City *', key: 'city' }, { label: 'State *', key: 'state' }, { label: 'Pincode *', key: 'pincode' },
              ].map(f => (
                <div key={f.key}>
                  <label className="label">{f.label}</label>
                  <input className="input" value={addrForm[f.key]} onChange={e => setAddrForm(p => ({ ...p, [f.key]: e.target.value }))} />
                </div>
              ))}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={addrForm.isDefault} onChange={e => setAddrForm(p => ({ ...p, isDefault: e.target.checked }))} className="accent-primary" />
                <span className="text-sm">Set as default</span>
              </label>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={handleSaveAddress} className="btn-primary flex-1">Save</button>
              <button onClick={() => setAddrModal(false)} className="btn-ghost flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
