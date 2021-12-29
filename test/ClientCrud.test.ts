import { expect } from "chai";
import { DocumentNode } from "graphql";
import { ApolloQueryResult, FetchPolicy } from "apollo-client";
import { Client, Model, FieldBuilder } from "../src";

class TestClient extends Client {
  queries: {
    query: string | DocumentNode;
    variables?: Record<string, any>;
  }[] = [];

  mutations: {
    query: string | DocumentNode;
    variables?: Record<string, any>;
  }[] = [];

  public async query(
    query: string | DocumentNode,
    variables?: Record<string, any>,
    fetchPolicy?: FetchPolicy
  ) {
    this.queries.push({ query, variables });
    return {
      data: {},
    } as ApolloQueryResult<any>;
  }

  public async mutate(
    query: string | DocumentNode,
    variables?: Record<string, any>
  ) {
    this.mutations.push({ query, variables });
    return {
      data: {},
    };
  }
}

describe("Client CRUD", () => {
  class User extends Model {
    static get modelKey() {
      return "UserCrud0";
    }

    static fields(f: FieldBuilder) {
      f.id();
      f.string("name");
      f.string("email");
    }
  }

  const client = new TestClient();
  client.register(User);

  it("should build and execute create operation", async () => {
    await User.create({ name: "James" });
    const mutation = client.mutations.pop();
    expect(mutation).to.be.an("object");
    expect(mutation?.query).to.equal(
      "mutation ($data: UserCreateInput!){createOneUser(data: $data){id,name,email}}"
    );
  });

  it("should build and execute createMany operation", async () => {
    await User.createMany([{ name: "James" }]);
    const mutation = client.mutations.pop();
    expect(mutation).to.be.an("object");
    expect(mutation?.query).to.equal(
      "mutation ($data: [UserCreateInput!]!){createManyUsers(data: $data){id,name,email}}"
    );
  });

  it("should build and execute upsert operation", async () => {
    await User.upsert({ id: 1 }, { name: "John" });
    const mutation = client.mutations.pop();
    expect(mutation).to.be.an("object");
    expect(mutation?.query).to.equal(
      "mutation ($where: UserWhereInput!,$data: UserUpdateInput!){upsertOneUser(where: $where,data: $data){id,name,email}}"
    );
  });

  it("should build and execute upsert operation", async () => {
    await User.update({ id: 1 }, { name: "John" });
    const mutation = client.mutations.pop();
    expect(mutation).to.be.an("object");
    expect(mutation?.query).to.equal(
      "mutation ($where: UserWhereUniqueInput!,$data: UserUpdateInput!){updateOneUser(where: $where,data: $data){id,name,email}}"
    );
    expect(mutation?.variables).to.eql({
      where: { id: 1 },
      data: { name: "John" },
    });
  });

  it("should build and execute findMany operation", async () => {
    await User.findMany();
    const queries = client.queries.pop();
    expect(queries).to.be.an("object");
    expect(queries?.query).to.equal("query {users{id,name,email}}");
  });

  it("should build and execute findUnique operation", async () => {
    await User.findUnique({ id: 1 });
    const queries = client.queries.pop();
    expect(queries).to.be.an("object");
    expect(queries?.query).to.equal(
      "query ($where: UserWhereUniqueInput!){user(where: $where){id,name,email}}"
    );
    expect(queries?.variables).to.eql({
      where: { id: 1 },
    });
  });

  it("should build and execute delete operation", async () => {
    await User.delete({ id: 1 });
    const mutations = client.mutations.pop();
    expect(mutations).to.be.an("object");
    expect(mutations?.query).to.equal(
      "mutation ($where: UserWhereUniqueInput!){deleteOneUser(where: $where){id,name,email}}"
    );
    expect(mutations?.variables).to.eql({
      where: { id: 1 },
    });
  });

  it("should update existing (with ID) user", async () => {
    const user = User.make({ id: 1, name: "John Doe" });
    user.$fill({ name: "John" });
    await user.$save();
    const mutations = client.mutations.pop();
    expect(mutations).to.be.an("object");
    expect(mutations?.query).to.equal(
      "mutation ($where: UserWhereUniqueInput!,$data: UserUpdateInput!){updateOneUser(where: $where,data: $data){id,name,email}}"
    );
    expect(mutations?.variables).to.eql({
      data: { name: "John" },
      where: {
        id: 1,
      },
    });
  });

  it("should update none-existing (without ID) user", async () => {
    const user = User.make({ name: "John" });
    await user.$save();
    const mutations = client.mutations.pop();
    expect(mutations).to.be.an("object");
    expect(mutations?.query).to.equal(
      "mutation ($data: UserCreateInput!){createOneUser(data: $data){id,name,email}}"
    );
    expect(mutations?.variables).to.eql({
      data: { name: "John" },
    });
  });

  it("should build and execute $update operation", async () => {
    const user = User.make({ id: 1 });
    user.$fill({ name: "John", email: "john@mail.com" });
    await user.$update();
    const mutations = client.mutations.pop();
    expect(mutations).to.be.an("object");
    expect(mutations?.query).to.equal(
      "mutation ($where: UserWhereUniqueInput!,$data: UserUpdateInput!){updateOneUser(where: $where,data: $data){id,name,email}}"
    );
    expect(mutations?.variables).to.eql({
      data: { name: "John", email: "john@mail.com" },
      where: {
        id: 1,
      },
    });
  });

  it("should not $update non-existing model", () => {
    const user = User.make();
    user.$fill({ name: "John", email: "john@mail.com" });
    expect(() => user.$update()).to.throw();
  });

  it("should build and execute $delete operation", async () => {
    const user = User.make({ id: 1 });
    user.$fill({ name: "John", email: "john@mail.com" });
    await user.$delete();
    const mutations = client.mutations.pop();
    expect(mutations).to.be.an("object");
    expect(mutations?.query).to.equal(
      "mutation ($where: UserWhereUniqueInput!){deleteOneUser(where: $where){id,name,email}}"
    );
    expect(mutations?.variables).to.eql({
      where: { id: 1 },
    });
  });

  it("should not $delete non-existing model", () => {
    const user = User.make();
    user.$fill({ name: "John", email: "john@mail.com" });
    expect(() => user.$delete()).to.throw();
  });
});

