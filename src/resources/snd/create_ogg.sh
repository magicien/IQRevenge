#!/bin/bash
if [ $# -lt 1 ]; then
  echo "usage: $0 input.mp3 [output.ogg]"
  exit;
fi
INPUT_FILE=$1
if [ $# -ge 2 ]; then
  OUTPUT_FILE=$2
else
  OUTPUT_FILE=${INPUT_FILE%.*}.ogg
fi
echo "INPUT FILE: ${INPUT_FILE}"
echo "OUTPUT FILE: ${OUTPUT_FILE}"
mpg321 ${INPUT_FILE} -w - | oggenc -o ${OUTPUT_FILE} -
