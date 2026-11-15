import type { MetadataRoute } from "next";

/** The site as an app (a phone's home screen, Android's tab icon): the vp. signature on the paper colour. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Vishnu Prasad",
    short_name: "Vishnu Prasad",
    description: "Vishnu Prasad, product designer: experiences for the complex systems that run real work.",
    start_url: "/",
    display: "browser",
    background_color: "#eae7e6",
    theme_color: "#eae7e6",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
