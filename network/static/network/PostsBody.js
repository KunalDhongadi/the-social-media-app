const AddPost = ({ posts, setPosts, parent }) => {
  const [value, setValue] = useState("");
  const [showExtras, setShowExtras] = useState(false);

  const backgrounds = [
    { name: "#1", backgroundColor: "white", color: "black" },
    { name: "#2", backgroundColor: "black", color: "white" },
    {
      name: "#3",
      background: "linear-gradient(to right, #70e1f5, #ffd194)",
      color: "black",
    },
  ];

  const [style, setStyle] = useState(backgrounds[0]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    //Removing the name field from style
    delete style.name;

    let body;
    if (parent) {
      body = JSON.stringify({ value: value, style: style, parent: parent });
    } else {
      body = JSON.stringify({ value: value, style: style });
    }

    const response = await fetch(`/addpost`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: body,
    });
    const json = await response.json();
    // console.log("all posts tog", posts);
    // console.log("this", json.body);
    let p = json.body;
    setPosts((posts) => [p, ...posts]);
    setValue("");
    setShowExtras(false);
    setStyle(backgrounds[0]);
  };

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  const onBackgroundChange = (n) => {
    setStyle(backgrounds[n]);
  };

  return (
    <form
      action="post"
      className="py-3 addPostDiv rounded-2 my-3"
      onSubmit={handleSubmit}
    >
      <div className="d-flex container px-3">
        <input
          type="text"
          className="p-2 ps-3 flex-grow-1 me-2"
          name="postbody"
          value={value}
          onChange={handleChange}
          placeholder={`${parent ? "Add a reply" : "What's going on?"}`}
          id="post-body"
          onClick={() => setShowExtras(true)}
        />
        <input
          type="submit"
          className="p-2 px-4"
          value="Post"
          id="newpost-btn"
          disabled={value === ""}
        />
      </div>
      <div
        className={`d-flex mt-3 px-3 addPostExtraDiv py-2 gap-3 align-items-center ${
          showExtras ? "d-block" : "d-none"
        }`}
      >
        <p className="p-2 m-0">Bg</p>
        <div
          className={`rounded-circle bg-inputs input-bg-light ${
            style.name === "#1" && "bg-selected"
          }`}
          onClick={() => onBackgroundChange(0)}
        ></div>
        <div
          className={`rounded-circle bg-inputs input-bg-dark ${
            style.name === "#2" && "bg-selected"
          }`}
          onClick={() => onBackgroundChange(1)}
        ></div>
        <div
          className={`rounded-circle bg-inputs input-bg-light-gradient ${
            style.name === "#3" && "bg-selected"
          }`}
          onClick={() => onBackgroundChange(2)}
        ></div>
      </div>
    </form>
  );
};

AddPost.defaultProps = {
  parent: null,
};

