### M1.3 Enforce Portable Name Limits

**Impact: CRITICAL (Name truncation causes collisions and wrong target resolution)**

Keep routine, tag, variable, and global names within portable limits. Some engines allow longer names but resolve by the first 31 characters.

**Rule of thumb:** if two identifiers only differ after character 31, they are unsafe.

