// Get the current user's id
const userID = JSON.parse(document.getElementById('user_id').textContent);
console.log(userID);

// ========
// Add post
// ========

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

// =========
// All posts
// =========

const postsDOM = document.querySelector('.posts');
loadPosts();

async function loadPosts() {
  const response = await fetch('/posts');
  const data = await response.json();
  renderPosts(data);
}

function renderPosts(posts) {
  const postsHtml = posts
    .map(postItem => {
      const { user, post, datetime, likes } = postItem;
      return `<div class="post">
              <h4>${user}</h4>
              <p>${post}</p>
              <p>${datetime}</p>
              <p>Likes: ${likes}</p>
              </div>`;
    })
    .join('');
  postsDOM.innerHTML = postsHtml;
}

// ============
// Profile Page
// ============

async function toggleFollow() {
  const reponse = await fetch('/follow/user2', {
    method: 'POST',
  });
  const data = await reponse.json();
  console.log(data);
}
