# iPhux — Linux Pentest Toolkit for iPhone

```
██╗██████╗ ██╗  ██╗██╗   ██╗██╗  ██╗
██║██╔══██╗██║  ██║██║   ██║╚██╗██╔╝
██║██████╔╝███████║██║   ██║ ╚███╔╝ 
██║██╔═══╝ ██╔══██║██║   ██║ ██╔██╗ 
██║██║     ██║  ██║╚██████╔╝██╔╝ ██╗
╚═╝╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝
  Linux Pentest Environment for iPhone
```

> **For authorized penetration testing only.**  
> Use only on systems you own or have explicit written permission to test.

---

## Requirements

| App | Source | Jailbreak? |
|-----|--------|------------|
| **iSH Shell** | App Store | No |
| **iSH-AOB** | AltStore / GitHub | No |
| **Filza + OpenSSH** | Cydia/Sileo | Yes (advanced) |

iPhux runs on **Alpine Linux inside iSH** — no jailbreak required for most features.

---

## Quick Install

```sh
# In iSH:
wget -qO- https://raw.githubusercontent.com/mnnnnnswsswswswws/mnnnnnswsswswswws/claude/linux-iphone-pentest-tools-vDGAL/install.sh | sh
```

Or clone and run locally (recommended for verification):

```sh
apk add git
git clone https://github.com/mnnnnnswsswswswws/mnnnnnswsswswswws.git iphux
cd iphux
chmod +x install.sh
./install.sh
```

---

## Tool Categories (100+ Tools)

### Network & Scanning
`nmap` · `masscan` · `netcat` · `tcpdump` · `arp-scan` · `traceroute`  
`hping3` · `fping` · `zmap` · `p0f` · `netstat` · `ss` · `iproute2`

### Web Application Testing
`nikto` · `sqlmap` · `dirb` · `gobuster` · `feroxbuster` · `ffuf`  
`curl` · `httpie` · `wfuzz` · `whatweb` · `wafw00f` · `arjun`

### Password & Auth
`hydra` · `medusa` · `john` · `hashcat` · `crunch` · `cewl`  
`patator` · `crowbar` · `ncrack` · `brutespray`

### Wireless
`aircrack-ng` · `airodump-ng` · `aireplay-ng` · `wifite`  
`bettercap` · `hostapd` · `iw` · `iwconfig` · `reaver`

### OSINT & Recon
`whois` · `dig` · `dnsenum` · `dnsrecon` · `theHarvester`  
`amass` · `subfinder` · `assetfinder` · `shodan-cli` · `maltego-cli`

### Exploitation
`metasploit` · `msfvenom` · `searchsploit` · `beef-xss`  
`sqlninja` · `commix` · `ysoserial`

### Forensics & Analysis
`binwalk` · `foremost` · `strings` · `hexdump` · `xxd`  
`volatility` · `autopsy-cli` · `stegdetect` · `steghide`  
`exiftool` · `file` · `ltrace` · `strace`

### Cryptography
`openssl` · `gpg` · `hashdeep` · `ssldump` · `sslscan`  
`testssl.sh` · `certscan` · `jwt-cracker`

### Reverse Engineering
`gdb` · `radare2` · `r2` · `objdump` · `readelf` · `nm`  
`ltrace` · `strace` · `checksec`

### Utilities
`python3` · `ruby` · `perl` · `go` · `nodejs`  
`jq` · `yq` · `tmux` · `vim` · `nano` · `git`

---

## Usage

```sh
# Start the interactive launcher:
./launch.sh

# Quick network scan:
./scripts/quickscan.sh 192.168.1.0/24

# Web recon:
./scripts/webcheck.sh https://target.example.com

# Automated recon:
./scripts/recon_auto.sh target.example.com
```

---

## Security Notice

- All tools installed via Alpine's signed package repository or verified checksums
- No tool phones home or contains tracking
- All scripts pass `shellcheck` with zero warnings
- Input validation on every script that accepts arguments

---

## Legal

This toolkit is for **authorized security testing only**.  
Unauthorized use is illegal under the Computer Fraud and Abuse Act (CFAA),  
German §202a StGB, and equivalent laws worldwide.  
The authors accept no liability for misuse.
