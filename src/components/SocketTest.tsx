import React, { useState, useEffect, useRef } from 'react';

const API_KEY = import.meta.env.VITE_API_KEY;

export interface SocketTestProps {
  title: string;
  description?: string;
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface Message {
  id: string;
  timestamp: Date;
  data: unknown;
}

export const SocketTest: React.FC<SocketTestProps> = ({
  title,
  description,
}) => {
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>('disconnected');
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [messageCount, setMessageCount] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const isAuthenticated = useRef(false);
  const endpoint = 'ws://sporthub.paclema.com/stream';

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  const connect = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    setConnectionStatus('connecting');
    setError(null);

    if (!API_KEY) {
      setConnectionStatus('error');
      setError('VITE_API_KEY is not defined in environment variables');
      return;
    }

    try {
      // Convert HTTP/HTTPS URL to WS/WSS
      const wsUrl = endpoint.startsWith('http')
        ? endpoint.replace(/^http/, 'ws')
        : endpoint;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      isAuthenticated.current = false;

      ws.onopen = () => {
        // Send API key as the first message after connection
        // This is a common pattern for WebSocket authentication
        // since browsers don't support custom headers
        if (API_KEY && ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({
              'X-API-Key': API_KEY,
            })
          );
          isAuthenticated.current = true;
        }
        setConnectionStatus('connected');
        setError(null);
        reconnectAttempts.current = 0;
      };

      ws.onmessage = event => {
        try {
          const data = JSON.parse(event.data);
          const newMessage: Message = {
            id: `${Date.now()}-${Math.random()}`,
            timestamp: new Date(),
            data,
          };
          setMessages(prev => [...prev, newMessage]);
          setMessageCount(prev => prev + 1);
        } catch {
          // If not JSON, store as raw text
          const newMessage: Message = {
            id: `${Date.now()}-${Math.random()}`,
            timestamp: new Date(),
            data: event.data,
          };
          setMessages(prev => [...prev, newMessage]);
          setMessageCount(prev => prev + 1);
        }
      };

      ws.onerror = event => {
        setConnectionStatus('error');
        setError('WebSocket error occurred');
        console.error('WebSocket error:', event);
      };

      ws.onclose = event => {
        setConnectionStatus('disconnected');
        wsRef.current = null;

        // Attempt to reconnect if it wasn't a manual close
        if (
          event.code !== 1000 &&
          reconnectAttempts.current < maxReconnectAttempts
        ) {
          reconnectAttempts.current += 1;
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttempts.current),
            30000
          );
          reconnectTimeoutRef.current = window.setTimeout(() => {
            connect();
          }, delay);
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          setError('Max reconnection attempts reached');
        }
      };
    } catch (err) {
      setConnectionStatus('error');
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to create WebSocket connection'
      );
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    reconnectAttempts.current = maxReconnectAttempts; // Prevent auto-reconnect
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }
    setConnectionStatus('disconnected');
  };

  const clearMessages = () => {
    setMessages([]);
    setMessageCount(0);
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'connecting':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return (
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        );
      case 'connecting':
        return (
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
        );
      case 'error':
        return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full"></div>;
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
        <p className="text-xs text-gray-500 mt-2 font-mono bg-gray-100 px-2 py-1 rounded">
          WS {endpoint}
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm font-medium ${getStatusColor()}`}
          >
            {getStatusIcon()}
            <span className="capitalize">{connectionStatus}</span>
          </div>
          {connectionStatus === 'connected' && (
            <span className="text-sm text-gray-600">
              Messages received: {messageCount}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          {connectionStatus === 'disconnected' ||
          connectionStatus === 'error' ? (
            <button
              onClick={connect}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              Connect
            </button>
          ) : (
            <button
              onClick={disconnect}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
            >
              Disconnect
            </button>
          )}

          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm font-medium"
            >
              Clear Messages
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <h4 className="text-sm font-medium text-red-800 mb-1">Error</h4>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {connectionStatus === 'connected' && (
          <div className="mt-4">
            <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
              <h4 className="text-sm font-medium text-gray-800 mb-3">
                Live Messages ({messages.length})
              </h4>
              <div className="bg-white border border-gray-200 rounded-md max-h-96 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No messages received yet. Waiting for data...
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {messages.map(message => (
                      <div
                        key={message.id}
                        className="p-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-xs text-gray-500 font-mono">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                          <span className="text-xs text-gray-400">
                            #{messages.indexOf(message) + 1}
                          </span>
                        </div>
                        <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                          {JSON.stringify(message.data, null, 2)}
                        </pre>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {connectionStatus === 'connecting' && (
          <div className="flex items-center gap-2 text-blue-600 mt-4">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm">Connecting to WebSocket...</span>
          </div>
        )}
      </div>
    </div>
  );
};
