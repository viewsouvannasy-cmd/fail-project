// library
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";

import { sql } from "../config/database.js";

// config
import client from "../config/google-client.js";

// helper function
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";
import { getEnv } from "../utils/getEnv.js";

const googleRegister = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({
      ok_verify_token: false,
      msg: "no have token in auth header",
      data: "",
    });
  }

  const idToken = authHeader.split(" ")[1];

  if (!idToken) {
    return res.status(401).json({
      ok_verify_token: false,
      msg: "no token provided",
      data: "",
    });
  }

  const ticket = await client.verifyIdToken({
    idToken,
    audience: [getEnv("GOOGLE_CLIENT_WEB_ID"), getEnv("GOOGLE_CLIENT_IOS_ID")],
  });

  const payload = ticket.getPayload();

  // find existing user
  const [findUser] = (await sql`
  SELECT 
    user_id
  FROM users
  WHERE user_email = ${payload?.email}
  `) as { user_id: number }[];

  if (findUser) {
    const refreshToken = generateRefreshToken(findUser.user_id);
    const accesstoken = generateAccessToken(findUser.user_id);

    // hash refresh token
    const hashRefreshToken = await bcrypt.hash(refreshToken, 10);
    await sql`
    UPDATE users 
    SET refresh_token = ${hashRefreshToken}
    WHERE user_id = ${findUser.user_id}
    `;

    return res.status(200).json({
      ok: true,
      msg: "register success",
      data: { isNewUser: false, refreshToken, accesstoken },
    });
  }

  const [results] = (await sql`
  INSERT INTO users (user_name, user_email, avatar, bg, profile_url, image_id, refresh_token)
    VALUES (
    ${payload?.name},
    ${payload?.email},
    ${null},
    ${null},
    ${payload?.picture},
    ${null},
    ${null}
    ) 
    RETURNING user_id, user_name
  `) as { user_id: number; user_name: string }[];

  const refreshToken = generateRefreshToken(results.user_id);
  const accesstoken = generateAccessToken(results.user_id);

  // hash refresh token
  const hashRefreshToken = await bcrypt.hash(refreshToken, 10);

  await sql`
  UPDATE users 
  SET refresh_token = ${hashRefreshToken}
  WHERE user_id = ${results.user_id}
  `;

  res.status(200).json({
    ok: true,
    msg: "register success",
    data: {
      user_name: results.user_name,
      isNewUser: true,
      refreshToken,
      accesstoken,
    },
  });
  try {
  } catch (error) {
    next(error);
  }
};

export { googleRegister };
