const XRFrameSystem = wx.getXrFrameSystem();

export const arRawDataToRGB = (scene) => {
  const startTime = new Date();
  let arRawData = scene.getComponent(XRFrameSystem.ARSystem).getARRawData();
  const width = arRawData.width;
  const height = arRawData.height;
  const yArray = new Uint8Array(arRawData.yBuffer);
  const uvArray = new Uint8Array(arRawData.uvBuffer);
  const ratio = width > 1280 ? 3 : 2;
  let data = cropAndCompressYUVArray(yArray, uvArray, width, height, ratio);
  const rgbArray = YUV420ToRGB(data.yArray, data.uvArray, data.width, data.height);
  console.log('YUV裁剪压缩转码总耗时: ', new Date() - startTime, 'ms');
  return {
    width: data.width,
    height: data.height,
    rgbArray: rgbArray
  }
}

export const cropAndCompressYUVArray = (yArray, uvArray, width, height, ratio) => {
  const cropWidth = ratio * 64;
  const cropHeight = ratio * 32;
  const cropedWidth = width - cropWidth;
  const cropedHeight = height - cropHeight;
  const offsetXStart = cropWidth / 2;
  const offsetXEnd = width - (cropWidth / 2);
  const offsetYStart = cropHeight / 2;
  const offsetYEnd = height - (cropHeight / 2);
  const compressedWidth = Math.floor(cropedWidth / ratio);
  const compressedHeight = Math.floor(cropedHeight / ratio);
  const compressedYArray = new Uint8Array(compressedWidth * compressedHeight);
  const compressedUVArray = new Uint8Array(compressedWidth * compressedHeight / 2);
  let compressedYIndex = 0;
  for (let y = offsetYStart; y < offsetYEnd; y++) {
    let rowIndex = y * width;
    for (let x = offsetXStart; x < offsetXEnd; x++) {
      compressedYArray[compressedYIndex] = yArray[rowIndex + x];
      compressedYIndex++;
      if (x % 2 === 1) x += (ratio - 1) * 2;
    }
    if (y % 2 === 1) y += (ratio - 1) * 2;
  }
  let compressedUVIndex = 0;
  for (let y = offsetYStart / 2; y < offsetYEnd / 2; y += ratio) {
    let rowIndex = y * width;
    for (let x = offsetXStart; x < offsetXEnd; x += ratio * 2) {
      compressedUVArray[compressedUVIndex] = uvArray[rowIndex + x]
      compressedUVArray[compressedUVIndex + 1] = uvArray[rowIndex + x + 1]
      compressedUVIndex += 2;
    }
  }
  return {
    width: compressedWidth,
    height: compressedHeight,
    yArray: compressedYArray,
    uvArray: compressedUVArray
  }
}

export const YUV420ToRGB = (yArray, uvArray, width, height) => {
  const rgbArray = new Array(width * height * 3);
  let yIndex = 0;
  let uvIndex = 0;
  let rgbIndex = 0;
  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {
      const y = yArray[yIndex];
      const u = uvArray[uvIndex];
      const v = uvArray[uvIndex + 1];
      const r = y + 1.402 * (v - 128);
      const g = y - 0.344136 * (u - 128) - 0.714136 * (v - 128);
      const b = y + 1.772 * (u - 128);
      rgbArray[rgbIndex] = Math.round(Math.max(0, Math.min(255, r)));
      rgbArray[rgbIndex + 1] = Math.round(Math.max(0, Math.min(255, g)));
      rgbArray[rgbIndex + 2] = Math.round(Math.max(0, Math.min(255, b)));
      yIndex++;
      if (i % 2 === 1) uvIndex += 2;
      rgbIndex += 3;
    }
    if (j % 2 === 1) uvIndex -= width;
  }
  return rgbArray;
}