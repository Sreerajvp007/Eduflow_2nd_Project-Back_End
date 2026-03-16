import PlatformSettings from "../models/PlatformSettings.js";

export const getCommission = async () => {

  const settings = await PlatformSettings.findOne();

  return settings?.adminCommission || 20;

};