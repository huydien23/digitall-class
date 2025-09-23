// Test API connection
const testAPI = async () => {
  try {
    console.log('Testing API connection...')
    
    // Test health endpoint
    const healthResponse = await fetch('http://localhost:8000/api/auth/health/')
    const healthData = await healthResponse.json()
    console.log('Health check:', healthData)
    
    // Test login
    const loginResponse = await fetch('http://localhost:8000/api/auth/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'teacher@test.com',
        password: 'Teacher123456'
      })
    })
    
    const loginData = await loginResponse.json()
    console.log('Login test:', loginData)
    
    if (loginData.tokens) {
      console.log('✅ Login successful!')
      console.log('Access token:', loginData.tokens.access.substring(0, 20) + '...')
    } else {
      console.log('❌ Login failed:', loginData)
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error)
  }
}

// Run test
testAPI()
