import { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, UserCog } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '../../components/common/Header';
import UsersTable from '../../components/users/UsersTable';
import UserDemographicsChart from '../../components/users/UserDemographicsChart';
import { fetchCustomers } from '../../utils/api';

const UsersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setIsLoading(true);
        const data = await fetchCustomers();
        setCustomers(data);
      } catch (error) {
        console.error('Error loading customers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCustomers();
  }, []);

  // Calculate stats from customers data
  const totalUsers = customers?.length || 0;
  const activeUsers = customers?.filter((user) => user.IsActive).length || 0;
  const inactiveUsers = totalUsers - activeUsers;
  const verifiedUsers =
    customers?.filter((user) => user.IsVerified).length || 0;

  const statCards = [
    {
      title: 'Total Users',
      value: totalUsers,
      icon: Users,
      color: 'bg-blue-100 text-blue-800',
      iconColor: 'text-blue-500',
    },
    {
      title: 'Active Users',
      value: activeUsers,
      icon: UserCheck,
      color: 'bg-green-100 text-green-800',
      iconColor: 'text-green-500',
    },
    {
      title: 'Inactive Users',
      value: inactiveUsers,
      icon: UserX,
      color: 'bg-red-100 text-red-800',
      iconColor: 'text-red-500',
    },
  ];

  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [filteredCustomers, setFilteredCustomers] = useState([]);

  useEffect(() => {
    if (!customers) return;

    const sortedCustomers = [...customers].sort(
      (a, b) => b.CustomerId - a.CustomerId
    );

    if (activeFilter === 'all') {
      setFilteredCustomers(sortedCustomers);
    } else if (activeFilter === 'active') {
      setFilteredCustomers(
        sortedCustomers.filter((customer) => customer.IsActive)
      );
    } else if (activeFilter === 'inactive') {
      setFilteredCustomers(
        sortedCustomers.filter((customer) => !customer.IsActive)
      );
    }
  }, [activeFilter, customers]);

  return (
    <motion.div
      className="flex-1 overflow-auto relative bg-white text-black"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Header title="Users" />

            <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
                {/* STAT CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statCards.map((card, index) => (
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
                <div className="flex space-x-4 mb-6">
                    <button
                        className={`px-4 py-2 rounded-lg transition-colors ${activeFilter === 'all' ? "bg-purple-300 text-black" : "bg-gray-300 text-black hover:bg-gray-100"}`}
                        onClick={() => setActiveFilter("all")}
                    >
                        All Users
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg transition-colors ${activeFilter === 'active' ? "bg-green-600 text-white" : "bg-gray-300 text-black hover:bg-gray-100"}`}
                        onClick={() => setActiveFilter("active")}
                    >
                        Active
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg transition-colors ${activeFilter === 'inactive' ? "bg-red-100 text-red-800" : "bg-gray-300 text-black hover:bg-gray-100"}`}
                        onClick={() => setActiveFilter("inactive")}
                    >
                        Inactive
                    </button>
                </div>

        {/* USERS TABLE */}
        <UsersTable customers={filteredCustomers} />

        {/* USER CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <UserDemographicsChart customers={customers} />
        </div>
      </main>
    </motion.div>
  );
};

export default UsersPage;
