# Harness Backlog

Use this file when an agent discovers a missing harness capability but should
not change the operating model immediately.

## Template

```md
## Missing Harness Capability

### Title

Short name.

### Discovered While

Task or story that exposed the gap.

### Current Pain

What was hard, repeated, ambiguous, or unsafe?

### Suggested Improvement

What should be added or changed?

### Risk

Tiny, normal, or high-risk.

### Status

proposed | accepted | implemented | rejected
```

## Items

## Missing Harness Capability

### Title

Windows/WSL-compatible Harness CLI installation.

### Discovered While

Initial spec intake for `SPEC.md` on 2026-05-31.

### Current Pain

The installed `scripts/bin/harness-cli` is a Linux ELF binary. It does not run
from Windows PowerShell, and WSL execution fails because the binary requires
`GLIBC_2.39`, which is newer than the installed WSL runtime. Required Harness
commands such as `query matrix`, `init`, `import brownfield`, and `trace` cannot
produce durable records in this environment.

### Suggested Improvement

Install a Windows-native Harness CLI binary when the repo is used from Windows,
or ship a Linux binary compatible with the supported WSL baseline. Add a smoke
check that fails loudly when the binary cannot execute.

### Risk

normal

### Status

proposed
