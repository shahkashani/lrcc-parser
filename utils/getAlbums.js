const sqlite3 = require("sqlite3").verbose();
const { parseAlbumBlob } = require("../parsers/parseAlbumBlob");
const { parseAnnotationBlob } = require("../parsers/parseAnnotationBlob");
const { parseImageBlob } = require("../parsers/parseImageBlob");

const sanitizePathPart = (part) => (part || "").replace(/[\/\\]/g, "").trim();
const sortByName = (a, b) => a.name.localeCompare(b.name);

async function readDb(dbPath) {
  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error("Failed to open DB:", err);
      process.exit(1);
    }
  });

  function dbEachAsync(sql, params = []) {
    return new Promise((resolve, reject) => {
      const rows = [];
      db.each(
        sql,
        params,
        (err, row) => {
          if (err) return reject(err);
          rows.push(row);
        },
        (err) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  const albumRows = await dbEachAsync(`
    SELECT d.fullDocId, r.content, d.deleted
    FROM docs d
    JOIN revs r ON d.winningRevSequence = r.sequence
    WHERE d.type = 'album'
  `);

  const albumsById = new Map();
  albumRows.forEach(({ fullDocId, content, deleted }) => {
    if (deleted) {
      return;
    }
    const parsed = parseAlbumBlob(content);
    if (parsed && parsed.name) {
      albumsById.set(fullDocId, {
        id: fullDocId,
        name: parsed.name,
        userUpdated: parsed.userUpdated,
        parentId: parsed.parent?.id || null,
        children: [],
        assets: [],
      });
    }
  });

  const assetRows = await dbEachAsync(`
    SELECT d.fullDocId, d.annotation, r.content, d.deleted
    FROM docs d
    JOIN revs r ON d.winningRevSequence = r.sequence
    WHERE d.type = 'asset'
  `);

  const assetsById = new Map();
  assetRows.forEach((row) => {
    const { fullDocId, annotation, content, deleted } = row;
    if (deleted) {
      return;
    }
    const { imagePath: path, xmpLocation } = parseAnnotationBlob(annotation);

    if (!path) {
      return;
    }

    const { captureDate, tags } = parseImageBlob(content);
    const asset = { path, xmpLocation, captureDate };
    assetsById.set(fullDocId, asset);
  });

  const linkRows = await dbEachAsync(`
    SELECT r.content, d.deleted
    FROM docs d
    JOIN revs r ON d.winningRevSequence = r.sequence
    WHERE d.type = 'album_asset'
  `);

  linkRows.forEach(({ content, deleted }) => {
    if (deleted) {
      return;
    }
    const parsed = parseAlbumBlob(content);
    if (!parsed?.album?.id || !parsed?.asset?.id) return;
    const album = albumsById.get(parsed.album.id);
    const asset = assetsById.get(parsed.asset.id);
    if (album && asset) album.assets.push(asset);
  });

  const rootAlbums = [];
  albumsById.forEach((album) => {
    if (album.parentId && albumsById.has(album.parentId)) {
      albumsById.get(album.parentId).children.push(album);
    } else {
      rootAlbums.push(album);
    }
  });

  const result = [];
  const xmps = {};
  function buildPaths(albums, parentPath = "") {
    albums.forEach((album) => {
      const pathpart = sanitizePathPart(album.name);
      const fullPath = parentPath ? `${parentPath}/${pathpart}` : pathpart;
      if (album.assets.length > 0) {
        for (const asset of album.assets) {
          if (asset.xmpLocation) {
            xmps[asset.path] = asset.xmpLocation;
          }
        }
        result.push({
          album: fullPath,
          albumUpdated: album.userUpdated,
          photos: album.assets.map(({ path, captureDate }) => ({
            path,
            captureDate,
          })),
        });
      }
      if (album.children.length > 0) {
        buildPaths(album.children.sort(sortByName), fullPath);
      }
    });
  }

  buildPaths(rootAlbums.sort(sortByName));

  db.close();

  // Is this needed?
  const xmpsSeen = {};
  for (const file of Object.keys(xmps)) {
    if (xmpsSeen[xmps[file]]) {
      delete xmps[file];
    }
    xmpsSeen[xmps[file]] = true;
  }

  for (const album of result) {
    for (const photo of album.photos) {
      if (xmps[photo.path]) {
        photo.xmp = xmps[photo.path];
      }
    }
  }

  return result;
}

module.exports = readDb;
