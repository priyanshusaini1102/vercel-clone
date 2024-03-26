import { createClient, commandOptions } from "redis";
import { downloadS3Folder } from "./s3Helper";
import { buildProject, copyFinalDist } from "./utils";

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