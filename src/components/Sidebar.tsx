"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { 
  Home, 
  User, 
  Menu,
  Info,
  ChevronRight,
  PanelLeftClose
} from "lucide-react";

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { icon: Home, label: "홈", href: "/" },
    { icon: Info, label: "서비스 소개", href: "#" },
  ];

  const SidebarContent = ({ compact = false }: { compact?: boolean }) => (
    <>
      {/* Logo Section with Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className={`flex items-center gap-3 ${compact ? 'justify-center' : ''}`}>
          <Image
            src="/thoth_logo.png"
            alt="THOTH"
            width={40}
            height={40}
          />
          {!compact && (
            <div>
              <h2 className="font-bold text-lg">THOTH</h2>
            </div>
          )}
        </div>
        
        {/* Desktop Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden lg:flex h-8 w-8"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <PanelLeftClose className="h-4 w-4" />
        </Button>
      </div>

      <Separator className="mb-6" />

      {/* User Section */}
      <div className="mb-6">
        <div className={`flex items-center gap-3 p-3 rounded-lg bg-secondary ${compact ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          {!compact && (
            <div>
              <p className="text-sm font-medium">Guest</p>
              <p className="text-xs text-muted-foreground">방문자</p>
            </div>
          )}
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Navigation */}
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            onClick={() => setOpen(false)}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors group"
            title={compact ? item.label : undefined}
          >
            <div className={`flex items-center gap-3 ${compact ? 'justify-center w-full' : ''}`}>
              <item.icon className="h-5 w-5" />
              {!compact && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </div>
            {!compact && (
              <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-6">
        <Separator className="mb-6" />
        <div className={`text-center text-xs text-muted-foreground space-y-1 ${compact ? '' : ''}`}>
          <p className="flex items-center justify-center gap-1">
            {!compact && '© 2025 THOTH'}
          </p>
          {!compact && <p>Record wisdom from Modern videos</p>}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setOpen(!open)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-80 p-6">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col h-full">
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex fixed top-0 left-0 z-40 h-full bg-background border-r transition-all duration-300 ${
        isCollapsed ? '-translate-x-full' : 'translate-x-0'
      }`}>
        <div className="flex flex-col h-full p-6 w-64">
          <SidebarContent compact={false} />
        </div>
      </aside>

      {/* Floating Open Button - Only when sidebar is closed */}
      {isCollapsed && (
        <Button
          variant="outline"
          size="icon"
          className="hidden lg:flex fixed top-6 left-4 z-40 h-10 w-10 rounded-full shadow-lg"
          onClick={() => setIsCollapsed(false)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {/* Update main content padding */}
      <style jsx global>{`
        main {
          padding-left: ${isCollapsed ? '0' : '16rem'};
          transition: padding-left 0.3s;
        }
        @media (max-width: 1024px) {
          main {
            padding-left: 0 !important;
          }
        }
      `}</style>
    </>
  );
}