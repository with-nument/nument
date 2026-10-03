import Document, { Head, Html, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="preload" crossOrigin="anonymous" href="/fonts/InterDisplay-Bold.woff2" as="font" type="font/woff2" />
          <link rel="preload" crossOrigin="anonymous" href="/fonts/InterDisplay-Light.woff2" as="font" type="font/woff2" />
          <link rel="preload" crossOrigin="anonymous" href="/fonts/InterDisplay-Medium.woff2" as="font" type="font/woff2" />
          <link rel="preload" crossOrigin="anonymous" href="/fonts/InterDisplay-Regular.woff2" as="font" type="font/woff2" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
