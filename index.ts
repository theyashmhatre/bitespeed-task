// @ts-check

require("dotenv").config();
import express, { Express, Request, Response } from "express";
const app: express.Application = express();

const PORT: number = 8000;
app.use(express.json());


app.use("/", require("./src/routes/identify"))

app.use("*", (req: Request, res: Response) => {
  res.status(404).json({ msg: "Not Found" });
});

app.listen(PORT, () => console.log(`The server has started on port: ${PORT}`));