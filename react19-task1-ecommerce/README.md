# Mini E-Commerce Application — Task 1 (React 19)

A modern E-Commerce product catalog and user registration flow built from the ground up demonstrating the new capabilities introduced in **React 19**.

---

## 🚀 Key React 19 Features Implemented

### 1. How `use()` is Implemented
* In `src/components/ProductList.jsx`, React 19's `use()` hook directly consumes the product-data promise:
  ```jsx
  import { use } from 'react';

  export default function ProductList({ productsPromise }) {
    const products = use(productsPromise);
    // ...
  }
  ```
* Unlike traditional `useEffect` + `useState` fetching patterns, `use(promise)` unwraps the Promise directly during rendering and suspends the component until resolution. If rejected, it throws directly to the nearest `ErrorBoundary`.

### 2. How `<Suspense>` is Used
* In `src/App.jsx`, `<ProductList>` is wrapped with React's `<Suspense>` boundary:
  ```jsx
  <ErrorBoundary onReset={() => handleRefresh(false)}>
    <Suspense fallback={<ProductSkeleton />}>
      <ProductList productsPromise={productsPromise} />
    </Suspense>
  </ErrorBoundary>
  ```
* When `use()` suspends, React seamlessly displays `<ProductSkeleton />` without needing manual boolean loading flags (`isLoading`).

### 3. How `useActionState()` is Used
* In `src/components/RegistrationForm.jsx`, user registration uses React 19's `useActionState()` hook:
  ```jsx
  const [state, formAction] = useActionState(registrationAction, initialState);
  ```
* The action function receives `(previousState, formData)` and returns the updated state asynchronously.
* The form uses `<form action={formAction}>` natively without any `onSubmit` handler or `event.preventDefault()`.

### 4. How `useFormStatus()` is Used
* In `src/components/SubmitButton.jsx`, the button accesses the parent form's submission state via `useFormStatus()`:
  ```jsx
  import { useFormStatus } from 'react-dom';

  export default function SubmitButton() {
    const { pending } = useFormStatus();
    return (
      <button type="submit" disabled={pending}>
        {pending ? "Submitting..." : "Register Now"}
      </button>
    );
  }
  ```
* This decouples the loading indicator inside the button from the form state, automatically disabling the button and displaying a spinner while the action executes.

### 5. How Context is Implemented Using React 19 Syntax
* In React 19, `<Context.Provider value={...}>` is obsolete. You can now render `<Context value={...}>` directly:
  ```jsx
  export const UserContext = createContext(null);

  export function UserContextProvider({ children }) {
    return (
      <UserContext value={contextValue}>
        {children}
      </UserContext>
    );
  }
  ```
* When a user registers, their information is stored in `UserContext` and immediately reflected in both the `Header` and `UserProfile` sidebar components.

### 6. Which Asset Loading APIs Were Selected and Why
React 19 introduced asset loading APIs in `react-dom` to optimize web vitals (especially Largest Contentful Paint / LCP):
1. **`preconnect('https://images.unsplash.com', { crossOrigin: 'anonymous' })`**:
   * *Why selected:* Initiates early TCP connection and TLS handshake with the external image CDN before the browser parses image tags.
2. **`preload('https://images.unsplash.com/...', { as: 'image' })`**:
   * *Why selected:* Prioritizes downloading the hero product image in parallel with component mounting to eliminate render-blocking image delays.
3. **`prefetchDNS('https://images.unsplash.com')`**:
   * *Why selected:* Resolves DNS IP resolution beforehand at near-zero bandwidth cost.

### 7. How Document Metadata is Implemented
* React 19 natively supports `<title>` and `<meta>` tags inside any component without third-party libraries like `react-helmet`:
  ```jsx
  // Inside ProductList.jsx
  <title>Mini E-Commerce Store – Products</title>
  <meta name="description" content="Discover cutting-edge gadgets and accessories..." />

  // Inside RegistrationForm.jsx
  <title>Create Account – React 19 Store</title>
  <meta name="description" content="Register an account using React 19 Form Actions..." />
  ```
* React automatically hoists these tags into the document's `<head>` at runtime.

---

## 🛠️ How to Run Locally

```bash
cd D:\react19-task1-ecommerce
npm install
npm run dev
```

Open your browser at `http://localhost:5173`.
