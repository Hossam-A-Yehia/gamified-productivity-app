import { Router } from 'express';
import { TaskController } from '../controllers/taskController';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validation';
import { taskValidationSchemas } from '../utils/taskValidation';

const router = Router();

router.use(authenticate);

router.get('/', TaskController.getTasks);

router.post('/', validate(taskValidationSchemas.createTask), TaskController.createTask);

router.get('/stats', TaskController.getTaskStats);

router.get('/overdue', TaskController.getOverdueTasks);

router.post('/bulk', validate(taskValidationSchemas.bulkUpdate), TaskController.bulkUpdateTasks);

router.get('/:id', TaskController.getTaskById);

router.put('/:id', validate(taskValidationSchemas.updateTask), TaskController.updateTask);

router.delete('/:id', TaskController.deleteTask);

router.patch('/:id/complete', TaskController.completeTask);

router.patch('/:id/status', validate(taskValidationSchemas.updateStatus), TaskController.updateTaskStatus);

export default router;
