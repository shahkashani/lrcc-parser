const sqlite3 = require("sqlite3");
const { parseAlbumBlob } = require("../parsers/parseAlbumBlob");

const sanitizePathPart = (part) => (part || "").replace(/[\/\\]/g, "").trim();
const sortByName = (a, b) => a.name.localeCompare(b.name);

async function readDb(dbPath) {
  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error("Failed to open DB:", err);
      process.exit(1);
    }
  });

  function dbAllAsync(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  const [albumRows, assetRows, linkRows] = await Promise.all([
    dbAllAsync(`
      SELECT d.fullDocId, r.content
      FROM docs d
      JOIN revs r ON d.winningRevSequence = r.sequence
      WHERE d.type = 'album' AND d.deleted = 0
    `),
    dbAllAsync(`
      SELECT d.fullDocId
      FROM docs d
      JOIN revs r ON d.winningRevSequence = r.sequence
      WHERE d.type = 'asset' AND d.deleted = 0
    `),
    dbAllAsync(`
      SELECT r.content
      FROM docs d
      JOIN revs r ON d.winningRevSequence = r.sequence
      WHERE d.type = 'album_asset' AND d.deleted = 0
    `),
  ]);

  const albumsById = new Map();
  albumRows.forEach(({ fullDocId, content }) => {
    const parsed = parseAlbumBlob(content);
    if (parsed && parsed.name) {
      albumsById.set(fullDocId, {
        id: fullDocId,
        name: parsed.name,
        parentId: parsed.parent?.id || null,
        children: [],
        assets: [],
      });
    }
  });

  const assetsById = new Map();
  assetRows.forEach(({ fullDocId }) => {
    assetsById.set(fullDocId, { fullDocId });
  });

  linkRows.forEach(({ content }) => {
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
  function buildPaths(albums, parentPath = "") {
    albums.forEach((album) => {
      const pathpart = sanitizePathPart(album.name);
      const fullPath = parentPath ? `${parentPath}/${pathpart}` : pathpart;
      if (album.assets.length > 0) {
        result.push({
          album: fullPath,
          photos: album.assets.length,
        });
      }

      if (album.children.length > 0) {
        buildPaths(album.children.sort(sortByName), fullPath);
      }
    });
  }

  buildPaths(rootAlbums.sort(sortByName));

  db.close();
  return result;
}

module.exports = readDb;
