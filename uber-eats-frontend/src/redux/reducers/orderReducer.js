import { 
  ORDER_CREATED, 
  ORDER_UPDATED, 
  FETCH_ORDERS_SUCCESS, 
  FETCH_ORDERS_FAILURE, 
  FETCH_ORDER_DETAILS_SUCCESS, 
  FETCH_ORDER_DETAILS_FAILURE 
} from '../types';

const initialState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null
};

const orderReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case ORDER_CREATED:
      return {
        ...state,
        orders: [...state.orders, payload],
        currentOrder: payload,
        loading: false,
        error: null
      };
    case ORDER_UPDATED:
      return {
        ...state,
        orders: state.orders.map(order => 
          order.id === payload.id ? payload : order
        ),
        currentOrder: state.currentOrder && state.currentOrder.id === payload.id 
          ? payload 
          : state.currentOrder,
        loading: false,
        error: null
      };
    case FETCH_ORDERS_SUCCESS:
      return {
        ...state,
        orders: payload,
        loading: false,
        error: null
      };
    case FETCH_ORDERS_FAILURE:
      return {
        ...state,
        loading: false,
        error: payload
      };
    case FETCH_ORDER_DETAILS_SUCCESS:
      return {
        ...state,
        currentOrder: payload,
        loading: false,
        error: null
      };
    case FETCH_ORDER_DETAILS_FAILURE:
      return {
        ...state,
        currentOrder: null,
        loading: false,
        error: payload
      };
    default:
      return state;
  }
};

export default orderReducer;
