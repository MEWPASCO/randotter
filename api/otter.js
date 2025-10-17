export default async function handler(req, res) {
  // 1. Pick a random otter ID (adjust max if more exist)
  const id = Math.floor(Math.random() * 1020) + 1;

  // 2. Try possible extensions (.jpg first, .gif as fallback)
  const tryExtensions = async (extensions) => {
    for (const ext of extensions) {
      const imgUrl = `https://otter.wiki/otters/${id}.${ext}`;
      const response = await fetch(imgUrl);

      if (response.ok) {
        const buffer = await response.arrayBuffer();
        res.setHeader("Content-Type", ext === "gif" ? "image/gif" : "image/jpeg");
        res.setHeader("Content-Disposition", `inline; filename="otter_${id}.${ext}"`);
        res.status(200).send(Buffer.from(buffer));
        return; // stop once one image worked
      }
    }

    // If neither file exists
    res.status(404).json({ error: "Otter not found :(" });
  };

  try {
    await tryExtensions(["jpg", "gif"]);
  } catch (err) {
    console.error("Otter fetch error:", err.message);
    res.status(500).json({ error: "Otter server error" });
  }
}
