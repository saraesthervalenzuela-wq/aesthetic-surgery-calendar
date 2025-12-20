# Guía de Configuración de Firebase

Esta guía te ayudará a configurar completamente Firebase y la base de datos Firestore para tu aplicación de Calendario de Cirugía Estética.

---

## 1. Crear Proyecto en Firebase Console

### Paso 1: Acceder a Firebase Console
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en **"Agregar proyecto"** o **"Add project"**

### Paso 2: Configurar el Proyecto
1. **Nombre del proyecto**: Elige un nombre (ej: `aesthetic-surgery-calendar`)
2. **Google Analytics**: Puedes habilitarlo o deshabilitarlo según prefieras
3. Haz clic en **"Crear proyecto"**
4. Espera a que Firebase configure tu proyecto

---

## 2. Configurar Firestore Database

### Paso 1: Crear Base de Datos
1. En el menú lateral, ve a **"Firestore Database"**
2. Haz clic en **"Crear base de datos"** o **"Create database"**

### Paso 2: Configurar Seguridad
**Importante**: Selecciona el modo apropiado:
- **Modo de prueba**: Para desarrollo inicial (datos públicos temporalmente)
  - ⚠️ Recuerda cambiar las reglas antes de producción
- **Modo producción**: Con reglas de seguridad desde el inicio (recomendado)

### Paso 3: Seleccionar Ubicación
- Elige la región más cercana a tus usuarios
- Para México: `us-central` o `southamerica-east1`
- ⚠️ **Esta configuración no se puede cambiar después**

---

## 3. Obtener Credenciales de Firebase

### Paso 1: Registrar tu App Web
1. En la página principal del proyecto, haz clic en el ícono **Web** (`</>`)
2. Dale un nombre a tu app (ej: "Aesthetic Surgery Web App")
3. **No** marques "Firebase Hosting" por ahora
4. Haz clic en **"Registrar app"**

### Paso 2: Copiar Configuración
Firebase te mostrará un objeto `firebaseConfig`. Se verá así:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

---

## 4. Configurar Variables de Entorno

### Paso 1: Crear archivo .env
En la raíz de tu proyecto, crea un archivo llamado `.env`:

```bash
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=tu_api_key_aqui
REACT_APP_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=tu_proyecto_id
REACT_APP_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
REACT_APP_FIREBASE_APP_ID=tu_app_id

# EmailJS Configuration (opcional - para notificaciones)
REACT_APP_EMAILJS_SERVICE_ID=tu_service_id
REACT_APP_EMAILJS_TEMPLATE_ID=tu_template_id
REACT_APP_EMAILJS_PUBLIC_KEY=tu_public_key
```

### Paso 2: Agregar .env al .gitignore
Asegúrate de que `.env` esté en tu `.gitignore`:

```
.env
.env.local
.env.production
```

---

## 5. Inicializar la Base de Datos

### Opción A: Manual (Firebase Console)

#### 1. Crear Colección `settings`
1. Ve a Firestore Database
2. Haz clic en **"Iniciar colección"**
3. ID de colección: `settings`
4. ID de documento: `general`
5. Agrega los campos del documento:

```javascript
{
  "businessHours": {
    "start": 6,
    "end": 19,
    "daysOfWeek": [1, 2, 3, 4, 5, 6]
  },
  "bufferDays": 7,
  "slotDuration": 15,
  "maxAppointmentsPerDay": 10,
  "clinicInfo": {
    "name": "Aesthetic Surgery Center",
    "phone": "+52 55 1234 5678",
    "email": "info@aestheticsurgery.com",
    "address": "Av. Principal 123, CDMX",
    "website": "www.aestheticsurgery.com"
  },
  "emailConfig": {
    "sendConfirmation": true,
    "sendReminder": true,
    "reminderDaysBefore": 3
  }
}
```

#### 2. Crear otras colecciones vacías
- `appointments` (vacía por ahora)
- `blockedDates` (vacía por ahora)
- `surgeryProcedures` (opcional)

### Opción B: Script Automático (Recomendado)

```bash
# Instalar dependencias necesarias
npm install

# Ejecutar script de inicialización
node src/scripts/initializeDatabase.js
```

---

## 6. Configurar Reglas de Seguridad

### Paso 1: Ir a Reglas
1. En Firestore Database, ve a la pestaña **"Reglas"** o **"Rules"**

### Paso 2: Copiar Reglas
Copia el contenido del archivo `firestore.rules` y pégalo en el editor

### Paso 3: Publicar Reglas
1. Haz clic en **"Publicar"** o **"Publish"**
2. Confirma los cambios

### Reglas Básicas de Seguridad

Las reglas incluidas permiten:
- ✅ Cualquiera puede crear citas (booking público)
- ✅ Cualquiera puede leer configuraciones y fechas bloqueadas
- ❌ Solo admins pueden ver todas las citas
- ❌ Solo admins pueden modificar configuraciones

