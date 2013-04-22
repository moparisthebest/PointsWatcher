#!/bin/bash
cd "$(dirname "$0")"
inkscape --verb FitCanvasToDrawing --verb FileSave --verb FileClose *.svg