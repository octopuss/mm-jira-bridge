import Router from 'express';
import { hookProcessor } from './hookProcessor';
const router = Router();

router.get('/', function(req, res, next) {
    res.end('I am OK');
});

router.post('/hooks/:hookid', hookProcessor);
export default router;
