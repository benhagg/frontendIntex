// types/user.ts
import type { USStateAbbreviation } from "./usStates";

export interface UserInfo {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  username?: string;
  age?: string;
  gender?: string;
  city?: string;
  state?: USStateAbbreviation; // ✅ Correct usage
  zip?: string;
  services?: string[];
}
