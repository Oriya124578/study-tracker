import React from 'react';
import { AlertTriangle } from 'lucide-react';

// Catches render-time errors so a single broken view doesn't crash the whole app.
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('Uncaught error in UI:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-destructive" />
          <h2 className="text-xl font-bold text-foreground">משהו השתבש / Something went wrong</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            {this.state.error?.message || 'Unexpected error.'}
          </p>
          <button
            onClick={this.handleReset}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            נסה שוב / Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
