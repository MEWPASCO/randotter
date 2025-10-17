// api/otter.js
export default async function handler(req, res) {
  const MAX_ID = 1230;                  // highest ID you've seen on otter.wiki
  const MAX_TRIES = 8;                  // how many different IDs to try per request

  // try the provided extensions for a specific id, return Buffer+ext on success
  const tryExtensionsForId = async (id, order) => {
    for (const ext of order) {
      const url = `https://otter.wiki/otters/${id}.${ext}`;
      const resp = await fetch(url, { redirect: "follow" });
      if (resp.ok) {
        const buf = Buffer.from(await resp.arrayBuffer());
        const type = ext === "gif" ? "image/gif" : "image/jpeg";
        return { buf, ext, type, url };
      }
    }
    return null;
  };

  try {
    for (let attempt = 0; attempt < MAX_TRIES; attempt++) {
      const id = 1 + Math.floor(Math.random() * MAX_ID);

      // 35% of the time try gif first, otherwise jpg first
      const order = Math.random() < 0.35 ? ["gif", "jpg"] : ["jpg", "gif"];

      const hit = await tryExtensionsForId(id, order);
      if (hit) {
        res.setHeader("Content-Type", hit.type);
        res.setHeader(
          "Content-Disposition",
          `inline; filename="otter_${id}.${hit.ext}"`
        );
        return res.status(200).send(hit.buf);
      }
      // otherwise loop and try another id
    }

    // if we exhausted tries
    return res.status(404).json({ error: "Otter not found :(" });
  } catch (err) {
    console.error("Otter fetch error:", err?.message || err);
    return res.status(500).json({ error: "Otter server error" });
  }
}

