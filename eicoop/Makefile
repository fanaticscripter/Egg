.PHONY: all fastbuild clean

all: public/contractListHash
	pnpm run build
	netlify-headers-expander dist

fastbuild: public/contractListHash
	pnpm run fastbuild
	netlify-headers-expander dist

public/contractListHash:
	jq -cjM '[.[].id]' ../contracts/data/contracts.json | \
		python3 -c 'import sys, hashlib; print(hashlib.sha256(sys.stdin.buffer.read()).hexdigest())' \
		>public/contractListHash

clean:
	@$(RM) -r dist
