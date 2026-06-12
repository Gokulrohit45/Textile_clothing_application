import { useState } from 'react';
import { AlertTriangle, XCircle, Edit2, Save, Search, Package, AlertCircle } from 'lucide-react';
import { useProduct } from '../context/ProductContext';
import toast from 'react-hot-toast';

const AdminInventory = () => {
  const { inventory, products, categories, subcategories, updateStock } = useProduct();
  const [editId, setEditId] = useState(null);
  const [editStock, setEditStock] = useState('');
  const [filter, setFilter] = useState('all'); // all / low / out
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [subcategoryFilter, setSubcategoryFilter] = useState('all');

  const getProduct = (id) => products.find(p => p.id === id);

  const activeSubcategories = subcategories
    ? subcategories.filter(sub => sub.categoryId === categoryFilter)
    : [];

  const handleCategoryChange = (catId) => {
    setCategoryFilter(catId);
    setSubcategoryFilter('all');
  };

  // Generate all SKU rows dynamically based on active products' colors and sizes
  const allSKUs = [];
  products.forEach(product => {
    if (product.status !== 'active') return;

    const sizes = product.sizes || [];
    const colors = product.colorNames || [];

    colors.forEach(color => {
      sizes.forEach(size => {
        const invItem = inventory.find(i => 
          i.productId === product.id && 
          i.colorName.toLowerCase() === color.toLowerCase() && 
          i.size.toLowerCase() === size.toLowerCase()
        );

        allSKUs.push({
          id: invItem?.id || `temp-${product.id}-${color}-${size}`,
          productId: product.id,
          colorName: color,
          size: size,
          stock: invItem ? invItem.stock : 10, // Matches store default
          isTemp: !invItem
        });
      });
    });
  });

  // Filter dynamically constructed SKUs by search query and category
  const activeInventory = allSKUs.filter(item => {
    const product = getProduct(item.productId);
    if (!product) return false;

    // Filter by search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = product.name.toLowerCase().includes(q);
      const matchId = product.id.toLowerCase().includes(q);
      const matchSku = item.productId.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchSku) return false;
    }

    // Filter by category
    if (categoryFilter !== 'all' && product.categoryId !== categoryFilter) {
      return false;
    }

    // Filter by subcategory
    if (subcategoryFilter !== 'all' && product.subcategoryId !== subcategoryFilter) {
      return false;
    }

    return true;
  });

  // Filter by stock level status
  const filtered = activeInventory.filter(item => {
    if (filter === 'low') return item.stock <= 5;
    if (filter === 'out') return item.stock === 0;
    return true;
  });

  const handleSave = (item) => {
    updateStock(item.productId, item.colorName, item.size, Number(editStock));
    setEditId(null);
    toast.success('Stock updated!');
  };

  const totalSKUs = activeInventory.length;
  const lowStockCount = activeInventory.filter(i => i.stock <= 5).length;
  const outOfStockCount = activeInventory.filter(i => i.stock === 0).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display font-bold text-xl text-primary">Inventory</h2>
        <p className="text-neutral-400 text-sm">Monitor and update product stock levels</p>
      </div>

      {/* Alert summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total SKUs', value: totalSKUs, color: 'text-primary', bg: 'bg-primary/5 border-primary/10', icon: Package },
          { label: 'Low Stock (≤5)', value: lowStockCount, color: 'text-warning', bg: 'bg-warning/5 border-warning/10', icon: AlertTriangle },
          { label: 'Out of Stock', value: outOfStockCount, color: 'text-danger', bg: 'bg-danger/5 border-danger/10', icon: AlertCircle },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <div key={label} className={`card p-5 flex items-center gap-4 border ${bg} transition-all duration-300 hover:shadow-md`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${bg} border`}>
              <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-neutral-400 font-medium tracking-wide uppercase">{label}</p>
              <p className={`text-2xl font-display font-bold ${color} mt-0.5`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Category Filtering Row */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between card p-4">
        {/* Search Input */}
        <div className="relative w-full md:max-w-xs">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            className="input pl-10 py-2.5 text-sm"
            placeholder="Search product name or SKU..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Tab Pills */}
        <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border ${
              categoryFilter === 'all'
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-neutral-300'
            }`}
          >
            All Categories
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border ${
                categoryFilter === cat.id
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-neutral-300'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Subcategory Tab Pills (Conditional) */}
      {categoryFilter !== 'all' && activeSubcategories.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none animate-fade-in card p-3 flex-wrap">
          <button
            onClick={() => setSubcategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all border ${
              subcategoryFilter === 'all'
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-neutral-300'
            }`}
          >
            All Subcategories
          </button>
          {activeSubcategories.map(sub => (
            <button
              key={sub.id}
              onClick={() => setSubcategoryFilter(sub.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all border ${
                subcategoryFilter === sub.id
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-neutral-300'
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-neutral-200 pb-0">
        {[
          { val: 'all', label: `All SKUs (${activeInventory.length})` },
          { val: 'low', label: `Low Stock (${activeInventory.filter(i => i.stock <= 5).length})` },
          { val: 'out', label: `Out of Stock (${activeInventory.filter(i => i.stock === 0).length})` }
        ].map(({ val, label }) => (
          <button key={val} onClick={() => setFilter(val)}
            className={`px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${
              filter === val ? 'border-primary text-primary font-semibold' : 'border-transparent text-neutral-500 hover:text-primary'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-100">
              <tr>
                {['Product', 'Color', 'Size', 'Stock', 'Status', 'Action'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 bg-white">
              {filtered.map(item => {
                const product = getProduct(item.productId);
                const isEditing = editId === item.id;
                const status = item.stock === 0 ? 'out' : item.stock <= 5 ? 'low' : 'ok';
                
                // Find matching color hex
                const colorIdx = product?.colorNames?.findIndex(c => c.toLowerCase() === item.colorName.toLowerCase());
                const colorHex = (colorIdx !== undefined && colorIdx !== -1) ? product.colors[colorIdx] : '#ccc';

                return (
                  <tr key={item.id} className={`hover:bg-neutral-50/40 transition-colors ${status === 'out' ? 'bg-danger/2' : ''}`}>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {product?.images?.[0] ? (
                          <img src={product.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover border border-neutral-100" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-400 font-display font-bold text-xs">
                            SH
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-primary">{product?.name || item.productId}</p>
                          <p className="text-xs text-neutral-400 font-mono mt-0.5">{item.productId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border border-neutral-200 shadow-sm" style={{ backgroundColor: colorHex }} />
                        <span className="text-sm text-neutral-600 font-medium">{item.colorName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4"><span className="badge-neutral font-medium">{item.size}</span></td>
                    <td className="px-4 py-4">
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          value={editStock}
                          onChange={e => setEditStock(e.target.value)}
                          className="w-20 px-2 py-1.5 border-2 border-primary rounded-lg text-sm font-semibold text-center focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <span className={`font-bold text-sm ${status === 'out' ? 'text-danger' : status === 'low' ? 'text-warning' : 'text-success'}`}>
                          {item.stock}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {status === 'out' ? (
                        <span className="badge-danger flex items-center gap-1 w-fit"><XCircle className="w-3 h-3" /> Out of Stock</span>
                      ) : status === 'low' ? (
                        <span className="badge-warning flex items-center gap-1 w-fit"><AlertTriangle className="w-3 h-3" /> Low Stock</span>
                      ) : (
                        <span className="badge-success w-fit">In Stock</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {isEditing ? (
                        <div className="flex gap-1">
                          <button id={`save-stock-${item.id}`} onClick={() => handleSave(item)} className="btn-primary p-1.5 rounded-lg"><Save className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setEditId(null)} className="btn-ghost p-1.5 rounded-lg"><XCircle className="w-3.5 h-3.5 text-neutral-400" /></button>
                        </div>
                      ) : (
                        <button id={`edit-stock-${item.id}`} onClick={() => { setEditId(item.id); setEditStock(item.stock); }} className="btn-ghost p-1.5 rounded-lg hover:text-primary transition-colors">
                          <Edit2 className="w-3.5 h-3.5 text-neutral-400 hover:text-primary" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-10 h-10 text-neutral-200 mx-auto mb-3" />
              <p className="text-neutral-400 text-sm font-medium">No matching items found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminInventory;
