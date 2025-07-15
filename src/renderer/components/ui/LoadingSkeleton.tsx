import React from 'react';
import { Skeleton } from 'primereact/skeleton';
import { Card } from 'primereact/card';
import { motion } from 'framer-motion';

interface LoadingSkeletonProps {
  type?: 'card' | 'list' | 'dashboard' | 'table';
  count?: number;
}

export function LoadingSkeleton({ type = 'card', count = 1 }: LoadingSkeletonProps) {
  const renderCardSkeleton = () => (
    <Card className="hover-lift">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <Skeleton shape="circle" size="3rem" />
          <div className="flex-1">
            <Skeleton width="60%" height="1.5rem" className="mb-2" />
            <Skeleton width="40%" height="1rem" />
          </div>
        </div>
        <Skeleton height="8rem" className="mb-4" />
        <div className="flex gap-2">
          <Skeleton width="30%" height="2rem" />
          <Skeleton width="30%" height="2rem" />
        </div>
      </div>
    </Card>
  );

  const renderListSkeleton = () => (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg"
        >
          <Skeleton shape="circle" size="2.5rem" />
          <div className="flex-1">
            <Skeleton width="70%" height="1.25rem" className="mb-2" />
            <Skeleton width="40%" height="0.875rem" />
          </div>
          <Skeleton width="5rem" height="2rem" />
        </motion.div>
      ))}
    </div>
  );

  const renderDashboardSkeleton = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton width="15rem" height="2.5rem" className="mb-2" />
          <Skeleton width="20rem" height="1rem" />
        </div>
        <Skeleton width="8rem" height="2.5rem" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="hover-lift">
              <div className="p-6">
                <Skeleton width="50%" height="1rem" className="mb-3" />
                <Skeleton width="80%" height="2rem" className="mb-2" />
                <Skeleton width="60%" height="0.875rem" />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <Card>
        <div className="p-6">
          <Skeleton width="10rem" height="1.75rem" className="mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height="7rem" />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );

  const renderTableSkeleton = () => (
    <Card>
      <div className="p-6">
        {/* Table Header */}
        <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height="1rem" />
          ))}
        </div>
        
        {/* Table Rows */}
        {Array.from({ length: 5 }).map((_, rowIndex) => (
          <motion.div
            key={rowIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: rowIndex * 0.05 }}
            className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100 dark:border-gray-800"
          >
            {Array.from({ length: 4 }).map((_, colIndex) => (
              <Skeleton 
                key={colIndex} 
                height="1.25rem" 
                width={colIndex === 0 ? "100%" : "80%"} 
              />
            ))}
          </motion.div>
        ))}
      </div>
    </Card>
  );

  const renderSkeleton = () => {
    switch (type) {
      case 'list':
        return renderListSkeleton();
      case 'dashboard':
        return renderDashboardSkeleton();
      case 'table':
        return renderTableSkeleton();
      case 'card':
      default:
        return renderCardSkeleton();
    }
  };

  if (count > 1 && type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            {renderSkeleton()}
          </motion.div>
        ))}
      </div>
    );
  }

  return <>{renderSkeleton()}</>;
}