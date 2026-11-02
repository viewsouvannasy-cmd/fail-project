import express from "express";

// middleware
import errorHandler from "./middleware/errorHandler.js";
import notFoundHandler from "./middleware/notFoundHandler.js";
import verifyJwt from "./middleware/token/verifyJwt.js";
import checkHeaderAuth from "./middleware/checkHeaderAuth.js";

// routes
import authRoute from "./routes/auth-route.js";
import oauthRoute from "./routes/oauth-route.js";
import userRoute from "./routes/user-route.js";
import refreshTokenRoute from "./routes/refresh-token-route.js";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => res.status(200).send("ok"));

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/oauth", oauthRoute);
app.use("/api/v1/refresh-token", checkHeaderAuth, refreshTokenRoute);

app.use("/api/v1/user", verifyJwt, userRoute);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
