#!/bin/sh
# iPhux — Interactive Launcher
# POSIX sh compatible (works in iSH/Alpine)
set -eu

#──────────────────────────────────────────────────────────
# Colours
#──────────────────────────────────────────────────────────
if [ -t 1 ]; then
  RED='\033[0;31m'; GRN='\033[0;32m'; YLW='\033[1;33m'
  BLU='\033[0;34m'; MAG='\033[0;35m'; CYN='\033[0;36m'
  WHT='\033[1;37m'; RST='\033[0m'
else
  RED=''; GRN=''; YLW=''; BLU=''; MAG=''; CYN=''; WHT=''; RST=''
fi

#──────────────────────────────────────────────────────────
# Safety: validate numeric menu input
#──────────────────────────────────────────────────────────
is_number() { printf '%s' "$1" | grep -qE '^[0-9]+$'; }

#──────────────────────────────────────────────────────────
# Tool existence check
#──────────────────────────────────────────────────────────
require() {
  tool="$1"
  if ! command -v "$tool" > /dev/null 2>&1; then
    printf "%b[!]%b '%s' not found. Run install.sh first.\n" "$YLW" "$RST" "$tool"
    return 1
  fi
  return 0
}

#──────────────────────────────────────────────────────────
# Header
#──────────────────────────────────────────────────────────
show_header() {
  clear
  printf "%b" "$CYN"
  cat << 'HEADER'
 ██╗██████╗ ██╗  ██╗██╗   ██╗██╗  ██╗
 ██║██╔══██╗██║  ██║██║   ██║╚██╗██╔╝
 ██║██████╔╝███████║██║   ██║ ╚███╔╝
 ██║██╔═══╝ ██╔══██║██║   ██║ ██╔██╗
 ██║██║     ██║  ██║╚██████╔╝██╔╝ ██╗
 ╚═╝╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝
HEADER
  printf "%b  iPhone Linux Pentest Toolkit%b\n" "$WHT" "$RST"
  printf "%b  ──────────────────────────────────────%b\n" "$CYN" "$RST"
  printf "  Host: %s | Kernel: %s\n" "$(hostname)" "$(uname -r 2>/dev/null || echo 'iSH')"
  printf "  Date: %s\n" "$(date '+%Y-%m-%d %H:%M')"
  printf "%b  ──────────────────────────────────────%b\n\n" "$CYN" "$RST"
}

#──────────────────────────────────────────────────────────
# Main menu
#──────────────────────────────────────────────────────────
main_menu() {
  printf "%b MAIN MENU%b\n" "$WHT" "$RST"
  printf "%b  [1]%b  Network & Port Scanning\n"    "$GRN" "$RST"
  printf "%b  [2]%b  Web Application Testing\n"    "$GRN" "$RST"
  printf "%b  [3]%b  Password & Auth Attacks\n"    "$GRN" "$RST"
  printf "%b  [4]%b  Wireless Attacks\n"           "$GRN" "$RST"
  printf "%b  [5]%b  Recon & OSINT\n"              "$GRN" "$RST"
  printf "%b  [6]%b  Exploitation\n"               "$GRN" "$RST"
  printf "%b  [7]%b  Forensics & Analysis\n"       "$GRN" "$RST"
  printf "%b  [8]%b  Cryptography\n"               "$GRN" "$RST"
  printf "%b  [9]%b  Reverse Engineering\n"        "$GRN" "$RST"
  printf "%b [10]%b  Automated Scripts\n"          "$BLU" "$RST"
  printf "%b [11]%b  System Info & Config\n"       "$BLU" "$RST"
  printf "%b  [0]%b  Exit\n\n"                      "$RED" "$RST"
  printf "%biPhux%b » " "$MAG" "$RST"
}

