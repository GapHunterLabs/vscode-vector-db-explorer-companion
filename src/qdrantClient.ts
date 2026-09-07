/**
 * Pure logic -- no `vscode` dependency. New niche (not a port from
 * the Kotlin catalog). Evidence: confirmed absence -- unlike SQL/
 * Mongo/Redis, which all have dedicated, mature VS Code client
 * extensions, no vector database (Pinecone/Weaviate/Qdrant) has a
 * collection explorer inside the editor, despite the real adoption
 * boom for RAG applications. v0.1 scope: Qdrant only (its REST API
 * needs just an API key header, no SDK) -- Pinecone/Weaviate are a
 * real, separate follow-up, not attempted here.
 *
 * This is the one extension in this workstream that makes network
 * calls by necessity (an "explorer" has nothing to explore without
 * talking to the database) -- always to the user's OWN configured
 * Qdrant instance, never to any Gap Hunter Labs or third-party
 * server. See PRIVACY.md for the honest statement of that.
 */

export interface CollectionSummary {
  name: string;
}

export interface CollectionDetail {
  status: string;
  pointsCount: number | null;
  vectorSize: number | null;
  distance: string | null;
}

export class QdrantResponseError extends Error {}

/** Parses GET /collections' real response shape:
 * { result: { collections: [{ name }] }, status: "ok", time: 0.001 } */
export function parseCollectionsList(json: unknown): CollectionSummary[] {
  const result = (json as Record<string, unknown> | undefined)?.result as Record<string, unknown> | undefined;
  const collections = result?.collections;
  if (!Array.isArray(collections)) {
    throw new QdrantResponseError('Unexpected response shape from GET /collections (missing result.collections array).');
  }
  return collections
    .filter((entry): entry is Record<string, unknown> => typeof entry === 'object' && entry !== null)
    .map((entry) => ({ name: typeof entry.name === 'string' ? entry.name : '(unnamed)' }));
}

/** Parses GET /collections/{name}'s real response shape:
 * { result: { status, points_count, config: { params: { vectors: { size, distance } } } } } */
export function parseCollectionDetail(json: unknown): CollectionDetail {
  const result = (json as Record<string, unknown> | undefined)?.result as Record<string, unknown> | undefined;
  if (!result) {
    throw new QdrantResponseError('Unexpected response shape from GET /collections/{name} (missing result).');
  }

  const config = result.config as Record<string, unknown> | undefined;
  const params = config?.params as Record<string, unknown> | undefined;
  // Qdrant supports both a single unnamed vector config and multiple
  // named vectors -- v0.1 only reads the single-vector shape (the
  // common case for a straightforward RAG collection); a named-vectors
  // collection reports size/distance as null rather than guessing
  // which one to show.
  const vectors = params?.vectors as Record<string, unknown> | undefined;
  const size = typeof vectors?.size === 'number' ? vectors.size : null;
  const distance = typeof vectors?.distance === 'string' ? vectors.distance : null;

  return {
    status: typeof result.status === 'string' ? result.status : 'unknown',
    pointsCount: typeof result.points_count === 'number' ? result.points_count : null,
    vectorSize: size,
    distance,
  };
}
