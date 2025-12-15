# ensure-folders

Directus Flow Operation: Ensure Folders

A small Directus operation extension that idempotently ensures a hierarchy of up to 5 nested folders (folder1..folder5) in the Directus `folders` collection. It will reuse existing folders found by name (scoped by parent) or create them if missing, threading the parent folder id through each level.

Location
- data/directus/extensions/ensure-folders/src/api.js
- data/directus/extensions/ensure-folders/src/app.js

Behavior / contract
- Inputs (options):
  - folder1 (string, required) — top-level folder name
  - folder2 (string, optional)
  - folder3 (string, optional)
  - folder4 (string, optional)
  - folder5 (string, optional)
- Outputs: a flat object with keys `folder1`, `folder2`, `folder3`, `folder4`, `folder5`, and `lastFolder`. Each value is a folder id (string) or `null` when not provided or not created.
- Logic:
  - Iterates i = 1..5. For each `folder{i}` that is a non-empty string, it:
    - Looks for an existing folder with the same name and the current `parent` value (null for top-level).
    - If found, uses its id; otherwise creates a new folder with `name` and `parent`.
    - Sets `parent` to the found/created id for the next level.
  - Stops early when it encounters the first empty/missing folder name and returns the current result.
  - Idempotent: running the operation multiple times with the same names returns the same ids and does not create duplicates.
  - Handles a race when creating a folder by retrying the lookup if creation fails with a conflict.

Response shape (example)
```
{
  "folder1": "a1b2c3...",
  "folder2": "d4e5f6...",
  "folder3": null,
  "folder4": null,
  "folder5": null,
  "lastFolder": "d4e5f6..."
}
```
- `lastFolder` equals the id of the deepest created/found folder (the last non-empty folder). If only `folder1` is supplied, `lastFolder` equals `folder1`'s id.

Usage (Directus Flow Operation)
- Add the `ensure-folders` operation to a Flow.
- Provide `folder1` (required) and optionally `folder2`..`folder5`.
- The operation returns the object (above) which can be used by downstream operations.

Example payload (when invoking via API or testing in the Flow UI)
```
{
  "folder1": "Tenants",
  "folder2": "Project X",
  "folder3": "CollectionName"
}
```

Development / installation
1. Place this extension in `data/directus/extensions/ensure-folders` (build result of this repo).
2. Restart Directus so it discovers the extension.
3. Use the Flow builder to add the `ensure-folders` operation.

License & Contributing
Any use of this plugin in a commercial or public product must visibly mention the original author and repository.
Apache 2.0 License.

