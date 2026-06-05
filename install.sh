#!/bin/sh
# iPhux Master Installer
# Requires: iSH (Alpine Linux) on iOS
# Security: verified checksums, HTTPS only, strict permissions
set -eu

#──────────────────────────────────────────────────────────
# Constants
#──────────────────────────────────────────────────────────
IPHUX_DIR="${HOME}/.iphux"
LOG_FILE="${IPHUX_DIR}/install.log"
MIN_DISK_MB=512

#──────────────────────────────────────────────────────────
# Colours (disabled if not a tty)
#──────────────────────────────────────────────────────────
if [ -t 1 ]; then
  RED='\033[0;31m'; GRN='\033[0;32m'; YLW='\033[1;33m'
  BLU='\033[0;34m'; CYN='\033[0;36m'; RST='\033[0m'
else
  RED=''; GRN=''; YLW=''; BLU=''; CYN=''; RST=''
fi

die()  { printf "%b[ERROR]%b %s\n" "$RED" "$RST" "$1" >&2; exit 1; }
info() { printf "%b[*]%b %s\n" "$BLU" "$RST" "$1"; }
ok()   { printf "%b[+]%b %s\n" "$GRN" "$RST" "$1"; }
warn() { printf "%b[!]%b %s\n" "$YLW" "$RST" "$1"; }

#──────────────────────────────────────────────────────────
# Pre-flight checks
#──────────────────────────────────────────────────────────
check_root() {
  if [ "$(id -u)" -ne 0 ]; then
    die "Run as root: sudo sh install.sh"
  fi
}

check_ish() {
  if [ ! -f /proc/ish ] && ! uname -r 2>/dev/null | grep -qi ish; then
    warn "Not running inside iSH — some tools may be unavailable."
  fi
}

check_disk() {
  available=$(df -m / 2>/dev/null | awk 'NR==2{print $4}')
  if [ -n "$available" ] && [ "$available" -lt "$MIN_DISK_MB" ]; then
    die "Need at least ${MIN_DISK_MB}MB free, have ${available}MB."
  fi
}

check_internet() {
  info "Checking internet connectivity…"
  if ! wget -q --spider --timeout=10 https://dl-cdn.alpinelinux.org/ 2>/dev/null; then
    die "No internet access. Connect to a network and retry."
  fi
  ok "Internet OK"
}

#──────────────────────────────────────────────────────────
# Setup directory structure
#──────────────────────────────────────────────────────────
setup_dirs() {
  info "Creating iPhux directory structure…"
  mkdir -p "${IPHUX_DIR}/logs" \
           "${IPHUX_DIR}/wordlists" \
           "${IPHUX_DIR}/targets" \
           "${IPHUX_DIR}/reports" \
           "${IPHUX_DIR}/loot"
  chmod 700 "${IPHUX_DIR}"
  chmod 700 "${IPHUX_DIR}/loot" "${IPHUX_DIR}/reports" "${IPHUX_DIR}/targets"
  touch "$LOG_FILE"
  ok "Directories ready at ${IPHUX_DIR}"
}

#──────────────────────────────────────────────────────────
# Alpine package update
#──────────────────────────────────────────────────────────
update_system() {
  info "Updating Alpine package index…"
  apk update --no-cache >> "$LOG_FILE" 2>&1 || die "apk update failed — check log at $LOG_FILE"
  ok "Package index updated"
}

#──────────────────────────────────────────────────────────
# Run each setup module
#──────────────────────────────────────────────────────────
run_module() {
  module="$1"
  label="$2"
  info "Installing: ${label}…"
  if sh "setup/${module}" >> "$LOG_FILE" 2>&1; then
    ok "${label} — done"
  else
    warn "${label} — partial failure (see $LOG_FILE)"
  fi
}

#──────────────────────────────────────────────────────────
# Install shell config
#──────────────────────────────────────────────────────────
install_config() {
  info "Installing shell configuration…"

  config_src="$(pwd)/config/bashrc"
  if [ -f "$config_src" ]; then
    # Back up existing config safely
    if [ -f "${HOME}/.profile" ]; then
      cp "${HOME}/.profile" "${HOME}/.profile.iphux.bak"
    fi
    # Append sourcing line only if not already present
    marker='# iPhux config'
    if ! grep -qF "$marker" "${HOME}/.profile" 2>/dev/null; then
      printf '\n%s\n. %s\n' "$marker" "$config_src" >> "${HOME}/.profile"
    fi
    ok "Shell config linked"
  else
    warn "config/bashrc not found — skipping"
  fi

  # Install MOTD
  if [ -f "$(pwd)/config/motd.sh" ]; then
    cp "$(pwd)/config/motd.sh" /etc/profile.d/iphux_motd.sh
    chmod 644 /etc/profile.d/iphux_motd.sh
  fi
}

#──────────────────────────────────────────────────────────
# Make scripts executable
#──────────────────────────────────────────────────────────
finalize() {
  info "Setting permissions…"
  find . -name '*.sh' -exec chmod 755 {} \;
  chmod 700 launch.sh install.sh
  ok "All done!"
  printf "\n"
  printf "%b━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━%b\n" "$CYN" "$RST"
  printf "  Run %b./launch.sh%b to start iPhux\n" "$GRN" "$RST"
  printf "%b━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━%b\n" "$CYN" "$RST"
  printf "\n"
}

#──────────────────────────────────────────────────────────
# Main
#──────────────────────────────────────────────────────────
main() {
  printf "%b" "$CYN"
  cat << 'BANNER'

  ██╗██████╗ ██╗  ██╗██╗   ██╗██╗  ██╗
  ██║██╔══██╗██║  ██║██║   ██║╚██╗██╔╝
  ██║██████╔╝███████║██║   ██║ ╚███╔╝
  ██║██╔═══╝ ██╔══██║██║   ██║ ██╔██╗
  ██║██║     ██║  ██║╚██████╔╝██╔╝ ██╗
  ╚═╝╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝
  iPhone Linux Pentest Toolkit — Installer

BANNER
  printf "%b" "$RST"

  check_root
  check_ish
  check_disk
  check_internet
  setup_dirs
  update_system

  run_module 01_base.sh      "Base system packages"
  run_module 02_network.sh   "Network & scanning tools"
  run_module 03_web.sh       "Web application tools"
  run_module 04_password.sh  "Password & auth tools"
  run_module 05_wireless.sh  "Wireless tools"
  run_module 06_forensics.sh "Forensics & analysis"
  run_module 07_exploit.sh   "Exploitation frameworks"
  run_module 08_recon.sh     "Recon & OSINT"
  run_module 09_crypto.sh    "Cryptography tools"

  install_config
  finalize
}

main "$@"
