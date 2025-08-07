const API_KEY = 'AIzaSyDLRX5L3wDTFmKnrBONplr83QgrD1k_VPA'

chrome.runtime.onInstalled.addListener(async () => {
  for (const cs of chrome.runtime.getManifest().content_scripts) {
    for (const tab of await chrome.tabs.query({url: cs.matches})) {
      chrome.scripting.executeScript({
        target: {tabId: tab.id},
        files: cs.js,
      });
    }
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'FETCH_REPLIES') {
        const commentId = message.commentId;
        fetch(`https://www.googleapis.com/youtube/v3/comments?part=snippet&parentId=${commentId}&key=${API_KEY}`)
            .then(response => response.json())
            .then(data => {
                const replies = (data.items || []).map(item => ({
                    text: item.snippet.textOriginal,
                    author: item.snippet.authorDisplayName,
                    profilePicture: item.snippet.authorProfileImageUrl,
                    likeCount: item.snippet.likeCount,
                    channelUrl: `https://www.youtube.com/channel/${item.snippet.authorChannelId.value}`,
                    publishedAt: item.snippet.publishedAt
                }));
                try {
                    sendResponse(replies);
                } catch (e) {
                    // Ignore port closed errors
                }
            })
            .catch(() => {
                try {
                    sendResponse([]);
                } catch (e) {}
            });
        return true;
    }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'LOAD_MORE_YOUTUBE_COMMENTS') {
        (async () => {
            if (!message.nextPageToken || !message.keyword || !message.videoId || !Array.isArray(message.comments)) {
                try { sendResponse(null); } catch (e) {}
                return;
            }
            const { comments, nextPageToken } = await fetchComments(1000, message.nextPageToken, message.videoId);
            const newFiltered = comments.filter(c =>
                c.text.toLowerCase().includes(message.keyword.toLowerCase())
            );
            const updatedFiltered = [...message.comments, ...newFiltered];
            try {
                sendResponse({
                    comments: updatedFiltered,
                    keyword: message.keyword,
                    nextPageToken: nextPageToken,
                    canLoadMoreFromYouTube: !!nextPageToken,
                    videoId: message.videoId
                });
            } catch (e) {
                // Ignore port closed errors
            }
        })();
        return true;
    }
});

async function fetchComments(limit = 1000, startingToken, videoId) {
  let fetchedComments = [];
  let nextPageToken = startingToken || '';

  try {
    while (fetchedComments.length < limit && nextPageToken !== null) {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=100&pageToken=${nextPageToken}&key=${API_KEY}`
      );
      const data = await response.json();

      const newComments = data.items.map((item) => ({
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
}