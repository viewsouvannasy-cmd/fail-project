import { Router } from "express";

import { refreshToken } from "../controllers/refresh-token-controller.js";

const route = Router();

route.get("/", refreshToken);

export default route;
