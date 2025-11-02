export interface Field {
    name: string,
    label: string,
    type: string,
}


export default interface FormProps {
    // fields is an array that contains the type of the field above
    fields: Field[];
    //Onsubmit now receives an object (e.g. "email": "hello@gmail.com") where both values are strings
    onSubmit: (values: Record<string,string>) => void;
  }