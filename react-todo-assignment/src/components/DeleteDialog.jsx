import { useEffect, useRef } from 'react';

export default function DeleteDialog({ todo, onCancel, onConfirm }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="delete-dialog"
      aria-labelledby="delete-heading"
      aria-describedby="delete-description"
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
    >
      <h2 id="delete-heading">Delete this todo?</h2>
      <p id="delete-description">This task will be removed from your list.</p>
      <p className="dialog-task">{todo.description || '(Empty task)'}</p>
      <div className="dialog-actions">
        <button type="button" className="button button-edit" onClick={onCancel} autoFocus>Cancel</button>
        <button type="button" className="button button-delete" onClick={() => onConfirm(todo.id)}>Confirm delete</button>
      </div>
    </dialog>
  );
}
