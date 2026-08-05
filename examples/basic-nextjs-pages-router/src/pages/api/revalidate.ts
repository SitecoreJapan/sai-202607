import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const pagename = req.query.pagename;

  console.log('Revalidation request received with pagename:', pagename);

  try {
    await res.revalidate(`/en/${pagename}`);

    return res.json({ revalidated: true });
  } catch (err) {
    return res.status(500).send('Error revalidating');
  }
}
