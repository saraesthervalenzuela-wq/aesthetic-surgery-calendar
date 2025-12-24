// Surgery procedures with durations in minutes
// Size categories: 'small' (<=60min), 'medium' (61-180min), 'large' (>180min)

export const surgeries = [
  // ============================================
  // CIRUGÍAS PEQUEÑAS (hasta 1 hora)
  // ============================================
  {
    id: 'lip-augmentation',
    name: 'Aumento de Labios',
    duration: 30,
    category: 'Facial',
    size: 'small',
    icon: '💋',
    description: 'Aumento y definición de labios'
  },
  {
    id: 'bichectomy',
    name: 'Bichectomía',
    duration: 40,
    category: 'Facial',
    size: 'small',
    icon: '✨',
    description: 'Reducción de mejillas para rostro más definido'
  },
  {
    id: 'mentoplasty',
    name: 'Mentoplastia',
    duration: 45,
    category: 'Facial',
    size: 'small',
    icon: '🗿',
    description: 'Aumento o reducción del mentón'
  },
  {
    id: 'rhinoplasty',
    name: 'Rinoplastia',
    duration: 50,
    category: 'Facial',
    size: 'small',
    icon: '👃',
    description: 'Remodelación de nariz para mejorar forma y función'
  },
  {
    id: 'gastric-balloon',
    name: 'Balón Gástrico',
    duration: 30,
    category: 'Bariatría',
    size: 'small',
    icon: '🎈',
    description: 'Colocación de balón intragástrico temporal'
  },
  {
    id: 'otoplasty',
    name: 'Otoplastia',
    duration: 60,
    category: 'Facial',
    size: 'small',
    icon: '👂',
    description: 'Corrección de orejas prominentes o deformidades'
  },

  // ============================================
  // CIRUGÍAS MEDIANAS (más de 1 hora hasta 3 horas)
  // ============================================
  {
    id: 'blepharoplasty',
    name: 'Blefaroplastia',
    duration: 90,
    category: 'Facial',
    size: 'medium',
    icon: '👁️',
    description: 'Cirugía de párpados para rejuvenecer la mirada'
  },
  {
    id: 'breast-augmentation',
    name: 'Aumento de Busto',
    duration: 120,
    category: 'Corporal',
    size: 'medium',
    icon: '💎',
    description: 'Aumento mamario con implantes de silicón'
  },
  {
    id: 'arm-lift',
    name: 'Braquioplastia',
    duration: 120,
    category: 'Corporal',
    size: 'medium',
    icon: '💫',
    description: 'Lifting de brazos para eliminar flacidez'
  },
  {
    id: 'thigh-lift',
    name: 'Lifting de Muslos',
    duration: 150,
    category: 'Corporal',
    size: 'medium',
    icon: '🦵',
    description: 'Remodelación y tonificación de muslos'
  },
  {
    id: 'breast-lift',
    name: 'Mastopexia',
    duration: 150,
    category: 'Corporal',
    size: 'medium',
    icon: '⭐',
    description: 'Elevación de senos caídos sin implantes'
  },
  {
    id: 'liposuction',
    name: 'Liposucción',
    duration: 180,
    category: 'Corporal',
    size: 'medium',
    icon: '✨',
    description: 'Eliminación de grasa localizada en diversas áreas'
  },
  {
    id: 'breast-reduction',
    name: 'Reducción Mamaria',
    duration: 180,
    category: 'Corporal',
    size: 'medium',
    icon: '🎀',
    description: 'Reducción del tamaño de los senos'
  },
  {
    id: 'gastric-band',
    name: 'Banda Gástrica',
    duration: 90,
    category: 'Bariatría',
    size: 'medium',
    icon: '🔗',
    description: 'Colocación de banda ajustable en el estómago'
  },
  {
    id: 'gastric-sleeve',
    name: 'Manga Gástrica',
    duration: 120,
    category: 'Bariatría',
    size: 'medium',
    icon: '🏥',
    description: 'Reducción del estómago para pérdida de peso'
  },
  {
    id: 'gastric-bypass',
    name: 'Bypass Gástrico',
    duration: 180,
    category: 'Bariatría',
    size: 'medium',
    icon: '⚕️',
    description: 'Cirugía de derivación gástrica para obesidad'
  },

  // ============================================
  // CIRUGÍAS GRANDES (más de 3 horas)
  // ============================================
  {
    id: 'abdominoplasty',
    name: 'Abdominoplastia',
    duration: 180,
    category: 'Corporal',
    size: 'large',
    icon: '💪',
    description: 'Remodelación del abdomen y eliminación de exceso de piel'
  },
  {
    id: 'facelift',
    name: 'Lifting Facial',
    duration: 210,
    category: 'Facial',
    size: 'large',
    icon: '🌟',
    description: 'Rejuvenecimiento facial mediante estiramiento de piel'
  },
  {
    id: 'bbl',
    name: 'BBL (Brazilian Butt Lift)',
    duration: 240,
    category: 'Corporal',
    size: 'large',
    icon: '🍑',
    description: 'Aumento y remodelación de glúteos con grasa propia'
  },
  {
    id: 'duodenal-switch',
    name: 'Derivación Biliopancreática',
    duration: 240,
    category: 'Bariatría',
    size: 'large',
    icon: '🏨',
    description: 'Cirugía bariátrica compleja para obesidad severa'
  },
  {
    id: 'revisional-bariatric',
    name: 'Cirugía Bariátrica Revisional',
    duration: 180,
    category: 'Bariatría',
    size: 'large',
    icon: '🔄',
    description: 'Revisión o corrección de cirugía bariátrica previa'
  }
];

