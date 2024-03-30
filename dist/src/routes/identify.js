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
const connection = require("../utils/connection");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const helpers_1 = require("../utils/helpers");
router.post("/identify", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { email, phoneNumber } = req.body;
        const contactList = yield (0, helpers_1.getContacts)({ email, phoneNumber });
        // creating new contact since no overlapping record exist for the given inputs
        if (!contactList.length) {
            const obj = yield (0, helpers_1.createContact)({ email, phoneNumber }, [], true);
            return res.status(200).json({
                "contact": {
                    "primaryContatctId": obj.insertId,
                    "emails": [email],
                    "phoneNumbers": [phoneNumber],
                    "secondaryContactIds": []
                }
            });
        }
        else {
            // checking if more than 1 primary contact exists
            const primaryContactsList = contactList.filter((r) => r.linkPrecedence === "primary");
            var isMultiplePrimaryExists = false;
            // if primary contact > 1; linking rest of the contacts to the oldest primary contact record
            if (primaryContactsList.length > 1) {
                isMultiplePrimaryExists = true;
                const primaryId = primaryContactsList[0].id;
                const updatedContactList = contactList.filter((contact) => contact.id !== primaryId).map((contact) => contact.id);
                yield (0, helpers_1.linkContacts)(primaryId, updatedContactList);
            }
            var obj = [];
            //creating contact in db only if both the details are provided
            if (email && phoneNumber && !isMultiplePrimaryExists) {
                obj = yield (0, helpers_1.createContact)({ email, phoneNumber }, contactList, false);
            }
            var emails = [];
            var phoneNumbers = [];
            var secondaryContactIds = [];
            let s = new Set(); // to keep track of duplicate emails & phoneNumbers
            // pushing primary contact's details first
            if (contactList[0].email.length)
                emails.push(contactList[0].email);
            if (contactList[0].phoneNumber.length)
                phoneNumbers.push(contactList[0].phoneNumber);
            // adding rest of the contact details avoiding duplicates
            for (var i = 0; i < contactList.length; i++) {
                if (i !== 0) {
                    //checking if email & phoneNumber is unique and not null
                    if (!s.has(contactList[i].email) && contactList[i].email)
                        emails.push(contactList[i].email);
                    if (!s.has(contactList[i].phoneNumber) && contactList[i].phoneNumber.length)
                        phoneNumbers.push(contactList[i].phoneNumber);
                    secondaryContactIds.push(contactList[i].id);
                }
                s.add(contactList[i].email);
                s.add(contactList[i].phoneNumber);
            }
            // adding the newly added contact's data if multiple primary ids don't exist
            if (!isMultiplePrimaryExists) {
                if (!s.has(email) && email.length)
                    emails.push(email);
                if (!s.has(phoneNumber) && phoneNumber.length)
                    phoneNumbers.push(phoneNumber);
                if (obj.insertId)
                    secondaryContactIds.push(obj.insertId);
            }
            return res.status(200).json({
                "contact": {
                    "primaryContactId": contactList[0].id,
                    "emails": emails,
                    "phoneNumbers": phoneNumbers,
                    "secondaryContactIds": secondaryContactIds
                }
            });
        }
    }
    catch (error) {
        return res.status(400).json({ "msg": error });
    }
}));
module.exports = router;
