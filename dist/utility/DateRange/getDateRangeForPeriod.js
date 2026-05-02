"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getDateRangeForPeriod = (period) => {
    const now = new Date();
    const startDate = new Date();
    switch (period) {
        case "daily":
            startDate.setHours(0, 0, 0, 0);
            break;
        case "weekly":
            startDate.setDate(now.getDate() - 7);
            break;
        case "monthly":
            startDate.setMonth(now.getMonth() - 1);
            break;
        case "yearly":
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        default: {
            startDate.setHours(0, 0, 0, 0);
        }
    }
    return {
        gte: startDate,
        lte: now,
    };
};
exports.default = getDateRangeForPeriod;
