import axios from "axios";

export default async function handler(req, res) {
  try {
    // 1. Get pages from category that contains image files
    const category = "Otter_pictures"; // might need adjusting
    const listResp = await axios.get("https://otter.wiki/api.php", {
      params: {
        action: "query",
        format: "json",
        list: "categorymembers",
        cmtitle: `Category:${category}`,
        cmlimit: 50,
      },
    });

    const pages = listResp.data.query.categorymembers;

    if (!pages || pages.length === 0) {
      return res.status(404).json({ error: "No otter images found" });
    }

    // 2. Pick a random image page
    const chosen = pages[Math.floor(Math.random() * pages.length)];

    // 3. Get image info
    const imageResp = await axios.get("https://otter.wiki/api.php", {
      params: {
        action: "query",
        format: "json",
        prop: "imageinfo",
        titles: chosen.title,
        iiprop: "url"
      }
    });

    const pagesObj = imageResp.data.query.pages;
    const imagePage = Object.values(pagesObj)[0];
    const imageUrl = imagePage.imageinfo?.[0]?.url;

    if (!imageUrl) {
      return res.status(404).json({ error: "No image URL found" });
    }

    // 4. Proxy the image to Discord
    const imgResp = await axios.get(imageUrl, { responseType: "arraybuffer" });
    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Content-Disposition", 'inline; filename="otter.jpg"');
    res.status(200).send(imgResp.data);

  } catch (err) {
    console.error("Otter fail:", err.message);
    res.status(500).json({ error: "Otter not found" });
  }
}
