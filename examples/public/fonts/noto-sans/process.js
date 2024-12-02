import fs from "fs";
const content = fs.readFileSync("charcodes.txt", "utf8");

const units = content.split("\\U");
units.shift();

// fs.writeFileSync(
//   "charset.txt",
//   units.map((u) => String.fromCharCode(parseInt(u, 16))).join("")
// );


// msdf-atlas-gen
fs.writeFileSync(
  "mcharset.txt",
  units.map((u) => `0x${u}`).join(" ")
);