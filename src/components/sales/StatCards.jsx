import { motion } from "framer-motion";
import { TrendingUp, DollarSign, ShoppingBag, BarChart2 } from "lucide-react";

const StatCards = ({ stats }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatPercent = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100);
  };

  const cards = [
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue || 0),
      icon: DollarSign,
      color: "bg-green-100 text-green-800",
      iconColor: "text-green-500"
    },
    {
      title: "Average Order Value",
      value: formatCurrency(stats.averageOrderValue || 0),
      icon: TrendingUp,
      color: "bg-blue-100 text-blue-800",
      iconColor: "text-blue-500"
    },
    {
      title: "Completed Orders",
      value: stats.completedOrders || 0,
      icon: ShoppingBag,
      color: "bg-purple-100 text-purple-800",
      iconColor: "text-purple-500"
    },
    {
      title: "Conversion Rate",
      value: formatPercent(stats.conversionRate || 0),
      icon: BarChart2,
      color: "bg-yellow-100 text-yellow-800",
      iconColor: "text-yellow-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <h3 className="text-2xl font-bold mt-2">{card.value}</h3>
            </div>
            <div className={`p-3 rounded-full ${card.color}`}>
              <card.icon className={`w-6 h-6 ${card.iconColor}`} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default StatCards;
