// library
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import { sql } from "../config/database.js";

// helper function
import { getEnv } from "../utils/getEnv.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";

// type
import type { Request, Response, NextFunction } from "express";
import type { JwtPayload } from "jsonwebtoken";

export const SignupAndLoginWithEmail = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { user_email } = req.body;

    // find user
    const [findUser] = (await sql`
    SELECT 
    user_id 
    FROM users
    WHERE user_email = ${user_email}
    `) as { user_id: number }[];
    if (!findUser) {
      res.status(401).json({ ok: false, msg: "user is not found", data: "" });
    }

    const accessToken = generateAccessToken(findUser.user_id);
    const refreshToken = generateRefreshToken(findUser.user_id);

    res.status(200).json({
      ok: true,
      msg: "Login Success",
      data: { accessToken, refreshToken },
    });
  } catch (error) {
    next(error);
  }
};

const isUserLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      return res
        .status(401)
        .json({ ok: false, msg: "no token provided", data: "" });
    }

    const clientRefreshToken = authHeader.split(" ")[1];

    if (!clientRefreshToken) {
      return res
        .status(401)
        .json({ ok: false, msg: "no token provided", data: "" });
    }

    const payload = jwt.verify(
      clientRefreshToken,
      getEnv("REFRESH_TOKEN_SECRET"),
    ) as JwtPayload;

    if (!payload) {
      return res.status(401).json({ ok: false, msg: "invalid", data: "" });
    }

    // find user
    const [findUser] = (await sql`
    SELECT 
      user_id,
      refresh_token
    FROM users
    WHERE user_id = ${payload.user_id}
    `) as { user_id: number; refresh_token: string }[];

    if (!findUser) {
      return res.status(401).json({ ok: false, msg: "invalid", data: "" });
    }

    const compareRefreshToken = await bcrypt.compare(
      clientRefreshToken,
      findUser.refresh_token,
    );
    if (!compareRefreshToken) {
      return res.status(401).json({ ok: false, msg: "invalid", data: "" });
    }

    const accessToken = generateAccessToken(findUser.user_id);

    res
      .status(200)
      .json({ ok: true, msg: "user login", data: { accessToken } });
  } catch (error) {
    next(error);
  }
};

export { isUserLogin };
