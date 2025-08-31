import { redirect } from 'react-router-dom'

interface CheckAuthOptions {
  requireAuth: boolean
  redirectPath: string
}

export const checkAuth = ({ requireAuth, redirectPath }: CheckAuthOptions) => {
  const token = localStorage.getItem('authToken')

  if (requireAuth && !token) {
    // Requires authentication, but no token is found, so redirect.
    return redirect(redirectPath)
  }

  if (!requireAuth && token) {
    // Does not require authentication (e.g., login page), but a token is found, so redirect.
    return redirect(redirectPath)
  }

  // All checks passed, no redirect needed.
  return null
}
