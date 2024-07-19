import styles from "../styles/index.module.css";
import axios from "axios";
import FieldForm from "./FieldForm";
import { 
  useRef, 
  useState, 
  useEffect 
} from "react";

interface Props {
  photoUrl?: string;
}
interface Document {
  docType: string;
  confidence?: number;
  fields: { [key: string]: Field };
}
interface Field {
  valueString?: string;
  valueNumber?: number;
  valueDate?: string;
  confidence?: number;
}

const baseUrl = "https://insurance-card-recognition.cognitiveservices.azure.com";
const apiKey = "a69b990664154b5b9332a50e8514a788";

const removeBase64Prefix = (base64String: string): string => {
  const base64Prefix = 'data:image/jpeg;base64,';
  if (base64String.startsWith(base64Prefix)) {
    return base64String.substring(base64Prefix.length);
  }
  return base64String;
};

function PhotoResult({ photoUrl = "" }: Props) {
  const [analysisResult, setAnalysisResult] = useState<Document[] | null>(null);
  const [base64, setBase64] = useState<string>('');
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const analyzeDocument = async (): Promise<string> => {
    try {
      const response = await axios.post(
        `${baseUrl}/documentintelligence/documentModels/prebuilt-healthInsuranceCard.us:analyze?api-version=2024-02-29-preview`,
        {
          "base64Source": removeBase64Prefix(base64)
        },
        {
          headers: {
            'Ocp-Apim-Subscription-Key': apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      const operationLocation = response.headers['operation-location'];
      if (!operationLocation) {
        throw new Error('Operation location header not found in the response.');
      }
      return operationLocation;
    } catch (error) {
      console.error('Error submitting document for analysis:', error);
      throw error;
    }
  };

  const getAnalysisResult = async (operationLocation: string): Promise<Document[]> => {
    try {
      while (true) {
        const resultResponse = await axios.get(operationLocation, {
          headers: {
            'Ocp-Apim-Subscription-Key': apiKey
          }
        });

        if (resultResponse.data.status === 'succeeded') {
          return resultResponse.data.analyzeResult.documents;
        } else if (resultResponse.data.status === 'failed') {
          console.error('Analysis failed:', resultResponse.data);
          throw new Error('Analysis failed');
        }

        // Wait for a short period before polling again
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error('Error polling for analysis result:', error);
      throw error;
    }
  };

  useEffect(() => {
    const convertImageToBase64 = () => {
      const img = imageRef.current;
      if (img) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (ctx) {
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          ctx.drawImage(img, 0, 0);

          const base64String = canvas.toDataURL('image/jpeg');
          setBase64(base64String);
        }
      }
    };

    const analyzeDocumentData = async () => {
      try {
        if (base64) {
          setLoading(true);
          const operationLocation = await analyzeDocument();
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
        convertImageToBase64();
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
    <img ref={imageRef} alt="Web component result" src={photoUrl} />
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