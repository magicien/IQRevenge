#!/bin/bash

FILES=`ls *.mp4`

for FILE in ${FILES}
do
  MP3_FILE="${FILE%.*}.mp3"
  OGG_FILE="${FILE%.*}.ogg"

  # create mp3
  ffmpeg -i ${FILE} ${MP3_FILE}

  # create ogg
  mpg321 ${MP3_FILE} -w - | oggenc -o ${OGG_FILE} -
done

