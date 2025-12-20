# Base de Datos - Resumen Rápido

## Archivos Creados

| Archivo | Propósito |
|---------|-----------|
| `DATABASE_STRUCTURE.md` | Diseño completo de la estructura de la base de datos |
| `FIREBASE_SETUP.md` | Guía paso a paso para configurar Firebase |
| `firestore.rules` | Reglas de seguridad de Firestore |
| `src/scripts/initializeDatabase.js` | Script para inicializar la base de datos |
| `src/utils/firestoreQueries.js` | Funciones útiles para consultas a Firestore |
| `.env.example` | Plantilla para variables de entorno |

---

## Inicio Rápido

### 1. Configurar Firebase (Primera vez)

```bash
# 1. Crear proyecto en Firebase Console
# https://console.firebase.google.com/

# 2. Crear archivo .env basado en .env.example
cp .env.example .env

# 3. Copiar tus credenciales de Firebase al archivo .env
# (Obtén las credenciales de Firebase Console)
```

### 2. Inicializar Base de Datos

```bash
# Opción A: Ejecutar script automático
npm run init-db

# Opción B: Manual desde Firebase Console
# Ver FIREBASE_SETUP.md para instrucciones detalladas
```

### 3. Configurar Reglas de Seguridad

```bash
# 1. Ir a Firebase Console > Firestore Database > Reglas
# 2. Copiar contenido de firestore.rules
# 3. Publicar las reglas
```

---

## Estructura de Colecciones

### Principales

1. **appointments** - Citas agendadas
   - Uso: Almacenar todas las reservaciones de pacientes
   - Permisos: Creación pública, lectura solo admin

2. **blockedDates** - Fechas bloqueadas
   - Uso: Marcar días festivos o no laborables
   - Permisos: Lectura pública, escritura solo admin

3. **settings** - Configuración global
   - Documento único: `general`
   - Uso: Horarios, políticas, información de clínica
   - Permisos: Lectura pública, escritura solo admin

### Opcionales

4. **surgeryProcedures** - Catálogo de procedimientos
5. **notifications** - Log de notificaciones enviadas

---

## Funciones Útiles Disponibles

El archivo `src/utils/firestoreQueries.js` incluye funciones listas para usar:

```javascript
import {
  getAppointmentsByDate,
  isTimeSlotAvailable,
  createAppointment,
  cancelAppointment,
  getBlockedDatesForMonth,
  blockDate,
  getSettings
} from './utils/firestoreQueries';

// Ejemplo: Obtener citas de hoy
const today = new Date();
const appointments = await getAppointmentsByDate(today);

// Ejemplo: Verificar disponibilidad
const slotDate = new Date(2024, 2, 15, 10, 0); // 15 marzo 10:00
const available = await isTimeSlotAvailable(slotDate, 60); // 60 min

// Ejemplo: Crear cita
await createAppointment({
  patientName: "Juan Pérez",
  patientEmail: "juan@example.com",
  patientPhone: "+52 55 1234 5678",
  surgeryId: "rhinoplasty",
  surgeryName: "Rinoplastia",
  duration: 50,
  date: Timestamp.fromDate(slotDate),
  status: "confirmed"
});
```

---

## Estados de Citas

| Estado | Descripción |
|--------|-------------|
| `confirmed` | Cita confirmada y activa |
| `completed` | Cirugía completada |
| `cancelled` | Cita cancelada |
| `rescheduled` | Cita reprogramada |
| `no-show` | Paciente no se presentó |
| `pending` | En espera de confirmación |

---

## Consultas Comunes

### Obtener citas de un día
```javascript
const appointments = await getAppointmentsByDate(new Date('2024-03-15'));
```

### Verificar si una fecha está bloqueada
```javascript
const blocked = await isDateBlocked(new Date('2024-12-25'));
```

### Obtener configuración
```javascript
const settings = await getSettings();
console.log(settings.businessHours); // { start: 6, end: 19, ... }
```

### Cancelar una cita
```javascript
await cancelAppointment('appointment-id', 'Conflicto de horarios');
```

### Bloquear una fecha
```javascript
await blockDate(new Date('2024-12-25'), 'Navidad', true);
```

---

## Variables de Entorno Requeridas

```bash
# Firebase (OBLIGATORIO)
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=

# EmailJS (OPCIONAL - para notificaciones)
REACT_APP_EMAILJS_SERVICE_ID=
REACT_APP_EMAILJS_TEMPLATE_ID=
REACT_APP_EMAILJS_PUBLIC_KEY=
```

---

## Índices de Firestore

Crear estos índices para mejor performance:

1. **appointments**: `status` (Asc) + `date` (Asc)
2. **appointments**: `patientEmail` (Asc) + `date` (Desc)

Firebase te pedirá crearlos automáticamente cuando hagas consultas compuestas.

---

## Reglas de Seguridad (Resumen)

Las reglas en `firestore.rules` permiten:

✅ **Permitido:**
- Cualquiera puede crear citas (booking público)
- Cualquiera puede leer configuraciones y fechas bloqueadas
- Cualquiera puede leer procedimientos de cirugía

❌ **Restringido:**
- Solo admins pueden ver todas las citas
- Solo admins pueden modificar/cancelar citas
- Solo admins pueden cambiar configuraciones
- Solo admins pueden bloquear/desbloquear fechas

---

## Siguientes Pasos

1. ✅ Lee `FIREBASE_SETUP.md` para configuración detallada
2. ✅ Revisa `DATABASE_STRUCTURE.md` para entender el diseño
3. ✅ Configura tu proyecto Firebase
4. ✅ Crea archivo `.env` con tus credenciales
5. ✅ Ejecuta `npm run init-db` para inicializar
6. ✅ Sube las reglas de seguridad
7. ✅ Prueba crear una cita desde la app

---

## Soporte y Documentación

- **Firebase Firestore**: https://firebase.google.com/docs/firestore
- **Reglas de Seguridad**: https://firebase.google.com/docs/firestore/security/get-started
- **EmailJS**: https://www.emailjs.com/docs/

---

## Troubleshooting Rápido

**Error: "Missing or insufficient permissions"**
- Verifica que subiste las reglas de `firestore.rules`

**No se guardan las citas**
- Revisa la consola del navegador para errores
- Verifica que la fecha de la cita sea futura
- Asegúrate que Firebase está inicializado

**No llegan emails**
- Verifica configuración de EmailJS en `.env`
- Revisa la consola para errores de EmailJS

---

¿Necesitas ayuda? Revisa los archivos de documentación detallados o abre un issue.
