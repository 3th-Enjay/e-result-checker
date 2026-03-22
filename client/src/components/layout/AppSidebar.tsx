import {
  Home,
  School,
  Users,
  GraduationCap,
  FileText,
  Key,
  BarChart3,
  Settings,
  BookOpen,
  ClipboardList,
  FileStack,
  Settings2,
  ChevronRight,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BrandMark } from "@/components/brand-mark";

interface User {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface AppSidebarProps {
  user: User | null;
}

export function AppSidebar({ user }: AppSidebarProps) {
  const [location] = useLocation();

  const superAdminItems = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "Schools", url: "/schools", icon: School },
    { title: "Users", url: "/users", icon: Users },
    { title: "PINs", url: "/pins", icon: Key },
    { title: "PIN Requests", url: "/pin-requests", icon: ClipboardList },
    { title: "Analytics", url: "/analytics", icon: BarChart3 },
  ];

  const schoolAdminItems = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "Students", url: "/students", icon: GraduationCap },
    { title: "Teachers", url: "/teachers", icon: Users },
    { title: "Classes", url: "/classes", icon: BookOpen },
    { title: "Subjects", url: "/subjects", icon: FileStack },
    { title: "Score Metrics", url: "/score-metrics", icon: Settings2 },
    { title: "Results", url: "/results", icon: FileText },
    { title: "PINs", url: "/pins", icon: Key },
    { title: "PIN Requests", url: "/pin-requests", icon: ClipboardList },
    { title: "Analytics", url: "/analytics", icon: BarChart3 },
  ];

  const teacherItems = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "My Students", url: "/students", icon: GraduationCap },
    { title: "Results", url: "/results", icon: FileText },
    { title: "Analytics", url: "/analytics", icon: BarChart3 },
  ];

  const menuItems =
    user?.role === "super_admin"
      ? superAdminItems
      : user?.role === "school_admin"
        ? schoolAdminItems
        : teacherItems;

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-primary/12 text-primary border-primary/10";
      case "school_admin":
        return "bg-chart-3/12 text-chart-3 border-chart-3/10";
      case "teacher":
        return "bg-chart-2/12 text-chart-2 border-chart-2/10";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "super_admin":
        return "Super Admin";
      case "school_admin":
        return "School Admin";
      case "teacher":
        return "Teacher";
      default:
        return role;
    }
  };

  return (
    <Sidebar variant="floating" collapsible="icon" className="p-3">
      <SidebarHeader className="gap-4 rounded-[1.5rem] border border-white/10 bg-sidebar/90 p-4 shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <BrandMark size="md" />
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <h2 className="truncate text-base font-semibold tracking-tight">SmartResult</h2>
            <p className="text-xs text-muted-foreground">Enterprise school operations</p>
          </div>
        </div>
        <div className="group-data-[collapsible=icon]:hidden">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-primary/12 via-transparent to-chart-2/12 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Trust Layer
            </p>
            <p className="mt-2 text-sm font-medium">Verified records, controlled approvals, and secure result access.</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="mt-3 gap-3 rounded-[1.5rem] border border-white/10 bg-sidebar/85 px-2 py-3 shadow-lg backdrop-blur-xl">
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      size="lg"
                      className="rounded-xl px-3 data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                      data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      <Link href={item.url}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto w-4 h-4 opacity-40 group-data-[collapsible=icon]:hidden" />
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="rounded-2xl border border-white/10 bg-background/75 p-3 text-sm shadow-sm group-data-[collapsible=icon]:hidden">
              <p className="font-medium">Few-click workflow</p>
              <p className="mt-1 text-muted-foreground">
                Upload, review, publish, and distribute results with a clean approval path.
              </p>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {user && (
        <SidebarFooter className="mt-3 rounded-[1.5rem] border border-white/10 bg-sidebar/90 p-3 shadow-lg backdrop-blur-xl">
          <Link href="/profile">
            <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-background/70 p-3 transition-colors hover:bg-background" data-testid="link-profile">
              <Avatar className="w-11 h-11 border border-white/10">
                <AvatarFallback className="bg-primary/12 text-primary text-sm font-semibold">
                  {user.firstName[0]}{user.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                <p className="truncate text-sm font-semibold">
                  {user.firstName} {user.lastName}
                </p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline" className={getRoleBadgeColor(user.role)} data-testid="badge-user-role">
                    {getRoleLabel(user.role)}
                  </Badge>
                  <Settings className="w-3 h-3 text-muted-foreground" />
                </div>
              </div>
            </div>
          </Link>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
