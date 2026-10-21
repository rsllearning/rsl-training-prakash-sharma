import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-card">
          <div className="error-icon">⚠️</div>
          <h3>Something went wrong</h3>
          <p className="error-message">{this.state.error?.message || "An unexpected error occurred."}</p>
          <button className="btn btn-primary" onClick={this.handleReset}>
            Retry Request
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
