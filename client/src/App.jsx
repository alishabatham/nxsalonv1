import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { SetupWizardModal } from './components/SetupWizardModal';

// Pages
import { Login } from './pages/Auth/Login';
import { ForgotPassword } from './pages/Auth/ForgotPassword';
import { OwnerDashboard } from './pages/Owner/OwnerDashboard';
import { ReceptionDashboard } from './pages/Receptionist/ReceptionDashboard';
import { StaffDashboard } from './pages/Staff/StaffDashboard';
import { AppointmentsPage } from './pages/Appointments/AppointmentsPage';
import { CustomersPage } from './pages/Customers/CustomersPage';
import { ServicesManagement } from './pages/Owner/ServicesManagement';
import { StaffManagement } from './pages/Owner/StaffManagement';
import { BillingPage } from './pages/Billing/BillingPage';
import { InventoryManagement } from './pages/Owner/InventoryManagement';
import { ReportsPage } from './pages/Owner/ReportsPage';
import { SettingsPage } from './pages/Owner/SettingsPage';
import { AuditLogsPage } from './pages/Owner/AuditLogsPage';
import { PublicBookingPage } from './pages/Customer/PublicBookingPage';

const MainLayout = () => {
  const { user, salon, loading, refreshUser } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' or 'forgot'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isNewApptModalOpen, setIsNewApptModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSetupWizardOpen, setIsSetupWizardOpen] = useState(false);

  useEffect(() => {
    if (user?.role === 'owner' && salon && !salon.isSetupCompleted) {
      setIsSetupWizardOpen(true);
    }
  }, [user, salon]);

  useEffect(() => {
    // Set default tab when role changes
    if (user) {
      if (user.role === 'staff') {
        setActiveTab('my-dashboard');
      } else if (user.role === 'customer') {
        setActiveTab('public-booking');
      } else {
        setActiveTab('dashboard');
      }
    }
  }, [user?.role]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans text-xs text-slate-400">
        Initializing NX SALON OS V1...
      </div>
    );
  }

  if (!user) {
    if (authView === 'forgot') {
      return <ForgotPassword onBackToLogin={() => setAuthView('login')} />;
    }
    return <Login onSwitchToForgot={() => setAuthView('forgot')} />;
  }

  const renderContent = () => {
    if (user.role === 'customer' || activeTab === 'public-booking') {
      return <PublicBookingPage />;
    }

    switch (activeTab) {
      case 'dashboard':
        return user.role === 'receptionist' 
          ? <ReceptionDashboard onNavigate={setActiveTab} onOpenNewAppt={() => setIsNewApptModalOpen(true)} />
          : <OwnerDashboard onNavigate={setActiveTab} onOpenNewAppt={() => setIsNewApptModalOpen(true)} />;
      case 'my-dashboard':
      case 'today-schedule':
        return <StaffDashboard />;
      case 'appointments':
      case 'my-appointments':
        return <AppointmentsPage isNewApptModalOpen={isNewApptModalOpen} setIsNewApptModalOpen={setIsNewApptModalOpen} />;
      case 'customers':
      case 'customer-details':
        return <CustomersPage />;
      case 'services':
      case 'service-history':
        return <ServicesManagement />;
      case 'staff':
        return <StaffManagement />;
      case 'billing':
        return <BillingPage />;
      case 'inventory':
        return <InventoryManagement readOnly={user.role === 'receptionist'} />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'audit-logs':
        return <AuditLogsPage />;
      case 'notifications':
        return (
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Notifications & Event Alerts</h2>
            <p className="text-xs text-slate-500 mb-4">Click the top bell icon to open the live notification drawer.</p>
            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="bg-brand-600 text-white font-bold text-xs py-2 px-4 rounded-xl"
            >
              Open Notifications Drawer
            </button>
          </div>
        );
      default:
        return <OwnerDashboard onNavigate={setActiveTab} onOpenNewAppt={() => setIsNewApptModalOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar
        onOpenNewAppt={() => setIsNewApptModalOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} role={user.role} />
        
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto custom-scrollbar max-w-7xl mx-auto w-full">
          {renderContent()}
        </main>
      </div>

      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      <SetupWizardModal
        isOpen={isSetupWizardOpen}
        onClose={() => setIsSetupWizardOpen(false)}
        onComplete={refreshUser}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
