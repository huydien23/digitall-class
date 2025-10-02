import React from 'react';
import { useSelector } from 'react-redux';
import Classes from '../../pages/Classes/Classes';
import TeacherMyClasses from './TeacherMyClasses';

const RoleAwareClasses = () => {
  const { user } = useSelector((state) => state.auth);

  // Teachers see the TeacherMyClasses component (cards with actions)
  if (user?.role === 'teacher') {
    return <TeacherMyClasses />;
  }

  // Admin and students see the traditional Classes component
  return <Classes />;
};

export default RoleAwareClasses;
