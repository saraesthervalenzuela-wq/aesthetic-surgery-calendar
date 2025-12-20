# Diagrama de Base de Datos

## Estructura Visual de Firestore

```
aesthetic-surgery-calendar (Firebase Project)
│
└── Firestore Database
    │
    ├── 📁 appointments/
    │   ├── {appointmentId1}
    │   │   ├── patientName: "María González"
    │   │   ├── patientEmail: "maria@email.com"
    │   │   ├── patientPhone: "+52 55 1234 5678"
    │   │   ├── surgeryId: "rhinoplasty"
    │   │   ├── surgeryName: "Rinoplastia"
    │   │   ├── duration: 50
    │   │   ├── date: Timestamp(2024-03-15 10:00)
    │   │   ├── status: "confirmed"
    │   │   └── createdAt: Timestamp
    │   │
    │   ├── {appointmentId2}
    │   └── {appointmentId3}
    │
    ├── 📁 blockedDates/
    │   ├── {blockedDateId1}
    │   │   ├── date: Timestamp(2024-12-25 00:00)
    │   │   ├── reason: "Navidad"
    │   │   ├── isFullDay: true
    │   │   ├── createdAt: Timestamp
    │   │   └── createdBy: "admin@clinic.com"
    │   │
    │   └── {blockedDateId2}
    │
    ├── 📁 settings/
    │   └── general (documento único)
    │       ├── businessHours: {
    │       │   start: 6,
    │       │   end: 19,
    │       │   daysOfWeek: [1,2,3,4,5,6]
    │       │   }
    │       ├── bufferDays: 7
    │       ├── slotDuration: 15
    │       ├── maxAppointmentsPerDay: 10
    │       ├── clinicInfo: { ... }
    │       ├── emailConfig: { ... }
    │       └── updatedAt: Timestamp
    │
    ├── 📁 surgeryProcedures/ (Opcional)
    │   ├── rhinoplasty
    │   │   ├── id: "rhinoplasty"
    │   │   ├── name: "Rinoplastia"
    │   │   ├── duration: 50
    │   │   ├── category: "Facial"
    │   │   ├── icon: "👃"
    │   │   ├── description: "..."
    │   │   ├── price: 0
    │   │   ├── isActive: true
    │   │   └── createdAt: Timestamp
    │   │
    │   ├── bbl
    │   ├── breast-augmentation
    │   └── ...
    │
    └── 📁 notifications/ (Opcional)
        ├── {notificationId1}
        │   ├── appointmentId: "abc123"
        │   ├── type: "confirmation"
        │   ├── recipientEmail: "patient@email.com"
        │   ├── sentAt: Timestamp
        │   └── status: "sent"
        │
        └── {notificationId2}
```

---

## Flujo de Datos de la Aplicación

### 1. Usuario Agenda una Cita

```
┌─────────────┐
│   Usuario   │
│  Selecciona │
│ Procedimiento│
└──────┬──────┘
       │
       v
┌─────────────┐
│   Usuario   │
│  Selecciona │
│    Fecha    │
└──────┬──────┘
       │
       v
┌─────────────┐      ┌──────────────────┐
│   Sistema   │─────>│  Firestore Query │
│  Verifica   │      │  appointments/   │
│Disponibilidad│<─────│  blockedDates/   │
└──────┬──────┘      └──────────────────┘
       │
       │ (Si disponible)
       v
┌─────────────┐
│   Usuario   │
│  Completa   │
│  Formulario │
└──────┬──────┘
       │
       v
┌─────────────┐      ┌──────────────────┐
│   Sistema   │─────>│  Firestore Write │
│    Crea     │      │  appointments/   │
│    Cita     │      │  + nuevo doc     │
└──────┬──────┘      └──────────────────┘
       │
       v
┌─────────────┐      ┌──────────────────┐
│   EmailJS   │─────>│  Envía Email de  │
│   Envía     │      │  Confirmación    │
│Confirmación │      │                  │
└─────────────┘      └──────────────────┘
```

### 2. Calendario Verifica Disponibilidad

```
┌─────────────────────────┐
│  CalendarPicker.jsx     │
│  Usuario selecciona día │
└────────────┬────────────┘
             │
             v
┌─────────────────────────────────────┐
│  getAppointmentsByDate(selectedDate)│
│  Consulta: appointments/            │
│  WHERE date >= startOfDay           │
│  WHERE date < endOfDay              │
│  WHERE status = 'confirmed'         │
└────────────┬────────────────────────┘
             │
             v
┌─────────────────────────────────────┐
│  getBlockedDatesForMonth(month)     │
│  Consulta: blockedDates/            │
│  WHERE date >= startOfMonth         │
│  WHERE date <= endOfMonth           │
└────────────┬────────────────────────┘
             │
             v
┌─────────────────────────┐
│  Sistema calcula slots  │
│  disponibles basado en: │
│  - Horario de negocio   │
│  - Citas existentes     │
│  - Fechas bloqueadas    │
│  - Duración procedimiento│
└────────────┬────────────┘
             │
             v
┌─────────────────────────┐
│  Muestra slots          │
│  disponibles al usuario │
└─────────────────────────┘
```

