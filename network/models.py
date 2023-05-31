from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models import JSONField


class User(AbstractUser):
    pass

class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="userpost")
    body = models.CharField(max_length=1024)
    posttime = models.DateTimeField()
    likes = models.ManyToManyField(User,blank=True, related_name="likes")
    parent_post = models.ForeignKey("self", blank=True, null=True, related_name="replies", on_delete=models.CASCADE)
    styles = JSONField(blank=True, null=True)
    # child_posts = models.ManyToManyField('self', blank=True, null=True, related_name="replies")
    
    def serialize(self, user = None):
        user_stat = self.user.userstat.get(user=self.user)
        data = {
            "id": self.id,
            "postOwner": self.user.username,
            "post" : self.body,
            "postOwner_image": user_stat.imageUrl if user_stat else None,
            "timestamp": self.posttime.strftime("%b %d %Y, %I:%M %p"),
            "likes": self.likes.count(),
            "replied_to" : self.parent_post.serialize(user) if self.parent_post != None else None,
            "replies" :[reply.deadSerialize(user) for reply in self.replies.all()] if self.replies != None else None,
            "replyCount" : self.replies.count(),
            "styles" : self.styles

        }
        if user:
            data["isLiked"] = self.likes.filter(id=user.id).exists()
        return data
    
    def deadSerialize(self, user= None):
        user_stat = self.user.userstat.get(user=self.user)
        data = {
            "id": self.id,
            "postOwner": self.user.username,
            "post": self.body,
            "postOwner_image": user_stat.imageUrl if user_stat else None,
            "timestamp": self.posttime.strftime("%b %d %Y, %I:%M %p"),
            "likes": self.likes.count(),
            # "replied_to" : self.parent_post.user.username,
            "replyCount" : self.replies.count(),
            "styles" : self.styles
        }
        if user:
            data["isLiked"] = self.likes.filter(id=user.id).exists()
        return data


    def __str__(self):
        return f"{self.user} posted {self.body} on {self.posttime}"

class UserStat(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="userstat")
    timestamp = models.DateTimeField()
    bio = models.CharField(max_length=256, blank=True)
    imageUrl = models.CharField(max_length=256, blank=True)
    followers = models.ManyToManyField(User, blank=True, null=True, related_name="followers")
    following = models.ManyToManyField(User, blank=True, null=True, related_name="followings")

    def __str__(self):
        return f"{self.user} has {self.followers} followers and {self.following} followings"

    def serialize(self, user = None):
        data = {
            "id": self.id,
            "username": self.user.username,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "bio": self.bio,
            "image_url" : self.imageUrl,
            "followers": self.followers.count(),
            "followings": self.following.count() 
        }
        if user:
            data["isfollowing"] = self.followers.filter(id=user.id).exists()
            data["follows_you"] = self.following.filter(id=user.id).exists()
        return data

# class Like(models.Model):
#     postid = models.ForeignKey(Post,on_delete=models.CASCADE, null=True, blank=True, related_name="postid")
    
