'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import ProductSlider from '@/components/home/ProductSlider';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

// Mock product data
const productData = {
  id: '1',
  name: 'iPhone 15 Pro Max 256GB - Titanium Natural',
  slug: 'iphone-15-pro-max-256gb',
  images: [
    'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  price: 850000,
  comparePrice: 950000,
  discount: 11,
  rating: 4.8,
  reviews: 324,
  inStock: true,
  stockCount: 15,
  vendor: {
    name: 'Apple Store Official',
    rating: 4.9,
    reviews: 12450,
    verified: true
  },
  category: 'Smartphones',
  brand: 'Apple',
  sku: 'APL-IP15PM-256-TN',
  description: 'Le iPhone 15 Pro Max redéfinit ce qu\'un smartphone peut faire. Avec son design en titane de qualité aérospatiale, son système de caméra Pro avancé et la puce A17 Pro révolutionnaire, il offre des performances inégalées.',
  specifications: {
    'Écran': '6.7" Super Retina XDR OLED',
    'Processeur': 'Apple A17 Pro',
    'Stockage': '256GB',
    'RAM': '8GB',
    'Caméra': 'Triple 48MP + 12MP + 12MP',
    'Batterie': '4441 mAh',
    'OS': 'iOS 17',
    'Couleur': 'Titanium Natural',
    'Poids': '221g',
    'Résistance': 'IP68'
  },
  variants: {
    storage: ['128GB', '256GB', '512GB', '1TB'],
    color: ['Titanium Natural', 'Titanium Blue', 'Titanium White', 'Titanium Black']
  },
  features: [
    'Design en titane de qualité aérospatiale',
    'Système de caméra Pro avec zoom optique 5x',
    'Puce A17 Pro avec GPU 6 cœurs',
    'Écran Super Retina XDR de 6,7 pouces',
    'Bouton Action personnalisable',
    'USB-C avec USB 3 pour des transferts ultra-rapides'
  ]
};

const reviews = [
  {
    id: '1',
    user: 'Jean-Baptiste K.',
    rating: 5,
    date: '2024-01-15',
    title: 'Excellent smartphone !',
    content: 'Très satisfait de mon achat. La qualité photo est exceptionnelle et la batterie tient toute la journée. Livraison rapide et produit authentique.',
    verified: true,
    helpful: 12,
    images: ['https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=200']
  },
  {
    id: '2',
    user: 'Marie S.',
    rating: 4,
    date: '2024-01-10',
    title: 'Bon produit mais cher',
    content: 'Le téléphone est vraiment bien, performances au top. Juste le prix qui pique un peu mais ça vaut le coup pour la qualité Apple.',
    verified: true,
    helpful: 8
  },
  {
    id: '3',
    user: 'Koffi A.',
    rating: 5,
    date: '2024-01-08',
    title: 'Parfait pour la photo',
    content: 'En tant que photographe, je suis impressionné par la qualité des photos. Le zoom 5x est vraiment pratique. Recommandé !',
    verified: true,
    helpful: 15
  }
];

const similarProducts = [
  {
    id: '2',
    name: 'Samsung Galaxy S24 Ultra',
    slug: 'samsung-galaxy-s24-ultra',
    image: 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 780000,
    comparePrice: 890000,
    rating: 4.6,
    reviews: 256,
    discount: 12,
    vendor: 'Samsung Official',
    category: 'Smartphones'
  },
  {
    id: '3',
    name: 'iPhone 14 Pro Max',
    slug: 'iphone-14-pro-max',
    image: 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 720000,
    comparePrice: 850000,
    rating: 4.7,
    reviews: 189,
    discount: 15,
    vendor: 'Apple Store',
    category: 'Smartphones'
  },
  {
    id: '4',
    name: 'Google Pixel 8 Pro',
    slug: 'google-pixel-8-pro',
    image: 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 650000,
    rating: 4.5,
    reviews: 145,
    vendor: 'Google Store',
    category: 'Smartphones'
  },
  {
    id: '5',
    name: 'OnePlus 12',
    slug: 'oneplus-12',
    image: 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 580000,
    comparePrice: 680000,
    rating: 4.4,
    reviews: 98,
    discount: 15,
    vendor: 'OnePlus Official',
    category: 'Smartphones'
  }
];

export default function ProductDetailPage() {
  const params = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedStorage, setSelectedStorage] = useState('256GB');
  const [selectedColor, setSelectedColor] = useState('Titanium Natural');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-BJ', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productData.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productData.images.length) % productData.images.length);
  };

  return (
    <div className="min-h-screen bg-beshop-background">
      <Header />
      <CategoryMenu />
      
      <div className="container py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <a href="/" className="hover:text-beshop-primary">Accueil</a>
          <span>/</span>
          <a href="/category/electronique" className="hover:text-beshop-primary">Électronique</a>
          <span>/</span>
          <a href="/category/electronique/smartphones" className="hover:text-beshop-primary">Smartphones</a>
          <span>/</span>
          <span className="text-gray-900 font-medium">{productData.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-white rounded-lg overflow-hidden shadow-lg">
              <img
                src={productData.images[currentImageIndex]}
                alt={productData.name}
                className="w-full h-full object-cover"
              />
              
              {/* Navigation Arrows */}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Discount Badge */}
              {productData.discount && (
                <Badge className="absolute top-4 left-4 bg-red-500 text-white text-lg px-3 py-1">
                  -{productData.discount}%
                </Badge>
              )}
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-2">
              {productData.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentImageIndex ? 'border-beshop-primary' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${productData.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title and Rating */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {productData.name}
              </h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(productData.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'fill-gray-200 text-gray-200'
                      }`}
                    />
                  ))}
                  <span className="text-lg font-medium ml-2">{productData.rating}</span>
                </div>
                <span className="text-gray-500">({productData.reviews} avis)</span>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  {productData.inStock ? 'En stock' : 'Rupture de stock'}
                </Badge>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center space-x-4">
                <span className="text-4xl font-bold text-beshop-primary">
                  {formatPrice(productData.price)}
                </span>
                {productData.comparePrice && (
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(productData.comparePrice)}
                  </span>
                )}
              </div>
              {productData.discount && (
                <p className="text-green-600 font-medium">
                  Vous économisez {formatPrice(productData.comparePrice! - productData.price)}
                </p>
              )}
            </div>

            {/* Vendor Info */}
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-beshop-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">A</span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{productData.vendor.name}</h3>
                      {productData.vendor.verified && (
                        <Verified className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span>{productData.vendor.rating}</span>
                      <span>({productData.vendor.reviews} avis)</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Voir la boutique
                </Button>
              </div>
            </Card>

            {/* Variants */}
            <div className="space-y-4">
              {/* Storage */}
              <div>
                <h3 className="font-medium mb-2">Stockage:</h3>
                <div className="flex space-x-2">
                  {productData.variants.storage.map((storage) => (
                    <Button
                      key={storage}
                      variant={selectedStorage === storage ? 'default' : 'outline'}
                      onClick={() => setSelectedStorage(storage)}
                      className="min-w-[80px]"
                    >
                      {storage}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div>
                <h3 className="font-medium mb-2">Couleur:</h3>
                <div className="flex space-x-2">
                  {productData.variants.color.map((color) => (
                    <Button
                      key={color}
                      variant={selectedColor === color ? 'default' : 'outline'}
                      onClick={() => setSelectedColor(color)}
                      className="min-w-[120px]"
                    >
                      {color}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="font-medium mb-2">Quantité:</h3>
              <div className="flex items-center space-x-3">
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.min(productData.stockCount, quantity + 1))}
                    disabled={quantity >= productData.stockCount}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <span className="text-sm text-gray-600">
                  {productData.stockCount} disponibles
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button className="w-full bg-beshop-primary hover:bg-blue-700 h-12 text-lg">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Ajouter au panier
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-12">
                  Acheter maintenant
                </Button>
                <Button
                  variant="outline"
                  className="h-12"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                >
                  <Heart className={`w-5 h-5 mr-2 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                  {isWishlisted ? 'Ajouté' : 'Favoris'}
                </Button>
              </div>
            </div>

            {/* Services */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
              <div className="flex items-center space-x-2 text-sm">
                <Truck className="w-5 h-5 text-beshop-secondary" />
                <span>Livraison gratuite</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Shield className="w-5 h-5 text-beshop-secondary" />
                <span>Garantie officielle</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <RotateCcw className="w-5 h-5 text-beshop-secondary" />
                <span>Retour 30 jours</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Card className="mb-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Caractéristiques</TabsTrigger>
              <TabsTrigger value="reviews">Avis ({productData.reviews})</TabsTrigger>
              <TabsTrigger value="qa">Questions & Réponses</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="p-6">
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  {productData.description}
                </p>
                <div>
                  <h3 className="font-semibold mb-3">Caractéristiques principales:</h3>
                  <ul className="space-y-2">
                    {productData.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="w-2 h-2 bg-beshop-primary rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="specifications" className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(productData.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-600">{key}:</span>
                    <span className="text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="p-6">
              <div className="space-y-6">
                {/* Reviews Summary */}
                <div className="flex items-center space-x-8 p-6 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-beshop-primary">{productData.rating}</div>
                    <div className="flex items-center justify-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(productData.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'fill-gray-200 text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{productData.reviews} avis</div>
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

                {/* Individual Reviews */}
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium">{review.user}</span>
                            {review.verified && (
                              <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                                Achat vérifié
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'fill-gray-200 text-gray-200'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">{review.date}</span>
                          </div>
                        </div>
                      </div>
                      <h4 className="font-medium mb-2">{review.title}</h4>
                      <p className="text-gray-700 mb-3">{review.content}</p>
                      {review.images && (
                        <div className="flex space-x-2 mb-3">
                          {review.images.map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt="Review"
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <button className="flex items-center space-x-1 hover:text-beshop-primary">
                          <ThumbsUp className="w-4 h-4" />
                          <span>Utile ({review.helpful})</span>
                        </button>
                        <button className="flex items-center space-x-1 hover:text-beshop-primary">
                          <MessageCircle className="w-4 h-4" />
                          <span>Répondre</span>
                        </button>
                      </div>
                    </div>
                  ))}
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
                <Button className="bg-beshop-primary hover:bg-blue-700">
                  Poser une question
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Similar Products */}
        <ProductSlider
          title="Produits similaires"
          subtitle="Découvrez d'autres smartphones qui pourraient vous intéresser"
          products={similarProducts}
          backgroundColor="bg-white"
        />
      </div>

      <Footer />
    </div>
  );
}