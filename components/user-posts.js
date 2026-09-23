import { USER_POSTS_PAGE, AUTH_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { posts, goToPage, user } from "../index.js";
import { likePost, dislikePost } from "../api.js";
import { formatDate } from "../helpers.js";

export function renderUserPostsPageComponent({ appEl }) {
  if (posts.length === 0) {
    appEl.innerHTML = `
      <div class="page-container">
        <div class="header-container"></div>
        <p style="color: #ffffff; text-align: center; padding: 40px 0;">
          У пользователя пока нет постов
        </p>
      </div>
    `;

    renderHeaderComponent({
      element: document.querySelector(".header-container"),
    });

    return;
  }

  const postsHtml = posts
    .map((post) => {
      const isLiked = post.isLiked;
      return `
        <li class="post">
          <div class="post-header" data-user-id="${post.user.id}">
            <img src="${post.user.imageUrl}" class="post-header__user-image">
            <p class="post-header__user-name">${post.user.name}</p>
          </div>
          <div class="post-image-container">
            <img class="post-image" src="${post.imageUrl}">
          </div>
          <div class="post-likes">
            <button data-post-id="${post.id}" class="like-button">
              <img src="${
                isLiked
                  ? "./assets/images/like-active.svg"
                  : "./assets/images/like-not-active.svg"
              }">
            </button>
            <p class="post-likes-text">
              Нравится: <strong>${post.likes.length}</strong>
            </p>
          </div>
          <p class="post-text">
            <span class="user-name">${post.user.name}</span>
            ${post.description}
          </p>
          <p class="post-date">
            ${formatDate(post.createdAt)}
          </p>
        </li>
      `;
    })
    .join("");

  const appHtml = `
    <div class="page-container">
      <div class="header-container"></div>
      <ul class="posts">
        ${postsHtml}
      </ul>
    </div>
  `;

  appEl.innerHTML = appHtml;

  renderHeaderComponent({
    element: document.querySelector(".header-container"),
  });

  for (let likeButton of document.querySelectorAll(".like-button")) {
    likeButton.addEventListener("click", () => {
      if (!user) {
        alert("Чтобы поставить лайк, авторизуйтесь");
        goToPage(AUTH_PAGE);
        return;
      }

      const postId = likeButton.dataset.postId;
      const post = posts.find((p) => p.id === postId);
      if (!post) return;

      const token = `Bearer ${user.token}`;
      const action = post.isLiked ? dislikePost : likePost;

      action({ token, postId })
        .then((updatedPost) => {
          const index = posts.findIndex((p) => p.id === postId);
          if (index !== -1) {
            posts[index] = updatedPost;
          }
          const userId = posts[0]?.user?.id;
          goToPage(USER_POSTS_PAGE, { userId });
        })
        .catch((error) => {
          alert(error.message);
        });
    });
  }
}