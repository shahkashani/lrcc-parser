# LRCC Library Parser

This is an extremely janky tool used to help back up your LRCC photos while maintaining the album structure.

By default, saving originals locally arranges the photos into YYYY/YYYY-MM-DD folders, and this tool gives you a mapping of albums to lists of files.

# How to use

![LRCC Settings](images/settings.webp "LRCC Settings")

1. Store a copy of your originals locally (see above)
2. Wait for all of the photos to be downloaded

```bash
npm install lrcc-parser
```

```javascript
const { parseLibrary } = require("lrcc-parser");

(async () => {
  const { albums } = await parseLibrary(
    "/Users/me/Pictures/Lightroom Library.lrlibrary/somelonghash/Managed Catalog.mcat"
  );
  console.log(albums);
})();
```

You should get something like:

```json
[
  {
    "album": "1999/1999-07-01 Oldies",
    "photos": ["1999/1999-07-01/1.jpg", "1999/1999-07-01/2.jpg"],
    "xmps": {
      "1999/1999-07-01/1.jpg": "/Users/me/Pictures/Lightroom Library.lrlibrary/somelonghash/settings/someotherhash.xmp"
    }
  }
]
```

The files in the "photos" array will be found wherever you chose to store originals (see step 1).
