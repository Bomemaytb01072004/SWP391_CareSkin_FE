import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'];

const CategoryDistributionChart = ({ products }) => {
  const categoryData = useMemo(() => {
    if (!products) return [];

    // Chỉ lấy những sản phẩm có IsActive === true
    const activeProducts = products.filter(product => product.IsActive);

    const categoryMap = {};
    activeProducts.forEach((product) => {
      if (!product.Category || typeof product.Category !== 'string') return;

      const categories = product.Category.split(',').map((cat) => cat.trim());
      categories.forEach((cat) => {
        if (cat) {
          categoryMap[cat] = (categoryMap[cat] || 0) + 1;
        }
      });
    });

    return Object.keys(categoryMap).map((key) => ({
      name: key,
      value: categoryMap[key],
    }));
  }, [products]);

  return (
    <motion.div
      className="bg-white shadow-lg rounded-xl p-6 border border-gray-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h2 className="text-lg font-medium mb-4 text-black">
        Category Distribution
      </h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
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
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderColor: '#D1D5DB',
              }}
              itemStyle={{ color: '#111827' }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default CategoryDistributionChart;
