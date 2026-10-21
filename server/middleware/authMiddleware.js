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

      req.user = user;
      if (user.userType === "ADMIN") {
        next();
      } else {
        res.status(401);
        throw new Error("Only Admin Can Access All Users");
      }
    } else {
      throw new Error("No Token Found...");
    }
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) res.status(401);
    throw new Error(error.message || "Given Token Is Incorrect");
  }
};

const protect = { forUser, forAdmin };

export default protect;
