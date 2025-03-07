import { BarChart2, ShoppingBag, Users, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

import Header from "../../components/common/Header";
import StatCard from "../../components/common/StatCard";
import SalesOverviewChart from "../../components/overview/SalesOverviewChart";
import CategoryDistributionChart from "../../components/overview/CategoryDistributionChart";
import SalesChannelChart from "../../components/overview/SalesChannelChart";
import { fetchProducts, fetchCustomers } from "../../utils/api";

const OverviewPage = () => {
  const {
    data: products,
    isLoading: productsLoading,
    error: productsError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const {
    data: users,
    isLoading: usersLoading,
    error: usersError,
  } = useQuery({
    queryKey: ["users"],
    queryFn: fetchCustomers,
  });

  if (productsLoading || usersLoading) return <div>Loading...</div>;
  if (productsError || usersError) return <div>Error fetching data</div>;


  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title="Overview" />

      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard name="Total Sales" icon={Zap} value="$12,345" color="#6366F1" />
          <StatCard name="Total Users" icon={Users} value={users.length} color="#8B5CF6" />
          <StatCard name="Total Products" icon={ShoppingBag} value={products.length} color="#EC4899" />
          <StatCard name="Conversion Rate" icon={BarChart2} value="12.5%" color="#10B981" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SalesOverviewChart />
          <CategoryDistributionChart products={products} />
          <SalesChannelChart />
        </div>
      </main>
    </div>
  );
};

export default OverviewPage;
