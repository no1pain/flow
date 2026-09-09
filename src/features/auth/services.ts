import { createClient } from '@/lib/supabase/client';

export interface UserProfile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  email?: string;
}

export const authService = {
  async searchUsers(query: string, limit: number = 10): Promise<UserProfile[]> {
    if (!query.trim()) return [];

    const supabase = createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .ilike('username', `%${query}%`)
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async getAllUsers(limit: number = 50): Promise<UserProfile[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async getUserById(userId: string): Promise<UserProfile | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .eq('id', userId)
      .single();

    if (error) return null;
    return data;
  },
};
