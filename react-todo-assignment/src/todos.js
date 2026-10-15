export const STORAGE_KEY = 'react-todo-assignment:v1';

// Completed tasks are immutable except for deletion. Enforce this in state too,
// so the rule does not depend solely on hiding or disabling UI controls.
export function todosReducer(todos, action) {
  switch (action.type) {
    case 'add':
      return [...todos, { id: action.id, description: action.description, completed: false }];
    case 'edit':
      return todos.map((todo) =>
        todo.id === action.id && !todo.completed
          ? { ...todo, description: action.description }
          : todo,
      );
    case 'complete':
      return todos.map((todo) =>
        todo.id === action.id && !todo.completed ? { ...todo, completed: true } : todo,
      );
    case 'delete':
      return todos.filter((todo) => todo.id !== action.id);
    default:
      return todos;
  }
}

export function selectTodos(todos, filter = 'all') {
  const completed = todos.filter((todo) => todo.completed);
  const pending = todos.filter((todo) => !todo.completed);
  if (filter === 'done') return completed;
  if (filter === 'todo') return pending;
  return [...completed, ...pending];
}

export function readTodos(storage) {
  try {
    const value = JSON.parse(storage.getItem(STORAGE_KEY) ?? '[]');
    if (!Array.isArray(value)) return [];
    const ids = new Set();
    return value.filter((todo) => {
      if (
        !todo || typeof todo.id !== 'string' || ids.has(todo.id) ||
        typeof todo.description !== 'string' || typeof todo.completed !== 'boolean'
      ) return false;
      ids.add(todo.id);
      return true;
    }).map(({ id, description, completed }) => ({ id, description, completed }));
  } catch {
    // Blocked storage or invalid stored data should never prevent using the app.
    return [];
  }
}

export function writeTodos(storage, todos) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(todos));
    return true;
  } catch {
    return false;
  }
}
