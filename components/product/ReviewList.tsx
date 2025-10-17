'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { Star, ThumbsUp, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  user_id: string;
  user_name: string;
  user_avatar: string | null;
}

interface ReviewListProps {
  productId: string;
  refreshTrigger?: number;
}

export const ReviewList: React.FC<ReviewListProps> = ({ productId, refreshTrigger = 0 }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/reviews?product_id=${productId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du chargement des avis');
      }

      setReviews(data.reviews || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cet avis ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/reviews?id=${reviewId}&user_id=${user?.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      // Reload reviews
      loadReviews();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la suppression');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-gray-100 rounded-lg p-6 h-32"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        <p>Erreur: {error}</p>
        <Button onClick={loadReviews} variant="outline" className="mt-4">
          Réessayer
        </Button>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg mb-2">Aucun avis pour le moment</p>
        <p className="text-sm">Soyez le premier à donner votre avis sur ce produit !</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
              {/* User Avatar */}
              <div className="flex-shrink-0">
                {review.user_avatar ? (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden">
                    <Image
                      src={review.user_avatar}
                      alt={review.user_name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-jomionstore-primary text-white flex items-center justify-center font-semibold">
                    {getInitials(review.user_name)}
                  </div>
                )}
              </div>

              {/* User Info */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">{review.user_name}</span>
                  {review.verified_purchase && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                      ✓ Achat vérifié
                    </span>
                  )}
                </div>
                
                {/* Rating */}
                <div className="flex items-center gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= review.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'fill-gray-200 text-gray-200'
                      }`}
                    />
                  ))}
                </div>

                {/* Date */}
                <p className="text-sm text-gray-500">{formatDate(review.created_at)}</p>
              </div>
            </div>

            {/* Delete button (only for own reviews) */}
            {user?.id === review.user_id && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(review.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Review Content */}
          {review.title && (
            <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
          )}
          
          {review.comment && (
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {review.comment}
            </p>
          )}

          {/* Footer */}
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
            <button className="flex items-center gap-1 hover:text-gray-700">
              <ThumbsUp className="w-4 h-4" />
              <span>Utile ({review.helpful_count})</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
