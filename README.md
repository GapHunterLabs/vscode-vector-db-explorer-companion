# Vector Database Explorer Companion (VS Code)

Browses Qdrant collections (name, vector dimension, distance metric,
point count) in a sidebar tree.

**v0.1, new niche, and honestly noted upfront: this is the one
extension in this workstream that makes real network calls** — always
to the Qdrant instance you configure yourself, never to Gap Hunter
Labs or any third party. See [PRIVACY.md](PRIVACY.md) for the full,
specific statement.

Not a port from the Gap Hunter Labs IntelliJ-family catalog. Evidence:
confirmed absence — unlike SQL/Mongo/Redis, which all have dedicated,
mature VS Code client extensions, **no** vector database (Pinecone/
Weaviate/Qdrant) has a collection explorer inside the editor, despite
the real adoption boom for RAG applications.

## What it does

A **Qdrant Collections** view in the Explorer sidebar: connects to
the Qdrant URL you set (`vectorDbExplorerCompanion.qdrantUrl`,
e.g. `http://localhost:6333`), lists every collection, and shows each
one's point count, vector dimension, and distance metric. Refresh via
the view's title-bar button or `Vector Database Explorer Companion:
Refresh`. An API key (for a secured/cloud instance) is set via
`Vector Database Explorer Companion: Set Qdrant API Key` and stored
using VS Code's own Secret Storage, never in plain settings.

**v0.1 scope, honestly noted:**

- **Qdrant only.** Pinecone and Weaviate are a real, separate
  follow-up — their REST APIs and auth models differ enough that
  bolting them on wasn't attempted here.
- **Browsing, not search.** Listing collections and their stats only —
  running a similarity search against a collection isn't implemented.
- **Single unnamed vector configs only.** A collection using Qdrant's
  named-vectors feature (multiple vector fields per point) reports its
  dimension/distance as unavailable rather than guessing which one to
  show.
- Not tested against a live Qdrant instance in this development
  environment — built and unit-tested against Qdrant's documented
  real response shapes, worth a first real connection test before
  relying on it.

## Development

```bash
npm install
npm run compile   # or: npm run watch
npm test
```

To build an installable package without publishing:

```bash
npx @vscode/vsce package
```

## License

Apache License 2.0 — see [LICENSE](LICENSE).
