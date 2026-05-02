"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const golobalErrorHnadelar_1 = require("../../middleware/golobalErrorHnadelar");
const http_status_1 = __importDefault(require("http-status"));
const prisma_1 = __importDefault(require("../../shared/prisma"));
const sendImageToCloudinary_1 = __importDefault(require("../../../utility/Image/sendImageToCloudinary"));
const sqlQuery_1 = __importDefault(require("../../../utility/code/sqlQuery"));
const behaviorAnalysisQuery_1 = __importDefault(require("../../../utility/code/behaviorAnalysisQuery"));
const node_cache_1 = __importDefault(require("node-cache"));
const cache = new node_cache_1.default({ stdTTL: 600, checkperiod: 600 });
const CACHE_KEYS = {
    ALL_POSTS: (userId, page, limit) => `all_posts_${userId}_${page}_${limit}`,
    USER_BEHAVIOR: (userId) => `user_behavior_${userId}`,
    CATEGORY: (userId, categoryName) => `category_${userId}_${categoryName}`,
};
/**
 * Validates the required fields in the request body
 * @param data - The request body data
 * @throws AppError if validation fails
 */
const validateInput = (data) => {
    const requiredFields = [
        "foodname",
        "categoryName",
        "restaurantShopName",
        "restaurantShopAddress",
        "price",
        "poststatus",
    ];
    const missingFields = requiredFields.filter((field) => !data[field]);
    if (missingFields.length > 0) {
        throw new golobalErrorHnadelar_1.AppError(http_status_1.default.BAD_REQUEST, `Missing required fields: ${missingFields.join(", ")}`, "");
    }
    if (isNaN(Number(data.price)) || Number(data.price) <= 0) {
        throw new golobalErrorHnadelar_1.AppError(http_status_1.default.BAD_REQUEST, "Price must be a valid positive number", "");
    }
};
/**
 * Handles the creation or retrieval of a food category with caching
 * @param userId - The user's ID
 * @param categoryName - The name of the category
 * @returns The category object with id
 */
const getOrCreateCategory = (userId, categoryName) => __awaiter(void 0, void 0, void 0, function* () {
    const cacheKey = CACHE_KEYS.CATEGORY(userId, categoryName);
    const cachedCategory = cache.get(cacheKey);
    if (cachedCategory) {
        return cachedCategory;
    }
    const existingCategory = yield prisma_1.default.foodCategory.findFirst({
        where: {
            userId,
            categorieName: categoryName,
        },
        select: {
            id: true,
        },
    });
    if (existingCategory) {
        cache.set(cacheKey, existingCategory);
        return existingCategory;
    }
    const newCategory = yield prisma_1.default.foodCategory.create({
        data: {
            userId,
            categorieName: categoryName,
        },
        select: {
            id: true
        }
    });
    const categoryWithId = { id: newCategory.id };
    cache.set(cacheKey, categoryWithId);
    return categoryWithId;
});
/**
 * Uploads multiple images to Cloudinary concurrently
 * @param files - Array of uploaded files
 * @returns Array of secure URLs
 */
const uploadImages = (files) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield Promise.all(files.map((file) => __awaiter(void 0, void 0, void 0, function* () {
            const { secure_url } = (yield (0, sendImageToCloudinary_1.default)(file.filename, file.path));
            return secure_url;
        })));
    }
    catch (error) {
        throw new golobalErrorHnadelar_1.AppError(http_status_1.default.INTERNAL_SERVER_ERROR, "Failed to upload images", error);
    }
});
/**
 * Invalidates relevant caches after data modifications
 * @param userId - The user's ID
 */
const invalidateUserCaches = (userId) => {
    const keys = cache.keys();
    keys.forEach(key => {
        if (key.includes(`_${userId}_`)) {
            cache.del(key);
        }
    });
    cache.del(CACHE_KEYS.USER_BEHAVIOR(userId));
};
/**
 * Creates a new rate-my-plate post with associated images
 * @param req - Express request object
 * @param user - JWT payload containing user information
 * @returns Created post object
 */
