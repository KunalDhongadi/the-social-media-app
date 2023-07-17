const Profile = ({ profile }) => {

const [profileObj, setProfileObj] = useState(profile);
const { protocol, host } = window.location;
const rootUrl = `${protocol}//${host}`;

  return (
    <div className="profile-div">
      <div className="d-flex p-3 justify-content-between align-items-center">
        <img className="post-profile-thumbnail bg-white rounded-circle "
        src={profileObj.image_url != "" ? profileObj.image_url : '/static/network/img/profile_image.png'} alt={profileObj.username}
        />
        
        <FollowBtn userdata={profileObj} setuserdata={setProfileObj}/>
      </div>
      <div>
        <div className="d-flex align-items-center">
        <p className="post-profile-title fw-bold m-0 ps-3 pe-2 py-0">
          <a href={`${rootUrl}/${profileObj.username}`}>{profileObj.username}</a>
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
      <div className="profile-list-div pt-3">
      <h3 className="p-3 ps-0 pt-0 fs-6">{postId ? "Relevant People" : "Suggested for you"}</h3>
      {profiles &&
        profiles.map((profile, index) => {
          const isFirstChild = index === 0;
          const isLastChild = index === profiles.length - 1;
          return (
            <div key={profile.id} className={`profile-wrapper${isFirstChild ? ' first-child' : ''}${isLastChild ? ' last-child' : ''}`}>
              <Profile profile={profile}/>
            </div>
          );
        })}
      </div>
    </>
  );
};
