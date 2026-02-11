
import jwt from "jsonwebtoken";
import Tutor from "../models/Tutor.js";
import Admin from "../models/Admin.js";

export const protect = (roles = []) => {
  return async (req, res, next) => {
    
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized - No token",
        });
      }

      const token = authHeader.split(" ")[1];

      const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET
      );

      
      if (decoded.role === "tutor") {
        req.user = await Tutor.findById(decoded.id).select("-password");
      } else if (decoded.role === "admin") {
        req.user = await Admin.findById(decoded.id).select("-password");
      }

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

     
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
        });
      }

      next();
    } catch (error) {
      console.error("AUTH ERROR:", error.message);
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }
  };
};
