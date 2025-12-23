// Surgery procedures with durations in minutes
export const surgeries = [
  {
    id: 'rhinoplasty',
    name: 'Rinoplastia',
    duration: 50,
    category: 'Facial',
    icon: '👃',
    description: 'Remodelación de nariz para mejorar forma y función'
  },
  {
    id: 'bbl',
    name: 'BBL (Brazilian Butt Lift)',
    duration: 240,
    category: 'Corporal',
    icon: '🍑',
    description: 'Aumento y remodelación de glúteos con grasa propia'
  },
  {
    id: 'breast-augmentation',
    name: 'Aumento de Busto',
    duration: 120,
    category: 'Corporal',
    icon: '💎',
    description: 'Aumento mamario con implantes de silicón'
  },
  {
    id: 'liposuction',
    name: 'Liposucción',
    duration: 180,
    category: 'Corporal',
    icon: '✨',
    description: 'Eliminación de grasa localizada en diversas áreas'
  },
  {
    id: 'facelift',
    name: 'Lifting Facial',
    duration: 210,
    category: 'Facial',
    icon: '🌟',
    description: 'Rejuvenecimiento facial mediante estiramiento de piel'
  },
  {
    id: 'blepharoplasty',
    name: 'Blefaroplastia',
    duration: 90,
    category: 'Facial',
    icon: '👁️',
    description: 'Cirugía de párpados para rejuvenecer la mirada'
  },
  {
    id: 'abdominoplasty',
    name: 'Abdominoplastia',
    duration: 180,
    category: 'Corporal',
    icon: '💪',
    description: 'Remodelación del abdomen y eliminación de exceso de piel'
  },
  {
    id: 'otoplasty',
    name: 'Otoplastia',
    duration: 60,
    category: 'Facial',
    icon: '👂',
    description: 'Corrección de orejas prominentes o deformidades'
  },
  {
    id: 'mentoplasty',
    name: 'Mentoplastia',
    duration: 45,
    category: 'Facial',
    icon: '🗿',
    description: 'Aumento o reducción del mentón'
  },
  {
    id: 'arm-lift',
    name: 'Braquioplastia',
    duration: 120,
    category: 'Corporal',
    icon: '💫',
    description: 'Lifting de brazos para eliminar flacidez'
  },
  {
    id: 'thigh-lift',
    name: 'Lifting de Muslos',
    duration: 150,
    category: 'Corporal',
    icon: '🦵',
    description: 'Remodelación y tonificación de muslos'
  },
  {
    id: 'breast-reduction',
    name: 'Reducción Mamaria',
    duration: 180,
    category: 'Corporal',
    icon: '🎀',
    description: 'Reducción del tamaño de los senos'
  },
  {
    id: 'breast-lift',
    name: 'Mastopexia',
    duration: 150,
    category: 'Corporal',
    icon: '⭐',
    description: 'Elevación de senos caídos sin implantes'
  },
  {
    id: 'lip-augmentation',
    name: 'Aumento de Labios',
    duration: 30,
    category: 'Facial',
    icon: '💋',
    description: 'Aumento y definición de labios'
  },
  {
    id: 'bichectomy',
    name: 'Bichectomía',
    duration: 40,
    category: 'Facial',
    icon: '✨',
    description: 'Reducción de mejillas para rostro más definido'
  },
  // Procedimientos Bariátricos
  {
    id: 'gastric-sleeve',
    name: 'Manga Gástrica',
    duration: 120,
    category: 'Bariatría',
    icon: '🏥',
    description: 'Reducción del estómago para pérdida de peso'
  },
  {
    id: 'gastric-bypass',
    name: 'Bypass Gástrico',
    duration: 180,
    category: 'Bariatría',
    icon: '⚕️',
    description: 'Cirugía de derivación gástrica para obesidad'
  },
  {
    id: 'gastric-balloon',
    name: 'Balón Gástrico',
    duration: 30,
    category: 'Bariatría',
    icon: '🎈',
    description: 'Colocación de balón intragástrico temporal'
  },
  {
    id: 'gastric-band',
    name: 'Banda Gástrica',
    duration: 90,
    category: 'Bariatría',
    icon: '🔗',
    description: 'Colocación de banda ajustable en el estómago'
  },
  {
    id: 'duodenal-switch',
    name: 'Derivación Biliopancreática',
    duration: 240,
    category: 'Bariatría',
    icon: '🏨',
    description: 'Cirugía bariátrica compleja para obesidad severa'
  },
  {
    id: 'revisional-bariatric',
    name: 'Cirugía Bariátrica Revisional',
    duration: 180,
    category: 'Bariatría',
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