const createRateMyPlatePost = (req, user) => __awaiter(void 0, void 0, void 0, function* () {
    const files = req.files;
    const data = req.body;
    try {
        if (!(files === null || files === void 0 ? void 0 : files.length)) {
            throw new golobalErrorHnadelar_1.AppError(http_status_1.default.BAD_REQUEST, "At least one image is required", "");
        }
        validateInput(data);
        const imageUploadPromise = uploadImages(files);
        const result = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const category = yield getOrCreateCategory(user.id, data.categoryName);
            const post = yield tx.postRateMyPlate.create({
                data: {
                    foodname: data.foodname,
                    restaurantShopName: data.restaurantShopName,
                    restaurantShopAddress: data.restaurantShopAddress,
                    mapLocation: data.mapLocation || "",
                    price: Number(data.price),
                    opinion: data.opinion || "",
                    poststatus: data.poststatus,
                    categorieId: category.id,
                },
            });
            // Wait for image upload to complete
            const imageUrls = yield imageUploadPromise;
            yield tx.photo.createMany({
                data: imageUrls.map((url) => ({
                    postId: post.id,
                    photo: url,
                })),
            });
            return post;
        }));
        // Invalidate user caches after creating a new post
        invalidateUserCaches(user.id);
        return {
            message: "Post successfully created!",
            post: result,
        };
    }
    catch (error) {
        if (error instanceof golobalErrorHnadelar_1.AppError) {
            throw error;
        }
        throw new golobalErrorHnadelar_1.AppError(http_status_1.default.INTERNAL_SERVER_ERROR, "Error creating post", error);
    }
});
/**
 * Retrieves all rate-my-plate posts for a user with caching
 * @param userId - The user's ID
 * @param page - Page number (optional, defaults to 1)
 * @param limit - Number of posts per page (optional, defaults to 40)
 * @returns Paginated list of posts
 */
const find_all_RateMyPlatePostFromDb = (userId_1, ...args_1) => __awaiter(void 0, [userId_1, ...args_1], void 0, function* (userId, page = 2, limit = 40) {
    const cacheKey = CACHE_KEYS.ALL_POSTS(userId, page, limit);
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
        return cachedResult;
    }
    try {
        const result = yield prisma_1.default.$queryRaw(sqlQuery_1.default.ratemyplateQuery(userId, limit, page));
        const response = {
            limit,
            page,
            total: result.length,
            result,
        };
        // Cache the result
        cache.set(cacheKey, response);
        return response;
    }
    catch (error) {
        throw new golobalErrorHnadelar_1.AppError(http_status_1.default.SERVICE_UNAVAILABLE, "Failed to fetch rate my plate posts", error);
    }
});
/**
 * Analyzes user behavior with caching
 * @param userId - The user's ID
 * @returns User behavior analysis data
 */
const user_Behavior_Analysis_RateMyPlatePostFromDb = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const cacheKey = CACHE_KEYS.USER_BEHAVIOR(userId);
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
        return cachedResult;
    }
    // If not in cache, fetch from database
    try {
        const result = yield prisma_1.default.$queryRaw(behaviorAnalysisQuery_1.default.behaviorAnalysis(userId));
        // Cache the result
        cache.set(cacheKey, result);
        return result;
    }
    catch (error) {
        throw new golobalErrorHnadelar_1.AppError(http_status_1.default.SERVICE_UNAVAILABLE, "Failed to fetch user behavior analysis", error);
    }
});
/**
 * Records a rating for a post
 * @param user - JWT payload containing user information
 * @param payload - Rating data
 * @returns Rating record result
 */
