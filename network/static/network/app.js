// DOM sections
const allPostsPageDOM = $('#all-posts');
const allPostsDOM = $('.posts');
const profilePageDOM = $('#profile');
const profilPostsDOM = $('#profile-posts');
const followingePageDOM = $('#following');
const followingePostsDOM = $('#following-posts');

const listDOMs = [allPostsPageDOM, profilePageDOM, followingePageDOM];

// Nav Buttons
const allPostsNav = $('#all-posts-nav');
const profileNav = $('#profile-nav');
const followingNav = $('#following-nav');

// Paginator navs
const allPostsPageNav = $('#posts-page-nav');
const followingPostsPageNav = $('#following-page-nav');
const profilePostsPageNav = $('#profile-page-nav');

// state

let allPosts;
let profilePosts;
let profileUserInfo;
let followingPosts;
let pageNum = 1;

// Get the current user's id
const authUsername = JSON.parse($('#username').textContent);

init();

// ===============
// Initialise page
// ===============

async function init() {
  // fetch all posts
  allPosts = await fetchPosts();
  // render all posts, current page
  renderPosts(allPosts, allPostsDOM);
  // render all posts paginator
  renderPaginator(allPosts, allPostsDOM, allPostsPageNav);
  // turn the all posts page on and others off
  changeDOM(allPostsPageDOM);
}

// =========
// All-posts
// =========

const addPostButton = $('#addPost');

allPostsNav.addEventListener('click', async e => {
  e.preventDefault();
  // fetch all posts
  allPosts = await fetchPosts();
  // render all posts, current page
  renderPosts(allPosts, allPostsDOM);
  // render all posts paginator
  renderPaginator(allPosts, allPostsDOM, allPostsPageNav);
  // turn the all posts page on and others off
  changeDOM(allPostsPageDOM);
});

if (addPostButton) {
  addPostButton.addEventListener('click', async e => {
    e.preventDefault();
    const post = $('#post');
    await fetch(`/add_post`, {
      method: 'POST',
      body: JSON.stringify({
        post: post.value,
      }),
    });
    post.value = '';
    // loadPosts(postsDOM, allPostsPageNav);
  });
}

// ============
// Following
// ============

if (followingNav) {
  followingNav.addEventListener('click', e => {
    e.preventDefault();
    loadFollowingPage();
  });
}

async function loadFollowingPage() {
  // fetch all posts
  followingPosts = await fetchPosts({ following: authUsername });
  // render all posts, current page
  renderPosts(followingPosts, followingePostsDOM);
  // render all posts paginator
  renderPaginator(followingPosts, followingePostsDOM, followingPostsPageNav);
  // turn the all posts page on and others off;
  changeDOM(followingePageDOM);
}

// ============
// Profile Page
// ============

if (profileNav) {
  profileNav.addEventListener('click', e => {
    e.preventDefault();
    loadProfilePage(e.currentTarget.dataset.username);
  });
}

async function loadProfilePage(username) {
  profilePosts = await fetchPosts({ username: username });
  profileUserInfo = await fetchProfileInfo(username);

  renderProfileInfo(profileUserInfo);
  renderPosts(profilePosts, profilPostsDOM);
  renderPaginator(profilePosts, profilPostsDOM, profilePostsPageNav);
  changeDOM(profilePageDOM);
}

async function fetchProfileInfo(username) {
  const response = await fetch(`/profile/${username}`);
  data = await response.json();
  return data;
}

function renderProfileInfo(profileUserInfo) {
  // profile loading
  let {
    username,
    followers_count: followersCount,
    following_count: followingCount,
    is_self: isSelf,
    is_following: isFollowing,
  } = profileUserInfo;

  // fill in the basic user profile info
  $('#profile-username').innerHTML = username;
  $('#profile-followers').innerHTML = followersCount;
  $('#profile-following').innerHTML = followingCount;

  // check and update follow button
  if (followButton) {
    followButton.dataset.username = username;
    followButton.style.display = isSelf ? 'none' : 'block';
    followButton.innerHTML = isFollowing ? 'Unfollow' : 'Follow';
  }
}

// set-up follow button
const followButton = $('#profile-follow');
if (followButton) {
  followButton.addEventListener('click', e => {
    clickHandlerFollowButton(e.currentTarget.dataset.username);
  });
}

