MAKEFLAGS += -j4

.PHONY: all init dist fastbuild html webpack postcss data update-loot-data clean serve

all: fastbuild

fastbuild: clean
	rsync -avP dist.frozen/ dist/
	../_tools/build.py dist

init:
	yarn install

dist: html
	../_tools/build.py dist

html: webpack postcss
	../_tools/build.py html

webpack: data
	yarn webpack

postcss:
	yarn postcss --env=production src/app.css -o dist/app.css

data:
	go run .

clean:
	@$(RM) -r dist/index.html dist/*.*.css dist/*.*.js dist/manifest.*.json

serve:
	cd dist && npx serve
