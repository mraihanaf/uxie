"use client";

import { getSupabaseClient } from "./client";

export async function signUp(
    email: string,
    password: string,
    fullName?: string,
) {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
            },
        },
    });

    if (error) {
        throw error;
    }

    return data;
}

export async function signIn(email: string, password: string) {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        throw error;
    }

    return data;
}

export async function signInWithGoogle() {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: `${window.location.origin}/auth/callback`,
        },
    });

    if (error) {
        throw error;
    }

    return data;
}

export async function signOut() {
    const supabase = getSupabaseClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
        throw error;
    }
}

export async function resetPassword(email: string) {
    const supabase = getSupabaseClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
        throw error;
    }
}
