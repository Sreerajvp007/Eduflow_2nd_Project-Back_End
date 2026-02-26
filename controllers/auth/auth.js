import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Admin from "../../models/Admin.js";
import Tutor from "../../models/Tutor.js";
import Parent from "../../models/Parent.js";
import Student from "../../models/Student.js";
import Otp from "../../models/Otp.js";
import { generateOtp, hashOtp } from "../../utils/generateOtp.js";
import { accesstoken, refreshtoken } from "../../utils/token.js";
import sendEmail from "../../utils/sendEmail.js";

// admin login and logout
export const adminLogin = async (req, res) => {
  try {
    const { userName, password } = req.body;
    const admin = await Admin.findOne({ userName });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        result: null,
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        result: null,
      });
    }

    const accessToken = accesstoken({ id: admin._id, role: "admin" });
    const refreshToken = refreshtoken({ id: admin._id, role: "admin" });
    admin.refreshToken = refreshToken;
    await admin.save();

    res.clearCookie("tutorRefreshToken");
    res.clearCookie("parentRefreshToken");

    res.cookie("adminRefreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      samesite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 100,
    });
    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      result: { accessToken, role: admin.role },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "server error",
      result: null,
    });
  }
};

//
export const adminLogout = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (token) {
    await Admin.findOneAndUpdate(
      { refreshToken: token },
      { refreshToken: null },
    );
  }
  res.clearCookie("refreshToken");
  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
    result: null,
  });
};

// tutor signup,login,logout

export const tutorSignup = async (req, res) => {
  try {
    const { fullName, email, mobile, password } = req.body;

    const isTutorExists = await Tutor.findOne({ email });
    if (isTutorExists) {
      return res.status(409).json({
        success: false,
        message: "Tutor already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const tutor = await Tutor.create({
      fullName,
      email,
      mobile,
      password: hashedPassword,
      status: "pending",
      onboardingStatus: "pending",
    });

    const accessToken = accesstoken({ id: tutor._id, role: "tutor" });
    const refreshToken = refreshtoken({ id: tutor._id, role: "tutor" });

    tutor.refreshToken = refreshToken;
    await tutor.save();

    res.cookie("tutorRefreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      result: {
        accessToken,
        tutor: {
          id: tutor._id,
          fullName: tutor.fullName,
          email: tutor.email,
          role: tutor.role,
          status: tutor.status,
          onboardingStatus: tutor.onboardingStatus,
          onboardingStep: tutor.onboardingStep,
          profileCompletion: tutor.profileCompletion,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const tutorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const tutor = await Tutor.findOne({ email }).select("+password");

    if (!tutor) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, tutor.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (tutor.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your account is pending admin approval.",
      });
    }

    const accessToken = accesstoken({ id: tutor._id, role: "tutor" });
    const refreshToken = refreshtoken({ id: tutor._id, role: "tutor" });

    tutor.refreshToken = refreshToken;
    tutor.lastLogin = new Date();
    await tutor.save();

    res.cookie("tutorRefreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      result: {
        accessToken,
        tutor: {
          id: tutor._id,
          fullName: tutor.fullName,
          email: tutor.email,
          role: tutor.role,
          status: tutor.status,
          onboardingStatus: tutor.onboardingStatus,
          onboardingStep: tutor.onboardingStep,
          profileCompletion: tutor.profileCompletion,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const tutorLogout = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (token) {
    await Tutor.findOneAndUpdate(
      { refreshToken: token },
      { refreshToken: null },
    );
  }
  res.clearCookie("refreshToken");
  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
    result: null,
  });
};

// parent sendotp /verify otp /resendotp

export const sendParentOtp = async (req, res) => {
  try {
    const { fullName, email, mobile } = req.body;

    if (!fullName || !email || !mobile) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
        result: null,
      });
    }

    const existingParent = await Parent.findOne({ email });
    if (existingParent) {
      return res.status(409).json({
        success: false,
        message: "Parent already exists",
        result: null,
      });
    }

    const otp = generateOtp();
    const hashedOtp = hashOtp(otp);

    await Otp.findOneAndUpdate(
      { email },
      {
        email,
        otp: hashedOtp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
      { upsert: true },
    );

    await sendEmail({
      to: email,
      subject: "Your OTP Verification Code",
      html: `<h1>${otp}</h1>`,
    });
    console.log(hashedOtp);
    console.log("OTP:", otp);

    return res.json({
      success: true,
      message: "OTP sent to email",
      result: null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      result: null,
    });
  }
};

