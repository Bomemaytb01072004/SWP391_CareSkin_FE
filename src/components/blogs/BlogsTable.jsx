import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Search, Trash2, PlusCircle, Eye } from 'lucide-react';
import { toast } from 'react-toastify';

import CreateBlogModal from './CreateBlogModal';
import EditBlogModal from './EditBlogModal';
import ViewBlogModal from './ViewBlogModal';

import {
  createBlog,
  updateBlog,
  deleteBlog,
  fetchBlogs
} from '../../utils/api';

const BlogsTable = ({ blogs }) => {
  // -----------------------------------
  // 1) State
  // -----------------------------------
  const [localBlogs, setLocalBlogs] = useState([]);
  const [displayedBlogs, setDisplayedBlogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [blogsPerPage] = useState(8);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [filteredBlogs, setFilteredBlogs] = useState([]);

  // Edit Blog
  const [editBlogState, setEditBlog] = useState(null);
  const [viewBlogState, setViewBlog] = useState(null);

  // Create Blog
  const [newBlog, setNewBlog] = useState({
    Title: '',
    Content: '',
    PictureFile: null
  });

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);      // create blog
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // edit blog
  const [isViewModalOpen, setIsViewModalOpen] = useState(false); // view blog

  // -----------------------------------
  // 2) Effects
  // -----------------------------------
  // Map blogs to localBlogs
  useEffect(() => {
    setLocalBlogs(blogs);
  }, [blogs]);

  // Handle search
  useEffect(() => {
    if (!localBlogs) return;

    const term = searchTerm.toLowerCase();
    let filtered = [...localBlogs];
    
    if (term) {
      filtered = localBlogs.filter(
        (blog) =>
          blog.Title.toLowerCase().includes(term) ||
          (blog.Content && blog.Content.toLowerCase().includes(term))
      );
    }
    
    setFilteredBlogs(filtered);
    setCurrentPage(1);
  }, [searchTerm, localBlogs]);

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  useEffect(() => {
    if (!filteredBlogs) return;
    
    let sortableBlogs = [...filteredBlogs];
    
    if (sortConfig.key) {
      sortableBlogs.sort((a, b) => {
        if (sortConfig.key === 'CreatedDate') {
          const dateA = new Date(a[sortConfig.key]);
          const dateB = new Date(b[sortConfig.key]);
          
          if (sortConfig.direction === 'ascending') {
            return dateA - dateB;
          } else {
            return dateB - dateA;
          }
        } else if (sortConfig.key === 'Title') {
          const valueA = a[sortConfig.key].toLowerCase();
          const valueB = b[sortConfig.key].toLowerCase();
          
          if (sortConfig.direction === 'ascending') {
            return valueA.localeCompare(valueB);
          } else {
            return valueB.localeCompare(valueA);
          }
        }
        
        return 0;
      });
    }
    
    // Calculate pagination
    const indexOfLastBlog = currentPage * blogsPerPage;
    const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
    const currentBlogs = sortableBlogs.slice(
      indexOfFirstBlog,
      indexOfLastBlog
    );
    
    setDisplayedBlogs(currentBlogs);
  }, [filteredBlogs, currentPage, blogsPerPage, sortConfig]);

  // Get sort direction icon
  const getSortDirectionIcon = (key) => {
    if (sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'ascending' ? '↑' : '↓';
  };

  // -----------------------------------
  // 3) Handlers
  // -----------------------------------
  const handlePageChange = (page) => {
    if (page < 1 || page > Math.ceil(filteredBlogs.length / blogsPerPage)) return;
    setCurrentPage(page);
  };

  // Delete blog
  const handleDelete = async (blogId) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await deleteBlog(blogId);
        setLocalBlogs((prev) => prev.filter((b) => b.Id !== blogId));
        toast.success('Blog deleted successfully!');
      } catch (error) {
        console.error('Failed to delete blog:', error);
        toast.error('Error deleting blog!');
      }
    }
  };

  // Open Edit modal
  const handleOpenEditModal = (blog) => {
    setEditBlog({
      ...blog
    });
    setIsEditModalOpen(true);
  };

  // Open View modal
  const handleOpenViewModal = (blog) => {
    setViewBlog(blog);
    setIsViewModalOpen(true);
  };

  // Submit Edit
  const handleEdit = async () => {
    if (!editBlogState) return;
    if (
      !editBlogState.Title ||
      !editBlogState.Content
    ) {
      toast.error(
        'Please fill in all required fields: Title and Content'
      );
      return;
    }

    try {
      const updated = await updateBlog(editBlogState.Id, editBlogState);

      // Update localBlogs
      setLocalBlogs((prev) =>
        prev.map((blog) => (blog.Id === updated.Id ? updated : blog))
      );

      setIsEditModalOpen(false);
      toast.success('Blog updated successfully!');
    } catch (error) {
      console.error('Failed to update blog:', error);
      toast.error('Error updating blog!');
    }
  };

  // Add a new blog
  const handleAddBlog = async () => {
    if (!newBlog.Title || !newBlog.Content || !newBlog.PictureFile) {
      toast.error('Please fill in all required fields: Title, Content, and Image');
      return;
    }

    try {
      const createdBlog = await createBlog(newBlog);
      setLocalBlogs((prev) => [...prev, createdBlog]);
      
      // Reset form
      setNewBlog({
        Title: '',
        Content: '',
        PictureFile: null
      });
      
      setIsModalOpen(false);
      toast.success('Blog created successfully!');
    } catch (error) {
      console.error('Failed to create blog:', error);
      toast.error('Error creating blog!');
    }
  };

  // -----------------------------------
  // 4) Render Table
  // -----------------------------------
  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search blogs..."
            className="w-full bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Add Blog Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          onClick={() => setIsModalOpen(true)}
        >
          <PlusCircle size={18} />
          <span>Add New Blog</span>
        </motion.button>
      </div>

      {/* Blogs Table */}
      <div className="overflow-hidden rounded-xl border border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('Title')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Title</span>
                    <span>{getSortDirectionIcon('Title')}</span>
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('CreatedDate')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Created Date</span>
                    <span>{getSortDirectionIcon('CreatedDate')}</span>
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-900 divide-y divide-gray-800">
              {displayedBlogs.length > 0 ? (
                displayedBlogs.map((blog) => (
                  <tr key={blog.Id} className="hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {blog.Title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(blog.CreatedDate || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <button
                          className="text-blue-400 hover:text-blue-300"
                          onClick={() => handleOpenViewModal(blog)}
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          className="text-yellow-400 hover:text-yellow-300"
                          onClick={() => handleOpenEditModal(blog)}
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className="text-red-400 hover:text-red-300"
                          onClick={() => handleDelete(blog.Id)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-400">
                    {searchTerm ? 'No blogs found matching your search.' : 'No blogs available.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {filteredBlogs.length > blogsPerPage && (
        <div className="flex justify-center mt-4">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              className="px-3 py-1 rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
              disabled={currentPage === 1}
            >
              Previous
            </button>
            {Array.from(
              { length: Math.ceil(filteredBlogs.length / blogsPerPage) },
              (_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === i + 1
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {i + 1}
                </button>
              )
            )}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              className="px-3 py-1 rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
              disabled={
                currentPage === Math.ceil(filteredBlogs.length / blogsPerPage)
              }
            >
              Next
            </button>
          </nav>
        </div>
      )}

      {/* Create Blog Modal */}
      {isModalOpen && (
        <CreateBlogModal
          newBlog={newBlog}
          setNewBlog={setNewBlog}
          handleAddBlog={handleAddBlog}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {/* Edit Blog Modal */}
      {isEditModalOpen && (
        <EditBlogModal
          editBlogState={editBlogState}
          setEditBlog={setEditBlog}
          handleEdit={handleEdit}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}

      {/* View Blog Modal */}
      {isViewModalOpen && (
        <ViewBlogModal
          blog={viewBlogState}
          onClose={() => setIsViewModalOpen(false)}
        />
      )}
    </div>
  );
};

export default BlogsTable;
