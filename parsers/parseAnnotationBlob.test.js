const fs = require("fs");
const path = require("path");
const { parseAnnotationBlob } = require("./parseAnnotationBlob");

const getFile = (file) =>
  fs.readFileSync(path.join(__dirname, `../mocks/${file}`)).toString("utf8");

const parseFile = (file) => parseAnnotationBlob(getFile(file));

describe("parseAnnotationBlob", () => {
  it("reads annotation information from JPG", () => {
    expect(parseFile("annotations/imageJpg.bin")).toEqual({
      imagePath: "2021/2021-09-19/IMG_7423-2.jpg",
    });
  });

  it("reads annotation information from HEIC", () => {
    expect(parseFile("annotations/imageHeic.bin")).toEqual({
      imagePath: "2020/2020-02-24/2020-02-24-0003.heic",
    });
  });

  it("reads annotation information from RAF", () => {
    expect(parseFile("annotations/imageRaf.bin")).toEqual({
      imagePath: "2025/2025-04-01/DSCF6671.RAF",
      xmpLocation:
        "/Users/me/Pictures/Lightroom Library.lrlibrary/e1f5d246551243708c4fe56d8cc27afe/settings/f11b693156a9a9f13dda6f300b48332ee37b8bbfa8728198a144c3164f2d27ab",
    });
  });

  it("reads annotation information from RAF with extra characters", () => {
    expect(parseFile("annotations/imageRaf2.bin")).toEqual({
      imagePath: "2025/2025-04-01/DSCF6671.RAF",
      xmpLocation:
        "/Users/me/Pictures/Lightroom Library.lrlibrary/e1f5d246551243708c4fe56d8cc27afe/settings/f11b693156a9a9f13dda6f300b48332ee37b8bbfa8728198a144c3164f2d27ab",
    });
  });

  it("reads annotation information from image with weird separator", () => {
    expect(parseFile("annotations/imageWeird.bin")).toEqual({
      imagePath:
        "2023/2023-08-11/71344101594__6125D9FE-8FCF-442B-BAAF-E2E6559322CD.fullsizerender.HEIC",
    });
  });

  it("reads annotation information from deleted image", () => {
    expect(
      parseFile("annotations/imageLocalOnly.bin").imagePath
    ).toBeUndefined();
  });
});
