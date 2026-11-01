// library
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import { sql } from "../config/database.js";

// helper function
import { getEnv } from "../utils/getEnv.js";
import { generateAccessToken } from "../utils/generateToken.js";

// type
import type { Request, Response, NextFunction } from "express";
import type { JwtPayload } from "jsonwebtoken";

const refreshToken = async (
  req: Request<{}, {}, { token: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { token } = req.body;

    const payload = jwt.verify(
      token,
      getEnv("REFRESH_TOKEN_SECRET"),
    ) as JwtPayload;

    const [findUser] = (await sql`
    SELECT 
        user_id,
        refresh_token
    FROM users 
    WHERE user_id = ${payload.user_id}
    `) as { user_id: number; refresh_token: string }[];

    if (!findUser) {
      return res
        .status(401)
        .json({ ok: false, msg: "user is not found", data: "" });
    }

    const compareRefreshToken = await bcrypt.compare(
      token,
      findUser.refresh_token,
    );

    if (!compareRefreshToken) {
      return res
        .status(401)
        .json({ ok: false, msg: "invalid token", data: "" });
    }

    const accessToken = generateAccessToken(findUser.user_id);

    res.status(200).json({
      ok: true,
      msg: "got new access token success",
      data: { accessToken },
    });
  } catch (error) {
    next(error);
  }
};

export { refreshToken };
