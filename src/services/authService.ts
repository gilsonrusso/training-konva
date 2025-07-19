export const AuthService = {
  logout: () => {
    sessionStorage.clear()
    window.location.href = '/login' // ou usar navigate, etc.
  },
}
