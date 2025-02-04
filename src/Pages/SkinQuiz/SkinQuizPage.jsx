import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Layout/Navbar';
import Footer from '../../components/Layout/Footer';
import SloganCarousel from '../../components/SkinQuiz/Carousel/SloganCarousel';

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
      <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4 mt-10 ">
        {stage === 'start' && (
          <div className="flex flex-col md:flex-row items-center text-center my-auto md:text-left py-16 px-6 md:px-10 bg-white w-full max-w-7xl mx-auto">
            {/* Left Side: Text Content */}
            <div className="md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
              <h1
                className="font-bold leading-tight mb-4 text-3xl md:text-5xl lg:text-6xl"
                style={{
                  textShadow: '0.13rem 0.13rem 0.3rem rgba(0, 0, 0, 0.25)',
                  color: 'rgba(0, 0, 0, 1)',
                }}
              >
                Discover Your Perfect Skincare Routine
              </h1>
              <p className="text-base md:text-lg text-gray-600 mb-6">
                Take our personalized skin quiz and get a customized skincare
                routine that works for your unique needs.
              </p>
              <div className="flex flex-col md:flex-row gap-4">
                <button
                  className="px-6 py-3 bg-emerald-600 text-white rounded-full shadow-md hover:bg-emerald-700 transition"
                  onClick={() => setStage('quiz')}
                >
                  Start Quiz
                </button>
              </div>
            </div>

            {/* Right Side: Background Image */}
            <div className="w-full md:w-1/2 flex justify-center mt-10 md:mt-0">
              <SloganCarousel />
            </div>
          </div>
        )}

        {stage === 'quiz' && (
          <div className="max-w-4xl w-full bg-white p-6 sm:p-8 md:p-10 shadow-lg rounded-lg border border-gray-200 transition-all mt-16 mb-2 ">
            <div className="mb-4 md:mb-6">
              <p className="text-xs sm:text-sm text-gray-500">
                Step {currentQuestion + 1} of {questions.length}
              </p>
              <div className="w-full h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{
                    width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-black mb-2">
              {questions[currentQuestion].text}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-500 mb-4 md:mb-6">
              {questions[currentQuestion].description}
            </p>

            {/* Options */}
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {questions[currentQuestion].options.map((option) => (
                <button
                  key={option}
                  className={`w-full py-3 px-4 sm:py-4 sm:px-6 border border-gray-300 rounded-lg text-left transition text-xs sm:text-sm md:text-base ${
                    answers[questions[currentQuestion].id] === option
                      ? 'border-emerald-600 bg-emerald-50'
                      : 'hover:border-emerald-600'
                  }`}
                  onClick={() => handleAnswer(option)}
                >
                  {option}
                </button>
              ))}
            </div>

            {/* Next Button */}
            <button
              className="mt-4 md:mt-6 py-2 px-4 sm:py-3 sm:px-6 bg-emerald-600 text-white font-bold rounded-full shadow-md hover:bg-emerald-700 transition disabled:opacity-50 text-xs sm:text-sm md:text-base"
              onClick={nextQuestion}
              disabled={!answers[questions[currentQuestion].id]} // Disabled until an option is selected
            >
              Next
            </button>
          </div>
        )}

        {stage === 'result' && (
          <div className="max-w-7xl bg-white p-10 shadow-lg rounded-xl text-left mx-auto mt-16 mb-2 ">
            <h2 className="text-3xl font-bold text-gray-900 text-center">
              Your Personalized Skin Analysis
            </h2>
            <p className="text-gray-500 text-sm mt-2 text-center">
              Based on your quiz answers, we've analyzed your skin profile.
            </p>
            <div className="p-8 rounded-lg mt-6">
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
                  <ul className="space-y-4 text-gray-600 text-sm bg-white p-6 rounded-lg shadow-md w-full">
                    {skinCharacteristicsMapping[answers[1]]?.map(
                      (char, index) => (
                        <li key={index} className="flex items-center gap-2">
                          {char.positive ? '✅' : '⚠️'} {char.text}
                        </li>
                      )
                    )}
                    {answers[2] &&
                      skinCharacteristicsMapping.Concerns[answers[2]]?.map(
                        (char, index) => (
                          <li key={index} className="flex items-center gap-2">
                            {char.positive ? '✅' : '⚠️'} {char.text}
                          </li>
                        )
                      )}
                  </ul>
                </div>
              </div>
            </div>
            <div className="flex justify-center mt-8">
              <button
                className="mt-10 py-3 px-6 bg-emerald-700 text-white font-bold rounded-full shadow-md hover:bg-emerald-800 transition item"
                onClick={submitQuiz}
              >
                View My Routine →
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default SkinQuizPage;
