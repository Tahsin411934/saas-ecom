"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Heart, ShoppingCart, Menu, X, PackagePlus, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import SearchOverlay from "./SearchOverlay";
import RequestProductModal from "@/components/product/RequestProductModal";
import AccountDropdown from "@/components/auth/AccountDropdown";
import { type Category } from "@/types/category";
import { type Settings } from "./NavbarServer";
import { normalizeAssetUrl } from "@/lib/asset-url";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setUser, fetchCurrentUser } from "@/lib/features/auth/authSlice";
import { selectCartCount, toggleCart } from "@/lib/features/cart/cartSlice";
import { fetchWishlistItems, selectWishlistCount } from "@/lib/features/wishlist/wishlistSlice";

const MOBILE_SEARCH_MEDIA_QUERY = "(max-width: 1023px)";

interface MainHeaderProps {
  serverCategories: Category[];
  serverSettings?: Settings;
  serverUser?: any;
}

export default function MainHeader({ serverCategories, serverSettings, serverUser }: MainHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const cartCount = useAppSelector(selectCartCount);
  const wishlistCount = useAppSelector(selectWishlistCount);
  const pathname = usePathname();

  // Sync server user to Redux on initial load (SSR)
  useEffect(() => {
    if (serverUser) {
      dispatch(setUser(serverUser));
    }
  }, [dispatch, serverUser]);

  // Re-fetch user on client-side navigation (e.g., after login redirect)
  useEffect(() => {
    if (!serverUser && !user) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch wishlist items when user is available
  useEffect(() => {
    if (user) {
      dispatch(fetchWishlistItems());
    }
  }, [dispatch, user]);

  // Keyboard shortcut: Cmd/Ctrl + K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        desktopInputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Only the visible search overlay should handle outside clicks and searches.
  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_SEARCH_MEDIA_QUERY);
    const updateViewport = () => setIsMobileViewport(mediaQuery.matches);

    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);
    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  // Focus mobile search input when search opens on mobile
  useEffect(() => {
    if (searchOpen) {
      const timer = setTimeout(() => {
        mobileInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [searchOpen]);

  const displayCategories = serverCategories.length > 0
    ? serverCategories
    : ["Electronics", "Clothing", "Home & Kitchen", "Sports", "Books", "Toys"].map((name, i) => ({
        id: i + 1, name,
        slug: name.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-"),
        status: "active" as const,
      }));

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery("");
  }, []);

  return (
    <div className="border-b border-gray-100 shadow-xl">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-0.5 shrink-0">
          {serverSettings?.site_logo ? (
            <img src={normalizeAssetUrl(serverSettings.site_logo)} alt={serverSettings.site_name || "OneHaatbd"} className="h-10 w-auto object-contain" />
          ) : (
            <>
              <span className="text-[30px] font-bold tracking-tight text-[#111827]">
                {serverSettings?.site_name || "OneHaatbd"}
              </span>
              <span className="text-[38px] font-bold text-[var(--color-primary)]">.</span>
            </>
          )}
        </Link>

        {/* Search Bar - Desktop */}
        <div className="relative hidden flex-1 items-center justify-center px-6 lg:flex">
          <div className="relative flex h-10 flex-1 max-w-[550px]">
            <input
              ref={desktopInputRef}
              type="text"
              value={searchQuery}
              onPointerDown={(e) => e.stopPropagation()}
              onChange={(e) => { setSearchQuery(e.target.value); if (!searchOpen) setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search for products..."
              className="h-full w-full rounded-lg border border-[#E5E7EB] bg-white pl-4 pr-[60px] text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-300 focus:outline-none"
            />
            <div className="absolute right-0 top-0 flex h-full items-center gap-1.5 pr-2">
              <kbd className="hidden rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[11px] text-gray-400 sm:inline-block">⌘K</kbd>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--color-primary)] text-white">
                <Search className="h-4 w-4" />
              </div>
            </div>
            <SearchOverlay
              query={searchQuery}
              onQueryChange={setSearchQuery}
              onClose={closeSearch}
              isOpen={searchOpen && !isMobileViewport}
              inputRef={desktopInputRef}
            />
          </div>
        </div>

        {/* Right Actions - Desktop */}
        <div className="hidden items-center gap-8 lg:flex">
          <button
            onClick={() => setRequestModalOpen(true)}
            className="flex flex-col items-center gap-1 text-[#111827] hover:text-[var(--color-primary)] transition-colors"
          >
            <PackagePlus className="h-5 w-5" />
            <span className="text-xs font-medium">Request</span>
          </button>

          <Link
            href="/wishlist"
            className="relative flex flex-col items-center gap-1 text-[#111827] hover:text-[var(--color-primary)] transition-colors"
          >
            <Heart className="h-5 w-5" />
            <span className="text-xs font-medium">Wishlist</span>
            {wishlistCount > 0 && (
              <Badge className="absolute -top-1.5 -right-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-primary)] p-0 text-[10px] font-bold text-white">
                {wishlistCount > 99 ? "99+" : wishlistCount}
              </Badge>
            )}
          </Link>

          <button
            onClick={() => dispatch(toggleCart())}
            className="relative flex flex-col items-center gap-1 text-[#111827] hover:text-[var(--color-primary)] transition-colors"
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="text-xs font-medium">Cart</span>
            {cartCount > 0 && (
              <Badge className="absolute -top-1.5 -right-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-primary)] p-0 text-[10px] font-bold text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </Badge>
            )}
          </button>

          <AccountDropdown />
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-3 lg:hidden">
          <button
            onClick={() => {
              setSearchOpen((prev) => !prev);
              if (!searchOpen) setSearchQuery("");
            }}
            className="text-[#111827]"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
          <button onClick={() => dispatch(toggleCart())} className="relative text-[#111827]">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <Badge className="absolute -top-2 -right-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-primary)] p-0 text-[9px] font-bold text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </Badge>
            )}
          </button>
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-[#111827]">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] p-0">
              <div className="flex items-center justify-between border-b px-6 py-4">
                <span className="text-xl font-bold">Menu</span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-gray-400">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-col gap-2 p-6">
                {displayCategories.length > 0 && (
                  <div className="mb-2">
                    <p className="px-3 py-2 text-sm font-semibold">Categories</p>
                    <div className="ml-2 flex flex-col gap-1 border-l-2 border-[#E5E7EB] pl-3">
                      {displayCategories.map((cat) => (
                        <Link
                          key={cat.slug}
                          href={`/category/${cat.slug}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-[#F0FDF4] hover:text-[var(--color-primary)]"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                <hr className="my-2 border-gray-100" />
                <div className="flex flex-col gap-2">
                  <Link href="/wishlist" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-[#F8FAFC]">
                    <Heart className="h-5 w-5" /> Wishlist
                  </Link>
                  <Link href="/cart" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-[#F8FAFC]">
                    <ShoppingCart className="h-5 w-5" /> Cart
                  </Link>
                  <button onClick={() => { setMobileMenuOpen(false); setRequestModalOpen(true); }} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-[#F8FAFC]">
                    <PackagePlus className="h-5 w-5" /> Request a Product
                  </button>
                  {isAuthenticated ? (
                    <>
                      <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-[#F8FAFC]">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        My Profile
                      </Link>
                      <Link href="/orders" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-[#F8FAFC]">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        My Orders
                      </Link>
                      <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-[#F8FAFC]">
                        <LayoutDashboard className="h-5 w-5" />
                        Dashboard
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--color-primary)] hover:bg-[#F0FDF4]">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                        Sign In
                      </Link>
                      <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-[#F8FAFC]">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                        Create Account
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {searchOpen && (
        <div className="relative border-t border-gray-100 bg-white px-4 py-3 lg:hidden">
          <div className="relative flex h-10 w-full">
            <input
              ref={mobileInputRef}
              type="text"
              value={searchQuery}
              onPointerDown={(e) => e.stopPropagation()}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products..."
              className="h-full w-full rounded-lg border border-[#E5E7EB] bg-white pl-4 pr-[60px] text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-300 focus:outline-none"
            />
            <div className="absolute right-0 top-0 flex h-full items-center gap-1.5 pr-2">
              <button
                onClick={closeSearch}
                className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:text-gray-600"
                aria-label="Close search"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--color-primary)] text-white">
                <Search className="h-4 w-4" />
              </div>
            </div>
            <SearchOverlay
              query={searchQuery}
              onQueryChange={setSearchQuery}
              onClose={closeSearch}
              isOpen={searchOpen && isMobileViewport}
              inputRef={mobileInputRef}
            />
          </div>
        </div>
      )}

      <RequestProductModal isOpen={requestModalOpen} onClose={() => setRequestModalOpen(false)} />
    </div>
  );
}
