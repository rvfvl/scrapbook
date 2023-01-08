import screenshot from "screenshot-desktop";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import express from "express";
import cors from "cors";

const app = express();
cors({ origin: "*" });

const itemy = [
  { name: "helmet", left: 1163, top: 146, width: 110, height: 70 },
  { name: "armor", left: 1163, top: 276, width: 110, height: 70 },
  { name: "gloves", left: 1163, top: 406, width: 110, height: 70 },
  { name: "boots", left: 1163, top: 537, width: 110, height: 70 },
  { name: "weapon", left: 1342, top: 537, width: 110, height: 70 },
  { name: "offhand", left: 1474, top: 537, width: 110, height: 70 },
  { name: "slot", left: 1652, top: 537, width: 85, height: 70 },
  { name: "ring", left: 1652, top: 406, width: 110, height: 70 },
  { name: "belt", left: 1652, top: 276, width: 110, height: 70 },
  { name: "necklace", left: 1652, top: 146, width: 110, height: 70 },
];

const checkNewItems = (
  jsonPath: string,
  base64: string,
  onNewItemFound: Function
) => {
  const fileData = fs.readFileSync(jsonPath);

  const data = JSON.parse(fileData.toString());

  if (!data.includes(base64)) {
    onNewItemFound();
  }
};

const saveNewItems = (
  jsonPath: string,
  base64: string,
  onNewItemFound: Function
) => {
  const fileData = fs.readFileSync(jsonPath);

  const data = JSON.parse(fileData.toString());

  if (!data.includes(base64)) {
    data.push(base64);
    fs.writeFileSync(jsonPath, JSON.stringify(data));
    onNewItemFound();
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
      .toBuffer();

    const base64 = Buffer.from(buffer).toString("base64");
    const jsonPath = path.join(__dirname, "data", `${item.name}.json`);

    try {
      callback(jsonPath, base64, onNewItemFound);
    } catch (error) {
      // @ts-ignore
      if (error.errno === -4058) {
        fs.writeFileSync(jsonPath, JSON.stringify([base64]));
        onNewItemFound();
      }
    }
  }
};

app.get("/api/check", async (req, res) => {
  let state = {
    updatedItems: 0,
  };

  await takeScreenshot(checkNewItems, () => state.updatedItems++);

  res.json(state);
});

app.get("/api/save", async (req, res) => {
  let state = {
    updatedItems: 0,
  };

  await takeScreenshot(saveNewItems, () => state.updatedItems++);

  res.json(state);
});

app.listen(5000, () => console.log("Server started on port 5000"));
