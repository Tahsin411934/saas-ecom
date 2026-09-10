"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { User, LogOut, Shield, Truck, LogIn, LayoutDashboard } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { clearUser } from "@/lib/features/auth/authSlice";
import { logoutUserAction } from "@/app/actions/auth";

export default function AccountDropdown() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleLogout = async () => {
    const result = await logoutUserAction();
    dispatch(clearUser());
    if (result.success) {
      toast.success("Logged out successfully");
      setTimeout(() => router.push("/"), 500);
    } else {
      router.push("/");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex flex-col items-center gap-1 text-[#111827] hover:text-[var(--color-primary)] transition-colors">
          <User className="h-5 w-5" />
          <span className="text-xs font-medium">Account</span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[200px] border border-gray-100 p-2 shadow-xl">
        {isAuthenticated && user ? (
          <>
            <div className="px-3 py-2 border-b border-gray-100 mb-1">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
            <DropdownMenuItem asChild>
              <Link
                href="/profile"
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-[#F0FDF4] hover:text-[var(--color-primary)]"
              >
                <User className="h-4 w-4" />
                <span>My Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/orders"
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-[#F0FDF4] hover:text-[var(--color-primary)]"
              >
                <Truck className="h-4 w-4" />
                <span>My Orders</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/dashboard"
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-[#F0FDF4] hover:text-[var(--color-primary)]"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <button
                onClick={handleLogout}
                className="flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem asChild>
              <Link
                href="/login"
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-[var(--color-primary)] hover:bg-[#F0FDF4]"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/register"
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-[#F0FDF4] hover:text-[var(--color-primary)]"
              >
                <Shield className="h-4 w-4" />
                <span>Create Account</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}