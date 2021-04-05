from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """"""

    pass


class Post(models.Model):
    """
    post copy
    post date
    poster (user)
    """

    post = models.CharField(max_length=280)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    datetime = models.DateTimeField(auto_now=False, auto_now_add=True)

    def __str__(self):
        return f"{self.user}: {self.post}"


class Follow(models.Model):
    """
    user (fk)
    following (fk)
    """

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="follows")
    follow = models.ForeignKey(User, on_delete=models.CASCADE, related_name="follower")

    def __str__(self):
        return f"{self.user} follows {self.follow}"


class Like(models.Model):
    """
    user (fk)
    post (fk)
    """

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="liked_by")
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="likes")
