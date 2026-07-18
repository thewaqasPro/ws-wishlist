import Document, { Head, Html, Main, NextScript } from "next/document";

export default class WsWishlistDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return {
      ...initialProps,
      shopifyApiKey: process.env.SHOPIFY_API_KEY || "",
    };
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          <meta name="shopify-api-key" content={this.props.shopifyApiKey} />
          <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>
          <script src="https://cdn.shopify.com/shopifycloud/polaris.js"></script>
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
