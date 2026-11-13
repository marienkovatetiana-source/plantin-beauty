#!/bin/sh
# Switches the raspberry-pink accent everywhere it is defined (token + the SVG chevron in accent.css).
# Usage:  sh scripts/spark.sh e0148c      (try the second pink)
#         sh scripts/spark.sh c2188f      (back to the third pink, the original)
#         sh scripts/spark.sh b5179e      (fourth pink)
# Prints the current colour when run without an argument.
set -e
cd "$(dirname "$0")/.."
TOK=src/css/tokens.css; ACC=src/css/accent.css
CUR=$(grep -o 'accent-spark: #[0-9a-fA-F]*' "$TOK" | head -1 | sed 's/.*#//')
if [ -z "$1" ]; then echo "current accent-spark: #$CUR"; exit 0; fi
NEW=$(echo "$1" | sed 's/^#//' | tr 'A-F' 'a-f')
sed -i '' "s/accent-spark: #$CUR/accent-spark: #$NEW/" "$TOK"
sed -i '' "s/%23$CUR/%23$NEW/g" "$ACC"
echo "accent-spark: #$CUR -> #$NEW"
