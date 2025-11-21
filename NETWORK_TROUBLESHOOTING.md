# GitHub Connectivity Troubleshooting Guide

## Issue: "Could not resolve host: github.com"

### Immediate Solutions to Try:

#### 1. DNS Configuration Fix
```powershell
# Flush DNS cache
ipconfig /flushdns

# Reset network adapter
ipconfig /release
ipconfig /renew
```

#### 2. Try Different DNS Servers
```powershell
# Temporarily use Google's DNS
netsh interface ip set dns "Wi-Fi" static 8.8.8.8
netsh interface ip add dns "Wi-Fi" 8.8.4.4 index=2

# Or use Cloudflare DNS
netsh interface ip set dns "Wi-Fi" static 1.1.1.1
netsh interface ip add dns "Wi-Fi" 1.0.0.1 index=2
```

#### 3. Check Firewall/Antivirus
- Temporarily disable Windows Firewall
- Check if antivirus is blocking GitHub access
- Add github.com to firewall exceptions

#### 4. Use SSH instead of HTTPS
```bash
# Change remote URL to SSH (if you have SSH keys set up)
git remote set-url origin git@github.com:SudeepKamaraj/arivom.git
```

#### 5. Use GitHub CLI
```powershell
# Install GitHub CLI
winget install GitHub.cli

# Login and push using CLI
gh auth login
gh repo sync
```

#### 6. Alternative Push Methods
```powershell
# Try pushing with verbose output
git push -v origin padipu

# Try with different protocol
git config --global url."https://".insteadOf git://
```

### Network Diagnostics Commands:
```powershell
# Test basic connectivity
ping google.com
ping 8.8.8.8

# Test DNS resolution
nslookup github.com
nslookup github.com 8.8.8.8

# Check routing
tracert github.com

# Test specific ports
telnet github.com 443
telnet github.com 22
```

### Corporate/School Network Solutions:
If you're on a corporate or school network:

1. **Proxy Configuration:**
```bash
git config --global http.proxy http://proxy.company.com:port
git config --global https.proxy https://proxy.company.com:port
```

2. **Certificate Issues:**
```bash
git config --global http.sslverify false  # Temporary solution
```

### Manual Upload Alternative:
If all else fails, you can manually upload files via GitHub web interface:
1. Go to https://github.com/SudeepKamaraj/arivom (when connection is restored)
2. Use "Upload files" feature
3. Drag and drop your changed files

### Restore Network Settings:
```powershell
# Reset to automatic DNS
netsh interface ip set dns "Wi-Fi" dhcp
```