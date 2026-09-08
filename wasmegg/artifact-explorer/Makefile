.PHONY: all init build data dist fastbuild clean dev serve

all: clean
	$(MAKE) dist

init:

build: data
	pnpm run build

data:
	go run .

dist: build
	../_tools/build.py dist --additional assets --additional static

fastbuild: clean
	$(MAKE) data
	pnpm run fastbuild
	../_tools/build.py dist --additional assets --additional static

clean:
	@$(RM) -r dist

dev:
	pnpm run dev

serve:
	pnpm run serve
