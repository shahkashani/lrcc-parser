const parseImageBlob = (string) => {
  const captureDateMatch = string.match(
    /captureDate[^A-Za-z0-9]*(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/
  );
  if (captureDateMatch) {
    return {
      captureDate: captureDateMatch[1],
    };
  }
  return {};
};

module.exports = { parseImageBlob };
