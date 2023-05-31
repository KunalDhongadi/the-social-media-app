const Profile = ({ profile }) => {

const [profileObj, setProfileObj] = useState(profile);

  return (
    <div className="profile-div rounded-2 mb-3">
      <div className="d-flex p-3 justify-content-between align-items-center">
        <img className="post-profile-thumbnail bg-white rounded-circle "
        src={profileObj.image_url != "" ? profileObj.image_url : '/static/network/img/profile_image.png'} alt={profileObj.username}
        />
        
        <FollowBtn userdata={profileObj} setuserdata={setProfileObj}/>
      </div>
      <div>
        <div className="d-flex align-items-center">
        <p className="post-profile-title fw-bold m-0 ps-3 pe-2 py-0">
          <a href={profileObj.username}>{profileObj.username}</a>
        </p>
          {profileObj.follows_you && <p className="m-0 followsback-div">Follows you</p>}
        </div> 
        
        <p className="p-3 py-1 fw-light">{profileObj.bio}</p>
      </div>
    </div>
  );
};

const ProfileBlock = ({ post_id }) => {
  const [postId, setPostId] = useState();
  const [profiles, setProfiles] = useState();

  // const postId = useMemo(() => post_id, [post_id]);

  useEffect(() => {
    setPostId(post_id);
  }, [post_id]);


  const getSuggestedProfiles = async () => {
    try {
      const response = await fetch(`/getsuggested`);
      const data = await response.json();
      setProfiles(data.users);
      // console.log("profiles suggested", profiles);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const getRelevantProfiles = async (post_id) => {
    try {
      const response = await fetch(`/getrelevant?post_id=${post_id}`);
      const data = await response.json();
      setProfiles(data.users);
      // console.log("profiles", profiles);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // console.log("profile in parent", profiles);

  // if post_id exists, get all relevant/involved profiles in the post, else get suggested(not followed by current user)
  useEffect(() => {
    if (postId) {
      getRelevantProfiles(postId);
    } else {
      getSuggestedProfiles();
    }
  }, [postId]);

  return (
    <>
      <h3 className="py-3 fs-6">{postId ? "Relevant People" : "Suggested for you"}</h3>
      {profiles &&
        profiles.map((profile) => {
          return (
            <div key={profile.id}>
              <Profile profile={profile}/>
            </div>
          );
        })}
    </>
  );
};
