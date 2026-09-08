.PHONY: all init build dist fastbuild clean dev serve

all: clean
	$(MAKE) dist

init:

build:
	pnpm run build

dist: build
	../_tools/build.py dist --additional assets

fastbuild: clean
	pnpm run fastbuild
	../_tools/build.py dist --additional assets

clean:
	@$(RM) -r dist

dev:
	pnpm run dev

serve:
	pnpm run serve
