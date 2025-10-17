// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const limit = parseInt(searchParams.get('limit') || '5');

    let query = supabaseAdmin
      .from('hero_banners')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: true });

    if (type !== 'all') {
      query = query.eq('type', type);
    }

    const { data: banners, error } = await query.limit(limit);

    if (error) {
      console.error('Error fetching hero banners:', error);
      return NextResponse.json(
        { error: 'Failed to fetch hero banners' },
        { status: 500 }
      );
    }

    // Si pas de bannières en DB, retourner des bannières par défaut
    if (!banners || banners.length === 0) {
      const defaultBanners = [
        {
          id: 'default-1',
          title: 'Découvrez JomionStore',
          subtitle: 'Le centre commercial digital du Bénin',
          description: 'Des milliers de produits authentiques, une livraison rapide et un service client exceptionnel.',
          cta_text: 'Découvrir maintenant',
          cta_link: '/products',
          image_url: 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=1200',
          gradient: 'from-jomionstore-primary to-orange-600',
          type: 'promotional',
          priority: 1,
          is_active: true,
          created_at: new Date().toISOString()
        },
        {
          id: 'default-2',
          title: 'Électronique Premium',
          subtitle: 'Les dernières technologies à votre portée',
          description: 'Smartphones, laptops, TV intelligentes et bien plus encore avec garantie officielle.',
          cta_text: 'Voir la collection',
          cta_link: '/category/electronique',
          image_url: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=1200',
          gradient: 'from-jomionstore-secondary to-orange-600',
          type: 'category',
          priority: 2,
          is_active: true,
          created_at: new Date().toISOString()
        },
        {
          id: 'default-3',
          title: 'Mode & Style',
          subtitle: 'Express your unique style',
          description: 'Découvrez les dernières tendances mode pour homme, femme et enfant.',
          cta_text: 'Shopping mode',
          cta_link: '/category/mode-beaute',
          image_url: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=1200',
          gradient: 'from-purple-600 to-pink-600',
          type: 'category',
          priority: 3,
          is_active: true,
          created_at: new Date().toISOString()
        },
        {
          id: 'default-4',
          title: 'Livraison Gratuite',
          subtitle: 'À Cotonou et environs',
          description: 'Commandez maintenant et recevez gratuitement vos produits sous 24h.',
          cta_text: 'En savoir plus',
          cta_link: '/delivery-info',
          image_url: 'https://images.pexels.com/photos/4393021/pexels-photo-4393021.jpeg?auto=compress&cs=tinysrgb&w=1200',
          gradient: 'from-green-600 to-teal-600',
          type: 'service',
          priority: 4,
          is_active: true,
          created_at: new Date().toISOString()
        },
        {
          id: 'default-5',
          title: 'Paiement Sécurisé',
          subtitle: 'Vos transactions sont protégées',
          description: 'Cartes bancaires, Mobile Money, virement. Toutes vos données sont chiffrées et sécurisées.',
          cta_text: 'Découvrir',
          cta_link: '/payment-info',
          image_url: 'https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg?auto=compress&cs=tinysrgb&w=1200',
          gradient: 'from-orange-600 to-indigo-600',
          type: 'service',
          priority: 5,
          is_active: true,
          created_at: new Date().toISOString()
        }
      ];

      return NextResponse.json({
        success: true,
        data: defaultBanners,
        count: defaultBanners.length
      });
    }

    return NextResponse.json({
      success: true,
      data: banners,
      count: banners.length
    });

  } catch (error) {
    console.error('Error in hero banners API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { data: banner, error } = await supabaseAdmin
      .from('hero_banners')
      .insert([{
        title: body.title,
        subtitle: body.subtitle,
        description: body.description,
        cta_text: body.cta_text,
        cta_link: body.cta_link,
        image_url: body.image_url,
        gradient: body.gradient,
        type: body.type || 'promotional',
        priority: body.priority || 1,
        is_active: body.is_active !== undefined ? body.is_active : true
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating hero banner:', error);
      return NextResponse.json(
        { error: 'Failed to create hero banner' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: banner
    });

  } catch (error) {
    console.error('Error in hero banners POST API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}