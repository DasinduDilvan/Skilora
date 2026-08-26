
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { errorResponse } from "../utils/apiResponse.js";

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse(res, 401, "No token provided, access denied");
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findOne({ userId: decoded.userId }).select(
      "-password"
    );

    if (!user) {
      return errorResponse(res, 401, "User not found");
    }

    if (user.isBlocked) {
      return errorResponse(res, 403, "Your account has been blocked");
    }

    if (!user.isActive) {
      return errorResponse(res, 403, "Your account is deactivated");
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    return errorResponse(res, 401, "Invalid token, access denied");
  }
};

export default auth;