export const verifyParentOtp = async (req, res) => {
  try {
    const { fullName, email, mobile, otp, child } = req.body;

    if (!fullName || !email || !mobile || !otp) {
      return res.status(400).json({
        success: false,
        message: "All required fields missing",
      });
    }

    const existingParent = await Parent.findOne({ email });
    if (existingParent) {
      return res.status(409).json({
        success: false,
        message: "Parent already exists",
      });
    }

    const otpRecord = await Otp.findOne({ email });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "OTP not found",
      });
    }

    const hashedInputOtp = hashOtp(otp);

    if (otpRecord.otp !== hashedInputOtp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    const parent = await Parent.create({
      fullName,
      email,
      mobile,
      isVerified: true,
      status: "active",
    });

    if (child?.name) {
      await Student.create({
        parentId: parent._id,
        name: child.name,
        grade: child.grade,
        board: child.board,
        status: "active",
      });
    }

    await Otp.deleteOne({ email });

    const accessToken = accesstoken({
      id: parent._id,
      role: "parent",
    });

    const refreshToken = refreshtoken({
      id: parent._id,
      role: "parent",
    });

    parent.refreshToken = refreshToken;
    await parent.save();

    res.cookie("parentRefreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      result: {
        accessToken,
        role: "parent",
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const resendParentOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
        result: null,
      });
    }

    const otp = generateOtp();
    const hashedOtp = hashOtp(otp);

    await Otp.findOneAndUpdate(
      { email },
      {
        email,
        otp: hashedOtp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min
      },
      { upsert: true },
    );

    await sendEmail({
      to: email,
      subject: "Your OTP Verification Code",
      html: `<h1>${otp}</h1>`,
    });

    return res.json({
      success: true,
      message: "OTP resent successfully",
      result: null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      result: null,
    });
  }
};

export const sendParentLoginOtp = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(email);
    console.log("hiy");

    const parent = await Parent.findOne({ email });

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent account not found",
        result: null,
      });
    }

    const otp = generateOtp();
    const hashedOtp = hashOtp(otp);

    await Otp.findOneAndUpdate(
      { email },
      {
        email,
        otp: hashedOtp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
      { upsert: true },
    );

    await sendEmail({
      to: email,
      subject: "Your OTP Verification Code",
      html: `<h1>${otp}</h1>`,
    });
    console.log("LOGIN OTP:", otp);

    return res.json({
      success: true,
      message: "OTP sent to email",
      result: null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      result: null,
    });
  }
};

export const verifyParentLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "OTP not found",
        result: null,
      });
    }

    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
        result: null,
      });
    }

    const hashedInputOtp = hashOtp(otp);

    if (otpRecord.otp !== hashedInputOtp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
        result: null,
      });
    }

    const parent = await Parent.findOne({ email });

    if (!parent || parent.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Account is not active",
        result: null,
      });
    }

    const accessToken = accesstoken({ id: parent._id, role: "parent" });
    const refreshToken = refreshtoken({ id: parent._id, role: "parent" });

    parent.refreshToken = refreshToken;
    await parent.save();

    res.cookie("parentRefreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await Otp.deleteOne({ email });

    return res.json({
      success: true,
      message: "Login successful",
      result: {
        parentId: parent._id,
        accessToken,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      result: null,
    });
  }
};

export const resendParentLoginOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const parent = await Parent.findOne({ email });
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent account not found",
        result: null,
      });
    }

    const otp = generateOtp();
    const hashedOtp = hashOtp(otp);

    await Otp.findOneAndUpdate(
      { email },
      {
        email,
        otp: hashedOtp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
      { upsert: true },
    );

    await sendEmail({
      to: email,
      subject: "Your OTP Verification Code",
      html: `<h1>${otp}</h1>`,
    });
    console.log("RESEND LOGIN OTP:", otp);

    return res.json({
      success: true,
      message: "OTP resent successfully",
      result: null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      result: null,
    });
  }
};

export const refresh = async (req, res) => {
  try {
    const { role } = req.query;

    let refreshToken;

    if (role === "admin") {
      refreshToken = req.cookies.adminRefreshToken;
    } else if (role === "tutor") {
      refreshToken = req.cookies.tutorRefreshToken;
    } else if (role === "parent") {
      refreshToken = req.cookies.parentRefreshToken;
    }

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token" });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    if (decoded.role !== role) {
      return res.status(403).json({ message: "Role mismatch" });
    }

    const newAccessToken = accesstoken({
      id: decoded.id,
      role: decoded.role,
    });

    let userData = null;

    if (role === "admin") {
      const admin = await Admin.findById(decoded.id);
      if (!admin) return res.status(403).json({ message: "User not found" });

      userData = {
        id: admin._id,
        role: "admin",
        email: admin.email,
      };
    }

    if (role === "tutor") {
      const tutor = await Tutor.findById(decoded.id);
      if (!tutor) return res.status(403).json({ message: "User not found" });

      userData = {
        id: tutor._id,
        fullName: tutor.fullName,
        email: tutor.email,
        role: "tutor",
        status: tutor.status,
        onboardingStatus: tutor.onboardingStatus,
        onboardingStep: tutor.onboardingStep,
        profileCompletion: tutor.profileCompletion,
      };
    }

    if (role === "parent") {
      const parent = await Parent.findById(decoded.id);
      if (!parent) return res.status(403).json({ message: "User not found" });

      userData = {
        id: parent._id,
        fullName: parent.fullName,
        email: parent.email,
        role: "parent",
      };
    }

    return res.status(200).json({
      success: true,
      result: {
        accessToken: newAccessToken,
        role,
        user: userData,
      },
    });
  } catch (error) {
    return res.status(403).json({ message: "Refresh expired" });
  }
};

export const parentLogout = async (req, res) => {
  try {
    res.clearCookie("parentRefreshToken", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return res.status(200).json({
      success: true,
      message: "Parent logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};