async function clickHandlerFollowButton(username) {
  const reponse = await fetch(`/follow/${username}`, {
    method: 'POST',
  });
  const data = await reponse.json();
  followButton.innerHTML = data.following ? 'Unfollow' : 'Follow';
  $('#profile-followers').innerHTML = data.followers_count;
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

function $(selector) {
  const element = document.querySelector(selector);
  if (element) return element;
  throw new Error(`Cannot find ${selector}`);
}

/**
 * Fetch posts
 * @param {*} filter optional filter object, { username: 'user1' } or { following: 'user1' }
 * @returns json data of posts filtered
 */
async function fetchPosts(filter) {
  let username = '',
    following = '';
  if (filter) {
    username = filter.username || '';
    following = filter.following || '';
  }
  const url = `/posts?username=${username}&following=${following}`;
  const respone = await fetch(url);
  return await respone.json();
}

/**
 * Render posts for a specific page, to a specific dom object
 * @param {*} postData raw data from /posts endpoint
 * @param {*} postDom target DOM element for posts to be rendered to
 */
function renderPosts(postData, postDom) {
  posts = postData.data[pageNum - 1].posts;

  const postsHtml = posts
    .map(postItem => {
      const {
        id,
        username,
        post,
        datetime,
        likes,
        user_liked: liked,
      } = postItem;
      const editLink = `<a href="" data-postid="${id}" class="edit-link">edit</a>`;
      return `<div class="post">
          <h4 class="username-click" data-username="${username}">${username}</h4>
          <p class="post-body">${post}</p>
          <p>${datetime}</p>
          <span data-postid="${id}" class="like-button ${
        liked ? 'liked' : 'not-liked'
      }">
    <span class="like-icon">${
      liked ? '&#x2764' : '&#x1f494'
    }</span><span class="like-count">${likes}</span></span>
          ${username === authUsername ? editLink : ''}
          </div>`;
    })
    .join('');
  postDom.innerHTML = postsHtml;

  // Add event handlers to all usernames for profile nav
  postDom.querySelectorAll('.username-click').forEach(clickHandle => {
    clickHandle.addEventListener('click', e => {
      usernameClickHandle(e.currentTarget.dataset.username);
    });
  });

  // like button update liked status for user & add handler
  postDom.querySelectorAll('.like-button').forEach(likeButton => {
    likeButton.addEventListener('click', e => {
      likeButtonHandler(e);
    });
  });

  //
  postDom.querySelectorAll('.edit-link').forEach(clickHandle => {
    clickHandle.addEventListener('click', e => editButtonHandler(e));
  });
}

// Post event handlers

function usernameClickHandle(username) {
  loadProfilePage(username);
}

async function likeButtonHandler(e) {
  const postId = e.currentTarget.dataset.postid;
  const likeCountDOM = e.currentTarget.querySelector('.like-count');
  const likeIcon = e.currentTarget.querySelector('.like-icon');

  const response = await fetch(`like/${postId}`, {
    method: 'POST',
  });
  const data = await response.json();
  const { like, like_count: likeCount } = data;

  likeCountDOM.innerHTML = likeCount;
  likeIcon.innerHTML = like ? '&#x2764' : '&#x1f494';
}

// Event handlers for edit buttons
function editButtonHandler(e) {
  e.preventDefault();
  const postId = e.currentTarget.dataset.postid;
  const postDiv = e.currentTarget.parentElement.querySelector('.post-body');
  const editButton = e.currentTarget;

  editButton.style.display = 'none';
  postDiv.style.display = 'none';

  const editBox = document.createElement('textarea');
  const editBoxSave = document.createElement('button');
  editBoxSave.textContent = 'Save';
  editBoxSave.classList.add('btn', 'btn-primary');
  editBox.textContent = postDiv.textContent;
  postDiv.insertAdjacentElement('afterend', editBox);
  editBox.insertAdjacentElement('afterend', editBoxSave);

  editBoxSave.addEventListener('click', () => {
    const newPostBody = editBox.value;
    postDiv.textContent = newPostBody;
    postDiv.style.display = 'block';
    editButton.style.display = 'block';
    editBox.remove();
    editBoxSave.remove();

    fetch(`/edit_post/${postId}`, {
      method: 'PUT',
      body: JSON.stringify({
        post: newPostBody,
      }),
    });
  });
}

/**
 * // Build the pagination
 * @param {*} postData filtered data from /posts
 * @param {*} postDOM target DOM for the paginator to change
 * @param {*} paginatorDOM target paginator DOM
 */
function renderPaginator(postData, postDOM, paginatorDOM) {
  const pageTotal = postData.page_total;
  const { has_next: hasNext, has_previous: hasPrevious } = postData.data[
    pageNum - 1
  ].page;

  let pageButtonsHTML = '';
  for (let i = 1; i <= pageTotal; i++) {
    pageButtonsHTML += `<li data-pagination="${i}" class="page-item ${
      i == pageNum ? 'active' : ''
    }"><a class="page-link">${i}</a></li>`;
  }

  const paginatorHTML =
    `
<li data-pagination="previous" class="page-item ${
      hasPrevious ? '' : 'disabled'
    }"><a class="page-link">Previous</a></li>` +
    pageButtonsHTML +
    `<li data-pagination="next" class="page-item ${
      hasNext ? '' : 'disabled'
    }"><a class="page-link">Next</a></li>
`;
  paginatorDOM.innerHTML = paginatorHTML;

  // add pagination event handles
  paginatorDOM.querySelectorAll('.page-item').forEach(item => {
    item.addEventListener('click', () => {
      if (item.dataset.pagination === 'previous')
        previousPage(postData, postDOM, paginatorDOM);
      if (item.dataset.pagination === 'next')
        nextPage(postData, postDOM, paginatorDOM);
      if (parseInt(item.dataset.pagination))
        linkPage(item.dataset.pagination, postData, postDOM, paginatorDOM);
    });
  });
}

// pagination event handles
function previousPage(postData, postDOM, paginatorDOM) {
  if (pageNum > 1) pageNum--;
  renderPosts(postData, postDOM);
  renderPaginator(postData, postDOM, paginatorDOM);
}
function nextPage(postData, postDOM, paginatorDOM) {
  if (pageNum < postData.page_total) pageNum++;
  renderPosts(postData, postDOM);
  renderPaginator(postData, postDOM, paginatorDOM);
}
function linkPage(newPageNum, postData, postDOM, paginatorDOM) {
  pageNum = newPageNum;
  renderPosts(postData, postDOM);
  renderPaginator(postData, postDOM, paginatorDOM);
}

// ============
// Refactor
// ============

// Add these parameters to the state
// all posts, page
// profile posts, page
// following posts, page

// Init app
// change state and re-apply function

// tackle each function seperately

// fetch data
// change state
// render (posts, paginator) + add event listeners
// event handler funcs
