import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Clock } from 'lucide-react';
import { surgeries, formatDuration, getSizeLabel, getCategories } from '../../data/surgeries';
import './BodySelector.css';

// Configuración de categorías
const categoryConfig = {
  'Facial': {
    color: '#E67E8C',
    gradient: 'linear-gradient(135deg, #E67E8C 0%, #D4666F 100%)',
    description: 'Procedimientos para rostro y cabeza'
  },
  'Corporal': {
    color: '#8B5A8C',
    gradient: 'linear-gradient(135deg, #8B5A8C 0%, #6B4A6C 100%)',
    description: 'Procedimientos para el cuerpo'
  },
  'Bariatría': {
    color: '#5A8B8C',
    gradient: 'linear-gradient(135deg, #5A8B8C 0%, #4A6B6C 100%)',
    description: 'Cirugías para pérdida de peso'
  }
};

// Componente SVG del cuerpo con zonas interactivas
const InteractiveBody = ({ activeCategory, hoveredCategory, onCategoryClick, onCategoryHover, getSelectedCount }) => {
  return (
    <svg viewBox="0 0 200 400" className="interactive-body-svg">
      {/* Definiciones de gradientes */}
      <defs>
        <linearGradient id="facialGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E67E8C" />
          <stop offset="100%" stopColor="#D4666F" />
        </linearGradient>
        <linearGradient id="corporalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5A8C" />
          <stop offset="100%" stopColor="#6B4A6C" />
        </linearGradient>
        <linearGradient id="bariatricGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5A8B8C" />
          <stop offset="100%" stopColor="#4A6B6C" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* ZONA FACIAL - Cabeza y cuello */}
      <g
        className={`body-zone facial-zone ${activeCategory === 'Facial' ? 'active' : ''} ${hoveredCategory === 'Facial' ? 'hovered' : ''}`}
        onClick={() => onCategoryClick('Facial')}
        onMouseEnter={() => onCategoryHover('Facial')}
        onMouseLeave={() => onCategoryHover(null)}
      >
        {/* Cabeza */}
        <ellipse cx="100" cy="45" rx="32" ry="38" className="zone-shape" />
        {/* Orejas */}
        <ellipse cx="65" cy="45" rx="6" ry="12" className="zone-shape" />
        <ellipse cx="135" cy="45" rx="6" ry="12" className="zone-shape" />
        {/* Cuello */}
        <rect x="85" y="80" width="30" height="25" rx="8" className="zone-shape" />

        {/* Detalles faciales */}
        <circle cx="88" cy="38" r="4" className="zone-detail" />
        <circle cx="112" cy="38" r="4" className="zone-detail" />
        <ellipse cx="100" cy="52" rx="4" ry="5" className="zone-detail" />
        <path d="M90 65 Q100 72 110 65" className="zone-detail" fill="none" strokeWidth="2" />

        {/* Label */}
        <text x="100" y="20" className="zone-label">FACIAL</text>

        {/* Badge de selección */}
        {getSelectedCount('Facial') > 0 && (
          <g className="selection-badge" transform="translate(130, 25)">
            <circle r="12" fill="#4ecca3" />
            <text y="4" fill="white" fontSize="10" fontWeight="bold">{getSelectedCount('Facial')}</text>
          </g>
        )}
      </g>

      {/* ZONA CORPORAL - Torso, brazos y piernas */}
      <g
        className={`body-zone corporal-zone ${activeCategory === 'Corporal' ? 'active' : ''} ${hoveredCategory === 'Corporal' ? 'hovered' : ''}`}
        onClick={() => onCategoryClick('Corporal')}
        onMouseEnter={() => onCategoryHover('Corporal')}
        onMouseLeave={() => onCategoryHover(null)}
      >
        {/* Hombros y torso superior */}
        <path d="M60 105 Q50 110 45 130 L45 145 L155 145 L155 130 Q150 110 140 105 Z" className="zone-shape" />

        {/* Brazo izquierdo */}
        <path d="M45 130 Q30 140 25 170 L22 220 Q20 235 28 238 L38 238 Q45 235 43 220 L48 175 Q50 155 50 145" className="zone-shape" />

        {/* Brazo derecho */}
        <path d="M155 130 Q170 140 175 170 L178 220 Q180 235 172 238 L162 238 Q155 235 157 220 L152 175 Q150 155 150 145" className="zone-shape" />

        {/* Pecho */}
        <ellipse cx="80" cy="135" rx="12" ry="10" className="zone-detail-light" />
        <ellipse cx="120" cy="135" rx="12" ry="10" className="zone-detail-light" />

        {/* Torso inferior (excluyendo zona bariátrica) */}
        <path d="M55 200 L55 240 Q55 250 65 255 L65 255 L135 255 Q145 250 145 240 L145 200" className="zone-shape" />

        {/* Pierna izquierda */}
        <path d="M65 255 L60 320 L55 370 Q53 385 62 388 L82 388 Q90 385 88 370 L90 320 L95 255" className="zone-shape" />

        {/* Pierna derecha */}
        <path d="M105 255 L110 320 L112 370 Q114 385 118 388 L138 388 Q147 385 145 370 L140 320 L135 255" className="zone-shape" />

        {/* Label */}
        <text x="100" y="280" className="zone-label">CORPORAL</text>

        {/* Badge de selección */}
        {getSelectedCount('Corporal') > 0 && (
          <g className="selection-badge" transform="translate(155, 120)">
            <circle r="12" fill="#4ecca3" />
            <text y="4" fill="white" fontSize="10" fontWeight="bold">{getSelectedCount('Corporal')}</text>
          </g>
        )}
      </g>

      {/* ZONA BARIÁTRICA - Abdomen/Estómago */}
      <g
        className={`body-zone bariatric-zone ${activeCategory === 'Bariatría' ? 'active' : ''} ${hoveredCategory === 'Bariatría' ? 'hovered' : ''}`}
        onClick={() => onCategoryClick('Bariatría')}
        onMouseEnter={() => onCategoryHover('Bariatría')}
        onMouseLeave={() => onCategoryHover(null)}
      >
        {/* Zona del abdomen/estómago */}
        <ellipse cx="100" cy="175" rx="42" ry="30" className="zone-shape" />

        {/* Detalle del estómago */}
        <path d="M85 165 Q100 155 115 165" className="zone-detail" fill="none" strokeWidth="2" />
        <ellipse cx="100" cy="178" rx="15" ry="10" className="zone-detail" fill="none" strokeWidth="1.5" />

        {/* Label */}
        <text x="100" y="210" className="zone-label-small">BARIATRÍA</text>

        {/* Badge de selección */}
        {getSelectedCount('Bariatría') > 0 && (
          <g className="selection-badge" transform="translate(145, 160)">
            <circle r="12" fill="#4ecca3" />
            <text y="4" fill="white" fontSize="10" fontWeight="bold">{getSelectedCount('Bariatría')}</text>
          </g>
        )}
      </g>
    </svg>
  );
};

