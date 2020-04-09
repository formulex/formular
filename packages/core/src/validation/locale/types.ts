export interface MessageCollection {
  default: string;
  required: string;
  min: string;
  max: string;
  email: string;
  [key: string]: string;
}
