import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2 } from 'lucide-react';
import { Formik, Form, Field, FieldArray } from 'formik';
import * as Yup from 'yup';
import type { CreateChallengeRequest, ChallengeFormData } from '../../types/challenge';
import { CHALLENGE_TYPES, CHALLENGE_CATEGORIES, CHALLENGE_DIFFICULTIES, REQUIREMENT_TYPES, REWARD_TYPES } from '../../types/challenge';

interface ChallengeFormProps {
  onSubmit: (data: CreateChallengeRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const validationSchema = Yup.object({
  title: Yup.string().required('Title is required').min(3, 'Title must be at least 3 characters'),
  description: Yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
  type: Yup.string().required('Challenge type is required'),
  category: Yup.string().required('Category is required'),
  difficulty: Yup.string().required('Difficulty is required'),
  startDate: Yup.date().required('Start date is required').min(new Date(), 'Start date must be in the future'),
  endDate: Yup.date().required('End date is required').min(Yup.ref('startDate'), 'End date must be after start date'),
  requirements: Yup.array().of(
    Yup.object({
      type: Yup.string().required('Requirement type is required'),
      target: Yup.number().required('Target is required').min(1, 'Target must be at least 1'),
      description: Yup.string().required('Description is required'),
      unit: Yup.string().required('Unit is required'),
    })
  ).min(1, 'At least one requirement is required'),
  rewards: Yup.array().of(
    Yup.object({
      type: Yup.string().required('Reward type is required'),
      amount: Yup.number().required('Amount is required').min(1, 'Amount must be at least 1'),
      description: Yup.string().required('Description is required'),
    })
  ).min(1, 'At least one reward is required'),
});

export const ChallengeForm: React.FC<ChallengeFormProps> = ({
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const initialValues: ChallengeFormData = {
    title: '',
    description: '',
    type: 'personal',
    category: 'productivity',
    difficulty: 'medium',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    maxParticipants: 100,
    isPublic: true,
    tags: '',
    imageUrl: '',
    requirements: [
      {
        type: 'tasks_completed',
        target: 10,
        description: 'Complete 10 tasks',
        unit: 'tasks',
      },
    ],
    rewards: [
      {
        type: 'xp',
        amount: 100,
        description: '100 XP bonus',
        rarity: 'common',
      },
    ],
  };

  const handleSubmit = async (values: ChallengeFormData) => {
    const challengeData: CreateChallengeRequest = {
      title: values.title,
      description: values.description,
      type: values.type,
      category: values.category,
      difficulty: values.difficulty,
      startDate: new Date(values.startDate).toISOString(),
      endDate: new Date(values.endDate).toISOString(),
      maxParticipants: values.maxParticipants,
      isPublic: values.isPublic,
      tags: values.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
      imageUrl: values.imageUrl || undefined,
      requirements: values.requirements.map((req, index) => ({
        id: `req_${Date.now()}_${index}`,
        type: req.type,
        target: req.target,
        current: 0,
        description: req.description,
        unit: req.unit,
      })),
      rewards: {
        xp: values.rewards.reduce((total, reward) => {
          return reward.type === 'xp' ? total + (reward.amount || 0) : total;
        }, 0) || 100,
        coins: values.rewards.reduce((total, reward) => {
          return reward.type === 'coins' ? total + (reward.amount || 0) : total;
        }, 0) || 50,
        badges: values.rewards.filter(r => r.type === 'badge').map(r => r.description),
        avatars: values.rewards.filter(r => r.type === 'avatar').map(r => r.description),
        themes: values.rewards.filter(r => r.type === 'theme').map(r => r.description),
        titles: values.rewards.filter(r => r.type === 'title').map(r => r.description),
        multiplier: 1,
      },
    };

    await onSubmit(challengeData);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Create New Challenge
            </h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched }) => (
              <Form className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Challenge Title *
                    </label>
                    <Field
                      name="title"
                      type="text"
                      placeholder="Enter challenge title..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    {errors.title && touched.title && (
                      <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Challenge Type *
                    </label>
                    <Field
                      as="select"
                      name="type"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {CHALLENGE_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </Field>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description *
                  </label>
                  <Field
                    as="textarea"
                    name="description"
                    rows={3}
                    placeholder="Describe your challenge..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  {errors.description && touched.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category *
                    </label>
                    <Field
                      as="select"
                      name="category"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {CHALLENGE_CATEGORIES.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.icon} {category.label}
                        </option>
                      ))}
                    </Field>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Difficulty *
                    </label>
                    <Field
                      as="select"
                      name="difficulty"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {CHALLENGE_DIFFICULTIES.map(difficulty => (
                        <option key={difficulty.value} value={difficulty.value}>
                          {difficulty.label} ({difficulty.multiplier}x)
                        </option>
                      ))}
                    </Field>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Max Participants
                    </label>
                    <Field
                      name="maxParticipants"
                      type="number"
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Date *
                    </label>
                    <Field
                      name="startDate"
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    {errors.startDate && touched.startDate && (
                      <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Date *
                    </label>
                    <Field
                      name="endDate"
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    {errors.endDate && touched.endDate && (
                      <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Requirements *
                  </label>
                  <FieldArray name="requirements">
                    {({ push, remove }) => (
                      <div className="space-y-3">
                        {values.requirements.map((_, index) => (
                          <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <Field
                              as="select"
                              name={`requirements.${index}.type`}
                              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                            >
                              {REQUIREMENT_TYPES.map(type => (
                                <option key={type.value} value={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </Field>
                            <Field
                              name={`requirements.${index}.target`}
                              type="number"
                              min="1"
                              placeholder="Target"
                              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                            />
                            <Field
                              name={`requirements.${index}.description`}
                              placeholder="Description"
                              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                            />
                            <div className="flex items-center gap-2">
                              <Field
                                name={`requirements.${index}.unit`}
                                placeholder="Unit"
                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                              />
                              {values.requirements.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => remove(index)}
                                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => push({ type: 'complete_tasks', target: 1, description: '', unit: 'tasks' })}
                          className="flex items-center gap-2 px-3 py-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors text-sm"
                        >
                          <Plus size={16} />
                          Add Requirement
                        </button>
                      </div>
                    )}
                  </FieldArray>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rewards *
                  </label>
                  <FieldArray name="rewards">
                    {({ push, remove }) => (
                      <div className="space-y-3">
                        {values.rewards.map((_, index) => (
                          <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <Field
                              as="select"
                              name={`rewards.${index}.type`}
                              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                            >
                              {REWARD_TYPES.map(type => (
                                <option key={type.value} value={type.value}>
                                  {type.icon} {type.label}
                                </option>
                              ))}
                            </Field>
                            <Field
                              name={`rewards.${index}.amount`}
                              type="number"
                              min="1"
                              placeholder="Amount"
                              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                            />
                            <Field
                              name={`rewards.${index}.description`}
                              placeholder="Description"
                              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                            />
                            <div className="flex items-center gap-2">
                              <Field
                                as="select"
                                name={`rewards.${index}.rarity`}
                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                              >
                                <option value="common">Common</option>
                                <option value="rare">Rare</option>
                                <option value="epic">Epic</option>
                                <option value="legendary">Legendary</option>
                              </Field>
                              {values.rewards.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => remove(index)}
                                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => push({ type: 'xp', amount: 50, description: '', rarity: 'common' })}
                          className="flex items-center gap-2 px-3 py-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors text-sm"
                        >
                          <Plus size={16} />
                          Add Reward
                        </button>
                      </div>
                    )}
                  </FieldArray>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tags (comma-separated)
                    </label>
                    <Field
                      name="tags"
                      type="text"
                      placeholder="productivity, team, weekly..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="flex items-center">
                    <Field
                      name="isPublic"
                      type="checkbox"
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Make this challenge public
                    </label>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating...' : 'Create Challenge'}
                  </motion.button>
                </div>
              </Form>
            )}
          </Formik>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
