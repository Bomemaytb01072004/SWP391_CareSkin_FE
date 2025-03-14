import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { fetchOrders } from '../../utils/api'; // Import API function

const DailyOrders = () => {
  const [dailyOrdersData, setDailyOrdersData] = useState([]);

  useEffect(() => {
    const getOrders = async () => {
      try {
        const orders = await fetchOrders();

        // ✅ Process orders to get daily counts
        const ordersByDate = orders.reduce((acc, order) => {
          const date = new Date(order.OrderDate).toLocaleDateString('en-GB'); // Format: DD/MM/YYYY
          acc[date] = (acc[date] || 0) + 1; // Count orders per date
          return acc;
        }, {});

        // ✅ Convert to array format for Recharts
        const chartData = Object.entries(ordersByDate)
          .map(([date, orders]) => ({
            date,
            orders,
          }))
          .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date

        setDailyOrdersData(chartData); // ✅ Update state
      } catch (error) {
        console.error('Error fetching daily orders:', error);
      }
    };

    getOrders();
  }, []);

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <h2 className="text-xl font-semibold text-gray-100 mb-4">Daily Orders</h2>

      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={dailyOrdersData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(31, 41, 55, 0.8)',
                borderColor: '#4B5563',
              }}
              itemStyle={{ color: '#E5E7EB' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="orders"
              stroke="#8B5CF6"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default DailyOrders;
