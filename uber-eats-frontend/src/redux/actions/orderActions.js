import {
  ORDER_CREATED,
  ORDER_UPDATED,
  FETCH_ORDERS_SUCCESS,
  FETCH_ORDERS_FAILURE,
  FETCH_ORDER_DETAILS_SUCCESS,
  FETCH_ORDER_DETAILS_FAILURE
} from '../types';
import axios from 'axios';

// Create a new order
export const createOrder = (orderData) => async (dispatch) => {
  try {
    const res = await axios.post('/api/orders', orderData);
    
    dispatch({
      type: ORDER_CREATED,
      payload: res.data
    });
    
    return res.data;
  } catch (err) {
    throw err;
  }
};

// Fetch customer orders
export const fetchCustomerOrders = () => async (dispatch) => {
  try {
    const res = await axios.get('/api/customer/orders');
    
    dispatch({
      type: FETCH_ORDERS_SUCCESS,
      payload: res.data
    });
    
    return res.data;
  } catch (err) {
    dispatch({
      type: FETCH_ORDERS_FAILURE,
      payload: err.response.data.message
    });
    
    throw err;
  }
};

// Fetch restaurant orders
export const fetchRestaurantOrders = () => async (dispatch) => {
  try {
    const res = await axios.get('/api/restaurant/orders');
    
    dispatch({
      type: FETCH_ORDERS_SUCCESS,
      payload: res.data
    });
    
    return res.data;
  } catch (err) {
    dispatch({
      type: FETCH_ORDERS_FAILURE,
      payload: err.response.data.message
    });
    
    throw err;
  }
};

// Fetch order details
export const fetchOrderDetails = (orderId) => async (dispatch) => {
  try {
    const res = await axios.get(`/api/orders/${orderId}`);
    
    dispatch({
      type: FETCH_ORDER_DETAILS_SUCCESS,
      payload: res.data
    });
    
    return res.data;
  } catch (err) {
    dispatch({
      type: FETCH_ORDER_DETAILS_FAILURE,
      payload: err.response.data.message
    });
    
    throw err;
  }
};

// Update order status (for restaurant)
export const updateOrderStatus = (orderId, status) => async (dispatch) => {
  try {
    const res = await axios.put(`/api/restaurant/orders/${orderId}/status`, { status });
    
    dispatch({
      type: ORDER_UPDATED,
      payload: res.data
    });
    
    return res.data;
  } catch (err) {
    throw err;
  }
};
