import React from 'react';
import { motion } from 'framer-motion';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import type { Task, CreateTaskRequest, UpdateTaskRequest, TaskFormData } from '../../types/task';
import { TASK_CATEGORIES, TASK_DIFFICULTIES, TASK_PRIORITIES } from '../../types/task';

interface TaskFormProps {
  task?: Task;
  onSubmit: (data: CreateTaskRequest | UpdateTaskRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const taskValidationSchema = Yup.object({
  title: Yup.string()
    .required('Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: Yup.string()
    .max(1000, 'Description must be less than 1000 characters'),
  category: Yup.string()
    .oneOf(['work', 'personal', 'health', 'learning', 'other'])
    .required('Category is required'),
  difficulty: Yup.string()
    .oneOf(['easy', 'medium', 'hard'])
    .required('Difficulty is required'),
  priority: Yup.string()
    .oneOf(['low', 'medium', 'high'])
    .required('Priority is required'),
  deadline: Yup.string(),
  tags: Yup.string(),
  estimatedDuration: Yup.number()
    .min(1, 'Duration must be at least 1 minute')
    .max(1440, 'Duration cannot exceed 24 hours'),
  recurrenceType: Yup.string()
    .oneOf(['none', 'daily', 'weekly', 'monthly'])
    .required(),
  recurrenceInterval: Yup.number()
    .min(1, 'Interval must be at least 1')
    .when('recurrenceType', {
      is: (val: string) => val !== 'none',
      then: (schema) => schema.required('Interval is required for recurring tasks'),
    }),
  recurrenceEndDate: Yup.string()
    .when('recurrenceType', {
      is: (val: string) => val !== 'none',
      then: (schema) => schema.required('End date is required for recurring tasks'),
    }),
});

export const TaskForm: React.FC<TaskFormProps> = ({
  task,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const isEditing = !!task;

  const initialValues: TaskFormData = {
    title: task?.title || '',
    description: task?.description || '',
    category: task?.category || 'other',
    difficulty: task?.difficulty || 'medium',
    priority: task?.priority || 'medium',
    deadline: task?.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : '',
    tags: task?.tags.join(', ') || '',
    estimatedDuration: task?.estimatedDuration || 60,
    recurrenceType: task?.recurrence.type || 'none',
    recurrenceInterval: task?.recurrence.interval || 1,
    recurrenceEndDate: task?.recurrence.endDate 
      ? new Date(task.recurrence.endDate).toISOString().slice(0, 16) 
      : '',
  };

  const handleSubmit = async (values: TaskFormData) => {
    const tags = values.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const taskData: CreateTaskRequest | UpdateTaskRequest = {
      title: values.title,
      description: values.description || undefined,
      category: values.category,
      difficulty: values.difficulty,
      priority: values.priority,
      deadline: values.deadline ? new Date(values.deadline).toISOString() : undefined,
      tags: tags.length > 0 ? tags : undefined,
      estimatedDuration: values.estimatedDuration || undefined,
      recurrence: values.recurrenceType !== 'none' ? {
        type: values.recurrenceType,
        interval: values.recurrenceInterval,
        endDate: values.recurrenceEndDate ? new Date(values.recurrenceEndDate).toISOString() : undefined,
      } : undefined,
    };

    await onSubmit(taskData);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isEditing ? 'Edit Task' : 'Create New Task'}
          </h2>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={taskValidationSchema}
          onSubmit={handleSubmit}
        >
          {({ values }) => (
            <Form className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <Field
                  name="title"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter task title..."
                />
                <ErrorMessage name="title" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <Field
                  as="textarea"
                  name="description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter task description..."
                />
                <ErrorMessage name="description" component="div" className="text-red-500 text-sm mt-1" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>
                  <Field
                    as="select"
                    name="category"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {TASK_CATEGORIES.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="category" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Difficulty *
                  </label>
                  <Field
                    as="select"
                    name="difficulty"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {TASK_DIFFICULTIES.map(difficulty => (
                      <option key={difficulty.value} value={difficulty.value}>
                        {difficulty.label} ({difficulty.multiplier}x XP)
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="difficulty" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority *
                  </label>
                  <Field
                    as="select"
                    name="priority"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {TASK_PRIORITIES.map(priority => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="priority" component="div" className="text-red-500 text-sm mt-1" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Deadline
                  </label>
                  <Field
                    name="deadline"
                    type="datetime-local"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <ErrorMessage name="deadline" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Estimated Duration (minutes)
                  </label>
                  <Field
                    name="estimatedDuration"
                    type="number"
                    min="1"
                    max="1440"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="60"
                  />
                  <ErrorMessage name="estimatedDuration" component="div" className="text-red-500 text-sm mt-1" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <Field
                  name="tags"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter tags separated by commas..."
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Separate multiple tags with commas (e.g., urgent, project, meeting)
                </p>
                <ErrorMessage name="tags" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Recurrence (Optional)
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Type
                    </label>
                    <Field
                      as="select"
                      name="recurrenceType"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="none">No Recurrence</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </Field>
                  </div>

                  {values.recurrenceType !== 'none' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Interval
                        </label>
                        <Field
                          name="recurrenceInterval"
                          type="number"
                          min="1"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="1"
                        />
                        <ErrorMessage name="recurrenceInterval" component="div" className="text-red-500 text-sm mt-1" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          End Date
                        </label>
                        <Field
                          name="recurrenceEndDate"
                          type="datetime-local"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <ErrorMessage name="recurrenceEndDate" component="div" className="text-red-500 text-sm mt-1" />
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onCancel}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {isEditing ? 'Updating...' : 'Creating...'}
                    </div>
                  ) : (
                    isEditing ? 'Update Task' : 'Create Task'
                  )}
                </motion.button>
              </div>
            </Form>
          )}
        </Formik>
      </motion.div>
    </motion.div>
  );
};
