import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Scissors, 
  UserCog, 
  Receipt, 
  Package, 
  BarChart3, 
  Bell, 
  Settings, 
  History, 
  Clock, 
  UserCheck,
  CalendarCheck
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab, role }) => {
  const getMenuItems = () => {
    if (role === 'owner') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'appointments', label: 'Appointments', icon: Calendar },
        { id: 'customers', label: 'Customers', icon: Users },
        { id: 'services', label: 'Services', icon: Scissors },
        { id: 'staff', label: 'Staff Management', icon: UserCog },
        { id: 'billing', label: 'Billing & Payments', icon: Receipt },
        { id: 'inventory', label: 'Inventory Management', icon: Package },
        { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'settings', label: 'Business Settings', icon: Settings },
        { id: 'audit-logs', label: 'Audit Log', icon: History }
      ];
    } else if (role === 'receptionist') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'appointments', label: 'Appointments', icon: Calendar },
        { id: 'customers', label: 'Customers', icon: Users },
        { id: 'billing', label: 'Billing & Payments', icon: Receipt },
        { id: 'inventory', label: 'Inventory (View Only)', icon: Package }
      ];
    } else if (role === 'staff') {
      return [
        { id: 'my-dashboard', label: 'My Dashboard', icon: LayoutDashboard },
        { id: 'my-appointments', label: 'My Appointments', icon: CalendarCheck },
        { id: 'today-schedule', label: "Today's Schedule", icon: Clock },
        { id: 'customer-details', label: 'Customer Details', icon: Users },
        { id: 'service-history', label: 'Service History', icon: History }
      ];
    } else {
      return [
        { id: 'public-booking', label: 'Book Appointment', icon: Calendar },
        { id: 'my-booking', label: 'My Booking', icon: CalendarCheck }
      ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-65px)] p-4 flex flex-col justify-between shrink-0 shadow-xs">
      <div className="space-y-1.5">
        <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          Navigation Menu
        </div>
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all ${
                isActive 
                  ? 'bg-brand-50 text-brand-600 font-semibold shadow-xs border border-brand-100' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-500">
        <div className="font-semibold text-slate-700">NX Salon OS V1</div>
        <div className="text-[11px] text-slate-400 mt-0.5">Production Build 1.0.0</div>
      </div>
    </aside>
  );
};
