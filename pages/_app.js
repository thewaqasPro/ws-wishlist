import AppBridgeProvider from "@/components/providers/AppBridgeProvider";
import { AppProvider as PolarisProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import translations from "@shopify/polaris/locales/en.json";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [isEmbedded, setIsEmbedded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.self !== window.top) {
      setIsEmbedded(true);
    }
  }, []);

  const shop = router.query.shop || "";
  const host = router.query.host || "";
  const queryString = shop && host ? `?shop=${shop}&host=${host}` : "";

  const showDirectVisit = pageProps.isDirectVisit && !isEmbedded;
  const modifiedPageProps = { ...pageProps, isDirectVisit: showDirectVisit };

  return (
    <PolarisProvider i18n={translations}>
      {showDirectVisit ? (
        <Component {...modifiedPageProps} />
      ) : (
        <AppBridgeProvider>
          <ui-nav-menu>
            <Link href={`/${queryString}`}>Dashboard</Link>
            <Link href={`/customize${queryString}`}>Customize</Link>
            <Link href={`/wishlists${queryString}`}>Wishlists</Link>
            <Link href={`/top-products${queryString}`}>Top products</Link>
            <Link href={`/plans${queryString}`}>Plans</Link>
          </ui-nav-menu>
          <Component {...modifiedPageProps} />
        </AppBridgeProvider>
      )}
    </PolarisProvider>
  );
}

