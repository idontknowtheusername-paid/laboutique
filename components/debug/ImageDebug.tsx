'use client';

import React from 'react';

interface ImageDebugProps {
  images: string[] | undefined;
  productName: string;
}

const ImageDebug: React.FC<ImageDebugProps> = ({ images, productName }) => {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="text-xs text-gray-500 bg-yellow-100 p-2 rounded">
      <div>Produit: {productName}</div>
      <div>Images: {images ? images.length : 0}</div>
      {images && images.length > 0 && (
        <div>
          <div>URL: {images[0]}</div>
          <div>Valide: {images[0] ? 'Oui' : 'Non'}</div>
        </div>
      )}
    </div>
  );
};

export default ImageDebug;