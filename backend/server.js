import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Message from "./messageDB.js";

const app = express();
const port = process.env.PORT || 8080;
dotenv.config();
app.use(express.json());

const connection_url = process.env.URL;

mongoose.connect(connection_url, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.get("/", (req, res) => {
  res.status(200).send("Hello world");
});

app.get("/messages/sync", (req, res) => {
  Message.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

app.post("/messages/new", (req, res) => {
  const dbMessage = req.body;

  Message.create(dbMessage, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(`new message created: \n ${data}`);
    }
  });
});

app.listen(port, () => console.log(`Lisetning on localhost:${port}`));
