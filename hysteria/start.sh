#!/usr/bin/env bash
# Start Hysteria Realms rendezvous + Hysteria server (no systemd)
set -euo pipefail

TMUX="tmux -f /exec-daemon/tmux.portal.conf"
TOKEN="VMdg6sjbzmqj35tF2Q0SXSZw5IH09SfP"

start_session() {
  local name="$1"
  local cmd="$2"
  if ! $TMUX has-session -t "=$name" 2>/dev/null; then
    $TMUX new-session -d -s "$name" -c "/etc/hysteria" -- "${SHELL:-bash}" -l
  fi
  $TMUX send-keys -t "$name:0.0" C-c 2>/dev/null || true
  sleep 0.5
  $TMUX send-keys -t "$name:0.0" "$cmd" C-m
}

start_session hysteria-realm \
  "HYSTERIA_REALM_TOKEN=${TOKEN} HYSTERIA_REALM_LISTEN=:8080 /usr/local/bin/hysteria-realm-server"

sleep 1

start_session hysteria-server \
  "/usr/local/bin/hysteria server -c /etc/hysteria/server.yaml"

sleep 2
ps aux | grep -E 'hysteria-realm-server|hysteria server' | grep -v grep
