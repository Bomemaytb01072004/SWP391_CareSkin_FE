import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import Header from '../../components/common/Header';
import StatCard from '../../components/common/StatCard';
import { ToastContainer } from 'react-toastify';

import { DollarSign, Package, TrendingUp, XCircle } from "lucide-react";

import ProductsTable from "../../components/products/ProductsTable";
import { fetchProducts } from "../../utils/api";
import { calculateSalesStats } from "../../utils/apiSales";

const ProductsPageAdmin = () => {
    const {
        data: products,
        isLoading: productsLoading,
        error: productsError,
        refetch: refetchProducts
    } = useQuery({
        queryKey: ["products"],
        queryFn: fetchProducts,
    });

    const [salesStats, setSalesStats] = useState({
		totalRevenue: 0
	});

	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchSalesStats = async () => {
			try {
				setIsLoading(true);
				const stats = await calculateSalesStats();
				setSalesStats({
					totalRevenue: stats.totalRevenue
				});
				setIsLoading(false);
			} catch (error) {
				console.error("Error fetching sales stats:", error);
				setIsLoading(false);
			}
		};

		fetchSalesStats();
	}, []);

    const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'active', 'inactive'
    const [filteredProducts, setFilteredProducts] = useState([]);

    useEffect(() => {
        if (!products) return;

        // First sort brands by BrandId in descending order (newest first)
        const sortedProducts = [...products].sort((a, b) => b.ProductId - a.ProductId);

        // Then apply the active filter
        if (activeFilter === 'all') {
            setFilteredProducts(sortedProducts);
        } else if (activeFilter === 'active') {
            setFilteredProducts(sortedProducts.filter(product => product.IsActive));
        } else if (activeFilter === 'inactive') {
            setFilteredProducts(sortedProducts.filter(product => !product.IsActive));
        }
    }, [products, activeFilter]);

    if (productsLoading) return <div>Loading...</div>;
    if (productsError) return <div>Error fetching data</div>;

    const activeProducts = products.filter((product) => product.IsActive).length;
    const inactiveProducts = products.filter((product) => !product.IsActive).length;

    return (
        <>
            <ToastContainer position="top-right" autoClose={5000} style={{zIndex: 10000}} />

            <div className='flex-1 overflow-auto relative bg-white text-black'>
                <Header title='Products' />

                <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
                    {/* STATS */}
                    <motion.div
                        className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                    >
                        <StatCard name='Total Products' icon={Package} value={products.length} color='#6366F1' />
                        <StatCard name='Active Products' icon={TrendingUp} value={activeProducts} color='#10B981' />
                        <StatCard name='Inactive Products' icon={XCircle} value={inactiveProducts} color='#F59E0B' />
                        <StatCard
                            name="Total Revenue"
                            icon={DollarSign}
                            value={isLoading ? "Loading..." : `$${salesStats.totalRevenue.toFixed(2)}`} 
                            color="#EF4444"
                        />
                    </motion.div>

                    <div className="flex space-x-4 mb-6">
                        <button
                            className={`px-4 py-2 rounded-lg transition-colors ${activeFilter === "all"
                                ? "bg-purple-300 text-black"
                                : "bg-gray-300 text-black hover:bg-gray-100"
                                }`}
                            onClick={() => setActiveFilter("all")}
                        >
                            All Products
                        </button>
                        <button
                            className={`px-4 py-2 rounded-lg transition-colors ${activeFilter === "active"
                                ? "bg-green-600 text-white"
                                : "bg-gray-300 text-black hover:bg-gray-100"
                                }`}
                            onClick={() => setActiveFilter("active")}
                        >
                            Active
                        </button>
                        <button
                            className={`px-4 py-2 rounded-lg transition-colors ${activeFilter === "inactive"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-300 text-black hover:bg-gray-100"
                                }`}
                            onClick={() => setActiveFilter("inactive")}
                        >
                            Inactive
                        </button>
                    </div>

                    <ProductsTable products={filteredProducts} refetchProducts={refetchProducts} />
                </main>
            </div>
        </>
    );
};

export default ProductsPageAdmin;
