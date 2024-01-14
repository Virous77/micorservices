import express from "express";
import kafka from "kafka-node";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const userModel = mongoose.model(
  "user",
  new mongoose.Schema({
    name: String,
    age: Number,
  })
);

const client = new kafka.KafkaClient({ kafkaHost: process.env.KAFKA_URL });
const consumer = new kafka.Consumer(
  client,
  [{ topic: process.env.KAFKA_TOPIC }],
  {
    autoCommit: false,
  }
);

consumer.on("message", async function (message) {
  console.log("Message received");
  const user = JSON.parse(message.value);
  const newUser = new userModel({ name: user.name, age: user.age });
  await newUser.save();
});

consumer.on("error", function (err) {
  console.log("Error:", err);
});

const PORT = process.env.PORT || 4001;

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
