import jwt from "jsonwebtoken";

export interface IJwtBody {
  id: number;
  username: string;
}

export const generateJwt = (data: IJwtBody): string => {
  if (!process.env.JWT_TOKEN) {
    throw Error("No jwt token defined!");
  }
  return jwt.sign(data, process.env.JWT_TOKEN, { expiresIn: "48h" });
};

export const verifyJwt = (jwtToVerify: string): Promise<unknown> =>
  new Promise((resolve, reject) => {
    if (!process.env.JWT_TOKEN) {
      reject(Error("No jwt token defined!"));
      return;
    }
    jwt.verify(jwtToVerify, process.env.JWT_TOKEN, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });
