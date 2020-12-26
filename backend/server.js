import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Message from "./messageDB.js";
import Pusher from "pusher";
import cors from "cors";

const app = express();
const port = process.env.PORT || 8080;
dotenv.config();
app.use(express.json());
app.use(cors());

const pusher = new Pusher({
  appId: process.env.APPID,
  key: process.env.KEY,
  secret: process.env.SECRET,
  cluster: process.env.CLUSTER,
  useTLS: true,
});

const connection_url = process.env.URL;

mongoose.connect(connection_url, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.once("open", () => {
  console.log("Database is connected");
  const msgCollection = db.collection("messagecontents");
  const changestream = msgCollection.watch();

  changestream.on("change", (change) => {
    if (change.operationType === "insert") {
      const msgDetails = change.fullDocument;

      pusher
        .trigger("messages", "inserted", {
          name: msgDetails.name,
          message: msgDetails.message,
          timestamp: msgDetails.timestamp,
          recieved: msgDetails.received,
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      console.log("Error triggering Pusher");
    }
  });
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
