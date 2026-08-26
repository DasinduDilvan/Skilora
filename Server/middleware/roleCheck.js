
import { errorResponse } from "../utils/apiResponse.js";

const roleCheck = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, "Not authenticated");
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        "You do not have permission to perform this action"
      );
    }

    next();
  };
};
export default roleCheck;