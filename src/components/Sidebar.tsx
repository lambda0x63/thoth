"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { 
  Home, 
  User, 
  Menu,
  Info,
  ChevronRight,
  BookOpen,
  PanelLeftClose,
  PanelLeft
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
      {/* Logo Section */}
      <div className={`flex items-center gap-3 mb-6 ${compact ? 'justify-center' : ''}`}>
        <Image
          src="/thoth_logo.png"
          alt="THOTH"
          width={40}
          height={40}
        />
        {!compact && (
          <div>
            <h2 className="font-bold text-lg">THOTH</h2>
            <p className="text-xs text-muted-foreground">지혜의 서기</p>
          </div>
        )}
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
            <BookOpen className="h-3 w-3" />
            {!compact && '© 2024 THOTH'}
          </p>
          {!compact && <p>Ancient wisdom, Modern videos</p>}
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
        isCollapsed ? 'w-20' : 'w-64'
      }`}>
        <div className="flex flex-col h-full p-6 relative">
          {/* Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute -right-4 top-6 z-50 h-8 w-8 rounded-full border bg-background shadow-md"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>
          
          <SidebarContent compact={isCollapsed} />
        </div>
      </aside>

      {/* Update main content padding */}
      <style jsx global>{`
        main {
          padding-left: ${isCollapsed ? '5rem' : '16rem'};
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