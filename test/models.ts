import { plural } from "pluralize";
import { Model, Adapter, FieldBuilder } from "../src";

export const findManyHook: Adapter["findMany"] = (query, model) => {
  const operation = plural(model.entity).toLocaleLowerCase();
  query.operation(operation).parseWith((response) => response.data[operation]);
};

export class User extends Model {
  static entity = "User";
  static queryAttributes: string[] = ["id", "name"];
  id!: string;
  name!: string;
  email!: string;
  posts!: Post[];
  comments!: Comment[];
  static fields(f: FieldBuilder) {
    f.id();
    f.string("name");
    f.string("email");
    f.model("posts", Post).list().default([]);
    f.model("comments", Comment).list().default([]);
  }
}

export class Post extends Model {
  static entity = "Post";
  static queryAttributes: string[] = ["id", "name"];
  static queryRelationships: string[] = ["author"];

  id!: string;
  title!: string;
  body!: string;
  published!: boolean;
  author!: User;
  comments!: Comment[];
  publisher!: Publisher;
  tags!: string[];

  static fields(f: FieldBuilder) {
    f.id();
    f.string("title");
    f.string("body");
    f.boolean("published");
    f.model("author", User);
    f.model("comments", Comment).list().default([]);
    f.attr("publisher", { type: Publisher });
    f.list.string("tags");
  }

  static hooks() {
    return {
      findMany: findManyHook,
    };
  }
}

export class Comment extends Model {
  static entity = "Comment";
  static queryRelationships: string[] = ["author"];

  id!: string;
  text!: string;
  post!: Post;
  author!: User;

  static fields(f: FieldBuilder) {
    f.id();
    f.string("text");
    f.model("post", Post);
    f.model("author", User);
  }
}

export class Publisher extends Model {
  static entity = "Publisher";

  id!: string;
  name!: string;

  static fields(f: FieldBuilder) {
    f.id();
    f.string("name");
  }
}
