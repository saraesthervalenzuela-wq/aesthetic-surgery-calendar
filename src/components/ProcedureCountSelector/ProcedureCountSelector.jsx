import React from 'react';
import { motion } from 'framer-motion';
import { Layers, ChevronRight } from 'lucide-react';
import './ProcedureCountSelector.css';

const ProcedureCountSelector = ({ selectedCount, onSelect }) => {
  const counts = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div className="procedure-count-selector">
      <div className="selector-header">
        <div className="selector-title">
          <Layers size={24} />
          <h2>¿Cuántos Procedimientos Realizarás?</h2>
        </div>
        <p className="selector-subtitle">
          Selecciona la cantidad de procedimientos que deseas agendar en una misma sesión
        </p>
      </div>

      <div className="count-grid">
        {counts.map((count, index) => (
          <motion.button
            key={count}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`count-card ${selectedCount === count ? 'selected' : ''}`}
            onClick={() => onSelect(count)}
          >
            <div className="count-number">{count}</div>
            <div className="count-label">
              {count === 1 ? 'Procedimiento' : 'Procedimientos'}
            </div>
            {selectedCount === count && (
              <motion.div
                className="count-check"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <ChevronRight size={20} />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      <div className="count-info">
        <p>💡 <strong>Tip:</strong> Puedes combinar múltiples procedimientos en una sola sesión para optimizar tu tiempo de recuperación.</p>
      </div>
    </div>
  );
};

export default ProcedureCountSelector;
