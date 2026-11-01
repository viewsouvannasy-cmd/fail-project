import { Router } from "express";

const route = Router();

import { googleRegister } from "../controllers/oauth-controller.js";

route.get("/google/register", googleRegister);

export default route;
