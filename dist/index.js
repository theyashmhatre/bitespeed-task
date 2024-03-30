"use strict";
// @ts-check
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const PORT = 8000;
app.use(express_1.default.json());
app.use("/", require("./src/routes/identify"));
app.use("*", (req, res) => {
    res.status(404).json({ msg: "Not Found" });
});
app.listen(PORT, () => console.log(`The server has started on port: ${PORT}`));
