import { redirect } from 'react-router-dom'

export const authLoader = () => {
  const token = localStorage.getItem('authToken')

  if (!token) {
    // Se o token não existir, redireciona o usuário para a página de login
    // 'replace: true' garante que a URL atual não seja adicionada ao histórico de navegação
    return redirect('login')
  }

  // Se o token existir, a função retorna null ou os dados necessários, permitindo a navegação
  return null
}
