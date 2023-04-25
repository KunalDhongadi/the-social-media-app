
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("signup", views.register, name="register"),


    # API routes
    path("getuser", views.getUser, name="getUser"),
    path("addpost", views.addPost, name="addPost"),
    path("getposts", views.getPosts, name="getPosts"),
    path("getsuggested", views.getSuggestedUsers, name="getSuggestedUsers"),
    path("getrelevant", views.getRelevantUsers, name="getRelevantUsers"),
    # path("getposts/<type>", views.getPosts, name="getPosts"),
    path("getuserstats/<user>", views.getUserStats, name="getUserStats"),
    path("getuserpost/<username>/<post_id>", views.getUserPost, name="getUserPost"),
    path("adduserstat", views.addUserStat, name="addUserState"),
    path("like", views.like, name="like"),
    path("follow", views.follow, name="follow"),
    path("delete", views.delete, name="delete"),



    path("<username>", views.profile, name="profile"),
    path("<username>/post/<post_id>", views.userPost, name="userPost"),
    # follow, like
]

# get user stats- bio, followers, followings
