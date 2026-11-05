#!/bin/bash
# run every Thiên biến frame (or those given) through tools/c2-gen.js, 10 at a time; results in tools/c2-gen-tb/
cd "$(dirname "$0")/../.."
export SPECS=./c2-specs-tb.js OUT=c2-gen-tb
mkdir -p tools/c2-gen-tb
ids="$@"; [ -z "$ids" ] && ids=$(node -e "require('./tools/c2-specs-tb.js').forEach(s=>console.log(s.id))")
echo $ids | tr ' ' '\n' | xargs -P 12 -I{} sh -c 'timeout 2400 node --max-old-space-size=3000 tools/c2-gen.js {} --iters 200000 ${SEED:+--seed $SEED} > tools/c2-gen-tb/{}${SEED:+-$SEED}.log 2>&1'
