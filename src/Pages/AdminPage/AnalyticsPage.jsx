import React, { useState } from "react";
import Header from "../../components/common/Header";
import { motion } from "framer-motion";
import { DollarSign, Users, ShoppingBag, Eye } from "lucide-react";

// Import our new visualization components
import SkinTypeDistribution from "../../components/analytics/SkinTypeDistribution";
import PopularProducts from "../../components/analytics/PopularProducts";
import QuizCompletionRate from "../../components/analytics/QuizCompletionRate";

const overviewData = [
	{ name: "Total Users", value: "2,345", change: 8.3, icon: Users },
	{ name: "Orders", value: "584", change: 12.5, icon: ShoppingBag },
	{ name: "Products", value: "127", change: 5.7, icon: Eye },
	{ name: "Quizzes Taken", value: "1,297", change: 15.7, icon: DollarSign },
];

const AnalyticsPage = () => {
	const [timeRange, setTimeRange] = useState("month");

	const handleTimeRangeChange = (e) => {
		setTimeRange(e.target.value);
	};

	return (
		<div className="flex-1 overflow-auto relative z-10 bg-gray-900">
			<Header title={"Analytics Dashboard"} />

			<main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
				{/* Time Range Selector */}
				<div className="flex justify-end mb-6">
					<div className="flex items-center space-x-2">
						<span className="text-gray-400">Global Time Range:</span>
						<select
							className="bg-gray-700 text-white rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
							value={timeRange}
							onChange={handleTimeRangeChange}
						>
							<option value="week">This Week</option>
							<option value="month">This Month</option>
							<option value="quarter">This Quarter</option>
							<option value="year">This Year</option>
						</select>
					</div>
				</div>

				{/* Overview Cards */}
				<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
					{overviewData.map((item, index) => (
						<motion.div
							key={item.name}
							className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg shadow-lg rounded-xl p-6 border border-gray-700"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.1 }}
						>
							<div className="flex items-center justify-between">
								<div>
									<h3 className="text-sm font-medium text-gray-400">{item.name}</h3>
									<p className="mt-1 text-xl font-semibold text-gray-100">{item.value}</p>
								</div>

								<div
									className={`p-3 rounded-full ${
										item.change >= 0 ? "bg-green-500" : "bg-red-500"
									} bg-opacity-20`}
								>
									<item.icon className={`size-6 ${item.change >= 0 ? "text-green-500" : "text-red-500"}`} />
								</div>
							</div>
							<div
								className={`mt-4 flex items-center ${item.change >= 0 ? "text-green-500" : "text-red-500"}`}
							>
								{item.change >= 0 ? (
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-5 w-5"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fillRule="evenodd"
											d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
											clipRule="evenodd"
										/>
									</svg>
								) : (
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-5 w-5"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fillRule="evenodd"
											d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
											clipRule="evenodd"
										/>
									</svg>
								)}
								<span className="ml-1 text-sm font-medium">{Math.abs(item.change)}%</span>
								<span className="ml-2 text-sm text-gray-400">vs last period</span>
							</div>
						</motion.div>
					))}
				</div>

				{/* Main Visualizations */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
					<SkinTypeDistribution />
					<PopularProducts />
					<QuizCompletionRate />
				</div>

				{/* Analytics Summary */}
				<motion.div
					className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg shadow-lg rounded-xl p-6 border border-gray-700 mb-8"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.8 }}
				>
					<h2 className="text-xl font-semibold text-gray-100 mb-4">Analytics Summary</h2>
					<div className="text-gray-300 space-y-4">
						<p>
							This dashboard provides key insights into your skincare business. The visualizations show skin type
							distribution among your users, popular products by views and purchases, and quiz completion rates.
						</p>
						<p>
							Use these insights to make informed decisions about your product offerings, marketing strategies,
							and user experience improvements. For example, if a specific skin type is predominant among your
							users, consider developing more products targeted to that skin type.
						</p>
						<p>
							Similarly, if certain products have high view counts but low purchase rates, you may want to
							evaluate pricing, product descriptions, or offer special promotions to increase conversions.
						</p>
					</div>
				</motion.div>
			</main>
		</div>
	);
};

export default AnalyticsPage;
