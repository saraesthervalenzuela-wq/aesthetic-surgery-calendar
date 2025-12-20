/**
 * Script to Initialize Firestore Database (Node / Admin SDK)
 *
 * Run with: npm run init-db
 */

import admin from "firebase-admin";
import { surgeries } from "../data/surgeries.js";

// ✅ Service Account key (downloaded from Firebase Console)
import serviceAccount from "./serviceAccountKey.json" with { type: "json" };

// Initialize Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const { Timestamp } = admin.firestore;

/**
 * Initialize General Settings
 */
async function initializeSettings() {
  console.log("📝 Initializing general settings...");

  const settingsRef = db.doc("settings/general");

  const defaultSettings = {
    businessHours: {
      start: 6, // 6 AM
      end: 19, // 7 PM
      daysOfWeek: [1, 2, 3, 4, 5, 6], // Monday to Saturday
    },
    bufferDays: 7,
    slotDuration: 15,
    maxAppointmentsPerDay: 10,
    clinicInfo: {
      name: "Aesthetic Surgery Center",
      phone: "+52 55 1234 5678",
      email: "info@aestheticsurgery.com",
      address: "Av. Principal 123, CDMX",
      website: "www.aestheticsurgery.com",
    },
    emailConfig: {
      sendConfirmation: true,
      sendReminder: true,
      reminderDaysBefore: 3,
    },
    updatedAt: Timestamp.now(),
  };

  await settingsRef.set(defaultSettings);
  console.log("✅ Settings initialized successfully");
}

/**
 * Initialize Surgery Procedures (Optional)
 */
async function initializeSurgeryProcedures() {
  console.log("📋 Initializing surgery procedures...");

  const batch = db.batch();

  surgeries.forEach((surgery) => {
    // ✅ Ensure surgery.id is valid for Firestore doc ID (no slashes)
    const safeId = String(surgery.id).replaceAll("/", "-");

    const docRef = db.doc(`surgeryProcedures/${safeId}`);
    batch.set(docRef, {
      ...surgery,
      id: safeId, // keep consistent
      price: 0,
      isActive: true,
      requiresConsultation: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  });

  await batch.commit();
  console.log(`✅ ${surgeries.length} surgery procedures initialized`);
}

/**
 * Create Sample Blocked Dates
 */
async function createSampleBlockedDates() {
  console.log("🚫 Creating sample blocked dates...");

  const currentYear = new Date().getFullYear();
  const blockedDates = [
    {
      date: new Date(currentYear, 0, 1),
      reason: "Año Nuevo",
      isFullDay: true,
    },
    {
      date: new Date(currentYear, 11, 25),
      reason: "Navidad",
      isFullDay: true,
    },
    {
      date: new Date(currentYear, 4, 1),
      reason: "Día del Trabajo",
      isFullDay: true,
    },
  ];

  const batch = db.batch();

  blockedDates.forEach((blockedDate) => {
    const docRef = db.collection("blockedDates").doc();
    batch.set(docRef, {
      date: Timestamp.fromDate(blockedDate.date),
      reason: blockedDate.reason,
      isFullDay: blockedDate.isFullDay,
      createdAt: Timestamp.now(),
      createdBy: "system",
    });
  });

  await batch.commit();
  console.log(`✅ ${blockedDates.length} blocked dates created`);
}

/**
 * Create Sample Appointments (for testing)
 */
async function createSampleAppointments() {
  console.log("📅 Creating sample appointments for testing...");

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(14, 30, 0, 0);

  const sampleAppointments = [
    {
      patientName: "Juan Pérez García",
      patientEmail: "juan.perez@example.com",
      patientPhone: "+52 55 9876 5432",
      surgeryId: "rhinoplasty",
      surgeryName: "Rinoplastia",
      duration: 50,
      date: Timestamp.fromDate(tomorrow),
      status: "confirmed",
      createdAt: Timestamp.now(),
    },
    {
      patientName: "María González López",
      patientEmail: "maria.gonzalez@example.com",
      patientPhone: "+52 55 1234 5678",
      surgeryId: "blepharoplasty",
      surgeryName: "Blefaroplastia",
      duration: 90,
      date: Timestamp.fromDate(nextWeek),
      status: "confirmed",
      createdAt: Timestamp.now(),
    },
  ];

  const batch = db.batch();

  sampleAppointments.forEach((appointment) => {
    const docRef = db.collection("appointments").doc();
    batch.set(docRef, appointment);
  });

  await batch.commit();
  console.log(`✅ ${sampleAppointments.length} sample appointments created`);
}

/**
 * Main
 */
async function initializeDatabase() {
  console.log("🚀 Starting database initialization...\n");

  try {
    await initializeSettings();
    console.log("");

    await initializeSurgeryProcedures();
    console.log("");

    await createSampleBlockedDates();
    console.log("");

    // Uncomment if you want sample appointments
    // await createSampleAppointments();
    // console.log("");

    console.log("🎉 Database initialization completed successfully!\n");
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    process.exitCode = 1;
  }
}

initializeDatabase();
