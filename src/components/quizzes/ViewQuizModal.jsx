import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, AlertCircle, Edit2, Trash2, Save, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  getQuestionsByQuizId,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getAnswersByQuestionId,
  createAnswer,
  updateAnswer,
  deleteAnswer,
  updateQuiz
} from '../../utils/apiQ_A';

// API URL for direct fetching
const API_QUIZ_URL = 'http://careskinbeauty.shop:4456/api/Quiz';

const ViewQuizModal = ({ quizId, onClose, refetchQuizzes }) => {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editQuizDetails, setEditQuizDetails] = useState(false);
  
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

  // Fetch quiz data when quizId changes
  useEffect(() => {
    if (!quizId) return;
    fetchQuiz();
  }, [quizId]);

  // Fetch quiz data
  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_QUIZ_URL}/${quizId}`);
      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || 'Failed to fetch quiz by ID');
        } catch (e) {
          throw new Error(`Failed to fetch quiz by ID: ${errorText || response.statusText}`);
        }
      }
      const data = await response.json();
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

  // Start editing a question
  const handleEditQuestion = async (questionId) => {
    try {
      setLoading(true);
      setEditingQuestionId(questionId);
      
      // Find the question in our questions array
      const questionToEdit = quiz.Questions.find(q => q.QuestionsId === questionId);
      
      if (questionToEdit) {
        setCurrentQuestionText(questionToEdit.QuestionText);
        
        // Check if the question already has answers in the local state
        if (questionToEdit.Answers && questionToEdit.Answers.length > 0) {
          // Use the answers from the local state
          const formattedAnswers = questionToEdit.Answers.map(answer => ({
            AnswerID: answer.AnswerID,
            AnswersText: answer.AnswersText,
            Score: answer.Score
          }));
          
          // Ensure we have 4 answers (fill with empty ones if needed)
          while (formattedAnswers.length < 4) {
            formattedAnswers.push({ AnswersText: '', Score: formattedAnswers.length + 1 });
          }
          
          // Sort answers by score (lowest to highest)
          formattedAnswers.sort((a, b) => a.Score - b.Score);
          
          setEditingAnswers(formattedAnswers);
        } else {
          // Fetch answers for this question from API
          try {
            const answersData = await getAnswersByQuestionId(questionId);
            
            if (answersData && answersData.length > 0) {
              // Fill the current answers with the fetched data
              const formattedAnswers = answersData.map(answer => ({
                AnswerID: answer.AnswerID,
                AnswersText: answer.AnswersText,
                Score: answer.Score
              }));
              
              // Ensure we have 4 answers (fill with empty ones if needed)
              while (formattedAnswers.length < 4) {
                formattedAnswers.push({ AnswersText: '', Score: formattedAnswers.length + 1 });
              }
              
              // Sort answers by score (lowest to highest)
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
            // If we fail to fetch answers, still provide empty answers to edit
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

  // Save edited question
  const handleSaveQuestion = async (questionId) => {
    try {
      setLoading(true);
      
      // Validate question
      if (!currentQuestionText.trim()) {
        toast.error('Please enter a question text');
        return;
      }
      
      // Validate answers - at least one answer must be provided
      const validAnswers = editingAnswers.filter(ans => ans.AnswersText.trim());
      if (validAnswers.length < 1) {
        toast.error('Please provide at least one answer');
        return;
      }
      
      // Validate questionId
      if (!questionId) {
        console.error('Question ID is undefined', { questionId });
        toast.error('Cannot update question: Missing question ID');
        return;
      }
      
      // First, update the question text
      try {
        console.log('Updating question text:', questionId, currentQuestionText);
        const questionData = {
          QuestionText: currentQuestionText
        };
        await updateQuestion(questionId, questionData);
        console.log('Question text updated successfully');
      } catch (error) {
        console.error('Error updating question text:', error);
        toast.error('Failed to update question text');
        throw error;
      }
      
      // Get existing answers for this question to avoid duplicates
      let existingAnswers = [];
      try {
        existingAnswers = await getAnswersByQuestionId(questionId);
        console.log('Existing answers:', existingAnswers);
      } catch (error) {
        console.error('Error fetching existing answers:', error);
        // Continue with the update even if we can't fetch existing answers
      }
      
      // Then, update or create each answer separately
      const answerPromises = [];
      
      // Track which answers we've processed to avoid duplicates
      const processedAnswerIds = new Set();
      
      for (const answer of editingAnswers) {
        if (answer.AnswersText.trim()) {
          const answerPromise = (async () => {
            try {
              if (answer.AnswerID) {
                // Update existing answer
                console.log('Updating answer:', answer.AnswerID, answer);
                const answerData = {
                  AnswersText: answer.AnswersText,
                  Score: answer.Score
                };
                await updateAnswer(answer.AnswerID, answerData);
                processedAnswerIds.add(answer.AnswerID);
                console.log('Answer updated successfully:', answer.AnswerID);
              } else {
                // Create new answer
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
      
      // Delete any existing answers that weren't updated
      if (existingAnswers.length > 0) {
        for (const existingAnswer of existingAnswers) {
          if (!processedAnswerIds.has(existingAnswer.AnswerId)) {
            try {
              console.log('Deleting unused answer:', existingAnswer.AnswerId);
              await deleteAnswer(existingAnswer.AnswerId);
            } catch (error) {
              console.error('Error deleting unused answer:', error);
              // Continue with other operations even if this fails
            }
          }
        }
      }
                                
      // Wait for all answer updates to complete
      await Promise.all(answerPromises);
      console.log('All answers updated successfully');
      
      // Reset editing state
      setEditingQuestionId(null);
      setCurrentQuestionText('');
      setEditingAnswers([]);
      
      // Refresh quiz data
      await fetchQuiz();
      toast.success('Question and answers updated successfully');
    } catch (error) {
      console.error('Error saving question:', error);
      toast.error('Failed to save question or answers');
    } finally {
      setLoading(false);
    }
  };

  // Delete a question
  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }
    
    try {
      setLoading(true);
      await deleteQuestion(questionId);
      
      // Update local state
      setQuiz(prev => ({
        ...prev,
        Questions: prev.Questions.filter(q => q.QuestionsId !== questionId)
      }));
      
      toast.success('Question deleted successfully');
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Failed to delete question');
    } finally {
      setLoading(false);
    }
  };

  // Add new question
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

  // Save quiz details
  const handleSaveQuizDetails = async () => {
    try {
      setLoading(true);
      
      // Validate
      if (!editedQuizDetails.Title || !editedQuizDetails.Description) {
        toast.error('Title and Description are required');
        return;
      }
      
      // Update quiz
      await updateQuiz(quizId, editedQuizDetails);
      
      // Reset state
      setEditQuizDetails(false);
      
      // Refresh quiz data
      await fetchQuiz();
      if (refetchQuizzes) refetchQuizzes();
      
      toast.success('Quiz updated successfully');
    } catch (error) {
      console.error('Error updating quiz:', error);
      toast.error('Failed to update quiz');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle quiz details change
  const handleQuizDetailsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditedQuizDetails(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
          <h2 className="text-xl font-semibold">View Quiz Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
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
                  className="w-full bg-white text-black rounded-lg px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter quiz title"
                />
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
                  className="w-full bg-white text-black rounded-lg px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter quiz description"
                />
              </div>
              
              {/* Active Status */}
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="isActive"
                  name="IsActive"
                  checked={editedQuizDetails.IsActive}
                  onChange={handleQuizDetailsChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-black">
                  Active
                </label>
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
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
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
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        quiz.IsActive
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
                  <h3 className="text-sm font-medium text-black">Quiz ID</h3>
                  <p className="text-sm text-black mt-1 font-mono">{quiz.QuizID}</p>
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
                            <div key={aIndex} className="flex items-center space-x-2">
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
                                onClick={() => handleRemoveAnswer(aIndex)}
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
                              .map((answer, aIndex) => (
                                <div 
                                  key={answer.AnswerID} 
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
                                    Answer ID: {answer.AnswerID}
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
