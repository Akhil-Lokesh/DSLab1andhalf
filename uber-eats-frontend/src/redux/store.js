import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk'; // This is the correct import for redux-thunk v2.4.2
import authReducer from './reducers/authReducer';
import restaurantReducer from './reducers/restaurantReducer';
import orderReducer from './reducers/orderReducer';

const rootReducer = combineReducers({
  auth: authReducer,
  restaurant: restaurantReducer,
  order: orderReducer
});

const store = createStore(rootReducer, applyMiddleware(thunk));

export default store;
