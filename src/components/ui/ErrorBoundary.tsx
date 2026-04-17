import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center z-[9999] relative">
          <div className="bg-slate-900/80 border border-red-500/30 p-8 rounded-3xl max-w-md w-full shadow-2xl shadow-red-900/20 flex flex-col items-center relative overflow-hidden">
            <div className="absolute inset-0 bg-red-500/5 backdrop-blur-md pointer-events-none" />
            <div className="p-4 bg-red-500/20 text-red-500 rounded-full mb-6 relative z-10">
              <AlertTriangle className="w-12 h-12" />
            </div>
            <h1 className="text-2xl font-black italic text-white uppercase tracking-wider mb-2 relative z-10">
              Algo salió mal
            </h1>
            <p className="text-slate-400 mb-8 text-sm relative z-10 break-words max-w-full">
              {this.state.error?.message || "Ha ocurrido un error inesperado en la aplicación."}
            </p>
            <div className="flex flex-col gap-3 w-full relative z-10">
              <button
                onClick={this.handleReload}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-900/20"
              >
                <RefreshCw size={18} />
                Recargar página
              </button>
              <button
                onClick={this.handleReset}
                className="w-full py-3 bg-transparent hover:bg-white/5 text-slate-300 font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2 border border-white/10"
              >
                <Home size={18} />
                Volver al inicio
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
