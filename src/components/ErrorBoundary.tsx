import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.hash = '#/';
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border border-slate-200 text-center space-y-5 animate-fade-in-up">
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-xs">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-slate-900">
                Application Recovered
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                An unexpected interface issue occurred. Your account and emergency dispatches remain safe.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs font-mono text-slate-600 truncate max-h-24 overflow-auto">
              {this.state.error?.message || 'Unknown render error'}
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="px-5 py-2.5 rounded-xl bg-[#2E7D6B] hover:bg-[#256859] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Application</span>
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.hash = '#/';
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Back to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
