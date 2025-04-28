import {
  FETCH_RESTAURANTS_SUCCESS,
  FETCH_RESTAURANTS_FAILURE,
  FETCH_RESTAURANT_DETAILS_SUCCESS,
  FETCH_RESTAURANT_DETAILS_FAILURE,
  UPDATE_RESTAURANT_PROFILE,
  FETCH_RESTAURANT_DISHES_SUCCESS,
  FETCH_RESTAURANT_DISHES_FAILURE,
  ADD_DISH_SUCCESS,
  ADD_DISH_FAILURE,
  UPDATE_DISH_SUCCESS,
  UPDATE_DISH_FAILURE
} from '../types';
import axios from 'axios';

// Fetch all restaurants
export const fetchRestaurants = () => async (dispatch) => {
  try {
    const res = await axios.get('/api/restaurants');
    
    dispatch({
      type: FETCH_RESTAURANTS_SUCCESS,
      payload: res.data
    });
    
    return res.data;
  } catch (err) {
    dispatch({
      type: FETCH_RESTAURANTS_FAILURE,
      payload: err.response.data.message
    });
    
    throw err;
  }
};

// Fetch restaurant details
export const fetchRestaurantDetails = (id) => async (dispatch) => {
  try {
    const res = await axios.get(`/api/restaurant/${id}`);
    
    dispatch({
      type: FETCH_RESTAURANT_DETAILS_SUCCESS,
      payload: res.data
    });
    
    return res.data;
  } catch (err) {
    dispatch({
      type: FETCH_RESTAURANT_DETAILS_FAILURE,
      payload: err.response.data.message
    });
    
    throw err;
  }
};

// Update restaurant profile
export const updateRestaurantProfile = (profileData) => async (dispatch) => {
  try {
    const res = await axios.put('/api/restaurant/profile', profileData);
    
    dispatch({
      type: UPDATE_RESTAURANT_PROFILE,
      payload: res.data
    });
    
    return res.data;
  } catch (err) {
    throw err;
  }
};

// Fetch restaurant dishes
export const fetchRestaurantDishes = () => async (dispatch) => {
  try {
    const res = await axios.get('/api/restaurant/dishes');
    
    dispatch({
      type: FETCH_RESTAURANT_DISHES_SUCCESS,
      payload: res.data
    });
    
    return res.data;
  } catch (err) {
    dispatch({
      type: FETCH_RESTAURANT_DISHES_FAILURE,
      payload: err.response.data.message
    });
    
    throw err;
  }
};

// Add dish
export const addDish = (dishData) => async (dispatch) => {
  try {
    const res = await axios.post('/api/restaurant/dishes', dishData);
    
    dispatch({
      type: ADD_DISH_SUCCESS,
      payload: res.data
    });
    
    return res.data;
  } catch (err) {
    dispatch({
      type: ADD_DISH_FAILURE,
      payload: err.response.data.message
    });
    
    throw err;
  }
};

// Update dish
export const updateDish = (dishId, dishData) => async (dispatch) => {
  try {
    const res = await axios.put(`/api/restaurant/dishes/${dishId}`, dishData);
    
    dispatch({
      type: UPDATE_DISH_SUCCESS,
      payload: res.data
    });
    
    return res.data;
  } catch (err) {
    dispatch({
      type: UPDATE_DISH_FAILURE,
      payload: err.response.data.message
    });
    
    throw err;
  }
};
