#!/usr/bin/env node

/**
 * Script pour vérifier et exécuter les migrations SQL manquantes
 * Usage: node scripts/check-and-run-migrations.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Liste des migrations à vérifier
const migrations = [
  {
    name: 'newsletters',
    file: '20250115_create_newsletters_table.sql',
    description: 'Table des abonnements newsletter'
  },
  {
    name: 'contact_messages',
    file: '20250115_create_contact_messages_table.sql',
    description: 'Table des messages de contact'
  },
  {
    name: 'claims',
    file: '20250115_create_claims_table.sql',
    description: 'Table des réclamations'
  },
  {
    name: 'reviews',
    file: '20251015_create_reviews_table.sql',
    description: 'Table des avis produits'
  }
];

async function checkTableExists(tableName) {
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', tableName)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return !!data;
  } catch (error) {
    console.error(`Erreur lors de la vérification de la table ${tableName}:`, error.message);
    return false;
  }
}

async function executeMigration(migration) {
  try {
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', migration.file);
    
    if (!fs.existsSync(migrationPath)) {
      console.error(`❌ Fichier de migration non trouvé: ${migration.file}`);
      return false;
    }

    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log(`🔄 Exécution de la migration: ${migration.description}`);
    
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error(`❌ Erreur lors de l'exécution de ${migration.file}:`, error.message);
      return false;
    }

    console.log(`✅ Migration ${migration.name} exécutée avec succès`);
    return true;
  } catch (error) {
    console.error(`❌ Erreur lors de l'exécution de ${migration.file}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🔍 Vérification des migrations Supabase...\n');

  let allMigrationsOk = true;

  for (const migration of migrations) {
    console.log(`📋 Vérification: ${migration.description}`);
    
    const tableExists = await checkTableExists(migration.name);
    
    if (tableExists) {
      console.log(`✅ Table ${migration.name} existe déjà\n`);
    } else {
      console.log(`⚠️  Table ${migration.name} manquante, exécution de la migration...`);
      
      const success = await executeMigration(migration);
      
      if (success) {
        console.log(`✅ Migration ${migration.name} terminée\n`);
      } else {
        console.log(`❌ Échec de la migration ${migration.name}\n`);
        allMigrationsOk = false;
      }
    }
  }

  if (allMigrationsOk) {
    console.log('🎉 Toutes les migrations sont à jour !');
  } else {
    console.log('⚠️  Certaines migrations ont échoué. Vérifiez les logs ci-dessus.');
    process.exit(1);
  }
}

// Fonction helper pour exécuter du SQL (à créer dans Supabase)
async function createExecSqlFunction() {
  const sql = `
    CREATE OR REPLACE FUNCTION exec_sql(sql_text TEXT)
    RETURNS TEXT
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE sql_text;
      RETURN 'OK';
    EXCEPTION
      WHEN OTHERS THEN
        RETURN 'ERROR: ' || SQLERRM;
    END;
    $$;
  `;

  try {
    const { error } = await supabase.rpc('exec_sql', { sql });
    if (error) {
      console.log('ℹ️  Fonction exec_sql déjà existante ou erreur:', error.message);
    } else {
      console.log('✅ Fonction exec_sql créée');
    }
  } catch (error) {
    console.log('ℹ️  Fonction exec_sql déjà existante');
  }
}

main().catch(console.error);