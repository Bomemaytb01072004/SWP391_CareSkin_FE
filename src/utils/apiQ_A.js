const API_BASE_URL = "http://careskinbeauty.shop:4456/api";
const Q_A_URL = `${API_BASE_URL}/Q_A`;
const QUIZ_URL = `${API_BASE_URL}/Quiz`;

/* ===============================
        QUIZ MANAGEMENT
================================== */

// Fetch all quizzes
export const fetchQuizzes = async () => {
  try {
    const response = await fetch(`${QUIZ_URL}`);
    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.message || `Failed to fetch: ${response.statusText}`);
      } catch (e) {
        throw new Error(`Failed to fetch: ${errorText || response.statusText}`);
      }
    }
    return await response.json();
  } catch (error) {
    console.error("Error in fetchQuizzes:", error);
    throw error;
  }
};

// Fetch active quizzes
export const fetchActiveQuizzes = async () => {
  try {
    const response = await fetch(`${QUIZ_URL}/active`);
    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.message || `Failed to fetch: ${response.statusText}`);
      } catch (e) {
        throw new Error(`Failed to fetch: ${errorText || response.statusText}`);
      }
    }
    return await response.json();
  } catch (error) {
    console.error("Error in fetchActiveQuizzes:", error);
    throw error;
  }
};

// Fetch inactive quizzes
export const fetchInactiveQuizzes = async () => {
  try {
    const response = await fetch(`${QUIZ_URL}/inactive`);
    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.message || `Failed to fetch: ${response.statusText}`);
      } catch (e) {
        throw new Error(`Failed to fetch: ${errorText || response.statusText}`);
      }
    }
    return await response.json();
  } catch (error) {
    console.error("Error in fetchInactiveQuizzes:", error);
    throw error;
  }
};

// Fetch quiz by ID
export const fetchQuizById = async (id) => {
  try {
    const response = await fetch(`${QUIZ_URL}/${id}`);
    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.message || `Failed to fetch quiz by ID`);
      } catch (e) {
        throw new Error(`Failed to fetch quiz by ID: ${errorText || response.statusText}`);
      }
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching quiz by ID:", error);
    throw error;
  }
};

// Create a new quiz
export const createQuiz = async (quizData) => {
  try {
    const response = await fetch(`${QUIZ_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(quizData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.message || `Failed to create quiz`);
      } catch (e) {
        throw new Error(`Failed to create quiz: ${errorText || response.statusText}`);
      }
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating quiz:", error);
    throw error;
  }
};

// Update a quiz
export const updateQuiz = async (id, quizData) => {
  try {
    const response = await fetch(`${QUIZ_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(quizData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.message || `Failed to update quiz`);
      } catch (e) {
        throw new Error(`Failed to update quiz: ${errorText || response.statusText}`);
      }
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating quiz:", error);
    throw error;
  }
};

// Delete a quiz
export const deleteQuiz = async (id) => {
  try {
    const response = await fetch(`${QUIZ_URL}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.message || `Failed to delete quiz`);
      } catch (e) {
        throw new Error(`Failed to delete quiz: ${errorText || response.statusText}`);
      }
    }

    // Trả về thành công cho các trường hợp khác
    return { success: true, message: "Quiz deleted successfully" };
  } catch (error) {
    console.error("Error in deleteQuiz function:", error);
    throw error; // Ném lại lỗi để hàm gọi có thể xử lý
  }
};

/* ===============================
        QUESTION MANAGEMENT
================================== */

// Get questions by quiz ID
export const getQuestionsByQuizId = async (quizId) => {
  try {
    const response = await fetch(`${Q_A_URL}/quizzes/${quizId}/questions`);
    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.message || `Failed to fetch questions`);
      } catch (e) {
        throw new Error(`Failed to fetch questions: ${errorText || response.statusText}`);
      }
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching questions by quiz ID:", error);
    throw error;
  }
};

// Create question for a quiz
export const createQuestion = async (quizId, questionData) => {
  try {
    const response = await fetch(`${Q_A_URL}/quizzes/${quizId}/questions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(questionData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.message || `Failed to create question`);
      } catch (e) {
        throw new Error(`Failed to create question: ${errorText || response.statusText}`);
      }
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating question:", error);
    throw error;
  }
};

// Get quiz by question ID
export const getQuizByQuestionId = async (questionId) => {
  try {
    const response = await fetch(`${Q_A_URL}/quizzes/${questionId}`);
    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.message || `Failed to fetch quiz by question ID`);
      } catch (e) {
        throw new Error(`Failed to fetch quiz by question ID: ${errorText || response.statusText}`);
      }
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching quiz by question ID:", error);
    throw error;
  }
};

// Get question by ID
export const getQuestionById = async (questionId) => {
  try {
    const response = await fetch(`${Q_A_URL}/questions/${questionId}`);
    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.message || `Failed to fetch question by ID`);
      } catch (e) {
        throw new Error(`Failed to fetch question by ID: ${errorText || response.statusText}`);
      }
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching question by ID:", error);
    throw error;
  }
};

