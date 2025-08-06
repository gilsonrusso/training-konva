import { useAuth } from '@/contexts/AuthContext'
import { Box, Button, Paper, TextField, Typography, useTheme } from '@mui/material'
import React, { useState } from 'react'
import { useNavigate } from 'react-router'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const theme = useTheme()

  const { login } = useAuth() // Use o hook para obter a função de login
  const navigate = useNavigate() // Hook para navegação programática

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleLogin = (_event: React.FormEvent) => {
    // Lógica de autenticação simplificada:
    // Em um cenário real, você faria uma chamada de API aqui.
    // Exemplo:
    // const response = await fetch('/api/login', { ... });
    // const data = await response.json();
    // if (data.token) {
    //   login(email, data.token);
    //   navigate('/', { replace: true });
    // } else {
    //   alert('Login falhou!');
    // }

    // Simulação do login bem-sucedido
    if (email && password) {
      // Token e dados falsos
      const fakeToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
      const fakeEmail = email

      // Chama a função 'login' do contexto, que salva o token e o email no localStorage
      // e atualiza o estado global.
      login(fakeEmail, fakeToken)

      // Navega para a página principal após o login, substituindo a entrada no histórico
      navigate('/')
    } else {
      alert('Por favor, preencha o e-mail e a senha.')
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Paper elevation={3} sx={{ padding: 4, width: '100%', maxWidth: 400 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Login
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Insira suas credenciais para acessar
        </Typography>
        <form onSubmit={handleLogin}>
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Senha"
            variant="outlined"
            fullWidth
            margin="normal"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3, mb: 2 }}>
            Entrar
          </Button>
        </form>
      </Paper>
    </Box>
  )
}

export default Login
