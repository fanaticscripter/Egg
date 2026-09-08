.PHONY: all init

all: proto/index.js sandbox/schema.js

init:
	pnpm install

proto/index.js: ../protobuf/*.proto
	pnpm exec pbjs -p protobuf -t static-module -w es6 --force-number -o proto/index.js ../protobuf/*.proto
	pnpm exec pbts -o proto/index.d.ts proto/index.js

sandbox/schema.js: sandbox/schema.proto
	pnpm exec pbjs -t static-module -w es6 --force-number -o sandbox/schema.js sandbox/schema.proto
	pnpm exec pbts -o sandbox/schema.d.ts sandbox/schema.js
