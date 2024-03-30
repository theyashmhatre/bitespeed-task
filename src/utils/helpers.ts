const connection = require("./connection");
import { Contact } from "../interfaces/Contact";


export const getContacts = async (payload: Contact) => {

  return new Promise((resolve, reject) => {

    const { email, phoneNumber } = payload;

    let condition = email && phoneNumber ? `(email = '${email}' OR phoneNumber = '${phoneNumber}')` : !email ? `(phoneNumber = '${phoneNumber}')` : `(email = '${email}')`
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
                  `
    connection.query(query,
      function (err: unknown, result: unknown) {
        if (err) reject(err);

        resolve(result);
      });
  })
}


export const createContact = async (currContact: Contact, contactList: any, isPrimary: boolean) => {
  let query: string = isPrimary ? `insert into contact (email, phoneNumber, linkPrecedence) values ('${currContact.email}', '${currContact.phoneNumber}', 'primary')` :
    `insert into contact (email, phoneNumber, linkPrecedence, linkedId) values ('${currContact.email}', '${currContact.phoneNumber}', 'secondary', '${contactList[0].id}')`
  return new Promise((resolve, reject) => {
    connection.query(query,
      function (err: unknown, result: unknown) {
        if (err) reject(err);

        resolve(result);
      });
  })
}

export const linkContacts = async (primaryId: number, contactList: string[]) => {
  return new Promise((resolve, reject) => {
    const formattedIds = contactList.map(id => `'${id}'`).join(',')
    connection.query(`update contact SET linkedId = '${primaryId}', linkPrecedence = 'secondary' WHERE id in (${formattedIds})`,
      function (err: unknown, result: unknown) {
        if (err) reject(err);

        resolve(result);
      });
  })
}