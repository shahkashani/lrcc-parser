const parseAlbumBlob = (inputString) => {
  const delimiter = "�";

  function splitRecords(str) {
    const parts = [];
    let start = 0;
    let idx;
    while ((idx = str.indexOf(delimiter, start)) !== -1) {
      parts.push(str.substring(start, idx));
      start = idx + delimiter.length;
    }
    if (start < str.length) {
      parts.push(str.substring(start));
    }
    return parts;
  }

  const cleanValue = (value) => value?.trim().replace(/^[^\w\d]+/, "") || "";

  const fixName = (name) =>
    name.replace(/.[0-9]{4}-[0-9]{2}-[0-9]{2}/, (m) => m.slice(1));

  const parts = splitRecords(inputString);
  const record = {};

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    switch (part) {
      case "type":
        record.type = cleanValue(parts[++i]);
        break;
      case "name":
        record.name = fixName(cleanValue(parts[++i]));
        break;
      case "author":
        record.author = cleanValue(parts[++i]);
        break;
      case "parent": {
        const next = parts[++i];
        if (!next && parts[i + 1] === "id") {
          i++;
          record.parent = { id: cleanValue(parts[++i]) };
        }
        break;
      }
      case "album": {
        const next = parts[++i];
        if (!next && parts[i + 1] === "id") {
          i++;
          record.album = { id: cleanValue(parts[++i]) };
        }
        break;
      }
      case "asset": {
        const next = parts[++i];
        if (!next && parts[i + 1] === "id") {
          i++;
          record.asset = { id: cleanValue(parts[++i]) };
        }
        break;
      }
    }
  }

  return record;
};

module.exports = { parseAlbumBlob };
