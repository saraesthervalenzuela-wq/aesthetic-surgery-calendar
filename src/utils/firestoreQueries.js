/**
 * Firestore Query Utilities
 *
 * Collection of useful Firestore query functions for the
 * Aesthetic Surgery Calendar application.
 */

import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';

// ============================================
// APPOINTMENTS QUERIES
// ============================================

/**
 * Get all appointments for a specific date
 * @param {Date} date - The date to query
 * @param {string} status - Optional status filter (confirmed, completed, cancelled)
 * @returns {Promise<Array>} Array of appointments
 */
export async function getAppointmentsByDate(date, status = 'confirmed') {
  try {
    const start = Timestamp.fromDate(startOfDay(date));
    const end = Timestamp.fromDate(endOfDay(date));

    const q = query(
      collection(db, 'appointments'),
      where('date', '>=', start),
      where('date', '<', end),
      where('status', '==', status),
      orderBy('date', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate() // Convert Timestamp to Date
    }));
  } catch (error) {
    console.error('Error getting appointments by date:', error);
    throw error;
  }
}

/**
 * Get all appointments for a date range
 * @param {Date} startDate - Start of range
 * @param {Date} endDate - End of range
 * @returns {Promise<Array>} Array of appointments
 */
export async function getAppointmentsByDateRange(startDate, endDate) {
  try {
    const start = Timestamp.fromDate(startOfDay(startDate));
    const end = Timestamp.fromDate(endOfDay(endDate));

    const q = query(
      collection(db, 'appointments'),
      where('date', '>=', start),
      where('date', '<=', end),
      where('status', 'in', ['confirmed', 'pending']),
      orderBy('date', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate()
    }));
  } catch (error) {
    console.error('Error getting appointments by range:', error);
    throw error;
  }
}

/**
 * Get all appointments for a specific patient (by email)
 * @param {string} email - Patient email
 * @returns {Promise<Array>} Array of patient's appointments
 */
export async function getAppointmentsByPatient(email) {
  try {
    const q = query(
      collection(db, 'appointments'),
      where('patientEmail', '==', email.toLowerCase()),
      orderBy('date', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate()
    }));
  } catch (error) {
    console.error('Error getting appointments by patient:', error);
    throw error;
  }
}

/**
 * Check if a time slot is available
 * @param {Date} slotStart - Start of the time slot
 * @param {number} durationMinutes - Duration in minutes
 * @returns {Promise<boolean>} True if available, false if occupied
 */
export async function isTimeSlotAvailable(slotStart, durationMinutes) {
  try {
    const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000);

    const start = Timestamp.fromDate(slotStart);
    const end = Timestamp.fromDate(slotEnd);

    const q = query(
      collection(db, 'appointments'),
      where('date', '>=', start),
      where('date', '<', end),
      where('status', 'in', ['confirmed', 'pending'])
    );

    const snapshot = await getDocs(q);
    return snapshot.empty;
  } catch (error) {
    console.error('Error checking slot availability:', error);
    throw error;
  }
}

/**
 * Create a new appointment
 * @param {Object} appointmentData - Appointment data
 * @returns {Promise<string>} ID of the created appointment
 */
