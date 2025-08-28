import { Router } from 'express';
import * as C from '../controllers/product.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', C.list);                                     // public
router.post('/', requireAuth, requireAdmin, C.create);       // admin
router.put('/:id', requireAuth, requireAdmin, C.update);     // admin (EDIT)
router.delete('/:id', requireAuth, requireAdmin, C.remove);  // admin

export default router;
