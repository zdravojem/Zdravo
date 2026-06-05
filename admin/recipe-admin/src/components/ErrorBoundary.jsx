import { Component } from 'react'

class ErrorBoundary extends Component {
  state = {
    error: null,
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <main className="error-boundary">
          <p className="eyebrow">Runtime error</p>
          <h1>The admin app could not render.</h1>
          <p className="notice error">{this.state.error.message}</p>
          <button className="button primary" type="button" onClick={() => window.location.reload()}>
            Reload
          </button>
        </main>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
