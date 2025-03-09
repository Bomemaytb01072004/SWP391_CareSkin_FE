import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';

import Header from '../../components/common/Header';
import StatCard from '../../components/common/StatCard';

import { AlertTriangle, DollarSign, Package, TrendingUp } from 'lucide-react';

import ProductsTable from '../../components/products/ProductsTable';
import { fetchProducts } from '../../utils/api';

const ProductsPageAdmin = () => {
  const {
    data: products,
    isLoading: productsLoading,
    error: productsError,
  } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  if (productsLoading) return <div>Loading...</div>;
  if (productsError) return <div>Error fetching data</div>;

  return (
    <div className="flex-1 overflow-auto relative">
      <Header title="Products" />

      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        {/* STATS */}
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard
            name="Total Products"
            icon={Package}
            value={products.length}
            color="#6366F1"
          />
          <StatCard
            name="Top Selling"
            icon={TrendingUp}
            value={89}
            color="#10B981"
          />
          <StatCard
            name="Low Stock"
            icon={AlertTriangle}
            value={23}
            color="#F59E0B"
          />
          <StatCard
            name="Total Revenue"
            icon={DollarSign}
            value={'$543,210'}
            color="#EF4444"
          />
        </motion.div>
        <ProductsTable products={products} />
      </main>
    </div>
  );
};
export default ProductsPageAdmin;
