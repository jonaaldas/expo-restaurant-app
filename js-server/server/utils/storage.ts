import { createStorage } from "unstorage";
import upstashDriver from "unstorage/drivers/upstash";

const storage = createStorage({
  driver: upstashDriver({
    base: "unstorage",
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  }),
});
export default storage;
