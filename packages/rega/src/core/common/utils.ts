let fetchBufferData: (
  url: string
) => Promise<{ buffer: ArrayBuffer; contentType: string; url: string }>;

// @ts-ignore
if (typeof Deno !== "undefined") {
  // @ts-ignore
  fetchBufferData = globalThis.__polyfill__.fetchBufferData;
} else {
  fetchBufferData = async function (url: string) {
    const newUrl = url.replace(/^\//, "./");
    const resp = await fetch(newUrl);
    let contentType = resp.headers.get("content-type") as string;
    if (contentType === "image/x-ms-bmp") {
      contentType = "image/bmp";
    }
    const buffer = await resp.arrayBuffer();
    return {
      url: newUrl,
      buffer,
      contentType,
    };
  };
}

export { fetchBufferData };
