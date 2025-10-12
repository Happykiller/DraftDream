# DraftDream

Docker Compose stack for the DraftDream platform: API, front office, back office, showcase, mobile, and object storage.

## Prerequisites

- Docker with the Docker Compose plugin
- make
- SSH access to the production server (for deployments)

## Quick Local Setup

1. Clone this repository.
2. Update your local hosts file (see the next section).
3. Run `make up-dev` to start MongoDB locally.
4. Open the URLs listed under Available Services.

## Local DNS Configuration

Add the following entries to your hosts file to reach the local services.

### Linux / macOS

Edit `/etc/hosts` with root privileges:

```bash
sudo nano /etc/hosts
```

Append these lines:

```
127.0.0.1 api.local.fo
127.0.0.1 front.local.fo
127.0.0.1 back.local.fo
127.0.0.1 showcase.local.fo
127.0.0.1 mobile.local.fo
127.0.0.1 io.local.fo
```

### Windows

Edit `C:\Windows\System32\drivers\etc\hosts` with an elevated editor and add the same lines:

```
127.0.0.1 api.local.fo
127.0.0.1 front.local.fo
127.0.0.1 back.local.fo
127.0.0.1 showcase.local.fo
127.0.0.1 mobile.local.fo
127.0.0.1 io.local.fo
```

## Available Services

- **API**: [http://api.local.fo](http://api.local.fo)
- **Front office (athlete and coach)**: [http://front.local.fo](http://front.local.fo)
- **Back office (company and admin)**: [http://back.local.fo](http://back.local.fo)
- **Showcase website**: [http://showcase.local.fo](http://showcase.local.fo)
- **Mobile (PWA dev server)**: [http://mobile.local.fo](http://mobile.local.fo)
- **Object storage (MinIO)**: [http://io.local.fo](http://io.local.fo)

## Handy Make Targets

| Target | Description |
| --- | --- |
| `make help` | List the available targets and usage |
| `make up-dev` | Start MongoDB for local development |
| `make down-dev` | Stop the MongoDB dev stack |
| `make logs-dev` | Tail the MongoDB logs |
| `make up-prod` | Start the full production stack |
| `make down-prod` | Shut down the production stack |
| `make logs-prod` | Tail production logs |
| `make reset` | Rebuild every image without cache |
| `make clean` | Remove project containers and volumes |
| `make save` | Build and export images for deployment |
| `make install` | Load archives on the server and restart prod |
| `make deploy-prod` | Chain `save` then `install` for a full deploy |

## Production Deployment Checklist

Deployment targets rely on three variables defined in the `Makefile`: `PROD_HOST`, `REMOTE_ROOT`, and `REMOTE_IMAGE_DIR`. Override them as needed, for example `make deploy-prod PROD_HOST=myuser@myserver`.

1. Build and export images: `make save`.
2. Copy the `*.tar` archives to the server, for example `scp fitdesk_*.tar $(PROD_HOST):$(REMOTE_IMAGE_DIR)`.
3. Load the images and restart the stack: `make install PROD_HOST=myuser@myserver`.
4. Optional: run the full sequence with `make deploy-prod PROD_HOST=myuser@myserver`.
5. Verify the services: `make ps` and check the public endpoints.

## Helpful Commands

- `docker compose ps` to check container health.
- `docker compose logs -f <service>` for targeted debugging.
- `make clean` for a full reset of project volumes.
