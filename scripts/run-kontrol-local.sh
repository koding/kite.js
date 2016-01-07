#!/bin/bash
set -e
set -x

KODINGROOT=$GOPATH/src/github.com/koding

rm -rf _etcd/kontrol_test ||: #remove previous folder
cd _etcd; ./build; ./bin/etcd --name=kontrol --data-dir=kontrol_test &
cd -

killall main || true

# delete existing kite.key
rm -rf $HOME/.kite

# delete existing kontrol data
rm -rf /tmp/kontrol-data

go run $KODINGROOT/kite/testutil/writekey/main.go -stdout > kontrol_client.key

# initialize machine with new kite.key
go run $KODINGROOT/kite/kontrol/kontrol/main.go -publickeyfile ./test/data/test_key.pub -privatekeyfile ./test/data/test_key.priv -initial -username testuser -kontrolurl "http://0.0.0.0:4000"

# run essential kites
go run $KODINGROOT/kite/kontrol/kontrol/main.go -publickeyfile ./test/data/test_key.pub -privatekeyfile ./test/data/test_key.priv &
