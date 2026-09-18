import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorState } from './ErrorState.tsx';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by RAYVEN ErrorBoundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <ErrorState
            title="Application Runtime Exception"
            message={this.state.error?.message || 'An unexpected rendering error occurred in the RAYVEN web shell.'}
            errorCode="REACT_BOUNDARY_TRIP"
            details={this.state.errorInfo?.componentStack}
            onRetry={this.handleReset}
          />
        </div>
      );
    }

    return this.props.children;
  }
}
