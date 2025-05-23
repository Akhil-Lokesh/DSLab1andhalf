import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './index.css';
import './App.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import App from './App';

// After all imports, you can set axios configuration
axios.defaults.withCredentials = true;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
