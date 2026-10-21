import { useFormStatus } from 'react-dom';

export default function SubmitButton({ label = "Create Account", pendingLabel = "Registering Account..." }) {
  // React 19's useFormStatus hook reads the parent <form action={...}> status
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`btn btn-primary submit-btn ${pending ? 'btn-loading' : ''}`}
    >
      {pending ? (
        <>
          <span className="spinner" aria-hidden="true"></span>
          <span>{pendingLabel}</span>
        </>
      ) : (
        <span>{label}</span>
      )}
    </button>
  );
}
