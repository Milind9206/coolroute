import type { Metadata } from "next";
import NotFoundContent from "@/components/not-found-content";

export const metadata: Metadata = {
  title: "Error 404: Footpath Closed or Unmapped Segment",
  description: "This footpath is closed or this segment is not on the map.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return <NotFoundContent />;
}
