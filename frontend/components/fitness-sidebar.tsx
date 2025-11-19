"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Home,
  Dumbbell,
  Apple,
  ShoppingBag,
  User,
  LogIn,
  LogOut,
  UserPlus,
  Zap,
  Settings,
} from "lucide-react";

// Menu items for your fitness app
const navigationItems = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Workout",
    url: "/workout",
    icon: Dumbbell,
  },
  {
    title: "Calorie",
    url: "/calorie",
    icon: Apple,
  },
  {
    title: "Shop",
    url: "/shop",
    icon: ShoppingBag,
  },
];

export function FitnessAppSidebar() {
  const pathname = usePathname();
  const { isSignedIn, user } = useUser();
  const { signOut, openSignIn } = useClerk();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex items-center justify-center w-8 h-8 bg-purple-600 rounded-lg">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-purple-600">NutriCal</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Profile link - only show if signed in */}
              {isSignedIn && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/profile"}>
                    <Link href="/profile">
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Authentication Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isSignedIn ? (
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => signOut()}>
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => openSignIn()}>
                      <LogIn className="w-4 h-4" />
                      <span>Sign In</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/sign-up">
                        <UserPlus className="w-4 h-4" />
                        <span>Sign Up</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="flex items-center justify-between px-2 py-2">
              <div className="flex items-center gap-2 text-sm text-sidebar-foreground">
                <Settings className="w-4 h-4" />
                <span>Theme</span>
              </div>
              <ThemeToggle />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {isSignedIn && user ? (
          <div className="px-2 py-2">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-sidebar-accent">
              <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full">
                <User className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-accent-foreground truncate">
                  {user.firstName || "User"}
                </p>
                <p className="text-xs text-sidebar-accent-foreground/70 truncate">
                  {user.emailAddresses[0]?.emailAddress}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-2 py-2 text-xs text-muted-foreground text-center">
            Sign in to access all features
          </div>
        )}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
