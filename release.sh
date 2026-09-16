#!/usr/bin/env bash
# =============================================================================
# release.sh — Build: AppImage (linuxdeploy) + Windows exe (electron-builder)
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"
LINUXDEPLOY="/run/media/zihad/Data/dev/build-appimage/linuxdeploy-x86_64.AppImage"

APP_NAME="Universal-Proxy-Checker"          # human-readable / display name
APP_ID="com.tazihad.universal-proxy-checker"
VERSION=$(node -p "require('./package.json').version")
PKG_NAME=$(node -p "require('./package.json').name")  # e.g. universal-proxy-checker (lowercase)
APPDIR="$PROJECT_DIR/AppDir"
OUTPUT_DIR="$PROJECT_DIR/release"

echo "=================================================="
echo "  Releasing $APP_NAME v$VERSION"
echo "  Targets: Linux AppImage + Windows exe"
echo "=================================================="

# ── Step 1: Build web assets ───────────────────────────────────────────────────
echo ""
echo "[1/5] Building web assets (tsc + vite)..."
npm run build

# ── Step 2: Package unpacked Electron for Linux ────────────────────────────────
echo ""
echo "[2/5] Packaging Electron app (linux dir)..."
npx electron-builder --linux dir

UNPACKED_DIR="$OUTPUT_DIR/linux-unpacked"

# Detect the actual Electron binary name in linux-unpacked
# (electron-builder uses the npm package name, which may be lowercase)
ELECTRON_BIN=$(find "$UNPACKED_DIR" -maxdepth 1 -type f -executable ! -name "*.so*" ! -name "chrome*" | head -1)
ELECTRON_BIN_NAME=$(basename "$ELECTRON_BIN")
echo "  → Detected electron binary: $ELECTRON_BIN_NAME"

# ── Step 3: Assemble AppDir ────────────────────────────────────────────────────
echo ""
echo "[3/5] Assembling AppDir..."

rm -rf "$APPDIR"
mkdir -p "$APPDIR/usr/bin"
mkdir -p "$APPDIR/usr/lib/$APP_NAME"
mkdir -p "$APPDIR/usr/share/applications"
mkdir -p "$APPDIR/usr/share/icons/hicolor/256x256/apps"
mkdir -p "$APPDIR/usr/share/icons/hicolor/512x512/apps"

echo "  → Copying electron bundle..."
cp -r "$UNPACKED_DIR"/. "$APPDIR/usr/lib/$APP_NAME/"

# Symlink using the ACTUAL binary name, exposed as the display name
ln -sf "../lib/$APP_NAME/$ELECTRON_BIN_NAME" "$APPDIR/usr/bin/$APP_NAME"

ICON_SRC="$PROJECT_DIR/public/icons/icon.png"
[ ! -f "$ICON_SRC" ] && ICON_SRC="$PROJECT_DIR/dist/icons/icon.png"
cp "$ICON_SRC" "$APPDIR/usr/share/icons/hicolor/256x256/apps/$APP_ID.png"
cp "$ICON_SRC" "$APPDIR/usr/share/icons/hicolor/512x512/apps/$APP_ID.png"
cp "$ICON_SRC" "$APPDIR/$APP_ID.png"

cat > "$APPDIR/usr/share/applications/$APP_ID.desktop" <<DESKTOP
[Desktop Entry]
Name=$APP_NAME
Exec=$APP_NAME --no-sandbox %U
Icon=$APP_ID
Type=Application
Categories=Network;
Comment=Modern high-performance proxy checker
Terminal=false
StartupWMClass=$APP_NAME
DESKTOP
cp "$APPDIR/usr/share/applications/$APP_ID.desktop" "$APPDIR/$APP_ID.desktop"

# AppRun — uses the detected binary name
cat > "$APPDIR/AppRun" <<APPRUN
#!/usr/bin/env bash
HERE="\$(cd "\$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
ELECTRON_BIN="$ELECTRON_BIN_NAME"
CHROME_SANDBOX="\$HERE/usr/lib/$APP_NAME/chrome-sandbox"
if [ -f "\$CHROME_SANDBOX" ]; then
  chmod 4755 "\$CHROME_SANDBOX" 2>/dev/null || true
fi
exec "\$HERE/usr/lib/$APP_NAME/\$ELECTRON_BIN" --no-sandbox "\$@"
APPRUN
chmod +x "$APPDIR/AppRun"

echo "  → AppDir assembled."

# ── Step 4: Build AppImage via linuxdeploy ─────────────────────────────────────
echo ""
echo "[4/5] Building AppImage with linuxdeploy..."
export APPIMAGE_EXTRACT_AND_RUN=1

"$LINUXDEPLOY" \
  --appdir "$APPDIR" \
  --desktop-file "$APPDIR/$APP_ID.desktop" \
  --icon-file "$APPDIR/$APP_ID.png" \
  --output appimage

# linuxdeploy drops the AppImage in the cwd; move to release/
BUILT=$(ls ./*.AppImage 2>/dev/null | head -1 || true)
OUTPUT_APPIMAGE="$OUTPUT_DIR/${APP_NAME}-${VERSION}-x86_64.AppImage"
if [ -n "$BUILT" ]; then
  mv "$BUILT" "$OUTPUT_APPIMAGE"
  chmod +x "$OUTPUT_APPIMAGE"
  echo "  → AppImage: $OUTPUT_APPIMAGE"
fi

# ── Step 5: Build Windows exe ──────────────────────────────────────────────────
echo ""
echo "[5/5] Building Windows exe (portable + zip)..."
npx electron-builder --win portable zip

echo ""
echo "=================================================="
echo "  ✓ Release v$VERSION complete!"
echo ""
ls -lh "$OUTPUT_DIR"/*.AppImage "$OUTPUT_DIR"/*.exe "$OUTPUT_DIR"/*.zip 2>/dev/null | awk '{print "  "$NF, $5}'
echo "=================================================="
