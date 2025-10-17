import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { 
      orderNumber, 
      claimType, 
      name, 
      email, 
      phone, 
      description, 
      desiredSolution,
      attachments 
    } = await request.json();

    // Validation des champs requis
    if (!orderNumber || !claimType || !name || !email || !description || !desiredSolution) {
      return NextResponse.json(
        { success: false, error: 'Tous les champs requis doivent être remplis' },
        { status: 400 }
      );
    }

    // Validation de l'email
    if (!email.includes('@') || !email.includes('.')) {
      return NextResponse.json(
        { success: false, error: 'Adresse email invalide' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Vérifier si l'utilisateur existe (optionnel)
    let userId = null;
    if (email) {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();
      
      if (user) {
        userId = user.id;
      }
    }

    // Vérifier si la commande existe (optionnel)
    let orderId = null;
    if (orderNumber) {
      const { data: order } = await supabase
        .from('orders')
        .select('id')
        .eq('order_number', orderNumber)
        .single();
      
      if (order) {
        orderId = order.id;
      }
    }

    // Générer un numéro de réclamation unique
    const claimNumber = `RCL${Date.now().toString().slice(-8)}`;

    // Sauvegarder la réclamation
    const { data: claim, error: insertError } = await supabase
      .from('claims')
      .insert({
        claim_number: claimNumber,
        user_id: userId,
        order_id: orderId,
        order_number: orderNumber,
        type: claimType,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || null,
        description: description.trim(),
        desired_solution: desiredSolution,
        status: 'new',
        priority: claimType === 'delivery' ? 'high' : 'medium',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('Erreur insertion réclamation:', insertError);
      throw insertError;
    }

    // TODO: Envoyer email de notification à l'admin
    // await sendClaimNotificationToAdmin(claim);
    
    // TODO: Envoyer email de confirmation au client
    // await sendClaimConfirmationToClient(email, name, claimNumber);

    return NextResponse.json({
      success: true,
      message: 'Votre réclamation a été enregistrée avec succès !',
      claimNumber: claimNumber,
      claimId: claim.id
    });

  } catch (error) {
    console.error('Erreur réclamation:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur lors de l\'enregistrement de la réclamation' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || 'all';
    const type = searchParams.get('type') || 'all';
    const email = searchParams.get('email');

    const supabase = createClient();

    // Construire la requête avec filtres
    let query = supabase
      .from('claims')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    if (type !== 'all') {
      query = query.eq('type', type);
    }

    if (email) {
      query = query.eq('email', email.toLowerCase());
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: claims, error, count } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: claims,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Erreur récupération réclamations:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des réclamations' },
      { status: 500 }
    );
  }
}