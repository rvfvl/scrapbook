import screenshot from "screenshot-desktop";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import express from "express";
import cors from "cors";

const app = express();
cors({ origin: "*" });

const overlay = fs.readFileSync(path.join(__dirname, "overlay.png"));

const itemy = [
  { name: "helmet", left: 1163, top: 146, width: 113, height: 107 },
  { name: "armor", left: 1163, top: 276, width: 113, height: 107 },
  { name: "gloves", left: 1163, top: 406, width: 113, height: 107 },
  { name: "boots", left: 1163, top: 537, width: 113, height: 107 },
  { name: "weapon", left: 1342, top: 537, width: 113, height: 107 },
  { name: "offhand", left: 1474, top: 537, width: 113, height: 107 },
  { name: "slot", left: 1652, top: 537, width: 94, height: 107 },
  { name: "ring", left: 1652, top: 406, width: 113, height: 107 },
  { name: "belt", left: 1652, top: 276, width: 113, height: 107 },
  { name: "necklace", left: 1652, top: 146, width: 113, height: 107 },
];

const checkNewItems = (
  jsonPath: string,
  base64: string,
  onNewItemFound: Function
) => {
  try {
    const fileData = fs.readFileSync(jsonPath);
    const data = JSON.parse(fileData.toString());

    if (!data.includes(base64)) {
      onNewItemFound();
    }
  } catch (error) {
    if (error.errno === -4058) {
      onNewItemFound();
    }
  }
};

const saveNewItems = (
  jsonPath: string,
  base64: string,
  onNewItemFound: Function
) => {
  try {
    const fileData = fs.readFileSync(jsonPath);

    const data = JSON.parse(fileData.toString());

    if (!data.includes(base64)) {
      data.push(base64);

      onNewItemFound();
      fs.writeFileSync(jsonPath, JSON.stringify(data));
    }
  } catch (error) {
    if (error.errno === -4058) {
      onNewItemFound();
      fs.writeFileSync(jsonPath, JSON.stringify([base64]));
    }
  }
};

const takeScreenshot = async (callback: Function, onNewItemFound: Function) => {
  const img = await screenshot({ screen: 1 });

  for (const item of itemy) {
    const buffer = await sharp(img)
      .extract({
        left: item.left,
        top: item.top,
        width: item.width,
        height: item.height,
      })
      .composite([{ input: overlay, left: 79, top: 76 }])
      .toBuffer();

    const base64 = Buffer.from(buffer).toString("base64");
    const jsonPath = path.join(__dirname, "data", `${item.name}.json`);

    callback(jsonPath, base64, () => onNewItemFound(item.name));
  }
};

app.get("/api/check", async (req, res) => {
  let state = {
    updatedItems: 0,
    items: [] as any,
  };

  await takeScreenshot(checkNewItems, (name: string) => {
    state.updatedItems++;
    state.items.push(name);
  });

  res.json(state);
});

app.get("/api/save", async (req, res) => {
  let state = {
    updatedItems: 0,
    items: [] as any,
  };

  await takeScreenshot(saveNewItems, (name: string) => {
    state.updatedItems++;
    state.items.push(name);
  });

  res.json(state);
});

app.listen(5000, () => console.log("Server started on port 5000"));
