from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Post, Follow, Like

# Register your models here.
admin.site.register(User, UserAdmin)
admin.site.register(Post)
admin.site.register(Follow)
admin.site.register(Like)
