import styles from "../../styles/index.module.css";
import { useState } from "react";

// Define the type for the field
interface Field {
  valueString?: string;
  valueObject?: { [key: string]: Field };
  valueAddress?: {
    houseNumber?: string;
    road?: string;
    postalCode?: string;
    city?: string;
    state?: string;
  };
  valueDate?: string;
}

// Define the props for the FieldForm component
interface FieldFormProps {
  fields?: { [key: string]: Field };
}

// Helper function to extract key-value pairs from fields
const extractValueStrings = (field: Field, parentKey: string = ""): { key: string; value: string }[] => {
  if (field.valueString) {
    return [{ key: parentKey, value: field.valueString }];
  } else if (field.valueObject) {
    return Object.entries(field.valueObject).flatMap(([key, subField]) =>
      extractValueStrings(subField, `${parentKey} ${key}`)
    );
  } else if (field.valueAddress) {
    const { houseNumber, road, city, state, postalCode } = field.valueAddress;
    const addressString = [houseNumber, road, city, state, postalCode].filter(Boolean).join(", ");
    return [{ key: parentKey, value: addressString }];
  } else if (parentKey === "DateOfBirth" && field.valueDate) {
    return [{ key: parentKey, value: field.valueDate }];
  }
  return [];
};

// Component to render the extracted fields in a form
function PhotoIdFieldForm({ fields }: FieldFormProps) {
  // Define the relevant field names
  const relevantFields = ["FirstName", "LastName", "Address", "Sex", "DateOfBirth"];

  // Extract the key-value pairs from the fields
  const initialRows = fields
    ? Object.entries(fields)
        .flatMap(([key, field]) => extractValueStrings(field, key))
        .filter((row) => relevantFields.includes(row.key))
    : [];

  // State to manage the form fields
  const [formFields, setFormFields] = useState(initialRows);

  // Handle input change
  const handleInputChange = (index: number, value: string) => {
    const updatedFields = [...formFields];
    updatedFields[index].value = value;
    setFormFields(updatedFields);
  };

  return (
    <form className={styles.formContainer}>
      {formFields.map((row, index) => (
        <div key={index} className={styles.formGroup}>
          <label className={styles.formLabel}>{row.key}</label>
          <input
            className={styles.formInput}
            type="text"
            value={row.value}
            onChange={(e) => handleInputChange(index, e.target.value)}
          />
        </div>
      ))}
    </form>
  );
}

export default PhotoIdFieldForm;