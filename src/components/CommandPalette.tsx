"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  FileText,
  Home,
  MessageSquare,
  Search,
  Settings,
  ShieldAlert,
  User,
} from "lucide-react";

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    const openPalette = () => setOpen(true);

    document.addEventListener("keydown", down);
    document.addEventListener("open-command-palette", openPalette);
    
    return () => {
      document.removeEventListener("keydown", down);
      document.removeEventListener("open-command-palette", openPalette);
    };
  }, []);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setOpen(false)}
      />
      
      {/* Dialog */}
      <div className="relative z-[101] w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#13131a]/95 shadow-[0_16px_70px_rgba(0,0,0,0.8)] backdrop-blur-2xl ud-enter">
        <Command
          className="flex h-full w-full flex-col overflow-hidden rounded-2xl bg-transparent"
        >
          <div className="flex items-center border-b border-white/10 px-4">
            <Search className="mr-2 h-5 w-5 text-white/40" />
            <Command.Input 
              autoFocus
              placeholder="Type a command or search..." 
              className="flex h-14 w-full rounded-md bg-transparent py-3 text-sm text-white outline-none placeholder:text-white/40"
            />
            <div className="ml-2 flex items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-white/40">
              ESC
            </div>
          </div>
          
          <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2 text-sm text-white">
            <Command.Empty className="py-6 text-center text-sm text-white/40">
              No results found.
            </Command.Empty>
            
            <Command.Group heading={<span className="text-xs font-medium text-white/40 px-2 py-1 block">Suggestions</span>}>
              <Command.Item 
                onSelect={() => runCommand(() => router.push("/"))}
                className="relative flex cursor-pointer select-none items-center rounded-lg px-2 py-2.5 outline-none aria-selected:bg-white/10 aria-selected:text-white"
              >
                <Home className="mr-2 h-4 w-4 opacity-50" />
                <span>Go to Home</span>
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => router.push("/register"))}
                className="relative flex cursor-pointer select-none items-center rounded-lg px-2 py-2.5 outline-none aria-selected:bg-white/10 aria-selected:text-white"
              >
                <FileText className="mr-2 h-4 w-4 opacity-50" />
                <span>Start Application</span>
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => document.getElementById("contact")?.scrollIntoView({behavior: "smooth"}))}
                className="relative flex cursor-pointer select-none items-center rounded-lg px-2 py-2.5 outline-none aria-selected:bg-white/10 aria-selected:text-white"
              >
                <MessageSquare className="mr-2 h-4 w-4 opacity-50" />
                <span>Contact Support</span>
              </Command.Item>
            </Command.Group>
            
            <Command.Group heading={<span className="text-xs font-medium text-white/40 px-2 py-1 block mt-4">Settings</span>}>
              <Command.Item 
                onSelect={() => runCommand(() => router.push("/login"))}
                className="relative flex cursor-pointer select-none items-center rounded-lg px-2 py-2.5 outline-none aria-selected:bg-white/10 aria-selected:text-white"
              >
                <User className="mr-2 h-4 w-4 opacity-50" />
                <span>Sign In / Register</span>
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => router.push("/admin/dashboard"))}
                className="relative flex cursor-pointer select-none items-center rounded-lg px-2 py-2.5 outline-none aria-selected:bg-white/10 aria-selected:text-white"
              >
                <ShieldAlert className="mr-2 h-4 w-4 opacity-50" />
                <span>Admin Dashboard</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
