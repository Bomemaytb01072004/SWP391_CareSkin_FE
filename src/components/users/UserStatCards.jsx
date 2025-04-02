import { motion } from "framer-motion";
import { Users, UserCheck, UserX, UserCog } from "lucide-react";

const UserStatCards = ({ customers }) => {
  // Calculate stats from customers data
  const totalUsers = customers?.length || 0;
  const activeUsers = customers?.filter(user => user.IsActive).length || 0;
  const inactiveUsers = totalUsers - activeUsers;
  const verifiedUsers = customers?.filter(user => user.IsVerified).length || 0;

  const cards = [
    {
      title: "Total Users",
      value: totalUsers,
      icon: Users,
      color: "bg-blue-100 text-blue-800",
      iconColor: "text-blue-500"
    },
    {
      title: "Active Users",
      value: activeUsers,
      icon: UserCheck,
      color: "bg-green-100 text-green-800", 
      iconColor: "text-green-500"
    },
    {
      title: "Inactive Users",
      value: inactiveUsers,
      icon: UserX,
      color: "bg-red-100 text-red-800",
      iconColor: "text-red-500"
    },

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

export default UserStatCards;
