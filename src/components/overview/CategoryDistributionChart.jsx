import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { fetchProducts } from '../../utils/api';

const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'];

const CategoryDistributionChart = () => {
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    const getCategoryData = async () => {
      try {
        const products = await fetchProducts();
        const categoryMap = {};

        // Group products by category
        products.forEach((product) => {
          if (categoryMap[product.category]) {
            categoryMap[product.category] += 1; // Increase count for this category
          } else {
            categoryMap[product.category] = 1; // Initialize category count
          }
        });

        // Convert object into array format suitable for Recharts
        const formattedData = Object.keys(categoryMap).map((key) => ({
          name: key,
          value: categoryMap[key],
        }));

        setCategoryData(formattedData);
      } catch (error) {
        console.error(
          'Failed to fetch products for category distribution:',
          error
        );
      }
    };
    getCategoryData();
  }, []);

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h2 className="text-lg font-medium mb-4 text-gray-100">
        Category Distribution
      </h2>
      <div className="h-80">
        <ResponsiveContainer width={'100%'} height={'100%'}>
          <PieChart>
            <Pie
              data={categoryData}
              cx={'50%'}
              cy={'50%'}
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
            >
              {categoryData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(31, 41, 55, 0.8)',
                borderColor: '#4B5563',
              }}
              itemStyle={{ color: '#E5E7EB' }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default CategoryDistributionChart;
