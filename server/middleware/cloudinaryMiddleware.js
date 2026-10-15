import { v2 as cloudinary } from "cloudinary";
import fs from "node:fs";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: "hljx8jqc",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (filelink) => {
  // upload image
  const uploadResult = await cloudinary.uploader
    .upload(filelink, {
      resource_type: "auto",
    })
    .catch((error) => {
      console.log(error);
      //   if failes remove file our server
      fs.unlinkSync(filelink);
    });

  return uploadResult;
};

export default uploadToCloudinary;
