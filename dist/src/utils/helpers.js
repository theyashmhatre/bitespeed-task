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
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkContacts = exports.createContact = exports.getContacts = void 0;
const connection = require("./connection");
const getContacts = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        const { email, phoneNumber } = payload;
        let condition = email && phoneNumber ? `(email = '${email}' OR phoneNumber = '${phoneNumber}')` : !email ? `(phoneNumber = '${phoneNumber}')` : `(email = '${email}')`;
        let query = `SELECT *
                    FROM contact
                    WHERE ${condition}
                    OR
                    id = (
                        SELECT linkedId
                        FROM contact
                        WHERE ${condition}
                        ORDER BY createdAt
                        LIMIT 1
                    )
                    OR linkedId = (
                    SELECT linkedId
                        FROM contact
                        WHERE ${condition}
                        ORDER BY createdAt
                        LIMIT 1
                    ) OR linkedId = (
                    SELECT id
                        FROM contact
                        WHERE ${condition}
                        ORDER BY createdAt
                        LIMIT 1
                    )
                  `;
        connection.query(query, function (err, result) {
            if (err)
                reject(err);
            resolve(result);
        });
    });
});
exports.getContacts = getContacts;
const createContact = (currContact, contactList, isPrimary) => __awaiter(void 0, void 0, void 0, function* () {
    let query = isPrimary ? `insert into contact (email, phoneNumber, linkPrecedence) values ('${currContact.email}', '${currContact.phoneNumber}', 'primary')` :
        `insert into contact (email, phoneNumber, linkPrecedence, linkedId) values ('${currContact.email}', '${currContact.phoneNumber}', 'secondary', '${contactList[0].id}')`;
    return new Promise((resolve, reject) => {
        connection.query(query, function (err, result) {
            if (err)
                reject(err);
            resolve(result);
        });
    });
});
exports.createContact = createContact;
const linkContacts = (primaryId, contactList) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        const formattedIds = contactList.map(id => `'${id}'`).join(',');
        connection.query(`update contact SET linkedId = '${primaryId}', linkPrecedence = 'secondary' WHERE id in (${formattedIds})`, function (err, result) {
            if (err)
                reject(err);
            resolve(result);
        });
    });
});
exports.linkContacts = linkContacts;
