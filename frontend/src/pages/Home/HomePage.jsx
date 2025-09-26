import React, { useState, lazy, Suspense } from 'react'
import { Box, useTheme, useMediaQuery } from '@mui/material'
import Navigation from '../../components/Layout/Navigation'
import HeroSection from '../../components/HomePage/HeroSection'
import StatsSection from '../../components/HomePage/StatsSection'
import FeaturesSection from '../../components/HomePage/FeaturesSection'
import TestimonialsSection from '../../components/HomePage/TestimonialsSection'
import CTASection from '../../components/HomePage/CTASection'
import Footer from '../../components/Layout/Footer'

// Lazy load components for better performance
const LazyStatsSection = lazy(() => import('../../components/HomePage/StatsSection'))
const LazyFeaturesSection = lazy(() => import('../../components/HomePage/FeaturesSection'))
const LazyTestimonialsSection = lazy(() => import('../../components/HomePage/TestimonialsSection'))

const HomePage = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  return (
    <Box 
      component="main" 
      role="main"
      sx={{ minHeight: '100vh', bgcolor: 'background.default' }}
    >
      {/* Navigation */}
      <Navigation 
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
        isMobile={isMobile}
      />

      {/* Main Content */}
      <Box sx={{ pt: 10 }}>
        {/* Hero Section with QR Scanner */}
        <section aria-labelledby="hero-heading">
          <HeroSection />
        </section>

        {/* Stats Section */}
        <section aria-labelledby="stats-heading">
          <Suspense fallback={<div role="status" aria-label="Loading statistics">Loading...</div>}>
            <LazyStatsSection />
          </Suspense>
        </section>

        {/* Features Section */}
        <section id="features-section" aria-labelledby="features-heading">
          <Suspense fallback={<div role="status" aria-label="Loading features">Loading...</div>}>
            <LazyFeaturesSection />
          </Suspense>
        </section>

        {/* About Section - Testimonials */}
        <section id="about-section" aria-labelledby="testimonials-heading">
          <Suspense fallback={<div role="status" aria-label="Loading testimonials">Loading...</div>}>
            <LazyTestimonialsSection />
          </Suspense>
        </section>

        {/* CTA Section */}
        <section id="cta-section" aria-labelledby="cta-heading">
          <CTASection />
        </section>

        {/* Footer */}
        <Footer />
      </Box>
    </Box>
  )
}

export default HomePage
