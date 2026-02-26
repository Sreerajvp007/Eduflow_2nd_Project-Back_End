import Parent from "../../models/Parent.js";

export const getParentProfile = async (req, res) => {
  try {
    const parent = await Parent.findById(req.user.id).select("-password");

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent not found",
      });
    }

    res.json({
      success: true,
      result: parent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const updateParentProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const parent = await Parent.findById(req.user.id);

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent not found",
      });
    }

    parent.fullName = name || parent.name;
    parent.mobile = phone || parent.phone;

    await parent.save();

    res.json({
      success: true,
      result: parent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Update failed",
    });
  }
};

export const deleteParentProfile = async (req, res) => {
  try {
    await Parent.findByIdAndDelete(req.user.id);

    res.json({
      success: true,
      message: "Profile deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Delete failed",
    });
  }
};
