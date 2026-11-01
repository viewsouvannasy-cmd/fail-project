import { Router } from "express";

import {
  SignupAndLoginWithEmail,
  isUserLogin,
} from "../controllers/auth-controller.js";

const route = Router();

route.post("/signup-login", SignupAndLoginWithEmail);
route.get("/is-user-login", isUserLogin);

export default route;
