import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { MessageSquare, CheckCircle, XCircle, Star } from "lucide-react";

import Header from '../../components/common/Header';
import StatCard from '../../components/common/StatCard';
import { ToastContainer } from 'react-toastify';
import RatingsTable from "../../components/ratings/RatingsTable";
import { fetchAllRatings, fetchActiveRatings, fetchInactiveRatings, updateRating, deleteRating } from "../../utils/apiOfRating";

const RatingsPage = () => {
    const {
        data: ratings,
        isLoading: ratingsLoading,
        error: ratingsError,
        refetch: refetchRatings
    } = useQuery({
        queryKey: ["ratings"],
        queryFn: fetchAllRatings,
    });

    // Active/Inactive filter state
    const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'active', 'inactive'
    const [filteredRatings, setFilteredRatings] = useState([]);

    useEffect(() => {
        if (!ratings) return;

        // First sort ratings by Id in descending order (newest first)
        const sortedRatings = [...ratings].sort((a, b) => b.Id - a.Id);

        // Then apply the active filter
        if (activeFilter === 'all') {
            setFilteredRatings(sortedRatings);
        } else if (activeFilter === 'active') {
            setFilteredRatings(sortedRatings.filter(rating => rating.IsActive));
        } else if (activeFilter === 'inactive') {
            setFilteredRatings(sortedRatings.filter(rating => !rating.IsActive));
        }
    }, [ratings, activeFilter]);

    // When activeFilter changes, fetch the appropriate data
    useEffect(() => {
        if (activeFilter === 'active') {
            fetchActiveRatings().then(data => {
                const sortedRatings = [...data].sort((a, b) => b.Id - a.Id);
                setFilteredRatings(sortedRatings);
            }).catch(error => console.error('Error fetching active ratings:', error));
        } else if (activeFilter === 'inactive') {
            fetchInactiveRatings().then(data => {
                const sortedRatings = [...data].sort((a, b) => b.Id - a.Id);
                setFilteredRatings(sortedRatings);
            }).catch(error => console.error('Error fetching inactive ratings:', error));
        }
    }, [activeFilter]);

    if (ratingsLoading) return <div>Loading...</div>;
    if (ratingsError) return <div>Error fetching ratings data</div>;

    // Calculate stats for the cards
    const totalRatings = ratings.length;
    const activeRatings = ratings.filter(rating => rating.IsActive).length;
    const inactiveRatings = totalRatings - activeRatings;

    // Calculate average rating (1-5 stars)
    const averageRating = ratings.length > 0
        ? (ratings.reduce((sum, rating) => sum + rating.Rating, 0) / ratings.length).toFixed(1)
        : 0;

    // Find the highest rated products
    const topRatedCount = ratings.filter(rating => rating.Rating >= 4).length;

    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} />

            <div className='flex-1 overflow-auto relative bg-white text-black'>
                <Header title='Product Ratings' />

                <main className='max-w-[1480px] mx-auto py-6 px-4 lg:px-8'>
                    {/* STATS */}
                    <motion.div
                        className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                    >
                        <StatCard
                            name='Total Ratings'
                            icon={MessageSquare}
                            value={totalRatings}
                            color='#6366F1'
                            onClick={() => setActiveFilter('all')}
                            isActive={activeFilter === 'all'}
                        />

                        <StatCard
                            name='Active Ratings'
                            icon={CheckCircle}
                            value={activeRatings}
                            color='#10B981'
                            onClick={() => setActiveFilter('active')}
                            isActive={activeFilter === 'active'}
                        />

                        <StatCard
                            name='Inactive Ratings'
                            icon={XCircle}
                            value={inactiveRatings}
                            color='#EF4444'
                            onClick={() => setActiveFilter('inactive')}
                            isActive={activeFilter === 'inactive'}
                        />

                        <StatCard
                            name='Avg Rating'
                            icon={Star}
                            value={`${averageRating}/5`}
                            color='#F59E0B'
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
                            All Ratings
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

                    {/* Ratings Table */}
                    <RatingsTable
                        ratings={filteredRatings}
                        refetchRatings={refetchRatings}
                        updateRating={updateRating}
                        deleteRating={deleteRating}
                    />
                </main>
            </div>
        </>
    );
};

export default RatingsPage;