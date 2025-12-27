import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Trash2,
  Download,
  RefreshCw,
  TrendingUp,
  CalendarCheck,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  Edit3,
  CheckCircle,
  XCircle
} from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  setHours,
  setMinutes
} from 'date-fns';
import { es } from 'date-fns/locale';
import { collection, query, getDocs, updateDoc, doc, deleteDoc, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { formatDuration } from '../../data/surgeries';
import './AdminPanel.css';

const AdminPanel = ({ onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({ date: null, hour: 8, minute: 0 });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    thisMonth: 0
  });

  const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD || 'admin123';

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Contraseña incorrecta');
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const appointmentsRef = collection(db, 'appointments');
      const q = query(appointmentsRef, orderBy('date', 'desc'));
      const snapshot = await getDocs(q);

      const appointmentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate()
      }));

      setAppointments(appointmentsData);

      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      setStats({
        total: appointmentsData.length,
        pending: appointmentsData.filter(a => a.status === 'pending').length,
        confirmed: appointmentsData.filter(a => a.status === 'confirmed').length,
        cancelled: appointmentsData.filter(a => a.status === 'cancelled').length,
        thisMonth: appointmentsData.filter(a =>
          a.date >= monthStart && a.date <= monthEnd && a.status !== 'cancelled'
        ).length
      });

    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAppointments();
    }
  }, [isAuthenticated]);

  const updateStatus = async (appointmentId, newStatus) => {
    try {
      await updateDoc(doc(db, 'appointments', appointmentId), {
        status: newStatus
      });
      fetchAppointments();
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const rescheduleAppointment = async () => {
    if (!rescheduleData.date || !selectedAppointment) return;

    try {
      const newDate = setMinutes(
        setHours(new Date(rescheduleData.date), rescheduleData.hour),
        rescheduleData.minute
      );

      await updateDoc(doc(db, 'appointments', selectedAppointment.id), {
        date: Timestamp.fromDate(newDate)
      });

      fetchAppointments();
      setShowRescheduleModal(false);
      setSelectedAppointment(null);
      setRescheduleData({ date: null, hour: 8, minute: 0 });
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
    }
  };

  const deleteAppointment = async (appointmentId) => {
    if (window.confirm('¿Estás seguro de eliminar esta cita permanentemente?')) {
      try {
        await deleteDoc(doc(db, 'appointments', appointmentId));
        fetchAppointments();
        setSelectedAppointment(null);
      } catch (error) {
        console.error('Error deleting appointment:', error);
      }
    }
  };

  const exportToCSV = () => {
    const headers = ['Fecha', 'Hora', 'Paciente', 'Email', 'Teléfono', 'Procedimientos', 'Duración', 'Estado'];
    const rows = filteredAppointments.map(apt => [
      format(apt.date, 'dd/MM/yyyy'),
      format(apt.date, 'HH:mm'),
      apt.patientName,
      apt.patientEmail,
      apt.patientPhone,
      apt.procedures ? apt.procedures.map(p => p.name).join('; ') : apt.surgeryName,
      formatDuration(apt.totalDuration || apt.duration),
      apt.status
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `citas_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const getProceduresText = (apt) => {
    if (apt.procedures && apt.procedures.length > 0) {
      return apt.procedures.map(p => p.name).join(', ');
    }
    return apt.surgeryName || 'Sin procedimiento';
  };

  const filteredAppointments = appointments.filter(apt => {
    const proceduresText = getProceduresText(apt).toLowerCase();
    const matchesSearch =
      apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.patientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proceduresText.includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || apt.status === filterStatus;
    const matchesDate = !selectedDate || isSameDay(apt.date, selectedDate);

    return matchesSearch && matchesStatus && matchesDate;
  });

  const getAppointmentsForDate = (date) => {
    return appointments.filter(apt =>
      isSameDay(apt.date, date) && apt.status !== 'cancelled'
    );
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'confirmed': return 'Autorizada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = [];
    let day = startDate;

    while (day <= endDate) {
      const currentDay = day;
      const dayAppointments = getAppointmentsForDate(currentDay);
      const isSelected = selectedDate && isSameDay(currentDay, selectedDate);
      const hasPending = dayAppointments.some(a => a.status === 'pending');

      days.push(
        <div
          key={day.toString()}
          className={`admin-calendar-cell ${!isSameMonth(currentDay, monthStart) ? 'other-month' : ''} ${isSelected ? 'selected' : ''}`}
          onClick={() => setSelectedDate(isSelected ? null : currentDay)}
        >
          <span>{format(currentDay, 'd')}</span>
          {dayAppointments.length > 0 && (
            <div className="appointment-dots">
              {hasPending && <span className="dot pending"></span>}
              {dayAppointments.filter(a => a.status === 'confirmed').length > 0 && (
                <span className="dot confirmed"></span>
              )}
            </div>
          )}
        </div>
      );
      day = addDays(day, 1);
    }

    return days;
  };

  const timeOptions = [];
  for (let h = 7; h <= 18; h++) {
    for (let m = 0; m < 60; m += 30) {
      timeOptions.push({ hour: h, minute: m, label: format(setMinutes(setHours(new Date(), h), m), 'h:mm a') });
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="admin-overlay">
        <motion.div
          className="admin-login"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>

          <div className="login-header">
            <div className="login-icon">
              <Lock size={32} />
            </div>
            <h2>Panel de Administración</h2>
            <p>Ingresa la contraseña para continuar</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                autoFocus
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {authError && (
              <div className="auth-error">
                <AlertCircle size={16} />
                {authError}
              </div>
            )}

            <button type="submit" className="login-btn">
              Acceder
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="admin-overlay">
      <motion.div
        className="admin-panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="admin-header">
          <div className="admin-title">
            <h1>Panel de Administración</h1>
            <p>Gestión de citas y procedimientos</p>
          </div>
          <div className="admin-actions">
            <button className="action-btn" onClick={fetchAppointments} title="Refrescar">
              <RefreshCw size={18} />
            </button>
            <button className="action-btn" onClick={exportToCSV} title="Exportar CSV">
              <Download size={18} />
            </button>
            <button className="close-btn" onClick={onClose}>
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon total">
              <CalendarCheck size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total Citas</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon pending">
              <Clock size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.pending}</span>
              <span className="stat-label">Pendientes</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon confirmed">
              <Check size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.confirmed}</span>
              <span className="stat-label">Autorizadas</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon cancelled">
              <X size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.cancelled}</span>
              <span className="stat-label">Canceladas</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon month">
              <TrendingUp size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.thisMonth}</span>
              <span className="stat-label">Este Mes</span>
            </div>
          </div>
        </div>

        <div className="admin-content">
          <div className="admin-sidebar">
            <div className="mini-calendar">
              <div className="calendar-nav">
                <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                  <ChevronLeft size={18} />
                </button>
                <span>{format(currentMonth, 'MMMM yyyy', { locale: es })}</span>
                <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                  <ChevronRight size={18} />
                </button>
              </div>
              <div className="calendar-weekdays">
                {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d, i) => (
                  <span key={i}>{d}</span>
                ))}
              </div>
              <div className="calendar-grid">
                {renderCalendar()}
              </div>
              <div className="calendar-legend">
                <span><span className="dot pending"></span> Pendiente</span>
                <span><span className="dot confirmed"></span> Autorizada</span>
              </div>
            </div>

            {selectedDate && (
              <div className="selected-date-info">
                <span>{format(selectedDate, "d 'de' MMMM", { locale: es })}</span>
                <button onClick={() => setSelectedDate(null)}>
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          <div className="admin-main">
            <div className="filters-bar">
              <div className="search-input">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Buscar paciente, email o procedimiento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="filter-buttons">
                <button
                  className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('all')}
                >
                  Todas
                </button>
                <button
                  className={`filter-btn pending ${filterStatus === 'pending' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('pending')}
                >
                  Pendientes
                </button>
                <button
                  className={`filter-btn confirmed ${filterStatus === 'confirmed' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('confirmed')}
                >
                  Autorizadas
                </button>
                <button
                  className={`filter-btn cancelled ${filterStatus === 'cancelled' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('cancelled')}
                >
                  Canceladas
                </button>
              </div>
            </div>

            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <span>Cargando citas...</span>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="empty-state">
                <Calendar size={48} />
                <p>No hay citas que mostrar</p>
              </div>
            ) : (
              <div className="appointments-list">
                {filteredAppointments.map(appointment => (
                  <motion.div
                    key={appointment.id}
                    layout
                    className={`appointment-card ${appointment.status}`}
                    onClick={() => setSelectedAppointment(appointment)}
                  >
                    <div className="appointment-date">
                      <span className="day">{format(appointment.date, 'd')}</span>
                      <span className="month">{format(appointment.date, 'MMM', { locale: es })}</span>
                      <span className="time">{format(appointment.date, 'h:mm a')}</span>
                    </div>
                    <div className="appointment-info">
                      <h4>{appointment.patientName}</h4>
                      <p className="surgery-name">{getProceduresText(appointment)}</p>
                      <div className="appointment-meta">
                        <span><Clock size={14} /> {formatDuration(appointment.totalDuration || appointment.duration)}</span>
                        <span><Mail size={14} /> {appointment.patientEmail}</span>
                      </div>
                    </div>
                    <div className={`status-badge ${appointment.status}`}>
                      {getStatusLabel(appointment.status)}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Appointment Detail Modal */}
        <AnimatePresence>
          {selectedAppointment && !showRescheduleModal && (
            <motion.div
              className="appointment-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAppointment(null)}
            >
              <motion.div
                className="appointment-modal"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button className="modal-close" onClick={() => setSelectedAppointment(null)}>
                  <X size={20} />
                </button>

                <div className="modal-header">
                  <h3>Detalles de la Cita</h3>
                  <div className={`status-badge large ${selectedAppointment.status}`}>
                    {getStatusLabel(selectedAppointment.status)}
                  </div>
                </div>

                <div className="modal-content">
                  <div className="detail-group">
                    <label><User size={16} /> Paciente</label>
                    <span>{selectedAppointment.patientName}</span>
                  </div>
                  <div className="detail-group">
                    <label><Mail size={16} /> Email</label>
                    <span>{selectedAppointment.patientEmail}</span>
                  </div>
                  <div className="detail-group">
                    <label><Phone size={16} /> Teléfono</label>
                    <span>{selectedAppointment.patientPhone}</span>
                  </div>
                  <div className="detail-group">
                    <label><Calendar size={16} /> Fecha</label>
                    <span>{format(selectedAppointment.date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}</span>
                  </div>
                  <div className="detail-group">
                    <label><Clock size={16} /> Hora</label>
                    <span>{format(selectedAppointment.date, 'h:mm a')}</span>
                  </div>
                  <div className="detail-group">
                    <label>Procedimientos</label>
                    <span>{getProceduresText(selectedAppointment)}</span>
                  </div>
                  <div className="detail-group">
                    <label>Duración</label>
                    <span>{formatDuration(selectedAppointment.totalDuration || selectedAppointment.duration)}</span>
                  </div>
                </div>

                <div className="modal-actions">
                  {selectedAppointment.status === 'pending' && (
                    <button
                      className="action-btn authorize"
                      onClick={() => updateStatus(selectedAppointment.id, 'confirmed')}
                    >
                      <CheckCircle size={18} /> Autorizar
                    </button>
                  )}

                  {selectedAppointment.status === 'confirmed' && (
                    <button
                      className="action-btn cancel"
                      onClick={() => updateStatus(selectedAppointment.id, 'cancelled')}
                    >
                      <XCircle size={18} /> Cancelar
                    </button>
                  )}

                  {selectedAppointment.status === 'cancelled' && (
                    <button
                      className="action-btn confirm"
                      onClick={() => updateStatus(selectedAppointment.id, 'confirmed')}
                    >
                      <Check size={18} /> Reactivar
                    </button>
                  )}

                  {selectedAppointment.status !== 'cancelled' && (
                    <button
                      className="action-btn reschedule"
                      onClick={() => {
                        setRescheduleData({
                          date: selectedAppointment.date,
                          hour: selectedAppointment.date.getHours(),
                          minute: selectedAppointment.date.getMinutes()
                        });
                        setShowRescheduleModal(true);
                      }}
                    >
                      <Edit3 size={18} /> Recorrer Fecha
                    </button>
                  )}

                  <button
                    className="action-btn delete"
                    onClick={() => deleteAppointment(selectedAppointment.id)}
                  >
                    <Trash2 size={18} /> Eliminar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reschedule Modal */}
        <AnimatePresence>
          {showRescheduleModal && selectedAppointment && (
            <motion.div
              className="appointment-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRescheduleModal(false)}
            >
              <motion.div
                className="reschedule-modal"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button className="modal-close" onClick={() => setShowRescheduleModal(false)}>
                  <X size={20} />
                </button>

                <div className="modal-header">
                  <h3>Recorrer Cita</h3>
                </div>

                <div className="reschedule-content">
                  <p className="reschedule-patient">
                    <User size={16} /> {selectedAppointment.patientName}
                  </p>

                  <div className="reschedule-form">
                    <div className="form-group">
                      <label>Nueva Fecha</label>
                      <input
                        type="date"
                        value={rescheduleData.date ? format(rescheduleData.date, 'yyyy-MM-dd') : ''}
                        onChange={(e) => setRescheduleData({
                          ...rescheduleData,
                          date: e.target.value ? new Date(e.target.value + 'T12:00:00') : null
                        })}
                        min={format(new Date(), 'yyyy-MM-dd')}
                      />
                    </div>

                    <div className="form-group">
                      <label>Nueva Hora</label>
                      <select
                        value={`${rescheduleData.hour}:${rescheduleData.minute}`}
                        onChange={(e) => {
                          const [h, m] = e.target.value.split(':').map(Number);
                          setRescheduleData({
                            ...rescheduleData,
                            hour: h,
                            minute: m
                          });
                        }}
                      >
                        {timeOptions.map((opt, i) => (
                          <option key={i} value={`${opt.hour}:${opt.minute}`}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    className="action-btn cancel-reschedule"
                    onClick={() => setShowRescheduleModal(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    className="action-btn confirm-reschedule"
                    onClick={rescheduleAppointment}
                    disabled={!rescheduleData.date}
                  >
                    <Check size={18} /> Confirmar Cambio
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AdminPanel;
