import React, { useState, useEffect } from 'react'
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  CircularProgress, 
  Alert,
  Button,
  Grid
} from '@mui/material'
import { useSelector } from 'react-redux'
import classService from '../../services/classService'
import StudentClassList from '../../components/Class/StudentClassList'
import ImprovedClassManagement from '../../components/Class/ImprovedClassManagementComplete'

const Classes = () => {
  const { user } = useSelector((state) => state.auth)
  const userRole = user?.role || 'student'
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadClasses = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Check if user has valid ID
      if (!user?.id) {
        setError('User not authenticated')
        return
      }

      const response = await classService.getClasses()
      setClasses(response.data.results || [])
    } catch (err) {
      if (err.response?.status === 404) {
        setClasses([])
        setError('No classes found')
      } else {
        setError(err.message || 'Failed to load classes')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userRole === 'admin') {
      loadClasses()
    } else {
      setLoading(false)
    }
  }, [userRole])

  const handleRetry = () => {
    loadClasses()
  }

  // For students, show StudentClassList component
  if (userRole === 'student') {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <StudentClassList user={user} />
      </Container>
    )
  }

  // For teachers, show TeachingManagement (new hierarchy + roster import)
  if (userRole === 'teacher') {
    const TeachingManagement = React.lazy(() => import('../../components/Teaching/TeachingManagement'))
    return (
      <React.Suspense fallback={<Container maxWidth="xl" sx={{ py: 4 }}><CircularProgress /></Container>}>
        <TeachingManagement />
      </React.Suspense>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Class Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage classes and student enrollment
        </Typography>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={handleRetry}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      ) : classes.length === 0 ? (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary">
                No classes available
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Classes will appear here once they are created
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {classes.map((classItem) => (
            <Grid item xs={12} sm={6} md={4} key={classItem.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {classItem.name || 'Unnamed Class'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {classItem.description || 'No description'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  )
}

export default Classes
