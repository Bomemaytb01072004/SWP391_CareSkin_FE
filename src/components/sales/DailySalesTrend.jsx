import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";
import { calculateSalesStats } from "../../utils/apiSales";

const DailySalesTrend = () => {
	const [dailySalesData, setDailySalesData] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchDailySalesData = async () => {
			try {
				setIsLoading(true);
				const stats = await calculateSalesStats();
				setDailySalesData(stats.dailyData);
				setIsLoading(false);
			} catch (error) {
				console.error("Error fetching daily sales data:", error);
				setIsLoading(false);
			}
		};

		fetchDailySalesData();
	}, []);

	// Format currency for tooltip
	const formatCurrency = (value) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(value);
	};

	return (
		<motion.div
			className='bg-white shadow-lg rounded-xl p-6 border border-gray-200'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.4 }}
		>
			<h2 className='text-xl font-semibold text-gray-800 mb-4'>Daily Sales Trend</h2>

			<div style={{ width: "100%", height: 300 }}>
				{isLoading ? (
					<div className="flex items-center justify-center h-full">
						<p className="text-gray-600">Loading daily sales data...</p>
					</div>
				) : (
					<ResponsiveContainer>
						<BarChart data={dailySalesData}>
							<CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
							<XAxis dataKey='name' stroke='#4b5563' />
							<YAxis stroke='#4b5563' />
							<Tooltip
								contentStyle={{
									backgroundColor: "#ffffff",
									borderColor: "#e5e7eb",
									boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
								}}
								itemStyle={{ color: "#111827" }}
								formatter={(value) => [formatCurrency(value), "Sales"]}
							/>
							<Bar dataKey='sales' fill='#4F46E5' />
						</BarChart>
					</ResponsiveContainer>
				)}
			</div>
		</motion.div>
	);
};

export default DailySalesTrend;
