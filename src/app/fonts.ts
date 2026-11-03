import { Fraunces, IBM_Plex_Mono, Instrument_Sans } from "next/font/google";

/** Titulos: Fraunces (serifa, itali available para a palavra-chave do hero). */
export const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  style: ["normal", "italic"],
});

/** Texto corrido: Instrument Sans. */
export const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument-sans",
});

/** Numeros, etiquetas e eyebrows: IBM Plex Mono. */
export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plex-mono",
  weight: ["400", "500", "600"],
});
