import express from "express";
import { Response } from "express-serve-static-core";
import { startBot } from "./app";
import http from "http";

const app = express();
const PORT = process.env.PORT || 5000;
let count = 0;

app.get("/", (req, res) => {
  res.send(`Campaign Manager is running: ${++count}`);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

startBot();

setInterval(function () {
  http.get("http://campaign-mgr.herokuapp.com");
}, 300000); // every 5 minutes (300000)
