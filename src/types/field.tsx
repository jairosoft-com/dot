export default interface Field {
  type: string;
  valueString?: string;
  valueObject?: { [key: string]: Field };
  valueArray?: Field[];
  content?: string;
}