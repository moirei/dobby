import { User } from "./models";

async function f() {
  const [model1] = await User.findMany();
  const [model2] = await User.all();
  // const model3 = await User.hotFindUnique({}, (query) => null);
  const m4 = await User.find({});
  const m5 = await User.findOrFail({});
  const m6 = await User.selectAll().findMany();

  const u1 = await User.make({});
  const u2 = await User.select("*").findUnique({});
  const u3 = await User.newQuery().findUnique({});
  const u4 = await User.query().findUnique({});
  const u5 = await User.select("*").findUnique({});
  const u6 = await User.selectAll().findUnique({});
  const u7 = await User.include("*").findUnique({});
  const u8 = await User.includeAll().findUnique({});
  const u9 = await User.with("posts").findUnique({});
  const u10 = await User.withAll().findUnique({});
  const u11 = await User.where("args", 3).findUnique({});
  const u12 = await User.select("*").findMany();
  const u13 = await User.all();
  const u14 = await User.findUnique({});
  const u15 = await User.find({});
  const u16 = await User.findOrFail({});
  const u17 = await User.create({});
  const u18 = await User.createMany([]);
  const u19 = await User.upsert({}, {});
  const u20 = await User.update({}, {});
  const u21 = u20.$self(); // <--
  const u22 = await u20.$newQuery().findUnique({}); // <--
  const u23 = await u20.$copy(new User());
  const u24 = await u20.$fill({});
}
