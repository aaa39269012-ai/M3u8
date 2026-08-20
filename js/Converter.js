let ffmpeg = null;

async function loadFFmpeg(onStatus) {
  if (ffmpeg) return ffmpeg;

  onStatus("Loading FFmpeg...");
  const { FFmpeg } = FFmpegWASM;
  ffmpeg = new FFmpeg();

  await ffmpeg.load({
    coreURL: "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js",
  });

  return ffmpeg;
}

async function convertToMp4(data, onStatus) {
  const ff = await loadFFmpeg(onStatus);

  onStatus("Converting to MP4...");
  await ff.writeFile("input.ts", data);
  await ff.exec(["-i", "input.ts", "-c", "copy", "-bsf:a", "aac_adtstoasc", "output.mp4"]);
  const output = await ff.readFile("output.mp4");

  return new Blob([output.buffer], { type: "video/mp4" });
}
