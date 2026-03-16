import Parent from "../models/Parent.js";

export const checkParentDeleted = async (req, res, next) => {
  try {

    const parent = await Parent.findById(req.user.id);

    if (!parent || parent.isDeleted) {
      return res.status(403).json({
        success: false,
        message: "Account has been deleted",
      });
    }

    next();

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Authorization error",
    });
  }
};