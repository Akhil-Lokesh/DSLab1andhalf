import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import CartItem from '../components/common/CartItem';

const Cart = () => {
  const { cart, getCartTotal, checkout } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Get user's saved address if available
  useEffect(() => {
    if (currentUser && currentUser.address) {
      setDeliveryAddress(currentUser.address);
    }
  }, [currentUser]);
  
  const handleCheckout = async (e) => {
    e.preventDefault();
    
    if (!deliveryAddress.trim()) {
      setError('Please enter a delivery address');
      return;
    }
    
    setCheckoutLoading(true);
    setError(null);
    
    try {
      // Only send address and payment method type, not card details
      const result = await checkout(deliveryAddress, paymentMethod);
      
      if (result.success) {
        // Check if we got a valid order ID
        if (result.orderId) {
          // Redirect to order confirmation
          navigate(`/orders/${result.orderId}`);
        } else {
          // If order was successful but no ID was returned, go to orders page
          console.warn('Order placed successfully but no order ID was returned');
          navigate('/orders');
        }
      } else {
        setError(result.error || 'An error occurred during checkout');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError('An unexpected error occurred. Your order may have been placed, but we had trouble processing the confirmation.');
      // After a short delay, redirect to orders page since order might have been created
      setTimeout(() => {
        navigate('/orders');
      }, 3000);
    } finally {
      setCheckoutLoading(false);
    }
  };
  
  // Calculate cart values
  const subtotal = getCartTotal();
  const deliveryFee = subtotal > 0 ? 2.99 : 0;
  const tax = subtotal * 0.0875; // 8.75% tax rate
  const total = subtotal + deliveryFee + tax;
  
  // Format price with two decimal places
  const formatPrice = (price) => {
    return price.toFixed(2);
  };

  return (
    <div className="cart-page">
      <div className="container py-5">
        <h1 className="page-title">Your Cart</h1>
        
        {/* Error message */}
        {error && (
          <div className="error-alert">
            <i className="bi bi-exclamation-triangle"></i>
            {error}
          </div>
        )}
        
        {cart.items.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-icon">
              <i className="bi bi-cart"></i>
        </div>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added any items to your cart yet.</p>
            <Link to="/restaurants" className="btn-primary">
            Browse Restaurants
          </Link>
        </div>
      ) : (
        <div className="row">
          <div className="col-lg-8 mb-4 mb-lg-0">
              <div className="cart-items-container">
                <div className="restaurant-info">
                  <h2>Order from</h2>
                  <Link to={`/restaurants/${cart.restaurantId}`} className="restaurant-link">
                    <span>Restaurant #{cart.restaurantId}</span>
                    <i className="bi bi-arrow-right"></i>
                  </Link>
              </div>
              
                <div className="cart-items">
                {cart.items.map((item) => (
                    <CartItem key={item.id} item={item} />
                ))}
              </div>
              </div>
            </div>
            
          <div className="col-lg-4">
              <div className="checkout-container">
                <h2>Order Summary</h2>
                
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>${formatPrice(subtotal)}</span>
                </div>
                
                <div className="summary-row">
                  <span>Delivery Fee</span>
                  <span>${formatPrice(deliveryFee)}</span>
                </div>
                
                <div className="summary-row">
                  <span>Tax</span>
                  <span>${formatPrice(tax)}</span>
                </div>
                
                <div className="summary-total">
                  <span>Total</span>
                  <span>${formatPrice(total)}</span>
                </div>
                
                <form onSubmit={handleCheckout}>
                  <div className="mb-3">
                    <label htmlFor="deliveryAddress" className="form-label">Delivery Address</label>
                    <textarea
                      id="deliveryAddress"
                      className="form-control"
                      rows="2"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Enter your delivery address"
                      required
                    ></textarea>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Payment Method</label>
                    <div className="payment-options">
                      <div 
                        className={`payment-option ${paymentMethod === 'card' ? 'active' : ''}`}
                        onClick={() => setPaymentMethod('card')}
                      >
                        <div className="payment-option-radio">
                          <div className={`radio-inner ${paymentMethod === 'card' ? 'active' : ''}`}></div>
                        </div>
                        <div className="payment-option-content">
                          <i className="bi bi-credit-card"></i>
                          <span>Credit Card</span>
                        </div>
                      </div>
                      
                      <div 
                        className={`payment-option ${paymentMethod === 'cod' ? 'active' : ''}`}
                        onClick={() => setPaymentMethod('cod')}
                      >
                        <div className="payment-option-radio">
                          <div className={`radio-inner ${paymentMethod === 'cod' ? 'active' : ''}`}></div>
                        </div>
                        <div className="payment-option-content">
                          <i className="bi bi-cash"></i>
                          <span>Cash on Delivery</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {paymentMethod === 'card' && (
                    <div className="card-details mb-3">
                      <div className="mb-2">
                        <label htmlFor="cardNumber" className="form-label">Card Number</label>
                        <input 
                          type="text" 
                          id="cardNumber"
                          className="form-control"
                          placeholder="1234 5678 9012 3456"
                          required={paymentMethod === 'card'}
                        />
                      </div>
                      
                      <div className="row">
                        <div className="col-6 mb-2">
                          <label htmlFor="expiryDate" className="form-label">Expiry Date</label>
                          <input 
                            type="text" 
                            id="expiryDate"
                            className="form-control"
                            placeholder="MM/YY"
                            required={paymentMethod === 'card'}
                          />
                        </div>
                        
                        <div className="col-6 mb-2">
                          <label htmlFor="cvv" className="form-label">CVV</label>
                          <input 
                            type="text" 
                            id="cvv"
                            className="form-control"
                            placeholder="123"
                            required={paymentMethod === 'card'}
                          />
                        </div>
                      </div>
                  </div>
                )}
                  
                  <button 
                    type="submit" 
                    className="checkout-btn"
                    disabled={checkoutLoading || cart.items.length === 0}
                  >
                    {checkoutLoading ? 'Processing...' : 'Place Order'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
        </div>
      
      <style>{`
        .cart-page {
          background-color: #1A1A1A;
          color: #FFFFFF;
          padding-top: 2px;
          min-height: 100vh;
        }
        
        .page-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 2rem;
          padding: 2rem 1rem 0;
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
        
        .empty-cart {
          background-color: #121212;
          border: 1px solid #333;
          border-radius: 1rem;
          padding: 3rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .empty-cart-icon {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background-color: #1E1E1E;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
        }
        
        .empty-cart-icon i {
          font-size: 1.5rem;
          color: #9CA3AF;
        }
        
        .empty-cart h2 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }
        
        .empty-cart p {
          color: #9CA3AF;
          margin-bottom: 1.5rem;
          max-width: 300px;
        }
        
        .btn-primary {
          background-color: #06C167;
          color: white;
          border: none;
          border-radius: 2rem;
          padding: 0.5rem 1.5rem;
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
        
        .cart-items-container {
          background-color: #121212;
          border: 1px solid #333;
          border-radius: 1rem;
          overflow: hidden;
        }
        
        .restaurant-info {
          padding: 1.5rem;
          border-bottom: 1px solid #333;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .restaurant-info h2 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0;
        }
        
        .restaurant-link {
          color: #06C167;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          transition: all 0.3s ease;
        }
        
        .restaurant-link:hover {
          text-decoration: underline;
        }
        
        .cart-items {
          padding: 1rem 0;
        }
        
        .checkout-container {
          background-color: #121212;
          border: 1px solid #333;
          border-radius: 1rem;
          padding: 1.5rem;
          position: sticky;
          top: 2rem;
        }
        
        .checkout-container h2 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
        }
        
        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.75rem;
          font-size: 0.875rem;
          color: #9CA3AF;
        }
        
        .summary-total {
          display: flex;
          justify-content: space-between;
          margin: 1.5rem 0;
          font-weight: 700;
          font-size: 1.125rem;
        }
        
        .form-label {
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
          color: #9CA3AF;
        }
        
        .form-control {
          background-color: #1A1A1A;
          border: 1px solid #333;
          color: white;
          border-radius: 0.5rem;
          padding: 0.75rem;
          font-size: 0.875rem;
          transition: all 0.3s ease;
        }
        
        .form-control:focus {
          border-color: #06C167;
          box-shadow: 0 0 0 2px rgba(6, 193, 103, 0.2);
          outline: none;
        }
        
        .payment-options {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .payment-option {
          display: flex;
          align-items: center;
          background-color: #1A1A1A;
          border: 1px solid #333;
          border-radius: 0.5rem;
          padding: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .payment-option.active {
          border-color: #06C167;
          background-color: rgba(6, 193, 103, 0.05);
        }
        
        .payment-option-radio {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid #666;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 0.75rem;
        }
        
        .payment-option.active .payment-option-radio {
          border-color: #06C167;
        }
        
        .radio-inner {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: transparent;
        }
        
        .radio-inner.active {
          background-color: #06C167;
        }
        
        .payment-option-content {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .payment-option-content i {
          font-size: 1.25rem;
          color: #9CA3AF;
        }
        
        .payment-option.active .payment-option-content i {
          color: #06C167;
        }
        
        .card-details {
          background-color: #1A1A1A;
          border: 1px solid #333;
          border-radius: 0.5rem;
          padding: 1rem;
        }
        
        .checkout-btn {
          width: 100%;
          background-color: #06C167;
          color: white;
          border: none;
          border-radius: 2rem;
          padding: 0.75rem;
          font-weight: 500;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 1rem;
        }
        
        .checkout-btn:hover:not(:disabled) {
          background-color: #059956;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(6, 193, 103, 0.3);
        }
        
        .checkout-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default Cart;
