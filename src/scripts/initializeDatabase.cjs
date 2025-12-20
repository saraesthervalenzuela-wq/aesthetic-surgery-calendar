/* eslint-disable no-console */
const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

// Load service account JSON safely (no ESM json imports needed)
const serviceAccountPath = path.join(__dirname, "serviceAccountKey.json");
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

const db = admin.firestore();
const Timestamp = admin.firestore.Timestamp;

async function loadSurgeries() {
  // surgeries.js is ESM, so we import it dynamically
  const surgeriesPath = path.join(__dirname, "..", "data", "surgeries.js");
  const mod = await import(pathToFileURL(surgeriesPath).href);
  return mod.surgeries || [];
}

async function initializeSettings() {
  console.log("📝 Initializing general settings...");
  const settingsRef = db.doc("settings/general");

  const defaultSettings = {
    businessHours: { start: 6, end: 19, daysOfWeek: [1, 2, 3, 4, 5, 6] },
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
    emailConfig: { sendConfirmation: true, sendReminder: true, reminderDaysBefore: 3 },
    updatedAt: Timestamp.now(),
  };

  await settingsRef.set(defaultSettings);
  console.log("✅ Settings initialized successfully");
}

async function initializeSurgeryProcedures(surgeries) {
  console.log("📋 Initializing surgery procedures...");

  const batch = db.batch();

  surgeries.forEach((surgery) => {
    const safeId = String(surgery.id || "").replaceAll("/", "-").trim();
    if (!safeId) return;

    const docRef = db.doc(`surgeryProcedures/${safeId}`);
    batch.set(docRef, {
      ...surgery,
      id: safeId,
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

async function createSampleBlockedDates() {
  console.log("🚫 Creating sample blocked dates...");

  const currentYear = new Date().getFullYear();
  const blockedDates = [
    { date: new Date(currentYear, 0, 1), reason: "Año Nuevo", isFullDay: true },
    { date: new Date(currentYear, 11, 25), reason: "Navidad", isFullDay: true },
    { date: new Date(currentYear, 4, 1), reason: "Día del Trabajo", isFullDay: true },
  ];

  const batch = db.batch();
  blockedDates.forEach((b) => {
    const docRef = db.collection("blockedDates").doc();
    batch.set(docRef, {
      date: Timestamp.fromDate(b.date),
      reason: b.reason,
      isFullDay: b.isFullDay,
      createdAt: Timestamp.now(),
      createdBy: "system",
    });
  });

  await batch.commit();
  console.log(`✅ ${blockedDates.length} blocked dates created`);
}

async function main() {
  console.log("🚀 Starting database initialization...\n");
  try {
    await initializeSettings();
    console.log("");

    const surgeries = await loadSurgeries();
    await initializeSurgeryProcedures(surgeries);
    console.log("");

    await createSampleBlockedDates();
    console.log("");

    console.log("🎉 Database initialization completed successfully!");
  } catch (e) {
    console.error("❌ Error initializing database:", e);
    process.exitCode = 1;
  }
}

main();
