#!/usr/bin/env bash
set -euo pipefail

# Install Hysteria 2 + Realm rendezvous server on a Linux VPS (systemd).
# Run as root: sudo bash setup.sh

HY2_VERSION="${HY2_VERSION:-latest}"
REALM_VERSION="${REALM_VERSION:-v1.1.0}"
INSTALL_DIR="/usr/local/bin"
CONFIG_DIR="/etc/hysteria"

command -v curl >/dev/null || { echo "curl required"; exit 1; }

mkdir -p "${CONFIG_DIR}/certs"
cp -n server.yaml client.yaml realm-server.env "${CONFIG_DIR}/" 2>/dev/null || true

if [[ ! -f "${CONFIG_DIR}/certs/server.crt" ]]; then
  curl -fsSL -o /tmp/hysteria "https://download.hysteria.network/app/${HY2_VERSION}/hysteria-linux-amd64"
  chmod +x /tmp/hysteria
  (cd "${CONFIG_DIR}/certs" && /tmp/hysteria cert)
  echo "Generated TLS cert. Copy pinSHA256 from output into client.yaml tls.pinSHA256."
fi

curl -fsSL -o /tmp/hysteria "https://download.hysteria.network/app/${HY2_VERSION}/hysteria-linux-amd64"
curl -fsSL -o /tmp/hysteria-realm-server "https://github.com/apernet/hysteria-realm-server/releases/download/${REALM_VERSION}/hysteria-realm-server-linux-amd64"
install -m 755 /tmp/hysteria "${INSTALL_DIR}/hysteria"
install -m 755 /tmp/hysteria-realm-server "${INSTALL_DIR}/hysteria-realm-server"

set -a
source "${CONFIG_DIR}/realm-server.env"
set +a

cat >/etc/systemd/system/hysteria-realm.service <<EOF
[Unit]
Description=Hysteria Realm Rendezvous (HTTP)
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
EnvironmentFile=${CONFIG_DIR}/realm-server.env
ExecStart=${INSTALL_DIR}/hysteria-realm-server
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

cat >/etc/systemd/system/hysteria-server.service <<EOF
[Unit]
Description=Hysteria 2 Server (Realms)
After=network-online.target hysteria-realm.service
Requires=hysteria-realm.service

[Service]
Type=simple
ExecStart=${INSTALL_DIR}/hysteria server -c ${CONFIG_DIR}/server.yaml
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now hysteria-realm.service hysteria-server.service
systemctl status hysteria-realm.service hysteria-server.service --no-pager

echo
echo "Open TCP ${HYSTERIA_REALM_LISTEN#:} (rendezvous HTTP) and allow outbound UDP in your firewall."
echo "Edit client.yaml: set YOUR_SERVER_IP to this machine's public IP."
