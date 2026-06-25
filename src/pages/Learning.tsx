import { useState } from 'react';
import { BookOpen, Brain, BarChart3 } from 'lucide-react';
import CryptoQuiz from '../Components/CryptoQuiz';
import type { QuizQuestion } from '../utils/CryptoQuiz';

const Learning = () => {
  const [activeTab, setActiveTab] = useState<'quiz' | 'guide'>('quiz');
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    QuizQuestion['difficulty'] | 'all'
  >('all');
  const [selectedCategory, setSelectedCategory] = useState<QuizQuestion['category'] | 'all'>(
    'all'
  );

  return (
    <div className="px-6 md:px-10 py-8 pb-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col gap-3">
          <h1 className="text-4xl font-semibold">Learning Center</h1>
          <p className="text-sm md:text-base text-[var(--muted-text-color)] max-w-2xl">
            Master cryptocurrency trading, risk management, and blockchain fundamentals with our
            interactive quizzes and educational content.
          </p>
        </header>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-[var(--border-color)]">
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-4 py-3 border-b-2 transition-colors font-medium ${
              activeTab === 'quiz'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-[var(--muted-text-color)] hover:text-[var(--text-color)]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Brain size={16} />
              Quiz
            </div>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-3 border-b-2 transition-colors font-medium ${
              activeTab === 'guide'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-[var(--muted-text-color)] hover:text-[var(--text-color)]'
            }`}
          >
            <div className="flex items-center gap-2">
              <BookOpen size={18} />
              Guide
            </div>
          </button>
        </div>

        {/* Quiz Tab */}
        {activeTab === 'quiz' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Difficulty Filter */}
              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--muted-surface-color)] p-4">
                <p className="text-sm font-medium mb-3">Difficulty Level</p>
                <div className="space-y-2">
                  {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setSelectedDifficulty(level)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                        selectedDifficulty === level
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'hover:bg-[var(--border-color)]'
                      }`}
                    >
                      {level === 'all' ? 'All Levels' : level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--muted-surface-color)] p-4">
                <p className="text-sm font-medium mb-3">Category</p>
                <div className="space-y-2">
                  {(['all', 'basics', 'trading', 'risk', 'technical'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                        selectedCategory === cat
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'hover:bg-[var(--border-color)]'
                      }`}
                    >
                      {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <CryptoQuiz
              difficulty={selectedDifficulty === 'all' ? undefined : selectedDifficulty}
              category={selectedCategory === 'all' ? undefined : selectedCategory}
            />
          </div>
        )}

        {/* Guide Tab */}
        {activeTab === 'guide' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basics Guide */}
              <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-color)] p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen size={20} className="text-blue-400" />
                  <h3 className="text-lg font-semibold">Blockchain Basics</h3>
                </div>
                <ul className="space-y-3 text-sm text-[var(--muted-text-color)]">
                  <li className="flex gap-2">
                    <span className="text-blue-400">•</span>
                    <span>Blockchain is a distributed ledger that records transactions</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-400">•</span>
                    <span>Cryptocurrencies are digital assets secured by cryptography</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-400">•</span>
                    <span>Smart contracts automate transactions on blockchain networks</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-400">•</span>
                    <span>Mining/staking secures the network and validates transactions</span>
                  </li>
                </ul>
              </div>

              {/* Trading Basics */}
              <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-color)] p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 size={20} className="text-emerald-400" />
                  <h3 className="text-lg font-semibold">Trading Fundamentals</h3>
                </div>
                <ul className="space-y-3 text-sm text-[var(--muted-text-color)]">
                  <li className="flex gap-2">
                    <span className="text-emerald-400">•</span>
                    <span>Market orders execute immediately at current market price</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-400">•</span>
                    <span>Limit orders execute only at your specified price or better</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-400">•</span>
                    <span>Stop-loss orders help protect against large losses</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-400">•</span>
                    <span>Position sizing ensures you dont risk too much on one trade</span>
                  </li>
                </ul>
              </div>

              {/* Risk Management */}
              <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-color)] p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen size={20} className="text-orange-400" />
                  <h3 className="text-lg font-semibold">Risk Management</h3>
                </div>
                <ul className="space-y-3 text-sm text-[var(--muted-text-color)]">
                  <li className="flex gap-2">
                    <span className="text-orange-400">•</span>
                    <span>Diversification spreads risk across multiple assets</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-orange-400">•</span>
                    <span>Never invest more than you can afford to lose</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-orange-400">•</span>
                    <span>Use position sizing rules like 2% risk per trade</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-orange-400">•</span>
                    <span>Rebalance your portfolio regularly to maintain target allocation</span>
                  </li>
                </ul>
              </div>

              {/* Technical Analysis */}
              <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-color)] p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 size={20} className="text-purple-400" />
                  <h3 className="text-lg font-semibold">Technical Analysis</h3>
                </div>
                <ul className="space-y-3 text-sm text-[var(--muted-text-color)]">
                  <li className="flex gap-2">
                    <span className="text-purple-400">•</span>
                    <span>Support levels where price tends to stop falling</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-purple-400">•</span>
                    <span>Resistance levels where price tends to stop rising</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-purple-400">•</span>
                    <span>Moving averages smooth out price trends over time</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-purple-400">•</span>
                    <span>Volume analysis shows if price moves are backed by traders</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Key Metrics Guide */}
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--muted-surface-color)] p-6">
              <h3 className="text-lg font-semibold mb-4">Important Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium mb-1">Market Cap</p>
                  <p className="text-[var(--muted-text-color)]">
                    Current price × circulating supply. Larger cap = more established coin.
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-1">24h Volume</p>
                  <p className="text-[var(--muted-text-color)]">
                    Total amount traded in 24 hours. Higher = better liquidity.
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-1">Volatility</p>
                  <p className="text-[var(--muted-text-color)]">
                    How much price fluctuates. Higher volatility = higher risk and reward.
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-1">P&L (Profit/Loss)</p>
                  <p className="text-[var(--muted-text-color)]">
                    The gain or loss on a position since entry price.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Learning;
