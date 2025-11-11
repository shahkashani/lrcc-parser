const fs = require("fs");
const path = require("path");
const { parseImageBlob } = require("./parseImageBlob");

const getFile = (file) =>
  fs.readFileSync(path.join(__dirname, `../mocks/${file}`)).toString("utf8");

const parseFile = (file) => parseImageBlob(getFile(file));

describe("parseImageBlob", () => {
  it("reads capture date string", () => {
    expect(parseFile("images/image.bin")).toEqual({
      captureDate: "1999-07-01T03:47:20",
    });
  });

  it("reads capture date from invalid file", () => {
    expect(parseFile("images/imageWithInvalidDate.bin")).toEqual({
      captureDate: "1999-07-01T03:47:20",
    });
  });

  it("reads tags", () => {
    expect(parseFile("images/imageWithTags.bin")).toEqual({
      captureDate: "2013-03-11T11:59:50",
      tags: ["Ricoh KR-5", "Perutz Primera 200"],
    });

    expect(parseFile("images/imageWithTag.bin")).toEqual({
      captureDate: "2007-02-13T23:04:00",
      tags: ["Merlin"],
    });

    expect(parseFile("images/imageWithTag2.bin")).toEqual({
      captureDate: "2019-01-20T23:40:32",
      tags: ["Night Passage"],
    });
  });
});