#──────────────────────────────────────────────────────────
# Sub-menus
#──────────────────────────────────────────────────────────
menu_network() {
  show_header
  printf "%b NETWORK & PORT SCANNING%b\n\n" "$WHT" "$RST"
  printf "%b [1]%b nmap — Full TCP scan (stealth)\n"     "$GRN" "$RST"
  printf "%b [2]%b nmap — OS + version detection\n"      "$GRN" "$RST"
  printf "%b [3]%b nmap — UDP top 100\n"                 "$GRN" "$RST"
  printf "%b [4]%b nmap — Script scan (vuln)\n"          "$GRN" "$RST"
  printf "%b [5]%b netcat — Port listener\n"             "$GRN" "$RST"
  printf "%b [6]%b netcat — Connect to host\n"           "$GRN" "$RST"
  printf "%b [7]%b tcpdump — Capture traffic\n"          "$GRN" "$RST"
  printf "%b [8]%b arp-scan — Local host discovery\n"   "$GRN" "$RST"
  printf "%b [9]%b traceroute\n"                         "$GRN" "$RST"
  printf "%b [0]%b Back\n\n"                              "$RED" "$RST"
  printf "Choice: "
  read -r choice
  is_number "$choice" || { warn_invalid; return; }
  case "$choice" in
    1) require nmap && { printf "Target IP/range: "; read -r t; validate_ip_or_cidr "$t" && nmap -sS -p- --open -T4 "$t"; } ;;
    2) require nmap && { printf "Target IP: "; read -r t; validate_ip_or_cidr "$t" && nmap -sV -O -T4 "$t"; } ;;
    3) require nmap && { printf "Target IP: "; read -r t; validate_ip_or_cidr "$t" && nmap -sU --top-ports 100 "$t"; } ;;
    4) require nmap && { printf "Target IP: "; read -r t; validate_ip_or_cidr "$t" && nmap -sV --script vuln "$t"; } ;;
    5) require nc   && { printf "Port to listen on: "; read -r p; validate_port "$p" && nc -lvnp "$p"; } ;;
    6) require nc   && { printf "Host: "; read -r h; printf "Port: "; read -r p; validate_port "$p" && nc -vn "$h" "$p"; } ;;
    7) require tcpdump && { printf "Interface (e.g. eth0): "; read -r iface; validate_iface "$iface" && tcpdump -i "$iface" -nn; } ;;
    8) require arp-scan && arp-scan -l ;;
    9) require traceroute && { printf "Target: "; read -r t; traceroute "$t"; } ;;
    0) return ;;
    *) warn_invalid ;;
  esac
  press_enter
}

menu_web() {
  show_header
  printf "%b WEB APPLICATION TESTING%b\n\n" "$WHT" "$RST"
  printf "%b [1]%b nikto — Web vulnerability scanner\n"   "$GRN" "$RST"
  printf "%b [2]%b sqlmap — SQL injection tester\n"       "$GRN" "$RST"
  printf "%b [3]%b dirb — Directory brute-force\n"        "$GRN" "$RST"
  printf "%b [4]%b gobuster — Dir/DNS brute-force\n"      "$GRN" "$RST"
  printf "%b [5]%b curl — HTTP request inspector\n"       "$GRN" "$RST"
  printf "%b [6]%b whatweb — CMS/tech fingerprint\n"      "$GRN" "$RST"
  printf "%b [7]%b wafw00f — WAF detection\n"             "$GRN" "$RST"
  printf "%b [8]%b Custom web recon script\n"             "$BLU" "$RST"
  printf "%b [0]%b Back\n\n"                               "$RED" "$RST"
  printf "Choice: "
  read -r choice
  is_number "$choice" || { warn_invalid; return; }
  case "$choice" in
    1) require nikto    && { printf "URL (https://...): "; read -r u; validate_url "$u" && nikto -h "$u"; } ;;
    2) require sqlmap   && { printf "URL: "; read -r u; validate_url "$u" && sqlmap -u "$u" --batch --level=2; } ;;
    3) require dirb     && { printf "URL: "; read -r u; validate_url "$u" && dirb "$u"; } ;;
    4) require gobuster && { printf "URL: "; read -r u; printf "Wordlist: "; read -r w; validate_url "$u" && gobuster dir -u "$u" -w "$w"; } ;;
    5) require curl     && { printf "URL: "; read -r u; validate_url "$u" && curl -sI "$u"; } ;;
    6) require whatweb  && { printf "URL: "; read -r u; validate_url "$u" && whatweb "$u"; } ;;
    7) require wafw00f  && { printf "URL: "; read -r u; validate_url "$u" && wafw00f "$u"; } ;;
    8) sh scripts/webcheck.sh ;;
    0) return ;;
    *) warn_invalid ;;
  esac
  press_enter
}

menu_password() {
  show_header
  printf "%b PASSWORD & AUTH ATTACKS%b\n\n" "$WHT" "$RST"
  printf "%b [1]%b hydra — SSH brute force\n"      "$GRN" "$RST"
  printf "%b [2]%b hydra — HTTP form brute force\n" "$GRN" "$RST"
  printf "%b [3]%b hydra — FTP brute force\n"      "$GRN" "$RST"
  printf "%b [4]%b john — Crack hash file\n"        "$GRN" "$RST"
  printf "%b [5]%b hashcat — GPU hash cracking\n"   "$GRN" "$RST"
  printf "%b [6]%b crunch — Generate wordlist\n"    "$GRN" "$RST"
  printf "%b [7]%b medusa — Multi-protocol brute\n" "$GRN" "$RST"
  printf "%b [0]%b Back\n\n"                         "$RED" "$RST"
  printf "Choice: "
  read -r choice
  is_number "$choice" || { warn_invalid; return; }
  case "$choice" in
    1) require hydra  && { printf "Target IP: "; read -r t; printf "User: "; read -r u; printf "Wordlist: "; read -r w; validate_ip "$t" && hydra -l "$u" -P "$w" "ssh://${t}"; } ;;
    2) require hydra  && { printf "URL: "; read -r u; validate_url "$u" && printf "(see hydra -h for options)\n"; } ;;
    3) require hydra  && { printf "Target IP: "; read -r t; printf "User: "; read -r u; printf "Wordlist: "; read -r w; validate_ip "$t" && hydra -l "$u" -P "$w" "ftp://${t}"; } ;;
    4) require john   && { printf "Hash file: "; read -r f; [ -f "$f" ] && john "$f" || printf "File not found.\n"; } ;;
    5) require hashcat && { printf "Hash file: "; read -r f; printf "Wordlist: "; read -r w; [ -f "$f" ] && hashcat -a 0 "$f" "$w" || printf "File not found.\n"; } ;;
    6) require crunch && { printf "Min len: "; read -r a; printf "Max len: "; read -r b; validate_number "$a" && validate_number "$b" && crunch "$a" "$b"; } ;;
    7) require medusa && printf "(see medusa -h for options)\n" ;;
    0) return ;;
    *) warn_invalid ;;
  esac
  press_enter
}

menu_scripts() {
  show_header
  printf "%b AUTOMATED SCRIPTS%b\n\n" "$WHT" "$RST"
  printf "%b [1]%b Quick network scan\n"          "$GRN" "$RST"
  printf "%b [2]%b Full web recon\n"              "$GRN" "$RST"
  printf "%b [3]%b Full target recon (domain)\n" "$GRN" "$RST"
  printf "%b [4]%b Port knock scan\n"             "$GRN" "$RST"
  printf "%b [0]%b Back\n\n"                       "$RED" "$RST"
  printf "Choice: "
  read -r choice
  is_number "$choice" || { warn_invalid; return; }
  case "$choice" in
    1) sh scripts/quickscan.sh ;;
    2) sh scripts/webcheck.sh ;;
    3) sh scripts/recon_auto.sh ;;
    4) sh scripts/portknock.sh ;;
    0) return ;;
    *) warn_invalid ;;
  esac
  press_enter
}

