export const MyEmployeeDocument = `
  query MyEmployee {
    myEmployee {
      id
    }
  }
`;

export interface MyEmployeeQuery {
  myEmployee: {
    id: string;
  } | null;
}
