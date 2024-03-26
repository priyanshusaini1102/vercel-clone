import { createClient, commandOptions } from "redis";
import { downloadS3Folder } from "./s3Helper";
import { buildProject, copyFinalDist } from "./utils";
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
dotenv.config()
const app = express()
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT

const subscriber = createClient({
    url: 'rediss://red-co0k8fvsc6pc738rek00:WiyC38q1Da5gYnDHubgrjbcLmAbWncVe@singapore-redis.render.com:6379'
  })
subscriber.connect()

async function main() {
    console.log(`Service is running...`)
    while(1) {
        const res = await subscriber.brPop(
            commandOptions({ isolated: true }),
            'build-queue',
            0
          );
        // ignore tslint
        // @ts-ignore
        const id = res.element
		    console.log(id)
        await downloadS3Folder(`output/${id}`)
        await buildProject(id)
        copyFinalDist(id)
        subscriber.hSet('status', id, 'deployed')
    }
}
main();

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: "server is running"
  })
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  
})