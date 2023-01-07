import screenshot from "screenshot-desktop";
import sharp from "sharp";
import fs from "fs";
import path from "path";

const itemy = [
  { name: "helmet", left: 1163, top: 146, width: 110, height: 70 },
  { name: "armor", left: 1163, top: 276, width: 110, height: 70 },
  { name: "gloves", left: 1163, top: 406, width: 110, height: 70 },
  { name: "boots", left: 1163, top: 537, width: 110, height: 70 },
  { name: "weapon", left: 1342, top: 537, width: 110, height: 70 },
  { name: "offhand", left: 1474, top: 537, width: 110, height: 70 },
  { name: "slot", left: 1652, top: 537, width: 93, height: 70 },
  { name: "ring", left: 1652, top: 406, width: 110, height: 70 },
  { name: "belt", left: 1652, top: 276, width: 110, height: 70 },
  { name: "necklace", left: 1652, top: 146, width: 110, height: 70 },
];

const checkNewItems = (
  jsonPath: string,
  base64: string,
  state: { newItemsCount: number }
) => {
  try {
    const fileData = fs.readFileSync(jsonPath);

    const data = JSON.parse(fileData.toString());

    if (!data.includes(base64)) {
      state.newItemsCount++;
    }
  } catch (error) {
    // @ts-ignore
    if (error.errno === -4058) {
      state.newItemsCount++;
    }
  }
};

const saveNewItems = (
  jsonPath: string,
  base64: string,
  state: { newItemsCount: number }
) => {
  try {
    const fileData = fs.readFileSync(jsonPath);

    const data = JSON.parse(fileData.toString());

    if (!data.includes(base64)) {
      data.push(base64);
      fs.writeFileSync(jsonPath, JSON.stringify(data));
      state.newItemsCount++;
    }
  } catch (error) {
    // @ts-ignore
    if (error.errno === -4058) {
      fs.writeFileSync(jsonPath, JSON.stringify([base64]));
      state.newItemsCount++;
    }
  }
};

screenshot({ screen: 1 }).then(async (img: Buffer) => {
  const state = {
    newItemsCount: 0,
  };

  for (const item of itemy) {
    const buffer = await sharp(img)
      .extract({
        left: item.left,
        top: item.top,
        width: item.width,
        height: item.height,
      })
      .toBuffer();

    const base64 = Buffer.from(buffer).toString("base64");
    const jsonPath = path.join(__dirname, "data", `${item.name}.json`);

    if (process.argv[2] === "--check") {
      checkNewItems(jsonPath, base64, state);
    }
    if (process.argv[2] === "--save") {
      saveNewItems(jsonPath, base64, state);
    }
  }

  console.log("New items count: ", state.newItemsCount);
});
