import { BarChart2, DollarSign, Menu, Settings, ShoppingBag, ShoppingCart, TrendingUp, Users, TicketPercent, Tag, ChevronDown, ChevronUp ,Package, ScrollText, FileText, Smile, ThumbsUp, Droplets } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";

const SIDEBAR_ITEMS = [
	{
		name: "Overview",
		icon: BarChart2,
		color: "#6366f1",
		href: "/admin",
	},
	{
		name: "Products",
		icon: Package,
		color: "#F59E0B", // Orange
		children: [
		  {
			name: "All Products",
			icon: ShoppingBag,
			color: "#FACC15", // Bright Yellow
			href: "/admin/products",
		  },
		  {
			name: "Brands",
			icon: Tag,
			color: "#A3E635", // Lime Green
			href: "/admin/brands",
		  },
		  {
			name: "Skin Types",
			icon: Smile,
			color: "#10B981", // Green
			href: "/admin/skintypes",
		  },
		  {
			name: "Rating",
			icon: ThumbsUp,
			color: "#FFD700", // Gold
			href: "/admin/ratings",
		  },
		  {
			name: "Routine",
			icon: Droplets,
			color: "#60A5FA", // Light Blue
			href: "/admin/routines",
		  },
		],
	  }, 
	{ name: "Users", icon: Users, color: "#EC4899", href: "/admin/users" },
	{ name: "Sales", icon: DollarSign, color: "#10B981", href: "/admin/sales" },
	{ name: "Orders", icon: ShoppingCart, color: "#F97316", href: "/admin/orders" },
	{ name: "Blogs", icon: ScrollText, color: "#8B5CF6", href: "/admin/blogs" },
	{ name: "Quizzes", icon: FileText , color: "#06B6D4", href: "/admin/quizzes" },
	{ name: "Promotions", icon: TicketPercent, color: "#E11D48", href: "/admin/promotions" },
];

const Sidebar = () => {
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);
	const [isProductsOpen, setIsProductsOpen] = useState(false);

	return (
		<motion.div
			className={`relative z-10 transition-all duration-300 ease-in-out flex-shrink-0 ${isSidebarOpen ? "w-64" : "w-20"
				}`}
			animate={{ width: isSidebarOpen ? 256 : 100 }}
		>
			<div className='h-full bg-white backdrop-blur-md text-black p-4 flex flex-col border-r border-gray-300'>
				<motion.button
					whileHover={{ scale: 1.1 }}
					whileTap={{ scale: 0.9 }}
					onClick={() => setIsSidebarOpen(!isSidebarOpen)}
					className='p-2 rounded-full hover:bg-blue-300	 transition-colors max-w-fit'
				>
					<Menu size={24} />
				</motion.button>

				<nav className="mt-8 flex-grow overflow-y-auto max-h-screen">
					{SIDEBAR_ITEMS.map((item) => {
						if (item.children) {
							return (
								<div key={item.name}>
									<motion.div
										onClick={() => setIsProductsOpen(!isProductsOpen)}
										className="flex items-center justify-between p-4 text-sm font-medium rounded-lg hover:bg-blue-300 transition-colors mb-2 cursor-pointer"
									>
										<div className="flex items-center">
											<item.icon size={20} style={{ color: item.color, minWidth: "20px" }} />
											<AnimatePresence>
												{isSidebarOpen && (
													<motion.span
														className="ml-4 whitespace-nowrap"
														initial={{ opacity: 0, width: 0 }}
														animate={{ opacity: 1, width: "auto" }}
														exit={{ opacity: 0, width: 0 }}
														transition={{ duration: 0.2, delay: 0.3 }}
													>
														{item.name}
													</motion.span>
												)}
											</AnimatePresence>
										</div>

										{isSidebarOpen && (
											isProductsOpen ? (
												<ChevronUp size={20} />
											) : (
												<ChevronDown size={20} />
											)
										)}
									</motion.div>

									<AnimatePresence>
										{isProductsOpen && (
											<motion.div
												initial={{ opacity: 0, height: 0 }}
												animate={{ opacity: 1, height: "auto" }}
												exit={{ opacity: 0, height: 0 }}
												transition={{ duration: 0.2 }}
												className={`${isSidebarOpen ? "" : "absolute left-full  ml-1 top-40 bg-white shadow-lg rounded-lg p-2"}`}
											>
												{item.children.map((child) => (
													<Link key={child.href} to={child.href}>
														<motion.div
															className={`flex items-center p-4 text-sm font-medium rounded-lg hover:bg-blue-300 transition-colors mb-2 ${
																isSidebarOpen ? "ml-3" : ""
															}`}
														>
															{/* Hiển thị icon luôn luôn */}
															<child.icon size={20} style={{ color: child.color, minWidth: "20px" }} />

															{/* Hiển thị text có điều kiện theo isSidebarOpen */}
															<AnimatePresence>
																{isSidebarOpen && (
																	<motion.span
																		className="ml-4 whitespace-nowrap"
																		initial={{ opacity: 0, width: 0 }}
																		animate={{ opacity: 1, width: "auto" }}
																		exit={{ opacity: 0, width: 0 }}
																		transition={{ duration: 0.2, delay: 0.3 }}
																	>
																		{child.name}
																	</motion.span>
																)}
															</AnimatePresence>
														</motion.div>
													</Link>
												))}
											</motion.div>
										)}
									</AnimatePresence>
								</div>
							);
						} else {
							return (
								<Link key={item.href} to={item.href}>
									<motion.div className="flex items-center p-4 text-sm font-medium rounded-lg hover:bg-blue-300 transition-colors mb-2">
										<item.icon size={20} style={{ color: item.color, minWidth: "20px" }} />
										<AnimatePresence>
											{isSidebarOpen && (
												<motion.span
													className="ml-4 whitespace-nowrap"
													initial={{ opacity: 0, width: 0 }}
													animate={{ opacity: 1, width: "auto" }}
													exit={{ opacity: 0, width: 0 }}
													transition={{ duration: 0.2, delay: 0.3 }}
												>
													{item.name}
												</motion.span>
											)}
										</AnimatePresence>
									</motion.div>
								</Link>
							);
						}
					})}
				</nav>
			</div>
		</motion.div>
	);
};

export default Sidebar;
