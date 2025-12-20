# Estructura de Base de Datos - Aesthetic Surgery Calendar

## Firestore Database Schema

### Colecciones Principales

---

## 1. `appointments` (Citas)

Esta colección almacena todas las citas de cirugía agendadas por los pacientes.

### Estructura de Documento

```javascript
{
  // ID auto-generado por Firestore

  // Información del Paciente
  patientName: string,           // Nombre completo del paciente
  patientEmail: string,          // Email del paciente (lowercase)
  patientPhone: string,          // Teléfono de contacto

  // Información de la Cirugía
  surgeryId: string,             // ID del procedimiento (ej: 'rhinoplasty', 'bbl')
  surgeryName: string,           // Nombre del procedimiento (ej: 'Rinoplastia')
  duration: number,              // Duración en minutos

  // Información de Fecha/Hora
  date: Timestamp,               // Fecha y hora de la cita

  // Estado y Metadata
  status: string,                // 'confirmed' | 'completed' | 'cancelled' | 'rescheduled'
  createdAt: Timestamp,          // Fecha de creación del registro
  updatedAt: Timestamp,          // Última actualización (opcional)

  // Campos Opcionales
  notes: string,                 // Notas adicionales del paciente o admin
  cancellationReason: string,    // Razón de cancelación si aplica
  rescheduledFrom: string        // ID de la cita original si fue reprogramada
}
```

### Ejemplo de Documento

```javascript
{
  patientName: "María González López",
  patientEmail: "maria.gonzalez@email.com",
  patientPhone: "+52 55 1234 5678",
  surgeryId: "rhinoplasty",
  surgeryName: "Rinoplastia",
  duration: 50,
  date: Timestamp(2024-03-15 10:00:00),
  status: "confirmed",
  createdAt: Timestamp(2024-03-01 14:30:00)
}
```

### Índices Recomendados

```
appointments
  - date (Ascending)
  - status (Ascending)
  - patientEmail (Ascending)
  - Composite: status + date
```

---

## 2. `blockedDates` (Fechas Bloqueadas)

Esta colección permite bloquear fechas específicas donde no se pueden agendar citas (vacaciones, días festivos, mantenimiento, etc.)

### Estructura de Documento

```javascript
{
  // ID auto-generado por Firestore

  date: Timestamp,               // Fecha bloqueada (hora en 00:00:00)
  reason: string,                // Razón del bloqueo (ej: "Vacaciones", "Día festivo")
  isFullDay: boolean,            // true = día completo, false = parcial

  // Si isFullDay es false:
  startTime: string,             // Hora de inicio (formato "HH:mm")
  endTime: string,               // Hora de fin (formato "HH:mm")

  createdAt: Timestamp,          // Fecha de creación
  createdBy: string              // Email del admin que lo creó (opcional)
}
```

### Ejemplo de Documento

```javascript
{
  date: Timestamp(2024-12-25 00:00:00),
  reason: "Navidad",
  isFullDay: true,
  createdAt: Timestamp(2024-11-01 10:00:00),
  createdBy: "admin@clinic.com"
}
```

---

## 3. `settings` (Configuración)

Documento único para configuraciones globales del sistema.

### Estructura de Documento

**ID del documento: `general`**

```javascript
{
  // Horario de Atención
  businessHours: {
    start: number,               // Hora de inicio (0-23)
    end: number,                 // Hora de fin (0-23)
    daysOfWeek: number[]         // [1,2,3,4,5] = Lun-Vie (1=Lunes, 7=Domingo)
  },

  // Políticas de Reservación
  bufferDays: number,            // Días mínimos de anticipación
  slotDuration: number,          // Duración de cada slot en minutos (default: 15)
  maxAppointmentsPerDay: number, // Límite de citas por día (opcional)

  // Información de Contacto
  clinicInfo: {
    name: string,
    phone: string,
    email: string,
    address: string,
    website: string
  },

  // Configuración de Email
  emailConfig: {
    sendConfirmation: boolean,
    sendReminder: boolean,
    reminderDaysBefore: number
  },

  // Última actualización
  updatedAt: Timestamp
}
```

### Ejemplo de Documento

