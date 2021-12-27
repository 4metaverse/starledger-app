import React, { useState, useEffect } from "react";
import { Oauth2Client, HttpClient } from "@metis.io/middleware-client";
import Head from "next/head";
import { useRouter } from "next/router";

import Layout from "../components/layout";

import "../styles.css";

export default function StarLedgerApp({ Component, pageProps }) {
  const router = useRouter();
  const { code } = router.query;

  const [httpClient, setHttpClient] = useState<HttpClient>();
  const [user, setUser] = useState(null);

  const load = async () => {
    if (!sessionStorage.getItem("polis")) {
      return;
    }

    const { accessToken, refreshToken, expiresIn } = JSON.parse(
      sessionStorage.getItem("polis")
    );

    const httpClient = new HttpClient(
      process.env.POLIS_APP_ID,
      accessToken,
      refreshToken,
      expiresIn
    );

    setHttpClient(httpClient);

    const oauth2Client = new Oauth2Client();
    setUser(await oauth2Client.getUserInfoAsync(accessToken));
  };

  useEffect(() => {
    console.log(user);
    console.log(httpClient);
  }, [user, httpClient]);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const fetchData = async () => {
      if (!code) {
        return;
      }

      try {
        const res = await fetch(`/api/metis?code=${code}`);
        const resData = await res.json();

        console.log(res);
        if (res.status === 200 && resData && resData.code === 200) {
          const accessToken = resData.data.access_token;
          const refreshToken = resData.data.refresh_token;
          const expiresIn = resData.data.expires_in;

          sessionStorage.setItem(
            "polis",
            JSON.stringify({ accessToken, refreshToken, expiresIn })
          );

          const httpClient = new HttpClient(
            process.env.POLIS_APP_ID,
            accessToken,
            refreshToken,
            expiresIn
          );

          setHttpClient(httpClient);

          const oauth2Client = new Oauth2Client();
          setUser(await oauth2Client.getUserInfoAsync(accessToken));
        } else if (res.status === 200 && resData) {
          console.log(resData.msg);
        } else {
          console.log("code error");
          console.log(res);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [router.isReady, code]);

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <Head>
        <title>StarLedger</title>
        <meta charSet="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, viewport-fit=cover, user-scalable=no"
        />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#000000" />
        <meta name="theme-color" content="#000000" />
      </Head>
      <Layout>
        <Component httpClient={httpClient} user={user} {...pageProps} />
      </Layout>
    </>
  );
}
