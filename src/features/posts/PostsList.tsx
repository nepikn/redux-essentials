import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Spinner } from "@/components/Spinner";
import { TimeAgo } from "@/components/TimeAgo";
import { memo, useEffect } from "react";
import { Link } from "react-router-dom";
import { PostAuthor } from "./PostAuthor";
import {
  fetchPosts,
  selectPostById,
  selectPostIds,
  selectPostsError,
  selectPostsStatus,
} from "./postsSlice";
import { ReactionButtons } from "./ReactionButtons";

interface PostExcerptProps {
  postId: string;
}

const PostExcerpt = memo(function PostExcerpt({
  postId,
}: PostExcerptProps) {
  const post = useAppSelector((state) =>
    selectPostById(state, postId),
  );

  return (
    <article className="post-excerpt" key={post.id}>
      <h3>
        <Link to={`/posts/${post.id}`}>{post.title}</Link>
      </h3>
      <div>
        <PostAuthor userId={post.user} />
        <TimeAgo timestamp={post.date} />
      </div>
      <p className="post-content">
        {post.content.substring(0, 100)}
      </p>
      <ReactionButtons post={post} />
    </article>
  );
});

export default function PostsList() {
  const dispatch = useAppDispatch();
  const postsStatus = useAppSelector(selectPostsStatus);
  const postsError = useAppSelector(selectPostsError);
  const orderedPostIds = useAppSelector(selectPostIds);

  useEffect(() => {
    if (postsStatus == "idle") {
      dispatch(fetchPosts());
    }
  }, [postsStatus]);

  let content: React.ReactNode;

  if (postsStatus === "pending") {
    content = <Spinner text="Loading..." />;
  } else if (postsStatus === "succeeded") {
    content = orderedPostIds.map((postId) => (
      <PostExcerpt key={postId} postId={postId} />
    ));
  } else if (postsStatus === "failed") {
    content = <div>{postsError}</div>;
  }

  return (
    <section className="posts-list">
      <h2>Posts</h2>
      {content}
    </section>
  );
}
