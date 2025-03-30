import { BarChart2, ShoppingBag, Users, Zap, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import Header from "../../components/common/Header";
import StatCard from "../../components/common/StatCard";
import SalesOverviewChart from "../../components/sales/SalesOverviewChart";
import CategoryDistributionChart from "../../components/overview/CategoryDistributionChart";
// import SalesChannelChart from "../../components/overview/SalesChannelChart";
import DailyOrders from '../../components/orders/DailyOrders';
import { fetchProducts, fetchCustomers } from "../../utils/api";
import { calculateSalesStats } from "../../utils/apiSales";
import { useQueryClient } from '@tanstack/react-query';

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

  const [salesStats, setSalesStats] = useState({
      totalRevenue: 0,
      averageOrderValue: 0,
      conversionRate: 0,
      completedOrders: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
  
    useEffect(() => {
      const fetchSalesStats = async () => {
        try {
          setIsLoading(true);
          const stats = await calculateSalesStats();
          setSalesStats({
            totalRevenue: stats.totalRevenue,
            averageOrderValue: stats.averageOrderValue,
            conversionRate: stats.conversionRate,
            completedOrders: stats.completedOrders,
          });
          setIsLoading(false);
        } catch (error) {
          console.error("Error fetching sales stats:", error);
          setIsLoading(false);
        }
      };
  
      fetchSalesStats();
    }, []);

  if (productsLoading || usersLoading) return <div>Loading...</div>;
  if (productsError || usersError) return <div>Error fetching data</div>;

  function CheckCache() {
    const queryClient = useQueryClient();
    const cachedProducts = queryClient.getQueryData(["products"]);
  
    if (cachedProducts) {
      console.log("Dữ liệu products đã được cache:", cachedProducts);
    } else {
      console.log("Dữ liệu products chưa có trong cache.");
    }
  
    return null;
  }


  return (
    <div className="bg-white flex-1 overflow-auto relative z-0">
      <Header title="Overview" />
      <CheckCache />
      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard 
						name='Total Sales' 
						icon={Zap} 
						value={isLoading ? "Loading..." : `$${salesStats.totalRevenue.toFixed(2)}`} 
						color='#6366F1' 
					/>
          <StatCard name="Total Users" icon={Users} value={users.length} color="#8B5CF6" />
          <StatCard name="Total Products" icon={ShoppingBag} value={products.length} color="#EC4899" />
          <StatCard
						name='Conversion Rate'
						icon={TrendingUp}
						value={isLoading ? "Loading..." : `${salesStats.conversionRate.toFixed(2)}%`}
						color='#F59E0B'
					/>
        </motion.div>
        <SalesOverviewChart />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <DailyOrders />
          <CategoryDistributionChart products={products} />
          {/* <SalesChannelChart /> */}
        </div>
      </main>
    </div>
  )};


export default OverviewPage;
