import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronRight, Search, Sparkles } from 'lucide-react';
import { surgeries, formatDuration, getCategories } from '../../data/surgeries';
import './SurgerySelector.css';

const SurgerySelector = ({ selectedSurgery, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  
  const categories = ['Todos', ...getCategories()];
  
  const filteredSurgeries = surgeries.filter(surgery => {
    const matchesSearch = surgery.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         surgery.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'Todos' || surgery.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="surgery-selector">
      <div className="selector-header">
        <div className="selector-title">
          <Sparkles size={24} />
          <h2>Selecciona tu Procedimiento</h2>
        </div>
        <p className="selector-subtitle">
          Elige el procedimiento estético que deseas agendar
        </p>
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
          {filteredSurgeries.map((surgery, index) => (
            <motion.div
              key={surgery.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              className={`surgery-card ${selectedSurgery?.id === surgery.id ? 'selected' : ''}`}
              onClick={() => onSelect(surgery)}
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
                <ChevronRight size={20} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredSurgeries.length === 0 && (
        <div className="no-results">
          <p>No se encontraron procedimientos</p>
        </div>
      )}
    </div>
  );
};

export default SurgerySelector;
