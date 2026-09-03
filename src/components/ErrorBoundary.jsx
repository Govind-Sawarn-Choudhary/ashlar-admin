import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="login-wrap">
          <div className="card login-card">
            <h1>Something went wrong</h1>
            <p className="muted">{this.state.error.message || 'Unexpected error in admin panel'}</p>
            <button
              type="button"
              className="btn btn-primary btn-full"
              style={{ marginTop: 16 }}
              onClick={() => window.location.reload()}
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
