const colorSwatchValues = {
  beige: "#E8E1D3",
  burgundy: "#800020",
  charcoal: "#36454F",
  "dark blue": "#17365D",
  "dark green": "#1F4D36",
  "dark wash": "#34516D",
  gray: "#707783",
  "heather gray": "#858585",
  khaki: "#C3B091",
  lavender: "#A78BCE",
  "light blue": "#8DB9D8",
  "navy blue": "#203A5D",
  "navy palms": "#203A5D",
  olive: "#667344",
  pink: "#F1C1C8",
  red: "#DC2626",
  "tropical print":
    "linear-gradient(135deg, #D97645 0 33%, #55784B 33% 66%, #E8C968 66%)",
  white: "#FFFFFF",
  yellow: "#E8B62D",
};

export const getColorSwatchValue = (color) => {
  const normalizedColor = color.trim().toLowerCase();
  if (CSS.supports("color", color)) return color;
  return colorSwatchValues[normalizedColor] || "#D8D2C8";
};
