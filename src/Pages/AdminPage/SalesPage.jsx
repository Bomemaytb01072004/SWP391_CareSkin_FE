import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Header from "../../components/common/Header";
import StatCard from "../../components/common/StatCard";
import { CreditCard, DollarSign, ShoppingCart, TrendingUp } from "lucide-react";
import SalesOverviewChart from "../../components/sales/SalesOverviewChart";
import SalesByCategoryChart from "../../components/sales/SalesByCategoryChart";
import DailySalesTrend from "../../components/sales/DailySalesTrend";
import { calculateSalesStats } from "../../utils/apiSales";

const SalesPage = () => {
	
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

	return (
		<div className='flex-1 overflow-auto relative z-10'>
			<Header title='Sales Dashboard' />

			<main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
				{/* SALES STATS */}
				<motion.div
					className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1 }}
				>
					<StatCard 
						name='Total Revenue' 
						icon={DollarSign} 
						value={isLoading ? "Loading..." : `$${salesStats.totalRevenue.toFixed(2)}`} 
						color='#6366F1' 
					/>
					<StatCard
						name='Avg. Order Value'
						icon={ShoppingCart}
						value={isLoading ? "Loading..." : `$${salesStats.averageOrderValue.toFixed(2)}`}
						color='#10B981'
					/>
					<StatCard
						name='Conversion Rate'
						icon={TrendingUp}
						value={isLoading ? "Loading..." : `${salesStats.conversionRate.toFixed(2)}%`}
						color='#F59E0B'
					/>
					<StatCard 
						name='Completed Orders' 
						icon={CreditCard} 
						value={isLoading ? "Loading..." : salesStats.completedOrders} 
						color='#EF4444' 
					/>
				</motion.div>

				<SalesOverviewChart />

				<div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
					<SalesByCategoryChart />
					<DailySalesTrend />
				</div>
			</main>
		</div>
	);
};
export default SalesPage;
