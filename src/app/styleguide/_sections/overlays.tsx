"use client";

import { SearchX, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Price } from "@/components/ui/price";
import { Panel, Row } from "../_components/panel";

const BADGES = [
  "default",
  "mustard",
  "secondary",
  "outline",
  "veg",
  "nonveg",
  "success",
  "warning",
  "danger",
  "muted",
] as const;

const ORDERS = [
  { id: "QB-1042", name: "Rohit Verma", total: 348, status: "Preparing" },
  { id: "QB-1041", name: "Asha Patel", total: 199, status: "Ready" },
  { id: "QB-1040", name: "Imran Shaikh", total: 1249, status: "Picked up" },
];

export function OverlaysSection() {
  return (
    <TooltipProvider>
      <Panel id="badges" title="Badges & cards">
        <Row label="Badges">
          {BADGES.map((variant) => (
            <Badge key={variant} variant={variant}>
              {variant}
            </Badge>
          ))}
        </Row>
        <div className="grid gap-4 pt-4 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Bordered</CardTitle>
              <CardDescription>Default card, hairline border.</CardDescription>
            </CardHeader>
            <CardContent>
              <Price value={249} compareAt={299} showSavingPercent />
            </CardContent>
          </Card>
          <Card variant="raised">
            <CardHeader>
              <CardTitle>Raised</CardTitle>
              <CardDescription>For cards floating over photos.</CardDescription>
            </CardHeader>
            <CardContent>
              <Price value={99} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>With footer</CardTitle>
              <CardDescription>Sand footer for actions.</CardDescription>
            </CardHeader>
            <CardContent className="pb-0 text-sm text-ink-muted">
              Ready by 7:42 PM
            </CardContent>
            <CardFooter className="mt-5">
              <Button size="sm">Accept</Button>
              <Button size="sm" variant="outline">
                Cancel
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Panel>

      <Panel id="tabs" title="Tabs">
        <Tabs defaultValue="all" className="sm:max-w-lg">
          <TabsList>
            <TabsTrigger value="all">All items</TabsTrigger>
            <TabsTrigger value="veg">Veg only</TabsTrigger>
            <TabsTrigger value="deals">Deals</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="pt-3 text-ink-muted">
            38 items across 8 categories.
          </TabsContent>
          <TabsContent value="veg" className="pt-3 text-ink-muted">
            26 vegetarian items.
          </TabsContent>
          <TabsContent value="deals" className="pt-3 text-ink-muted">
            6 combo deals running today.
          </TabsContent>
        </Tabs>
      </Panel>

      <Panel id="overlays" title="Overlays & feedback">
        <Row label="Dialog / Sheet">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Open dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cancel order QB-1042?</DialogTitle>
                <DialogDescription>
                  Stock for this order will be returned to inventory. The customer sees
                  the cancellation immediately.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline">Keep order</Button>
                <Button variant="destructive">Cancel order</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Open sheet</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Customise · Paneer Tikka Burger</SheetTitle>
                <SheetDescription>
                  Choose a size and any add-ons before adding to the cart.
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Dropdown</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuItem>My orders</DropdownMenuItem>
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost">Hover for tooltip</Button>
            </TooltipTrigger>
            <TooltipContent>Ready by 7:42 PM</TooltipContent>
          </Tooltip>
        </Row>

        <Row label="Toasts">
          <Button
            variant="outline"
            onClick={() =>
              toast.success("Added to cart", {
                description: "Paneer Tikka Burger · Large",
                action: { label: "View cart", onClick: () => {} },
              })
            }
          >
            Success
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.error("Coupon QUICK20 has expired.")}
          >
            Error
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.warning("Only 2 veg patties left in stock.")}
          >
            Warning
          </Button>
        </Row>

        <Row label="Loading" className="block">
          <div className="w-full max-w-sm space-y-3 rounded-card border border-hairline bg-surface p-4">
            <Skeleton className="aspect-[4/3] w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </Row>

        <div className="grid gap-4 pt-4 sm:grid-cols-2">
          <EmptyState
            icon={SearchX}
            title="No items match those filters"
            description="Try removing the “Under ₹100” filter or searching for something else."
            action={<Button variant="outline">Clear filters</Button>}
          />
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            description="Add a burger, a shake or a combo and it will show up here."
            action={<Button>Browse the menu</Button>}
          />
        </div>
      </Panel>

      <Panel
        id="table"
        title="Table"
        note="Tabular figures, sand header, hairline rows — tuned for admin screens."
      >
        <div className="overflow-hidden rounded-card border border-hairline bg-surface">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Pickup name</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ORDERS.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="nums font-semibold">{o.id}</TableCell>
                  <TableCell>{o.name}</TableCell>
                  <TableCell className="nums text-right">
                    <Price value={o.total} size="sm" />
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        o.status === "Ready"
                          ? "success"
                          : o.status === "Preparing"
                            ? "warning"
                            : "muted"
                      }
                    >
                      {o.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Panel>
    </TooltipProvider>
  );
}
