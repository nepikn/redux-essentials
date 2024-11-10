import { Spinner } from "@/components/Spinner";
import { TimeAgo } from "@/components/TimeAgo";
import classnames from "classnames";
import { memo, useMemo } from "react";
import { Link } from "react-router-dom";
import { useGetPostsQuery } from "../api/apiSlice";
import { PostAuthor } from "./PostAuthor";
import type { Post } from "./postsSlice";
import { ReactionButtons } from "./ReactionButtons";

interface PostExcerptProps {
  post: Post;
}

const PostExcerpt = memo(function PostExcerpt({
  post,
}: PostExcerptProps) {
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
  // Calling the `useGetPostsQuery()` hook automatically fetches data!
  const {
    data: posts = [],
    isLoading,
    isFetching,
    isSuccess,
    isError,
    error,
    refetch,
  } = useGetPostsQuery();

  const sortedPosts = useMemo(
    () => posts.toSorted((a, b) => b.date.localeCompare(a.date)),
    [posts],
  );

  let content;

  if (isLoading) {
    content = <Spinner text="Loading..." />;
  } else if (isSuccess) {
    const renderedPosts = sortedPosts.map((post) => (
      <PostExcerpt key={post.id} post={post} />
    ));

    const containerClassname = classnames("posts-container", {
      disabled: isFetching,
    });

    content = (
      <div className={containerClassname}>{renderedPosts}</div>
    );
  } else if (isError) {
    content = <div>{error.toString()}</div>;
  }

  return (
    <section className="posts-list">
      <h2>Posts</h2>
      <button onClick={refetch}>Refetch Posts</button>
      {content}
    </section>
  );
}
