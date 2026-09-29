import React, { createContext, useContext, useState } from 'react';

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [selectedService, setSelectedService] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState('any');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  const resetBooking = () => {
    setSelectedService(null);
    setSelectedStaff('any');
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setSelectedTime('');
    setCustomerName('');
    setCustomerMobile('');
    setCustomerNotes('');
  };

  return (
    <BookingContext.Provider value={{
      selectedService, setSelectedService,
      selectedStaff, setSelectedStaff,
      selectedDate, setSelectedDate,
      selectedTime, setSelectedTime,
      customerName, setCustomerName,
      customerMobile, setCustomerMobile,
      customerNotes, setCustomerNotes,
      resetBooking
    }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => useContext(BookingContext);
