import React, { useState } from 'react';
import { useApiGet } from '../hooks/useApi';

// Define the expected response type based on the backend API
interface TestResponse {
  message?: string;
  data?: any;
  status?: string;
}

interface ApiTestProps {
  endpoint: string;
  title: string;
  description?: string;
}

export const ApiTest: React.FC<ApiTestProps> = ({ 
  endpoint, 
  title, 
  description 
}) => {
  const [isTested, setIsTested] = useState(false);
  
  const { 
    data, 
    error, 
    isLoading, 
    refetch 
  } = useApiGet<TestResponse>(
    endpoint,
    ['api-test', endpoint],
    { enabled: isTested }
  );

  const handleTest = () => {
    setIsTested(true);
    refetch();
  };

  const handleReset = () => {
    setIsTested(false);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
        <p className="text-xs text-gray-500 mt-2 font-mono bg-gray-100 px-2 py-1 rounded">
          GET {endpoint}
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <button
            onClick={handleTest}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
          >
            {isLoading ? 'Testing...' : 'Test Endpoint'}
          </button>
          
          {isTested && (
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm font-medium"
            >
              Reset
            </button>
          )}
        </div>

        {isTested && (
          <div className="mt-4">
            {isLoading && (
              <div className="flex items-center gap-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm">Loading...</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <h4 className="text-sm font-medium text-red-800 mb-2">Error</h4>
                <p className="text-sm text-red-700">
                  {error.message || 'An error occurred while testing the endpoint'}
                </p>
                {error.status && (
                  <p className="text-xs text-red-600 mt-1">
                    Status: {error.status}
                  </p>
                )}
              </div>
            )}

            {data && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <h4 className="text-sm font-medium text-green-800 mb-2">Success</h4>
                <div className="text-sm text-green-700">
                  <p className="mb-2">Status: {data.status}</p>
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs text-green-600 hover:text-green-800">
                      View Response Data
                    </summary>
                    <pre className="mt-2 text-xs bg-green-100 p-2 rounded overflow-auto max-h-40">
                      {JSON.stringify(data.data, null, 2)}
                    </pre>
                  </details>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