```javascript
{
  businessHours: {
    start: 6,
    end: 19,
    daysOfWeek: [1, 2, 3, 4, 5, 6]
  },
  bufferDays: 7,
  slotDuration: 15,
  maxAppointmentsPerDay: 10,
  clinicInfo: {
    name: "Aesthetic Surgery Center",
    phone: "+52 55 1234 5678",
    email: "info@aestheticsurgery.com",
    address: "Av. Principal 123, CDMX",
    website: "www.aestheticsurgery.com"
  },
  emailConfig: {
    sendConfirmation: true,
    sendReminder: true,
    reminderDaysBefore: 3
  },
  updatedAt: Timestamp.now()
}
```

---

## 4. `surgeryProcedures` (Procedimientos - Opcional)

Si deseas gestionar los procedimientos desde la base de datos en lugar de código.

### Estructura de Documento

**ID del documento: usar el mismo ID que en código (ej: `rhinoplasty`)**

```javascript
{
  id: string,                    // ID único del procedimiento
  name: string,                  // Nombre del procedimiento
  duration: number,              // Duración en minutos
  category: string,              // 'Facial' | 'Corporal'
  icon: string,                  // Emoji o código
  description: string,           // Descripción detallada

  // Información Adicional
  price: number,                 // Precio estimado (opcional)
  isActive: boolean,             // Si está disponible para agendar
  requiresConsultation: boolean, // Si requiere consulta previa

  // Metadata
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## 5. `notifications` (Notificaciones - Opcional)

Para trackear emails y notificaciones enviadas.

### Estructura de Documento

```javascript
{
  appointmentId: string,         // Referencia a la cita
  type: string,                  // 'confirmation' | 'reminder' | 'cancellation'
  recipientEmail: string,        // Email del destinatario
  sentAt: Timestamp,             // Cuándo se envió
  status: string,                // 'sent' | 'failed' | 'bounced'
  errorMessage: string           // Si falló, el mensaje de error
}
```

---

## Estados de Citas (status)

| Estado | Descripción |
|--------|-------------|
| `confirmed` | Cita confirmada y activa |
| `completed` | Cirugía completada |
| `cancelled` | Cita cancelada |
| `rescheduled` | Cita reprogramada |
| `no-show` | Paciente no se presentó |
| `pending` | En espera de confirmación (futuro) |

---

## Reglas de Validación Recomendadas

### Para `appointments`:
- `patientName`: mínimo 3 caracteres
- `patientEmail`: formato válido de email
- `patientPhone`: mínimo 10 dígitos
- `date`: debe ser fecha futura
- `status`: debe ser uno de los valores permitidos
- `duration`: número positivo mayor a 0

### Para `blockedDates`:
- `date`: debe ser fecha válida
- `isFullDay`: boolean requerido

---

## Consultas Comunes

### 1. Obtener citas de un día específico
```javascript
const q = query(
  collection(db, 'appointments'),
  where('date', '>=', startOfDay),
  where('date', '<', endOfDay),
  where('status', '==', 'confirmed')
);
```

### 2. Obtener citas de un paciente
```javascript
const q = query(
  collection(db, 'appointments'),
  where('patientEmail', '==', email),
  orderBy('date', 'desc')
);
```

### 3. Obtener fechas bloqueadas del mes
```javascript
const q = query(
  collection(db, 'blockedDates'),
  where('date', '>=', startOfMonth),
  where('date', '<=', endOfMonth)
);
```

### 4. Verificar disponibilidad de horario
```javascript
const q = query(
  collection(db, 'appointments'),
  where('date', '>=', slotStart),
  where('date', '<', slotEnd),
  where('status', 'in', ['confirmed', 'pending'])
);
```

---

## Notas de Implementación

1. **Timestamps**: Usar siempre `Timestamp.fromDate()` para fechas
2. **Emails**: Guardar siempre en lowercase para búsquedas consistentes
3. **Time Zones**: Considerar zona horaria de México (America/Mexico_City)
4. **Backup**: Configurar backups automáticos en Firebase Console
5. **Seguridad**: Implementar reglas de seguridad apropiadas (ver `firestore.rules`)

---

## Migración de Datos Existentes

Si ya tienes datos en código que quieres migrar a Firestore, ejecuta el script:
```bash
npm run migrate-surgeries
```

Esto poblará la colección `surgeryProcedures` con los datos de `src/data/surgeries.js`.
