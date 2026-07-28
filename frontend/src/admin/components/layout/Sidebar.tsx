import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  ShoppingCart, 
  Users, 
  MessageSquare, 
  Archive, 
  Ticket, 
  BarChart, 
  Settings 
} from 'lucide-react';

const MENU_ITEMS = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { name: 'Products', icon: Package, path: '/admin/products' },
  { name: 'Categories', icon: Tags, path: '/admin/categories' },
  { name: 'Orders', icon: ShoppingCart, path: '/admin/orders' },
  { name: 'Customers', icon: Users, path: '/admin/customers' },
  { name: 'Reviews', icon: MessageSquare, path: '/admin/reviews' },
  { name: 'Inventory', icon: Archive, path: '/admin/inventory' },
  { name: 'Coupons', icon: Ticket, path: '/admin/coupons' },
  { name: 'Analytics', icon: BarChart, path: '/admin/analytics' },
  { name: 'Settings', icon: Settings, path: '/admin/settings' },
];

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col bg-white border-r border-gray-200">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-gray-200">
        <h1 className="text-xl font-bold tracking-tight text-gray-900">
          ElleStyle <span className="text-primary font-normal">Admin</span>
        </h1>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
        <nav className="flex-1 space-y-1 px-3">
          {MENU_ITEMS.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon
                className="mr-3 h-5 w-5 shrink-0 text-gray-400 group-hover:text-gray-500"
                aria-hidden="true"
              />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}
