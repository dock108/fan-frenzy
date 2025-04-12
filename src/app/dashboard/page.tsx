'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const { user, signOut, loading } = useAuth()
  const router = useRouter()

  // This check might be redundant if middleware works perfectly,
  // but good for handling client-side loading state and edge cases.
  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    // This shouldn't happen if middleware is correct, but as a fallback
    // router.push('/login') // Careful with infinite loops if context is slow
    return <div>Redirecting to login...</div> // Or a loading state
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/') // Redirect to home after sign out
    router.refresh() // Ensure layout updates
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome to the Dashboard!</h1>
      <p className="mb-4">You are logged in as: {user.email}</p>
      <button
        onClick={handleSignOut}
        disabled={loading}
        className="px-4 py-2 font-semibold text-white bg-red-500 rounded hover:bg-red-600 disabled:opacity-50"
      >
        Sign Out
      </button>
    </div>
  )
} 