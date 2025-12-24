import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Sun,
  Sunset,
  AlertTriangle,
  Info
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
import {
  businessHours,
  isSurgeryAllowedOnDay,
  canAddAppointment,
  getRemainingSlots,
  getDayTypeLabel,
  getSizeLabel,
  dayRestrictions
} from '../../data/surgeries';
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

  // Check if all selected procedures are allowed on a specific day
  const areProceduresAllowedOnDay = (date) => {
    if (!selectedProcedures.length) return true;
    return selectedProcedures.every(proc => isSurgeryAllowedOnDay(proc, date));
  };

  // Get the type of surgery day
  const getSurgeryDayType = (date) => {
    const dayOfWeek = date.getDay();
    if (dayRestrictions.plastic.includes(dayOfWeek)) {
      return 'plastic';
    }
    return 'bariatric';
  };

  // Check if there's capacity for the selected procedures on the date
  const hasCapacityForProcedures = (existingAppointments) => {
    // Check each selected procedure
    for (const proc of selectedProcedures) {
      if (!canAddAppointment(existingAppointments, proc)) {
        return false;
      }
      // Add to existing for next check
      existingAppointments = [...existingAppointments, proc];
    }
    return true;
  };

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

    // Check against booked appointments for time overlap
    for (const appointment of bookedSlots) {
      const appointmentStart = new Date(appointment.date);
      const appointmentEnd = new Date(appointmentStart.getTime() + appointment.totalDuration * 60000);

      // Check for overlap
      if (slotStart < appointmentEnd && slotEnd > appointmentStart) {
        return false;
      }
    }

    // Check daily capacity limits
    if (!hasCapacityForProcedures(bookedSlots)) {
      return false;
    }

    return true;
  };

  // Get remaining capacity info for the selected date
  const getRemainingCapacityInfo = () => {
    if (!selectedDate || !bookedSlots) return null;
    const remaining = getRemainingSlots(bookedSlots);
    return remaining;
  };

  const remainingCapacity = getRemainingCapacityInfo();

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
        const isPastDate = isBefore(currentDay, minDate);
        const isSelected = selectedDate && isSameDay(currentDay, selectedDate);
        const isCurrentMonth = isSameMonth(currentDay, monthStart);

        // Check if procedures are allowed on this day
        const proceduresAllowed = areProceduresAllowedOnDay(currentDay);
        const dayType = getSurgeryDayType(currentDay);
        const isDisabled = isPastDate || !proceduresAllowed;

        // Get day type indicator
        const dayTypeClass = dayType === 'plastic' ? 'plastic-day' : 'bariatric-day';

        days.push(
          <motion.div
            key={day.toString()}
            whileHover={!isDisabled ? { scale: 1.1 } : {}}
            whileTap={!isDisabled ? { scale: 0.95 } : {}}
            className={`calendar-cell ${!isCurrentMonth ? 'other-month' : ''} ${isDisabled ? 'disabled' : ''} ${isSelected ? 'selected' : ''} ${dayTypeClass} ${!proceduresAllowed && !isPastDate ? 'wrong-type' : ''}`}
            onClick={() => !isDisabled && onDateSelect(currentDay)}
            title={!proceduresAllowed && !isPastDate ? `Este día es para ${getDayTypeLabel(currentDay)}` : ''}
          >
            <span>{format(currentDay, 'd')}</span>
            {isCurrentMonth && !isPastDate && (
              <span className="day-type-dot"></span>
            )}
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

  // Get the surgery type of selected procedures
  const getSelectedSurgeryType = () => {
    if (!selectedProcedures.length) return null;
    const hasBariatric = selectedProcedures.some(p => p.category === 'Bariatría');
    return hasBariatric ? 'bariatric' : 'plastic';
  };

  const selectedSurgeryType = getSelectedSurgeryType();

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

        {/* Day type info message */}
        {selectedSurgeryType && (
          <div className={`day-type-info ${selectedSurgeryType}`}>
            <Info size={18} />
            <span>
              {selectedSurgeryType === 'bariatric'
                ? 'Cirugías Bariátricas: Viernes a Lunes'
                : 'Cirugías Plásticas: Martes a Jueves'}
            </span>
          </div>
        )}

        {/* Calendar legend */}
        <div className="calendar-legend">
          <div className="legend-item">
            <span className="legend-dot plastic"></span>
            <span>Plásticas (Mar-Jue)</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot bariatric"></span>
            <span>Bariátricas (Vie-Lun)</span>
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

            {/* Capacity info */}
            {remainingCapacity && (
              <div className="capacity-info">
                <AlertTriangle size={16} />
                <span>Espacios disponibles: </span>
                <span className="capacity-badges">
                  <span className="badge small">{remainingCapacity.small} {getSizeLabel('small')}s</span>
                  <span className="badge medium">{remainingCapacity.medium} {getSizeLabel('medium')}s</span>
                  <span className="badge large">{remainingCapacity.large} {getSizeLabel('large')}s</span>
                </span>
              </div>
            )}

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
