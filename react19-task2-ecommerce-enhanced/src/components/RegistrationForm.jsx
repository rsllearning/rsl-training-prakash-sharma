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

  async function registrationAction(prevState, formData) {
    const name = formData.get('name')?.toString().trim() || '';
    const email = formData.get('email')?.toString().trim() || '';
    const password = formData.get('password')?.toString() || '';

    const errors = {};

    if (!name) {
      errors.name = 'Full name is required.';
    } else if (name.length < 2) {
      errors.name = 'Name must be at least 2 characters long.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(email)) {
      errors.email = 'Please provide a valid email format.';
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

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const newUser = {
      id: Date.now(),
      name,
      email,
      registeredAt: new Date().toLocaleTimeString()
    };

    return {
      success: true,
      message: `Welcome, ${name}! Your account was registered successfully.`,
      errors: {},
      submittedUser: newUser,
      timestamp: Date.now()
    };
  }

  const [state, formAction] = useActionState(registrationAction, initialState);

  useEffect(() => {
    if (state.success && state.submittedUser) {
      loginUser(state.submittedUser);
    }
  }, [state.timestamp]);

  return (
    <div className="registration-wrapper">
      <title>Create Account – Enhanced Store</title>
      <meta name="description" content="Register an account using React 19 Form Actions." />

      <div className="card form-card">
        <div className="form-header">
          <h2>Register Account</h2>
          <p className="form-subtitle">
            Using React 19 <code>&lt;form action&gt;</code> &amp; <code>useActionState()</code>.
          </p>
        </div>

        {!state.success && state.message && (
          <div className="alert alert-error" role="alert">
            <span className="alert-icon">❌</span>
            <span>{state.message}</span>
          </div>
        )}

        {state.success && state.message && (
          <div className="alert alert-success" role="alert">
            <span className="alert-icon">✅</span>
            <div>
              <strong>{state.message}</strong>
              <p className="success-note">User profile synced with React 19 Context.</p>
            </div>
          </div>
        )}

        <form action={formAction} className="registration-form">
          <div className="form-group">
            <label htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              name="name"
              type="text"
              placeholder="e.g. Maya Lin"
              className={`form-input ${state.errors?.name ? 'input-error' : ''}`}
              defaultValue={state.submittedUser?.name || ''}
            />
            {state.errors?.name && <span className="error-text">{state.errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Email Address</label>
            <input
              id="reg-email"
              name="email"
              type="email"
              placeholder="maya@example.com"
              className={`form-input ${state.errors?.email ? 'input-error' : ''}`}
              defaultValue={state.submittedUser?.email || ''}
            />
            {state.errors?.email && <span className="error-text">{state.errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              name="password"
              type="password"
              placeholder="Minimum 6 characters"
              className={`form-input ${state.errors?.password ? 'input-error' : ''}`}
            />
            {state.errors?.password && <span className="error-text">{state.errors.password}</span>}
          </div>

          <div className="form-footer">
            <SubmitButton label="Create Account" pendingLabel="Submitting..." />
          </div>
        </form>
      </div>
    </div>
  );
}
