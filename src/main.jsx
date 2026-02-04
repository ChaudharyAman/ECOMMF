import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { store } from './app/store'
import './index.css'
import Layout from './layouts/Layout'
import Auth from './pages/Auth'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'
import VendorDashboard from './pages/VendorDashboard'

import Categories from './pages/Categories'
import CategoryProducts from './pages/CategoryProducts'
import Products from './pages/Products'
import CategoryManagement from './pages/CategoryManagement'

import App from './App'
import ProductDetails from './pages/ProductDetails'
import AdminRoute from './components/AdminRoute'
import ProductModeration from './pages/ProductModeration'
import VendorManagement from './pages/VendorManagement'
import ErrorPage from './pages/ErrorPage'

import Home from './pages/Home'
import SearchResults from './pages/SearchResults'

import Cart from './pages/Cart'
import Wishlist from './pages/Wishlist'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'cart',
        element: <Cart />,
      },
      {
        path: 'wishlist',
        element: <Wishlist />,
      },
      {
        path: 'product/:id',
        element: <ProductDetails />,
      },
      {
        path: 'login',
        element: <Auth />,
      },
      {
        path: 'register',
        element: <Auth />,
      },
      {
        path: 'profile',
        element: <Profile />,
      },
      {
        path: 'admin',
        element: <AdminRoute />,
        children: [
            {
                index: true,
                element: <AdminDashboard />
            },
            {
                path: 'moderation',
                element: <ProductModeration />
            },
            {
                path: 'vendors',
                element: <VendorManagement />
            },
            {
                path: 'categories',
                element: <CategoryManagement />
            }
        ]
      },
      {
        path: 'vendor',
        element: <VendorDashboard />,
      },
      {
        path: 'categories',
        element: <Categories />,
      },
      {
        path: 'category/:id',
        element: <CategoryProducts />,
      },
      {
        path: 'products',
        element: <Products />,
      },
      {
        path: 'search',
        element: <SearchResults />,
      },
    ],
  },
])


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <Toaster position="top-right" />
      <App router={router} />
    </Provider>
  </React.StrictMode>,
)
