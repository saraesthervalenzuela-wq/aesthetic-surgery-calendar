import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  Sun,
  Sunset
} from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isBefore,
  addWeeks,
  setHours,
  setMinutes,
  isAfter
} from 'date-fns';
import { es } from 'date-fns/locale';
import { businessHours } from '../../data/surgeries';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import './CalendarPicker.css';

const CalendarPicker = ({ selectedProcedures, selectedDate, selectedTime, onDateSelect, onTimeSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  const minDate = addWeeks(new Date(), 1); // 1 week buffer

  // Calculate total duration of all selected procedures
  const totalDuration = selectedProcedures.reduce((sum, proc) => sum + proc.duration, 0);

  // Generate time slots based on business hours
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = businessHours.start; hour < businessHours.end; hour++) {
      slots.push({ hour, minute: 0 });
      slots.push({ hour, minute: 30 });
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Fetch booked appointments for selected date
  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!selectedDate) return;
      
      setLoading(true);
      try {
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        const appointmentsRef = collection(db, 'appointments');
        const q = query(
          appointmentsRef,
          where('date', '>=', startOfDay),
          where('date', '<=', endOfDay),
          where('status', '!=', 'cancelled')
        );
        
        const snapshot = await getDocs(q);
        const booked = snapshot.docs.map(doc => ({
          ...doc.data(),
          date: doc.data().date.toDate()
        }));
        setBookedSlots(booked);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookedSlots();
  }, [selectedDate]);

  // Check if a time slot is available
  const isSlotAvailable = (hour, minute) => {
    if (!selectedProcedures.length || !selectedDate) return true;

    const slotStart = setMinutes(setHours(new Date(selectedDate), hour), minute);
    const slotEnd = new Date(slotStart.getTime() + totalDuration * 60000);

    // Check if slot ends after business hours
    const businessEnd = setMinutes(setHours(new Date(selectedDate), businessHours.end), 0);
    if (isAfter(slotEnd, businessEnd)) return false;

    // Check against booked appointments
    for (const appointment of bookedSlots) {
      const appointmentStart = new Date(appointment.date);
      const appointmentEnd = new Date(appointmentStart.getTime() + appointment.totalDuration * 60000);

      // Check for overlap
      if (slotStart < appointmentEnd && slotEnd > appointmentStart) {
        return false;
      }
    }

    return true;
  };

  // Render calendar header
  const renderHeader = () => {
    return (
      <div className="calendar-header">
        <button 
          className="nav-btn"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        >
          <ChevronLeft size={20} />
        </button>
        <h3>
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </h3>
        <button 
          className="nav-btn"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    );
  };

  // Render days of week
  const renderDays = () => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return (
      <div className="calendar-days">
        {days.map(day => (
          <div key={day} className="day-name">{day}</div>
        ))}
      </div>
    );
  };

  // Render calendar cells
  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const currentDay = day;
        const isDisabled = isBefore(currentDay, minDate);
        const isSelected = selectedDate && isSameDay(currentDay, selectedDate);
        const isCurrentMonth = isSameMonth(currentDay, monthStart);

        days.push(
          <motion.div
            key={day.toString()}
            whileHover={!isDisabled ? { scale: 1.1 } : {}}
            whileTap={!isDisabled ? { scale: 0.95 } : {}}
            className={`calendar-cell ${!isCurrentMonth ? 'other-month' : ''} ${isDisabled ? 'disabled' : ''} ${isSelected ? 'selected' : ''}`}
            onClick={() => !isDisabled && onDateSelect(currentDay)}
          >
            <span>{format(currentDay, 'd')}</span>
          </motion.div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="calendar-row">
          {days}
        </div>
      );
      days = [];
    }

    return <div className="calendar-body">{rows}</div>;
  };

  // Format time for display
  const formatTime = (hour, minute) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  // Get time period (morning/afternoon)
  const getTimePeriod = (hour) => {
    if (hour < 12) return 'morning';
    return 'afternoon';
  };

  return (
    <div className="calendar-picker">
      <div className="picker-section">
        <div className="section-header">
          <CalendarIcon size={24} />
          <div>
            <h2>Selecciona la Fecha</h2>
            <p>Las citas se programan con mínimo 1 semana de anticipación</p>
          </div>
        </div>

        <div className="calendar-container">
          {renderHeader()}
          {renderDays()}
          {renderCells()}
        </div>
      </div>

      <AnimatePresence>
        {selectedDate && (
          <motion.div 
            className="picker-section time-section"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="section-header">
              <Clock size={24} />
              <div>
                <h2>Selecciona la Hora</h2>
                <p>{format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}</p>
              </div>
            </div>

            {loading ? (
              <div className="loading-times">
                <div className="spinner"></div>
                <span>Cargando horarios...</span>
              </div>
            ) : (
              <div className="time-slots-container">
                <div className="time-period">
                  <div className="period-header">
                    <Sun size={18} />
                    <span>Mañana</span>
                  </div>
                  <div className="time-slots">
                    {timeSlots
                      .filter(slot => getTimePeriod(slot.hour) === 'morning')
                      .map(slot => {
                        const available = isSlotAvailable(slot.hour, slot.minute);
                        const isSelected = selectedTime && 
                          selectedTime.hour === slot.hour && 
                          selectedTime.minute === slot.minute;
                        
                        return (
                          <motion.button
                            key={`${slot.hour}-${slot.minute}`}
                            whileHover={available ? { scale: 1.05 } : {}}
                            whileTap={available ? { scale: 0.95 } : {}}
                            className={`time-slot ${!available ? 'unavailable' : ''} ${isSelected ? 'selected' : ''}`}
                            onClick={() => available && onTimeSelect(slot)}
                            disabled={!available}
                          >
                            {formatTime(slot.hour, slot.minute)}
                          </motion.button>
                        );
                      })}
                  </div>
                </div>

                <div className="time-period">
                  <div className="period-header">
                    <Sunset size={18} />
                    <span>Tarde</span>
                  </div>
                  <div className="time-slots">
                    {timeSlots
                      .filter(slot => getTimePeriod(slot.hour) === 'afternoon')
                      .map(slot => {
                        const available = isSlotAvailable(slot.hour, slot.minute);
                        const isSelected = selectedTime && 
                          selectedTime.hour === slot.hour && 
                          selectedTime.minute === slot.minute;
                        
                        return (
                          <motion.button
                            key={`${slot.hour}-${slot.minute}`}
                            whileHover={available ? { scale: 1.05 } : {}}
                            whileTap={available ? { scale: 0.95 } : {}}
                            className={`time-slot ${!available ? 'unavailable' : ''} ${isSelected ? 'selected' : ''}`}
                            onClick={() => available && onTimeSelect(slot)}
                            disabled={!available}
                          >
                            {formatTime(slot.hour, slot.minute)}
                          </motion.button>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CalendarPicker;
