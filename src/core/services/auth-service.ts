
"use client";

import { supabase } from '@/lib/supabase/client';
import type { UserProfile, UserProfileFormValues } from '@/core/domain/types';

// --- Authentication Functions ---

export const signUp = async ({ name, email, role, password, dni }: UserProfileFormValues) => {
    if (!password) {
        throw new Error("Password is required for sign up.");
    }
    
    // The database's Row Level Security (RLS) policy is now the single source of truth.
    // We no longer need to check the settings table from the client-side.
    
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name,
                role,
                dni: role === 'Docente' || role === 'Auxiliar' ? dni : undefined,
            },
        },
    });

    if (error) {
        console.error("Sign up error:", error.message);
        throw new Error(error.message);
    }
    
    // The trigger will handle inserting into the profiles table.
    return data.user;
};

export const signIn = async (email: string, password?: string) => {
    if (!password) {
        throw new Error("Password is required for sign in.");
    }
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    
    if (error) {
        console.error("Sign in error:", error.message);
        throw new Error(error.message);
    }
    return data.session;
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error("Sign out error:", error.message);
        throw new Error(error.message);
    }
};

export const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
};

export const getSession = async () => {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        return session;
    } catch (error) {
        console.error("Error getting session, user might be logged out:", error);
        return null;
    }
};


// --- Profile Management Functions ---

export const getProfiles = async (): Promise<UserProfile[]> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, role, dni');

    if (error) {
        console.error('Error fetching profiles:', error);
        return [];
    }
    return data;
};

export const editProfile = async (profileId: string, profileData: UserProfileFormValues): Promise<UserProfile | null> => {
    const { data, error } = await supabase
        .from('profiles')
        .update({
            name: profileData.name,
            email: profileData.email.toLowerCase(),
            role: profileData.role,
            dni: profileData.dni,
        })
        .eq('id', profileId)
        .select()
        .single();
    if (error) {
        console.error('Error editing profile:', error);
        return null;
    }
    return data;
};

// Note: Deleting a user from auth cascade deletes their profile due to the foreign key constraint.
// This function is for deleting a user from the auth schema itself.
export const deleteProfile = async (userId: string): Promise<boolean> => {
     // This requires elevated privileges and should be handled with a Supabase Edge Function in a real-world scenario.
     // For this project, we assume the anon key has permissions, which is NOT secure for production.
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
        console.error('Error deleting user:', error);
        return false;
    }
    return true;
};
