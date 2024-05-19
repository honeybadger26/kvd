# kvd

Get notified of new videos on given YouTube channels.

## Instructions

1. Create a `.env` file with your YouTube Data API key. See
[here](https://developers.google.com/youtube/v3/getting-started) for more info.
```
API_KEY="<your-key-here>"
```

2. Edit `index.ts` to set the desired timeout and channels to monitor

3. Install dependencies
```bash
bun install
```

4. Run:
```bash
bun run index.ts
```
