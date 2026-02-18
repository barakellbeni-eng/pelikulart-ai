import { useLocation } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { Wand2, Users, CreditCard, UserCircle, Image, Video, Sparkles } from "lucide-react";
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

const mainNav = [
  { title: "Accueil", url: "/studio", icon: Wand2 },
  { title: "Créer", url: "/studio/create", icon: Sparkles },
  { title: "Communauté", url: "/community", icon: Users },
  { title: "Recharge", url: "/pricing", icon: CreditCard },
  { title: "Profil", url: "/profile", icon: UserCircle },
];

const creationTools = [
  { title: "Image IA", url: "/studio/create?mode=image", icon: Image },
  { title: "Vidéo IA", url: "/studio/create?mode=video", icon: Video },
  { title: "Cauris Boost", url: "/studio/create?boost=true", icon: Sparkles },
];

const AppSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (url: string) => {
    const basePath = url.split("?")[0];
    return currentPath === basePath;
  };

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="px-5 py-5">
        <NavLink to="/studio" className="font-display text-lg tracking-tight">
          <span className="text-gradient-primary">cauris</span>
          <span className="text-sidebar-foreground">.ai</span>
        </NavLink>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] tracking-[0.2em] uppercase text-sidebar-foreground/40 font-body">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <NavLink to={item.url} className="font-body">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] tracking-[0.2em] uppercase text-sidebar-foreground/40 font-body">
            Création
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {creationTools.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink to={item.url} className="font-body">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-4 py-3">
        <div className="bg-card border border-border rounded-lg px-3 py-2 flex items-center gap-2">
          <span className="text-xs font-medium text-primary font-body">cauris</span>
          <span className="text-[10px] text-muted-foreground ml-auto font-body">crédits</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
