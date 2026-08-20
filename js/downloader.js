async function downloadSegments(playlistUrl, onProgress) {
  const res = await fetch(playlistUrl);
  if (!res.ok) throw new Error("Media playlist fetch failed");

  const text = await res.text();
  const baseUrl = playlistUrl.substring(0, playlistUrl.lastIndexOf("/") + 1);

  const segments = [];
  text.split("\n").forEach(line => {
    line = line.trim();
    if (line && !line.startsWith("#")) {
      segments.push(line.startsWith("http") ? line : new URL(line, baseUrl).href);
    }
  });

  if (segments.length === 0) throw new Error("No segments found");

  const buffers = [];
  for (let i = 0; i < segments.length; i++) {
    const r = await fetch(segments[i]);
    if (!r.ok) throw new Error(`Segment ${i + 1} failed`);
    buffers.push(await r.arrayBuffer());
    onProgress(Math.round(((i + 1) / segments.length) * 100), `Downloading \( {i + 1}/ \){segments.length}`);
  }

  // Merge
  const total = buffers.reduce((a, b) => a + b.byteLength, 0);
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const buf of buffers) {
    merged.set(new Uint8Array(buf), offset);
    offset += buf.byteLength;
  }

  return merged;
}
