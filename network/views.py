from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.db.models import Q 
from django.http import JsonResponse
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator

from .models import Post,User,UserStat

import datetime
import json

def index(request):
    return render(request, "network/index.html", {"loggedIn" :request.user.is_authenticated})


# API function to get Posts.
# Takes type ("all"/"following"/user) in request body. Returns list of posts accordingly
def getPosts(request):

    type = request.GET.get('type', 'all')
    page = request.GET.get('page', 1)
    page = int(page) - 1
    
    # type of posts required
    if type=="all":
        posts = Post.objects.all().order_by('-posttime')[page*10:(page*10 + 10)]
    elif type=="following":
        userStat = UserStat.objects.get(user=request.user)
        followings = userStat.following.all()
        posts = Post.objects.filter(Q(user=request.user) | Q(user__in=followings)).order_by('-posttime')[page*10:(page*10 + 10)]
    else:
        user_obj = User.objects.get(username=type)
        if not user_obj:
            return JsonResponse({"error" : "User does not exists"}, safe=False)
        posts = Post.objects.filter(user=user_obj).order_by('-posttime')[page*10:(page*10 + 10)]


    if request.user.is_authenticated:
        currentUser = request.user
        allPosts = [post.serialize(currentUser) for post in posts]
    else:
        allPosts = [post.serialize() for post in posts]

    # serialized_posts = []
    # for post in posts:
    #     if request.user.is_authenticated:
    #         serialized_post = post.serialize(request.user)
    #     else:
    #         serialized_post = post.serialize()
    #     serialized_posts.append(serialized_post)


    data = {
        "allPosts" : allPosts,
        "isLoggedIn" : request.user.is_authenticated,
        "currentUser" : request.user.username
    }
    return JsonResponse(data, safe=False)


# API Function
@login_required
def getSuggestedUsers(request):
    not_following_users = UserStat.objects.exclude(
    Q(user=request.user) | Q(followers=request.user)
    ).distinct()[0:3]

    allUsers = [user.serialize(request.user) for user in not_following_users]

    # current_user = User.objects.get(id=request.user.id)
    # users_not_following = User.objects.exclude(userstat__followers=current_user)

    return JsonResponse({'users': allUsers})


@login_required
def getRelevantUsers(request):

    post_id = request.GET.get('post_id')

    post = Post.objects.get(id=post_id)

    relevantUsers = []

    postObj = post.serialize()
    postOwner = postObj.get("postOwner")

    userObj = User.objects.get(username = postOwner)
    userStatObj = UserStat.objects.get(user = userObj)
    relevantUsers.append(userStatObj.serialize())

    if(postObj.get("replied_to")):

        repliedToUser = User.objects.get(username= postObj.get("replied_to").get("postOwner"))
        repliedUserStat = UserStat.objects.get(user=repliedToUser)
        relevantUsers.append(repliedUserStat.serialize(request.user))


        # for reply in postObj.get("replies"):
        #     if(reply.get("postOwner") == postOwner):
        #         continue
        #     userObj = User.objects.get(username = reply.get("postOwner"))
        #     userStatObj = UserStat.objects.get(user = userObj)
        #     relevantUsers.append(userStatObj.serialize(request.user))


    return JsonResponse({'users': relevantUsers})
        




def getUserPost(request,username, post_id):
    currentUser = request.user
    user_obj = User.objects.get(username=username)

    if not user_obj:
        return JsonResponse({"error" : "User does not exists"}, safe=False)
    

    try:
        post = Post.objects.get(id=post_id)

        if request.user.is_authenticated:
            post = post.serialize(request.user)
        else:
            post = post.serialize()
    except Post.DoesNotExist:
        post = {}

    # post = list(post.values())
    # print(post.serialize())
    
    data = {
        "post" : post,
        "isLoggedIn" : request.user.is_authenticated,
        "currentUser" : currentUser.username
    }
    return JsonResponse(data, safe=False)




# API function to get user
def getUser(request):
    data = {
        "isLoggedIn" : request.user.is_authenticated,
        "user" : request.user.username
    }
    return JsonResponse(data, safe=False)


# API function to get userStats
def getUserStats(request, user):
    profileOwner = False
    currentUser = request.user
    try:
        user_obj = User.objects.get(username=user)
    except User.DoesNotExist:
         return JsonResponse({"error" : "User does not exists"}, safe=False)

    # print("---------------------")
    # print(UserStat.objects.filter(user=user_obj).exists())
    # print("------------")
    
    if currentUser == user_obj:
        profileOwner = True
    userStatObj = UserStat.objects.get(user=user_obj)
    userStatsData = userStatObj.serialize()
    if request.user.is_authenticated:
        userStatsData = userStatObj.serialize(currentUser)

    data = {
        "userStats": userStatsData,
        "profileOwner" : profileOwner
    }
    return JsonResponse(data, safe=False)



