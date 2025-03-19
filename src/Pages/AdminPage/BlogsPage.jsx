import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

import Header from '../../components/common/Header';
import StatCard from '../../components/common/StatCard';
import { ToastContainer } from 'react-toastify';

import { ScrollText, FileCheck, Clock, Calendar } from "lucide-react";

import BlogsTable from "../../components/blogs/BlogsTable";
import { fetchBlogs } from "../../utils/api";

const BlogsPage = () => {
	const {
		data: blogs,
		isLoading: blogsLoading,
		error: blogsError,
	} = useQuery({
		queryKey: ["blogs"],
		queryFn: fetchBlogs,
	});

	if (blogsLoading) return <div>Loading...</div>;
	if (blogsError) return <div>Error fetching data</div>;

	// Calculate stats for the cards
	const totalBlogs = blogs.length;
	const publishedBlogs = blogs.filter(blog => blog.IsPublished).length;
	const draftBlogs = totalBlogs - publishedBlogs;
	
	// Calculate the number of blogs published in the last 30 days
	const recentBlogs = blogs.filter(blog => {
		const publishDate = new Date(blog.PublishedDate);
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
		return publishDate >= thirtyDaysAgo && blog.IsPublished;
	}).length;

	return (
		<>
			<ToastContainer position="top-right" autoClose={3000} />

			<div className='flex-1 overflow-auto relative'>
				<Header title='Blogs' />

				<main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
					{/* STATS */}
					<motion.div
						className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 1 }}
					>
						<StatCard name='Total Blogs' icon={ScrollText} value={totalBlogs} color='#8B5CF6' />
						<StatCard name='Published' icon={FileCheck} value={publishedBlogs} color='#10B981' />
						<StatCard name='Drafts' icon={Clock} value={draftBlogs} color='#F59E0B' />
						<StatCard name='Last 30 Days' icon={Calendar} value={recentBlogs} color='#3B82F6' />
					</motion.div>
					<BlogsTable blogs={blogs} />
				</main>
			</div>
		</>
	);
};
export default BlogsPage;
