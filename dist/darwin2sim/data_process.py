import numpy as np
import os
from sklearn.utils import shuffle
from sklearn.preprocessing import OneHotEncoder
import numpy as np
from PIL import Image

trainningDataset = os.path.join(
    "E:\\courses\\ZJLab\\dataset\\trainingSet\\trainingSet")

images,labels=[],[]
for subdir in os.listdir(trainningDataset):
    for file in os.listdir(os.path.join(trainningDataset, subdir)):
        img = Image.open(os.path.join(trainningDataset, subdir, file))
        img = np.array(img)
        img = np.expand_dims(img, axis=-1)
        labels.append(int(subdir))
        images.append(img)

images = np.array(images, dtype="float32")/255.0
labels = np.expand_dims(np.array(labels, dtype="int32"), axis=-1)
onehotEnc = OneHotEncoder()
onehotEnc.fit(labels)
labels = np.array(onehotEnc.transform(labels).toarray(), dtype="int32")
images, labels = shuffle(images, labels)

np.savez("testX.npz",images[:1000])
np.savez("testY.npz",labels[:1000])
np.savez("valX.npz",images[-100:])
np.savez("valY.npz",labels[-100:])