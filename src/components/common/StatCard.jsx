import { motion } from 'framer-motion';

const StatCard = ({ name, icon: Icon, value, color, onClick, isActive }) => {
  return (
    <motion.div
      className={`${isActive ? 'bg-gray-900' : 'bg-gray-800'} bg-opacity-50 backdrop-blur-md overflow-hidden shadow-lg rounded-xl border ${isActive ? 'border-' + color.replace('#', '') : 'border-gray-700'} z-0 cursor-pointer transition-all duration-300`}
      whileHover={{ y: -5, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
      onClick={onClick}
    >
      <div className="px-4 py-5 sm:p-6">
        <span className="flex items-center text-sm font-medium text-gray-400">
          <Icon size={20} className="mr-2" style={{ color }} />
          {name}
        </span>
        <p className="mt-1 text-3xl font-semibold text-gray-100">{value}</p>
      </div>
    </motion.div>
  );
};

// Set default props
StatCard.defaultProps = {
  onClick: () => {},
  isActive: false
};

export default StatCard;
