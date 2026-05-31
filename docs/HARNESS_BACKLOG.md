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

## Missing Harness Capability

### Title

Native Windows Harness CLI release artifact.

### Discovered While

Making the installed Harness usable from Windows PowerShell on 2026-06-01.

### Current Pain

The installed `scripts/bin/harness-cli` command path received a Linux ELF
binary. PowerShell selects that extensionless file and does not fall back to a
Windows `.cmd` launcher, so Harness commands appear to run without useful
output.

### Suggested Improvement

Publish `harness-cli-windows-x64.exe` and checksum assets with the release
workflow, update installer platform detection to install the `.exe` on Windows,
and keep the documented `scripts/bin/harness-cli` command usable from
PowerShell.

### Risk

normal

### Status

accepted
