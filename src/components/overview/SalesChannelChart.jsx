import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";

const COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#10B981", "#F59E0B"];

const SALES_CHANNEL_DATA = [
    { name: "Website", value: 45600 },
    { name: "Mobile App", value: 38200 },
    { name: "Marketplace", value: 29800 },
    { name: "Social Media", value: 18700 },
];

const SalesChannelChart = () => {
    return (
        <motion.div
            className='bg-white shadow-lg rounded-xl p-6 lg:col-span-2 border border-gray-300'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
        >
            <h2 className='text-lg font-medium mb-4 text-black'>Sales by Channel</h2>

            <div className='h-80'>
                <ResponsiveContainer>
                    <BarChart data={SALES_CHANNEL_DATA}>
                        <CartesianGrid strokeDasharray='3 3' stroke='#E5E7EB' />
                        <XAxis dataKey='name' stroke='#374151' />
                        <YAxis stroke='#374151' />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "rgba(255, 255, 255, 0.9)",
                                borderColor: "#D1D5DB",
                            }}
                            itemStyle={{ color: "#111827" }}
                        />
                        <Legend />
                        <Bar dataKey={"value"} fill='#6366F1'>
                            {SALES_CHANNEL_DATA.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};
export default SalesChannelChart;
