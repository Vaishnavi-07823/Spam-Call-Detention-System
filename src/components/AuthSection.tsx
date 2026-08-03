/**
 * AuthSection — Google sign-in / user profile + sign-out for Settings page.
 */
import { LogIn, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";

export function AuthSection() {
  const { user, loading, signOut } = useAuth();

  const handleGoogleSignIn = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });

    if (result.error) {
      console.error("Sign-in error:", result.error);
    }
  };

  if (loading) {
    return (
      <Card className="border-border/50 bg-card/50">
        <CardContent className="flex items-center justify-center p-6">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="border-border/50 bg-card/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Sign In</h3>
              <p className="text-xs text-muted-foreground">
                Sign in to save your settings and history
              </p>
            </div>
          </div>
          <Button
            onClick={handleGoogleSignIn}
            className="w-full gap-2"
            variant="outline"
          >
            <LogIn className="h-4 w-4" />
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    );
  }

  const initials = user.user_metadata?.full_name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "U";

  return (
    <Card className="border-border/50 bg-card/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Avatar>
            {user.user_metadata?.avatar_url && (
              <AvatarImage
                src={user.user_metadata.avatar_url}
                alt={user.user_metadata?.full_name ?? "User"}
              />
            )}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold truncate">
              {user.user_metadata?.full_name ?? "User"}
            </h3>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </div>
        <Button
          onClick={signOut}
          variant="outline"
          className="mt-3 w-full gap-2 text-destructive hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </CardContent>
    </Card>
  );
}
