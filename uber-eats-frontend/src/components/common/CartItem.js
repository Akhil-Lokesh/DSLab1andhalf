import React from 'react';
import { useCart } from '../../contexts/CartContext';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  
  // Handle quantity change
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1) {
      updateQuantity(item.id, newQuantity);
    }
  };
  
  // Handle remove
  const handleRemove = () => {
    removeFromCart(item.id);
  };
  
  // Calculate total for this item
  const itemTotal = item.price * item.quantity;
  
  return (
    <div className="cart-item">
      <div className="item-details">
        <div className="item-quantity">
          <button 
            className="quantity-btn"
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={item.quantity <= 1}
          >
            <i className="bi bi-dash"></i>
          </button>
          <span className="quantity-display">{item.quantity}</span>
          <button 
            className="quantity-btn"
            onClick={() => handleQuantityChange(item.quantity + 1)}
          >
            <i className="bi bi-plus"></i>
          </button>
        </div>
        
        <div className="item-info">
          <h4 className="item-name">{item.name}</h4>
          <p className="item-price">${item.price.toFixed(2)}</p>
          {item.modifications && item.modifications.length > 0 && (
            <p className="item-options">
              {item.modifications.join(', ')}
            </p>
          )}
        </div>
      </div>
      
      <div className="item-actions">
        <span className="item-total">${itemTotal.toFixed(2)}</span>
        <button 
          className="remove-btn"
          onClick={handleRemove}
          aria-label="Remove item"
        >
          <i className="bi bi-x"></i>
        </button>
      </div>
      
      <style>{`
        .cart-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #333;
        }
        
        .cart-item:last-child {
          border-bottom: none;
        }
        
        .item-details {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .item-quantity {
          display: flex;
          align-items: center;
          background-color: #1a1a1a;
          border-radius: 2rem;
          border: 1px solid #333;
          overflow: hidden;
          min-width: 100px;
        }
        
        .quantity-btn {
          border: none;
          background: transparent;
          color: #9CA3AF;
          padding: 0.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.875rem;
        }
        
        .quantity-btn:hover:not(:disabled) {
          color: white;
        }
        
        .quantity-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .quantity-display {
          flex: 1;
          text-align: center;
          font-weight: 500;
          padding: 0 0.5rem;
        }
        
        .item-info {
          flex: 1;
        }
        
        .item-name {
          font-size: 1rem;
          font-weight: 500;
          margin: 0 0 0.25rem;
        }
        
        .item-price {
          font-size: 0.875rem;
          color: #9CA3AF;
          margin: 0 0 0.25rem;
        }
        
        .item-options {
          font-size: 0.75rem;
          color: #9CA3AF;
          margin: 0;
        }
        
        .item-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .item-total {
          font-weight: 600;
          white-space: nowrap;
        }
        
        .remove-btn {
          background: none;
          border: none;
          color: #9CA3AF;
          cursor: pointer;
          font-size: 1.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.25rem;
          transition: all 0.2s ease;
        }
        
        .remove-btn:hover {
          color: #f87171;
        }
        
        @media (max-width: 576px) {
          .cart-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          
          .item-actions {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
};

export default CartItem;