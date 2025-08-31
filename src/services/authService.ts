export const AuthService = {
  logout: () => {
    sessionStorage.clear()
    window.location.href = '/login'
  },
}
