function createPopup(comments, keyword, nextPageToken, canLoadMoreFromYouTube, videoId, scroll, prevCount) {
    const existing = document.getElementById('yt-comments-popup');
    if (existing) existing.remove();

    const popup = document.createElement('div');
    popup.id = 'yt-comments-popup';
    popup.style.position = 'fixed';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.zIndex = '9999';
    popup.style.background = '#111111';
    popup.style.borderRadius = '16px';
    popup.style.padding = '16px';
    popup.style.width = '800px';
    popup.style.maxHeight = '80vh';
    popup.style.overflowY = 'auto';
    popup.style.boxShadow = '0 4px 12px rgba(0,0,0,0.6)';
    popup.style.fontSize = '14px';
    popup.style.color = '#fff';
    popup.style.fontFamily = 'Arial, sans-serif';

    const style = document.createElement('style');
        style.textContent = `
        #yt-comments-popup {
            opacity: 0;
            transform: translate(-50%, -60%) scale(0.95);
            transition: opacity 0.06s linear, transform 0.06s linear;
        }
        #yt-comments-popup.popup-open {
            opacity: 1 !important;
            transform: translate(-50%, -50%) scale(1) !important;
        }
        #yt-comments-popup.popup-close {
            opacity: 0 !important;
            transform: translate(-50%, -60%) scale(0.95) !important;
        }
    `;
    document.head.appendChild(style);

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.background = 'none';
    closeBtn.style.border = 'none';
    closeBtn.style.color = '#aaa';
    closeBtn.style.fontSize = '16px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.float = 'right';
    closeBtn.onclick = () => {
        popup.classList.remove('popup-open');
        popup.classList.add('popup-close');
        setTimeout(() => popup.remove(), 350);
    };

    const title = document.createElement('h2');
    title.textContent = `${comments.length} results for "${keyword}"`;
    title.style.margin = '0 0 24px 0';
    title.style.fontSize = '16px';
    title.style.color = '#fff';

    const list = document.createElement('ul');
    list.style.paddingLeft = '16px';
    list.style.margin = '0';
    list.style.listStyleType = 'none';

    if (!comments || comments.length < 1) {
        if (existing) existing.remove();
        popup.appendChild(closeBtn);
        const noResults = document.createElement('p');
        noResults.textContent = 'No comments found for this keyword.';
        noResults.style.color = '#aaa';
        noResults.style.textAlign = 'center';
        noResults.style.margin = '40px 0 20px 0';
        noResults.style.fontSize = '16px';
        popup.appendChild(title);
        popup.appendChild(noResults);
        document.body.appendChild(popup);
        setTimeout(() => popup.classList.add('popup-open'), 10);
        return;
    }

    if (scroll === 'buttom') {
        setTimeout(() => {
            const list = popup.querySelector('ul');
            let index = typeof prevCount === 'number' && prevCount > 0 ? prevCount - 1 : list ? list.children.length - 1 : 0;
            if (list && list.children.length > index && index >= 0) {
                const target = list.children[index];
                if (target && typeof target.scrollIntoView === 'function') {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                    popup.scrollTop = popup.scrollHeight;
                }
            } else {
                popup.scrollTop = popup.scrollHeight;
            }
        }, 50);
    }

    for (const comment of comments) {
        const li = document.createElement('li');
        li.style.marginBottom = '16px';
        li.style.display = 'flex';
        li.style.alignItems = 'flex-start';

        // Profile image
        const img = document.createElement('img');
        img.src = comment.profileImage;
        img.alt = comment.author;
        img.style.width = '40px';
        img.style.height = '40px';
        img.style.borderRadius = '50%';
        img.style.marginRight = '16px';
        li.appendChild(img);

        // Info container
        const infoDiv = document.createElement('div');
        infoDiv.style.display = 'flex';
        infoDiv.style.flexDirection = 'column';

        // Author and time container
        const authorTimeDiv = document.createElement('div');
        authorTimeDiv.style.display = 'flex';
        authorTimeDiv.style.alignItems = 'center';
        authorTimeDiv.style.gap = '8px';

        // Author (link)
        const authorLink = document.createElement('a');
        authorLink.href = comment.channelUrl;
        authorLink.textContent = comment.author;
        authorLink.target = '_blank';
        authorLink.rel = 'noopener noreferrer';
        authorLink.style.fontWeight = 'bold';
        authorLink.style.color = 'white';
        authorLink.style.marginBottom = '2px';
        authorLink.style.textDecoration = 'none';

        // Time ago (right of username)
        const timeAgo = document.createElement('span');
        timeAgo.textContent = formatTimeStamp(comment.publishedAt);
        timeAgo.style.color = '#888';
        timeAgo.style.fontSize = '13px';
        timeAgo.style.marginBottom = '2px';

        authorTimeDiv.appendChild(authorLink);
        authorTimeDiv.appendChild(timeAgo);
        infoDiv.appendChild(authorTimeDiv);

        // Comment text
        const textDiv = document.createElement('div');
        textDiv.textContent = comment.text;
        textDiv.style.margin = '4px 0';
        infoDiv.appendChild(textDiv);

        // Like count with icon
        const likeDiv = document.createElement('div');
        likeDiv.style.display = 'flex';
        likeDiv.style.alignItems = 'center';
        likeDiv.style.gap = '4px';
        likeDiv.style.fontSize = '0.95em';
        likeDiv.style.color = '#aaa';
        likeDiv.style.marginTop = '8px';
        likeDiv.style.marginBottom = '8px';

        // YouTube like SVG icon 
        likeDiv.innerHTML = `<svg height="24" width="24" viewBox="0 0 24 24" style="vertical-align:middle;" fill="none" stroke="#fff" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M1 21h4V9H1v12z" stroke="#fff"/><path d="M23 10c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 2 7.59 8.59C7.22 8.95 7 9.45 7 10v8c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1z" stroke="#fff"/></svg>`;
        const likeCountSpan = document.createElement('span');
        likeCountSpan.textContent = comment.likeCount != null ? formatLikeCount(comment.likeCount) : '0';
        likeCountSpan.style.marginLeft = '4px';
        likeDiv.appendChild(likeCountSpan);
        infoDiv.appendChild(likeDiv);

        // Reply count 
        const replyDiv = document.createElement('div');
        replyDiv.style.display = 'inline-flex';
        replyDiv.style.alignItems = 'center';
        replyDiv.style.fontSize = '14px'; 
        replyDiv.style.color = '#3EA6FF';
        replyDiv.style.cursor = 'pointer';
        replyDiv.style.transition = 'filter 0.2s';
        replyDiv.style.borderRadius = '16px';
        replyDiv.style.padding = '8px';
        replyDiv.style.transition = 'background 0.2s';
        replyDiv.style.width = 'auto';
        replyDiv.style.maxWidth = 'fit-content';
        replyDiv.style.minWidth = '0';

        const arrow = document.createElement('span');
        const downArrowSVG = `<svg height="20" width="20" viewBox="0 0 24 24" style="vertical-align:middle; margin-right:6px; transition: filter 0.2s;" fill="none" stroke="#3EA6FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`;
        const upArrowSVG = `<svg height="20" width="20" viewBox="0 0 24 24" style="vertical-align:middle; margin-right:6px; transition: filter 0.2s;" fill="none" stroke="#3EA6FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 15 12 9 18 15"/></svg>`;
        arrow.innerHTML = downArrowSVG;
        arrow.style.display = 'inline-flex';
        arrow.style.alignItems = 'center';
        arrow.style.cursor = 'pointer';

        if (comment.totalReplyCount > 0) {
            replyDiv.textContent = '';
            replyDiv.appendChild(arrow);
            const replyText = document.createElement('span');
            replyText.textContent = comment.totalReplyCount == 1 ? `${comment.totalReplyCount} reply` : `${comment.totalReplyCount} replies`;
            replyDiv.appendChild(replyText);

            replyDiv.onmouseenter = () => {
                replyDiv.style.background = '#263850'; 
            };
            replyDiv.onmouseleave = () => {
                replyDiv.style.background = '';
            };
            replyDiv.style.borderRadius = '16px';
            replyDiv.style.padding = '8px 14px 8px 8px';
            replyDiv.style.transition = 'background 0.2s';

            replyDiv.addEventListener('click', async (e) => {
                e.stopPropagation();

                if (li.dataset.repliesOpen === 'true') {
                    // Close replies
                    let existingRepliesSection = li.querySelector('.replies-section');
                    if (existingRepliesSection) existingRepliesSection.remove();
                    li.dataset.repliesOpen = 'false';
                    // Change arrow to down
                    arrow.innerHTML = `<svg height="20" width="20" viewBox="0 0 24 24" style="vertical-align:middle; margin-right:6px; transition: filter 0.2s;" fill="none" stroke="#3EA6FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`;
                    return;
                }

                // Open replies
                li.dataset.repliesOpen = 'true';
                arrow.innerHTML = `<svg height="20" width="20" viewBox="0 0 24 24" style="vertical-align:middle; margin-right:6px; transition: filter 0.2s;" fill="none" stroke="#3EA6FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 15 12 9 18 15"/></svg>`;
                let existingRepliesSection = li.querySelector('.replies-section');
                if (existingRepliesSection) existingRepliesSection.remove();

                const repliesSection = document.createElement('div');
                repliesSection.className = 'replies-section';
                repliesSection.style.margin = '8px 0 0 0';
                repliesSection.style.padding = '0 0 0 32px';
                repliesSection.style.listStyleType = 'none';
                repliesSection.style.minHeight = '24px';
                repliesSection.innerHTML = '<span style="color:#aaa;">Loading replies...</span>';

                infoDiv.insertBefore(repliesSection, replyDiv.nextSibling);

                chrome.runtime.sendMessage({
                    type: 'FETCH_REPLIES',
                    commentId: comment.id
                }, (replies) => {
                    repliesSection.innerHTML = '';
                    if (replies && Array.isArray(replies) && replies.length > 0) {
                        const repliesList = document.createElement('ul');
                        repliesList.style.margin = '0';
                        repliesList.style.padding = '0';
                        repliesList.style.listStyleType = 'none';
                        
                        for (const reply of replies) {
                            const replyLi = document.createElement('li');
                            replyLi.style.display = 'flex';
                            replyLi.style.alignItems = 'flex-start';
                            replyLi.style.marginBottom = '12px';
                            replyLi.style.color = '#fff';

                            // Profile picture (left)
                            const profilePicture = document.createElement('img');
                            profilePicture.src = reply.profilePicture;
                            profilePicture.alt = reply.author;
                            profilePicture.style.width = '32px';
                            profilePicture.style.height = '32px';
                            profilePicture.style.borderRadius = '50%';
                            profilePicture.style.marginRight = '12px';

                            replyLi.appendChild(profilePicture);

                            // Info container 
                            const replyInfoDiv = document.createElement('div');
                            replyInfoDiv.style.display = 'flex';
                            replyInfoDiv.style.flexDirection = 'column';
                            replyInfoDiv.style.justifyContent = 'flex-start';
                            replyInfoDiv.style.alignItems = 'flex-start';

                            // Author and time container for replies
                            const authorTimeDiv = document.createElement('div');
                            authorTimeDiv.style.display = 'flex';
                            authorTimeDiv.style.alignItems = 'center';
                            authorTimeDiv.style.gap = '8px';

                            // Author
                            const replyAuthor = document.createElement('a');
                            replyAuthor.textContent = reply.author;
                            replyAuthor.href = reply.channelUrl || '#';
                            replyAuthor.target = '_blank';
                            replyAuthor.rel = 'noopener noreferrer';
                            replyAuthor.style.fontWeight = 'bold';
                            replyAuthor.style.color = 'white';
                            replyAuthor.style.fontSize = '13px';
                            replyAuthor.style.textDecoration = 'none';
                            replyAuthor.style.marginBottom = '2px';

                            // Time ago (right of username)
                            const timeAgo = document.createElement('span');
                            timeAgo.textContent = formatTimeStamp(reply.publishedAt);
                            timeAgo.style.color = '#888';
                            timeAgo.style.fontSize = '13px';
                            timeAgo.style.marginBottom = '2px';

                            authorTimeDiv.appendChild(replyAuthor);
                            authorTimeDiv.appendChild(timeAgo);
                            replyInfoDiv.appendChild(authorTimeDiv);

                            // Comment text
                            const replyText = document.createElement('div');
                            replyText.textContent = reply.text;
                            replyText.style.margin = '4px 0 4px 0';
                            replyText.style.fontSize = '14px';
                            replyText.style.color = '#fff';
                            replyInfoDiv.appendChild(replyText);

                            // Like count with icon
                            const likeDiv = document.createElement('div');
                            likeDiv.style.display = 'flex';
                            likeDiv.style.alignItems = 'center';
                            likeDiv.style.gap = '4px';
                            likeDiv.style.fontSize = '0.95em';
                            likeDiv.style.color = '#aaa';
                            likeDiv.style.margin = '8px 0';
                            likeDiv.style.marginBottom = '0px';
                            likeDiv.innerHTML = `<svg height="18" width="18" viewBox="0 0 24 24" style="vertical-align:middle;" fill="none" stroke="#fff" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M1 21h4V9H1v12z" stroke="#fff"/><path d="M23 10c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 2 7.59 8.59C7.22 8.95 7 9.45 7 10v8c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1z" stroke="#fff"/></svg>`;
                            const likeCountSpan = document.createElement('span');
                            likeCountSpan.textContent = reply.likeCount != null ? formatLikeCount(reply.likeCount) : '0';
                            likeCountSpan.style.marginLeft = '4px';
                            likeDiv.appendChild(likeCountSpan);
                            replyInfoDiv.appendChild(likeDiv);

                            replyLi.appendChild(replyInfoDiv);
                            repliesList.appendChild(replyLi);
                        }
                        repliesSection.appendChild(repliesList);
                    } else {
                        const noReply = document.createElement('span');
                        noReply.textContent = 'No replies found.';
                        noReply.style.color = '#aaa';
                        repliesSection.appendChild(noReply);
                    }
                });
            });
        } else {
            replyDiv.textContent = '';
        }
        infoDiv.appendChild(replyDiv);

        li.appendChild(infoDiv);
        list.appendChild(li);
    }

    popup.appendChild(closeBtn);
    popup.appendChild(title);
    popup.appendChild(list);

    // fetch 1000 more new comments from youtube API
    if (canLoadMoreFromYouTube) {
        const loadMoreBtn = document.createElement('button');
        loadMoreBtn.textContent = 'Load more comments';
        loadMoreBtn.style.background = '#222';
        loadMoreBtn.style.color = '#3EA6FF';
        loadMoreBtn.style.border = '1px solid #3EA6FF';
        loadMoreBtn.style.borderRadius = '18px';
        loadMoreBtn.style.padding = '10px 24px';
        loadMoreBtn.style.fontSize = '15px';
        loadMoreBtn.style.fontWeight = 'bold';
        loadMoreBtn.style.cursor = 'pointer';
        loadMoreBtn.style.margin = '24px auto 0 auto';
        loadMoreBtn.style.display = 'block';
        loadMoreBtn.style.transition = 'background 0.2s, color 0.2s, border 0.2s';
        loadMoreBtn.onmouseenter = () => {
            loadMoreBtn.style.background = '#3EA6FF';
            loadMoreBtn.style.color = '#fff';
            loadMoreBtn.style.border = '1px solid #3EA6FF';
        };
        loadMoreBtn.onmouseleave = () => {
            loadMoreBtn.style.background = '#222';
            loadMoreBtn.style.color = '#3EA6FF';
            loadMoreBtn.style.border = '1px solid #3EA6FF';
        };
        loadMoreBtn.onclick = () => {
            chrome.runtime.sendMessage({ 
                type: 'LOAD_MORE_YOUTUBE_COMMENTS',
                nextPageToken: nextPageToken,
                keyword: keyword,
                videoId: videoId,
                comments: comments
            }, (response) => {
                if (response && Array.isArray(response.comments)) {
                    // Pass current filtered comment count as prevCount
                    createPopup(
                        response.comments,
                        response.keyword,
                        response.nextPageToken,
                        response.canLoadMoreFromYouTube,
                        response.videoId,
                        'buttom',
                        comments.length
                    )
                }
            });
        };
        popup.appendChild(loadMoreBtn);
    }

    document.body.appendChild(popup);

    setTimeout(() => popup.classList.add('popup-open'), 10);
}

chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
    if (message.type === 'SHOW_COMMENTS_POPUP') {
        createPopup(
            message.comments,
            message.keyword,
            message.nextPageToken,
            message.canLoadMoreFromYouTube || false,
            message.videoId
        );
    }
})

function formatTimeStamp(time) {
    const timeObject = new Date(time)
    const unixMil = timeObject.getTime()

    const commentUnixTime = Math.floor(unixMil / 1000)
    const currentUnixTime = Math.floor(Date.now() / 1000)

    if ((currentUnixTime - commentUnixTime) < 60) {
        const seconds = currentUnixTime - commentUnixTime;
        return seconds + ' second' + (seconds === 1 ? '' : 's') + ' ago';
    } else if ((currentUnixTime - commentUnixTime) < 3600) {
        const minutes = Math.floor((currentUnixTime - commentUnixTime) / 60);
        return minutes + ' minute' + (minutes === 1 ? '' : 's') + ' ago';
    } else if ((currentUnixTime - commentUnixTime) < 86400) {
        const hours = Math.floor((currentUnixTime - commentUnixTime) / 3600);
        return hours + ' hour' + (hours === 1 ? '' : 's') + ' ago';
    } else if ((currentUnixTime - commentUnixTime) < 604800) {
        const days = Math.floor((currentUnixTime - commentUnixTime) / 86400);
        return days + ' day' + (days === 1 ? '' : 's') + ' ago';
    } else if ((currentUnixTime - commentUnixTime) < 2592000) {
        const weeks = Math.floor((currentUnixTime - commentUnixTime) / 604800);
        return weeks + ' week' + (weeks === 1 ? '' : 's') + ' ago';
    } else if ((currentUnixTime - commentUnixTime) < 31536000) { 
        const months = Math.floor((currentUnixTime - commentUnixTime) / 2592000);
        return months + ' month' + (months === 1 ? '' : 's') + ' ago';
    } else {
        const years = Math.floor((currentUnixTime - commentUnixTime) / 31536000);
        return years + ' year' + (years === 1 ? '' : 's') + ' ago';
    }
}

function formatLikeCount(likes) {
    if (likes >= 1000 && likes < 10000) {
        return likes.toString().slice(0, 1) + (likes.toString().slice(1, 2) >= 1 ? '.' + likes.toString().slice(1, 2) : '') + 'k'
    } else if (likes >= 10000 && likes < 100000) {
      return likes.toString().slice(0, 2) + 'k'
    } else if (likes >= 100000 && likes < 1000000) {
      return likes.toString().slice(0, 3) + 'k'
    } else if (likes >= 1000000 && likes < 10000000) {
      return likes.toString().slice(0, 1) + (likes.toString().slice(1, 2) >= 1 ? '.' + likes.toString().slice(1, 2) : '') + 'm'
    } else return likes
}