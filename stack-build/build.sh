#!/usr/bin/env bash
#
# Build the customer-facing zip for The Stack.
#
#   ./stack-build/build.sh
#
# Produces stack-build/dist/the-stack.zip, laid out exactly the way the
# delivery email describes it:
#
#   The Stack/
#     START HERE.txt
#     for-claude-code/mg-*/           <- copied into ~/.claude/skills/
#     for-claude-app/mg-*.zip         <- uploaded one at a time in Settings
#
# WHY OVERRIDES EXIST
# -------------------
# .claude/skills/ is the free/working set. Two of those skills say things
# that are wrong to show someone who has already paid 299 EUR:
#
#   mg-expertise-audit  ends with a "buy The Stack" pitch and is told not to
#                       chain into any other mg-* skill, because in the free
#                       tier those skills are the thing being sold.
#   mg-start            describes mg-go-no-go and mg-expertise-audit as
#                       "free", which they are not once you have bought them.
#
# stack-build/overrides/<skill>/SKILL.md replaces the free wording for the
# paid build only. Everything else is copied straight from .claude/skills/,
# so ordinary skill edits need no action here.
#
# After building, upload dist/the-stack.zip to Google Drive AS A NEW REVISION
# of the existing file, so the link already in buyers' inboxes keeps working:
#   https://drive.google.com/uc?export=download&id=16yunkMt30SjQFY13bJYCTyVP2iObC74f

set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
src="$root/.claude/skills"
overrides="$root/stack-build/overrides"
dist="$root/stack-build/dist"
stage="$dist/The Stack"

[ -d "$src" ] || { echo "error: $src not found"; exit 1; }

rm -rf "$dist"
mkdir -p "$stage/for-claude-code" "$stage/for-claude-app"

# ---- for-claude-code: one folder per skill -------------------------------
# README.md is internal notes, not part of the product.
count=0
for skill in "$src"/mg-*; do
  [ -d "$skill" ] || continue
  name="$(basename "$skill")"
  cp -R "$skill" "$stage/for-claude-code/$name"
  if [ -f "$overrides/$name/SKILL.md" ]; then
    cp "$overrides/$name/SKILL.md" "$stage/for-claude-code/$name/SKILL.md"
    echo "  override applied: $name"
  fi
  count=$((count + 1))
done

# ---- for-claude-app: one zip per skill ----------------------------------
# The Claude app expects the skill folder at the root of the zip
# (mg-start/SKILL.md), so zip from inside for-claude-code.
(
  cd "$stage/for-claude-code"
  for name in mg-*; do
    zip -q -r "../for-claude-app/$name.zip" "$name" -x '*.DS_Store'
  done
)

cp "$root/stack-build/START HERE.txt" "$stage/START HERE.txt"

# ---- the outer zip -------------------------------------------------------
(
  cd "$dist"
  zip -q -r the-stack.zip "The Stack" -x '*.DS_Store'
)

# ---- verify before anyone ships it --------------------------------------
fail=0
for skill in "$stage/for-claude-code"/mg-*; do
  [ -f "$skill/SKILL.md" ] || { echo "MISSING SKILL.md: $skill"; fail=1; }
  head -1 "$skill/SKILL.md" | grep -q '^---' \
    || { echo "BAD frontmatter: $skill"; fail=1; }
done
for z in "$stage/for-claude-app"/*.zip; do
  unzip -l "$z" | grep -q 'SKILL.md' || { echo "BAD app zip: $z"; fail=1; }
done
# Nothing in the paid build should be pitching the paid build.
if grep -rl 'buy\.stripe\.com' "$stage/for-claude-code" >/dev/null 2>&1; then
  echo "LEAK: a checkout link is inside the paid bundle:"
  grep -rl 'buy\.stripe\.com' "$stage/for-claude-code"
  fail=1
fi
[ "$fail" -eq 0 ] || { echo "BUILD FAILED"; exit 1; }

echo
echo "Built $count skills -> $dist/the-stack.zip"
echo "$(du -h "$dist/the-stack.zip" | cut -f1) — upload as a new revision of the existing Drive file."
