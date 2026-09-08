.PHONY: all init build dist fastbuild clean dev serve commit-donors

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

commit-donors:
	git add src/donors.ts
	git commit -m 'wasmegg/_home: update donors' src/donors.ts

serve:
	pnpm run serve
