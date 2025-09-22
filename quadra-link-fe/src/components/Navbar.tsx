'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Features', href: '/features' },
  { name: 'About', href: '/about' },
  { name: 'Resources', href: '/resources' },
  { name: 'Support', href: '/support' },
];

const navButtons = [
  { name: 'Login', href: '/login' },
  { name: 'Sign Up', href: '/signup' },
];

const Navbar: React.FC = () => {
  return (
    <nav className="w-full border-b bg-background font-[var(--font-montserrat)]">
      <div className="flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold">
          QuadraLink
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <NavigationMenu>
            <NavigationMenuList>
              {navLinks.map((link) => (
                <NavigationMenuItem key={link.name}>
                  <NavigationMenuLink asChild>
                    <Link
                      href={link.href}
                      className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex gap-3 ml-6">
            {navButtons.map((btn, i) => (
              <Button
                key={btn.name}
                variant={i === 1 ? 'default' : 'outline'} // Sign Up = filled, Login = outline
                className={i === 1 ? 'bg-blue-700 text-white font-semibold hover:bg-white hover:text-black border-[2px] border-blue-700 transition-all' : 'border-[2px] border-blue-700 font-semibold hover:bg-blue-700 hover:text-white'}
                asChild
              >
                <Link href={btn.href}>{btn.name}</Link>
              </Button>
            ))}
          </div>
        </div>

        {/* Mobile Nav (Sheet) */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="default">
                <Menu />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-70 p-10">
              <div className="flex flex-col space-y-4 mt-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="pt-4 border-t flex flex-col gap-3">
                  {navButtons.map((btn, i) => (
                    <Button
                      key={btn.name}
                      variant={i === 1 ? 'default' : 'outline'}
                      asChild
                    >
                      <Link href={btn.href}>{btn.name}</Link>
                    </Button>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
