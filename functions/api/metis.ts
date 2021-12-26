import axios from "axios";

export const onRequestGet: PagesFunction = async ({ params, request }) => {
  if (request.method === "GET") {
    const { data } = await axios.get(
      `https://polis.metis.io/api/v1/oauth2/access_token?app_id=${process.env.POLIS_APP_ID}&app_key=${process.env.POLIS_APP_SECRET}&code=${params.code}`
    );
    return new Response(JSON.stringify(data), {
      status: 200,
    });
  }

  return new Response(JSON.stringify({}), {
    status: 405,
  });
};
