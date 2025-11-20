import { Schema, model, Model } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import config from "../config/auth.config";

interface IRefreshToken extends Document {
  token: string;
  expiryDate: Date;
  user: string;
}

interface IRefreshTokenModel extends Model<IRefreshToken> {
  createToken(user: { id: string }): Promise<string>;
  verifyExpiration(token: { expiryDate: Date }): Promise<boolean>;
}

const RefreshTokenSchema = new Schema({
  token: String,
  expiryDate: Date,
  user: {
    type: Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
  },
});

RefreshTokenSchema.statics.createToken = async function (user: {
  id: string;
}): Promise<string> {
  const expiredAt = new Date();
  expiredAt.setSeconds(expiredAt.getSeconds() + config.jwtRefreshExpiration);
  const _token = uuidv4();

  const refreshToken = await this.create({
    token: _token,
    userId: user.id,
    expiryDate: expiredAt.getTime(),
  });
  return refreshToken.token;
};

RefreshTokenSchema.statics.verifyExpiration = async function (token: {
  expiryDate: Date;
}): Promise<boolean> {
  return token.expiryDate.getTime() < new Date().getTime();
};
const RefreshToken = model<IRefreshToken, IRefreshTokenModel>(
  "RefreshToken",
  RefreshTokenSchema,
);

export default RefreshToken;
