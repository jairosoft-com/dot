import React from 'react';
import styles from '../../styles/index.module.css';
import Field from '../../types/field';

// Define the props for the FieldForm component
interface FieldFormProps {
  fields?: { [key: string]: Field };
}

// Helper function to extract key-value pairs from fields
const extractValueStrings = (field: Field, parentKey: string = ''): { key: string; value: string }[] => {
  if (field.valueObject) {
    // Check if both Amount and Benefit are present
    if (field.valueObject.Amount && field.valueObject.Benefit) {
      const amountContent = field.valueObject.Amount.content || '';
      const benefitContent = field.valueObject.Benefit.content || '';
      return [{ key: `Copays ${benefitContent}`, value: amountContent }];
    }

    // Process nested objects
    return Object.entries(field.valueObject)
      .flatMap(([key, subField]) => extractValueStrings(subField, `${parentKey} ${key}`));
  } else if (field.valueArray) {
    // Process arrays
    return field.valueArray.flatMap((subField, index) => 
      extractValueStrings(subField, `${parentKey} ${index + 1}`));
  } else if (field.valueString) {
    return [{ key: parentKey.trim(), value: field.valueString }];
  } else if (field.content) {
    return [{ key: parentKey.trim(), value: field.content }];
  }
  return [];
};

// Component to render the extracted fields in a form
function FieldForm({ fields }: FieldFormProps) {
  // Extract the key-value pairs from the fields
  const rows = fields
    ? Object.entries(fields).flatMap(([key, field]) => extractValueStrings(field, key))
    : [];

  return (
    <form className={styles.formContainer}>
      {rows.map((row, index) => (
        <div key={index} className={styles.formGroup}>
          <label className={styles.formLabel}>{row.key}</label>
          <input className={styles.formInput} type="text" value={row.value} readOnly />
        </div>
      ))}
      {/* Include all fields, even those without valueString */}
      {fields && Object.entries(fields).map(([key, field]) => (
        !field.valueString && !field.valueObject && !field.valueArray && !field.content ? (
          <div key={key} className={styles.formGroup}>
            <label className={styles.formLabel}>{key}</label>
            <input className={styles.formInput} type="text" value="N/A" readOnly />
          </div>
        ) : null
      ))}
    </form>
  );
}

export default FieldForm;
