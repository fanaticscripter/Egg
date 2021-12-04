# Egg, Inc Helper Tools by @mk2

## Installation

These instructions may not be 100% correct. On OSX, unless you can
figure out the protoc-gen-doc thing you should comment out the
`protoc` line in `wasmegg/proto-explorer/Makefile`:

```
# commented out to make MacOS work
#        protoc --doc_out=html,index.html:./public/doc --proto_path ../../protobuf ../../protobuf/*.proto
```

### Install dependencies

On MacOS,

```
brew install go python node protobuf-c
```

### Set up protobuf

Linux:
```
sudo apt-get install -y --no-install-recommends protobuf-compiler
# Install protoc-gen-doc
basename=protoc-gen-doc-1.4.1.linux-amd64.go1.15.2
wget https://github.com/pseudomuto/protoc-gen-doc/releases/download/v1.4.1/$basename.tar.gz
tar xf $basename.tar.gz
echo "$PWD/$basename" >> $GITHUB_PATH
```

MacOS:

```
# ??? couldn't get this to work
# go get -d -u github.com/pseudomuto/protoc-gen-doc/cmd/protoc-gen-doc
# protoc-gen-doc
```

### Set up ETS

```
brew tap zmwangx/ets https://github.com/zmwangx/ets
brew install zmwangx/ets/ets
```

### Build libraries / data

```
cd lib
make init
make
cd ..       # back to wasmegg directory
```

### Build egg explorer sites

```
cd wasmegg
make init -j1
make -j2
cd ..
```

### Build EI Coop Tracker

```
cd eicoop
yarn
make
```
