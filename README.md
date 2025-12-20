# 🏥 Aesthetic Surgery Calendar

Sistema elegante de agendamiento de citas para cirugía plástica, desarrollado con React y Firebase.

## ✨ Características

- 📅 **Calendario interactivo** con buffer de 1 semana para programar citas
- 🕐 **Horarios de 6 AM a 7 PM** con slots cada 30 minutos
- 💅 **Diseño elegante y sofisticado** con animaciones fluidas
- 📱 **Totalmente responsive** - funciona en móvil, tablet y desktop
- 🔒 **Panel de administración** protegido con contraseña
- 📧 **Confirmación por email** automática al agendar
- 🔄 **Prevención de solapamiento** de citas según duración del procedimiento
- 📊 **Estadísticas** de citas en el panel admin
- 📥 **Exportación a CSV** de las citas

## 🚀 Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto
3. Activa **Firestore Database**
4. En Firestore, crea las siguientes **reglas de seguridad**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /appointments/{document=**} {
      allow read, write: if true;
    }
  }
}
```

5. Crea un índice compuesto en Firestore:
   - Collection: `appointments`
   - Fields: `date` (Ascending), `status` (Ascending)

6. Ve a **Configuración del proyecto** → **General** → **Tus apps**
7. Registra una app web y copia las credenciales

### 3. Configurar EmailJS (opcional, para confirmaciones por email)

1. Crea una cuenta en [EmailJS](https://www.emailjs.com/)
2. Configura un servicio de email (Gmail, Outlook, etc.)
3. Crea un template con estas variables:
   - `{{to_name}}` - Nombre del paciente
   - `{{to_email}}` - Email del paciente
   - `{{surgery_name}}` - Nombre del procedimiento
   - `{{appointment_date}}` - Fecha de la cita
   - `{{appointment_time}}` - Hora de la cita
   - `{{duration}}` - Duración del procedimiento

### 4. Variables de entorno

Crea un archivo `.env` en la raíz del proyecto (copia `.env.example`):

```env
# Firebase
REACT_APP_FIREBASE_API_KEY=tu_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=tu_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
REACT_APP_FIREBASE_APP_ID=tu_app_id

# EmailJS (opcional)
REACT_APP_EMAILJS_SERVICE_ID=tu_service_id
REACT_APP_EMAILJS_TEMPLATE_ID=tu_template_id
REACT_APP_EMAILJS_PUBLIC_KEY=tu_public_key

# Admin
REACT_APP_ADMIN_PASSWORD=tu_password_seguro
```

### 5. Iniciar la aplicación

```bash
npm start
```

La aplicación estará disponible en `http://localhost:3000`

## 🏗️ Estructura del Proyecto

```
src/
├── components/
│   ├── Header/
│   ├── StepIndicator/
│   ├── SurgerySelector/
│   ├── CalendarPicker/
│   ├── BookingForm/
│   └── AdminPanel/
├── config/
│   └── firebase.js
├── data/
│   └── surgeries.js
├── styles/
│   └── globals.css
├── App.js
└── index.js
```

## 📋 Procedimientos Incluidos

| Procedimiento | Duración |
|---------------|----------|
| Rinoplastia | 50 min |
| BBL (Brazilian Butt Lift) | 4 horas |
| Aumento de Busto | 2 horas |
| Liposucción | 3 horas |
| Lifting Facial | 3.5 horas |
| Blefaroplastia | 1.5 horas |
| Abdominoplastia | 3 horas |
| Otoplastia | 1 hora |
| Mentoplastia | 45 min |
| Braquioplastia | 2 horas |
| Lifting de Muslos | 2.5 horas |
| Reducción Mamaria | 3 horas |
| Mastopexia | 2.5 horas |
| Aumento de Labios | 30 min |
| Bichectomía | 40 min |

Para agregar más procedimientos, edita `src/data/surgeries.js`

## 🔐 Panel de Administración

Accede al panel admin haciendo clic en el ícono de engranaje (⚙️) en la esquina inferior derecha.

**Funcionalidades:**
- Ver todas las citas
- Filtrar por fecha, estado o búsqueda
- Confirmar/Cancelar citas
- Eliminar citas
- Ver estadísticas
- Exportar a CSV

**Contraseña por defecto:** `admin123` (cámbiala en las variables de entorno)

## 🎨 Personalización

### Colores
Edita las variables CSS en `src/styles/globals.css`:

```css
:root {
  --primary: #1a1a2e;
  --accent: #c9a962;
  --accent-light: #e4d4a7;
  /* ... */
}
```

### Horarios de atención
Edita `src/data/surgeries.js`:

```javascript
export const businessHours = {
  start: 6,  // 6 AM
  end: 19    // 7 PM
};

export const bufferDays = 7; // Días mínimos de anticipación
```

## 📦 Build para Producción

```bash
npm run build
```

Los archivos optimizados estarán en la carpeta `build/`

## 🚀 Deploy

### Vercel
```bash
npm i -g vercel
vercel
```

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

---

Desarrollado con ❤️