const BodySelector = ({ selectedProcedures, onSelect, onClose }) => {
  const [activeCategory, setActiveCategory] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);

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

  const displayCategory = hoveredCategory || activeCategory;
  const displayConfig = displayCategory ? categoryConfig[displayCategory] : null;

  return (
    <motion.div
      className="body-selector-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="body-selector-container"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="body-selector-header">
          <h2>Selecciona la Zona del Cuerpo</h2>
          <p>Haz clic en una zona para ver los procedimientos disponibles</p>
          <button className="close-body-selector" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="body-selector-content">
          {/* Panel del cuerpo interactivo */}
          <div className="body-visual-panel">
            <InteractiveBody
              activeCategory={activeCategory}
              hoveredCategory={hoveredCategory}
              onCategoryClick={setActiveCategory}
              onCategoryHover={setHoveredCategory}
              getSelectedCount={getSelectedCountInCategory}
            />

            {/* Indicador de zona */}
            <AnimatePresence>
              {displayCategory && (
                <motion.div
                  className="zone-indicator"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  style={{ background: displayConfig?.gradient }}
                >
                  <span className="zone-name">{displayCategory}</span>
                  <span className="zone-desc">{displayConfig?.description}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Leyenda */}
            <div className="body-legend">
              <div className="legend-title">Zonas:</div>
              {getCategories().map(cat => (
                <div
                  key={cat}
                  className={`legend-item ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  <span
                    className="legend-color"
                    style={{ background: categoryConfig[cat]?.color }}
                  />
                  <span className="legend-text">{cat}</span>
                  {getSelectedCountInCategory(cat) > 0 && (
                    <span className="legend-count">{getSelectedCountInCategory(cat)}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Panel de procedimientos */}
          <AnimatePresence mode="wait">
            {activeCategory ? (
              <motion.div
                className="procedures-panel"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                key={activeCategory}
                style={{ '--panel-color': categoryConfig[activeCategory]?.color }}
              >
                <div className="panel-header" style={{ background: categoryConfig[activeCategory]?.gradient }}>
                  <h3>{activeCategory}</h3>
                  <span>{categoryConfig[activeCategory]?.description}</span>
                  <span className="procedure-count">
                    {getCategoryProcedures(activeCategory).length} procedimientos
                  </span>
                </div>

                <div className="panel-procedures">
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
            ) : (
              <motion.div
                className="procedures-panel empty-panel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="empty-panel-content">
                  <div className="empty-icon">👆</div>
                  <h3>Selecciona una zona</h3>
                  <p>Haz clic en cualquier parte del cuerpo para ver los procedimientos disponibles.</p>
                  <div className="zone-hints">
                    <span style={{ color: categoryConfig['Facial']?.color }}>Cabeza → Facial</span>
                    <span style={{ color: categoryConfig['Corporal']?.color }}>Cuerpo → Corporal</span>
                    <span style={{ color: categoryConfig['Bariatría']?.color }}>Abdomen → Bariatría</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="body-selector-footer">
          <div className="selection-summary">
            <div className="selection-count">
              <span className="count">{selectedProcedures.length}</span>
              <span className="label">
                procedimiento{selectedProcedures.length !== 1 ? 's' : ''}
              </span>
            </div>
            {selectedProcedures.length > 0 && (
              <div className="selection-total">
                <Clock size={16} />
                <span>{formatDuration(selectedProcedures.reduce((sum, p) => sum + p.duration, 0))}</span>
              </div>
            )}
          </div>

          {selectedProcedures.length > 0 && (
            <div className="selected-tags">
              {selectedProcedures.map(proc => (
                <span
                  key={proc.id}
                  className="selected-tag"
                  style={{ borderColor: categoryConfig[proc.category]?.color }}
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
          )}

          <button className="confirm-btn" onClick={onClose}>
            Confirmar Selección
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BodySelector;
