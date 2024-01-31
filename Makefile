.PHONY: all keyagg web android format

all: format web android

keyagg:
	make -C keyagg

web: keyagg
	npx expo export -p web

android: keyagg
	npx expo prebuild -p android
	cd android && ./gradlew assembleRelease
	mv android/app/build/outputs/apk/release/app-release.apk .
	@echo
	@echo "  Android release-mode APK built and moved to ./app-release.apk"
	@echo

format:
	npx prettier --write App.js
