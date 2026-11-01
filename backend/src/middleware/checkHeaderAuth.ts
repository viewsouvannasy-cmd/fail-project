import { Request, Response, NextFunction } from "express";

const checkHeaderAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({
      ok_verify_token: false,
      msg: "no have token in auth header",
      data: "",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      ok_verify_token: false,
      msg: "no token provided",
      data: "",
    });
  }

  req.body = { ...req.body, token };
  next();
};

export default checkHeaderAuth;
