import { connectToMongoDb } from "@/database/db.mongo";
import { TVerificationCode, VerificationCodeSchema } from "@/models/VerificationCodeModel";
import mongoose, { model, Model, Types } from "mongoose";
import VerificationCodeRepository from "../VerificationCodeRepo";

let VCModel: Model<TVerificationCode>
let repo: VerificationCodeRepository

describe("Verification Code Repository", () => {
  let dummyId: string;
  let userId = new Types.ObjectId()

  beforeAll(async () => {
    await connectToMongoDb(process.env.DB_URI);
    VCModel =
      mongoose.models.VerificationCode ||
      model<TVerificationCode>('VerificationCode', VerificationCodeSchema);
    repo = new VerificationCodeRepository();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await VCModel.deleteMany({});
    const newData = await VCModel.create({
      code: "12345678",
      userId
    });
    await VCModel.create({
      code: "09876543",
      userId
    });
    dummyId = newData.id;
  });

  it("should create new record", async () => {
    const result = await repo.create(new Types.ObjectId().toString())
    expect(result).toBeTruthy()
  })

  it("should find one record", async () => {
    const result = await repo.findOne({ code: "12345678" })
    expect(result).toBeTruthy()
  })

  it("should not find any record and return null", async () => {
    const result = await repo.findOne({ code: "11111111" })
    expect(result).toBe(null)
  })

  it("should update one record", async () => {
    const result = await repo.updateOne({ code: "12345678" }, { isUsed: true })
    expect(result).toBeTruthy()
    const result2 = await repo.findOne({ code: "12345678" })
    expect(result2?.isUsed).toBe(true)
  })

  it("should failed to update, because no record found", async () => {
    const result = await repo.updateOne({ code: "12121212" }, { isUsed: true })
    expect(result).toBe(null)
  })

  it("should delete records", async () => {
    await repo.deleteMany(userId.toString())
    expect(await repo.findOne({ userId: userId.toString() })).toBe(null)
  })
})