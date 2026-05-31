# 0006 Application Stack From Spec

Date: 2026-05-31

## Status

Accepted

## Context

`SPEC.md` defines the initial application direction for the Todo Kanban
Calendar App. The repository previously contained only the reusable Harness and
no selected application stack.

Implementation planning needs a durable record of the stack choices before
scaffolding backend, frontend, authentication, and local runtime files.

## Decision

Adopt the stack from `SPEC.md` for the initial buildout:

- Backend: Spring Boot with Java 17.
- Frontend: Angular with NG-ZORRO Ant Design.
- Authentication: Keycloak.
- Social login: Google and GitHub through Keycloak identity providers.
- API protection: Bearer JWT validated by the backend.
- Database: PostgreSQL.
- Build tool: Maven.
- Database migration: Flyway.
- Local runtime: Docker Compose.

## Alternatives Considered

1. Keep the Harness stack-neutral until the first implementation story. Rejected
   because the supplied product spec already selects a stack and the foundation
   stories depend on it.
2. Choose a different stack optimized for speed. Rejected because it would
   contradict the accepted source spec without a product reason.

## Consequences

Positive:

- Foundation stories can be scoped concretely.
- Product docs now have a stable technical baseline.
- Future architecture decisions can focus on build tool, migration tool,
  module boundaries, and deployment shape without reopening the core stack.

Tradeoffs:

- Early auth and RBAC work becomes high-risk because Keycloak, JWT validation,
  and database-backed permissions touch security and data model boundaries.
- The repo needs validation commands for both Java and Angular once scaffolded.

## Follow-Up

- Restore or replace `scripts/bin/harness-cli` with a binary that runs in the
  current Windows/WSL environment.
