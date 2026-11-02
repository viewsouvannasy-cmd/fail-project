import { Request, Response } from "express";

const notFoundHandler = (req: Request, res: Response) => {
  res
    .status(404)
    .json({ ok: false, msg: `this url ${req.url} is not found`, data: "" });
};

export default notFoundHandler;
