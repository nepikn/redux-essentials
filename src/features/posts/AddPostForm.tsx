import { useAppSelector } from "@/app/hooks";
import React from "react";
import { useAddNewPostMutation } from "../api/apiSlice";
import { selectCurrentUsername } from "../auth/authSlice";

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
  const user = useAppSelector(selectCurrentUsername)!;
  const [addNewPost, { isLoading }] = useAddNewPostMutation();

  const handleSubmit = async (
    e: React.FormEvent<AddPostFormElements>,
  ) => {
    e.preventDefault();

    const form = e.currentTarget;
    const { elements } = form;
    const title = elements.postTitle.value;
    const content = elements.postContent.value;

    try {
      await addNewPost({ title, content, user }).unwrap();

      form.reset();
    } catch (err) {
      console.error("Failed to save the post: ", err);
    }
  };

  return (
    <section>
      <h2>Add a New Post</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="postTitle">Post Title:</label>
        <input type="text" id="postTitle" required />
        <label htmlFor="postContent">Content:</label>
        <textarea id="postContent" name="postContent" required />
        <button disabled={isLoading}>Save Post</button>
      </form>
    </section>
  );
};
