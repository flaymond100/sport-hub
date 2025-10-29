import React, { useState } from 'react';
import { useApiGet } from '../hooks/useApi';
import type { ClassificationTableResponse } from '../types';

// Define the expected response type based on the backend API
interface TestResponse {
  message?: string;
  data: ClassificationTableResponse['data'];
  status?: number | string;
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

  const response = data?.data;

  console.log(response);

  // Helper function to format milliseconds to hh:mm:ss
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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

            {response && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <h4 className="text-sm font-medium text-green-800 mb-2">Success</h4>
                <div className="text-sm text-green-700">
                  <p className="mb-2">
                    Status: {response.status !== undefined ? response.status : 'N/A'}
                  </p>

                  {/* Classification Table */}
                  {response && 'standings' in response && Array.isArray(response.standings) && (
                    <div className="mt-4">
                      <h5 className="text-sm font-medium text-green-800 mb-3">Classification Table</h5>
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                Position
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                Tag ID
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                Laps
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                Total Time
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                Gap
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                Laps Behind
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                Finished
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                Last Pass Time
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {response.standings.map((standing, index) => (
                              <tr key={standing.tag_id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-4 py-2 text-sm text-gray-900 font-medium">
                                  {index + 1}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-900 font-mono">
                                  {standing.tag_id}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-900">
                                  {standing.laps}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-900">
                                  {standing.total_time_ms ? formatTime(standing.total_time_ms) : 'N/A'}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-900">
                                  {standing.gap_ms ? formatTime(standing.gap_ms) : 'N/A'}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-900">
                                  {standing.laps_behind}
                                </td>
                                <td className="px-4 py-2 text-sm">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    standing.finished 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {standing.finished ? 'Yes' : 'No'}
                                  </span>
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-900">
                                  {standing.last_pass_time ? new Date(standing.last_pass_time).toLocaleTimeString() : 'N/A'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-2 text-xs text-gray-600">
                        Total entries: {"count" in response && typeof response.count === "number"
                          ? response.count
                          : Array.isArray(response.standings)
                            ? response.standings.length
                            : 0}
                      </div>
                    </div>
                  )}
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs text-green-600 hover:text-green-800">
                      View Raw Response Data
                    </summary>
                    <pre className="mt-2 text-xs bg-green-100 p-2 rounded overflow-auto max-h-40">
                      {JSON.stringify(response, null, 2)}
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
