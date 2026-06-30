#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

export NODE_OPTIONS="--expose-gc ${NODE_OPTIONS:-}"
VITE_NODE="node_modules/.bin/vite-node --config vite.config.mts"
TSX="node_modules/.bin/tsx"

echo "=========================================="
echo "  Email Library Benchmark"
echo "  solid-email vs jsx-email vs react-email vs mjml-react"
echo "=========================================="
echo ""

RESULTS_DIR="results"
mkdir -p "$RESULTS_DIR"

# All benchmarks are independent — run in any order
echo "--- Running solid-email benchmark ---"
$VITE_NODE solid/bench.mts > "$RESULTS_DIR/solid.json" 2>/dev/null
echo "OK"

echo "--- Running jsx-email benchmark ---"
$TSX jsx-email/bench.mts > "$RESULTS_DIR/jsx-email.json" 2>/dev/null
echo "OK"

echo "--- Running react-email benchmark ---"
$TSX react-email/bench.mts > "$RESULTS_DIR/react-email.json" 2>/dev/null
echo "OK"

echo "--- Running mjml-react benchmark ---"
$TSX mjml-react/bench.mts > "$RESULTS_DIR/mjml-react.json" 2>/dev/null
echo "OK"

echo "--- Generating visual comparison ---"
$TSX generate-comparison.mts
echo "OK"

echo ""
echo "--- Aggregating results ---"
$TSX aggregate.mts
