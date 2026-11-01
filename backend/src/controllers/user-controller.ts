import { Request, Response, NextFunction } from "express";

import { sql } from "../config/database.js";

const userSetProfile = async (
  req: Request<
    {},
    {},
    { user_name: string; avatar: string; bg: string; user_id: number }
  >,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { user_name, avatar, bg, user_id } = req.body;

    console.log(user_name);

    if (!user_name || !avatar || !bg) {
      return res
        .status(400)
        .json({ ok: false, msg: "Please provide all require", data: "" });
    }

    if (user_name.length < 3) {
      return res.status(400).json({
        ok: false,
        msg: "Name length should more then 3 character",
        data: "",
      });
    }

    if (user_name.length > 50) {
      return res.status(400).json({
        ok: false,
        msg: "Name length should less then 50 character",
        data: "",
      });
    }

    await sql`
    UPDATE users 
    SET user_name = ${user_name},
        avatar = ${avatar},
        bg = ${bg}
    WHERE user_id = ${user_id}
    `;

    res.status(200).json({ ok: true, msg: "Set ptofile success", data: "" });
  } catch (error) {
    next(error);
  }
};

export { userSetProfile };
