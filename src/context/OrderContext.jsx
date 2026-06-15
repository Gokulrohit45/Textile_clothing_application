import { createContext, useContext, useState, useEffect } from 'react';

const OrderContext = createContext();
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resOrders, resPayments] = await Promise.all([
        fetch(`${API_URL}/orders/all`),
        fetch(`${API_URL}/payments`)
      ]);
      if (resOrders.ok) setOrders(await resOrders.json());
      if (resPayments.ok) setPayments(await resPayments.json());
    } catch (err) {
      console.error('Failed to fetch orders or payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const placeOrder = async (orderData) => {
    try {
      const res = await fetch(`${API_URL}/orders/place`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...orderData,
          createdAt: new Date().toISOString().split('T')[0]
        }),
      });
      if (res.ok) {
        const newOrder = await res.json();
        setOrders(prev => [newOrder, ...prev]);
        
        // Refresh payments to ensure frontend has the created payment record
        if (orderData.paymentMethod === 'gpay') {
          const resPay = await fetch(`${API_URL}/payments`);
          if (resPay.ok) setPayments(await resPay.json());
        }
        
        return newOrder;
      }
    } catch (err) {
      console.error('Place order error:', err);
    }
  };

  const updateOrderStatus = async (orderId, status, trackingId = null, extraParams = {}) => {
    try {
      const res = await fetch(`${API_URL}/orders/update-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: orderId,
          status,
          trackingId,
          updatedAt: new Date().toISOString().split('T')[0],
          ...extraParams
        }),
      });
      if (res.ok) {
        setOrders(prev => prev.map(o =>
          o.id === orderId
            ? { 
                ...o, 
                status, 
                trackingId: trackingId || o.trackingId, 
                paymentStatus: status === 'delivered' ? 'verified' : o.paymentStatus,
                updatedAt: new Date().toISOString().split('T')[0],
                ...extraParams
              }
            : o
        ));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Update order status error:', err);
      return false;
    }
  };

  const uploadPaymentScreenshot = async (orderId, screenshot) => {
    try {
      const res = await fetch(`${API_URL}/payments/screenshot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, screenshot }),
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentScreenshot: screenshot } : o));
        setPayments(prev => prev.map(p => p.orderId === orderId ? { ...p, screenshot, status: 'pending' } : p));
      }
    } catch (err) {
      console.error('Upload screenshot error:', err);
    }
  };

  const verifyPayment = async (orderId, approved) => {
    try {
      const res = await fetch(`${API_URL}/payments/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          approved,
          verifiedAt: new Date().toISOString().split('T')[0]
        }),
      });
      if (res.ok) {
        const status = approved ? 'verified' : 'rejected';
        setPayments(prev => prev.map(p =>
          p.orderId === orderId ? { ...p, status, verifiedAt: new Date().toISOString().split('T')[0] } : p
        ));
        setOrders(prev => prev.map(o =>
          o.id === orderId
            ? { ...o, paymentStatus: status, status: approved ? 'processing' : 'payment_rejected', updatedAt: new Date().toISOString().split('T')[0] }
            : o
        ));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Verify payment error:', err);
      return false;
    }
  };

  const getOrdersByUser = (userId) => orders.filter(o => o.userId === userId);
  const getOrderById = (id) => orders.find(o => o.id === id);
  const getPaymentByOrderId = (orderId) => payments.find(p => p.orderId === orderId);
  const getPendingPayments = () => payments.filter(p => p.status === 'pending');

  const getRevenueStats = () => {
    const verified = orders.filter(o => o.paymentStatus === 'verified');
    const totalRevenue = verified.reduce((sum, o) => sum + o.total, 0);
    const monthlyRevenue = {};
    verified.forEach(o => {
      if (o.createdAt) {
        const month = o.createdAt.substring(0, 7);
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + o.total;
      }
    });
    return { totalRevenue, monthlyRevenue, totalOrders: orders.length, deliveredOrders: orders.filter(o => o.status === 'delivered').length };
  };

  return (
    <OrderContext.Provider value={{
      orders, payments, loading, refreshOrders: fetchData,
      placeOrder, updateOrderStatus, uploadPaymentScreenshot, verifyPayment,
      getOrdersByUser, getOrderById, getPaymentByOrderId, getPendingPayments,
      getRevenueStats,
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrder must be used within OrderProvider');
  return ctx;
};
