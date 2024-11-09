import { useAppDispatch, useAppSelector } from "@/app/hooks";
import React, { useState } from "react";
import { selectCurrentUsername } from "../auth/authSlice";
import { addPost } from "./postsSlice";

// TS types for the input fields
// See: https://epicreact.dev/how-to-type-a-react-form-on-submit-handler/
interface AddPostFormFields extends HTMLFormControlsCollection {
  postTitle: HTMLInputElement;
  postContent: HTMLTextAreaElement;
}
interface AddPostFormElements extends HTMLFormElement {
  readonly elements: AddPostFormFields;
}

export const AddPostForm = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUsername)!;
  const [addRequestStatus, setAddRequestStatus] = useState<
    "idle" | "pending"
  >("idle");

  const handleSubmit = async (
    e: React.FormEvent<AddPostFormElements>,
  ) => {
    e.preventDefault();

    const form = e.currentTarget;
    const { elements } = form;
    const title = elements.postTitle.value;
    const content = elements.postContent.value;

    try {
      setAddRequestStatus("pending");
      await dispatch(addPost({ title, content, user })).unwrap();

      form.reset();
    } catch (err) {
      console.error("Failed to save the post: ", err);
    } finally {
      setAddRequestStatus("idle");
    }
  };

  return (
    <section>
      <h2>Add a New Post</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="postTitle">Post Title:</label>
        <input
          type="text"
          id="postTitle"
          defaultValue="t"
          required
        />
        <label htmlFor="postContent">Content:</label>
        <textarea
          id="postContent"
          name="postContent"
          defaultValue="c"
          required
        />
        <button disabled={addRequestStatus != "idle"}>
          Save Post
        </button>
      </form>
    </section>
  );
};
