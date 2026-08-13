// Modified to support both Lovable environment and custom Vercel deployments
import { createLovableAuth } from "@lovable.dev/cloud-auth-js";
import { supabase } from "../supabase/client";

const lovableAuth = typeof window !== "undefined" && 
  (window.location.hostname.endsWith(".lovable.app") || window.location.hostname.endsWith(".lovable.dev") || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? createLovableAuth()
    : null;

type SignInOptions = {
  redirect_uri?: string;
  extraParams?: Record<string, string>;
};

export const lovable = {
  auth: {
    signInWithOAuth: async (provider: "google" | "apple" | "microsoft", opts?: SignInOptions) => {
      // If we are running on Vercel or custom domain, use Supabase OAuth directly
      if (!lovableAuth) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: opts?.redirect_uri || window.location.origin,
            queryParams: opts?.extraParams,
          },
        });
        if (error) return { error };
        return { redirected: true, error: null };
      }

      // Otherwise fallback to Lovable cloud auth inside sandbox
      const result = await lovableAuth.signInWithOAuth(provider, {
        redirect_uri: opts?.redirect_uri,
        extraParams: {
          ...opts?.extraParams,
        },
      });

      if (result.redirected) {
        return result;
      }

      if (result.error) {
        return result;
      }

      try {
        await supabase.auth.setSession(result.tokens);
      } catch (e) {
        return { error: e instanceof Error ? e : new Error(String(e)) };
      }
      return result;
    },
  },
};
