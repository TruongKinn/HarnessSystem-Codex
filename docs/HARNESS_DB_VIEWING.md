# Viewing The Harness Database On Windows

The Harness durable database is stored at:

```text
D:\AI-AGENT\HarnessSystem-Codex\harness.db
```

Use PowerShell from the repository root:

```powershell
cd D:\AI-AGENT\HarnessSystem-Codex
```

## Common Views

Show record counts:

```powershell
scripts/bin/harness-cli query stats
```

Show story and validation status:

```powershell
scripts/bin/harness-cli query matrix
```

Show open Harness backlog items:

```powershell
scripts/bin/harness-cli query backlog --open
```

Show intake records:

```powershell
scripts/bin/harness-cli query intakes
```

Show task traces:

```powershell
scripts/bin/harness-cli query traces
```

Show recorded friction:

```powershell
scripts/bin/harness-cli query friction
```

## Direct SQL

List tables:

```powershell
scripts/bin/harness-cli query sql "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
```

Inspect a table:

```powershell
scripts/bin/harness-cli query sql "SELECT * FROM story"
scripts/bin/harness-cli query sql "SELECT * FROM trace"
scripts/bin/harness-cli query sql "SELECT * FROM backlog"
```

## Windows Notes

On Windows PowerShell, this command:

```powershell
scripts/bin/harness-cli query stats
```

resolves to:

```text
scripts/bin/harness-cli.cmd
```

The `.cmd` launcher runs the local Node-based fallback CLI and writes to the
same `harness.db` file.
