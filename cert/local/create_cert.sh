#password os Aa123456

#learned from
#https://deliciousbrains.com/ssl-certificate-authority-for-local-https-development/
#https://deliciousbrains.com/https-locally-without-browser-privacy-errors/#creating-self-signed-certificate

#clean up
rm out/*
#create key for CA
openssl genrsa -des3 -out out/localCA.key 2048
#create certificate for CA
openssl req -x509 -new -nodes -sha256 -days 365 -config conf/localCA.conf -key out/localCA.key  -out out/localCA.pem
#you need import this certificate into windows certificate store

#create key for sync-server
openssl genrsa -out out/sync-server.key 2048
#create a certificate sign request
openssl req -new -config conf/sync-server.conf -key out/sync-server.key -out out/sync-server.csr
#sign the certificate by localCA
openssl x509 -req -in out/sync-server.csr -CA out/localCA.pem -CAkey out/localCA.key -CAcreateserial -out out/sync-server.cert -days 365 -sha256 -extfile conf/sync-server.ext
