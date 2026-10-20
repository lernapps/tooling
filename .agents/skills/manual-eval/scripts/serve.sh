#!/bin/bash
# Serves one guidance file to a test session and logs the request.
# Usage: serve.sh <working copy> <log file> <url or path>
# Maps lernapps.net/tooling/llms.txt and raw/blob URLs of lernapps/tooling (any branch) to the working copy.
# Prints the file unchanged, or __MISS__ when there is none.
set -u
root="$1" log="$2" req="$3"
case "$req" in
  https://lernapps.net/tooling/llms.txt) path=site/llms.txt ;;
  https://raw.githubusercontent.com/lernapps/tooling/*) path="${req#https://raw.githubusercontent.com/lernapps/tooling/}" ;;
  https://github.com/lernapps/tooling/blob/*) path="${req#https://github.com/lernapps/tooling/blob/}" ;;
  http*) path="" ;;
  *) path="${req#/}" ;;
esac
# strip the branch, which may hold slashes: drop leading parts until a file matches
while [[ "$req" == http* && -n "$path" && ! -f "$root/$path" && "$path" == */* ]]; do path="${path#*/}"; done
file="$root/$path"
if [ -n "$path" ] && [ -f "$file" ]; then
  echo "$(date -u +%FT%T) SERVED $req -> $path ($(wc -w < "$file") words)" >> "$log"
  cat "$file"
else
  echo "$(date -u +%FT%T) MISS $req" >> "$log"
  echo "__MISS__"
fi
