import React from 'react';
import { motion } from 'framer-motion';

interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
}

interface TaskStatsGridProps {
  taskStats: TaskStats;
}

export const TaskStatsGrid: React.FC<TaskStatsGridProps> = ({ taskStats }) => {
  const stats = [
    { label: 'Total Tasks', value: taskStats.total, color: 'from-blue-500 to-cyan-600', icon: '📋' },
    { label: 'Completed', value: taskStats.completed, color: 'from-green-500 to-emerald-600', icon: '✅' },
    { label: 'Pending', value: taskStats.pending, color: 'from-yellow-500 to-amber-600', icon: '⏳' },
    { label: 'Overdue', value: taskStats.overdue, color: 'from-red-500 to-rose-600', icon: '⚠️' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
          whileHover={{ scale: 1.02, y: -2 }}
          className="relative overflow-hidden bg-slate-800/40 backdrop-blur-xl rounded-2xl p-6 text-center shadow-lg border border-white/10 transition-transform duration-200"
        >
          <div className="relative z-10">
            <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg`}>
              <span className="text-xl">{stat.icon}</span>
            </div>
            <div className="text-3xl font-black text-white mb-1">
              {stat.value}
            </div>
            <div className="text-sm font-medium text-slate-300">
              {stat.label}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
