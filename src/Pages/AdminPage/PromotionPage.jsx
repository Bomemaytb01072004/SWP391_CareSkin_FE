import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

import Header from '../../components/common/Header';
import StatCard from '../../components/common/StatCard';
import { ToastContainer } from 'react-toastify';

import { Gift, Percent, Calendar, TrendingUp } from "lucide-react";

import PromotionsTable from "../../components/promotions/PromotionsTable";
import { fetchPromotions } from "../../utils/api";

const PromotionPageAdmin = () => {
	const {
		data: promotions,
		isLoading: promotionsLoading,
		error: promotionsError,
	} = useQuery({
		queryKey: ["promotions"],
		queryFn: fetchPromotions,
	});

	if (promotionsLoading) return <div>Loading...</div>;
	if (promotionsError) return <div>Error fetching data</div>;

	// Calculate stats for the cards
	const totalPromotions = promotions.length;
	const activePromotions = promotions.filter(promo => {
		// Check if promotion has an IsActive property
		if (promo.hasOwnProperty('IsActive')) {
			return promo.IsActive;
		}
		
		// If no IsActive property, check dates
		const now = new Date();
		const startDate = new Date(promo.StartDate);
		const endDate = new Date(promo.EndDate);
		
		return startDate <= now && now <= endDate;
	}).length;
	const upcomingPromotions = promotions.filter(promo => {
		const startDate = new Date(promo.StartDate);
		const today = new Date();
		return startDate > today;
	}).length;
    
	const avgDiscount = promotions.length > 0 
		? Math.round(promotions.reduce((sum, promo) => sum + (promo.DiscountPercent || 0), 0) / promotions.length) 
		: 0;

	return (
		<>
			<ToastContainer position="top-right" autoClose={3000} />

			<div className='flex-1 overflow-auto relative'>
				<Header title='Promotions' />

				<main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
					{/* STATS */}
					<motion.div
						className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 1 }}
					>
						<StatCard name='Total Promotions' icon={Gift} value={totalPromotions} color='#6366F1' />
						<StatCard name='Active Promotions' icon={TrendingUp} value={activePromotions} color='#10B981' />
						<StatCard name='Upcoming Promotions' icon={Calendar} value={upcomingPromotions} color='#F59E0B' />
						<StatCard name='Avg. Discount' icon={Percent} value={`${avgDiscount}%`} color='#EF4444' />
					</motion.div>
					<PromotionsTable promotions={promotions} />
				</main>
			</div>
		</>
	);
};
export default PromotionPageAdmin;