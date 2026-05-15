import {
  AlarmClock,
  BadgeCheck,
  Bell,
  BriefcaseBusiness,
  Building2,
  Camera,
  CircleDollarSign,
  Code2,
  Cpu,
    PlusCircle,
    ShieldCheck,
  Droplets,
  Flame,
  Hammer,
  Home,
  Lightbulb,
  Lock,
  Monitor,
  Palette,
  Paintbrush,
  PhoneCall,
  Plug,
  Settings,
  Shield,
  ShoppingCart,
  Sparkles,
  Tv,
  Wind,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  AlarmClock,
  BadgeCheck,
  Bell,
  BriefcaseBusiness,
  Building2,
  Camera,
  CircleDollarSign,
  Code2,
  Cpu,
    PlusCircle,
    ShieldCheck,
  Droplets,
  Flame,
  Hammer,
  Home,
  Lightbulb,
  Lock,
  Monitor,
  Palette,
  Paintbrush,
  PhoneCall,
  Plug,
  Settings,
  Shield,
  ShoppingCart,
  Sparkles,
  Tv,
  Wind,
  Wrench,
  Zap,
};

export const SERVICE_ICON_OPTIONS = Object.keys(iconMap) as Array<keyof typeof iconMap>;

export function ServiceIcon({
  name,
  className,
}: {
  name?: string | null;
  className?: string;
}) {
  const Icon = (name ? iconMap[name] : null) ?? BriefcaseBusiness;

  return <Icon className={className} />;
}
