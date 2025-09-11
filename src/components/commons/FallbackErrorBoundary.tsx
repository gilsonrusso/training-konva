import { Box, Button, Card, CardContent, Typography } from '@mui/material'
import { useNavigate, useRouteError } from 'react-router-dom'

function FallbackErrorBoundary() {
  const error = useRouteError() as Error
  const navigate = useNavigate()

  function showErrorStack(error: Error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Erro capturado pelo ErrorBoundary:', error)
    }

    return (
      <Box
        sx={{
          overflowY: 'auto',
          maxHeight: '20vh',
          height: '100%',
          width: '100%',
        }}
      >
        <Typography
          variant="body2"
          component="pre"
          sx={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            backgroundColor: 'rgba(0,0,0,0.05)',
            p: 1,
            borderRadius: 1,
            textAlign: 'left',
          }}
        >
          {/* É uma boa prática mostrar o stack do erro em ambiente de desenvolvimento */}
          {error.stack || error.message}
        </Typography>
      </Box>
    )
  }

  const showStackError =
    process.env.NODE_ENV === 'development' && error.stack ? showErrorStack(error) : null

  const handleGoHome = () => {
    navigate('/')
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh" role="alert">
      <Card
        sx={{
          minWidth: 275,
          maxWidth: 600,
          p: 2,
          textAlign: 'center',
        }}
      >
        <CardContent>
          <Typography variant="h5" component="div" gutterBottom>
            Ocorreu um erro inesperado
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            A aplicação encontrou um problema. Por favor, volte para o início e tente novamente.
          </Typography>
          {showStackError}
        </CardContent>
        <Button variant="contained" onClick={handleGoHome}>
          Voltar para o Início
        </Button>
      </Card>
    </Box>
  )
}

export default FallbackErrorBoundary
