import { useState, useEffect } from 'react';
import { Save, Upload, Globe, Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import { Instagram, Facebook, Twitter, Youtube } from '../components/BrandIcons';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DEFAULT_SIZE_GUIDE = [
  { size: 'S', chest: '38 in', length: '27 in', shoulder: '17.5 in' },
  { size: 'M', chest: '40 in', length: '28 in', shoulder: '18 in' },
  { size: 'L', chest: '42 in', length: '29 in', shoulder: '18.5 in' },
  { size: 'XL', chest: '44 in', length: '30 in', shoulder: '19 in' },
  { size: 'XXL', chest: '46 in', length: '30.5 in', shoulder: '19.5 in' }
];

const AdminSettings = () => {
  const { settings, updateSettings } = useSettings();
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ ...settings });
  const [activeTab, setActiveTab] = useState('general');

  const [otpSent, setOtpSent] = useState(false);
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [updatingPin, setUpdatingPin] = useState(false);
  const [pinForm, setPinForm] = useState({
    otp: '',
    pin: '',
    confirmPin: ''
  });

  const handleRequestOtp = async () => {
    setRequestingOtp(true);
    try {
      const res = await fetch(`${API_URL}/settings/request-pin-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        setOtpSent(true);
        toast.success('Verification OTP code sent to gokulnath96880@gmail.com');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to send OTP.');
      }
    } catch (err) {
      toast.error('Server connection failed.');
    } finally {
      setRequestingOtp(false);
    }
  };

  const handleUpdatePin = async () => {
    if (pinForm.pin.length !== 4) {
      toast.error('PIN must be exactly 4 digits.');
      return;
    }
    if (pinForm.pin !== pinForm.confirmPin) {
      toast.error('PINs do not match.');
      return;
    }
    setUpdatingPin(true);
    try {
      const res = await fetch(`${API_URL}/settings/verify-and-update-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          otp: pinForm.otp,
          pin: pinForm.pin
        })
      });
      if (res.ok) {
        toast.success('Security Access PIN updated successfully!');
        setOtpSent(false);
        setPinForm({ otp: '', pin: '', confirmPin: '' });
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to update PIN.');
      }
    } catch (err) {
      toast.error('Server connection failed.');
    } finally {
      setUpdatingPin(false);
    }
  };

  const [adminForm, setAdminForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setAdminForm(p => ({
        ...p,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    if (settings) {
      setForm({ ...settings });
    }
  }, [settings]);

  const compressImage = (file, maxWidth = 800, quality = 0.6) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxWidth) {
              width *= maxWidth / height;
              height = maxWidth;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        };
      };
    });
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const loadingToast = toast.loading('Uploading and compressing logo...');
    try {
      const compressed = await compressImage(file, 200, 0.7);
      setForm(prev => ({ ...prev, logo: compressed }));
      toast.success('Logo uploaded successfully!', { id: loadingToast });
    } catch (err) {
      toast.error('Logo upload failed', { id: loadingToast });
      console.error(err);
    }
    e.target.value = '';
  };

  const handleLoginImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const loadingToast = toast.loading('Uploading and compressing background image...');
    try {
      const compressed = await compressImage(file, 600, 0.5);
      setForm(prev => ({ ...prev, loginImage: compressed }));
      toast.success('Background image uploaded successfully!', { id: loadingToast });
    } catch (err) {
      toast.error('Image upload failed', { id: loadingToast });
      console.error(err);
    }
    e.target.value = '';
  };

  const handleGPayQRUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const loadingToast = toast.loading('Uploading and compressing QR code...');
    try {
      const compressed = await compressImage(file, 300, 0.6);
      setForm(prev => ({ ...prev, gpayQR: compressed }));
      toast.success('QR Code uploaded successfully!', { id: loadingToast });
    } catch (err) {
      toast.error('QR Code upload failed', { id: loadingToast });
      console.error(err);
    }
    e.target.value = '';
  };

  const handleSizeGuideChange = (idx, field, value) => {
    const currentGuide = form.sizeGuide && form.sizeGuide.length > 0
      ? [...form.sizeGuide.map(item => ({ ...item }))]
      : [...DEFAULT_SIZE_GUIDE.map(item => ({ ...item }))];
    
    currentGuide[idx][field] = value;
    setForm(prev => ({ ...prev, sizeGuide: currentGuide }));
  };

  const handleAddSizeRow = () => {
    const currentGuide = form.sizeGuide && form.sizeGuide.length > 0
      ? [...form.sizeGuide.map(item => ({ ...item }))]
      : [...DEFAULT_SIZE_GUIDE.map(item => ({ ...item }))];
    
    currentGuide.push({ size: '', chest: '', length: '', shoulder: '' });
    setForm(prev => ({ ...prev, sizeGuide: currentGuide }));
  };

  const handleRemoveSizeRow = (idx) => {
    const currentGuide = form.sizeGuide && form.sizeGuide.length > 0
      ? [...form.sizeGuide.map(item => ({ ...item }))]
      : [...DEFAULT_SIZE_GUIDE.map(item => ({ ...item }))];
    
    currentGuide.splice(idx, 1);
    setForm(prev => ({ ...prev, sizeGuide: currentGuide }));
  };

  const handleResetSizeGuide = () => {
    setForm(prev => ({ ...prev, sizeGuide: [...DEFAULT_SIZE_GUIDE.map(item => ({ ...item }))] }));
  };

  const handleSaveAdminCredentials = async () => {
    if (!adminForm.name || !adminForm.email || !adminForm.phone) {
      toast.error('Name, email, and phone number are required.');
      return;
    }

    const updates = {
      name: adminForm.name,
      email: adminForm.email,
      phone: adminForm.phone
    };

    if (adminForm.newPassword) {
      if (!adminForm.currentPassword) {
        toast.error('Current password is required to set a new password.');
        return;
      }
      if (adminForm.currentPassword !== user.password) {
        toast.error('Current password is incorrect.');
        return;
      }
      if (adminForm.newPassword.length < 6) {
        toast.error('New password must be at least 6 characters.');
        return;
      }
      if (adminForm.newPassword !== adminForm.confirmPassword) {
        toast.error('New passwords do not match.');
        return;
      }
      updates.password = adminForm.newPassword;
    }

    const loadingToast = toast.loading('Saving admin credentials...');
    const res = await updateProfile(updates);
    if (res.success) {
      toast.success('Admin credentials updated successfully!', { id: loadingToast });
      setAdminForm(p => ({
        ...p,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } else {
      toast.error(res.error || 'Failed to update credentials.', { id: loadingToast });
    }
  };

  const handleSave = async () => {
    if (activeTab === 'admin-account') {
      await handleSaveAdminCredentials();
    } else if (activeTab === 'security-pin') {
      return;
    } else {
      updateSettings(form);
    }
  };

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'payment', label: 'Payment' },
    { id: 'social', label: 'Social & SEO' },
    { id: 'policies', label: 'Policies' },
    { id: 'offers', label: 'Offers & Promo Banners' },
    { id: 'admin-account', label: 'Admin Credentials' },
    { id: 'security-pin', label: 'Access PIN Security' },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-xl text-primary">Website Settings</h2>
          <p className="text-neutral-400 text-sm">Manage your store configuration</p>
        </div>
        {activeTab !== 'security-pin' && (
          <button id="save-settings-btn" onClick={handleSave} className="btn-primary gap-2">
            <Save className="w-4 h-4" /> Save Changes
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-neutral-200 pb-0">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${
              activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-neutral-500 hover:text-primary'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="card p-6">
        {activeTab === 'general' && (
          <div className="space-y-5 animate-fade-in">
            <h3 className="font-semibold text-primary mb-4">Store Information</h3>

            {/* Logo Upload */}
            <div>
              <label className="label">Store Logo</label>
              <div className="flex items-center gap-4">
                {form.logo ? (
                  <img src={form.logo} alt="Logo" className="w-16 h-16 rounded-xl object-contain border border-neutral-200" />
                ) : (
                  <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center text-white font-display font-bold text-xl">
                    {form.siteName?.[0]}
                  </div>
                )}
                <div>
                  <label className="btn-outline btn-sm gap-2 cursor-pointer">
                    <Upload className="w-4 h-4" /> Upload Logo
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </label>
                  <p className="text-xs text-neutral-400 mt-1">PNG, JPG. Recommended: 200×200px</p>
                </div>
              </div>
            </div>            {/* Login Background Image Upload */}
            <div className="pt-2 border-t border-neutral-100">
              <label className="label">Login & Signup Page Background Image</label>
              <div className="flex items-center gap-4">
                {form.loginImage ? (
                  <img src={form.loginImage} alt="Login Background" className="w-24 h-16 rounded-xl object-cover border border-neutral-200" />
                ) : (
                  <div className="w-24 h-16 bg-neutral-100 rounded-xl flex items-center justify-center text-neutral-400 text-xs text-center border border-neutral-200 font-medium">
                    Default
                  </div>
                )}
                <div>
                  <label className="btn-outline btn-sm gap-2 cursor-pointer">
                    <Upload className="w-4 h-4" /> Upload Image
                    <input type="file" accept="image/*" className="hidden" onChange={handleLoginImageUpload} />
                  </label>
                  {form.loginImage && (
                    <button type="button" onClick={() => setForm(p => ({ ...p, loginImage: null }))} className="text-xs text-danger hover:underline ml-3">
                      Reset to Default
                    </button>
                  )}
                  <p className="text-xs text-neutral-400 mt-1">PNG, JPG. Recommended: Portrait style (e.g. 800×1200px)</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Store Name</label>
                <input className="input" value={form.siteName} onChange={e => setForm(p => ({ ...p, siteName: e.target.value }))} />
              </div>
              <div>
                <label className="label">Tagline</label>
                <input className="input" value={form.tagline} onChange={e => setForm(p => ({ ...p, tagline: e.target.value }))} />
              </div>
              <div>
                <label className="label flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> Phone</label>
                <input className="input" value={form.phone || ''} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div>
                <label className="label flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5 text-[#25D366]" /> WhatsApp</label>
                <input className="input" value={form.whatsapp || ''} onChange={e => setForm(p => ({ ...p, whatsapp: e.target.value }))} placeholder="e.g. 7708533144" />
              </div>
              <div>
                <label className="label flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> Email</label>
                <input type="email" className="input" value={form.email || ''} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <label className="label flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Address</label>
                <input className="input" value={form.address || ''} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
              </div>
              <div>
                <label className="label">Shipping Charge (₹)</label>
                <input type="number" className="input" value={form.shippingCharge} onChange={e => setForm(p => ({ ...p, shippingCharge: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="label">Free Shipping Above (₹)</label>
                <input type="number" className="input" value={form.freeShippingAbove} onChange={e => setForm(p => ({ ...p, freeShippingAbove: Number(e.target.value) }))} />
              </div>
            </div>

            {/* Size Guide Chart */}
            <div className="pt-5 border-t border-neutral-200">
              <h4 className="font-semibold text-primary mb-1">Size Guide Chart</h4>
              <p className="text-xs text-neutral-400 mb-4">
                Define the size measurements table shown to customers.
              </p>
              
              <div className="overflow-x-auto border border-neutral-200 rounded-xl">
                <table className="w-full text-sm text-left">
                  <thead className="bg-neutral-50 text-neutral-600 font-medium border-b border-neutral-200">
                    <tr>
                      <th className="p-3">Size Name</th>
                      <th className="p-3">Chest (inches/cm)</th>
                      <th className="p-3">Length (inches/cm)</th>
                      <th className="p-3">Shoulder (inches/cm)</th>
                      <th className="p-3 w-24 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {((form.sizeGuide && form.sizeGuide.length > 0) ? form.sizeGuide : DEFAULT_SIZE_GUIDE).map((row, idx) => (
                      <tr key={idx} className="hover:bg-neutral-50/50">
                        <td className="p-2">
                          <input
                            type="text"
                            className="input py-1.5 px-3 text-sm"
                            placeholder="e.g. S"
                            value={row.size || ''}
                            onChange={(e) => handleSizeGuideChange(idx, 'size', e.target.value)}
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            className="input py-1.5 px-3 text-sm"
                            placeholder="e.g. 38 in"
                            value={row.chest || ''}
                            onChange={(e) => handleSizeGuideChange(idx, 'chest', e.target.value)}
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            className="input py-1.5 px-3 text-sm"
                            placeholder="e.g. 27 in"
                            value={row.length || ''}
                            onChange={(e) => handleSizeGuideChange(idx, 'length', e.target.value)}
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            className="input py-1.5 px-3 text-sm"
                            placeholder="e.g. 17.5 in"
                            value={row.shoulder || ''}
                            onChange={(e) => handleSizeGuideChange(idx, 'shoulder', e.target.value)}
                          />
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveSizeRow(idx)}
                            className="text-danger hover:underline text-sm font-medium"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={handleAddSizeRow}
                  className="btn-outline btn-sm"
                >
                  + Add Size Row
                </button>
                <button
                  type="button"
                  onClick={handleResetSizeGuide}
                  className="btn-outline btn-sm text-neutral-600 border-neutral-300"
                >
                  Reset to Default
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payment' && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="font-semibold text-primary mb-4">Payment Settings</h3>
            <div>
              <label className="label">GPay UPI ID</label>
              <input className="input" value={form.gpayUPI} onChange={e => setForm(p => ({ ...p, gpayUPI: e.target.value }))} placeholder="youremail@upi" />
              <p className="text-xs text-neutral-400 mt-1">This UPI ID will be shown to customers during checkout</p>
            </div>
            <div>
              <label className="label">GPay QR Code Image</label>
              <div className="flex items-start gap-4">
                {form.gpayQR ? (
                  <div className="relative">
                    <img src={form.gpayQR} alt="GPay QR" className="w-32 h-32 rounded-xl border border-neutral-200 object-contain" />
                    <button onClick={() => setForm(p => ({ ...p, gpayQR: null }))} className="absolute -top-2 -right-2 w-6 h-6 bg-danger text-white rounded-full text-xs flex items-center justify-center">×</button>
                  </div>
                ) : (
                  <div className="w-32 h-32 border-2 border-dashed border-neutral-300 rounded-xl flex items-center justify-center text-neutral-400 text-xs text-center">
                    No QR uploaded
                  </div>
                )}
                <div>
                  <label className="btn-outline btn-sm gap-2 cursor-pointer">
                    <Upload className="w-4 h-4" /> Upload QR Code
                    <input type="file" accept="image/*" className="hidden" onChange={handleGPayQRUpload} />
                  </label>
                  <p className="text-xs text-neutral-400 mt-2">Upload your GPay QR code image.<br />Customers will scan this during checkout.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'social' && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="font-semibold text-primary mb-4">Social Media Links</h3>
            {[
              { key: 'instagram', label: 'Instagram', icon: Instagram },
              { key: 'facebook', label: 'Facebook', icon: Facebook },
              { key: 'twitter', label: 'Twitter / X', icon: Twitter },
              { key: 'youtube', label: 'YouTube', icon: Youtube },
            ].map(({ key, label, icon: Icon }) => (
              <div key={key}>
                <label className="label flex items-center gap-1.5"><Icon className="w-3.5 h-3.5" /> {label}</label>
                <input className="input" value={form.socialLinks?.[key] || ''} placeholder={`https://${key}.com/yourpage`}
                  onChange={e => setForm(p => ({ ...p, socialLinks: { ...p.socialLinks, [key]: e.target.value } }))} />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'policies' && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="font-semibold text-primary mb-4">Store Policies</h3>
            {[
              { key: 'privacyPolicy', label: 'Privacy Policy' },
              { key: 'returnPolicy', label: 'Return Policy' },
              { key: 'termsAndConditions', label: 'Terms & Conditions' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="label">{label}</label>
                <textarea className="input resize-none" rows={5} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'admin-account' && (
          <div className="space-y-5 animate-fade-in">
            <h3 className="font-semibold text-primary mb-4">Admin Account Credentials</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Admin Name</label>
                <input
                  id="admin-cred-name"
                  className="input"
                  value={adminForm.name}
                  onChange={e => setAdminForm(p => ({ ...p, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="label">Admin Email</label>
                <input
                  id="admin-cred-email"
                  type="email"
                  className="input"
                  value={adminForm.email}
                  onChange={e => setAdminForm(p => ({ ...p, email: e.target.value }))}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="label">Admin Phone Number</label>
                <input
                  id="admin-cred-phone"
                  type="tel"
                  className="input"
                  value={adminForm.phone}
                  onChange={e => setAdminForm(p => ({ ...p, phone: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100 space-y-4">
              <h4 className="font-medium text-neutral-700 text-sm">Change Login Password</h4>
              <p className="text-xs text-neutral-400">Leave password fields blank if you do not want to change your password.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">Current Password</label>
                  <input
                    id="admin-cred-current-pwd"
                    type="password"
                    className="input"
                    placeholder="Enter current password"
                    value={adminForm.currentPassword}
                    onChange={e => setAdminForm(p => ({ ...p, currentPassword: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label">New Password</label>
                  <input
                    id="admin-cred-new-pwd"
                    type="password"
                    className="input"
                    placeholder="At least 6 characters"
                    value={adminForm.newPassword}
                    onChange={e => setAdminForm(p => ({ ...p, newPassword: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label">Confirm New Password</label>
                  <input
                    id="admin-cred-confirm-pwd"
                    type="password"
                    className="input"
                    placeholder="Confirm new password"
                    value={adminForm.confirmPassword}
                    onChange={e => setAdminForm(p => ({ ...p, confirmPassword: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'offers' && (
          <div className="space-y-5 animate-fade-in">
            <h3 className="font-semibold text-primary mb-4">Promotional Messages & Banners</h3>
            
            <div>
              <label className="label">Top Bar Promo Message</label>
              <input 
                className="input" 
                value={form.promoText || ''} 
                onChange={e => setForm(p => ({ ...p, promoText: e.target.value }))} 
                placeholder="e.g. Use code WELCOME10 for 10% off" 
              />
              <p className="text-xs text-neutral-400 mt-1">This promo line appears at the very top of all store pages</p>
            </div>

            <div className="h-[1px] bg-neutral-100 my-4" />
            <h4 className="font-medium text-neutral-700 text-sm">Middle Page Promo Banner</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Banner Badge / Label</label>
                <input 
                  className="input" 
                  value={form.promoBannerBadge || ''} 
                  onChange={e => setForm(p => ({ ...p, promoBannerBadge: e.target.value }))} 
                  placeholder="e.g. Limited Time Offer" 
                />
              </div>
              <div>
                <label className="label">Banner Title</label>
                <input 
                  className="input" 
                  value={form.promoBannerTitle || ''} 
                  onChange={e => setForm(p => ({ ...p, promoBannerTitle: e.target.value }))} 
                  placeholder="e.g. Up to 40% Off" 
                />
              </div>
              <div className="md:col-span-2">
                <label className="label">Banner Subtitle / Description</label>
                <textarea 
                  className="input resize-none" 
                  rows={2}
                  value={form.promoBannerText || ''} 
                  onChange={e => setForm(p => ({ ...p, promoBannerText: e.target.value }))} 
                  placeholder="e.g. Explore our curated collection of premium styles at unbeatable prices." 
                />
              </div>
              <div>
                <label className="label">Button Text</label>
                <input 
                  className="input" 
                  value={form.promoBannerBtn || ''} 
                  onChange={e => setForm(p => ({ ...p, promoBannerBtn: e.target.value }))} 
                  placeholder="e.g. Shop the Sale" 
                />
              </div>
              <div>
                <label className="label">Button Redirect Route / Link</label>
                <input 
                  className="input" 
                  value={form.promoBannerLink || ''} 
                  onChange={e => setForm(p => ({ ...p, promoBannerLink: e.target.value }))} 
                  placeholder="e.g. /sale" 
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security-pin' && (
          <div className="space-y-5 animate-fade-in">
            <h3 className="font-semibold text-primary mb-2">Access PIN Security</h3>
            <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
              Restrict access to the sensitive **Orders** and **Payments** dashboards by setting a Security PIN. 
              To set, update, or change the PIN, request an OTP verification code. It will be sent to the test email address <strong>gokulnath96880@gmail.com</strong>.
            </p>

            {!otpSent ? (
              <div className="space-y-4 max-w-md">
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={requestingOtp}
                  className="btn-primary gap-2"
                >
                  {requestingOtp ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                  {requestingOtp ? 'Sending OTP...' : 'Send Verification OTP to Email'}
                </button>
              </div>
            ) : (
              <div className="space-y-5 max-w-md border border-neutral-100 bg-neutral-50/50 rounded-2xl p-6">
                <div className="bg-primary/5 text-primary text-xs rounded-xl px-4 py-3 border border-primary/10">
                  A verification OTP code was successfully sent to your test inbox: <strong>gokulnath96880@gmail.com</strong>
                </div>

                <div>
                  <label className="label">Verification OTP Code (6 Digits)</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP code"
                    className="input font-mono tracking-widest text-lg"
                    value={pinForm.otp}
                    onChange={e => setPinForm(p => ({ ...p, otp: e.target.value.replace(/\D/g, '') }))}
                  />
                </div>

                <div>
                  <label className="label">New Security Access PIN (4 Digits)</label>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="Enter 4-digit PIN"
                    className="input font-mono tracking-widest text-lg"
                    value={pinForm.pin}
                    onChange={e => setPinForm(p => ({ ...p, pin: e.target.value.replace(/\D/g, '') }))}
                  />
                </div>

                <div>
                  <label className="label">Confirm New PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="Re-enter 4-digit PIN"
                    className="input font-mono tracking-widest text-lg"
                    value={pinForm.confirmPin}
                    onChange={e => setPinForm(p => ({ ...p, confirmPin: e.target.value.replace(/\D/g, '') }))}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleUpdatePin}
                    disabled={updatingPin || !pinForm.otp || !pinForm.pin || pinForm.pin !== pinForm.confirmPin}
                    className="btn-primary gap-2 flex-1"
                  >
                    {updatingPin ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                    {updatingPin ? 'Updating PIN...' : 'Verify & Save PIN'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setOtpSent(false); setPinForm({ otp: '', pin: '', confirmPin: '' }); }}
                    className="btn-outline text-neutral-500 border-neutral-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {activeTab !== 'security-pin' && (
        <div className="flex justify-end">
          <button onClick={handleSave} className="btn-primary gap-2">
            <Save className="w-4 h-4" /> Save All Settings
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
