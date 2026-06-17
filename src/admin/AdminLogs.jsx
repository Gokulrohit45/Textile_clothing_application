import { useState, useEffect } from 'react';
import { Search, Activity, RefreshCw, Clock, User, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const formatLocalTimestamp = (timestampStr) => {
  if (!timestampStr) return '';
  try {
    let parsedDate;
    if (timestampStr.includes('T') || timestampStr.endsWith('Z') || timestampStr.includes('+')) {
      parsedDate = new Date(timestampStr);
    } else {
      // Legacy format (e.g. "2026-06-17 11:03:23" or "2026-06-17 10:30:45")
      // Heuristic: if parsed as UTC it would be in the future, it is a local IST log.
      // Otherwise, it was recorded in UTC by Render, so treat it as UTC.
      const utcDate = new Date(timestampStr.replace(' ', 'T') + 'Z');
      const now = new Date();
      if (!isNaN(utcDate.getTime()) && utcDate <= now) {
        parsedDate = utcDate;
      } else {
        const parts = timestampStr.split(/[- :]/);
        if (parts.length >= 6) {
          parsedDate = new Date(
            parseInt(parts[0]),
            parseInt(parts[1]) - 1,
            parseInt(parts[2]),
            parseInt(parts[3]),
            parseInt(parts[4]),
            parseInt(parts[5])
          );
        } else {
          parsedDate = new Date(timestampStr);
        }
      }
    }

    if (isNaN(parsedDate.getTime())) {
      return timestampStr;
    }

    const pad = (num) => String(num).padStart(2, '0');
    const yyyy = parsedDate.getFullYear();
    const mm = pad(parsedDate.getMonth() + 1);
    const dd = pad(parsedDate.getDate());
    const hh = pad(parsedDate.getHours());
    const min = pad(parsedDate.getMinutes());
    const ss = pad(parsedDate.getSeconds());

    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
  } catch (e) {
    return timestampStr;
  }
};

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/admin/activity-logs`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      } else {
        toast.error('Failed to load activity logs');
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
      toast.error('Could not connect to the server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs
    .filter(log => {
      const userNameStr = log.userName || '';
      const userEmailStr = log.userEmail || '';
      const actionStr = log.action || '';
      
      const matchesSearch = 
        userNameStr.toLowerCase().includes(search.toLowerCase()) ||
        userEmailStr.toLowerCase().includes(search.toLowerCase()) ||
        actionStr.toLowerCase().includes(search.toLowerCase());
      
      let matchesFilter = true;
      if (filter === 'login') matchesFilter = actionStr.toLowerCase().includes('login');
      else if (filter === 'logout') matchesFilter = actionStr.toLowerCase().includes('logout');
      
      let matchesDate = true;
      if (selectedDate) {
        const formattedLogDate = formatLocalTimestamp(log.timestamp); // "YYYY-MM-DD HH:MM:SS"
        matchesDate = formattedLogDate.startsWith(selectedDate);
      }
      
      return matchesSearch && matchesFilter && matchesDate;
    });

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-xl text-primary flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Activity Logs
          </h2>
          <p className="text-neutral-400 text-sm">{logs.length} entries recorded</p>
        </div>
        <button 
          onClick={fetchLogs} 
          disabled={loading}
          className="btn-outline btn-sm gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input 
            className="input pl-10" 
            placeholder="Search by name, email, or action..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        
        {/* Date Filter */}
        <div className="relative w-48">
          <input 
            type="date"
            className="input w-full"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
          />
          {selectedDate && (
            <button 
              onClick={() => setSelectedDate('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-neutral-400 hover:text-neutral-600 focus:outline-none"
            >
              Clear
            </button>
          )}
        </div>

        <select className="input w-40" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All Activities</option>
          <option value="login">Logins Only</option>
          <option value="logout">Logouts Only</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-20">
              <RefreshCw className="w-10 h-10 text-neutral-300 animate-spin mx-auto mb-3" />
              <p className="text-sm text-neutral-400">Loading activity logs...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-20">
              <Activity className="w-16 h-16 text-neutral-200 mx-auto mb-4" />
              <h3 className="font-semibold text-neutral-600 mb-1">No logs found</h3>
              <p className="text-sm text-neutral-400">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-100">
                <tr>
                  {['User', 'Action', 'Date & Time'].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {filteredLogs.map(log => {
                  const actionStr = log.action || '';
                  const isLogin = actionStr.toLowerCase().includes('login');
                  const initials = (log.userName || 'U')[0].toUpperCase();
                  
                  return (
                    <tr key={log.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-neutral-100 text-neutral-600 rounded-full flex items-center justify-center font-bold text-sm">
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-primary flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-neutral-400" />
                              {log.userName || 'Unknown User'}
                            </p>
                            <p className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 text-neutral-300" />
                              {log.userEmail || 'no-email'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`badge py-1 px-2.5 rounded-lg text-xs font-medium ${
                          isLogin ? 'badge-success' : 'badge-neutral'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-sm text-neutral-600 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-neutral-400" />
                          {formatLocalTimestamp(log.timestamp)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLogs;
