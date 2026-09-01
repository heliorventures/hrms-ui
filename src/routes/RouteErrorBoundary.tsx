import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

import RouteStatePage from './RouteStatePage';

interface RouteErrorBoundaryProps {
  children: ReactNode;
  onRetry?: () => void;
  returnTo?: string;
  returnLabel?: string;
}

interface RouteErrorBoundaryInnerProps extends RouteErrorBoundaryProps {
  pathname: string;
}

interface RouteErrorBoundaryState {
  error: Error | null;
}

class RouteErrorBoundaryInner extends Component<
  RouteErrorBoundaryInnerProps,
  RouteErrorBoundaryState
> {
  state: RouteErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): RouteErrorBoundaryState {
    return { error };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // The UI deliberately avoids exposing route or import diagnostics.
  }

  componentDidUpdate(previousProps: RouteErrorBoundaryInnerProps) {
    if (previousProps.pathname !== this.props.pathname && this.state.error) {
      this.setState({ error: null });
    }
  }

  private handleRetry = () => {
    this.props.onRetry?.();
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <RouteStatePage
          state="unexpected"
          onRetry={this.handleRetry}
          returnTo={this.props.returnTo}
          returnLabel={this.props.returnLabel}
        />
      );
    }
    return this.props.children;
  }
}

const RouteErrorBoundary = (props: RouteErrorBoundaryProps) => {
  const location = useLocation();
  return <RouteErrorBoundaryInner {...props} pathname={location.pathname} />;
};

export default RouteErrorBoundary;
