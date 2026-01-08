import { useState } from 'react';
import {  
  Menu, 
  LayoutDashboard, 
  X,  
  ChevronDown,  
  ChevronRight, 
  Users, 
  ShoppingCart,
  FileText, 
  UserPlus, 
  List, 
  CreditCard, 
  FileSpreadsheet, 
  User, 
  LogOut,
  Package,
  UserCog
} from 'lucide-react';

export default function Sidebar({ onNavigate, onLogout, currentUser, currentPath }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleMenu = (menuName) => {
    setExpandedMenus(prev => {
      const isCurrentlyExpanded = prev[menuName];
      // Close all other menus and toggle this one
      return isCurrentlyExpanded ? {} : { [menuName]: true };
    });
  };

  const handleNavigation = (path) => {
    onNavigate(path);
    
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const menuItems = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard'
    },
    {
      name: 'User Master',
      icon: UserCog,
      submenu: [
        { name: 'User List', icon: List, path: '/user-master/list' },
        { name: 'Add User', icon: UserPlus, path: '/user-master/add' }
      ]
    },
    {
      name: 'Master',
      icon: Package,
      submenu: [
        { name: 'Product List', icon: List, path: '/master/product/list' },
        { name: 'Add Product', icon: UserPlus, path: '/master/product/add' }
      ]
    },
    {
      name: 'Customer',
      icon: Users,
      submenu: [
        { name: 'Customer List', icon: List, path: '/customer/list' },
        { name: 'Add Customer', icon: UserPlus, path: '/customer/add' }
      ]
    },
    {
      name: 'Sales',
      icon: ShoppingCart,
      submenu: [
        { name: 'Invoice List', icon: List, path: '/sales/invoice/list' },
        { name: 'Create Invoice', icon: FileText, path: '/sales/invoice/create' },
        { name: 'Payments', icon: CreditCard, path: '/sales/payments' },
        { name: 'Quotations', icon: FileSpreadsheet, path: '/sales/quotations' }
      ]
    }
  ];

  // Helper function to check if a path is active
  const isPathActive = (itemPath, currentPath) => {
    if (!itemPath || !currentPath) return false;
    return currentPath === itemPath;
  };

  // Check if current path matches any submenu item in this menu
  const isMenuActive = (item) => {
    if (item.path && currentPath === item.path) {
      return true;
    }
    if (item.submenu) {
      return item.submenu.some(subItem => isPathActive(subItem.path, currentPath));
    }
    return false;
  };

  return (
    <>
      {/* Hamburger Button - Fixed position on mobile */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 transition"
      >
        {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 backdrop-blur-md bg-white/30 z-30 transition"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen bg-white shadow-xl z-40 
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:sticky lg:shadow-lg
          w-64 border-r border-gray-200 flex flex-col
        `}
      >
        {/* User Info Header */}
        <div className="p-4 border-b border-gray-200 bg-linear-to-r from-indigo-600 to-indigo-700">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center">
              <User className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {currentUser?.username || 'User'}
              </p>
              <p className="text-xs text-indigo-100 truncate">
                {currentUser?.email || 'user@example.com'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isExpanded = expandedMenus[item.name];
            const isActive = isMenuActive(item);

            return (
              <div key={item.name}>
                {/* Main Menu Item */}
                {item.path ? (
                  // Direct navigation item (Dashboard)
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-600' : 'text-gray-500'}`} />
                      <span className="font-medium text-sm">{item.name}</span>
                    </div>
                  </button>
                ) : (
                  // Menu with submenu
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-600' : 'text-gray-500'}`} />
                      <span className="font-medium text-sm">{item.name}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                    ) : (
                      <ChevronRight className="h-4 w-4 transition-transform duration-200" />
                    )}
                  </button>
                )}

                {/* Submenu */}
                {item.submenu && isExpanded && (
                  <div className="mt-1 ml-4 space-y-1 border-l-2 border-gray-200 pl-2">
                    {item.submenu.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const isSubItemActive = isPathActive(subItem.path, currentPath);

                      return (
                        <button
                          key={subItem.name}
                          onClick={() => handleNavigation(subItem.path)}
                          className={`w-full flex items-center space-x-3 px-3 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                            isSubItemActive
                              ? 'bg-indigo-100 text-indigo-700 font-medium shadow-sm'
                              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                        >
                          <SubIcon className={`h-4 w-4 ${isSubItemActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                          <span>{subItem.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            © 2026 Invoicing System 
          </p>
        </div>
      </aside>
    </>
  );
}