'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { loginSchema, registerSchema, updateProfileSchema } from '@/lib/validations/auth';

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const validatedFields = loginSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      error: 'Invalid credentials',
      fields: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { data: authData, error } = await supabase.auth.signInWithPassword(validatedFields.data);

  if (error) {
    return {
      error: error.message,
    };
  }

  if (!authData.user) {
    return {
      error: 'Authentication failed',
    };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function register(formData: FormData) {
  const supabase = await createClient();

  const data = {
    username: formData.get('username') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const validatedFields = registerSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      error: 'Invalid registration data',
      fields: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { data: authData, error } = await supabase.auth.signUp({
    email: validatedFields.data.email,
    password: validatedFields.data.password,
    options: {
      data: {
        username: validatedFields.data.username,
      },
    },
  });

  if (error) {
    return {
      error: error.message,
    };
  }

  if (!authData.user) {
    return {
      error: 'Registration failed',
    };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      error: 'User not authenticated',
    };
  }

  const data = {
    username: formData.get('username') as string,
    avatar_url: formData.get('avatar_url') as string,
  };

  const validatedFields = updateProfileSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      error: 'Invalid profile data',
      fields: validatedFields.error.flatten().fieldErrors,
    };
  }

  const updates: { username?: string; avatar_url?: string } = {};
  if (validatedFields.data.username) {
    updates.username = validatedFields.data.username;
  }
  if (validatedFields.data.avatar_url) {
    updates.avatar_url = validatedFields.data.avatar_url;
  }

  const { error } = await supabase.auth.updateUser({
    data: updates,
  });

  if (error) {
    return {
      error: error.message,
    };
  }

  revalidatePath('/dashboard/settings', 'page');
  return {
    success: true,
  };
}
