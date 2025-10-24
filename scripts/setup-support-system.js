const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.log('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupSupportSystem() {
  try {
    console.log('🚀 Configuration du système de support...');

    // Vérifier si les tables existent
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['support_conversations', 'support_messages', 'support_tickets']);

    if (tablesError) {
      console.error('❌ Erreur lors de la vérification des tables:', tablesError);
      return;
    }

    const existingTables = tables.map(t => t.table_name);
    console.log('📋 Tables existantes:', existingTables);

    if (existingTables.length === 3) {
      console.log('✅ Toutes les tables de support existent déjà');
    } else {
      console.log('⚠️  Certaines tables manquent. Veuillez exécuter le script SQL dans Supabase');
      console.log('📄 Fichier à exécuter: scripts/setup-support-tables.sql');
    }

    // Tester la création d'un ticket
    console.log('🧪 Test de création de ticket...');
    const { data: testTicket, error: testError } = await supabase
      .from('support_tickets')
      .insert({
        conversation_id: '00000000-0000-0000-0000-000000000000',
        subject: 'Test',
        description: 'Test de création de ticket',
        user_email: 'test@example.com',
        priority: 'low',
        status: 'open'
      })
      .select()
      .single();

    if (testError) {
      console.error('❌ Erreur test ticket:', testError);
    } else {
      console.log('✅ Test de création de ticket réussi:', testTicket.id);
      
      // Supprimer le ticket de test
      await supabase
        .from('support_tickets')
        .delete()
        .eq('id', testTicket.id);
      console.log('🗑️  Ticket de test supprimé');
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

setupSupportSystem();