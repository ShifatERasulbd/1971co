import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.jsx';

const rootElement = document.getElementById('app');

if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        React.createElement(
            React.StrictMode,
            null,
            React.createElement(App)
        )
    );
}
