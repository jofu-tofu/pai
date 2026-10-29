# Standalone TELOS dashboard

Optional Next.js template. Copy this directory, install its package.json dependencies with Bun, set TELOS_DIR to an explicit local notes folder and run bun dev. No account, personal profile, global memory tree or separate runtime is discovered. The app/ and components/ folders use framework-native casing.

The dashboard reads and edits local TELOS notes. Writes retain origin checks, path confinement, locking and backups; bind the development server to loopback and treat notes as private. The Ask panel has no built-in model backend: its route returns HTTP 501 and directs you to the host assistant. It never searches for credentials or starts an inference CLI. Add a backend only through an explicit separate integration.

Use bun build before distributing a generated dashboard. This template is optional; the parent Telos skill and its CLI do not need Next.js.
