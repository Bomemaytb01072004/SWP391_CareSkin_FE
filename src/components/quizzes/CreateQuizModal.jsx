import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

const CreateQuizModal = ({ newQuiz, setNewQuiz, handleAddQuiz, onClose }) => {
  const [currentQuestion, setCurrentQuestion] = useState({
    QuestionText: '',
    Options: [
      { OptionText: '', IsCorrect: false },
      { OptionText: '', IsCorrect: false },
      { OptionText: '', IsCorrect: false },
      { OptionText: '', IsCorrect: false }
    ]
  });
  
  const [errors, setErrors] = useState({
    Title: '',
    Description: ''
  });

  const [isFormValid, setIsFormValid] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewQuiz({ ...newQuiz, [name]: value });
    validateField(name, value);
  };
  
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
  };
  
  const validateForm = () => {
    validateField('Title', newQuiz.Title);
    validateField('Description', newQuiz.Description);
    return !errors.Title && !errors.Description;
  };
  
  const handleSubmit = () => {
    if (validateForm()) {
      handleAddQuiz();
    }
  };
  
  useEffect(() => {
    const formValid = 
      newQuiz.Title && 
      newQuiz.Title.startsWith('Quiz') &&
      newQuiz.Description &&
      newQuiz.Description.length >= 20;
    
    setIsFormValid(formValid);
  }, [newQuiz.Title, newQuiz.Description]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-black">Create New Quiz</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Quiz Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="Title"
              value={newQuiz.Title}
              onChange={handleInputChange}
              className={`w-full bg-gray-100 text-black rounded-lg px-4 py-2 border ${errors.Title ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter quiz title (must start with 'Quiz')"
              required
            />
            {errors.Title && (
              <p className="text-red-500 text-sm mt-1">{errors.Title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="Description"
              value={newQuiz.Description}
              onChange={handleInputChange}
              rows={3}
              className={`w-full bg-gray-100 text-black rounded-lg px-4 py-2 border ${errors.Description ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter quiz description (minimum 20 characters)"
              required
            />
            {errors.Description && (
              <p className="text-red-500 text-sm mt-1">{errors.Description}</p>
            )}
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-500">Min 20 characters</span>
              <span className={`${newQuiz.Description.length < 20 ? 'text-red-500' : 'text-green-500'}`}>
                {newQuiz.Description.length}/20
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isFormValid}
              className="bg-blue-300 hover:bg-blue-400 text-black px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateQuizModal;