import { connectToMongoDb } from "@/database/db.mongo";
import { ActiveTokenSchema, TActiveToken } from "@/models/ActiveTokenModel";
import mongoose, { model, Model, Types } from "mongoose";
import ActiveTokenRepo from "../ActiveTokenRepo";
import { v4 } from "uuid";

let ActiveTokenModel: Model<TActiveToken>
let activeTokenRepo: ActiveTokenRepo

describe("Active Token Repository", () => {
  let dummyId: string;
  const deviceId = v4()

  beforeAll(async () => {
    await connectToMongoDb(process.env.DB_URI);
    ActiveTokenModel =
      mongoose.models.ActiveToken ||
      model<TActiveToken>('ActiveToken', ActiveTokenSchema);
    activeTokenRepo = new ActiveTokenRepo();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await ActiveTokenModel.deleteMany({});
    const newData = await ActiveTokenModel.create({
      deviceId: v4(),
      jti: v4(),
      userId: new Types.ObjectId()
    });
    await ActiveTokenModel.create({
      deviceId,
      jti: v4(),
      userId: new Types.ObjectId()
    });
    await ActiveTokenModel.create({
      deviceId,
      jti: v4(),
      userId: new Types.ObjectId()
    });
    dummyId = newData.id;
  });

  it("should create new record", async () => {
    const result = await activeTokenRepo.create(new Types.ObjectId().toString(), v4(), v4())
    expect(result).toBeTruthy()
  })

  it('should not create a record with missing userId', async () => {
    await expect(ActiveTokenModel.create({ deviceId: v4(), jti: v4() })).rejects.toThrow();
  });

  it("should find one record", async () => {
    const result = await activeTokenRepo.findOne({ _id: dummyId })
    expect(result).toBeTruthy()
  })

  it("should find no record and return null", async () => {
    const result = await activeTokenRepo.findOne({ jti: "never exists" })
    expect(result).toBe(null)
  })

  it("should delete record by id", async () => {
    await activeTokenRepo.deleteMany({ _id: dummyId })
    expect(await activeTokenRepo.findOne({ _id: dummyId })).toBe(null)
  })

  it("should delete records by deviceId", async () => {
    await activeTokenRepo.deleteMany({ deviceId })
    expect(await activeTokenRepo.findOne({ deviceId })).toBe(null)
  })
})