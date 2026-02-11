


export const capitalizeFirst = (text = "") =>
  text.charAt(0).toUpperCase() + text.slice(1);


export const formatTimeAMPM = (time24) => {
  if (!time24) return "";
  const [h, m] = time24.split(":").map(Number);
  const date = new Date();
  date.setHours(h, m, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata"
  });
};
