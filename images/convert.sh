#!/bin/bash
cd "$(dirname "$0")"

# create directory for market images
mkdir -p ./markets
convert -background none -resize 512x512\! ./icon.svg ./markets/512x512.png

# icons
# create required directories
mkdir -p ../www/res/icon/android ../www/res/icon/blackberry ../www/res/icon/ios ../www/res/icon/webos ../www/res/icon/windows-phone
# default
convert -background none -resize 96x96\!   ./icon.svg ../www/icon.png
# android
convert -background none -resize 96x96\!   ./icon.svg ../www/res/icon/android/icon-96-xhdpi.png
convert -background none -resize 72x72\!   ./icon.svg ../www/res/icon/android/icon-72-hdpi.png
convert -background none -resize 48x48\!   ./icon.svg ../www/res/icon/android/icon-48-mdpi.png
convert -background none -resize 36x36\!   ./icon.svg ../www/res/icon/android/icon-36-ldpi.png
# blackberry
convert -background none -resize 80x80\!   ./icon.svg ../www/res/icon/blackberry/icon-80.png
# ios
convert -background none -resize 57x57\!   ./icon.svg ../www/res/icon/ios/icon-57.png
convert -background none -resize 72x72\!   ./icon.svg ../www/res/icon/ios/icon-72.png
convert -background none -resize 114x114\! ./icon.svg ../www/res/icon/ios/icon-57-2x.png
convert -background none -resize 144x144\! ./icon.svg ../www/res/icon/ios/icon-72-2x.png
# webos
convert -background none -resize 64x64\!   ./icon.svg ../www/res/icon/webos/icon-64.png
# windows phone
convert -background none -resize 48x48\!   ./icon.svg ../www/res/icon/windows-phone/icon-48.png
convert -background none -resize 173x173\! ./icon.svg ../www/res/icon/windows-phone/icon-173.png

function splash_screen(){
x="$1"
y="$2"
in_file="$3"
out_file="$4"

gradient="gradient:gray-white"
gradient="gradient:#A7A7A7-#E4E4E4"
#gradient="radial-gradient:#555555-#222222"

convert -background none "$in_file" -resize 96x96\! \
\( -size 1x10 xc:none \) \
\( -size "${x}x" -background none -font Arial -pointsize 36 -fill "black" -gravity center caption:"Points Watcher" \) \
-gravity center -append \
\( -size "${x}x${y}" "$gradient" \) \
+swap -gravity center -compose over -composite "$out_file"
}

# splash screens
# create required directories
mkdir -p ../www/res/screen/android ../www/res/screen/blackberry ../www/res/screen/ios ../www/res/screen/windows-phone
# default
splash_screen 480  800  ./icon.svg ../www/screen.png
# android
splash_screen 200  320  ./icon.svg ../www/res/screen/android/screen-ldpi-portrait.png
splash_screen 320  480  ./icon.svg ../www/res/screen/android/screen-mdpi-portrait.png
splash_screen 480  800  ./icon.svg ../www/res/screen/android/screen-hdpi-portrait.png
splash_screen 720  1280 ./icon.svg ../www/res/screen/android/screen-xhdpi-portrait.png
splash_screen 200  320  ./icon.svg ../www/res/screen/android/screen-ldpi-portrait.png
# blackberry (appears to be just the icon)
#splash_screen 225 225   ./icon.svg ../www/res/screen/blackberry/screen-225.png
convert -background none -resize 225x225\! ./icon.svg ../www/res/screen/blackberry/screen-225.png
# ios
splash_screen 320  480  ./icon.svg ../www/res/screen/ios/screen-iphone-portrait.png
splash_screen 640  960  ./icon.svg ../www/res/screen/ios/screen-iphone-portrait-2x.png
splash_screen 768  1024 ./icon.svg ../www/res/screen/ios/screen-ipad-portrait.png
splash_screen 1024 768  ./icon.svg ../www/res/screen/ios/screen-ipad-landscape.png
# windows phone
splash_screen 480  800  ./icon.svg ../www/res/screen/windows-phone/screen-portrait.jpg
# screen shots
#convert -resize 480x854\! ./ss1.png ./markets/ss1.png
