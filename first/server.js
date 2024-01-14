import express from "express";
import kafka from "kafka-node";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

const client = new kafka.KafkaClient({ kafkaHost: process.env.KAFKA_URL });
const producer = new kafka.Producer(client);
const kafka_topic = process.env.KAFKA_TOPIC;

const userModel = mongoose.model(
  "user",
  new mongoose.Schema({
    name: String,
    age: Number,
  })
);

app.get("/", (req, res) => {
  res.send("Hello World");
});

producer.on("ready", function () {
  console.log("Producer is ready");
  app.post("/user", async (req, res) => {
    const data = req.body;

    const payload = {
      topic: kafka_topic,
      messages: JSON.stringify(data),
    };
    producer.send([payload], async function (err, data) {
      if (err) {
        console.log(kafka_topic, "broker update failed");
      } else {
        const user = new userModel(data);
        await user.save();
        console.log(kafka_topic, "broker update success");
      }
    });
    res.status(200).json({ message: "success" });
  });
});

producer.on("error", function (error) {
  console.log(error);
});

const PORT = process.env.PORT || 4000;

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("MongoDB is connected");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
