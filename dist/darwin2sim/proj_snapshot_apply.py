# -*- coding:utf-8 -*-
# unpack snapshot file, extract files and apply to project
import pickle
import sys
import numpy as np
from PIL import Image
from os import path

snapShotFile = sys.argv[1]

sampleImgsApplyPath = sys.argv[2]
snnInfoApplyPath = sys.argv[3]

with open(snapShotFile, "rb") as f:
    snapShot = pickle.load(f)

for imgName, imgContent in snapShot["sampleImgs"].items():
    imgContent = np.array(imgContent, dtype="uint8")
    Image.fromarray(imgContent).save(path.join(sampleImgsApplyPath, imgName))

for infoFName, infoContent in snapShot["snnInfo"].items():
    with open(path.join(snnInfoApplyPath, infoFName), "wb+") as f:
        f.write(infoContent)


