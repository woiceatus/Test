#!/usr/bin/env bash
# Start Hysteria server in Realms mode (NAT — uses public rendezvous at realm.hy2.io)
set -euo pipefail

TMUX="tmux -f /exec-daemon/tmux.portal.conf"
NAME="hysteria-server"

if ! $TMUX has-session -t "=$NAME" 2>/dev/null; then
  $TMUX new-session -d -s "$NAME" -c "/etc/hysteria" -- "${SHELL:-bash}" -l
fi

$TMUX send-keys -t "$NAME:0.0" C-c 2>/dev/null || true
sleep 0.5
$TMUX send-keys -t "$NAME:0.0" '/usr/local/bin/hysteria server -c /etc/hysteria/server.yaml' C-m

sleep 3
ps aux | grep 'hysteria server' | grep -v grep
$TMUX capture-pane -t "$NAME:0.0" -p -S -10 | tail -5
