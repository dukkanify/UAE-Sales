"use client";

import { Component, type ReactNode } from "react";
import { ErrorState } from "@/shared/components/ErrorState";
import { getErrorMessage } from "@/services/api";

type ErrorBoundaryProps = {
  children: ReactNode;
  fallbackTitle?: string;
};

type ErrorBoundaryState = {
  error: Error | null;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error("[ErrorBoundary]", error);
  }

  render() {
    if (this.state.error) {
      return (
        <ErrorState
          description={getErrorMessage(this.state.error)}
          onRetry={() => this.setState({ error: null })}
          title={this.props.fallbackTitle ?? "حدث خطأ غير متوقع"}
          variant="server"
        />
      );
    }

    return this.props.children;
  }
}
