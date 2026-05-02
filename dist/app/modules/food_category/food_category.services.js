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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../../shared/prisma"));
const golobalErrorHnadelar_1 = require("../../middleware/golobalErrorHnadelar");
const http_status_1 = __importDefault(require("http-status"));
const paginationHelper_1 = __importDefault(require("../../helper/paginationHelper"));
const getDateRangeForPeriod_1 = __importDefault(require("../../../utility/DateRange/getDateRangeForPeriod"));
const ApiError_1 = __importDefault(require("../../error/ApiError"));
const CheckedUser_1 = __importDefault(require("../../shared/CheckedUser/CheckedUser"));
const node_cache_1 = __importDefault(require("node-cache"));
const food_category_constant_1 = require("../food_category/food_category.constant");
const cache = new node_cache_1.default({ stdTTL: 600, checkperiod: 120 });
const create_foodCategory_IntoDb = (user, payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield prisma_1.default.foodCategory.create({
            data: { userId: user.id, categorieName: payload.categorieName },
            select: {
                id: true,
            },
        });
        cache.del("all_food_categories");
        return result ? { message: "successfully recorded category" } : null;
    }
    catch (error) {
        throw new golobalErrorHnadelar_1.AppError(http_status_1.default.SERVICE_UNAVAILABLE, "food category recorded section server issues", error);
    }
});
const findAllCategoryFromDb = (filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const cachedData = cache.get("all_food_categories");
    if (cachedData)
        return cachedData;
    const { limit, page, skip } = (0, paginationHelper_1.default)(options);
    const { searchTerm, timePeriod } = filters, filterData = __rest(filters, ["searchTerm", "timePeriod"]);
    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            OR: food_category_constant_1.footcategorySearchableFields === null || food_category_constant_1.footcategorySearchableFields === void 0 ? void 0 : food_category_constant_1.footcategorySearchableFields.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive",
                },
            })),
        });
    }
    if (timePeriod) {
        const dateRange = (0, getDateRangeForPeriod_1.default)(timePeriod);
        andConditions.push({
            updatedAt: dateRange,
        });
    }
    if (Object.keys(filterData).length > 0) {
        const filterConditions = Object.keys(filterData).map((key) => ({
            [key]: {
                equals: filterData[key],
            },
        }));
        andConditions.push(...filterConditions);
    }
    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};
    try {
        const [result, total] = yield Promise.all([
            prisma_1.default.foodCategory.findMany({
                where: whereConditions,
                skip,
                take: limit,
                orderBy: options.sortBy && options.orderBy
                    ? { [options.sortBy]: options.orderBy }
                    : { updatedAt: "desc" },
                include: {
                    posts: true,
                    user: true,
                },
            }),
            prisma_1.default.foodCategory.count({
                where: whereConditions,
            }),
        ]);
        const response = {
            meta: {
                total,
                page,
                limit,
            },
            data: result,
        };
        cache.set("all_food_categories", response);
        return response;
    }
    catch (error) {
        throw new ApiError_1.default(http_status_1.default.SERVICE_UNAVAILABLE, "All food category activity issues", error);
    }
});
const find_specific_foodCategoryFromDb = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const cachedData = cache.get(`food_category_${id}`);
    if (cachedData)
        return cachedData;
    try {
        const result = yield prisma_1.default.foodCategory.findUniqueOrThrow({
            where: { id },
            include: {
                user: {
                    select: {
                        username: true,
                        email: true,
                        phonenumber: true,
                        photo: true,
                    },
                },
            },
        });
        cache.set(`food_category_${id}`, result);
        return result;
    }
    catch (error) {
        throw new ApiError_1.default(http_status_1.default.SERVICE_UNAVAILABLE, "specific food category activity issues", error);
    }
});
const updateSpecificFoodCategoryIntoDb = (id, payload, user) => __awaiter(void 0, void 0, void 0, function* () {
    const isAdmin = yield (0, CheckedUser_1.default)({ id: user.id, role: user.role });
    if (!isAdmin.isVerified) {
        throw new golobalErrorHnadelar_1.AppError(http_status_1.default.BAD_REQUEST, "only admin can be accessible", "");
    }
    const isCategoryExist = yield prisma_1.default.foodCategory.findUniqueOrThrow({
        where: {
            id,
            categorieName: payload.categorieName,
        },
        select: {
            updatedAt: true,
        },
    });
    if (!isCategoryExist) {
        throw new golobalErrorHnadelar_1.AppError(http_status_1.default.BAD_REQUEST, "this category not accepted by Rate My Plate server", "");
    }
    try {
        const result = yield prisma_1.default.foodCategory.update({
            where: {
                id,
            },
            data: payload,
            select: {
                updatedAt: true,
            },
        });
        cache.del("all_food_categories");
        cache.del(`food_category_${id}`);
        return result ? { message: "update recorded in the server" } : null;
    }
    catch (error) {
        throw new ApiError_1.default(http_status_1.default.SERVICE_UNAVAILABLE, "update food category activity issues", error);
    }
});
const FootCategoryServices = {
    create_foodCategory_IntoDb,
    findAllCategoryFromDb,
    find_specific_foodCategoryFromDb,
    updateSpecificFoodCategoryIntoDb,
};
exports.default = FootCategoryServices;
