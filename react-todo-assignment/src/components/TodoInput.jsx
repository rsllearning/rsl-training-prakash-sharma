import { useState } from 'react';

export default function TodoInput({ onAdd }) {
  const [description, setDescription] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    // The assignment explicitly permits empty text and has no character limit.
    onAdd(description);
    setDescription('');
  }

  return (
    <section aria-labelledby="input-heading">
      <h1 id="input-heading">TodoInput</h1>
      <form className="input-panel" onSubmit={handleSubmit}>
        <div className="input-group">
          <span className="input-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 3h10a2 2 0 0 1 2 2v15H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm1 3v2h8V6H7Zm0 4v2h6v-2H7Zm-1 7v1h10v-1H6Z" />
            </svg>
          </span>
          <label className="sr-only" htmlFor="new-todo">New Todo</label>
          <input
            id="new-todo"
            type="text"
            placeholder="New Todo"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            autoComplete="off"
          />
        </div>
        <button className="button button-primary add-button" type="submit">Add new task</button>
      </form>
    </section>
  );
}
