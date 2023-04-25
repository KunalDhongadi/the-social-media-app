from .models import Post,User,UserStat

def get_user_stat(request):
    if(request.user.is_authenticated):
        userStat = UserStat.objects.get(user=request.user)
        userdata = userStat.serialize()
    else:
        userdata = None


    return {
        'userdata': userdata
    }