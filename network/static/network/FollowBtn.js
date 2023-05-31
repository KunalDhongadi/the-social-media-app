const FollowBtn = ({userdata, setuserdata}) => {
     
    const [isFollowing, setIsFollowing] = useState(false);
    const [followingText, setFollowingText] = useState("Following")


    const handleFollowClick = async(event) => {
        event.preventDefault();
        const response = await fetch(`/follow`, {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json'
            },
            body: JSON.stringify(userdata.username)
        });
        if(response.ok){
            const json = await response.json();
            const updatedFollowers = json.followed ? userdata.followers + 1 : userdata.followers - 1;
            setuserdata({ ...userdata, followers: updatedFollowers, isfollowing: !isFollowing });
            setIsFollowing(!isFollowing);
        }
    };

    useEffect( () => {
        setIsFollowing(userdata.isfollowing);
        // console.log("fsd", isFollowing);
    });

    const onmouseover= () =>{
        setFollowingText("Unfollow")
    }
    const onmouseout= (e) =>{
        setFollowingText("Following")
    }

    return(
        <div className="d-flex justify-content-center follow-btn-div">
            <button className="btn rounded-pill px-4 mx-auto follow-btn" onMouseOver={onmouseover} onMouseOut={onmouseout} onClick={handleFollowClick}>{isFollowing ? followingText : "Follow"}</button>
        </div>
    )
}