// Update question
export const updateQuestion = async (questionId, questionData) => {
  try {
    const response = await fetch(`${Q_A_URL}/questions/${questionId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(questionData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.message || `Failed to update question`);
      } catch (e) {
        throw new Error(`Failed to update question: ${errorText || response.statusText}`);
      }
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating question:", error);
    throw error;
  }
};

// Delete question
export const deleteQuestion = async (questionId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Q_A/questions/${questionId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to delete question: ${errorText}`);
      throw new Error(`Failed to delete question: ${response.statusText}`);
    }

    console.log(`Question with ID ${questionId} deleted successfully`);
    return response; // Trả về phản hồi để kiểm tra
  } catch (error) {
    console.error('Error in deleteQuestion API:', error);
    throw error;
  }
};

/* ===============================
        ANSWER MANAGEMENT
================================== */

// Get answers by question ID
export const getAnswersByQuestionId = async (questionId) => {
  try {
    const response = await fetch(`${Q_A_URL}/questions/${questionId}/answers`);
    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.message || `Failed to fetch answers`);
      } catch (e) {
        throw new Error(`Failed to fetch answers: ${errorText || response.statusText}`);
      }
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching answers by question ID:", error);
    throw error;
  }
};

// Create answer for a question
export const createAnswer = async (questionId, answerData) => {
  try {
    const response = await fetch(`${Q_A_URL}/questions/${questionId}/answers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(answerData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.message || `Failed to create answer`);
      } catch (e) {
        throw new Error(`Failed to create answer: ${errorText || response.statusText}`);
      }
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating answer:", error);
    throw error;
  }
};

// Get answer by ID
export const getAnswerById = async (answerId) => {
  try {
    const response = await fetch(`${Q_A_URL}/answers/${answerId}`);
    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.message || `Failed to fetch answer by ID`);
      } catch (e) {
        throw new Error(`Failed to fetch answer by ID: ${errorText || response.statusText}`);
      }
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching answer by ID:", error);
    throw error;
  }
};

// Update answer
export const updateAnswer = async (answerId, answerData) => {
  try {
    const response = await fetch(`${Q_A_URL}/answers/${answerId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(answerData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.message || `Failed to update answer`);
      } catch (e) {
        throw new Error(`Failed to update answer: ${errorText || response.statusText}`);
      }
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating answer:", error);
    throw error;
  }
};

// Delete answer
export const deleteAnswer = async (answerId) => {
  try {
    const response = await fetch(`${Q_A_URL}/answers/${answerId}`, {
      method: "DELETE",
    });

    if (response.status === 204) {
      return;
    }

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.message || `Failed to delete answer`);
      } catch (e) {
        throw new Error(`Failed to delete answer: ${errorText || response.statusText}`);
      }
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting answer:", error);
    throw error;
  }
};

/* ===============================
        QUIZ RESULTS & ANALYTICS
================================== */

// Get quiz results
export const getQuizResults = async (quizId) => {
  try {
    const response = await fetch(`${QUIZ_URL}/${quizId}/results`);
    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.message || `Failed to get quiz results`);
      } catch (e) {
        throw new Error(`Failed to get quiz results: ${errorText || response.statusText}`);
      }
    }
    return await response.json();
  } catch (error) {
    console.error("Error getting quiz results:", error);
    throw error;
  }
};

// Get quiz statistics
export const getQuizStatistics = async (quizId) => {
  try {
    const response = await fetch(`${QUIZ_URL}/${quizId}/statistics`);
    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.message || `Failed to get quiz statistics`);
      } catch (e) {
        throw new Error(`Failed to get quiz statistics: ${errorText || response.statusText}`);
      }
    }
    return await response.json();
  } catch (error) {
    console.error("Error getting quiz statistics:", error);
    throw error;
  }
};

// Submit quiz answers
export const submitQuizAnswers = async (quizId, answersData) => {
  try {
    const response = await fetch(`${QUIZ_URL}/${quizId}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(answersData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.message || `Failed to submit quiz answers`);
      } catch (e) {
        throw new Error(`Failed to submit quiz answers: ${errorText || response.statusText}`);
      }
    }

    return await response.json();
  } catch (error) {
    console.error("Error submitting quiz answers:", error);
    throw error;
  }
};

// Toggle quiz status (active/inactive)
export const toggleQuizStatus = async (quizId, status) => {
  try {
    const response = await fetch(`${QUIZ_URL}/${quizId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ isActive: status }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.message || `Failed to toggle quiz status`);
      } catch (e) {
        throw new Error(`Failed to toggle quiz status: ${errorText || response.statusText}`);
      }
    }

    return await response.json();
  } catch (error) {
    console.error("Error toggling quiz status:", error);
    throw error;
  }
};

// Export all as default
export default {
  // Quiz Management
  fetchQuizzes,
  fetchActiveQuizzes,
  fetchInactiveQuizzes,
  fetchQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,

  // Question Management
  getQuestionsByQuizId,
  createQuestion,
  getQuizByQuestionId,
  getQuestionById,
  updateQuestion,
  deleteQuestion,

  // Answer Management
  getAnswersByQuestionId,
  createAnswer,
  getAnswerById,
  updateAnswer,
  deleteAnswer,

  // Quiz Results & Analytics
  getQuizResults,
  getQuizStatistics,
  submitQuizAnswers,
  toggleQuizStatus,
};
