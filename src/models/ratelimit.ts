import { DTOResponseBase } from "./dtoBase";

export interface RateLimitedResponseDTO extends DTOResponseBase {
  nextValidRequestDate: string;
}
