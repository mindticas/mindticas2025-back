import { runSeed } from '../src/scripts/run-seeds';

export default async function handler(req, res) {

    if (req.headers['authorization'] !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).end('Unauthorized');
    }

    await runSeed();

    res.status(200).send("Hello from Cron!");
  }
  