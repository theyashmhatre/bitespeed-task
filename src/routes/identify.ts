const connection = require("../db/connection");
import express, { Express, Request, Response } from "express";
const router = express.Router();
import { Contact } from "../interfaces/Contact";
import { linkContacts, createContact, getContacts } from "../utils/helpers";

router.post("/identify", async (req: Request, res: Response) => {
  try {
    let { email, phoneNumber } = req.body;

    const contactList: any = await getContacts({ email, phoneNumber });

    // creating new contact since no overlapping record exist for the given inputs
    if (!contactList.length) {

      const obj: any = await createContact({ email, phoneNumber }, [], true);

      return res.status(200).json({
        "contact": {
          "primaryContatctId": obj.insertId,
          "emails": [email],
          "phoneNumbers": [phoneNumber],
          "secondaryContactIds": []
        }
      })
    }

    else {

      // checking if more than 1 primary contact exists
      const primaryContactsList = contactList.filter((r: any) => r.linkPrecedence === "primary")
      var isMultiplePrimaryExists: boolean = false;

      // if primary contact > 1; linking rest of the contacts to the oldest primary contact record
      if (primaryContactsList.length > 1) {
        isMultiplePrimaryExists = true;

        const primaryId = primaryContactsList[0].id;
        const updatedContactList = contactList.filter((contact: any) => contact.id !== primaryId).map((contact: any) => contact.id)

        await linkContacts(primaryId, updatedContactList)
      }

      var obj: any = [];

      //creating contact in db only if both the details are provided
      if (email && phoneNumber && !isMultiplePrimaryExists) {
        obj = await createContact({ email, phoneNumber }, contactList, false);
      }

      var emails: string[] = [];
      var phoneNumbers: string[] = [];
      var secondaryContactIds: number[] = [];

      let s = new Set();  // to keep track of duplicate emails & phoneNumbers

      // pushing primary contact's details first
      if (contactList[0].email.length) emails.push(contactList[0].email);
      if (contactList[0].phoneNumber.length) phoneNumbers.push(contactList[0].phoneNumber);

      // adding rest of the contact details avoiding duplicates
      for (var i = 0; i < contactList.length; i++) {

        if (i !== 0) {

          //checking if email & phoneNumber is unique and not null
          if (!s.has(contactList[i].email) && contactList[i].email) emails.push(contactList[i].email);
          if (!s.has(contactList[i].phoneNumber) && contactList[i].phoneNumber.length) phoneNumbers.push(contactList[i].phoneNumber);

          secondaryContactIds.push(contactList[i].id);
        }

        s.add(contactList[i].email)
        s.add(contactList[i].phoneNumber)
      }

      // adding the newly added contact's data if multiple primary ids don't exist
      if (!isMultiplePrimaryExists) {
        if (!s.has(email) && email.length) emails.push(email)
        if (!s.has(phoneNumber) && phoneNumber.length) phoneNumbers.push(phoneNumber)

        if (obj.insertId) secondaryContactIds.push(obj.insertId)
      }

      return res.status(200).json({
        "contact": {
          "primaryContactId": contactList[0].id,
          "emails": emails,
          "phoneNumbers": phoneNumbers,
          "secondaryContactIds": secondaryContactIds
        }
      })

    }

  } catch (error) {
    return res.status(400).json({ "msg": error })
  }
})

module.exports = router;