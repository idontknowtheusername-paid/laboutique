'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import Script from 'next/script';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import ProductSlider from '@/components/home/ProductSlider';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReviewForm } from '@/components/product/ReviewForm';
import { ReviewList } from '@/components/product/ReviewList';
import ShareButtons from '@/components/product/ShareButtons';
import { 
  Star, 
  Heart, 
  ShoppingCart, 
  Share2, 
  Truck, 
  Shield, 
  RotateCcw,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  Verified,
  MessageCircle,
  ThumbsUp
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { WishlistButton } from '@/components/ui/wishlist-button';
import { WhatsAppButton } from '@/components/ui/whatsapp-button';
import { ProductsService, Product as ProductType } from '@/lib/services/products.service';
import { ErrorState } from '@/components/ui/error-state';
import { generateConsistentRating, generateConsistentReviews } from '@/lib/utils/rating';
import { generateProductSchema, generateBreadcrumbSchema } from '@/lib/utils/seo-helpers';
import { cleanProductDescription } from '@/lib/utils/clean-description';

// Slider product type for mapping
type SliderProduct = {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  comparePrice?: number;
  rating: number;
  reviews: number;
  vendor: string;
  category: string;
  badge?: string;
  badgeColor?: string;
};

export default function ProductDetailPage() {
  const params = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<ProductType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [similarProducts, setSimilarProducts] = useState<SliderProduct[]>([]);
  const [recentlyViewedProducts, setRecentlyViewedProducts] = useState<SliderProduct[]>([]);
  const [newProducts, setNewProducts] = useState<SliderProduct[]>([]);
  const [reviewsRefresh, setReviewsRefresh] = useState(0);

  const { addToCart } = useCart();

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product.id, product.name, product.price, quantity);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-BJ', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Load product by slug
  useEffect(() => {
    const slug = (params as any)?.slug as string;
    if (!slug) return;
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await ProductsService.getBySlug(slug);
        if (!isMounted) return;
        if (res.success && res.data) {
          setProduct(res.data);
          // Record as recently viewed (store minimal snapshot)
          try {
            const key = 'recently_viewed';
            const raw = localStorage.getItem(key);
            const arr = raw ? JSON.parse(raw) as any[] : [];
            const snapshot = { id: res.data.id, name: res.data.name, slug: res.data.slug, price: res.data.price, images: res.data.images };
            const filtered = arr.filter((p: any) => p && p.id !== snapshot.id);
            const updated = [snapshot, ...filtered].slice(0, 50);
            localStorage.setItem(key, JSON.stringify(updated));
          } catch {}
          // Load similar and new products for sliders
          const [similarRes, newRes] = await Promise.all([
            ProductsService.getSimilar(res.data.id, 10),
            ProductsService.getNew(10),
          ]);
          if (similarRes.success && similarRes.data) {
            setSimilarProducts(
              similarRes.data.map((p) => ({
                id: p.id,
                name: p.name,
                slug: p.slug,
                images: p.images || [],
                image: p.images?.[0] || '/placeholder-product.jpg',
                price: p.price,
                comparePrice: p.compare_price,
                rating: generateConsistentRating(p.id, p.average_rating),
                reviews: generateConsistentReviews(p.id, p.reviews_count),
                vendor: p.vendor?.name || '',
                category: p.category?.name || '',
              }))
            );
          }
          if (newRes.success && newRes.data) {
            setNewProducts(
              newRes.data.map((p) => ({
                id: p.id,
                name: p.name,
                slug: p.slug,
                images: p.images || [],
                image: p.images?.[0] || '/placeholder-product.jpg',
                price: p.price,
                comparePrice: p.compare_price,
                rating: generateConsistentRating(p.id, p.average_rating),
                reviews: generateConsistentReviews(p.id, p.reviews_count),
                vendor: p.vendor?.name || '',
                category: p.category?.name || '',
              }))
            );
          }
        } else {
          setError(res.error || 'Produit introuvable');
        }
      } catch (e: any) {
        if (!isMounted) return;
        setError(e?.message || 'Erreur de chargement du produit');
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [params]);

  const nextImage = () => {
    if (!product?.images || product.images.length === 0) return;
    const imagesLength = product.images.length;
    setCurrentImageIndex((prev) => (prev + 1) % imagesLength);
  };

  const prevImage = () => {
    if (!product?.images || product.images.length === 0) return;
    const imagesLength = product.images.length;
    setCurrentImageIndex((prev) => (prev - 1 + imagesLength) % imagesLength);
  };

  // Reset image index when product changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [product?.id]);

  // Load recently viewed products
  useEffect(() => {
    if (!product) return;
    
    try {
      const raw = localStorage.getItem('recently_viewed');
      if (!raw) return;
      
      const recentlyViewed = JSON.parse(raw) as any[];
      // Filter out current product and limit to 8 items
      const filtered = recentlyViewed
        .filter((p: any) => p && p.id !== product.id)
        .slice(0, 8)
        .map((p: any) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          images: p.images || [],
          image: p.images?.[0] || '/placeholder-product.jpg',
          price: p.price,
          rating: 0,
          reviews: 0,
          vendor: '',
          category: '',
        }));
      
      setRecentlyViewedProducts(filtered);
    } catch (err) {
      console.error('Error loading recently viewed:', err);
      setRecentlyViewedProducts([]);
    }
  }, [product]);

  // Generate structured data for SEO
  const productSchema = product ? generateProductSchema({
    name: product.name,
    description: product.description || product.short_description || '',
    image: product.images || [],
    price: product.price,
    currency: 'XOF',
    availability: (!product.track_quantity || product.quantity > 0) ? 'in_stock' : 'out_of_stock',
    brand: product.brand || product.vendor?.name,
    sku: product.id,
    rating: generateConsistentRating(product.id, product.average_rating),
    reviewCount: generateConsistentReviews(product.id, product.reviews_count),
    url: `https://www.jomionstore.com/product/${product.slug}`,
  }) : null;

  const breadcrumbSchema = product ? generateBreadcrumbSchema([
    { name: 'Accueil', url: 'https://www.jomionstore.com' },
    ...(product.category ? [{
      name: product.category.name,
      url: `https://www.jomionstore.com/category/${product.category.slug}`
    }] : []),
    { name: product.name, url: `https://www.jomionstore.com/product/${product.slug}` },
  ]) : null;

  return (
    <div className="min-h-screen bg-jomionstore-background">
      {/* Structured Data for SEO */}
      {productSchema && (
        <Script
          id="product-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      )}
      {breadcrumbSchema && (
        <Script
          id="breadcrumb-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}

      <Header />
      <CategoryMenu />
      
      <div className="container py-8">
        {error && (
          <div className="mb-6">
            <ErrorState type="generic" title="Erreur" message={error} onRetry={() => window.location.reload()} />
          </div>
        )}

        {!error && loading && (
          <div className="mb-6 animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-64"></div>
            <div className="h-8 bg-gray-200 rounded w-96"></div>
          </div>
        )}
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-jomionstore-primary">Accueil</Link>
          <span>/</span>
          {product?.category && (
            <>
              <Link 
                href={`/category/${product.category.slug}`} 
                className="hover:text-jomionstore-primary"
              >
                {product.category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-gray-900 font-medium line-clamp-1">{product?.name || '...'}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-white rounded-lg overflow-hidden shadow-lg">
              <Image
                src={(product?.images && product.images[currentImageIndex]) || '/placeholder-product.jpg'}
                alt={product?.name || ''}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain"
                priority={true}
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-product.jpg';
                }}
              />
              
              {/* Navigation Arrows - Only show if multiple images */}
              {product?.images && product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all z-10"
                    aria-label="Image précédente"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all z-10"
                    aria-label="Image suivante"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Discount Badge */}
              {product?.compare_price && product?.price && product.compare_price > product.price && (
                <Badge className="absolute top-4 left-4 bg-red-500 text-white text-lg px-3 py-1">
                  -{Math.round(((product.compare_price - product.price) / product.compare_price) * 100)}%
                </Badge>
              )}
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-2">
              {(product?.images && product.images.length > 0 ? product.images : ['/placeholder-product.jpg']).map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentImageIndex ? 'border-jomionstore-primary' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={image}
                      alt={`${product?.name || ''} ${index + 1}`}
                      fill
                      sizes="96px"
                      className="object-contain"
                      loading="lazy"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-product.jpg';
                      }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title and Rating */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product?.name || ''}
              </h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(generateConsistentRating(product?.id || '', product?.average_rating))
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'fill-gray-200 text-gray-200'
                      }`}
                    />
                  ))}
                  <span className="text-lg font-medium ml-2">{generateConsistentRating(product?.id || '', product?.average_rating).toFixed(1)}</span>
                </div>
                <span className="text-gray-500">({generateConsistentReviews(product?.id || '', product?.reviews_count)} avis)</span>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  {product && (!product.track_quantity || product.quantity > 0) ? 'En stock' : 'Rupture de stock'}
                </Badge>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center space-x-4">
                <span className="text-4xl font-bold text-jomionstore-primary">
                  {product ? formatPrice(product.price) : ''}
                </span>
                {product?.compare_price && (
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(product.compare_price)}
                  </span>
                )}
              </div>
              {product?.compare_price && product?.price && product.compare_price > product.price && (
                <p className="text-green-600 font-medium">
                  Vous économisez {formatPrice(product.compare_price - product.price)}
                </p>
              )}
            </div>

            {/* Stock faible & Délai de livraison */}
            <div className="space-y-2">
              {/* Indicateur de stock faible */}
              {product?.track_quantity && product.quantity > 0 && product.quantity <= 5 && (
                <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                  </span>
                  <span className="font-medium text-sm">
                    Plus que {product.quantity} en stock !
                  </span>
                </div>
              )}

              {/* Délai de livraison estimé - 1 à 3 jours */}
              {product && (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                  <Truck className="w-4 h-4" />
                  <span className="text-sm">
                    Livré entre{' '}
                    <span className="font-semibold">demain</span>
                    {' '}et le{' '}
                    <span className="font-semibold">
                      {(() => {
                        const deliveryDate = new Date();
                        deliveryDate.setDate(deliveryDate.getDate() + 3);
                        return deliveryDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
                      })()}
                    </span>
                  </span>
                </div>
              )}
            </div>

            {/* Vendor Info */}
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-jomionstore-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {product?.vendor?.name ? product.vendor.name.substring(0, 2).toUpperCase() : 'VD'}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{product?.vendor?.name || 'Boutique'}</h3>
                      {true && (
                        <Verified className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span>{generateConsistentRating(product?.id || '', product?.average_rating).toFixed(1)}</span>
                      <span>({generateConsistentReviews(product?.id || '', product?.reviews_count)} avis)</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Voir la boutique
                </Button>
              </div>
            </Card>

            {/* Variants (non disponible pour le moment) */}

            {/* Quantity */}
            <div>
              <h3 className="font-medium mb-2">Quantité:</h3>
              <div className="flex items-center space-x-3">
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || !product}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (!product) return;
                      const maxQty = product.track_quantity ? product.quantity : 99;
                      setQuantity(Math.min(maxQty, quantity + 1));
                    }}
                    disabled={!product || (product.track_quantity && quantity >= product.quantity)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <span className="text-sm text-gray-600">
                  {product?.track_quantity ? `${product?.quantity ?? 0} disponibles` : 'Stock illimité'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={handleAddToCart}
                className="w-full bg-jomionstore-primary hover:bg-orange-700 h-12 text-lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Ajouter au panier
              </Button>
              <div className="grid grid-cols-2 gap-3">
                {product && (
                  <ShareButtons
                    productName={product.name}
                    productUrl={`https://jomionstore.com/product/${product.slug}`}
                    productImage={product.images?.[0]}
                  />
                )}
                <WishlistButton
                  productId={product?.id || ''}
                  productName={product?.name || ''}
                  price={product?.price || 0}
                  productSlug={product?.slug || ''}
                  variant="button"
                  showText={true}
                  className="h-12"
                />
              </div>
            </div>

            {/* Services */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
              <div className="flex items-center space-x-2 text-sm">
                <Truck className="w-5 h-5 text-jomionstore-secondary" />
                <span>Livraison gratuite</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Shield className="w-5 h-5 text-jomionstore-secondary" />
                <span>Garantie officielle</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <RotateCcw className="w-5 h-5 text-jomionstore-secondary" />
                <span>Retour 30 jours</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Card className="mb-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="reviews">Avis ({generateConsistentReviews(product?.id || '', product?.reviews_count)})</TabsTrigger>
              <TabsTrigger value="qa">Questions & Réponses</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="p-6">
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {cleanProductDescription(product?.description || product?.short_description || '')}
                </p>
                <div>
                  <h3 className="font-semibold mb-3">Caractéristiques principales:</h3>
                  <ul className="space-y-2">
                    {product?.brand && (
                      <li className="flex items-start space-x-2">
                        <span className="w-2 h-2 bg-jomionstore-primary rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-gray-700">Marque: {product.brand}</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="p-6">
              <div className="space-y-6">
                {/* Reviews Summary */}
                <div className="flex items-center space-x-8 p-6 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-jomionstore-primary">{generateConsistentRating(product?.id || '', product?.average_rating).toFixed(1)}</div>
                    <div className="flex items-center justify-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(generateConsistentRating(product?.id || '', product?.average_rating))
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'fill-gray-200 text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{generateConsistentReviews(product?.id || '', product?.reviews_count)} avis</div>
                  </div>
                  <div className="flex-1">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center space-x-2 mb-1">
                        <span className="text-sm w-8">{rating}★</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-400 h-2 rounded-full" 
                            style={{ width: `${rating === 5 ? 70 : rating === 4 ? 20 : rating === 3 ? 5 : rating === 2 ? 3 : 2}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-8">
                          {rating === 5 ? '70%' : rating === 4 ? '20%' : rating === 3 ? '5%' : rating === 2 ? '3%' : '2%'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Review Form */}
                <ReviewForm 
                  productId={product?.id || ''} 
                  onSuccess={() => {
                    setReviewsRefresh(prev => prev + 1);
                    // Reload product to update average_rating
                    window.location.reload();
                  }}
                />

                {/* Individual Reviews */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Avis des clients</h3>
                  <ReviewList 
                    productId={product?.id || ''} 
                    refreshTrigger={reviewsRefresh}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="qa" className="p-6">
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucune question pour le moment
                </h3>
                <p className="text-gray-600 mb-6">
                  Soyez le premier à poser une question sur ce produit
                </p>
                <Button className="bg-jomionstore-primary hover:bg-orange-700">
                  Poser une question
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Carousels de produits - pleine largeur */}
      </div>

      {/* Carousels en pleine largeur sans container */}
      <div className="bg-gray-50 py-4">
        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <ProductSlider
            title="Produits similaires"
            products={similarProducts}
            backgroundColor="bg-transparent"
            compact
          />
        )}

        {/* Recently Viewed */}
        {recentlyViewedProducts.length > 0 && (
          <ProductSlider
            title="Récemment consultés"
            products={recentlyViewedProducts}
            backgroundColor="bg-transparent"
            compact
          />
        )}

        {/* Nouveautés */}
        {newProducts.length > 0 && (
          <ProductSlider
            title="Nouveautés"
            products={newProducts}
            backgroundColor="bg-transparent"
            compact
          />
        )}
      </div>

      <div className="container">

        {/* Removed 'also viewed' mock slider */}
      </div>

      <Footer />

      {/* Bouton WhatsApp flottant */}
      <WhatsAppButton
        productName={product?.name}
        phoneNumber="+22901643540889"
      />
    </div>
  );
}