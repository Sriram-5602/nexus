import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Home } from '@/modules/Home' 
//TO : Restart TS server if @ is hasnt been resovled yet -> cmnd+shift+p -> typescript: Restart TS server  

// Created outside the component so it's never recreated on re-renders
// This is the global cache + config for all API calls in the app
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // cached data stays fresh for 5 mins — no refetch within this window
      retry: 1,                  // if an API call fails, retry once before showing error
    },
  },
})

function App() {
  return (
    // Makes queryClient available to every component via context
    // Any component can now use useQuery/useMutation hooks
    <QueryClientProvider client={queryClient}>

      // Enables URL-based routing using the browser History API
      // Watches the URL and tells React what to render
      <BrowserRouter>

        // Looks at current URL and renders the first matching Route only
        <Routes>

          // When URL is '/', render the Home component
          <Route path="/" element={<Home />} />

          // Add more routes here as the app grows:
          {/* // <Route path="/users" element={<Users />} /> */}
          {/* // <Route path="/users/:id" element={<UserDetail />} /> */}

        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App // exported so main.tsx can import and render it