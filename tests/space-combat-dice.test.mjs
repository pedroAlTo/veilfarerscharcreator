import test from 'node:test';
import assert from 'node:assert/strict';
import { diceMesh } from '../public/space-combat-dice.mjs';

test('damage dice use closed three-dimensional meshes with the correct face counts', () => {
  for (const sides of [6, 8, 10, 12]) {
    const mesh = diceMesh(sides);
    assert.equal(mesh.faces.length, sides, `d${sides} face count`);
    const edges = new Map();
    for (const face of mesh.faces) {
      for (let i = 0; i < face.length; i++) {
        const key = [face[i], face[(i + 1) % face.length]].sort((a, b) => a - b).join(',');
        edges.set(key, (edges.get(key) || 0) + 1);
      }
    }
    assert.ok([...edges.values()].every(count => count === 2), `d${sides} mesh is closed`);
    assert.equal(mesh.vertices.length - edges.size + mesh.faces.length, 2);
  }
});
