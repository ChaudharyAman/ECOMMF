import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { store } from './app/store'

// Disable browser scroll restoration so React Router handles it
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
import './index.css'
import Layout from './layouts/Layout'
import App from './App'
import AdminRoute from './components/AdminRoute'
import ErrorPage from './pages/ErrorPage'
import Home from './pages/Home' // Keep Home static for instant load
import Auth from './pages/Auth' // Keep Auth static for fast login

import { RootSkeleton, PageSkeleton, DetailSkeleton } from './components/Skeletons'

// Lazy loaded pages
const Profile = lazy(() => import('./pages/Profile'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const VendorDashboard = lazy(() => import('./pages/VendorDashboard'))
const Categories = lazy(() => import('./pages/Categories'))
const CategoryProducts = lazy(() => import('./pages/CategoryProducts'))
const Products = lazy(() => import('./pages/Products'))
const CategoryManagement = lazy(() => import('./pages/CategoryManagement'))
const ProductDetails = lazy(() => import('./pages/ProductDetails'))
const ProductModeration = lazy(() => import('./pages/ProductModeration'))
const VendorManagement = lazy(() => import('./pages/VendorManagement'))
const SearchResults = lazy(() => import('./pages/SearchResults'))
const About = lazy(() => import('./pages/About'))
const Cart = lazy(() => import('./pages/Cart'))
const Wishlist = lazy(() => import('./pages/Wishlist'))
const ProductReviews = lazy(() => import('./pages/ProductReviews'))
const AdminUsers = lazy(() => import('./pages/AdminUsers'))

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
        element: <Suspense fallback={<PageSkeleton />}><Cart /></Suspense>,
      },
      {
        path: 'wishlist',
        element: <Suspense fallback={<PageSkeleton />}><Wishlist /></Suspense>,
      },
      {
        path: 'product/:id',
        element: <Suspense fallback={<DetailSkeleton />}><ProductDetails /></Suspense>,
      },
      {
        path: 'product/:id/reviews',
        element: <Suspense fallback={<PageSkeleton />}><ProductReviews /></Suspense>,
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
        element: <Suspense fallback={<PageSkeleton />}><Profile /></Suspense>,
      },
      {
        path: 'admin',
        element: <AdminRoute />,
        children: [
          {
            index: true,
            element: <Suspense fallback={<PageSkeleton />}><AdminDashboard /></Suspense>
          },
          {
            path: 'moderation',
            element: <Suspense fallback={<PageSkeleton />}><ProductModeration /></Suspense>
          },
          {
            path: 'vendors',
            element: <Suspense fallback={<PageSkeleton />}><VendorManagement /></Suspense>
          },
          {
            path: 'categories',
            element: <Suspense fallback={<PageSkeleton />}><CategoryManagement /></Suspense>
          },
          {
            path: 'users',
            element: <Suspense fallback={<PageSkeleton />}><AdminUsers /></Suspense>
          }
        ]
      },
      {
        path: 'vendor',
        element: <Suspense fallback={<PageSkeleton />}><VendorDashboard /></Suspense>,
      },
      {
        path: 'categories',
        element: <Suspense fallback={<PageSkeleton />}><Categories /></Suspense>,
      },
      {
        path: 'category/:id',
        element: <Suspense fallback={<PageSkeleton />}><CategoryProducts /></Suspense>,
      },
      {
        path: 'products',
        element: <Suspense fallback={<PageSkeleton />}><Products /></Suspense>,
      },
      {
        path: 'search',
        element: <Suspense fallback={<PageSkeleton />}><SearchResults /></Suspense>,
      },
      {
        path: 'about',
        element: <Suspense fallback={<PageSkeleton />}><About /></Suspense>,
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
