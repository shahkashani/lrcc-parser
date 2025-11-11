const parseImageBlob = (string) => {
  const captureDateMatch = string.match(
    /captureDate[^A-Za-z0-9]*(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/
  );
  const result = {};
  if (captureDateMatch) {
    result.captureDate = captureDateMatch[1];
  }
  const tagsMatch = string.match(/subject��(.*?)[��ë]/);
  if (tagsMatch) {
    const rawSubject = tagsMatch[1].trim();
    result.tags = rawSubject
      .split(/[^A-Za-z0-9\s-]+/)
      .map((t) => t.trim())
      .filter((t) => t !== "xmp" && t !== "tiff")
      .filter(Boolean);
  }

  return result;
};

module.exports = { parseImageBlob };
