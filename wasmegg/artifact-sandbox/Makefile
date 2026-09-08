.PHONY: all init build dist fastbuild clean dev serve

all: clean
	$(MAKE) dist

init:

build: src/lib/data.json
	pnpm run build

dist: build
	../_tools/build.py dist --additional assets --additional static

src/lib/data.json:
	go run .

fastbuild: clean
	$(MAKE) src/lib/data.json
	pnpm run fastbuild
	../_tools/build.py dist --additional assets --additional static

clean:
	@$(RM) -r dist src/lib/data.json

dev:
	pnpm run dev

serve:
	pnpm run serve
