"use client";

import { useState } from "react";
import { Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Panel, Row } from "../_components/panel";

const VARIANTS = [
  "default",
  "mustard",
  "outline",
  "secondary",
  "ghost",
  "destructive",
  "destructive-ghost",
  "link",
] as const;

export function ControlsSection() {
  const [qty, setQty] = useState(2);
  const [lineQty, setLineQty] = useState(1);
  const [size, setSize] = useState("regular");
  const [available, setAvailable] = useState(true);

  return (
    <>
      <Panel
        id="buttons"
        title="Buttons"
        note="40px is the standard height, 48px for hero and sticky-cart CTAs. Solid fills, 6px radius, brand focus ring."
      >
        {VARIANTS.map((variant) => (
          <Row key={variant} label={variant}>
            <Button variant={variant}>Add to cart</Button>
            <Button variant={variant} size="sm">
              Small
            </Button>
            <Button variant={variant} disabled>
              Disabled
            </Button>
          </Row>
        ))}
        <Row label="Sizes">
          <Button size="lg">
            <ShoppingBag aria-hidden="true" /> Order takeaway
          </Button>
          <Button>Default</Button>
          <Button size="sm">Small</Button>
          <Button size="xs">Extra small</Button>
        </Row>
        <Row label="Icon only">
          <Button size="icon-lg" aria-label="Add item">
            <Plus aria-hidden="true" />
          </Button>
          <Button size="icon" variant="outline" aria-label="Add item">
            <Plus aria-hidden="true" />
          </Button>
          <Button size="icon-sm" variant="ghost" aria-label="Add item">
            <Plus aria-hidden="true" />
          </Button>
        </Row>
      </Panel>

      <Panel
        id="fields"
        title="Form fields"
        note="40px tall, white on cream so fields read as fillable. 16px text on mobile to stop iOS zooming on focus."
      >
        <div className="grid gap-5 sm:max-w-md">
          <div className="grid gap-1.5">
            <Label htmlFor="sg-name">Pickup name</Label>
            <Input id="sg-name" placeholder="e.g. Rohit Verma" />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="sg-phone">Phone</Label>
            <Input
              id="sg-phone"
              defaultValue="98765"
              aria-invalid
              aria-describedby="sg-phone-error"
            />
            <p id="sg-phone-error" className="text-xs font-medium text-danger">
              Enter a 10-digit mobile number.
            </p>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="sg-disabled">Order type</Label>
            <Input id="sg-disabled" value="Takeaway" disabled readOnly />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="sg-notes">Notes for the kitchen</Label>
            <Textarea
              id="sg-notes"
              placeholder="Less spicy, no onion…"
              maxLength={120}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="sg-cat">Category</Label>
            <Select defaultValue="burgers">
              <SelectTrigger id="sg-cat">
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="burgers">Burgers</SelectItem>
                <SelectItem value="pizzas">Pizzas</SelectItem>
                <SelectItem value="coffee">Hot Coffee</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Panel>

      <Panel
        id="choices"
        title="Choices & toggles"
        note="20px hit areas on checkbox and radio for option groups; the switch is sized for admin availability toggles."
      >
        <Row label="Radio (size)">
          <RadioGroup value={size} onValueChange={setSize} className="flex gap-6">
            {["regular", "large"].map((value) => (
              <div key={value} className="flex items-center gap-2">
                <RadioGroupItem value={value} id={`sg-size-${value}`} />
                <Label htmlFor={`sg-size-${value}`} className="font-normal">
                  {value === "regular" ? "Regular" : "Large (+₹40)"}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </Row>

        <Row label="Checkbox (add-ons)">
          {["Extra cheese +₹25", "Jalapeños +₹15"].map((addon, i) => (
            <div key={addon} className="flex items-center gap-2">
              <Checkbox id={`sg-addon-${i}`} defaultChecked={i === 0} />
              <Label htmlFor={`sg-addon-${i}`} className="font-normal">
                {addon}
              </Label>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <Checkbox id="sg-addon-off" disabled />
            <Label htmlFor="sg-addon-off" className="font-normal opacity-50">
              Paneer slice (sold out)
            </Label>
          </div>
        </Row>

        <Row label="Switch">
          <div className="flex items-center gap-2">
            <Switch id="sg-avail" checked={available} onCheckedChange={setAvailable} />
            <Label htmlFor="sg-avail" className="font-normal">
              {available ? "Available" : "Sold out"}
            </Label>
          </div>
          <Switch size="sm" defaultChecked aria-label="Small switch" />
          <Switch disabled aria-label="Disabled switch" />
        </Row>

        <Row label="Quantity">
          <QuantityStepper value={qty} onChange={setQty} itemLabel="burger" />
          <QuantityStepper
            value={lineQty}
            onChange={setLineQty}
            removable
            onRemove={() => setLineQty(1)}
            size="sm"
            itemLabel="cart line"
          />
          <QuantityStepper value={20} onChange={() => {}} itemLabel="item" />
        </Row>
      </Panel>
    </>
  );
}
