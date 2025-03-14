"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Wallet, LogOut, Copy, ExternalLink } from "lucide-react"

interface ConnectWalletButtonProps {
  isConnected: boolean
  onConnect: () => void
  onDisconnect: () => void
}

export function ConnectWalletButton({ isConnected, onConnect, onDisconnect }: ConnectWalletButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const mockAddress = "0x0000...0000"
  const mockBalance = "0 USDC"

  const handleConnect = () => {
    onConnect()
    setIsDialogOpen(false)
  }

  if (isConnected) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Wallet className="h-4 w-4 mr-2" />
            {mockBalance}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Wallet</DropdownMenuLabel>
          <DropdownMenuItem className="flex items-center">
            <span className="mr-2">{mockAddress}</span>
            <Copy className="h-4 w-4" />
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <ExternalLink className="h-4 w-4 mr-2" />
            Lihat di Explorer
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDisconnect}>
            <LogOut className="h-4 w-4 mr-2" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Wallet className="h-4 w-4 mr-2" />
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>Pilih metode untuk menghubungkan dompet cryptocurrency Anda.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button onClick={handleConnect} className="w-full justify-start">
            <img src="/placeholder.svg?height=24&width=24" alt="MetaMask" className="mr-2 h-6 w-6" />
            MetaMask
          </Button>
          <Button onClick={handleConnect} className="w-full justify-start">
            <img src="/placeholder.svg?height=24&width=24" alt="WalletConnect" className="mr-2 h-6 w-6" />
            WalletConnect
          </Button>
          <Button onClick={handleConnect} className="w-full justify-start">
            <img src="/placeholder.svg?height=24&width=24" alt="Coinbase Wallet" className="mr-2 h-6 w-6" />
            Coinbase Wallet
          </Button>
        </div>
        <DialogFooter className="flex flex-col">
          <p className="text-xs text-muted-foreground text-center mb-4">
            Dengan menghubungkan dompet, Anda menyetujui Syarat Layanan dan Kebijakan Privasi kami.
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

