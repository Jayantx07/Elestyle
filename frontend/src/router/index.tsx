import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import NotFound from '@/pages/NotFound';
import Home from '@/pages/Home';
import ProductPage from '@/pages/ProductPage';
import CartPage from '@/pages/CartPage';
import ProfilePage from '@/pages/ProfilePage';
import WishlistPage from '@/pages/WishlistPage';
import CategoriesPage from '@/pages/CategoriesPage';

import CategoryPage from '@/pages/CategoryPage';
import SearchPage from '@/pages/SearchPage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import CheckoutPage from '@/pages/CheckoutPage';
import ShippingPage from '@/pages/ShippingPage';

// Account Dashboard Imports
import AccountLayout from '@/components/layout/AccountLayout';
import CustomerCouponsPage from '@/pages/account/CouponsPage';
import CustomerAddressesPage from '@/pages/account/AddressesPage';
import CustomerSettingsPage from '@/pages/account/SettingsPage';

// Auth Imports
import ProtectedRoute from '@/components/common/ProtectedRoute';
import LoginPage from '@/pages/auth/LoginPage';
import SignupPage from '@/pages/auth/SignupPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import VerifyEmailPage from '@/pages/auth/VerifyEmailPage';
import CustomerOrdersPage from '@/pages/OrdersPage';
import CustomerOrderDetailsPage from '@/pages/CustomerOrderDetailsPage';

// Admin Imports
import AdminRouteGuard from '@/admin/components/layout/AdminRouteGuard';
import AdminLayout from '@/admin/components/layout/AdminLayout';
import DashboardPage from '@/admin/pages/DashboardPage';
import ProductsPage from '@/admin/pages/ProductsPage';
import ProductFormPage from '@/admin/pages/ProductFormPage';
import AdminCategoriesPage from '@/admin/pages/CategoriesPage';
import CategoryFormPage from '@/admin/pages/CategoryFormPage';
import SubCategoriesPage from '@/admin/pages/SubCategoriesPage';
import SubCategoryFormPage from '@/admin/pages/SubCategoryFormPage';
import FiltersPage from '@/admin/pages/FiltersPage';
import FilterFormPage from '@/admin/pages/FilterFormPage';
import OrdersPage from '@/admin/pages/OrdersPage';
import OrderDetailsPage from '@/admin/pages/OrderDetailsPage';
import CustomersPage from '@/admin/pages/CustomersPage';
import CustomerDetailsPage from '@/admin/pages/CustomerDetailsPage';
import ReviewsPage from '@/admin/pages/ReviewsPage';
import InventoryPage from '@/admin/pages/InventoryPage';
import CouponsPage from '@/admin/pages/CouponsPage';
import CouponFormPage from '@/admin/pages/CouponFormPage';
import AnalyticsPage from '@/admin/pages/AnalyticsPage';
import LandingPage from '@/admin/pages/LandingPage';
import VideoHighlightsPage from '@/admin/pages/VideoHighlightsPage';
import FeatureHighlightsPage from '@/admin/pages/FeatureHighlightsPage';
import AboutFeatureHighlightsPage from '@/admin/pages/AboutFeatureHighlightsPage';
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
        path: 'category/:categorySlug',
        element: <CategoryPage />,
      },
      {
        path: 'category/:categorySlug/:subcategorySlug',
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
        path: 'categories',
        element: <CategoriesPage />,
      },
      // Redirects for old public routes
      {
        path: 'wishlist',
        element: <Navigate to="/account/wishlist" replace />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'account',
            element: <AccountLayout />,
            children: [
              { index: true, element: <Navigate to="profile" replace /> },
              { path: 'profile', element: <ProfilePage /> },
              { path: 'wishlist', element: <WishlistPage /> },
              { path: 'orders', element: <CustomerOrdersPage /> },
              { path: 'orders/:id', element: <CustomerOrderDetailsPage /> },
              { path: 'coupons', element: <CustomerCouponsPage /> },
              { path: 'addresses', element: <CustomerAddressesPage /> },
              { path: 'settings', element: <CustomerSettingsPage /> },
            ],
          },
          {
            path: 'checkout',
            element: <CheckoutPage />,
          },
          // Redirects for old protected routes
          {
            path: 'profile',
            element: <Navigate to="/account/profile" replace />,
          },
          {
            path: 'orders',
            element: <Navigate to="/account/orders" replace />,
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
      {
        path: 'contact',
        element: <ContactPage />,
      },
      {
        path: 'shipping',
        element: <ShippingPage />,
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
            element: <AdminCategoriesPage />,
          },
          {
            path: 'categories/:id',
            element: <CategoryFormPage />,
          },
          {
            path: 'subcategories',
            element: <SubCategoriesPage />,
          },
          {
            path: 'subcategories/:id',
            element: <SubCategoryFormPage />,
          },
          {
            path: 'filters',
            element: <FiltersPage />,
          },
          {
            path: 'filters/:id',
            element: <FilterFormPage />,
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
            path: 'landing-page',
            element: <LandingPage />,
          },
          {
            path: 'video-highlights',
            element: <VideoHighlightsPage />,
          },
          {
            path: 'feature-highlights',
            element: <FeatureHighlightsPage />,
          },
          {
            path: 'about-feature-highlights',
            element: <AboutFeatureHighlightsPage />,
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
