import React from 'react';
import { motion, Reorder } from 'framer-motion';
import { TaskCard } from './TaskCard';
import type { Task } from '../../types/task';

interface DraggableTaskCardProps {
  task: Task;
  onComplete?: (taskId: string) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onStatusChange?: (taskId: string, status: Task['status']) => void;
  showActions?: boolean;
}

export const DraggableTaskCard: React.FC<DraggableTaskCardProps> = ({
  task,
  onComplete,
  onEdit,
  onDelete,
  onStatusChange,
  showActions = true,
}) => {
  return (
    <Reorder.Item
      value={task}
      id={task._id}
      className="cursor-grab active:cursor-grabbing"
      whileDrag={{
        scale: 1.05,
        rotate: 2,
        zIndex: 999,
        boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
      }}
      dragListener={true}
      dragControls={undefined}
    >
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
      >
        <TaskCard
          task={task}
          onComplete={onComplete}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
          showActions={showActions}
        />
      </motion.div>
    </Reorder.Item>
  );
};
