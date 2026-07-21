# Pilo Plane Community Fork

## Release Line

- Upstream: `makeplane/plane`
- Upstream version: `v1.2.3`
- Upstream commit: `c3a9f997899fbd18b91d25b45ec45c93c689ba55`
- Pilo branch: `pilo-v1.2.3`
- First Pilo release: `v1.2.3-pilo.1`
- Frontend image: `ghcr.io/pilodevelopment/plane-frontend:v1.2.3-pilo.1`
- License: `AGPL-3.0-only`

The public repository and source links on the sign-in surface, authenticated
top navigation, and modified Intake UI are the source opportunity for the
network-deployed AGPL build.

The build also pins Node `22.23.1` and Nginx `1.30.4` by multi-platform digest.
The Nginx update from the upstream `1.27` build is contained within the web
image and is covered by the same web-only rollback. The web healthcheck uses
Nginx Alpine's built-in BusyBox HTTP client instead of upstream's unavailable
`curl` command.

## Owned Modification

The Community edition intentionally ships its native work-item template
selector as a no-op. This fork adds an independent, frontend-only Intake
template registry for Pilo-owned projects.

The first registry entry is `Codex Request - Agent Ready`, scoped to project
`e9b270a8-719f-4e2f-80bb-e9724f906e16`. It pre-populates the ten Markdown
sections enforced by Pilo's Plane-to-Codex bridge and the human Definition of
Ready checklist.

Trust boundaries:

- Template selection changes only the local create-form description.
- Existing Plane API, authentication, authorization, and Intake creation paths
  remain authoritative.
- The template cannot write a work item until the operator submits Plane's
  existing form.
- Every required section starts with exactly `TBD`, so Pilo's readiness guard
  rejects an unedited template instead of dispatching incomplete work.
- Changing templates after editing requires explicit confirmation and preserves
  the title and all work-item properties.
- Projects without a matching registry entry receive the unmodified Community
  Intake experience.

## Validation

Run the focused registry contract:

```bash
node --test apps/web/ce/components/inbox/intake-templates/registry.test.mjs
```

Build the same frontend image used in production:

```bash
docker build \
  --file apps/web/Dockerfile.web \
  --build-arg PILO_SOURCE_REVISION="$(git rev-parse HEAD)" \
  --tag pilo-plane-frontend:v1.2.3-pilo.1 \
  .
```

The Pilo workflow runs the focused contract and full Docker build for every PR
to `pilo-v1.2.3`. It also runs formatting, frontend typechecking, and a
high/critical vulnerability gate. A release tag matching `v*-pilo.*` publishes
the image to GHCR with OCI provenance and SBOM attestations.

## Production Rollout

Only the `web` image changes. API, workers, database, Redis, RabbitMQ, MinIO,
Space, Admin, Live, and Proxy remain on the existing Plane Community release.

Before rollout:

1. Capture a Plane database and upload-volume backup.
2. Record the current web image ID and repository digest.
3. Pull the Pilo image by immutable digest.
4. Render the compose configuration and confirm only `services.web.image`
   changes.
5. Recreate only `plane-app-web-1`.

Acceptance:

- `/api/instances/` still reports Plane Community `1.2.3`.
- Existing authenticated pages and Intake records remain accessible.
- The Pilo project Intake modal defaults to `Codex Request - Agent Ready`.
- An unknown project does not render the Pilo template selector.
- Selecting `Blank request` clears only an unedited description.
- Editing the description and changing templates opens a confirmation dialog.
- The public source link resolves to this tagged source tree.
- Signed-out and authenticated users can reach the tagged source without
  access to the configured Intake project.

## Rollback

The pre-fork production web image was:

```text
artifacts.plane.so/makeplane/plane-frontend:stable
sha256:a4221cced7196fd57fb345ac1a49cc8dd3c1230e2038a1df3bb8427304024a62
```

Rollback changes only `services.web.image` to the recorded upstream image and
recreates only the web service. No data rollback or database migration is
required because this fork does not change server state or schemas.

## Maintenance Policy

- Track upstream Community security releases monthly and critical advisories
  immediately.
- Rebase the Pilo release line onto a tested upstream tag; never deploy a
  floating `stable` tag.
- Keep base-image digests pinned and refresh them through reviewed releases.
- Run the registry contract, frontend typecheck/build, image vulnerability scan,
  and authenticated Intake acceptance before each release.
- Publish every production image from a public release tag with OCI provenance
  and SBOM attestations, then retain the prior digest for rollback.
