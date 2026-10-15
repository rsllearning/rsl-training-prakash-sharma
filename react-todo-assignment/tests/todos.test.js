import test from 'node:test';
import assert from 'node:assert/strict';
import { STORAGE_KEY, readTodos, writeTodos, selectTodos, todosReducer } from '../src/todos.js';

const pending = (id, description = id) => ({ id, description, completed: false });

test('adding appends unrestricted descriptions, including empty, whitespace and Unicode', () => {
  const descriptions = ['', '   ', '<script>alert(1)</script>', 'React ✅ हिंदी', 'x'.repeat(10000)];
  const todos = descriptions.reduce((state, description, index) =>
    todosReducer(state, { type: 'add', id: String(index), description }), []);
  assert.deepEqual(todos.map((todo) => todo.description), descriptions);
  assert.ok(todos.every((todo) => !todo.completed));
});

test('editing updates only the selected pending todo without mutating the old state', () => {
  const original = [pending('a'), pending('b')];
  const edited = todosReducer(original, { type: 'edit', id: 'b', description: '' });
  assert.equal(edited[1].description, '');
  assert.equal(edited[0], original[0]);
  assert.equal(original[1].description, 'b');
});

test('completion is permanent and completed descriptions cannot be edited', () => {
  const completed = todosReducer([pending('a')], { type: 'complete', id: 'a' });
  assert.equal(completed[0].completed, true);
  assert.deepEqual(todosReducer(completed, { type: 'edit', id: 'a', description: 'changed' }), completed);
  assert.deepEqual(todosReducer(completed, { type: 'complete', id: 'a' }), completed);
  assert.deepEqual(todosReducer(completed, { type: 'undo', id: 'a' }), completed);
});

test('completed todos render first, with stable creation order in both groups', () => {
  const todos = [pending('a'), { ...pending('b'), completed: true }, pending('c'), { ...pending('d'), completed: true }];
  assert.deepEqual(selectTodos(todos).map((todo) => todo.id), ['b', 'd', 'a', 'c']);
  assert.deepEqual(selectTodos(todos, 'done').map((todo) => todo.id), ['b', 'd']);
  assert.deepEqual(selectTodos(todos, 'todo').map((todo) => todo.id), ['a', 'c']);
  assert.deepEqual(todos.map((todo) => todo.id), ['a', 'b', 'c', 'd']);
});

test('a newly added task remains last even when completed tasks are present', () => {
  const todos = [pending('a'), { ...pending('b'), completed: true }];
  const added = todosReducer(todos, { type: 'add', id: 'c', description: 'New' });
  assert.deepEqual(selectTodos(added).map((todo) => todo.id), ['b', 'a', 'c']);
});

test('deleting supports pending and completed tasks and keeps other tasks unchanged', () => {
  const todos = [pending('a'), { ...pending('b'), completed: true }];
  assert.deepEqual(todosReducer(todos, { type: 'delete', id: 'a' }), [todos[1]]);
  assert.deepEqual(todosReducer(todos, { type: 'delete', id: 'b' }), [todos[0]]);
  assert.deepEqual(todosReducer(todos, { type: 'delete', id: 'missing' }), todos);
});

test('storage round trip preserves empty descriptions and completion', () => {
  const values = new Map();
  const storage = { getItem: (key) => values.get(key), setItem: (key, value) => values.set(key, value) };
  const todos = [pending('a', ''), { ...pending('b'), completed: true }];
  assert.equal(writeTodos(storage, todos), true);
  assert.deepEqual(readTodos(storage), todos);
  assert.ok(values.has(STORAGE_KEY));
});

test('invalid storage cannot crash the app and invalid or duplicate records are excluded', () => {
  assert.deepEqual(readTodos({ getItem: () => '{broken' }), []);
  assert.deepEqual(readTodos({ getItem: () => '{"a":1}' }), []);
  assert.deepEqual(readTodos({ getItem: () => null }), []);
  const records = [pending('a'), pending('a', 'duplicate'), null, { id: 'b', description: 1, completed: false }, pending('c', '')];
  assert.deepEqual(readTodos({ getItem: () => JSON.stringify(records) }), [pending('a'), pending('c', '')]);
});

test('blocked or full storage fails gracefully', () => {
  const storage = {
    getItem() { throw new Error('Blocked'); },
    setItem() { throw new Error('Quota exceeded'); },
  };
  assert.deepEqual(readTodos(storage), []);
  assert.equal(writeTodos(storage, [pending('a')]), false);
});
