"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterList = exports.TimePeriodList = exports.monitoringFilterableFields = exports.monitoringSearchableFields = void 0;
exports.monitoringSearchableFields = [
    "country",
    "ipaddress",
    "os",
    "browser",
    "device",
];
exports.monitoringFilterableFields = [
    "searchTerm",
    "country",
    "ipaddress",
    "os",
    "browser",
    "device",
    "timePeriod",
];
exports.TimePeriodList = ["daily", "weekly", "monthly", "yearly"];
exports.FilterList = ['page', 'limit', 'sortBy', 'orderBy'];
