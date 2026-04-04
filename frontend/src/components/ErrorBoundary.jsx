import { Component } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-content">
            <div className="error-icon">
              <AlertTriangle size={48} />
            </div>
            <h1>Something went wrong</h1>
            <p>We apologize for the inconvenience. Please try again.</p>
            
            {this.props.showReset && (
              <div className="error-actions">
                <button onClick={this.handleReset} className="btn-reset">
                  <RefreshCw size={18} />
                  Try Again
                </button>
                <Link to="/app/home" className="btn-home">
                  <Home size={18} />
                  Go Home
                </Link>
              </div>
            )}
            
            {import.meta.env.DEV && this.state.error && (
              <details className="error-details">
                <summary>Error Details (Development)</summary>
                <pre>{this.state.error.toString()}</pre>
                {this.state.errorInfo && (
                  <pre>{this.state.errorInfo.componentStack}</pre>
                )}
              </details>
            )}
          </div>
          
          <style>{`
            .error-boundary {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              padding: 2rem;
              background: linear-gradient(135deg, #0f0f14 0%, #1a1a2e 100%);
            }
            
            .error-content {
              text-align: center;
              max-width: 500px;
            }
            
            .error-icon {
              width: 80px;
              height: 80px;
              margin: 0 auto 1.5rem;
              background: rgba(239, 68, 68, 0.15);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #ef4444;
            }
            
            .error-content h1 {
              font-size: 1.75rem;
              font-weight: 700;
              color: #f5f5f5;
              margin: 0 0 0.75rem;
            }
            
            .error-content p {
              color: #888;
              margin: 0 0 2rem;
              line-height: 1.6;
            }
            
            .error-actions {
              display: flex;
              gap: 1rem;
              justify-content: center;
              flex-wrap: wrap;
            }
            
            .btn-reset, .btn-home {
              display: inline-flex;
              align-items: center;
              gap: 0.5rem;
              padding: 0.75rem 1.5rem;
              border-radius: 12px;
              font-weight: 600;
              font-size: 0.95rem;
              text-decoration: none;
              cursor: pointer;
              transition: all 0.2s;
              border: none;
            }
            
            .btn-reset {
              background: linear-gradient(135deg, #6366f1, #4f46e5);
              color: white;
            }
            
            .btn-reset:hover {
              background: linear-gradient(135deg, #818cf8, #6366f1);
              transform: translateY(-2px);
            }
            
            .btn-home {
              background: rgba(255, 255, 255, 0.1);
              color: #f5f5f5;
              border: 1px solid rgba(255, 255, 255, 0.15);
            }
            
            .btn-home:hover {
              background: rgba(255, 255, 255, 0.15);
              transform: translateY(-2px);
            }
            
            .error-details {
              margin-top: 2rem;
              text-align: left;
              background: rgba(0, 0, 0, 0.3);
              border-radius: 12px;
              padding: 1rem;
              color: #888;
              font-size: 0.8rem;
            }
            
            .error-details summary {
              cursor: pointer;
              font-weight: 600;
              margin-bottom: 0.5rem;
            }
            
            .error-details pre {
              overflow-x: auto;
              padding: 0.5rem;
              background: rgba(0, 0, 0, 0.5);
              border-radius: 8px;
              font-size: 0.75rem;
            }
          `}</style>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
