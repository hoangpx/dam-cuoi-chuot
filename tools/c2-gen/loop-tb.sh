#!/bin/bash
# Endless Thiên biến search: verifies every board in tools/c2-gen-tb that has no .ver yet, then for seed = FROM (3), 4, …
# runs each frame of tools/c2-gen/tb-frames.txt (re-read every round) through tools/c2-gen.js and verifies the new board.
# Boards already made are skipped, so it can be stopped and started again. Stops when tools/c2-gen-tb/STOP exists.
# P jobs at a time (default 8). Each job is idle priority, so the machine stays usable.
cd "$(dirname "$0")/../.."
powershell -NoProfile -c "(Get-Process -Id $(cat /proc/$$/winpid)).PriorityClass='Idle'" 2>/dev/null   # children inherit it
export SPECS=./c2-specs-tb.js OUT=c2-gen-tb D=tools/c2-gen-tb
ver() { [ -e $D/STOP ] && return; [ -s $D/$1.ver ] && grep -q . $D/$1.ver && return
  timeout 3600 node --max-old-space-size=6000 tools/c2-gen/verify-tb.js $1 700000 > $D/$1.ver 2>&1; }
job() { f=$1; s=$2; id=$f-$s; [ -e $D/STOP ] && return
  [ -e $D/$id.json ] || timeout 2400 node --max-old-space-size=3000 tools/c2-gen.js $f --iters 200000 --seed $s > $D/$id.log 2>&1
  [ -e $D/$id.json ] && ver $id; }
export -f ver job
ls $D/*.json | xargs -n1 basename | sed 's/\.json$//' | xargs -P ${P:-8} -n1 bash -c 'ver $0'
for s in $(seq ${FROM:-3} 999); do
  [ -e $D/STOP ] && break
  grep -v '^#' tools/c2-gen/tb-frames.txt | grep . | sed "s/$/ $s/" | xargs -P ${P:-8} -L1 bash -c 'job $0 $1'
done
