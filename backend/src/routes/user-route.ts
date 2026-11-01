import { Router } from "express";

const route = Router();

import { userSetProfile } from "../controllers/user-controller.js";

route.post("/set-profile", userSetProfile);

export default route;
