import express from "express";
import { S3 } from "aws-sdk";
import mime from "mime-types";
import dotenv from 'dotenv';
dotenv.config()

const PORT = process.env.PORT;

const s3 = new S3({
    accessKeyId: "ce5e76915ae1449b23f7db3e2c2c709c",
    secretAccessKey: "cf70018845ed064417af9341cac4e68a889a0298bcfc91bb263cf09d3c58d400",
    endpoint: "https://1d99e49ecc699244800764241af3f08a.r2.cloudflarestorage.com"
})

const app = express();

app.use((req, res, next) => {
    if (!req.secure) {
        res.redirect(301, `https://${req.headers.host}${req.url}`);
    } else {
        next();
    }
});

app.get("/*", async (req, res) => {
    // id.100xdevs.com
    const host = req.hostname;

    const id = host.split(".")[0];
    const filePath = req.path;
    console.log({ id, filePath });

    try {
        const contents = await s3.getObject({
            Bucket: "vercel-bucket",
            Key: `dist/${id}${filePath}`
        }).promise();

        const contentType = mime.lookup(filePath) || "application/octet-stream";
        res.set("Content-Type", contentType);
        res.send(contents.Body);
    } catch (e: any) {
        console.error("Error fetching S3 object:", e);
        res.status(500).send({ success: false, message: e.message });
    }
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
});
