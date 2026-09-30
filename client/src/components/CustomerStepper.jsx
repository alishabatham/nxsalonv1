import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Building, Scissors, User, Calendar, Clock, CheckCircle2 } from 'lucide-react';

export const CustomerStepper = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const steps = [
    { path: '/customer/salon', label: 'Salon', icon: Building, step: 1 },
    { path: '/customer/services', label: 'Services', icon: Scissors, step: 2 },
    { path: '/customer/staff', label: 'Staff', icon: User, step: 3 },
    { path: '/customer/date', label: 'Date', icon: Calendar, step: 4 },
    { path: '/customer/time', label: 'Time', icon: Clock, step: 5 },
    { path: '/customer/booking-confirmation', label: 'Confirm', icon: CheckCircle2, step: 6 },
  ];

  // Determine current step index
  const currentStepObj = steps.find(s => location.pathname === s.path) || steps[0];
  const currentStep = currentStepObj.step;

  // Only render stepper on booking wizard pages (steps 1-6)
  if (!steps.some(s => location.pathname === s.path)) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 mb-4 shadow-2xs">
      <div className="flex items-center justify-between overflow-x-auto custom-scrollbar gap-1 sm:gap-2">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          const isActive = location.pathname === s.path;
          const isCompleted = currentStep > s.step;

          return (
            <React.Fragment key={s.path}>
              {idx > 0 && (
                <div className={`h-0.5 flex-1 min-w-[12px] sm:min-w-[24px] rounded-full transition-colors ${
                  isCompleted || isActive ? 'bg-brand-600' : 'bg-slate-200'
                }`} />
              )}
              <button
                onClick={() => isCompleted && navigate(s.path)}
                disabled={!isCompleted && !isActive}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-xs scale-105'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : isCompleted ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className="hidden xs:inline text-[11px] sm:text-xs">{s.label}</span>
                <span className="xs:hidden text-[10px]">{s.step}</span>
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
