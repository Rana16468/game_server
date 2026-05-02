"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middleware/auth"));
const client_1 = require("@prisma/client");
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const food_category_validation_1 = __importDefault(require("./food_category.validation"));
const food_category_controllers_1 = __importDefault(require("./food_category.controllers"));
const router = express_1.default.Router();
router.post('/create_food_category', (0, auth_1.default)(client_1.UserRole.EMPLOYEE, client_1.UserRole.USER, client_1.UserRole.ADMIN), (0, validateRequest_1.default)(food_category_validation_1.default.FoodCategorySchema), food_category_controllers_1.default.create_foodCategory);
router.get("/find_all_category", (0, auth_1.default)(client_1.UserRole.EMPLOYEE, client_1.UserRole.ADMIN), food_category_controllers_1.default.findAllCategory);
router.get("/find_specific_category/:id", (0, auth_1.default)(client_1.UserRole.ADMIN), food_category_controllers_1.default.find_specific_foodCategory);
router.patch('/update_specific_food_category/:id', (0, auth_1.default)(client_1.UserRole.ADMIN), (0, validateRequest_1.default)(food_category_validation_1.default.UpdateFoodCategorySchema), food_category_controllers_1.default.updateSpecificFoodCategory);
const FoodCategoryRoutes = router;
exports.default = FoodCategoryRoutes;
