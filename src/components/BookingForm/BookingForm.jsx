import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Send, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { format, setHours, setMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { formatDuration } from '../../data/surgeries';
import emailjs from '@emailjs/browser';
import './BookingForm.css';

const BookingForm = ({ surgery, date, time, onSuccess, onReset }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ingresa un correo válido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    } else if (!/^[\d\s\-+()]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Ingresa un teléfono válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const sendConfirmationEmail = async (appointmentData) => {
    // Configure EmailJS - Replace with your credentials
    const serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID || 'YOUR_SERVICE_ID';
    const templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID || 'YOUR_TEMPLATE_ID';
    const publicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY || 'YOUR_PUBLIC_KEY';

    try {
      await emailjs.send(serviceId, templateId, {
        to_name: appointmentData.patientName,
        to_email: appointmentData.patientEmail,
        surgery_name: appointmentData.surgeryName,
        appointment_date: format(appointmentData.date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es }),
        appointment_time: format(appointmentData.date, 'h:mm a'),
        duration: formatDuration(appointmentData.duration)
      }, publicKey);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const appointmentDate = setMinutes(setHours(new Date(date), time.hour), time.minute);
      
      const appointmentData = {
        patientName: formData.name.trim(),
        patientEmail: formData.email.trim().toLowerCase(),
        patientPhone: formData.phone.trim(),
        surgeryId: surgery.id,
        surgeryName: surgery.name,
        duration: surgery.duration,
        date: Timestamp.fromDate(appointmentDate),
        status: 'confirmed',
        createdAt: Timestamp.now()
      };

      await addDoc(collection(db, 'appointments'), appointmentData);
      
      // Send confirmation email
      await sendConfirmationEmail({
        ...appointmentData,
        date: appointmentDate
      });

      setSubmitStatus('success');
      
      setTimeout(() => {
        onSuccess && onSuccess();
      }, 3000);

    } catch (error) {
      console.error('Error creating appointment:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitStatus === 'success') {
    return (
      <motion.div 
        className="booking-success"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="success-icon">
          <CheckCircle size={60} />
        </div>
        <h2>¡Cita Agendada!</h2>
        <p>Hemos enviado los detalles a tu correo electrónico</p>
        <div className="success-details">
          <div className="detail-item">
            <span className="label">Procedimiento:</span>
            <span className="value">{surgery.name}</span>
          </div>
          <div className="detail-item">
            <span className="label">Fecha:</span>
            <span className="value">{format(date, "d 'de' MMMM, yyyy", { locale: es })}</span>
          </div>
          <div className="detail-item">
            <span className="label">Hora:</span>
            <span className="value">{format(setMinutes(setHours(new Date(), time.hour), time.minute), 'h:mm a')}</span>
          </div>
        </div>
        <button className="new-appointment-btn" onClick={onReset}>
          Agendar otra cita
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="booking-form"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="form-header">
        <h2>Completa tu Reservación</h2>
        <p>Ingresa tus datos para confirmar la cita</p>
      </div>

      <div className="appointment-summary">
        <div className="summary-item">
          <span className="summary-icon">{surgery.icon}</span>
          <div className="summary-details">
            <span className="summary-label">Procedimiento</span>
            <span className="summary-value">{surgery.name}</span>
          </div>
        </div>
        <div className="summary-item">
          <span className="summary-icon">📅</span>
          <div className="summary-details">
            <span className="summary-label">Fecha</span>
            <span className="summary-value">
              {format(date, "EEEE, d 'de' MMMM", { locale: es })}
            </span>
          </div>
        </div>
        <div className="summary-item">
          <span className="summary-icon">⏰</span>
          <div className="summary-details">
            <span className="summary-label">Hora</span>
            <span className="summary-value">
              {format(setMinutes(setHours(new Date(), time.hour), time.minute), 'h:mm a')}
            </span>
          </div>
        </div>
        <div className="summary-item">
          <span className="summary-icon">⏱️</span>
          <div className="summary-details">
            <span className="summary-label">Duración</span>
            <span className="summary-value">{formatDuration(surgery.duration)}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={`form-group ${errors.name ? 'has-error' : ''}`}>
          <label htmlFor="name">
            <User size={18} />
            Nombre Completo
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Tu nombre completo"
            disabled={isSubmitting}
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
          <label htmlFor="email">
            <Mail size={18} />
            Correo Electrónico
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="tu@correo.com"
            disabled={isSubmitting}
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className={`form-group ${errors.phone ? 'has-error' : ''}`}>
          <label htmlFor="phone">
            <Phone size={18} />
            Teléfono
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+52 55 1234 5678"
            disabled={isSubmitting}
          />
          {errors.phone && <span className="error-message">{errors.phone}</span>}
        </div>

        {submitStatus === 'error' && (
          <div className="submit-error">
            <AlertCircle size={18} />
            <span>Hubo un error al agendar. Por favor intenta de nuevo.</span>
          </div>
        )}

        <button 
          type="submit" 
          className="submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader size={20} className="spin" />
              Procesando...
            </>
          ) : (
            <>
              <Send size={20} />
              Confirmar Cita
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default BookingForm;
