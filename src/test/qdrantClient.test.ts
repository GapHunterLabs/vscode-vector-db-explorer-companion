import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCollectionsList, parseCollectionDetail, QdrantResponseError } from '../qdrantClient';

test('parseCollectionsList reads real Qdrant GET /collections shape', () => {
  const json = { result: { collections: [{ name: 'docs' }, { name: 'products' }] }, status: 'ok', time: 0.001 };
  const list = parseCollectionsList(json);
  assert.deepEqual(list.map((c) => c.name), ['docs', 'products']);
});

test('parseCollectionsList returns empty for an empty instance', () => {
  const json = { result: { collections: [] }, status: 'ok', time: 0.001 };
  assert.deepEqual(parseCollectionsList(json), []);
});

test('parseCollectionsList throws on an unexpected shape', () => {
  assert.throws(() => parseCollectionsList({ foo: 'bar' }), QdrantResponseError);
});

test('parseCollectionDetail reads real Qdrant GET /collections/{name} shape', () => {
  const json = {
    result: {
      status: 'green',
      points_count: 1500,
      config: { params: { vectors: { size: 384, distance: 'Cosine' } } },
    },
    status: 'ok',
  };
  const detail = parseCollectionDetail(json);
  assert.equal(detail.status, 'green');
  assert.equal(detail.pointsCount, 1500);
  assert.equal(detail.vectorSize, 384);
  assert.equal(detail.distance, 'Cosine');
});

test('parseCollectionDetail returns null vector fields for a named-vectors collection (v0.1 scope)', () => {
  const json = {
    result: {
      status: 'green',
      points_count: 10,
      config: { params: { vectors: { text: { size: 384, distance: 'Cosine' }, image: { size: 512, distance: 'Dot' } } } },
    },
  };
  const detail = parseCollectionDetail(json);
  assert.equal(detail.vectorSize, null);
  assert.equal(detail.distance, null);
  assert.equal(detail.pointsCount, 10);
});

test('parseCollectionDetail throws on an unexpected shape', () => {
  assert.throws(() => parseCollectionDetail({ foo: 'bar' }), QdrantResponseError);
});
