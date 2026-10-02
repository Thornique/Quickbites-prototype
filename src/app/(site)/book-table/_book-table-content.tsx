"use client";

import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { useT } from "@/i18n";
import { MyBookings } from "@/components/site/my-bookings";
import { BookingForm } from "./_booking-form";

export function BookTableContent() {
  const t = useT();

  return (
    <Container className="py-10 sm:py-14">
      <div className="mx-auto max-w-2xl">
        <SectionHeading
          as="h1"
          size="lg"
          eyebrow={t.booking.eyebrow}
          title={t.booking.title}
          description={t.booking.description}
        />

        <div className="mt-8">
          <BookingForm />
        </div>

        <div className="mt-10">
          <MyBookings />
        </div>
      </div>
    </Container>
  );
}