const rating_recordIntoDb = (user, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId, rating } = payload || {};
    try {
        const result = yield prisma_1.default.rating.upsert({
            where: {
                userId_postId: {
                    userId: user.id,
                    postId,
                },
            },
            update: {
                rating,
                isRating: true,
            },
            create: {
                postId: postId,
                rating: rating,
                userId: user.id,
                isRating: rating ? true : false,
            },
            select: {
                isRating: true,
            },
        });
        invalidateUserCaches(user.id);
        return result;
    }
    catch (error) {
        throw new golobalErrorHnadelar_1.AppError(http_status_1.default.SERVICE_UNAVAILABLE, "Error rating record server issues", error);
    }
});
/**
 * Records a view for a post
 * @param user - JWT payload containing user information
 * @param payload - View data
 * @returns View record result
 */
const view_recordIntoDb = (user, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId, view } = payload || {};
    try {
        const result = yield prisma_1.default.view.upsert({
            where: {
                userId_postId: {
                    userId: user.id,
                    postId,
                },
            },
            update: {
                view: {
                    increment: view,
                },
            },
            create: {
                postId,
                view,
                userId: user.id,
            },
            select: {
                updatedAt: true,
            },
        });
        // For views, we don't invalidate caches as this is a frequent operation
        // and doesn't significantly affect the data being cached
        return result;
    }
    catch (error) {
        throw new golobalErrorHnadelar_1.AppError(http_status_1.default.SERVICE_UNAVAILABLE, "Error view record server issues", error);
    }
});
/**
 * Updates a rate-my-plate post
 * @param req - Express request object
 * @param user - JWT payload containing user information
 * @param id - Post ID
 * @returns Updated post information
 */
const updateRateMyPlateIntoDb = (req, user, id) => __awaiter(void 0, void 0, void 0, function* () {
    const files = req.files;
    const { categoryName, foodname, restaurantShopName, restaurantShopAddress, mapLocation, price, poststatus, opinion, photoIds, } = req.body;
    try {
        // Start image upload early if there are files to process
        let imageUploadPromise;
        if (files.length && (photoIds === null || photoIds === void 0 ? void 0 : photoIds.length)) {
            imageUploadPromise = uploadImages(files);
        }
        const result = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const updatedCategory = yield tx.foodCategory.update({
                where: {
                    userId_categorieName: {
                        userId: user.id,
                        categorieName: categoryName,
                    },
                },
                data: {
                    posts: {
                        update: {
                            where: { id },
                            data: {
                                foodname,
                                restaurantShopName,
                                restaurantShopAddress,
                                mapLocation,
                                price: Number(price),
                                poststatus,
                                opinion,
                            },
                        },
                    },
                },
                select: { posts: { select: { updatedAt: true } } },
            });
            if (files.length && (photoIds === null || photoIds === void 0 ? void 0 : photoIds.length) && imageUploadPromise) {
                // Wait for image upload to complete
                const imageUrls = yield imageUploadPromise;
                yield Promise.all(photoIds.map((photoId, index) => tx.photo.update({
                    where: { id: photoId },
                    data: { photo: imageUrls[index] },
                    select: { updatedAt: true },
                })));
            }
            return updatedCategory;
        }));
        // Invalidate user caches after updating a post
        invalidateUserCaches(user.id);
        return result;
    }
    catch (error) {
        throw new golobalErrorHnadelar_1.AppError(error.code === "P2025"
            ? http_status_1.default.NOT_FOUND
            : http_status_1.default.SERVICE_UNAVAILABLE, error.code === "P2025"
            ? "Food category not found"
            : "Update rate my plate server error", error);
    }
});
/**
 * Clears all caches or specific user caches
 * @param userId - Optional user ID to clear specific user caches
 */
const clearCache = (userId) => {
    if (userId) {
        invalidateUserCaches(userId);
    }
    else {
        cache.flushAll();
    }
};
const RateMyPlateServices = {
    createRateMyPlatePost,
    find_all_RateMyPlatePostFromDb,
    rating_recordIntoDb,
    view_recordIntoDb,
    updateRateMyPlateIntoDb,
    user_Behavior_Analysis_RateMyPlatePostFromDb,
    clearCache
};
exports.default = RateMyPlateServices;
// next is notification 
