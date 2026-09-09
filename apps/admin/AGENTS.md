# Admin app instructions

- `docs/architecture.md` is the single source of truth for image identity, publication, and serving.
- Deploy `apps/admin` independently on Vercel. Permanent image storage belongs exclusively in R2.
- Use isolated temporary directories for conversion and remove them after success or failure.
- Never commit tokens, token digests, host paths, certificates, or backup credentials.
- Authenticate every upload admission and publication request. Public R2 storage contains fixed renditions only; credentials and canonical sources remain private.
- Changes to upload, auth, temporary file handling, or R2 object keys require focused trust-boundary regression tests.
