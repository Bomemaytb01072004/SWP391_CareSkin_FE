import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useState, useEffect } from 'react';
import { fetchOrdersForSales } from '../../utils/apiSales';

const SalesTrendChart = () => {
  const [salesData, setSalesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        setIsLoading(true);
        const orders = await fetchOrdersForSales();
        const monthlySalesData = calculateMonthlySales(orders);
        setSalesData(monthlySalesData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching sales data:', error);
        setIsLoading(false);
        // Fallback to sample data if fetch fails
        setSalesData([
          { month: 'Jan', sales: 0 },
          { month: 'Feb', sales: 0 },
          { month: 'Mar', sales: 0 },
          { month: 'Apr', sales: 0 },
          { month: 'May', sales: 0 },
          { month: 'Jun', sales: 0 },
          { month: 'Jul', sales: 0 },
          { month: 'Aug', sales: 0 },
          { month: 'Sep', sales: 0 },
          { month: 'Oct', sales: 0 },
          { month: 'Nov', sales: 0 },
          { month: 'Dec', sales: 0 },
        ]);
      }
    };

    fetchSalesData();
  }, []);

  // Helper function to calculate monthly sales
  const calculateMonthlySales = (orders) => {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const monthlySales = Array(12).fill(0);

    orders.forEach((order) => {
      const orderDate = new Date(order.OrderDate);
      const monthIndex = orderDate.getMonth();
      monthlySales[monthIndex] +=
        order.TotalPriceSale > 0 ? order.TotalPriceSale : order.TotalPrice;
    });

    return months.map((month, index) => ({
      month,
      sales: monthlySales[index],
    }));
  };

  return (
    <motion.div
      className="bg-white backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h2 className="text-xl font-semibold text-black mb-4">Sales Trend</h2>
      {isLoading ? (
        <div className="flex justify-center items-center h-[300px]">
          <p>Loading sales data...</p>
        </div>
      ) : (
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(31, 41, 55, 0.8)',
                  borderColor: '#4B5563',
                }}
                itemStyle={{ color: '#E5E7EB' }}
                formatter={(value) => [`$${value.toFixed(2)}`, 'Sales']}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#8B5CF6"
                strokeWidth={2}
                name="Sales ($)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
};
export default SalesTrendChart;
