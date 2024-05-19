type Video = {
  channelId: string;
  id: string;
  title: string;
  url: string;
};

const API_KEY = process.env.API_KEY as string;
const API_URL = 'https://youtube.googleapis.com/youtube/v3';
const VIDEO_URL = 'https://www.youtube.com/watch?v=';

// Time until new fetch is requested (in ms)
const TIMEOUT = 30 * 60 * 1000;

// Channels to monitor for. To find the channel ID:
// 1. Open 'Network' tab in your browsers dev tools
// 2. Navigate to a channel's 'Videos' page
// 3. Inspect request to https://www.youtube.com/youtubei/v1/browse
// 4. Channel ID is `browseId` in the request object
const CHANNELS = [
  { name: 'Kendrick Lamar', id: 'UC3lBXcrKFnFAFkfVk5WuKcQ' },
  { name: 'DrakeOfficial', id: 'UCByOQJjav0CUDwxCk-jVNRQ' },
];

function clearLine() {
  process.stdout.write('\r\x1b[K');
}

function printLastFetchTime() {
  const dateNow = new Date().toLocaleString('en-AU');
  clearLine();
  process.stdout.write(`Last fetched: ${dateNow}`);
}

async function fetchLatestVideo(channelId: string) {
  const searchParams = new URLSearchParams({
    key: API_KEY,
    channelId,
    part: 'snippet,id',
    order: 'date',
    maxResults: '1',
  });

  const response = await fetch(`${API_URL}/search?${searchParams}`);
  const data = await response.json();
  const video = data.items[0];

  return {
    channelId,
    id: video.id.videoId,
    title: video.snippet.title,
    url: VIDEO_URL + video.id.videoId,
  };
}

let savedLatestVideos: null | Video[] = null;

async function fetchVideos() {
  if (!savedLatestVideos) {
    console.log('Latest videos:');
    savedLatestVideos = [];

    for (const channel of CHANNELS) {
      process.stdout.write(`\tFetching latest from ${channel.name}...`);
      const latestVideo = await fetchLatestVideo(channel.id);
      savedLatestVideos.push(latestVideo);
      clearLine();
      console.log(`\t${channel.name}: [${latestVideo.title}](${latestVideo.url})`);
    }

    printLastFetchTime();
    return;
  }

  clearLine();
  process.stdout.write('Fetching...');

  for (const channel of CHANNELS) {
    const latestVideo = await fetchLatestVideo(channel.id);
    const savedLatestVideo = savedLatestVideos.find(
      (video) => video.channelId === channel.id
    )!;

    if (latestVideo.id !== savedLatestVideo.id) {
      const message = `>>> NEW VIDEO ON ${channel.name}: [${latestVideo.title}](${latestVideo.url}) <<<`;
      clearLine();
      console.log('>'.repeat(message.length));
      console.log(message);
      console.log('<'.repeat(message.length));
    }
  }

  printLastFetchTime();
}

fetchVideos();
const interval = setInterval(fetchVideos, TIMEOUT);

process.on('SIGINT', function() {
  console.log('\nExiting...');
  clearInterval(interval);
});
