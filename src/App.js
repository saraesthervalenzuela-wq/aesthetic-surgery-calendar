import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Settings } from 'lucide-react';
import Header from './components/Header/Header';
import StepIndicator from './components/StepIndicator/StepIndicator';
import SurgerySelector from './components/SurgerySelector/SurgerySelector';
import CalendarPicker from './components/CalendarPicker/CalendarPicker';
import BookingForm from './components/BookingForm/BookingForm';
import AdminPanel from './components/AdminPanel/AdminPanel';
import './styles/globals.css';
import './App.css';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSurgery, setSelectedSurgery] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);

  const handleSurgerySelect = useCallback((surgery) => {
    setSelectedSurgery(surgery);
    setCurrentStep(2);
  }, []);

  const handleDateSelect = useCallback((date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  }, []);

  const handleTimeSelect = useCallback((time) => {
    setSelectedTime(time);
    setCurrentStep(3);
  }, []);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      if (currentStep === 3) {
        setSelectedTime(null);
      }
      if (currentStep === 2) {
        setSelectedSurgery(null);
        setSelectedDate(null);
        setSelectedTime(null);
      }
    }
  }, [currentStep]);

  const handleReset = useCallback(() => {
    setCurrentStep(1);
    setSelectedSurgery(null);
    setSelectedDate(null);
    setSelectedTime(null);
  }, []);

  const handleSuccess = useCallback(() => {
    // Optional: Could show a thank you message or redirect
  }, []);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <SurgerySelector 
              selectedSurgery={selectedSurgery}
              onSelect={handleSurgerySelect}
            />
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <CalendarPicker
              selectedSurgery={selectedSurgery}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onDateSelect={handleDateSelect}
              onTimeSelect={handleTimeSelect}
            />
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            key="step-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <BookingForm
              surgery={selectedSurgery}
              date={selectedDate}
              time={selectedTime}
              onSuccess={handleSuccess}
              onReset={handleReset}
            />
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="app">
      <div className="main-content">
        <Header />
        
        <StepIndicator currentStep={currentStep} />
        
        {/* Navigation Buttons */}
        {currentStep > 1 && currentStep < 4 && (
          <div className="navigation-bar">
            <button className="nav-button back" onClick={handleBack}>
              <ArrowLeft size={18} />
              <span>Atrás</span>
            </button>
            
            {currentStep === 2 && selectedTime && (
              <button 
                className="nav-button next"
                onClick={() => setCurrentStep(3)}
              >
                <span>Continuar</span>
                <ArrowRight size={18} />
              </button>
            )}
          </div>
        )}

        {/* Main Step Content */}
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>

        {/* Admin Access Button (Hidden) */}
        <button 
          className="admin-access-btn"
          onClick={() => setShowAdmin(true)}
          title="Panel de Administración"
        >
          <Settings size={20} />
        </button>

        {/* Admin Panel Modal */}
        <AnimatePresence>
          {showAdmin && (
            <AdminPanel onClose={() => setShowAdmin(false)} />
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="app-footer">
        <p>
          © {new Date().getFullYear()} Aesthetic Surgery Center. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}

export default App;
