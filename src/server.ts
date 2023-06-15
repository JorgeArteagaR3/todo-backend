import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import cors from "cors";
import { protect } from "./modules/auth";
import router from "./router";
import { creatNewUser, signIn } from "./handlers/user";
import { body } from "express-validator";
import { handleInputErrors } from "./modules/error";
import path from "path";

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//added to fix the route refreshing error
app.use(express.static(path.join(__dirname, "build")));
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.get("/", (req: Request, res: Response, next: NextFunction) => {
    res.json({ message: "Hello, welcome to my API" });
});

app.use("/api", protect, router);

app.post(
    "/user",
    body("email").exists().isEmail().withMessage("Invalid Email Format"),
    body("username").exists().isString(),
    body("password").exists().isString(),
    handleInputErrors,
    creatNewUser
);
app.post("/signin", handleInputErrors, signIn);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err.cause === "auth") {
        res.status(401).json({ message: "Unauthorized" });
    } else if (err.cause === "input") {
        res.status(400).json({ message: "invalid input" });
    } else {
        res.status(500).json({ message: "oops that's on us" });
    }
});

export default app;
