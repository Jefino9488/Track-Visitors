// src/components/ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
    state = { hasError: false };
    static _error;

    static getDerivedStateFromError(error) {
        ErrorBoundary._error = error;
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <div>Something went wrong. Please try again later.</div>;
        }
        return this.props.children;
    }
}

export default ErrorBoundary;