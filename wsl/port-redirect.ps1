$wsl_ip = (wsl hostname -I).split(" ")[0]
netsh interface portproxy add v4tov4 listenport=3000 connectport=3000 connectaddress=$wsl_ip

if ( (& netsh advfirewall firewall show rule name="tss") -contains "No rules match the specified criteria.")
{
  Write-Output "create firewall rule"
  netsh advfirewall firewall add rule name=tss dir=in action=allow protocol=TCP localport=3000
}
