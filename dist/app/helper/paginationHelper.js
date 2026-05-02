"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const calculatePagination = (options) => {
    const page = Number(options === null || options === void 0 ? void 0 : options.page) || 1;
    const limit = Number(options === null || options === void 0 ? void 0 : options.limit) || 10;
    const skip = (page - 1) * limit;
    const sortBy = options.sortBy || "createdAt";
    const orderBy = options.orderBy || "desc";
    return {
        page,
        limit,
        skip,
        sortBy,
        orderBy,
    };
};
exports.default = calculatePagination;
