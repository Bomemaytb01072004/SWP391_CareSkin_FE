import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useState, useEffect } from 'react';
import { calculateSalesStats } from '../../utils/apiSales';

// Define colors for the pie chart - using lighter, more visible colors
const COLORS = [
  '#4F46E5',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#6366F1',
  '#14B8A6',
  '#F97316',
  '#8B5CF6',
];

const SalesByCategoryChart = () => {
  const [categorySalesData, setCategorySalesData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategorySalesData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('Fetching category sales data...');
        const stats = await calculateSalesStats();
        console.log('Category sales data received:', stats.categorySalesData);
        setTotalRevenue(stats.totalRevenue);

        if (stats.categorySalesData && stats.categorySalesData.length > 0) {
          // Filter out any categories with 0 value
          const filteredData = stats.categorySalesData.filter(
            (item) => item.value > 0
          );
          console.log('Filtered category data:', filteredData);

          // Verify total matches
          const categoryTotal = filteredData.reduce(
            (sum, item) => sum + item.value,
            0
          );
          console.log(
            'Category total:',
            categoryTotal,
            'Total revenue:',
            stats.totalRevenue
          );

          if (filteredData.length > 0) {
            setCategorySalesData(filteredData);
          } else {
            console.log('No sales data available');
            setCategorySalesData([]);
          }
        } else {
          console.log('No category data available');
          setCategorySalesData([]);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching category sales data:', error);
        setError('Failed to load category data');
        setIsLoading(false);
        setCategorySalesData([]);
      }
    };

    fetchCategorySalesData();
  }, []);

  // Custom rendering for the pie chart labels
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Only show label if percentage is significant (> 3%)
    if (percent < 0.03) return null;

    return (
      <text
        x={x}
        y={y}
        fill="black"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="500"
      >
        {`${categorySalesData[index].name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  };

  // Format currency for tooltip
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <motion.div
      className="bg-white shadow-lg rounded-xl p-6 border border-gray-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Sales by Category
        </h2>
        <div className="text-sm text-gray-600">
          Total Revenue: {formatCurrency(totalRevenue)}
        </div>
      </div>

      <div style={{ width: '100%', height: 300 }}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-600">Loading category sales data...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-red-600">{error}</p>
          </div>
        ) : categorySalesData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-600">No sales data available</p>
          </div>
        ) : (
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={categorySalesData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#ffffff"
                dataKey="value"
              >
                {categorySalesData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              {/* <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e5e7eb',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
                itemStyle={{ color: '#111827' }}
                formatter={(value) => [formatCurrency(value), 'Sales']}
              /> */}
              <Legend
                formatter={(value) => (
                  <span style={{ color: '#111827' }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
};

export default SalesByCategoryChart;
