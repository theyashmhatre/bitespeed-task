const db = require("../db/connection");
import express, { Express, Request, Response } from "express";
const router = express.Router();

router.post("/identity", (req, res) => {
  try {
    let { email, phone } = req.body;

    return res.status(200).json({ "success": `done! ${email} ${phone}` })

  } catch (error) {
    return res.status(400).json({ "msg": error })
  }
})

module.exports = router;