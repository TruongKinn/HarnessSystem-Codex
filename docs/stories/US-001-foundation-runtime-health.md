# US-001 Foundation Runtime And Health Checks

## Status

in-progress

## Lane

normal

## Product Contract

The project has a runnable foundation for the Todo Kanban Calendar App: a
Spring Boot API shell, PostgreSQL persistence boundary, Flyway migration
baseline, and local Docker Compose services for PostgreSQL and Keycloak.

## Relevant Product Docs

- `docs/product/overview.md`
- `docs/product/technical-architecture.md`
- `docs/product/auth-access.md`

## Acceptance Criteria

- Backend uses Spring Boot, Java 17, Maven, Actuator, Flyway, and PostgreSQL.
- Backend exposes `GET /actuator/health`.
- Backend can start with local PostgreSQL settings.
- Flyway has a baseline migration location and runs during backend startup.
- Docker Compose defines PostgreSQL and Keycloak services for local MVP work.
- README documents the local foundation commands.

## Design Notes

- Commands: Maven wrapper for backend build and test.
- Queries: none yet.
- API: Actuator health only.
- Tables: no domain tables in this story; Flyway baseline is intentionally empty.
- Domain rules: none yet.
- UI surfaces: none yet.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Backend context test passes. |
| Integration | Flyway and PostgreSQL configuration compile; database integration is deferred until compose smoke is selected. |
| E2E | Not applicable. |
| Platform | Docker Compose config validates for PostgreSQL and Keycloak. |
| Release | Not applicable. |

## Harness Delta

This story starts the first application implementation slice from the accepted
spec intake.

## Evidence

- `docker compose config` passed.
- `docker compose config --quiet` passed.
- `backend/.\\mvnw.cmd test` passed: 1 test, 0 failures, 0 errors.
- `backend/.\\mvnw.cmd package` passed and produced
  `backend/target/backend-0.0.1-SNAPSHOT.jar`.
- `docker compose up -d postgres` could not run because Docker Desktop daemon
  was unavailable at `npipe:////./pipe/dockerDesktopLinuxEngine`.
- Runtime health smoke against `GET /actuator/health` is still pending until
  Docker Desktop is running.
