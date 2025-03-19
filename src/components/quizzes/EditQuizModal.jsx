import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit2 } from 'lucide-react';

const EditQuizModal = ({ editQuizState, setEditQuiz, handleEdit, onClose }) => {
  const [currentQuestion, setCurrentQuestion] = useState({
    QuestionText: '',
    Options: [
      { OptionText: '', IsCorrect: false },
      { OptionText: '', IsCorrect: false },
      { OptionText: '', IsCorrect: false },
      { OptionText: '', IsCorrect: false }
    ]
  });
  
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(-1);
  const [mode, setMode] = useState('add'); // 'add' or 'edit'

  // Handle input changes for quiz details
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditQuiz((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setEditQuiz((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Handle question text change
  const handleQuestionTextChange = (e) => {
    const { value } = e.target;
    setCurrentQuestion(prev => ({
      ...prev,
      QuestionText: value
    }));
  };
  
  // Handle option text change
  const handleOptionTextChange = (index, value) => {
    setCurrentQuestion(prev => {
      const newOptions = [...prev.Options];
      newOptions[index] = { ...newOptions[index], OptionText: value };
      return { ...prev, Options: newOptions };
    });
  };
  
  // Handle option correctness change
  const handleOptionCorrectChange = (index) => {
    setCurrentQuestion(prev => {
      const newOptions = prev.Options.map((option, i) => ({
        ...option,
        IsCorrect: i === index
      }));
      return { ...prev, Options: newOptions };
    });
  };
  
  // Start editing a question
  const startEditingQuestion = (index) => {
    const questionToEdit = editQuizState.Questions[index];
    
    // Make sure we have 4 options by filling any missing ones
    let optionsToEdit = [...questionToEdit.Options];
    while (optionsToEdit.length < 4) {
      optionsToEdit.push({ OptionText: '', IsCorrect: false });
    }
    
    setCurrentQuestion({
      ...questionToEdit,
      Options: optionsToEdit
    });
    
    setEditingQuestionIndex(index);
    setMode('edit');
  };
  
  // Save edited question
  const saveEditedQuestion = () => {
    // Validate question
    if (!currentQuestion.QuestionText.trim()) {
      alert('Please enter a question text');
      return;
    }
    
    const filledOptions = currentQuestion.Options.filter(opt => opt.OptionText.trim());
    if (filledOptions.length < 2) {
      alert('Please add at least two options');
      return;
    }
    
    const correctOptions = currentQuestion.Options.filter(opt => opt.IsCorrect && opt.OptionText.trim());
    if (correctOptions.length !== 1) {
      alert('Please select exactly one correct answer');
      return;
    }
    
    // Filter out empty options
    const validOptions = currentQuestion.Options.filter(opt => opt.OptionText.trim());
    
    const updatedQuestion = {
      ...currentQuestion,
      Options: validOptions
    };
    
    setEditQuiz(prev => {
      const updatedQuestions = [...prev.Questions];
      updatedQuestions[editingQuestionIndex] = updatedQuestion;
      return {
        ...prev,
        Questions: updatedQuestions
      };
    });
    
    // Reset current question form and editing state
    resetQuestionForm();
  };
  
  // Add question to quiz
  const addQuestionToQuiz = () => {
    // Validate question
    if (!currentQuestion.QuestionText.trim()) {
      alert('Please enter a question text');
      return;
    }
    
    const filledOptions = currentQuestion.Options.filter(opt => opt.OptionText.trim());
    if (filledOptions.length < 2) {
      alert('Please add at least two options');
      return;
    }
    
    const correctOptions = currentQuestion.Options.filter(opt => opt.IsCorrect && opt.OptionText.trim());
    if (correctOptions.length !== 1) {
      alert('Please select exactly one correct answer');
      return;
    }
    
    // Filter out empty options
    const validOptions = currentQuestion.Options.filter(opt => opt.OptionText.trim());
    
    const newQuestion = {
      ...currentQuestion,
      Options: validOptions
    };
    
    setEditQuiz(prev => ({
      ...prev,
      Questions: [...(prev.Questions || []), newQuestion]
    }));
    
    // Reset current question form
    resetQuestionForm();
  };
  
  // Reset the question form
  const resetQuestionForm = () => {
    setCurrentQuestion({
      QuestionText: '',
      Options: [
        { OptionText: '', IsCorrect: false },
        { OptionText: '', IsCorrect: false },
        { OptionText: '', IsCorrect: false },
        { OptionText: '', IsCorrect: false }
      ]
    });
    setEditingQuestionIndex(-1);
    setMode('add');
  };
  
  // Remove question from quiz
  const removeQuestion = (index) => {
    setEditQuiz(prev => ({
      ...prev,
      Questions: prev.Questions.filter((_, i) => i !== index)
    }));
    
    // If the question being removed is also being edited, reset the form
    if (index === editingQuestionIndex) {
      resetQuestionForm();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Edit Quiz</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Quiz Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Quiz Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="Title"
              value={editQuizState.Title}
              onChange={handleInputChange}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter quiz title"
              required
            />
          </div>

          {/* Quiz Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="Description"
              value={editQuizState.Description}
              onChange={handleInputChange}
              rows={3}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter quiz description"
              required
            />
          </div>

          {/* Quiz Status */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-300">
              <input
                type="checkbox"
                name="IsActive"
                checked={editQuizState.IsActive}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span>Active (will be visible to users)</span>
            </label>
          </div>

          {/* Questions List */}
          {editQuizState.Questions && editQuizState.Questions.length > 0 && (
            <div>
              <h3 className="text-md font-semibold text-gray-300 mb-2">Questions</h3>
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto p-2">
                {editQuizState.Questions.map((question, index) => (
                  <div key={index} className="flex items-start justify-between p-3 bg-gray-700 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{index + 1}. {question.QuestionText}</p>
                      <ul className="mt-1 pl-6 text-sm text-gray-300 list-disc">
                        {question.Options.map((option, optIndex) => (
                          <li key={optIndex} className={option.IsCorrect ? "text-green-400" : ""}>
                            {option.OptionText} {option.IsCorrect && "(Correct)"}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => startEditingQuestion(index)}
                        className="text-blue-400 hover:text-blue-300"
                        title="Edit question"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => removeQuestion(index)}
                        className="text-red-400 hover:text-red-300"
                        title="Remove question"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Question Form Section */}
          <div className="border border-gray-700 rounded-lg p-4 bg-gray-750">
            <h3 className="text-md font-semibold text-gray-300 mb-3">
              {mode === 'add' ? 'Add New Question' : 'Edit Question'}
            </h3>
            
            {/* Question Text */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Question Text <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={currentQuestion.QuestionText}
                onChange={handleQuestionTextChange}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter question text"
              />
            </div>
            
            {/* Options */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Options <span className="text-red-500">*</span> (Select one correct answer)
              </label>
              <div className="space-y-2">
                {currentQuestion.Options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={option.IsCorrect}
                      onChange={() => handleOptionCorrectChange(index)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={option.OptionText}
                      onChange={(e) => handleOptionTextChange(index, e.target.value)}
                      className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Option ${index + 1}`}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-3">
              {mode === 'add' ? (
                <button
                  type="button"
                  onClick={addQuestionToQuiz}
                  className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  <Plus size={16} />
                  <span>Add This Question</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={saveEditedQuestion}
                    className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    <Edit2 size={16} />
                    <span>Save Changes</span>
                  </button>
                  <button
                    type="button"
                    onClick={resetQuestionForm}
                    className="flex items-center space-x-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    <X size={16} />
                    <span>Cancel</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={handleEdit}
              disabled={!editQuizState.Title || !editQuizState.Description || !editQuizState.Questions || editQuizState.Questions.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Update Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditQuizModal;
