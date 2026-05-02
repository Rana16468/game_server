"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileRouter = void 0;
const express_1 = __importDefault(require("express"));
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const Profile_validation_1 = require("./Profile.validation");
const Profile_controller_1 = require("./Profile.controller");
const router = express_1.default.Router();
// handel all over the Request
router.post("/", (0, validateRequest_1.default)(Profile_validation_1.ProfileValidation.createProfileValidation), Profile_controller_1.ProfileController.createProfile);
exports.ProfileRouter = router;
