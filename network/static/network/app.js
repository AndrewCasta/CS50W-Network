const addPostButton = document.querySelector('#addPost');

if (addPostButton) {
  addPostButton.addEventListener('click', e => {
    e.preventDefault();
    const post = document.querySelector('#post');
    fetch(`/add_post`, {
      method: 'POST',
      body: JSON.stringify({
        post: post.value,
      }),
    });
    post.value = '';
  });
}

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
