#!/bin/bash
# run every spec (or those given) through tools/c2-gen.js, 11 at a time
cd "$(dirname "$0")/../.."
ids="$@"; [ -z "$ids" ] && ids=$(node -e "require('./tools/c2-specs.js').forEach(s=>console.log(s.id))")
echo $ids | tr ' ' '\n' | xargs -P 11 -I{} sh -c 'node --max-old-space-size=3000 tools/c2-gen.js {} --iters 100000 ${SEED:+--seed $SEED} > tools/c2-gen/{}.log 2>&1'
