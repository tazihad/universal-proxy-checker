#!/usr/bin/env bash
# =============================================================================
# build-appimage.sh — Build Universal-Proxy-Checker AppImage via linuxdeploy
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"
LINUXDEPLOY="/run/media/zihad/Data/dev/build-appimage/linuxdeploy-x86_64.AppImage"
LINUXDEPLOY_PLUGIN_QT="/run/media/zihad/Data/dev/build-appimage/linuxdeploy-plugin-qt-x86_64.AppImage"

APP_NAME="Universal-Proxy-Checker"
APP_ID="com.tazihad.universal-proxy-checker"
VERSION=$(node -p "require('./package.json').version")
APPDIR="$PROJECT_DIR/AppDir"
OUTPUT_DIR="$PROJECT_DIR/release"
UNPACKED_DIR="$OUTPUT_DIR/linux-unpacked"

echo "=============================================="
echo "  Building $APP_NAME v$VERSION AppImage"
echo "=============================================="

# ── Step 1: Build the web/renderer (vite + tsc) ───────────────────────────────
echo ""
echo "[1/4] Building web assets (tsc + vite)..."
npm run build

# ── Step 2: (Re)build the linux-unpacked electron directory ───────────────────
echo ""
echo "[2/4] Packaging electron app (electron-builder --dir)..."
npx electron-builder --linux dir

# ── Step 3: Assemble AppDir ────────────────────────────────────────────────────
echo ""
echo "[3/4] Assembling AppDir..."

# Clean old AppDir
rm -rf "$APPDIR"
mkdir -p "$APPDIR/usr/bin"
mkdir -p "$APPDIR/usr/lib/$APP_NAME"
mkdir -p "$APPDIR/usr/share/applications"
mkdir -p "$APPDIR/usr/share/icons/hicolor/256x256/apps"
mkdir -p "$APPDIR/usr/share/icons/hicolor/512x512/apps"

# Copy the entire linux-unpacked Electron bundle into usr/lib/<app>
echo "  → Copying electron bundle..."
cp -r "$UNPACKED_DIR"/. "$APPDIR/usr/lib/$APP_NAME/"

# Symlink the main executable into usr/bin so linuxdeploy can find it
ln -sf "../lib/$APP_NAME/$APP_NAME" "$APPDIR/usr/bin/$APP_NAME"
# lowercase symlink for the desktop entry Exec= field
APP_EXEC=$(echo "$APP_NAME" | tr '[:upper:]' '[:lower:]' | tr '-' '-')

# Copy icon
ICON_SRC="$PROJECT_DIR/public/icons/icon.png"
if [ ! -f "$ICON_SRC" ]; then
  ICON_SRC="$PROJECT_DIR/dist/icons/icon.png"
fi
cp "$ICON_SRC" "$APPDIR/usr/share/icons/hicolor/256x256/apps/$APP_ID.png"
cp "$ICON_SRC" "$APPDIR/usr/share/icons/hicolor/512x512/apps/$APP_ID.png"
# Root icon (required by linuxdeploy)
cp "$ICON_SRC" "$APPDIR/$APP_ID.png"

# Write .desktop file
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

# Copy .desktop to AppDir root (AppImage spec)
cp "$APPDIR/usr/share/applications/$APP_ID.desktop" "$APPDIR/$APP_ID.desktop"

# Write AppRun launcher
cat > "$APPDIR/AppRun" <<'APPRUN'
#!/usr/bin/env bash
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_NAME="Universal-Proxy-Checker"

# Electron sandbox setup
export CHROME_SANDBOX="$HERE/usr/lib/$APP_NAME/chrome-sandbox"
if [ -f "$CHROME_SANDBOX" ]; then
  chmod 4755 "$CHROME_SANDBOX" 2>/dev/null || true
fi

exec "$HERE/usr/lib/$APP_NAME/$APP_NAME" --no-sandbox "$@"
APPRUN
chmod +x "$APPDIR/AppRun"

echo "  → AppDir assembled at: $APPDIR"

# ── Step 4: Build AppImage via linuxdeploy ─────────────────────────────────────
echo ""
echo "[4/4] Building AppImage with linuxdeploy..."

mkdir -p "$OUTPUT_DIR"

# linuxdeploy needs FUSE or --appimage-extract-and-run
export APPIMAGE_EXTRACT_AND_RUN=1

OUTPUT_APPIMAGE="$OUTPUT_DIR/${APP_NAME}-${VERSION}-x86_64.AppImage"

"$LINUXDEPLOY" \
  --appdir "$APPDIR" \
  --desktop-file "$APPDIR/$APP_ID.desktop" \
  --icon-file "$APPDIR/$APP_ID.png" \
  --output appimage

# linuxdeploy writes <Name>-x86_64.AppImage to the current dir; move it
BUILT=$(ls ./*.AppImage 2>/dev/null | head -1 || true)
if [ -n "$BUILT" ] && [ "$BUILT" != "$OUTPUT_APPIMAGE" ]; then
  mv "$BUILT" "$OUTPUT_APPIMAGE"
fi

echo ""
echo "=============================================="
echo "  ✓ AppImage ready: $OUTPUT_APPIMAGE"
echo "=============================================="
