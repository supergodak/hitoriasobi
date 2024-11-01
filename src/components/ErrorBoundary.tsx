import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

const DEBUG = true;

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (DEBUG) {
      console.group('🔥 React Error Boundary Caught Error');
      console.error('Error:', error);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl w-full m-4">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              予期せぬエラーが発生しました
            </h1>
            <p className="text-gray-600 mb-4">
              申し訳ありませんが、問題が発生しました。
              ページを再読み込みするか、しばらくしてからアクセスしてください。
            </p>
            
            {DEBUG && this.state.error && (
              <div className="mb-4">
                <details className="bg-gray-50 p-4 rounded-lg">
                  <summary className="text-sm font-medium text-gray-700 cursor-pointer">
                    エラー詳細（開発者向け）
                  </summary>
                  <div className="mt-2">
                    <p className="text-red-500 font-mono text-sm">
                      {this.state.error.toString()}
                    </p>
                    {this.state.errorInfo && (
                      <pre className="mt-2 text-xs text-gray-600 overflow-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              </div>
            )}

            <button
              onClick={this.handleReload}
              className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
            >
              ページを再読み込み
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;