---

## 7. Crear Índices (Importante para Performance)

### Índices Necesarios

Firebase puede pedirte crear índices automáticamente cuando hagas consultas. Alternativamente, créalos manualmente:

1. Ve a **Firestore Database** > **Índices**
2. Crea los siguientes índices compuestos:

#### Índice 1: Appointments por estado y fecha
- Colección: `appointments`
- Campos:
  - `status` (Ascending)
  - `date` (Ascending)

#### Índice 2: Appointments por email
- Colección: `appointments`
- Campos:
  - `patientEmail` (Ascending)
  - `date` (Descending)

---

## 8. Configurar EmailJS (Opcional - para notificaciones)

### Paso 1: Crear cuenta en EmailJS
1. Ve a [EmailJS.com](https://www.emailjs.com/)
2. Crea una cuenta gratuita

### Paso 2: Configurar Servicio de Email
1. Conecta tu servicio de email (Gmail, Outlook, etc.)
2. Copia el **Service ID**

### Paso 3: Crear Template
1. Ve a **Email Templates**
2. Crea un nuevo template con variables:
   - `{{to_name}}`
   - `{{surgery_name}}`
   - `{{appointment_date}}`
   - `{{appointment_time}}`
3. Copia el **Template ID**

### Paso 4: Obtener Public Key
1. Ve a **Account** > **General**
2. Copia tu **Public Key**

### Paso 5: Agregar a .env
```bash
REACT_APP_EMAILJS_SERVICE_ID=service_xxxxxx
REACT_APP_EMAILJS_TEMPLATE_ID=template_xxxxxx
REACT_APP_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxx
```

---

## 9. Probar la Configuración

### Verificación Paso a Paso

1. **Iniciar la aplicación**:
   ```bash
   npm start
   ```

2. **Verificar conexión**: Abre la consola del navegador, deberías ver:
   ```
   Firebase project: tu-proyecto-id
   ```

3. **Crear una cita de prueba**:
   - Selecciona un procedimiento
   - Elige una fecha
   - Completa el formulario
   - Envía la cita

4. **Verificar en Firebase Console**:
   - Ve a Firestore Database
   - Busca la colección `appointments`
   - Deberías ver tu cita creada

---

## 10. Troubleshooting (Solución de Problemas)

### Error: "Missing or insufficient permissions"
**Problema**: Las reglas de seguridad están bloqueando la operación
**Solución**:
- Verifica que subiste las reglas de `firestore.rules`
- Temporalmente puedes usar reglas de prueba (solo para desarrollo):
  ```
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /{document=**} {
        allow read, write: if true;
      }
    }
  }
  ```
  ⚠️ **Nunca uses esto en producción**

### Error: "Firebase: No Firebase App"
**Problema**: Firebase no está inicializado correctamente
**Solución**:
- Verifica que el archivo `.env` existe y tiene las variables correctas
- Reinicia el servidor de desarrollo (`npm start`)

### Las citas no se guardan
**Problema**: Error al escribir en Firestore
**Solución**:
- Abre la consola del navegador y busca errores
- Verifica que las reglas de Firestore permitan escritura
- Verifica que la fecha de la cita sea futura

### No llegan emails
**Problema**: EmailJS no está configurado
**Solución**:
- Verifica las credenciales de EmailJS en `.env`
- Verifica que el template esté activo
- Revisa la consola para errores de EmailJS

---

## 11. Backup y Seguridad

### Configurar Backups Automáticos
1. Ve a **Firestore Database** > **Importar/Exportar**
2. Configura backups automáticos (requiere plan Blaze)

### Mejores Prácticas
- ✅ Nunca compartas tu archivo `.env`
- ✅ Usa diferentes proyectos para desarrollo y producción
- ✅ Monitorea el uso en Firebase Console
- ✅ Revisa los logs regularmente
- ✅ Actualiza las reglas de seguridad antes de producción

---

## 12. Recursos Adicionales

- [Documentación de Firestore](https://firebase.google.com/docs/firestore)
- [Guía de Reglas de Seguridad](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Console](https://console.firebase.google.com/)
- [EmailJS Documentation](https://www.emailjs.com/docs/)

---

## Checklist Final

Antes de ir a producción, verifica:

- [ ] Proyecto de Firebase creado
- [ ] Firestore Database configurada
- [ ] Variables de entorno en `.env` configuradas
- [ ] Base de datos inicializada (settings creado)
- [ ] Reglas de seguridad publicadas
- [ ] Índices creados
- [ ] EmailJS configurado (opcional)
- [ ] Prueba de crear cita exitosa
- [ ] Backup configurado
- [ ] `.env` en `.gitignore`

---

¡Listo! Tu base de datos de Firebase está configurada y lista para usar.
