chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'FETCH_REPLIES') {
        const API_KEY = 'AIzaSyDLRX5L3wDTFmKnrBONplr83QgrD1k_VPA'
        const commentId = message.commentId

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
            }))
            sendResponse(replies)
          })
          .catch(() => sendResponse([]))
        return true
    }
})