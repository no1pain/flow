'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { loginSchema, registerSchema } from '@/lib/validations/auth';

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

  const { error } = await supabase.auth.signInWithPassword(validatedFields.data);

  if (error) {
    return {
      error: error.message,
    };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function register(formData: FormData) {
  const supabase = await createClient();

  const data = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
  };

  const validatedFields = registerSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      error: 'Invalid registration data',
      fields: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { error } = await supabase.auth.signUp({
    email: validatedFields.data.email,
    password: validatedFields.data.password,
    options: {
      data: {
        full_name: validatedFields.data.name,
      },
    },
  });

  if (error) {
    return {
      error: error.message,
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
