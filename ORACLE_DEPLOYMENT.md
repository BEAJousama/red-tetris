# Oracle Cloud deployment

This deployment runs the React client, Express API, Socket.IO server, and SQLite database in one container behind Caddy. The public hostname is `https://tetris.obeaj.me`; no Vercel frontend is used.

## VM setup

Open ports `80` and `443` in the Oracle security list and Ubuntu firewall. Do not open port `3000` publicly. Install Git, Podman, `podman-compose`, and Caddy as described below.

## Deploy

```bash
git clone https://github.com/BEAJousama/red-tetris.git
cd red-tetris
cp server/.env.example server/.env
sed -i 's|https://tetris\.obeaj\.me|https://tetris.obeaj.me|' server/.env

set -a
. ./server/.env
set +a

podman-compose -f oracle-compose.yaml up -d --build
```

The Compose file uses host networking to avoid the CNI/DNS problems of Podman 3.4 on Ubuntu 22.04 ARM. Caddy proxies `127.0.0.1:3000`; the frontend, API, and Socket.IO all use the same HTTPS origin.

Use this Caddy entry:

```text
tetris.obeaj.me {
    reverse_proxy 127.0.0.1:3000
}
```

The API and Socket.IO endpoints stay on the same HTTPS origin, so the browser does not need a separate API hostname.

## Updates and checks

```bash
git pull
set -a
. ./server/.env
set +a
podman-compose -f oracle-compose.yaml up -d --build
podman ps
curl -fsS https://tetris.obeaj.me/api/healthz
```

SQLite data is stored in the named `tetris_data` volume. Back up that volume before VM maintenance or application changes.