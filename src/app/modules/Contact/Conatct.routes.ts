import express from 'express'
import validateRequest from '../../middleware/validateRequest';
import { ContactValidation } from './Contact.validation';
import { ContactController } from './Contact.controller';

const router=express.Router();

router.post("/",validateRequest(ContactValidation.createContactValidation),ContactController.Contact);
router.get("/find_all_contact",ContactController.FindAllContractList);
router.delete("/delete_contact/:id",ContactController.DeleteContact);
router.get("/send_sms",ContactController.SendSMS);

export const ContactRouter=router;

