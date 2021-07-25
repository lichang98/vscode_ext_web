# -*- coding:utf-8 -*-
#####################################
# Run `python spikeClassify.py  <class label>`
# Then the script will output a string indicates the 
# range of age for age detection task
#####################################
import sys

age_ranges = ["15~20", "20~25", "25~30", "30~35", "35~40", "40~45", "45~50", "50~55", "55~60", "60~65", "65~70", "70~75"]

try:
    i_age_ind = int(sys.argv[1])
except ValueError:
    i_age_ind = 0

i_age_ind = max(0, i_age_ind)
i_age_ind = min(len(age_ranges)-1, i_age_ind)

print(age_ranges[i_age_ind])
