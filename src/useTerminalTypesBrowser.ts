export interface Cred {
  credName: string;
  credTypes: ("password" | "string" | "number")[];
}

export interface CredExpect {
  credName: string;
  credTypes: ("password" | "string" | "number")[];
  credValue: string | number;
}