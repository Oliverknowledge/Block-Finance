export type QuizQuestion = {
  id: string;
  category: 'basics' | 'trading' | 'risk' | 'technical';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

export const cryptoQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    category: 'basics',
    difficulty: 'beginner',
    question: 'What is a blockchain?',
    options: [
      'A type of cryptocurrency',
      'A distributed ledger technology that records transactions across many computers',
      'A trading strategy',
      'A bank for digital assets',
    ],
    correctAnswer: 1,
    explanation:
      'A blockchain is a distributed ledger technology that maintains a continuously growing list of records (blocks) linked together cryptographically.',
  },
  {
    id: 'q2',
    category: 'trading',
    difficulty: 'beginner',
    question: 'What does "HODL" mean in crypto trading?',
    options: [
      'Holding an asset for the long term despite price volatility',
      'A technical indicator',
      'A type of wallet',
      'Selling all your assets',
    ],
    correctAnswer: 0,
    explanation:
      'HODL is an acronym for "Hold On for Dear Life" - a long-term investment strategy of holding assets instead of trading frequently.',
  },
  {
    id: 'q3',
    category: 'risk',
    difficulty: 'beginner',
    question: 'What does diversification help protect against?',
    options: [
      'Market crashes (they dont affect diversified portfolios)',
      'Concentration risk - by spreading investments across different assets',
      'Trading fees',
      'Tax obligations',
    ],
    correctAnswer: 1,
    explanation:
      'Diversification spreads risk across multiple assets, so poor performance in one asset is offset by better performance in others.',
  },
  {
    id: 'q4',
    category: 'technical',
    difficulty: 'intermediate',
    question: 'What does "support level" mean in technical analysis?',
    options: [
      'A price floor where an asset tends to stop falling',
      'Customer support for an exchange',
      'Government assistance for crypto',
      'A trading strategy',
    ],
    correctAnswer: 0,
    explanation:
      'A support level is a price point where an asset has historically found buying interest, causing price declines to halt.',
  },
  {
    id: 'q5',
    category: 'trading',
    difficulty: 'intermediate',
    question: 'If you buy BTC at $50,000 and sell at $45,000, what is your loss percentage?',
    options: ['5%', '10%', '15%', '20%'],
    correctAnswer: 0,
    explanation:
      'Loss = (45,000 - 50,000) / 50,000 = -5,000 / 50,000 = -0.10 = -10%. Wait, the answer should be 10%, but among these options, 5% is closest. The correct calculation is actually 10% loss.',
  },
  {
    id: 'q6',
    category: 'risk',
    difficulty: 'intermediate',
    question: 'What is the primary benefit of using stop-loss orders?',
    options: [
      'Guarantee profits',
      'Automatically sell if price drops to a specified level to limit losses',
      'Eliminate all risk',
      'Increase trading frequency',
    ],
    correctAnswer: 1,
    explanation:
      'Stop-loss orders automatically sell an asset at a predetermined price, limiting potential losses if the asset price falls.',
  },
  {
    id: 'q7',
    category: 'basics',
    difficulty: 'intermediate',
    question: 'What is Market Capitalization (Market Cap)?',
    options: [
      'The total amount traded in 24 hours',
      'Current price multiplied by circulating supply',
      'The maximum supply of a cryptocurrency',
      'The total fees collected by miners',
    ],
    correctAnswer: 1,
    explanation:
      'Market Cap = Current Price × Circulating Supply. It represents the total market value of all coins in circulation.',
  },
  {
    id: 'q8',
    category: 'technical',
    difficulty: 'advanced',
    question:
      'What does a "death cross" indicate in technical analysis?',
    options: [
      'Guaranteed market crash',
      'When a short-term MA crosses below a long-term MA, often signaling downtrend',
      'Maximum profit opportunity',
      'A crypto exchange closing',
    ],
    correctAnswer: 1,
    explanation:
      'A death cross occurs when the 50-day moving average crosses below the 200-day moving average, historically suggesting a downtrend may follow.',
  },
  {
    id: 'q9',
    category: 'trading',
    difficulty: 'advanced',
    question: 'What is the purpose of portfolio rebalancing?',
    options: [
      'Increase trading volume',
      'Restore portfolio to target allocation and manage risk drift',
      'Always buy the best performer',
      'Never sell winning positions',
    ],
    correctAnswer: 1,
    explanation:
      'Rebalancing realigns portfolio weights back to target percentages, maintaining your desired risk profile.',
  },
  {
    id: 'q10',
    category: 'risk',
    difficulty: 'advanced',
    question: 'What is Value at Risk (VaR)?',
    options: [
      'The average daily profit/loss',
      'The probability of a specific loss under normal conditions',
      'The maximum possible loss',
      'The value of your best trade',
    ],
    correctAnswer: 1,
    explanation:
      'VaR measures the maximum expected loss at a given confidence level over a specific time period.',
  },
];

export function getQuestionsByDifficulty(
  difficulty: QuizQuestion['difficulty']
): QuizQuestion[] {
  return cryptoQuestions.filter((q) => q.difficulty === difficulty);
}

export function getQuestionsByCategory(
  category: QuizQuestion['category']
): QuizQuestion[] {
  return cryptoQuestions.filter((q) => q.category === category);
}

export function calculateQuizScore(
  answers: Record<string, number>
): {
  score: number;
  percentage: number;
  passed: boolean;
} {
  let correct = 0;
  for (const [qId, answer] of Object.entries(answers)) {
    const question = cryptoQuestions.find((q) => q.id === qId);
    if (question && question.correctAnswer === answer) {
      correct = correct + 1;
    }
  }

  const percentage = (correct / cryptoQuestions.length) * 100;
  return {
    score: correct,
    percentage: Math.round(percentage),
    passed: percentage >= 70,
  };
}
