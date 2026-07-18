import AppBridgeProvider from "@/components/providers/AppBridgeProvider";
import { AppProvider as PolarisProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import translations from "@shopify/polaris/locales/en.json";
import Link from "next/link";
import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <PolarisProvider i18n={translations}>
      {pageProps.isDirectVisit ? (
        <Component {...pageProps} />
      ) : (
        <AppBridgeProvider>
          <ui-nav-menu>
            <Link href="/">Dashboard</Link>
            <Link href="/customize">Customize</Link>
            <Link href="/wishlists">Wishlists</Link>
            <Link href="/top-products">Top products</Link>
            <Link href="/plans">Plans</Link>
          </ui-nav-menu>
          <Component {...pageProps} />
        </AppBridgeProvider>
      )}
    </PolarisProvider>
  );
}
