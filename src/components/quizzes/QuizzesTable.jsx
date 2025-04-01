import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit, Search, Trash2, PlusCircle, Eye, } from 'lucide-react';
import { toast } from 'react-toastify';

import CreateQuizModal from './CreateQuizModal';
import ViewQuizModal from './ViewQuizModal';
import PaginationAdmin from '../Pagination/PaginationAdmin';

import {
  createQuiz,
  updateQuiz,
  deleteQuiz,
  fetchQuizById,
} from '../../utils/apiQ_A';

const QuizzesTable = ({ quizzes, refetchQuizzes, quizById, refetchQuizById }) => {

  const [localQuizzes, setLocalQuizzes] = useState([]);
  const [displayedQuizzes, setDisplayedQuizzes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [quizzesPerPage] = useState(8);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [quizDetails, setQuizDetails] = useState({});

  const [viewQuizState, setViewQuiz] = useState(null);

  const [newQuiz, setNewQuiz] = useState({
    Title: '',
    Description: '',
    IsActive: true,
    Questions: []
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    if (quizzes) {
      // Sắp xếp quizzes với ID lớn nhất (mới nhất) lên đầu
      const sortedQuizzes = [...quizzes].sort((a, b) => b.QuizId - a.QuizId);
      setLocalQuizzes(sortedQuizzes);
    }
  }, [quizzes]);


  useEffect(() => {
    const fetchAllQuizDetails = async () => {
      if (!displayedQuizzes || !quizById) return;

      try {
        // Sử dụng fetchQuizById từ apiQ_A.js thay vì quizById từ props
        const results = await Promise.all(
          displayedQuizzes.map((quiz) => fetchQuizById(quiz.QuizId))
        );

        const details = {};
        displayedQuizzes.forEach((quiz, index) => {
          const quizDetail = results[index];
          details[quiz.QuizId] = {
            questionCount: quizDetail.Questions?.length || 0,
          };
        });

        setQuizDetails(details);
      } catch (error) {
        console.error('Error fetching quiz details:', error);
      }
    };

    fetchAllQuizDetails();
  }, [displayedQuizzes, quizById]);

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

    // Luôn sắp xếp filtered theo QuizId giảm dần
    filtered.sort((a, b) => b.QuizId - a.QuizId);
    
    setFilteredQuizzes(filtered);
    setCurrentPage(1);
  }, [searchTerm, localQuizzes]);

  useEffect(() => {
    if (!filteredQuizzes || filteredQuizzes.length === 0) return;

    const indexOfLastQuiz = currentPage * quizzesPerPage;
    const indexOfFirstQuiz = indexOfLastQuiz - quizzesPerPage;
    const currentQuizzes = filteredQuizzes.slice(
      indexOfFirstQuiz,
      indexOfLastQuiz
    );

    setDisplayedQuizzes(currentQuizzes);
  }, [filteredQuizzes, currentPage, quizzesPerPage]);

  useEffect(() => {
    // Hàm xử lý sự kiện khi câu hỏi thay đổi
    const handleQuizQuestionsChanged = async (e) => {
      const { quizId, newQuestionCount } = e.detail;
      
      // Cập nhật trực tiếp quizDetails
      setQuizDetails(prev => ({
        ...prev,
        [quizId]: {
          ...prev[quizId],
          questionCount: newQuestionCount
        }
      }));
      
      // Tùy chọn: Fetch lại chi tiết quiz từ API
      try {
        const updatedQuiz = await fetchQuizById(quizId);
        setQuizDetails(prev => ({
          ...prev,
          [quizId]: {
            ...prev[quizId],
            questionCount: updatedQuiz.Questions?.length || 0
          }
        }));
      } catch (error) {
        console.error('Error fetching updated quiz:', error);
      }
    };
    
    // Đăng ký lắng nghe sự kiện
    window.addEventListener('quizQuestionsChanged', handleQuizQuestionsChanged);
    
    // Hủy đăng ký khi component unmount
    return () => {
      window.removeEventListener('quizQuestionsChanged', handleQuizQuestionsChanged);
    };
  }, []);

  const handlePageChange = (page) => {
    if (page < 1 || page > Math.ceil(filteredQuizzes.length / quizzesPerPage)) return;
    setCurrentPage(page);
  };

  const handleDelete = async (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await deleteQuiz(quizId);
        refetchQuizzes();
        toast.success('Quiz deleted successfully!');
      } catch (error) {
        console.error('Failed to delete quiz:', error);
        toast.error('Error deleting quiz!');
      }
    }
  };

  const handleOpenViewModal = (quiz) => {
    setViewQuiz(quiz.QuizId);
    setIsViewModalOpen(true);
  };

  const handleAddQuiz = async () => {
    // Validate Title và Description
    const errors = [];
    
    if (!newQuiz.Title) {
      errors.push("Title is required");
    } else if (!newQuiz.Title.startsWith("Quiz")) {
      errors.push("Title must start with 'Quiz'");
    }
    
    if (!newQuiz.Description) {
      errors.push("Description is required");
    } else if (newQuiz.Description.length < 20) {
      errors.push("Description must be at least 20 characters long");
    }
    
    if (errors.length > 0) {
      toast.error(errors.join('\n'));
      return;
    }
    
    try {
      const createdQuiz = await createQuiz(newQuiz);
      
      setSearchTerm('');
      
      // Thêm quiz mới vào đầu danh sách
      setLocalQuizzes((prev) => [createdQuiz, ...prev]);
      
      // Cập nhật filtered quizzes để hiển thị quiz mới
      setFilteredQuizzes((prev) => [createdQuiz, ...prev]);
      
      // Đặt về trang đầu tiên để thấy quiz mới
      setCurrentPage(1);
      
      // Reset form
      setNewQuiz({
        Title: '',
        Description: '',
        IsActive: true,
        Questions: []
      });

      setIsModalOpen(false);
      toast.success('Quiz created successfully!');

      // Refetch dữ liệu từ server để đồng bộ
      if (refetchQuizzes) {
        refetchQuizzes();
      }

    } catch (error) {
      console.error('Failed to create quiz:', error);
      toast.error('Error creating quiz!');
    }
  };

  return (
    <div className="space-y-6 bg-white text-black p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
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

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          onClick={() => setIsModalOpen(true)}
        >
          <PlusCircle size={18} />
          <span>Add New Quiz</span>
        </motion.button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-300">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-white">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-black uppercase tracking-wider">
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
                  <tr key={quiz.QuizId} className="hover:bg-gray-100 transition-colors">
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
                      {quizDetails[quiz.QuizId]?.questionCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex justify-center">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${quiz.IsActive ? 'bg-green-200 text-green-800' : 'bg-red-900 text-red-100'
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
                          title="Edit & View quiz"
                        >
                          <Edit size={18} />
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

      {filteredQuizzes && filteredQuizzes.length > quizzesPerPage && (
        <div className="p-4 flex justify-center">
          <PaginationAdmin
            currentPage={currentPage}
            totalPages={Math.ceil(filteredQuizzes.length / quizzesPerPage)}
            onPageChange={handlePageChange}
            theme="blue"
            maxVisiblePages={5}
          />
        </div>
      )}

      {isModalOpen && (
        <CreateQuizModal
          newQuiz={newQuiz}
          setNewQuiz={setNewQuiz}
          handleAddQuiz={handleAddQuiz}
          onClose={() => setIsModalOpen(false)}
        />
      )}

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