export default async function handler(req, res) {
  // random ID between 1 and ~2000
  const id = Math.floor(Math.random() * 2000) + 1;

  // randomly decide order: jpg → gif or gif → jpg
  const extOrder = Math.random() < 0.5 ? ["jpg", "gif"] : ["gif", "jpg"];

  const tryExtensions = async (extensions) => {
    for (const ext of extensions) {
      const imgUrl = `https://otter.wiki/otters/${id}.${ext}`;
      const response = await fetch(imgUrl);

      if (response.ok) {
        const buffer = await response.arrayBuffer();
        res.setHeader("Content-Type", ext === "gif" ? "image/gif" : "image/jpeg");
        res.setHeader("Content-Disposition", `inline; filename="otter_${id}.${ext}"`);
        res.status(200).send(Buffer.from(buffer));
        return;
      }
    }

    // If neither exists, send fallback message
    res.status(404).json({ error: "Otter not found :(" });
  };

  try {
    await tryExtensions(extOrder);
  } catch (err) {
    console.error("Otter fetch error:", err.message);
    res.status(500).json({ error: "Otter server error" });
  }
}
