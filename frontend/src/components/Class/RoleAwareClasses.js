import React from 'react';
import { useSelector } from 'react-redux';
import Classes from '../../pages/Classes/Classes';
import ClassesDetail from '../teacher/ClassesDetail';

function RoleAwareClasses() {
  const { user } = useSelector((state) => state.auth);

  // Teachers see the new ClassesDetail component
  if (user?.role === 'teacher') {
    return <ClassesDetail />;
  }

  // Admin and students see the traditional Classes component
  return <Classes />;
}

export default RoleAwareClasses;