const parseImageBlob = (string) => {
const match = string.match(/<x:xmpmeta[\s\S]*?<\/x:xmpmeta>/s);
  if (match) {
    return {
      xmpString: match[0],
    };
  }
  return  {};
};

module.exports = { parseImageBlob };
