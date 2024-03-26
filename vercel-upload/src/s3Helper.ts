
import { S3 } from "aws-sdk";
import fs from 'fs'
// replace with your own credentials
const s3 = new S3({
    accessKeyId: "ce5e76915ae1449b23f7db3e2c2c709c",
    secretAccessKey: "cf70018845ed064417af9341cac4e68a889a0298bcfc91bb263cf09d3c58d400",
    endpoint: "https://1d99e49ecc699244800764241af3f08a.r2.cloudflarestorage.com"
})

// fileName => output/12312/src/App.jsx
// filePath => /Users/harkiratsingh/vercel/dist/output/12312/src/App.jsx
export const uploadFile = async (fileName: string, localFilePath: string) => {
    const fileContent = fs.readFileSync(localFilePath);
    await s3.upload({
        Body: fileContent,
        Bucket: "vercel-bucket",
        Key: fileName,
    }).promise();
}

//write a function to delete a file from s3
export const deleteFile = async (fileName: string) => {
    const response = await s3.deleteObject({
        Bucket: "vercel-bucket",
        Key: fileName,
    }).promise();
    console.log(response);
}

// write a function to delete a folder from s3
export const deleteFolder = async (folderName: string) => {
    const response = await s3.listObjectsV2({
        Bucket: "vercel-bucket",
        Prefix: ''
    }).promise();
    const objects = response.Contents?.map(object => ({ Key: object.Key! }));
    if (objects?.length) {
        const deleteResponse = await s3.deleteObjects({
            Bucket: "vercel-bucket",
            Delete: { Objects: objects }
        }).promise();
        console.log(deleteResponse);
    }
}
