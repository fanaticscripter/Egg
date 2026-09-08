.PHONY: all init data build dist fastbuild clean dev serve

all: clean
	$(MAKE) dist

init:

build:
	pnpm run build

dist: build
	../_tools/build.py dist --additional assets --additional static

fastbuild: clean
	pnpm run fastbuild
	../_tools/build.py dist --additional assets --additional static

clean:
	@$(RM) -r dist

dev:
	pnpm run dev

serve:
	pnpm run serve
