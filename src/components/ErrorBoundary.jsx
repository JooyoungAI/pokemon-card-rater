import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-900/50 text-white min-h-screen flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold text-red-400 mb-4">Something went wrong.</h1>
          <details className="w-full max-w-4xl bg-black/50 p-4 rounded text-left overflow-auto">
             <summary className="font-bold cursor-pointer">Error Details</summary>
             <pre className="mt-4 text-red-300 text-sm whitespace-pre-wrap">{this.state.error?.toString()}</pre>
             <pre className="mt-4 text-gray-400 text-xs whitespace-pre-wrap">{this.state.errorInfo?.componentStack}</pre>
          </details>
        </div>
      );
    }

    return this.props.children; 
  }
}
