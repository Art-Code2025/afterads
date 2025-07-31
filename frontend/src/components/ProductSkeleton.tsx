import React from 'react';

interface ProductSkeletonProps {
  count?: number;
  variant?: 'card' | 'detail' | 'list';
}

const ProductSkeleton: React.FC<ProductSkeletonProps> = ({ 
  count = 1, 
  variant = 'card' 
}) => {
  const skeletons = Array.from({ length: count }, (_, index) => (
    <div key={index} className="animate-pulse">
      {variant === 'card' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Image skeleton */}
          <div className="bg-gray-300 h-48 w-full"></div>
          
          {/* Content skeleton */}
          <div className="p-4">
            {/* Title */}
            <div className="bg-gray-300 h-4 rounded mb-2"></div>
            <div className="bg-gray-300 h-4 rounded w-3/4 mb-3"></div>
            
            {/* Price */}
            <div className="bg-gray-300 h-6 rounded w-1/2 mb-3"></div>
            
            {/* Rating */}
            <div className="flex space-x-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-gray-300 h-4 w-4 rounded"></div>
              ))}
            </div>
            
            {/* Button */}
            <div className="bg-gray-300 h-10 rounded"></div>
          </div>
        </div>
      )}

      {variant === 'detail' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image gallery skeleton */}
          <div className="space-y-4">
            <div className="bg-gray-300 h-96 rounded-lg"></div>
            <div className="flex space-x-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-300 h-20 w-20 rounded"></div>
              ))}
            </div>
          </div>
          
          {/* Product info skeleton */}
          <div className="space-y-4">
            {/* Title */}
            <div className="bg-gray-300 h-8 rounded w-3/4"></div>
            
            {/* Price */}
            <div className="bg-gray-300 h-10 rounded w-1/2"></div>
            
            {/* Rating */}
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-gray-300 h-5 w-5 rounded"></div>
                ))}
              </div>
              <div className="bg-gray-300 h-4 w-16 rounded"></div>
            </div>
            
            {/* Description */}
            <div className="space-y-2">
              <div className="bg-gray-300 h-4 rounded"></div>
              <div className="bg-gray-300 h-4 rounded w-5/6"></div>
              <div className="bg-gray-300 h-4 rounded w-4/6"></div>
            </div>
            
            {/* Options */}
            <div className="space-y-3">
              <div className="bg-gray-300 h-6 rounded w-1/4"></div>
              <div className="flex space-x-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-gray-300 h-10 w-20 rounded"></div>
                ))}
              </div>
            </div>
            
            {/* Buttons */}
            <div className="space-y-3 pt-4">
              <div className="bg-gray-300 h-12 rounded"></div>
              <div className="bg-gray-300 h-12 rounded"></div>
            </div>
          </div>
        </div>
      )}

      {variant === 'list' && (
        <div className="flex space-x-4 p-4 bg-white rounded-lg shadow">
          {/* Image */}
          <div className="bg-gray-300 h-24 w-24 rounded flex-shrink-0"></div>
          
          {/* Content */}
          <div className="flex-1 space-y-2">
            <div className="bg-gray-300 h-4 rounded w-3/4"></div>
            <div className="bg-gray-300 h-4 rounded w-1/2"></div>
            <div className="bg-gray-300 h-6 rounded w-1/3"></div>
            
            <div className="flex space-x-2 pt-2">
              <div className="bg-gray-300 h-8 w-24 rounded"></div>
              <div className="bg-gray-300 h-8 w-8 rounded"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  ));

  return (
    <>
      {variant === 'card' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {skeletons}
        </div>
      ) : (
        <div className="space-y-4">
          {skeletons}
        </div>
      )}
    </>
  );
};

// Individual skeleton components for more specific use cases
export const ProductCardSkeleton: React.FC = () => (
  <ProductSkeleton count={1} variant="card" />
);

export const ProductDetailSkeleton: React.FC = () => (
  <ProductSkeleton count={1} variant="detail" />
);

export const ProductListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <ProductSkeleton count={count} variant="list" />
);

export default ProductSkeleton; 