

// Map of school keys (case-insensitive) to regex patterns
export const schoolEmailPatterns: { [schoolKey: string]: RegExp } = {
  "UNILAG": /^[0-9]{9}@live\.unilag\.edu\.ng$/i,
  // future schools:
  // "SCHOOL2": /^pattern2$/i,
  // "XYZUNI": /^patternXYZ$/i,
};
