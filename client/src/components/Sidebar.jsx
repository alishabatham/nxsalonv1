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
  CalendarCheck,
  X,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ activeTab, setActiveTab, role, isOpen, onClose }) => {
  const { user, quickSwitchRole } = useAuth();

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

  const handleSelect = (id) => {
    setActiveTab(id);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 p-4 flex flex-col justify-between shrink-0 shadow-xl lg:shadow-xs min-h-screen lg:min-h-[calc(100vh-65px)] transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-3">
          {/* Header on Mobile */}
          <div className="flex items-center justify-between px-2 pt-1 lg:hidden border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                NX
              </div>
              <span className="font-bold text-slate-900 text-sm">Navigation</span>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 hidden lg:block">
            Navigation Menu
          </div>

          {/* Menu Links */}
          <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-220px)] custom-scrollbar">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
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

          {/* Mobile Role Switcher */}
          <div className="lg:hidden p-2.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-2">
            <div className="font-bold text-slate-700 text-[11px]">Quick Switch Role View:</div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => { quickSwitchRole('owner'); onClose(); }}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold text-center ${user?.role === 'owner' ? 'bg-brand-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200'}`}
              >
                Owner
              </button>
              <button
                onClick={() => { quickSwitchRole('receptionist'); onClose(); }}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold text-center ${user?.role === 'receptionist' ? 'bg-brand-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200'}`}
              >
                Reception
              </button>
              <button
                onClick={() => { quickSwitchRole('staff'); onClose(); }}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold text-center ${user?.role === 'staff' ? 'bg-brand-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200'}`}
              >
                Staff
              </button>
              <button
                onClick={() => { quickSwitchRole('customer'); onClose(); }}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold text-center ${user?.role === 'customer' ? 'bg-brand-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200'}`}
              >
                Customer
              </button>
            </div>
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-500 mt-4">
          <div className="font-semibold text-slate-700">NX Salon OS V1</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Production Build 1.0.0</div>
        </div>
      </aside>
    </>
  );
};

