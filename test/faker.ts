import { faker } from "@faker-js/faker";
import { Comment, Post, Publisher, User } from "./models";

export const fakeUsers = (count = 1): User[] => {
  const users: User[] = [];
  for (let i = 0; i < count; i++) {
    users.push(
      new User({
        id: faker.datatype.uuid(),
        name: faker.name.findName(),
        email: faker.internet.email(),
        // posts,
        // comments,
      })
    );
  }
  return users;
};

export const fakePosts = (count = 1, { maxComments = 5 } = {}): Post[] => {
  const posts: Post[] = [];
  for (let i = 0; i < count; i++) {
    const [author] = fakeUsers();
    const [publisher] = fakePublishers();
    const comments = fakeComments(faker.datatype.number(maxComments));
    posts.push(
      new Post({
        id: faker.datatype.uuid(),
        title: faker.lorem.text(),
        body: faker.lorem.sentence(),
        published: faker.datatype.boolean(),
        author,
        publisher,
        comments,
      })
    );
  }
  return posts;
};

export const fakePublishers = (count = 1): Publisher[] => {
  const publishers: Publisher[] = [];
  for (let i = 0; i < count; i++) {
    publishers.push(
      new Publisher({
        id: faker.datatype.uuid(),
        name: faker.name.findName(),
      })
    );
  }
  return publishers;
};

export const fakeComments = (count = 1): Comment[] => {
  const comments: Comment[] = [];
  for (let i = 0; i < count; i++) {
    const [author] = fakeUsers();
    comments.push(
      new Comment({
        id: faker.datatype.uuid(),
        text: faker.lorem.sentence(),
        // post,
        author,
      })
    );
  }
  return comments;
};
