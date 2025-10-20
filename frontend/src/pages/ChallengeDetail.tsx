import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Users, Trophy, Target } from 'lucide-react';
import { useChallenge } from '../hooks/useChallenges';
import { CHALLENGE_DIFFICULTIES } from '../types/challenge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import LiveChallengeProgress from '../components/challenges/LiveChallengeProgress';

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const ChallengeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: challenge, isLoading, error } = useChallenge(id!);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !challenge) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Challenge Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The challenge you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate('/challenges')}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
          >
            Back to Challenges
          </button>
        </div>
      </div>
    );
  }

  const difficulty = CHALLENGE_DIFFICULTIES.find(d => d.value === challenge.difficulty);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/challenges')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Challenges
        </button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {challenge.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {challenge.description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${difficulty?.bgColor} ${difficulty?.color}`}>
              {difficulty?.label}
            </span>
          </div>
        </div>
      </div>

      {/* Challenge Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="text-blue-500" size={24} />
            <h3 className="font-semibold text-gray-900 dark:text-white">Duration</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3 mb-2">
            <Users className="text-green-500" size={24} />
            <h3 className="font-semibold text-gray-900 dark:text-white">Participants</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {challenge.participants.length} {challenge.maxParticipants ? `/ ${challenge.maxParticipants}` : ''} joined
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="text-yellow-500" size={24} />
            <h3 className="font-semibold text-gray-900 dark:text-white">Rewards</h3>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {typeof challenge.rewards === 'object' && 'xp' in challenge.rewards ? (
              <div className="flex gap-4">
                <span>{challenge.rewards.xp} XP</span>
                <span>{challenge.rewards.coins} Coins</span>
              </div>
            ) : (
              <span>Various rewards</span>
            )}
          </div>
        </motion.div>
      </div>

      {/* Live Challenge Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <LiveChallengeProgress 
          challengeId={challenge._id}
          initialProgress={0}
          participants={challenge.participants.length}
        />
      </motion.div>

      {/* Requirements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <Target className="text-purple-500" size={24} />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Requirements</h3>
        </div>
        <div className="space-y-4">
          {challenge.requirements.map((req, index) => (
            <div key={req.id || index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">{req.description}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {req.type.replace('_', ' ')} • Target: {req.target} {req.unit}
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {req.current || 0} / {req.target}
                </div>
                <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-1">
                  <div
                    className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(((req.current || 0) / req.target) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Participants List */}
      {challenge.participants.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3 mb-4">
            <Users className="text-blue-500" size={24} />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Participants</h3>
          </div>
          <div className="space-y-3">
            {challenge.participants.map((participant, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                    {typeof participant.userId === 'string' 
                      ? participant.userId.charAt(0).toUpperCase()
                      : (participant.userId as any).name?.charAt(0).toUpperCase() || 'U'
                    }
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {typeof participant.userId === 'string' 
                        ? `User ${participant.userId.slice(-4)}`
                        : (participant.userId as any).name || 'Unknown User'
                      }
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Joined {formatDate(participant.joinedAt)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {(participant as any).overallProgress || 0}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Rank #{(participant as any).rank || index + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ChallengeDetail;
