import { useEffect, useReducer, useState } from 'react';
import TodoInput from './components/TodoInput.jsx';
import TodoList from './components/TodoList.jsx';
import DeleteDialog from './components/DeleteDialog.jsx';
import { readTodos, todosReducer, writeTodos } from './todos.js';

function getSavedTodos() {
  try {
    return readTodos(window.localStorage);
  } catch {
    return [];
  }
}

export default function App() {
  const [todos, dispatch] = useReducer(todosReducer, undefined, getSavedTodos);
  const [filter, setFilter] = useState('all');
  const [deletingTodo, setDeletingTodo] = useState(null);
  const [announcement, setAnnouncement] = useState('');
  const [storageAvailable, setStorageAvailable] = useState(true);

  useEffect(() => {
    try {
      setStorageAvailable(writeTodos(window.localStorage, todos));
    } catch {
      setStorageAvailable(false);
    }
  }, [todos]);

  function addTodo(description) {
    dispatch({ type: 'add', id: crypto.randomUUID(), description });
    setFilter('all');
    setAnnouncement('Task added.');
  }

  function editTodo(id, description) {
    dispatch({ type: 'edit', id, description });
    setAnnouncement('Task updated.');
  }

  function completeTodo(id) {
    dispatch({ type: 'complete', id });
    setAnnouncement('Task completed. Completed tasks can only be deleted.');
  }

  function deleteTodo(id) {
    dispatch({ type: 'delete', id });
    setDeletingTodo(null);
    setAnnouncement('Task deleted.');
    if (todos.length === 1) setFilter('all');
  }

  return (
    <main className="todo-app">
      <TodoInput onAdd={addTodo} />
      <TodoList
        todos={todos}
        filter={filter}
        onFilterChange={setFilter}
        onEdit={editTodo}
        onComplete={completeTodo}
        onDelete={setDeletingTodo}
      />
      {!storageAvailable && (
        <p className="storage-message" role="status">Tasks are available for this session, but could not be saved for your next visit.</p>
      )}
      <p className="sr-only" role="status" aria-live="polite">{announcement}</p>
      {deletingTodo && (
        <DeleteDialog todo={deletingTodo} onCancel={() => setDeletingTodo(null)} onConfirm={deleteTodo} />
      )}
    </main>
  );
}
