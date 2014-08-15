#!/bin/bash
set -e
set -x

KODINGROOT=$GOPATH/src/github.com/koding

killall main || true

rm -rf kite

echo "Installing etcd"
test -d "_etcd" || git clone https://github.com/coreos/etcd _etcd
rm -rf _etcd/kontrol_test ||: #remove previous folder
cd _etcd; ./build; ./bin/etcd --name=kontrol --data-dir=kontrol_test &
cd -

go get -u github.com/koding/kite
echo "downloading dependencies of github.com/koding/kite"

cd $KODINGROOT/kite/
go get -u -d -v ./...
cd -

# delete existing kite.key
rm -rf $HOME/.kite

# delete existing kontrol data
rm -rf /tmp/kontrol-data

go run $KODINGROOT/kite/testutil/writekey/main.go -stdout > kontrol_client.key

# initialize machine with new kite.key
go run $KODINGROOT/kite/kontrol/kontrol/main.go -public-key ./test/data/test_key.pub -private-key ./test/data/test_key.priv -init -username testuser -kontrol-url "http://0.0.0.0:4000"

# run essential kites
go run $KODINGROOT/kite/kontrol/kontrol/main.go -public-key ./test/data/test_key.pub -private-key ./test/data/test_key.priv &
