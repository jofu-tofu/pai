### M1.1 Prefer ANSI M Core

**Impact: CRITICAL (Portability across IRIS and GT.M depends on this baseline)**

Default to ANSI-compatible M behavior in released code paths. Use implementation-specific features only when required and only behind explicit wrappers.

**Avoid:** writing core business logic around vendor-only commands, variables, or relaxed syntax.

**Prefer:** ANSI-compatible command/function usage in routine logic, with implementation-specific logic isolated in dedicated wrapper routines.
