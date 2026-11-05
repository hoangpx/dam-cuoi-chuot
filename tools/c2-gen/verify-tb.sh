#!/bin/bash
# verify Thiên biến boards (file ids given, else every tools/c2-gen-tb/*.json), 4 at a time
cd "$(dirname "$0")/../.."
ids="$@"; [ -z "$ids" ] && ids=$(ls tools/c2-gen-tb/*.json | xargs -n1 basename | sed 's/\.json$//')
echo $ids | tr ' ' '\n' | xargs -P 4 -I{} sh -c 'node --max-old-space-size=7000 tools/c2-gen/verify-tb.js {} 700000 > tools/c2-gen-tb/{}.ver 2>&1'
