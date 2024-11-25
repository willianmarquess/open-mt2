import PacketValidator from "../PacketValidator.js";

export default class Packet {
  private readonly header: any;
  private readonly subHeader: any;
  private readonly size: any;
  private readonly name: any;
  private readonly validator: any;

  constructor(header: any, subHeader: any, size: any, name: any, validator: any) {
    this.header = header;
    this.subHeader = subHeader;
    this.size = size;
    this.name = name;
    if (validator) {
      this.validator = this.createValidator(validator);
    }
    console.log(
      "Instantiating packet:",
      "Packet: #header",
      this.header.toString(16),
      " #subHeader",
      this.subHeader,
      " #size",
      this.size,
      " #name",
      this.name,
      " #validator",
      this.validator,
    );
  }

  hasSubHeader() {
    return !!this.subHeader && this.subHeader > 0;
  }

  isValid() {
    return this.validator.isValid();
  }

  errors() {
    return this.validator.getErrors();
  }

  validate() {
    this.validator.build();
  }

  private createValidator(validator: any) {
    const validatorInstance = new validator(this);
    if (!(validatorInstance instanceof PacketValidator)) {
      throw new Error("PacketValidator must be an instance of PacketValidator base class");
    }
    return validatorInstance;
  }
}
