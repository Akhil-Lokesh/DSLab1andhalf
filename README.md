# UberEats Clone Project

A full-stack food delivery application inspired by Uber Eats, featuring both customer and restaurant interfaces with real-time order tracking.

## Overview

This application is a comprehensive food delivery platform that connects customers with restaurants. It provides a seamless experience for ordering food, tracking deliveries, and managing restaurant operations.

## Features

### Customer Features
- **User Authentication**: Secure login and registration for customers
- **Restaurant Browsing**: View available restaurants with search and filter options
- **Menu Exploration**: Browse restaurant menus with item details and customization options
- **Cart Management**: Add/remove items, adjust quantities, and view order summary
- **Checkout Process**: Multiple payment methods (Credit Card and Cash on Delivery)
- **Order Tracking**: Real-time updates on order status with visual progress indicators
- **Order History**: View past orders with details and ability to reorder
- **Favorites**: Save and manage favorite restaurants for quick access

### Restaurant Features
- **Restaurant Dashboard**: Overview of orders, sales, and performance metrics
- **Menu Management**: Add, edit, and delete menu items with categories and pricing
- **Order Management**: Receive, update status, and track customer orders
- **Profile Management**: Update restaurant information, hours, and settings

## Technology Stack

### Frontend
- **React**: JavaScript library for building the user interface
- **Redux**: State management for complex application data
- **Bootstrap**: Responsive design framework with custom styling
- **React Router**: Navigation and routing between pages
- **Axios**: API requests to the backend

### Backend
- **Node.js**: Runtime environment for the server
- **Express**: Web application framework
- **MongoDB**: NoSQL database for storing application data
- **Mongoose**: ODM for MongoDB schema modeling
- **JWT**: Authentication via JSON Web Tokens
- **Kafka** (optional): Message queue for handling order events

## Installation and Setup

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

### Frontend Setup
```bash
cd uber-eats-frontend
npm install
npm start
```
The frontend will be available at http://localhost:3000

### Backend Setup
```bash
cd UberEATS-Backend
npm install
npm start
```
The API server will run on http://localhost:5015

## Environment Configuration

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/ubereats
JWT_SECRET=your_jwt_secret
PORT=5015
```

## Known Issues
- Kafka connection is optional and may show warnings if not configured
- Live order tracking requires additional setup for real-time communication

## Future Improvements
- Driver/delivery partner interface
- Rating and review system
- Advanced search with location-based filtering
- Push notifications for order updates
- Analytics dashboard for restaurants

## Screenshots
*[Add screenshots of key application pages here]*

## License
MIT

## Acknowledgments
This project was built as a learning exercise and is not affiliated with Uber Eats.
