import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.core import serializers
from django.db import IntegrityError
from network.models import User, Post, Follow, Like
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt


def index(request):
    return render(request, "network/index.html")


@login_required
@csrf_exempt
def add_post(request):
    if request.method == "POST":
        post_body = json.loads(request.body)["post"]
        user = request.user

        post = Post(post=post_body, user=user)
        post.save()

        return JsonResponse({"message": "post added successfully"}, status=200)

    return HttpResponseRedirect(reverse("index"))


@login_required
@csrf_exempt
def posts(request):
    if request.method == "GET":

        posts = Post.objects.all().order_by("-datetime")

        return JsonResponse(
            [
                {
                    "id": post.id,
                    "user": post.user.username,
                    "post": post.post,
                    "datetime": post.datetime.strftime("%b %w, %Y - %I:%M%p"),
                    "likes": post.likes.count(),
                }
                for post in posts
            ],
            safe=False,
        )

    return HttpResponseRedirect(reverse("index"))


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(
                request,
                "network/login.html",
                {"message": "Invalid username and/or password."},
            )
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(
                request, "network/register.html", {"message": "Passwords must match."}
            )

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(
                request, "network/register.html", {"message": "Username already taken."}
            )
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
