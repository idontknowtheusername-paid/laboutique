'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface ReviewFormProps {
  productId: string;
  onSuccess?: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ productId, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const { user } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      router.push('/login?redirect=' + window.location.pathname);
      return;
    }

    if (rating === 0) {
      setError('Veuillez sélectionner une note');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          user_id: user.id,
          rating,
          title: title.trim() || null,
          comment: comment.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la soumission');
      }

      setSuccess(true);
      setRating(0);
      setTitle('');
      setComment('');
      
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }

    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-600 mb-4">
          Vous devez être connecté pour laisser un avis
        </p>
        <Button 
          onClick={() => router.push('/login?redirect=' + window.location.pathname)}
          className="bg-jomionstore-primary hover:bg-orange-700"
        >
          Se connecter
        </Button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center py-8 bg-green-50 rounded-lg border border-green-200">
        <div className="text-green-600 text-lg font-medium mb-2">
          ✅ Merci pour votre avis !
        </div>
        <p className="text-gray-600">
          Votre avis a été publié avec succès
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-gray-50 rounded-lg">
      <div>
        <h3 className="text-lg font-semibold mb-4">Laisser un avis</h3>
        
        {/* Rating Stars */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Note <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoverRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-gray-200 text-gray-200'
                  }`}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-sm text-gray-600">
                {rating === 5 ? 'Excellent' : rating === 4 ? 'Très bien' : rating === 3 ? 'Bien' : rating === 2 ? 'Moyen' : 'Décevant'}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="mb-4">
          <label htmlFor="review-title" className="block text-sm font-medium text-gray-700 mb-2">
            Titre (optionnel)
          </label>
          <Input
            id="review-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Résumez votre expérience"
            maxLength={200}
            className="w-full"
          />
        </div>

        {/* Comment */}
        <div className="mb-4">
          <label htmlFor="review-comment" className="block text-sm font-medium text-gray-700 mb-2">
            Commentaire (optionnel)
          </label>
          <Textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Partagez votre expérience avec ce produit..."
            rows={4}
            maxLength={1000}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            {comment.length}/1000 caractères
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting || rating === 0}
        className="w-full bg-jomionstore-primary hover:bg-orange-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Publication...' : 'Publier mon avis'}
      </Button>
    </form>
  );
};
