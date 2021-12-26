export const onRequestGet: PagesFunction<{
  POLIS_APP_ID: string;
  POLIS_APP_SECRET: string;
}> = async ({ env, request }) => {
  if (request.method === "GET") {
    const query = new URL(request.url).searchParams;
    try {
      const res = await fetch(
        `https://polis.metis.io/api/v1/oauth2/access_token?app_id=${
          env.POLIS_APP_ID
        }&app_key=${env.POLIS_APP_SECRET}&code=${query.get("code")}`
      );
      const resData = await res.json();
      return new Response(JSON.stringify(resData), {
        status: 200,
      });
    } catch (error) {
      return new Response(JSON.stringify({}), {
        status: 401,
      });
    }
  }

  return new Response(JSON.stringify({}), {
    status: 405,
  });
};
