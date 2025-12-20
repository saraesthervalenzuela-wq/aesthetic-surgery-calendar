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
  EyeOff
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
  subMonths
} from 'date-fns';
import { es } from 'date-fns/locale';
import { collection, query, getDocs, updateDoc, doc, deleteDoc, orderBy } from 'firebase/firestore';
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
  const [stats, setStats] = useState({
    total: 0,
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
        confirmed: appointmentsData.filter(a => a.status === 'confirmed').length,
        cancelled: appointmentsData.filter(a => a.status === 'cancelled').length,
        thisMonth: appointmentsData.filter(a => 
          a.date >= monthStart && a.date <= monthEnd && a.status === 'confirmed'
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

  const deleteAppointment = async (appointmentId) => {
    if (window.confirm('¿Estás seguro de eliminar esta cita?')) {
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
    const headers = ['Fecha', 'Hora', 'Paciente', 'Email', 'Teléfono', 'Procedimiento', 'Duración', 'Estado'];
    const rows = filteredAppointments.map(apt => [
      format(apt.date, 'dd/MM/yyyy'),
      format(apt.date, 'HH:mm'),
      apt.patientName,
      apt.patientEmail,
      apt.patientPhone,
      apt.surgeryName,
      formatDuration(apt.duration),
      apt.status
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `citas_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = 
      apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.patientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.surgeryName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || apt.status === filterStatus;
    const matchesDate = !selectedDate || isSameDay(apt.date, selectedDate);
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getAppointmentsForDate = (date) => {
    return appointments.filter(apt => 
      isSameDay(apt.date, date) && apt.status === 'confirmed'
    );
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
      
      days.push(
        <div
          key={day.toString()}
          className={`admin-calendar-cell ${!isSameMonth(currentDay, monthStart) ? 'other-month' : ''} ${isSelected ? 'selected' : ''}`}
          onClick={() => setSelectedDate(isSelected ? null : currentDay)}
        >
          <span>{format(currentDay, 'd')}</span>
          {dayAppointments.length > 0 && (
            <div className="appointment-dots">
              {dayAppointments.slice(0, 3).map((_, i) => (
                <span key={i} className="dot"></span>
              ))}
            </div>
          )}
        </div>
      );
      day = addDays(day, 1);
    }

    return days;
  };

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
            <div className="stat-icon confirmed">
              <Check size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.confirmed}</span>
              <span className="stat-label">Confirmadas</span>
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
                  className={`filter-btn ${filterStatus === 'confirmed' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('confirmed')}
                >
                  Confirmadas
                </button>
                <button 
                  className={`filter-btn ${filterStatus === 'cancelled' ? 'active' : ''}`}
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
                      <p className="surgery-name">{appointment.surgeryName}</p>
                      <div className="appointment-meta">
                        <span><Clock size={14} /> {formatDuration(appointment.duration)}</span>
                        <span><Mail size={14} /> {appointment.patientEmail}</span>
                      </div>
                    </div>
                    <div className={`status-badge ${appointment.status}`}>
                      {appointment.status === 'confirmed' ? 'Confirmada' : 'Cancelada'}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {selectedAppointment && (
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
                    {selectedAppointment.status === 'confirmed' ? 'Confirmada' : 'Cancelada'}
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
                    <label>Procedimiento</label>
                    <span>{selectedAppointment.surgeryName}</span>
                  </div>
                  <div className="detail-group">
                    <label>Duración</label>
                    <span>{formatDuration(selectedAppointment.duration)}</span>
                  </div>
                </div>

                <div className="modal-actions">
                  {selectedAppointment.status === 'confirmed' ? (
                    <button 
                      className="action-btn cancel"
                      onClick={() => updateStatus(selectedAppointment.id, 'cancelled')}
                    >
                      <X size={18} /> Cancelar Cita
                    </button>
                  ) : (
                    <button 
                      className="action-btn confirm"
                      onClick={() => updateStatus(selectedAppointment.id, 'confirmed')}
                    >
                      <Check size={18} /> Reactivar Cita
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
      </motion.div>
    </div>
  );
};

export default AdminPanel;