menu_sysinfo() {
  show_header
  printf "%b SYSTEM INFO%b\n\n" "$WHT" "$RST"
  printf "  OS:      %s\n" "$(cat /etc/os-release 2>/dev/null | grep PRETTY_NAME | cut -d'=' -f2 | tr -d '"' || echo 'Alpine')"
  printf "  Kernel:  %s\n" "$(uname -r)"
  printf "  Arch:    %s\n" "$(uname -m)"
  printf "  Memory:  %s\n" "$(free -m 2>/dev/null | awk 'NR==2{printf "%dMB / %dMB", $3, $2}' || echo 'N/A')"
  printf "  Disk:    %s\n" "$(df -h / 2>/dev/null | awk 'NR==2{printf "%s used of %s", $3, $2}' || echo 'N/A')"
  printf "  IP:      %s\n" "$(ip addr show 2>/dev/null | awk '/inet /{print $2}' | head -3 | tr '\n' ' ' || ifconfig 2>/dev/null | awk '/inet /{print $2}' | head -3 | tr '\n' ' ' || echo 'N/A')"
  printf "  iPhux:   ${HOME}/.iphux\n"
  press_enter
}

#──────────────────────────────────────────────────────────
# Input validators  (no exec/eval used)
#──────────────────────────────────────────────────────────
validate_ip() {
  echo "$1" | grep -qE '^([0-9]{1,3}\.){3}[0-9]{1,3}$' || \
    { printf "%b[!]%b Invalid IP address.\n" "$RED" "$RST"; return 1; }
}

validate_ip_or_cidr() {
  echo "$1" | grep -qE '^([0-9]{1,3}\.){3}[0-9]{1,3}(/[0-9]{1,2})?$' || \
    { printf "%b[!]%b Invalid IP/CIDR.\n" "$RED" "$RST"; return 1; }
}

validate_port() {
  is_number "$1" && [ "$1" -ge 1 ] && [ "$1" -le 65535 ] || \
    { printf "%b[!]%b Invalid port (1-65535).\n" "$RED" "$RST"; return 1; }
}

validate_url() {
  echo "$1" | grep -qE '^https?://[a-zA-Z0-9._/-]+' || \
    { printf "%b[!]%b Invalid URL. Must start with http:// or https://\n" "$RED" "$RST"; return 1; }
}

validate_iface() {
  # Only allow alphanumeric + dash + dot (no shell metacharacters)
  echo "$1" | grep -qE '^[a-zA-Z0-9._-]+$' || \
    { printf "%b[!]%b Invalid interface name.\n" "$RED" "$RST"; return 1; }
}

validate_number() {
  is_number "$1" || { printf "%b[!]%b Must be a number.\n" "$RED" "$RST"; return 1; }
}

warn_invalid() { printf "%b[!]%b Invalid option.\n" "$YLW" "$RST"; }
press_enter()  { printf "\nPress Enter to continue…"; read -r _dummy; }

#──────────────────────────────────────────────────────────
# Main loop
#──────────────────────────────────────────────────────────
main() {
  while true; do
    show_header
    main_menu
    read -r choice
    is_number "$choice" || { warn_invalid; sleep 1; continue; }
    case "$choice" in
      1)  menu_network  ;;
      2)  menu_web      ;;
      3)  menu_password ;;
      4)  printf "\n%b[*]%b Use the wireless tools from the shell directly.\n" "$BLU" "$RST"
          printf "    aircrack-ng | airodump-ng | wifite | bettercap\n"
          press_enter ;;
      5)  sh scripts/recon_auto.sh ;;
      6)  require msfconsole && msfconsole ;;
      7)  printf "\n%b[*]%b Forensics tools: binwalk | foremost | strings | exiftool | steghide\n" "$BLU" "$RST"
          press_enter ;;
      8)  printf "\n%b[*]%b Crypto tools: openssl | gpg | sslscan | testssl.sh | hashdeep\n" "$BLU" "$RST"
          press_enter ;;
      9)  printf "\n%b[*]%b RevEng tools: gdb | radare2 | objdump | checksec | ltrace\n" "$BLU" "$RST"
          press_enter ;;
     10)  menu_scripts ;;
     11)  menu_sysinfo ;;
      0)  printf "Goodbye.\n"; exit 0 ;;
      *)  warn_invalid; sleep 1 ;;
    esac
  done
}

main
