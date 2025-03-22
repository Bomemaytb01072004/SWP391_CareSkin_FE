import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { fetchOrders } from '../../utils/api';

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FED766', '#2AB7CA'];

const OrderDistribution = () => {
  const [orderStatusData, setOrderStatusData] = useState([]);

  useEffect(() => {
    const getOrders = async () => {
      try {
        const orders = await fetchOrders();

        // Đếm số lượng đơn hàng theo trạng thái
        const statusCounts = orders.reduce((acc, order) => {
          acc[order.OrderStatusName] = (acc[order.OrderStatusName] || 0) + 1;
          return acc;
        }, {});

        // Chuyển đổi dữ liệu theo định dạng của Recharts
        const chartData = Object.entries(statusCounts).map(([name, value]) => ({
          name,
          value,
        }));

        setOrderStatusData(chartData);
      } catch (error) {
        console.error('Error fetching order distribution:', error);
      }
    };

    getOrders();
  }, []);

  return (
    <motion.div
      className="bg-white shadow-lg rounded-xl p-6 border border-gray-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h2 className="text-xl font-semibold text-black mb-4">
        Order Status Distribution
      </h2>

      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={orderStatusData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
            >
              {orderStatusData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderColor: '#ccc',
              }}
              itemStyle={{ color: '#000' }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default OrderDistribution;
