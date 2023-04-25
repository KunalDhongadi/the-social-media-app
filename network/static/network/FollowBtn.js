const FollowBtn = ({userdata, setuserdata}) => {
     
    const [isFollowing, setIsFollowing] = useState(false);


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

    return(
        <div className="d-flex justify-content-center follow-btn">
            <button className="btn btn-outline-secondary rounded-pill px-4 mx-auto" onClick={handleFollowClick}>{isFollowing ? "Unfollow" : "Follow"}</button>
        </div>
    )
}