// Get the current user's id
const authUsername = JSON.parse(
  document.getElementById('username').textContent
);
console.log(authUsername);

// DOM sections
const allPostsDOM = document.querySelector('#all-posts');
const profileDOM = document.querySelector('#profile');
const followingeDOM = document.querySelector('#following');
const followingePostsDOM = document.querySelector('#following-posts');
const postsDOM = document.querySelector('.posts');
const profilPostsDOM = document.querySelector('#profile-posts');

const listDOMs = [allPostsDOM, profileDOM, followingeDOM];

// Nav Buttons
const allPostsNav = document.querySelector('#all-posts-nav');
const profileNav = document.querySelector('#profile-nav');
const followingNav = document.querySelector('#following-nav');

// Paginator navs
const allPostsPageNav = document.querySelector('#posts-page-nav');
const followingPostsPageNav = document.querySelector('#following-page-nav');
const profilePostsPageNav = document.querySelector('#profile-page-nav');

// Initial page state
loadPosts(postsDOM, allPostsPageNav);
changeDOM(allPostsDOM);

// =========
// All-posts
// =========

const addPostButton = document.querySelector('#addPost');

allPostsNav.addEventListener('click', e => {
  e.preventDefault();
  loadPosts(postsDOM, allPostsPageNav);
  changeDOM(allPostsDOM, profileDOM);
});

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
    loadPosts(postsDOM, allPostsPageNav);
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

function loadFollowingPage() {
  const username = followingNav.dataset.username;
  loadPosts(followingePostsDOM, followingPostsPageNav, undefined, username);

  changeDOM(followingeDOM);
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

// set-up follow button
const followButton = $('#profile-follow');
if (followButton) {
  followButton.addEventListener('click', e => {
    clickHandlerFollowButton(e.currentTarget.dataset.username);
  });
}

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
  loadPosts(profilPostsDOM, profilePostsPageNav, username);

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
async function loadPosts(
  targetPostsDOM,
  targetPaginationDOM,
  username = '',
  following = '',
  page = 1
) {
  const response = await fetch(
    `/posts?username=${username}&following=${following}&page=${page}`
  );
  const data = await response.json();
  const postsHtml = data.posts
    .map(postItem => {
      const { id, username, post, datetime, likes } = postItem;
      const editLink = `<a href="" data-postid="${id}" class="edit-link">edit</a>`;
      return `<div class="post">
            <h4 class="username-click" data-username="${username}">${username}</h4>
            <p class="post-body">${post}</p>
            <p>${datetime}</p>
            <p>Likes: ${likes}</p>
            ${username === authUsername ? editLink : ''}
            </div>`;
    })
    .join('');
  targetPostsDOM.innerHTML = postsHtml;

  // Add event handlers to all usernames for profile nav
  document.querySelectorAll('.username-click').forEach(clickHandle => {
    clickHandle.addEventListener('click', e => {
      username = e.currentTarget.dataset.username;
      loadProfilePage(username);
    });
  });

  // Add event handlers for edit buttons
  targetPostsDOM.querySelectorAll('.edit-link').forEach(clickHandle => {
    clickHandle.addEventListener('click', e => {
      e.preventDefault();
      const postId = e.currentTarget.dataset.postid;
      console.log(e.currentTarget.dataset);
      console.log(postId);
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
    });
  });

  // Build the pagination
  page = parseInt(data.pagination.page);
  const {
    page_total: pageTotal,
    has_next: hasNext,
    has_previous: hasPrevious,
  } = data.pagination;

  let pageButtonsHTML = '';
  for (let i = 1; i <= pageTotal; i++) {
    pageButtonsHTML += `<li data-pagination="${i}" class="page-item ${
      i == page ? 'active' : ''
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
  targetPaginationDOM.innerHTML = paginatorHTML;

  // add event handles
  const pageItems = targetPaginationDOM.querySelectorAll('.page-item');

  for (const item of pageItems) {
    item.addEventListener('click', () => {
      if (item.dataset.pagination === 'previous') previousPage();
      if (item.dataset.pagination === 'next') nextPage();
      if (parseInt(item.dataset.pagination)) linkPage(item.dataset.pagination);
    });
  }

  function previousPage() {
    page--;
    if (page < 1) page = 1;
    loadPosts(targetPostsDOM, targetPaginationDOM, username, following, page);
  }
  function nextPage() {
    page++;
    if (page > pageTotal) page = pageTotal;
    loadPosts(targetPostsDOM, targetPaginationDOM, username, following, page);
  }
  function linkPage(page) {
    loadPosts(targetPostsDOM, targetPaginationDOM, username, following, page);
  }
}

function $(selector) {
  try {
    return document.querySelector(selector);
  } catch (error) {
    console.log(`Cannot find ${selector}`);
  }
}
