import PlatformSettings from "../models/platformSettings.js";

export const initPlatformSettings = async () => {

  const exists = await PlatformSettings.findOne();

  if(!exists){

    await PlatformSettings.create({
      adminCommission:20,
      tutorCommission:80
    });

    console.log("Platform settings created");

  }

};