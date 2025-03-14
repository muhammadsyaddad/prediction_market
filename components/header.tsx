"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, TrendingUp, User, LogOut, Settings, Coins } from "lucide-react"
import { HuntingCoinButton } from "@/components/hunting-coin-button"
import { useAuth } from "@/contexts/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"

export function Header() {
  const [isConnected, setIsConnected] = useState(false)
  const { user, signOut, getUserInitial } = useAuth()
  const router = useRouter()

  const userInitial = getUserInitial()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="grid gap-6 text-lg font-medium py-4">
                <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
                  <TrendingUp className="h-6 w-6" />
                  <span>PredictX</span>
                </Link>
                <Link href="/markets" className="hover:text-foreground/80 py-2">
                  Pasar
                </Link>
                <Link href="/create" className="hover:text-foreground/80 py-2">
                  Buat Pasar
                </Link>
                <Link href="/portfolio" className="hover:text-foreground/80 py-2">
                  Portofolio
                </Link>
                <Link href="/learn" className="hover:text-foreground/80 py-2">
                  Pelajari
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
            <TrendingUp className="h-6 w-6" />
            <span className="hidden sm:inline-block">PredictX</span>
          </Link>
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Pasar</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <a
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                          href="/"
                        >
                          <TrendingUp className="h-6 w-6" />
                          <div className="mb-2 mt-4 text-lg font-medium">Pasar Populer</div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            Jelajahi pasar prediksi paling populer saat ini
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <a
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          href="/markets/politics"
                        >
                          <div className="text-sm font-medium leading-none">Politik</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Prediksi hasil pemilu dan keputusan politik
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <a
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          href="/markets/economics"
                        >
                          <div className="text-sm font-medium leading-none">Ekonomi</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Prediksi indikator ekonomi dan pasar keuangan
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <a
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          href="/markets/weather"
                        >
                          <div className="text-sm font-medium leading-none">Cuaca</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Prediksi pola cuaca dan fenomena alam
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/create" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>Buat Pasar</NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/portfolio" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>Portofolio</NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="flex items-center gap-4">
          {!user ? (
            <Link href="/auth" className="hidden sm:block">
              <Button variant="default" className="bg-primary-600 hover:bg-primary-700 text-white font-medium">
                Mulai Sekarang
              </Button>
            </Link>
          ) : null}

          <div className="hidden sm:flex">
            <HuntingCoinButton />
          </div>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">{userInitial}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="h-4 w-4 mr-2" />
                  Profil
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Pengaturan
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/auth" className="sm:hidden">
                <Button
                  variant="default"
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground mr-2"
                >
                  Mulai Sekarang
                </Button>
              </Link>
              <Button variant="outline" size="sm" className="sm:hidden" onClick={() => router.push("/hunting-coin")}>
                <Coins className="h-4 w-4 mr-2" />
                Koin
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

