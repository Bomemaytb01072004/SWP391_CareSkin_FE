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
      className="bg-white text-black shadow-lg rounded-xl p-6 border border-gray-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <h2 className="text-xl font-semibold text-black mb-4">Daily Orders</h2>

      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={dailyOrdersData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
            <XAxis dataKey="date" stroke="#000" />
            <YAxis stroke="#000" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                borderColor: '#ccc',
              }}
              itemStyle={{ color: '#000' }}
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
