#!/bin/bash
# verify Muôn loài boards (file ids given, else every tools/c2-gen-ml/*.json), 4 at a time
cd "$(dirname "$0")/../.."
ids="$@"; [ -z "$ids" ] && ids=$(ls tools/c2-gen-ml/*.json | xargs -n1 basename | sed 's/\.json$//')
echo $ids | tr ' ' '\n' | xargs -P 4 -I{} sh -c 'node --max-old-space-size=7000 tools/c2-gen/verify-ml.js {} 700000 > tools/c2-gen-ml/{}.ver 2>&1'
