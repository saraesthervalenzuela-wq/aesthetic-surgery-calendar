import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Check, X, ChevronLeft } from 'lucide-react';
import { surgeries, formatDuration, getSizeLabel, getCategories } from '../../data/surgeries';
import facialImage from '../../assets/images/facial.png';
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

// Componente de imagen para Facial (tarjeta)
const FacialIcon = () => (
  <img src={facialImage} alt="Facial" className="category-image" />
);

// SVG Componente para Corporal (torso femenino)
const CorporalIcon = () => (
  <svg viewBox="0 0 100 100" className="category-svg">
    <defs>
      <linearGradient id="corporalStroke" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#B8860B" />
        <stop offset="100%" stopColor="#8B6914" />
      </linearGradient>
    </defs>
    {/* Cuello */}
    <path d="M42 5 L42 15" fill="none" stroke="url(#corporalStroke)" strokeWidth="2" strokeLinecap="round"/>
    <path d="M58 5 L58 15" fill="none" stroke="url(#corporalStroke)" strokeWidth="2" strokeLinecap="round"/>

    {/* Hombros y torso superior */}
    <path d="M42 15 Q30 18 15 25 Q10 28 8 35" fill="none" stroke="url(#corporalStroke)" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M58 15 Q70 18 85 25 Q90 28 92 35" fill="none" stroke="url(#corporalStroke)" strokeWidth="2.5" strokeLinecap="round"/>

    {/* Brazos (parciales) */}
    <path d="M8 35 Q5 45 3 55" fill="none" stroke="url(#corporalStroke)" strokeWidth="2" strokeLinecap="round"/>
    <path d="M92 35 Q95 45 97 55" fill="none" stroke="url(#corporalStroke)" strokeWidth="2" strokeLinecap="round"/>

    {/* Pecho */}
    <path d="M25 35 Q20 50 30 55 Q40 58 45 50" fill="none" stroke="url(#corporalStroke)" strokeWidth="2" strokeLinecap="round"/>
    <path d="M75 35 Q80 50 70 55 Q60 58 55 50" fill="none" stroke="url(#corporalStroke)" strokeWidth="2" strokeLinecap="round"/>

    {/* Línea central del torso */}
    <path d="M50 20 L50 95" fill="none" stroke="url(#corporalStroke)" strokeWidth="1" strokeDasharray="3,3"/>

    {/* Cintura */}
    <path d="M30 60 Q25 75 30 90" fill="none" stroke="url(#corporalStroke)" strokeWidth="2" strokeLinecap="round"/>
    <path d="M70 60 Q75 75 70 90" fill="none" stroke="url(#corporalStroke)" strokeWidth="2" strokeLinecap="round"/>

    {/* Marcas de procedimiento */}
    <ellipse cx="35" cy="48" rx="8" ry="6" fill="none" stroke="url(#corporalStroke)" strokeWidth="1" strokeDasharray="2,2"/>
    <ellipse cx="65" cy="48" rx="8" ry="6" fill="none" stroke="url(#corporalStroke)" strokeWidth="1" strokeDasharray="2,2"/>
  </svg>
);

// SVG Componente para Bariatría (abdomen/cintura)
const BariatriaIcon = () => (
  <svg viewBox="0 0 100 100" className="category-svg">
    <defs>
      <linearGradient id="bariatriaStroke" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#B8860B" />
        <stop offset="100%" stopColor="#8B6914" />
      </linearGradient>
    </defs>
    {/* Cintura */}
    <path d="M25 10 Q20 25 22 40 Q25 55 30 70 Q32 80 35 90" fill="none" stroke="url(#bariatriaStroke)" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M75 10 Q80 25 78 40 Q75 55 70 70 Q68 80 65 90" fill="none" stroke="url(#bariatriaStroke)" strokeWidth="2.5" strokeLinecap="round"/>

    {/* Ombligo */}
    <ellipse cx="50" cy="45" rx="3" ry="4" fill="none" stroke="url(#bariatriaStroke)" strokeWidth="1.5"/>

    {/* Línea del bikini/ropa interior */}
    <path d="M30 70 Q40 75 50 73 Q60 75 70 70" fill="none" stroke="url(#bariatriaStroke)" strokeWidth="2" strokeLinecap="round"/>
    <path d="M35 90 Q50 95 65 90" fill="none" stroke="url(#bariatriaStroke)" strokeWidth="2" strokeLinecap="round"/>

    {/* Estrellas/destellos decorativos */}
    <g transform="translate(15, 30)">
      <path d="M0 -5 L1.5 -1.5 L5 0 L1.5 1.5 L0 5 L-1.5 1.5 L-5 0 L-1.5 -1.5 Z" fill="url(#bariatriaStroke)"/>
    </g>
    <g transform="translate(85, 25)">
      <path d="M0 -4 L1.2 -1.2 L4 0 L1.2 1.2 L0 4 L-1.2 1.2 L-4 0 L-1.2 -1.2 Z" fill="url(#bariatriaStroke)"/>
    </g>
    <g transform="translate(80, 55)">
      <path d="M0 -3 L0.9 -0.9 L3 0 L0.9 0.9 L0 3 L-0.9 0.9 L-3 0 L-0.9 -0.9 Z" fill="url(#bariatriaStroke)"/>
    </g>

    {/* Líneas de contorno del abdomen */}
    <path d="M35 25 Q50 22 65 25" fill="none" stroke="url(#bariatriaStroke)" strokeWidth="1" strokeDasharray="2,2"/>
    <path d="M38 55 Q50 58 62 55" fill="none" stroke="url(#bariatriaStroke)" strokeWidth="1" strokeDasharray="2,2"/>
  </svg>
);

// Configuración de categorías
const categoryConfig = {
  'Facial': {
    color: '#B8860B',
    Icon: FacialIcon,
    description: 'Procedimientos para rostro y cabeza'
  },
  'Corporal': {
    color: '#B8860B',
    Icon: CorporalIcon,
    description: 'Procedimientos para el cuerpo'
  },
  'Bariatría': {
    color: '#B8860B',
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
