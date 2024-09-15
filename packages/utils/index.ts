// @ts-ignore
import path from "node:path";

const standalone =
  // @ts-ignore
  typeof Deno !== "undefined" && Deno.args.includes("--standalone");

export function resolvePath(url: string, metaUrl: string) {
  let baseDir = "";

  if (metaUrl.startsWith("http://") || metaUrl.startsWith("https://")) {
    return new URL(url, metaUrl).href;
  } else {
    if (standalone) {
      // @ts-ignore
      baseDir = path.dirname(Deno.execPath());
    } else {
      baseDir = path.dirname(metaUrl);
    }
    baseDir = baseDir.replace("file://", "");
    return path.join(baseDir, url);
  }
}
