// Get the current user's id
const userID = JSON.parse(document.getElementById('user_id').textContent);
console.log(userID);

// DOM sections
const allPostsDOM = document.querySelector('#all-posts');
const profileDOM = document.querySelector('#profile');
const postsDOM = document.querySelector('.posts');
const profilPostsDOM = document.querySelector('#profile-posts');

const listDOMs = [allPostsDOM, profileDOM];

// Nav Buttons
const allPostsNav = document.querySelector('#all-posts-nav');
const profileNav = document.querySelector('#profile-nav');
const followingNav = document.querySelector('#following-nav');

// Initial page state
loadPosts(postsDOM);
changeDOM(allPostsDOM);

// =========
// All-posts
// =========

allPostsNav.addEventListener('click', e => {
  e.preventDefault();
  loadPosts(postsDOM);
  changeDOM(allPostsDOM, profileDOM);
  const addPostButton = document.querySelector('#addPost');

  if (addPostButton) {
    addPostButton.addEventListener('click', async e => {
      e.preventDefault();
      const post = document.querySelector('#post');
      await fetch(`/add_post`, {
        method: 'POST',
        body: JSON.stringify({
          post: post.value,
        }),
      });
      post.value = '';
      loadPosts();
    });
  }
});

// ============
// Profile Page
// ============

if (profileNav) {
  profileNav.addEventListener('click', e => {
    e.preventDefault();
    loadProfilePage(e.currentTarget.dataset.username);
  });
}

// set-up follow button
const followButton = $('#profile-follow');
followButton.addEventListener('click', e => {
  clickHandlerFollowButton(e.currentTarget.dataset.username);
});

async function loadProfilePage(username) {
  // fetch the profile data
  const response = await fetch(`/profile/${username}`);
  const data = await response.json();

  let {
    followers_count: followersCount,
    following_count: followingCount,
    is_self: isSelf,
    is_following: isFollowing,
  } = data;

  // fill in the basic user profile info
  document.querySelector('#profile-username').innerHTML = username;
  document.querySelector('#profile-username').innerHTML = username;
  document.querySelector('#profile-followers').innerHTML = followersCount;
  document.querySelector('#profile-following').innerHTML = followingCount;

  // check and update follow button
  if (followButton) {
    followButton.dataset.username = username;
    isSelf
      ? (followButton.style.display = 'none')
      : (followButton.style.display = 'block');

    isFollowing
      ? (followButton.innerHTML = 'Unfollow')
      : (followButton.innerHTML = 'Follow');
  }

  // add their posts (fetch helper)
  loadPosts(profilPostsDOM, username);

  // Swap the DOM
  changeDOM(profileDOM);
}

async function clickHandlerFollowButton(username) {
  const reponse = await fetch(`/follow/${username}`, {
    method: 'POST',
  });
  const data = await reponse.json();
  data.following
    ? (followButton.innerHTML = 'Unfollow')
    : (followButton.innerHTML = 'Follow');
  document.querySelector('#profile-followers').innerHTML = data.followers_count;
}

// ============
// Helpers
// ============

/**
 * Turn on section, but all others off. List of others maintained in listDOMs
 * @param {*} onDOM - DOM elements to be turned on
 */
function changeDOM(onDOM) {
  for (const DOM of listDOMs) {
    DOM.style.display = 'none';
  }
  onDOM.style.display = 'block';
}

/**
 *
 * @param {*} targetDOM - DOM node to load the posts html
 * @param {*} username - optional arg to load specific user's posts
 * @param {*} following - optional arg to load specific posts user is following
 */
async function loadPosts(targetDOM, username = '', following = '') {
  const response = await fetch(
    `/posts?username=${username}&following=${following}`
  );
  const posts = await response.json();
  const postsHtml = posts
    .map(postItem => {
      const { username, post, datetime, likes } = postItem;
      return `<div class="post">
            <h4 class="username-click" data-username="${username}">${username}</h4>
            <p>${post}</p>
            <p>${datetime}</p>
            <p>Likes: ${likes}</p>
            </div>`;
    })
    .join('');
  targetDOM.innerHTML = postsHtml;
  document.querySelectorAll('.username-click').forEach(clickHandle => {
    clickHandle.addEventListener('click', e => {
      username = e.currentTarget.dataset.username;
      loadProfilePage(username);
    });
  });
}

function $(selector) {
  try {
    return document.querySelector(selector);
  } catch (error) {
    console.log(`Cannot find ${selector}`);
  }
}
