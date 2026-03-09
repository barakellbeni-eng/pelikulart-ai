import { useLocation } from "react-router-dom";
import { NavLink } from "react-router-dom";
import {
  Wand2,
  CreditCard,
  UserCircle,
  Image,
  Video,
  Music,
  Sparkles,
  Clapperboard,
  Aperture,
} from "lucide-react";
import pelikulartLogo from "@/assets/pelikulart-logo.png";
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
import ProjectsPanel from "@/components/ProjectsPanel";

const mainNav = [
  { title: "Accueil", url: "/studio", icon: Wand2 },
  { title: "Créer", url: "/studio/create", icon: Sparkles },
  { title: "Recharge", url: "/pricing", icon: CreditCard },
  { title: "Profil", url: "/profile", icon: UserCircle },
];

const creationTools = [
  { title: "Générer Image", url: "/studio/create?mode=image", icon: Image },
  { title: "Générer Vidéo", url: "/studio/create?mode=video", icon: Video },
  { title: "Générer Audio", url: "/studio/create?mode=audio", icon: Music },
  { title: "Multi-Plan", url: "/studio/multi-plan", icon: Clapperboard },
  { title: "Motion Control", url: "/studio/motion-control", icon: Aperture },
];


const AppSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (url: string) => {
    const fullCurrent = currentPath + location.search;
    if (url.includes("?")) return fullCurrent === url;
    return currentPath === url;
  };

  return (
    <Sidebar className="border-r border-sidebar-border">
      {/* Logo Header */}
      <SidebarHeader className="px-4 py-5">
        <NavLink to="/" className="flex items-center gap-2">
          <img src={pelikulartLogo} alt="Pelikulart" className="w-8 h-8 rounded-lg object-cover" />
          <div>
            <span className="text-sm font-bold tracking-tight text-sidebar-foreground">Pelikulart</span>
            <span className="text-sm font-bold tracking-tight text-primary"> AI</span>
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

        <SidebarSeparator />

        {/* Projects panel */}
        <SidebarGroup className="flex-1 min-h-0">
          <SidebarGroupContent className="h-full">
            <ProjectsPanel />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer avec crédits */}
      <SidebarFooter className="px-4 py-3" />
    </Sidebar>
  );
};

export default AppSidebar;
