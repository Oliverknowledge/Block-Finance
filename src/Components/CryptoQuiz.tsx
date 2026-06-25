import { useState } from 'react';
import { CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import { cryptoQuestions, calculateQuizScore, type QuizQuestion } from '../utils/CryptoQuiz';
import Button from './Button';

type CryptoQuizProps = {
  difficulty?: QuizQuestion['difficulty'];
  category?: QuizQuestion['category'];
};

const CryptoQuiz = ({ difficulty, category }: CryptoQuizProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  const filteredQuestions = cryptoQuestions.filter((q) => {
    if (difficulty && q.difficulty !== difficulty) return false;
    if (category && q.category !== category) return false;
    return true;
  });

  const question = filteredQuestions[currentQuestion];
  const answered = answers[question?.id];

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = { ...answers };
    newAnswers[question.id] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < filteredQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setQuizStarted(false);
  };

  if (!quizStarted) {
    return (
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-color)] p-8 text-center">
        <h2 className="text-2xl font-semibold mb-3">Crypto Knowledge Quiz</h2>
        <p className="text-[var(--muted-text-color)] mb-6">
          Test your crypto knowledge with {filteredQuestions.length} questions covering trading,
          risk management, and blockchain basics.
        </p>
        <div className="mb-6 inline-flex gap-3">
          {difficulty && (
            <span className="px-3 py-1 text-sm rounded-full bg-blue-500/20 text-blue-400">
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </span>
          )}
          {category && (
            <span className="px-3 py-1 text-sm rounded-full bg-purple-500/20 text-purple-400">
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </span>
          )}
        </div>
        <Button variant="primary" size="lg" onClick={() => setQuizStarted(true)}>
          Start Quiz
        </Button>
      </div>
    );
  }

  if (showResults) {
    const result = calculateQuizScore(answers);
    return (
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-color)] p-8 text-center">
        <div className="mb-6">
          {result.passed ? (
            <CheckCircle2 size={64} className="mx-auto text-emerald-400 mb-4" />
          ) : (
            <XCircle size={64} className="mx-auto text-red-400 mb-4" />
          )}
        </div>

        <h2 className="text-3xl font-semibold mb-2">
          {result.passed ? '🎉 Great Job!' : 'Keep Learning'}
        </h2>
        <p className="text-xl text-[var(--muted-text-color)] mb-6">
          You scored {result.score}/{filteredQuestions.length} ({result.percentage}%)
        </p>

        <div className="mb-6 p-4 rounded-xl bg-[var(--muted-surface-color)]">
          <p className="text-sm text-[var(--muted-text-color)] mb-2">
            {result.passed
              ? 'Excellent understanding of crypto concepts! Continue learning to master advanced strategies.'
              : 'You need to score 70% or higher to pass. Review the material and try again!'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button variant="secondary" size="lg" onClick={handleRestart}>
            Retake Quiz
          </Button>
          <Button variant="primary" size="lg" onClick={() => setQuizStarted(false)}>
            Back to Menu
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-color)] p-6 md:p-8">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-medium">
            Question {currentQuestion + 1} of {filteredQuestions.length}
          </p>
          <p className="text-sm text-[var(--muted-text-color)]">
            {Math.round(((currentQuestion + 1) / filteredQuestions.length) * 100)}%
          </p>
        </div>
        <div className="h-2 rounded-full bg-[var(--muted-surface-color)] overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / filteredQuestions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Category Badge */}
      <div className="flex gap-2 mb-4">
        <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400">
          {question.category.charAt(0).toUpperCase() + question.category.slice(1)}
        </span>
        <span className="px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-400">
          {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
        </span>
      </div>

      {/* Question */}
      <h3 className="text-lg md:text-xl font-semibold mb-6">{question.question}</h3>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {question.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswer(idx)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
              answered === idx
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-[var(--border-color)] hover:border-blue-500/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  answered === idx
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-[var(--border-color)]'
                }`}
              >
                {answered === idx && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <span>{option}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Explanation when answered */}
      {answered !== undefined && (
        <div className="mb-6 p-4 rounded-xl bg-[var(--muted-surface-color)] border border-[var(--border-color)]">
          <p className="text-sm font-medium mb-2">
            {answered === question.correctAnswer ? '✓ Correct!' : '✗ Incorrect'}
          </p>
          <p className="text-sm text-[var(--muted-text-color)]">{question.explanation}</p>
        </div>
      )}

      {/* Next Button */}
      <Button
        variant="primary"
        size="lg"
        onClick={handleNext}
        disabled={answered === undefined}
        className="w-full flex items-center justify-center gap-2"
      >
        {currentQuestion === filteredQuestions.length - 1 ? 'See Results' : 'Next Question'}
        <ChevronRight size={18} />
      </Button>
    </div>
  );
};

export default CryptoQuiz;
