import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Layout/Navbar';
import Footer from '../../components/Layout/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import quizBg from '../../assets/SkinQuiz/skincare.jpg';
import GuestUnauthorizedPage from '../../Pages/Unauthorized/GuestUnauthorizedPage';

const SkinQuizPage = () => {
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [stage, setStage] = useState('start');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [quizId, setQuizId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [userQuizAttemptId, setUserQuizAttemptId] = useState(null);
  const [apiQuestions, setApiQuestions] = useState([]);
  const [isQuestionsLoading, setIsQuestionsLoading] = useState(false);
  const [answerHistory, setAnswerHistory] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiResultData, setApiResultData] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  useEffect(() => {
    // Authentication check - run this first
    const CustomerId = localStorage.getItem('CustomerId');
    const token =
      localStorage.getItem('Token') || localStorage.getItem('token');

    if (!CustomerId || !token) {
      setIsLoading(true);

      // Save current URL to return after login
      localStorage.setItem('redirectAfterLogin', '/skinquiz');
      setIsAuthenticated(false); // Mark as not authenticated
    }
  }, [navigate]);

  useEffect(() => {
    // Check if the quiz has already been completed
    const storedResult = localStorage.getItem('skincareResult');
    if (storedResult) {
      navigate('/skinroutine'); // Redirect to routine page if results exist
    }
  }, [navigate]);
  // Add this near other useEffect hooks
  useEffect(() => {
    // Debug whenever answerHistory changes
    console.log('Current answer history:', answerHistory);
  }, [answerHistory]);
  // Add near your other useEffect hooks
  useEffect(() => {
    // Log whenever the userQuizAttemptId changes
    console.log('userQuizAttemptId updated:', userQuizAttemptId);
  }, [userQuizAttemptId]);

  // Add this after your state declarations to debug
  useEffect(() => {
    if (stage === 'result') {
      console.log('===== QUIZ RESULTS DEBUG =====');
      console.log('API Result Data:', apiResultData);
      console.log('All answers:', answers);
      console.log(
        'First question answer:',
        apiQuestions.length > 0 ? answers[apiQuestions[0].id] : null
      );
      console.log(
        'Second question answer:',
        apiQuestions.length > 1 ? answers[apiQuestions[1].id] : null
      );
    }
  }, [stage, apiResultData, answers, apiQuestions]);

  const handleStartQuiz = async () => {
    setIsLoading(true);
    const customerId = localStorage.getItem('CustomerId');
    const token = localStorage.getItem('token');

    if (!customerId) {
      // Guest user - just start quiz without any API calls
      setQuizId(2); // Default quiz ID for guests
      await fetchQuizQuestions(2); // Fetch default questions for guests
      setStage('quiz');
      setIsLoading(false);
      return;
    }

    try {
      // Check if user has done the quiz before
      const checkResponse = await fetch(
        `${backendUrl}/api/UserQuizAttempt/customer/${customerId}?includeHistories=false`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!checkResponse.ok) {
        throw new Error('Failed to check quiz history');
      }

      const historyData = await checkResponse.json();
      let selectedQuizId;

      // Determine which quiz to assign
      if (!historyData || historyData.length === 0) {
        // User hasn't done the quiz before
        selectedQuizId = 2;
      } else {
        // User has done the quiz before - randomly assign 4 or 5
        selectedQuizId = Math.random() < 0.5 ? 4 : 5;
      }

      setQuizId(selectedQuizId);

      // Create a new quiz attempt
      const createResponse = await fetch(`${backendUrl}/api/UserQuizAttempt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          CustomerId: parseInt(customerId),
          QuizId: selectedQuizId,
        }),
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create quiz attempt');
      }

      // Store the attempt ID from the response
      const attemptData = await createResponse.json();
      console.log('Quiz attempt created:', attemptData); // Check the response structure

      // Handle different possible API response formats
      if (attemptData.userQuizAttemptId) {
        setUserQuizAttemptId(attemptData.userQuizAttemptId);
      } else if (attemptData.id) {
        setUserQuizAttemptId(attemptData.id);
      } else {
        console.error(
          'Could not find userQuizAttemptId in response',
          attemptData
        );
        // Try to extract from the object if it's nested
        const extractedId = Object.values(attemptData).find(
          (val) =>
            typeof val === 'number' ||
            (typeof val === 'string' && !isNaN(parseInt(val)))
        );
        if (extractedId) {
          setUserQuizAttemptId(extractedId);
        }
      }

      // Add debug to verify ID is set
      console.log('Set userQuizAttemptId to:', userQuizAttemptId);

      // Fetch questions for this quiz
      await fetchQuizQuestions(selectedQuizId);

      // Move to quiz stage
      setStage('quiz');
      setHasStarted(true);
    } catch (error) {
      console.error('Error starting quiz:', error);
      toast.error('Failed to start the quiz. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQuizQuestions = async (quizId) => {
    setIsQuestionsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await fetch(`${backendUrl}/api/Quiz/${quizId}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch quiz questions: ${response.status}`);
      }

      const quizData = await response.json();
      console.log('Quiz API Response:', quizData); // Debug log to see structure

      // Extract questions based on the actual API response structure
      let questions = [];

      if (quizData && quizData.Questions && Array.isArray(quizData.Questions)) {
        questions = quizData.Questions;
      } else if (
        quizData &&
        quizData.questions &&
        Array.isArray(quizData.questions)
      ) {
        questions = quizData.questions;
      } else if (Array.isArray(quizData)) {
        questions = quizData;
      } else {
        throw new Error('Could not find questions in API response');
      }

      // Map API response to our expected format with proper field names
      const formattedQuestions = questions.map((q) => ({
        id:
          q.QuestionsId ||
          q.questionId ||
          Math.random().toString(36).substring(7),
        text: q.QuestionText || q.text || 'Question text unavailable',
        description: q.Description || q.description || '',
        // Handle options which are called "Answers" in the API
        options: Array.isArray(q.Answers)
          ? q.Answers.map((opt) => ({
              id:
                opt.AnswerId ||
                opt.optionId ||
                Math.random().toString(36).substring(7),
              text: opt.AnswersText || opt.text || 'Option text unavailable',
            }))
          : Array.isArray(q.options)
            ? q.options.map((opt) => ({
                id:
                  opt.optionId ||
                  opt.id ||
                  Math.random().toString(36).substring(7),
                text: opt.text || 'Option text unavailable',
              }))
            : [], // Empty options array if none found
      }));

      if (formattedQuestions.length === 0) {
        throw new Error('No valid questions found in quiz data');
      }

      setApiQuestions(formattedQuestions);
      setCurrentQuestion(0); // Reset to first question

      console.log('Formatted questions:', formattedQuestions);
    } catch (error) {
      console.error('Error fetching quiz questions:', error);
      toast.error(`Failed to load questions: ${error.message}`);

      // Fallback to predefined questions in case of API failure
      setApiQuestions(questions);
    } finally {
      setIsQuestionsLoading(false);
    }
  };

  const skinCharacteristicsMapping = {
    'Dry Skin': [
      { text: 'Feels tight, especially after cleansing', positive: false },
      { text: 'May have visible flaking or rough patches', positive: false },
      { text: 'Fine lines appear more pronounced', positive: false },
      { text: 'Needs rich, hydrating products', positive: true },
      { text: 'Benefits from cream-based cleansers', positive: true },
      { text: 'Should avoid harsh, drying ingredients', positive: true },
    ],
    'Sensitive Skin': [
      {
        text: 'Reacts easily to products and environmental factors',
        positive: false,
      },
      { text: 'May experience redness, stinging or burning', positive: false },
      { text: 'Skin barrier may be compromised', positive: false },
      { text: 'Benefits from fragrance-free products', positive: true },
      {
        text: 'Should use gentle, minimal-ingredient formulas',
        positive: true,
      },
      { text: 'Patch testing new products is essential', positive: true },
    ],
    'Combination Skin': [
      { text: 'Oily T-zone with normal to dry cheeks', positive: false },
      { text: 'Enlarged pores in the center of face', positive: false },
      { text: 'Different areas require different care', positive: false },
      { text: 'Benefits from balanced, lightweight hydration', positive: true },
      {
        text: 'May need targeted treatments for different zones',
        positive: true,
      },
      { text: 'Gentle exfoliation helps balance skin', positive: true },
    ],
    'Oily Skin': [
      { text: 'Shiny appearance, especially in T-zone', positive: false },
      { text: 'Enlarged, visible pores', positive: false },
      { text: 'Prone to blackheads and acne', positive: false },
      {
        text: 'Benefits from oil-free, non-comedogenic products',
        positive: true,
      },
      {
        text: 'Regular gentle exfoliation helps prevent clogged pores',
        positive: true,
      },
      {
        text: 'Still requires proper hydration, not stripping',
        positive: true,
      },
    ],
    'Normal Skin': [
      { text: 'Well-balanced oil production', positive: true },
      { text: 'Smooth texture with refined pores', positive: true },
      { text: 'Few to no imperfections', positive: true },
      { text: 'Good circulation gives a healthy glow', positive: true },
      { text: 'Focus on maintenance and prevention', positive: true },
      { text: 'Consistent routine helps preserve balance', positive: true },
    ],
    Concerns: {
      Acne: [
        { text: 'Prone to frequent breakouts', positive: false },
        { text: 'Excess oil production', positive: false },
        {
          text: 'Needs oil-control and anti-inflammatory ingredients',
          positive: true,
        },
      ],
      Wrinkles: [
        { text: 'Loss of elasticity', positive: false },
        { text: 'Fine lines and wrinkles visible', positive: false },
        {
          text: 'Requires hydration and collagen-boosting ingredients',
          positive: true,
        },
      ],
      Redness: [
        { text: 'Easily irritated skin', positive: false },
        { text: 'Visible capillaries or flushing', positive: false },
        {
          text: 'Needs soothing and anti-inflammatory ingredients',
          positive: true,
        },
      ],
      Hyperpigmentation: [
        { text: 'Dark spots and uneven skin tone', positive: false },
        { text: 'Sensitive to sun exposure', positive: false },
        { text: 'Requires brightening and SPF protection', positive: true },
      ],
      Dryness: [
        { text: 'Feels tight and rough', positive: false },
        { text: 'Prone to flaking', positive: false },
        { text: 'Needs deep hydration and barrier repair', positive: true },
      ],
    },
  };
  const handleAnswer = (questionId, answerId, answerText) => {
    // Update answers state for UI display
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerText,
    }));

    // Update answer history for API submission - ensure IDs are numbers
    setAnswerHistory((prev) => {
      const filtered = prev.filter(
        (a) => a.QuestionId !== parseInt(questionId)
      );
      return [
        ...filtered,
        {
          QuestionId: parseInt(questionId), // Already using the correct capitalization
          AnswerId: parseInt(answerId), // Already using the correct capitalization
        },
      ];
    });
  };

  // In the nextQuestion function, add:
  const nextQuestion = () => {
    // Validate that current question has an answer
    const currentQuestionId = apiQuestions[currentQuestion]?.id;
    const hasAnswer = answers[currentQuestionId];

    if (!hasAnswer) {
      toast.info('Please select an answer before continuing.');
      return;
    }

    if (currentQuestion < apiQuestions.length - 1) {
      const customerId = localStorage.getItem('CustomerId');
      if (customerId && !userQuizAttemptId) {
        console.warn('Warning: No userQuizAttemptId found for logged in user');
        toast.warning(
          'There may be an issue with saving your quiz results. You can continue, but your history may not be saved.'
        );
      }
      setCurrentQuestion(currentQuestion + 1);
    } else {
      console.log('Final answer history for submission:', answerHistory);
      setStage('result');
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const submitQuiz = async () => {
    setIsSubmitting(true);

    try {
      // For guest users or if userQuizAttemptId is missing, just store results locally
      if (!userQuizAttemptId) {
        console.log(
          'Guest user or missing attempt ID - saving results locally only'
        );

        // Default result data for guests
        const skinType =
          apiQuestions.length > 0 ? answers[apiQuestions[0]?.id] : 'Normal';
        const skinConcern =
          apiQuestions.length > 1 ? answers[apiQuestions[1]?.id] : null;

        const result = {
          skinType: skinType || 'Normal Skin',
          concerns: skinConcern ? [skinConcern] : [],
          quizId: quizId,
          timestamp: new Date().toISOString(),
        };

        localStorage.setItem('skincareResult', JSON.stringify(result));
        navigate('/skinroutine');
        return;
      }

      // For registered users, submit to API
      const token = localStorage.getItem('token');
      const customerId = localStorage.getItem('CustomerId');

      // Debug logging
      console.log('Submitting answers to API:', answerHistory);
      console.log('UserQuizAttemptId:', userQuizAttemptId);

      // 1. Submit answers to history endpoint
      const historyResponse = await fetch(
        `${backendUrl}/api/History/attempt/${userQuizAttemptId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(answerHistory),
        }
      );

      if (!historyResponse.ok) {
        throw new Error(
          `Failed to submit quiz answers: ${historyResponse.status}`
        );
      }

      console.log('Quiz answers submitted successfully!');

      // 2. Get final results from Results API
      console.log('Fetching final skin type results...');
      const resultResponse = await fetch(`${backendUrl}/api/Result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          CustomerId: parseInt(customerId),
          QuizId: quizId,
          UserQuizAttemptId: userQuizAttemptId,
        }),
      });

      if (!resultResponse.ok) {
        throw new Error(
          `Failed to get skin type results: ${resultResponse.status}`
        );
      }
      const resultData = await resultResponse.json();
      console.log('Result API response:', resultData);
      setApiResultData(resultData);
      const finalResult = {
        skinTypeId: resultData.SkinType?.SkinTypeId || 'Normal Skin',
        skinType: resultData.SkinType?.TypeName || 'Normal Skin',
        skinTypeDescription: resultData.SkinType?.Description || '',
        totalScore: resultData.TotalScore,
        totalQuestions: resultData.TotalQuestions,
        lastQuizTime: resultData.LastQuizTime,
        concerns: apiQuestions.length > 1 ? [answers[apiQuestions[1]?.id]] : [],
        quizId: quizId,
        resultId: resultData.ResultId,
        timestamp: new Date().toISOString(),
      };

      localStorage.setItem('skincareResult', JSON.stringify(finalResult));
      setStage('result');
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Failed to submit your quiz. Please try again.');

      // Still save local results as fallback if API fails
      const fallbackResult = {
        skinType:
          apiQuestions.length > 0
            ? answers[apiQuestions[0]?.id]
            : 'Normal Skin',
        concerns: apiQuestions.length > 1 ? [answers[apiQuestions[1]?.id]] : [],
        quizId: quizId,
        timestamp: new Date().toISOString(),
        isApiError: true,
      };

      localStorage.setItem('skincareResult', JSON.stringify(fallbackResult));
      setStage('result');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user is not authenticated, show unauthorized page
  if (!isAuthenticated) {
    return (
      <GuestUnauthorizedPage
        pageName="the Skin Quiz"
        redirectPath="/login"
        returnUrl="/skinquiz"
        message="Please log in to take our skin quiz and get personalized recommendations"
      />
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen bg-white  mt-10">
        {stage === 'start' && (
          <motion.div
            key="start-stage"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="relative w-full h-screen flex items-center justify-center text-white bg-cover bg-center"
            style={{
              backgroundImage: `url(${quizBg})`,
            }}
          >
            {/* Enhanced Overlay with Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/30"></div>

            {/* Decorative Elements */}
            <motion.div
              className="absolute top-20 right-20 w-32 h-32 rounded-full bg-emerald-500 opacity-20 blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.15, 0.25, 0.15],
              }}
              transition={{ duration: 8, repeat: Infinity }}
            ></motion.div>

            <motion.div
              className="absolute bottom-40 left-20 w-64 h-64 rounded-full bg-emerald-300 opacity-20 blur-3xl"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.15, 0.2, 0.15],
              }}
              transition={{ duration: 7, delay: 1, repeat: Infinity }}
            ></motion.div>

            {/* Content Section */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center py-16 px-6 mt-2 w-full max-w-7xl mx-auto">
              <motion.div
                className="mb-2 inline-block bg-emerald-500/20 px-4 py-1 rounded-full backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="text-xs md:text-sm font-medium tracking-wider text-emerald-100">
                  PERSONALIZED SKIN ANALYSIS
                </span>
              </motion.div>

              <motion.h2
                className="font-bold leading-tight text-lg md:text-3xl lg:text-4xl max-w-[600px] w-full mb-3"
                style={{
                  textShadow: '0.05rem 0.05rem 0.1rem rgba(0, 0, 0, 0.2)',
                  fontFamily: 'Pacifico, cursive',
                  color: 'rgba(255, 255, 255, 0.9)',
                }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
              >
                Know Your Skin
              </motion.h2>

              <motion.h1
                className="font-extrabold leading-tight mb-6 text-4xl md:text-6xl lg:text-7xl max-w-[700px] w-full"
                style={{
                  textShadow: '0.1rem 0.1rem 0.2rem rgba(0, 0, 0, 0.3)',
                  color: '#FFD700',
                  fontFamily: 'Pacifico, cursive',
                  wordBreak: 'break-word',
                }}
              >
                {'Love Your Glow'.split('').map((char, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 + index * 0.05 }}
                  >
                    {char}
                  </motion.span>
                ))}
              </motion.h1>

              <motion.p
                className="text-xs md:text-base lg:text-lg text-slate-200 mb-10 max-w-[500px] w-full leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                Get Ready to Glow – The Perfect Routine is Waiting for Your
                Unique Skin Type!
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <motion.button
                  className={`px-6 py-4 text-xs md:text-base lg:text-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-full shadow-xl hover:shadow-emerald-500/20 hover:from-emerald-600 hover:to-emerald-800 transition-all relative ${isLoading ? 'opacity-90 cursor-not-allowed' : ''}`}
                  onClick={handleStartQuiz}
                  whileHover={
                    isLoading
                      ? {}
                      : {
                          scale: 1.05,
                          boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)',
                        }
                  }
                  whileTap={isLoading ? {} : { scale: 0.98 }}
                  disabled={isLoading}
                >
                  <span className="flex items-center gap-2">
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Starting...
                      </>
                    ) : (
                      <>
                        Start Your Skin Journey
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 12h14"></path>
                          <path d="M12 5l7 7-7 7"></path>
                        </svg>
                      </>
                    )}
                  </span>
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {stage === 'quiz' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="max-w-4xl w-full bg-white p-8 sm:p-10 md:p-12 shadow-xl rounded-2xl border border-gray-200 transition-all my-16"
          >
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs sm:text-sm font-medium text-emerald-600">
                  Question {currentQuestion + 1} of {apiQuestions.length}
                </p>
                <p className="text-xs sm:text-sm font-medium text-gray-500">
                  {Math.round(
                    ((currentQuestion + 1) / apiQuestions.length) * 100
                  )}
                  % Complete
                </p>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${((currentQuestion + 1) / apiQuestions.length) * 100}%`,
                  }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                ></motion.div>
              </div>
            </div>

            <motion.div
              className="mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <span className="inline-block bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-medium mb-3">
                Step {currentQuestion + 1}
              </span>
            </motion.div>

            {isQuestionsLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
              </div>
            ) : (
              <>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-3"
                >
                  {apiQuestions[currentQuestion]?.text || 'Loading...'}
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-sm sm:text-base text-gray-600 mb-8"
                >
                  {apiQuestions[currentQuestion]?.description || ''}
                </motion.p>

                {/* Options */}
                <motion.div
                  className="grid grid-cols-1 gap-4"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.1 },
                    },
                  }}
                >
                  {apiQuestions[currentQuestion]?.options.map(
                    (option, index) => (
                      <motion.button
                        key={option.id}
                        className={`w-full py-4 px-6 rounded-xl text-left transition duration-200 flex items-center group ${
                          answers[apiQuestions[currentQuestion]?.id] ===
                          option.text
                            ? 'bg-emerald-50 border-2 border-emerald-500 shadow-md'
                            : 'border-2 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                        }`}
                        onClick={() =>
                          handleAnswer(
                            apiQuestions[currentQuestion].id,
                            option.id,
                            option.text
                          )
                        }
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        variants={{
                          hidden: { opacity: 0, y: 20 },
                          visible: { opacity: 1, y: 0 },
                        }}
                      >
                        <span
                          className={`w-6 h-6 mr-4 rounded-full flex items-center justify-center text-sm ${
                            answers[apiQuestions[currentQuestion]?.id] ===
                            option.text
                              ? 'bg-emerald-500 text-white'
                              : 'bg-gray-100 text-gray-400 group-hover:bg-emerald-100 group-hover:text-emerald-500'
                          }`}
                        >
                          {index + 1}
                        </span>
                        <div>
                          <span
                            className={`font-medium ${
                              answers[apiQuestions[currentQuestion]?.id] ===
                              option.text
                                ? 'text-emerald-700'
                                : 'text-gray-700'
                            }`}
                          >
                            {option.text}
                          </span>
                        </div>
                      </motion.button>
                    )
                  )}
                </motion.div>
              </>
            )}

            {/* Navigation Buttons */}
            <div className="mt-10 flex justify-between items-center">
              {/* Previous Button - Only visible after first question */}
              {currentQuestion > 0 ? (
                <motion.button
                  className="py-3 px-8 font-semibold rounded-full shadow-md transition flex items-center gap-2 bg-white border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                  onClick={previousQuestion}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 12H5"></path>
                    <path d="M12 19l-7-7 7-7"></path>
                  </svg>
                  Previous
                </motion.button>
              ) : (
                <div></div> // Empty div to maintain layout when Previous button is hidden
              )}

              {/* Next/Continue Button */}
              <motion.button
                className={`py-3 px-8 font-semibold rounded-full shadow-md transition flex items-center gap-2 ${
                  answers[apiQuestions[currentQuestion]?.id]
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                onClick={
                  currentQuestion === apiQuestions.length - 1
                    ? submitQuiz
                    : nextQuestion
                }
                disabled={
                  !answers[apiQuestions[currentQuestion]?.id] || isSubmitting
                }
                whileHover={
                  answers[apiQuestions[currentQuestion]?.id] && !isSubmitting
                    ? { scale: 1.05 }
                    : {}
                }
                whileTap={
                  answers[apiQuestions[currentQuestion]?.id] && !isSubmitting
                    ? { scale: 0.95 }
                    : {}
                }
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Submitting...
                  </>
                ) : currentQuestion === apiQuestions.length - 1 ? (
                  'Finish Quiz'
                ) : (
                  'Continue'
                )}
                {!isSubmitting && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14"></path>
                    <path d="M12 5l7 7-7 7"></path>
                  </svg>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}

        {stage === 'result' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-7xl w-full mx-auto my-6 sm:my-14 px-3 sm:px-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="bg-white border border-gray-100 mt-3 sm:mt-6 rounded-xl sm:rounded-3xl shadow-xl overflow-hidden"
            >
              {/* Enhanced Header Section with Background Pattern - More Mobile Friendly */}
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-700 py-8 sm:py-12 px-4 sm:px-8 text-center text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <svg
                    width="100%"
                    height="100%"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <pattern
                        id="smallGrid"
                        width="20"
                        height="20"
                        patternUnits="userSpaceOnUse"
                      >
                        <path
                          d="M 20 0 L 0 0 0 20"
                          fill="none"
                          stroke="white"
                          strokeWidth="0.5"
                        />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#smallGrid)" />
                  </svg>
                  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.3),transparent)]"></div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="relative z-10"
                >
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">
                    Your Personalized Skin Analysis
                  </h2>
                  <div className="flex justify-center items-center gap-2 mb-2 sm:mb-4">
                    <span className="h-1 w-8 sm:w-12 bg-emerald-200 rounded-full"></span>
                    <span className="h-1 w-16 sm:w-24 bg-white rounded-full"></span>
                    <span className="h-1 w-8 sm:w-12 bg-emerald-200 rounded-full"></span>
                  </div>
                  <p className="text-emerald-100 max-w-2xl mx-auto text-sm sm:text-base px-2">
                    Based on your responses, we've created a customized profile
                    to help you understand your skin better and build the
                    perfect routine.
                  </p>
                </motion.div>
              </div>

              {/* Content Section with Enhanced Cards - Mobile Optimized */}
              <div className="p-4 sm:p-6 md:p-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                  {/* Left Column: Skin Type & Concerns */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="space-y-6 md:space-y-10"
                  >
                    {/* Enhanced Skin Type Card - Better Mobile Padding */}
                    <div className="bg-emerald-50 rounded-xl sm:rounded-2xl p-5 sm:p-8 border border-emerald-100 shadow-sm">
                      <div className="flex items-center mb-4 sm:mb-6">
                        <div className="bg-emerald-200 p-2 sm:p-3 rounded-full mr-3 sm:mr-4">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-emerald-600"
                          >
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                            Your Skin Type
                          </h3>
                          <p className="text-gray-500 text-xs sm:text-sm">
                            The foundation of your skincare routine
                          </p>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-emerald-100">
                        <div className="flex flex-wrap items-center mb-3 sm:mb-4 gap-2">
                          <span className="text-2xl sm:text-3xl font-bold text-emerald-600">
                            {apiResultData?.SkinType?.TypeName ||
                              answers[1] ||
                              'Normal Skin'}
                          </span>
                          <span className="bg-emerald-600 text-white text-xs py-1 px-2 sm:px-3 rounded-full">
                            Primary Type
                          </span>
                        </div>

                        <p className="text-gray-600 mt-3 sm:mt-4 text-xs sm:text-sm">
                          {apiResultData?.SkinType?.Description ||
                            `Your skin is classified as ${apiResultData?.SkinType?.TypeName || answers[1] || 'Normal'}. 
                    This means your skincare routine should focus on products that
                    address the specific needs of this skin type.`}
                        </p>

                        {apiResultData && (
                          <div className="mt-4 sm:mt-5 p-3 sm:p-4 bg-emerald-50/50 rounded-lg border border-emerald-100">
                            <p className="text-xs text-emerald-700 font-medium">
                              <span className="flex items-center gap-2 mb-1">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <span>Analysis Overview</span>
                              </span>
                              Based on your {apiResultData.TotalQuestions}{' '}
                              answers, your skin score is{' '}
                              <span className="font-bold">
                                {apiResultData.TotalScore}
                              </span>
                              .
                              <span className="block mt-1">
                                This analysis helps us create a customized
                                routine for your{' '}
                                {apiResultData.SkinType?.TypeName || 'unique'}{' '}
                                type.
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Primary Concerns Card - Mobile Optimized */}
                    <div className="bg-red-50 rounded-xl sm:rounded-2xl p-5 sm:p-8 border border-red-100 shadow-sm">
                      <div className="flex items-center mb-4 sm:mb-6">
                        <div className="bg-red-100 p-2 sm:p-3 rounded-full mr-3 sm:mr-4">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-red-600"
                          >
                            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                            Primary Concerns
                          </h3>
                          <p className="text-gray-500 text-xs sm:text-sm">
                            Key issues to address in your routine
                          </p>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-red-100">
                        <div className="flex items-center">
                          <span className="text-xl sm:text-2xl font-bold text-red-500">
                            {(() => {
                              // Get skin type and determine primary concern
                              const skinType =
                                apiResultData?.SkinType?.TypeName ||
                                'Normal Skin';
                              if (skinType.toLowerCase().includes('dry'))
                                return 'Dryness & Dehydration';
                              if (skinType.toLowerCase().includes('sensitive'))
                                return 'Sensitivity & Irritation';
                              if (skinType.toLowerCase().includes('oily'))
                                return 'Excess Oil & Breakouts';
                              if (
                                skinType.toLowerCase().includes('combination')
                              )
                                return 'Balancing Different Zones';
                              return 'Maintenance & Prevention';
                            })()}
                          </span>
                        </div>

                        {/* Concern Progress Bars - Better Spacing for Mobile */}
                        <div className="mt-4 sm:mt-5 space-y-2 sm:space-y-3">
                          {(() => {
                            // Get primary concerns based on skin type
                            const skinType =
                              apiResultData?.SkinType?.TypeName ||
                              'Normal Skin';
                            const concerns = [];

                            if (skinType.toLowerCase().includes('dry')) {
                              concerns.push({ name: 'Dryness', level: 80 });
                              concerns.push({ name: 'Fine Lines', level: 65 });
                              concerns.push({ name: 'Flakiness', level: 70 });
                            } else if (
                              skinType.toLowerCase().includes('sensitive')
                            ) {
                              concerns.push({ name: 'Irritation', level: 75 });
                              concerns.push({ name: 'Redness', level: 70 });
                              concerns.push({
                                name: 'Reaction to Products',
                                level: 80,
                              });
                            } else if (
                              skinType.toLowerCase().includes('oily')
                            ) {
                              concerns.push({ name: 'Excess Oil', level: 85 });
                              concerns.push({ name: 'Acne', level: 70 });
                              concerns.push({ name: 'Large Pores', level: 75 });
                            } else if (
                              skinType.toLowerCase().includes('combination')
                            ) {
                              concerns.push({
                                name: 'T-Zone Oiliness',
                                level: 75,
                              });
                              concerns.push({ name: 'Dry Cheeks', level: 65 });
                              concerns.push({
                                name: 'Uneven Texture',
                                level: 60,
                              });
                            } else {
                              concerns.push({
                                name: 'Environmental Protection',
                                level: 60,
                              });
                              concerns.push({
                                name: 'Aging Prevention',
                                level: 65,
                              });
                              concerns.push({ name: 'Maintenance', level: 70 });
                            }

                            return concerns.map((concern, index) => (
                              <div key={`concern-${index}`}>
                                <div className="flex justify-between mb-1">
                                  <span className="text-xs font-medium text-gray-700">
                                    {concern.name}
                                  </span>
                                  <span className="text-xs font-medium text-gray-500">
                                    {concern.level}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                                  <motion.div
                                    className="h-full rounded-full bg-gradient-to-r from-red-400 to-red-600"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${concern.level}%` }}
                                    transition={{
                                      delay: 0.5 + index * 0.2,
                                      duration: 0.8,
                                    }}
                                  ></motion.div>
                                </div>
                              </div>
                            ));
                          })()}
                        </div>

                        <p className="text-gray-600 mt-4 sm:mt-5 text-xs sm:text-sm">
                          {(() => {
                            const skinType =
                              apiResultData?.SkinType?.TypeName ||
                              'Normal Skin';
                            if (skinType.toLowerCase().includes('dry'))
                              return 'Your dry skin needs products that restore moisture and strengthen your skin barrier. Focus on rich moisturizers, gentle cleansing, and ingredients like hyaluronic acid and ceramides.';
                            if (skinType.toLowerCase().includes('sensitive'))
                              return 'Your sensitive skin requires gentle, soothing products that minimize irritation. Look for fragrance-free formulas with calming ingredients like aloe, oat extract, and avoid potential irritants.';
                            if (skinType.toLowerCase().includes('oily'))
                              return 'Your oily skin needs oil control without over-drying. Focus on non-comedogenic products, gentle exfoliation, and lightweight hydration to maintain balance without clogging pores.';
                            if (skinType.toLowerCase().includes('combination'))
                              return 'Your combination skin needs a balanced approach - controlling oil in the T-zone while providing hydration to drier areas. Multi-masking and targeted treatments will help address different zones.';
                            return "Your balanced skin is in good condition! Focus on maintenance with consistent cleansing, hydration, and protection to preserve your skin's natural balance and prevent future concerns.";
                          })()}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Right Column: Skin Characteristics & Routine Blueprint - Mobile Friendly */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="mb-1"
                  >
                    <div className="space-y-6 md:space-y-10">
                      {/* Skin Characteristics Card - Optimized for Mobile */}
                      <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-5 sm:p-8 border border-gray-100 shadow-sm">
                        <div className="flex items-center mb-4 sm:mb-6">
                          <div className="bg-gray-200 p-2 sm:p-3 rounded-full mr-3 sm:mr-4">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-gray-700"
                            >
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                              <line x1="16" y1="13" x2="8" y2="13"></line>
                              <line x1="16" y1="17" x2="8" y2="17"></line>
                              <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                              Skin Characteristics
                            </h3>
                            <p className="text-gray-500 text-xs sm:text-sm">
                              Understanding your skin's unique traits
                            </p>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
                          <h4 className="font-semibold text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 pb-2 border-b flex items-center">
                            <svg
                              className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                              ></path>
                            </svg>
                            Key Traits & Recommendations
                          </h4>
                          <ul className="space-y-2 sm:space-y-4">
                            {/* Skin Type Characteristics - Mobile Touch Friendly */}
                            {(() => {
                              const skinType =
                                apiResultData?.SkinType?.TypeName ||
                                (apiQuestions.length > 0
                                  ? answers[apiQuestions[0]?.id]
                                  : null) ||
                                'Normal Skin';

                              const skinTypeTraits =
                                skinCharacteristicsMapping[skinType] ||
                                skinCharacteristicsMapping['Normal Skin'];

                              return skinTypeTraits.map((char, index) => (
                                <motion.li
                                  key={`skin-${index}`}
                                  className="flex items-start gap-2 sm:gap-3 p-1.5 sm:p-2 hover:bg-gray-50 rounded-lg transition-colors"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.6 + index * 0.1 }}
                                >
                                  <span className="text-base sm:text-lg mt-0.5">
                                    {char.positive ? (
                                      <span className="text-emerald-500">
                                        ✓
                                      </span>
                                    ) : (
                                      <span className="text-amber-500">⚠️</span>
                                    )}
                                  </span>
                                  <span className="text-xs sm:text-sm text-gray-700">
                                    {char.text}
                                  </span>
                                </motion.li>
                              ));
                            })()}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Dermatologist Verification Card - Mobile Optimized */}
                    <div className="bg-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-blue-100 mt-4 shadow-sm">
                      <div className="flex items-center mb-4 sm:mb-6">
                        <div className="bg-blue-200 p-2 rounded-full mr-3 sm:mr-4">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-blue-700"
                          >
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"></path>
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold text-blue-800">
                            Verified by Dermatologists
                          </h3>
                          <p className="text-blue-500 text-xs sm:text-sm">
                            Our program is reviewed by certified experts
                          </p>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 mt-1 shadow-sm border border-blue-200">
                        <h4 className="font-semibold text-xs sm:text-sm text-blue-700 mb-3 sm:mb-4 pb-1 sm:pb-2 border-b flex items-center">
                          <svg
                            className="w-3.5 h-3.5 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 text-blue-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                            ></path>
                          </svg>
                          Testimonials from Experts
                        </h4>
                        <p className="text-blue-700 text-xs sm:text-sm">
                          <strong>Dr. Jane Doe, MD</strong>
                          <br />
                          <em>
                            "This program provides skin care advice in line with
                            current dermatological standards."
                          </em>
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Next Steps - Better Mobile Button Size */}
                <motion.div
                  className="mt-8 sm:mt-12 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                >
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-4">
                    Ready to see your personalized routine?
                  </h3>
                  <p className="text-gray-600 mb-5 sm:mb-8 max-w-2xl mx-auto text-xs sm:text-sm px-2">
                    We've created a custom skincare routine based on your unique
                    skin profile. Discover the perfect products and steps to
                    achieve your best skin!
                  </p>
                  <motion.button
                    className="py-3 sm:py-4 px-6 sm:px-8 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-full shadow-lg hover:shadow-emerald-500/20 hover:from-emerald-600 hover:to-emerald-700 transition-all text-sm sm:text-base"
                    onClick={() => navigate('/skinroutine')}
                    whileHover={{
                      scale: 1.05,
                      boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)',
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="flex items-center gap-2">
                      View My Personalized Routine
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14"></path>
                        <path d="M12 5l7 7-7 7"></path>
                      </svg>
                    </span>
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default SkinQuizPage;
