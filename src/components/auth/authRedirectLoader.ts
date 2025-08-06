// src/loaders/authRedirectLoader.ts
import { redirect } from 'react-router-dom'

export const authRedirectLoader = () => {
  const token = localStorage.getItem('authToken')

  if (token) {
    // Se o token existir, redireciona o usuário para a página principal
    return redirect('/')
  }

  // Se não houver token, a navegação prossegue normalmente para o login
  return null
}
