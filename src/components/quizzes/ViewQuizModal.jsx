import React from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';

const ViewQuizModal = ({ quiz, onClose }) => {
  if (!quiz) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Quiz Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Quiz Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {/* Title */}
              <div>
                <h3 className="text-sm font-medium text-gray-400">Title</h3>
                <p className="text-lg font-medium text-white mt-1">{quiz.Title}</p>
              </div>

              {/* Status */}
              <div>
                <h3 className="text-sm font-medium text-gray-400">Status</h3>
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

              {/* ID */}
              <div>
                <h3 className="text-sm font-medium text-gray-400">ID</h3>
                <p className="text-sm text-gray-300 mt-1 font-mono">{quiz.Id}</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-sm font-medium text-gray-400">Description</h3>
              <div className="mt-1 p-3 bg-gray-700 rounded-lg text-white">
                <p>{quiz.Description}</p>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div>
            <h3 className="text-md font-semibold text-gray-300 mb-3">
              Questions ({quiz.Questions ? quiz.Questions.length : 0})
            </h3>

            {quiz.Questions && quiz.Questions.length > 0 ? (
              <div className="space-y-6">
                {quiz.Questions.map((question, qIndex) => (
                  <div key={qIndex} className="p-4 bg-gray-700 rounded-lg">
                    <h4 className="text-white font-medium mb-3">
                      {qIndex + 1}. {question.QuestionText}
                    </h4>

                    <div className="ml-4 space-y-2">
                      {question.Options && question.Options.map((option, oIndex) => (
                        <div
                          key={oIndex}
                          className={`p-2 rounded ${
                            option.IsCorrect
                              ? 'bg-green-800 bg-opacity-30 border border-green-500'
                              : 'bg-gray-600'
                          }`}
                        >
                          <div className="flex items-start">
                            <span className="inline-block w-6 text-gray-400">
                              {String.fromCharCode(65 + oIndex)}.
                            </span>
                            <span className={option.IsCorrect ? 'text-green-300' : 'text-gray-300'}>
                              {option.OptionText}
                            </span>
                            {option.IsCorrect && (
                              <CheckCircle2 className="ml-2 text-green-300" size={16} />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic">No questions available for this quiz.</p>
            )}
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium"
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
