#!/bin/bash
set -e
set -x

KODINGROOT=$GOPATH/src/github.com/koding

killall main || true

rm -rf kite

go get github.com/koding/kite
echo "downloading dependencies of github.com/koding/kite"

cd $KODINGROOT/kite/
go get -d -v ./...
cd -

# delete existing kite.key
rm -rf $HOME/.kite

# delete existing kontrol data
rm -rf /tmp/kontrol-data

# generate rsa keys
openssl genrsa -out /tmp/privateKey.pem 2048
openssl rsa -in /tmp/privateKey.pem -pubout > /tmp/publicKey.pem

# initialize machine with new kite.key
go run $KODINGROOT/kite/kontrol/kontrol/main.go -public-key /tmp/publicKey.pem -private-key /tmp/privateKey.pem -init -username testuser -kontrol-url "http://localhost:4000"

# run essential kites
go run $KODINGROOT/kite/kontrol/kontrol/main.go -public-key /tmp/publicKey.pem -private-key /tmp/privateKey.pem -data-dir /tmp/kontrol-data &
