import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit, Search, Trash2, PlusCircle, Eye, Power } from 'lucide-react';
import { toast } from 'react-toastify';

import CreateQuizModal from './CreateQuizModal';
import ViewQuizModal from './ViewQuizModal';

import {
  createQuiz,
  updateQuiz,
  deleteQuiz,
} from '../../utils/apiQ_A';

const QuizzesTable = ({ quizzes, refetchQuizzes }) => {
  // -----------------------------------
  // 1) State
  // -----------------------------------
  const [localQuizzes, setLocalQuizzes] = useState([]);
  const [displayedQuizzes, setDisplayedQuizzes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [quizzesPerPage] = useState(8);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);

  // Edit Quiz
  const [editQuizState, setEditQuiz] = useState(null);
  const [viewQuizState, setViewQuiz] = useState(null);

  // Create Quiz
  const [newQuiz, setNewQuiz] = useState({
    Title: '',
    Description: '',
    IsActive: true,
    Questions: []
  });

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);      // create quiz
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // edit quiz
  const [isViewModalOpen, setIsViewModalOpen] = useState(false); // view quiz

  // -----------------------------------
  // 2) Effects
  // -----------------------------------
  // Map quizzes to localQuizzes
  useEffect(() => {
    if (quizzes) {
      setLocalQuizzes(quizzes);
    }
  }, [quizzes]);

  // Handle search
  useEffect(() => {
    if (!localQuizzes) return;

    const term = searchTerm.toLowerCase();
    let filtered = [...localQuizzes];

    if (term) {
      filtered = localQuizzes.filter(
        (quiz) =>
          quiz.Title.toLowerCase().includes(term) ||
          (quiz.Description && quiz.Description.toLowerCase().includes(term))
      );
    }

    setFilteredQuizzes(filtered);
    setCurrentPage(1);
  }, [searchTerm, localQuizzes]);

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  useEffect(() => {
    if (!filteredQuizzes || filteredQuizzes.length === 0) return;

    let sortableQuizzes = [...filteredQuizzes];

    if (sortConfig.key) {
      sortableQuizzes.sort((a, b) => {
        if (sortConfig.key === 'Title') {
          const valueA = (a[sortConfig.key] || '').toLowerCase();
          const valueB = (b[sortConfig.key] || '').toLowerCase();

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
    const indexOfLastQuiz = currentPage * quizzesPerPage;
    const indexOfFirstQuiz = indexOfLastQuiz - quizzesPerPage;
    const currentQuizzes = sortableQuizzes.slice(
      indexOfFirstQuiz,
      indexOfLastQuiz
    );

    setDisplayedQuizzes(currentQuizzes);
  }, [filteredQuizzes, currentPage, quizzesPerPage, sortConfig]);

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
    if (page < 1 || page > Math.ceil(filteredQuizzes.length / quizzesPerPage)) return;
    setCurrentPage(page);
  };

  // Toggle quiz active status
  const handleToggleActive = async (quiz) => {
    try {
      const updatedQuiz = { ...quiz, IsActive: !quiz.IsActive };
      await updateQuiz(quiz.QuizId, updatedQuiz);

      // Refetch quizzes from the server
      refetchQuizzes();

      toast.success(`Quiz ${updatedQuiz.IsActive ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      console.error('Failed to toggle quiz status:', error);
      toast.error('Error updating quiz status!');
    }
  };

  // Delete quiz
  const handleDelete = async (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await deleteQuiz(quizId);

        // Refetch quizzes from the server instead of updating local state
        refetchQuizzes();

        toast.success('Quiz deleted successfully!');
      } catch (error) {
        console.error('Failed to delete quiz:', error);
        toast.error('Error deleting quiz!');
      }
    }
  };

  // Open Edit modal
  const handleOpenEditModal = (quiz) => {
    setEditQuiz({ ...quiz });
    setIsEditModalOpen(true);
  };

  // Open View modal
  const handleOpenViewModal = (quiz) => {
    setViewQuiz(quiz.QuizId);
    setIsViewModalOpen(true);
  };

  // Submit Edit
  const handleEdit = async () => {
    if (!editQuizState) return;
    if (
      !editQuizState.Title ||
      !editQuizState.Description
    ) {
      toast.error(
        'Please fill in all required fields: Title and Description'
      );
      return;
    }

    try {
      const updated = await updateQuiz(editQuizState.QuizId, {
        Title: editQuizState.Title,
        Description: editQuizState.Description,
        IsActive: editQuizState.IsActive
      });

      // Update localQuizzes
      setLocalQuizzes((prev) =>
        prev.map((quiz) => (quiz.QuizId === updated.QuizId ? updated : quiz))
      );

      setIsEditModalOpen(false);
      toast.success('Quiz updated successfully!');
      refetchQuizzes();
    } catch (error) {
      console.error('Failed to update quiz:', error);
      toast.error('Error updating quiz!');
    }
  };

  // Add a new quiz
  const handleAddQuiz = async () => {
    if (!newQuiz.Title || !newQuiz.Description || !newQuiz.Questions || newQuiz.Questions.length === 0) {
      toast.error('Please fill in all required fields and add at least one question');
      return;
    }

    try {
      const createdQuiz = await createQuiz(newQuiz);
      setLocalQuizzes((prev) => [...prev, createdQuiz]);

      // Reset form
      setNewQuiz({
        Title: '',
        Description: '',
        IsActive: true,
        Questions: []
      });

      setIsModalOpen(false);
      toast.success('Quiz created successfully!');

      // Refresh the quizzes data
      if (refetchQuizzes) {
        refetchQuizzes();
      }
    } catch (error) {
      console.error('Failed to create quiz:', error);
      toast.error('Error creating quiz!');
    }
  };

  // -----------------------------------
  // 4) Render Table
  // -----------------------------------
  return (
    <div className="space-y-6 bg-white text-black p-4">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search quizzes..."
            className="w-full bg-white text-black pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Add Quiz Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-2 bg-white text-black border border-gray-300 hover:bg-gray-200 px-4 py-2 rounded-lg"
          onClick={() => setIsModalOpen(true)}
        >
          <PlusCircle size={18} />
          <span>Add New Quiz</span>
        </motion.button>
      </div>

      {/* Quizzes Table */}
      <div className="overflow-hidden rounded-xl border border-gray-300">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-white">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('Title')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Title</span>
                    <span>{getSortDirectionIcon('Title')}</span>
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Questions
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-black uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-black uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-300">
              {displayedQuizzes && displayedQuizzes.length > 0 ? (
                displayedQuizzes.map((quiz) => (
                  <tr key={quiz.Id} className="hover:bg-gray-100 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {quiz.Title}
                    </td>
                    <td className="px-6 py-4 text-sm text-black">
                      {quiz.Description ?
                        (quiz.Description.length > 50 ?
                          `${quiz.Description.substring(0, 50)}...` :
                          quiz.Description) :
                        'No description'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black text-center">
                      {quiz.Questions ? quiz.Questions.length : 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex justify-center">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${quiz.IsActive ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
                            }`}
                        >
                          {quiz.IsActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => handleOpenViewModal(quiz)}
                          title="View quiz"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800"
                          onClick={() => handleDelete(quiz.QuizId)}
                          title="Delete quiz"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-black">
                    {searchTerm ? 'No quizzes found matching your search.' : 'No quizzes available.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {filteredQuizzes && filteredQuizzes.length > quizzesPerPage && (
        <div className="flex justify-center mt-4">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              className="px-3 py-1 rounded-md bg-white text-black border border-gray-300 hover:bg-gray-200 disabled:opacity-50"
              disabled={currentPage === 1}
            >
              Previous
            </button>
            {Array.from(
              { length: Math.ceil(filteredQuizzes.length / quizzesPerPage) },
              (_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-3 py-1 rounded-md border border-gray-300 ${currentPage === i + 1
                    ? 'bg-blue-200 text-blue-800'
                    : 'bg-white text-black hover:bg-gray-200'
                    }`}
                >
                  {i + 1}
                </button>
              )
            )}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              className="px-3 py-1 rounded-md bg-white text-black border border-gray-300 hover:bg-gray-200 disabled:opacity-50"
              disabled={
                currentPage === Math.ceil(filteredQuizzes.length / quizzesPerPage)
              }
            >
              Next
            </button>
          </nav>
        </div>
      )}

      {/* Create Quiz Modal */}
      {isModalOpen && (
        <CreateQuizModal
          newQuiz={newQuiz}
          setNewQuiz={setNewQuiz}
          handleAddQuiz={handleAddQuiz}
          onClose={() => setIsModalOpen(false)}
        />
      )}


      {/* View Quiz Modal */}
      {isViewModalOpen && (
        <ViewQuizModal
          quizId={viewQuizState}
          onClose={() => setIsViewModalOpen(false)}
          refetchQuizzes={refetchQuizzes}
        />
      )}
    </div>
  );
};

export default QuizzesTable;
