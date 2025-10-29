import './App.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ApiTest } from './components/ApiTest'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
       
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Sport Hub</h1>
            <p className="text-gray-600 mt-2">
              Backend API Integration Test
            </p>
          </div>

          <div className="grid gap-6">
            <ApiTest
              endpoint="/classification"
              title="Classification Endpoint"
              description="Test the classification endpoint of the API"
            />
            
          </div>
        </div>
      </div>
    </QueryClientProvider>
  )
}

export default App