describe("Client CRUD", () => {
  it("should return instance on create operation", async () => {
    class User extends Model {
      static get modelKey() {
        return "UserCrud1";
      }
    }

    class CreateTestClient extends Client {
      public async mutate(
        query: string | DocumentNode,
        variables?: Record<string, any>
      ) {
        return {
          data: {
            createOneUser: variables?.data,
          },
        };
      }
    }

    const client = new CreateTestClient();
    client.register(User);

    const user = await User.create({ name: "James" });
    expect(user).to.be.instanceOf(User);
  });

  it("should return instance on createMany operation", async () => {
    class User extends Model {
      static get modelKey() {
        return "UserCrud2";
      }
    }
    class CreateManyTestClient extends Client {
      public async mutate(
        query: string | DocumentNode,
        variables?: Record<string, any>
      ) {
        return {
          data: {
            createManyUsers: variables?.data,
          },
        };
      }
    }

    const client = new CreateManyTestClient();
    client.register(User);

    const [user] = await User.createMany([{ name: "James" }]);
    expect(user).to.be.instanceOf(User);
  });

  it("should return instance on upsert operation", async () => {
    class User extends Model {
      static get modelKey() {
        return "UserCrud3";
      }
    }

    class UpsertTestClient extends Client {
      public async mutate(
        query: string | DocumentNode,
        variables?: Record<string, any>
      ) {
        return {
          data: {
            upsertOneUser: variables?.data,
          },
        };
      }
    }

    const client = new UpsertTestClient();
    client.register(User);

    const user = await User.upsert({ id: 1 }, { name: "James" });
    expect(user).to.be.instanceOf(User);
  });

  it("should return instance on update operation", async () => {
    class User extends Model {
      static get modelKey() {
        return "UserCrud4";
      }
    }
    class UpdateTestClient extends Client {
      public async mutate(
        query: string | DocumentNode,
        variables?: Record<string, any>
      ) {
        return {
          data: {
            updateOneUser: variables?.data,
          },
        };
      }
    }

    const client = new UpdateTestClient();
    client.register(User);

    const user = await User.update({ id: 1 }, { name: "James" });
    expect(user).to.be.instanceOf(User);
  });
});