const PostItem = ({
  post,
  isLoggedIn,
  isOpened,
  currentUser,
  posts,
  setPosts,
}) => {
  const [likes, setLikes] = useState(post.likes);
  const [replyCount, setReplyCount] = useState(post.replyCount);
  const [isLiked, setIsLiked] = useState(post.isLiked);

  const { protocol, host } = window.location;
  const rootUrl = `${protocol}//${host}`;

  const handleLikeClick = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    const response = await fetch(`/like`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(post.id),
    });
    if (response.ok) {
      const json = await response.json();
      if (isLiked) {
        setLikes(likes - 1);
      } else {
        setLikes(likes + 1);
      }

      setIsLiked(!isLiked);
    }
  };

  const onPostDeleteClick = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    const response = await fetch(`/delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(post.id),
    });
    if (response.ok) {
      const json = await response.json();
      if (json.deleted) {
        setPosts(posts.filter((p) => p.id !== post.id));
      }
    }
  };

  // console.log({currentUser});

  const formatDateTime = (timestamp) => {
    timestamp = new Date(timestamp).toISOString();
    // console.log("t1", timestamp);
    const now = new Date();
    // console.log("t1 now", now);

    const date = new Date(timestamp);

    // console.log("t1 data", date);
    const diff = Math.round((now - date) / 1000);
    const minute = 60;
    const hour = minute * 60;
    const day = hour * 24;
    const month = day * 30;
    const year = month * 12;

    if (diff < minute) {
      return diff + "s ago";
    } else if (diff < hour) {
      return Math.round(diff / minute) + "m ago";
    } else if (diff < day) {
      return Math.round(diff / hour) + "h ago";
    } else if (diff < month) {
      return Math.round(diff / day) + "d ago";
    } else if (diff < year) {
      return Math.round(diff / month) + "mo ago";
    } else {
      return Math.round(diff / year) + "y ago";
    }
  };

  const onPostClick = () => {
    const { protocol, host } = window.location;
    const subRoute = `${post.postOwner}/post/${post.id}`;
    window.location.href = `${protocol}//${host}/${subRoute}`;
  };

  const onRepliedToClicked = (e) => {
    const { protocol, host } = window.location;
    const subRoute = `${post.replied_to.postOwner}/post/${post.replied_to.id}`;
    window.location.href = `${protocol}//${host}/${subRoute}`;
    e.stopPropagation();
  };

  const openDeleteModal = (e) => {
    e.stopPropagation();
  };

  return (
    <div
      className="post-div rounded-1 mb-3"
      onClick={!isOpened ? onPostClick : null}
    >
      <div className="d-flex p-3">
        <div className="flex-grow-1">
        <div className="d-flex">
        <img
          className="post-profile-thumbnail rounded-circle bg-secondary"
          src={post.postOwner_image}
        />
          <div className="d-flex justify-content-between align-items-center flex-grow-1 ms-2">
            <div className="d-flex">
              <p className="post-profile-title fw-bold m-0">
                <a href={`${rootUrl}/${post.postOwner}`}>{post.postOwner}</a>
              </p>
              <p className="fw-regular m-0">
                <span className="mx-2">•</span>
                {formatDateTime(post.timestamp)}
              </p>
            </div>
            {post.postOwner === currentUser ? (
              <>
                <div
                  className="d-flex gap-2 delete-btn px-3 py-1 rounded-pill justify-content-center align-items-center"
                  data-bs-toggle="modal"
                  data-bs-target="#deleteModal"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="m-0 fs-6">Delete</p>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    class="bi bi-trash3"
                    viewBox="0 0 16 16"
                  >
                    <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z" />
                  </svg>
                </div>

                <div
                  class="modal fade"
                  id="deleteModal"
                  data-bs-backdrop="static"
                  data-bs-keyboard="false"
                  tabIndex="-1"
                  aria-labelledby="staticBackdropLabel"
                  aria-hidden="true"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div class="modal-dialog">
                    <div class="modal-content">
                      <div class="modal-header">
                        <h1 class="modal-title fs-5" id="exampleModalLabel">
                          Just to confirm..
                        </h1>
                        <button
                          type="button"
                          class="btn-close"
                          data-bs-dismiss="modal"
                          aria-label="Close"
                          onClick={(e) => e.stopPropagation()}
                        ></button>
                      </div>
                      <div class="modal-body">
                        <p>Are you sure you want to delete this post?</p>
                      </div>
                      <div class="modal-footer">
                        <button
                          type="button"
                          class="btn btn-secondary"
                          data-bs-dismiss="modal"
                          onClick={(e) => e.stopPropagation()}
                        >
                          No
                        </button>
                        <button
                          type="button"
                          class="btn btn-primary"
                          data-bs-dismiss="modal"
                          onClick={onPostDeleteClick}
                        >
                          Yes, Delete it
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className=""></div>
            )}
          </div>
          </div>

          {post.replied_to && (
            <div
              className="d-flex align-items-center rounded-pill replied-to-div p-2 px-4 my-3"
              onClick={onRepliedToClicked}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-arrow-90deg-left"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M1.146 4.854a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 4H12.5A2.5 2.5 0 0 1 15 6.5v8a.5.5 0 0 1-1 0v-8A1.5 1.5 0 0 0 12.5 5H2.707l3.147 3.146a.5.5 0 1 1-.708.708l-4-4z"
                />
              </svg>
              <p className="m-0 ms-2">
                Replied to{" "}
                <span className="fw-medium">{post.replied_to.postOwner}</span>
              </p>
            </div>
          )}

          <div
            className="rounded-2 border-2-secondary my-2 post-body d-flex justify-content-center align-items-center "
            style={post.styles}
          >
            <p className="m-0">{post.post}</p>
          </div>

          

          <div className="d-flex">
            <div className="d-flex align-items-center postBtnsBody">
              {isLoggedIn && (
                <div
                  className="post-btn likeBtn rounded-circle d-flex justify-content-center align-items-center"
                  onClick={handleLikeClick}
                >
                  {isLiked ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="#4a6ddf"
                      className="bi bi-heart-fill"
                      viewBox="0 0 16 16"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className="bi bi-heart"
                      viewBox="0 0 16 16"
                    >
                      <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z" />
                    </svg>
                  )}
                </div>
              )}
            </div>
            {(likes > 0 || replyCount > 0) && (
            <div className="d-flex w-100 ms-2 align-items-center">
              {likes > 0 && (
                <p className="m-0 me-2 fs-6">
                  {likes > 1 ? `${likes} Likes` : `${likes} Like`}
                </p>
              )}
              {replyCount > 0 && (
                <p className="m-0 flex-grow-1 text-end fs-6">
                  {replyCount > 1
                    ? `${replyCount} Replies`
                    : `${replyCount} Reply`}
                </p>
              )}
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

// import {useRef} from 'react';
const { useRef } = React;

const PostsBody = ({ postType, page_no }) => {
  // console.log("postType" ,postType);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [page, setPage] = useState(page_no);
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [observe, setObserve] = useState(true);
  const targetRef = useRef(null);

  // console.log("posts mc" ,posts);

  const getAllPosts = async (type, page) => {
    try {
      const response = await fetch(`/getposts?type=${type}&page=${page}`);
      const data = await response.json();

      if (data.allPosts.length === 0) {
        setObserve(false);
        console.log("observe set to false");
        return;
      }

      const { allPosts, isLoggedIn, currentUser } = data;
      setIsLoggedIn(isLoggedIn);
      if(page===1){
        setPosts(allPosts)
      }else{
        setPosts(prevState=>[...posts, ...allPosts]);
      }
      setCurrentUser(currentUser);

      setIsLoading(false);
      
      // setPageData({ currentPage, hasNext, hasPrevious, totalPageCount });

      // console.log("posts1", data.allPosts);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    // Reset state when postType is changed
    setPage(1);
    setPosts([]);
    setObserve(true);
    setIsLoading(true);
    // getAllPosts(postType, 1);
  }, [postType]);
  
  
  useEffect(() => {
    console.log("page rn", page, "/type-", postType);
    getAllPosts(postType, page);
  }, [page]);

  console.log("posts", posts);
  // console.log("res",pageData);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 1.0
    };
  
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        // setPage(page+1)
        setIsLoading(true);
        setPage(page+1)
        console.log("yes triggering");
      }
    }, options);

    if(!observe){
      observer.disconnect();
    }
  
    const element = targetRef.current;
    if (element && !isLoading && observe) {
      observer.observe(element);
    }
  
    return () => {
      observer.disconnect();
    };
  }, [targetRef, isLoading, observe]);
  
  

  let showAddPost = false;
  if (postType === "all" || postType === "following") {
    showAddPost = true;
  }

  return (
    <>
      {isLoggedIn && showAddPost && (
        <AddPost posts={posts} setPosts={setPosts} />
      )}
      <div className="">
        {posts.map((post) => {
          return (
            <div key={post.id}>
              <PostItem
                post={post}
                isLoggedIn={isLoggedIn}
                isOpened={false}
                currentUser={currentUser}
                posts={posts}
                setPosts={setPosts}
              />
            </div>
          );
        })}
      </div>
      <div ref={targetRef}></div>
    </>
  );
};

// module.exports = PostItem;