// Helper function to format duration
export const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}min`;
};

// Business hours
export const businessHours = {
  start: 6,  // 6 AM
  end: 16    // 4 PM
};

// Buffer days (minimum days before appointment)
export const bufferDays = 7;

// Get categories
export const getCategories = () => {
  return [...new Set(surgeries.map(s => s.category))];
};

// ============================================
// DAILY APPOINTMENT LIMITS BY SIZE
// ============================================

// Maximum appointments per day by surgery size
export const dailyLimits = {
  // Arreglo 1: 3 grandes, 3 medianas, 4 chicas
  // Arreglo 2: 3 grandes, 0 medianas, 7 chicas
  // Arreglo 3: 0 grandes, 5 medianas, 6 chicas
  // Arreglo 4: 0 grandes, 0 medianas, 10 chicas
  large: 3,
  medium: 5,
  small: 10,
  total: 10
};

// Valid combinations of appointments per day
export const validCombinations = [
  { large: 3, medium: 3, small: 4, name: 'Arreglo 1' },
  { large: 3, medium: 0, small: 7, name: 'Arreglo 2' },
  { large: 0, medium: 5, small: 6, name: 'Arreglo 3' },
  { large: 0, medium: 0, small: 10, name: 'Arreglo 4' }
];

// ============================================
// DAY RESTRICTIONS BY SURGERY TYPE
// ============================================

// Days of week: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
export const dayRestrictions = {
  // Martes a Jueves: Solo cirugías plásticas (Facial, Corporal)
  plastic: [2, 3, 4], // Tuesday, Wednesday, Thursday
  // Viernes a Lunes: Solo cirugías bariátricas
  bariatric: [5, 6, 0, 1] // Friday, Saturday, Sunday, Monday
};

// Check if a surgery type is allowed on a specific day
export const isSurgeryAllowedOnDay = (surgery, date) => {
  const dayOfWeek = date.getDay();

  if (surgery.category === 'Bariatría') {
    return dayRestrictions.bariatric.includes(dayOfWeek);
  } else {
    // Facial and Corporal are plastic surgeries
    return dayRestrictions.plastic.includes(dayOfWeek);
  }
};

// Get surgery size category
export const getSurgerySize = (surgery) => {
  return surgery.size || 'medium';
};

// Count procedures by size from appointments
export const countProceduresBySize = (appointments) => {
  const counts = { large: 0, medium: 0, small: 0 };

  appointments.forEach(apt => {
    // Handle both single procedure appointments and multi-procedure appointments
    if (apt.procedures && Array.isArray(apt.procedures)) {
      apt.procedures.forEach(proc => {
        const size = proc.size || 'medium';
        counts[size]++;
      });
    } else {
      // Fallback for old format or direct procedure objects
      const size = apt.size || 'medium';
      counts[size]++;
    }
  });

  return counts;
};

// Find which valid combinations are still possible given current counts
// A combination is valid ONLY if:
// 1. The counts don't exceed the arreglo's limits
// 2. If an arreglo has 0 for a size, we can't use it if we have any of that size
export const getValidCombinationsForCounts = (counts) => {
  return validCombinations.filter(combo => {
    // Check limits
    if (counts.large > combo.large) return false;
    if (counts.medium > combo.medium) return false;
    if (counts.small > combo.small) return false;

    // If arreglo doesn't allow a size (limit is 0), we can't have ANY of that size
    if (combo.large === 0 && counts.large > 0) return false;
    if (combo.medium === 0 && counts.medium > 0) return false;
    if (combo.small === 0 && counts.small > 0) return false;

    return true;
  });
};

// Check if adding a new appointment would exceed daily limits
export const canAddAppointment = (existingAppointments, newSurgery) => {
  const counts = countProceduresBySize(existingAppointments);

  // Add the new surgery
  const newSize = getSurgerySize(newSurgery);
  counts[newSize]++;

  // Check if any valid combination allows this exact count
  const validCombos = getValidCombinationsForCounts(counts);
  return validCombos.length > 0;
};

// Check if adding multiple procedures would exceed daily limits
export const canAddMultipleProcedures = (existingAppointments, newProcedures) => {
  const existingCounts = countProceduresBySize(existingAppointments);
  const counts = { ...existingCounts };

  // Add all new procedures
  newProcedures.forEach(proc => {
    const size = getSurgerySize(proc);
    counts[size]++;
  });

  // Check if any valid combination allows this
  const validCombos = getValidCombinationsForCounts(counts);

  console.log('canAddMultipleProcedures:', {
    existingCounts,
    newProcedures: newProcedures.map(p => p.size),
    totalCounts: counts,
    validCombos: validCombos.map(c => c.name),
    result: validCombos.length > 0
  });

  return validCombos.length > 0;
};

// Get remaining slots for each size category
export const getRemainingSlots = (existingAppointments) => {
  const counts = countProceduresBySize(existingAppointments);

  // Find all valid combinations that can still accommodate the current counts
  const validCombos = getValidCombinationsForCounts(counts);

  if (validCombos.length === 0) {
    return { large: 0, medium: 0, small: 0 };
  }

  // For each size, check if adding one more would still be valid
  // This gives us the TRUE remaining capacity
  const remaining = { large: 0, medium: 0, small: 0 };

  // Check if we can add one more large
  const countsWithLarge = { ...counts, large: counts.large + 1 };
  if (getValidCombinationsForCounts(countsWithLarge).length > 0) {
    // Find max large we can still add
    for (let i = 1; i <= 3; i++) {
      const testCounts = { ...counts, large: counts.large + i };
      if (getValidCombinationsForCounts(testCounts).length > 0) {
        remaining.large = i;
      } else {
        break;
      }
    }
  }

  // Check if we can add one more medium
  const countsWithMedium = { ...counts, medium: counts.medium + 1 };
  if (getValidCombinationsForCounts(countsWithMedium).length > 0) {
    // Find max medium we can still add
    for (let i = 1; i <= 5; i++) {
      const testCounts = { ...counts, medium: counts.medium + i };
      if (getValidCombinationsForCounts(testCounts).length > 0) {
        remaining.medium = i;
      } else {
        break;
      }
    }
  }

  // Check if we can add one more small
  const countsWithSmall = { ...counts, small: counts.small + 1 };
  if (getValidCombinationsForCounts(countsWithSmall).length > 0) {
    // Find max small we can still add
    for (let i = 1; i <= 10; i++) {
      const testCounts = { ...counts, small: counts.small + i };
      if (getValidCombinationsForCounts(testCounts).length > 0) {
        remaining.small = i;
      } else {
        break;
      }
    }
  }

  return remaining;
};

// Get day type label
export const getDayTypeLabel = (date) => {
  const dayOfWeek = date.getDay();
  if (dayRestrictions.plastic.includes(dayOfWeek)) {
    return 'Cirugías Plásticas';
  }
  return 'Cirugías Bariátricas';
};

// Get size label in Spanish
export const getSizeLabel = (size) => {
  const labels = {
    small: 'Pequeña',
    medium: 'Mediana',
    large: 'Grande'
  };
  return labels[size] || 'Mediana';
};
