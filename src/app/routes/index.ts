import express from  'express';

import { ContactRouter } from '../modules/Contact/Conatct.routes';
import UsersRoutes from '../modules/users/users.routes';
import UserMonitoringRoutes from '../modules/monitoring/monitoring.routes';
import AuthRoutes from '../modules/auth/auth.routes';
import FoodCategoryRoutes from '../modules/food_category/food_category.routes';
import PostsRoutes from '../modules/post/post.routes';
import RatingRoutes from '../modules/rating/rating.routes';
import BlockRoutes from '../modules/block/block.routes';




const router=express.Router();

const moduleRoutes=[
    {path:"/users",route:UsersRoutes},
    {path:"/monitoring",route:UserMonitoringRoutes},
    {path:"/contact",route: ContactRouter},
    {path:"/auth",route:AuthRoutes},
    {path:"/food_category", route: FoodCategoryRoutes},
    {path:"/post",route:PostsRoutes},
    {path:"/rating",route:RatingRoutes},
    {path:"/block", route: BlockRoutes}
]

moduleRoutes.forEach((route)=>router.use(route.path,route.route))

export default router;