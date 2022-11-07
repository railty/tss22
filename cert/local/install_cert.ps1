#list all the CA certificate
#dir cert: -Recurse

#verify if the localCA exist
dir cert:\CurrentUser\root\ | ? { $_.subject -like "*cn=localCA,*" }

#delete the certificate
#dir cert:\CurrentUser\root\ | ? { $_.subject -like "*cn=localCA,*" } | Remove-Item

#import
#Import-Certificate -FilePath "localCA.pem" -CertStoreLocation 'Cert:\CurrentUser\Root' -Verbose
