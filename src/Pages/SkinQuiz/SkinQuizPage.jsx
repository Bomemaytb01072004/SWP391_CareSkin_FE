import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Layout/Navbar';
import Footer from '../../components/Layout/Footer';
import { motion } from 'framer-motion';

const SkinQuizPage = () => {
  const navigate = useNavigate();
  const [stage, setStage] = useState('start'); // 'start', 'quiz', 'result'
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    // Check if the quiz has already been completed
    const storedResult = localStorage.getItem('skincareResult');
    if (storedResult) {
      navigate('/skinroutine'); // Redirect to routine page if results exist
    }
  }, [navigate]);

  const questions = [
    {
      id: 1,
      text: "Let's start with your skin type",
      description:
        'The more accurate your answers, the more personalized your recommendations will be.',
      options: ['Normal', 'Dry', 'Oily', 'Combination', 'Sensitive'],
    },
    {
      id: 2,
      text: 'What are your main skin concerns?',
      description:
        'Select the most relevant concerns to tailor your skincare routine.',
      options: ['Acne', 'Wrinkles', 'Redness', 'Hyperpigmentation', 'Dryness'],
    },
  ];

  const skinCharacteristicsMapping = {
    Normal: [
      { text: 'Balanced hydration levels', positive: true },
      { text: 'Few to no breakouts', positive: true },
      { text: 'Tolerant to most products', positive: true },
    ],
    Dry: [
      { text: 'Feels tight, especially after washing', positive: false },
      { text: 'May have flaky or rough patches', positive: false },
      { text: 'Prone to fine lines and irritation', positive: false },
    ],
    Oily: [
      { text: 'Excess shine, especially in the T-zone', positive: false },
      { text: 'Prone to clogged pores and acne', positive: false },
      { text: 'May need frequent cleansing', positive: false },
    ],
    Combination: [
      { text: 'Oily T-zone, dry cheeks', positive: false },
      { text: 'May experience breakouts and dry areas', positive: false },
      { text: 'Needs targeted care for different areas', positive: false },
    ],
    Sensitive: [
      { text: 'Easily irritated by products or weather', positive: false },
      { text: 'May have redness or allergic reactions', positive: false },
      { text: 'Requires gentle, soothing ingredients', positive: false },
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
  const handleAnswer = (answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questions[currentQuestion].id]: answer,
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setStage('result');
    }
  };
  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const submitQuiz = () => {
    const result = {
      skinType: answers[1], // Store selected skin type
      concerns: answers[2] ? [answers[2]] : [], // Store concerns as an array
    };

    localStorage.setItem('skincareResult', JSON.stringify(result)); // Store in localStorage
    navigate('/skinroutine'); // Redirect to Routine Page
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen bg-white  mt-10">
        {stage === 'start' && (
          <div
            className="relative w-full h-screen flex items-center justify-center text-white bg-cover bg-center"
            style={{
              backgroundImage: "url('/src/assets/SkinQuiz/skincare.jpg')",
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
                  className="px-6 py-4 text-xs md:text-base lg:text-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-full shadow-xl hover:shadow-emerald-500/20 hover:from-emerald-600 hover:to-emerald-800 transition-all"
                  onClick={() => setStage('quiz')}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)',
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="flex items-center gap-2">
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
                  </span>
                </motion.button>
              </motion.div>
            </div>
          </div>
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
                  Question {currentQuestion + 1} of {questions.length}
                </p>
                <p className="text-xs sm:text-sm font-medium text-gray-500">
                  {Math.round(((currentQuestion + 1) / questions.length) * 100)}
                  % Complete
                </p>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${((currentQuestion + 1) / questions.length) * 100}%`,
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

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-3"
            >
              {questions[currentQuestion].text}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-sm sm:text-base text-gray-600 mb-8"
            >
              {questions[currentQuestion].description}
            </motion.p>

            {/* Options with improved styling */}
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
              {questions[currentQuestion].options.map((option, index) => (
                <motion.button
                  key={option}
                  className={`w-full py-4 px-6 rounded-xl text-left transition duration-200 flex items-center group ${
                    answers[questions[currentQuestion].id] === option
                      ? 'bg-emerald-50 border-2 border-emerald-500 shadow-md'
                      : 'border-2 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                  }`}
                  onClick={() => handleAnswer(option)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <span
                    className={`w-6 h-6 mr-4 rounded-full flex items-center justify-center text-sm ${
                      answers[questions[currentQuestion].id] === option
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 text-gray-400 group-hover:bg-emerald-100 group-hover:text-emerald-500'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <span
                      className={`font-medium ${
                        answers[questions[currentQuestion].id] === option
                          ? 'text-emerald-700'
                          : 'text-gray-700'
                      }`}
                    >
                      {option}
                    </span>
                  </div>
                </motion.button>
              ))}
            </motion.div>

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
                  answers[questions[currentQuestion].id]
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                onClick={nextQuestion}
                disabled={!answers[questions[currentQuestion].id]}
                whileHover={
                  answers[questions[currentQuestion].id] ? { scale: 1.05 } : {}
                }
                whileTap={
                  answers[questions[currentQuestion].id] ? { scale: 0.95 } : {}
                }
              >
                {currentQuestion === questions.length - 1
                  ? 'Finish'
                  : 'Continue'}
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
            className="max-w-7xl w-full mx-auto my-16 px-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="bg-white border border-gray-100 mt-6 rounded-3xl shadow-xl overflow-hidden"
            >
              {/* Header Section */}
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-700 py-10 px-8 text-center text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.2),transparent)]"></div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <h2 className="text-3xl md:text-4xl font-bold mb-2">
                    Your Personalized Skin Analysis
                  </h2>
                  <p className="text-emerald-100 max-w-2xl mx-auto">
                    Based on your responses, we've created a customized profile
                    to help you understand your skin better.
                  </p>
                </motion.div>
              </div>

              {/* Content Section */}
              <div className="p-6 md:p-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Left Column: Skin Type & Concerns */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="space-y-10"
                  >
                    {/* Skin Type Card */}
                    <div className="bg-emerald-50 rounded-2xl p-8 border border-emerald-100 shadow-sm">
                      <div className="flex items-center mb-6">
                        <div className="bg-emerald-200 p-3 rounded-full mr-4">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
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
                        <h3 className="text-2xl font-bold text-gray-800">
                          Your Skin Type
                        </h3>
                      </div>
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-emerald-100">
                        <div className="flex items-center">
                          <span className="text-2xl font-bold text-emerald-600">
                            {answers[1]}
                          </span>
                          <span className="ml-2 bg-emerald-600 text-white text-xs py-1 px-2 rounded-full">
                            Primary Type
                          </span>
                        </div>
                        <p className="text-gray-600 mt-4 text-sm">
                          Your skin is classified as {answers[1]}. This means
                          your skincare routine should focus on products that
                          address the specific needs of this skin type.
                        </p>
                      </div>
                    </div>

                    {/* Concerns Card */}
                    <div className="bg-red-50 rounded-2xl p-8 border border-red-100 shadow-sm">
                      <div className="flex items-center mb-6">
                        <div className="bg-red-100 p-3 rounded-full mr-4">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
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
                        <h3 className="text-2xl font-bold text-gray-800">
                          Primary Concerns
                        </h3>
                      </div>
                      {answers[2] && (
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-red-100">
                          <div className="flex items-center">
                            <span className="text-2xl font-bold text-red-500">
                              {answers[2]}
                            </span>
                          </div>
                          <p className="text-gray-600 mt-4 text-sm">
                            We'll focus your skincare routine on addressing{' '}
                            {answers[2]} while also supporting your overall skin
                            health.
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Right Column: Skin Characteristics */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                  >
                    <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 shadow-sm h-full">
                      <div className="flex items-center mb-6">
                        <div className="bg-gray-200 p-3 rounded-full mr-4">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
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
                        <h3 className="text-2xl font-bold text-gray-800">
                          Skin Characteristics
                        </h3>
                      </div>

                      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <h4 className="font-semibold text-gray-700 mb-4 pb-2 border-b">
                          Key Traits & Recommendations
                        </h4>
                        <ul className="space-y-4">
                          {skinCharacteristicsMapping[answers[1]]?.map(
                            (char, index) => (
                              <motion.li
                                key={`skin-${index}`}
                                className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 + index * 0.1 }}
                              >
                                <span className="text-lg mt-0.5">
                                  {char.positive ? (
                                    <span className="text-emerald-500">✓</span>
                                  ) : (
                                    <span className="text-amber-500">⚠️</span>
                                  )}
                                </span>
                                <span className="text-gray-700">
                                  {char.text}
                                </span>
                              </motion.li>
                            )
                          )}

                          {answers[2] &&
                            skinCharacteristicsMapping.Concerns[
                              answers[2]
                            ]?.map((char, index) => (
                              <motion.li
                                key={`concern-${index}`}
                                className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.9 + index * 0.1 }}
                              >
                                <span className="text-lg mt-0.5">
                                  {char.positive ? (
                                    <span className="text-emerald-500">✓</span>
                                  ) : (
                                    <span className="text-amber-500">⚠️</span>
                                  )}
                                </span>
                                <span className="text-gray-700">
                                  {char.text}
                                </span>
                              </motion.li>
                            ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Next Steps */}
                <motion.div
                  className="mt-12 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Ready to see your personalized routine?
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                    We've created a custom skincare routine based on your unique
                    skin profile. Discover the perfect products and steps to
                    achieve your best skin!
                  </p>

                  <motion.button
                    className="py-4 px-8 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-full shadow-lg hover:shadow-emerald-500/20 hover:from-emerald-600 hover:to-emerald-700 transition-all"
                    onClick={submitQuiz}
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
