import {
    Gauge,
    Palette,
    Sparkles,
    Blocks,
    LayoutList,
    Package,
    LogOut,
    Settings,
    ShoppingBag,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

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
} from '@/components/ui/sidebar';
import { useAppContext } from '@/context/AppContext';

const homeItems = [
    { title: 'Dashboard', icon: Gauge, path: '/admin/dashboard' },
      
];

const websiteItems = [
    { title: 'Home Page', icon: LayoutList, path: '/admin/website/home-page' },
    { title: 'About Page', icon: LayoutList, path: '/admin/website/about-page' },
    { title: 'Community Page', icon: LayoutList, path: '/admin/website/community-page' },
    { title: 'Hero', icon: Sparkles, path: '/admin/hero' },
    { title: 'Features', icon: Blocks, path: '/admin/features' },
    { title: 'Categories', icon: LayoutList, path: '/admin/category' },
    { title: 'SubCategories', icon: LayoutList, path: '/admin/sub-category' },
    { title: 'GrandChilds', icon: LayoutList, path: '/admin/grand-child' },
    
]


const ProductFeatures=[
    { title: 'Size', icon: Palette, path: '/admin/size' },
    { title: 'Color', icon: Palette, path: '/admin/color' },
]

const inventoryItems = [
    { title: 'Products', icon: Package, path: '/admin/products' },
];

const orderItems = [
    { title: 'Orders', icon: ShoppingBag, path: '/admin/orders' },
];


const SettingsItems = [
    { title: 'Settings', icon: Settings, path: '/admin/settings' },
];




export function AppSidebar(props) {
        const isMenuItemActive = (path) => {
            return location.pathname === path || location.pathname.startsWith(`${path}/`);
        };

    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAppContext();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const isCustomer = user?.user_type === 'customer';

   
    

    const handleLogout = async () => {
        if (isLoggingOut) {
            return;
        }

        setIsLoggingOut(true);

        try {
            await fetch('/sanctum/csrf-cookie', {
                credentials: 'include',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            await fetch('/api/logout', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
        } finally {
            setIsLoggingOut(false);
            navigate('/admin');
        }
    };

    return (
        <Sidebar collapsible="icon" variant="sidebar" {...props}>
            <SidebarHeader className="border-b border-sidebar-border px-3 py-3">
                <div className="flex items-center gap-2 px-1">
                    <span className="inline-flex size-4 rounded-full border border-sidebar-foreground/60" />
                    <span className="text-sm font-semibold">1971co</span>
                </div>
            </SidebarHeader>

            <SidebarContent className="scrollbar-hidden py-3">
                {homeItems.length > 0 && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Home</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {homeItems.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            tooltip={item.title}
                                            isActive={isMenuItemActive(item.path)}
                                        >
                                            <Link to={item.path}>
                                                <item.icon className="size-4 shrink-0 text-sidebar-foreground" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}

                {/* location Management  */}
                 {!isCustomer && websiteItems.length > 0 && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Website Management</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {websiteItems.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            tooltip={item.title}
                                            isActive={isMenuItemActive(item.path)}
                                        >
                                            <Link to={item.path}>
                                                <item.icon className="size-4 shrink-0 text-sidebar-foreground" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}

                  {/* Product Features Management  */}
                 {!isCustomer && ProductFeatures.length > 0 && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Product Features Management</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {ProductFeatures.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            tooltip={item.title}
                                            isActive={isMenuItemActive(item.path)}
                                        >
                                            <Link to={item.path}>
                                                <item.icon className="size-4 shrink-0 text-sidebar-foreground" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}

              

                
                {orderItems.length > 0 && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Orders</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {orderItems.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            tooltip={item.title}
                                            isActive={isMenuItemActive(item.path)}
                                        >
                                            <Link to={item.path}>
                                                <item.icon className="size-4 shrink-0 text-sidebar-foreground" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}

                {!isCustomer && inventoryItems.length > 0 && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Inventory</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {inventoryItems.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            tooltip={item.title}
                                            isActive={isMenuItemActive(item.path)}
                                        >
                                            <Link to={item.path}>
                                                <item.icon className="size-4 shrink-0 text-sidebar-foreground" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}

                  {!isCustomer && SettingsItems.length > 0 && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Settings</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {SettingsItems.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            tooltip={item.title}
                                            isActive={isMenuItemActive(item.path)}
                                        >
                                            <Link to={item.path}>
                                                <item.icon className="size-4 shrink-0 text-sidebar-foreground" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}

            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton tooltip="Logout" onClick={handleLogout} disabled={isLoggingOut}>
                            <LogOut className="size-4 shrink-0 text-sidebar-foreground" />
                            <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}