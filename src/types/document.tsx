import Field from "./field"

export default interface Document {
  docType: string;
  confidence?: number;
  fields: { [key: string]: Field };
}