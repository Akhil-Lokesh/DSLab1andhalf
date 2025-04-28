import API from './config';

// Customer profile
export const getCustomerProfile = () => {
  return API.get('/customer/profile');
};

export const updateCustomerProfile = (profileData) => {
  return API.put('/customer/profile', profileData);
};

export const updateProfilePicture = (formData) => {
  return API.post('/customer/profile/picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Favorites
export const getFavoriteRestaurants = () => API.get('/customer/favorites');
export const addFavoriteRestaurant = (id) => API.post(`/customer/favorites/${id}`);
export const removeFavoriteRestaurant = (id) => API.delete(`/customer/favorites/${id}`);

export const checkIsFavorite = (restaurantId) => {
  return API.get(`/customer/favorites/${restaurantId}/check`);
};

// Orders
export const getCustomerOrders = () => {
  return API.get('/customer/orders');
};

export const placeOrder = (orderData) => {
  // Ensure restaurantId is properly handled for MongoDB's ObjectId
  const formattedOrderData = {
    ...orderData,
    // Convert the numeric ID to string if needed
    restaurantId: orderData.restaurantId && orderData.restaurantId.toString()
  };
  
  return API.post('/customer/orders', formattedOrderData);
};