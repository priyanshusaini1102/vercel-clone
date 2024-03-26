import { S3 } from "aws-sdk"
import fs from 'fs'
import path from "path"

const s3 = new S3({
    accessKeyId: "ce5e76915ae1449b23f7db3e2c2c709c",
    secretAccessKey: "cf70018845ed064417af9341cac4e68a889a0298bcfc91bb263cf09d3c58d400",
    endpoint: "https://1d99e49ecc699244800764241af3f08a.r2.cloudflarestorage.com"
})

// output/asdasd
export async function downloadS3Folder(prefix: string) {
    const allFiles = await s3.listObjectsV2({
        Bucket: "vercel-bucket",
        Prefix: prefix
    }).promise();
    
    // 
    const allPromises = allFiles.Contents?.map(async ({Key}) => {
        if (!Key) return;
        const finalOutputPath = path.join(__dirname, Key);
        const outputFile = fs.createWriteStream(finalOutputPath);
        const dirName = path.dirname(finalOutputPath);
        if (!fs.existsSync(dirName)){
            fs.mkdirSync(dirName, { recursive: true });
        }
        return new Promise((resolve, reject) => {
            s3.getObject({
                Bucket: "vercel-bucket",
                Key
            }).createReadStream().pipe(outputFile)
                .on("finish", () => resolve(""))
                .on("error", reject)
        })
    }) || []
    await Promise.allSettled(allPromises)
    console.log('done files copy to local to deploy')
}
