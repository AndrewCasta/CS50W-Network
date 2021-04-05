from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("add_post", views.add_post, name="add_post"),
    path("posts", views.posts, name="posts"),
    path("profile/<str:username>", views.profile, name="profile"),
    path("follow/<str:follow_username>", views.follow, name="follow"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
]
