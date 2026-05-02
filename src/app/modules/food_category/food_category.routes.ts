import express from 'express';
import auth from '../../middleware/auth';
import { UserRole } from '@prisma/client';
import validateRequest from '../../middleware/validateRequest';
import FoodCategoryValidation from './food_category.validation';
import FoodCategoryController from './food_category.controllers';

const router = express.Router();

router.post('/create_food_category',auth(UserRole.EMPLOYEE,UserRole.USER,UserRole.ADMIN),validateRequest(FoodCategoryValidation.FoodCategorySchema),FoodCategoryController.create_foodCategory);
router.get("/find_all_category",auth(UserRole.EMPLOYEE,UserRole.ADMIN),FoodCategoryController.findAllCategory);
router.get("/find_specific_category/:id",auth(UserRole.ADMIN),FoodCategoryController.find_specific_foodCategory);
router.patch('/update_specific_food_category/:id',auth(UserRole.ADMIN),validateRequest(FoodCategoryValidation.UpdateFoodCategorySchema),FoodCategoryController.updateSpecificFoodCategory)

const FoodCategoryRoutes = router;
export default FoodCategoryRoutes;
