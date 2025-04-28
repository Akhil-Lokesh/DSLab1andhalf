import React, { useState, useEffect } from 'react';
import { getRestaurantOrders, updateOrderStatus } from '../services/restaurant';
import { useNavigate } from 'react-router-dom';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  // Status counts for display in tabs
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    New: 0,
    Preparing: 0,
    'On the Way': 0,
    'Ready for Pickup': 0,
    Delivered: 0,
    'Picked Up': 0,
    Cancelled: 0
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getRestaurantOrders();
      console.log('Orders fetched successfully:', response.data);
      
      if (Array.isArray(response.data)) {
        setOrders(response.data);
        
        // Calculate status counts
        const counts = {
          all: response.data.length,
          New: 0,
          Preparing: 0,
          'On the Way': 0,
          'Ready for Pickup': 0,
          Delivered: 0,
          'Picked Up': 0,
          Cancelled: 0
        };
        
        response.data.forEach(order => {
          if (counts[order.status] !== undefined) {
            counts[order.status]++;
          }
        });
        
        setStatusCounts(counts);
      } else {
        console.error('Unexpected response format:', response.data);
        setError('Failed to load orders: Invalid data format');
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders. Please try again.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle updating order status
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setError(null);
      
      await updateOrderStatus(orderId, newStatus);
      
      // Update the local state for immediate UI update
      const updatedOrders = orders.map(order => {
        if (order.id === orderId) {
          return { ...order, status: newStatus };
        }
        return order;
      });
      
      setOrders(updatedOrders);
      
      // Update status counts
      setStatusCounts(prevCounts => {
        const newCounts = { ...prevCounts };
        
        // Find the order that was updated
        const order = orders.find(o => o.id === orderId);
        if (order) {
          // Decrement the count for the old status
          if (newCounts[order.status] !== undefined) {
            newCounts[order.status] = Math.max(0, newCounts[order.status] - 1);
          }
          
          // Increment the count for the new status
          if (newCounts[newStatus] !== undefined) {
            newCounts[newStatus]++;
          }
        }
        
        return newCounts;
      });
      
      setSuccess(`Order #${orderId} status updated to ${newStatus}`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
    } catch (error) {
      console.error(`Error updating order ${orderId} status:`, error);
      setError('Failed to update order status. Please try again.');
    }
  };

  // Filter orders based on the active tab
  const filteredOrders = activeTab === 'all' 
    ? orders 
    : orders.filter(order => order.status === activeTab);

  // Get the appropriate status class for styling
  const getStatusClass = (status) => {
    switch (status) {
      case 'Delivered':
      case 'Picked Up':
        return 'success';
      case 'On the Way':
      case 'Ready for Pickup':
        return 'primary';
      case 'New':
      case 'Order Received':
      case 'Preparing':
        return 'warning';
      case 'Cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  // Format date in a readable way
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateString;
    }
  };

  return (
    <div className="container-fluid pt-4 pb-5" style={{ backgroundColor: '#1a1a1a', color: '#FFF', marginTop: '70px', minHeight: '100vh' }}>
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="order-title">Order Management</h1>
        <button 
          className="btn btn-outline-success rounded-pill"
          onClick={fetchOrders}
            disabled={loading}
        >
          <i className="bi bi-arrow-clockwise me-2"></i>
          Refresh Orders
        </button>
      </div>
      
      {error && (
          <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
            <button type="button" className="btn-close" onClick={() => setError(null)} aria-label="Close"></button>
          </div>
        )}
        
        {success && (
          <div className="alert alert-success alert-dismissible fade show mb-4" role="alert">
            <i className="bi bi-check-circle-fill me-2"></i>
            {success}
            <button type="button" className="btn-close" onClick={() => setSuccess(null)} aria-label="Close"></button>
        </div>
      )}
      
      {/* Status Filter Tabs */}
        <div className="status-tabs mb-4">
          <div className="d-flex flex-nowrap gap-2 overflow-auto">
            <button 
              className={`status-tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
          >
              All Orders <span className="count">{statusCounts.all}</span>
            </button>
            <button 
              className={`status-tab ${activeTab === 'New' ? 'active' : ''}`}
              onClick={() => setActiveTab('New')}
          >
              New <span className="count">{statusCounts.New}</span>
            </button>
            <button 
              className={`status-tab ${activeTab === 'Preparing' ? 'active' : ''}`}
              onClick={() => setActiveTab('Preparing')}
          >
              Preparing <span className="count">{statusCounts.Preparing}</span>
            </button>
            <button 
              className={`status-tab ${activeTab === 'On the Way' ? 'active' : ''}`}
              onClick={() => setActiveTab('On the Way')}
          >
              On the Way <span className="count">{statusCounts['On the Way']}</span>
            </button>
            <button 
              className={`status-tab ${activeTab === 'Ready for Pickup' ? 'active' : ''}`}
              onClick={() => setActiveTab('Ready for Pickup')}
          >
              Ready for Pickup <span className="count">{statusCounts['Ready for Pickup']}</span>
            </button>
            <button 
              className={`status-tab ${activeTab === 'Delivered' ? 'active' : ''}`}
              onClick={() => setActiveTab('Delivered')}
          >
              Delivered <span className="count">{statusCounts.Delivered}</span>
            </button>
            <button 
              className={`status-tab ${activeTab === 'Picked Up' ? 'active' : ''}`}
              onClick={() => setActiveTab('Picked Up')}
          >
              Picked Up <span className="count">{statusCounts['Picked Up']}</span>
            </button>
            <button 
              className={`status-tab ${activeTab === 'Cancelled' ? 'active' : ''}`}
              onClick={() => setActiveTab('Cancelled')}
          >
              Cancelled <span className="count">{statusCounts.Cancelled}</span>
            </button>
        </div>
      </div>
      
        {/* Loading state */}
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading orders...</p>
          </div>
        )}
        
        {/* Empty state */}
        {!loading && filteredOrders.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <i className="bi bi-receipt"></i>
            </div>
            <h3>No orders found</h3>
            <p>
              {activeTab === 'all' 
                ? "You don't have any orders yet."
                : `You don't have any ${activeTab.toLowerCase()} orders.`}
            </p>
          </div>
        )}
        
        {/* Orders table */}
        {!loading && filteredOrders.length > 0 && (
          <div className="order-table-container">
            <table className="order-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id} className="order-row">
                    <td>#{order.id}</td>
                    <td>{order.customer_name || 'Customer'}</td>
                    <td>{formatDate(order.created_at)}</td>
                    <td>${parseFloat(order.total_price).toFixed(2)}</td>
                    <td>
                      <span className={`status-badge status-${getStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-flex flex-wrap gap-2 justify-content-end">
                          <button
                          className="btn btn-sm update-status-btn dropdown-toggle"
                          type="button"
                          id={`status-dropdown-${order.id}`}
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                          >
                            Update Status
                          </button>
                        <ul className="dropdown-menu dropdown-menu-dark" aria-labelledby={`status-dropdown-${order.id}`}>
                          {order.status !== 'New' && (
                            <li><button className="dropdown-item" onClick={() => handleUpdateStatus(order.id, 'New')}>New</button></li>
                          )}
                          {order.status !== 'Preparing' && (
                            <li><button className="dropdown-item" onClick={() => handleUpdateStatus(order.id, 'Preparing')}>Preparing</button></li>
                          )}
                          {order.status !== 'Ready for Pickup' && (
                            <li><button className="dropdown-item" onClick={() => handleUpdateStatus(order.id, 'Ready for Pickup')}>Ready for Pickup</button></li>
                          )}
                          {order.status !== 'On the Way' && (
                            <li><button className="dropdown-item" onClick={() => handleUpdateStatus(order.id, 'On the Way')}>On the Way</button></li>
                          )}
                          {order.status !== 'Delivered' && (
                            <li><button className="dropdown-item" onClick={() => handleUpdateStatus(order.id, 'Delivered')}>Delivered</button></li>
                          )}
                          {order.status !== 'Picked Up' && (
                            <li><button className="dropdown-item" onClick={() => handleUpdateStatus(order.id, 'Picked Up')}>Picked Up</button></li>
                          )}
                          {order.status !== 'Cancelled' && (
                            <li><button className="dropdown-item text-danger" onClick={() => handleUpdateStatus(order.id, 'Cancelled')}>Cancel Order</button></li>
                          )}
                        </ul>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Embedded CSS */}
      <style>{`
        .status-tab {
          background: #000000;
          border: none;
          color: #FFFFFF;
          padding: 0.5rem 1rem;
          border-radius: 50px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          white-space: nowrap;
          margin-right: 0.5rem;
        }
        
        .status-tab.active {
          background-color: #06C167;
          color: white;
        }
        
        .status-tab:hover:not(.active) {
          background-color: #333;
        }
        
        .status-tab .count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(6, 193, 103, 0.2);
          color: #06C167;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          font-size: 0.75rem;
          margin-left: 0.5rem;
        }
        
        .status-tab.active .count {
          background-color: white;
          color: #06C167;
        }
        
        .order-table-container {
          background-color: #000000;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .order-table {
          width: 100%;
          border-collapse: collapse;
          color: #FFFFFF;
        }
        
        .order-table thead th {
          background-color: #000000;
          color: #9CA3AF;
          font-weight: 500;
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid #333;
        }
        
        .order-table tbody td {
          padding: 1rem;
          border-bottom: 1px solid #333;
        }
        
        .order-row {
          background-color: #000000;
          transition: background-color 0.2s ease;
        }
        
        .order-row:hover {
          background-color: #121212;
        }
        
        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 2rem;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .status-success {
          background-color: rgba(6, 193, 103, 0.2);
          color: #06C167;
        }
        
        .status-primary {
          background-color: rgba(59, 130, 246, 0.2);
          color: #60a5fa;
        }
        
        .status-warning {
          background-color: rgba(245, 158, 11, 0.2);
          color: #fbbf24;
        }
        
        .status-danger {
          background-color: rgba(220, 38, 38, 0.2);
          color: #f87171;
        }
        
        .status-secondary {
          background-color: rgba(156, 163, 175, 0.2);
          color: #9CA3AF;
        }
        
        .empty-state {
          background-color: #000000;
          border: 1px solid #333;
          border-radius: 1rem;
          padding: 3rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .empty-state-icon {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background-color: #1E1E1E;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
        }
        
        .empty-state-icon i {
          font-size: 1.5rem;
          color: #9CA3AF;
        }
        
        .empty-state h3 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }
        
        .empty-state p {
          color: #9CA3AF;
          margin-bottom: 0;
          max-width: 300px;
        }
        
        .update-status-btn {
          background-color: #1A1A1A;
          color: #FFFFFF;
          border: 1px solid #333;
          border-radius: 4px;
        }
        
        .update-status-btn:hover {
          background-color: #333;
          color: #FFFFFF;
        }
        
        .dropdown-menu-dark {
          background-color: #1A1A1A;
          border-color: #333;
        }
        
        .dropdown-item {
          color: #FFFFFF;
        }
        
        .dropdown-item:hover, .dropdown-item:focus {
          background-color: #333;
        }
        
        .order-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }
        
        @media (max-width: 768px) {
          .order-title {
            font-size: 2rem;
          }
          
          .d-flex.flex-wrap.gap-2 {
            flex-direction: column;
            align-items: stretch;
          }
          
          .order-table th, .order-table td {
            padding: 0.75rem 0.5rem;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderManagement;