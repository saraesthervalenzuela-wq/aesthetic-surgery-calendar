import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Check, X, ChevronLeft } from 'lucide-react';
import { surgeries, formatDuration, getSizeLabel, getCategories } from '../../data/surgeries';
import facialImage from '../../assets/images/facial.png';
import corporalImage from '../../assets/images/corporal.png';
import bariatriaImage from '../../assets/images/bariatria.png';
import './SurgerySelector.css';

// Mapeo de cirugías faciales a puntos en el rostro (posiciones en porcentaje basadas en la imagen)
// IDs corresponden a los IDs en surgeries.js
const facialSurgeryPoints = {
  'blepharoplasty-left': { x: 37, y: 37, surgeryId: 'blepharoplasty', label: 'Blefaroplastia' },    // Ojo izquierdo
  'blepharoplasty-right': { x: 63, y: 37, surgeryId: 'blepharoplasty', label: 'Blefaroplastia' },   // Ojo derecho
  'rhinoplasty': { x: 50, y: 48, surgeryId: 'rhinoplasty', label: 'Rinoplastia' },                  // Nariz
  'bichectomy-left': { x: 30, y: 50, surgeryId: 'bichectomy', label: 'Bichectomía' },               // Mejilla izquierda
  'bichectomy-right': { x: 70, y: 50, surgeryId: 'bichectomy', label: 'Bichectomía' },              // Mejilla derecha
  'lip-augmentation': { x: 50, y: 58, surgeryId: 'lip-augmentation', label: 'Aumento de Labios' }, // Labios
  'mentoplasty': { x: 50, y: 68, surgeryId: 'mentoplasty', label: 'Mentoplastia' },                 // Mentón
  'otoplasty': { x: 80, y: 42, surgeryId: 'otoplasty', label: 'Otoplastia' },                       // Oreja derecha
};

// Mapeo de cirugías corporales a puntos en el cuerpo (posiciones en porcentaje basadas en la imagen)
const corporalSurgeryPoints = {
  'breast-augmentation-left': { x: 35, y: 26, surgeryId: 'breast-augmentation', label: 'Aumento de Busto' },  // Seno izquierdo
  'breast-augmentation-right': { x: 65, y: 26, surgeryId: 'breast-augmentation', label: 'Aumento de Busto' }, // Seno derecho
  'breast-lift-left': { x: 35, y: 30, surgeryId: 'breast-lift', label: 'Mastopexia' },                       // Seno izquierdo (mastopexia)
  'breast-lift-right': { x: 65, y: 30, surgeryId: 'breast-lift', label: 'Mastopexia' },                      // Seno derecho (mastopexia)
  'breast-reduction-left': { x: 35, y: 28, surgeryId: 'breast-reduction', label: 'Reducción Mamaria' },      // Seno izquierdo (reducción)
  'breast-reduction-right': { x: 65, y: 28, surgeryId: 'breast-reduction', label: 'Reducción Mamaria' },     // Seno derecho (reducción)
  'abdominoplasty': { x: 50, y: 48, surgeryId: 'abdominoplasty', label: 'Abdominoplastia' },                 // Abdomen
  'liposuction-abdomen': { x: 50, y: 45, surgeryId: 'liposuction', label: 'Liposucción' },                   // Abdomen (lipo)
  'liposuction-waist-left': { x: 30, y: 48, surgeryId: 'liposuction', label: 'Liposucción' },                // Cintura izquierda
  'liposuction-waist-right': { x: 70, y: 48, surgeryId: 'liposuction', label: 'Liposucción' },               // Cintura derecha
  'bbl': { x: 50, y: 65, surgeryId: 'bbl', label: 'BBL (Brazilian Butt Lift)' },                             // Glúteos
  'arm-lift-left': { x: 18, y: 35, surgeryId: 'arm-lift', label: 'Braquioplastia' },                         // Brazo izquierdo
  'arm-lift-right': { x: 82, y: 35, surgeryId: 'arm-lift', label: 'Braquioplastia' },                        // Brazo derecho
  'thigh-lift-left': { x: 40, y: 80, surgeryId: 'thigh-lift', label: 'Lifting de Muslos' },                  // Muslo izquierdo
  'thigh-lift-right': { x: 60, y: 80, surgeryId: 'thigh-lift', label: 'Lifting de Muslos' },                 // Muslo derecho
};

// Mapeo de cirugías bariátricas a puntos en el abdomen (posiciones en porcentaje basadas en la imagen)
const bariatriaSurgeryPoints = {
  'gastric-balloon': { x: 50, y: 45, surgeryId: 'gastric-balloon', label: 'Balón Gástrico' },                // Estómago superior
  'gastric-band': { x: 50, y: 48, surgeryId: 'gastric-band', label: 'Banda Gástrica' },                      // Estómago medio
  'gastric-sleeve': { x: 45, y: 50, surgeryId: 'gastric-sleeve', label: 'Manga Gástrica' },                  // Estómago izquierdo
  'gastric-bypass': { x: 55, y: 50, surgeryId: 'gastric-bypass', label: 'Bypass Gástrico' },                 // Estómago derecho
  'duodenal-switch': { x: 50, y: 55, surgeryId: 'duodenal-switch', label: 'Derivación Biliopancreática' },   // Abdomen inferior
  'revisional-bariatric': { x: 50, y: 52, surgeryId: 'revisional-bariatric', label: 'Cirugía Revisional' }, // Centro abdomen
};

// Componente interactivo para Facial usando la imagen real
const FacialInteractive = ({ selectedProcedures, onToggleSurgery, surgeries: facialSurgeries }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [hoveredLifting, setHoveredLifting] = useState(false);

  const isSelected = (surgeryId) => selectedProcedures.some(p => p.id === surgeryId);

  const getSurgeryByPoint = (pointKey) => {
    const point = facialSurgeryPoints[pointKey];
    if (!point) return null;
    return facialSurgeries.find(s => s.id === point.surgeryId);
  };

  const handlePointClick = (pointKey) => {
    const surgery = getSurgeryByPoint(pointKey);
    if (surgery) {
      onToggleSurgery(surgery);
    }
  };

  const handleLiftingClick = () => {
    const liftingSurgery = facialSurgeries.find(s => s.id === 'facelift');
    if (liftingSurgery) {
      onToggleSurgery(liftingSurgery);
    }
  };

  const isLiftingSelected = isSelected('facelift');

  return (
    <div className="facial-interactive-container">
      <div className="facial-image-wrapper">
        <img src={facialImage} alt="Facial procedures" className="facial-image" />

        {/* Círculo para Lifting Facial */}
        <div
          className={`facial-lifting-circle ${isLiftingSelected ? 'selected' : ''} ${hoveredLifting ? 'hovered' : ''}`}
          onClick={handleLiftingClick}
          onMouseEnter={() => setHoveredLifting(true)}
          onMouseLeave={() => setHoveredLifting(false)}
        />

        {/* Tooltip para Lifting */}
        {hoveredLifting && (
          <div className="facial-tooltip lifting-tooltip">
            Lifting Facial
          </div>
        )}

        {/* Puntos interactivos superpuestos (transparentes, sobre los puntos de la imagen) */}
        {Object.entries(facialSurgeryPoints).map(([key, point]) => {
          const surgery = getSurgeryByPoint(key);
          const selected = surgery && isSelected(surgery.id);
          const isHovered = hoveredPoint === key;

          return (
            <div
              key={key}
              className={`facial-point ${selected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
              style={{
                left: `${point.x}%`,
                top: `${point.y}%`,
              }}
              onClick={() => handlePointClick(key)}
              onMouseEnter={() => setHoveredPoint(key)}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              {selected && <Check size={10} />}
            </div>
          );
        })}

        {/* Tooltip para puntos */}
        {hoveredPoint && (
          <div
            className="facial-tooltip"
            style={{
              left: `${facialSurgeryPoints[hoveredPoint].x}%`,
              top: `${facialSurgeryPoints[hoveredPoint].y - 12}%`,
            }}
          >
            {getSurgeryByPoint(hoveredPoint)?.name || facialSurgeryPoints[hoveredPoint]?.label}
          </div>
        )}
      </div>

      {/* Leyenda de cirugías */}
      <div className="facial-legend">
        {facialSurgeries.map(surgery => (
          <div
            key={surgery.id}
            className={`legend-item ${isSelected(surgery.id) ? 'selected' : ''}`}
            onClick={() => onToggleSurgery(surgery)}
          >
            <span className="legend-dot" style={{
              background: isSelected(surgery.id) ? '#22c55e' : '#3b82f6'
            }} />
            <span className="legend-text">{surgery.name}</span>
            {isSelected(surgery.id) && <Check size={14} className="legend-check" />}
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente interactivo para Corporal usando la imagen real
const CorporalInteractive = ({ selectedProcedures, onToggleSurgery, surgeries: corporalSurgeries }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const isSelected = (surgeryId) => selectedProcedures.some(p => p.id === surgeryId);

  const getSurgeryByPoint = (pointKey) => {
    const point = corporalSurgeryPoints[pointKey];
    if (!point) return null;
    return corporalSurgeries.find(s => s.id === point.surgeryId);
  };

  const handlePointClick = (pointKey) => {
    const surgery = getSurgeryByPoint(pointKey);
    if (surgery) {
      onToggleSurgery(surgery);
    }
  };

  return (
    <div className="corporal-interactive-container">
      <div className="corporal-image-wrapper">
        <img src={corporalImage} alt="Corporal procedures" className="corporal-image" />

        {/* Puntos interactivos superpuestos sobre la imagen */}
        {Object.entries(corporalSurgeryPoints).map(([key, point]) => {
          const surgery = getSurgeryByPoint(key);
          const selected = surgery && isSelected(surgery.id);
          const isHovered = hoveredPoint === key;

          return (
            <div
              key={key}
              className={`corporal-point ${selected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
              style={{
                left: `${point.x}%`,
                top: `${point.y}%`,
              }}
              onClick={() => handlePointClick(key)}
              onMouseEnter={() => setHoveredPoint(key)}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              {selected && <Check size={10} />}
            </div>
          );
        })}

        {/* Tooltip para puntos */}
        {hoveredPoint && (
          <div
            className="corporal-tooltip"
            style={{
              left: `${corporalSurgeryPoints[hoveredPoint].x}%`,
              top: `${corporalSurgeryPoints[hoveredPoint].y - 12}%`,
            }}
          >
            {getSurgeryByPoint(hoveredPoint)?.name || corporalSurgeryPoints[hoveredPoint]?.label}
          </div>
        )}
      </div>

      {/* Leyenda de cirugías */}
      <div className="corporal-legend">
        {corporalSurgeries.map(surgery => (
          <div
            key={surgery.id}
            className={`legend-item ${isSelected(surgery.id) ? 'selected' : ''}`}
            onClick={() => onToggleSurgery(surgery)}
          >
            <span className="legend-dot" style={{
              background: isSelected(surgery.id) ? '#22c55e' : '#3b82f6'
            }} />
            <span className="legend-text">{surgery.name}</span>
            {isSelected(surgery.id) && <Check size={14} className="legend-check" />}
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente interactivo para Bariatría usando la imagen real
const BariatriaInteractive = ({ selectedProcedures, onToggleSurgery, surgeries: bariatriaSurgeries }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const isSelected = (surgeryId) => selectedProcedures.some(p => p.id === surgeryId);

  const getSurgeryByPoint = (pointKey) => {
    const point = bariatriaSurgeryPoints[pointKey];
    if (!point) return null;
    return bariatriaSurgeries.find(s => s.id === point.surgeryId);
  };

  const handlePointClick = (pointKey) => {
    const surgery = getSurgeryByPoint(pointKey);
    if (surgery) {
      onToggleSurgery(surgery);
    }
  };

  return (
    <div className="bariatria-interactive-container">
      <div className="bariatria-image-wrapper">
        <img src={bariatriaImage} alt="Bariatria procedures" className="bariatria-image" />

        {/* Puntos interactivos superpuestos sobre la imagen */}
        {Object.entries(bariatriaSurgeryPoints).map(([key, point]) => {
          const surgery = getSurgeryByPoint(key);
          const selected = surgery && isSelected(surgery.id);
          const isHovered = hoveredPoint === key;

          return (
            <div
              key={key}
              className={`bariatria-point ${selected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
              style={{
                left: `${point.x}%`,
                top: `${point.y}%`,
              }}
              onClick={() => handlePointClick(key)}
              onMouseEnter={() => setHoveredPoint(key)}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              {selected && <Check size={10} />}
            </div>
          );
        })}

        {/* Tooltip para puntos */}
        {hoveredPoint && (
          <div
            className="bariatria-tooltip"
            style={{
              left: `${bariatriaSurgeryPoints[hoveredPoint].x}%`,
              top: `${bariatriaSurgeryPoints[hoveredPoint].y - 12}%`,
            }}
          >
            {getSurgeryByPoint(hoveredPoint)?.name || bariatriaSurgeryPoints[hoveredPoint]?.label}
          </div>
        )}
      </div>

      {/* Leyenda de cirugías */}
      <div className="bariatria-legend">
        {bariatriaSurgeries.map(surgery => (
          <div
            key={surgery.id}
            className={`legend-item ${isSelected(surgery.id) ? 'selected' : ''}`}
            onClick={() => onToggleSurgery(surgery)}
          >
            <span className="legend-dot" style={{
              background: isSelected(surgery.id) ? '#22c55e' : '#3b82f6'
            }} />
            <span className="legend-text">{surgery.name}</span>
            {isSelected(surgery.id) && <Check size={14} className="legend-check" />}
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente de imagen para Facial (tarjeta)
const FacialIcon = () => (
  <img src={facialImage} alt="Facial" className="category-image" />
);

// Componente de imagen para Corporal (tarjeta)
const CorporalIcon = () => (
  <img src={corporalImage} alt="Corporal" className="category-image" />
);

// Componente de imagen para Bariatría (tarjeta)
const BariatriaIcon = () => (
  <img src={bariatriaImage} alt="Bariatría" className="category-image" />
);

// Configuración de categorías
const categoryConfig = {
  'Facial': {
    color: '#3b82f6',
    Icon: FacialIcon,
    description: 'Procedimientos para rostro y cabeza'
  },
  'Corporal': {
    color: '#3b82f6',
    Icon: CorporalIcon,
    description: 'Procedimientos para el cuerpo'
  },
  'Bariatría': {
    color: '#3b82f6',
    Icon: BariatriaIcon,
    description: 'Cirugías para pérdida de peso'
  }
};

const SurgerySelector = ({ selectedProcedures, onSelect }) => {
  const [activeCategory, setActiveCategory] = useState(null);

  const isSelected = (surgeryId) => {
    return selectedProcedures.some(p => p.id === surgeryId);
  };

  const handleProcedureToggle = (surgery) => {
    if (isSelected(surgery.id)) {
      onSelect(selectedProcedures.filter(p => p.id !== surgery.id));
    } else {
      onSelect([...selectedProcedures, surgery]);
    }
  };

  const getCategoryProcedures = (category) => {
    return surgeries.filter(s => s.category === category);
  };

  const getSelectedCountInCategory = (category) => {
    return selectedProcedures.filter(p => p.category === category).length;
  };

  return (
    <div className="surgery-selector">
      <div className="selector-header">
        <h2>Selecciona tus Procedimientos</h2>
        <p>Elige una categoría para ver los procedimientos disponibles</p>
      </div>

      <AnimatePresence mode="wait">
        {!activeCategory ? (
          <motion.div
            className="categories-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            key="categories"
          >
            {getCategories().map((category, index) => {
              const config = categoryConfig[category];
              const selectedCount = getSelectedCountInCategory(category);
              const IconComponent = config.Icon;

              return (
                <motion.div
                  key={category}
                  className={`category-card ${selectedCount > 0 ? 'has-selection' : ''}`}
                  onClick={() => setActiveCategory(category)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="category-icon-wrapper">
                    <IconComponent />
                    {selectedCount > 0 && (
                      <div className="category-badge">{selectedCount}</div>
                    )}
                  </div>
                  <h3 className="category-title">{category}</h3>
                  <p className="category-description">{config.description}</p>
                  <span className="category-count">
                    {getCategoryProcedures(category).length} procedimientos
                  </span>
                </motion.div>
              );
            })}
          </motion.div>
        ) : activeCategory === 'Facial' ? (
          <motion.div
            className="procedures-view facial-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            key="facial-procedures"
          >
            <button className="back-button" onClick={() => setActiveCategory(null)}>
              <ChevronLeft size={20} />
              <span>Volver a categorías</span>
            </button>

            <div className="procedures-header">
              <div className="procedures-header-info">
                <h3>Facial</h3>
                <p>Toca los puntos en el rostro para seleccionar procedimientos</p>
              </div>
            </div>

            <FacialInteractive
              selectedProcedures={selectedProcedures}
              onToggleSurgery={handleProcedureToggle}
              surgeries={getCategoryProcedures('Facial')}
            />
          </motion.div>
        ) : activeCategory === 'Corporal' ? (
          <motion.div
            className="procedures-view corporal-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            key="corporal-procedures"
          >
            <button className="back-button" onClick={() => setActiveCategory(null)}>
              <ChevronLeft size={20} />
              <span>Volver a categorías</span>
            </button>

            <div className="procedures-header">
              <div className="procedures-header-info">
                <h3>Corporal</h3>
                <p>Toca los puntos en el cuerpo para seleccionar procedimientos</p>
              </div>
            </div>

            <CorporalInteractive
              selectedProcedures={selectedProcedures}
              onToggleSurgery={handleProcedureToggle}
              surgeries={getCategoryProcedures('Corporal')}
            />
          </motion.div>
        ) : activeCategory === 'Bariatría' ? (
          <motion.div
            className="procedures-view bariatria-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            key="bariatria-procedures"
          >
            <button className="back-button" onClick={() => setActiveCategory(null)}>
              <ChevronLeft size={20} />
              <span>Volver a categorías</span>
            </button>

            <div className="procedures-header">
              <div className="procedures-header-info">
                <h3>Bariatría</h3>
                <p>Toca los puntos en el abdomen para seleccionar procedimientos</p>
              </div>
            </div>

            <BariatriaInteractive
              selectedProcedures={selectedProcedures}
              onToggleSurgery={handleProcedureToggle}
              surgeries={getCategoryProcedures('Bariatría')}
            />
          </motion.div>
        ) : (
          <motion.div
            className="procedures-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            key="procedures"
          >
            <button className="back-button" onClick={() => setActiveCategory(null)}>
              <ChevronLeft size={20} />
              <span>Volver a categorías</span>
            </button>

            <div className="procedures-header">
              <div className="procedures-header-icon">
                {React.createElement(categoryConfig[activeCategory].Icon)}
              </div>
              <div className="procedures-header-info">
                <h3>{activeCategory}</h3>
                <p>{categoryConfig[activeCategory].description}</p>
              </div>
            </div>

            <div className="procedures-list">
              {getCategoryProcedures(activeCategory).map((surgery) => {
                const selected = isSelected(surgery.id);

                return (
                  <motion.div
                    key={surgery.id}
                    className={`procedure-card ${selected ? 'selected' : ''}`}
                    onClick={() => handleProcedureToggle(surgery)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="procedure-icon">{surgery.icon}</div>
                    <div className="procedure-details">
                      <h4>{surgery.name}</h4>
                      <p>{surgery.description}</p>
                      <div className="procedure-meta">
                        <span className="duration">
                          <Clock size={12} />
                          {formatDuration(surgery.duration)}
                        </span>
                        <span className={`size size-${surgery.size}`}>
                          {getSizeLabel(surgery.size)}
                        </span>
                      </div>
                    </div>
                    <div className="procedure-checkbox">
                      {selected ? (
                        <motion.div
                          className="checkbox-checked"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          <Check size={14} />
                        </motion.div>
                      ) : (
                        <div className="checkbox-empty" />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer con selección */}
      {selectedProcedures.length > 0 && (
        <motion.div
          className="selection-footer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="selection-summary">
            <div className="selection-count">
              <span className="count">{selectedProcedures.length}</span>
              <span className="label">procedimiento{selectedProcedures.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="selection-total">
              <Clock size={16} />
              <span>{formatDuration(selectedProcedures.reduce((sum, p) => sum + p.duration, 0))}</span>
            </div>
          </div>

          <div className="selected-tags">
            {selectedProcedures.map(proc => (
              <span
                key={proc.id}
                className="selected-tag"
              >
                {proc.icon} {proc.name}
                <button onClick={(e) => {
                  e.stopPropagation();
                  onSelect(selectedProcedures.filter(p => p.id !== proc.id));
                }}>
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SurgerySelector;