export async function createAppointment(appointmentData) {
  try {
    const docRef = await addDoc(collection(db, 'appointments'), {
      ...appointmentData,
      patientEmail: appointmentData.patientEmail.toLowerCase(),
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
}

/**
 * Update an appointment
 * @param {string} appointmentId - ID of the appointment
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export async function updateAppointment(appointmentId, updates) {
  try {
    const docRef = doc(db, 'appointments', appointmentId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    throw error;
  }
}

/**
 * Cancel an appointment
 * @param {string} appointmentId - ID of the appointment
 * @param {string} reason - Reason for cancellation
 * @returns {Promise<void>}
 */
export async function cancelAppointment(appointmentId, reason) {
  try {
    await updateAppointment(appointmentId, {
      status: 'cancelled',
      cancellationReason: reason
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    throw error;
  }
}

// ============================================
// BLOCKED DATES QUERIES
// ============================================

/**
 * Get all blocked dates for a month
 * @param {Date} date - Any date in the month to query
 * @returns {Promise<Array>} Array of blocked dates
 */
export async function getBlockedDatesForMonth(date) {
  try {
    const start = Timestamp.fromDate(startOfMonth(date));
    const end = Timestamp.fromDate(endOfMonth(date));

    const q = query(
      collection(db, 'blockedDates'),
      where('date', '>=', start),
      where('date', '<=', end)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate()
    }));
  } catch (error) {
    console.error('Error getting blocked dates:', error);
    throw error;
  }
}

/**
 * Check if a date is blocked
 * @param {Date} date - Date to check
 * @returns {Promise<boolean>} True if blocked, false otherwise
 */
export async function isDateBlocked(date) {
  try {
    const start = Timestamp.fromDate(startOfDay(date));
    const end = Timestamp.fromDate(endOfDay(date));

    const q = query(
      collection(db, 'blockedDates'),
      where('date', '>=', start),
      where('date', '<', end),
      where('isFullDay', '==', true)
    );

    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking if date is blocked:', error);
    throw error;
  }
}

/**
 * Block a date
 * @param {Date} date - Date to block
 * @param {string} reason - Reason for blocking
 * @param {boolean} isFullDay - Whether to block the full day
 * @returns {Promise<string>} ID of the created blocked date
 */
export async function blockDate(date, reason, isFullDay = true) {
  try {
    const docRef = await addDoc(collection(db, 'blockedDates'), {
      date: Timestamp.fromDate(startOfDay(date)),
      reason,
      isFullDay,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error blocking date:', error);
    throw error;
  }
}

/**
 * Unblock a date
 * @param {string} blockedDateId - ID of the blocked date to remove
 * @returns {Promise<void>}
 */
export async function unblockDate(blockedDateId) {
  try {
    await deleteDoc(doc(db, 'blockedDates', blockedDateId));
  } catch (error) {
    console.error('Error unblocking date:', error);
    throw error;
  }
}

// ============================================
// SETTINGS QUERIES
// ============================================

/**
 * Get general settings
 * @returns {Promise<Object>} Settings object
 */
export async function getSettings() {
  try {
    const docRef = doc(db, 'settings', 'general');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      throw new Error('Settings document not found');
    }
  } catch (error) {
    console.error('Error getting settings:', error);
    throw error;
  }
}

/**
 * Update settings
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export async function updateSettings(updates) {
  try {
    const docRef = doc(db, 'settings', 'general');
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
}

// ============================================
// SURGERY PROCEDURES QUERIES (Optional)
// ============================================

/**
 * Get all active surgery procedures
 * @returns {Promise<Array>} Array of surgery procedures
 */
export async function getActiveSurgeryProcedures() {
  try {
    const q = query(
      collection(db, 'surgeryProcedures'),
      where('isActive', '==', true),
      orderBy('category', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting surgery procedures:', error);
    throw error;
  }
}

// ============================================
// BATCH OPERATIONS
// ============================================

/**
 * Batch update appointment statuses
 * @param {Array<string>} appointmentIds - Array of appointment IDs
 * @param {string} status - New status
 * @returns {Promise<void>}
 */
export async function batchUpdateAppointmentStatus(appointmentIds, status) {
  try {
    const batch = writeBatch(db);

    appointmentIds.forEach((id) => {
      const docRef = doc(db, 'appointments', id);
      batch.update(docRef, {
        status,
        updatedAt: Timestamp.now()
      });
    });

    await batch.commit();
  } catch (error) {
    console.error('Error batch updating appointments:', error);
    throw error;
  }
}

/**
 * Get appointment statistics for a date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Object>} Statistics object
 */
export async function getAppointmentStats(startDate, endDate) {
  try {
    const appointments = await getAppointmentsByDateRange(startDate, endDate);

    const stats = {
      total: appointments.length,
      confirmed: appointments.filter(a => a.status === 'confirmed').length,
      completed: appointments.filter(a => a.status === 'completed').length,
      cancelled: appointments.filter(a => a.status === 'cancelled').length,
      byProcedure: {}
    };

    // Count by procedure
    appointments.forEach(appointment => {
      if (!stats.byProcedure[appointment.surgeryName]) {
        stats.byProcedure[appointment.surgeryName] = 0;
      }
      stats.byProcedure[appointment.surgeryName]++;
    });

    return stats;
  } catch (error) {
    console.error('Error getting appointment stats:', error);
    throw error;
  }
}

export default {
  // Appointments
  getAppointmentsByDate,
  getAppointmentsByDateRange,
  getAppointmentsByPatient,
  isTimeSlotAvailable,
  createAppointment,
  updateAppointment,
  cancelAppointment,

  // Blocked Dates
  getBlockedDatesForMonth,
  isDateBlocked,
  blockDate,
  unblockDate,

  // Settings
  getSettings,
  updateSettings,

  // Surgery Procedures
  getActiveSurgeryProcedures,

  // Batch & Stats
  batchUpdateAppointmentStatus,
  getAppointmentStats
};