### 3. Admin Gestiona Citas

```
┌─────────────┐
│ AdminPanel  │
│  Se abre    │
└──────┬──────┘
       │
       v
┌─────────────────────┐
│ getAppointmentsByDate│
│ o                    │
│ getAppointmentsByRange│
└──────┬──────────────┘
       │
       v
┌─────────────┐
│  Muestra    │
│  Lista de   │
│  Citas      │
└──────┬──────┘
       │
       │ Admin selecciona acción
       v
┌──────────────────────┐
│ Opciones:            │
│ - Cancelar cita      │
│ - Marcar completada  │
│ - Ver detalles       │
│ - Bloquear fechas    │
└──────┬───────────────┘
       │
       v
┌─────────────────────┐     ┌──────────────┐
│ updateAppointment() │────>│  Firestore   │
│ o                   │     │  Update      │
│ cancelAppointment() │     │              │
│ o                   │     │              │
│ blockDate()         │     │              │
└─────────────────────┘     └──────────────┘
```

---

## Relaciones entre Colecciones

```
appointments
    ↓ (referencia por surgeryId)
surgeryProcedures
    ↓ (match por ID)
    "rhinoplasty", "bbl", etc.

appointments
    ↓ (puede generar)
notifications
    ↓ (referencia por appointmentId)
    registra email enviado
```

---

## Índices Compuestos Necesarios

### Índice 1: Búsqueda de citas por estado y fecha
```
Collection: appointments
Fields:
  - status (Ascending)
  - date (Ascending)

Uso: Obtener citas confirmadas en orden cronológico
Query: WHERE status == 'confirmed' ORDER BY date
```

### Índice 2: Búsqueda de citas de paciente
```
Collection: appointments
Fields:
  - patientEmail (Ascending)
  - date (Descending)

Uso: Ver historial de citas de un paciente
Query: WHERE patientEmail == 'user@email.com' ORDER BY date DESC
```

---

## Permisos de Seguridad (Firestore Rules)

```
┌─────────────────────────────────────────────────┐
│              Firestore Security                 │
└─────────────────────────────────────────────────┘

appointments/
├── CREATE: ✅ Público (cualquier usuario)
│            Validación: email válido, fecha futura
├── READ:   ❌ Solo Admin
├── UPDATE: ❌ Solo Admin
└── DELETE: ❌ Solo Admin

blockedDates/
├── CREATE: ❌ Solo Admin
├── READ:   ✅ Público (necesario para calendario)
├── UPDATE: ❌ Solo Admin
└── DELETE: ❌ Solo Admin

settings/
├── CREATE: ❌ Bloqueado (documento único)
├── READ:   ✅ Público (horarios, políticas)
├── UPDATE: ❌ Solo Admin
└── DELETE: ❌ Bloqueado

surgeryProcedures/
├── CREATE: ❌ Solo Admin
├── READ:   ✅ Público (catálogo de procedimientos)
├── UPDATE: ❌ Solo Admin
└── DELETE: ❌ Solo Admin

notifications/
├── CREATE: ✅ Sistema/Cloud Functions
├── READ:   ❌ Solo Admin
├── UPDATE: ❌ Solo Admin
└── DELETE: ❌ Bloqueado (audit trail)
```

---

## Tamaño y Límites de Firestore

### Límites por Documento
- Tamaño máximo: **1 MB**
- Campos máximos: **20,000**
- Profundidad de anidación: **20 niveles**

### Límites de Escritura
- Escrituras por segundo por documento: **1 por segundo**
- Batch writes: **500 operaciones por batch**

### Cuota Gratuita (Spark Plan)
- Lecturas: **50,000 / día**
- Escrituras: **20,000 / día**
- Deletes: **20,000 / día**
- Almacenamiento: **1 GB**

### Para esta App
Con uso normal (50 citas/día):
- Escrituras: ~50-100/día (muy por debajo del límite)
- Lecturas: ~1,000-2,000/día (carga de calendario)
- ✅ Cabe perfectamente en el plan gratuito

---

## Optimizaciones Recomendadas

### 1. Caché Local
```javascript
// Guardar settings en localStorage
// Se cargan raramente, no necesitan query cada vez
localStorage.setItem('clinicSettings', JSON.stringify(settings));
```

### 2. Consultas Eficientes
```javascript
// ❌ MAL: Obtener todos los documentos
const all = await getDocs(collection(db, 'appointments'));

// ✅ BIEN: Filtrar en el servidor
const q = query(
  collection(db, 'appointments'),
  where('date', '>=', today),
  limit(20)
);
```

### 3. Listener en Tiempo Real (Opcional)
```javascript
// Para panel admin: escuchar cambios en tiempo real
onSnapshot(appointmentsQuery, (snapshot) => {
  // Actualizar UI automáticamente
});
```

---

Esta estructura está diseñada para ser escalable, segura y eficiente en costos.
