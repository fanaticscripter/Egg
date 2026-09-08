.PHONY: all init build data dist fastbuild freeze clean dev serve

# This tool is frozen at game version 1.20, so what ships is the checked-in
# dist.frozen/ rather than a fresh build. `make freeze` regenerates it.

all: fastbuild

init:

fastbuild: clean
	rsync -a dist.frozen/ dist/
	../_tools/build.py dist --additional assets

dist: build
	../_tools/build.py dist --additional assets

data:
	go run .

build: data
	yarn build

freeze: build
	@$(RM) -r dist.frozen
	cp -r dist dist.frozen

clean:
	@$(RM) -r dist

dev: data
	yarn dev

serve:
	yarn serve
