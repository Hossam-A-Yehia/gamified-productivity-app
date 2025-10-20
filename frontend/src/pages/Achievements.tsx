import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Sparkles } from 'lucide-react';
import { AchievementGallery } from '../components/achievements/AchievementGallery';
import { PageTransition } from '../components/ui/PageTransition';
import { EnhancedButton } from '../components/ui/EnhancedButton';

export default function Achievements() {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <EnhancedButton
                variant="secondary"
                size="sm"
                icon={<ArrowLeft className="w-4 h-4" />}
                onClick={() => navigate('/dashboard')}
                className="mb-4"
              >
                Back to Dashboard
              </EnhancedButton>
            </div>

            <div className="text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl mb-6 shadow-lg"
              >
                <Trophy className="w-10 h-10 text-white" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4"
              >
                Achievement Gallery
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
              >
                Track your progress, unlock amazing rewards, and celebrate your productivity milestones
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center space-x-2 mt-4"
              >
                <Sparkles className="w-5 h-5 text-yellow-500" />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Complete tasks and maintain streaks to unlock achievements
                </span>
                <Sparkles className="w-5 h-5 text-yellow-500" />
              </motion.div>
            </div>
          </motion.div>

          {/* Achievement Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <AchievementGallery showStats={true} />
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
