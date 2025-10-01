import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 py-4">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center text-sm text-gray-400">
          <span>© {currentYear} Linkle</span>
          <Link to="/" className="text-gray-400 hover:text-gray-600 transition-colors">
            Home
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
