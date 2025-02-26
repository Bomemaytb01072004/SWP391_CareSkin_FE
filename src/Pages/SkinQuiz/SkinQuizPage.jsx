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
      <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4 mt-10">
        {stage === 'start' && (
          <div
            className="relative w-full h-screen flex items-center justify-center text-white bg-cover bg-center"
            style={{
              backgroundImage: "url('/src/assets/SkinQuiz/skincare.jpg')",
            }}
          >
            {/* Dark Overlay for Better Readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/20"></div>

            {/* Content Section */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center py-16 px-6 mt-2 w-full max-w-7xl mx-auto">
              <motion.h2
                className="font-bold leading-tight text-lg md:text-3xl lg:text-4xl max-w-[600px] w-full"
                style={{
                  textShadow: '0.05rem 0.05rem 0.1rem rgba(0, 0, 0, 0.2)',
                  fontFamily: 'Pacifico, cursive',
                  color: 'rgba(255, 255, 255, 0.9)',
                }}
                initial={{ opacity: 0, y: 30, letterSpacing: '0.05em' }}
                animate={{ opacity: 1, y: 0, letterSpacing: '0.1em' }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              >
                Know Your Skin
              </motion.h2>

              <motion.h1
                className="font-extrabold leading-tight mb-2 text-4xl md:text-6xl lg:text-7xl max-w-[700px] w-full"
                style={{
                  textShadow: '0.1rem 0.1rem 0.2rem rgba(0, 0, 0, 0.3)',
                  color: '#FFD700' /* Bright Yellow for Attention */,
                  fontFamily: 'Pacifico, cursive',
                  wordBreak: 'break-word',
                }}
              >
                {'Love Your Glow'.split('').map((char, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.05 }} // Delays each letter slightly
                  >
                    {char}
                  </motion.span>
                ))}
              </motion.h1>

              <motion.p
                className=" text-xs md:text-base lg:text-lg text-gray-300 mb-6 max-w-[500px] w-full leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                Get Ready to Glow – The Perfect Routine is Waiting !
              </motion.p>

              <motion.div
                className="flex flex-col md:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <button
                  className="px-4 py-2 text-xs md:px-6 md:py-3 md:text-base lg:text-lg bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition-transform transform hover:scale-105"
                  onClick={() => setStage('quiz')}
                >
                  Start Quiz
                </button>
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
            className="max-w-4xl w-full bg-white p-6 sm:p-8 md:p-10 shadow-lg rounded-lg border border-gray-200 transition-all mt-16 mb-2"
          >
            <div className="mb-4 md:mb-6">
              <p className="text-xs sm:text-sm text-gray-500">
                Step {currentQuestion + 1} of {questions.length}
              </p>
              <div className="w-full h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
                <motion.div
                  className="h-full bg-emerald-500"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                  }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                ></motion.div>
              </div>
            </div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-lg sm:text-xl md:text-2xl font-bold text-black mb-2"
            >
              {questions[currentQuestion].text}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-xs sm:text-sm md:text-base text-gray-500 mb-4 md:mb-6"
            >
              {questions[currentQuestion].description}
            </motion.p>

            {/* Options */}
            <motion.div
              className="grid grid-cols-1 gap-3 sm:gap-4"
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
              {questions[currentQuestion].options.map((option) => (
                <motion.button
                  key={option}
                  className={`w-full py-3 px-4 sm:py-4 sm:px-6 border border-gray-300 rounded-lg text-left transition text-xs sm:text-sm md:text-base ${
                    answers[questions[currentQuestion].id] === option
                      ? 'border-emerald-600 bg-emerald-50'
                      : 'hover:border-emerald-600'
                  }`}
                  onClick={() => handleAnswer(option)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {option}
                </motion.button>
              ))}
            </motion.div>

            {/* Next Button */}
            <motion.button
              className="mt-4 md:mt-6 py-2 px-4 sm:py-3 sm:px-6 bg-emerald-600 text-white font-bold rounded-full shadow-md hover:bg-emerald-700 transition disabled:opacity-50 text-xs sm:text-sm md:text-base"
              onClick={nextQuestion}
              disabled={!answers[questions[currentQuestion].id]}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Next
            </motion.button>
          </motion.div>
        )}

        {stage === 'result' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="max-w-7xl bg-white p-10 shadow-lg rounded-xl text-left mx-auto mt-16 mb-2"
          >
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold text-gray-900 text-center"
            >
              Your Personalized Skin Analysis
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-gray-500 text-sm mt-2 text-center"
            >
              Based on your quiz answers, we've analyzed your skin profile.
            </motion.p>
            <motion.div
              className="p-8 rounded-lg mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6 w-full">
                  <div>
                    <h3 className="text-gray-700 font-semibold mb-2">
                      Your Skin Type
                    </h3>
                    <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-700 rounded-lg w-full">
                      {answers[1]}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-gray-700 font-semibold mb-2">
                      Primary Concerns
                    </h3>
                    <div className="space-y-3 w-full">
                      {answers[2] && (
                        <div className="px-4 py-3 bg-red-50 text-red-700 rounded-lg w-full">
                          {answers[2]}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="w-full">
                  <h3 className="text-gray-700 font-semibold mb-2">
                    Skin Characteristics
                  </h3>
                  <motion.ul
                    className="space-y-4 text-gray-600 text-sm bg-white p-6 rounded-lg shadow-md w-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    {skinCharacteristicsMapping[answers[1]]?.map(
                      (char, index) => (
                        <motion.li
                          key={index}
                          className="flex items-center gap-2"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          {char.positive ? '✅' : '⚠️'} {char.text}
                        </motion.li>
                      )
                    )}
                    {answers[2] &&
                      skinCharacteristicsMapping.Concerns[answers[2]]?.map(
                        (char, index) => (
                          <motion.li
                            key={index}
                            className="flex items-center gap-2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            {char.positive ? '✅' : '⚠️'} {char.text}
                          </motion.li>
                        )
                      )}
                  </motion.ul>
                </div>
              </div>
            </motion.div>
            <div className="flex justify-center mt-8">
              <motion.button
                className="mt-10 py-3 px-6 bg-emerald-700 text-white font-bold rounded-full shadow-md hover:bg-emerald-800 transition item"
                onClick={submitQuiz}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View My Routine →
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default SkinQuizPage;
