import { Component } from 'react';
import type { ReactNode } from 'react';
import { Button, Result } from 'antd';

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/login';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f1119' }}>
          <Result
            status="error"
            title="页面出错了"
            subTitle={this.state.error?.message}
            extra={<Button type="primary" onClick={this.handleReset}>返回首页</Button>}
          />
        </div>
      );
    }
    return this.props.children;
  }
}
