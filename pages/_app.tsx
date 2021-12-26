import React, { useState, useEffect } from "react";
import { Oauth2Client, HttpClient } from "@metis.io/middleware-client";
import { useRouter } from "next/router";

import Layout from "../components/layout";

import "../styles.css";

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();
  console.log(router);
  const { code } = router.query;

  const [httpClient, setHttpClient] = useState<HttpClient>();
  const [user, setUser] = useState(null);

  useEffect(() => {
    console.log(user);
    console.log(httpClient);
  }, [user, httpClient]);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const fetchData = async () => {
      try {
        if (!code) {
          console.log(code);
          console.log("error code");
          return;
        }

        const res = await fetch(`/api/metis?code=${code}`);
        const resData = await res.json();

        console.log(res);
        if (res.status === 200 && resData && resData.code === 200) {
          const accessToken = resData.data.access_token;
          const refreshToken = resData.data.refresh_token;
          const expiresIn = resData.data.expires_in;

          const httpClient = new HttpClient(
            process.env.NEXT_PUBLIC_APP_ID || "",
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

  return (
    <Layout>
      <Component httpClient={httpClient} user={user} {...pageProps} />
    </Layout>
  );
}
