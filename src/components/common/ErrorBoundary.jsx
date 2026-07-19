import { Component } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

/**
 * Catches render-time errors anywhere below it so a single broken
 * component shows a recoverable screen instead of a blank page.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Render error caught by ErrorBoundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-canvas p-4">
          <div className="text-center max-w-sm">
            <div className="w-14 h-14 bg-danger-tint rounded-lg flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={26} className="text-danger" />
            </div>
            <h1 className="text-lg font-semibold text-ink mb-1">
              Something went wrong
            </h1>
            <p className="text-sm text-ink-subtle mb-6">
              An unexpected error occurred while rendering this page. Reloading
              usually fixes it.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white rounded font-medium text-sm hover:bg-brand-hover transition-colors"
            >
              <RotateCcw size={15} /> Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
