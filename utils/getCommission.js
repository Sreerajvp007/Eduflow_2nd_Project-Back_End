import PlatformSettings from "../models/platformSettings.js";

export const getCommission = async () => {

  const settings = await PlatformSettings.findOne();

  return settings?.adminCommission || 20;

};