import { useState } from 'react';

export default function TodoItem({ todo, onEdit, onComplete, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.description);
  const accessibleDescription = todo.description.trim() || 'Empty task';

  function startEditing() {
    setDraft(todo.description);
    setEditing(true);
  }

  function cancelEditing() {
    setDraft(todo.description);
    setEditing(false);
  }

  function confirmEditing(event) {
    event.preventDefault();
    onEdit(todo.id, draft);
    setEditing(false);
  }

  return (
    <li className={`todo-item${todo.completed ? ' is-completed' : ''}`}>
      {editing ? (
        <form className="edit-form" onSubmit={confirmEditing}>
          <label className="sr-only" htmlFor={`edit-${todo.id}`}>Edit task description</label>
          <input
            id={`edit-${todo.id}`}
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.preventDefault();
                cancelEditing();
              }
            }}
            autoFocus
          />
          <div className="item-actions">
            <button type="button" className="button button-edit" onClick={cancelEditing}>Cancel</button>
            <button type="submit" className="button button-primary">Confirm</button>
          </div>
        </form>
      ) : (
        <>
          <span className="todo-description">
            {todo.description || <span className="sr-only">Empty task</span>}
          </span>
          <div className="item-actions">
            <input
              className="todo-checkbox"
              type="checkbox"
              checked={todo.completed}
              disabled={todo.completed}
              onChange={() => onComplete(todo.id)}
              aria-label={`${todo.completed ? 'Completed' : 'Complete'}: ${accessibleDescription}`}
              title={todo.completed ? 'Completed tasks cannot be reopened' : 'Mark as completed'}
            />
            {!todo.completed && (
              <button
                type="button"
                className="button button-edit"
                onClick={startEditing}
                aria-label={`Edit: ${accessibleDescription}`}
              >Edit</button>
            )}
            <button
              type="button"
              className="button button-delete"
              onClick={() => onDelete(todo)}
              aria-label={`Delete: ${accessibleDescription}`}
            >Delete</button>
          </div>
        </>
      )}
    </li>
  );
}
