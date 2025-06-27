
import React from 'react';
import StaffLayout from '@/components/staff/StaffLayout';
import { BlogManagement as BlogManagementComponent } from '@/components/staff/BlogManagement';

const BlogManagement = () => {
  return (
    <StaffLayout>
      <BlogManagementComponent />
    </StaffLayout>
  );
};

export default BlogManagement;
