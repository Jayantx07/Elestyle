# ElleStyle - Premium E-Commerce Platform

A production-grade, highly scalable, and secure e-commerce platform for the fashion brand "ElleStyle". This platform is built with a mobile-first approach, prioritizing a premium, minimal, fast, and luxurious user experience.

## Tech Stack

### Frontend
- React 19
- Vite
- TypeScript
- Tailwind CSS
- React Router
- React Hook Form
- Zod
- TanStack Query (when necessary)

### Backend
- Node.js
- Express.js
- MongoDB & Mongoose
- JWT Authentication
- Cloudinary (Media Storage)
- Multer (File Uploads)

### Deployment & Security
- Environment Variables for Configurations
- Protected APIs & Role-Based Authorization
- Rate Limiting Ready
- Optimized Assets

## User Flow
Visitor → Landing Page → Browse Categories → Product Listing → Product Details → Select Variant (Color) → Select Size → Add To Cart → Guest Cart → Login / Signup → Automatically Restore Cart → Redirect to Cart → Checkout → Select Address → Select Payment Method → Place Order → Order Confirmation → Order Details → Order History → Track Order → Leave Review

## Core Systems & Features

### User Features
- **Authentication**: Login, Signup, Forgot/Reset Password, Logout.
- **Profile Management**: Saved Addresses, Wishlist, Shopping Cart, Guest Cart (merges after login).
- **Shopping Experience**: Product Search, Filters, Sorting, Category Browsing, Variant Selection, Image Gallery & Zoom, Specifications, Reviews & Ratings, Related & Recently Viewed Products.
- **Order Management**: Order History, Details, Tracking, Cancellations, Customer Queries, Newsletter Subscription.

### Product System
- **Product Details**: Name, Slug, Category, Description, Short Description, Base Price, Selling Price, Discount Calculation, Stock Status, Availability, Featured Product, SEO Metadata.
- **Variants**: Cover Image, Multiple Images, Optional Videos, Available Sizes, Inventory, Specifications, Material & Care.

### Admin Panel & Management
- **Dashboard**: Business Analytics (Revenue, Orders, Customers, Products, Categories, Reviews, Queries, Inventory), Sales Graphs, Best Sellers, Low Stock Alerts.
- **Product Management**: Full CRUD operations, variant management, inventory control, image/video uploads.
- **Order Management**: Status tracking (Pending, Confirmed, Packed, Shipped, Delivered, Cancelled, Returned, Refunded).
- **Customer Management**: Profiles, Orders, Spending, Reviews, Queries.
- **Query Management**: View, mark as seen, reply, archive customer queries.

## Non-Functional Requirements
- **Performance**: Lazy loading, image optimization, code splitting, fast initial load, minimal bundle size.
- **Security**: JWT Auth, password hashing, input validation, secure file upload.
- **SEO**: Semantic HTML, Meta Tags, Open Graph, Structured Data, Image Alt Text, Sitemap & Robots ready.
- **Responsiveness**: Mobile First, Flexbox/Grid layouts, responsive typography/spacing.

## Implementation Guidelines
- Follow the Minimal Engineering Rules (`AGENT_RULES.md`).
- Implement one feature fully before moving to the next.
- No unnecessary abstractions, dependencies, or redesigns.
- Write production-ready, scalable code from day one.
