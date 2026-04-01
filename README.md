# Meetly by Re:Cloud

Self-hosted [cal.com](https://github.com/calcom/cal.com) deployment, running at **https://meetly.rocket.re-cloud.io**.

This branch (`cal.com`) is a derivative of [calcom/cal.com](https://github.com/calcom/cal.com) at commit [`77b2be13b2`](https://github.com/calcom/cal.com/commit/77b2be13b2).

## Changes from upstream

| Change | Issue |
|--------|-------|
| Kubernetes manifests for full self-hosted deployment (PostgreSQL, ingress, TLS, Brevo SMTP, Google Calendar OAuth) | [#3](https://github.com/voltAIc-apps/meetly/issues/3) |
| Fix 2FA: strip spaces/non-digits from TOTP codes inserted by `react-digit-input` | [#3](https://github.com/voltAIc-apps/meetly/issues/3) |
| Patched Docker image (`crepo.re-cloud.io/meetly/calcom:patched`) to apply fixes to compiled JS bundles | [#3](https://github.com/voltAIc-apps/meetly/issues/3) |

## Deployment

See [`k8s/`](k8s/) for all Kubernetes manifests. Apply in order:

```bash
kubectl apply -f k8s/00-namespace.yaml
kubectl apply -f k8s/01-secrets.yaml
kubectl apply -f k8s/02-configmap.yaml
kubectl apply -f k8s/10-statefulset-postgresql.yaml
kubectl apply -f k8s/11-service-postgresql.yaml
kubectl apply -f k8s/20-deployment-calcom.yaml
kubectl apply -f k8s/21-service-calcom.yaml
kubectl apply -f k8s/30-ingress.yaml
```

## Rebuilding the patched image

When pulling a new upstream `calcom/cal.com:latest`, rebuild the patched image:

```bash
docker build -f k8s/Dockerfile.patched -t crepo.re-cloud.io/meetly/calcom:patched .
docker push crepo.re-cloud.io/meetly/calcom:patched
kubectl -n meetly rollout restart deployment/meetly-web
```
