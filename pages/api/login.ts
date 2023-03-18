import type { User } from './user'

import { withIronSessionApiRoute } from 'iron-session/next'
import { NextApiRequest, NextApiResponse } from 'next'
import { sessionOptions } from '../../lib/session'

async function loginRoute(req: NextApiRequest, res: NextApiResponse) {
  const { openaiApiKey } = await req.body;

  try {
    const user = { isLoggedIn: true, openaiApiKey: openaiApiKey } as User
    req.session.user = user
    await req.session.save()
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: (error as Error).message })
  }
}

export default withIronSessionApiRoute(loginRoute, sessionOptions)