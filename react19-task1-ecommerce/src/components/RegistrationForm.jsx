import { useActionState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import SubmitButton from './SubmitButton';

const initialState = {
  success: false,
  message: '',
  errors: {},
  submittedUser: null,
  timestamp: null
};

export default function RegistrationForm() {
  const { loginUser } = useUser();

  // React 19 Action Function: accepts (previousState, formData)
  // Simulates asynchronous API request without traditional onSubmit
  async function registrationAction(prevState, formData) {
    const name = formData.get('name')?.toString().trim() || '';
    const email = formData.get('email')?.toString().trim() || '';
    const password = formData.get('password')?.toString() || '';

    const errors = {};

    // Basic Validation Rules
    if (!name) {
      errors.name = 'Full name is required.';
    } else if (name.length < 2) {
      errors.name = 'Name must be at least 2 characters long.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(email)) {
      errors.email = 'Please provide a valid email format (e.g., alex@example.com).';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    if (Object.keys(errors).length > 0) {
      return {
        success: false,
        message: 'Please resolve the validation errors below.',
        errors,
        submittedUser: null,
        timestamp: Date.now()
      };
    }

    // Simulate async API call with setTimeout
    await new Promise((resolve) => setTimeout(resolve, 1400));

    // Simulated successful backend response
    const newUser = {
      id: Date.now(),
      name,
      email,
      registeredAt: new Date().toLocaleTimeString()
    };

    return {
      success: true,
      message: `Welcome aboard, ${name}! Your account was created successfully.`,
      errors: {},
      submittedUser: newUser,
      timestamp: Date.now()
    };
  }

  // React 19 useActionState hook manages the form action state
  const [state, formAction] = useActionState(registrationAction, initialState);

  // Sync registered user to React 19 Context upon successful action
  useEffect(() => {
    if (state.success && state.submittedUser) {
      loginUser(state.submittedUser);
    }
  }, [state.timestamp]);

  return (
    <div className="registration-wrapper">
      {/* React 19 Document Metadata for registration */}
      <title>Create Account – React 19 Store</title>
      <meta name="description" content="Register an account using React 19 Form Actions and useActionState." />

      <div className="card form-card">
        <div className="form-header">
          <h2>Create Your Account</h2>
          <p className="form-subtitle">
            Powered by React 19 <code>&lt;form action&gt;</code>, <code>useActionState()</code>, and <code>useFormStatus()</code>.
          </p>
        </div>

        {/* Global Error Banner */}
        {!state.success && state.message && (
          <div className="alert alert-error" role="alert">
            <span className="alert-icon">❌</span>
            <span>{state.message}</span>
          </div>
        )}

        {/* Global Success Banner */}
        {state.success && state.message && (
          <div className="alert alert-success" role="alert">
            <span className="alert-icon">✅</span>
            <div>
              <strong>{state.message}</strong>
              <p className="success-note">
                User context has been automatically updated with React 19 Context! Check the header and profile card.
              </p>
            </div>
          </div>
        )}

        {/* Native React 19 <form action={formAction}> without onSubmit */}
        <form action={formAction} className="registration-form">
          <div className="form-group">
            <label htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              name="name"
              type="text"
              placeholder="e.g. Alex Morgan"
              className={`form-input ${state.errors?.name ? 'input-error' : ''}`}
              defaultValue={state.submittedUser?.name || ''}
            />
            {state.errors?.name && (
              <span className="error-text">{state.errors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Email Address</label>
            <input
              id="reg-email"
              name="email"
              type="email"
              placeholder="alex@example.com"
              className={`form-input ${state.errors?.email ? 'input-error' : ''}`}
              defaultValue={state.submittedUser?.email || ''}
            />
            {state.errors?.email && (
              <span className="error-text">{state.errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              name="password"
              type="password"
              placeholder="At least 6 characters"
              className={`form-input ${state.errors?.password ? 'input-error' : ''}`}
            />
            {state.errors?.password && (
              <span className="error-text">{state.errors.password}</span>
            )}
          </div>

          <div className="form-footer">
            {/* SubmitButton internally consumes useFormStatus() */}
            <SubmitButton label="Register Now" pendingLabel="Submitting Form..." />
          </div>
        </form>

        <div className="form-meta-info">
          <span>ℹ️ Notice: No <code>onSubmit</code> or <code>e.preventDefault()</code> used. Form leverages native React 19 actions.</span>
        </div>
      </div>
    </div>
  );
}
