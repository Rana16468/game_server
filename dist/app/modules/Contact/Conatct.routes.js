"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactRouter = void 0;
const express_1 = __importDefault(require("express"));
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const Contact_validation_1 = require("./Contact.validation");
const Contact_controller_1 = require("./Contact.controller");
const router = express_1.default.Router();
router.post("/", (0, validateRequest_1.default)(Contact_validation_1.ContactValidation.createContactValidation), Contact_controller_1.ContactController.Contact);
router.get("/find_all_contact", Contact_controller_1.ContactController.FindAllContractList);
router.delete("/delete_contact/:id", Contact_controller_1.ContactController.DeleteContact);
router.get("/send_sms", Contact_controller_1.ContactController.SendSMS);
exports.ContactRouter = router;
