import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

export const generateOtp = () => {
  const uuid = uuidv4().replace(/\D/g, "");
  return uuid.substring(0, 6).padEnd(6, "0");
};

export const hashOtp = (otp) => {
  return crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");
};

