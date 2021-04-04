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

profileNav.addEventListener('click', e => {
  e.preventDefault();
  username = e.currentTarget.dataset.username;
  loadProfilePage(username);
});

async function loadProfilePage(username) {
  console.log(username);
  // fetch the profile data
  const response = await fetch(`/profile/${username}`);
  const data = await response.json();
  console.log(data);

  const {
    followers_count: followersCount,
    following_count: followingCount,
  } = data;

  // fill in the basic user profile info
  document.querySelector('#profile-username').innerHTML = username;
  document.querySelector('#profile-followers').innerHTML = followersCount;
  document.querySelector('#profile-following').innerHTML = followingCount;

  // check and update follow button
  ('#profile-follow');

  // add their posts (fetch helper)
  loadPosts(profilPostsDOM, username);

  // Swap the DOM
  changeDOM(profileDOM);
}

async function toggleFollow() {
  const reponse = await fetch('/follow/user2', {
    method: 'POST',
  });
  const data = await reponse.json();
  console.log(data);
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
            <h4>${username}</h4>
            <p>${post}</p>
            <p>${datetime}</p>
            <p>Likes: ${likes}</p>
            </div>`;
    })
    .join('');
  targetDOM.innerHTML = postsHtml;
}
