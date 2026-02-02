export const calculateProfileCompletion = (tutor) => {
  let percent = 0;

  if (tutor.bio) percent = 30;
  if (tutor.teachingExperience && tutor.hourlyRate) percent = 40;
  if (tutor.qualifications.length) percent = 70;
  if (tutor.idVerification.length) percent = 90;
  if (tutor.onboardingStatus === "submitted") percent = 100;

  return percent;
};
