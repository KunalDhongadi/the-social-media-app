const AddPost = ({ posts, setPosts, parent }) => {
  const [value, setValue] = useState("");
  const [showExtras, setShowExtras] = useState(false);
  const textAreaRef = useRef(null);

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
    if (posts.length === 10) {
      setPosts((posts) => [p, ...posts.slice(0, -1)]); //If a post is added, remove the last one, need to keep only 10(multiple of 10) posts.
    } else {
      setPosts((posts) => [p, ...posts]);
    }
    setValue("");
    setShowExtras(false);
    setStyle(backgrounds[0]);
  };

  const setHeight = () => {
    const textArea = textAreaRef.current;
    textArea.style.height = "auto";
    textArea.style.height = textArea.scrollHeight + "px";
  };

  const handleChange = (event) => {
    setValue(event.target.value);
    setHeight();
  };

  const onBackgroundChange = (n) => {
    setStyle(backgrounds[n]);
  };

  return (
    <form
      action="post"
      className="py-3 addPostDiv"
      id="addpost"
      onSubmit={handleSubmit}
    >
      <div className="d-flex container align-items-top px-3">
        <textarea
          className="p-2 px-0 flex-grow-1 me-3"
          rows="1"
          ref={textAreaRef}
          style={{ overflowY: "hidden" }}
          name="postbody"
          value={value}
          onChange={handleChange}
          placeholder={`${parent ? "Add a reply" : "What's going on?"}`}
          id="post-body"
          // onClick={() => setShowExtras(true)}
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
        className={`d-flex mt-3 px-3 addPostExtraDiv pt-3 gap-3 align-items-center ${
          showExtras ? "d-block" : "d-none"
        }`}
      >
        <p className="p-2 px-0 m-0">Bg</p>
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
  const [isDeleted, setIsDeleted] = useState(false);

  const { protocol, host } = window.location;
  const rootUrl = `${protocol}//${host}`;

  const handleLikeClick = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    setIsLiked(!isLiked);

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
    } else {
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
        // if the post is opened on a separate page, go to homepage or previous page
        if (isOpened) {
          if (window.history.length > 1) {
            window.history.back();
          } else {
            const { protocol, host } = window.location;
            window.location.href = `${protocol}//${host}`;
          }
        } else {
          // const postDiv = event.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
          // console.log("pos", postDiv);
          // setReplyCount(replyCount )
          // postDiv.style.animationPlayState = "running";
          // postDiv.addEventListener(
          //   "animationend",
          //   () => {
          //     setPosts(posts.filter((p) => p.id !== post.id));
          //   }
          // );
          // setPosts(posts.filter((p) => p.id !== post.id));
          setIsDeleted(true);
        }
      }
    }
  };

  useEffect(() => {
    setReplyCount(post.replyCount);
  }, [post]);

  // console.log({currentUser});

  const formatDateTime = (timestamp) => {
    // timestamp = new Date(timestamp).toISOString();
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

  if (isDeleted) {
    return (
      <>
        <div className="d-flex justify-content-center align-items-center py-5 border-b">
          <p className="m-0">This post is deleted.</p>
        </div>
      </>
    );
  }

  return (
    <div
      className={`post-div ${isOpened && "post-page"}`}
      id="postDiv"
      onClick={!isOpened ? onPostClick : null}
    >
      <div className="d-flex p-3">
        <div className="flex-grow-1">
          <div className="d-flex">
            <img
              className="post-profile-thumbnail rounded-circle"
              src={
                post.postOwner_image != ""
                  ? post.postOwner_image
                  : "/static/network/img/profile_image.png"
              }
              alt={post.postOwner}
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
                    className="d-flex gap-1 delete-btn px-3 py-1 rounded-pill justify-content-center align-items-center"
                    // data-bs-toggle="modal"
                    // data-bs-target="#deleteModal"
                    onClick={onPostDeleteClick}
                  >
                    <p className="m-0">Delete</p>
                    {/* <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className="bi bi-x"
                      viewBox="0 0 16 16"
                    >
                      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                    </svg> */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash3" viewBox="0 0 16 16">
  <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"/>
</svg>
                  </div>
{/* 
                  <div className="dropdown">
                    <button
                      className="btn btn-secondary dropdown-toggle"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-three-dots"
                        viewBox="0 0 16 16"
                      >
                        <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                      </svg>
                    </button>
                    <ul className="dropdown-menu">
                      <li>
                        <a className="dropdown-item" href="#">
                          Delete
                        </a>
                      </li>
                    </ul>
                  </div> */}

                  {/* <div
                    className="modal fade"
                    id="deleteModal"
                    data-bs-backdrop="static"
                    data-bs-keyboard="false"
                    tabIndex="-1"
                    aria-labelledby="staticBackdropLabel"
                    aria-hidden="true"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="w-sm-100 w-md-50 w-25 modal-dialog modal-dialog-centered">
                      <div className="modal-content">
                        <div className="modal-header justify-content-center border-0">
                          <h1
                            className="modal-title text-center  fs-5"
                            id="exampleModalLabel"
                          >
                            Delete this post?
                          </h1>
                        </div>
                        <div className="modal-body pt-0 border-0">
                          <p className="m-0 text-center">
                            Are you really sure you want to delete this post?
                          </p>
                        </div>
                        <div className="modal-footer flex-column-reverse">
                          <button
                            type="button"
                            className="the-btn w-100 mt-2 m-0 rounded-pill"
                            data-bs-dismiss="modal"
                            onClick={(e) => e.stopPropagation()}
                          >
                            No, Keep it
                          </button>
                          <button
                            type="button"
                            className="the-btn w-100 m-0 rounded-pill"
                            data-bs-dismiss="modal"
                            onClick={onPostDeleteClick}
                          >
                            Yes, Delete it
                          </button>
                        </div>
                      </div>
                    </div>
                  </div> */}
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
                className="bi bi-arrow-90deg-left"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M1.146 4.854a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 4H12.5A2.5 2.5 0 0 1 15 6.5v8a.5.5 0 0 1-1 0v-8A1.5 1.5 0 0 0 12.5 5H2.707l3.147 3.146a.5.5 0 1 1-.708.708l-4-4z"
                />
              </svg>
              <p className="m-0 ms-2" style={{ fontSize: "14px" }}>
                Replied to{" "}
                <span className="fw-medium">{post.replied_to.postOwner}</span>
              </p>
            </div>
          )}

          <div
            className="my-2 post-body"
            
          >
            <p className="m-0 py-2">{post.post}</p>
          </div>

          <div className="d-flex">
            <div className="d-flex align-items-center postBtnsBody">
              {isLoggedIn && (
                <div
                  className="post-btn likeBtn rounded-circle d-flex justify-content-center align-items-center me-2"
                  onClick={handleLikeClick}
                >
                  {isLiked ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className="bi bi-heart-fill liked-btn"
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
              <div className="d-flex w-100 align-items-center">
                {likes > 0 && (
                  <p className="m-0 fs-6 text-secondary">
                    {likes > 1 ? `${likes} Likes` : `${likes} Like`}
                  </p>
                )}
                {replyCount > 0 && (
                  <p className="m-0 flex-grow-1 fs-6 text-secondary">
                    {likes > 0  && ", "}
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
  const [page, setPage] = useState(page_no + 1);
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [observe, setObserve] = useState(true);

  const [isfetch, setIsFetch] = useState(false); //if it becomes true, fetch api
  const targetRef = useRef(null);

  // console.log("inside post body" ,posts);

  const getAllPosts = async (type, page) => {
    try {
      const response = await fetch(`/getposts?type=${type}&page=${page}`);
      const data = await response.json();

      if (data.allPosts.length === 0) {
        setObserve(false);
        setIsLoading(false);
        // console.log("observe set to false");
        return;
      }

      const { allPosts, isLoggedIn, currentUser } = data;
      setIsLoggedIn(isLoggedIn);
      if (page === 1) {
        setPosts(allPosts);
      } else {
        setPosts((prevState) => [...posts, ...allPosts]);
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
    // setPage(1);
    // console.log("posttype changed");

    setIsFetch(true);
    // getAllPosts(postType, 1);
  }, [postType]);

  useEffect(() => {
    // console.log("page rn", page, "/type-", postType);
    setIsFetch(true);
    // getAllPosts(postType, page);
  }, [page]);

  useEffect(() => {
    if (isfetch) {
      getAllPosts(postType, page);
      setIsFetch(false);
    }
  }, [isfetch]);

  // console.log("posts", posts);
  // console.log("res",pageData);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 1.0,
    };

    const observer = new IntersectionObserver(([entry]) => {
      // console.log("inside func",entry);
      if (entry.isIntersecting) {
        // setPage(page+1)
        setIsLoading(true);
        setPage(page + 1);
        // console.log("yes triggering", entry);
      }
    }, options);

    if (!observe) {
      observer.disconnect();
    }

    const element = targetRef.current;
    // console.log("el", element);
    if (element && !isLoading && observe) {
      // console.log("inside el");
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
    };
  }, [targetRef.current, isLoading, observe, posts]);

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
        {posts.map((post, index) => {
          // console.log("post length-", post.length, " and index is ", index);
          if (index === posts.length - 4) {
            return (
              <div key={post.id} ref={targetRef}>
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
          } else {
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
          }
        })}
      </div>
      {isLoading && (
        <div className="d-flex my-3 justify-content-center">
          <div
            className="spinner-border loading-spinner text-primary"
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {/* <div className="targetRef" ref={targetRef}></div> */}
    </>
  );
};

// module.exports = PostItem;
