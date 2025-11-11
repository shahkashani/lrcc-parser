const fs = require("fs");
const path = require("path");
const { parseAlbumBlob } = require("./parseAlbumBlob");

const getFile = (file) =>
  fs.readFileSync(path.join(__dirname, `../mocks/${file}`)).toString("utf8");

const parseFile = (file) => parseAlbumBlob(getFile(file));

describe("parseAlbumBlob", () => {
  describe("root folders", () => {
    it("reads folder information", () => {
      const data = parseFile("albums/rootFolder1.bin");
      expect(data).toMatchObject({
        name: "2025",
      });
      expect(data).not.toHaveProperty("parent");
    });

    it("reads information with boolean flags (that are ignored)", () => {
      const data = parseFile("albums/rootFolder2.bin");
      expect(data).toMatchObject({
        name: "Film",
      });
      expect(data).not.toHaveProperty("parent");
    });
  });

  describe("sub-folders", () => {
    it("reads information", () => {
      expect(parseFile("albums/subFolder1.bin")).toMatchObject({
        name: "1990s",
        parent: {
          id: "b6b2b1349dd343739f649e77c71484fa",
        },
      });
    });

    it("strips extra characters at beginning of name", () => {
      expect(parseFile("albums/subFolder2.bin")).toMatchObject({
        name: "2025-03-20 Tokyo",
        parent: {
          id: "273858b4c4c8461f9a2c96b242b4e29e",
        },
      });
    });
  });

  describe("albums", () => {
    it("reads basic album information", () => {
      expect(parseFile("albums/album1.bin")).toMatchObject({
        name: "Oldies",
        parent: {
          id: "89a1730fb96a4dbab1c38f9bd38e5c2a",
        },
      });
    });

    it("reads dates", () => {
      expect(parseFile("albums/album1.bin")).toMatchObject({
        name: "Oldies",
        userUpdated: "2025-11-04T09:50:15.285Z",
      });
    });

    it("reads shared author information", () => {
      const data = parseFile("albums/sharedAlbum.bin");
      expect(data).toMatchObject({
        name: "2025 Le Doyenné (Shared)",
      });
    });

    it("reads individually shared photos information", () => {
      const data = parseFile("albums/sharedPhotos.bin");
      expect(data).toMatchObject({
        name: "28 April 2025",
      });
    });

    it("strips extra characters at beginning of name", () => {
      expect(parseFile("albums/album2.bin")).toMatchObject({
        name: "2025-03-21 Ginza",
      });
    });

    it("retains accented characters", () => {
      expect(parseFile("albums/albumSpecialChars1.bin")).toMatchObject({
        name: "2025-07-05 Le Doyenné",
      });
    });

    it("retains special characters", () => {
      expect(parseFile("albums/albumSpecialChars2.bin")).toMatchObject({
        name: "2025-06-08 Birthday",
      });
    });
  });

  describe("assets in albums", () => {
    it("reads album asset information", () => {
      expect(parseFile("albumAssets/asset.bin")).toMatchObject({
        album: { id: "6c38fdc9d9874f7a90025e08f221f594" },
        asset: { id: "54e7099ae69840768ca3b70d2fe628b1" },
      });
    });
  });
});
