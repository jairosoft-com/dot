import styles from "../../styles/index.module.css";
import FieldForm from "./FieldForm";
import { 
  useRef, 
  useState, 
  useEffect } from "react";
import { 
  analyzeDocument, 
  convertImageToBase64, 
  getAnalysisResult } from "../../utils/utils";
import Document from "../../types/document";

interface Props {
  photoUrl?: string;
  title?: string; // Add title prop
}

function PhotoResult({ photoUrl = "", title = "" }: Props) { // Destructure title prop
  const [analysisResult, setAnalysisResult] = useState<Document[] | null>(null);
  const [base64, setBase64] = useState<string>('');
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const analyzeDocumentData = async () => {
      try {
        if (base64) {
          setLoading(true);
          // paramater true if photoId
          const operationLocation = await analyzeDocument(base64, false);
          const documents = await getAnalysisResult(operationLocation);
          setAnalysisResult(documents);
        }
      } catch (error) {
        console.error('Error analyzing document:', error);
      } finally {
        setLoading(false);
      }
    };

    // Convert image to Base64 when the image loads and then analyze it
    const imgElement = imageRef.current;
    if (imgElement) {
      imgElement.onload = () => {
        const base64String = convertImageToBase64(imgElement);
        if (base64String) {
          setBase64(base64String);
        } else {
          console.error('Failed to convert image to Base64');
        }
      };
    }

    // Watch for base64 change to trigger document analysis
    if (base64) {
      analyzeDocumentData();
    }

    // Cleanup function to remove the onload handler
    return () => {
      if (imgElement) {
        imgElement.onload = null;
      }
    };
  }, [photoUrl, base64]);

  return (
    <div className={styles.container}>
      <h2>{title}</h2> {/* Display title */}
      <img ref={imageRef} alt={title} src={photoUrl} />
      <div className={styles.resultContainer}>
        <h2>List of Entities Extracted from the Image</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          analysisResult && (
            <div>
              {analysisResult.length > 0 ? (
                <FieldForm fields={analysisResult[0].fields} />
              ) : (
                <p>No result available.</p>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default PhotoResult;