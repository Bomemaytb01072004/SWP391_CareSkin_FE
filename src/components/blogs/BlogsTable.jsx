import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Edit, Search, Trash2, PlusCircle, Eye } from "lucide-react";
import { toast } from "react-toastify";

import CreateBlogModal from "./CreateBlogModal";
import EditBlogModal from "./EditBlogModal";
import ViewBlogModal from "./ViewBlogModal";
import PaginationAdmin from '../Pagination/PaginationAdmin';

import { createBlog, updateBlog, deleteBlog } from "../../utils/api";

const BlogsTable = ({ blogs, refetchBlogs }) => {
  const [localBlogs, setLocalBlogs] = useState([]);
  const [displayedBlogs, setDisplayedBlogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 8;
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" });
  const [filteredBlogs, setFilteredBlogs] = useState([]);

  const [editBlogState, setEditBlog] = useState(null);
  const [viewBlogState, setViewBlog] = useState(null);

  const [newBlog, setNewBlog] = useState({
    Title: "",
    Content: "",
    PictureFile: null,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    setLocalBlogs(blogs);
  }, [blogs]);

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

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  useEffect(() => {
    if (!filteredBlogs) return;

    let sortableBlogs = [...filteredBlogs];

    if (sortConfig.key) {
      sortableBlogs.sort((a, b) => {
        if (sortConfig.key === "CreatedDate") {
          const dateA = new Date(a[sortConfig.key]);
          const dateB = new Date(b[sortConfig.key]);

          return sortConfig.direction === "ascending" ? dateA - dateB : dateB - dateA;
        } else if (sortConfig.key === "Title") {
          const valueA = a[sortConfig.key].toLowerCase();
          const valueB = b[sortConfig.key].toLowerCase();

          return sortConfig.direction === "ascending"
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        } else if (sortConfig.key === "Status") {
          // Ví dụ: active trước inactive khi ascending
          // Giả sử blog.IsActive là boolean, chuyển sang số: active => 1, inactive => 0.
          const statusA = a.IsActive ? 1 : 0;
          const statusB = b.IsActive ? 1 : 0;
          return sortConfig.direction === "ascending" ? statusB - statusA : statusA - statusB;
          // Lưu ý: Ta đảo ngược thứ tự nếu muốn active hiển thị trước.
        }

        return 0;
      });
    }

    const indexOfLastBlog = currentPage * blogsPerPage;
    const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
    const currentBlogs = sortableBlogs.slice(indexOfFirstBlog, indexOfLastBlog);

    setDisplayedBlogs(currentBlogs);
  }, [filteredBlogs, currentPage, blogsPerPage, sortConfig]);

  const handlePageChange = (page) => {
    if (page < 1 || page > Math.ceil(filteredBlogs.length / blogsPerPage)) return;
    setCurrentPage(page);
  };

  const handleDelete = async (id) => {
    const blogToDelete = localBlogs.find((blog) => blog.BlogId === id);
    console.log("Check blog object before delete:", blogToDelete); // Log đối tượng blog trước khi xóa

    if (window.confirm("Are you sure you want to delete this blog?")) {
      try {
        await deleteBlog(id);
        setLocalBlogs((prev) => prev.filter((blog) => blog.BlogId !== id));
        toast.success("Blog deleted successfully!");
        if (refetchBlogs) {
          refetchBlogs();
        }
      } catch (error) {
        console.error("Failed to delete blog:", error);
        console.log("Blog ID to delete:", id); // Log giá trị id để kiểm tra
        toast.error("Error deleting blog!");
      }
    }
  };

  const handleOpenEditModal = (blog) => {
    setEditBlog({ ...blog });
    setIsEditModalOpen(true);
  };

  const handleOpenViewModal = (blog) => {
    setViewBlog(blog);
    setIsViewModalOpen(true);
  };

  const handleEdit = async () => {
    if (!editBlogState) return;
    if (!editBlogState.Title || !editBlogState.Content) {
      toast.error("Please fill in all required fields: Title and Content");
      return;
    }

    try {
      const updated = await updateBlog(editBlogState.BlogId, editBlogState);

      setLocalBlogs((prev) =>
        prev.map((blog) => (blog.BlogId === updated.BlogId ? updated : blog))
      );

      setIsEditModalOpen(false);
      toast.success("Blog updated successfully!");

      if (refetchBlogs) {
        refetchBlogs();
      }

    } catch (error) {
      console.error("Failed to update blog:", error);
      toast.error("Error updating blog!");
    }
  };

  const handleAddBlog = async () => {
    if (!newBlog.Title || !newBlog.Content || !newBlog.PictureFile) {
      toast.error("Please fill in all required fields: Title, Content, and Image");
      return;
    }

    try {
      const createdBlog = await createBlog(newBlog);
      setLocalBlogs((prev) => [createdBlog, ...prev]);

      setNewBlog({
        Title: "",
        Content: "",
        PictureFile: null,
      });

      setIsModalOpen(false);
      toast.success("Blog created successfully!");

      if (refetchBlogs) {
        refetchBlogs();
      }

    } catch (error) {
      console.error("Failed to create blog:", error);
      toast.error("Error creating blog!");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search blogs..."
            className="w-full bg-gray-100 text-black pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

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

      <div className="overflow-hidden rounded-xl border border-gray-300">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("Title")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Title</span>
                    <span>{sortConfig.key === "Title" ? (sortConfig.direction === "ascending" ? "↑" : "↓") : ""}</span>
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("UploadDate")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Upload Date</span>
                    <span>
                      {sortConfig.key === "UploadDate"
                        ? sortConfig.direction === "ascending"
                          ? "↑"
                          : "↓"
                        : ""}
                    </span>
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-medium text-black uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("Status")}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>Status</span>
                    <span>
                      {sortConfig.key === "Status"
                        ? sortConfig.direction === "ascending"
                          ? "↑"
                          : "↓"
                        : ""}
                    </span>
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-300">
              {displayedBlogs.length > 0 ? (
                displayedBlogs.map((blog) => (
                  <tr key={blog.BlogId} className="hover:bg-gray-100 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{blog.Title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {blog.UploadDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex justify-center">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${blog.IsActive ? 'bg-green-200 text-green-800' : 'bg-red-900 text-red-100'
                            }`}
                        >
                          {blog.IsActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <button
                          className="text-blue-600 hover:text-blue-400"
                          onClick={() => handleOpenViewModal(blog)}
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          className="text-yellow-600 hover:text-yellow-400"
                          onClick={() => handleOpenEditModal(blog)}
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-400"
                          onClick={() => handleDelete(blog.BlogId)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                    {searchTerm ? "No blogs found matching your search." : "No blogs available."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {filteredBlogs.length > blogsPerPage && (
          <div className="mb-20 p-4 flex justify-center">
            <PaginationAdmin
              currentPage={currentPage}
              totalPages={Math.ceil(filteredBlogs.length / blogsPerPage)}
              onPageChange={handlePageChange}
              theme="blue"
              maxVisiblePages={5}
            />
          </div>
        )}
      

      {isModalOpen && (
        <CreateBlogModal
          newBlog={newBlog}
          setNewBlog={setNewBlog}
          handleAddBlog={handleAddBlog}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {isEditModalOpen && (
        <EditBlogModal
          editBlogState={editBlogState}
          setEditBlog={setEditBlog}
          handleEdit={handleEdit}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}

      {isViewModalOpen && (
        <ViewBlogModal blog={viewBlogState} onClose={() => setIsViewModalOpen(false)} />
      )}
    </div>
  );
};

export default BlogsTable;
