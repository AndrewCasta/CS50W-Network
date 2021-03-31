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
