import { Router } from "express";

import { isUserLogin } from "../controllers/auth-controller.js";

const route = Router();

route.get("/is-user-login", isUserLogin);

export default route;
