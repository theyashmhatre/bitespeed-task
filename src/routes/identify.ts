const connection = require("../db/connection");
import express, { Express, Request, Response } from "express";
const router = express.Router();
import { Contact } from "../interfaces/Contact";
import { createContact, getContacts } from "../utils/helpers";

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

  } catch (error) {
    return res.status(400).json({ "msg": error })
  }
})

module.exports = router;