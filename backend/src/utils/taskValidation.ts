import Joi from 'joi';

export const taskValidationSchemas = {
  createTask: Joi.object({
    title: Joi.string().trim().min(1).max(200).required().messages({
      'string.empty': 'Title is required',
      'string.max': 'Title must not exceed 200 characters',
    }),
    description: Joi.string().trim().max(1000).optional().allow('').messages({
      'string.max': 'Description must not exceed 1000 characters',
    }),
    category: Joi.string().valid('work', 'personal', 'health', 'learning', 'other').default('other'),
    difficulty: Joi.string().valid('easy', 'medium', 'hard').default('medium'),
    priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
    deadline: Joi.date().iso().min('now').optional().messages({
      'date.min': 'Deadline must be in the future',
    }),
    recurrence: Joi.object({
      type: Joi.string().valid('none', 'daily', 'weekly', 'monthly').default('none'),
      interval: Joi.number().integer().min(1).default(1),
      endDate: Joi.date().iso().min('now').optional(),
    }).optional(),
    tags: Joi.array().items(
      Joi.string().trim().min(1).max(50)
    ).max(10).optional().messages({
      'array.max': 'Maximum 10 tags allowed',
    }),
    estimatedDuration: Joi.number().integer().min(1).max(1440).optional().messages({
      'number.min': 'Estimated duration must be at least 1 minute',
      'number.max': 'Estimated duration must not exceed 1440 minutes (24 hours)',
    }),
  }),

  updateTask: Joi.object({
    title: Joi.string().trim().min(1).max(200).optional().messages({
      'string.empty': 'Title cannot be empty',
      'string.max': 'Title must not exceed 200 characters',
    }),
    description: Joi.string().trim().max(1000).optional().allow('').messages({
      'string.max': 'Description must not exceed 1000 characters',
    }),
    category: Joi.string().valid('work', 'personal', 'health', 'learning', 'other').optional(),
    difficulty: Joi.string().valid('easy', 'medium', 'hard').optional(),
    priority: Joi.string().valid('low', 'medium', 'high').optional(),
    deadline: Joi.date().iso().optional().allow(null),
    recurrence: Joi.object({
      type: Joi.string().valid('none', 'daily', 'weekly', 'monthly').optional(),
      interval: Joi.number().integer().min(1).optional(),
      endDate: Joi.date().iso().optional().allow(null),
    }).optional(),
    tags: Joi.array().items(
      Joi.string().trim().min(1).max(50)
    ).max(10).optional().messages({
      'array.max': 'Maximum 10 tags allowed',
    }),
    estimatedDuration: Joi.number().integer().min(1).max(1440).optional().allow(null).messages({
      'number.min': 'Estimated duration must be at least 1 minute',
      'number.max': 'Estimated duration must not exceed 1440 minutes (24 hours)',
    }),
    actualDuration: Joi.number().integer().min(1).max(1440).optional().allow(null).messages({
      'number.min': 'Actual duration must be at least 1 minute',
      'number.max': 'Actual duration must not exceed 1440 minutes (24 hours)',
    }),
  }),

  taskId: Joi.object({
    id: Joi.string().hex().length(24).required().messages({
      'string.hex': 'Invalid task ID format',
      'string.length': 'Invalid task ID format',
    }),
  }),

  // Update status validation
  updateStatus: Joi.object({
    status: Joi.string().valid('pending', 'in_progress', 'completed').required().messages({
      'any.only': 'Status must be pending, in_progress, or completed',
    }),
  }),

  // Bulk update validation
  bulkUpdate: Joi.object({
    taskIds: Joi.array().items(
      Joi.string().hex().length(24).messages({
        'string.hex': 'Invalid task ID format',
        'string.length': 'Invalid task ID format',
      })
    ).min(1).max(50).required().messages({
      'array.min': 'At least one task ID is required',
      'array.max': 'Maximum 50 tasks can be updated at once',
    }),
    updateData: Joi.object({
      category: Joi.string().valid('work', 'personal', 'health', 'learning', 'other').optional(),
      difficulty: Joi.string().valid('easy', 'medium', 'hard').optional(),
      priority: Joi.string().valid('low', 'medium', 'high').optional(),
      status: Joi.string().valid('pending', 'in_progress', 'completed').optional(),
      tags: Joi.array().items(
        Joi.string().trim().min(1).max(50)
      ).max(10).optional(),
    }).min(1).required().messages({
      'object.min': 'At least one field must be provided for update',
    }),
  }),

  // Query filters validation (for GET requests)
  queryFilters: Joi.object({
    status: Joi.string().valid('pending', 'in_progress', 'completed').optional(),
    category: Joi.string().valid('work', 'personal', 'health', 'learning', 'other').optional(),
    difficulty: Joi.string().valid('easy', 'medium', 'hard').optional(),
    priority: Joi.string().valid('low', 'medium', 'high').optional(),
    search: Joi.string().trim().max(100).optional(),
    tags: Joi.alternatives().try(
      Joi.string().trim(),
      Joi.array().items(Joi.string().trim())
    ).optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).optional().messages({
      'date.min': 'End date must be after start date',
    }),
    page: Joi.number().integer().min(1).default(1).optional(),
    limit: Joi.number().integer().min(1).max(100).default(20).optional().messages({
      'number.max': 'Limit cannot exceed 100',
    }),
    sortBy: Joi.string().valid(
      'createdAt', 'updatedAt', 'title', 'deadline', 'priority', 'difficulty', 'status'
    ).default('createdAt').optional(),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc').optional(),
  }),
};
