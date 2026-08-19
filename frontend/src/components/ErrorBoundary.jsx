import React from 'react';

export default class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ResearchMap render failure', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="fatal-error-screen" role="alert">
        <div className="fatal-error-card">
          <span className="fatal-error-code">SYSTEM RECOVERY / 500</span>
          <h1>Workspace interrupted</h1>
          <p>The map interface encountered an unexpected rendering error. Reload the workspace to restore the latest session.</p>
          <button type="button" onClick={this.handleReload}>Reload workspace</button>
          {this.state.error?.message && <code>{this.state.error.message}</code>}
        </div>
      </main>
    );
  }
}
