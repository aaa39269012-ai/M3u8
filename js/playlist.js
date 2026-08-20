async function parsePlaylist(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Playlist fetch failed (${res.status})`);

  let text = await res.text();
  let baseUrl = url.substring(0, url.lastIndexOf("/") + 1);

  const qualities = [];

  // Master playlist
  if (text.includes("#EXT-X-STREAM-INF")) {
    const lines = text.split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("#EXT-X-STREAM-INF")) {
        const info = lines[i];
        const nextLine = lines[i + 1]?.trim();
        if (!nextLine) continue;

        let resMatch = info.match(/RESOLUTION=(\d+x\d+)/);
        let bwMatch = info.match(/BANDWIDTH=(\d+)/);

        let mediaUrl = nextLine.startsWith("http") ? nextLine : new URL(nextLine, baseUrl).href;

        qualities.push({
          label: resMatch ? resMatch[1] : (bwMatch ? Math.round(bwMatch[1]/1000) + "kbps" : "Unknown"),
          url: mediaUrl
        });
      }
    }
  } else {
    // Already media playlist
    qualities.push({
      label: "Default",
      url: url
    });
  }

  if (qualities.length === 0) throw new Error("No playable streams found");
  return qualities;
}
