const Profile = ({ profile }) => {

const [profileObj, setProfileObj] = useState(profile);

  return (
    <div className="post-div border rounded-1 mb-3">
      <div className="d-flex p-3 justify-content-between">
        <div className="post-profile-thumbnail rounded-circle bg-secondary"></div>
        <FollowBtn userdata={profileObj} setuserdata={setProfileObj}/>
      </div>
      <div>
        <p className="post-profile-title fw-bold m-0 p-3 pt-0">
          <a href={profileObj.username}>{profileObj.username}</a>
        </p>
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
      console.log("profiles suggested", profiles);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const getRelevantProfiles = async (post_id) => {
    try {
      const response = await fetch(`/getrelevant?post_id=${post_id}`);
      const data = await response.json();
      setProfiles(data.users);
      console.log("profiles", profiles);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  console.log("profile in parent", profiles);

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
      <h3 className="py-2 fs-6">{postId ? "Relevant People" : "Suggested for you"}</h3>
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

// const Post = ({post}) =>{

//   const [likes, setLikes] = useState(0);

//   const handleLikeClick = () => {
//     setLikes(likes + 1);
//   };
//   return (

//     <div className="post-div">
//         <div className="d-flex p-3">
//             <div className="post-profile-thumbnail rounded-circle bg-secondary">
//             </div>
//             <div className="flex-grow-1 ms-3">
//                 <h4><a href="{% url 'profile' post.user %}">{post.user}</a></h4>
//                 <p>{post.body}</p>
//                 <p>{post.posttime}</p>
//                 <div className="d-flex">
//                     <button onClick={handleLikeClick}>Like</button>
//                     <p>{likes} Likes</p>
//                 </div>
//             </div>
//         </div>
//     </div>
//   )
// }

// const PostsBody = (postType) => {

//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [posts, setPosts] = useState([]);
//   const [pageData, setPageData] = useState([]);

//   const getAllPosts = async (type, page) => {
//       try {
//           const response = await fetch(`/getposts?type=${type}&page=${page}`);
//           const data = await response.json();

//           const { allPosts, currentPage, hasNext, hasPrevious, totalPageCount, isLoggedIn } = data;
//           setIsLoggedIn(isLoggedIn);
//           setPosts(allPosts);
//           setPageData({ currentPage, hasNext, hasPrevious, totalPageCount });

//           console.log("posts1", data.allPosts);
//       } catch (error) {
//           console.error('Error:', error);
//       }
//   };

//   useEffect(() => {
//       getAllPosts(postType, 1);
//   },[])

//   console.log("posts", posts);
//   console.log("res",pageData);

//   let showAddPost = false;
//   if(postType === "all" || postType === "following"){
//     showAddPost = true;
//   }

//   return (
//       <>
//       {isLoggedIn &&
//         (showAddPost && <AddPost posts={posts} setPosts={setPosts}/>)
//       }

//       {
//           posts.map((post)=>{
//               return(
//                   <div key={post.id}>
//                       <PostItem post={post} isLoggedIn={isLoggedIn}/>
//                   </div>
//               )
//           })
//       }

//       <div class="btn-group" role="group" aria-label="Basic outlined example">
//           <button type="button" class="btn btn-outline-primary" disabled={!pageData.hasPrevious} onClick={() => getAllPosts("all", pageData.currentPage-1)}>Previous</button>
//           <button type="button" class="btn btn-outline-primary" disabled={!pageData.hasNext} onClick={() => getAllPosts("all", pageData.currentPage+1)}>Next</button>
//       </div>

//       </>
//   );
// };

// export { ProfileBlock , Post};

// To do
// Add components for the add post and all posts
// Add like button
// Add Following button
