import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // We could send this to a logging endpoint if desired
    console.error('React render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{padding: '2rem'}}>
          <h2>Something went wrong.</h2>
          <p>Please refresh the page. If the problem persists, contact support and include the error below.</p>
          <pre style={{whiteSpace:'pre-wrap', background:'#f8d7da', padding: '1rem'}}>{String(this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
