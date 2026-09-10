"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronDown, Package, Grid3X3 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { type NavbarItem } from "@/services/navbar.service";
import { type Category } from "@/services/category.service";

interface NavigationBarProps {
  serverItems: NavbarItem[];
  serverCategories: Category[];
}

// HoverDropdown - opens on hover, closes on mouse leave with delay
function HoverDropdown({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 150);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {label}
      {open && (
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="absolute left-1/2 top-full -translate-x-1/2 pt-2"
        >
          <div className="min-w-[200px] rounded-lg border border-gray-100 bg-white p-2 shadow-xl">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

export default function NavigationBar({
  serverItems,
  serverCategories,
}: NavigationBarProps) {
  const navItems = serverItems;
  const categories = serverCategories;

  return (
    <nav
      className="sticky top-0 z-50 hidden border-b border-[#F1F5F9] bg-white lg:block"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex h-[60px] max-w-[1200px] items-center justify-between px-4">
        {/* Left: Categories Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex h-10 items-center gap-2.5 rounded-lg bg-[var(--color-primary)] px-5 font-semibold text-white transition-all hover:bg-[var(--color-primary)]"
              aria-label="Browse categories"
            >
              <Grid3X3 className="h-4 w-4" aria-hidden="true" />
              <span>Categories</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-[240px] border border-gray-100 p-2 shadow-xl max-h-[400px] overflow-y-auto"
            role="menu"
            aria-label="Categories menu"
          >
            {categories.length > 0
              ? categories.map((cat) => (
                  <DropdownMenuItem key={cat.slug} asChild>
                    <Link
                      href={`/category/${cat.slug}`}
                      className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-[#374151] transition-colors hover:bg-[#F0FDF4] hover:text-[var(--color-primary)]"
                      role="menuitem"
                    >
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-100 overflow-hidden" aria-hidden="true">
                        {cat.image ? <img src={cat.image} alt={cat.name} className="h-full w-full object-cover" /> : <span className="text-xs text-gray-500">{cat.name.charAt(0)}</span>}
                      </span>
                      <span>{cat.name}</span>
                    </Link>
                  </DropdownMenuItem>
                ))
              : ["Electronics", "Clothing", "Home & Kitchen", "Sports", "Books", "Toys"].map(
                  (name) => (
                    <DropdownMenuItem key={name} asChild>
                      <Link
                        href={`/category/${name.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-")}`}
                        className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-[#374151] transition-colors hover:bg-[#F0FDF4] hover:text-[var(--color-primary)]"
                        role="menuitem"
                      >
                        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-100 text-xs text-gray-500" aria-hidden="true">
                          {name.charAt(0)}
                        </span>
                        <span>{name}</span>
                      </Link>
                    </DropdownMenuItem>
                  )
                )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/categories"
                className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-[var(--color-primary)] transition-colors hover:bg-[#F0FDF4]"
                role="menuitem"
              >
                <Grid3X3 className="h-4 w-4" aria-hidden="true" />
                <span>Browse All Categories</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Center: Nav Links - Hover dropdown */}
        <ul className="flex items-center gap-10">
          {navItems.map((item) => {
            const hasChildren = item.children && item.children.length > 0;

            if (!hasChildren) {
              return (
                <li key={item.id}>
                  <Link
                    href={item.url || "/"}
                    className="text-[15px] font-medium text-[#111827] transition-colors hover:text-[var(--color-primary)]"
                  >
                    {item.name}
                  </Link>
                </li>
              );
            }

            return (
              <li key={item.id}>
                <HoverDropdown
                  label={
                    <button
                      className="group flex cursor-pointer items-center gap-1 text-[15px] font-medium text-[#111827] transition-colors hover:text-[var(--color-primary)] focus:outline-none"
                      aria-expanded="false"
                      aria-haspopup="menu"
                    >
                      {item.name}
                      <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180 group-hover:text-[var(--color-primary)]" aria-hidden="true" />
                    </button>
                  }
                >
                  {item.children.map((child) => (
                    <Link
                      key={child.id}
                      href={`/subnavbar/${child.slug}`}
                      className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-[#374151] transition-colors hover:bg-[#F0FDF4] hover:text-[var(--color-primary)]"
                    >
                      {child.icon && (
                        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-100 text-xs text-gray-500" aria-hidden="true">
                          <i className={child.icon} aria-hidden="true" />
                        </span>
                      )}
                      <span>{child.name}</span>
                    </Link>
                  ))}
                </HoverDropdown>
              </li>
            );
          })}
        </ul>

        {/* Right: Track Order - Hover dropdown */}
        <HoverDropdown
          label={
            <button
              className="flex cursor-pointer items-center gap-2 font-medium text-[#111827] transition-colors hover:text-[var(--color-primary)]"
              aria-label="Track order options"
              aria-expanded="false"
              aria-haspopup="menu"
            >
              <Package className="h-4 w-4" aria-hidden="true" />
              <span>Track Order</span>
              <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          }
        >
          <Link
            href="/order-status"
            className="flex cursor-pointer items-center rounded-md px-3 py-2 text-sm font-medium text-[#374151] transition-colors hover:bg-[#F0FDF4] hover:text-[var(--color-primary)]"
          >
            Order Status
          </Link>
          <Link
            href="/shipping-info"
            className="flex cursor-pointer items-center rounded-md px-3 py-2 text-sm font-medium text-[#374151] transition-colors hover:bg-[#F0FDF4] hover:text-[var(--color-primary)]"
          >
            Shipping Info
          </Link>
          <Link
            href="/returns"
            className="flex cursor-pointer items-center rounded-md px-3 py-2 text-sm font-medium text-[#374151] transition-colors hover:bg-[#F0FDF4] hover:text-[var(--color-primary)]"
          >
            Returns
          </Link>
        </HoverDropdown>
      </div>
    </nav>
  );
}