import React from 'react'
import { useSelector } from 'react-redux'
import ClassDetailPage from './ClassDetailPage'
import StudentClassDetailPage from './StudentClassDetailPage'

const RoleAwareClassDetail = () => {
  const { user } = useSelector((state) => state.auth)
  const role = user?.role || 'student'
  if (role === 'student') return <StudentClassDetailPage />
  return <ClassDetailPage />
}

export default RoleAwareClassDetail
