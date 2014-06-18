#!/bin/bash
set -e
set -x

KODINGROOT=$GOPATH/src/github.com/koding

killall main || true

# delete existing kite.key
rm -rf $HOME/.kite

# delete existing kontrol data
rm -rf /tmp/kontrol-data

go run $KODINGROOT/kite/testutil/writekey/main.go -stdout > kontrol_client.key

# initialize machine with new kite.key
go run $KODINGROOT/kite/kontrol/kontrol/main.go -public-key ./test/data/test_key.pub -private-key ./test/data/test_key.priv -init -username testuser -kontrol-url "http://0.0.0.0:4000"

# run essential kites
go run $KODINGROOT/kite/kontrol/kontrol/main.go -public-key ./test/data/test_key.pub -private-key ./test/data/test_key.priv -data-dir /tmp/kontrol-data &
