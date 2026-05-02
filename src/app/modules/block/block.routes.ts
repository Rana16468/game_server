


import express from 'express';
import BlockController from './block.controllers';

const router = express.Router();

router.post("/block_my_plate", BlockController.createBlock);

const BlockRoutes = router;
export default BlockRoutes;