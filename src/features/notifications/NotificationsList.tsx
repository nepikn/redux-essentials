import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { TimeAgo } from "@/components/TimeAgo";
import { PostAuthor } from "@/features/posts/PostAuthor";
import classnames from "classnames";
import { useLayoutEffect } from "react";
import {
  readNotifications,
  selectMetadataEntities,
  useGetNotificationsQuery,
} from "./notificationsSlice";

export const NotificationsList = () => {
  const dispatch = useAppDispatch();
  const { data: notifications = [] } = useGetNotificationsQuery();
  const notificationsMetadata = useAppSelector(
    selectMetadataEntities,
  );

  useLayoutEffect(() => {
    dispatch(readNotifications());
  });

  const renderedNotifications = notifications.map(
    (notification) => {
      const meatadata = notificationsMetadata[notification.id];
      const notificationClassname = classnames("notification", {
        new: meatadata.isNew,
      });

      return (
        <div
          key={notification.id}
          className={notificationClassname}
        >
          <div>
            <b>
              <PostAuthor
                userId={notification.user}
                showPrefix={false}
              />
            </b>
            {` ${notification.message}`}
          </div>
          <TimeAgo timestamp={notification.date} />
        </div>
      );
    },
  );

  return (
    <section className="notificationsList">
      <h2>Notifications</h2>
      {renderedNotifications}
    </section>
  );
};
