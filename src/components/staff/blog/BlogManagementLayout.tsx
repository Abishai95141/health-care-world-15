
import React from 'react';
import { Outlet } from 'react-router-dom';

const BlogManagementLayout = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-black">Blog Management</h1>
          <p className="text-gray-600">Manage your blog posts, categories, and content</p>
        </div>
      </div>
      <Outlet />
    </div>
  );
};

export default BlogManagementLayout;
