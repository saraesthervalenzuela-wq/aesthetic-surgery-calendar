import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronRight, Search, Sparkles, Check, AlertCircle } from 'lucide-react';
import { surgeries, formatDuration, getCategories } from '../../data/surgeries';
import './SurgerySelector.css';

const SurgerySelector = ({ requiredCount, selectedProcedures, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');

  const categories = ['Todos', ...getCategories()];

  const filteredSurgeries = surgeries.filter(surgery => {
    const matchesSearch = surgery.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         surgery.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'Todos' || surgery.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const isSelected = (surgeryId) => {
    return selectedProcedures.some(p => p.id === surgeryId);
  };

  const handleToggle = (surgery) => {
    if (isSelected(surgery.id)) {
      // Deseleccionar
      onSelect(selectedProcedures.filter(p => p.id !== surgery.id));
    } else {
      // Seleccionar solo si no se ha alcanzado el límite
      if (selectedProcedures.length < requiredCount) {
        onSelect([...selectedProcedures, surgery]);
      }
    }
  };

  const selectionComplete = selectedProcedures.length === requiredCount;
  const remaining = requiredCount - selectedProcedures.length;

  return (
    <div className="surgery-selector">
      <div className="selector-header">
        <div className="selector-title">
          <Sparkles size={24} />
          <h2>Selecciona {requiredCount === 1 ? 'tu Procedimiento' : 'tus Procedimientos'}</h2>
        </div>
        <p className="selector-subtitle">
          {requiredCount === 1
            ? 'Elige el procedimiento estético que deseas agendar'
            : `Selecciona exactamente ${requiredCount} procedimientos para tu sesión`
          }
        </p>
      </div>

      {/* Contador de selección */}
      <div className={`selection-counter ${selectionComplete ? 'complete' : ''}`}>
        <div className="counter-content">
          <div className="counter-numbers">
            <span className="current">{selectedProcedures.length}</span>
            <span className="divider">/</span>
            <span className="total">{requiredCount}</span>
          </div>
          <div className="counter-label">
            {selectionComplete ? (
              <span className="complete-text">
                <Check size={16} /> Selección completa
              </span>
            ) : (
              <span className="pending-text">
                <AlertCircle size={16} />
                {remaining === 1
                  ? 'Selecciona 1 procedimiento más'
                  : `Selecciona ${remaining} procedimientos más`
                }
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="selector-controls">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar procedimiento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="category-filters">
          {categories.map((category) => (
            <button
              key={category}
              className={`category-btn ${activeCategory === category ? 'active' : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="surgeries-grid">
        <AnimatePresence mode="popLayout">
          {filteredSurgeries.map((surgery, index) => {
            const selected = isSelected(surgery.id);
            const canSelect = selected || selectedProcedures.length < requiredCount;

            return (
              <motion.div
                key={surgery.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className={`surgery-card ${selected ? 'selected' : ''} ${!canSelect ? 'disabled' : ''}`}
                onClick={() => canSelect && handleToggle(surgery)}
              >
                <div className="surgery-icon">{surgery.icon}</div>
                <div className="surgery-info">
                  <h3>{surgery.name}</h3>
                  <p>{surgery.description}</p>
                  <div className="surgery-meta">
                    <span className="surgery-duration">
                      <Clock size={14} />
                      {formatDuration(surgery.duration)}
                    </span>
                    <span className="surgery-category">{surgery.category}</span>
                  </div>
                </div>
                <div className="surgery-select-indicator">
                  {selected ? <Check size={24} /> : <ChevronRight size={20} />}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredSurgeries.length === 0 && (
        <div className="no-results">
          <p>No se encontraron procedimientos</p>
        </div>
      )}

      {/* Lista de procedimientos seleccionados */}
      {selectedProcedures.length > 0 && (
        <motion.div
          className="selected-procedures"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <h3>Procedimientos Seleccionados:</h3>
          <div className="selected-list">
            {selectedProcedures.map((proc, idx) => (
              <div key={proc.id} className="selected-item">
                <span className="selected-number">{idx + 1}</span>
                <span className="selected-icon">{proc.icon}</span>
                <span className="selected-name">{proc.name}</span>
                <span className="selected-duration">{formatDuration(proc.duration)}</span>
                <button
                  className="remove-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(selectedProcedures.filter(p => p.id !== proc.id));
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="total-duration">
            <strong>Duración Total:</strong>
            <span>{formatDuration(selectedProcedures.reduce((sum, p) => sum + p.duration, 0))}</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SurgerySelector;
