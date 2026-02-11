import Tutor from '../../models/Tutor.js';




export const getPendingTutors = async (req, res) => {
  try {
    const tutors = await Tutor.find({
      onboardingStatus: "submitted",
      isApproved: false,
    })
      .select("fullName email subjects createdAt onboardingStatus");

    res.status(200).json({
      success: true,
      result: tutors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending tutors",
    });
  }
};

export const getTutorDetails = async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.params.id);

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor not found",
      });
    }

    res.status(200).json({
      success: true,
      result: tutor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch tutor details",
    });
  }
};

export const approveTutor = async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.params.id);

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor not found",
      });
    }

    if (tutor.onboardingStatus === "approved") {
      return res.status(400).json({
        success: false,
        message: "Tutor already approved",
      });
    }

    tutor.onboardingStatus = "approved";
    tutor.isApproved = true;
    tutor.approvedAt = new Date();
    tutor.rejectionReason = null;

    await tutor.save();

    res.status(200).json({
      success: true,
      message: "Tutor approved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to approve tutor",
    });
  }
};

export const rejectTutor = async (req, res) => {
  try {
    const { reason } = req.body;

    const tutor = await Tutor.findById(req.params.id);

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor not found",
      });
    }

    tutor.onboardingStatus = "rejected";
    tutor.isApproved = false;
    tutor.rejectionReason = reason || "Not specified";

    await tutor.save();

    res.status(200).json({
      success: true,
      message: "Tutor rejected successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to reject tutor",
    });
  }
};

// 

export const listTutors = async (req, res) => {
  try {
    const { search, status, subject, page = 1, limit = 10 } = req.query;

    const query = {};

    // 🔹 Status filter (active / suspended / blocked)
    if (status) {
      query.status = status;
    }

    // 🔹 Subject filter (array-safe)
    if (subject) {
      query.subjects = { $in: [subject] };
    }

    // 🔹 Search (name or subject)
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { subjects: { $regex: search, $options: "i" } },
      ];
    }

    const tutors = await Tutor.find(query)
      .select(
        "fullName email subjects status onboardingStatus rating profileImage"
      )
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Tutor.countDocuments(query);

    res.status(200).json({
      success: true,
      result: tutors,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch tutors",
    });
  }
};



export const updateTutorStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const allowedStatuses = ["active", "blocked", "suspended"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const tutor = await Tutor.findById(id);

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor not found",
      });
    }

    tutor.status = status;
    await tutor.save();

    res.status(200).json({
      success: true,
      message: `Tutor status updated to ${status}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update tutor status",
    });
  }
};

