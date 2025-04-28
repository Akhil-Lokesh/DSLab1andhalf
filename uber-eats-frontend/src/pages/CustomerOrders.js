import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getCustomerOrders } from '../services/customer';

const CustomerOrders = () => {
  // We're not using currentUser right now, but might need it in the future
  // eslint-disable-next-line no-unused-vars
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchOrders();
  }, []);
  
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getCustomerOrders();
      
      if (response.data && Array.isArray(response.data)) {
        setOrders(response.data);
      } else {
        // Handle unexpected data format
        console.warn('Unexpected response format from API:', response);
        setOrders([]);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load your orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Filter orders based on active tab
  const getFilteredOrders = () => {
    switch (activeTab) {
      case 'active':
        return orders.filter(order =>
          ['New', 'Order Received', 'Confirmed', 'Preparing', 'Ready for Pickup', 'Pick-up Ready', 'On the Way'].includes(order.status)
        );
      case 'past':
        return orders.filter(order =>
          ['Delivered', 'Picked Up', 'Cancelled'].includes(order.status)
        );
      default:
        return orders;
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
      return dateString; // Return the original string if parsing fails
    }
  };
  
  // Get status class for styling
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
  
  // Format order items for display
  const formatOrderItems = (items) => {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return '';
    }
    
    // If there are more than 2 items, show the first 2 with a count of the rest
    if (items.length > 2) {
      const displayItems = items.slice(0, 2).map(item => `${item.quantity || 1}x ${item.name}`).join(', ');
      return `${displayItems} and ${items.length - 2} more item${items.length - 2 > 1 ? 's' : ''}`;
    }
    
    // Otherwise just show all items
    return items.map(item => `${item.quantity || 1}x ${item.name}`).join(', ');
  };
  
  // Ensure a value is a number before using toFixed
  const formatPrice = (price) => {
    try {
      if (price === null || price === undefined) return '0.00';
      if (typeof price === 'string') {
        const cleaned = price.replace(/[^\d.]/g, '');
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? '0.00' : parsed.toFixed(2);
      }
      if (typeof price === 'number' && !isNaN(price)) return price.toFixed(2);
      return '0.00';
    } catch (e) {
      console.error('Error formatting price:', e, price);
      return '0.00';
    }
  };
  
  // Handle view details
  const viewOrderDetails = (orderId) => {
    navigate(`/orders/${orderId}`);
  };
  
  const filteredOrders = getFilteredOrders();
  
  return (
    <div className="orders-page">
      <div className="container py-5">
        <div className="page-header mb-3">
          <h1>Your Orders</h1>
        </div>
        
        {/* Tab navigation */}
        <div className="orders-tabs-container">
          <div className="orders-tabs">
            <button
              className={`tab-item ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All
            </button>
            <button
              className={`tab-item ${activeTab === 'active' ? 'active' : ''}`}
              onClick={() => setActiveTab('active')}
            >
              Active
            </button>
            <button
              className={`tab-item ${activeTab === 'past' ? 'active' : ''}`}
              onClick={() => setActiveTab('past')}
            >
              Past
            </button>
          </div>
          
          <button 
            className="refresh-btn"
            onClick={fetchOrders}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise"></i>
            Refresh
          </button>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="error-alert">
            <i className="bi bi-exclamation-triangle"></i>
            {error}
          </div>
        )}
        
        {/* Loading state */}
        {loading ? (
          <div className="loading-container">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <i className="bi bi-receipt"></i>
            </div>
            <h3>No orders found</h3>
            <p>You have no {activeTab !== 'all' ? activeTab : ''} orders yet.</p>
            <Link to="/restaurants" className="btn-primary">
              Browse Restaurants
            </Link>
          </div>
        ) : (
          <div className="orders-grid">
            {filteredOrders.map(order => (
              <div key={order.id} className="order-item">
                <div className="order-header">
                  <div className="order-meta">
                    <div className="order-id">#{order.id}</div>
                    <div className="order-date">{formatDate(order.created_at)}</div>
                  </div>
                  <span className={`order-status status-${getStatusClass(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="order-content">
                  <div className="restaurant-info">
                    <div className="restaurant-image">
                      {order.restaurant_image ? (
                        <img 
                          src={order.restaurant_image} 
                          alt={order.restaurant_name || 'Restaurant'}
                        />
                      ) : (
                        <div className="placeholder-icon">
                          <i className="bi bi-building"></i>
                        </div>
                      )}
                    </div>
                    <div className="restaurant-details">
                      <h5 className="restaurant-name">{order.restaurant_name || 'Restaurant'}</h5>
                      {formatOrderItems(order.items) && (
                        <p className="order-items">
                          {formatOrderItems(order.items)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="order-total">
                    <div className="label">Total</div>
                    <div className="amount">${formatPrice(order.total_price)}</div>
                  </div>
                </div>
                
                <div className="order-actions">
                  {order.status !== 'Cancelled' && (
                    <button 
                      className="btn-primary"
                      onClick={() => viewOrderDetails(order.id)}
                    >
                      View Details
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Embedded CSS */}
      <style>{`
        .orders-page {
          background-color: #1A1A1A;
          color: #FFFFFF;
          padding-top: 2px;
          min-height: 100vh;
        }
        
        .page-header h1 {
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        
        .container {
          padding-top: 0;
        }
        
        .orders-tabs-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #333;
          margin-bottom: 1.5rem;
        }
        
        .orders-tabs {
          display: flex;
        }
        
        .tab-item {
          background: transparent;
          border: none;
          color: #9CA3AF;
          padding: 1rem 1.5rem;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.3s ease;
          position: relative;
        }
        
        .tab-item.active {
          color: white;
          font-weight: 500;
        }
        
        .tab-item.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 3px;
          background-color: #06C167;
          border-radius: 3px 3px 0 0;
        }
        
        .tab-item:hover:not(.active) {
          color: white;
        }
        
        .refresh-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background-color: transparent;
          border: 1px solid #06C167;
          color: #06C167;
          border-radius: 2rem;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .refresh-btn:hover {
          background-color: rgba(6, 193, 103, 0.1);
          transform: translateY(-1px);
        }
        
        .refresh-btn:active {
          transform: translateY(0);
        }
        
        .refresh-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .loading-container {
          display: flex;
          justify-content: center;
          padding: 4rem 0;
        }
        
        .error-alert {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background-color: rgba(220, 38, 38, 0.1);
          color: #f87171;
          padding: 1rem;
          border-radius: 0.5rem;
          border: 1px solid rgba(220, 38, 38, 0.2);
          margin-bottom: 1.5rem;
        }
        
        .empty-state {
          background-color: #121212;
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
          margin-bottom: 1.5rem;
          max-width: 300px;
        }
        
        .orders-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        
        .order-item {
          background-color: #121212;
          border-radius: 1rem;
          border: 1px solid #333;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .order-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        }
        
        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          background-color: rgba(0, 0, 0, 0.2);
          border-bottom: 1px solid #333;
        }
        
        .order-meta {
          display: flex;
          flex-direction: column;
        }
        
        .order-id {
          font-size: 0.875rem;
          font-weight: 500;
        }
        
        .order-date {
          font-size: 0.75rem;
          color: #9CA3AF;
          margin-top: 0.25rem;
        }
        
        .order-status {
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
        
        .order-content {
          padding: 1.5rem;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 1rem;
          align-items: center;
        }
        
        .restaurant-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .restaurant-image {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
        }
        
        .restaurant-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .placeholder-icon {
          width: 100%;
          height: 100%;
          background-color: #333;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9CA3AF;
        }
        
        .restaurant-details {
          display: flex;
          flex-direction: column;
        }
        
        .restaurant-name {
          font-weight: 600;
          margin-bottom: 0.25rem;
          font-size: 1rem;
        }
        
        .order-items {
          color: #9CA3AF;
          font-size: 0.875rem;
          margin: 0;
        }
        
        .order-total {
          text-align: right;
        }
        
        .order-total .label {
          color: #9CA3AF;
          font-size: 0.75rem;
          margin-bottom: 0.25rem;
        }
        
        .order-total .amount {
          font-weight: 700;
          font-size: 1.25rem;
        }
        
        .order-actions {
          padding: 0 1.5rem 1.5rem;
          display: flex;
          gap: 0.75rem;
        }
        
        .btn-primary {
          background-color: #06C167;
          color: white;
          border: none;
          border-radius: 2rem;
          padding: 0.5rem 1.25rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.875rem;
          text-decoration: none;
          display: inline-block;
        }
        
        .btn-primary:hover {
          background-color: #059956;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(6, 193, 103, 0.3);
        }
        
        @media (min-width: 768px) {
          .orders-grid {
            grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          }
        }
        
        @media (max-width: 576px) {
          .orders-tabs-container {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          
          .orders-tabs {
            width: 100%;
            overflow-x: auto;
          }
          
          .refresh-btn {
            align-self: flex-end;
          }
          
          .order-content {
            grid-template-columns: 1fr;
          }
          
          .order-total {
            text-align: left;
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 0.5rem;
          }
          
          .order-actions {
            flex-direction: column;
          }
          
          .btn-primary {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default CustomerOrders;