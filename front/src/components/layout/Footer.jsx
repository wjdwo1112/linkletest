import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-4">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">© {currentYear} Linkle</span>
          <Link to="/" className="text-gray-400 hover:text-[#4CA8FF] transition-colors text-sm">
            Home
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
