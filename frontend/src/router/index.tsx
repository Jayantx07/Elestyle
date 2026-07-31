import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import NotFound from '@/pages/NotFound';
import Home from '@/pages/Home';
import ProductPage from '@/pages/ProductPage';
import CartPage from '@/pages/CartPage';
import ProfilePage from '@/pages/ProfilePage';
import WishlistPage from '@/pages/WishlistPage';

import CategoryPage from '@/pages/CategoryPage';
import SearchPage from '@/pages/SearchPage';
import AboutPage from '@/pages/AboutPage';
import CheckoutPage from '@/pages/CheckoutPage';

// Auth Imports
import ProtectedRoute from '@/components/common/ProtectedRoute';
import LoginPage from '@/pages/auth/LoginPage';
import SignupPage from '@/pages/auth/SignupPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import VerifyEmailPage from '@/pages/auth/VerifyEmailPage';

// Admin Imports
import AdminRouteGuard from '@/admin/components/layout/AdminRouteGuard';
import AdminLayout from '@/admin/components/layout/AdminLayout';
import DashboardPage from '@/admin/pages/DashboardPage';
import ProductsPage from '@/admin/pages/ProductsPage';
import ProductFormPage from '@/admin/pages/ProductFormPage';
import CategoriesPage from '@/admin/pages/CategoriesPage';
import CategoryFormPage from '@/admin/pages/CategoryFormPage';
import OrdersPage from '@/admin/pages/OrdersPage';
import OrderDetailsPage from '@/admin/pages/OrderDetailsPage';
import CustomersPage from '@/admin/pages/CustomersPage';
import CustomerDetailsPage from '@/admin/pages/CustomerDetailsPage';
import ReviewsPage from '@/admin/pages/ReviewsPage';
import InventoryPage from '@/admin/pages/InventoryPage';
import CouponsPage from '@/admin/pages/CouponsPage';
import CouponFormPage from '@/admin/pages/CouponFormPage';
import AnalyticsPage from '@/admin/pages/AnalyticsPage';
import SettingsPage from '@/admin/pages/SettingsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'shop/:categorySlug',
        element: <CategoryPage />,
      },
      {
        path: 'product/:id',
        element: <ProductPage />,
      },
      {
        path: 'cart',
        element: <CartPage />,
      },
      {
        path: 'wishlist',
        element: <WishlistPage />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'profile',
            element: <ProfilePage />,
          },
          {
            path: 'checkout',
            element: <CheckoutPage />,
          },
        ],
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'signup',
        element: <SignupPage />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />,
      },
      {
        path: 'reset-password',
        element: <ResetPasswordPage />,
      },
      {
        path: 'verify-email',
        element: <VerifyEmailPage />,
      },
      {
        path: 'search',
        element: <SearchPage />,
      },
      {
        path: 'about',
        element: <AboutPage />,
      },
      // Additional routes will be added here
    ],
  },
  {
    path: '/admin',
    element: <AdminRouteGuard />,
    errorElement: <NotFound />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: 'dashboard',
            element: <DashboardPage />,
          },
          {
            path: 'products',
            element: <ProductsPage />,
          },
          {
            path: 'products/:id',
            element: <ProductFormPage />,
          },
          {
            path: 'categories',
            element: <CategoriesPage />,
          },
          {
            path: 'categories/:id',
            element: <CategoryFormPage />,
          },
          {
            path: 'orders',
            element: <OrdersPage />,
          },
          {
            path: 'orders/:id',
            element: <OrderDetailsPage />,
          },
          {
            path: 'customers',
            element: <CustomersPage />,
          },
          {
            path: 'customers/:id',
            element: <CustomerDetailsPage />,
          },
          {
            path: 'reviews',
            element: <ReviewsPage />,
          },
          {
            path: 'inventory',
            element: <InventoryPage />,
          },
          {
            path: 'coupons',
            element: <CouponsPage />,
          },
          {
            path: 'coupons/:id',
            element: <CouponFormPage />,
          },
          {
            path: 'analytics',
            element: <AnalyticsPage />,
          },
          {
            path: 'settings',
            element: <SettingsPage />,
          },
          // Additional admin modules will be added here
        ],
      },
    ],
  },
]);
