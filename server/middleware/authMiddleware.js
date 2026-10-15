import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const forUser = async (req, res, next) => {
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      let token = req.headers.authorization.split(" ")[1];
      let decoded = jwt.verify(token, process.env.JWT_SECRET);
      let user = await User.findById(decoded.id);

      if (!user) {
        res.status(404);
        throw new Error("Invalid Token...");
      }

      //   added user to request object
      req.user = user;
      next();
    } else {
      throw new Error("No Token Found...");
    }
  } catch (error) {
    console.log(error.message);
    res.status(401);
    throw new Error("Given Token Is Incorrect");
  }
};

const forAdmin = async (req, res, next) => {
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice(7).trim()
    : "";

  if (!token) {
    return res.status(401).json({ message: "No Token Found..." });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: "Given Token Is Incorrect" });
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    return res.status(401).json({ message: "Given Token Is Incorrect" });
  }

  if (user.userType !== "ADMIN") {
    return res.status(403).json({ message: "Only Admin Can Access All Users" });
  }

  req.user = user;
  return next();
};

const protect = { forUser, forAdmin };

export default protect;
