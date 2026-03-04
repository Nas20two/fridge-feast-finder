import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Home, BookOpen, ShoppingCart, CalendarDays, Library, LogIn, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/my-recipes", icon: BookOpen, label: "Recipes" },
  { path: "/grocery", icon: ShoppingCart, label: "Grocery" },
  { path: "/meal-plan", icon: CalendarDays, label: "Planner" },
  { path: "/cookbooks", icon: Library, label: "Cookbooks" },
];

const AppLayout = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 md:pl-64">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border bg-sidebar md:flex md:flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
          <span className="text-2xl">🧞</span>
          <h1 className="font-serif text-xl font-bold text-sidebar-foreground">Recipe Remix</h1>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                location.pathname === item.path
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-4">
          {user ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-3 py-1">
                <User className="h-4 w-4 text-sidebar-foreground/60" />
                <span className="truncate text-sm text-sidebar-foreground/80">{user.email}</span>
              </div>
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={signOut}>
                <LogOut className="h-4 w-4" /> Sign Out
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={() => navigate("/auth")}>
              <LogIn className="h-4 w-4" /> Sign In
            </Button>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Tabs */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-background md:hidden">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2 text-xs transition-colors",
              location.pathname === item.path ? "text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
