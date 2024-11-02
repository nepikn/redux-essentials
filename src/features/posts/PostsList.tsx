import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Spinner } from "@/components/Spinner";
import { TimeAgo } from "@/components/TimeAgo";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { PostAuthor } from "./PostAuthor";
import {
  fetchPosts,
  selectAllPosts,
  selectPostsError,
  selectPostsStatus,
  type Post,
} from "./postsSlice";
import { ReactionButtons } from "./ReactionButtons";

interface PostExcerptProps {
  post: Post;
}

function PostExcerpt({ post }: PostExcerptProps) {
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
}

export default function PostsList() {
  const dispatch = useAppDispatch();
  const posts = useAppSelector(selectAllPosts);
  const postsStatus = useAppSelector(selectPostsStatus);
  const postsError = useAppSelector(selectPostsError);

  useEffect(() => {
    if (postsStatus == "idle") {
      dispatch(fetchPosts());
    }
  }, [postsStatus]);

  let content: React.ReactNode;

  if (postsStatus === "pending") {
    content = <Spinner text="Loading..." />;
  } else if (postsStatus === "succeeded") {
    const orderedPosts = posts.toSorted((a, b) =>
      b.date.localeCompare(a.date),
    );

    content = orderedPosts.map((post) => (
      <PostExcerpt key={post.id} post={post} />
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
