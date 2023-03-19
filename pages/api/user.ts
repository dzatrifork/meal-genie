import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { sessionOptions } from "../../lib/session";

export type User = {
  isLoggedIn: boolean;
  openaiApiKey: string;
};

async function userRoute(
  req: NextApiRequest,
  res: NextApiResponse<{ isLoggedIn: boolean }>
) {
  if (process.env.OPENAI_API_KEY != null) {
    const user: User = {
      openaiApiKey: process.env.OPENAI_API_KEY,
      isLoggedIn: true,
    };

    req.session.user = user;
    await req.session.save();
    res.json({
      isLoggedIn: true,
    });
  } else if (req.session.user && req.session.user.openaiApiKey != null) {
    // in a real world application you might read the user id from the session and then do a database request
    // to get more information on the user if needed
    res.json({
      isLoggedIn: true,
    });
  } else {
    res.json({
      isLoggedIn: false,
    });
  }
}

export default withIronSessionApiRoute(userRoute, sessionOptions);
