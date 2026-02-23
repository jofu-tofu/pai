### M5.2 Use API Looping Instead of Raw `$ORDER`

**Impact: CRITICAL (Raw traversal encodes storage assumptions)**

For Chronicles structures, prefer supported looping APIs (`$$zoID`, `$$zoDT`, index wrappers) over direct `$order` loops on physical globals.

