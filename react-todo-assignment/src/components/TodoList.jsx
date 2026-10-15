import TodoItem from './TodoItem.jsx';
import { selectTodos } from '../todos.js';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'done', label: 'Done' },
  { value: 'todo', label: 'Todo' },
];

export default function TodoList({ todos, filter, onFilterChange, onEdit, onComplete, onDelete }) {
  const visibleTodos = selectTodos(todos, filter);

  return (
    <section className="list-section" aria-labelledby="list-heading">
      <h2 id="list-heading">TodoList</h2>
      {todos.length > 0 && (
        <div className="filters" role="group" aria-label="Filter todos">
          {FILTERS.map(({ value, label }) => (
            <button
              key={value}
              className="button button-primary filter-button"
              type="button"
              aria-pressed={filter === value}
              onClick={() => onFilterChange(value)}
            >{label}</button>
          ))}
        </div>
      )}
      {visibleTodos.length > 0 ? (
        <ul className="todo-list" aria-label="Todo items">
          {visibleTodos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} onEdit={onEdit} onComplete={onComplete} onDelete={onDelete} />
          ))}
        </ul>
      ) : (
        <p className="empty-message" role="status">No todo is available</p>
      )}
    </section>
  );
}
