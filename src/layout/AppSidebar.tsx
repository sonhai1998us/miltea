"use client";
import React, { useState, useCallback, useEffect, useMemo } from "react";

import { useSelector } from 'react-redux';
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
  // BoxCubeIcon,
  // CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  // ListIcon,
  // PageIcon,
  // PieChartIcon,
  // PlugInIcon,
  // TableIcon,
  // UserCircleIcon,
} from "../icons/index";
import SidebarWidget from "./SidebarWidget";
import clsx from "clsx";
import { RootState } from "@/store/store";

// Types
type SubItem = { name: string; path: string; pro?: boolean; new?: boolean };
type NavItem = { name: string; icon: React.ReactNode; path?: string; subItems?: SubItem[] };
type MenuType = "main" | "others";

// Memoized navigation items

interface MenuItem {
  icon: string;
  title: string;
  items?: {
    [key: string]: {
      title: string;
      module?: string;
    };
  };
}

interface TransformedMenuItem {
  icon: React.ReactNode;
  name: string;
  path?: string;
  subItems?: {
    name: string;
    path: string;
  }[];
}

interface IconMap {
  [key: string]: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const useNavItems =  () => {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const menus: MenuItem[] = permissions != null ? JSON.parse(permissions) : [];
  let result: TransformedMenuItem[] = [];

  if(menus.length > 0){
    const iconMap: IconMap = {
      "fa-box": GridIcon,
    };

    result = menus.map((item: MenuItem) => {
      const IconComponent = iconMap[item.icon.trim()] || GridIcon; // mặc định nếu icon không map được
    
      const transformed: TransformedMenuItem = {
        icon: <IconComponent />,
        name: item.title,
      };
    
      if (item.items && Object.keys(item.items).length > 0) {
        transformed.subItems = Object.values(item.items).map(subItem => ({
          name: subItem.title,
          path: `/${subItem.module || subItem.title.toLowerCase().replace(/\s+/g, "-")}`,
        }));
      } else {
        transformed.path = `/${item.title.toLowerCase().replace(/\s+/g, "-")}`;
      }
    
      return transformed;
    });
    
  }
  return useMemo(() => ({
    main: result,
  }), [result]);
};

// Logo Component
const Logo = React.memo(({ isSidebarOpen }: { isSidebarOpen: boolean }) => (
  <div className={clsx("py-8 flex", !isSidebarOpen ? "lg:justify-center" : "justify-start")}>
    <Link href="/">
      <Image
        src={isSidebarOpen ? "/images/logo/logo.svg" : "/images/logo/logo-icon.svg"}
        alt="Logo"
        width={isSidebarOpen ? 150 : 32}
        height={isSidebarOpen ? 40 : 32}
        className={clsx(isSidebarOpen ? "dark:hidden" : "")}
      />
      {isSidebarOpen && (
        <Image src="/images/logo/logo-dark.svg" alt="Logo" width={150} height={40} className="hidden dark:block" />
      )}
    </Link>
  </div>
));
Logo.displayName = 'Logo';

// Menu Item Component
const MenuItem = React.memo(({ 
  item, 
  isActive, 
  isSubmenuOpen, 
  isSidebarOpen, 
  onToggle 
}: { 
  item: NavItem;
  isActive: (path: string) => boolean;
  isSubmenuOpen: boolean;
  isSidebarOpen: boolean;
  onToggle: () => void;
}) => {
  if (item.subItems) {
    return (
      <button
        onClick={onToggle}
        className={clsx(
          `menu-item flex items-center w-full cursor-pointer ${item?.path ? item.path : ""}`,
          isSubmenuOpen ? "menu-item-active" : "menu-item-inactive",
          !isSidebarOpen ? "lg:justify-center" : "lg:justify-start"
        )}
        aria-expanded={isSubmenuOpen}
      >
        <span className={clsx(isSubmenuOpen ? "menu-item-icon-active" : "menu-item-icon-inactive")}>{item.icon}</span>
        {isSidebarOpen && <span className="menu-item-text flex-1 text-left">{item.name}</span>}
        {isSidebarOpen && (
          <ChevronDownIcon
            className={clsx("ml-auto w-5 h-5 transition-transform duration-200", isSubmenuOpen && "rotate-180 text-brand-500")}
          />
        )}
      </button>
    );
  }

  return item.path ? (
    <Link
      href={"/admin"+item.path}
      className={clsx("menu-item flex items-center", isActive("/admin"+item.path) ? "menu-item-active" : "menu-item-inactive")}
    >
      <span className={clsx(isActive("/admin"+item.path) ? "menu-item-icon-active" : "menu-item-icon-inactive")}>{item.icon}</span>
      {isSidebarOpen && <span className="menu-item-text">{item.name}</span>}
    </Link>
  ) : null;
});
MenuItem.displayName = 'MenuItem';

// Submenu Component
const Submenu = React.memo(({ 
  items, 
  isActive, 
  isOpen 
}: { 
  items: SubItem[]; 
  isActive: (path: string) => boolean;
  isOpen: boolean;
}) => (
  <ul className={clsx("ml-9 mt-2 space-y-1 transition-all duration-300 overflow-hidden", isOpen ? "max-h-96" : "max-h-0")}>
    {items.map((subItem) => (
      <li key={subItem.name}>
        <Link
          href={"/admin"+subItem.path}
          className={clsx(
            "menu-dropdown-item flex items-center",
            isActive("/admin"+subItem.path) ? "menu-dropdown-item-active" : "menu-dropdown-item-inactive"
          )}
        >
          {subItem.name}
          <span className="flex items-center gap-1 ml-auto">
            {subItem.new && (
              <span
                className={clsx(
                  "menu-dropdown-badge",
                  isActive("/admin"+subItem.path) ? "menu-dropdown-badge-active" : "menu-dropdown-badge-inactive"
                )}
              >
                new
              </span>
            )}
            {subItem.pro && (
              <span
                className={clsx(
                  "menu-dropdown-badge",
                  isActive("/admin"+subItem.path) ? "menu-dropdown-badge-active" : "menu-dropdown-badge-inactive"
                )}
              >
                pro
              </span>
            )}
          </span>
        </Link>
      </li>
    ))}
  </ul>
));
Submenu.displayName = 'Submenu';

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const [openSubmenu, setOpenSubmenu] = useState<{ type: MenuType; index: number } | null>(null);
  const [status, setStatus] = useState(false);
  const isActive = useCallback((path: string) => path === pathname, [pathname]);
  const isSidebarOpen = isExpanded || isHovered || isMobileOpen;
  const navItems = useNavItems();
  // Memoized path to submenu mapping
  const pathToSubmenu = useMemo(() => {
    const map: Record<string, { type: MenuType; index: number }> = {};
    Object.entries(navItems).forEach(([menuType, items]) => {
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            map["/admin"+subItem.path] = { type: menuType as MenuType, index };
          });
        }
      });
    });
    return map;
  }, [navItems]);
  useEffect(() => {
    const currentSubmenu = pathToSubmenu[pathname];
    if (currentSubmenu && (!openSubmenu || 
        currentSubmenu.type !== openSubmenu.type || 
        currentSubmenu.index !== openSubmenu.index) && status == false) {  
      setStatus(true)
      setOpenSubmenu(currentSubmenu);
    }
  }, [pathname, pathToSubmenu, openSubmenu]);

  const handleSubmenuToggle = useCallback((index: number, menuType: MenuType) => {
    setOpenSubmenu((prev) => (prev?.type === menuType && prev.index === index ? null : { type: menuType, index }));
  }, []);

  const renderMenuItems = useCallback((items: NavItem[], menuType: MenuType) => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => {
        const isSubmenuOpen = openSubmenu?.type === menuType && openSubmenu?.index === index;
        return (
          <li key={nav.name}>
            <MenuItem
              item={nav}
              isActive={isActive}
              isSubmenuOpen={isSubmenuOpen}
              isSidebarOpen={isSidebarOpen}
              onToggle={() => handleSubmenuToggle(index, menuType)}
            />
            {nav.subItems && isSidebarOpen && (
              <Submenu
                items={nav.subItems}
                isActive={isActive}
                isOpen={isSubmenuOpen}
              />
            )}
          </li>
        );
      })}
    </ul>
  ), [isActive, isSidebarOpen, openSubmenu, handleSubmenuToggle]);

  return (
    <aside
      className={clsx(
        "fixed top-0 left-0 z-50 flex flex-col h-screen bg-white dark:bg-gray-900 text-gray-900 border-r border-gray-200 transition-all duration-300 ease-in-out",
        isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]",
        isMobileOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0 dark:border-gray-800 px-5"
      )}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Logo isSidebarOpen={isSidebarOpen} />
      <div className="flex flex-col overflow-y-auto no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={clsx(
                  "mb-4 text-xs uppercase flex leading-[20px] text-gray-400",
                  !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                )}
              >
                {isSidebarOpen ? "Menu" : <HorizontaLDots />}
              </h2>
              {renderMenuItems(navItems.main, "main")}
            </div>
            <div>
              <h2
                className={clsx(
                  "mb-4 text-xs uppercase flex leading-[20px] text-gray-400",
                  !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                )}
              >
                {isSidebarOpen ? "" : <HorizontaLDots />}
              </h2>
              {/* {renderMenuItems(navItems.others, "others")} */}
            </div>
          </div>
        </nav>
        {isSidebarOpen && <SidebarWidget />}
      </div>
    </aside>
  );
};

export default AppSidebar;