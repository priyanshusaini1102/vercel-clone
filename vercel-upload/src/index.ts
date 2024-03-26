import cors from "cors";
import express from "express";
import simpleGit from "simple-git";
import { generate, getAllFiles } from "./utils";
import path from "path";
import { deleteFolder, uploadFile } from "./s3Helper";
import { createClient } from "redis";
import dotenv from 'dotenv'
dotenv.config()
// if i want to connect remote redis

const publisher = createClient({
  url: 'rediss://red-co0k8fvsc6pc738rek00:WiyC38q1Da5gYnDHubgrjbcLmAbWncVe@singapore-redis.render.com:6379'
});
publisher.connect();
publisher.lPush('test-queue', "priyanshu-upload")

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT;

app.get("/", (req, res) => {
  res.send("hello world");
});

// POSTMAN
app.post("/deploy", async (req, res) => {
  console.log(req.body.repoUrl);
  const repoUrl = req.body.repoUrl;
  const id = generate();
  try {
    await simpleGit().clone(repoUrl, path.join(__dirname, `output/${id}`));

    //get all files path array with filename
    const files = getAllFiles(path.join(__dirname, `output/${id}`));
    files.forEach(async (file) => {
      await uploadFile(file.slice(__dirname.length + 1), file);
    });
    await new Promise((resolve) => setTimeout(resolve, 5000));
    publisher.lPush("build-queue", id);
    publisher.hSet("status", id, "uploaded");
    res.send({ success: true, id, repoUrl });
  } catch (e) {
    console.log(e);
    res.send({ success: false, errorMessage: "Something went wrong" });
  }
});

app.get("/status", async (req, res) => {
  const id = req.query.id;
  const response = await publisher.hGet("status", id as string);
  res.json({
    status: response,
  });
});

app.post("/delete", async (req, res) => {
  console.log(req.body.folderName);
  const folderName = req.body.folderName;
  try {
    await deleteFolder(folderName);
    res.send({ success: true, folderName });
  } catch (e) {
    console.log(e);
    res.send("Something went wrong");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
