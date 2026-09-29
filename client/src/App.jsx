import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { SetupWizardModal } from './components/SetupWizardModal';

// Pages
import { Login } from './pages/Auth/Login';
import { ForgotPassword } from './pages/Auth/ForgotPassword';

// Owner & Desk Pages
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

// 9 Customer-Facing Screen Route Components
import { SalonInfoPage } from './pages/Customer/SalonInfoPage';
import { SelectServicePage } from './pages/Customer/SelectServicePage';
import { SelectStaffPage } from './pages/Customer/SelectStaffPage';
import { SelectDatePage } from './pages/Customer/SelectDatePage';
import { SelectTimePage } from './pages/Customer/SelectTimePage';
import { BookingConfirmationPage } from './pages/Customer/BookingConfirmationPage';
import { AppointmentDetailsPage } from './pages/Customer/AppointmentDetailsPage';
import { CancelAppointmentPage } from './pages/Customer/CancelAppointmentPage';
import { RescheduleAppointmentPage } from './pages/Customer/RescheduleAppointmentPage';

const AppContent = () => {
  const { user, salon, loading, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isNewApptModalOpen, setIsNewApptModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSetupWizardOpen, setIsSetupWizardOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState('dashboard');

  useEffect(() => {
    if (user?.role === 'owner' && salon && !salon.isSetupCompleted) {
      setIsSetupWizardOpen(true);
    }
  }, [user, salon]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-400">
        Loading NX SALON OS V1...
      </div>
    );
  }

  // Handle Tab navigation from sidebar
  const handleSidebarTabChange = (tabId) => {
    setSidebarTab(tabId);
    if (tabId === 'dashboard') {
      if (user?.role === 'receptionist') navigate('/reception/dashboard');
      else if (user?.role === 'staff') navigate('/staff/dashboard');
      else navigate('/owner/dashboard');
    } else if (tabId === 'public-booking') {
      navigate('/customer/salon');
    } else {
      navigate(`/owner/${tabId}`);
    }
  };

  const isCustomerRoute = location.pathname.startsWith('/customer');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar
        onOpenNewAppt={() => setIsNewApptModalOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        {user && !isCustomerRoute && (
          <Sidebar
            activeTab={sidebarTab}
            setActiveTab={handleSidebarTabChange}
            role={user.role}
          />
        )}

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto custom-scrollbar max-w-7xl mx-auto w-full">
          <Routes>
            {/* Root Route */}
            <Route path="/" element={<Navigate to="/customer/salon" replace />} />

            {/* Auth Routes */}
            <Route path="/login" element={user ? <Navigate to="/owner/dashboard" replace /> : <Login onSwitchToForgot={() => navigate('/forgot-password')} />} />
            <Route path="/forgot-password" element={<ForgotPassword onBackToLogin={() => navigate('/login')} />} />

            {/* 9 Customer-Facing Screen Routes */}
            <Route path="/customer" element={<Navigate to="/customer/salon" replace />} />
            <Route path="/customer/salon" element={<SalonInfoPage />} />
            <Route path="/customer/services" element={<SelectServicePage />} />
            <Route path="/customer/staff" element={<SelectStaffPage />} />
            <Route path="/customer/date" element={<SelectDatePage />} />
            <Route path="/customer/time" element={<SelectTimePage />} />
            <Route path="/customer/booking-confirmation" element={<BookingConfirmationPage />} />
            <Route path="/customer/appointment/:id" element={<AppointmentDetailsPage />} />
            <Route path="/customer/cancel/:id" element={<CancelAppointmentPage />} />
            <Route path="/customer/reschedule/:id" element={<RescheduleAppointmentPage />} />

            {/* Internal Staff & Owner Routes */}
            <Route path="/owner/dashboard" element={<OwnerDashboard onNavigate={handleSidebarTabChange} onOpenNewAppt={() => setIsNewApptModalOpen(true)} />} />
            <Route path="/reception/dashboard" element={<ReceptionDashboard onNavigate={handleSidebarTabChange} onOpenNewAppt={() => setIsNewApptModalOpen(true)} />} />
            <Route path="/staff/dashboard" element={<StaffDashboard />} />
            
            <Route path="/owner/appointments" element={<AppointmentsPage isNewApptModalOpen={isNewApptModalOpen} setIsNewApptModalOpen={setIsNewApptModalOpen} />} />
            <Route path="/owner/customers" element={<CustomersPage />} />
            <Route path="/owner/services" element={<ServicesManagement />} />
            <Route path="/owner/staff" element={<StaffManagement />} />
            <Route path="/owner/billing" element={<BillingPage />} />
            <Route path="/owner/inventory" element={<InventoryManagement readOnly={user?.role === 'receptionist'} />} />
            <Route path="/owner/reports" element={<ReportsPage />} />
            <Route path="/owner/settings" element={<SettingsPage />} />
            <Route path="/owner/audit-logs" element={<AuditLogsPage />} />

            {/* Fallback Catch-all */}
            <Route path="*" element={<Navigate to="/customer/salon" replace />} />
          </Routes>
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
    <BrowserRouter>
      <AuthProvider>
        <BookingProvider>
          <AppContent />
        </BookingProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
