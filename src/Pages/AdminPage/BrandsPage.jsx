import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Tag, Box, PlusCircle, CheckCircle, XCircle } from "lucide-react";

import Header from '../../components/common/Header';
import StatCard from '../../components/common/StatCard';
import { ToastContainer } from 'react-toastify';
import CreateBrandModal from "../../components/brands/CreateBrandModal";
import BrandsTable from "../../components/brands/BrandsTable";
import { fetchBrands, updateBrand, deleteBrand } from "../../utils/api";

const BrandsPage = () => {
	const {
		data: brands,
		isLoading: brandsLoading,
		error: brandsError,
		refetch: refetchBrands
	} = useQuery({
		queryKey: ["brands"],
		queryFn: fetchBrands,
	});

	// Modal state
	const [isModalBrand, setIsModalBrand] = useState(false);
	// Brand state
	const [newBrand, setNewBrand] = useState({
		Name: '',
		PictureFile: '',
	});
	const [previewUrlNewUploadBrand, setPreviewUrlNewUploadBrand] = useState(null);
	
	// Active/Inactive filter state
	const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'active', 'inactive'
	const [filteredBrands, setFilteredBrands] = useState([]);
	
	useEffect(() => {
		if (!brands) return;
		
		// First sort brands by BrandId in descending order (newest first)
		const sortedBrands = [...brands].sort((a, b) => b.BrandId - a.BrandId);
		
		// Then apply the active filter
		if (activeFilter === 'all') {
			setFilteredBrands(sortedBrands);
		} else if (activeFilter === 'active') {
			setFilteredBrands(sortedBrands.filter(brand => brand.IsActive));
		} else if (activeFilter === 'inactive') {
			setFilteredBrands(sortedBrands.filter(brand => !brand.IsActive));
		}
	}, [brands, activeFilter]);

	if (brandsLoading) return <div>Loading...</div>;
	if (brandsError) return <div>Error fetching brands data</div>;

	// Calculate stats for the cards
	const totalBrands = brands.length;
	const activeBrands = brands.filter(brand => brand.IsActive).length;
	const inactiveBrands = totalBrands - activeBrands;

	return (
		<>
			<ToastContainer position="top-right" autoClose={3000} />

			<div className='flex-1 overflow-auto relative bg-white'>
				<Header title='Brands' />

				<main className='bg-white max-w-7xl mx-auto py-6 px-4 lg:px-8'>
					{/* STATS */}
					<motion.div
						className='grid grid-cols-1 gap-5 sm:grid-cols-3 lg:grid-cols-4 mb-8'
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 1 }}
					>
						<StatCard 
							name='Total Brands' 
							icon={Tag} 
							value={totalBrands} 
							color='#6366F1' 
							onClick={() => setActiveFilter('all')}
							isActive={activeFilter === 'all'}
						/>
						
						<StatCard 
							name='Active Brands' 
							icon={CheckCircle} 
							value={activeBrands} 
							color='#10B981' 
							onClick={() => setActiveFilter('active')}
							isActive={activeFilter === 'active'}
						/>
						
						<StatCard 
							name='Inactive Brands' 
							icon={XCircle} 
							value={inactiveBrands} 
							color='#EF4444' 
							onClick={() => setActiveFilter('inactive')}
							isActive={activeFilter === 'inactive'}
						/>
						
						{/* Add new brand button */}
						<div className="flex items-center justify-center w-full h-full">
							<button
								onClick={() => setIsModalBrand(true)}
								className="flex items-center justify-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition duration-200"
							>
								<PlusCircle size={20} className="mr-2" />
								Add New Brand
							</button>
						</div>
					</motion.div>
					
					{/* Filter Status Bar */}
					<div className="mb-6 flex items-center">
						<span className="text-gray-700 mr-3 font-medium">Status Filter:</span>
						<div className="flex space-x-2">
							<button 
								className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${activeFilter === 'all' ? 'bg-gray-300 text-black' : 'bg-gray-500 text-gray-700 hover:bg-blue-400'}`}
								onClick={() => setActiveFilter('all')}
							>
								All
							</button>
							<button 
								className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${activeFilter === 'active' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
								onClick={() => setActiveFilter('active')}
							>
								Active
							</button>
							<button 
								className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${activeFilter === 'inactive' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
								onClick={() => setActiveFilter('inactive')}
							>
								Inactive
							</button>
						</div>
					</div>

					{/* Brands Table */}
					<BrandsTable 
						brands={filteredBrands} 
						refetchBrands={refetchBrands} 
						updateBrand={updateBrand} 
						deleteBrand={deleteBrand} 
					/>

					{/* Create Brand Modal */}
					{isModalBrand && (
						<CreateBrandModal
							newBrand={newBrand}
							setNewBrand={setNewBrand}
							previewUrlNewUploadBrand={previewUrlNewUploadBrand}
							setPreviewUrlNewUploadBrand={setPreviewUrlNewUploadBrand}
							onClose={() => setIsModalBrand(false)}
							refetchBrands={refetchBrands}
						/>
					)}
				</main>
			</div>
		</>
	);
};

export default BrandsPage;
