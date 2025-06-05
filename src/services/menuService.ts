// import { GridIcon, CalenderIcon, UserCircleIcon, ListIcon, TableIcon, PageIcon, PieChartIcon, BoxCubeIcon, PlugInIcon } from '../icons';
import React from 'react';

// Define icon component type
// type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;

// Map icon names to actual components
// const iconMap: Record<string, IconComponent> = {
//   GridIcon,
//   CalenderIcon,
//   UserCircleIcon,
//   ListIcon,
//   TableIcon,
//   PageIcon,
//   PieChartIcon,
//   BoxCubeIcon,
//   PlugInIcon,
// };

export interface SubMenuItem {
  name: string;
  path: string;
  pro?: boolean;
  new?: boolean;
}

export interface MenuItem {
  name: string;
  icon: string;
  path?: string;
  subItems?: SubMenuItem[];
}

export interface TransformedMenuItem {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: SubMenuItem[];
}

export interface MenuData {
  main: MenuItem[];
  others: MenuItem[];
}

export interface TransformedMenuData {
  main: TransformedMenuItem[];
  others: TransformedMenuItem[];
}