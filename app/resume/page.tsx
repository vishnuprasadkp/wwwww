import type { Metadata } from "next";
import ResumeViewer from "@/components/resume/ResumeViewer";

export const metadata: Metadata = {
  title: "Resume",
  description: "Vishnu Prasad K P — Lead Product Designer. View, zoom, print or download the resume.",
};

export default function ResumePage() {
  return <ResumeViewer />;
}
