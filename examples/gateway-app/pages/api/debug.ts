import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    method: req.method,
    url: req.url,

    headers: req.headers,

    host: req.headers.host,
    xForwardedHost: req.headers["x-forwarded-host"],
    xForwardedProto: req.headers["x-forwarded-proto"],
    xForwardedFor: req.headers["x-forwarded-for"],
    forwarded: req.headers.forwarded,
  });
}
