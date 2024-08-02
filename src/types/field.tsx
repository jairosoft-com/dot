export default interface Field {
  fields: any;
  type: string;
  valueString?: string;
  valueObject?: { [key: string]: Field };
  valueArray?: Field[];
  content?: string;
}