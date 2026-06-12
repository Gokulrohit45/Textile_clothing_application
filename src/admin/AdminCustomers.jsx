import { useState } from 'react';
import { Search, UserX, UserCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOrder } from '../context/OrderContext';
import toast from 'react-hot-toast';

const AdminCustomers = () => {
  const { customers, blockUser, unblockUser } = useAuth();
  const { getOrdersByUser } = useOrder();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = customers
    .filter(c => c.role === 'customer')
    .filter(c => filter === 'all' || c.status === filter)
    .filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h2 className="font-display font-bold text-xl text-primary">Customers</h2>
        <p className="text-neutral-400 text-sm">{customers.filter(c => c.role === 'customer').length} total customers</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input className="input pl-10" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-36" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-100">
              <tr>
                {['Customer', 'Email', 'Phone', 'Joined', 'Orders', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {filtered.map(customer => {
                const orders = getOrdersByUser(customer.id);
                return (
                  <tr key={customer.id} className={`hover:bg-neutral-50/50 transition-colors ${customer.status === 'blocked' ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {customer.name?.[0]}
                        </div>
                        <span className="text-sm font-medium text-primary">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-600">{customer.email}</td>
                    <td className="px-4 py-3 text-sm text-neutral-600">{customer.phone}</td>
                    <td className="px-4 py-3 text-xs text-neutral-400">{customer.createdAt}</td>
                    <td className="px-4 py-3">
                      <span className="badge-neutral">{orders.length} orders</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${customer.status === 'active' ? 'badge-success' : 'badge-danger'}`}>{customer.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      {customer.status === 'active' ? (
                        <button
                          id={`block-user-${customer.id}`}
                          onClick={() => { if (confirm(`Block ${customer.name}?`)) { blockUser(customer.id); toast.success('User blocked!'); } }}
                          className="btn-ghost p-1.5 text-danger hover:bg-danger/5 rounded-lg gap-1 text-xs"
                        >
                          <UserX className="w-3.5 h-3.5" /> Block
                        </button>
                      ) : (
                        <button
                          id={`unblock-user-${customer.id}`}
                          onClick={() => { unblockUser(customer.id); toast.success('User unblocked!'); }}
                          className="btn-ghost p-1.5 text-success hover:bg-success/5 rounded-lg gap-1 text-xs"
                        >
                          <UserCheck className="w-3.5 h-3.5" /> Unblock
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-center py-10 text-neutral-400 text-sm">No customers found</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminCustomers;
