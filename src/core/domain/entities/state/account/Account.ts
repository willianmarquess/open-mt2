import StateEntity from "../StateEntity.js";

export default class Account extends StateEntity {
  constructor(
    id: number,
    private readonly username: any,
    private readonly password: any,
    private readonly email: any,
    private readonly lastLogin: any,
    private readonly deleteCode: any,
    private readonly accountStatus: any,
    createdAt: any,
    updatedAt: any,
  ) {
    super(id, createdAt, updatedAt);
  }
}
