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

const initialState = {
  restaurants: [],
  currentRestaurant: null,
  dishes: [],
  loading: false,
  error: null
};

const restaurantReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case FETCH_RESTAURANTS_SUCCESS:
      return {
        ...state,
        restaurants: payload,
        loading: false,
        error: null
      };
    case FETCH_RESTAURANTS_FAILURE:
      return {
        ...state,
        loading: false,
        error: payload
      };
    case FETCH_RESTAURANT_DETAILS_SUCCESS:
      return {
        ...state,
        currentRestaurant: payload,
        loading: false,
        error: null
      };
    case FETCH_RESTAURANT_DETAILS_FAILURE:
      return {
        ...state,
        currentRestaurant: null,
        loading: false,
        error: payload
      };
    case UPDATE_RESTAURANT_PROFILE:
      return {
        ...state,
        currentRestaurant: payload,
        loading: false,
        error: null
      };
    case FETCH_RESTAURANT_DISHES_SUCCESS:
      return {
        ...state,
        dishes: payload,
        loading: false,
        error: null
      };
    case FETCH_RESTAURANT_DISHES_FAILURE:
      return {
        ...state,
        loading: false,
        error: payload
      };
    case ADD_DISH_SUCCESS:
      return {
        ...state,
        dishes: [...state.dishes, payload],
        loading: false,
        error: null
      };
    case ADD_DISH_FAILURE:
      return {
        ...state,
        loading: false,
        error: payload
      };
    case UPDATE_DISH_SUCCESS:
      return {
        ...state,
        dishes: state.dishes.map(dish => 
          dish.id === payload.id ? payload : dish
        ),
        loading: false,
        error: null
      };
    case UPDATE_DISH_FAILURE:
      return {
        ...state,
        loading: false,
        error: payload
      };
    default:
      return state;
  }
};

export default restaurantReducer;
