# VPS deployment and recovery

Use a maintained Linux VPS, Docker Engine/Compose v2, a hostname you control and DNS pointing to the server. This guide uses `vault.example.com` as an example hostname; replace it with your real hostname everywhere before enabling registration. Port 5432 must never be exposed. Keep the app's host binding at `127.0.0.1:8080`.

## Configure and start

Install Docker using the [official Docker Engine instructions](https://docs.docker.com/engine/install/). Use the [current distribution packages for Nginx and Certbot](https://certbot.eff.org/instructions). On a Debian/Ubuntu host with these packages available:

```sh
sudo apt-get update
sudo apt-get install nginx certbot python3-certbot-nginx
cp .env.example .env
chmod 600 .env
```

Edit `.env`:

```dotenv
PUBLIC_ORIGIN=https://vault.example.com
RP_ID=vault.example.com
TRUST_PROXY=true
```

`PUBLIC_ORIGIN` has no trailing slash or path. `RP_ID` is the hostname only. `TRUST_PROXY=true` is appropriate only with the supplied loopback Nginx boundary; Nginx replaces `X-Forwarded-For` with the direct client address, preventing client-supplied chains from controlling throttle identity. Do not open port 8080 publicly or add an untrusted proxy hop without revisiting this setting.

```sh
docker compose up -d --build
docker compose ps
curl --fail http://127.0.0.1:8080/api/health
```

Initial secrets are generated in a named volume; never commit, print in generic logs or use `.env` to hold a master password. Containers run the API as uid 1000, with read-only root filesystem, dropped capabilities and `no-new-privileges`. PostgreSQL uses an internal network and persistent volume. The separate outbound network allows infrastructure connectivity; the API has no automatic HIBP/telemetry calls.

## TLS with Let's Encrypt

Permit inbound TCP 80/443 and your actual SSH management port at the provider firewall. Verify SSH access remains available before activating a host firewall. Copy the HTTP bootstrap config after replacing the example hostname:

```sh
sudo cp deploy/nginx-http.conf /etc/nginx/sites-available/sentinel
sudo ln -s /etc/nginx/sites-available/sentinel /etc/nginx/sites-enabled/sentinel
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d vault.example.com --redirect
```

Once the certificate exists, install `deploy/nginx-https.conf` with the real hostname/certificate paths. Its `http2 on` directive requires Nginx 1.25.1+; for an older supported distribution package replace it with `listen 443 ssl http2;` / `listen [::]:443 ssl http2;` and remove `http2 on`. Do not copy configuration blindly past `nginx -t`.

```sh
sudo cp deploy/nginx-https.conf /etc/nginx/sites-available/sentinel
sudo nginx -t
sudo systemctl reload nginx
sudo certbot renew --dry-run
curl --fail --head https://vault.example.com/
```

Check Secure/HttpOnly/Strict cookies, HTTPS-only nonlocal access, strict CSP, `frame-ancestors 'none'`, no inline scripts/styles and HSTS. HSTS is enabled for this hostname only; do not preload or include unrelated subdomains without reviewing them. TLS redirects and certificates alone do not protect a compromised application origin.

Retrieve the invitation with the operator command, register a synthetic account first, enroll two passkeys and TOTP, and test the checklist before adding real credentials. Use the final hostname consistently for passkeys. Revoke all synthetic sessions and remove fixture credentials after validation.

## Back up and test restoration

Back up **both** PostgreSQL and the operational secret volume. The master password is not stored there. Operational secrets are needed to preserve TOTP decryptability and invitations; database snapshots contain ciphertext and metadata but still require strong access controls. Use an independently encrypted backup destination, restrictive permissions and off-host storage. Ciphertext backups retain password history and old master wrappers; deletion/master changes do not erase historical backups.

To capture a consistent complete self-hosted snapshot, stop application writes first:

```sh
umask 077
mkdir -p backups
docker compose stop app
docker compose exec -T db pg_dump -U sentinel -d sentinel -Fc > backups/sentinel.dump
docker compose run --rm --no-deps --entrypoint tar app -C /run/sentinel-secrets -czf - . > backups/operational-secrets.tar.gz
docker compose start app
```

Encrypt the two files before off-host transfer. Do not put `backups/` into a Git repository. The supplied `.gitignore` excludes it. A bare encrypted JSON export is a vault-content snapshot, not a database/passkey/factor/session backup; it cannot recreate account authentication on a fresh host. Its format is documented for local recovery with the correct master password.

Restore into a **separate isolated instance** first. Create/start its database and secret volume, stop its app, restore the operational files into the existing secret mount as uid1000, then restore the database:

```sh
docker compose stop app
docker compose run --rm --no-deps --entrypoint tar app -C /run/sentinel-secrets -xzf - < backups/operational-secrets.tar.gz
docker compose exec -T db pg_restore -U sentinel -d sentinel --clean --if-exists < backups/sentinel.dump
docker compose exec -T db psql -U sentinel -d sentinel -c 'DELETE FROM sessions; DELETE FROM challenges; DELETE FROM device_pairings;'
docker compose start app
```

These commands intentionally replace the selected instance's records/secrets; use only on the intended recovery instance. Verify schema compatibility and that restored `database-password` matches the database's existing role password. A clean destination initialized with different generated secrets needs the original database password installed **before** database initialization, or an explicit role-password rotation using a secure administrator procedure. `pg_restore --clean` does not change the PostgreSQL role password. Test passkey login at the same RP hostname, TOTP, correct-master unlock, representative records/history, shares and export. Do not reactivate stale sessions. Record restore time/object counts and retain a verified backup.

## Upgrade and incident handling

Pin a reviewed source commit, back up, run CI, build in a clean environment and review lockfile/vendor changes. Build/release signing and container-image digest pinning should be added to your release process; base image tags in this candidate track their maintenance streams and are not immutable digests. Run the new build against a restored staging copy before replacing production. Version 1 uses idempotent initial DDL, not a general future migration framework; future schema changes need explicit versioned migrations and rollback plans.

Do not delete/rotate `operational.key` casually: existing TOTP seeds require it. A deliberate rotation procedure must decrypt/reencrypt those seeds under a new key or force authenticated factor re-enrollment after incident response. Rotate invitations separately by replacing only `registration.key` with 32 CSPRNG bytes and restarting the app; distribute the new invitation through a private channel. Rotation of authentication secrets cannot decrypt or rekey vaults.

Review [SECURITY.md](../SECURITY.md) for a compromised-origin response. Maintain OS/browser updates, least-privilege administrator access, availability monitoring that never captures secrets, and tested recovery. HIBP availability is optional; the vault does not depend on external services for encryption/login/unlock.
