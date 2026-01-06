import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Calendar, UserCheck, Check } from 'lucide-react';
import './StepIndicator.css';

const steps = [
  { id: 1, label: 'Procedimientos', icon: Sparkles },
  { id: 2, label: 'Fecha y Hora', icon: Calendar },
  { id: 3, label: 'Tus Datos', icon: UserCheck }
];

const StepIndicator = ({ currentStep }) => {
  return (
    <div className="step-indicator">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;

        return (
          <React.Fragment key={step.id}>
            <motion.div 
              className={`step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="step-circle">
                {isCompleted ? (
                  <Check size={18} />
                ) : (
                  <Icon size={18} />
                )}
              </div>
              <span className="step-label">{step.label}</span>
            </motion.div>
            
            {index < steps.length - 1 && (
              <div className={`step-connector ${isCompleted ? 'completed' : ''}`}>
                <div className="connector-line"></div>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StepIndicator;
