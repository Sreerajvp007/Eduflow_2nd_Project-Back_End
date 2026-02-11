import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "tutor/profile",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

const docStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "tutor/documents",
    resource_type: "auto",
    allowed_formats: ["jpg", "jpeg", "png", "pdf"],
  },
});

export const uploadProfileImage = multer({ storage: imageStorage });
export const uploadDocuments = multer({ storage: docStorage });
