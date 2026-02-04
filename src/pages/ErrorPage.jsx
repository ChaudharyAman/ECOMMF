import React from 'react';
import { useRouteError, useNavigate } from 'react-router-dom';
import { AlertOctagon, Home, RefreshCw } from 'lucide-react';

const ErrorPage = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  console.error(error);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full text-center border border-slate-200">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
          <AlertOctagon className="w-10 h-10 text-red-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Oops! Something went wrong.</h1>
        <p className="text-slate-500 mb-6">
          We encountered an unexpected error. Our team has been notified.
        </p>

        <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-8 text-left overflow-auto max-h-40">
          <p className="text-sm font-mono text-red-700">
            {error.statusText || error.message || "Unknown Error"}
          </p>
          {error.stack && (
              <pre className="text-xs text-red-500 mt-2 whitespace-pre-wrap">
                  {error.stack}
              </pre>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-colors"
                >
                <RefreshCw className="w-5 h-5 mr-2" />
                Reload Page
            </button>
            <button
                onClick={() => navigate('/')}
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
                <Home className="w-5 h-5 mr-2" />
                Back to Home
            </button>
        </div>
      </div>
      <p className="mt-8 text-slate-400 text-sm">
        Error Code: {error.status || 500}
      </p>
    </div>
  );
};

export default ErrorPage;
