"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Conatct_routes_1 = require("../modules/Contact/Conatct.routes");
const users_routes_1 = __importDefault(require("../modules/users/users.routes"));
const monitoring_routes_1 = __importDefault(require("../modules/monitoring/monitoring.routes"));
const auth_routes_1 = __importDefault(require("../modules/auth/auth.routes"));
const food_category_routes_1 = __importDefault(require("../modules/food_category/food_category.routes"));
const post_routes_1 = __importDefault(require("../modules/post/post.routes"));
const rating_routes_1 = __importDefault(require("../modules/rating/rating.routes"));
const block_routes_1 = __importDefault(require("../modules/block/block.routes"));
const router = express_1.default.Router();
const moduleRoutes = [
    { path: "/users", route: users_routes_1.default },
    { path: "/monitoring", route: monitoring_routes_1.default },
    { path: "/contact", route: Conatct_routes_1.ContactRouter },
    { path: "/auth", route: auth_routes_1.default },
    { path: "/food_category", route: food_category_routes_1.default },
    { path: "/post", route: post_routes_1.default },
    { path: "/rating", route: rating_routes_1.default },
    { path: "/block", route: block_routes_1.default }
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));
exports.default = router;
