# -*- encoding: utf-8 -*-
# Task a snapshot of the project, save as file
# save sample images and intermediate files
import pickle
from PIL import Image
import sys
from os import listdir, path
import numpy as np

sampleImgsDir = sys.argv[1]
snnInfoFile = sys.argv[2]

savePath = sys.argv[3]

snapShot = {
    "sampleImgs": {},
    "snnInfo" : {}
}

for img in listdir(sampleImgsDir):
    imgPath = path.join(sampleImgsDir, img)
    if not imgPath.endswith("jpg") and not imgPath.endswith("png"):
        continue

    imgContent = Image.open(imgPath)
    imgContent = np.array(imgContent, dtype="uint8")
    snapShot["sampleImgs"].update({str(img): imgContent.tolist()})

with open(snnInfoFile, "rb") as f:
    snnInfoContent = f.read()

snapShot["snnInfo"].update({path.basename(snnInfoFile): snnInfoContent})


with open(savePath, "wb") as f:
    pickle.dump(snapShot, f)