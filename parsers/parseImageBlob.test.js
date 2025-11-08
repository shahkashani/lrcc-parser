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
});
