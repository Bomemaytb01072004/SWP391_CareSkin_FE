import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useMemo } from "react";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE"];

const UserDemographicsChart = ({ customers = [] }) => {
	// Calculate age groups based on user DOB
	const userDemographicsData = useMemo(() => {
		// Initialize age groups
		const ageGroups = {
			"18-24": 0,
			"25-34": 0,
			"35-44": 0,
			"45-54": 0,
			"55+": 0,
		};

		// Current date for age calculation
		const currentDate = new Date();
		const currentYear = currentDate.getFullYear();

		// Count users in each age group
		customers.forEach((customer) => {
			if (!customer.Dob) return; // Skip if DOB is not provided
			
			try {
				// Parse DOB string to Date object
				const dobDate = new Date(customer.Dob);
				
				// Calculate age
				let age = currentYear - dobDate.getFullYear();
				
				// Adjust age if birthday hasn't occurred yet this year
				const currentMonth = currentDate.getMonth();
				const dobMonth = dobDate.getMonth();
				const currentDay = currentDate.getDate();
				const dobDay = dobDate.getDate();
				
				if (
					dobMonth > currentMonth || 
					(dobMonth === currentMonth && dobDay > currentDay)
				) {
					age--;
				}
				
				// Assign to age group
				if (age < 18) {
					// Skip users under 18 or handle differently if needed
					return;
				} else if (age <= 24) {
					ageGroups["18-24"]++;
				} else if (age <= 34) {
					ageGroups["25-34"]++;
				} else if (age <= 44) {
					ageGroups["35-44"]++;
				} else if (age <= 54) {
					ageGroups["45-54"]++;
				} else {
					ageGroups["55+"]++;
				}
			} catch (error) {
				console.error("Error parsing DOB:", error);
			}
		});

		// Convert to array format for the chart
		return Object.entries(ageGroups).map(([name, value]) => ({
			name,
			value,
		}));
	}, [customers]);

	// Check if we have any data to display
	const hasData = userDemographicsData.some(group => group.value > 0);

	return (
		<motion.div
			className="bg-white shadow-lg rounded-xl p-6 border border-gray-300 lg:col-span-2"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.5 }}
		>
			<h2 className="text-xl font-semibold text-black mb-4">User Demographics</h2>
			<div style={{ width: "100%", height: 300 }}>
				{hasData ? (
					<ResponsiveContainer>
						<PieChart>
							<Pie
								data={userDemographicsData}
								cx="50%"
								cy="50%"
								outerRadius={100}
								fill="#8884d8"
								dataKey="value"
								label={({ name, percent }) => 
									percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''
								}
							>
								{userDemographicsData.map((entry, index) => (
									<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
								))}
							</Pie>
							<Tooltip
								contentStyle={{
									backgroundColor: "rgba(255, 255, 255, 0.9)",
									borderColor: "#D1D5DB",
								}}
								itemStyle={{ color: "#111827" }}
								formatter={(value) => [`${value} users`, null]}
							/>
							<Legend wrapperStyle={{ color: "#111827" }} />
						</PieChart>
					</ResponsiveContainer>
				) : (
					<div className="h-full flex items-center justify-center text-gray-500">
						No demographic data available
					</div>
				)}
			</div>
		</motion.div>
	);
};

export default UserDemographicsChart;
