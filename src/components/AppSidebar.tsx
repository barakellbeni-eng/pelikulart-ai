import { useLocation } from "react-router-dom";
import { NavLink } from "react-router-dom";
import {
  Wand2,
  Users,
  CreditCard,
  UserCircle,
  Image,
  Video,
  Sparkles,
  Zap,
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

const mainNav = [
  { title: "Accueil", url: "/studio", icon: Wand2 },
  { title: "Créer", url: "/studio/create", icon: Sparkles },
  { title: "Communauté", url: "/community", icon: Users },
  { title: "Recharge", url: "/pricing", icon: CreditCard },
  { title: "Profil", url: "/profile", icon: UserCircle },
];

const creationTools = [
  { title: "Générer Image", url: "/studio/create?mode=image", icon: Image },
  { title: "Générer Vidéo", url: "/studio/create?mode=video", icon: Video },
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
      {/* Logo Header */}
      <SidebarHeader className="px-4 py-5">
        <NavLink to="/studio" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-destructive flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-gradient-primary">cauris</span>
            <span className="text-sm font-bold tracking-tight text-sidebar-foreground">.ai</span>
          </div>
        </NavLink>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        {/* Navigation principale */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-sidebar-foreground/50">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <NavLink to={item.url}>
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

        {/* Outils de création */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-sidebar-foreground/50">
            Création IA
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {creationTools.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                  >
                    <NavLink to={item.url}>
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

      {/* Footer avec crédits */}
      <SidebarFooter className="px-4 py-3">
        <div className="glass rounded-xl px-3 py-2 flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-primary">Cauris 🐚</span>
          <span className="text-[10px] text-muted-foreground ml-auto">crédits</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
