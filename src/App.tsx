import { useEffect, useState } from 'react'
import './App.css'

const API_KEY = 'AIzaSyDLRX5L3wDTFmKnrBONplr83QgrD1k_VPA'

function getYouTubeVideoId(url: string): string | null {
  const match = url.match(/[?&]v=([^&#]+)/);
  return match ? match[1] : null;
}

function App() {
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [allFiltered, setAllFiltered] = useState<any[]>([])
  const [nextToken, setNextToken] = useState<string | null>(null)

  const fetchAllComments = async (limit = 1000, startingToken: string | null = null): Promise<{
    comments: any[],
    nextPageToken: string | null
  }> => {
    let [tab] = await chrome.tabs.query({ active: true });
    const url = tab?.url;
    const VIDEO_ID = url ? getYouTubeVideoId(url) ?? '' : '';

    let fetchedComments: any[] = [];
    let nextPageToken = startingToken || '';

    try {
      while (fetchedComments.length < limit && nextPageToken !== null) {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${VIDEO_ID}&maxResults=100&pageToken=${nextPageToken}&key=${API_KEY}`
        );
        const data = await response.json();

        const newComments = data.items.map((item: any) => ({
          id: item.id,
          text: item.snippet.topLevelComment.snippet.textOriginal,
          author: item.snippet.topLevelComment.snippet.authorDisplayName,
          profileImage: item.snippet.topLevelComment.snippet.authorProfileImageUrl,
          channelUrl: item.snippet.topLevelComment.snippet.authorChannelUrl,
          totalReplyCount: item.snippet.totalReplyCount,
          likeCount: item.snippet.topLevelComment.snippet.likeCount,
          publishedAt: item.snippet.topLevelComment.snippet.publishedAt
        }));

        fetchedComments.push(...newComments);

        nextPageToken = data.nextPageToken || null;

        if (!data.nextPageToken || fetchedComments.length >= limit) {
          break;
        }
      }
    } catch (err) {
      console.error(err);
    }

    return {
      comments: fetchedComments,
      nextPageToken: nextPageToken
    };
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setLoading(true);

    const { comments, nextPageToken } = await fetchAllComments(1000);
    const filtered = comments.filter(c =>
      c.text.toLowerCase().includes(keyword.toLowerCase())
    );

    setAllFiltered(filtered);
    setNextToken(nextPageToken);
    setLoading(false);

    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'SHOW_COMMENTS_POPUP',
        comments: filtered,
        keyword: keyword,
        hasMore: false,
        canLoadMoreFromYouTube: !!nextPageToken
      });
    }
  };

  const handleLoadMoreFromYouTube = async () => {
    if (!nextToken || !keyword) {
      return
    };

    setLoading(true);
    
    const { comments, nextPageToken } = await fetchAllComments(1000, nextToken);
    const newFiltered = comments.filter(c =>
      c.text.toLowerCase().includes(keyword.toLowerCase())
    );

    const updatedFiltered = [...allFiltered, ...newFiltered];
    setAllFiltered(updatedFiltered);
    setNextToken(nextPageToken);
    setLoading(false);

    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'SHOW_COMMENTS_POPUP',
        comments: updatedFiltered,
        keyword: keyword,
        hasMore: false,
        canLoadMoreFromYouTube: !!nextPageToken
      });
    }
  };

  useEffect(() => {
    const messageListener = (message: any, _sender: any, _sendResponse: any) => {
      if (message.type === 'LOAD_MORE_YOUTUBE_COMMENTS') {
        handleLoadMoreFromYouTube();
      }
    };
    chrome.runtime.onMessage.addListener(messageListener);
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, [allFiltered, keyword, nextToken]);

  return (
    <>
      <div className="ext-container">
        <h1 className="ext-title">Comment Finder</h1>

        <form className="ext-form" onSubmit={handleSubmit}>
          <label htmlFor="keyword">Keyword</label>
          <input
            id="keyword"
            type="text"
            placeholder="Type your keyword here"
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        {loading && (
          <div className="ext-loading-overlay">
            <div className="ext-spinner"></div>
          </div>
        )}
      </div>
    </>

  )
}

export default App
