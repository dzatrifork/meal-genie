import type { AppProps } from "next/app";
import './../globals.css'

interface CustomPageProps {
    // your props
 }

export default function App({
  Component,
  pageProps,
}: AppProps<CustomPageProps>) {
    return <Component>  </Component>
}