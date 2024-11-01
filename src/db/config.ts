import { createClient } from '@supabase/supabase-js';

const DEBUG = true;

if (DEBUG) {
  console.group('🔌 Database Configuration');
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const error = new Error('Missing required Supabase environment variables');
  console.error('❌ Database configuration error:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    error
  });
  throw error;
}

if (DEBUG) {
  console.log('✅ Environment variables validated');
  console.log('🔌 Creating Supabase client...');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage
  }
});

if (DEBUG) {
  console.log('✅ Supabase client created');
}

export async function initDB() {
  if (DEBUG) {
    console.group('📦 Database Initialization');
    console.time('dbInit');
  }
  
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session check failed:', sessionError);
      throw sessionError;
    }

    if (DEBUG) {
      console.log('🔑 Session check:', {
        hasSession: !!session,
        userId: session?.user?.id,
        timestamp: new Date().toISOString()
      });
    }
    
    if (!session) {
      if (DEBUG) console.log('⏭️ No active session, skipping user data initialization');
      return null;
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (userError) {
      if (userError.code === 'PGRST116') {
        if (DEBUG) console.log('👤 User profile not found, will be created on first login');
        return null;
      }
      throw userError;
    }

    if (DEBUG) {
      console.log('✅ User data loaded successfully:', {
        userId: userData.id,
        timestamp: new Date().toISOString()
      });
    }

    return userData;

  } catch (error) {
    console.error('❌ Database initialization failed:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    throw error;
  } finally {
    if (DEBUG) {
      console.timeEnd('dbInit');
      console.groupEnd();
    }
  }
}