import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, AlertCircle, Edit2, Trash2, Save, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  createQuestion,
  updateQuestion,
  deleteQuestion,
  deleteAnswer,
  getAnswersByQuestionId,
  createAnswer,
  updateAnswer,
  updateQuiz,
  fetchQuizById,
} from '../../utils/apiQ_A';

const ViewQuizModal = ({ quizId, onClose, refetchQuizzes }) => {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editQuizDetails, setEditQuizDetails] = useState(false);

  // Thêm state errors cho validation
  const [errors, setErrors] = useState({
    Title: '',
    Description: ''
  });

  // Edit states
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [currentQuestionText, setCurrentQuestionText] = useState('');
  const [editingAnswers, setEditingAnswers] = useState([]);

  // New question state
  const [addingNewQuestion, setAddingNewQuestion] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newAnswers, setNewAnswers] = useState([
    { AnswersText: '', Score: 1 },
    { AnswersText: '', Score: 2 },
    { AnswersText: '', Score: 3 },
    { AnswersText: '', Score: 4 }
  ]);

  // Quiz details edit state
  const [editedQuizDetails, setEditedQuizDetails] = useState({
    Title: '',
    Description: '',
    IsActive: false
  });
  
  // Thêm state kiểm tra form hợp lệ
  const [isFormValid, setIsFormValid] = useState(false);
  
  // Hàm validate từng trường
  const validateField = (name, value) => {
    let newErrors = { ...errors };
    
    switch (name) {
      case 'Title':
        if (!value) {
          newErrors.Title = 'Title is required';
        } else if (!value.startsWith('Quiz')) {
          newErrors.Title = 'Title must start with "Quiz"';
        } else {
          newErrors.Title = '';
        }
        break;
      
      case 'Description':
        if (!value) {
          newErrors.Description = 'Description is required';
        } else if (value.length < 20) {
          newErrors.Description = 'Description must be at least 20 characters';
        } else {
          newErrors.Description = '';
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
    return newErrors;
  };
  
  // Validate toàn bộ form
  const validateForm = () => {
    const titleErrors = validateField('Title', editedQuizDetails.Title);
    const descErrors = validateField('Description', editedQuizDetails.Description);
    
    const newErrors = {
      ...titleErrors,
      ...descErrors
    };
    
    setErrors(newErrors);
    return !newErrors.Title && !newErrors.Description;
  };
  
  // Kiểm tra form validity khi fields thay đổi
  useEffect(() => {
    if (editQuizDetails) {
      const formValid = 
        editedQuizDetails.Title && 
        editedQuizDetails.Title.startsWith('Quiz') &&
        editedQuizDetails.Description &&
        editedQuizDetails.Description.length >= 20;
      
      setIsFormValid(formValid);
    }
  }, [editedQuizDetails, editQuizDetails]);

  // Cập nhật hàm handleQuizDetailsChange để validate ngay khi nhập
  const handleQuizDetailsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditedQuizDetails(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    validateField(name, type === 'checkbox' ? checked : value);
  };

  // Cập nhật hàm handleSaveQuizDetails để đảm bảo dữ liệu được cập nhật
  const handleSaveQuizDetails = async () => {
    if (!validateForm()) {
      toast.error('Please correct the errors before saving');
      return;
    }
    
    try {
      setLoading(true);

      // Gọi API cập nhật quiz
      const updatedQuizData = await updateQuiz(quizId, editedQuizDetails);

      // Cập nhật state nội bộ
      setEditQuizDetails(false);
      setQuiz({...quiz, ...editedQuizDetails}); // Cập nhật state quiz ngay lập tức

      // Fetch lại dữ liệu chi tiết quiz
      await fetchQuiz();

      // Đảm bảo refetchQuizzes được gọi và hoàn thành trước khi tiếp tục
      if (refetchQuizzes) {
        await refetchQuizzes(); // Thêm await để đảm bảo refetch hoàn thành
      }

      toast.success('Quiz updated successfully');
    } catch (error) {
      console.error('Error updating quiz:', error);
      toast.error('Failed to update quiz');
    } finally {
      setLoading(false);
    }
  };

  // Fetch quiz data when quizId changes
  useEffect(() => {
    if (!quizId) return;
    fetchQuiz();
  }, [quizId]);

  // Updated fetch quiz function
  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const data = await fetchQuizById(quizId);
      setQuiz(data);
      setEditedQuizDetails({
        Title: data.Title,
        Description: data.Description,
        IsActive: data.IsActive
      });
    } catch (error) {
      console.error('Error fetching quiz by ID:', error);
      toast.error('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleEditQuestion = async (questionId) => {
    try {
      setLoading(true);
      setEditingQuestionId(questionId);

      const questionToEdit = quiz.Questions.find(q => q.QuestionsId === questionId);

      if (questionToEdit) {
        setCurrentQuestionText(questionToEdit.QuestionText);

        if (questionToEdit.Answers && questionToEdit.Answers.length > 0) {
          const formattedAnswers = questionToEdit.Answers.map(answer => ({
            AnswerId: answer.AnswerId,
            AnswersText: answer.AnswersText,
            Score: answer.Score
          }));

          while (formattedAnswers.length < 4) {
            formattedAnswers.push({ AnswersText: '', Score: formattedAnswers.length + 1 });
          }

          formattedAnswers.sort((a, b) => a.Score - b.Score);

          setEditingAnswers(formattedAnswers);
        } else {
          try {
            const answersData = await getAnswersByQuestionId(questionId);

            if (answersData && answersData.length > 0) {
              const formattedAnswers = answersData.map(answer => ({
                AnswerId: answer.AnswerId,
                AnswersText: answer.AnswersText,
                Score: answer.Score
              }));

              while (formattedAnswers.length < 4) {
                formattedAnswers.push({ AnswersText: '', Score: formattedAnswers.length + 1 });
              }

              formattedAnswers.sort((a, b) => a.Score - b.Score);

              setEditingAnswers(formattedAnswers);
            } else {
              // Reset to default 4 empty answers
              setEditingAnswers([
                { AnswersText: '', Score: 1 },
                { AnswersText: '', Score: 2 },
                { AnswersText: '', Score: 3 },
                { AnswersText: '', Score: 4 }
              ]);
            }
          } catch (error) {
            console.error('Error fetching answers:', error);
            setEditingAnswers([
              { AnswersText: '', Score: 1 },
              { AnswersText: '', Score: 2 },
              { AnswersText: '', Score: 3 },
              { AnswersText: '', Score: 4 }
            ]);
          }
        }
      }
    } catch (error) {
      console.error('Error starting edit:', error);
      toast.error('Failed to load question details');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuestion = async (questionId) => {
    try {
      setLoading(true);

      if (!currentQuestionText.trim()) {
        toast.error('Please enter a question text');
        return;
      }

      const validAnswers = editingAnswers.filter(ans => ans.AnswersText.trim());
      if (validAnswers.length < 1) {
        toast.error('Please provide at least one answer');
        return;
      }

      if (!questionId) {
        console.error('Question ID is undefined', { questionId });
        toast.error('Cannot update question: Missing question ID');
        return;
      }

      try {
        console.log('Updating question text:', questionId, currentQuestionText);
        const questionData = { QuestionText: currentQuestionText };
        await updateQuestion(questionId, questionData);
        console.log('Question text updated successfully');
      } catch (error) {
        console.error('Error updating question text:', error);
        toast.error('Failed to update question text');
        throw error;
      }

      let existingAnswers = [];
      try {
        existingAnswers = await getAnswersByQuestionId(questionId);
        console.log('Existing answers:', existingAnswers);
      } catch (error) {
        console.error('Error fetching existing answers:', error);
      }

      const answerPromises = [];
      const processedAnswerIds = new Set();

      for (const answer of editingAnswers) {
        if (answer.AnswersText.trim()) {
          const answerPromise = (async () => {
            try {
              if (answer.AnswerId) {
                console.log('Updating answer:', answer.AnswerId, answer);
                const answerData = {
                  AnswersText: answer.AnswersText,
                  Score: answer.Score
                };
                await updateAnswer(answer.AnswerId, answerData);
                processedAnswerIds.add(answer.AnswerId);
                console.log('Answer updated successfully:', answer.AnswerId);
              } else {
                console.log('Creating new answer for question:', questionId, answer);
                const answerData = {
                  AnswersText: answer.AnswersText,
                  Score: answer.Score
                };
                await createAnswer(questionId, answerData);
                console.log('New answer created successfully');
              }
            } catch (error) {
              console.error('Error saving answer:', answer, error);
              toast.error(`Failed to save answer: ${answer.AnswersText}`);
              throw error;
            }
          })();

          answerPromises.push(answerPromise);
        }
      }

      await Promise.all(answerPromises);
      console.log('All answers updated successfully');

      setEditingQuestionId(null);
      setCurrentQuestionText('');
      setEditingAnswers([]);

      await fetchQuiz();

      // Emit custom event to notify QuizzesTable
      window.dispatchEvent(new CustomEvent('quizQuestionsChanged', { 
        detail: {
          quizId: quizId,
          newQuestionCount: quiz.Questions ? quiz.Questions.length : 0
        }
      }));

      // Call refetchQuizzes if provided
      if (refetchQuizzes) {
        await refetchQuizzes();
      }

      toast.success('Question and answers updated successfully');
    } catch (error) {
      console.error('Error saving question:', error);
      toast.error('Failed to save question or answers');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnswer = async (answerId, questionId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this answer?");
    if (!confirmDelete) return;

    try {
      // Gọi API để xóa câu trả lời
      await deleteAnswer(answerId);

      // Thông báo thành công
      toast.success("Answer deleted successfully!");

      // Refetch lại danh sách câu trả lời
      const updatedAnswers = await getAnswersByQuestionId(questionId);
      const formattedAnswers = updatedAnswers.map((answer) => ({
        AnswerId: answer.AnswerId,
        AnswersText: answer.AnswersText,
        Score: answer.Score,
      }));

      // Đảm bảo luôn có 4 câu trả lời (nếu thiếu thì thêm các câu trống)
      while (formattedAnswers.length < 4) {
        formattedAnswers.push({ AnswersText: '', Score: formattedAnswers.length + 1 });
      }

      // Cập nhật danh sách câu trả lời trong `editingAnswers`
      setEditingAnswers(formattedAnswers);

      // Cập nhật danh sách câu trả lời trong `quiz`
      setQuiz((prevQuiz) => {
        const updatedQuestions = prevQuiz.Questions.map((question) => {
          if (question.QuestionsId === questionId) {
            return { ...question, Answers: formattedAnswers };
          }
          return question;
        });
        return { ...prevQuiz, Questions: updatedQuestions };
      });
    } catch (error) {
      console.error("Failed to delete answer:", error);
      toast.error("Failed to delete answer");
    }
  };

  // Delete a question
  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }
  
    try {
      setLoading(true);
  
      const response = await deleteQuestion(questionId);
  
      if (response.ok) {
        setQuiz((prev) => ({
          ...prev,
          Questions: prev.Questions.filter((q) => q.QuestionsId !== questionId),
        }));
  
        // Emit custom event to notify QuizzesTable
        window.dispatchEvent(new CustomEvent('quizQuestionsChanged', { 
          detail: {
            quizId: quizId,
            newQuestionCount: quiz.Questions ? quiz.Questions.length - 1 : 0
          }
        }));

        // Call refetchQuizzes if provided
        if (refetchQuizzes) {
          await refetchQuizzes();
        }

        toast.success('Question deleted successfully');
      } else {
        toast.error('Failed to delete question');
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Failed to delete question');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async () => {
    try {
      setLoading(true);

      // Validate question
      if (!newQuestionText.trim()) {
        toast.error('Please enter a question text');
        return;
      }

      // Validate answers - at least one answer must be provided
      const validAnswers = newAnswers.filter(ans => ans.AnswersText.trim());
      if (validAnswers.length < 1) {
        toast.error('Please provide at least one answer');
        return;
      }

      // Create the question
      const newQuestion = await createQuestion(quizId, {
        QuestionText: newQuestionText
      });

      // Create each answer for the new question
      for (const answer of newAnswers) {
        if (answer.AnswersText.trim()) {
          await createAnswer(newQuestion.QuestionsId, {
            AnswersText: answer.AnswersText,
            Score: answer.Score
          });
        }
      }

      // Reset form
      setNewQuestionText('');
      setNewAnswers([
        { AnswersText: '', Score: 1 },
        { AnswersText: '', Score: 2 },
        { AnswersText: '', Score: 3 },
        { AnswersText: '', Score: 4 }
      ]);
      setAddingNewQuestion(false);

      // Refresh quiz data
      await fetchQuiz();

      // Emit custom event to notify QuizzesTable
      window.dispatchEvent(new CustomEvent('quizQuestionsChanged', { 
        detail: {
          quizId: quizId,
          newQuestionCount: quiz.Questions ? quiz.Questions.length + 1 : 1
        }
      }));

      // Call refetchQuizzes if provided
      if (refetchQuizzes) {
        await refetchQuizzes();
      }

      toast.success('Question added successfully');
    } catch (error) {
      console.error('Error adding question:', error);
      toast.error('Failed to add question');
    } finally {
      setLoading(false);
    }
  };

  // Handle answer text change for editing
  const handleAnswerTextChange = (index, value) => {
    setEditingAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[index] = { ...newAnswers[index], AnswersText: value };
      return newAnswers;
    });
  };

  // Handle answer score change for editing
  const handleAnswerScoreChange = (index, value) => {
    const score = parseInt(value);
    if (score >= 1 && score <= 4) {
      setEditingAnswers(prev => {
        const newAnswers = [...prev];
        newAnswers[index] = { ...newAnswers[index], Score: score };
        return newAnswers;
      });
    }
  };

  // Handle new answer text change
  const handleNewAnswerTextChange = (index, value) => {
    setNewAnswers(prev => {
      const newAnswersList = [...prev];
      newAnswersList[index] = { ...newAnswersList[index], AnswersText: value };
      return newAnswersList;
    });
  };

  // Handle new answer score change
  const handleNewAnswerScoreChange = (index, value) => {
    const score = parseInt(value);
    if (score >= 1 && score <= 4) {
      setNewAnswers(prev => {
        const newAnswersList = [...prev];
        newAnswersList[index] = { ...newAnswersList[index], Score: score };
        return newAnswersList;
      });
    }
  };

  // Handle removing an answer during editing
  const handleRemoveAnswer = (index) => {
    setEditingAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers.splice(index, 1);

      // Add a new empty answer if we have less than 4
      if (newAnswers.length < 4) {
        newAnswers.push({ AnswersText: '', Score: newAnswers.length + 1 });
      }

      return newAnswers;
    });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingQuestionId(null);
    setCurrentQuestionText('');
    setEditingAnswers([]);
    setAddingNewQuestion(false);
    setNewQuestionText('');
    setNewAnswers([
      { AnswersText: '', Score: 1 },
      { AnswersText: '', Score: 2 },
      { AnswersText: '', Score: 3 },
      { AnswersText: '', Score: 4 }
    ]);
    setEditQuizDetails(false);
  };

  // If no quizId or loading, show loading state
  if (!quizId || loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Loading quiz details...</p>
          </div>
        </div>
      </div>
    );
  }

  // If fetch complete but no quiz data, show error
  if (!quiz) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex flex-col items-center justify-center h-64">
            <div className="text-red-500">
              <X size={48} />
            </div>
            <p className="mt-4 text-gray-600">Failed to load quiz details</p>
          </div>
        </div>
      </div>
    );
  }

  // Render modal with quiz information
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          {/* Title on left */}
          <h2 className="text-xl font-semibold">View Quiz Details</h2>

          {/* Buttons on right */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setEditMode(!editMode)}
              className={`px-3 py-1 text-sm rounded ${editMode
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
            >
              {editMode ? "Exit Edit Mode" : "Enable Edit Mode"}
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Quiz Information */}
          {editQuizDetails ? (
            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-medium text-black mb-3">Edit Quiz Details</h3>

              {/* Title */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-black mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="Title"
                  value={editedQuizDetails.Title}
                  onChange={handleQuizDetailsChange}
                  className={`w-full bg-white text-black rounded-lg px-4 py-2 border ${errors.Title ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter quiz title (must start with 'Quiz')"
                />
                {errors.Title && (
                  <p className="text-red-500 text-sm mt-1">{errors.Title}</p>
                )}
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-black mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="Description"
                  value={editedQuizDetails.Description}
                  onChange={handleQuizDetailsChange}
                  rows={3}
                  className={`w-full bg-white text-black rounded-lg px-4 py-2 border ${errors.Description ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter quiz description (minimum 20 characters)"
                />
                {errors.Description && (
                  <p className="text-red-500 text-sm mt-1">{errors.Description}</p>
                )}
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">Min 20 characters</span>
                  <span className={`${editedQuizDetails.Description.length < 20 ? 'text-red-500' : 'text-green-500'}`}>
                    {editedQuizDetails.Description.length}/20
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveQuizDetails}
                  disabled={!isFormValid}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <h3 className="text-sm font-medium text-black">Title</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-medium text-black mt-1">{quiz.Title}</p>
                    {editMode && (
                      <button
                        onClick={() => setEditQuizDetails(true)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <h3 className="text-sm font-medium text-black">Status</h3>
                  <div className="flex items-center mt-1">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${quiz.IsActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                        }`}
                    >
                      {quiz.IsActive ? (
                        <>
                          <CheckCircle2 className="mr-1" size={12} />
                          Active
                        </>
                      ) : (
                        <>
                          <AlertCircle className="mr-1" size={12} />
                          Inactive
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Quiz ID */}
                <div>
                  <h3 className="text-sm font-medium text-black">Quiz ID: {quiz.QuizId} </h3>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-medium text-black">Description</h3>
                <div className="mt-1 p-3 bg-gray-100 rounded-lg text-black">
                  <p>{quiz.Description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Questions */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-md font-semibold text-black">
                Questions ({quiz.Questions ? quiz.Questions.length : 0})
              </h3>
              {editMode && !addingNewQuestion && (
                <button
                  onClick={() => setAddingNewQuestion(true)}
                  className="flex items-center space-x-1 text-green-600 hover:text-green-800"
                >
                  <Plus size={16} />
                  <span>Add Question</span>
                </button>
              )}
            </div>

            {/* Add New Question Form */}
            {addingNewQuestion && (
              <div className="bg-gray-100 p-4 rounded-lg mb-6">
                <h4 className="font-medium text-black mb-3">Add New Question</h4>

                {/* Question Text */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-black mb-1">
                    Question Text <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    className="w-full bg-white text-black rounded-lg px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter question text"
                  />
                </div>

                {/* Answers */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-black mb-2">
                    Answers (with scores 1-4)
                  </label>

                  <div className="space-y-3">
                    {newAnswers.map((answer, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={answer.AnswersText}
                          onChange={(e) => handleNewAnswerTextChange(index, e.target.value)}
                          className="flex-1 bg-white text-black rounded-lg px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={`Answer option ${index + 1}`}
                        />
                        <select
                          value={answer.Score}
                          onChange={(e) => handleNewAnswerScoreChange(index, e.target.value)}
                          className="bg-white text-black rounded-lg px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value={1}>Score: 1</option>
                          <option value={2}>Score: 2</option>
                          <option value={3}>Score: 3</option>
                          <option value={4}>Score: 4</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                  >
                    Add Question
                  </button>
                </div>
              </div>
            )}

            {/* Questions List */}
            {quiz.Questions && quiz.Questions.length > 0 ? (
              <div className="space-y-6">
                {quiz.Questions.map((question, qIndex) => (
                  <div key={question.QuestionsId} className="p-4 bg-gray-100 rounded-lg">
                    {/* Question Header with Edit/Delete buttons */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        {/* Question ID */}
                        <p className="text-sm font-mono text-gray-500">
                          Question ID: {question.QuestionsId}
                        </p>

                        {/* Question Text (editable or view-only) */}
                        {editingQuestionId === question.QuestionsId ? (
                          <textarea
                            value={currentQuestionText}
                            onChange={(e) => setCurrentQuestionText(e.target.value)}
                            className="w-full bg-white text-black rounded-lg px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                            rows={4}
                            style={{ minWidth: '500px' }}
                            placeholder="Enter question text"
                          />
                        ) : (
                          <h4 className="text-black font-medium">
                            {qIndex + 1}. {question.QuestionText}
                          </h4>
                        )}
                      </div>

                      {/* Edit/Delete buttons */}
                      {editMode && !editingQuestionId && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditQuestion(question.QuestionsId)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit question"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(question.QuestionsId)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete question"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}

                      {/* Save button when editing */}
                      {editingQuestionId === question.QuestionsId && (
                        <div className="flex space-x-2">
                          <button
                            onClick={handleCancelEdit}
                            className="text-gray-600 hover:text-gray-800"
                            title="Cancel"
                          >
                            <X size={18} />
                          </button>
                          <button
                            onClick={() => handleSaveQuestion(question.QuestionsId)}
                            className="text-green-600 hover:text-green-800"
                            title="Save changes"
                          >
                            <Save size={18} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Answers */}
                    <div className="ml-4 space-y-2">
                      {/* Editing answers */}
                      {editingQuestionId === question.QuestionsId ? (
                        <div className="space-y-3">
                          {editingAnswers.map((answer, aIndex) => (
                            <div key={answer.AnswerId ?? `temp-${aIndex}`} className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={answer.AnswersText}
                                onChange={(e) => handleAnswerTextChange(aIndex, e.target.value)}
                                className="flex-1 bg-white text-black rounded-lg px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder={`Answer option ${aIndex + 1}`}
                              />
                              <select
                                value={answer.Score}
                                onChange={(e) => handleAnswerScoreChange(aIndex, e.target.value)}
                                className="bg-white text-black rounded-lg px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value={1}>Score: 1</option>
                                <option value={2}>Score: 2</option>
                                <option value={3}>Score: 3</option>
                                <option value={4}>Score: 4</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => handleDeleteAnswer(answer.AnswerId, question.QuestionsId)}
                                className="text-red-600 hover:text-red-800 p-2"
                                title="Remove answer"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        // Viewing answers
                        <>
                          {question.Answers && question.Answers.length > 0 ? (
                            // Sort answers by score before displaying
                            [...question.Answers]
                              .sort((a, b) => a.Score - b.Score)
                              .map((answer) => (
                                <div
                                  key={answer.AnswerId}
                                  className="p-3 mb-2 rounded-lg bg-gray-200 text-gray-800 border-l-4"
                                  style={{
                                    borderLeftColor:
                                      answer.Score === 1 ? '#ef4444' :
                                        answer.Score === 2 ? '#f97316' :
                                          answer.Score === 3 ? '#3b82f6' :
                                            '#10b981',
                                    marginBottom: '8px'
                                  }}
                                >
                                  <div className="flex justify-between items-center">
                                    {/* Answer Text */}
                                    <p className="font-medium">{answer.AnswersText}</p>

                                    {/* Score */}
                                    <span
                                      className="px-2 py-1 rounded-full text-white text-xs font-bold"
                                      style={{
                                        backgroundColor:
                                          answer.Score === 1 ? '#ef4444' :
                                            answer.Score === 2 ? '#f97316' :
                                              answer.Score === 3 ? '#3b82f6' :
                                                '#10b981'
                                      }}
                                    >
                                      Score: {answer.Score}
                                    </span>
                                  </div>

                                  {/* Answer ID */}
                                  <p className="text-xs text-gray-500 font-mono mt-1">
                                    Answer ID: {answer.AnswerId}
                                  </p>
                                </div>
                              ))
                          ) : (
                            <p className="text-gray-500 italic">No answers available</p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No questions available for this quiz.</p>
            )}
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-black px-6 py-2 rounded-lg font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewQuizModal;