@csrf_exempt
@login_required
def like(request):
    currentUser = request.user
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    
    post_id = json.loads(request.body)
    try:
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        return JsonResponse({'error': 'Post not found'}, status=404)
    
    if post.likes.filter(id=currentUser.id).exists():
        post.likes.remove(currentUser)
        return JsonResponse({'liked' : False , 'message' : 'Post unliked successfully'})
    else:
        post.likes.add(currentUser)
        return JsonResponse({'liked' : True ,'message' : 'Post liked successfully'})
    

@csrf_exempt
@login_required
def follow(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    
    currentUser = request.user
    username = json.loads(request.body)
    try:
        otherUser = User.objects.get(username=username)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    
    currentUserStat = UserStat.objects.get(user=currentUser)
    otherUserStat = UserStat.objects.get(user=otherUser)

    # if current user is already following the other user-
    # remove current user from other user's followers list
    # And remove other user from the currentuser's following list.
    if otherUserStat.followers.filter(id=currentUser.id).exists():
        otherUserStat.followers.remove(currentUser)
        currentUserStat.following.remove(otherUser)
        return JsonResponse({'followed' : False , 'message' : 'User unfollowed successfully'})
    else:
        otherUserStat.followers.add(currentUser)
        currentUserStat.following.add(otherUser)
        return JsonResponse({'followed' : True , 'message' : 'User followed successfully'})



@csrf_exempt
@login_required
def delete(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    
    currentUser = request.user
    userObj = User.objects.get(id = currentUser.id)


    post_id = json.loads(request.body)
    try:
        post = Post.objects.get(id=post_id, user=userObj)

        # `print("-------")
        # print(post)`

    except User.DoesNotExist:
        return JsonResponse({'error': 'Post not found'}, status=404)
    
    post.delete()
    return JsonResponse({'deleted' : True , 'message' : 'post deleted successfully'})





@csrf_exempt
@login_required
def addPost(request):
    currentUser = request.user
    # Composing a new email must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    
    data = json.loads(request.body)

    post = Post()
    post.user = currentUser
    post.body = data["value"]
    post.styles = data["style"]
    if("parent" in data):
        parentPost = Post.objects.get(id=data["parent"])
        post.parent_post = parentPost
    post.posttime = datetime.datetime.now()
    post.save()

    data = {
        "body" : post.serialize(),
        "message" : "The Post was posted successfully!"
    }

    
    return JsonResponse(data, safe=False, status=201)


@csrf_exempt
@login_required
def addUserStat(request):
    currentUser = request.user
    # Composing a new email must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    
    data = json.loads(request.body)

    userStat = UserStat.objects.get(user=currentUser)
    userStat.imageUrl = data["image_url"]
    userStat.bio = data["bio"]
    userStat.save()

    dataObj = {
        "body" : userStat.serialize(),
        "message" : "The user details were updated successfully!"
    }

    return JsonResponse(dataObj, safe=False, status=201)






def profile(request, username):
    userExists = False
    try:
        searchedUser = User.objects.get(username=username)
        userExists = True
    except User.DoesNotExist:
        pass
    return render(request, "network/profile.html", {
        "username" : username,
        "userExists" : userExists
    })


def userPost(request, username, post_id):
    return render(request, "network/userpost.html", {
        "username" : username,
        "post_id" : post_id
    })



def guest_login(request):
    user = authenticate(request, username="jon", password="jon123")
    if user is not None:
        login(request, user)
        return HttpResponseRedirect(reverse("index"))


def login_view(request):

    if request.user.is_authenticated:
        return HttpResponseRedirect(reverse('index'))

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
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")
    


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):

    if request.user.is_authenticated:
        return HttpResponseRedirect(reverse('index'))
    
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        if username=="login" or username=="signup" or username=="posts" or username=="logout":
            return render(request, "network/register.html", {
                "message": "Please enter valid username."
            })

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user_stat = UserStat(user=user, timestamp=datetime.datetime.now())
            user.save()
            user_stat.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")










# index will show all the posts posted by users in chronological order
# post function will let users post a new post through post method 
# profile function will take to user profile page which shows his followings , followers
# - and all his/her posts
# logged in user should be able to follow/unfollow that user