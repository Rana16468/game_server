

import express from 'express';
import RatingController from './rating.controllers';

const router=express.Router();

router.get("/find_all_rating",RatingController.find_all_rating);
const RatingRoutes = router;
export default RatingRoutes;
