import { supabase } from './supabase';

export const authService = {
  // 1. Sign Up: Creates a user in Auth AND a row in our Profiles table
  async signUp(email: string, password: string, username: string, displayName: string) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          { 
            id: authData.user.id, 
            username: username.toLowerCase(), 
            display_name: displayName,
          }
        ]);
      
      if (profileError) throw profileError;
    }
    return authData.user;
  },

  // 2. Login: Standard Supabase Auth
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data.user;
  },

  // 3. Get Session: Checks if someone is already logged in
  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  }
};