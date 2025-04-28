import {
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  REGISTER_SUCCESS,
  REGISTER_FAIL
} from '../types';
import axios from 'axios';

// Login user
export const login = (email, password) => async (dispatch) => {
  try {
    const res = await axios.post('/api/auth/login', { email, password });
    
    dispatch({
      type: LOGIN_SUCCESS,
      payload: {
        token: res.data.token,
        user: res.data.user
      }
    });
    
    return res.data;
  } catch (err) {
    dispatch({
      type: LOGIN_FAIL,
      payload: err.response.data.message
    });
    
    throw err;
  }
};

// Register user
export const register = (userData) => async (dispatch) => {
  try {
    const res = await axios.post('/api/auth/register', userData);
    
    dispatch({
      type: REGISTER_SUCCESS,
      payload: {
        token: res.data.token,
        user: res.data.user
      }
    });
    
    return res.data;
  } catch (err) {
    dispatch({
      type: REGISTER_FAIL,
      payload: err.response.data.message
    });
    
    throw err;
  }
};

// Logout user
export const logout = () => (dispatch) => {
  dispatch({ type: LOGOUT });
};
