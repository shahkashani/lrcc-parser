const parseAnnotationBlob = (string) => {
  if (string.indexOf("deleted") !== -1) {
    return {};
  }
  const parts = string
    .split("�")
    .filter(
      (part) =>
        part.indexOf("settings") !== -1 || part.indexOf("originals") !== -1
    );
  const record = {};
  for (const part of parts) {
    const xmpMatch = part.match(/(\/.*\/settings\/.*)/);
    if (xmpMatch) {
      record.xmpLocation = xmpMatch[1];
    }
    const imageMatch = part.match(/\/.*\/originals\/(.*)/);
    if (imageMatch) {
      record.imagePath = imageMatch[1];
    }
  }
  return record;
};

module.exports = { parseAnnotationBlob };
