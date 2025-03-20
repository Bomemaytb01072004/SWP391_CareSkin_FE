import React, { useState } from 'react';
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

  // Handle input changes for quiz details
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewQuiz((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setNewQuiz((prev) => ({
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
    
    setNewQuiz(prev => ({
      ...prev,
      Questions: [...(prev.Questions || []), newQuestion]
    }));
    
    // Reset current question form
    setCurrentQuestion({
      QuestionText: '',
      Options: [
        { OptionText: '', IsCorrect: false },
        { OptionText: '', IsCorrect: false },
        { OptionText: '', IsCorrect: false },
        { OptionText: '', IsCorrect: false }
      ]
    });
  };
  
  // Remove question from quiz
  const removeQuestion = (index) => {
    setNewQuiz(prev => ({
      ...prev,
      Questions: prev.Questions.filter((_, i) => i !== index)
    }));
  };

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
          {/* Quiz Title */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Quiz Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="Title"
              value={newQuiz.Title}
              onChange={handleInputChange}
              className="w-full bg-gray-100 text-black rounded-lg px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter quiz title"
              required
            />
          </div>

          {/* Quiz Description */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="Description"
              value={newQuiz.Description}
              onChange={handleInputChange}
              rows={3}
              className="w-full bg-gray-100 text-black rounded-lg px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter quiz description"
              required
            />
          </div>

         

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={handleAddQuiz}
              disabled={!newQuiz.Title || !newQuiz.Description || !newQuiz.Questions || newQuiz.Questions.length === 0}
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
