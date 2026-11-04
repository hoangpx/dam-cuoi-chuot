#!/bin/bash
# run every Muôn loài frame (or those given) through tools/c2-gen.js, 10 at a time; results in tools/c2-gen-ml/
cd "$(dirname "$0")/../.."
export SPECS=./c2-specs-ml.js OUT=c2-gen-ml
mkdir -p tools/c2-gen-ml
ids="$@"; [ -z "$ids" ] && ids=$(node -e "require('./tools/c2-specs-ml.js').forEach(s=>console.log(s.id))")
echo $ids | tr ' ' '\n' | xargs -P 10 -I{} sh -c 'node --max-old-space-size=3000 tools/c2-gen.js {} --iters 100000 ${SEED:+--seed $SEED} > tools/c2-gen-ml/{}.log 2>&1'
