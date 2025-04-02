import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import Header from "../../components/common/Header";
import StatCard from "../../components/common/StatCard";
import { ToastContainer } from "react-toastify";

import { ScrollText, FileCheck, Clock, OctagonX } from "lucide-react";

import BlogsTable from "../../components/blogs/BlogsTable";
import { fetchBlogs } from "../../utils/api";

const BlogsPage = () => {
    const {
        data: blogs = [],
        isLoading: blogsLoading,
        error: blogsError,
        refetch: refetchBlogs,
    } = useQuery({
        queryKey: ["blogs"],
        queryFn: fetchBlogs,
    });

    const [filterStatus, setFilterStatus] = useState("all");

    if (blogsLoading)
        return (
            <div className="flex justify-center items-center h-screen bg-white text-black">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );

    if (blogsError)
        return (
            <div className="flex justify-center items-center h-screen bg-white text-black">
                <p>Error fetching blogs. Please try again later.</p>
            </div>
        );

    // Calculate stats for the cards
    const totalBlogs = blogs.length;
    const publishedBlogs = blogs.filter((blog) => blog.IsActive).length;
    const draftBlogs = totalBlogs - publishedBlogs;

    // Calculate the number of blogs published in the last 30 days
    const recentBlogs = blogs.filter((blog) => {
        const publishDate = new Date(blog.PublishedDate);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return publishDate >= thirtyDaysAgo && blog.IsPublished;
    }).length;

    const filteredBlogs = filterStatus === "all"
    ? blogs
    : blogs.filter(quiz =>
      filterStatus === "active" ? quiz.IsActive : !quiz.IsActive
    );

    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="flex-1 overflow-auto relative bg-white text-black">
                <Header title="Blogs" />

                <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
                    {/* STATS */}
                    <motion.div
                        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                    >
                        <StatCard
                            name="Total Blogs"
                            icon={ScrollText}
                            value={totalBlogs}
                            color="#8B5CF6"
                        />
                        <StatCard
                            name="Active Blogs"
                            icon={FileCheck}
                            value={publishedBlogs}
                            color="#10B981"
                        />
                        <StatCard
                            name="Inactive Blogs"
                            icon={OctagonX}
                            value={draftBlogs}
                            color="#F59E0B"
                        />
                    </motion.div>

                    <div className="flex space-x-4 mb-6">
                        <button
                            className={`px-4 py-2 rounded-lg transition-colors ${filterStatus === "all"
                                ? "bg-purple-300 text-black"
                                : "bg-gray-300 text-black hover:bg-gray-100"
                                }`}
                            onClick={() => setFilterStatus("all")}
                        >
                            All Blogs
                        </button>
                        <button
                            className={`px-4 py-2 rounded-lg transition-colors ${filterStatus === "active"
                                ? "bg-green-600 text-white"
                                : "bg-gray-300 text-black hover:bg-gray-100"
                                }`}
                            onClick={() => setFilterStatus("active")}
                        >
                            Active
                        </button>
                        <button
                            className={`px-4 py-2 rounded-lg transition-colors ${filterStatus === "inactive"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-300 text-black hover:bg-gray-100"
                                }`}
                            onClick={() => setFilterStatus("inactive")}
                        >
                            Inactive
                        </button>
                    </div>

                    {/* Blogs Table */}
                    <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-300">
                        <BlogsTable blogs={filteredBlogs} refetchBlogs={refetchBlogs} />
                    </div>
                </main>
            </div>
        </>
    );
};

export default BlogsPage;
