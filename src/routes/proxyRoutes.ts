import { Router } from 'express';
import proxyController from '../controllers/proxyController';

const router = Router();

router.get('/services', proxyController.getAvailableServices);
router.post('/:service', proxyController.proxyRequest);

export default router;