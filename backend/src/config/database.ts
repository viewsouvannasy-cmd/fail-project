import { neon } from "@neondatabase/serverless";

import { getEnv } from "../utils/getEnv.js";

const sql = neon(getEnv("NEON_URL"));

const sleep = (ms: number) => {
  return new Promise<void>((resolve) =>
    setTimeout(() => {
      resolve();
    }, ms),
  );
};

const connectDB = async (retry = 0) => {
  const maxRetries = 5;
  try {
    console.time("time-connect");
    const [connect] = await sql`SELECT NOW()`;
    console.timeEnd("time-connect");

    console.log("NeonDB connected", connect.now);
  } catch (error) {
    console.log(
      `NeonDB connection error (retry ${retry}/${maxRetries})`,
      error,
    );

    if (retry === maxRetries) {
      console.log("Can not connect to NeonDB, exiting.");

      process.exit(1);
    }

    await sleep(5000);
    await connectDB(retry + 1);
  }
};

export { connectDB, sql };
