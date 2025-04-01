import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import Header from '../../components/common/Header';
import StatCard from '../../components/common/StatCard';
import { ToastContainer } from 'react-toastify';

import { CheckCircle2, XCircle, HelpCircle, BarChart } from "lucide-react";

import QuizzesTable from "../../components/quizzes/QuizzesTable";
import { fetchQuizzes } from "../../utils/apiQ_A";
import { fetchQuizById } from "../../utils/apiQ_A";


const QuizzesPage = () => {
  const [filterStatus, setFilterStatus] = useState("all");

  const {
    data: quizzes,
    isLoading: quizzesLoading,
    error: quizzesError,
    refetch: refetchQuizzes
  } = useQuery({
    queryKey: ["quizzes"],
    queryFn: fetchQuizzes,
  });
  
  if (quizzesLoading ) return <div>Loading...</div>;
  if (quizzesError ) return <div>Error fetching data</div>;

  // Filter quizzes based on status
  const filteredQuizzes = filterStatus === "all"
    ? quizzes
    : quizzes.filter(quiz =>
      filterStatus === "active" ? quiz.IsActive : !quiz.IsActive
    );

  // Calculate stats for the cards
  const totalQuizzes = quizzes.length;
  const activeQuizzes = quizzes.filter(quiz => quiz.IsActive).length;
  const inactiveQuizzes = totalQuizzes - activeQuizzes;

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      <div className='flex-1 overflow-auto relative bg-white text-black'>
        <Header title='Quizzes' />

        <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
          {/* STATS */}
          <motion.div
            className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <StatCard name='Total Quizzes' icon={HelpCircle} value={totalQuizzes} color='#8B5CF6' />
            <StatCard name='Active' icon={CheckCircle2} value={activeQuizzes} color='#10B981' />
            <StatCard name='Inactive' icon={XCircle} value={inactiveQuizzes} color='#F59E0B' />
            <StatCard name='Completion Rate' icon={BarChart} value={activeQuizzes > 0 ? `${Math.round((activeQuizzes / totalQuizzes) * 100)}%` : '0%'} color='#3B82F6' />
          </motion.div>

          {/* Filter Controls */}
          <div className="flex space-x-4 mb-6">
            <button
              className={`px-4 py-2 rounded-lg transition-colors ${filterStatus === "all"
                  ? "bg-purple-300 text-black"
                  : "bg-gray-300 text-black hover:bg-gray-100"
                }`}
              onClick={() => setFilterStatus("all")}
            >
              All Quizzes
            </button>
            <button
              className={`px-4 py-2 rounded-lg transition-colors ${filterStatus === "active"
                  ? "bg-green-600 text-white"
                  : "bg-gray-300 text-black hover:bg-gray-100"
                }`}
              onClick={() => setFilterStatus("active")}
            >
              Active
            </button>
            <button
              className={`px-4 py-2 rounded-lg transition-colors ${filterStatus === "inactive"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-300 text-black hover:bg-gray-100"
                }`}
              onClick={() => setFilterStatus("inactive")}
            >
              Inactive
            </button>
          </div>

          <div className="bg-white shadow-lg rounded-xl p-2 border border-gray-300">
            <QuizzesTable quizzes={filteredQuizzes} quizById={fetchQuizById} refetchQuizzes={refetchQuizzes} />
          </div>
        </main>
      </div>
    </>
  );
};

export default QuizzesPage;
