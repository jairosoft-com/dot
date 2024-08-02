import axios from "axios";
import diConfig from "./di-configs"
import Document from "../types/document"

export async function analyzeDocument(base64: string, isPhotoId: boolean) {
  const removeBase64Prefix = (base64String: string) => {
    const base64Prefix = 'data:image/jpeg;base64,';
    if (base64String.startsWith(base64Prefix)) {
      return base64String.substring(base64Prefix.length);
    }
    return base64String;
  }
  try {
    let model = isPhotoId ? diConfig.photoIdCardModel : diConfig.insuranceCardModel;
    let apiVersion = isPhotoId ? diConfig.photoIdCardApiVersion : diConfig.insuranceCardApiVersion;
  
    const response = await axios.post(
      `${diConfig.baseUrl}/documentintelligence/documentModels/${model}:analyze?api-version=${apiVersion}`,
      {
        "base64Source": removeBase64Prefix(base64)
      },
      {
        headers: {
          'Ocp-Apim-Subscription-Key': diConfig.apiKey,
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
}

// Function overloads
export function convertImageToBase64(image: Blob): Promise<string | undefined>;
export function convertImageToBase64(image: React.RefObject<HTMLImageElement>): Promise<string | undefined>;

export async function convertImageToBase64(image: Blob | React.RefObject<HTMLImageElement>): Promise<string | undefined> {
  if (image instanceof Blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(image);
    });
  } else if (image.current instanceof HTMLImageElement) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      canvas.width = image.current.naturalWidth;
      canvas.height = image.current.naturalHeight;
      ctx.drawImage(image.current, 0, 0);
      return Promise.resolve(canvas.toDataURL('image/png'));
    }
  }
  return Promise.resolve(undefined);
}


export async function getAnalysisResult(operationLocation: string): Promise<Document[]> {
  try {
    while (true) {
      const resultResponse = await axios.get(operationLocation, {
        headers: {
          'Ocp-Apim-Subscription-Key': diConfig.apiKey
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
}