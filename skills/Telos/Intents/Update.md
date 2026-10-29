# Update TELOS

Read PORTABILITY.md and Setup.md. Use only the directory explicitly supplied in TELOS_DIR. Read the target before changing it. Confirm the requested content and destination from the conversation; never infer personal beliefs or goals from a model's suggestions.

Tools/UpdateTelos.ts supports the flat filenames listed in its help. It appends entries, optionally into a named section. It does not replace arbitrary handwritten text in place. For nested vault notes or in-place edits use host file tools with a timestamped backup and a changelog entry; report that the CLI was not used.

Run bun <skill-dir>/Tools/UpdateTelos.ts <filename> <content> <change-description> [--section <heading>] with TELOS_DIR set in the process environment. Supply arguments as separate strings, never interpolate untrusted content into a shell command. The tool locks the target, backs up the prior bytes in Backups/, preserves existing content and logs the change in updates.md. A missing section, invalid filename, traversal attempt, lock timeout or backup failure must not be reported as a successful update.

AUTOMATED regions are separate from handwritten entries. Only the documented --region current|ideal --body-file <path> mode rewrites their contents, validated by Tools/lib/TelosRegions.ts. Never place user-declared beliefs or goals into an automatically regenerated region. Unchanged region content writes nothing. Report any partial failure, especially a successful write with an unavailable changelog.

After a write, reread the target and report exactly what changed and where its backup lives. Personal notes remain private; no publication or remote export is implied.
