import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Calendar } from 'lucide-react';
import './Header.css';

const Header = () => {
  return (
    <motion.header
      className="header"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="header-content">
        <div className="header-logo">
          <div className="logo-icon">
            <Calendar size={28} />
          </div>
          <div className="logo-text">
            <h1>Ciplastic</h1>
            <span>Cirugía Plástica y Estética</span>
          </div>
        </div>

        <div className="header-tagline">
          <Sparkles size={18} />
          <span>Agenda tu Cita Profesional</span>
        </div>
      </div>

      <div className="header-decoration">
        <div className="decoration-line"></div>
        <div className="decoration-diamond"></div>
        <div className="decoration-line"></div>
      </div>
    </motion.header>
  );
};

export default Header;
