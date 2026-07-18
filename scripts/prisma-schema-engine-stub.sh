#!/bin/sh
# `prisma generate` uses Prisma's bundled WASM parser but still checks that a
# schema-engine path exists. This tiny build-only stub prevents an unnecessary
# native engine download in restricted Docker build environments.
if [ "$1" = "--version" ]; then
  echo "schema-engine-cli build-stub"
  exit 0
fi
echo "This build-only schema engine stub cannot execute database operations." >&2
exit 1
