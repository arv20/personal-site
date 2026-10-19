import { mkdir, writeFile } from 'node:fs/promises';

const query = `query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount } }
      }
    }
  }
}`;

const response = await fetch('https://api.github.com/graphql', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    'Content-Type': 'application/json',
    'User-Agent': 'portfolio-contribution-sync',
  },
  body: JSON.stringify({ query, variables: { login: 'arv20' } }),
});

if (!response.ok) throw new Error(`GitHub GraphQL request failed: ${response.status}`);
const payload = await response.json();
if (payload.errors) throw new Error(payload.errors.map(error => error.message).join('; '));
const calendar = payload.data.user.contributionsCollection.contributionCalendar;
const contributions = calendar.weeks.flatMap(week => week.contributionDays).map(day => ({ date: day.date, count: day.contributionCount }));

const dataPayload = JSON.stringify({ generatedAt: new Date().toISOString(), total: calendar.totalContributions, contributions });
await mkdir('data', { recursive: true });
await mkdir('public/data', { recursive: true });
await writeFile('data/github-contributions.json', dataPayload);
await writeFile('public/data/github-contributions.json', dataPayload);
